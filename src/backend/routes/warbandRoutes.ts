import { Router, Request, Response } from 'express';
import { WarbandService } from '../services/WarbandService';
import { DataRepository } from '../services/DataRepository';
import { CostEngine } from '../services/CostEngine';
import { ValidationService } from '../services/ValidationService';
import { Weirdo } from '../models/types';
import { AppError, ValidationError, NotFoundError } from '../errors/AppError';

/**
 * Error handler middleware
 * Converts errors to consistent API responses
 */
function handleError(error: any, res: Response): void {
  // Log error with context
  console.error('API Error:', {
    name: error.name,
    message: error.message,
    code: error.code,
    context: error.context,
    stack: error.stack
  });

  // Handle custom AppError instances
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle generic errors
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: error.message
  });
}

/**
 * Warband API Router
 * Provides REST endpoints for warband management
 */
export function createWarbandRouter(repository: DataRepository): Router {
  const router = Router();
  const warbandService = new WarbandService(repository);
  const costEngine = new CostEngine();
  const validationService = new ValidationService();

  /**
   * POST /api/warbands
   * Create a new warband
   */
  router.post('/warbands', (req: Request, res: Response) => {
    try {
      const { name, pointLimit, ability } = req.body;

      // Validate required fields (ability is now optional)
      if (!name || !pointLimit) {
        throw new ValidationError(
          'Missing required fields',
          'MISSING_REQUIRED_FIELDS',
          { required: ['name', 'pointLimit'] }
        );
      }

      // Validate point limit
      if (pointLimit !== 75 && pointLimit !== 125) {
        throw new ValidationError(
          'Invalid point limit',
          'INVALID_POINT_LIMIT',
          { pointLimit, validValues: [75, 125] }
        );
      }

      const warband = warbandService.createWarband({ name, pointLimit, ability });
      res.status(201).json(warband);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/warbands
   * Get all warbands
   */
  router.get('/warbands', (_req: Request, res: Response) => {
    try {
      const warbands = warbandService.getAllWarbands();
      res.json(warbands);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/warbands/:id
   * Get a specific warband by ID
   */
  router.get('/warbands/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const warband = warbandService.getWarband(id);

      if (!warband) {
        throw new NotFoundError('Warband', id);
      }

      res.json(warband);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * PUT /api/warbands/:id
   * Update an existing warband
   */
  router.put('/warbands/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const warband = warbandService.updateWarband(id, updates);
      res.json(warband);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * DELETE /api/warbands/:id
   * Delete a warband
   */
  router.delete('/warbands/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = warbandService.deleteWarband(id);

      if (!deleted) {
        throw new NotFoundError('Warband', id);
      }

      res.status(204).send();
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/warbands/:id/weirdos
   * Add a weirdo to a warband
   */
  router.post('/warbands/:id/weirdos', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const weirdo: Weirdo = req.body;

      // Load existing warband
      const warband = warbandService.getWarband(id);
      if (!warband) {
        throw new NotFoundError('Warband', id);
      }

      // Add weirdo to warband
      warband.weirdos.push(weirdo);

      // Update warband (recalculates costs)
      const updatedWarband = warbandService.updateWarband(id, warband);
      res.status(201).json(updatedWarband);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * PUT /api/warbands/:id/weirdos/:weirdoId
   * Update a weirdo in a warband
   */
  router.put('/warbands/:id/weirdos/:weirdoId', (req: Request, res: Response) => {
    try {
      const { id, weirdoId } = req.params;
      const updatedWeirdo: Weirdo = req.body;

      // Load existing warband
      const warband = warbandService.getWarband(id);
      if (!warband) {
        throw new NotFoundError('Warband', id);
      }

      // Find and update weirdo
      const weirdoIndex = warband.weirdos.findIndex(w => w.id === weirdoId);
      if (weirdoIndex === -1) {
        throw new NotFoundError('Weirdo', weirdoId);
      }

      warband.weirdos[weirdoIndex] = updatedWeirdo;

      // Update warband (recalculates costs)
      const updatedWarband = warbandService.updateWarband(id, warband);
      res.json(updatedWarband);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * DELETE /api/warbands/:id/weirdos/:weirdoId
   * Remove a weirdo from a warband
   */
  router.delete('/warbands/:id/weirdos/:weirdoId', (req: Request, res: Response) => {
    try {
      const { id, weirdoId } = req.params;

      // Load existing warband
      const warband = warbandService.getWarband(id);
      if (!warband) {
        throw new NotFoundError('Warband', id);
      }

      // Find and remove weirdo
      const weirdoIndex = warband.weirdos.findIndex(w => w.id === weirdoId);
      if (weirdoIndex === -1) {
        throw new NotFoundError('Weirdo', weirdoId);
      }

      warband.weirdos.splice(weirdoIndex, 1);

      // Update warband (recalculates costs)
      const updatedWarband = warbandService.updateWarband(id, warband);
      res.json(updatedWarband);
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/calculate-cost
   * Calculate cost for a weirdo or warband
   */
  router.post('/calculate-cost', (req: Request, res: Response) => {
    try {
      const { weirdo, warband, warbandAbility } = req.body;

      // Log request for debugging
      console.log('Calculate cost request:', {
        hasWeirdo: weirdo !== undefined,
        hasWarband: warband !== undefined,
        warbandAbility,
        bodyKeys: Object.keys(req.body)
      });

      if (weirdo !== undefined) {
        // Calculate weirdo cost (warbandAbility can be null)
        const cost = costEngine.calculateWeirdoCost(weirdo, warbandAbility || null);
        return res.json({ cost });
      }

      if (warband) {
        // Calculate warband cost
        const cost = costEngine.calculateWarbandCost(warband);
        return res.json({ cost });
      }

      throw new ValidationError(
        'Invalid request',
        'INVALID_REQUEST',
        { 
          details: 'Must provide either weirdo or warband',
          received: { hasWeirdo: weirdo !== undefined, hasWarband: warband !== undefined }
        }
      );
    } catch (error: any) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/validate
   * Validate a weirdo or warband
   */
  router.post('/validate', (req: Request, res: Response) => {
    try {
      const { weirdo, warband } = req.body;

      if (weirdo) {
        // Validate weirdo (with or without warband context)
        if (warband) {
          // Full validation with warband context
          const errors = validationService.validateWeirdo(weirdo, warband);
          return res.json({
            valid: errors.length === 0,
            errors
          });
        } else {
          // Partial validation without warband context
          // Create a minimal warband context for validation
          const minimalWarband = {
            id: 'temp',
            name: 'temp',
            pointLimit: 75,
            ability: null,
            weirdos: [weirdo],
            totalCost: 0
          };
          const errors = validationService.validateWeirdo(weirdo, minimalWarband);
          return res.json({
            valid: errors.length === 0,
            errors
          });
        }
      }

      if (warband) {
        // Validate entire warband
        const result = validationService.validateWarband(warband);
        return res.json(result);
      }

      throw new ValidationError(
        'Invalid request',
        'INVALID_REQUEST',
        { details: 'Must provide either weirdo or warband' }
      );
    } catch (error: any) {
      handleError(error, res);
    }
  });

  return router;
}
