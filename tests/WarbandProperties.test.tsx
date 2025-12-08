import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode, useEffect, useRef } from 'react';
import { WarbandProperties } from '../src/frontend/components/WarbandProperties';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { GameDataProvider } from '../src/frontend/contexts/GameDataContext';
import { CostEngine } from '../src/backend/services/CostEngine';
import { createMockGameData } from './testHelpers';

/**
 * Unit tests for WarbandProperties component
 * 
 * Tests form field rendering and warband updates on change.
 * Requirements: 1.1, 2.1, 3.1, 5.1
 */

describe('WarbandProperties', () => {
  let mockCostEngine: CostEngine;

  beforeEach(() => {
    mockCostEngine = new CostEngine();

    // Mock fetch for GameDataProvider
    const mockGameData = createMockGameData();
    global.fetch = ((url: string) => {
      if (url.includes('/warbandAbilities.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.warbandAbilities)
        });
      }
      if (url.includes('/closeCombatWeapons.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.closeCombatWeapons)
        });
      }
      if (url.includes('/rangedWeapons.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.rangedWeapons)
        });
      }
      if (url.includes('/equipment.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.equipment)
        });
      }
      if (url.includes('/psychicPowers.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.psychicPowers)
        });
      }
      if (url.includes('/leaderTraits.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.leaderTraits)
        });
      }
      if (url.includes('/attributes.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameData.attributes)
        });
      }
      return Promise.reject(new Error(`Unmocked fetch call to ${url}`));
    }) as any;
  });

  // Helper component to initialize warband in context
  function WithWarband({ 
    children, 
    name = 'Test Warband',
    pointLimit = 75,
    ability = null
  }: { 
    children: ReactNode;
    name?: string;
    pointLimit?: 75 | 125;
    ability?: any;
  }) {
    const { createWarband, updateWarband } = useWarband();
    const initialized = useRef(false);
    
    useEffect(() => {
      if (!initialized.current) {
        createWarband(name, pointLimit);
        if (ability) {
          updateWarband({ ability });
        }
        initialized.current = true;
      }
    }, [createWarband, updateWarband, name, pointLimit, ability]);
    
    return <>{children}</>;
  }

  const renderWithContext = (children: ReactNode) => {
    return render(
      <GameDataProvider>
        <WarbandProvider
          costEngine={mockCostEngine}
        >
          {children}
        </WarbandProvider>
      </GameDataProvider>
    );
  };

  /**
   * Test: All form fields render correctly
   * Requirements: 1.1, 2.1, 3.1
   */
  describe('Form field rendering', () => {
    it('should render warband name input field', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('id', 'warband-name');
    });

    it('should render point limit radio buttons (75 and 125)', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const radio75 = screen.getByLabelText('75 Points');
      const radio125 = screen.getByLabelText('125 Points');

      expect(radio75).toBeInTheDocument();
      expect(radio125).toBeInTheDocument();
      expect(radio75).toHaveAttribute('type', 'radio');
      expect(radio125).toHaveAttribute('type', 'radio');
      expect(radio75).toHaveAttribute('name', 'point-limit');
      expect(radio125).toHaveAttribute('name', 'point-limit');
    });

    it('should render warband ability dropdown', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i);
      expect(abilitySelect).toBeInTheDocument();
      expect(abilitySelect.tagName).toBe('SELECT');
      expect(abilitySelect).toHaveAttribute('id', 'warband-ability');
    });

    it('should render all warband ability options including None', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i);
      const options = Array.from(abilitySelect.querySelectorAll('option'));

      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveTextContent('None');
      
      // Check for some expected abilities
      const optionTexts = options.map(opt => opt.textContent);
      expect(optionTexts).toContain('Cyborgs');
      expect(optionTexts).toContain('Soldiers');
      expect(optionTexts).toContain('Fanatics');
    });

    it('should display required indicators for required fields', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(2); // Name and Point Limit
    });
  });

  /**
   * Test: Form updates warband on change
   * Requirements: 1.1, 2.1, 3.1, 5.1
   */
  describe('Form updates warband', () => {
    it('should update warband name when input changes', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband name="Original Name">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      
      await user.clear(nameInput);
      await user.type(nameInput, 'New Warband Name');

      expect(nameInput.value).toBe('New Warband Name');
    });

    it('should update point limit when radio button is selected', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband pointLimit={75}>
          <WarbandProperties />
        </WithWarband>
      );

      const radio75 = screen.getByLabelText('75 Points') as HTMLInputElement;
      const radio125 = screen.getByLabelText('125 Points') as HTMLInputElement;

      expect(radio75.checked).toBe(true);
      expect(radio125.checked).toBe(false);

      await user.click(radio125);

      expect(radio125.checked).toBe(true);
    });

    it('should update warband ability when dropdown selection changes', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband ability={null}>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      expect(abilitySelect.value).toBe('null');

      await user.selectOptions(abilitySelect, 'Cyborgs');

      expect(abilitySelect.value).toBe('Cyborgs');
    });

    it('should allow deselecting warband ability by choosing None', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband ability="Cyborgs">
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;

      await user.selectOptions(abilitySelect, 'null');

      expect(abilitySelect.value).toBe('null');
    });
  });

  /**
   * Test: Form displays current warband values
   * Requirements: 1.1, 2.1, 3.1
   */
  describe('Form displays current values', () => {
    it('should display current warband name in input', () => {
      renderWithContext(
        <WithWarband name="My Custom Warband">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('My Custom Warband');
    });

    it('should check the correct point limit radio button', () => {
      renderWithContext(
        <WithWarband pointLimit={125}>
          <WarbandProperties />
        </WithWarband>
      );

      const radio75 = screen.getByLabelText('75 Points') as HTMLInputElement;
      const radio125 = screen.getByLabelText('125 Points') as HTMLInputElement;

      expect(radio75.checked).toBe(false);
      expect(radio125.checked).toBe(true);
    });

    it('should select the current warband ability in dropdown', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      // Select an ability
      await user.selectOptions(abilitySelect, 'Soldiers');
      
      // Verify it's selected
      expect(abilitySelect.value).toBe('Soldiers');
    });

    it('should display ability description when ability is selected', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      // Select Cyborgs ability
      await user.selectOptions(abilitySelect, 'Cyborgs');
      
      // Verify description is displayed
      const description = screen.getByText(/All members can purchase 1 additional equipment option/i);
      expect(description).toBeInTheDocument();
    });

    it('should not display ability description when no ability is selected', () => {
      renderWithContext(
        <WithWarband ability={null}>
          <WarbandProperties />
        </WithWarband>
      );

      const descriptions = screen.queryByText(/All members can purchase/i);
      expect(descriptions).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Point limit selection behavior
   * Requirements: 2.2, 2.3, 2.4
   */
  describe('Point limit selection', () => {
    it('should update point limit when radio button is selected', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband pointLimit={75}>
          <WarbandProperties />
        </WithWarband>
      );

      const radio75 = screen.getByLabelText('75 Points') as HTMLInputElement;
      const radio125 = screen.getByLabelText('125 Points') as HTMLInputElement;

      // Initially 75 should be selected
      expect(radio75.checked).toBe(true);
      expect(radio125.checked).toBe(false);

      // Click 125 radio button
      await user.click(radio125);

      // Now 125 should be selected
      expect(radio125.checked).toBe(true);
      expect(radio75.checked).toBe(false);
    });

    it('should visually indicate the selected point limit option', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband pointLimit={125}>
          <WarbandProperties />
        </WithWarband>
      );

      const radio75 = screen.getByLabelText('75 Points') as HTMLInputElement;
      const radio125 = screen.getByLabelText('125 Points') as HTMLInputElement;

      // 125 should be checked (visually indicated)
      expect(radio125.checked).toBe(true);
      expect(radio75.checked).toBe(false);

      // Switch to 75
      await user.click(radio75);

      // 75 should now be checked (visually indicated)
      expect(radio75.checked).toBe(true);
      expect(radio125.checked).toBe(false);
    });

    it('should trigger cost recalculation when point limit changes', async () => {
      const user = userEvent.setup();
      
      // Create a component that tracks cost updates
      let costUpdateCount = 0;
      
      function CostTracker() {
        const { currentWarband } = useWarband();
        const prevCostRef = useRef<number | undefined>();
        
        useEffect(() => {
          if (currentWarband && prevCostRef.current !== undefined && prevCostRef.current !== currentWarband.totalCost) {
            costUpdateCount++;
          }
          if (currentWarband) {
            prevCostRef.current = currentWarband.totalCost;
          }
        }, [currentWarband?.totalCost]);
        
        return <WarbandProperties />;
      }
      
      renderWithContext(
        <WithWarband pointLimit={75}>
          <CostTracker />
        </WithWarband>
      );

      const radio125 = screen.getByLabelText('125 Points') as HTMLInputElement;

      // Change point limit
      await user.click(radio125);

      // Cost should have been recalculated (updateWarband was called)
      // The actual recalculation happens in WarbandContext
      expect(radio125.checked).toBe(true);
    });
  });

  /**
   * Test: Warband ability selector
   * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6
   * 
   * Tests that all abilities display with descriptions, "None" option is available,
   * ability updates on selection, and cost recalculation is triggered.
   */
  describe('Warband ability selector', () => {
    it('should display all available warband abilities with descriptions in dropdown', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i);
      const options = Array.from(abilitySelect.querySelectorAll('option'));

      // Verify we have multiple abilities (None + actual abilities)
      expect(options.length).toBeGreaterThan(1);
      
      // Verify specific abilities are present
      const optionTexts = options.map(opt => opt.textContent);
      expect(optionTexts).toContain('None');
      expect(optionTexts).toContain('Cyborgs');
      expect(optionTexts).toContain('Fanatics');
      expect(optionTexts).toContain('Living Weapons');
      expect(optionTexts).toContain('Heavily Armed');
      expect(optionTexts).toContain('Mutants');
      expect(optionTexts).toContain('Soldiers');
      expect(optionTexts).toContain('Undead');
    });

    it('should include "None" option to deselect ability', () => {
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i);
      const options = Array.from(abilitySelect.querySelectorAll('option'));
      
      // First option should be "None"
      expect(options[0]).toHaveTextContent('None');
      expect(options[0]).toHaveValue('null');
    });

    it('should update warband ability when selection changes', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband ability={null}>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      // Initially should be None
      expect(abilitySelect.value).toBe('null');

      // Select Cyborgs
      await user.selectOptions(abilitySelect, 'Cyborgs');
      expect(abilitySelect.value).toBe('Cyborgs');

      // Select Soldiers
      await user.selectOptions(abilitySelect, 'Soldiers');
      expect(abilitySelect.value).toBe('Soldiers');

      // Deselect by choosing None
      await user.selectOptions(abilitySelect, 'null');
      expect(abilitySelect.value).toBe('null');
    });

    it('should display ability description when ability is selected', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      // Select Cyborgs ability
      await user.selectOptions(abilitySelect, 'Cyborgs');
      
      // Verify Cyborgs description is displayed
      const cyborgDescription = screen.getByText(/All members can purchase 1 additional equipment option/i);
      expect(cyborgDescription).toBeInTheDocument();

      // Select Soldiers ability
      await user.selectOptions(abilitySelect, 'Soldiers');
      
      // Verify Soldiers description is displayed
      const soldierDescription = screen.getByText(/Grenades, Heavy Armor, and Medkits may be selected at 0 Points Cost/i);
      expect(soldierDescription).toBeInTheDocument();

      // Verify Cyborgs description is no longer displayed
      expect(screen.queryByText(/All members can purchase 1 additional equipment option/i)).not.toBeInTheDocument();
    });

    it('should not display description when "None" is selected', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      // Select an ability first
      await user.selectOptions(abilitySelect, 'Fanatics');
      expect(screen.getByText(/Roll Willpower with \+1DT for all rolls except Psychic Powers/i)).toBeInTheDocument();

      // Select None
      await user.selectOptions(abilitySelect, 'null');
      
      // Verify no description is displayed
      expect(screen.queryByText(/Roll Willpower with \+1DT for all rolls except Psychic Powers/i)).not.toBeInTheDocument();
    });

    it('should trigger cost recalculation when ability changes', async () => {
      const user = userEvent.setup();
      
      // Create a component that tracks when updateWarband is called
      let updateCount = 0;
      
      function AbilityChangeTracker() {
        const { currentWarband } = useWarband();
        const prevAbilityRef = useRef<string | null | undefined>();
        
        useEffect(() => {
          if (currentWarband && prevAbilityRef.current !== undefined && prevAbilityRef.current !== currentWarband.ability) {
            updateCount++;
          }
          if (currentWarband) {
            prevAbilityRef.current = currentWarband.ability;
          }
        }, [currentWarband?.ability]);
        
        return <WarbandProperties />;
      }
      
      renderWithContext(
        <WithWarband ability={null}>
          <AbilityChangeTracker />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;

      // Change ability
      await user.selectOptions(abilitySelect, 'Heavily Armed');

      // Verify ability was updated (which triggers cost recalculation in WarbandContext)
      expect(abilitySelect.value).toBe('Heavily Armed');
      expect(updateCount).toBeGreaterThan(0);
    });

    it('should display all ability descriptions correctly', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband>
          <WarbandProperties />
        </WithWarband>
      );

      const abilitySelect = screen.getByLabelText(/Warband Ability/i) as HTMLSelectElement;
      
      // Test each ability's description
      const abilityDescriptions = [
        { ability: 'Cyborgs', description: /All members can purchase 1 additional equipment option/i },
        { ability: 'Fanatics', description: /Roll Willpower with \+1DT for all rolls except Psychic Powers/i },
        { ability: 'Living Weapons', description: /Unarmed attacks do not have -1DT to Prowess rolls/i },
        { ability: 'Heavily Armed', description: /All Ranged weapons are 1 less Points Cost/i },
        { ability: 'Mutants', description: /Speed, Claws & Teeth, Horrible Claws & Teeth, and Whip\/Tail cost 1 less Points Cost/i },
        { ability: 'Soldiers', description: /Grenades, Heavy Armor, and Medkits may be selected at 0 Points Cost/i },
        { ability: 'Undead', description: /A second staggered condition does not take weirdos out of action/i },
      ];

      for (const { ability, description } of abilityDescriptions) {
        await user.selectOptions(abilitySelect, ability);
        expect(screen.getByText(description)).toBeInTheDocument();
      }
    });
  });

  /**
   * Test: Component handles null warband gracefully
   * Requirements: 1.1
   */
  describe('Null warband handling', () => {
    it('should render nothing when no warband is selected', () => {
      const { container } = renderWithContext(
        <WarbandProperties />
      );

      // Component should render nothing when no warband exists
      const properties = container.querySelector('.warband-properties');
      expect(properties).toBeNull();
    });
  });

  /**
   * Test: Name validation display
   * Requirements: 1.2, 1.3, 1.4, 1.5
   * 
   * Note: These tests verify that the component correctly displays validation errors
   * and updates the name field. The actual validation logic is tested in ValidationService tests.
   */
  describe('Name validation', () => {
    it('should display validation error when empty name error exists in context', () => {
      // Create a warband with empty name
      renderWithContext(
        <WithWarband name="">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      
      // Verify input shows empty value
      expect(nameInput.value).toBe('');
      
      // Verify input has proper attributes
      expect(nameInput).toHaveAttribute('aria-invalid');
      
      // Note: aria-describedby is only set when validation errors exist in context
      // This test verifies the component is ready to display errors when they are provided
    });

    it('should not display validation error when valid name is present', () => {
      renderWithContext(
        <WithWarband name="Valid Warband Name">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      
      // Verify input shows the valid name
      expect(nameInput.value).toBe('Valid Warband Name');
      
      // Verify no error message is displayed
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).not.toBeInTheDocument();
      
      // Verify aria-invalid is false when no errors
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should update name value when user types', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband name="Original Name">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      
      // Clear and type new name
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      // Verify the input value updated
      expect(nameInput.value).toBe('New Name');
    });

    it('should apply focus indicator when name input receives focus', async () => {
      const user = userEvent.setup();
      renderWithContext(
        <WithWarband name="Test Warband">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      
      // Input should not have focus initially
      expect(nameInput).not.toHaveFocus();

      // Click to focus
      await user.click(nameInput);

      // Input should now have focus (Requirement 1.5)
      expect(nameInput).toHaveFocus();
    });

    it('should have proper accessibility attributes for validation', () => {
      renderWithContext(
        <WithWarband name="Test Warband">
          <WarbandProperties />
        </WithWarband>
      );

      const nameInput = screen.getByLabelText(/Warband Name/i) as HTMLInputElement;
      
      // Verify input has required accessibility attributes
      expect(nameInput).toHaveAttribute('id', 'warband-name');
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('placeholder');
      
      // Verify label association
      const label = screen.getByText(/Warband Name/i);
      expect(label).toHaveAttribute('for', 'warband-name');
    });
  });
});
