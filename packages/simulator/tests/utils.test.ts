/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  addVectors,
  subtractVectors,
  scaleVector,
  magnitude,
  distance,
  periodicDistance,
  calculateNormalizedParameters,
  applyPeriodicBoundaries,
  SPEED_OF_LIGHT,
  LY_TO_PC,
} from '../src/utils';
import { Vector3D, SimulationConfig } from '../src/types';

describe('Vector Operations', () => {
  it('should add vectors correctly', () => {
    const a: Vector3D = { x: 1, y: 2, z: 3 };
    const b: Vector3D = { x: 4, y: 5, z: 6 };
    const result = addVectors(a, b);

    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });

  it('should subtract vectors correctly', () => {
    const a: Vector3D = { x: 4, y: 5, z: 6 };
    const b: Vector3D = { x: 1, y: 2, z: 3 };
    const result = subtractVectors(a, b);

    expect(result.x).toBe(3);
    expect(result.y).toBe(3);
    expect(result.z).toBe(3);
  });

  it('should scale vector correctly', () => {
    const v: Vector3D = { x: 1, y: 2, z: 3 };
    const result = scaleVector(v, 2);

    expect(result.x).toBe(2);
    expect(result.y).toBe(4);
    expect(result.z).toBe(6);
  });

  it('should calculate magnitude correctly', () => {
    const v: Vector3D = { x: 3, y: 4, z: 0 };
    expect(magnitude(v)).toBe(5);
  });

  it('should calculate distance correctly', () => {
    const a: Vector3D = { x: 0, y: 0, z: 0 };
    const b: Vector3D = { x: 3, y: 4, z: 0 };
    expect(distance(a, b)).toBe(5);
  });
});

describe('Periodic Boundaries', () => {
  it('should calculate periodic distance correctly', () => {
    const boxSize: Vector3D = { x: 100, y: 100, z: 100 };
    const a: Vector3D = { x: 5, y: 5, z: 5 };
    const b: Vector3D = { x: 95, y: 95, z: 95 };

    // Direct distance would be ~156, but periodic should be much shorter
    const periodicDist = periodicDistance(a, b, boxSize);
    expect(periodicDist).toBeLessThan(20);
  });

  it('should apply periodic boundaries correctly', () => {
    const boxSize: Vector3D = { x: 100, y: 100, z: 100 };
    const pos: Vector3D = { x: 105, y: -5, z: 50 };

    const wrapped = applyPeriodicBoundaries(pos, boxSize);

    expect(wrapped.x).toBeGreaterThanOrEqual(0);
    expect(wrapped.x).toBeLessThan(100);
    expect(wrapped.y).toBeGreaterThanOrEqual(0);
    expect(wrapped.y).toBeLessThan(100);
    expect(wrapped.z).toBe(50);
  });
});

describe('Normalized Parameters', () => {
  it('should calculate normalized parameters correctly', () => {
    const config: SimulationConfig = {
      numSystems: 1000,
      boxSize: { x: 100, y: 100, z: 100 },
      density: 0.08, // systems/pc³
      settleableFraction: 0.2,
      stellarVelocity: 30, // km/s
      probeVelocity: 0.01, // fraction of c
      probeRange: 10, // ly
      probeLaunchPeriod: 100, // years
      civilizationLifetime: 0,
      initialSettledFraction: 0.01,
      timeStep: 100,
    };

    const params = calculateNormalizedParameters(config);

    // η = ρ · f · d_p³
    // ρ = 0.08 pc⁻³, f = 0.2, d_p = 10 ly = 10 * 0.306601 pc
    const dp_pc = 10 * LY_TO_PC;
    const expectedEta = 0.08 * 0.2 * Math.pow(dp_pc, 3);

    expect(params.eta).toBeCloseTo(expectedEta, 3);

    // ν_s = v_s / v_p
    const vp_kms = 0.01 * SPEED_OF_LIGHT;
    const expectedNuS = 30 / vp_kms;

    expect(params.nuS).toBeCloseTo(expectedNuS, 6);

    // Travel time should be positive
    expect(params.probeTravelTime).toBeGreaterThan(0);

    // τ_p = T_p / t_p
    const expectedTauP = 100 / params.probeTravelTime;
    expect(params.tauP).toBeCloseTo(expectedTauP, 3);
  });
});
