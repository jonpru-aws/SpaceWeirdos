/**
 * API Response Type Definitions
 * 
 * Explicit interfaces for all API responses to ensure type safety
 * and avoid using 'any' type in API client code.
 */

import {
  Warband,
  ValidationResult,
} from '../../backend/models/types';

/**
 * Response from POST /api/warbands (create warband)
 */
export interface CreateWarbandResponse extends Warband {}

/**
 * Response from GET /api/warbands (get all warbands)
 */
export type GetAllWarbandsResponse = Warband[];

/**
 * Response from GET /api/warbands/:id (get single warband)
 */
export interface GetWarbandResponse extends Warband {}

/**
 * Response from PUT /api/warbands/:id (update warband)
 */
export interface UpdateWarbandResponse extends Warband {}

/**
 * Response from DELETE /api/warbands/:id (delete warband)
 * Returns void/undefined
 */
export type DeleteWarbandResponse = void;

/**
 * Response from POST /api/warbands/:id/weirdos (add weirdo)
 */
export interface AddWeirdoResponse extends Warband {}

/**
 * Response from PUT /api/warbands/:id/weirdos/:weirdoId (update weirdo)
 */
export interface UpdateWeirdoResponse extends Warband {}

/**
 * Response from DELETE /api/warbands/:id/weirdos/:weirdoId (remove weirdo)
 */
export interface RemoveWeirdoResponse extends Warband {}

/**
 * Response from POST /api/calculate-cost
 * @deprecated Use RealTimeCostResponse instead
 */
export interface CalculateCostResponse {
  cost: number;
}

/**
 * Response from POST /api/cost/calculate (optimized real-time endpoint)
 */
export interface RealTimeCostResponse {
  success: boolean;
  data: {
    totalCost: number;
    breakdown: {
      attributes: number;
      weapons: number;
      equipment: number;
      psychicPowers: number;
    };
    warnings: string[];
    isApproachingLimit: boolean;
    isOverLimit: boolean;
    calculationTime: number;
  };
}

/**
 * Response from POST /api/validate
 */
export interface ValidateResponse extends ValidationResult {}

/**
 * Response from POST /api/validation/warband
 */
export interface ValidateWarbandResponse {
  success: boolean;
  data: {
    valid: boolean;
    errors: ValidationResult['errors'];
  };
}

/**
 * Response from POST /api/validation/weirdo
 */
export interface ValidateWeirdoResponse {
  success: boolean;
  data: {
    valid: boolean;
    errors: ValidationResult['errors'];
  };
}

/**
 * Error response structure from API
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Generic JSON response type for parsing
 * Used internally before casting to specific response types
 */
export interface JsonResponse {
  [key: string]: unknown;
}
