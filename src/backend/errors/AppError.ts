/**
 * Custom Error Classes
 * Provides structured error handling with error codes and context
 * Requirements: 10.1, 10.2, 10.3
 */

/**
 * Base application error class
 * All custom errors extend from this class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts error to JSON format for API responses
   */
  toJSON(): Record<string, any> {
    return {
      error: this.message,
      code: this.code,
      ...(this.context && { context: this.context })
    };
  }
}

/**
 * Validation error class
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, 400, context);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error class
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(
      `${resource} not found: ${id}`,
      'NOT_FOUND',
      404,
      { resource, id }
    );
    this.name = 'NotFoundError';
  }
}
