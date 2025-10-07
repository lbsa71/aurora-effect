/**
 * Validation: Reproduce Figure 9 from Carroll-Nellenback et al. (2019)
 * Figure 9: Steady-state fraction validation
 *
 * This script validates the steady-state differential equation model
 * against simulation results.
 */
interface SteadyStateResult {
    parameterRatio: number;
    simulatedFraction: number;
    predictedFraction: number;
}
interface ValidationResult {
    passed: boolean;
    message: string;
    data: SteadyStateResult[];
}
/**
 * Run validation for Figure 9
 * Tests steady-state model against simulations
 */
export declare function validateFigure9(): ValidationResult;
export {};
//# sourceMappingURL=figure9-steady-state.d.ts.map