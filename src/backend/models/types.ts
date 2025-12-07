// Core type definitions for Space Weirdos Warband Builder

import type { ValidationErrorCode } from '../constants/validationMessages';

export type SpeedLevel = 1 | 2 | 3;
export type DiceLevel = '2d6' | '2d8' | '2d10';
export type FirepowerLevel = 'None' | '2d8' | '2d10';

export type AttributeType = 'speed' | 'defense' | 'firepower' | 'prowess' | 'willpower';
export type AttributeLevel = SpeedLevel | DiceLevel | FirepowerLevel;

export type WarbandAbility = 
  | 'Cyborgs' 
  | 'Fanatics' 
  | 'Living Weapons' 
  | 'Heavily Armed' 
  | 'Mutants' 
  | 'Soldiers' 
  | 'Undead';

export type LeaderTrait = 
  | 'Bounty Hunter' 
  | 'Healer' 
  | 'Majestic' 
  | 'Monstrous' 
  | 'Political Officer' 
  | 'Sorcerer' 
  | 'Tactician';

export interface Attributes {
  speed: SpeedLevel;
  defense: DiceLevel;
  firepower: FirepowerLevel;
  prowess: DiceLevel;
  willpower: DiceLevel;
}

export interface Weapon {
  id: string;
  name: string;
  type: 'close' | 'ranged';
  baseCost: number;
  maxActions: number;
  notes: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'Passive' | 'Action';
  baseCost: number;
  effect: string;
}

export interface PsychicPower {
  id: string;
  name: string;
  type: 'Attack' | 'Effect' | 'Either';
  cost: number;
  effect: string;
}

export interface Weirdo {
  id: string;
  name: string;
  type: 'leader' | 'trooper';
  attributes: Attributes;
  closeCombatWeapons: Weapon[];
  rangedWeapons: Weapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTrait: LeaderTrait | null;
  notes: string;
  totalCost: number;
}

export interface Warband {
  id: string;
  name: string;
  ability: WarbandAbility | null;
  pointLimit: 75 | 125;
  totalCost: number;
  weirdos: Weirdo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: ValidationErrorCode;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface WarbandSummary {
  id: string;
  name: string;
  ability: WarbandAbility | null;
  pointLimit: number;
  totalCost: number;
  weirdoCount: number;
  updatedAt: Date;
}

// Error codes for persistence operations
export enum PersistenceErrorCode {
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

// Custom error class for persistence operations
export class PersistenceError extends Error {
  public readonly code: PersistenceErrorCode;
  public readonly details?: any;

  constructor(message: string, code: PersistenceErrorCode, details?: any) {
    super(message);
    this.name = 'PersistenceError';
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PersistenceError);
    }
  }
}
