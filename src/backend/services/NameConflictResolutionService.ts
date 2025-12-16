/**
 * Name Conflict Resolution Service
 * 
 * Provides functionality for handling warband name conflicts during import operations.
 * Includes unique name generation, name validation, and sanitization.
 * 
 * Requirements: 5.4, 8.5
 */

import { DataRepository } from './DataRepository.js';

/**
 * Name conflict resolution result
 */
export interface NameResolutionResult {
  success: boolean;
  resolvedName?: string;
  error?: string;
  suggestions?: string[];
}

/**
 * Name validation result
 */
export interface NameValidationResult {
  valid: boolean;
  available: boolean;
  sanitized: string;
  errors: string[];
  suggestions: string[];
}

/**
 * Name Conflict Resolution Service
 * 
 * Handles all aspects of warband name conflict resolution including:
 * - Unique name generation with conflict avoidance
 * - Name validation with database checking
 * - Name sanitization for imported warband names
 */
export class NameConflictResolutionService {
  private repository: DataRepository;

  constructor(repository: DataRepository) {
    this.repository = repository;
  }

  /**
   * Generates a unique name by appending a number suffix
   * Requirements: 5.4
   */
  generateUniqueName(baseName: string, existingNames?: string[]): NameResolutionResult {
    try {
      // Sanitize the base name first
      const sanitizedBase = this.sanitizeName(baseName);
      
      if (!sanitizedBase) {
        return {
          success: false,
          error: 'Base name is empty after sanitization',
          suggestions: ['Provide a valid base name with alphanumeric characters']
        };
      }

      // Get existing names from repository if not provided
      const existing = existingNames || this.getAllExistingNames();
      
      // Check if the base name is already unique
      if (!this.isNameTaken(sanitizedBase, existing)) {
        return {
          success: true,
          resolvedName: sanitizedBase
        };
      }

      // Generate unique name with suffix
      const uniqueName = this.generateUniqueNameWithSuffix(sanitizedBase, existing);
      
      return {
        success: true,
        resolvedName: uniqueName,
        suggestions: [`Generated unique name: ${uniqueName}`]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during name generation';
      return {
        success: false,
        error: `Name generation failed: ${errorMessage}`,
        suggestions: ['Try a different base name', 'Ensure the base name contains valid characters']
      };
    }
  }

  /**
   * Validates a warband name and checks availability
   * Requirements: 5.4
   */
  validateName(name: string): NameValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Sanitize the name
    const sanitized = this.sanitizeName(name);

    // Check if name is empty after sanitization
    if (!sanitized) {
      errors.push('Name is empty or contains only invalid characters');
      suggestions.push('Use alphanumeric characters, spaces, hyphens, and underscores');
      return {
        valid: false,
        available: false,
        sanitized: '',
        errors,
        suggestions
      };
    }

    // Check length constraints
    if (sanitized.length < 1) {
      errors.push('Name is too short');
      suggestions.push('Name must be at least 1 character long');
    }

    if (sanitized.length > 50) {
      errors.push('Name is too long');
      suggestions.push('Name must be 50 characters or less');
    }

    // Check for reserved names or patterns
    if (this.isReservedName(sanitized)) {
      errors.push('Name uses reserved words');
      suggestions.push('Choose a different name that doesn\'t use reserved words');
    }

    // Check availability in database
    const existing = this.getAllExistingNames();
    const available = !this.isNameTaken(sanitized, existing);

    if (!available) {
      errors.push('Name is already taken');
      suggestions.push('Choose a different name or use the unique name generator');
    }

    const valid = errors.length === 0;

    return {
      valid,
      available,
      sanitized,
      errors,
      suggestions
    };
  }

  /**
   * Sanitizes a warband name for safe storage and display
   * Requirements: 8.5
   */
  sanitizeName(name: string): string {
    if (typeof name !== 'string') {
      return '';
    }

    return name
      // Remove potentially dangerous characters
      .replace(/[<>]/g, '') // Remove HTML-like characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/[^\w\s\-_]/g, '') // Keep only alphanumeric, spaces, hyphens, underscores
      // Normalize whitespace
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim() // Remove leading/trailing whitespace
      // Limit length
      .slice(0, 50); // Reasonable length limit
  }

  /**
   * Checks if a name conflicts with existing warbands
   */
  checkNameConflict(name: string): boolean {
    const existing = this.getAllExistingNames();
    return this.isNameTaken(name, existing);
  }

  /**
   * Resolves a name conflict by generating alternatives
   */
  resolveNameConflict(conflictingName: string): NameResolutionResult {
    const sanitized = this.sanitizeName(conflictingName);
    
    if (!sanitized) {
      return {
        success: false,
        error: 'Name cannot be sanitized to a valid format',
        suggestions: ['Provide a name with valid characters']
      };
    }

    return this.generateUniqueName(sanitized);
  }

  /**
   * Gets all existing warband names from the repository
   */
  private getAllExistingNames(): string[] {
    try {
      const warbands = this.repository.loadAllWarbands();
      return warbands.map(w => w.name.toLowerCase()); // Case-insensitive comparison
    } catch (error) {
      console.warn('Failed to load existing warband names:', error);
      return [];
    }
  }

  /**
   * Checks if a name is already taken (case-insensitive)
   */
  private isNameTaken(name: string, existingNames: string[]): boolean {
    const normalizedName = name.toLowerCase();
    return existingNames.some(existing => existing.toLowerCase() === normalizedName);
  }

  /**
   * Generates a unique name by appending a numeric suffix
   */
  private generateUniqueNameWithSuffix(baseName: string, existingNames: string[]): string {
    let counter = 1;
    let candidateName = baseName;

    // Keep trying until we find a unique name
    while (this.isNameTaken(candidateName, existingNames)) {
      counter++;
      candidateName = `${baseName} v${counter}`;
      
      // Safety check to prevent infinite loops
      if (counter > 1000) {
        // Fallback to timestamp-based suffix
        const timestamp = Date.now().toString().slice(-6);
        candidateName = `${baseName} ${timestamp}`;
        break;
      }
    }

    return candidateName;
  }

  /**
   * Checks if a name uses reserved words or patterns
   */
  private isReservedName(name: string): boolean {
    const reservedWords = [
      'admin', 'administrator', 'system', 'root', 'null', 'undefined',
      'default', 'test', 'demo', 'sample', 'example'
    ];

    const normalizedName = name.toLowerCase().trim();
    
    // Check exact matches
    if (reservedWords.includes(normalizedName)) {
      return true;
    }

    // Check if name starts with reserved words
    return reservedWords.some(reserved => normalizedName.startsWith(reserved + ' '));
  }

  /**
   * Suggests alternative names based on the original
   */
  suggestAlternativeNames(originalName: string, count: number = 3): string[] {
    const sanitized = this.sanitizeName(originalName);
    const existing = this.getAllExistingNames();
    const suggestions: string[] = [];

    if (!sanitized) {
      return ['My Warband', 'New Warband', 'Untitled Warband'];
    }

    // Generate numbered variations
    for (let i = 1; i <= count && suggestions.length < count; i++) {
      const candidate = `${sanitized} ${i}`;
      if (!this.isNameTaken(candidate, existing)) {
        suggestions.push(candidate);
      }
    }

    // Generate descriptive variations if we need more
    const descriptors = ['Elite', 'Advanced', 'Special', 'Prime', 'Alpha', 'Beta'];
    for (const descriptor of descriptors) {
      if (suggestions.length >= count) break;
      
      const candidate = `${descriptor} ${sanitized}`;
      if (!this.isNameTaken(candidate, existing)) {
        suggestions.push(candidate);
      }
    }

    // Fallback suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        this.generateUniqueNameWithSuffix(sanitized, existing)
      );
    }

    return suggestions.slice(0, count);
  }
}