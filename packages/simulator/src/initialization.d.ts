/**
 * System initialization functions
 * Implements Ticket 1.3: Generate initial star systems with positions, velocities, and settlement status
 */
import { StarSystem, Civilization, SimulationConfig } from './types';
/**
 * Initialize star systems with random positions and velocities
 */
export declare function initializeSystems(config: SimulationConfig): StarSystem[];
/**
 * Initialize a civilization at a random settleable system
 * Returns the updated systems and the new civilization
 */
export declare function initializeCivilization(systems: StarSystem[], civilizationId: number, birthTime: number, lifetime: number, color: string): {
    systems: StarSystem[];
    civilization: Civilization;
};
/**
 * Initialize systems with a settlement front
 * Settles systems in a region (e.g., Heaviside function initialization)
 */
export declare function initializeWithFront(systems: StarSystem[], config: SimulationConfig, civilizationId: number, frontPosition?: number): StarSystem[];
/**
 * Initialize systems with random settlement
 * Settles a fraction of settleable systems randomly
 */
export declare function initializeRandomSettlement(systems: StarSystem[], settlementFraction: number, civilizationId: number): StarSystem[];
//# sourceMappingURL=initialization.d.ts.map