import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { CostBadge } from '../src/frontend/components/common/CostBadge';

/**
 * Property-Based Tests for CostBadge Component
 * 
 * **Feature: 5-realtime-feedback-polish, Property 3: Modified costs are visually indicated**
 * **Validates: Requirements 1.5**
 * 
 * Property: For any weapon or equipment with a warband ability modifier applied, 
 * the display should show both the base cost and modified cost with strikethrough 
 * styling on the base cost.
 */

describe('Property 3: Modified costs are visually indicated', () => {
  // Generator for valid cost values (0-100 points)
  const costArbitrary = fc.integer({ min: 0, max: 100 });

  it('should show strikethrough on base cost when modified cost differs', () => {
    fc.assert(
      fc.property(
        costArbitrary,
        costArbitrary,
        (baseCost, modifiedCost) => {
          // Skip when costs are equal
          fc.pre(baseCost !== modifiedCost);

          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={modifiedCost} />
          );

          // Check that original cost has strikethrough styling
          const originalCost = container.querySelector('.cost-badge-original');
          expect(originalCost).toBeInTheDocument();
          expect(originalCost).toHaveTextContent(`${baseCost} pts`);

          // Verify the element has the class that applies strikethrough
          expect(originalCost).toHaveClass('cost-badge-original');

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display both base and modified costs when they differ', () => {
    fc.assert(
      fc.property(
        costArbitrary,
        costArbitrary,
        (baseCost, modifiedCost) => {
          // Skip when costs are equal
          fc.pre(baseCost !== modifiedCost);

          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={modifiedCost} />
          );

          // Check both costs are displayed
          const originalCost = container.querySelector('.cost-badge-original');
          const currentCost = container.querySelector('.cost-badge-current');

          expect(originalCost).toBeInTheDocument();
          expect(originalCost).toHaveTextContent(`${baseCost} pts`);
          
          expect(currentCost).toBeInTheDocument();
          expect(currentCost).toHaveTextContent(`${modifiedCost} pts`);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should apply modified class when costs differ', () => {
    fc.assert(
      fc.property(
        costArbitrary,
        costArbitrary,
        (baseCost, modifiedCost) => {
          // Skip when costs are equal
          fc.pre(baseCost !== modifiedCost);

          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={modifiedCost} />
          );

          const badge = container.querySelector('.cost-badge');
          expect(badge).toHaveClass('modified');

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should show arrow indicator between base and modified costs', () => {
    fc.assert(
      fc.property(
        costArbitrary,
        costArbitrary,
        (baseCost, modifiedCost) => {
          // Skip when costs are equal
          fc.pre(baseCost !== modifiedCost);

          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={modifiedCost} />
          );

          const arrow = container.querySelector('.cost-badge-arrow');
          expect(arrow).toBeInTheDocument();
          expect(arrow).toHaveTextContent('→');

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not show modified display when costs are equal', () => {
    fc.assert(
      fc.property(
        costArbitrary,
        (cost) => {
          const { container } = render(
            <CostBadge baseCost={cost} modifiedCost={cost} />
          );

          // Should not have modified class
          const badge = container.querySelector('.cost-badge');
          expect(badge).not.toHaveClass('modified');

          // Should not show arrow or separate cost displays
          expect(container.querySelector('.cost-badge-arrow')).not.toBeInTheDocument();
          expect(container.querySelector('.cost-badge-original')).not.toBeInTheDocument();
          expect(container.querySelector('.cost-badge-current')).not.toBeInTheDocument();

          // Should show single cost display
          const singleCost = container.querySelector('.cost-badge-single');
          expect(singleCost).toBeInTheDocument();
          expect(singleCost).toHaveTextContent(`${cost} pts`);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not show modified display when modifiedCost is undefined', () => {
    fc.assert(
      fc.property(
        costArbitrary,
        (baseCost) => {
          const { container } = render(
            <CostBadge baseCost={baseCost} />
          );

          // Should not have modified class
          const badge = container.querySelector('.cost-badge');
          expect(badge).not.toHaveClass('modified');

          // Should not show arrow or separate cost displays
          expect(container.querySelector('.cost-badge-arrow')).not.toBeInTheDocument();
          expect(container.querySelector('.cost-badge-original')).not.toBeInTheDocument();
          expect(container.querySelector('.cost-badge-current')).not.toBeInTheDocument();

          // Should show single cost display
          const singleCost = container.querySelector('.cost-badge-single');
          expect(singleCost).toBeInTheDocument();
          expect(singleCost).toHaveTextContent(`${baseCost} pts`);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle cost reductions (modified < base)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 99 }),
        (baseCost, modifiedCost) => {
          // Ensure modified is less than base
          fc.pre(modifiedCost < baseCost);

          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={modifiedCost} />
          );

          // Verify both costs are displayed correctly
          const originalCost = container.querySelector('.cost-badge-original');
          const currentCost = container.querySelector('.cost-badge-current');

          expect(originalCost).toHaveTextContent(`${baseCost} pts`);
          expect(currentCost).toHaveTextContent(`${modifiedCost} pts`);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle cost increases (modified > base)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (baseCost, modifiedCost) => {
          // Ensure modified is greater than base
          fc.pre(modifiedCost > baseCost);

          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={modifiedCost} />
          );

          // Verify both costs are displayed correctly
          const originalCost = container.querySelector('.cost-badge-original');
          const currentCost = container.querySelector('.cost-badge-current');

          expect(originalCost).toHaveTextContent(`${baseCost} pts`);
          expect(currentCost).toHaveTextContent(`${modifiedCost} pts`);

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle cost reduction to zero', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (baseCost) => {
          const { container } = render(
            <CostBadge baseCost={baseCost} modifiedCost={0} />
          );

          // Verify both costs are displayed
          const originalCost = container.querySelector('.cost-badge-original');
          const currentCost = container.querySelector('.cost-badge-current');

          expect(originalCost).toHaveTextContent(`${baseCost} pts`);
          expect(currentCost).toHaveTextContent('0 pts');

          cleanup();
        }
      ),
      { numRuns: 50 }
    );
  });
});
