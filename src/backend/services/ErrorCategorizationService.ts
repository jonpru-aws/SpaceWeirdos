/**
 * Error Categorization Service
 * 
 * Provides comprehensive error categorization and user-friendly error messages
 * with actionable suggestions for import/export operations.
 * 
 * Requirements: 7.3, 7.4, 8.2
 */

import { ValidationErrorCode } from '../models/types.js';
import { ConfigurationManager } from '../config/ConfigurationManager.js';

/**
 * Error categories for comprehensive classification
 */
export enum ErrorCategory {
  STRUCTURE = 'structure',
  GAME_DATA = 'game_data', 
  BUSINESS_RULES = 'business_rules',
  NETWORK = 'network',
  FILE_OPERATION = 'file_operation',
  VALIDATION = 'validation',
  SECURITY = 'security',
  SYSTEM = 'system'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Categorized error interface
 */
export interface CategorizedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  field?: string;
  code: string;
  message: string;
  userFriendlyMessage: string;
  technicalDetails?: string;
  suggestions: string[];
  retryable: boolean;
  documentationLink?: string;
}

/**
 * Error grouping result
 */
export interface ErrorGrouping {
  byCategory: Record<ErrorCategory, CategorizedError[]>;
  bySeverity: Record<ErrorSeverity, CategorizedError[]>;
  byField: Record<string, CategorizedError[]>;
  retryableErrors: CategorizedError[];
  criticalErrors: CategorizedError[];
}

/**
 * Error Categorization Service
 * 
 * Handles comprehensive error categorization, user-friendly message generation,
 * and actionable suggestions for all types of errors in the import/export system.
 */
export class ErrorCategorizationService {
  private configManager: ConfigurationManager;

  constructor() {
    this.configManager = ConfigurationManager.getInstance();
  }

  /**
   * Categorizes a validation error with user-friendly messaging
   * Requirements: 7.3, 7.4
   */
  categorizeValidationError(
    field: string,
    code: ValidationErrorCode,
    message: string,
    context?: Record<string, unknown>
  ): CategorizedError {
    const category = this.determineValidationErrorCategory(code);
    const severity = this.determineErrorSeverity(code);
    const userFriendlyMessage = this.generateUserFriendlyMessage(code, context);
    const suggestions = this.generateSuggestions(code, field, context);

    return {
      category,
      severity,
      field,
      code,
      message,
      userFriendlyMessage,
      suggestions,
      retryable: false, // Validation errors typically require user action
      documentationLink: this.getDocumentationLink(code)
    };
  }

  /**
   * Categorizes a file operation error
   * Requirements: 7.3, 7.4
   */
  categorizeFileError(
    code: string,
    message: string,
    fileName?: string,
    fileSize?: number
  ): CategorizedError {
    const category = ErrorCategory.FILE_OPERATION;
    const severity = this.determineFileSeverity(code);
    const context = { fileName, fileSize };
    const userFriendlyMessage = this.generateFileErrorMessage(code, context);
    const suggestions = this.generateFileErrorSuggestions(code, context);

    return {
      category,
      severity,
      code,
      message,
      userFriendlyMessage,
      suggestions,
      retryable: this.isFileErrorRetryable(code),
      documentationLink: this.getFileErrorDocumentationLink(code)
    };
  }

  /**
   * Categorizes a network error
   * Requirements: 7.3, 7.4
   */
  categorizeNetworkError(
    code: string,
    message: string,
    statusCode?: number,
    endpoint?: string
  ): CategorizedError {
    const category = ErrorCategory.NETWORK;
    const severity = this.determineNetworkSeverity(code, statusCode);
    const context = { statusCode, endpoint };
    const userFriendlyMessage = this.generateNetworkErrorMessage(code, context);
    const suggestions = this.generateNetworkErrorSuggestions(code, context);

    return {
      category,
      severity,
      code,
      message,
      userFriendlyMessage,
      suggestions,
      retryable: this.isNetworkErrorRetryable(code, statusCode),
      documentationLink: this.getNetworkErrorDocumentationLink(code)
    };
  }

  /**
   * Groups errors by category, severity, and field
   * Requirements: 7.3
   */
  groupErrors(errors: CategorizedError[]): ErrorGrouping {
    const byCategory: Record<ErrorCategory, CategorizedError[]> = {
      [ErrorCategory.STRUCTURE]: [],
      [ErrorCategory.GAME_DATA]: [],
      [ErrorCategory.BUSINESS_RULES]: [],
      [ErrorCategory.NETWORK]: [],
      [ErrorCategory.FILE_OPERATION]: [],
      [ErrorCategory.VALIDATION]: [],
      [ErrorCategory.SECURITY]: [],
      [ErrorCategory.SYSTEM]: []
    };

    const bySeverity: Record<ErrorSeverity, CategorizedError[]> = {
      [ErrorSeverity.CRITICAL]: [],
      [ErrorSeverity.ERROR]: [],
      [ErrorSeverity.WARNING]: [],
      [ErrorSeverity.INFO]: []
    };

    const byField: Record<string, CategorizedError[]> = {};
    const retryableErrors: CategorizedError[] = [];
    const criticalErrors: CategorizedError[] = [];

    errors.forEach(error => {
      // Group by category
      byCategory[error.category].push(error);

      // Group by severity
      bySeverity[error.severity].push(error);

      // Group by field
      if (error.field) {
        if (!byField[error.field]) {
          byField[error.field] = [];
        }
        byField[error.field].push(error);
      }

      // Collect retryable errors
      if (error.retryable) {
        retryableErrors.push(error);
      }

      // Collect critical errors
      if (error.severity === ErrorSeverity.CRITICAL) {
        criticalErrors.push(error);
      }
    });

    return {
      byCategory,
      bySeverity,
      byField,
      retryableErrors,
      criticalErrors
    };
  }

  /**
   * Generates a summary of errors for user display
   */
  generateErrorSummary(errors: CategorizedError[]): string {
    if (errors.length === 0) {
      return 'No errors found.';
    }

    const grouping = this.groupErrors(errors);
    const criticalCount = grouping.criticalErrors.length;
    const errorCount = grouping.bySeverity[ErrorSeverity.ERROR].length;
    const warningCount = grouping.bySeverity[ErrorSeverity.WARNING].length;

    let summary = '';

    if (criticalCount > 0) {
      summary += `${criticalCount} critical error${criticalCount === 1 ? '' : 's'}`;
    }

    if (errorCount > 0) {
      if (summary) summary += ', ';
      summary += `${errorCount} error${errorCount === 1 ? '' : 's'}`;
    }

    if (warningCount > 0) {
      if (summary) summary += ', ';
      summary += `${warningCount} warning${warningCount === 1 ? '' : 's'}`;
    }

    return summary + ' found.';
  }

  /**
   * Determines the category for a validation error
   */
  private determineValidationErrorCategory(code: ValidationErrorCode): ErrorCategory {
    switch (code) {
      case 'WARBAND_NAME_REQUIRED':
      case 'WEIRDO_NAME_REQUIRED':
      case 'ATTRIBUTES_INCOMPLETE':
        return ErrorCategory.STRUCTURE;
      
      case 'CLOSE_COMBAT_WEAPON_REQUIRED':
      case 'RANGED_WEAPON_REQUIRED':
      case 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON':
        return ErrorCategory.GAME_DATA;
      
      case 'EQUIPMENT_LIMIT_EXCEEDED':
      case 'TROOPER_POINT_LIMIT_EXCEEDED':
      case 'MULTIPLE_25_POINT_WEIRDOS':
      case 'WARBAND_POINT_LIMIT_EXCEEDED':
      case 'INVALID_POINT_LIMIT':
        return ErrorCategory.BUSINESS_RULES;
      
      case 'LEADER_TRAIT_INVALID':
        return ErrorCategory.VALIDATION;
      
      default:
        return ErrorCategory.VALIDATION;
    }
  }

  /**
   * Determines error severity
   */
  private determineErrorSeverity(code: ValidationErrorCode): ErrorSeverity {
    switch (code) {
      case 'WARBAND_NAME_REQUIRED':
      case 'WEIRDO_NAME_REQUIRED':
      case 'ATTRIBUTES_INCOMPLETE':
      case 'CLOSE_COMBAT_WEAPON_REQUIRED':
        return ErrorSeverity.CRITICAL;
      
      case 'EQUIPMENT_LIMIT_EXCEEDED':
      case 'TROOPER_POINT_LIMIT_EXCEEDED':
      case 'WARBAND_POINT_LIMIT_EXCEEDED':
      case 'MULTIPLE_25_POINT_WEIRDOS':
        return ErrorSeverity.ERROR;
      
      case 'RANGED_WEAPON_REQUIRED':
      case 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON':
      case 'LEADER_TRAIT_INVALID':
        return ErrorSeverity.WARNING;
      
      default:
        return ErrorSeverity.ERROR;
    }
  }

  /**
   * Generates user-friendly error messages
   */
  private generateUserFriendlyMessage(code: ValidationErrorCode, _context?: Record<string, unknown>): string {
    switch (code) {
      case 'WARBAND_NAME_REQUIRED':
        return 'Your warband needs a name to be saved.';
      
      case 'WEIRDO_NAME_REQUIRED':
        return 'Each weirdo in your warband needs a name.';
      
      case 'ATTRIBUTES_INCOMPLETE':
        return 'All weirdos need complete attributes (Speed, Defense, Firepower, Prowess, Willpower).';
      
      case 'CLOSE_COMBAT_WEAPON_REQUIRED':
        return 'Every weirdo must have at least one close combat weapon.';
      
      case 'RANGED_WEAPON_REQUIRED':
        return 'Weirdos with high Firepower (2d8 or 2d10) must have a ranged weapon.';
      
      case 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON':
        return 'Weirdos with ranged weapons need Firepower of 2d8 or 2d10.';
      
      case 'EQUIPMENT_LIMIT_EXCEEDED':
        const type = _context?.type || 'weirdo';
        const limit = _context?.limit || 'allowed';
        return `This ${type} has too much equipment. Maximum ${limit} items allowed.`;
      
      case 'TROOPER_POINT_LIMIT_EXCEEDED':
        const cost = _context?.cost || 'current';
        const pointLimit = _context?.limit || 'maximum';
        return `This trooper costs ${cost} points, but the limit is ${pointLimit} points.`;
      
      case 'WARBAND_POINT_LIMIT_EXCEEDED':
        const totalCost = _context?.totalCost || 'current';
        const warbandLimit = _context?.pointLimit || 'maximum';
        return `Your warband costs ${totalCost} points, but the limit is ${warbandLimit} points.`;
      
      case 'MULTIPLE_25_POINT_WEIRDOS':
        return 'Only one trooper can cost between 21-25 points (premium slot).';
      
      case 'LEADER_TRAIT_INVALID':
        return 'Only leaders can have leader traits.';
      
      case 'INVALID_POINT_LIMIT':
        return 'Warband point limit must be either 75 or 125 points.';
      
      default:
        return 'There was a validation error with your warband.';
    }
  }

  /**
   * Generates actionable suggestions for validation errors
   */
  private generateSuggestions(code: ValidationErrorCode, _field: string, context?: Record<string, unknown>): string[] {
    switch (code) {
      case 'WARBAND_NAME_REQUIRED':
        return ['Enter a name for your warband in the name field'];
      
      case 'WEIRDO_NAME_REQUIRED':
        return ['Click on the weirdo and enter a name'];
      
      case 'ATTRIBUTES_INCOMPLETE':
        return [
          'Click on the weirdo to edit attributes',
          'Set all five attributes: Speed, Defense, Firepower, Prowess, Willpower'
        ];
      
      case 'CLOSE_COMBAT_WEAPON_REQUIRED':
        return [
          'Add a close combat weapon from the weapons list',
          'Every weirdo needs at least one melee weapon'
        ];
      
      case 'RANGED_WEAPON_REQUIRED':
        return [
          'Add a ranged weapon to match the high Firepower',
          'Or reduce Firepower to None or 1d8 if no ranged weapon is desired'
        ];
      
      case 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON':
        return [
          'Increase Firepower to 2d8 or 2d10 to use ranged weapons',
          'Or remove the ranged weapon if not needed'
        ];
      
      case 'EQUIPMENT_LIMIT_EXCEEDED':
        const limit = context?.limit || 'the allowed';
        return [
          `Remove equipment to stay within ${limit} item limit`,
          'Consider upgrading to a leader for higher equipment limits'
        ];
      
      case 'TROOPER_POINT_LIMIT_EXCEEDED':
        return [
          'Reduce attributes, weapons, or equipment to lower cost',
          'Consider if this should be your premium trooper (21-25 points)',
          'Check if another trooper is already using the premium slot'
        ];
      
      case 'WARBAND_POINT_LIMIT_EXCEEDED':
        return [
          'Remove weirdos or reduce their equipment/attributes',
          'Consider switching to 125-point limit for larger warbands'
        ];
      
      case 'MULTIPLE_25_POINT_WEIRDOS':
        return [
          'Reduce one trooper below 21 points',
          'Only one trooper can be in the 21-25 point premium range'
        ];
      
      case 'LEADER_TRAIT_INVALID':
        return [
          'Remove the leader trait from this trooper',
          'Or change the weirdo type to leader'
        ];
      
      default:
        return ['Review the highlighted field and make necessary corrections'];
    }
  }

  /**
   * File error message generation
   */
  private generateFileErrorMessage(code: string, _context: Record<string, unknown>): string {
    switch (code) {
      case 'FILE_TOO_LARGE':
        const maxSize = this.configManager.getFileOperationConfig().maxFileSizeBytes;
        return `File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
      
      case 'INVALID_FILE_TYPE':
        return 'File type not supported. Please select a JSON file.';
      
      case 'FILE_READ_ERROR':
        return 'Could not read the selected file. It may be corrupted or inaccessible.';
      
      case 'INVALID_JSON':
        return 'File contains invalid JSON data and cannot be imported.';
      
      default:
        return 'There was a problem with the file operation.';
    }
  }

  /**
   * File error suggestions
   */
  private generateFileErrorSuggestions(code: string, _context: Record<string, unknown>): string[] {
    switch (code) {
      case 'FILE_TOO_LARGE':
        return [
          'Try a smaller file',
          'Export individual warbands instead of multiple warbands',
          'Contact support if you need to import large files'
        ];
      
      case 'INVALID_FILE_TYPE':
        return [
          'Select a .json file exported from Space Weirdos',
          'Make sure the file extension is .json'
        ];
      
      case 'FILE_READ_ERROR':
        return [
          'Try selecting the file again',
          'Check that the file is not open in another program',
          'Verify the file is not corrupted'
        ];
      
      case 'INVALID_JSON':
        return [
          'Make sure the file was exported from Space Weirdos',
          'Do not edit exported files manually',
          'Try exporting the warband again'
        ];
      
      default:
        return ['Try the operation again', 'Contact support if the problem persists'];
    }
  }

  /**
   * Network error message generation
   */
  private generateNetworkErrorMessage(code: string, context: Record<string, unknown>): string {
    const statusCode = context.statusCode as number;
    
    switch (code) {
      case 'NETWORK_TIMEOUT':
        return 'The request took too long to complete. Please try again.';
      
      case 'CONNECTION_ERROR':
        return 'Could not connect to the server. Check your internet connection.';
      
      case 'SERVER_ERROR':
        if (statusCode >= 500) {
          return 'The server encountered an error. Please try again later.';
        } else if (statusCode === 404) {
          return 'The requested resource was not found.';
        } else if (statusCode === 403) {
          return 'You do not have permission to perform this action.';
        }
        return 'The server returned an error. Please try again.';
      
      default:
        return 'A network error occurred. Please check your connection and try again.';
    }
  }

  /**
   * Network error suggestions
   */
  private generateNetworkErrorSuggestions(code: string, _context: Record<string, unknown>): string[] {
    switch (code) {
      case 'NETWORK_TIMEOUT':
        return [
          'Check your internet connection',
          'Try again with a smaller file',
          'Wait a moment and retry'
        ];
      
      case 'CONNECTION_ERROR':
        return [
          'Check your internet connection',
          'Make sure the server is running',
          'Try refreshing the page'
        ];
      
      case 'SERVER_ERROR':
        return [
          'Wait a moment and try again',
          'Check if the server is experiencing issues',
          'Contact support if the problem persists'
        ];
      
      default:
        return ['Check your internet connection', 'Try again in a moment'];
    }
  }

  /**
   * Determines if file errors are retryable
   */
  private isFileErrorRetryable(code: string): boolean {
    const retryableCodes = ['FILE_READ_ERROR', 'NETWORK_TIMEOUT'];
    return retryableCodes.includes(code);
  }

  /**
   * Determines if network errors are retryable
   */
  private isNetworkErrorRetryable(code: string, statusCode?: number): boolean {
    if (code === 'NETWORK_TIMEOUT' || code === 'CONNECTION_ERROR') {
      return true;
    }
    
    if (code === 'SERVER_ERROR' && statusCode && statusCode >= 500) {
      return true;
    }
    
    return false;
  }

  /**
   * File error severity determination
   */
  private determineFileSeverity(code: string): ErrorSeverity {
    switch (code) {
      case 'FILE_TOO_LARGE':
      case 'INVALID_FILE_TYPE':
        return ErrorSeverity.ERROR;
      
      case 'FILE_READ_ERROR':
      case 'INVALID_JSON':
        return ErrorSeverity.CRITICAL;
      
      default:
        return ErrorSeverity.ERROR;
    }
  }

  /**
   * Network error severity determination
   */
  private determineNetworkSeverity(code: string, statusCode?: number): ErrorSeverity {
    if (code === 'CONNECTION_ERROR') {
      return ErrorSeverity.CRITICAL;
    }
    
    if (statusCode && statusCode >= 500) {
      return ErrorSeverity.ERROR;
    }
    
    return ErrorSeverity.WARNING;
  }

  /**
   * Documentation link generation
   */
  private getDocumentationLink(code: ValidationErrorCode): string | undefined {
    // In a real application, these would link to actual documentation
    const baseUrl = '/docs/validation-errors';
    return `${baseUrl}#${code.toLowerCase()}`;
  }

  /**
   * File error documentation links
   */
  private getFileErrorDocumentationLink(code: string): string | undefined {
    const baseUrl = '/docs/file-operations';
    return `${baseUrl}#${code.toLowerCase()}`;
  }

  /**
   * Network error documentation links
   */
  private getNetworkErrorDocumentationLink(code: string): string | undefined {
    const baseUrl = '/docs/troubleshooting';
    return `${baseUrl}#${code.toLowerCase()}`;
  }
}