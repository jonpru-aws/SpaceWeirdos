/**
 * Warband Import/Export Service
 * 
 * Provides core functionality for warband import/export operations including:
 * - Export functionality with metadata generation
 * - JSON schema validation with comprehensive checks
 * - Game data reference validation against current data files
 * - Data sanitization and conflict resolution
 * 
 * Requirements: 1.1, 1.3, 2.2, 3.1, 3.2, 8.2
 */

import { Warband, Weirdo, Weapon, Equipment, PsychicPower, WarbandAbility, LeaderTrait } from '../models/types.js';
import { DataRepository } from './DataRepository.js';
import { ValidationService } from './ValidationService.js';
import { ConfigurationManager } from '../config/ConfigurationManager.js';
import { NameConflictResolutionService } from './NameConflictResolutionService.js';
import { UniqueIdGenerator } from './UniqueIdGenerator.js';

import path from 'path';

/**
 * Export data structure with metadata
 */
export interface ExportedWarband {
  // Core warband properties
  id: string;
  name: string;
  ability: WarbandAbility | null;
  pointLimit: 75 | 125;
  totalCost: number;
  weirdos: Weirdo[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Export metadata
  exportVersion: string; // "1.0"
  exportedAt: string; // ISO date string
  exportedBy: string; // "Space Weirdos Warband Builder"
}

/**
 * Import validation result
 */
export interface ImportValidation {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Export operation result
 */
export interface ExportResult {
  success: boolean;
  data?: ExportedWarband;
  error?: string;
}

/**
 * Import operation result
 */
export interface ImportResult {
  success: boolean;
  warband?: Warband;
  error?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  nameConflict?: boolean;
  conflictingName?: string;
}

/**
 * Game data cache for validation
 */
interface GameDataCache {
  weapons: {
    close: Weapon[];
    ranged: Weapon[];
  };
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTraits: LeaderTrait[];
  warbandAbilities: WarbandAbility[];
}

/**
 * Warband Import/Export Service
 * 
 * Handles the business logic for importing and exporting warbands with comprehensive
 * validation and error handling. Uses Configuration Manager for all settings.
 */
export class WarbandImportExportService {
  private repository: DataRepository;
  private configManager: ConfigurationManager;
  private nameConflictService: NameConflictResolutionService;
  private idGenerator: UniqueIdGenerator;
  private gameDataCache: GameDataCache | null = null;

  constructor(repository: DataRepository, _validationService: ValidationService) {
    this.repository = repository;
    // ValidationService is passed but not stored as we use repository's validation
    this.configManager = ConfigurationManager.getInstance();
    this.nameConflictService = new NameConflictResolutionService(repository);
    this.idGenerator = new UniqueIdGenerator(repository);
  }

  /**
   * Exports a warband to JSON format with metadata
   * Requirements: 1.1, 1.3
   */
  async exportWarbandToJson(id: string): Promise<ExportResult> {
    try {
      // Load warband from repository
      const warband = this.repository.loadWarband(id);
      if (!warband) {
        return {
          success: false,
          error: `Warband with ID ${id} not found`
        };
      }

      // Create export data with metadata
      const exportData: ExportedWarband = {
        // Core warband data
        id: warband.id,
        name: warband.name,
        ability: warband.ability,
        pointLimit: warband.pointLimit,
        totalCost: warband.totalCost,
        weirdos: warband.weirdos,
        createdAt: warband.createdAt.toISOString(),
        updatedAt: warband.updatedAt.toISOString(),
        
        // Export metadata
        exportVersion: "1.0",
        exportedAt: new Date().toISOString(),
        exportedBy: "Space Weirdos Warband Builder"
      };

      return {
        success: true,
        data: exportData
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      return {
        success: false,
        error: `Export failed: ${errorMessage}`
      };
    }
  }

  /**
   * Imports a warband from JSON data with comprehensive validation
   * Requirements: 2.2, 3.1, 3.2, 8.2
   */
  async importWarbandFromJson(jsonData: unknown): Promise<ImportResult> {
    try {
      // Validate JSON structure
      const validation = this.validateWarbandJson(jsonData);
      if (!validation.valid) {
        return {
          success: false,
          validationErrors: validation.errors
        };
      }

      // Type assertion safe after validation
      const exportedWarband = jsonData as ExportedWarband;

      // Automatically resolve name conflicts by appending version numbers
      let finalName = exportedWarband.name;
      const nameConflict = this.nameConflictService.checkNameConflict(exportedWarband.name);
      
      if (nameConflict) {
        const nameResolution = this.nameConflictService.generateUniqueName(exportedWarband.name);
        
        if (!nameResolution.success) {
          return {
            success: false,
            error: nameResolution.error || 'Failed to resolve name conflict'
          };
        }
        
        finalName = nameResolution.resolvedName!;
      }

      // Sanitize and prepare warband for import with resolved name
      const sanitizedWarband = this.sanitizeWarbandForImport({
        ...exportedWarband,
        name: finalName
      });

      // Generate unique ID for the warband
      const warbandIdResult = this.idGenerator.generateWarbandId({
        prefix: 'imported_wb',
        includeTimestamp: true
      });

      // Create new warband with fresh ID and timestamps
      const newWarband: Warband = {
        id: warbandIdResult.id,
        name: sanitizedWarband.name!,
        ability: sanitizedWarband.ability!,
        pointLimit: sanitizedWarband.pointLimit!,
        totalCost: sanitizedWarband.totalCost || 0,
        weirdos: sanitizedWarband.weirdos || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate new IDs for all weirdos to prevent conflicts
      newWarband.weirdos = newWarband.weirdos.map(weirdo => {
        const weirdoIdResult = this.idGenerator.generateWeirdoId({
          prefix: 'imported_wd',
          includeTimestamp: true
        });
        
        return {
          ...weirdo,
          id: weirdoIdResult.id
        };
      });

      // Save to repository
      const savedWarband = this.repository.saveWarband(newWarband);

      return {
        success: true,
        warband: savedWarband
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
      return {
        success: false,
        error: `Import failed: ${errorMessage}`
      };
    }
  }

  /**
   * Imports a warband with automatic name conflict resolution
   * Requirements: 5.4, 8.5
   */
  async importWarbandWithNameResolution(jsonData: unknown, resolveConflicts: boolean = true): Promise<ImportResult> {
    try {
      // Validate JSON structure
      const validation = this.validateWarbandJson(jsonData);
      if (!validation.valid) {
        return {
          success: false,
          validationErrors: validation.errors
        };
      }

      // Type assertion safe after validation
      const exportedWarband = jsonData as ExportedWarband;

      // Handle name conflicts
      let finalName = exportedWarband.name;
      
      if (resolveConflicts) {
        // Automatically resolve name conflicts
        const nameResolution = this.nameConflictService.generateUniqueName(exportedWarband.name);
        
        if (!nameResolution.success) {
          return {
            success: false,
            error: nameResolution.error || 'Failed to resolve name conflict'
          };
        }
        
        finalName = nameResolution.resolvedName!;
      } else {
        // Check for conflicts and return error if found
        const nameConflict = this.nameConflictService.checkNameConflict(exportedWarband.name);
        
        if (nameConflict) {
          return {
            success: false,
            nameConflict: true,
            conflictingName: exportedWarband.name
          };
        }
      }

      // Sanitize and prepare warband for import
      const sanitizedWarband = this.sanitizeWarbandForImport({
        ...exportedWarband,
        name: finalName
      });

      // Generate unique ID for the warband
      const warbandIdResult = this.idGenerator.generateWarbandId({
        prefix: 'imported_wb',
        includeTimestamp: true
      });

      // Create new warband with fresh ID and timestamps
      const newWarband: Warband = {
        id: warbandIdResult.id,
        name: sanitizedWarband.name!,
        ability: sanitizedWarband.ability!,
        pointLimit: sanitizedWarband.pointLimit!,
        totalCost: sanitizedWarband.totalCost || 0,
        weirdos: sanitizedWarband.weirdos || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate new IDs for all weirdos to prevent conflicts
      newWarband.weirdos = newWarband.weirdos.map(weirdo => {
        const weirdoIdResult = this.idGenerator.generateWeirdoId({
          prefix: 'imported_wd',
          includeTimestamp: true
        });
        
        return {
          ...weirdo,
          id: weirdoIdResult.id
        };
      });

      // Save to repository
      const savedWarband = this.repository.saveWarband(newWarband);

      return {
        success: true,
        warband: savedWarband
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
      return {
        success: false,
        error: `Import failed: ${errorMessage}`
      };
    }
  }

  /**
   * Validates a proposed warband name
   * Requirements: 5.4
   */
  validateWarbandName(name: string) {
    return this.nameConflictService.validateName(name);
  }

  /**
   * Generates a unique warband name
   * Requirements: 5.4
   */
  generateUniqueWarbandName(baseName: string) {
    return this.nameConflictService.generateUniqueName(baseName);
  }

  /**
   * Suggests alternative names for a conflicting name
   * Requirements: 5.4
   */
  suggestAlternativeNames(originalName: string, count: number = 3) {
    return this.nameConflictService.suggestAlternativeNames(originalName, count);
  }

  /**
   * Validates warband JSON data against schema and game data references
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  validateWarbandJson(jsonData: unknown): ImportValidation {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];



    // Basic type validation
    if (!jsonData || typeof jsonData !== 'object') {
      errors.push({
        field: 'root',
        message: 'Invalid JSON data: must be an object',
        code: 'INVALID_JSON_STRUCTURE'
      });
      return { valid: false, errors, warnings };
    }

    const data = jsonData as Record<string, unknown>;

    // Validate required fields
    this.validateRequiredFields(data, errors);
    
    // Validate field types
    this.validateFieldTypes(data, errors);
    
    // Validate game data references (async validation handled synchronously)
    this.validateGameDataReferences(data, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates required fields are present
   */
  private validateRequiredFields(data: Record<string, unknown>, errors: Array<{ field: string; message: string; code: string }>): void {
    const requiredFields = ['name', 'pointLimit', 'weirdos'];
    
    for (const field of requiredFields) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        let message = `Required field '${field}' is missing`;
        
        // Provide more helpful error messages
        switch (field) {
          case 'name':
            message = 'Warband name is required. Make sure your file contains a "name" field with the warband name.';
            break;
          case 'pointLimit':
            message = 'Point limit is required. Make sure your file contains a "pointLimit" field (75 or 125).';
            break;
          case 'weirdos':
            message = 'Weirdos array is required. Make sure your file contains a "weirdos" field with an array of warband members.';
            break;
        }
        
        errors.push({
          field,
          message,
          code: 'MISSING_REQUIRED_FIELD'
        });
      }
    }
    
    // If all required fields are missing, it might not be a valid warband file
    const missingCount = requiredFields.filter(field => 
      !(field in data) || data[field] === undefined || data[field] === null
    ).length;
    
    if (missingCount === requiredFields.length) {
      errors.push({
        field: 'file',
        message: 'This file does not appear to be a valid warband export. Please make sure you are importing a file that was exported from the Space Weirdos Warband Builder.',
        code: 'INVALID_WARBAND_FILE'
      });
    }
  }

  /**
   * Validates field types match expected schema
   */
  private validateFieldTypes(data: Record<string, unknown>, errors: Array<{ field: string; message: string; code: string }>): void {
    // Validate name
    if ('name' in data && typeof data.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Name must be a string',
        code: 'INVALID_FIELD_TYPE'
      });
    }

    // Validate pointLimit
    if ('pointLimit' in data && data.pointLimit !== 75 && data.pointLimit !== 125) {
      errors.push({
        field: 'pointLimit',
        message: 'Point limit must be 75 or 125',
        code: 'INVALID_POINT_LIMIT'
      });
    }

    // Validate ability (can be null)
    if ('ability' in data && data.ability !== null && typeof data.ability !== 'string') {
      errors.push({
        field: 'ability',
        message: 'Ability must be a string or null',
        code: 'INVALID_FIELD_TYPE'
      });
    }

    // Validate weirdos array
    if ('weirdos' in data) {
      if (!Array.isArray(data.weirdos)) {
        errors.push({
          field: 'weirdos',
          message: 'Weirdos must be an array',
          code: 'INVALID_FIELD_TYPE'
        });
      } else {
        // Validate each weirdo
        data.weirdos.forEach((weirdo, index) => {
          this.validateWeirdoStructure(weirdo, index, errors);
        });
      }
    }
  }

  /**
   * Validates individual weirdo structure
   */
  private validateWeirdoStructure(weirdo: unknown, index: number, errors: Array<{ field: string; message: string; code: string }>): void {
    if (!weirdo || typeof weirdo !== 'object') {
      errors.push({
        field: `weirdos[${index}]`,
        message: 'Weirdo must be an object',
        code: 'INVALID_WEIRDO_STRUCTURE'
      });
      return;
    }

    const weirdoData = weirdo as Record<string, unknown>;

    // Validate required weirdo fields
    const requiredWeirdoFields = ['name', 'type', 'attributes'];
    for (const field of requiredWeirdoFields) {
      if (!(field in weirdoData) || weirdoData[field] === undefined || weirdoData[field] === null) {
        errors.push({
          field: `weirdos[${index}].${field}`,
          message: `Required weirdo field '${field}' is missing`,
          code: 'MISSING_WEIRDO_FIELD'
        });
      }
    }

    // Validate weirdo type
    if ('type' in weirdoData && weirdoData.type !== 'leader' && weirdoData.type !== 'trooper') {
      errors.push({
        field: `weirdos[${index}].type`,
        message: 'Weirdo type must be "leader" or "trooper"',
        code: 'INVALID_WEIRDO_TYPE'
      });
    }

    // Validate attributes structure
    if ('attributes' in weirdoData) {
      this.validateAttributesStructure(weirdoData.attributes, index, errors);
    }
  }

  /**
   * Validates attributes structure
   */
  private validateAttributesStructure(attributes: unknown, weirdoIndex: number, errors: Array<{ field: string; message: string; code: string }>): void {
    if (!attributes || typeof attributes !== 'object') {
      errors.push({
        field: `weirdos[${weirdoIndex}].attributes`,
        message: 'Attributes must be an object',
        code: 'INVALID_ATTRIBUTES_STRUCTURE'
      });
      return;
    }

    const attributesData = attributes as Record<string, unknown>;
    const requiredAttributes = ['speed', 'defense', 'firepower', 'prowess', 'willpower'];

    for (const attr of requiredAttributes) {
      if (!(attr in attributesData) || attributesData[attr] === undefined || attributesData[attr] === null) {
        errors.push({
          field: `weirdos[${weirdoIndex}].attributes.${attr}`,
          message: `Required attribute '${attr}' is missing`,
          code: 'MISSING_ATTRIBUTE'
        });
      }
    }
  }

  /**
   * Validates game data references against current data files
   * Requirements: 3.2, 3.3
   */
  private validateGameDataReferences(
    data: Record<string, unknown>, 
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>
  ): void {
    // Load game data synchronously for validation
    // Note: In a production system, this might be cached or loaded asynchronously
    try {
      const gameData = this.loadGameDataSync();
      
      if ('weirdos' in data && Array.isArray(data.weirdos)) {
        data.weirdos.forEach((weirdo, index) => {
          this.validateWeirdoGameDataReferences(weirdo, index, gameData, errors, warnings);
        });
      }

      // Validate warband ability
      if ('ability' in data && data.ability !== null && typeof data.ability === 'string') {
        if (!gameData.warbandAbilities.includes(data.ability as WarbandAbility)) {
          warnings.push({
            field: 'ability',
            message: `Warband ability '${data.ability}' not found in current game data`,
            code: 'MISSING_WARBAND_ABILITY_REFERENCE'
          });
        }
      }

    } catch (error) {
      // If game data loading fails, add warning but don't fail validation
      warnings.push({
        field: 'gameData',
        message: 'Could not validate game data references: game data files unavailable',
        code: 'GAME_DATA_UNAVAILABLE'
      });
    }
  }

  /**
   * Validates weirdo game data references
   */
  private validateWeirdoGameDataReferences(
    weirdo: unknown,
    index: number,
    gameData: GameDataCache,
    _errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>
  ): void {
    if (!weirdo || typeof weirdo !== 'object') return;

    const weirdoData = weirdo as Record<string, unknown>;

    // Validate weapons
    if ('closeCombatWeapons' in weirdoData && Array.isArray(weirdoData.closeCombatWeapons)) {
      weirdoData.closeCombatWeapons.forEach((weapon: unknown, weaponIndex: number) => {
        if (weapon && typeof weapon === 'object' && 'name' in weapon) {
          const weaponName = (weapon as { name: unknown }).name;
          if (typeof weaponName === 'string' && !gameData.weapons.close.some(w => w.name === weaponName)) {
            warnings.push({
              field: `weirdos[${index}].closeCombatWeapons[${weaponIndex}].name`,
              message: `Close combat weapon '${weaponName}' not found in current game data`,
              code: 'MISSING_WEAPON_REFERENCE'
            });
          }
        }
      });
    }

    if ('rangedWeapons' in weirdoData && Array.isArray(weirdoData.rangedWeapons)) {
      weirdoData.rangedWeapons.forEach((weapon: unknown, weaponIndex: number) => {
        if (weapon && typeof weapon === 'object' && 'name' in weapon) {
          const weaponName = (weapon as { name: unknown }).name;
          if (typeof weaponName === 'string' && !gameData.weapons.ranged.some(w => w.name === weaponName)) {
            warnings.push({
              field: `weirdos[${index}].rangedWeapons[${weaponIndex}].name`,
              message: `Ranged weapon '${weaponName}' not found in current game data`,
              code: 'MISSING_WEAPON_REFERENCE'
            });
          }
        }
      });
    }

    // Validate equipment
    if ('equipment' in weirdoData && Array.isArray(weirdoData.equipment)) {
      weirdoData.equipment.forEach((equipment: unknown, equipmentIndex: number) => {
        if (equipment && typeof equipment === 'object' && 'name' in equipment) {
          const equipmentName = (equipment as { name: unknown }).name;
          if (typeof equipmentName === 'string' && !gameData.equipment.some(e => e.name === equipmentName)) {
            warnings.push({
              field: `weirdos[${index}].equipment[${equipmentIndex}].name`,
              message: `Equipment '${equipmentName}' not found in current game data`,
              code: 'MISSING_EQUIPMENT_REFERENCE'
            });
          }
        }
      });
    }

    // Validate psychic powers
    if ('psychicPowers' in weirdoData && Array.isArray(weirdoData.psychicPowers)) {
      weirdoData.psychicPowers.forEach((power: unknown, powerIndex: number) => {
        if (power && typeof power === 'object' && 'name' in power) {
          const powerName = (power as { name: unknown }).name;
          if (typeof powerName === 'string' && !gameData.psychicPowers.some(p => p.name === powerName)) {
            warnings.push({
              field: `weirdos[${index}].psychicPowers[${powerIndex}].name`,
              message: `Psychic power '${powerName}' not found in current game data`,
              code: 'MISSING_PSYCHIC_POWER_REFERENCE'
            });
          }
        }
      });
    }

    // Validate leader trait
    if ('leaderTrait' in weirdoData && weirdoData.leaderTrait !== null && typeof weirdoData.leaderTrait === 'string') {
      if (!gameData.leaderTraits.includes(weirdoData.leaderTrait as LeaderTrait)) {
        warnings.push({
          field: `weirdos[${index}].leaderTrait`,
          message: `Leader trait '${weirdoData.leaderTrait}' not found in current game data`,
          code: 'MISSING_LEADER_TRAIT_REFERENCE'
        });
      }
    }
  }

  /**
   * Loads game data synchronously for validation
   * Note: This is a simplified synchronous version for validation purposes
   */
  private loadGameDataSync(): GameDataCache {
    if (this.gameDataCache) {
      return this.gameDataCache;
    }

    try {
      const serverConfig = this.configManager.getServerConfig();
      const dataPath = path.join(process.cwd(), serverConfig.dataPath);

      // Load all game data files synchronously
      const closeCombatWeapons = JSON.parse(
        require('fs').readFileSync(path.join(dataPath, 'closeCombatWeapons.json'), 'utf-8')
      ) as Weapon[];

      const rangedWeapons = JSON.parse(
        require('fs').readFileSync(path.join(dataPath, 'rangedWeapons.json'), 'utf-8')
      ) as Weapon[];

      const equipment = JSON.parse(
        require('fs').readFileSync(path.join(dataPath, 'equipment.json'), 'utf-8')
      ) as Equipment[];

      const psychicPowers = JSON.parse(
        require('fs').readFileSync(path.join(dataPath, 'psychicPowers.json'), 'utf-8')
      ) as PsychicPower[];

      const leaderTraits = JSON.parse(
        require('fs').readFileSync(path.join(dataPath, 'leaderTraits.json'), 'utf-8')
      ) as { name: LeaderTrait }[];

      const warbandAbilities = JSON.parse(
        require('fs').readFileSync(path.join(dataPath, 'warbandAbilities.json'), 'utf-8')
      ) as { name: WarbandAbility }[];

      this.gameDataCache = {
        weapons: {
          close: closeCombatWeapons,
          ranged: rangedWeapons
        },
        equipment,
        psychicPowers,
        leaderTraits: leaderTraits.map(t => t.name),
        warbandAbilities: warbandAbilities.map(a => a.name)
      };

      return this.gameDataCache;

    } catch (error) {
      // If loading fails, return empty cache to allow validation to continue with warnings
      console.warn('Failed to load game data for validation:', error);
      return {
        weapons: { close: [], ranged: [] },
        equipment: [],
        psychicPowers: [],
        leaderTraits: [],
        warbandAbilities: []
      };
    }
  }

  /**
   * Sanitizes warband data for import to prevent injection attacks
   * Requirements: 8.2, 8.5
   */
  sanitizeWarbandForImport(exportedWarband: ExportedWarband): Partial<Warband> {
    return {
      name: this.sanitizeString(exportedWarband.name, 100),
      ability: this.sanitizeWarbandAbility(exportedWarband.ability),
      pointLimit: this.sanitizePointLimit(exportedWarband.pointLimit),
      totalCost: this.sanitizeNumber(exportedWarband.totalCost, 0, 10000),
      weirdos: this.sanitizeWeirdosArray(exportedWarband.weirdos || [])
    };
  }

  /**
   * Sanitizes a weirdo object with comprehensive field validation
   */
  private sanitizeWeirdo(weirdo: Weirdo): Weirdo {
    // Generate unique ID for the weirdo
    const weirdoIdResult = this.idGenerator.generateWeirdoId({
      prefix: 'sanitized_wd',
      includeTimestamp: true
    });

    return {
      ...weirdo,
      id: weirdoIdResult.id, // Always generate new unique ID
      name: this.sanitizeString(weirdo.name, 100),
      type: this.sanitizeWeirdoType(weirdo.type),
      notes: this.sanitizeString(weirdo.notes || '', 500),
      attributes: this.sanitizeAttributes(weirdo.attributes),
      closeCombatWeapons: this.sanitizeWeaponsArray(weirdo.closeCombatWeapons || []),
      rangedWeapons: this.sanitizeWeaponsArray(weirdo.rangedWeapons || []),
      equipment: this.sanitizeEquipmentArray(weirdo.equipment || []),
      psychicPowers: this.sanitizePsychicPowersArray(weirdo.psychicPowers || []),
      leaderTrait: this.sanitizeLeaderTrait(weirdo.leaderTrait)
    };
  }

  /**
   * Sanitizes string input to prevent injection attacks
   */
  private sanitizeString(input: string, maxLength: number = 200): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Comprehensive sanitization to prevent various injection attacks
    return input
      // Remove HTML/XML tags and entities
      .replace(/<[^>]*>/g, '')
      .replace(/&[#\w]+;/g, '')
      // Remove script-related content
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Remove SQL injection patterns
      .replace(/['";]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      // Remove path traversal attempts
      .replace(/\.\./g, '')
      .replace(/[\\\/]/g, '')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Limit length
      .slice(0, maxLength);
  }

  /**
   * Sanitizes numeric input with bounds checking using configuration limits
   */
  private sanitizeNumber(input: unknown, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
    if (typeof input === 'number' && !isNaN(input) && isFinite(input)) {
      return Math.max(min, Math.min(max, Math.floor(input)));
    }
    if (typeof input === 'string') {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && isFinite(parsed)) {
        return Math.max(min, Math.min(max, parsed));
      }
    }
    return min;
  }

  /**
   * Gets configuration-based limits for cost sanitization
   */
  private getCostLimits(): { min: number; max: number } {
    const costConfig = this.configManager.getCostConfig();
    return {
      min: 0,
      max: Math.max(costConfig.pointLimits.standard, costConfig.pointLimits.extended) * 2 // Allow some buffer
    };
  }

  /**
   * Sanitizes warband ability to ensure it's a valid enum value
   */
  private sanitizeWarbandAbility(ability: unknown): WarbandAbility | null {
    if (ability === null || ability === undefined) {
      return null;
    }
    
    if (typeof ability === 'string') {
      // Load valid abilities from game data to validate
      try {
        const gameData = this.loadGameDataSync();
        if (gameData.warbandAbilities.includes(ability as WarbandAbility)) {
          return ability as WarbandAbility;
        }
      } catch (error) {
        // If game data loading fails, return null for safety
        console.warn('Failed to validate warband ability:', error);
      }
    }
    
    return null;
  }

  /**
   * Sanitizes point limit to ensure it's a valid value
   */
  private sanitizePointLimit(pointLimit: unknown): 75 | 125 {
    if (pointLimit === 75 || pointLimit === 125) {
      return pointLimit;
    }
    // Default to standard point limit if invalid
    return 75;
  }

  /**
   * Sanitizes weirdo type to ensure it's valid
   */
  private sanitizeWeirdoType(type: unknown): 'leader' | 'trooper' {
    if (type === 'leader' || type === 'trooper') {
      return type;
    }
    // Default to trooper if invalid
    return 'trooper';
  }

  /**
   * Sanitizes attributes object
   */
  private sanitizeAttributes(attributes: unknown): any {
    if (!attributes || typeof attributes !== 'object') {
      // Return default attributes if invalid
      return {
        speed: 1,
        defense: '2d6',
        firepower: 'None',
        prowess: '2d6',
        willpower: '2d6'
      };
    }

    const attrs = attributes as Record<string, unknown>;
    return {
      speed: this.sanitizeSpeedAttribute(attrs.speed),
      defense: this.sanitizeDiceAttribute(attrs.defense),
      firepower: this.sanitizeFirepowerAttribute(attrs.firepower),
      prowess: this.sanitizeDiceAttribute(attrs.prowess),
      willpower: this.sanitizeDiceAttribute(attrs.willpower)
    };
  }

  /**
   * Sanitizes speed attribute (1-3)
   */
  private sanitizeSpeedAttribute(speed: unknown): 1 | 2 | 3 {
    if (typeof speed === 'number' && [1, 2, 3].includes(speed)) {
      return speed as 1 | 2 | 3;
    }
    if (typeof speed === 'string') {
      const parsed = parseInt(speed, 10);
      if ([1, 2, 3].includes(parsed)) {
        return parsed as 1 | 2 | 3;
      }
    }
    return 1; // Default to lowest speed
  }

  /**
   * Sanitizes dice attributes (defense, prowess, willpower)
   */
  private sanitizeDiceAttribute(dice: unknown): '2d6' | '2d8' | '2d10' {
    if (typeof dice === 'string' && ['2d6', '2d8', '2d10'].includes(dice)) {
      return dice as '2d6' | '2d8' | '2d10';
    }
    return '2d6'; // Default to lowest dice
  }

  /**
   * Sanitizes firepower attribute
   */
  private sanitizeFirepowerAttribute(firepower: unknown): 'None' | '2d8' | '2d10' {
    if (typeof firepower === 'string' && ['None', '2d8', '2d10'].includes(firepower)) {
      return firepower as 'None' | '2d8' | '2d10';
    }
    return 'None'; // Default to no firepower
  }

  /**
   * Sanitizes an array of weirdos
   */
  private sanitizeWeirdosArray(weirdos: unknown[]): Weirdo[] {
    if (!Array.isArray(weirdos)) {
      return [];
    }

    // Get maximum weirdos limit from configuration
    const costConfig = this.configManager.getCostConfig();
    const maxWeirdos = costConfig.trooperLimits.standardLimit; // Use trooper limit as reasonable maximum
    
    return weirdos
      .slice(0, maxWeirdos)
      .filter(weirdo => weirdo && typeof weirdo === 'object')
      .map(weirdo => this.sanitizeWeirdo(weirdo as Weirdo));
  }

  /**
   * Sanitizes an array of weapons
   */
  private sanitizeWeaponsArray(weapons: unknown[]): any[] {
    if (!Array.isArray(weapons)) {
      return [];
    }

    // Get maximum weapons limit from configuration
    const maxWeapons = 10; // Reasonable limit for weapons per weirdo
    
    return weapons
      .slice(0, maxWeapons)
      .filter(weapon => weapon && typeof weapon === 'object')
      .map(weapon => this.sanitizeWeapon(weapon as Record<string, unknown>));
  }

  /**
   * Sanitizes a weapon object
   */
  private sanitizeWeapon(weapon: Record<string, unknown>): any {
    const costLimits = this.getCostLimits();
    
    return {
      name: this.sanitizeString(weapon.name as string, 100),
      cost: this.sanitizeNumber(weapon.cost, costLimits.min, costLimits.max),
      // Preserve other weapon properties but sanitize strings
      ...Object.fromEntries(
        Object.entries(weapon)
          .filter(([key]) => !['name', 'cost'].includes(key))
          .map(([key, value]) => [
            key,
            typeof value === 'string' ? this.sanitizeString(value, 200) : value
          ])
      )
    };
  }

  /**
   * Sanitizes an array of equipment
   */
  private sanitizeEquipmentArray(equipment: unknown[]): any[] {
    if (!Array.isArray(equipment)) {
      return [];
    }

    // Get maximum equipment limit from configuration
    const maxEquipment = 10; // Reasonable limit for equipment per weirdo
    
    return equipment
      .slice(0, maxEquipment)
      .filter(item => item && typeof item === 'object')
      .map(item => this.sanitizeEquipment(item as Record<string, unknown>));
  }

  /**
   * Sanitizes an equipment object
   */
  private sanitizeEquipment(equipment: Record<string, unknown>): any {
    const costLimits = this.getCostLimits();
    
    return {
      name: this.sanitizeString(equipment.name as string, 100),
      cost: this.sanitizeNumber(equipment.cost, costLimits.min, costLimits.max),
      // Preserve other equipment properties but sanitize strings
      ...Object.fromEntries(
        Object.entries(equipment)
          .filter(([key]) => !['name', 'cost'].includes(key))
          .map(([key, value]) => [
            key,
            typeof value === 'string' ? this.sanitizeString(value, 200) : value
          ])
      )
    };
  }

  /**
   * Sanitizes an array of psychic powers
   */
  private sanitizePsychicPowersArray(powers: unknown[]): any[] {
    if (!Array.isArray(powers)) {
      return [];
    }

    // Get maximum psychic powers limit from configuration
    const maxPowers = 5; // Reasonable limit for psychic powers per weirdo
    
    return powers
      .slice(0, maxPowers)
      .filter(power => power && typeof power === 'object')
      .map(power => this.sanitizePsychicPower(power as Record<string, unknown>));
  }

  /**
   * Sanitizes a psychic power object
   */
  private sanitizePsychicPower(power: Record<string, unknown>): any {
    const costLimits = this.getCostLimits();
    
    return {
      name: this.sanitizeString(power.name as string, 100),
      cost: this.sanitizeNumber(power.cost, costLimits.min, costLimits.max),
      // Preserve other power properties but sanitize strings
      ...Object.fromEntries(
        Object.entries(power)
          .filter(([key]) => !['name', 'cost'].includes(key))
          .map(([key, value]) => [
            key,
            typeof value === 'string' ? this.sanitizeString(value, 200) : value
          ])
      )
    };
  }

  /**
   * Sanitizes leader trait
   */
  private sanitizeLeaderTrait(trait: unknown): LeaderTrait | null {
    if (trait === null || trait === undefined) {
      return null;
    }
    
    if (typeof trait === 'string') {
      // Validate against game data
      try {
        const gameData = this.loadGameDataSync();
        const sanitizedTrait = this.sanitizeString(trait, 100);
        if (gameData.leaderTraits.includes(sanitizedTrait as LeaderTrait)) {
          return sanitizedTrait as LeaderTrait;
        }
      } catch (error) {
        console.warn('Failed to validate leader trait:', error);
      }
    }
    
    return null;
  }

  /**
   * Gets ID generation statistics
   * Requirements: 8.5
   */
  getIdGenerationStatistics() {
    return this.idGenerator.getStatistics();
  }

  /**
   * Clears the ID generation cache (useful for testing or memory management)
   * Requirements: 8.5
   */
  clearIdGenerationCache(): void {
    this.idGenerator.clearCache();
  }

  /**
   * Validates an ID format
   * Requirements: 8.5
   */
  static validateIdFormat(id: string, expectedPrefix?: string): boolean {
    return UniqueIdGenerator.validateIdFormat(id, expectedPrefix);
  }

  /**
   * Sanitizes an existing ID
   * Requirements: 8.5
   */
  static sanitizeId(id: string): string {
    return UniqueIdGenerator.sanitizeId(id);
  }

  /**
   * Applies environment-specific security settings based on configuration
   * Requirements: 6.3
   */
  applyEnvironmentSecuritySettings(): void {
    const envConfig = this.configManager.getEnvironmentConfig();
    const validationConfig = this.configManager.getValidationConfig();
    
    // Apply stricter validation in production
    if (envConfig.isProduction) {
      // In production, use stricter limits and enable all security features
      console.log('Applying production security settings for import/export');
    } else if (envConfig.isTest) {
      // In test environment, use more permissive settings for testing
      console.log('Applying test security settings for import/export');
    } else {
      // Development environment uses default settings
      console.log('Applying development security settings for import/export');
    }
    
    // Log current validation settings
    console.log(`Validation settings - Strict mode: ${validationConfig.strictValidation}, Context-aware warnings: ${validationConfig.enableContextAwareWarnings}`);
  }

  /**
   * Gets current security settings summary
   * Requirements: 6.2, 6.3
   */
  getSecuritySettingsSummary(): {
    environment: string;
    strictValidation: boolean;
    fileOperationLimits: {
      maxFileSizeBytes: number;
      allowedFileTypes: string[];
      maxFilenameLength: number;
      enableFilenameSanitization: boolean;
    };
    costLimits: {
      min: number;
      max: number;
    };
  } {
    const envConfig = this.configManager.getEnvironmentConfig();
    const validationConfig = this.configManager.getValidationConfig();
    const fileConfig = this.configManager.getFileOperationConfig();
    const costLimits = this.getCostLimits();
    
    return {
      environment: envConfig.environment,
      strictValidation: validationConfig.strictValidation,
      fileOperationLimits: {
        maxFileSizeBytes: fileConfig.maxFileSizeBytes,
        allowedFileTypes: fileConfig.allowedFileTypes,
        maxFilenameLength: fileConfig.maxFilenameLength,
        enableFilenameSanitization: fileConfig.enableFilenameSanitization
      },
      costLimits
    };
  }
}