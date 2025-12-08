import { useMemo, useCallback, useEffect } from 'react';
import { useWarband } from '../contexts/WarbandContext';
import { useGameData } from '../contexts/GameDataContext';
import { WeirdoCostDisplay } from './WeirdoCostDisplay';
import { WeirdoBasicInfo } from './WeirdoBasicInfo';
import { AttributeSelector } from './AttributeSelector';
import { WeaponSelector } from './WeaponSelector';
import { EquipmentSelector } from './EquipmentSelector';
import { PsychicPowerSelector } from './PsychicPowerSelector';
import { LeaderTraitSelector } from './LeaderTraitSelector';
import type { Weirdo, SpeedLevel, DiceLevel, FirepowerLevel, Weapon, Equipment, PsychicPower, LeaderTrait } from '../../backend/models/types';
import './WeirdoEditor.css';

/**
 * WeirdoEditor Component
 * 
 * Comprehensive editor for weirdo attributes, weapons, and equipment.
 * Provides sections for basic info, attributes, weapons, equipment, powers, and trait.
 * Implements conditional rendering based on weirdo type and attributes.
 * Optimized with useMemo and useCallback for performance.
 * Uses API for all cost calculations (no direct CostEngine imports).
 * 
 * Requirements: 10.3, 10.4, 12.7, 9.2, 9.6
 */

export function WeirdoEditor() {
  const {
    currentWarband,
    selectedWeirdoId,
    updateWeirdo,
  } = useWarband();

  // Get game data for weapons, equipment, powers, and traits
  const gameData = useGameData();

  // Get selected weirdo - memoized to prevent unnecessary recalculations
  const selectedWeirdo = useMemo(
    () => currentWarband?.weirdos.find((w) => w.id === selectedWeirdoId),
    [currentWarband?.weirdos, selectedWeirdoId]
  );

  // Memoize computed values for performance (must be before early return to follow rules of hooks)
  const isRangedWeaponsDisabled = useMemo(
    () => selectedWeirdo?.attributes.firepower === 'None',
    [selectedWeirdo?.attributes.firepower]
  );

  const isLeader = useMemo(
    () => selectedWeirdo?.type === 'leader',
    [selectedWeirdo?.type]
  );

  const warbandAbility = useMemo(
    () => currentWarband?.ability || null,
    [currentWarband?.ability]
  );

  // Memoize event handlers with useCallback to prevent unnecessary re-renders
  // All hooks must be before the early return to follow rules of hooks
  const handleBasicInfoUpdate = useCallback(
    (updates: Partial<Weirdo>) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, updates);
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleSpeedChange = useCallback(
    (value: SpeedLevel) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, {
          attributes: { ...selectedWeirdo.attributes, speed: value }
        });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleDefenseChange = useCallback(
    (value: DiceLevel) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, {
          attributes: { ...selectedWeirdo.attributes, defense: value }
        });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleFirepowerChange = useCallback(
    (value: FirepowerLevel) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, {
          attributes: { ...selectedWeirdo.attributes, firepower: value }
        });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleProwessChange = useCallback(
    (value: DiceLevel) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, {
          attributes: { ...selectedWeirdo.attributes, prowess: value }
        });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleWillpowerChange = useCallback(
    (value: DiceLevel) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, {
          attributes: { ...selectedWeirdo.attributes, willpower: value }
        });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleCloseCombatWeaponsChange = useCallback(
    (weapons: Weapon[]) => {
      if (selectedWeirdo) {
        // Prevent deselecting "unarmed" when it's the only weapon
        if (weapons.length === 0 || 
            (weapons.length === 1 && weapons[0].id === 'unarmed' && 
             selectedWeirdo.closeCombatWeapons.length > 1)) {
          // If trying to remove all weapons or trying to remove unarmed when it's the only one,
          // ensure unarmed stays selected
          const unarmedWeapon = gameData.closeCombatWeapons.find(w => w.id === 'unarmed');
          if (unarmedWeapon) {
            // Type assertion safe: unarmedWeapon is found from gameData.closeCombatWeapons which contains Weapon objects
            updateWeirdo(selectedWeirdo.id, { closeCombatWeapons: [unarmedWeapon as Weapon] });
            return;
          }
        }
        
        updateWeirdo(selectedWeirdo.id, { closeCombatWeapons: weapons });
      }
    },
    [selectedWeirdo, updateWeirdo, gameData.closeCombatWeapons]
  );

  const handleRangedWeaponsChange = useCallback(
    (weapons: Weapon[]) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, { rangedWeapons: weapons });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleEquipmentChange = useCallback(
    (equipment: Equipment[]) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, { equipment });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handlePsychicPowersChange = useCallback(
    (powers: PsychicPower[]) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, { psychicPowers: powers });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleLeaderTraitChange = useCallback(
    (trait: LeaderTrait | null) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, { leaderTrait: trait });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (selectedWeirdo) {
        updateWeirdo(selectedWeirdo.id, { notes: e.target.value });
      }
    },
    [selectedWeirdo, updateWeirdo]
  );

  // Automatic unarmed selection (Requirements 6.1, 6.2, 6.3, 6.4, 6.6)
  // Monitor close combat weapons and automatically select "unarmed" when array becomes empty
  useEffect(() => {
    if (selectedWeirdo && selectedWeirdo.closeCombatWeapons.length === 0) {
      const unarmedWeapon = gameData.closeCombatWeapons.find(w => w.id === 'unarmed');
      if (unarmedWeapon) {
        // Automatically select unarmed to prevent validation errors
        // Type assertion safe: unarmedWeapon is found from gameData.closeCombatWeapons which contains Weapon objects
        updateWeirdo(selectedWeirdo.id, { closeCombatWeapons: [unarmedWeapon as Weapon] });
      }
    }
  }, [selectedWeirdo, gameData.closeCombatWeapons, updateWeirdo]);

  // Show message when no weirdo is selected (Requirement 10.4)
  if (!selectedWeirdo) {
    return (
      <div className="weirdo-editor" role="region" aria-label="Weirdo editor">
        <div className="weirdo-editor__empty" role="status">
          <p>Select a weirdo from the list to edit, or add a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weirdo-editor" role="region" aria-label="Weirdo editor">
      {/* Sticky cost display (Requirement 6.1, 6.3, 9.2) */}
      <WeirdoCostDisplay
        weirdo={selectedWeirdo}
        warbandAbility={warbandAbility}
      />
      
      {/* Basic info section (Requirement 10.3) */}
      <section className="weirdo-editor__section" aria-labelledby="basic-info-heading">
        <h3 id="basic-info-heading">Basic Information</h3>
        <WeirdoBasicInfo
          weirdo={selectedWeirdo}
          onUpdate={handleBasicInfoUpdate}
        />
      </section>

      {/* Attributes section (Requirement 5.2, 12.1) */}
      <section className="weirdo-editor__section" aria-labelledby="attributes-heading">
        <h3 id="attributes-heading">Attributes</h3>
        <div className="weirdo-editor__attributes">
          {/* Type assertion safe: AttributeSelector accepts union type but handleSpeedChange is specifically for SpeedLevel */}
          <AttributeSelector
            attribute="speed"
            value={selectedWeirdo.attributes.speed}
            // @ts-expect-error - Type assertion safe: onChange handler is correctly typed for SpeedLevel
            onChange={handleSpeedChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
          />
          {/* Type assertion safe: AttributeSelector accepts union type but handleDefenseChange is specifically for DiceLevel */}
          <AttributeSelector
            attribute="defense"
            value={selectedWeirdo.attributes.defense}
            // @ts-expect-error - Type assertion safe: onChange handler is correctly typed for DiceLevel
            onChange={handleDefenseChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
          />
          {/* Type assertion safe: AttributeSelector accepts union type but handleFirepowerChange is specifically for FirepowerLevel */}
          <AttributeSelector
            attribute="firepower"
            value={selectedWeirdo.attributes.firepower}
            // @ts-expect-error - Type assertion safe: onChange handler is correctly typed for FirepowerLevel
            onChange={handleFirepowerChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
          />
          {/* Type assertion safe: AttributeSelector accepts union type but handleProwessChange is specifically for DiceLevel */}
          <AttributeSelector
            attribute="prowess"
            value={selectedWeirdo.attributes.prowess}
            // @ts-expect-error - Type assertion safe: onChange handler is correctly typed for DiceLevel
            onChange={handleProwessChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
          />
          {/* Type assertion safe: AttributeSelector accepts union type but handleWillpowerChange is specifically for DiceLevel */}
          <AttributeSelector
            attribute="willpower"
            value={selectedWeirdo.attributes.willpower}
            // @ts-expect-error - Type assertion safe: onChange handler is correctly typed for DiceLevel
            onChange={handleWillpowerChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
          />
        </div>
      </section>

      {/* Close Combat Weapons section (Requirements 5.3, 5.7, 5.8, 12.2, 9.2) */}
      <section className="weirdo-editor__section" aria-labelledby="close-combat-heading">
        {/* Type assertion safe: gameData.closeCombatWeapons is loaded from API and contains Weapon objects */}
        <WeaponSelector
          type="close-combat"
          selectedWeapons={selectedWeirdo.closeCombatWeapons}
          // @ts-expect-error - Type assertion safe: gameData contains Weapon objects
          availableWeapons={gameData.closeCombatWeapons as Weapon[]}
          warbandAbility={warbandAbility}
          onChange={handleCloseCombatWeaponsChange}
        />
      </section>

      {/* Conditional ranged weapons section (Requirements 5.3, 5.7, 5.8, 12.2, 12.7, 9.2) */}
      {!isRangedWeaponsDisabled ? (
        <section className="weirdo-editor__section" aria-labelledby="ranged-weapons-heading">
          {/* Type assertion safe: gameData.rangedWeapons is loaded from API and contains Weapon objects */}
          <WeaponSelector
            type="ranged"
            selectedWeapons={selectedWeirdo.rangedWeapons}
            // @ts-expect-error - Type assertion safe: gameData contains Weapon objects
            availableWeapons={gameData.rangedWeapons as Weapon[]}
            warbandAbility={warbandAbility}
            onChange={handleRangedWeaponsChange}
          />
        </section>
      ) : (
        <section className="weirdo-editor__section" aria-labelledby="ranged-weapons-disabled-heading">
          <h4 id="ranged-weapons-disabled-heading">Ranged Weapons</h4>
          <p className="weirdo-editor__info-message" role="status">
            Set the Firepower attribute above to select ranged weapons.
          </p>
        </section>
      )}

      {/* Equipment section (Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.2) */}
      <section className="weirdo-editor__section" aria-labelledby="equipment-section-heading">
        {/* Type assertion safe: gameData.equipment is loaded from API and contains Equipment objects */}
        <EquipmentSelector
          selectedEquipment={selectedWeirdo.equipment}
          // @ts-expect-error - Type assertion safe: gameData contains Equipment objects
          availableEquipment={gameData.equipment as Equipment[]}
          weirdoType={selectedWeirdo.type}
          warbandAbility={warbandAbility}
          onChange={handleEquipmentChange}
        />
      </section>

      {/* Psychic powers section (Requirements 6.1, 6.2, 6.3) */}
      <section className="weirdo-editor__section" aria-labelledby="psychic-powers-section-heading">
        {/* Type assertion safe: gameData.psychicPowers is loaded from API and contains PsychicPower objects */}
        <PsychicPowerSelector
          selectedPowers={selectedWeirdo.psychicPowers}
          // @ts-expect-error - Type assertion safe: gameData contains PsychicPower objects
          availablePowers={gameData.psychicPowers as PsychicPower[]}
          warbandAbility={warbandAbility}
          onChange={handlePsychicPowersChange}
        />
      </section>

      {/* Conditional leader trait section (Requirements 7.1, 7.2, 7.3, 7.4) */}
      {isLeader && (
        <section className="weirdo-editor__section" aria-labelledby="leader-trait-section-heading">
          {/* Type assertion safe: gameData.leaderTraits is loaded from API and contains LeaderTrait objects */}
          <LeaderTraitSelector
            selectedTrait={selectedWeirdo.leaderTrait}
            // @ts-expect-error - Type assertion safe: gameData contains LeaderTrait objects
            availableTraits={gameData.leaderTraits as any}
            weirdoType={selectedWeirdo.type}
            onChange={handleLeaderTraitChange}
          />
        </section>
      )}

      {/* Notes section */}
      <section className="weirdo-editor__section" aria-labelledby="notes-heading">
        <h3 id="notes-heading">Notes</h3>
        <label htmlFor="weirdo-notes" className="visually-hidden">
          Additional notes for {selectedWeirdo.name}
        </label>
        <textarea
          id="weirdo-notes"
          className="weirdo-editor__notes textarea"
          value={selectedWeirdo.notes}
          onChange={handleNotesChange}
          placeholder="Add any additional notes about this weirdo..."
          rows={4}
          aria-label="Weirdo notes"
        />
      </section>
    </div>
  );
}
