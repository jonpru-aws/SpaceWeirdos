import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { WeirdoCard } from '../src/frontend/components/WeirdoCard';
import { Weirdo, ValidationError, Attributes } from '../src/backend/models/types';

/**
 * Property-Based Tests for Validation Error Display
 * 
 * **Feature: space-weirdos-ui, Property 6: Validation errors are visually highlighted**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
 * 
 * Property: For any weirdo with validation errors, the weirdo card should have error 
 * styling applied, and hovering over the card should display a tooltip containing 
 * all validation error messages.
 */

describe('Property 6: Validation errors are visually highlighted', () => {
  // Generator for valid attributes
  const attributesArbitrary = fc.record({
    speed: fc.constantFrom(1, 2, 3),
    defense: fc.constantFrom('2d6', '2d8', '2d10'),
    firepower: fc.constantFrom('None', '2d8', '2d10'),
    prowess: fc.constantFrom('2d6', '2d8', '2d10'),
    willpower: fc.constantFrom('2d6', '2d8', '2d10'),
  }) as fc.Arbitrary<Attributes>;

  // Generator for weirdos with valid names (alphanumeric and spaces only)
  const weirdoArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/).filter(name => name.trim().length > 0),
    type: fc.constantFrom('leader' as const, 'trooper' as const),
    attributes: attributesArbitrary,
    closeCombatWeapons: fc.constant([]),
    rangedWeapons: fc.constant([]),
    equipment: fc.constant([]),
    psychicPowers: fc.constant([]),
    leaderTrait: fc.constant(null),
    notes: fc.constant(''),
    totalCost: fc.integer({ min: 0, max: 50 }),
  }) as fc.Arbitrary<Weirdo>;

  // Generator for validation errors with meaningful messages
  const validationErrorArbitrary = fc.record({
    field: fc.stringMatching(/^[a-zA-Z0-9.]{1,100}$/),
    message: fc.stringMatching(/^[a-zA-Z0-9 .,()]{10,200}$/).filter(msg => msg.trim().length >= 10),
    code: fc.constantFrom(
      'WARBAND_NAME_REQUIRED',
      'WEIRDO_NAME_REQUIRED',
      'ATTRIBUTES_INCOMPLETE',
      'CLOSE_COMBAT_WEAPON_REQUIRED',
      'RANGED_WEAPON_REQUIRED',
      'EQUIPMENT_LIMIT_EXCEEDED',
      'TROOPER_POINT_LIMIT_EXCEEDED',
      'WARBAND_POINT_LIMIT_EXCEEDED'
    ),
  }) as fc.Arbitrary<ValidationError>;

  it('should apply error CSS class for any weirdo with validation errors', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.array(validationErrorArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 50 }),
        (weirdo, validationErrors, cost) => {
          const { container } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={true}
              validationErrors={validationErrors}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).toHaveClass('weirdo-card--error');
          
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display error indicator for any weirdo with validation errors', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.array(validationErrorArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 50 }),
        (weirdo, validationErrors, cost) => {
          render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={true}
              validationErrors={validationErrors}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const errorIndicator = screen.getByLabelText('Has validation errors');
          expect(errorIndicator).toBeInTheDocument();
          
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display tooltip with all validation error messages on hover', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.array(validationErrorArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 50 }),
        (weirdo, validationErrors, cost) => {
          const { container } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={true}
              validationErrors={validationErrors}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).toBeTruthy();

          // Simulate hover
          fireEvent.mouseEnter(card!);

          // Check tooltip is displayed
          const tooltips = screen.getAllByRole('tooltip');
          expect(tooltips.length).toBeGreaterThan(0);
          const tooltip = tooltips[tooltips.length - 1]; // Get the most recent tooltip

          // Check all error messages are displayed in the tooltip
          const tooltipText = tooltip.textContent || '';
          validationErrors.forEach((error) => {
            expect(tooltipText).toContain(error.message);
          });

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should hide tooltip when mouse leaves for any weirdo', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.array(validationErrorArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 50 }),
        (weirdo, validationErrors, cost) => {
          const { container } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={true}
              validationErrors={validationErrors}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).toBeTruthy();

          // Simulate hover
          fireEvent.mouseEnter(card!);
          const tooltip = container.querySelector('.weirdo-card__tooltip');
          expect(tooltip).toBeInTheDocument();

          // Simulate mouse leave
          fireEvent.mouseLeave(card!);
          const tooltipAfterLeave = container.querySelector('.weirdo-card__tooltip');
          expect(tooltipAfterLeave).not.toBeInTheDocument();
          
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not apply error styling when hasErrors is false, regardless of weirdo state', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.integer({ min: 0, max: 50 }),
        (weirdo, cost) => {
          const { container } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={false}
              validationErrors={[]}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).not.toHaveClass('weirdo-card--error');
          expect(screen.queryByLabelText('Has validation errors')).not.toBeInTheDocument();
          
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display correct number of error items in tooltip for any number of errors', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.array(validationErrorArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 50 }),
        (weirdo, validationErrors, cost) => {
          const { container } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={true}
              validationErrors={validationErrors}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).toBeTruthy();
          fireEvent.mouseEnter(card!);

          // Check that the correct number of error items are displayed
          // Get only the list items within the current card's tooltip
          const tooltip = container.querySelector('.weirdo-card__tooltip');
          const errorItems = tooltip?.querySelectorAll('.weirdo-card__tooltip-item');
          expect(errorItems?.length).toBe(validationErrors.length);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should clear error styling when hasErrors changes from true to false', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.array(validationErrorArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 50 }),
        (weirdo, validationErrors, cost) => {
          const { container, rerender } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={true}
              validationErrors={validationErrors}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).toHaveClass('weirdo-card--error');

          // Rerender with no errors
          rerender(
            <WeirdoCard
              weirdo={weirdo}
              cost={cost}
              isSelected={false}
              hasErrors={false}
              validationErrors={[]}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          expect(card).not.toHaveClass('weirdo-card--error');
          expect(screen.queryByLabelText('Has validation errors')).not.toBeInTheDocument();
          
          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should show point totals in error messages when they contain point information', () => {
    fc.assert(
      fc.property(
        weirdoArbitrary,
        fc.integer({ min: 21, max: 50 }),
        fc.integer({ min: 20, max: 25 }),
        (weirdo, actualCost, limitCost) => {
          const errorWithPoints: ValidationError = {
            field: `weirdo.${weirdo.id}.totalCost`,
            message: `Weirdo cost (${actualCost} pts) exceeds individual limit (${limitCost} pts)`,
            code: 'TROOPER_POINT_LIMIT_EXCEEDED',
          };

          const { container } = render(
            <WeirdoCard
              weirdo={weirdo}
              cost={actualCost}
              isSelected={false}
              hasErrors={true}
              validationErrors={[errorWithPoints]}
              onClick={vi.fn()}
              onRemove={vi.fn()}
            />
          );

          const card = container.querySelector('.weirdo-card');
          expect(card).toBeTruthy();
          fireEvent.mouseEnter(card!);

          // Check that the error message includes point totals
          const tooltip = container.querySelector('.weirdo-card__tooltip');
          expect(tooltip).toBeTruthy();
          expect(tooltip!.textContent).toContain(`${actualCost} pts`);
          expect(tooltip!.textContent).toContain(`${limitCost} pts`);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });
});
