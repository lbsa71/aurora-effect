"use strict";
/**
 * Validation: Reproduce Figure 9 from Carroll-Nellenback et al. (2019)
 * Figure 9: Steady-state fraction validation
 *
 * This script validates the steady-state differential equation model
 * against simulation results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFigure9 = validateFigure9;
const index_1 = require("../src/index");
/**
 * Measure steady-state settled fraction for a given configuration
 */
function measureSteadyState(config) {
    let systems = (0, index_1.initializeSystems)(config);
    const result = (0, index_1.initializeCivilization)(systems, 1, 0, 0, '#00ff00');
    const state = (0, index_1.createSimulationState)(result.systems, [result.civilization]);
    // Run to equilibrium
    const equilibriumTime = Math.max(100000, config.civilizationLifetime * 3);
    let finalFractions = [];
    (0, index_1.runSimulation)(state, config, equilibriumTime, (s) => {
        // Sample in last 20% of simulation
        if (s.time > equilibriumTime * 0.8 && s.time % 1000 === 0) {
            finalFractions.push(s.metrics.settledFraction);
        }
    });
    // Return average
    return finalFractions.reduce((a, b) => a + b, 0) / finalFractions.length;
}
/**
 * Run validation for Figure 9
 * Tests steady-state model against simulations
 */
function validateFigure9() {
    console.log('\n=== Figure 9 Validation: Steady-State Model ===\n');
    const results = [];
    // Base configuration
    const baseConfig = {
        numSystems: 2000,
        boxSize: { x: 80, y: 40, z: 40 },
        density: 0.08,
        settleableFraction: 0.6,
        stellarVelocity: 30,
        probeVelocity: 0.01,
        probeRange: 10,
        probeLaunchPeriod: 100,
        initialSettledFraction: 0.05,
        timeStep: 100,
        seed: 42,
    };
    const params = (0, index_1.calculateNormalizedParameters)({ ...baseConfig, civilizationLifetime: 0 });
    const effectiveLaunchTime = baseConfig.probeLaunchPeriod;
    console.log(`Configuration:`);
    console.log(`  η = ${params.eta.toFixed(3)}`);
    console.log(`  Effective launch time T_l: ${effectiveLaunchTime.toFixed(0)} years`);
    console.log();
    // Test different ratios of T_s / T_l
    const lifetimeRatios = [1.5, 2.0, 3.0, 5.0, 10.0];
    console.log('Testing steady-state for different T_s / T_l ratios...\n');
    for (const ratio of lifetimeRatios) {
        const civilizationLifetime = effectiveLaunchTime * ratio;
        const config = { ...baseConfig, civilizationLifetime };
        console.log(`Testing T_s / T_l = ${ratio.toFixed(1)} (T_s = ${civilizationLifetime.toFixed(0)} years)`);
        const simulatedFraction = measureSteadyState(config);
        const predictedFraction = (0, index_1.calculateSteadyState)(effectiveLaunchTime, civilizationLifetime);
        console.log(`  Simulated: ${(simulatedFraction * 100).toFixed(1)}%`);
        console.log(`  Predicted: ${(predictedFraction * 100).toFixed(1)}%`);
        console.log(`  Error: ${((simulatedFraction - predictedFraction) * 100).toFixed(1)}%`);
        console.log();
        results.push({
            parameterRatio: ratio,
            simulatedFraction,
            predictedFraction,
        });
    }
    // Validate results
    let errors = [];
    for (const result of results) {
        const error = Math.abs(result.simulatedFraction - result.predictedFraction);
        errors.push(error);
    }
    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const maxError = Math.max(...errors);
    console.log('Validation Summary:');
    console.log(`  Mean absolute error: ${(meanError * 100).toFixed(1)}%`);
    console.log(`  Max absolute error: ${(maxError * 100).toFixed(1)}%`);
    console.log();
    // Validation criteria:
    // 1. Equilibrium should increase with ratio
    let isMonotonic = true;
    for (let i = 1; i < results.length; i++) {
        if (results[i].simulatedFraction < results[i - 1].simulatedFraction - 0.05) {
            isMonotonic = false;
            break;
        }
    }
    // 2. Predicted values should match reasonably (mean error < 12%)
    const goodMatch = meanError < 0.12;
    // 3. All simulated values should be in valid range [0, 1]
    const validRange = results.every(r => r.simulatedFraction >= 0 && r.simulatedFraction <= 1);
    const passed = isMonotonic && goodMatch && validRange;
    return {
        passed,
        message: passed
            ? 'PASS: Steady-state model matches simulations'
            : `FAIL: Steady-state model deviates from simulations ` +
                `(monotonic: ${isMonotonic}, good match: ${goodMatch}, valid range: ${validRange})`,
        data: results,
    };
}
// Run validation if executed directly
if (require.main === module) {
    const result = validateFigure9();
    console.log(`\n${result.message}\n`);
    process.exit(result.passed ? 0 : 1);
}
//# sourceMappingURL=figure9-steady-state.js.map