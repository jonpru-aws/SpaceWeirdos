/**
 * API Response Type Definitions
 * 
 * Explicit interfaces for all API responses to ensure type safety
 * and avoid using 'any' type in API client code.
 */

import {
  Warband,
  ValidationResult,
  WarbandAbility,
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
 * Request for POST /api/cost/batch (batch cost calculation)
 */
export interface BatchCostRequest {
  items: Array<{
    id: string;
    type: 'weapon' | 'equipment' | 'psychicPower';
    name: string;
    weaponType?: 'close' | 'ranged';
  }>;
  warbandAbility: WarbandAbility | null;
}

/**
 * Response from POST /api/cost/batch (batch cost calculation)
 */
export interface BatchCostResponse {
  success: boolean;
  data: {
    costs: Record<string, number>; // id -> cost mapping
  };
}

/**
 * Response from GET /api/warbands/:id/export (export warband)
 */
export interface ExportWarbandResponse {
  success: boolean;
  data: {
    warband: unknown; // The exported warband data
    filename: string;
  };
}

/**
 * Request for POST /api/warbands/import (import warband)
 */
export interface ImportWarbandRequest {
  warbandData: unknown; // The warband data to import
  options?: {
    replaceExisting?: boolean;
    newName?: string;
  };
}

/**
 * Response from POST /api/warbands/import (import warband)
 * Note: The backend returns the warband directly, not wrapped in a data property
 */
export interface ImportWarbandResponse {
  success: boolean;
  message: string;
  warband: Warband;
}

/**
 * Request for POST /api/warbands/validate-import (validate import data)
 */
export interface ValidateImportRequest {
  warbandData: unknown; // The warband data to validate
}

/**
 * Response from POST /api/warbands/validate-import (validate import data)
 * Note: The backend returns the validation result directly, not wrapped in a data property
 */
export interface ValidateImportResponse {
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
  nameConflict?: {
    existingName: string;
    conflictsWith: string;
  };
}

/**
 * Generic JSON response type for parsing
 * Used internally before casting to specific response types
 */
export interface JsonResponse {
  [key: string]: unknown;
}
