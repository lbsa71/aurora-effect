/**
 * Validation: Reproduce Figure 3 from Carroll-Nellenback et al. (2019)
 * Figure 3: Settlement front snapshot and logistic growth curve
 * 
 * This script validates that the simulator produces the expected settlement
 * front propagation and logistic growth pattern as shown in the paper.
 */

import {
  SimulationConfig,
  initializeSystems,
  initializeCivilization,
  createSimulationState,
  runSimulation,
  calculateNormalizedParameters,
  logisticGrowth,
} from '../src/index';

interface ValidationResult {
  passed: boolean;
  message: string;
  data: {
    timePoints: number[];
    settledFractions: number[];
    expectedFractions: number[];
  };
}

/**
 * Run validation for Figure 3
 * Tests settlement front propagation with logistic growth
 */
export function validateFigure3(): ValidationResult {
  console.log('\n=== Figure 3 Validation: Front Snapshot and Logistic Curve ===\n');

  // Configuration based on paper's typical parameters
  // High density scenario (η > 1) for clear front propagation
  const config: SimulationConfig = {
    numSystems: 3000,
    boxSize: { x: 100, y: 30, z: 30 },
    density: 0.08, // systems/pc³
    settleableFraction: 0.5,
    stellarVelocity: 30, // km/s
    probeVelocity: 0.01, // 0.01c
    probeRange: 10, // light-years
    probeLaunchPeriod: 100, // years
    civilizationLifetime: 0, // infinite lifetime
    initialSettledFraction: 0.01,
    timeStep: 100, // years
    seed: 42, // for reproducibility
  };

  const params = calculateNormalizedParameters(config);
  console.log(`Configuration:`);
  console.log(`  η = ${params.eta.toFixed(3)}`);
  console.log(`  ν_s = ${params.nuS.toFixed(6)}`);
  console.log(`  τ_p = ${params.tauP.toFixed(3)}`);
  console.log();

  // Initialize simulation
  let systems = initializeSystems(config);
  const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');
  const state = createSimulationState(result.systems, [result.civilization]);

  // Track settlement fraction over time
  const timePoints: number[] = [];
  const settledFractions: number[] = [];

  console.log('Running simulation...');
  const totalDuration = 30000; // 30,000 years
  const sampleInterval = 2000; // Sample every 2000 years

  runSimulation(state, config, totalDuration, (s) => {
    if (s.time % sampleInterval === 0) {
      timePoints.push(s.time);
      settledFractions.push(s.metrics.settledFraction);
      console.log(
        `  t = ${s.time.toFixed(0)} yr: X = ${(s.metrics.settledFraction * 100).toFixed(1)}%, ` +
        `Front = ${s.metrics.frontPosition.toFixed(1)} ly`
      );
    }
  });

  console.log();

  // Validate logistic growth pattern
  // The settlement fraction should follow a logistic curve: X(t) = X_eq / (1 + ((X_eq/X_0) - 1) * exp(-k*t))
  // For infinite lifetime, X should approach 1.0
  
  // Calculate expected values using logistic growth model
  // Growth rate k is related to probe launch period and travel time
  const k = 1 / (params.probeTravelTime + config.probeLaunchPeriod);
  const X0 = config.initialSettledFraction;
  const Xeq = 1.0; // Infinite lifetime
  const expectedFractions = timePoints.map(t => logisticGrowth(Xeq, X0, k, t));

  // Check if settlement follows logistic pattern
  let errors: number[] = [];
  for (let i = 0; i < timePoints.length; i++) {
    const error = Math.abs(settledFractions[i] - expectedFractions[i]);
    errors.push(error);
  }

  const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
  const maxError = Math.max(...errors);

  console.log('Validation Results:');
  console.log(`  Final settled fraction: ${(settledFractions[settledFractions.length - 1] * 100).toFixed(1)}%`);
  console.log(`  Mean error vs logistic model: ${(meanError * 100).toFixed(2)}%`);
  console.log(`  Max error vs logistic model: ${(maxError * 100).toFixed(2)}%`);
  console.log();

  // Validation criteria:
  // 1. Settlement should grow (not decrease)
  let isMonotonic = true;
  for (let i = 1; i < settledFractions.length; i++) {
    if (settledFractions[i] < settledFractions[i - 1] - 0.001) {
      isMonotonic = false;
      break;
    }
  }

  // 2. Final settlement fraction should be high (> 80%) for infinite lifetime
  const finalFraction = settledFractions[settledFractions.length - 1];
  const highSettlement = finalFraction > 0.8;

  // 3. Mean error should be reasonable (< 10%)
  const lowError = meanError < 0.1;

  const passed = isMonotonic && highSettlement && lowError;

  return {
    passed,
    message: passed
      ? 'PASS: Settlement exhibits expected logistic growth pattern'
      : `FAIL: Settlement pattern deviates from expected behavior ` +
        `(monotonic: ${isMonotonic}, high final: ${highSettlement}, low error: ${lowError})`,
    data: {
      timePoints,
      settledFractions,
      expectedFractions,
    },
  };
}

// Run validation if executed directly
if (require.main === module) {
  const result = validateFigure3();
  console.log(`\n${result.message}\n`);
  process.exit(result.passed ? 0 : 1);
}
