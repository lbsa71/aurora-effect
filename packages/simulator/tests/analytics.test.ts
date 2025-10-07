/**
 * Tests for analytical models
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFrontSpeed,
  calculateEta1,
  calculateEta2,
  calculateEta3,
  calculateEta4,
  calculateSteadyState,
  calculateFrontThickness,
  calculateGalaxyCrossingTime,
  calculatePhysicalFrontSpeed,
  estimateMilkyWayCrossingTime,
  logisticGrowth,
} from '../src/analytics';
import { NormalizedParameters } from '../src/types';

describe('Critical Density Thresholds', () => {
  it('should calculate eta_1 (percolation threshold)', () => {
    const eta1 = calculateEta1();
    expect(eta1).toBeCloseTo(0.88, 2);
  });

  it('should calculate eta_2 (transition threshold)', () => {
    const eta2 = calculateEta2(0.01, 0.1);
    expect(eta2).toBeGreaterThan(0);
  });

  it('should calculate eta_3 (full connectivity)', () => {
    const eta3 = calculateEta3();
    expect(eta3).toBe(2.0);
  });

  it('should calculate eta_4 (high density regime)', () => {
    const eta4 = calculateEta4();
    expect(eta4).toBe(10.0);
  });
});

describe('Front Speed Calculations', () => {
  it('should calculate high density front speed', () => {
    const params: NormalizedParameters = {
      eta: 15.0, // High density
      nuS: 0.01,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const speed = calculateFrontSpeed(params);
    // In high density regime, ν ≈ 1/τ_p = 1/0.1 = 10
    expect(speed).toBeCloseTo(10, 0);
  });

  it('should calculate low density front speed', () => {
    const params: NormalizedParameters = {
      eta: 0.05, // Low density
      nuS: 0.05,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const speed = calculateFrontSpeed(params);
    // In low density regime, ν ≈ ν_s = 0.05
    expect(speed).toBeCloseTo(0.05, 1);
  });

  it('should interpolate in intermediate density regime', () => {
    const params: NormalizedParameters = {
      eta: 1.0, // Intermediate
      nuS: 0.01,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const speed = calculateFrontSpeed(params);
    // Should be between ν_s (0.01) and 1/τ_p (10)
    expect(speed).toBeGreaterThan(0.01);
    expect(speed).toBeLessThan(10);
  });
});

describe('Steady State Calculations', () => {
  it('should return 1.0 for infinite lifetime', () => {
    const params: NormalizedParameters = {
      eta: 1.0,
      nuS: 0.01,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const Xeq = calculateSteadyState(params, 0, 1000);
    expect(Xeq).toBe(1.0);
  });

  it('should return 0.0 below percolation threshold', () => {
    const params: NormalizedParameters = {
      eta: 0.5, // Below eta_1 ≈ 0.88
      nuS: 0.01,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const Xeq = calculateSteadyState(params, 10000, 1000);
    expect(Xeq).toBe(0.0);
  });

  it('should calculate equilibrium for finite lifetime', () => {
    const params: NormalizedParameters = {
      eta: 2.0, // Above percolation threshold
      nuS: 0.01,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const Xeq = calculateSteadyState(params, 10000, 1000);
    expect(Xeq).toBeGreaterThan(0);
    expect(Xeq).toBeLessThanOrEqual(1.0);
  });
});

describe('Front Thickness', () => {
  it('should calculate front thickness', () => {
    const params: NormalizedParameters = {
      eta: 1.0,
      nuS: 0.01,
      tauP: 0.5,
      probeTravelTime: 1000,
    };

    const thickness = calculateFrontThickness(params);
    // Δξ ∝ sqrt(η) * τ_p = sqrt(1.0) * 0.5 = 0.5
    expect(thickness).toBeCloseTo(0.5, 1);
  });
});

describe('Galaxy Crossing Time', () => {
  it('should calculate crossing time', () => {
    const galaxySize = 100000; // ly
    const frontSpeed = 0.01; // ly/year

    const crossingTime = calculateGalaxyCrossingTime(galaxySize, frontSpeed);
    expect(crossingTime).toBe(10000000); // 10 million years
  });

  it('should calculate Milky Way crossing time', () => {
    const params: NormalizedParameters = {
      eta: 1.0,
      nuS: 0.01,
      tauP: 0.1,
      probeTravelTime: 1000,
    };

    const crossingTime = estimateMilkyWayCrossingTime(params, 0.01);
    expect(crossingTime).toBeGreaterThan(0);
    expect(crossingTime).toBeLessThan(1000); // Should be reasonable (< 1000 Myr)
  });
});

describe('Physical Front Speed', () => {
  it('should convert normalized speed to physical units', () => {
    const normalizedSpeed = 2.0;
    const probeVelocity = 0.01; // 1% of c

    const physicalSpeed = calculatePhysicalFrontSpeed(normalizedSpeed, probeVelocity);
    expect(physicalSpeed).toBe(0.02); // 2% of c = 0.02 ly/year
  });
});

describe('Logistic Growth', () => {
  it('should return Xeq when X0 approaches Xeq', () => {
    const result = logisticGrowth(1.0, 0.99, 0.1, 100);
    expect(result).toBeCloseTo(1.0, 1);
  });

  it('should start at X0 when time is 0', () => {
    const result = logisticGrowth(1.0, 0.01, 0.1, 0);
    expect(result).toBeCloseTo(0.01, 2);
  });

  it('should approach Xeq for large time', () => {
    const result = logisticGrowth(0.5, 0.01, 0.1, 1000);
    expect(result).toBeCloseTo(0.5, 1);
  });

  it('should follow logistic curve shape', () => {
    const t1 = logisticGrowth(1.0, 0.01, 0.1, 10);
    const t2 = logisticGrowth(1.0, 0.01, 0.1, 20);
    const t3 = logisticGrowth(1.0, 0.01, 0.1, 30);

    // Should be monotonically increasing
    expect(t2).toBeGreaterThan(t1);
    expect(t3).toBeGreaterThan(t2);

    // Should approach equilibrium
    expect(t3).toBeLessThan(1.0);
  });
});
