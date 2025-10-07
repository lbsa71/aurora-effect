"use strict";
/**
 * Utility functions for vector operations and physics calculations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECONDS_PER_YEAR = exports.PC_TO_LY = exports.LY_TO_PC = exports.SPEED_OF_LIGHT = void 0;
exports.addVectors = addVectors;
exports.subtractVectors = subtractVectors;
exports.scaleVector = scaleVector;
exports.dotProduct = dotProduct;
exports.magnitude = magnitude;
exports.distance = distance;
exports.periodicDistance = periodicDistance;
exports.calculateNormalizedParameters = calculateNormalizedParameters;
exports.randomNormal = randomNormal;
exports.generateMaxwellBoltzmannVelocity = generateMaxwellBoltzmannVelocity;
exports.applyPeriodicBoundaries = applyPeriodicBoundaries;
/**
 * Speed of light in km/s
 */
exports.SPEED_OF_LIGHT = 299792.458;
/**
 * Light-year to parsec conversion
 */
exports.LY_TO_PC = 0.306601;
/**
 * Parsec to light-year conversion
 */
exports.PC_TO_LY = 3.26156;
/**
 * Seconds per year
 */
exports.SECONDS_PER_YEAR = 31557600;
/**
 * Add two vectors
 */
function addVectors(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}
/**
 * Subtract two vectors (a - b)
 */
function subtractVectors(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    };
}
/**
 * Multiply vector by scalar
 */
function scaleVector(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar,
        z: v.z * scalar,
    };
}
/**
 * Calculate dot product of two vectors
 */
function dotProduct(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
/**
 * Calculate magnitude (length) of a vector
 */
function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
/**
 * Calculate distance between two positions
 */
function distance(a, b) {
    return magnitude(subtractVectors(a, b));
}
/**
 * Calculate distance with periodic boundary conditions
 * @param a First position
 * @param b Second position
 * @param boxSize Size of the periodic box
 */
function periodicDistance(a, b, boxSize) {
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
function calculateNormalizedParameters(config) {
    // Convert probe velocity from fraction of c to km/s
    const vp_kms = config.probeVelocity * exports.SPEED_OF_LIGHT;
    // Calculate probe travel time: t_p = d_p / v_p
    // d_p is in light-years, v_p is in km/s
    // Convert: (d_p ly) * (9.461e12 km/ly) / (v_p km/s) / (seconds/year) = years
    const travelTimeYears = (config.probeRange * 9.461e12) / (vp_kms * exports.SECONDS_PER_YEAR);
    // η = ρ · f · d_p³
    // ρ is in systems/pc³, d_p is in ly, need to convert
    const dp_pc = config.probeRange * exports.LY_TO_PC;
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
function randomNormal(mean = 0, stdDev = 1) {
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
function generateMaxwellBoltzmannVelocity(v_s) {
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
function applyPeriodicBoundaries(position, boxSize) {
    return {
        x: ((position.x % boxSize.x) + boxSize.x) % boxSize.x,
        y: ((position.y % boxSize.y) + boxSize.y) % boxSize.y,
        z: ((position.z % boxSize.z) + boxSize.z) % boxSize.z,
    };
}
//# sourceMappingURL=utils.js.map