import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttributeSelector } from '../src/frontend/components/AttributeSelector';
import { CostEngine } from '../src/backend/services/CostEngine';
import { WarbandAbility } from '../src/backend/models/types';

/**
 * Unit tests for AttributeSelector component
 * Requirements: 5.2, 12.1
 */

describe('AttributeSelector Component', () => {
  const costEngine = new CostEngine();

  describe('Speed attribute', () => {
    it('should render all speed levels with costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Speed')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Speed levels: 1 (0 pts), 2 (1 pt), 3 (3 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('1 (0 pts)');
      expect(options[2].text).toContain('2 (1 pts)');
      expect(options[3].text).toContain('3 (3 pts)');
    });

    it('should call onChange with correct speed value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Defense attribute', () => {
    it('should render all defense levels with costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="defense"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Defense')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Defense levels: 2d6 (2 pts), 2d8 (4 pts), 2d10 (8 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('2d6 (2 pts)');
      expect(options[2].text).toContain('2d8 (4 pts)');
      expect(options[3].text).toContain('2d10 (8 pts)');
    });

    it('should call onChange with correct defense value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="defense"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d10' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d10');
    });
  });

  describe('Firepower attribute', () => {
    it('should render all firepower levels with costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="firepower"
          value="None"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Firepower')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Firepower levels: None (0 pts), 2d8 (2 pts), 2d10 (4 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('None (0 pts)');
      expect(options[2].text).toContain('2d8 (2 pts)');
      expect(options[3].text).toContain('2d10 (4 pts)');
    });

    it('should call onChange with correct firepower value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="firepower"
          value="None"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d8' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d8');
    });
  });

  describe('Prowess attribute', () => {
    it('should render all prowess levels with costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="prowess"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Prowess')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Prowess levels: 2d6 (2 pts), 2d8 (4 pts), 2d10 (6 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('2d6 (2 pts)');
      expect(options[2].text).toContain('2d8 (4 pts)');
      expect(options[3].text).toContain('2d10 (6 pts)');
    });

    it('should call onChange with correct prowess value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="prowess"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d8' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d8');
    });
  });

  describe('Willpower attribute', () => {
    it('should render all willpower levels with costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="willpower"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      expect(screen.getByText('Willpower')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Willpower levels: 2d6 (2 pts), 2d8 (4 pts), 2d10 (6 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('2d6 (2 pts)');
      expect(options[2].text).toContain('2d8 (4 pts)');
      expect(options[3].text).toContain('2d10 (6 pts)');
    });

    it('should call onChange with correct willpower value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="willpower"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d10' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d10');
    });
  });

  describe('Modified cost indication', () => {
    it('should show modified cost when warband ability applies to speed', () => {
      const mockOnChange = vi.fn();

      // Mutants ability reduces speed cost by 1
      render(
        <AttributeSelector
          attribute="speed"
          value={2}
          onChange={mockOnChange}
          warbandAbility="Mutants"
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option2 = Array.from(select.options).find(opt => opt.value === '2');

      // Speed 2 normally costs 1 pt, but Mutants reduces it by 1 (to 0)
      expect(option2?.text).toContain('0 pts, was 1 pts');
    });

    it('should show modified cost when warband ability applies to speed level 3', () => {
      const mockOnChange = vi.fn();

      // Mutants ability reduces speed cost by 1
      render(
        <AttributeSelector
          attribute="speed"
          value={3}
          onChange={mockOnChange}
          warbandAbility="Mutants"
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option3 = Array.from(select.options).find(opt => opt.value === '3');

      // Speed 3 normally costs 3 pts, but Mutants reduces it by 1 (to 2)
      expect(option3?.text).toContain('2 pts, was 3 pts');
    });

    it('should not show modified cost when warband ability does not apply', () => {
      const mockOnChange = vi.fn();

      // Heavily Armed only affects weapons, not attributes
      render(
        <AttributeSelector
          attribute="defense"
          value="2d8"
          onChange={mockOnChange}
          warbandAbility="Heavily Armed"
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option2d8 = Array.from(select.options).find(opt => opt.value === '2d8');

      // Defense 2d8 costs 4 pts with no modifier
      expect(option2d8?.text).toContain('2d8 (4 pts)');
      expect(option2d8?.text).not.toContain('was');
    });
  });

  describe('Disabled state', () => {
    it('should render in disabled state when disabled prop is true', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
          disabled={true}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it('should not be disabled by default', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const label = screen.getByText('Speed');
      const select = screen.getByRole('combobox');

      expect(label).toHaveAttribute('for', 'attribute-speed');
      expect(select).toHaveAttribute('id', 'attribute-speed');
    });

    it('should be keyboard navigable', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="defense"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      const select = screen.getByRole('combobox');
      select.focus();

      expect(document.activeElement).toBe(select);
    });

    it('should have required indicator', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="firepower"
          value="None"
          onChange={mockOnChange}
          warbandAbility={null}
          costEngine={costEngine}
        />
      );

      // SelectWithCost shows * for required fields
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
});
