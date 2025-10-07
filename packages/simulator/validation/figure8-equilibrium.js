"use strict";
/**
 * Validation: Reproduce Figure 8 from Carroll-Nellenback et al. (2019)
 * Figure 8: Equilibrium settled fraction vs parameters
 *
 * This script validates that the simulator produces expected steady-state
 * settlement fractions for finite civilization lifetimes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFigure8 = validateFigure8;
const index_1 = require("../src/index");
/**
 * Measure equilibrium settled fraction for a given configuration
 */
function measureEquilibrium(config) {
    let systems = (0, index_1.initializeSystems)(config);
    const result = (0, index_1.initializeCivilization)(systems, 1, 0, 0, '#00ff00');
    const state = (0, index_1.createSimulationState)(result.systems, [result.civilization]);
    let recentFractions = [];
    const windowSize = 10;
    (0, index_1.runSimulation)(state, config, 100000, (s) => {
        // Track recent values
        if (s.time > 50000 && s.time % 1000 === 0) {
            recentFractions.push(s.metrics.settledFraction);
            if (recentFractions.length > windowSize) {
                recentFractions.shift();
            }
        }
    });
    // Return average of recent values as equilibrium
    if (recentFractions.length === 0) {
        return state.metrics.settledFraction;
    }
    return recentFractions.reduce((a, b) => a + b, 0) / recentFractions.length;
}
/**
 * Run validation for Figure 8
 * Tests equilibrium fraction dependence on civilization lifetime
 */
function validateFigure8() {
    console.log('\n=== Figure 8 Validation: Equilibrium Fraction vs Civilization Lifetime ===\n');
    const results = [];
    // Test different civilization lifetimes
    const baseConfig = {
        numSystems: 3000,
        boxSize: { x: 100, y: 50, z: 50 },
        density: 0.08,
        settleableFraction: 0.5,
        stellarVelocity: 30,
        probeVelocity: 0.01,
        probeRange: 10,
        probeLaunchPeriod: 100,
        initialSettledFraction: 0.05,
        timeStep: 100,
        seed: 42,
    };
    const params = (0, index_1.calculateNormalizedParameters)({ ...baseConfig, civilizationLifetime: 0 });
    const probeTravelTime = params.probeTravelTime;
    const effectiveLaunchTime = baseConfig.probeLaunchPeriod;
    console.log(`Base configuration:`);
    console.log(`  η = ${params.eta.toFixed(3)}`);
    console.log(`  τ_p = ${params.tauP.toFixed(3)}`);
    console.log(`  Probe travel time: ${probeTravelTime.toFixed(0)} years`);
    console.log(`  Effective launch time: ${effectiveLaunchTime.toFixed(0)} years`);
    console.log();
    const lifetimes = [
        5000, // Short lifetime
        10000, // Medium lifetime
        20000, // Long lifetime
        50000, // Very long lifetime
        0, // Infinite lifetime
    ];
    console.log('Testing equilibrium for different civilization lifetimes...\n');
    for (const lifetime of lifetimes) {
        const config = { ...baseConfig, civilizationLifetime: lifetime };
        console.log(`Testing lifetime: ${lifetime === 0 ? 'infinite' : lifetime + ' years'}`);
        const simulatedEquilibrium = measureEquilibrium(config);
        const predictedEquilibrium = (0, index_1.calculateSteadyState)(effectiveLaunchTime, lifetime);
        console.log(`  Simulated equilibrium: ${(simulatedEquilibrium * 100).toFixed(1)}%`);
        console.log(`  Predicted equilibrium: ${(predictedEquilibrium * 100).toFixed(1)}%`);
        console.log(`  Difference: ${((simulatedEquilibrium - predictedEquilibrium) * 100).toFixed(1)}%`);
        console.log();
        results.push({
            civilizationLifetime: lifetime,
            simulatedEquilibrium,
            predictedEquilibrium,
            tauP: params.tauP,
            probeTravelTime,
        });
    }
    // Validate results
    let errors = [];
    for (const result of results) {
        const error = Math.abs(result.simulatedEquilibrium - result.predictedEquilibrium);
        errors.push(error);
    }
    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const maxError = Math.max(...errors);
    console.log('Validation Summary:');
    console.log(`  Mean absolute error: ${(meanError * 100).toFixed(1)}%`);
    console.log(`  Max absolute error: ${(maxError * 100).toFixed(1)}%`);
    console.log();
    // Validation criteria:
    // 1. Equilibrium should increase with lifetime
    let isMonotonic = true;
    for (let i = 1; i < results.length; i++) {
        if (results[i].simulatedEquilibrium < results[i - 1].simulatedEquilibrium - 0.05) {
            isMonotonic = false;
            break;
        }
    }
    // 2. Infinite lifetime should give high equilibrium (> 80%)
    const infiniteLifetimeResult = results[results.length - 1];
    const highInfinite = infiniteLifetimeResult.simulatedEquilibrium > 0.8;
    // 3. Short lifetime should give lower equilibrium
    const lowShort = results[0].simulatedEquilibrium < 0.7;
    // 4. Mean error should be reasonable (< 15%)
    const reasonableError = meanError < 0.15;
    const passed = isMonotonic && highInfinite && lowShort && reasonableError;
    return {
        passed,
        message: passed
            ? 'PASS: Equilibrium fractions follow expected pattern'
            : `FAIL: Equilibrium fractions deviate from expectations ` +
                `(monotonic: ${isMonotonic}, high infinite: ${highInfinite}, ` +
                `low short: ${lowShort}, reasonable error: ${reasonableError})`,
        data: results,
    };
}
// Run validation if executed directly
if (require.main === module) {
    const result = validateFigure8();
    console.log(`\n${result.message}\n`);
    process.exit(result.passed ? 0 : 1);
}
//# sourceMappingURL=figure8-equilibrium.js.map