import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaderTraitSelector } from '../src/frontend/components/LeaderTraitSelector';
import { LeaderTrait } from '../src/backend/models/types';

/**
 * Unit tests for LeaderTraitSelector component
 * Requirements: 5.6, 12.5
 */

describe('LeaderTraitSelector Component', () => {
  const mockTraits = [
    {
      id: 'bounty-hunter',
      name: 'Bounty Hunter' as LeaderTrait,
      description: 'Once per round, when a weirdo from your warband is touching a down or staggered enemy, it can take a Use Item action to make the enemy weirdo out of action.'
    },
    {
      id: 'healer',
      name: 'Healer' as LeaderTrait,
      description: 'During the Initiative Phase, one of your weirdos within one stick of your leader may make a free Stand or Recover action with +1DT.'
    },
    {
      id: 'tactician',
      name: 'Tactician' as LeaderTrait,
      description: '+1DT to Initiative rolls.'
    }
  ];

  describe('Conditional Rendering', () => {
    it('should render for leaders', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait={null}
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      expect(screen.getByLabelText('Leader Trait')).toBeInTheDocument();
    });

    it('should not render for troopers', () => {
      const mockOnChange = vi.fn();

      const { container } = render(
        <LeaderTraitSelector
          selectedTrait={null}
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="trooper"
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Trait Display', () => {
    it('should display "None" option', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait={null}
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      const select = screen.getByLabelText('Leader Trait') as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.text);

      expect(options[0]).toBe('None');
    });

    it('should display all available traits with descriptions', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait={null}
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      const select = screen.getByLabelText('Leader Trait') as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.text);

      expect(options).toContain('Bounty Hunter - Once per round, when a weirdo from your warband is touching a down or staggered enemy, it can take a Use Item action to make the enemy weirdo out of action.');
      expect(options).toContain('Healer - During the Initiative Phase, one of your weirdos within one stick of your leader may make a free Stand or Recover action with +1DT.');
      expect(options).toContain('Tactician - +1DT to Initiative rolls.');
    });
  });

  describe('Trait Selection', () => {
    it('should handle trait selection changes', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait={null}
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      const select = screen.getByLabelText('Leader Trait') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Tactician' } });

      expect(mockOnChange).toHaveBeenCalledWith('Tactician');
    });

    it('should handle selecting "None"', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait="Healer"
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      const select = screen.getByLabelText('Leader Trait') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should display selected trait', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait="Healer"
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      const select = screen.getByLabelText('Leader Trait') as HTMLSelectElement;
      expect(select.value).toBe('Healer');
    });

    it('should display "None" when no trait is selected', () => {
      const mockOnChange = vi.fn();

      render(
        <LeaderTraitSelector
          selectedTrait={null}
          availableTraits={mockTraits}
          onChange={mockOnChange}
          weirdoType="leader"
        />
      );

      const select = screen.getByLabelText('Leader Trait') as HTMLSelectElement;
      expect(select.value).toBe('');
    });
  });
});
