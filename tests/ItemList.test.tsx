import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemList } from '../src/frontend/components/common/ItemList';

/**
 * Unit tests for ItemList component
 * Requirements: 5.4
 */

interface TestItem {
  id: string;
  name: string;
  value: number;
}

describe('ItemList Component', () => {
  const mockItems: TestItem[] = [
    { id: '1', name: 'Item One', value: 10 },
    { id: '2', name: 'Item Two', value: 20 },
    { id: '3', name: 'Item Three', value: 30 },
  ];

  const defaultRenderItem = (item: TestItem) => (
    <span data-testid={`item-${item.id}`}>{item.name}</span>
  );

  describe('Rendering items', () => {
    it('should render all items in the list', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('should render items with custom content', () => {
      const mockOnRemove = vi.fn();
      const customRenderItem = (item: TestItem) => (
        <div>
          <strong>{item.name}</strong>
          <span> - {item.value} pts</span>
        </div>
      );

      render(
        <ItemList
          items={mockItems}
          renderItem={customRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(screen.getByText('Item One')).toBeInTheDocument();
      expect(screen.getByText('- 10 pts')).toBeInTheDocument();
    });

    it('should render remove button for each item', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /Remove item/i });
      expect(removeButtons).toHaveLength(3);
    });

    it('should render with custom className', () => {
      const mockOnRemove = vi.fn();

      const { container } = render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
          className="custom-list"
        />
      );

      const list = container.querySelector('.item-list');
      expect(list).toHaveClass('custom-list');
    });

    it('should render with aria-label', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
          aria-label="Test items list"
        />
      );

      const list = screen.getByRole('list', { name: 'Test items list' });
      expect(list).toBeInTheDocument();
    });

    it('should pass index to renderItem function', () => {
      const mockOnRemove = vi.fn();
      const renderWithIndex = vi.fn((item: TestItem, index: number) => (
        <span data-testid={`item-${index}`}>{`${index}: ${item.name}`}</span>
      ));

      render(
        <ItemList
          items={mockItems}
          renderItem={renderWithIndex}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(renderWithIndex).toHaveBeenCalledTimes(3);
      expect(renderWithIndex).toHaveBeenCalledWith(mockItems[0], 0);
      expect(renderWithIndex).toHaveBeenCalledWith(mockItems[1], 1);
      expect(renderWithIndex).toHaveBeenCalledWith(mockItems[2], 2);
    });
  });

  describe('Remove functionality', () => {
    it('should call onRemove when remove button is clicked', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /Remove item/i });
      fireEvent.click(removeButtons[0]);

      expect(mockOnRemove).toHaveBeenCalledWith(mockItems[0], 0);
    });

    it('should call onRemove with correct item and index', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /Remove item/i });
      
      fireEvent.click(removeButtons[1]);
      expect(mockOnRemove).toHaveBeenCalledWith(mockItems[1], 1);

      fireEvent.click(removeButtons[2]);
      expect(mockOnRemove).toHaveBeenCalledWith(mockItems[2], 2);
    });

    it('should call onRemove multiple times for multiple clicks', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: /Remove item/i });
      
      fireEvent.click(removeButtons[0]);
      fireEvent.click(removeButtons[1]);
      fireEvent.click(removeButtons[0]);

      expect(mockOnRemove).toHaveBeenCalledTimes(3);
    });

    it('should have accessible remove button labels', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove item 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove item 3' })).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should render empty message when items array is empty', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={[]}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items available"
        />
      );

      expect(screen.getByText('No items available')).toBeInTheDocument();
    });

    it('should not render list when empty', () => {
      const mockOnRemove = vi.fn();

      const { container } = render(
        <ItemList
          items={[]}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const list = container.querySelector('.item-list');
      expect(list).not.toBeInTheDocument();
    });

    it('should not render remove buttons when empty', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={[]}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const removeButtons = screen.queryAllByRole('button');
      expect(removeButtons).toHaveLength(0);
    });

    it('should render custom empty message', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={[]}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="Your list is empty. Add some items!"
        />
      );

      expect(screen.getByText('Your list is empty. Add some items!')).toBeInTheDocument();
    });

    it('should apply className to empty state', () => {
      const mockOnRemove = vi.fn();

      const { container } = render(
        <ItemList
          items={[]}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
          className="custom-empty"
        />
      );

      const emptyDiv = container.querySelector('.item-list-empty');
      expect(emptyDiv).toHaveClass('custom-empty');
    });
  });

  describe('Edge cases', () => {
    it('should handle single item', () => {
      const mockOnRemove = vi.fn();
      const singleItem = [mockItems[0]];

      render(
        <ItemList
          items={singleItem}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('should handle items with complex data', () => {
      interface ComplexItem {
        id: string;
        nested: {
          data: string;
          values: number[];
        };
      }

      const complexItems: ComplexItem[] = [
        { id: 'c1', nested: { data: 'test', values: [1, 2, 3] } },
      ];

      const mockOnRemove = vi.fn();
      const renderComplex = (item: ComplexItem) => (
        <span>{item.nested.data}</span>
      );

      render(
        <ItemList
          items={complexItems}
          renderItem={renderComplex}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should handle items without unique ids', () => {
      interface SimpleItem {
        name: string;
      }

      const simpleItems: SimpleItem[] = [
        { name: 'First' },
        { name: 'Second' },
      ];

      const mockOnRemove = vi.fn();
      const renderSimple = (item: SimpleItem) => <span>{item.name}</span>;

      render(
        <ItemList
          items={simpleItems}
          renderItem={renderSimple}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should handle renderItem returning null', () => {
      const mockOnRemove = vi.fn();
      const renderNull = () => null;

      render(
        <ItemList
          items={mockItems}
          renderItem={renderNull}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      // Should still render the list structure and remove buttons
      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons).toHaveLength(3);
    });

    it('should handle very long lists', () => {
      const longList = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: i,
      }));

      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={longList}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons).toHaveLength(100);
    });
  });

  describe('Accessibility', () => {
    it('should have proper list semantics', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have proper button semantics', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard navigable', () => {
      const mockOnRemove = vi.fn();

      render(
        <ItemList
          items={mockItems}
          renderItem={defaultRenderItem}
          onRemove={mockOnRemove}
          emptyMessage="No items"
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons[0].focus();

      expect(document.activeElement).toBe(buttons[0]);
    });
  });
});
