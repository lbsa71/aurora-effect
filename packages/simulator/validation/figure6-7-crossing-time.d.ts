/**
 * Validation: Reproduce Figures 6 and 7 from Carroll-Nellenback et al. (2019)
 * Figures 6/7: Front crossing time as a function of parameters
 *
 * This script validates that the simulator produces expected crossing times
 * for different parameter values (density, probe speed, etc.)
 */
interface CrossingTimeResult {
    eta: number;
    tauP: number;
    simulatedCrossingTime: number;
    predictedCrossingTime: number;
    boxSize: number;
}
interface ValidationResult {
    passed: boolean;
    message: string;
    data: CrossingTimeResult[];
}
/**
 * Run validation for Figures 6 and 7
 * Tests crossing time dependence on parameters
 */
export declare function validateFigures6and7(): ValidationResult;
export {};
//# sourceMappingURL=figure6-7-crossing-time.d.ts.map