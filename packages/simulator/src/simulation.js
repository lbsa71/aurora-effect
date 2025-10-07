"use strict";
/**
 * Main simulation engine with time stepping
 * Implements Ticket 1.5: Simulation time stepping and state management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSimulationState = createSimulationState;
exports.stepSimulation = stepSimulation;
exports.runSimulation = runSimulation;
const types_1 = require("./types");
const targeting_1 = require("./targeting");
const utils_1 = require("./utils");
/**
 * Initialize simulation state
 */
function createSimulationState(systems, civilizations) {
    return {
        time: 0,
        systems,
        civilizations,
        probes: [],
        nextProbeId: 0,
        metrics: calculateMetrics(systems, civilizations, []),
    };
}
/**
 * Calculate current metrics
 */
function calculateMetrics(systems, civilizations, probes) {
    const settleableSystems = systems.filter((s) => s.settleable);
    const settledSystems = systems.filter((s) => s.status === types_1.SettlementStatus.SETTLED);
    const settledFraction = settleableSystems.length > 0 ? settledSystems.length / settleableSystems.length : 0;
    // Calculate front position (rightmost settled system)
    let frontPosition = 0;
    for (const system of settledSystems) {
        if (system.position.x > frontPosition) {
            frontPosition = system.position.x;
        }
    }
    return {
        settledFraction,
        settledCount: settledSystems.length,
        activeCivilizations: civilizations.filter((c) => c.active).length,
        probesInFlight: probes.length,
        frontPosition,
    };
}
/**
 * Update system positions based on velocities
 */
function updatePositions(systems, dt, boxSize) {
    for (const system of systems) {
        // Convert velocity from km/s to ly/year
        const velLyPerYear = (0, utils_1.scaleVector)(system.velocity, 1 / 299792.458);
        // Update position: r(t+dt) = r(t) + v*dt
        const displacement = (0, utils_1.scaleVector)(velLyPerYear, dt);
        system.position = (0, utils_1.addVectors)(system.position, displacement);
        // Apply periodic boundary conditions
        system.position = (0, utils_1.applyPeriodicBoundaries)(system.position, boxSize);
    }
}
/**
 * Process probe launches from settled systems
 */
function processLaunches(state, config) {
    const settledSystems = state.systems.filter((s) => s.status === types_1.SettlementStatus.SETTLED);
    for (const source of settledSystems) {
        // Check if civilization is still active
        if (source.civilizationId === null)
            continue;
        const civ = state.civilizations.find((c) => c.id === source.civilizationId);
        if (!civ || !civ.active)
            continue;
        // Find best target
        const targetId = (0, targeting_1.findBestTarget)(source, state.systems, config, state.time);
        if (targetId !== null) {
            const target = state.systems.find((s) => s.id === targetId);
            if (!target)
                continue;
            // Mark target as targeted
            target.status = types_1.SettlementStatus.TARGETED;
            // Calculate intercept time (simplified - use distance / velocity)
            const probeVelKms = config.probeVelocity * 299792.458;
            const probeVelLyPerYear = probeVelKms / 299792.458;
            // Simple distance-based estimate
            const dx = target.position.x - source.position.x;
            const dy = target.position.y - source.position.y;
            const dz = target.position.z - source.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const travelTime = dist / probeVelLyPerYear;
            // Create probe
            const probe = (0, targeting_1.createProbe)(state.nextProbeId++, source.id, targetId, source.civilizationId, state.time, travelTime);
            state.probes.push(probe);
            // Update source system
            source.lastLaunchTime = state.time;
            // Update civilization
            civ.activeProbeCount++;
        }
    }
}
/**
 * Process probe arrivals and settle target systems
 */
function processArrivals(state) {
    const arrivedProbes = [];
    for (const probe of state.probes) {
        if (state.time >= probe.interceptTime) {
            arrivedProbes.push(probe);
            // Find target system
            const target = state.systems.find((s) => s.id === probe.targetSystemId);
            if (!target)
                continue;
            // Settle the system
            target.status = types_1.SettlementStatus.SETTLED;
            target.civilizationId = probe.civilizationId;
            target.settlementTime = state.time;
            target.lastLaunchTime = null;
            // Update civilization
            const civ = state.civilizations.find((c) => c.id === probe.civilizationId);
            if (civ) {
                civ.activeProbeCount--;
            }
        }
    }
    // Remove arrived probes
    state.probes = state.probes.filter((p) => !arrivedProbes.includes(p));
}
/**
 * Process civilization deaths (Ticket 1.7)
 */
function processCivilizationDeaths(state, config) {
    if (config.civilizationLifetime === 0)
        return; // Infinite lifetime
    for (const system of state.systems) {
        if (system.status !== types_1.SettlementStatus.SETTLED)
            continue;
        if (system.civilizationId === null || system.settlementTime === null)
            continue;
        const age = state.time - system.settlementTime;
        if (age >= config.civilizationLifetime) {
            // System dies
            system.status = types_1.SettlementStatus.UNSETTLED;
            const deadCivId = system.civilizationId;
            system.civilizationId = null;
            system.settlementTime = null;
            system.lastLaunchTime = null;
            // Cancel any probes from this civilization targeting this system
            state.probes = state.probes.filter((p) => p.targetSystemId !== system.id || p.civilizationId !== deadCivId);
        }
    }
    // Mark civilizations as inactive if they have no settled systems
    for (const civ of state.civilizations) {
        const hasSettledSystems = state.systems.some((s) => s.status === types_1.SettlementStatus.SETTLED && s.civilizationId === civ.id);
        if (!hasSettledSystems) {
            civ.active = false;
        }
    }
}
/**
 * Perform one time step of the simulation
 */
function stepSimulation(state, config) {
    // Update positions based on velocities
    updatePositions(state.systems, config.timeStep, config.boxSize);
    // Process probe arrivals
    processArrivals(state);
    // Process civilization deaths
    processCivilizationDeaths(state, config);
    // Process new probe launches
    processLaunches(state, config);
    // Update time
    state.time += config.timeStep;
    // Update metrics
    state.metrics = calculateMetrics(state.systems, state.civilizations, state.probes);
}
/**
 * Run simulation for a specified duration
 */
function runSimulation(state, config, duration, onStep) {
    const endTime = state.time + duration;
    while (state.time < endTime) {
        stepSimulation(state, config);
        if (onStep) {
            onStep(state);
        }
    }
}
//# sourceMappingURL=simulation.js.map