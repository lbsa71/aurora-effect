/**
 * Aurora Effect Simulator
 * Core simulation library for galactic settlement dynamics
 * Based on Carroll-Nellenback et al. (2019)
 */

// Export types
export * from './types';

// Export utilities
export {
  SPEED_OF_LIGHT,
  LY_TO_PC,
  PC_TO_LY,
  SECONDS_PER_YEAR,
  addVectors,
  subtractVectors,
  scaleVector,
  dotProduct,
  magnitude,
  distance,
  periodicDistance,
  calculateNormalizedParameters,
  randomNormal,
  generateMaxwellBoltzmannVelocity,
  applyPeriodicBoundaries,
} from './utils';

// Export initialization functions
export {
  initializeSystems,
  initializeCivilization,
  initializeWithFront,
  initializeRandomSettlement,
} from './initialization';

// Export targeting functions
export { calculateInterceptTime, findBestTarget, createProbe } from './targeting';

// Export simulation functions
export {
  SimulationState,
  SimulationMetrics,
  createSimulationState,
  stepSimulation,
  runSimulation,
} from './simulation';

// Export analytical models
export {
  calculateFrontSpeed,
  calculateEta1,
  calculateEta2,
  calculateEta3,
  calculateEta4,
  calculateSteadyState,
  calculateFrontThickness,
  calculateGalaxyCrossingTime,
  calculatePhysicalFrontSpeed,
  estimateMilkyWayCrossingTime,
  logisticGrowth,
} from './analytics';
