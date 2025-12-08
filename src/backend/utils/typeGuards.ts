/**
 * Type guard utilities for safe error handling
 */

/**
 * Type guard to check if an unknown value is an Error object
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if an unknown value is a Node.js error with code property
 */
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

/**
 * Type guard to check if an unknown value has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    // Type assertion is safe: we've already checked that 'message' exists in the object
    typeof (error as { message: unknown }).message === 'string'
  );
}
