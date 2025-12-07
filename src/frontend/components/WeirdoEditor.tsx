import { useWarband } from '../contexts/WarbandContext';
import { useGameData } from '../contexts/GameDataContext';
import { WeirdoCostDisplay } from './WeirdoCostDisplay';
import { WeirdoBasicInfo } from './WeirdoBasicInfo';
import { AttributeSelector } from './AttributeSelector';
import { WeaponSelector } from './WeaponSelector';
import { CostEngine } from '../../backend/services/CostEngine';
import { SpeedLevel, DiceLevel, FirepowerLevel, Weapon } from '../../backend/models/types';
import './WeirdoEditor.css';

/**
 * WeirdoEditor Component
 * 
 * Comprehensive editor for weirdo attributes, weapons, and equipment.
 * Provides sections for basic info, attributes, weapons, equipment, powers, and trait.
 * Implements conditional rendering based on weirdo type and attributes.
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

  // Get selected weirdo
  const selectedWeirdo = currentWarband?.weirdos.find(
    (w) => w.id === selectedWeirdoId
  );

  // Show message when no weirdo is selected (Requirement 10.4)
  if (!selectedWeirdo) {
    return (
      <div className="weirdo-editor">
        <div className="weirdo-editor__empty">
          <p>Select a weirdo from the list to edit, or add a new one to get started.</p>
        </div>
      </div>
    );
  }

  // Check if ranged weapons should be disabled (Requirement 12.7)
  const isRangedWeaponsDisabled = selectedWeirdo.attributes.firepower === 'None';

  // Check if leader trait should be shown
  const isLeader = selectedWeirdo.type === 'leader';

  return (
    <div className="weirdo-editor">
      {/* Sticky cost display (Requirement 6.1, 6.3) */}
      <WeirdoCostDisplay
        weirdo={selectedWeirdo}
        warbandAbility={currentWarband?.ability || null}
        pointLimit={currentWarband?.pointLimit || 75}
        costEngine={costEngine}
      />
      
      {/* Basic info section (Requirement 10.3) */}
      <section className="weirdo-editor__section">
        <h3>Basic Information</h3>
        <WeirdoBasicInfo
          weirdo={selectedWeirdo}
          onUpdate={(updates) => updateWeirdo(selectedWeirdo.id, updates)}
        />
      </section>

      {/* Attributes section (Requirement 5.2, 12.1) */}
      <section className="weirdo-editor__section">
        <h3>Attributes</h3>
        <div className="weirdo-editor__attributes">
          <AttributeSelector
            attribute="speed"
            value={selectedWeirdo.attributes.speed}
            onChange={(value) => 
              updateWeirdo(selectedWeirdo.id, {
                attributes: { ...selectedWeirdo.attributes, speed: value as SpeedLevel }
              })
            }
            warbandAbility={currentWarband?.ability || null}
            costEngine={costEngine}
          />
          <AttributeSelector
            attribute="defense"
            value={selectedWeirdo.attributes.defense}
            onChange={(value) => 
              updateWeirdo(selectedWeirdo.id, {
                attributes: { ...selectedWeirdo.attributes, defense: value as DiceLevel }
              })
            }
            warbandAbility={currentWarband?.ability || null}
            costEngine={costEngine}
          />
          <AttributeSelector
            attribute="firepower"
            value={selectedWeirdo.attributes.firepower}
            onChange={(value) => 
              updateWeirdo(selectedWeirdo.id, {
                attributes: { ...selectedWeirdo.attributes, firepower: value as FirepowerLevel }
              })
            }
            warbandAbility={currentWarband?.ability || null}
            costEngine={costEngine}
          />
          <AttributeSelector
            attribute="prowess"
            value={selectedWeirdo.attributes.prowess}
            onChange={(value) => 
              updateWeirdo(selectedWeirdo.id, {
                attributes: { ...selectedWeirdo.attributes, prowess: value as DiceLevel }
              })
            }
            warbandAbility={currentWarband?.ability || null}
            costEngine={costEngine}
          />
          <AttributeSelector
            attribute="willpower"
            value={selectedWeirdo.attributes.willpower}
            onChange={(value) => 
              updateWeirdo(selectedWeirdo.id, {
                attributes: { ...selectedWeirdo.attributes, willpower: value as DiceLevel }
              })
            }
            warbandAbility={currentWarband?.ability || null}
            costEngine={costEngine}
          />
        </div>
      </section>

      {/* Close Combat Weapons section (Requirements 5.3, 5.7, 5.8, 12.2) */}
      <section className="weirdo-editor__section">
        <WeaponSelector
          type="close-combat"
          selectedWeapons={selectedWeirdo.closeCombatWeapons}
          availableWeapons={gameData?.closeCombatWeapons || []}
          warbandAbility={currentWarband?.ability || null}
          onChange={(weapons: Weapon[]) => 
            updateWeirdo(selectedWeirdo.id, { closeCombatWeapons: weapons })
          }
          costEngine={costEngine}
        />
      </section>

      {/* Conditional ranged weapons section (Requirements 5.3, 5.7, 5.8, 12.2, 12.7) */}
      {!isRangedWeaponsDisabled && (
        <section className="weirdo-editor__section">
          <WeaponSelector
            type="ranged"
            selectedWeapons={selectedWeirdo.rangedWeapons}
            availableWeapons={gameData?.rangedWeapons || []}
            warbandAbility={currentWarband?.ability || null}
            onChange={(weapons: Weapon[]) => 
              updateWeirdo(selectedWeirdo.id, { rangedWeapons: weapons })
            }
            costEngine={costEngine}
          />
        </section>
      )}

      {/* Equipment section - will be implemented in task 9 */}
      <section className="weirdo-editor__section">
        <h3>Equipment</h3>
        <p>EquipmentSelector component will be added here</p>
      </section>

      {/* Psychic powers section - will be implemented in task 9 */}
      <section className="weirdo-editor__section">
        <h3>Psychic Powers</h3>
        <p>PsychicPowerSelector component will be added here</p>
      </section>

      {/* Conditional leader trait section (Requirement 10.3) */}
      {isLeader && (
        <section className="weirdo-editor__section">
          <h3>Leader Trait</h3>
          <p>LeaderTraitSelector component will be added here</p>
        </section>
      )}

      {/* Notes section */}
      <section className="weirdo-editor__section">
        <h3>Notes</h3>
        <textarea
          className="weirdo-editor__notes"
          value={selectedWeirdo.notes}
          onChange={(e) => updateWeirdo(selectedWeirdo.id, { notes: e.target.value })}
          placeholder="Add any additional notes about this weirdo..."
          rows={4}
        />
      </section>
    </div>
  );
}
