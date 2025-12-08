import { Router, Request, Response } from 'express';
import { WarbandService } from '../services/WarbandService.js';
import { DataRepository } from '../services/DataRepository.js';
import { CostEngine } from '../services/CostEngine.js';
import { ValidationService } from '../services/ValidationService.js';
import { Weirdo, Weapon, Equipment, PsychicPower } from '../models/types.js';
import { AppError, ValidationError, NotFoundError } from '../errors/AppError.js';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Error handler middleware
 * Converts errors to consistent API responses
 */
function handleError(error: unknown, res: Response): void {
  // Handle custom AppError instances
  if (error instanceof AppError) {
    // Log error with context
    console.error('API Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      context: error.context,
      stack: error.stack
    });
    
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    console.error('API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error.message
    });
    return;
  }

  // Handle unknown error types
  console.error('Unknown error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: 'An unknown error occurred'
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
      const { name, pointLimit, ability, weirdos } = req.body;

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

      const warband = warbandService.createWarband({ name, pointLimit, ability, weirdos });
      res.status(201).json(warband);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * PUT /api/warbands/:id
   * Update an existing warband
   * Validates before saving and returns structured validation errors
   */
  router.put('/warbands/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Load existing warband
      const existingWarband = warbandService.getWarband(id);
      if (!existingWarband) {
        throw new NotFoundError('Warband', id);
      }

      // Merge updates to create the warband to validate
      const warbandToValidate = {
        ...existingWarband,
        ...updates,
        id: existingWarband.id,
        createdAt: existingWarband.createdAt
      };

      // Validate before saving
      const validation = validationService.validateWarband(warbandToValidate);
      
      if (!validation.valid) {
        // Return validation errors with 400 status
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: validation.errors
        });
      }

      // If validation passes, update the warband
      const warband = warbandService.updateWarband(id, updates);
      res.json(warband);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
      const weirdoIndex = warband.weirdos.findIndex((w: Weirdo) => w.id === weirdoId);
      if (weirdoIndex === -1) {
        throw new NotFoundError('Weirdo', weirdoId);
      }

      warband.weirdos[weirdoIndex] = updatedWeirdo;

      // Update warband (recalculates costs)
      const updatedWarband = warbandService.updateWarband(id, warband);
      res.json(updatedWarband);
    } catch (error: unknown) {
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
      const weirdoIndex = warband.weirdos.findIndex((w: Weirdo) => w.id === weirdoId);
      if (weirdoIndex === -1) {
        throw new NotFoundError('Weirdo', weirdoId);
      }

      warband.weirdos.splice(weirdoIndex, 1);

      // Update warband (recalculates costs)
      const updatedWarband = warbandService.updateWarband(id, warband);
      res.json(updatedWarband);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/attributes
   * Get all available attributes with costs
   */
  router.get('/game-data/attributes', async (_req: Request, res: Response) => {
    try {
      const attributesPath = path.join(process.cwd(), 'data', 'attributes.json');
      const data = await fs.readFile(attributesPath, 'utf-8');
      const attributes = JSON.parse(data);
      res.json(attributes);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/weapons/close
   * Get all available close combat weapons
   */
  router.get('/game-data/weapons/close', async (_req: Request, res: Response) => {
    try {
      const weaponsPath = path.join(process.cwd(), 'data', 'closeCombatWeapons.json');
      const data = await fs.readFile(weaponsPath, 'utf-8');
      const weapons = JSON.parse(data);
      res.json(weapons);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/weapons/ranged
   * Get all available ranged weapons
   */
  router.get('/game-data/weapons/ranged', async (_req: Request, res: Response) => {
    try {
      const weaponsPath = path.join(process.cwd(), 'data', 'rangedWeapons.json');
      const data = await fs.readFile(weaponsPath, 'utf-8');
      const weapons = JSON.parse(data);
      res.json(weapons);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/equipment
   * Get all available equipment
   */
  router.get('/game-data/equipment', async (_req: Request, res: Response) => {
    try {
      const equipmentPath = path.join(process.cwd(), 'data', 'equipment.json');
      const data = await fs.readFile(equipmentPath, 'utf-8');
      const equipment = JSON.parse(data);
      res.json(equipment);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/psychic-powers
   * Get all available psychic powers
   */
  router.get('/game-data/psychic-powers', async (_req: Request, res: Response) => {
    try {
      const powersPath = path.join(process.cwd(), 'data', 'psychicPowers.json');
      const data = await fs.readFile(powersPath, 'utf-8');
      const powers = JSON.parse(data);
      res.json(powers);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/leader-traits
   * Get all available leader traits
   */
  router.get('/game-data/leader-traits', async (_req: Request, res: Response) => {
    try {
      const traitsPath = path.join(process.cwd(), 'data', 'leaderTraits.json');
      const data = await fs.readFile(traitsPath, 'utf-8');
      const traits = JSON.parse(data);
      res.json(traits);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * GET /api/game-data/warband-abilities
   * Get all available warband abilities with descriptions
   */
  router.get('/game-data/warband-abilities', async (_req: Request, res: Response) => {
    try {
      const abilitiesPath = path.join(process.cwd(), 'data', 'warbandAbilities.json');
      const data = await fs.readFile(abilitiesPath, 'utf-8');
      const abilities = JSON.parse(data);
      res.json(abilities);
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/validation/warband
   * Validate complete warband with all weirdos
   * Returns structured validation errors with details
   */
  router.post('/validation/warband', (req: Request, res: Response) => {
    try {
      const warband = req.body;

      // Validate that we have a warband object (must have at least weirdos array)
      if (!warband || typeof warband !== 'object' || !Array.isArray(warband.weirdos)) {
        throw new ValidationError(
          'Invalid request',
          'INVALID_REQUEST',
          { details: 'Must provide a warband object with weirdos array' }
        );
      }

      // Use ValidationService for comprehensive validation
      const result = validationService.validateWarband(warband);

      res.json({
        success: true,
        data: {
          valid: result.valid,
          errors: result.errors
        }
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/validation/weirdo
   * Validate individual weirdo with warband context
   * Returns structured validation errors with details
   */
  router.post('/validation/weirdo', (req: Request, res: Response) => {
    try {
      const { weirdo, warband } = req.body;

      // Validate that we have a weirdo object
      if (!weirdo || typeof weirdo !== 'object') {
        throw new ValidationError(
          'Invalid request',
          'INVALID_REQUEST',
          { details: 'Must provide a weirdo object' }
        );
      }

      let result;
      if (warband) {
        // Full validation with warband context
        result = validationService.validateWeirdo(weirdo, warband);
      } else {
        // Partial validation without warband context
        // Create a minimal warband context for validation
        // Type assertion needed: TypeScript requires explicit union type for literal values
        // Safe because 75 is a valid member of the 75 | 125 union type
        const minimalWarband = {
          id: 'temp',
          name: 'temp',
          // Type assertion safe: 75 is a valid member of the 75 | 125 union type
          pointLimit: 75 as 75 | 125,
          ability: null,
          weirdos: [weirdo],
          totalCost: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        result = validationService.validateWeirdo(weirdo, minimalWarband);
      }

      res.json({
        success: true,
        data: {
          valid: result.valid,
          errors: result.errors,
          warnings: result.warnings
        }
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/cost/calculate
   * Optimized real-time cost calculation with breakdown
   * Accepts weirdo configuration and returns total cost with breakdown
   * Optimized for < 100ms response time
   */
  router.post('/cost/calculate', async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const { weirdoType, attributes, weapons, equipment, psychicPowers, warbandAbility } = req.body;

      // Log incoming request for debugging
      console.log('Cost calculation request:', {
        weirdoType,
        attributes,
        weapons,
        equipment,
        psychicPowers,
        warbandAbility
      });

      // Validate required fields
      if (!weirdoType || !attributes) {
        throw new ValidationError(
          'Missing required fields',
          'MISSING_REQUIRED_FIELDS',
          { required: ['weirdoType', 'attributes'] }
        );
      }

      // Load game data from JSON files to look up items by name
      const closeCombatWeaponsData = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'closeCombatWeapons.json'), 'utf-8')
      // Type assertion safe: JSON files are validated to match type definitions at build time
      ) as Weapon[];
      
      const rangedWeaponsData = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'rangedWeapons.json'), 'utf-8')
      // Type assertion safe: JSON files are validated to match type definitions at build time
      ) as Weapon[];
      
      const equipmentData = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'equipment.json'), 'utf-8')
      // Type assertion safe: JSON files are validated to match type definitions at build time
      ) as Equipment[];
      
      const psychicPowersData = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'psychicPowers.json'), 'utf-8')
      // Type assertion safe: JSON files are validated to match type definitions at build time
      ) as PsychicPower[];

      // Build a minimal weirdo object for cost calculation
      // Note: weapons, equipment, and psychicPowers are passed as name strings
      const weirdo: Weirdo = {
        id: 'temp',
        name: 'temp',
        type: weirdoType,
        attributes,
        closeCombatWeapons: [],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      // Look up weapons by name
      if (weapons) {
        if (weapons.close && Array.isArray(weapons.close)) {
          weirdo.closeCombatWeapons = weapons.close
            .map((name: string) => closeCombatWeaponsData.find(w => w.name === name))
            .filter((w: Weapon | undefined): w is Weapon => w !== undefined);
        }
        if (weapons.ranged && Array.isArray(weapons.ranged)) {
          weirdo.rangedWeapons = weapons.ranged
            .map((name: string) => rangedWeaponsData.find(w => w.name === name))
            .filter((w: Weapon | undefined): w is Weapon => w !== undefined);
        }
      }

      // Look up equipment by name
      if (equipment && Array.isArray(equipment)) {
        weirdo.equipment = equipment
          .map((name: string) => equipmentData.find(e => e.name === name))
          .filter((e: Equipment | undefined): e is Equipment => e !== undefined);
      }

      // Look up psychic powers by name
      if (psychicPowers && Array.isArray(psychicPowers)) {
        weirdo.psychicPowers = psychicPowers
          .map((name: string) => psychicPowersData.find(p => p.name === name))
          .filter((p: PsychicPower | undefined): p is PsychicPower => p !== undefined);
      }

      // Calculate costs with breakdown
      const attributeCosts = {
        speed: costEngine.getAttributeCost('speed', attributes.speed, warbandAbility || null),
        defense: costEngine.getAttributeCost('defense', attributes.defense, warbandAbility || null),
        firepower: costEngine.getAttributeCost('firepower', attributes.firepower, warbandAbility || null),
        prowess: costEngine.getAttributeCost('prowess', attributes.prowess, warbandAbility || null),
        willpower: costEngine.getAttributeCost('willpower', attributes.willpower, warbandAbility || null)
      };

      let weaponsCost = 0;
      for (const weapon of weirdo.closeCombatWeapons) {
        weaponsCost += costEngine.getWeaponCost(weapon, warbandAbility || null);
      }
      for (const weapon of weirdo.rangedWeapons) {
        weaponsCost += costEngine.getWeaponCost(weapon, warbandAbility || null);
      }

      let equipmentCost = 0;
      for (const equip of weirdo.equipment) {
        equipmentCost += costEngine.getEquipmentCost(equip, warbandAbility || null);
      }

      let psychicPowersCost = 0;
      for (const power of weirdo.psychicPowers) {
        psychicPowersCost += costEngine.getPsychicPowerCost(power);
      }

      const totalCost = Object.values(attributeCosts).reduce((sum, cost) => sum + cost, 0) +
                        weaponsCost + equipmentCost + psychicPowersCost;

      // Update weirdo total cost for validation
      weirdo.totalCost = totalCost;

      // Create a minimal warband context for validation
      // Note: This is a simplified context for real-time cost calculation
      // For full validation, use the /api/validation/weirdo endpoint
      const tempWarband: Warband = {
        id: 'temp',
        name: 'temp',
        ability: warbandAbility || null,
        pointLimit: 125, // Use max limit for real-time calculation
        totalCost: 0,
        weirdos: [weirdo],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use ValidationService to generate warnings
      const validationResult = validationService.validateWeirdo(weirdo, tempWarband);
      const warnings: string[] = validationResult.warnings.map(w => w.message);

      // Determine if over limit (error state)
      const limit = weirdoType === 'leader' ? 25 : 25; // Max limit for any weirdo
      const isOverLimit = totalCost > limit;
      const isApproachingLimit = validationResult.warnings.length > 0;

      if (isOverLimit) {
        warnings.push(`Cost exceeds the ${limit}-point limit`);
      }

      const elapsedTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          totalCost,
          breakdown: {
            attributes: Object.values(attributeCosts).reduce((sum, cost) => sum + cost, 0),
            weapons: weaponsCost,
            equipment: equipmentCost,
            psychicPowers: psychicPowersCost
          },
          warnings,
          isApproachingLimit,
          isOverLimit
        }
      });

      // Log performance warning if over 100ms
      if (elapsedTime > 100) {
        console.warn(`Cost calculation took ${elapsedTime}ms (target: <100ms)`);
      }
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  /**
   * POST /api/calculate-cost
   * Calculate cost for a weirdo or warband
   * @deprecated Use /api/cost/calculate instead
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
    } catch (error: unknown) {
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
            // Type assertion needed: TypeScript requires explicit union type for literal values
            // This is safe because 75 is a valid member of the 75 | 125 union type
            pointLimit: 75 as 75 | 125,
            ability: null,
            weirdos: [weirdo],
            totalCost: 0,
            createdAt: new Date(),
            updatedAt: new Date()
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
    } catch (error: unknown) {
      handleError(error, res);
    }
  });

  return router;
}
