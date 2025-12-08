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
} from './apiTypes';

/**
 * API Client Configuration
 */
// Type assertion needed: Vite's import.meta.env is not fully typed in the TypeScript environment
// This is safe because we provide a fallback value if the environment variable is undefined
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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
 * Generic fetch wrapper with error handling and retry logic
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
      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (error instanceof ApiError) {
        const shouldRetry = 
          error.statusCode === 408 || 
          error.statusCode === 429 || 
          (error.statusCode && error.statusCode >= 500);
        
        if (!shouldRetry || attempt === retries) {
          throw error;
        }
      }

      // Network errors or server errors - retry
      if (attempt === retries) {
        throw new ApiError(
          'Network request failed after retries',
          undefined,
          error instanceof Error ? error.message : String(error)
        );
      }

      // Wait before retrying (exponential backoff)
      await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
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
};

