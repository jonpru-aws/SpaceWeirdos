import { useMemo, useCallback } from 'react';
import { useWarband } from '../contexts/WarbandContext';
import { useGameData } from '../contexts/GameDataContext';
import { WeirdoCostDisplay } from './WeirdoCostDisplay';
import { WeirdoBasicInfo } from './WeirdoBasicInfo';
import { AttributeSelector } from './AttributeSelector';
import { WeaponSelector } from './WeaponSelector';
import { EquipmentSelector } from './EquipmentSelector';
import { PsychicPowerSelector } from './PsychicPowerSelector';
import { LeaderTraitSelector } from './LeaderTraitSelector';
import { CostEngine } from '../../backend/services/CostEngine';
import { Weirdo, SpeedLevel, DiceLevel, FirepowerLevel, Weapon, Equipment, PsychicPower, LeaderTrait } from '../../backend/models/types';
import './WeirdoEditor.css';

/**
 * WeirdoEditor Component
 * 
 * Comprehensive editor for weirdo attributes, weapons, and equipment.
 * Provides sections for basic info, attributes, weapons, equipment, powers, and trait.
 * Implements conditional rendering based on weirdo type and attributes.
 * Optimized with useMemo and useCallback for performance.
 * 
 * Requirements: 10.3, 10.4, 12.7
 */

// Create cost engine instance for cost calculations
const costEngine = new CostEngine();

export function WeirdoEditor() {
  const {
    currentWarband,
    selectedWeirdoId,
    updateWeirdo,
  } = useWarband();

  // Get game data for weapons
  const { data: gameData } = useGameData();

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
        updateWeirdo(selectedWeirdo.id, { closeCombatWeapons: weapons });
      }
    },
    [selectedWeirdo, updateWeirdo]
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
      {/* Sticky cost display (Requirement 6.1, 6.3) */}
      <WeirdoCostDisplay
        weirdo={selectedWeirdo}
        warbandAbility={warbandAbility}
        costEngine={costEngine}
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
          {/* Type assertion: AttributeSelector accepts union type but we know the specific type based on attribute prop */}
          <AttributeSelector
            attribute="speed"
            value={selectedWeirdo.attributes.speed}
            onChange={handleSpeedChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
            costEngine={costEngine}
          />
          {/* Type assertion: AttributeSelector accepts union type but we know the specific type based on attribute prop */}
          <AttributeSelector
            attribute="defense"
            value={selectedWeirdo.attributes.defense}
            onChange={handleDefenseChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
            costEngine={costEngine}
          />
          {/* Type assertion: AttributeSelector accepts union type but we know the specific type based on attribute prop */}
          <AttributeSelector
            attribute="firepower"
            value={selectedWeirdo.attributes.firepower}
            onChange={handleFirepowerChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
            costEngine={costEngine}
          />
          {/* Type assertion: AttributeSelector accepts union type but we know the specific type based on attribute prop */}
          <AttributeSelector
            attribute="prowess"
            value={selectedWeirdo.attributes.prowess}
            onChange={handleProwessChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
            costEngine={costEngine}
          />
          {/* Type assertion: AttributeSelector accepts union type but we know the specific type based on attribute prop */}
          <AttributeSelector
            attribute="willpower"
            value={selectedWeirdo.attributes.willpower}
            onChange={handleWillpowerChange as (value: SpeedLevel | DiceLevel | FirepowerLevel) => void}
            warbandAbility={warbandAbility}
            costEngine={costEngine}
          />
        </div>
      </section>

      {/* Close Combat Weapons section (Requirements 5.3, 5.7, 5.8, 12.2) */}
      <section className="weirdo-editor__section" aria-labelledby="close-combat-heading">
        <WeaponSelector
          type="close-combat"
          selectedWeapons={selectedWeirdo.closeCombatWeapons}
          availableWeapons={gameData?.closeCombatWeapons || []}
          warbandAbility={warbandAbility}
          onChange={handleCloseCombatWeaponsChange}
          costEngine={costEngine}
        />
      </section>

      {/* Conditional ranged weapons section (Requirements 5.3, 5.7, 5.8, 12.2, 12.7) */}
      {!isRangedWeaponsDisabled && (
        <section className="weirdo-editor__section" aria-labelledby="ranged-weapons-heading">
          <WeaponSelector
            type="ranged"
            selectedWeapons={selectedWeirdo.rangedWeapons}
            availableWeapons={gameData?.rangedWeapons || []}
            warbandAbility={warbandAbility}
            onChange={handleRangedWeaponsChange}
            costEngine={costEngine}
          />
        </section>
      )}

      {/* Equipment section (Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6) */}
      <section className="weirdo-editor__section" aria-labelledby="equipment-section-heading">
        <EquipmentSelector
          selectedEquipment={selectedWeirdo.equipment}
          availableEquipment={gameData?.equipment || []}
          weirdoType={selectedWeirdo.type}
          warbandAbility={warbandAbility}
          onChange={handleEquipmentChange}
          costEngine={costEngine}
        />
      </section>

      {/* Psychic powers section (Requirements 6.1, 6.2, 6.3) */}
      <section className="weirdo-editor__section" aria-labelledby="psychic-powers-section-heading">
        <PsychicPowerSelector
          selectedPowers={selectedWeirdo.psychicPowers}
          availablePowers={gameData?.psychicPowers || []}
          onChange={handlePsychicPowersChange}
        />
      </section>

      {/* Conditional leader trait section (Requirements 7.1, 7.2, 7.3, 7.4) */}
      {isLeader && (
        <section className="weirdo-editor__section" aria-labelledby="leader-trait-section-heading">
          <LeaderTraitSelector
            selectedTrait={selectedWeirdo.leaderTrait}
            availableTraits={gameData?.leaderTraits || []}
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
