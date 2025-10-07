"use strict";
/**
 * Analytical models from Carroll-Nellenback et al. (2019)
 * Implements Ticket 1.6: Analytical predictions for validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFrontSpeed = calculateFrontSpeed;
exports.calculateEta1 = calculateEta1;
exports.calculateEta2 = calculateEta2;
exports.calculateEta3 = calculateEta3;
exports.calculateEta4 = calculateEta4;
exports.calculateSteadyState = calculateSteadyState;
exports.calculateFrontThickness = calculateFrontThickness;
exports.calculateGalaxyCrossingTime = calculateGalaxyCrossingTime;
exports.calculatePhysicalFrontSpeed = calculatePhysicalFrontSpeed;
exports.estimateMilkyWayCrossingTime = estimateMilkyWayCrossingTime;
exports.logisticGrowth = logisticGrowth;
/**
 * Calculate settlement front speed
 * Based on equations from the paper
 *
 * @param params Normalized parameters
 * @returns Front speed ν (normalized units)
 */
function calculateFrontSpeed(params) {
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
function calculateEta1() {
    // From paper: η_1 ≈ 0.88 (percolation threshold for 3D random graph)
    return 0.88;
}
/**
 * Calculate critical density threshold η_2
 * Transition from diffusion-dominated to probe-dominated
 */
function calculateEta2(nuS, tauP) {
    // Approximate threshold where probe speed equals stellar diffusion
    // η_2 is where ν_s ≈ 1/τ_p
    return Math.pow(tauP * nuS, 1 / 3);
}
/**
 * Calculate critical density threshold η_3
 * Full connectivity threshold
 */
function calculateEta3() {
    // From paper: systems become fully connected
    return 2.0;
}
/**
 * Calculate critical density threshold η_4
 * High density regime
 */
function calculateEta4() {
    return 10.0;
}
/**
 * Calculate steady-state settled fraction X_eq
 * With finite civilization lifetime
 *
 * @param TlOrParams Effective launch time (years) OR normalized parameters
 * @param Ts Civilization lifetime (years)
 * @param tp Optional probe travel time (years) - used when first param is NormalizedParameters
 * @returns Equilibrium settled fraction (0 ≤ X_eq ≤ 1)
 */
function calculateSteadyState(TlOrParams, Ts, tp) {
    // Handle overload: if first param is a number, use simple formula
    if (typeof TlOrParams === 'number') {
        const Tl = TlOrParams;
        // If infinite lifetime, X_eq → 1 (full settlement)
        if (Ts === 0) {
            return 1.0;
        }
        // Simple steady-state formula: X_eq = 1 - T_l/T_s
        // This assumes T_s > T_l for equilibrium
        if (Ts <= Tl) {
            return 0.0;
        }
        const Xeq = 1 - Tl / Ts;
        return Math.max(0, Math.min(1, Xeq));
    }
    // Handle case where first param is NormalizedParameters
    const params = TlOrParams;
    const { eta, tauP } = params;
    if (tp === undefined) {
        throw new Error('Probe travel time tp is required when using NormalizedParameters');
    }
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
function calculateFrontThickness(params) {
    const { eta, tauP } = params;
    // From paper: Δξ ∝ sqrt(η) * τ_p
    return Math.sqrt(eta) * tauP;
}
/**
 * Calculate galaxy crossing time
 *
 * @param paramsOrGalaxySize Normalized parameters OR galaxy size (light-years)
 * @param probeVelocityOrFrontSpeed Probe velocity (fraction of c) OR front speed (ly/year)
 * @param galaxySize Optional galaxy size when first param is NormalizedParameters
 * @returns Crossing time (years)
 */
function calculateGalaxyCrossingTime(paramsOrGalaxySize, probeVelocityOrFrontSpeed, galaxySize) {
    // Handle overload: if first param is a number, use simple formula
    if (typeof paramsOrGalaxySize === 'number') {
        const size = paramsOrGalaxySize;
        const frontSpeed = probeVelocityOrFrontSpeed;
        return size / frontSpeed;
    }
    // Handle case where first param is NormalizedParameters
    const params = paramsOrGalaxySize;
    const probeVelocity = probeVelocityOrFrontSpeed;
    const size = galaxySize !== undefined ? galaxySize : 100000; // Default to Milky Way size
    const normalizedSpeed = calculateFrontSpeed(params);
    const physicalSpeed = calculatePhysicalFrontSpeed(normalizedSpeed, probeVelocity);
    return size / physicalSpeed;
}
/**
 * Calculate physical front speed from normalized parameters
 *
 * @param normalizedSpeed Normalized front speed ν
 * @param probeVelocity Probe velocity (fraction of c)
 * @returns Physical front speed (ly/year)
 */
function calculatePhysicalFrontSpeed(normalizedSpeed, probeVelocity) {
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
function estimateMilkyWayCrossingTime(params, probeVelocity) {
    const milkyWayDiameter = 100000; // light-years
    const normalizedSpeed = calculateFrontSpeed(params);
    const physicalSpeed = calculatePhysicalFrontSpeed(normalizedSpeed, probeVelocity);
    const crossingTimeYears = calculateGalaxyCrossingTime(milkyWayDiameter, physicalSpeed);
    // Convert to Myr
    return crossingTimeYears / 1e6;
}
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
function logisticGrowth(timeOrXeq, growthRateOrX0, XeqOrGrowthRate, time) {
    // Handle simple case: logisticGrowth(time, growthRate) with X0=0.01, Xeq=1.0
    if (XeqOrGrowthRate === undefined && time === undefined) {
        const t = timeOrXeq;
        const k = growthRateOrX0;
        const X0 = 0.01;
        const Xeq = 1.0;
        if (X0 <= 0 || X0 >= Xeq)
            return Xeq;
        const ratio = Xeq / X0 - 1;
        return Xeq / (1 + ratio * Math.exp(-k * t));
    }
    // Handle full case: logisticGrowth(Xeq, X0, growthRate, time)
    const Xeq = timeOrXeq;
    const X0 = growthRateOrX0;
    const growthRate = XeqOrGrowthRate;
    const t = time;
    if (X0 <= 0 || X0 >= Xeq)
        return Xeq;
    const ratio = Xeq / X0 - 1;
    return Xeq / (1 + ratio * Math.exp(-growthRate * t));
}
//# sourceMappingURL=analytics.js.map