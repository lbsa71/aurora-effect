/**
 * Validation: Reproduce Figure 3 from Carroll-Nellenback et al. (2019)
 * Figure 3: Settlement front snapshot and logistic growth curve
 *
 * This script validates that the simulator produces the expected settlement
 * front propagation and logistic growth pattern as shown in the paper.
 */
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
export declare function validateFigure3(): ValidationResult;
export {};
//# sourceMappingURL=figure3-front-snapshot.d.ts.map