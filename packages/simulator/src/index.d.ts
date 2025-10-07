/**
 * Aurora Effect Simulator
 * Core simulation library for galactic settlement dynamics
 * Based on Carroll-Nellenback et al. (2019)
 */
export * from './types';
export { SPEED_OF_LIGHT, LY_TO_PC, PC_TO_LY, SECONDS_PER_YEAR, addVectors, subtractVectors, scaleVector, dotProduct, magnitude, distance, periodicDistance, calculateNormalizedParameters, randomNormal, generateMaxwellBoltzmannVelocity, applyPeriodicBoundaries, } from './utils';
export { initializeSystems, initializeCivilization, initializeWithFront, initializeRandomSettlement, } from './initialization';
export { calculateInterceptTime, findBestTarget, createProbe } from './targeting';
export { SimulationState, SimulationMetrics, createSimulationState, stepSimulation, runSimulation, } from './simulation';
export { calculateFrontSpeed, calculateEta1, calculateEta2, calculateEta3, calculateEta4, calculateSteadyState, calculateFrontThickness, calculateGalaxyCrossingTime, calculatePhysicalFrontSpeed, estimateMilkyWayCrossingTime, logisticGrowth, } from './analytics';
//# sourceMappingURL=index.d.ts.map