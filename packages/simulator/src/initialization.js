"use strict";
/**
 * System initialization functions
 * Implements Ticket 1.3: Generate initial star systems with positions, velocities, and settlement status
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSystems = initializeSystems;
exports.initializeCivilization = initializeCivilization;
exports.initializeWithFront = initializeWithFront;
exports.initializeRandomSettlement = initializeRandomSettlement;
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * Initialize star systems with random positions and velocities
 */
function initializeSystems(config) {
    const systems = [];
    for (let i = 0; i < config.numSystems; i++) {
        // Random position in box
        const position = {
            x: Math.random() * config.boxSize.x,
            y: Math.random() * config.boxSize.y,
            z: Math.random() * config.boxSize.z,
        };
        // Velocity from Maxwell-Boltzmann distribution
        const velocity = (0, utils_1.generateMaxwellBoltzmannVelocity)(config.stellarVelocity);
        // Determine if settleable
        const settleable = Math.random() < config.settleableFraction;
        systems.push({
            id: i,
            position,
            velocity,
            status: types_1.SettlementStatus.UNSETTLED,
            settleable,
            civilizationId: null,
            settlementTime: null,
            lastLaunchTime: null,
        });
    }
    return systems;
}
/**
 * Initialize a civilization at a random settleable system
 * Returns the updated systems and the new civilization
 */
function initializeCivilization(systems, civilizationId, birthTime, lifetime, color) {
    // Find all settleable, unsettled systems
    const settleableSystems = systems.filter((s) => s.settleable && s.status === types_1.SettlementStatus.UNSETTLED);
    if (settleableSystems.length === 0) {
        throw new Error('No settleable systems available for new civilization');
    }
    // Pick a random system
    const originSystem = settleableSystems[Math.floor(Math.random() * settleableSystems.length)];
    // Settle it
    originSystem.status = types_1.SettlementStatus.SETTLED;
    originSystem.civilizationId = civilizationId;
    originSystem.settlementTime = birthTime;
    originSystem.lastLaunchTime = null;
    const civilization = {
        id: civilizationId,
        color,
        originSystemId: originSystem.id,
        birthTime,
        lifetime,
        activeProbeCount: 0,
        active: true,
    };
    return { systems, civilization };
}
/**
 * Initialize systems with a settlement front
 * Settles systems in a region (e.g., Heaviside function initialization)
 */
function initializeWithFront(systems, config, civilizationId, frontPosition = 0) {
    // Settle systems with x < frontPosition * boxSize.x
    const threshold = frontPosition * config.boxSize.x;
    for (const system of systems) {
        if (system.settleable && system.position.x < threshold) {
            system.status = types_1.SettlementStatus.SETTLED;
            system.civilizationId = civilizationId;
            system.settlementTime = 0;
            system.lastLaunchTime = null;
        }
    }
    return systems;
}
/**
 * Initialize systems with random settlement
 * Settles a fraction of settleable systems randomly
 */
function initializeRandomSettlement(systems, settlementFraction, civilizationId) {
    const settleableSystems = systems.filter((s) => s.settleable);
    const numToSettle = Math.floor(settleableSystems.length * settlementFraction);
    // Shuffle and take first numToSettle
    const shuffled = [...settleableSystems].sort(() => Math.random() - 0.5);
    const toSettle = shuffled.slice(0, numToSettle);
    for (const system of toSettle) {
        system.status = types_1.SettlementStatus.SETTLED;
        system.civilizationId = civilizationId;
        system.settlementTime = 0;
        system.lastLaunchTime = null;
    }
    return systems;
}
//# sourceMappingURL=initialization.js.map