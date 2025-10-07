"use strict";
/**
 * Validation: Reproduce Figures 6 and 7 from Carroll-Nellenback et al. (2019)
 * Figures 6/7: Front crossing time as a function of parameters
 *
 * This script validates that the simulator produces expected crossing times
 * for different parameter values (density, probe speed, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFigures6and7 = validateFigures6and7;
const index_1 = require("../src/index");
/**
 * Measure crossing time for a given configuration
 */
function measureCrossingTime(config) {
    let systems = (0, index_1.initializeSystems)(config);
    const result = (0, index_1.initializeCivilization)(systems, 1, 0, 0, '#00ff00');
    const state = (0, index_1.createSimulationState)(result.systems, [result.civilization]);
    const boxSize = config.boxSize.x;
    let crossingTime = 0;
    (0, index_1.runSimulation)(state, config, 200000, (s) => {
        // Consider box crossed when front reaches 80% of box width
        if (s.metrics.frontPosition >= 0.8 * boxSize && crossingTime === 0) {
            crossingTime = s.time;
        }
    });
    return crossingTime;
}
/**
 * Run validation for Figures 6 and 7
 * Tests crossing time dependence on parameters
 */
function validateFigures6and7() {
    console.log('\n=== Figures 6/7 Validation: Crossing Time vs Parameters ===\n');
    const results = [];
    // Test different densities (varying η)
    const testCases = [
        { settleableFraction: 0.2, probeLaunchPeriod: 100, label: 'Low density' },
        { settleableFraction: 0.5, probeLaunchPeriod: 100, label: 'Medium density' },
        { settleableFraction: 0.8, probeLaunchPeriod: 100, label: 'High density' },
        { settleableFraction: 0.5, probeLaunchPeriod: 50, label: 'Fast launches' },
        { settleableFraction: 0.5, probeLaunchPeriod: 200, label: 'Slow launches' },
    ];
    console.log('Testing crossing times for different parameter values...\n');
    for (const testCase of testCases) {
        console.log(`Testing: ${testCase.label}`);
        const config = {
            numSystems: 5000,
            boxSize: { x: 150, y: 50, z: 50 },
            density: 0.08,
            settleableFraction: testCase.settleableFraction,
            stellarVelocity: 30,
            probeVelocity: 0.01,
            probeRange: 10,
            probeLaunchPeriod: testCase.probeLaunchPeriod,
            civilizationLifetime: 0,
            initialSettledFraction: 0.01,
            timeStep: 100,
            seed: 42,
        };
        const params = (0, index_1.calculateNormalizedParameters)(config);
        console.log(`  η = ${params.eta.toFixed(3)}, τ_p = ${params.tauP.toFixed(3)}`);
        const simulatedCrossingTime = measureCrossingTime(config);
        const predictedCrossingTime = (0, index_1.calculateGalaxyCrossingTime)(params, config.probeVelocity, config.boxSize.x);
        console.log(`  Simulated crossing time: ${simulatedCrossingTime.toFixed(0)} years`);
        console.log(`  Predicted crossing time: ${predictedCrossingTime.toFixed(0)} years`);
        console.log(`  Ratio: ${(simulatedCrossingTime / predictedCrossingTime).toFixed(2)}`);
        console.log();
        results.push({
            eta: params.eta,
            tauP: params.tauP,
            simulatedCrossingTime,
            predictedCrossingTime,
            boxSize: config.boxSize.x,
        });
    }
    // Validate results
    // Crossing time should decrease with higher density (higher η)
    let errors = [];
    for (const result of results) {
        const relativeError = Math.abs(result.simulatedCrossingTime - result.predictedCrossingTime) / result.predictedCrossingTime;
        errors.push(relativeError);
    }
    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const maxError = Math.max(...errors);
    console.log('Validation Summary:');
    console.log(`  Mean relative error: ${(meanError * 100).toFixed(1)}%`);
    console.log(`  Max relative error: ${(maxError * 100).toFixed(1)}%`);
    console.log();
    // Validation criteria:
    // 1. All crossing times should be positive
    const allPositive = results.every(r => r.simulatedCrossingTime > 0);
    // 2. Higher density should generally give faster crossing (or similar)
    // Compare first (low) vs second (medium) density
    const densityTrend = results[1].simulatedCrossingTime <= results[0].simulatedCrossingTime * 1.2;
    // 3. Mean error should be reasonable (< 50% - analytical model is approximate)
    const reasonableError = meanError < 0.5;
    const passed = allPositive && densityTrend && reasonableError;
    return {
        passed,
        message: passed
            ? 'PASS: Crossing times follow expected trends'
            : `FAIL: Crossing times deviate from expectations ` +
                `(all positive: ${allPositive}, density trend: ${densityTrend}, reasonable error: ${reasonableError})`,
        data: results,
    };
}
// Run validation if executed directly
if (require.main === module) {
    const result = validateFigures6and7();
    console.log(`\n${result.message}\n`);
    process.exit(result.passed ? 0 : 1);
}
//# sourceMappingURL=figure6-7-crossing-time.js.map