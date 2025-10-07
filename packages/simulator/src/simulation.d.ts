/**
 * Main simulation engine with time stepping
 * Implements Ticket 1.5: Simulation time stepping and state management
 */
import { StarSystem, Civilization, Probe, SimulationConfig } from './types';
/**
 * State of the simulation at a given time
 */
export interface SimulationState {
    /** Current simulation time (years) */
    time: number;
    /** All star systems */
    systems: StarSystem[];
    /** All civilizations */
    civilizations: Civilization[];
    /** Active probes in flight */
    probes: Probe[];
    /** Next probe ID */
    nextProbeId: number;
    /** Metrics */
    metrics: SimulationMetrics;
}
/**
 * Metrics tracked during simulation
 */
export interface SimulationMetrics {
    /** Fraction of settleable systems that are settled */
    settledFraction: number;
    /** Total number of settled systems */
    settledCount: number;
    /** Number of active civilizations */
    activeCivilizations: number;
    /** Number of probes in flight */
    probesInFlight: number;
    /** Position of settlement front (x-coordinate) */
    frontPosition: number;
}
/**
 * Initialize simulation state
 */
export declare function createSimulationState(systems: StarSystem[], civilizations: Civilization[]): SimulationState;
/**
 * Perform one time step of the simulation
 */
export declare function stepSimulation(state: SimulationState, config: SimulationConfig): void;
/**
 * Run simulation for a specified duration
 */
export declare function runSimulation(state: SimulationState, config: SimulationConfig, duration: number, onStep?: (state: SimulationState) => void): void;
//# sourceMappingURL=simulation.d.ts.map