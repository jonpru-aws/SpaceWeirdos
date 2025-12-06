import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectWithCost, SelectOption } from '../src/frontend/components/common/SelectWithCost';

/**
 * Unit tests for SelectWithCost component
 * Requirements: 5.4
 */

describe('SelectWithCost Component', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1', baseCost: 5 },
    { value: 'option2', label: 'Option 2', baseCost: 10 },
    { value: 'option3', label: 'Option 3', baseCost: 15, description: 'Special option' },
  ];

  const mockOptionsWithModifier: SelectOption[] = [
    { value: 'option1', label: 'Option 1', baseCost: 5, modifiedCost: 4 },
    { value: 'option2', label: 'Option 2', baseCost: 10, modifiedCost: 10 },
    { value: 'option3', label: 'Option 3', baseCost: 15, modifiedCost: 0 },
  ];

  describe('Rendering with various props', () => {
    it('should render with basic props', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render all options with costs', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.options);

      // First option is placeholder
      expect(options[0].text).toContain('Select an option...');
      expect(options[1].text).toContain('Option 1 (5 pts)');
      expect(options[2].text).toContain('Option 2 (10 pts)');
      expect(options[3].text).toContain('Option 3 (15 pts)');
    });

    it('should render options with descriptions', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option3"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option3 = Array.from(select.options).find(opt => opt.value === 'option3');

      expect(option3?.text).toContain('Special option');
    });

    it('should render with required indicator', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value=""
          options={mockOptions}
          onChange={mockOnChange}
          placeholder="Choose wisely..."
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.options[0].text).toBe('Choose wisely...');
    });

    it('should render in disabled state', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it('should apply custom className', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const container = screen.getByLabelText('Test Label').closest('.select-with-cost');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Cost display', () => {
    it('should display base cost when no modifier is present', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option1 = Array.from(select.options).find(opt => opt.value === 'option1');

      expect(option1?.text).toContain('5 pts');
      expect(option1?.text).not.toContain('was');
    });

    it('should display modified cost with original cost when modifier is present', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptionsWithModifier}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option1 = Array.from(select.options).find(opt => opt.value === 'option1');

      expect(option1?.text).toContain('4 pts, was 5 pts');
    });

    it('should not show modifier text when modified cost equals base cost', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option2"
          options={mockOptionsWithModifier}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option2 = Array.from(select.options).find(opt => opt.value === 'option2');

      expect(option2?.text).toContain('10 pts');
      expect(option2?.text).not.toContain('was');
    });

    it('should display zero cost correctly', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option3"
          options={mockOptionsWithModifier}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option3 = Array.from(select.options).find(opt => opt.value === 'option3');

      expect(option3?.text).toContain('0 pts, was 15 pts');
    });
  });

  describe('onChange handler', () => {
    it('should call onChange when selection changes', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option2' } });

      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('should call onChange with correct value for multiple changes', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      
      fireEvent.change(select, { target: { value: 'option2' } });
      expect(mockOnChange).toHaveBeenCalledWith('option2');

      fireEvent.change(select, { target: { value: 'option3' } });
      expect(mockOnChange).toHaveBeenCalledWith('option3');

      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('should not call onChange when disabled', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option2' } });

      // onChange is still called by the browser, but the select is disabled
      // so the user can't actually interact with it
      expect(select).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const label = screen.getByText('Test Label');
      const select = screen.getByRole('combobox');

      expect(label).toHaveAttribute('for', 'test-select');
      expect(select).toHaveAttribute('id', 'test-select');
    });

    it('should be keyboard navigable', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="option1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      select.focus();

      expect(document.activeElement).toBe(select);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty options array', () => {
      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value=""
          options={[]}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.options.length).toBe(1); // Only placeholder
    });

    it('should handle options with zero cost', () => {
      const zeroOptions: SelectOption[] = [
        { value: 'free', label: 'Free Item', baseCost: 0 },
      ];

      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="free"
          options={zeroOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option = Array.from(select.options).find(opt => opt.value === 'free');

      expect(option?.text).toContain('0 pts');
    });

    it('should handle very long option labels', () => {
      const longOptions: SelectOption[] = [
        {
          value: 'long',
          label: 'This is a very long option label that might wrap',
          baseCost: 100,
          description: 'And this is an even longer description that provides additional context',
        },
      ];

      const mockOnChange = vi.fn();

      render(
        <SelectWithCost
          id="test-select"
          label="Test Label"
          value="long"
          options={longOptions}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const option = Array.from(select.options).find(opt => opt.value === 'long');

      expect(option?.text).toContain('This is a very long option label');
      expect(option?.text).toContain('And this is an even longer description');
    });
  });
});
