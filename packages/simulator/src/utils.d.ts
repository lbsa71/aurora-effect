/**
 * Utility functions for vector operations and physics calculations
 */
import { Vector3D, SimulationConfig, NormalizedParameters } from './types';
/**
 * Speed of light in km/s
 */
export declare const SPEED_OF_LIGHT = 299792.458;
/**
 * Light-year to parsec conversion
 */
export declare const LY_TO_PC = 0.306601;
/**
 * Parsec to light-year conversion
 */
export declare const PC_TO_LY = 3.26156;
/**
 * Seconds per year
 */
export declare const SECONDS_PER_YEAR = 31557600;
/**
 * Add two vectors
 */
export declare function addVectors(a: Vector3D, b: Vector3D): Vector3D;
/**
 * Subtract two vectors (a - b)
 */
export declare function subtractVectors(a: Vector3D, b: Vector3D): Vector3D;
/**
 * Multiply vector by scalar
 */
export declare function scaleVector(v: Vector3D, scalar: number): Vector3D;
/**
 * Calculate dot product of two vectors
 */
export declare function dotProduct(a: Vector3D, b: Vector3D): number;
/**
 * Calculate magnitude (length) of a vector
 */
export declare function magnitude(v: Vector3D): number;
/**
 * Calculate distance between two positions
 */
export declare function distance(a: Vector3D, b: Vector3D): number;
/**
 * Calculate distance with periodic boundary conditions
 * @param a First position
 * @param b Second position
 * @param boxSize Size of the periodic box
 */
export declare function periodicDistance(a: Vector3D, b: Vector3D, boxSize: Vector3D): number;
/**
 * Calculate normalized parameters from physical parameters
 * Based on equations from Carroll-Nellenback et al. (2019)
 */
export declare function calculateNormalizedParameters(config: SimulationConfig): NormalizedParameters;
/**
 * Generate a random number from normal distribution using Box-Muller transform
 */
export declare function randomNormal(mean?: number, stdDev?: number): number;
/**
 * Generate velocity from Maxwell-Boltzmann distribution
 * @param v_s Average stellar velocity (km/s)
 * @returns 3D velocity vector
 */
export declare function generateMaxwellBoltzmannVelocity(v_s: number): Vector3D;
/**
 * Apply periodic boundary conditions to a position
 */
export declare function applyPeriodicBoundaries(position: Vector3D, boxSize: Vector3D): Vector3D;
//# sourceMappingURL=utils.d.ts.map