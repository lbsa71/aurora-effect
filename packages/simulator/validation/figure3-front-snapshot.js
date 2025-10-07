"use strict";
/**
 * Validation: Reproduce Figure 3 from Carroll-Nellenback et al. (2019)
 * Figure 3: Settlement front snapshot and logistic growth curve
 *
 * This script validates that the simulator produces the expected settlement
 * front propagation and logistic growth pattern as shown in the paper.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFigure3 = validateFigure3;
const index_1 = require("../src/index");
/**
 * Run validation for Figure 3
 * Tests settlement front propagation with logistic growth
 */
function validateFigure3() {
    console.log('\n=== Figure 3 Validation: Front Snapshot and Logistic Curve ===\n');
    // Configuration based on paper's typical parameters
    // High density scenario (η > 1) for clear front propagation
    const config = {
        numSystems: 10000,
        boxSize: { x: 200, y: 50, z: 50 },
        density: 0.08, // systems/pc³
        settleableFraction: 0.5,
        stellarVelocity: 30, // km/s
        probeVelocity: 0.01, // 0.01c
        probeRange: 10, // light-years
        probeLaunchPeriod: 100, // years
        civilizationLifetime: 0, // infinite lifetime
        initialSettledFraction: 0.01,
        timeStep: 50, // years
        seed: 42, // for reproducibility
    };
    const params = (0, index_1.calculateNormalizedParameters)(config);
    console.log(`Configuration:`);
    console.log(`  η = ${params.eta.toFixed(3)}`);
    console.log(`  ν_s = ${params.nuS.toFixed(6)}`);
    console.log(`  τ_p = ${params.tauP.toFixed(3)}`);
    console.log();
    // Initialize simulation
    let systems = (0, index_1.initializeSystems)(config);
    const result = (0, index_1.initializeCivilization)(systems, 1, 0, 0, '#00ff00');
    const state = (0, index_1.createSimulationState)(result.systems, [result.civilization]);
    // Track settlement fraction over time
    const timePoints = [];
    const settledFractions = [];
    console.log('Running simulation...');
    const totalDuration = 50000; // 50,000 years
    const sampleInterval = 1000; // Sample every 1000 years
    (0, index_1.runSimulation)(state, config, totalDuration, (s) => {
        if (s.time % sampleInterval === 0) {
            timePoints.push(s.time);
            settledFractions.push(s.metrics.settledFraction);
            console.log(`  t = ${s.time.toFixed(0)} yr: X = ${(s.metrics.settledFraction * 100).toFixed(1)}%, ` +
                `Front = ${s.metrics.frontPosition.toFixed(1)} ly`);
        }
    });
    console.log();
    // Validate logistic growth pattern
    // The settlement fraction should follow a logistic curve: X(t) = 1 / (1 + exp(-k*t))
    // For infinite lifetime, X should approach 1.0
    // Calculate expected values using logistic growth model
    // Growth rate k is related to probe launch period and travel time
    const k = 1 / (params.probeTravelTime + config.probeLaunchPeriod);
    const expectedFractions = timePoints.map(t => (0, index_1.logisticGrowth)(t, k, 0.01));
    // Check if settlement follows logistic pattern
    let errors = [];
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
//# sourceMappingURL=figure3-front-snapshot.js.map