/**
 * Analytical models from Carroll-Nellenback et al. (2019)
 * Implements Ticket 1.6: Analytical predictions for validation
 */

import { NormalizedParameters } from './types';

/**
 * Calculate settlement front speed
 * Based on equations from the paper
 *
 * @param params Normalized parameters
 * @returns Front speed ν (normalized units)
 */
export function calculateFrontSpeed(params: NormalizedParameters): number {
  const { eta, nuS, tauP } = params;

  // High density limit (η >> 1): ν ≈ 1 / τ_p
  if (eta > 10) {
    return 1 / tauP;
  }

  // Low density limit (η << 1): ν ≈ ν_s
  if (eta < 0.1) {
    return nuS;
  }

  // Intermediate density: empirical interpolation
  // ν ≈ ν_s + (1/τ_p - ν_s) * f(η)
  // where f(η) is a smooth transition function

  // Use logistic function for transition
  const transition = 1 / (1 + Math.exp(-(eta - 1) / 0.3));
  const vHigh = 1 / tauP;
  const vLow = nuS;

  return vLow + (vHigh - vLow) * transition;
}

/**
 * Calculate critical density threshold η_1
 * Below this, no settlement occurs
 */
export function calculateEta1(): number {
  // From paper: η_1 ≈ 0.88 (percolation threshold for 3D random graph)
  return 0.88;
}

/**
 * Calculate critical density threshold η_2
 * Transition from diffusion-dominated to probe-dominated
 */
export function calculateEta2(nuS: number, tauP: number): number {
  // Approximate threshold where probe speed equals stellar diffusion
  // η_2 is where ν_s ≈ 1/τ_p
  return Math.pow(tauP * nuS, 1 / 3);
}

/**
 * Calculate critical density threshold η_3
 * Full connectivity threshold
 */
export function calculateEta3(): number {
  // From paper: systems become fully connected
  return 2.0;
}

/**
 * Calculate critical density threshold η_4
 * High density regime
 */
export function calculateEta4(): number {
  return 10.0;
}

/**
 * Calculate steady-state settled fraction X_eq
 * With finite civilization lifetime
 *
 * @param params Normalized parameters
 * @param Ts Civilization lifetime (years)
 * @param tp Probe travel time (years)
 * @returns Equilibrium settled fraction (0 ≤ X_eq ≤ 1)
 */
export function calculateSteadyState(
  params: NormalizedParameters,
  Ts: number,
  tp: number
): number {
  const { eta, tauP } = params;

  // If infinite lifetime, X_eq → 1 (full settlement)
  if (Ts === 0) {
    return 1.0;
  }

  // Normalized lifetime
  const tauS = Ts / tp;

  // Death rate (inverse lifetime)
  const deathRate = 1 / tauS;

  // Birth rate (settlement rate)
  // Proportional to front speed and density
  const frontSpeed = calculateFrontSpeed(params);
  const birthRate = frontSpeed * eta / tauP;

  // Equilibrium: birth rate = death rate * X_eq
  // X_eq = birth rate / death rate
  let Xeq = birthRate / deathRate;

  // Cap at 1.0
  if (Xeq > 1.0) {
    Xeq = 1.0;
  }

  // Below percolation threshold, no settlement
  if (eta < calculateEta1()) {
    return 0.0;
  }

  return Xeq;
}

/**
 * Calculate settlement front thickness Δξ
 *
 * @param params Normalized parameters
 * @returns Front thickness (normalized units)
 */
export function calculateFrontThickness(params: NormalizedParameters): number {
  const { eta, tauP } = params;

  // From paper: Δξ ∝ sqrt(η) * τ_p
  return Math.sqrt(eta) * tauP;
}

/**
 * Calculate galaxy crossing time
 *
 * @param galaxySize Size of galaxy (light-years)
 * @param frontSpeed Settlement front speed (ly/year)
 * @returns Crossing time (years)
 */
export function calculateGalaxyCrossingTime(galaxySize: number, frontSpeed: number): number {
  return galaxySize / frontSpeed;
}

/**
 * Calculate physical front speed from normalized parameters
 *
 * @param normalizedSpeed Normalized front speed ν
 * @param probeVelocity Probe velocity (fraction of c)
 * @returns Physical front speed (ly/year)
 */
export function calculatePhysicalFrontSpeed(
  normalizedSpeed: number,
  probeVelocity: number
): number {
  // ν is in units of v_p, convert to ly/year
  // v_p in fraction of c, c = 1 ly/year
  return normalizedSpeed * probeVelocity;
}

/**
 * Estimate Milky Way crossing time
 *
 * @param params Normalized parameters
 * @param probeVelocity Probe velocity (fraction of c)
 * @returns Crossing time (Myr)
 */
export function estimateMilkyWayCrossingTime(
  params: NormalizedParameters,
  probeVelocity: number
): number {
  const milkyWayDiameter = 100000; // light-years
  const normalizedSpeed = calculateFrontSpeed(params);
  const physicalSpeed = calculatePhysicalFrontSpeed(normalizedSpeed, probeVelocity);

  const crossingTimeYears = calculateGalaxyCrossingTime(milkyWayDiameter, physicalSpeed);

  // Convert to Myr
  return crossingTimeYears / 1e6;
}

/**
 * Calculate logistic growth curve parameters
 * X(t) = X_eq / (1 + ((X_eq / X_0) - 1) * exp(-r * t))
 *
 * @param Xeq Equilibrium fraction
 * @param X0 Initial fraction
 * @param growthRate Growth rate parameter
 * @param time Time
 * @returns Settled fraction at time t
 */
export function logisticGrowth(Xeq: number, X0: number, growthRate: number, time: number): number {
  if (X0 <= 0 || X0 >= Xeq) return Xeq;

  const ratio = Xeq / X0 - 1;
  return Xeq / (1 + ratio * Math.exp(-growthRate * time));
}
