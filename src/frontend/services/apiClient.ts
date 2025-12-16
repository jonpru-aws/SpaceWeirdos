import {
  Warband,
  Weirdo,
  WarbandAbility,
  ValidationResult,
} from '../../backend/models/types';
import {
  CreateWarbandResponse,
  GetAllWarbandsResponse,
  GetWarbandResponse,
  UpdateWarbandResponse,
  DeleteWarbandResponse,
  AddWeirdoResponse,
  UpdateWeirdoResponse,
  RemoveWeirdoResponse,
  CalculateCostResponse,
  RealTimeCostResponse,
  ValidateResponse,
  ValidateWarbandResponse,
  ValidateWeirdoResponse,
  ApiErrorResponse,
  JsonResponse,
  BatchCostRequest,
  BatchCostResponse,
  ExportWarbandResponse,
  ImportWarbandRequest,
  ImportWarbandResponse,
  ValidateImportRequest,
  ValidateImportResponse,
} from './apiTypes';

import { getFrontendConfigInstance } from '../config/frontendConfig';

/**
 * API Client Configuration
 */
// Get configuration from centralized frontend config
const frontendConfig = getFrontendConfigInstance();
const API_BASE_URL = frontendConfig.api.baseUrl;
const MAX_RETRIES = frontendConfig.api.maxRetries;
const RETRY_DELAY_MS = frontendConfig.api.retryDelayMs;

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request options for API calls
 */
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  // Using unknown for body to accept any JSON-serializable data structure
  // Caller is responsible for ensuring the body matches the API contract
  body?: unknown;
  retries?: number;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced retry strategy interface
 * Requirements: 7.2, 7.5
 */
interface RetryStrategy {
  shouldRetry: boolean;
  maxAttempts: number;
  delayMs: number;
  useExponentialBackoff: boolean;
  reason: string;
}

/**
 * Determine retry strategy based on error type
 * Requirements: 7.2, 7.5
 */
function determineRetryStrategy(error: unknown, attempt: number): RetryStrategy {
  if (error instanceof ApiError) {
    const statusCode = error.statusCode;
    
    // Client errors (4xx) - generally don't retry except specific cases
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      if (statusCode === 408 || statusCode === 429) {
        return {
          shouldRetry: true,
          maxAttempts: MAX_RETRIES,
          delayMs: RETRY_DELAY_MS * (statusCode === 429 ? 2 : 1), // Longer delay for rate limits
          useExponentialBackoff: true,
          reason: statusCode === 408 ? 'Request timeout - retrying' : 'Rate limited - retrying with backoff'
        };
      }
      return {
        shouldRetry: false,
        maxAttempts: 0,
        delayMs: 0,
        useExponentialBackoff: false,
        reason: 'Client error - no retry'
      };
    }
    
    // Server errors (5xx) - retry with exponential backoff
    if (statusCode && statusCode >= 500) {
      return {
        shouldRetry: true,
        maxAttempts: MAX_RETRIES,
        delayMs: RETRY_DELAY_MS * 1.5, // Slightly longer for server errors
        useExponentialBackoff: true,
        reason: 'Server error - retrying with backoff'
      };
    }
  }
  
  // Network errors, timeouts, etc. - retry with standard backoff
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      shouldRetry: true,
      maxAttempts: MAX_RETRIES,
      delayMs: RETRY_DELAY_MS,
      useExponentialBackoff: true,
      reason: 'Network error - retrying'
    };
  }
  
  // Timeout errors - retry with longer delays
  if (error instanceof Error && (
    error.message.includes('timeout') || 
    error.message.includes('timed out') ||
    error.name === 'TimeoutError'
  )) {
    return {
      shouldRetry: true,
      maxAttempts: Math.max(2, Math.floor(MAX_RETRIES / 2)), // Fewer attempts for timeouts
      delayMs: RETRY_DELAY_MS * 2, // Longer delays for timeouts
      useExponentialBackoff: true,
      reason: 'Timeout error - retrying with longer delays'
    };
  }
  
  // Unknown errors - limited retry
  return {
    shouldRetry: true,
    maxAttempts: 1,
    delayMs: RETRY_DELAY_MS,
    useExponentialBackoff: false,
    reason: 'Unknown error - single retry attempt'
  };
}

/**
 * Generic fetch wrapper with enhanced error handling and retry logic
 * Requirements: 7.2, 7.5
 */
async function fetchWithRetry<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method, body, retries = MAX_RETRIES } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle 204 No Content (successful DELETE)
      if (response.status === 204) {
        // Type assertion needed: DELETE operations return void, but TypeScript needs explicit cast
        // This is safe because the caller expects void/undefined for DELETE operations
        return undefined as T;
      }

      // Parse response body as JsonResponse for type safety
      const data = await response.json() as JsonResponse;

      // Handle error responses
      if (!response.ok) {
        // Cast to ApiErrorResponse for error handling
        const errorData = data as unknown as ApiErrorResponse;
        throw new ApiError(
          errorData.error || 'Request failed',
          response.status,
          errorData.details
        );
      }

      // Type assertion needed: Cast parsed JSON to expected type T
      // This is safe because the API contract guarantees the response structure matches T
      return data as T;
    } catch (error: unknown) {
      // Determine retry strategy based on error type
      const retryStrategy = determineRetryStrategy(error, attempt);
      
      if (!retryStrategy.shouldRetry || attempt >= retryStrategy.maxAttempts) {
        // Add context to error for better user feedback
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(
          'Network request failed after retries',
          undefined,
          error instanceof Error ? error.message : String(error)
        );
      }

      // Calculate delay with optional exponential backoff
      let delay = retryStrategy.delayMs;
      if (retryStrategy.useExponentialBackoff) {
        delay = retryStrategy.delayMs * Math.pow(2, attempt);
      }
      
      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new ApiError('Unexpected error in fetchWithRetry');
}

/**
 * API Client for Warband Builder
 */
export const apiClient = {
  /**
   * Create a new warband
   */
  async createWarband(data: {
    name: string;
    pointLimit: 75 | 125;
    ability: WarbandAbility | null;
    weirdos?: Weirdo[];
  }): Promise<Warband> {
    return fetchWithRetry<CreateWarbandResponse>('/warbands', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Get all warbands
   */
  async getAllWarbands(): Promise<Warband[]> {
    return fetchWithRetry<GetAllWarbandsResponse>('/warbands', {
      method: 'GET',
    });
  },

  /**
   * Get a specific warband by ID
   */
  async getWarband(id: string): Promise<Warband> {
    return fetchWithRetry<GetWarbandResponse>(`/warbands/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update an existing warband
   */
  async updateWarband(id: string, updates: Partial<Warband>): Promise<Warband> {
    return fetchWithRetry<UpdateWarbandResponse>(`/warbands/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Delete a warband
   */
  async deleteWarband(id: string): Promise<void> {
    return fetchWithRetry<DeleteWarbandResponse>(`/warbands/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Add a weirdo to a warband
   */
  async addWeirdo(warbandId: string, weirdo: Weirdo): Promise<Warband> {
    return fetchWithRetry<AddWeirdoResponse>(`/warbands/${warbandId}/weirdos`, {
      method: 'POST',
      body: weirdo,
    });
  },

  /**
   * Update a weirdo in a warband
   */
  async updateWeirdo(
    warbandId: string,
    weirdoId: string,
    weirdo: Weirdo
  ): Promise<Warband> {
    return fetchWithRetry<UpdateWeirdoResponse>(
      `/warbands/${warbandId}/weirdos/${weirdoId}`,
      {
        method: 'PUT',
        body: weirdo,
      }
    );
  },

  /**
   * Remove a weirdo from a warband
   */
  async removeWeirdo(warbandId: string, weirdoId: string): Promise<Warband> {
    return fetchWithRetry<RemoveWeirdoResponse>(
      `/warbands/${warbandId}/weirdos/${weirdoId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Calculate cost for a weirdo or warband
   * @deprecated Use calculateCostRealTime instead
   */
  async calculateCost(params: {
    weirdo?: Weirdo;
    warband?: Warband;
    warbandAbility?: WarbandAbility;
  }): Promise<{ cost: number }> {
    return fetchWithRetry<CalculateCostResponse>('/calculate-cost', {
      method: 'POST',
      body: params,
    });
  },

  /**
   * Calculate cost with real-time optimized endpoint
   * Returns detailed breakdown, warnings, and limit indicators
   * Optimized for < 100ms response time
   */
  async calculateCostRealTime(params: {
    weirdoType: 'leader' | 'trooper';
    attributes: {
      speed: number;
      defense: string;
      firepower: string;
      prowess: string;
      willpower: string;
    };
    weapons?: {
      close?: string[];
      ranged?: string[];
    };
    equipment?: string[];
    psychicPowers?: string[];
    warbandAbility?: WarbandAbility | null;
  }): Promise<RealTimeCostResponse> {
    return fetchWithRetry<RealTimeCostResponse>('/cost/calculate', {
      method: 'POST',
      body: params,
    });
  },

  /**
   * Calculate costs for multiple items in a single batch request
   * Optimized for displaying costs in selector components
   * Returns a map of item IDs to their calculated costs
   */
  async calculateBatchCosts(request: BatchCostRequest): Promise<Record<string, number>> {
    const response = await fetchWithRetry<BatchCostResponse>('/cost/batch', {
      method: 'POST',
      body: request,
    });
    return response.data.costs;
  },

  /**
   * Validate a weirdo or warband
   * @deprecated Use validateWarband or validateWeirdo instead
   */
  async validate(params: {
    weirdo?: Weirdo;
    warband?: Warband;
  }): Promise<ValidationResult> {
    return fetchWithRetry<ValidateResponse>('/validate', {
      method: 'POST',
      body: params,
    });
  },

  /**
   * Validate a complete warband with all weirdos
   * Uses optimized /api/validation/warband endpoint
   */
  async validateWarband(warband: Warband): Promise<ValidationResult> {
    const response = await fetchWithRetry<ValidateWarbandResponse>('/validation/warband', {
      method: 'POST',
      body: warband,
    });
    return {
      valid: response.data.valid,
      errors: response.data.errors,
      warnings: [],
    };
  },

  /**
   * Validate an individual weirdo with optional warband context
   * Uses optimized /api/validation/weirdo endpoint
   */
  async validateWeirdo(weirdo: Weirdo, warband?: Warband): Promise<ValidationResult> {
    const response = await fetchWithRetry<ValidateWeirdoResponse>('/validation/weirdo', {
      method: 'POST',
      body: { weirdo, warband },
    });
    return {
      valid: response.data.valid,
      errors: response.data.errors,
      warnings: [],
    };
  },

  /**
   * Get all warband abilities with descriptions
   */
  async getWarbandAbilities(): Promise<Array<{
    id: string;
    name: WarbandAbility;
    description: string;
    rule: string;
  }>> {
    return fetchWithRetry('/game-data/warband-abilities', {
      method: 'GET',
    });
  },

  /**
   * Export a warband as JSON data
   * Requirements: 6.1, 7.2, 7.5
   */
  async exportWarband(id: string): Promise<unknown> {
    // The backend sends the warband data directly, not wrapped in a response structure
    const response = await fetchWithRetry<unknown>(`/warbands/${id}/export`, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Import a warband from JSON data
   * Requirements: 6.1, 7.2, 7.5
   */
  async importWarband(request: ImportWarbandRequest): Promise<Warband> {
    const response = await fetchWithRetry<ImportWarbandResponse>('/warbands/import', {
      method: 'POST',
      body: request,
    });
    return response.warband;
  },

  /**
   * Validate warband data for import
   * Requirements: 6.1, 7.2, 7.5
   */
  async validateImport(request: ValidateImportRequest): Promise<{
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
      expected?: string;
      received?: unknown;
    }>;
    warnings: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    nameConflict?: {
      existingName: string;
      conflictsWith: string;
    };
  }> {
    const response = await fetchWithRetry<{
      valid: boolean;
      errors: Array<{
        field: string;
        message: string;
        code: string;
        expected?: string;
        received?: unknown;
      }>;
      warnings: Array<{
        field: string;
        message: string;
        code: string;
      }>;
      categories?: Record<string, Array<{ field: string; message: string; code: string }>>;
    }>('/warbands/validate-import', {
      method: 'POST',
      body: request,
    });
    return response;
  },
};

