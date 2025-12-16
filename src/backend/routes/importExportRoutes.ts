/**
 * Import/Export Routes
 * 
 * Provides REST endpoints for warband import/export operations.
 * Integrates with existing Express application and Configuration Manager.
 * 
 * Requirements: 6.1
 */

import { Router } from 'express';
import multer from 'multer';
import { DataRepository } from '../services/DataRepository.js';
import { ValidationService } from '../services/ValidationService.js';
import { WarbandImportExportService } from '../services/WarbandImportExportService.js';
import { ImportExportController } from '../controllers/ImportExportController.js';
import { ConfigurationManager } from '../config/ConfigurationManager.js';

/**
 * Creates and configures the import/export router with proper middleware
 */
export function createImportExportRouter(repository: DataRepository): Router {
  const router = Router();
  
  // Configuration could be used for file upload limits if needed in the future
  
  // Configure multer for file upload handling
  // Use memory storage for JSON files (they're typically small)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for JSON files
      files: 1 // Only allow single file upload
    },
    fileFilter: (_req, file, cb) => {
      // Only accept JSON files
      if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
        cb(null, true);
      } else {
        cb(new Error('Only JSON files are allowed'));
      }
    }
  });

  // Create service and controller instances
  const configManager = ConfigurationManager.getInstance();
  const costConfig = configManager.getCostConfig();
  const validationConfig = configManager.getValidationConfig();
  const validationService = new ValidationService(costConfig, validationConfig);
  const importExportService = new WarbandImportExportService(repository, validationService);
  const importExportController = new ImportExportController(importExportService);

  /**
   * GET /api/warbands/:id/export
   * Export a warband as JSON file
   * 
   * Requirements: 1.1, 1.5
   */
  router.get('/warbands/:id/export', async (req, res) => {
    await importExportController.exportWarband(req, res);
  });

  /**
   * POST /api/warbands/import
   * Import a warband from JSON data
   * 
   * Supports both direct JSON in request body and file upload
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  router.post('/warbands/import', upload.single('file'), async (req, res) => {
    try {
      let jsonData;

      // Handle file upload or direct JSON data
      if (req.file) {
        // Parse JSON from uploaded file
        const fileContent = req.file.buffer.toString('utf-8');
        try {
          jsonData = JSON.parse(fileContent);
        } catch (parseError) {
          return res.status(400).json({
            error: 'Invalid JSON file',
            type: 'FILE_READ_ERROR',
            message: 'The uploaded file does not contain valid JSON',
            details: parseError instanceof Error ? parseError.message : 'JSON parsing failed',
            retryable: false
          });
        }
      } else if (req.body && typeof req.body === 'object') {
        // Use JSON data from request body
        // Check if it's already wrapped in warbandData format (from frontend API calls)
        if ('warbandData' in req.body) {
          jsonData = req.body.warbandData;
        } else {
          jsonData = req.body;
        }
      } else {
        return res.status(400).json({
          error: 'No data provided',
          type: 'VALIDATION_ERROR',
          message: 'Either upload a JSON file or provide JSON data in request body',
          retryable: false
        });
      }

      // Set the parsed JSON data in request body for controller
      // Wrap the data in the expected format
      req.body = { warbandData: jsonData };
      
      // Call the controller method
      await importExportController.importWarband(req, res);
    } catch (error) {
      console.error('Import route error:', error);
      res.status(500).json({
        error: 'Import failed',
        type: 'SERVER_ERROR',
        message: 'An error occurred during the import process',
        details: error instanceof Error ? error.message : 'Unknown error',
        retryable: false
      });
    }
  });

  /**
   * POST /api/warbands/validate-import
   * Validate warband JSON data without importing
   * 
   * Supports both direct JSON in request body and file upload
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  router.post('/warbands/validate-import', upload.single('file'), async (req, res) => {
    try {
      let jsonData;

      // Handle file upload or direct JSON data
      if (req.file) {
        // Parse JSON from uploaded file
        const fileContent = req.file.buffer.toString('utf-8');
        try {
          jsonData = JSON.parse(fileContent);
        } catch (parseError) {
          return res.status(400).json({
            valid: false,
            errors: [{
              field: 'file',
              message: 'The uploaded file does not contain valid JSON',
              code: 'INVALID_JSON_FORMAT'
            }],
            warnings: [],
            categories: {
              structure: [{
                field: 'file',
                message: 'The uploaded file does not contain valid JSON',
                code: 'INVALID_JSON_FORMAT'
              }],
              gameData: [],
              businessLogic: [],
              other: []
            }
          });
        }
      } else if (req.body && typeof req.body === 'object') {
        // Use JSON data from request body
        // Check if it's already wrapped in warbandData format (from frontend API calls)
        if ('warbandData' in req.body) {
          jsonData = req.body.warbandData;
        } else {
          jsonData = req.body;
        }
      } else {
        return res.status(400).json({
          valid: false,
          errors: [{
            field: 'data',
            message: 'Either upload a JSON file or provide JSON data in request body',
            code: 'NO_DATA_PROVIDED'
          }],
          warnings: [],
          categories: {
            structure: [{
              field: 'data',
              message: 'Either upload a JSON file or provide JSON data in request body',
              code: 'NO_DATA_PROVIDED'
            }],
            gameData: [],
            businessLogic: [],
            other: []
          }
        });
      }

      // Set the parsed JSON data in request body for controller
      // Wrap the data in the expected format
      req.body = { warbandData: jsonData };
      
      // Call the controller method
      await importExportController.validateImport(req, res);
    } catch (error) {
      console.error('Validation route error:', error);
      res.status(500).json({
        valid: false,
        errors: [{
          field: 'system',
          message: 'An error occurred during validation',
          code: 'VALIDATION_SYSTEM_ERROR'
        }],
        warnings: [],
        categories: {
          structure: [],
          gameData: [],
          businessLogic: [],
          other: [{
            field: 'system',
            message: 'An error occurred during validation',
            code: 'VALIDATION_SYSTEM_ERROR'
          }]
        }
      });
    }
  });

  return router;
}