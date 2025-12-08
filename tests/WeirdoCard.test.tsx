import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeirdoCard } from '../src/frontend/components/WeirdoCard';
import { Weirdo, ValidationError } from '../src/backend/models/types';

/**
 * WeirdoCard Component Tests
 * 
 * Tests validation error styling and tooltip display.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

describe('WeirdoCard', () => {
  const mockWeirdo: Weirdo = {
    id: 'test-1',
    name: 'Test Leader',
    type: 'leader',
    attributes: {
      speed: 2,
      defense: '2d6',
      firepower: 'None',
      prowess: '2d6',
      willpower: '2d6',
    },
    closeCombatWeapons: [],
    rangedWeapons: [],
    equipment: [],
    psychicPowers: [],
    leaderTrait: null,
    notes: '',
    totalCost: 10,
  };

  const mockValidationErrors: ValidationError[] = [
    {
      field: 'weirdo.test-1.closeCombatWeapons',
      message: 'Weirdo must have at least one close combat weapon',
      code: 'CLOSE_COMBAT_WEAPON_REQUIRED',
    },
    {
      field: 'weirdo.test-1.totalCost',
      message: 'Weirdo cost (30 pts) exceeds individual limit (25 pts)',
      code: 'TROOPER_POINT_LIMIT_EXCEEDED',
    },
  ];

  it('should apply error CSS class when hasErrors is true', () => {
    const { container } = render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = container.querySelector('.weirdo-card');
    expect(card).toHaveClass('weirdo-card--error');
  });

  it('should not apply error CSS class when hasErrors is false', () => {
    const { container } = render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={false}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = container.querySelector('.weirdo-card');
    expect(card).not.toHaveClass('weirdo-card--error');
  });

  it('should display error indicator when hasErrors is true', () => {
    render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    // Check that the error indicator is present (aria-hidden, so use class selector)
    const card = screen.getByRole('button', { name: /Select Test Leader/ });
    expect(card).toHaveAttribute('aria-invalid', 'true');
    expect(card).toHaveAttribute('aria-describedby', 'weirdo-errors-test-1');
  });

  it('should not display error indicator when hasErrors is false', () => {
    render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={false}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    // Check that the error indicator is not present
    const card = screen.getByRole('button', { name: /Select Test Leader/ });
    expect(card).not.toHaveAttribute('aria-invalid', 'true');
    expect(card).not.toHaveAttribute('aria-describedby');
  });

  it('should display tooltip with validation messages on hover', () => {
    const { container } = render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = container.querySelector('.weirdo-card');
    expect(card).toBeTruthy();

    // Simulate hover
    fireEvent.mouseEnter(card!);

    // Check tooltip is displayed
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    // Check all error messages are displayed in the tooltip (not the hidden description)
    const tooltipItems = screen.getAllByText(/must have at least one close combat weapon/i);
    expect(tooltipItems.length).toBeGreaterThan(0);
    const limitItems = screen.getAllByText(/exceeds individual limit/i);
    expect(limitItems.length).toBeGreaterThan(0);
  });

  it('should hide tooltip when mouse leaves', () => {
    const { container } = render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = container.querySelector('.weirdo-card');
    expect(card).toBeTruthy();

    // Simulate hover
    fireEvent.mouseEnter(card!);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Simulate mouse leave
    fireEvent.mouseLeave(card!);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should display all validation errors in tooltip', () => {
    render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = screen.getByRole('button', { name: /select test leader/i });
    fireEvent.mouseEnter(card);

    // Check that both errors are displayed
    const errorItems = screen.getAllByRole('listitem');
    expect(errorItems).toHaveLength(2);
  });

  it('should show point total in error message when exceeding limits', () => {
    render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={30}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = screen.getByRole('button', { name: /select test leader/i });
    fireEvent.mouseEnter(card);

    // Check that the error message includes point totals (appears in both tooltip and hidden description)
    const errorMessages = screen.getAllByText(/30 pts.*exceeds.*25 pts/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should clear error styling when validation passes', () => {
    const { container, rerender } = render(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={true}
        validationErrors={mockValidationErrors}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const card = container.querySelector('.weirdo-card');
    expect(card).toHaveClass('weirdo-card--error');

    // Rerender with no errors
    rerender(
      <WeirdoCard
        weirdo={mockWeirdo}
        cost={10}
        isSelected={false}
        hasErrors={false}
        validationErrors={[]}
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(card).not.toHaveClass('weirdo-card--error');
    expect(screen.queryByLabelText('Has validation errors')).not.toBeInTheDocument();
  });
});
