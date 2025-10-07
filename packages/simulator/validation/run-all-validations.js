"use strict";
/**
 * Main validation runner
 * Executes all validation scripts and generates a comprehensive report
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllValidations = runAllValidations;
exports.generateReport = generateReport;
const figure3_front_snapshot_1 = require("./figure3-front-snapshot");
const figure6_7_crossing_time_1 = require("./figure6-7-crossing-time");
const figure8_equilibrium_1 = require("./figure8-equilibrium");
const figure9_steady_state_1 = require("./figure9-steady-state");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Run all validations and generate report
 */
function runAllValidations() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Aurora Effect Simulator - Phase 1.9 Validation Suite   ║');
    console.log('║   Validating against Carroll-Nellenback et al. (2019)     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    const results = {
        figure3: false,
        figures6and7: false,
        figure8: false,
        figure9: false,
        overallPassed: false,
    };
    // Run Figure 3 validation
    try {
        const result3 = (0, figure3_front_snapshot_1.validateFigure3)();
        results.figure3 = result3.passed;
        console.log(`✓ Figure 3: ${result3.message}`);
    }
    catch (error) {
        console.error(`✗ Figure 3: ERROR - ${error}`);
        results.figure3 = false;
    }
    // Run Figures 6/7 validation
    try {
        const result67 = (0, figure6_7_crossing_time_1.validateFigures6and7)();
        results.figures6and7 = result67.passed;
        console.log(`✓ Figures 6/7: ${result67.message}`);
    }
    catch (error) {
        console.error(`✗ Figures 6/7: ERROR - ${error}`);
        results.figures6and7 = false;
    }
    // Run Figure 8 validation
    try {
        const result8 = (0, figure8_equilibrium_1.validateFigure8)();
        results.figure8 = result8.passed;
        console.log(`✓ Figure 8: ${result8.message}`);
    }
    catch (error) {
        console.error(`✗ Figure 8: ERROR - ${error}`);
        results.figure8 = false;
    }
    // Run Figure 9 validation
    try {
        const result9 = (0, figure9_steady_state_1.validateFigure9)();
        results.figure9 = result9.passed;
        console.log(`✓ Figure 9: ${result9.message}`);
    }
    catch (error) {
        console.error(`✗ Figure 9: ERROR - ${error}`);
        results.figure9 = false;
    }
    // Overall result
    results.overallPassed =
        results.figure3 && results.figures6and7 && results.figure8 && results.figure9;
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Validation Summary                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`  Figure 3 (Front Snapshot):        ${results.figure3 ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Figures 6/7 (Crossing Time):      ${results.figures6and7 ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Figure 8 (Equilibrium):           ${results.figure8 ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Figure 9 (Steady State):          ${results.figure9 ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  ─────────────────────────────────────────────────────────────`);
    console.log(`  Overall:                          ${results.overallPassed ? '✓ PASS' : '✗ FAIL'}`);
    console.log();
    return results;
}
/**
 * Generate validation report document
 */
function generateReport(summary) {
    const timestamp = new Date().toISOString();
    const report = `# Phase 1.9 Validation Report

**Date**: ${timestamp}  
**Status**: ${summary.overallPassed ? 'PASSED ✓' : 'FAILED ✗'}

## Overview

This report documents the validation of the Aurora Effect simulator against key results from "The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States" by Carroll-Nellenback et al. (2019).

## Validation Results

### Figure 3: Settlement Front Snapshot and Logistic Curve
**Status**: ${summary.figure3 ? 'PASSED ✓' : 'FAILED ✗'}

This test validates that the simulator produces the expected settlement front propagation pattern with logistic growth. The simulation should show:
- Monotonic growth in settled fraction over time
- Logistic growth pattern (S-curve)
- High final settlement fraction (>80%) for infinite civilization lifetime

### Figures 6 and 7: Front Crossing Time vs Parameters
**Status**: ${summary.figures6and7 ? 'PASSED ✓' : 'FAILED ✗'}

This test validates that crossing times follow expected trends as parameters vary:
- Higher density (higher η) leads to faster crossing times
- Crossing times match analytical predictions within reasonable error bounds
- Parameter dependencies align with paper's theoretical model

### Figure 8: Equilibrium Fraction vs Civilization Lifetime
**Status**: ${summary.figure8 ? 'PASSED ✓' : 'FAILED ✗'}

This test validates the steady-state settlement fraction for finite civilization lifetimes:
- Equilibrium fraction increases monotonically with civilization lifetime
- Short lifetimes produce lower equilibrium fractions
- Infinite lifetime produces high equilibrium (>80%)
- Matches analytical steady-state model: X_eq = 1 - T_l/T_s

### Figure 9: Steady-State Model Validation
**Status**: ${summary.figure9 ? 'PASSED ✓' : 'FAILED ✗'}

This test validates the differential equation model for steady state:
- Equilibrium fraction increases with T_s / T_l ratio
- Simulated values match predicted values from analytical model
- All equilibrium fractions are in valid range [0, 1]

## Conclusion

${summary.overallPassed
        ? `All validation tests have PASSED. The Aurora Effect simulator successfully reproduces key results from Carroll-Nellenback et al. (2019) within acceptable error margins. The implementation correctly captures:

- Settlement front propagation dynamics
- Logistic growth patterns
- Parameter dependencies for crossing times
- Steady-state equilibrium behavior
- Finite lifetime civilization dynamics

The simulator is validated and ready for Phase 2 development.`
        : `Some validation tests have FAILED. Further investigation and refinement may be needed before proceeding to Phase 2. Review individual test results above to identify areas requiring attention.`}

## Methodology

The validation suite consists of four main test scripts:

1. **figure3-front-snapshot.ts**: Tests settlement front propagation and logistic growth
2. **figure6-7-crossing-time.ts**: Tests crossing time dependencies on parameters
3. **figure8-equilibrium.ts**: Tests equilibrium fraction for finite lifetimes
4. **figure9-steady-state.ts**: Tests steady-state differential equation model

Each test runs simulations with specific parameter configurations and compares results against analytical predictions and expected patterns from the paper.

## Next Steps

${summary.overallPassed
        ? `- ✓ Phase 1 is complete and validated
- → Proceed to Phase 2: Web API implementation
- Consider adding more detailed statistical analysis
- Document any minor discrepancies for future refinement`
        : `- Investigate failed tests
- Refine simulation parameters or analytical models as needed
- Re-run validations after fixes
- Document any fundamental limitations or differences from the paper`}

---

*This report was automatically generated by the Aurora Effect validation suite.*
`;
    return report;
}
// Run all validations and generate report if executed directly
if (require.main === module) {
    const summary = runAllValidations();
    const report = generateReport(summary);
    // Write report to file
    const reportPath = path.join(__dirname, '../../..', 'docs', 'VALIDATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\nValidation report written to: ${reportPath}\n`);
    process.exit(summary.overallPassed ? 0 : 1);
}
//# sourceMappingURL=run-all-validations.js.map