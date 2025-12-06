import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Weirdo,
  WarbandAbility,
  Attributes,
  Weapon,
  Equipment,
  PsychicPower,
  LeaderTrait,
  ValidationError,
  SpeedLevel,
  DiceLevel,
  FirepowerLevel
} from '../../backend/models/types';
import { apiClient } from '../services/apiClient';
import { useGameData } from '../contexts/GameDataContext';
import { WeirdoBasicInfo } from './WeirdoBasicInfo';
import { WeirdoCostDisplay } from './WeirdoCostDisplay';
import { AttributeSelector } from './AttributeSelector';
import { WeaponSelector } from './WeaponSelector';
import { EquipmentSelector } from './EquipmentSelector';
import { PsychicPowerSelector } from './PsychicPowerSelector';
import { LeaderTraitSelector } from './LeaderTraitSelector';
import { ValidationErrorDisplay } from './common/ValidationErrorDisplay';
import './WeirdoEditor.css';

/**
 * WeirdoEditorComponent
 * 
 * Handles creation and editing of individual weirdos (leader or trooper).
 * Provides real-time cost calculations and validation.
 * Refactored into sub-components for better maintainability.
 * 
 * Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1, 6.2, 6.3, 7.1-7.7, 9.4, 15.1, 15.2, 15.3, 15.4
 */

interface WeirdoEditorProps {
  weirdo: Weirdo;
  warbandAbility: WarbandAbility | null;
  onChange: (weirdo: Weirdo) => void;
  onClose?: () => void;
  allWeirdos?: Weirdo[]; // All weirdos in the warband for validation
}

export function WeirdoEditor({ weirdo, warbandAbility, onChange, onClose, allWeirdos = [] }: WeirdoEditorProps) {
  const [localWeirdo, setLocalWeirdo] = useState<Weirdo>(weirdo);
  const [pointCost, setPointCost] = useState<number>(weirdo.totalCost);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Use GameDataContext instead of loading data locally
  const { data: gameData, loading: gameDataLoading, error: gameDataError } = useGameData();
  
  // Extract game data from context (memoized)
  // Requirements: 9.1 - useMemo for expensive calculations
  const availableCloseCombatWeapons = useMemo(() => gameData?.closeCombatWeapons || [], [gameData?.closeCombatWeapons]);
  const availableRangedWeapons = useMemo(() => gameData?.rangedWeapons || [], [gameData?.rangedWeapons]);
  const availableEquipment = useMemo(() => gameData?.equipment || [], [gameData?.equipment]);
  const availablePsychicPowers = useMemo(() => gameData?.psychicPowers || [], [gameData?.psychicPowers]);
  
  // Build leader trait descriptions map from context data (memoized)
  // Requirements: 9.1 - useMemo for expensive calculations
  const leaderTraitDescriptions = useMemo(() => {
    const descriptions: Record<string, string> = {};
    if (gameData?.leaderTraits) {
      gameData.leaderTraits.forEach((trait) => {
        descriptions[trait.name] = trait.description;
      });
    }
    return descriptions;
  }, [gameData?.leaderTraits]);

  /**
   * Sync local weirdo with prop changes and recalculate cost if needed
   */
  useEffect(() => {
    setLocalWeirdo(weirdo);
    setPointCost(weirdo.totalCost);
    
    // If cost is 0 and weirdo has attributes, recalculate
    if (weirdo.totalCost === 0 && weirdo.attributes) {
      recalculateCost(weirdo);
    }
  }, [weirdo]);

  /**
   * Recalculate cost when weirdo changes
   * Requirements: 15.1, 15.2, 9.2 - useCallback for callbacks
   */
  const recalculateCost = useCallback(async (updatedWeirdo: Weirdo) => {
    try {
      console.log('Recalculating cost for weirdo:', {
        id: updatedWeirdo.id,
        name: updatedWeirdo.name,
        type: updatedWeirdo.type,
        hasAttributes: !!updatedWeirdo.attributes,
        warbandAbility
      });

      const result = await apiClient.calculateCost({
        weirdo: updatedWeirdo,
        warbandAbility: warbandAbility || undefined
      });
      setPointCost(result.cost);
      
      // Update weirdo with new cost
      const weirdoWithCost = { ...updatedWeirdo, totalCost: result.cost };
      setLocalWeirdo(weirdoWithCost);
      onChange(weirdoWithCost);

      // Validate the weirdo
      // Requirements: 2.1, 2.2, 2.3 - Display validation errors
      try {
        const validationResult = await apiClient.validate({
          weirdo: weirdoWithCost
        });
        
        if (!validationResult.valid && validationResult.errors) {
          setValidationErrors(validationResult.errors);
        } else {
          setValidationErrors([]);
        }
      } catch (validationError) {
        console.error('Failed to validate weirdo:', validationError);
        // Don't block the UI if validation fails
        setValidationErrors([]);
      }
    } catch (error) {
      console.error('Failed to recalculate cost:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  }, [warbandAbility, onChange]);

  /**
   * Handle attribute change
   * Requirements: 2.1, 2.2, 7.2, 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleAttributeChange = useCallback((attribute: keyof Attributes, level: SpeedLevel | DiceLevel | FirepowerLevel) => {
    const updatedWeirdo = {
      ...localWeirdo,
      attributes: {
        ...localWeirdo.attributes,
        [attribute]: level
      }
    };
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, recalculateCost]);

  /**
   * Handle adding a weapon
   * Requirements: 3.1, 3.2, 3.3, 7.3, 7.4, 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleAddWeapon = useCallback((weapon: Weapon, weaponType: 'close' | 'ranged') => {
    const updatedWeirdo = { ...localWeirdo };
    
    if (weaponType === 'close') {
      updatedWeirdo.closeCombatWeapons = [...updatedWeirdo.closeCombatWeapons, weapon];
    } else {
      updatedWeirdo.rangedWeapons = [...updatedWeirdo.rangedWeapons, weapon];
    }
    
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, recalculateCost]);

  /**
   * Handle removing a weapon
   * Requirements: 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleRemoveWeapon = useCallback((weaponId: string, weaponType: 'close' | 'ranged') => {
    const updatedWeirdo = { ...localWeirdo };
    
    if (weaponType === 'close') {
      updatedWeirdo.closeCombatWeapons = updatedWeirdo.closeCombatWeapons.filter(w => w.id !== weaponId);
    } else {
      updatedWeirdo.rangedWeapons = updatedWeirdo.rangedWeapons.filter(w => w.id !== weaponId);
    }
    
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, recalculateCost]);

  /**
   * Get maximum equipment allowed (memoized)
   * Requirements: 4.1, 4.2, 4.4, 7.5, 7.6, 9.1 - useMemo for expensive calculations
   */
  const maxEquipment = useMemo((): number => {
    if (localWeirdo.type === 'leader') {
      return warbandAbility === 'Cyborgs' ? 3 : 2;
    } else {
      return warbandAbility === 'Cyborgs' ? 2 : 1;
    }
  }, [localWeirdo.type, warbandAbility]);

  /**
   * Handle adding equipment
   * Requirements: 4.1, 4.2, 4.4, 7.5, 7.6, 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleAddEquipment = useCallback((equipment: Equipment) => {
    // Check equipment limit
    if (localWeirdo.equipment.length >= maxEquipment) {
      return; // Silently reject if at limit
    }

    const updatedWeirdo = {
      ...localWeirdo,
      equipment: [...localWeirdo.equipment, equipment]
    };
    
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, maxEquipment, recalculateCost]);

  /**
   * Handle removing equipment
   * Requirements: 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleRemoveEquipment = useCallback((equipmentId: string) => {
    const updatedWeirdo = {
      ...localWeirdo,
      equipment: localWeirdo.equipment.filter(e => e.id !== equipmentId)
    };
    
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, recalculateCost]);

  /**
   * Handle adding psychic power
   * Requirements: 5.1, 5.2, 5.3, 7.7, 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleAddPsychicPower = useCallback((power: PsychicPower) => {
    const updatedWeirdo = {
      ...localWeirdo,
      psychicPowers: [...localWeirdo.psychicPowers, power]
    };
    
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, recalculateCost]);

  /**
   * Handle removing psychic power
   * Requirements: 15.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleRemovePsychicPower = useCallback((powerId: string) => {
    const updatedWeirdo = {
      ...localWeirdo,
      psychicPowers: localWeirdo.psychicPowers.filter(p => p.id !== powerId)
    };
    
    recalculateCost(updatedWeirdo);
  }, [localWeirdo, recalculateCost]);

  /**
   * Handle leader trait change
   * Requirements: 6.1, 6.2, 6.3, 9.2 - useCallback for callbacks passed to child components
   */
  const handleLeaderTraitChange = useCallback((trait: LeaderTrait | null) => {
    if (localWeirdo.type !== 'leader') {
      return; // Only leaders can have traits
    }

    const updatedWeirdo = {
      ...localWeirdo,
      leaderTrait: trait
    };
    
    setLocalWeirdo(updatedWeirdo);
    onChange(updatedWeirdo);
  }, [localWeirdo, onChange]);

  /**
   * Handle name change
   * Requirements: 2.1, 7.1, 9.2 - useCallback for callbacks passed to child components
   */
  const handleNameChange = useCallback((name: string) => {
    const updatedWeirdo = {
      ...localWeirdo,
      name
    };
    
    setLocalWeirdo(updatedWeirdo);
    onChange(updatedWeirdo);
  }, [localWeirdo, onChange]);

  /**
   * Handle notes change
   * Requirements: 9.2 - useCallback for callbacks passed to child components
   */
  const handleNotesChange = useCallback((notes: string) => {
    const updatedWeirdo = {
      ...localWeirdo,
      notes
    };
    
    setLocalWeirdo(updatedWeirdo);
    onChange(updatedWeirdo);
  }, [localWeirdo, onChange]);

  /**
   * Check if weirdo is approaching point limit (memoized)
   * Requirements: 15.4, 9.1, 14.1 - useMemo for expensive calculations
   */
  const isApproachingLimit = useMemo((): boolean => {
    // Requirements: 14.1 - Display "Approaching limit" for 18-20 points
    return pointCost >= 18 && pointCost <= 20;
  }, [pointCost]);

  /**
   * Check if another weirdo in the warband is already in the 21-25 point range (memoized)
   * Requirements: 9.2, 9.3, 9.1 - useMemo for expensive calculations
   */
  const hasOther21To25Weirdo = useMemo((): boolean => {
    if (!allWeirdos || allWeirdos.length === 0) return false;
    return allWeirdos.some(w => {
      if (w.id === localWeirdo.id) return false; // Don't count current weirdo
      return w.totalCost >= 21 && w.totalCost <= 25;
    });
  }, [allWeirdos, localWeirdo.id]);

  /**
   * Check if weirdo exceeds point limit (memoized)
   * Requirements: 9.4, 9.2, 9.3, 9.1, 3.2 - useMemo for expensive calculations
   */
  const exceedsLimit = useMemo((): boolean => {
    // Requirements: 3.2 - Display "Exceeds 20 point limit" for cost > 20
    // If there's already another weirdo in 21-25 range, this one must be <= 20
    if (hasOther21To25Weirdo && pointCost > 20) {
      return true;
    }
    
    // Standard limit for troopers is 20 points (can go up to 25 if no other 21-25 weirdo)
    return pointCost > 20;
  }, [hasOther21To25Weirdo, pointCost]);
  
  // Use memoized validation states
  const approaching = isApproachingLimit;
  const exceeds = exceedsLimit;
  const hasOther21To25 = hasOther21To25Weirdo;

  // Show loading state while game data is loading
  if (gameDataLoading) {
    return (
      <div className="weirdo-editor">
        <div className="loading" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <span>Loading game data...</span>
        </div>
      </div>
    );
  }

  // Show error state if game data failed to load
  if (gameDataError) {
    return (
      <div className="weirdo-editor">
        <div className="error" role="alert" aria-live="assertive">
          Failed to load game data: {gameDataError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="weirdo-editor">
      <div className="editor-header">
        <h2>
          {localWeirdo.type === 'leader' ? '👑 ' : '⚔ '}
          Edit {localWeirdo.type === 'leader' ? 'Leader' : 'Trooper'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        )}
      </div>

      <WeirdoCostDisplay
        pointCost={pointCost}
        weirdoType={localWeirdo.type}
        hasOther21To25={hasOther21To25}
        isApproaching={approaching}
        exceedsLimit={exceeds}
      />

      <WeirdoBasicInfo
        name={localWeirdo.name}
        type={localWeirdo.type}
        onNameChange={handleNameChange}
        validationErrors={validationErrors}
      />

      <AttributeSelector
        attributes={localWeirdo.attributes}
        warbandAbility={warbandAbility}
        onAttributeChange={handleAttributeChange}
      />

      <WeaponSelector
        closeCombatWeapons={localWeirdo.closeCombatWeapons}
        rangedWeapons={localWeirdo.rangedWeapons}
        availableCloseCombatWeapons={availableCloseCombatWeapons}
        availableRangedWeapons={availableRangedWeapons}
        firepower={localWeirdo.attributes.firepower}
        warbandAbility={warbandAbility}
        onAddWeapon={handleAddWeapon}
        onRemoveWeapon={handleRemoveWeapon}
      />

      <EquipmentSelector
        equipment={localWeirdo.equipment}
        availableEquipment={availableEquipment}
        maxEquipment={maxEquipment}
        warbandAbility={warbandAbility}
        onAddEquipment={handleAddEquipment}
        onRemoveEquipment={handleRemoveEquipment}
      />

      <PsychicPowerSelector
        psychicPowers={localWeirdo.psychicPowers}
        availablePsychicPowers={availablePsychicPowers}
        onAddPsychicPower={handleAddPsychicPower}
        onRemovePsychicPower={handleRemovePsychicPower}
      />

      {localWeirdo.type === 'leader' && (
        <LeaderTraitSelector
          leaderTrait={localWeirdo.leaderTrait}
          leaderTraitDescriptions={leaderTraitDescriptions}
          onLeaderTraitChange={handleLeaderTraitChange}
        />
      )}

      {/* Notes */}
      <div className="form-section">
        <h3>Notes</h3>
        <div className="form-group">
          <label htmlFor="weirdo-notes">Notes (Optional)</label>
          <textarea
            id="weirdo-notes"
            value={localWeirdo.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes about this weirdo..."
            rows={3}
          />
        </div>
      </div>

      {/* Validation Errors - Requirements: 2.1, 2.2, 2.3, 2.4 */}
      {validationErrors.length > 0 && (
        <ValidationErrorDisplay 
          errors={validationErrors}
          className="weirdo-validation-errors"
        />
      )}
    </div>
  );
}
