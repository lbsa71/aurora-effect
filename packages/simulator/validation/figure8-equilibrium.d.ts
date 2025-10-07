/**
 * Validation: Reproduce Figure 8 from Carroll-Nellenback et al. (2019)
 * Figure 8: Equilibrium settled fraction vs parameters
 *
 * This script validates that the simulator produces expected steady-state
 * settlement fractions for finite civilization lifetimes.
 */
interface EquilibriumResult {
    civilizationLifetime: number;
    simulatedEquilibrium: number;
    predictedEquilibrium: number;
    tauP: number;
    probeTravelTime: number;
}
interface ValidationResult {
    passed: boolean;
    message: string;
    data: EquilibriumResult[];
}
/**
 * Run validation for Figure 8
 * Tests equilibrium fraction dependence on civilization lifetime
 */
export declare function validateFigure8(): ValidationResult;
export {};
//# sourceMappingURL=figure8-equilibrium.d.ts.map