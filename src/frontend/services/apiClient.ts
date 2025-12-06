import {
  Warband,
  Weirdo,
  WarbandAbility,
  ValidationResult,
} from '../../backend/models/types';

/**
 * API Client Configuration
 */
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
  body?: any;
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
        return undefined as T;
      }

      // Parse response body
      const data: any = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.error || 'Request failed',
          response.status,
          data.details
        );
      }

      return data as T;
    } catch (error) {
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
  }): Promise<Warband> {
    return fetchWithRetry<Warband>('/warbands', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Get all warbands
   */
  async getAllWarbands(): Promise<Warband[]> {
    return fetchWithRetry<Warband[]>('/warbands', {
      method: 'GET',
    });
  },

  /**
   * Get a specific warband by ID
   */
  async getWarband(id: string): Promise<Warband> {
    return fetchWithRetry<Warband>(`/warbands/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update an existing warband
   */
  async updateWarband(id: string, updates: Partial<Warband>): Promise<Warband> {
    return fetchWithRetry<Warband>(`/warbands/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Delete a warband
   */
  async deleteWarband(id: string): Promise<void> {
    return fetchWithRetry<void>(`/warbands/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Add a weirdo to a warband
   */
  async addWeirdo(warbandId: string, weirdo: Weirdo): Promise<Warband> {
    return fetchWithRetry<Warband>(`/warbands/${warbandId}/weirdos`, {
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
    return fetchWithRetry<Warband>(
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
    return fetchWithRetry<Warband>(
      `/warbands/${warbandId}/weirdos/${weirdoId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Calculate cost for a weirdo or warband
   */
  async calculateCost(params: {
    weirdo?: Weirdo;
    warband?: Warband;
    warbandAbility?: WarbandAbility;
  }): Promise<{ cost: number }> {
    return fetchWithRetry<{ cost: number }>('/calculate-cost', {
      method: 'POST',
      body: params,
    });
  },

  /**
   * Validate a weirdo or warband
   */
  async validate(params: {
    weirdo?: Weirdo;
    warband?: Warband;
  }): Promise<ValidationResult> {
    return fetchWithRetry<ValidationResult>('/validate', {
      method: 'POST',
      body: params,
    });
  },
};

