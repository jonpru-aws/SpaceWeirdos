import { Warband, ValidationResult, ValidationError, Weirdo, WarbandSummary, PersistenceError, PersistenceErrorCode } from '../models/types.js';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { getValidationMessage } from '../constants/validationMessages.js';
import { CostEngine } from './CostEngine.js';

// Storage file path constant
const STORAGE_PATH = path.join(process.cwd(), 'data', 'warbands.json');

/**
 * Generates a unique identifier using UUID v4.
 * @returns A UUID string
 */
function generateId(): string {
  return randomUUID();
}

/**
 * Returns the current timestamp in ISO 8601 format.
 * @returns ISO 8601 formatted timestamp string
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parses an ISO 8601 timestamp string to a Date object.
 * @param timestamp - ISO 8601 formatted timestamp string
 * @returns Date object
 */
function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * DataRepository provides in-memory storage for warbands with JSON file persistence.
 * Uses a Map for O(1) lookups and automatically persists changes to disk.
 */
export class DataRepository {
  private cache: Map<string, Warband>;
  private filePath: string;
  private persistenceEnabled: boolean;

  constructor(filePath: string = STORAGE_PATH, enablePersistence: boolean = true) {
    this.cache = new Map();
    this.filePath = filePath;
    this.persistenceEnabled = enablePersistence;
  }

  /**
   * Type guard to check if an error is a Node.js error with a code property.
   * @param error - The error to check
   * @returns True if the error is a Node.js error with a code property
   */
  private isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error;
  }

  /**
   * Validates a warband object to ensure all required fields are present and valid.
   * 
   * @param warband - The warband to validate
   * @returns ValidationResult with valid flag and array of errors
   */
  validateWarband(warband: Warband): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate required fields: name
    if (!warband.name || warband.name.trim() === '') {
      errors.push({
        field: 'name',
        message: getValidationMessage('WARBAND_NAME_REQUIRED'),
        code: 'WARBAND_NAME_REQUIRED'
      });
    }

    // Validate ability field exists (can be null, but must be present)
    if (warband.ability === undefined) {
      errors.push({
        field: 'ability',
        message: 'Warband ability field is required',
        code: 'WARBAND_NAME_REQUIRED' // Using closest available code
      });
    }

    // Validate point limit is 75 or 125
    if (warband.pointLimit !== 75 && warband.pointLimit !== 125) {
      errors.push({
        field: 'pointLimit',
        message: getValidationMessage('INVALID_POINT_LIMIT'),
        code: 'INVALID_POINT_LIMIT'
      });
    }

    // Validate all weirdos have required fields
    if (warband.weirdos && Array.isArray(warband.weirdos)) {
      warband.weirdos.forEach((weirdo: Weirdo, index: number) => {
        const weirdoErrors = this.validateWeirdo(weirdo, index);
        errors.push(...weirdoErrors);
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a weirdo object to ensure all required fields are present.
   * 
   * @param weirdo - The weirdo to validate
   * @param index - The index of the weirdo in the warband (for error reporting)
   * @returns Array of validation errors
   */
  private validateWeirdo(weirdo: Weirdo, index: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate weirdo name
    if (!weirdo.name || weirdo.name.trim() === '') {
      errors.push({
        field: `weirdos[${index}].name`,
        message: getValidationMessage('WEIRDO_NAME_REQUIRED'),
        code: 'WEIRDO_NAME_REQUIRED'
      });
    }

    // Validate weirdo type
    if (!weirdo.type || (weirdo.type !== 'leader' && weirdo.type !== 'trooper')) {
      errors.push({
        field: `weirdos[${index}].type`,
        message: 'Weirdo type must be "leader" or "trooper"',
        code: 'WEIRDO_NAME_REQUIRED' // Using closest available code
      });
    }

    // Validate attributes exist
    if (!weirdo.attributes) {
      errors.push({
        field: `weirdos[${index}].attributes`,
        message: getValidationMessage('ATTRIBUTES_INCOMPLETE'),
        code: 'ATTRIBUTES_INCOMPLETE'
      });
    } else {
      // Validate all five attributes are present
      const requiredAttributes = ['speed', 'defense', 'firepower', 'prowess', 'willpower'];
      for (const attr of requiredAttributes) {
        if (!(attr in weirdo.attributes)) {
          errors.push({
            field: `weirdos[${index}].attributes.${attr}`,
            message: getValidationMessage('ATTRIBUTES_INCOMPLETE'),
            code: 'ATTRIBUTES_INCOMPLETE'
          });
        }
      }
    }

    return errors;
  }

  /**
   * Saves a warband to in-memory storage and triggers async file persistence.
   * Generates a unique ID if the warband doesn't have one.
   * Updates the updatedAt timestamp and sets createdAt for new warbands.
   * 
   * @param warband - The warband to save
   * @returns The saved warband with generated/updated ID and timestamps
   * @throws {PersistenceError} If warband validation fails
   */
  saveWarband(warband: Warband): Warband {
    // Validate warband before saving
    const validation = this.validateWarband(warband);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new PersistenceError(
        `Warband validation failed: ${errorMessages}`,
        PersistenceErrorCode.VALIDATION_ERROR,
        { errors: validation.errors }
      );
    }

    // Generate ID if not present
    if (!warband.id) {
      warband.id = generateId();
    }

    // Update timestamp
    warband.updatedAt = parseTimestamp(getCurrentTimestamp());

    // If this is a new warband, set createdAt
    if (!this.cache.has(warband.id)) {
      warband.createdAt = parseTimestamp(getCurrentTimestamp());
    }

    // Store in memory
    this.cache.set(warband.id, warband);

    // Trigger async persistence (fire and forget)
    if (this.persistenceEnabled) {
      this.persistToFile().catch(err => {
        console.error('Failed to persist warband to file:', err);
      });
    }

    return warband;
  }

  /**
   * Retrieves a warband from in-memory storage by ID.
   * 
   * @param id - The unique identifier of the warband
   * @returns The warband if found, null otherwise
   */
  getWarband(id: string): Warband | null {
    return this.cache.get(id) || null;
  }

  /**
   * Loads a warband from in-memory storage by ID.
   * @deprecated Use getWarband() instead
   * 
   * @param id - The unique identifier of the warband
   * @returns The warband if found, null otherwise
   */
  loadWarband(id: string): Warband | null {
    return this.getWarband(id);
  }

  /**
   * Returns all warbands from in-memory storage as summary objects.
   * Computes WarbandSummary for each warband including totalCost and weirdoCount.
   * 
   * @returns Array of warband summaries (empty array if none exist)
   */
  getAllWarbands(): WarbandSummary[] {
    const costEngine = new CostEngine();
    const summaries: WarbandSummary[] = [];

    for (const warband of this.cache.values()) {
      const totalCost = costEngine.calculateWarbandCost(warband);
      const weirdoCount = warband.weirdos.length;

      summaries.push({
        id: warband.id,
        name: warband.name,
        ability: warband.ability,
        pointLimit: warband.pointLimit,
        totalCost,
        weirdoCount,
        updatedAt: warband.updatedAt
      });
    }

    return summaries;
  }

  /**
   * Returns all warbands from in-memory storage as an array.
   * @deprecated Use getAllWarbands() instead for summary data
   * 
   * @returns Array of all warbands (empty array if none exist)
   */
  loadAllWarbands(): Warband[] {
    return Array.from(this.cache.values());
  }

  /**
   * Deletes a warband from in-memory storage and triggers async file persistence.
   * 
   * @param id - The unique identifier of the warband to delete
   * @returns True if the warband was deleted, false if it didn't exist
   */
  deleteWarband(id: string): boolean {
    const existed = this.cache.delete(id);

    // Trigger async persistence if deletion was successful
    if (existed && this.persistenceEnabled) {
      this.persistToFile().catch(err => {
        console.error('Failed to persist after deletion:', err);
      });
    }

    return existed;
  }

  /**
   * Serializes the in-memory Map to JSON and writes to file.
   * Creates the directory if it doesn't exist.
   * This is called automatically after save/delete operations.
   * 
   * @returns Promise that resolves when file write is complete
   * @throws {PersistenceError} If file write fails
   */
  async persistToFile(): Promise<void> {
    try {
      // Convert Map to array of warbands
      const warbandsArray = Array.from(this.cache.values());

      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error: unknown) {
        // Check for permission errors using type guard
        if (this.isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
          throw new PersistenceError(
            `Permission denied: Cannot create directory ${dir}`,
            PersistenceErrorCode.PERMISSION_ERROR,
            { path: dir, originalError: error.message }
          );
        }
        throw error;
      }

      // Write to file with pretty formatting
      try {
        await fs.writeFile(
          this.filePath,
          JSON.stringify(warbandsArray, null, 2),
          'utf-8'
        );
      } catch (error: unknown) {
        // Check for permission errors using type guard
        if (this.isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
          throw new PersistenceError(
            `Permission denied: Cannot write to file ${this.filePath}`,
            PersistenceErrorCode.PERMISSION_ERROR,
            { path: this.filePath, originalError: error.message }
          );
        }
        // Other file write errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new PersistenceError(
          `Failed to write warband data to file: ${errorMessage}`,
          PersistenceErrorCode.FILE_WRITE_ERROR,
          { path: this.filePath, originalError: errorMessage }
        );
      }
    } catch (error: unknown) {
      // Re-throw PersistenceErrors as-is
      if (error instanceof PersistenceError) {
        throw error;
      }
      // Wrap unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new PersistenceError(
        `Unexpected error during file persistence: ${errorMessage}`,
        PersistenceErrorCode.FILE_WRITE_ERROR,
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Initializes the repository by loading data from file into memory.
   * Creates the storage directory and file if they don't exist.
   * Should be called on application startup.
   * 
   * @returns Promise that resolves when initialization is complete
   * @throws {PersistenceError} If initialization fails
   */
  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error: unknown) {
        // Check for permission errors using type guard
        if (this.isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
          throw new PersistenceError(
            `Permission denied: Cannot create directory ${dir}`,
            PersistenceErrorCode.PERMISSION_ERROR,
            { path: dir, originalError: error.message }
          );
        }
        throw error;
      }

      try {
        // Try to read existing file
        const data = await fs.readFile(this.filePath, 'utf-8');
        
        // Parse JSON with error handling
        let warbandsArray: Warband[];
        try {
          warbandsArray = JSON.parse(data);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown parse error';
          throw new PersistenceError(
            `Failed to parse warband data: File contains invalid JSON`,
            PersistenceErrorCode.JSON_PARSE_ERROR,
            { path: this.filePath, originalError: errorMessage }
          );
        }

        // Clear existing data
        this.cache.clear();

        // Populate cache
        for (const warband of warbandsArray) {
          // Convert date strings back to Date objects
          // Type assertion needed: JSON.parse returns dates as strings, not Date objects
          // Safe because parseTimestamp accepts string and returns Date
          warband.createdAt = parseTimestamp(warband.createdAt as any);
          warband.updatedAt = parseTimestamp(warband.updatedAt as any);
          
          this.cache.set(warband.id, warband);
        }
      } catch (error: unknown) {
        // If file doesn't exist, create an empty one
        if (this.isNodeError(error) && error.code === 'ENOENT') {
          await this.persistToFile();
        } else if (this.isNodeError(error) && (error.code === 'EACCES' || error.code === 'EPERM')) {
          // Permission error reading file
          throw new PersistenceError(
            `Permission denied: Cannot read file ${this.filePath}`,
            PersistenceErrorCode.PERMISSION_ERROR,
            { path: this.filePath, originalError: error.message }
          );
        } else if (error instanceof PersistenceError) {
          // Re-throw PersistenceErrors (like JSON parse errors)
          throw error;
        } else {
          // Other file read errors
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new PersistenceError(
            `Failed to read warband data from file: ${errorMessage}`,
            PersistenceErrorCode.FILE_READ_ERROR,
            { path: this.filePath, originalError: errorMessage }
          );
        }
      }
    } catch (error: unknown) {
      // Re-throw PersistenceErrors as-is
      if (error instanceof PersistenceError) {
        throw error;
      }
      // Wrap unexpected errors with type guard
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new PersistenceError(
        `Unexpected error during initialization: ${errorMessage}`,
        PersistenceErrorCode.FILE_READ_ERROR,
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Reads JSON file and populates the in-memory Map.
   * Should be called on server startup to restore persisted data.
   * Creates an empty file if it doesn't exist.
   * 
   * @returns Promise that resolves when file read and parsing is complete
   * @throws {Error} If file read fails (except ENOENT which creates new file)
   * @deprecated Use initialize() instead
   */
  async loadFromFile(): Promise<void> {
    await this.initialize();
  }

  /**
   * Checks if a warband exists in the repository.
   * 
   * @param id - The unique identifier of the warband
   * @returns True if the warband exists, false otherwise
   */
  warbandExists(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Clears all warbands from in-memory storage.
   * Useful for testing and resetting state. Does not affect persisted file.
   */
  clear(): void {
    this.cache.clear();
  }
}
