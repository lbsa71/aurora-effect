/**
 * System initialization functions
 * Implements Ticket 1.3: Generate initial star systems with positions, velocities, and settlement status
 */

import {
  StarSystem,
  Civilization,
  SimulationConfig,
  SettlementStatus,
  Vector3D,
} from './types';
import { generateMaxwellBoltzmannVelocity } from './utils';

/**
 * Initialize star systems with random positions and velocities
 */
export function initializeSystems(config: SimulationConfig): StarSystem[] {
  const systems: StarSystem[] = [];

  for (let i = 0; i < config.numSystems; i++) {
    // Random position in box
    const position: Vector3D = {
      x: Math.random() * config.boxSize.x,
      y: Math.random() * config.boxSize.y,
      z: Math.random() * config.boxSize.z,
    };

    // Velocity from Maxwell-Boltzmann distribution
    const velocity = generateMaxwellBoltzmannVelocity(config.stellarVelocity);

    // Determine if settleable
    const settleable = Math.random() < config.settleableFraction;

    systems.push({
      id: i,
      position,
      velocity,
      status: SettlementStatus.UNSETTLED,
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
export function initializeCivilization(
  systems: StarSystem[],
  civilizationId: number,
  birthTime: number,
  lifetime: number,
  color: string
): { systems: StarSystem[]; civilization: Civilization } {
  // Find all settleable, unsettled systems
  const settleableSystems = systems.filter(
    (s) => s.settleable && s.status === SettlementStatus.UNSETTLED
  );

  if (settleableSystems.length === 0) {
    throw new Error('No settleable systems available for new civilization');
  }

  // Pick a random system
  const originSystem = settleableSystems[Math.floor(Math.random() * settleableSystems.length)];

  // Settle it
  originSystem.status = SettlementStatus.SETTLED;
  originSystem.civilizationId = civilizationId;
  originSystem.settlementTime = birthTime;
  originSystem.lastLaunchTime = null;

  const civilization: Civilization = {
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
export function initializeWithFront(
  systems: StarSystem[],
  config: SimulationConfig,
  civilizationId: number,
  frontPosition: number = 0
): StarSystem[] {
  // Settle systems with x < frontPosition * boxSize.x
  const threshold = frontPosition * config.boxSize.x;

  for (const system of systems) {
    if (system.settleable && system.position.x < threshold) {
      system.status = SettlementStatus.SETTLED;
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
export function initializeRandomSettlement(
  systems: StarSystem[],
  settlementFraction: number,
  civilizationId: number
): StarSystem[] {
  const settleableSystems = systems.filter((s) => s.settleable);
  const numToSettle = Math.floor(settleableSystems.length * settlementFraction);

  // Shuffle and take first numToSettle
  const shuffled = [...settleableSystems].sort(() => Math.random() - 0.5);
  const toSettle = shuffled.slice(0, numToSettle);

  for (const system of toSettle) {
    system.status = SettlementStatus.SETTLED;
    system.civilizationId = civilizationId;
    system.settlementTime = 0;
    system.lastLaunchTime = null;
  }

  return systems;
}
