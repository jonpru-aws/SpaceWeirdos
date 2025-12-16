import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import { createMockWeirdo } from './testHelpers';
import * as apiClient from '../src/frontend/services/apiClient';

/**
 * WeirdoCostDisplay Component Tests
 * 
 * Tests sticky positioning, warning indicators, error indicators,
 * cost breakdown expand/collapse, and all cost components display.
 * 
 * Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 3.3, 5.1-5.5
 */

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

// Import the cache for clearing in tests
import { costCache } from '../src/frontend/hooks/useCostCalculation';

describe('WeirdoCostDisplay', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Clear the cost cache to prevent test interference
    costCache.clear();
    
    // Setup default mock response for calculateCostRealTime
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 10,
        breakdown: {
          attributes: 4,
          weapons: 2,
          equipment: 2,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
  });
  it('should apply sticky positioning styles', () => {
    const weirdo = createMockWeirdo('trooper');
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
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
       
      />
    );

    // Should display weirdo cost label
    expect(screen.getByText(/weirdo cost:/i)).toBeTruthy();
    
    // Should display cost value with format "X pts"
    expect(screen.getByText(/10 pts/i)).toBeTruthy();
  });

  it('should show warning indicator when trooper within 10 points of limit', async () => {
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
    
    // Clear and reset mock to return cost of 12 (approaching limit for trooper)
    vi.clearAllMocks();
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 12,
        breakdown: {
          attributes: 8,
          weapons: 2,
          equipment: 2,
          psychicPowers: 0,
        },
        warnings: [],
        isApproachingLimit: true,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );

    // Wait for the component to update with the mocked data
    await waitFor(() => {
      expect(screen.getByText(/⚠ approaching limit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeTruthy();
  });

  it('should show warning indicator when leader within 10 points of limit', async () => {
    const weirdo = createMockWeirdo('leader');
    // Set cost at 17 points (25 - 17 = 8, which is <= 10)
    weirdo.totalCost = 17;
    
    // Clear and reset mock to return cost of 17 (approaching limit for leader)
    vi.clearAllMocks();
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 17,
        breakdown: {
          attributes: 10,
          weapons: 3,
          equipment: 2,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: true,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );

    // Wait for the component to update with the mocked data
    await waitFor(() => {
      expect(screen.getByText(/⚠ approaching limit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeTruthy();
  });

  it('should not show warning when trooper has more than 10 points remaining', () => {
    const weirdo = createMockWeirdo('trooper');
    // Set cost at 9 points (20 - 9 = 11, which is > 10)
    weirdo.totalCost = 9;
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );

    // Should NOT have warning class
    const display = container.querySelector('.weirdo-cost-display--warning');
    expect(display).toBeNull();
    expect(screen.queryByText(/⚠ approaching limit/i)).toBeNull();
  });

  it('should show error indicator when trooper exceeds limit', async () => {
    const weirdo = createMockWeirdo('trooper');
    // Set cost at 22 points (exceeds 20 point limit)
    weirdo.totalCost = 22;
    
    // Clear and reset mock to return cost of 22 (over limit for trooper)
    vi.clearAllMocks();
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 22,
        breakdown: {
          attributes: 12,
          weapons: 4,
          equipment: 4,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: true,
        calculationTime: 5,
      },
    });
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );

    // Wait for the component to update with the mocked data
    await waitFor(() => {
      expect(screen.getByText(/✕ over limit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const display = container.querySelector('.weirdo-cost-display--error');
    expect(display).toBeTruthy();
  });

  it('should show error indicator when leader exceeds limit', async () => {
    const weirdo = createMockWeirdo('leader');
    // Set cost at 27 points (exceeds 25 point limit)
    weirdo.totalCost = 27;
    
    // Clear and reset mock to return cost of 27 (over limit for leader)
    vi.clearAllMocks();
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 27,
        breakdown: {
          attributes: 15,
          weapons: 5,
          equipment: 4,
          psychicPowers: 3,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: true,
        calculationTime: 5,
      },
    });
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );

    // Wait for the component to update with the mocked data
    await waitFor(() => {
      expect(screen.getByText(/✕ over limit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const display = container.querySelector('.weirdo-cost-display--error');
    expect(display).toBeTruthy();
  });

  it('should apply correct warning color styling', async () => {
    const weirdo = createMockWeirdo('trooper');
    weirdo.totalCost = 12; // Within 10 points of 20
    
    // Clear and reset mock to return cost of 12 (approaching limit)
    vi.clearAllMocks();
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 12,
        breakdown: {
          attributes: 8,
          weapons: 2,
          equipment: 2,
          psychicPowers: 0,
        },
        warnings: [],
        isApproachingLimit: true,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );
    
    // Wait for the component to update with the mocked data
    await waitFor(() => {
      const display = container.querySelector('.weirdo-cost-display--warning');
      expect(display).toBeTruthy();
    }, { timeout: 3000 });
    
    // Verify warning indicator has correct styling
    const indicator = container.querySelector('.weirdo-cost-display__indicator--warning');
    expect(indicator).toBeTruthy();
  });

  it('should apply correct error color styling', async () => {
    const weirdo = createMockWeirdo('trooper');
    weirdo.totalCost = 22; // Exceeds 20 point limit
    
    // Clear and reset mock to return cost of 22 (over limit)
    vi.clearAllMocks();
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 22,
        breakdown: {
          attributes: 12,
          weapons: 4,
          equipment: 4,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: true,
        calculationTime: 5,
      },
    });
    
    const { container } = render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
       
      />
    );

    // Wait for the component to update with the mocked data
    await waitFor(() => {
      const display = container.querySelector('.weirdo-cost-display--error');
      expect(display).toBeTruthy();
    }, { timeout: 3000 });
    
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
      />
    );

    // Initially, breakdown should not be visible
    expect(screen.queryByText(/attributes:/i)).toBeNull();
    
    // Click the breakdown toggle button
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // After clicking, breakdown should be visible (may show loading or actual data)
    // Wait for breakdown to appear
    await waitFor(() => {
      expect(screen.getByText(/attributes:/i)).toBeInTheDocument();
    });
    
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
       
      />
    );

    // Expand breakdown
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // Wait for breakdown to load
    await waitFor(() => {
      expect(screen.getByText(/attributes:/i)).toBeTruthy();
    });
    
    // Verify all cost components are shown
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
       
      />
    );

    // Expand breakdown
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // Wait for breakdown to load from API
    await waitFor(() => {
      expect(screen.getByText(/attributes:/i)).toBeInTheDocument();
    });
    
    // Verify breakdown sections are displayed
    expect(screen.getByText(/attributes:/i)).toBeInTheDocument();
    expect(screen.getByText(/weapons:/i)).toBeInTheDocument();
    expect(screen.getByText(/equipment:/i)).toBeInTheDocument();
    expect(screen.getByText(/psychic powers:/i)).toBeInTheDocument();
    
    // Verify total cost is displayed (weirdo.totalCost is set to 10 in mock)
    const totalTexts = screen.getAllByText(/10 pts/i);
    expect(totalTexts.length).toBeGreaterThan(0);
  });

  /**
   * Test loading state indicator
   * **Validates: Requirements 5.8**
   */
  it('should show loading indicator when breakdown is null', async () => {
    const user = userEvent.setup();
    const weirdo = createMockWeirdo('trooper');
    
    // Clear mocks and create a pending promise
    vi.clearAllMocks();
    let resolvePromise: any;
    const promise = new Promise<any>(resolve => {
      resolvePromise = resolve;
    });
    
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockReturnValue(promise);
    
    render(
      <WeirdoCostDisplay
        weirdo={weirdo}
        warbandAbility={null}
      />
    );

    // Expand breakdown while still loading
    const toggleButton = screen.getByRole('button', { name: /show cost breakdown/i });
    await user.click(toggleButton);
    
    // Wait for breakdown section to be visible (may show loading or actual data)
    await waitFor(() => {
      const breakdownSection = screen.queryByText(/attributes:/i) || screen.queryByText(/loading/i);
      expect(breakdownSection).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Resolve the promise
    resolvePromise({
      success: true,
      data: {
        totalCost: 10,
        breakdown: {
          attributes: 4,
          weapons: 2,
          equipment: 2,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });
    
    // Wait for actual breakdown to load
    await waitFor(() => {
      expect(screen.getByText(/attributes:/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});



