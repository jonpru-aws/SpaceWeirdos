import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import type { WarbandAbility } from '../src/backend/models/types';

/**
 * Property-Based Tests for Backend Performance
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 14: Backend responds within performance threshold**
 * **Validates: Requirements 6.3**
 * 
 * Tests that the backend cost calculation endpoint responds within 100ms
 */

const API_BASE_URL = 'http://localhost:3001/api';
const PERFORMANCE_THRESHOLD_MS = 100;

// Helper to check if backend is available
async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('Backend Performance Property Tests', () => {
  beforeAll(async () => {
    // Check if backend server is running
    const available = await isBackendAvailable();
    if (!available) {
      throw new Error(
        'Backend server is not running. Please start the server with "npm run dev" before running these tests.'
      );
    }
  });

  /**
   * Property 14: Backend responds within performance threshold
   * 
   * For any cost calculation request to the Backend,
   * the Backend SHALL respond within 100 milliseconds
   */
  it('Property 14: should respond to cost calculation requests within 100ms', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random cost calculation parameters
        fc.record({
          weirdoType: fc.constantFrom('leader' as const, 'trooper' as const),
          attributes: fc.record({
            speed: fc.integer({ min: 1, max: 3 }),
            defense: fc.constantFrom('2d6', '2d8', '2d10'),
            firepower: fc.constantFrom('None', '2d8', '2d10'),
            prowess: fc.constantFrom('2d6', '2d8', '2d10'),
            willpower: fc.constantFrom('2d6', '2d8', '2d10'),
          }),
          weapons: fc.record({
            close: fc.array(
              fc.constantFrom('Unarmed', 'Sword', 'Axe', 'Hammer', 'Spear'),
              { maxLength: 3 }
            ),
            ranged: fc.array(
              fc.constantFrom('Pistol', 'Rifle', 'Blaster', 'Shotgun'),
              { maxLength: 3 }
            ),
          }),
          equipment: fc.array(
            fc.constantFrom('Armor', 'Shield', 'Medkit', 'Scanner'),
            { maxLength: 3 }
          ),
          psychicPowers: fc.array(
            fc.constantFrom('Telekinesis', 'Mind Blast', 'Telepathy'),
            { maxLength: 2 }
          ),
          warbandAbility: fc.option(
            fc.constantFrom(
              'Scavengers' as WarbandAbility,
              'Zealots' as WarbandAbility,
              'Mercenaries' as WarbandAbility
            ),
            { nil: null }
          ),
        }),
        async (params) => {
          // Measure request time
          const startTime = performance.now();
          
          const response = await fetch(`${API_BASE_URL}/cost/calculate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });

          const endTime = performance.now();
          const responseTime = endTime - startTime;

          // Verify response is successful
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
          }
          
          // Parse response to ensure it's valid
          const data = await response.json();
          
          // Verify response structure - log for debugging if invalid
          if (!data || typeof data !== 'object') {
            throw new Error(`Invalid response type: ${typeof data}, value: ${JSON.stringify(data)}`);
          }
          
          if (!data.success) {
            throw new Error(`API returned success=false: ${JSON.stringify(data)}`);
          }
          
          if (!data.data) {
            throw new Error(`API response missing data field: ${JSON.stringify(data)}`);
          }
          
          if (typeof data.data.totalCost !== 'number') {
            throw new Error(`totalCost is not a number: ${typeof data.data.totalCost}, full response: ${JSON.stringify(data)}`);
          }
          
          expect(data.success).toBe(true);
          expect(data.data).toBeDefined();
          expect(data.data.totalCost).toBeTypeOf('number');
          expect(data.data.breakdown).toBeDefined();

          // Verify response time is within threshold
          // This is the core property: backend MUST respond within 100ms
          expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional test: Verify backend performance under various load patterns
   * Tests that performance remains consistent across different request patterns
   */
  it('Property 14 (extended): should maintain performance across sequential requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a sequence of requests
        fc.array(
          fc.record({
            weirdoType: fc.constantFrom('leader' as const, 'trooper' as const),
            attributes: fc.record({
              speed: fc.integer({ min: 1, max: 3 }),
              defense: fc.constantFrom('2d6', '2d8', '2d10'),
              firepower: fc.constantFrom('None', '2d8', '2d10'),
              prowess: fc.constantFrom('2d6', '2d8', '2d10'),
              willpower: fc.constantFrom('2d6', '2d8', '2d10'),
            }),
            weapons: fc.record({
              close: fc.array(fc.constantFrom('Unarmed', 'Sword', 'Axe'), { maxLength: 2 }),
              ranged: fc.array(fc.constantFrom('Pistol', 'Rifle'), { maxLength: 2 }),
            }),
            equipment: fc.array(fc.constantFrom('Armor', 'Shield'), { maxLength: 2 }),
            psychicPowers: fc.array(fc.constantFrom('Telekinesis', 'Mind Blast'), { maxLength: 1 }),
            warbandAbility: fc.option(
              fc.constantFrom('Scavengers' as WarbandAbility, 'Zealots' as WarbandAbility),
              { nil: null }
            ),
          }),
          { minLength: 3, maxLength: 5 }
        ),
        async (requestSequence) => {
          // Execute requests sequentially and measure each
          const responseTimes: number[] = [];

          for (const params of requestSequence) {
            const startTime = performance.now();
            
            const response = await fetch(`${API_BASE_URL}/cost/calculate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(params),
            });

            const endTime = performance.now();
            const responseTime = endTime - startTime;
            responseTimes.push(responseTime);

            // Verify response is successful
            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data.success).toBe(true);
          }

          // Verify ALL requests met the performance threshold
          for (const responseTime of responseTimes) {
            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
          }

          // Verify average performance is well within threshold
          const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
          expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
        }
      ),
      { numRuns: 20 }
    );
  });
});
