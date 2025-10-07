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
export declare function calculateFrontSpeed(params: NormalizedParameters): number;
/**
 * Calculate critical density threshold η_1
 * Below this, no settlement occurs
 */
export declare function calculateEta1(): number;
/**
 * Calculate critical density threshold η_2
 * Transition from diffusion-dominated to probe-dominated
 */
export declare function calculateEta2(nuS: number, tauP: number): number;
/**
 * Calculate critical density threshold η_3
 * Full connectivity threshold
 */
export declare function calculateEta3(): number;
/**
 * Calculate critical density threshold η_4
 * High density regime
 */
export declare function calculateEta4(): number;
/**
 * Calculate steady-state settled fraction X_eq
 * With finite civilization lifetime
 *
 * @param TlOrParams Effective launch time (years) OR normalized parameters
 * @param Ts Civilization lifetime (years)
 * @param tp Optional probe travel time (years) - used when first param is NormalizedParameters
 * @returns Equilibrium settled fraction (0 ≤ X_eq ≤ 1)
 */
export declare function calculateSteadyState(TlOrParams: number | NormalizedParameters, Ts: number, tp?: number): number;
/**
 * Calculate settlement front thickness Δξ
 *
 * @param params Normalized parameters
 * @returns Front thickness (normalized units)
 */
export declare function calculateFrontThickness(params: NormalizedParameters): number;
/**
 * Calculate galaxy crossing time
 *
 * @param paramsOrGalaxySize Normalized parameters OR galaxy size (light-years)
 * @param probeVelocityOrFrontSpeed Probe velocity (fraction of c) OR front speed (ly/year)
 * @param galaxySize Optional galaxy size when first param is NormalizedParameters
 * @returns Crossing time (years)
 */
export declare function calculateGalaxyCrossingTime(paramsOrGalaxySize: NormalizedParameters | number, probeVelocityOrFrontSpeed: number, galaxySize?: number): number;
/**
 * Calculate physical front speed from normalized parameters
 *
 * @param normalizedSpeed Normalized front speed ν
 * @param probeVelocity Probe velocity (fraction of c)
 * @returns Physical front speed (ly/year)
 */
export declare function calculatePhysicalFrontSpeed(normalizedSpeed: number, probeVelocity: number): number;
/**
 * Estimate Milky Way crossing time
 *
 * @param params Normalized parameters
 * @param probeVelocity Probe velocity (fraction of c)
 * @returns Crossing time (Myr)
 */
export declare function estimateMilkyWayCrossingTime(params: NormalizedParameters, probeVelocity: number): number;
/**
 * Calculate logistic growth curve
 * X(t) = X_eq / (1 + ((X_eq / X_0) - 1) * exp(-k * t))
 * Can be called with different signatures for convenience
 *
 * @param timeOrXeq Time OR equilibrium fraction
 * @param growthRateOrX0 Growth rate OR initial fraction
 * @param XeqOrGrowthRate Optional equilibrium fraction OR growth rate
 * @param time Optional time
 * @returns Settled fraction at time t
 */
export declare function logisticGrowth(timeOrXeq: number, growthRateOrX0: number, XeqOrGrowthRate?: number, time?: number): number;
//# sourceMappingURL=analytics.d.ts.map