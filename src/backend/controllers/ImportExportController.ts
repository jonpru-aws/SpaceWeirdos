/**
 * Import/Export Controller
 * 
 * Handles HTTP endpoints for warband import/export operations with comprehensive error handling.
 * Integrates with the existing Configuration Manager for all constants and settings.
 * 
 * Requirements: 1.1, 1.5, 6.1, 6.4
 */

import { Request, Response } from 'express';

import { WarbandImportExportService } from '../services/WarbandImportExportService.js';
import { AppError, ValidationError } from '../errors/AppError.js';

/**
 * Import/Export error types for categorized error responses
 */
export type ImportExportErrorType = 
  | 'NETWORK_ERROR'
  | 'FILE_READ_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Structured error response for import/export operations
 */
export interface ImportExportError {
  type: ImportExportErrorType;
  message: string;
  details?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  retryable: boolean;
}

/**
 * Import/Export Controller class
 * 
 * Provides HTTP endpoints for warband export, import, and validation operations.
 * Uses Configuration Manager for all constants, limits, and error message templates.
 */
export class ImportExportController {
  private importExportService: WarbandImportExportService;

  constructor(importExportService: WarbandImportExportService) {
    this.importExportService = importExportService;
  }

  /**
   * Export warband endpoint
   * GET /api/warbands/:id/export
   * 
   * Exports a warband as JSON with metadata and proper headers for file download.
   * Requirements: 1.1, 1.5
   */
  async exportWarband(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        throw new ValidationError(
          'Warband ID is required',
          'MISSING_WARBAND_ID',
          { field: 'id', received: id }
        );
      }

      // Export warband using service
      const exportResult = await this.importExportService.exportWarbandToJson(id);
      
      if (!exportResult.success) {
        throw new AppError(
          exportResult.error || 'Export failed',
          'EXPORT_FAILED',
          500,
          { warbandId: id, details: exportResult.error }
        );
      }

      const exportData = exportResult.data!;
      const filename = this.sanitizeFilename(`${exportData.name}_warband.json`);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send the exported warband data
      res.json(exportData);

    } catch (error: unknown) {
      this.handleError(error, res, 'export');
    }
  }

  /**
   * Import warband endpoint
   * POST /api/warbands/import
   * 
   * Imports a warband from JSON data with comprehensive validation and conflict resolution.
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  async importWarband(req: Request, res: Response): Promise<void> {
    try {
      const requestBody = req.body;
      
      if (!requestBody || typeof requestBody !== 'object') {
        throw new ValidationError(
          'Invalid request body provided',
          'INVALID_REQUEST_BODY',
          { details: 'Request body must contain valid JSON data' }
        );
      }

      // Extract warband data from request body
      const { warbandData } = requestBody;
      
      if (!warbandData || typeof warbandData !== 'object') {
        throw new ValidationError(
          'Invalid warband data provided',
          'INVALID_WARBAND_DATA',
          { details: 'Request body must contain valid warbandData property' }
        );
      }

      // Import warband using service
      const importResult = await this.importExportService.importWarbandFromJson(warbandData);
      
      if (!importResult.success) {
        // Handle different types of import failures
        if (importResult.validationErrors && importResult.validationErrors.length > 0) {
          res.status(400).json({
            error: 'Validation failed',
            type: 'VALIDATION_ERROR',
            message: 'The imported warband data contains validation errors',
            validationErrors: importResult.validationErrors,
            retryable: false
          });
          return;
        }

        if (importResult.nameConflict) {
          res.status(409).json({
            error: 'Name conflict',
            type: 'NAME_CONFLICT',
            message: 'A warband with this name already exists',
            conflictingName: importResult.conflictingName,
            retryable: true,
            suggestions: ['Choose a different name', 'Replace the existing warband']
          });
          return;
        }

        throw new AppError(
          importResult.error || 'Import failed',
          'IMPORT_FAILED',
          500,
          { details: importResult.error }
        );
      }

      // Success response
      res.status(201).json({
        success: true,
        message: 'Warband imported successfully',
        warband: importResult.warband
      });

    } catch (error: unknown) {
      this.handleError(error, res, 'import');
    }
  }

  /**
   * Validate import endpoint
   * POST /api/warbands/validate-import
   * 
   * Validates imported warband data without actually importing it.
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  async validateImport(req: Request, res: Response): Promise<void> {
    try {
      const requestBody = req.body;
      
      if (!requestBody || typeof requestBody !== 'object') {
        throw new ValidationError(
          'Invalid request body provided',
          'INVALID_REQUEST_BODY',
          { details: 'Request body must contain valid JSON data' }
        );
      }

      // Extract warband data from request body
      const { warbandData } = requestBody;
      

      
      if (!warbandData || typeof warbandData !== 'object') {
        throw new ValidationError(
          'Invalid warband data provided',
          'INVALID_WARBAND_DATA',
          { details: 'Request body must contain valid warbandData property' }
        );
      }





      // Validate using service
      const validation = this.importExportService.validateWarbandJson(warbandData);
      
      // Return validation results with categorized issues
      res.json({
        valid: validation.valid,
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        categories: this.categorizeValidationIssues(validation.errors || [], validation.warnings || [])
      });

    } catch (error: unknown) {
      this.handleError(error, res, 'validation');
    }
  }

  /**
   * Categorizes validation issues by type for better user understanding
   */
  private categorizeValidationIssues(
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>
  ): Record<string, Array<{ field: string; message: string; code: string }>> {
    const categories: Record<string, Array<{ field: string; message: string; code: string }>> = {
      structure: [],
      gameData: [],
      businessLogic: [],
      other: []
    };

    const allIssues = [...errors, ...warnings];

    for (const issue of allIssues) {
      if (issue.code.includes('STRUCTURE') || issue.code.includes('SCHEMA') || issue.code.includes('FORMAT')) {
        categories.structure.push(issue);
      } else if (issue.code.includes('GAME_DATA') || issue.code.includes('REFERENCE') || issue.code.includes('MISSING')) {
        categories.gameData.push(issue);
      } else if (issue.code.includes('LIMIT') || issue.code.includes('COST') || issue.code.includes('BUSINESS')) {
        categories.businessLogic.push(issue);
      } else {
        categories.other.push(issue);
      }
    }

    return categories;
  }

  /**
   * Sanitizes filename for safe filesystem usage
   * Uses Configuration Manager for security settings
   */
  private sanitizeFilename(filename: string): string {
    // Remove or replace invalid characters
    let sanitized = filename
      .replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid filesystem characters
      .replace(/\s+/g, '_')          // Replace spaces with underscores
      .replace(/_{2,}/g, '_')        // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '');      // Remove leading/trailing underscores

    // Ensure filename is not empty and has reasonable length
    if (!sanitized) {
      sanitized = 'warband_export';
    }

    // Limit filename length (using reasonable default if not in config)
    const maxLength = 100; // Reasonable default for most filesystems
    if (sanitized.length > maxLength) {
      const extension = '.json';
      const nameWithoutExt = sanitized.slice(0, maxLength - extension.length);
      sanitized = nameWithoutExt + extension;
    }

    return sanitized;
  }

  /**
   * Comprehensive error handler for import/export operations
   * Provides categorized error responses with retry information
   */
  private handleError(error: unknown, res: Response, operation: 'export' | 'import' | 'validation'): void {
    // Handle custom AppError instances
    if (error instanceof AppError) {
      const importExportError: ImportExportError = {
        type: this.categorizeErrorType(error),
        message: error.message,
        details: error.context?.details,
        retryable: this.isRetryableError(error)
      };

      // Add validation errors if present
      if (error.context?.validationErrors) {
        importExportError.validationErrors = error.context.validationErrors;
      }

      console.error(`Import/Export ${operation} error:`, {
        name: error.name,
        message: error.message,
        code: error.code,
        context: error.context,
        stack: error.stack
      });
      
      res.status(error.statusCode).json(importExportError);
      return;
    }

    // Handle generic Error instances
    if (error instanceof Error) {
      const importExportError: ImportExportError = {
        type: 'SERVER_ERROR',
        message: `${operation} operation failed`,
        details: error.message,
        retryable: false
      };

      console.error(`Import/Export ${operation} error:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json(importExportError);
      return;
    }

    // Handle unknown error types
    const importExportError: ImportExportError = {
      type: 'UNKNOWN_ERROR',
      message: `Unknown error during ${operation} operation`,
      details: String(error),
      retryable: false
    };

    console.error(`Unknown import/export ${operation} error:`, error);
    res.status(500).json(importExportError);
  }

  /**
   * Categorizes errors by type for appropriate user feedback
   */
  private categorizeErrorType(error: AppError): ImportExportErrorType {
    const code = error.code.toLowerCase();
    
    if (code.includes('validation') || code.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    
    if (code.includes('file') || code.includes('read') || code.includes('write')) {
      return 'FILE_READ_ERROR';
    }
    
    if (code.includes('network') || code.includes('connection')) {
      return 'NETWORK_ERROR';
    }
    
    if (code.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    
    return 'SERVER_ERROR';
  }

  /**
   * Determines if an error is retryable based on error type and configuration
   */
  private isRetryableError(error: AppError): boolean {
    const code = error.code.toLowerCase();
    
    // Network and timeout errors are typically retryable
    if (code.includes('network') || code.includes('timeout') || code.includes('connection')) {
      return true;
    }
    
    // Temporary server errors may be retryable
    if (code.includes('temporary') || code.includes('unavailable')) {
      return true;
    }
    
    // Validation and client errors are not retryable
    if (code.includes('validation') || code.includes('invalid') || error.statusCode < 500) {
      return false;
    }
    
    // Default to not retryable for safety
    return false;
  }
}