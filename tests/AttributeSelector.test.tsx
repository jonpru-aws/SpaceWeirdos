import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttributeSelector } from '../src/frontend/components/AttributeSelector';

/**
 * Unit tests for AttributeSelector component
 * 
 * Tests updated for API-based cost calculation architecture:
 * - Selectors show base costs only
 * - Total costs (including warband ability modifications) are calculated by API
 * 
 * Requirements: 5.2, 12.1, 9.2, 9.6
 */

describe('AttributeSelector Component', () => {

  describe('Speed attribute', () => {
    it('should render all speed levels with base costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      expect(screen.getByText('Speed')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Speed levels with base costs: 1 (0 pts), 2 (1 pt), 3 (2 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('1 (0 pts)');
      expect(options[2].text).toContain('2 (1 pts)');
      expect(options[3].text).toContain('3 (2 pts)');
    });

    it('should call onChange with correct speed value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="speed"
          value={1}
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Defense attribute', () => {
    it('should render all defense levels with base costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="defense"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      expect(screen.getByText('Defense')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Defense levels with base costs: 2d6 (0 pts), 2d8 (1 pt), 2d10 (2 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('2d6 (0 pts)');
      expect(options[2].text).toContain('2d8 (1 pts)');
      expect(options[3].text).toContain('2d10 (2 pts)');
    });

    it('should call onChange with correct defense value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="defense"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d10' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d10');
    });
  });

  describe('Firepower attribute', () => {
    it('should render all firepower levels with base costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="firepower"
          value="None"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      expect(screen.getByText('Firepower')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Firepower levels with base costs: None (0 pts), 2d8 (1 pt), 2d10 (2 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('None (0 pts)');
      expect(options[2].text).toContain('2d8 (1 pts)');
      expect(options[3].text).toContain('2d10 (2 pts)');
    });

    it('should call onChange with correct firepower value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="firepower"
          value="None"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d8' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d8');
    });
  });

  describe('Prowess attribute', () => {
    it('should render all prowess levels with base costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="prowess"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      expect(screen.getByText('Prowess')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Prowess levels with base costs: 2d6 (0 pts), 2d8 (1 pt), 2d10 (2 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('2d6 (0 pts)');
      expect(options[2].text).toContain('2d8 (1 pts)');
      expect(options[3].text).toContain('2d10 (2 pts)');
    });

    it('should call onChange with correct prowess value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="prowess"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d8' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d8');
    });
  });

  describe('Willpower attribute', () => {
    it('should render all willpower levels with base costs', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="willpower"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      expect(screen.getByText('Willpower')).toBeInTheDocument();
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // Willpower levels with base costs: 2d6 (0 pts), 2d8 (1 pt), 2d10 (2 pts)
      // Note: options[0] is the placeholder
      expect(options[1].text).toContain('2d6 (0 pts)');
      expect(options[2].text).toContain('2d8 (1 pts)');
      expect(options[3].text).toContain('2d10 (2 pts)');
    });

    it('should call onChange with correct willpower value', () => {
      const mockOnChange = vi.fn();

      render(
        <AttributeSelector
          attribute="willpower"
          value="2d6"
          onChange={mockOnChange}
          warbandAbility={null}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2d10' } });

      expect(mockOnChange).toHaveBeenCalledWith('2d10');
    });
  });

  describe('Cost display behavior', () => {
    it('should show base costs only (modifications calculated by API)', () => {
      const mockOnChange = vi.fn();

      // Even with Mutants ability, selector shows base costs
      // API calculates the actual modified total cost
      render(
        <AttributeSelector
          attribute="speed"
          value={2}
          onChange={mockOnChange}
          warbandAbility="Mutants"
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option2 = Array.from(select.options).find(opt => opt.value === '2');

      // Shows base cost (1 pt), not modified cost
      // Total cost with modifications is calculated by API
      expect(option2?.text).toContain('2 (1 pts)');
      expect(option2?.text).not.toContain('was');
    });

    it('should show base costs regardless of warband ability', () => {
      const mockOnChange = vi.fn();

      // Heavily Armed only affects weapons, but we still show base costs
      render(
        <AttributeSelector
          attribute="defense"
          value="2d8"
          onChange={mockOnChange}
          warbandAbility="Heavily Armed"
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option2d8 = Array.from(select.options).find(opt => opt.value === '2d8');

      // Shows base cost (1 pt)
      expect(option2d8?.text).toContain('2d8 (1 pts)');
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
        />
      );

      // SelectWithCost shows * for required fields
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
});
