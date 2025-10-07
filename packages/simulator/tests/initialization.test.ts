/**
 * Tests for system initialization
 */

import { describe, it, expect } from 'vitest';
import {
  initializeSystems,
  initializeCivilization,
  initializeWithFront,
  initializeRandomSettlement,
} from '../src/initialization';
import { SimulationConfig, SettlementStatus } from '../src/types';

describe('System Initialization', () => {
  const testConfig: SimulationConfig = {
    numSystems: 100,
    boxSize: { x: 50, y: 50, z: 50 },
    density: 0.08,
    settleableFraction: 0.5,
    stellarVelocity: 30,
    probeVelocity: 0.01,
    probeRange: 10,
    probeLaunchPeriod: 100,
    civilizationLifetime: 0,
    initialSettledFraction: 0.01,
    timeStep: 100,
  };

  it('should create the correct number of systems', () => {
    const systems = initializeSystems(testConfig);
    expect(systems).toHaveLength(100);
  });

  it('should place systems within box boundaries', () => {
    const systems = initializeSystems(testConfig);

    for (const system of systems) {
      expect(system.position.x).toBeGreaterThanOrEqual(0);
      expect(system.position.x).toBeLessThanOrEqual(testConfig.boxSize.x);
      expect(system.position.y).toBeGreaterThanOrEqual(0);
      expect(system.position.y).toBeLessThanOrEqual(testConfig.boxSize.y);
      expect(system.position.z).toBeGreaterThanOrEqual(0);
      expect(system.position.z).toBeLessThanOrEqual(testConfig.boxSize.z);
    }
  });

  it('should mark approximately the correct fraction as settleable', () => {
    const systems = initializeSystems(testConfig);
    const settleableCount = systems.filter((s) => s.settleable).length;
    const fraction = settleableCount / systems.length;

    // Allow for some randomness (±20%)
    expect(fraction).toBeGreaterThan(0.3);
    expect(fraction).toBeLessThan(0.7);
  });

  it('should initialize all systems as unsettled', () => {
    const systems = initializeSystems(testConfig);

    for (const system of systems) {
      expect(system.status).toBe(SettlementStatus.UNSETTLED);
      expect(system.civilizationId).toBeNull();
      expect(system.settlementTime).toBeNull();
    }
  });

  it('should assign unique IDs', () => {
    const systems = initializeSystems(testConfig);
    const ids = new Set(systems.map((s) => s.id));
    expect(ids.size).toBe(systems.length);
  });
});

describe('Civilization Initialization', () => {
  it('should create a civilization and settle a system', () => {
    const testConfig: SimulationConfig = {
      numSystems: 100,
      boxSize: { x: 50, y: 50, z: 50 },
      density: 0.08,
      settleableFraction: 0.5,
      stellarVelocity: 30,
      probeVelocity: 0.01,
      probeRange: 10,
      probeLaunchPeriod: 100,
      civilizationLifetime: 10000,
      initialSettledFraction: 0.01,
      timeStep: 100,
    };

    let systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 10000, '#ff0000');

    systems = result.systems;
    const civ = result.civilization;

    expect(civ.id).toBe(1);
    expect(civ.color).toBe('#ff0000');
    expect(civ.active).toBe(true);

    // One system should be settled
    const settledSystems = systems.filter((s) => s.status === SettlementStatus.SETTLED);
    expect(settledSystems).toHaveLength(1);
    expect(settledSystems[0].civilizationId).toBe(1);
  });
});

describe('Front Initialization', () => {
  it('should settle systems in front region', () => {
    const testConfig: SimulationConfig = {
      numSystems: 1000,
      boxSize: { x: 100, y: 100, z: 100 },
      density: 0.08,
      settleableFraction: 1.0, // All settleable for easier testing
      stellarVelocity: 30,
      probeVelocity: 0.01,
      probeRange: 10,
      probeLaunchPeriod: 100,
      civilizationLifetime: 0,
      initialSettledFraction: 0.01,
      timeStep: 100,
    };

    let systems = initializeSystems(testConfig);
    systems = initializeWithFront(systems, testConfig, 1, 0.1);

    // Systems with x < 10 should be settled
    const settledSystems = systems.filter((s) => s.status === SettlementStatus.SETTLED);
    const unsettledSystems = systems.filter((s) => s.status === SettlementStatus.UNSETTLED);

    expect(settledSystems.length).toBeGreaterThan(0);

    for (const system of settledSystems) {
      expect(system.position.x).toBeLessThan(10);
      expect(system.civilizationId).toBe(1);
    }

    for (const system of unsettledSystems) {
      expect(system.position.x).toBeGreaterThanOrEqual(10);
    }
  });
});

describe('Random Settlement Initialization', () => {
  it('should settle the correct fraction of systems', () => {
    const testConfig: SimulationConfig = {
      numSystems: 1000,
      boxSize: { x: 100, y: 100, z: 100 },
      density: 0.08,
      settleableFraction: 1.0,
      stellarVelocity: 30,
      probeVelocity: 0.01,
      probeRange: 10,
      probeLaunchPeriod: 100,
      civilizationLifetime: 0,
      initialSettledFraction: 0.01,
      timeStep: 100,
    };

    let systems = initializeSystems(testConfig);
    systems = initializeRandomSettlement(systems, 0.1, 1);

    const settledCount = systems.filter((s) => s.status === SettlementStatus.SETTLED).length;
    const expectedCount = testConfig.numSystems * 0.1;

    // Should be approximately 10% (±10%)
    expect(settledCount).toBeGreaterThan(expectedCount * 0.9);
    expect(settledCount).toBeLessThan(expectedCount * 1.1);
  });
});
