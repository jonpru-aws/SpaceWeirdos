import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import { CostEngine } from '../src/backend/services/CostEngine';
import { createMockWeirdo } from './testHelpers';

/**
 * WeirdoCostDisplay Component Tests
 * 
 * Tests sticky positioning, warning indicators, error indicators,
 * cost breakdown expand/collapse, and all cost components display.
 * 
 * Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 3.3, 5.1-5.5
 */

describe('WeirdoCostDisplay', () => {
  const costEngine = new CostEngine();

  it('should apply sticky positioning styles', () => {
    const weirdo = createMockWeirdo('trooper');
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    const display = container.querySelector('.weirdo-cost-display');
    expect(display).toBeTruthy();
    
    // Check that sticky positioning class is applied
    expect(display?.classList.contains('weirdo-cost-display')).toBe(true);
    
    // Verify role and aria-live for accessibility
    expect(display?.getAttribute('role')).toBe('status');
    expect(display?.getAttribute('aria-live')).toBe('polite');
  });

  it('should display weirdo cost correctly', () => {
    const weirdo = createMockWeirdo('trooper');
    render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should display weirdo cost label
    expect(screen.getByText(/weirdo cost:/i)).toBeTruthy();
    
    // Should display cost value with format "X / Y pts" (trooper limit is 20)
    expect(screen.getByText(/\/ 20 pts/i)).toBeTruthy();
  });

  it('should show warning indicator when trooper within 10 points of limit', () => {
    const weirdo = createMockWeirdo('trooper');
    // Set attributes to get cost at 12 points (20 - 12 = 8, which is <= 10)
    weirdo.attributes = {
      speed: 2,
      defense: '2d6',
      firepower: 'None',
      prowess: '2d6',
      willpower: '2d6'
    };
    weirdo.totalCost = 12;
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should have warning class
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeTruthy();
    expect(screen.getByText(/⚠ approaching limit/i)).toBeTruthy();
  });

  it('should show warning indicator when leader within 10 points of limit', () => {
    const weirdo = createMockWeirdo('leader');
    // Set cost at 17 points (25 - 17 = 8, which is <= 10)
    weirdo.totalCost = 17;
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should have warning class
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeTruthy();
    expect(screen.getByText(/⚠ approaching limit/i)).toBeTruthy();
  });

  it('should not show warning when trooper has more than 10 points remaining', () => {
    const weirdo = createMockWeirdo('trooper');
    // Set cost at 9 points (20 - 9 = 11, which is > 10)
    weirdo.totalCost = 9;
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should NOT have warning class
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeNull();
    expect(screen.queryByText(/⚠ approaching limit/i)).toBeNull();
  });

  it('should show error indicator when trooper exceeds limit', () => {
    const weirdo = createMockWeirdo('trooper');
    // Set cost at 22 points (exceeds 20 point limit)
    weirdo.totalCost = 22;
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should have error class
    const display = container.querySelector('.weirdo-cost-display--error');
    expect(display).toBeTruthy();
    expect(screen.getByText(/✕ over limit/i)).toBeTruthy();
  });

  it('should show error indicator when leader exceeds limit', () => {
    const weirdo = createMockWeirdo('leader');
    // Set cost at 27 points (exceeds 25 point limit)
    weirdo.totalCost = 27;
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should have error class
    const display = container.querySelector('.weirdo-cost-display--error');
    expect(display).toBeTruthy();
    expect(screen.getByText(/✕ over limit/i)).toBeTruthy();
  });

  it('should apply correct warning color styling', () => {
    const weirdo = createMockWeirdo('trooper');
    weirdo.totalCost = 12; // Within 10 points of 20
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should have warning class which applies warning colors
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeTruthy();
    
    // Verify warning indicator has correct styling
    const indicator = container.querySelector('.weirdo-cost-display__indicator--warning');
    expect(indicator).toBeTruthy();
  });

  it('should apply correct error color styling', () => {
    const weirdo = createMockWeirdo('trooper');
    weirdo.totalCost = 22; // Exceeds 20 point limit
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Should have error class which applies error colors
    const display = container.querySelector('.weirdo-cost-display--error');
    expect(display).toBeTruthy();
    
    // Verify error indicator has correct styling
    const indicator = container.querySelector('.weirdo-cost-display__indicator--error');
    expect(indicator).toBeTruthy();
  });

  it('should expand and collapse cost breakdown when toggle clicked', async () => {
    const user = userEvent.setup();
    const weirdo = createMockWeirdo('trooper');
    
    render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Initially, breakdown should not be visible
    expect(screen.queryByText(/attributes:/i)).toBeNull();
    
    // Click the breakdown toggle button
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // After clicking, breakdown should be visible
    expect(screen.getByText(/attributes:/i)).toBeTruthy();
    expect(screen.getByText(/weapons:/i)).toBeTruthy();
    expect(screen.getByText(/equipment:/i)).toBeTruthy();
    expect(screen.getByText(/psychic powers:/i)).toBeTruthy();
    
    // Click again to collapse
    const hideButton = screen.getByRole('button', { name: /hide cost breakdown/i });
    await user.click(hideButton);
    
    // Breakdown should be hidden again
    expect(screen.queryByText(/attributes:/i)).toBeNull();
  });

  it('should show all cost components in breakdown', async () => {
    const user = userEvent.setup();
    const weirdo = createMockWeirdo('trooper');
    
    render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Expand breakdown
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // Verify all cost components are shown
    expect(screen.getByText(/attributes:/i)).toBeTruthy();
    expect(screen.getByText(/weapons:/i)).toBeTruthy();
    expect(screen.getByText(/equipment:/i)).toBeTruthy();
    expect(screen.getByText(/psychic powers:/i)).toBeTruthy();
    
    // Verify total is shown
    const totalItems = screen.getAllByText(/total:/i);
    expect(totalItems.length).toBeGreaterThan(0);
  });

  it('should calculate and display correct cost breakdown values', async () => {
    const user = userEvent.setup();
    const weirdo = createMockWeirdo('trooper');
    weirdo.attributes = {
      speed: 2,
      defense: '2d8',
      firepower: '2d8',
      prowess: '2d8',
      willpower: '2d8'
    };
    
    render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
        costEngine={costEngine}
      />
    );

    // Expand breakdown
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // Calculate expected costs
    const attributeCost = 
      costEngine.getAttributeCost('speed', weirdo.attributes.speed, null) +
      costEngine.getAttributeCost('defense', weirdo.attributes.defense, null) +
      costEngine.getAttributeCost('firepower', weirdo.attributes.firepower, null) +
      costEngine.getAttributeCost('prowess', weirdo.attributes.prowess, null) +
      costEngine.getAttributeCost('willpower', weirdo.attributes.willpower, null);
    
    const totalCost = costEngine.calculateWeirdoCost(weirdo, null);
    
    // Verify costs are displayed (use getAllByText since cost appears multiple times)
    const attributeTexts = screen.getAllByText(new RegExp(`${attributeCost} pts`, 'i'));
    expect(attributeTexts.length).toBeGreaterThan(0);
    
    // Find all instances of total cost (appears in main display and breakdown)
    const totalTexts = screen.getAllByText(new RegExp(`${totalCost} pts`, 'i'));
    expect(totalTexts.length).toBeGreaterThan(0);
  });
});
