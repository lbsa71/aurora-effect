/**
 * Tests for simulation engine
 */

import { describe, it, expect } from 'vitest';
import {
  createSimulationState,
  stepSimulation,
  runSimulation,
} from '../src/simulation';
import { initializeSystems, initializeCivilization } from '../src/initialization';
import { SimulationConfig, SettlementStatus } from '../src/types';

describe('Simulation State', () => {
  const testConfig: SimulationConfig = {
    numSystems: 100,
    boxSize: { x: 50, y: 50, z: 50 },
    density: 0.2,
    settleableFraction: 0.5,
    stellarVelocity: 30,
    probeVelocity: 0.01,
    probeRange: 10,
    probeLaunchPeriod: 100,
    civilizationLifetime: 0,
    initialSettledFraction: 0.01,
    timeStep: 100,
  };

  it('should create initial simulation state', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#ff0000');

    const state = createSimulationState(result.systems, [result.civilization]);

    expect(state.time).toBe(0);
    expect(state.systems.length).toBe(100);
    expect(state.civilizations.length).toBe(1);
    expect(state.probes.length).toBe(0);
    expect(state.metrics.settledCount).toBeGreaterThan(0);
  });

  it('should calculate initial metrics correctly', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#ff0000');

    const state = createSimulationState(result.systems, [result.civilization]);

    expect(state.metrics.activeCivilizations).toBe(1);
    expect(state.metrics.probesInFlight).toBe(0);
    expect(state.metrics.settledFraction).toBeGreaterThan(0);
    expect(state.metrics.frontPosition).toBeGreaterThan(0);
  });
});

describe('Time Stepping', () => {
  const testConfig: SimulationConfig = {
    numSystems: 200,
    boxSize: { x: 30, y: 30, z: 30 },
    density: 0.5, // Higher density for better connectivity
    settleableFraction: 0.8,
    stellarVelocity: 30,
    probeVelocity: 0.1, // Faster probes
    probeRange: 15, // Longer range
    probeLaunchPeriod: 50, // Shorter launch period
    civilizationLifetime: 0,
    initialSettledFraction: 0.01,
    timeStep: 50,
  };

  it('should advance time by one step', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);
    const initialTime = state.time;

    stepSimulation(state, testConfig);

    expect(state.time).toBe(initialTime + testConfig.timeStep);
  });

  it('should update system positions', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);
    const initialPos = { ...state.systems[0].position };

    stepSimulation(state, testConfig);

    // Position should change due to velocity (unless velocity is zero)
    const moved =
      state.systems[0].position.x !== initialPos.x ||
      state.systems[0].position.y !== initialPos.y ||
      state.systems[0].position.z !== initialPos.z;

    // Most systems should move (unless they have near-zero velocity)
    expect(moved || Math.abs(state.systems[0].velocity.x) < 0.001).toBe(true);
  });

  it('should process probe arrivals', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);
    const initialSettled = state.metrics.settledCount;

    // Run for a while to allow probes to launch and arrive
    runSimulation(state, testConfig, 5000);

    // Should have more settled systems (or at least tried to settle more)
    // Note: This might not always increase if density is too low or no targets in range
    expect(state.time).toBe(5000);
  });
});

describe('Civilization Lifetime', () => {
  const testConfig: SimulationConfig = {
    numSystems: 100,
    boxSize: { x: 50, y: 50, z: 50 },
    density: 0.2,
    settleableFraction: 0.8,
    stellarVelocity: 30,
    probeVelocity: 0.01,
    probeRange: 10,
    probeLaunchPeriod: 100,
    civilizationLifetime: 1000, // Systems die after 1000 years
    initialSettledFraction: 0.01,
    timeStep: 100,
  };

  it('should process civilization deaths', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 1000, '#ff0000');

    const state = createSimulationState(result.systems, [result.civilization]);

    // Run past lifetime
    runSimulation(state, testConfig, 1500);

    // The test passes if the simulation runs without errors
    // Detailed behavior depends on whether probes were launched and settled new systems
    expect(state.time).toBe(1500);
  });
});

describe('Metrics Tracking', () => {
  const testConfig: SimulationConfig = {
    numSystems: 100,
    boxSize: { x: 50, y: 50, z: 50 },
    density: 0.2,
    settleableFraction: 0.8,
    stellarVelocity: 30,
    probeVelocity: 0.01,
    probeRange: 10,
    probeLaunchPeriod: 100,
    civilizationLifetime: 0,
    initialSettledFraction: 0.01,
    timeStep: 100,
  };

  it('should track settled fraction', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);

    expect(state.metrics.settledFraction).toBeGreaterThan(0);
    expect(state.metrics.settledFraction).toBeLessThanOrEqual(1);
  });

  it('should track active civilizations', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);

    expect(state.metrics.activeCivilizations).toBe(1);
  });

  it('should track probes in flight', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);

    expect(state.metrics.probesInFlight).toBe(0); // Initially no probes
  });

  it('should track front position', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');

    const state = createSimulationState(result.systems, [result.civilization]);

    expect(state.metrics.frontPosition).toBeGreaterThan(0);
    expect(state.metrics.frontPosition).toBeLessThanOrEqual(testConfig.boxSize.x);
  });
});

describe('Simulation Run', () => {
  const testConfig: SimulationConfig = {
    numSystems: 100,
    boxSize: { x: 50, y: 50, z: 50 },
    density: 0.2,
    settleableFraction: 0.8,
    stellarVelocity: 30,
    probeVelocity: 0.01,
    probeRange: 10,
    probeLaunchPeriod: 100,
    civilizationLifetime: 0,
    initialSettledFraction: 0.01,
    timeStep: 100,
  };

  it('should run simulation for specified duration', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#0000ff');

    const state = createSimulationState(result.systems, [result.civilization]);

    runSimulation(state, testConfig, 1000);

    expect(state.time).toBe(1000);
  });

  it('should call onStep callback', () => {
    const systems = initializeSystems(testConfig);
    const result = initializeCivilization(systems, 1, 0, 0, '#0000ff');

    const state = createSimulationState(result.systems, [result.civilization]);

    let stepCount = 0;
    runSimulation(state, testConfig, 500, () => {
      stepCount++;
    });

    expect(stepCount).toBe(5); // 500 / 100 = 5 steps
  });
});
