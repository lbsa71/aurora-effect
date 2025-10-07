/**
 * Probe targeting algorithm
 * Implements Ticket 1.4: Core algorithm for settled systems to target and launch probes
 * Based on Carroll-Nellenback et al. (2019) Algorithm
 */
import { StarSystem, Probe, SimulationConfig, Vector3D } from './types';
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
export declare function calculateInterceptTime(source: StarSystem, target: StarSystem, probeVelocity: number, boxSize: Vector3D): number | null;
/**
 * Find the best target system for a settled system to launch a probe to
 *
 * @param source The settled system launching the probe
 * @param systems All star systems
 * @param config Simulation configuration
 * @param currentTime Current simulation time
 * @returns Target system ID, or null if no valid target
 */
export declare function findBestTarget(source: StarSystem, systems: StarSystem[], config: SimulationConfig, currentTime: number): number | null;
/**
 * Create a probe from source to target
 */
export declare function createProbe(probeId: number, sourceSystemId: number, targetSystemId: number, civilizationId: number, launchTime: number, interceptTime: number): Probe;
//# sourceMappingURL=targeting.d.ts.map