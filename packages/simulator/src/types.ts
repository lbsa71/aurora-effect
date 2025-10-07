/**
 * Core data structures for the Aurora Effect simulator
 * Based on Carroll-Nellenback et al. (2019)
 */

/**
 * 3D vector representing position or velocity
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Settlement status of a star system
 */
export enum SettlementStatus {
  UNSETTLED = 'unsettled',
  TARGETED = 'targeted',
  SETTLED = 'settled',
}

/**
 * Star system in the simulation
 */
export interface StarSystem {
  /** Unique identifier */
  id: number;
  /** Position in 3D space (light-years) */
  position: Vector3D;
  /** Velocity vector (km/s) */
  velocity: Vector3D;
  /** Current settlement status */
  status: SettlementStatus;
  /** Whether this system can be settled */
  settleable: boolean;
  /** ID of civilization that settled this system (null if unsettled) */
  civilizationId: number | null;
  /** Time when this system was settled (null if unsettled) */
  settlementTime: number | null;
  /** Time when this system last launched a probe (null if never) */
  lastLaunchTime: number | null;
}

/**
 * Civilization that settles star systems
 */
export interface Civilization {
  /** Unique identifier */
  id: number;
  /** Color code for visualization */
  color: string;
  /** ID of the origin system */
  originSystemId: number;
  /** Time when this civilization was born */
  birthTime: number;
  /** Lifetime parameter T_s (years) - civilization dies after this time */
  lifetime: number;
  /** Number of probes currently in flight */
  activeProbeCount: number;
  /** Whether this civilization is still active */
  active: boolean;
}

/**
 * Probe traveling from one system to another
 */
export interface Probe {
  /** Unique identifier */
  id: number;
  /** ID of the source system */
  sourceSystemId: number;
  /** ID of the target system */
  targetSystemId: number;
  /** Time when probe was launched */
  launchTime: number;
  /** Time when probe will arrive at target */
  interceptTime: number;
  /** ID of the civilization that launched this probe */
  civilizationId: number;
}

/**
 * Configuration parameters for the simulation
 * Physical parameters from the paper
 */
export interface SimulationConfig {
  /** Number of star systems */
  numSystems: number;
  /** Size of simulation box in each dimension (light-years) */
  boxSize: Vector3D;
  /** Density of star systems (systems/pc³) */
  density: number;
  /** Fraction of systems that are settleable (0 < f ≤ 1) */
  settleableFraction: number;
  /** Average stellar velocity (km/s) */
  stellarVelocity: number;
  /** Probe velocity relative to host system (fraction of c) */
  probeVelocity: number;
  /** Maximum probe range (light-years) */
  probeRange: number;
  /** Probe launch period - time to assemble new probe (years) */
  probeLaunchPeriod: number;
  /** Civilization lifetime (years) - 0 for infinite */
  civilizationLifetime: number;
  /** Initial fraction of settled systems */
  initialSettledFraction: number;
  /** Time step for simulation (years) */
  timeStep: number;
  /** Random seed for reproducibility */
  seed?: number;
}

/**
 * Normalized dimensionless parameters
 * Calculated from physical parameters
 */
export interface NormalizedParameters {
  /** η = ρ · f · d_p³ - normalized density */
  eta: number;
  /** ν_s = v_s / v_p - ratio of stellar to probe velocity */
  nuS: number;
  /** τ_p = T_p / t_p - ratio of launch period to travel time */
  tauP: number;
  /** t_p = d_p / v_p - probe travel time (years) */
  probeTravelTime: number;
}
