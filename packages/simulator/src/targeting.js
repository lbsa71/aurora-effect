"use strict";
/**
 * Probe targeting algorithm
 * Implements Ticket 1.4: Core algorithm for settled systems to target and launch probes
 * Based on Carroll-Nellenback et al. (2019) Algorithm
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateInterceptTime = calculateInterceptTime;
exports.findBestTarget = findBestTarget;
exports.createProbe = createProbe;
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * Calculate intercept time for a probe to reach a target system
 * Accounts for relative motion of both systems
 *
 * @param source Source system
 * @param target Target system
 * @param probeVelocity Probe velocity in km/s
 * @param boxSize Size of simulation box for periodic boundaries
 * @returns Intercept time in years, or null if intercept not possible
 */
function calculateInterceptTime(source, target, probeVelocity, boxSize) {
    // Get relative position (with periodic boundaries handled)
    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;
    const dz = target.position.z - source.position.z;
    // Apply periodic boundary conditions (closest image)
    const pdx = dx > boxSize.x / 2 ? dx - boxSize.x : dx < -boxSize.x / 2 ? dx + boxSize.x : dx;
    const pdy = dy > boxSize.y / 2 ? dy - boxSize.y : dy < -boxSize.y / 2 ? dy + boxSize.y : dy;
    const pdz = dz > boxSize.z / 2 ? dz - boxSize.z : dz < -boxSize.z / 2 ? dz + boxSize.z : dz;
    const relPos = { x: pdx, y: pdy, z: pdz };
    // Relative velocity (target velocity - source velocity)
    const relVel = (0, utils_1.subtractVectors)(target.velocity, source.velocity);
    // Convert probe velocity from km/s to ly/year
    // 1 ly/year = 9.461e12 km / 31557600 s = 299792.458 km/s = c
    const probeVelLyPerYear = probeVelocity / 299792.458;
    // Solve for intercept time using quadratic equation
    // Position of target at time t: r_target(t) = relPos + relVel * t * (seconds_per_year / ly_to_km)
    // Probe must travel: |r_target(t)| = v_probe * t
    //
    // Convert stellar velocities from km/s to ly/year
    const relVelLyPerYear = (0, utils_1.scaleVector)(relVel, (1 / 299792.458));
    // Quadratic equation: a*t^2 + b*t + c = 0
    // where we're solving |relPos + relVel*t|^2 = (v_probe*t)^2
    const a = relVelLyPerYear.x * relVelLyPerYear.x +
        relVelLyPerYear.y * relVelLyPerYear.y +
        relVelLyPerYear.z * relVelLyPerYear.z -
        probeVelLyPerYear * probeVelLyPerYear;
    const b = 2 * (relPos.x * relVelLyPerYear.x + relPos.y * relVelLyPerYear.y + relPos.z * relVelLyPerYear.z);
    const c = relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z;
    // Check if target is moving faster than probe (no intercept possible)
    if (a >= 0) {
        // Use simple approximation for slow stellar motions
        const dist = Math.sqrt(c);
        return dist / probeVelLyPerYear;
    }
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        // No real solution - probe can't catch target
        return null;
    }
    // Two solutions - take the positive one (future intercept)
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    // Return the smallest positive time
    if (t1 > 0 && t2 > 0) {
        return Math.min(t1, t2);
    }
    else if (t1 > 0) {
        return t1;
    }
    else if (t2 > 0) {
        return t2;
    }
    return null;
}
/**
 * Find the best target system for a settled system to launch a probe to
 *
 * @param source The settled system launching the probe
 * @param systems All star systems
 * @param config Simulation configuration
 * @param currentTime Current simulation time
 * @returns Target system ID, or null if no valid target
 */
function findBestTarget(source, systems, config, currentTime) {
    // Check if source is ready to launch (time since last launch >= T_p)
    if (source.lastLaunchTime !== null) {
        const timeSinceLastLaunch = currentTime - source.lastLaunchTime;
        if (timeSinceLastLaunch < config.probeLaunchPeriod) {
            return null; // Not ready yet
        }
    }
    // Convert probe velocity from fraction of c to km/s
    const probeVelocityKms = config.probeVelocity * 299792.458;
    let bestTarget = null;
    let bestInterceptTime = Infinity;
    for (const target of systems) {
        // Skip if not settleable
        if (!target.settleable)
            continue;
        // Skip if already settled or targeted
        if (target.status !== types_1.SettlementStatus.UNSETTLED)
            continue;
        // Skip self
        if (target.id === source.id)
            continue;
        // Calculate distance (with periodic boundaries)
        const dist = (0, utils_1.periodicDistance)(source.position, target.position, config.boxSize);
        // Skip if out of probe range
        if (dist > config.probeRange)
            continue;
        // Calculate intercept time
        const interceptTime = calculateInterceptTime(source, target, probeVelocityKms, config.boxSize);
        if (interceptTime === null)
            continue;
        // Skip if intercept time is too long (exceeds reasonable limit)
        const probeVelLyPerYear = probeVelocityKms / 299792.458;
        const maxTravelTime = config.probeRange / probeVelLyPerYear;
        if (interceptTime > maxTravelTime * 1.5)
            continue; // Allow some margin for moving targets
        // Select target with shortest intercept time
        if (interceptTime < bestInterceptTime) {
            bestInterceptTime = interceptTime;
            bestTarget = target.id;
        }
    }
    return bestTarget;
}
/**
 * Create a probe from source to target
 */
function createProbe(probeId, sourceSystemId, targetSystemId, civilizationId, launchTime, interceptTime) {
    return {
        id: probeId,
        sourceSystemId,
        targetSystemId,
        launchTime,
        interceptTime: launchTime + interceptTime,
        civilizationId,
    };
}
//# sourceMappingURL=targeting.js.map