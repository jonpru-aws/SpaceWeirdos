import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemList, ItemListItem } from '../src/frontend/components/common/ItemList';

/**
 * Unit tests for ItemList component (checkbox-based)
 * Requirements: 5.3, 5.4, 5.5, 12.2, 12.3, 12.4, 12.6
 */

describe('ItemList Component', () => {
  const mockItems: ItemListItem[] = [
    { id: '1', name: 'Sword', baseCost: 2, description: 'Standard melee weapon' },
    { id: '2', name: 'Axe', baseCost: 3, description: 'Heavy melee weapon' },
    { id: '3', name: 'Claws & Teeth', baseCost: 1, modifiedCost: 0, description: 'Natural weapons' },
  ];

  describe('Rendering items', () => {
    it('should render all items as checkboxes', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Sword')).toBeInTheDocument();
      expect(screen.getByText('Axe')).toBeInTheDocument();
      expect(screen.getByText('Claws & Teeth')).toBeInTheDocument();
    });

    it('should render item descriptions', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Standard melee weapon')).toBeInTheDocument();
      expect(screen.getByText('Heavy melee weapon')).toBeInTheDocument();
      expect(screen.getByText('Natural weapons')).toBeInTheDocument();
    });

    it('should render item costs', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('2 pts')).toBeInTheDocument();
      expect(screen.getByText('3 pts')).toBeInTheDocument();
    });

    it('should render modified costs with strikethrough', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
        />
      );

      // Item with modified cost should show both original and modified
      const modifiedItem = screen.getByText('Claws & Teeth').closest('.item-list-checkbox-item');
      expect(modifiedItem).toBeInTheDocument();
      expect(screen.getByText('0 pts')).toBeInTheDocument();
    });
  });

  describe('Selection functionality', () => {
    it('should check selected items', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1', '3']}
          onChange={mockOnChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });

    it('should call onChange when checkbox is clicked', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith(['1']);
    });

    it('should add item to selection when unchecked item is clicked', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1']}
          onChange={mockOnChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      expect(mockOnChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('should remove item from selection when checked item is clicked', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1', '2']}
          onChange={mockOnChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith(['2']);
    });
  });

  describe('Limit enforcement', () => {
    it('should display limit info when limit is provided', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1']}
          onChange={mockOnChange}
          limit={2}
        />
      );

      expect(screen.getByText('Selected: 1/2')).toBeInTheDocument();
    });

    it('should disable unselected items when limit is reached', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1', '2']}
          onChange={mockOnChange}
          limit={2}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeDisabled(); // Selected item
      expect(checkboxes[1]).not.toBeDisabled(); // Selected item
      expect(checkboxes[2]).toBeDisabled(); // Unselected item at limit
    });

    it('should not disable selected items when limit is reached', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1', '2']}
          onChange={mockOnChange}
          limit={2}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeDisabled();
      expect(checkboxes[1]).not.toBeDisabled();
    });

    it('should not call onChange when disabled checkbox is clicked', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1', '2']}
          onChange={mockOnChange}
          limit={2}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[2]); // Try to click disabled checkbox

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should disable all checkboxes when disabled prop is true', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={['1']}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('should not call onChange when disabled', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper list semantics', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
          aria-label="Weapon list"
        />
      );

      const list = screen.getByRole('list', { name: 'Weapon list' });
      expect(list).toBeInTheDocument();
    });

    it('should have proper checkbox semantics', () => {
      const mockOnChange = vi.fn();

      render(
        <ItemList
          items={mockItems}
          selectedIds={[]}
          onChange={mockOnChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });
  });
});
