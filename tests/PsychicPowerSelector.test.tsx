import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PsychicPowerSelector } from '../src/frontend/components/PsychicPowerSelector';
import { PsychicPower } from '../src/backend/models/types';

/**
 * Unit tests for PsychicPowerSelector component
 * Requirements: 5.5, 12.4
 */

describe('PsychicPowerSelector Component', () => {
  const mockPowers: PsychicPower[] = [
    {
      id: 'fear',
      name: 'Fear',
      type: 'Attack',
      cost: 1,
      effect: 'Each enemy weirdo within 1 stick who loses its opposed Will roll must move 1 stick away from the psychic.'
    },
    {
      id: 'healing',
      name: 'Healing',
      type: 'Effect',
      cost: 1,
      effect: '1 weirdo within 1 stick of this weirdo and in LoS becomes ready.'
    },
    {
      id: 'mind-stab',
      name: 'Mind Stab',
      type: 'Attack',
      cost: 3,
      effect: 'Target 1 enemy weirdo within 1 stick. Roll on Under Fire table +3.'
    }
  ];

  describe('Psychic Power Display', () => {
    it('should render all psychic powers', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[]}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // Check title
      expect(screen.getByText('Psychic Powers')).toBeInTheDocument();

      // Check all powers are rendered
      expect(screen.getByText('Fear')).toBeInTheDocument();
      expect(screen.getByText('Healing')).toBeInTheDocument();
      expect(screen.getByText('Mind Stab')).toBeInTheDocument();
    });

    it('should display name, cost, and effect for each power', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[]}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // Check costs
      expect(screen.getAllByText('1 pts')).toHaveLength(2); // Fear and Healing
      expect(screen.getByText('3 pts')).toBeInTheDocument(); // Mind Stab

      // Check effects
      expect(screen.getByText(/Each enemy weirdo within 1 stick/)).toBeInTheDocument();
      expect(screen.getByText(/1 weirdo within 1 stick of this weirdo/)).toBeInTheDocument();
      expect(screen.getByText(/Target 1 enemy weirdo within 1 stick/)).toBeInTheDocument();
    });
  });

  describe('Power Selection', () => {
    it('should handle power selection changes', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[]}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // Click first checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([mockPowers[0]]);
    });

    it('should handle power deselection', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[mockPowers[0]]}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // Click first checkbox to deselect
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should allow multiple power selections without limit', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[mockPowers[0], mockPowers[1]]}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // All checkboxes should be enabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[2]).not.toBeDisabled();
    });

    it('should handle selecting all powers', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[mockPowers[0], mockPowers[1]]}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // Click third checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[2]);

      expect(mockOnChange).toHaveBeenCalledWith([mockPowers[0], mockPowers[1], mockPowers[2]]);
    });
  });

  describe('No Limit Enforcement', () => {
    it('should not disable any checkboxes regardless of selection count', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={mockPowers}
          availablePowers={mockPowers}
          onChange={mockOnChange}
        />
      );

      // All checkboxes should be enabled even when all are selected
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeDisabled();
      });
    });
  });
});
