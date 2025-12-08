import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EquipmentSelector } from '../src/frontend/components/EquipmentSelector';
import { CostEngine } from '../src/backend/services/CostEngine';
import { Equipment } from '../src/backend/models/types';

/**
 * Unit tests for EquipmentSelector component
 * Requirements: 5.4, 5.7, 5.8, 12.3, 12.6
 */

describe('EquipmentSelector Component', () => {
  const costEngine = new CostEngine();

  const mockEquipment: Equipment[] = [
    {
      id: 'heavy-armor',
      name: 'Heavy Armor',
      type: 'Passive',
      baseCost: 1,
      effect: '+1 to Defense rolls'
    },
    {
      id: 'medkit',
      name: 'Medkit',
      type: 'Action',
      baseCost: 1,
      effect: 'Once per game, 1 weirdo touching this weirdo becomes ready'
    },
    {
      id: 'grenade',
      name: 'Grenade',
      type: 'Action',
      baseCost: 1,
      effect: 'Once per game, Targets point up to 1 stick from attacker'
    }
  ];

  describe('Equipment Limit Enforcement', () => {
    it('should enforce limit of 2 for leader without Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0], mockEquipment[1]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 2/2')).toBeInTheDocument();

      // Third checkbox should be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[2]).toBeDisabled();
    });

    it('should enforce limit of 3 for leader with Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0], mockEquipment[1]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 2/3')).toBeInTheDocument();

      // Third checkbox should NOT be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[2]).not.toBeDisabled();
    });

    it('should enforce limit of 1 for trooper without Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="trooper"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 1/1')).toBeInTheDocument();

      // Second and third checkboxes should be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toBeDisabled();
      expect(checkboxes[2]).toBeDisabled();
    });

    it('should enforce limit of 2 for trooper with Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="trooper"
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 1/2')).toBeInTheDocument();

      // Second checkbox should NOT be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).not.toBeDisabled();
    });
  });

  describe('Count vs Limit Display', () => {
    it('should show current count vs limit', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Selected: 0/2')).toBeInTheDocument();
    });

    it('should update count when equipment is selected', () => {
      const mockOnChange = vi.fn();

      const { rerender } = render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Selected: 0/2')).toBeInTheDocument();

      // Simulate selection
      rerender(
        <EquipmentSelector
          selectedEquipment={[mockEquipment[0]]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Selected: 1/2')).toBeInTheDocument();
    });
  });

  describe('Equipment Display', () => {
    it('should display name, cost, and effect for each equipment', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Check all equipment are rendered with costs and effects
      expect(screen.getByText('Heavy Armor')).toBeInTheDocument();
      expect(screen.getAllByText('1 pts')).toHaveLength(3); // All three equipment have 1 pt cost
      expect(screen.getByText('+1 to Defense rolls')).toBeInTheDocument();

      expect(screen.getByText('Medkit')).toBeInTheDocument();
      expect(screen.getByText('Once per game, 1 weirdo touching this weirdo becomes ready')).toBeInTheDocument();
    });

    it('should show modified cost when Soldiers ability applies', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility="Soldiers"
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Soldiers ability makes equipment cost 0
      expect(screen.getAllByText('0 pts (was 1 pts)')).toHaveLength(3); // All three equipment have modified cost
    });
  });

  describe('Equipment Selection', () => {
    it('should handle equipment selection changes', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Click first checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([mockEquipment[0]]);
    });

    it('should handle equipment deselection', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[mockEquipment[0]]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Click first checkbox to deselect
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should not allow selection when limit is reached', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="trooper"
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Try to click second checkbox (should be disabled)
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      // onChange should not be called
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
