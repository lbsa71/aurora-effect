/**
 * Utility functions for vector operations and physics calculations
 */

import { Vector3D, SimulationConfig, NormalizedParameters } from './types';

/**
 * Speed of light in km/s
 */
export const SPEED_OF_LIGHT = 299792.458;

/**
 * Light-year to parsec conversion
 */
export const LY_TO_PC = 0.306601;

/**
 * Parsec to light-year conversion
 */
export const PC_TO_LY = 3.26156;

/**
 * Seconds per year
 */
export const SECONDS_PER_YEAR = 31557600;

/**
 * Add two vectors
 */
export function addVectors(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

/**
 * Subtract two vectors (a - b)
 */
export function subtractVectors(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

/**
 * Multiply vector by scalar
 */
export function scaleVector(v: Vector3D, scalar: number): Vector3D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
  };
}

/**
 * Calculate dot product of two vectors
 */
export function dotProduct(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate magnitude (length) of a vector
 */
export function magnitude(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Calculate distance between two positions
 */
export function distance(a: Vector3D, b: Vector3D): number {
  return magnitude(subtractVectors(a, b));
}

/**
 * Calculate distance with periodic boundary conditions
 * @param a First position
 * @param b Second position
 * @param boxSize Size of the periodic box
 */
export function periodicDistance(a: Vector3D, b: Vector3D, boxSize: Vector3D): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const dz = Math.abs(a.z - b.z);

  const pdx = Math.min(dx, boxSize.x - dx);
  const pdy = Math.min(dy, boxSize.y - dy);
  const pdz = Math.min(dz, boxSize.z - dz);

  return Math.sqrt(pdx * pdx + pdy * pdy + pdz * pdz);
}

/**
 * Calculate normalized parameters from physical parameters
 * Based on equations from Carroll-Nellenback et al. (2019)
 */
export function calculateNormalizedParameters(config: SimulationConfig): NormalizedParameters {
  // Convert probe velocity from fraction of c to km/s
  const vp_kms = config.probeVelocity * SPEED_OF_LIGHT;

  // Calculate probe travel time: t_p = d_p / v_p
  // d_p is in light-years, v_p is in km/s
  // Convert: (d_p ly) * (9.461e12 km/ly) / (v_p km/s) / (seconds/year) = years
  const travelTimeYears = (config.probeRange * 9.461e12) / (vp_kms * SECONDS_PER_YEAR);

  // η = ρ · f · d_p³
  // ρ is in systems/pc³, d_p is in ly, need to convert
  const dp_pc = config.probeRange * LY_TO_PC;
  const eta = config.density * config.settleableFraction * Math.pow(dp_pc, 3);

  // ν_s = v_s / v_p
  const nuS = config.stellarVelocity / vp_kms;

  // τ_p = T_p / t_p
  const tauP = config.probeLaunchPeriod / travelTimeYears;

  return {
    eta,
    nuS,
    tauP,
    probeTravelTime: travelTimeYears,
  };
}

/**
 * Generate a random number from normal distribution using Box-Muller transform
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Generate velocity from Maxwell-Boltzmann distribution
 * @param v_s Average stellar velocity (km/s)
 * @returns 3D velocity vector
 */
export function generateMaxwellBoltzmannVelocity(v_s: number): Vector3D {
  // Maxwell-Boltzmann in 3D: each component is normally distributed
  // with standard deviation σ = v_s / sqrt(3)
  const sigma = v_s / Math.sqrt(3);

  return {
    x: randomNormal(0, sigma),
    y: randomNormal(0, sigma),
    z: randomNormal(0, sigma),
  };
}

/**
 * Apply periodic boundary conditions to a position
 */
export function applyPeriodicBoundaries(position: Vector3D, boxSize: Vector3D): Vector3D {
  return {
    x: ((position.x % boxSize.x) + boxSize.x) % boxSize.x,
    y: ((position.y % boxSize.y) + boxSize.y) % boxSize.y,
    z: ((position.z % boxSize.z) + boxSize.z) % boxSize.z,
  };
}
