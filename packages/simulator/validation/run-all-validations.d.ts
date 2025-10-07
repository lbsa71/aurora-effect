/**
 * Main validation runner
 * Executes all validation scripts and generates a comprehensive report
 */
interface ValidationSummary {
    figure3: boolean;
    figures6and7: boolean;
    figure8: boolean;
    figure9: boolean;
    overallPassed: boolean;
}
/**
 * Run all validations and generate report
 */
export declare function runAllValidations(): ValidationSummary;
/**
 * Generate validation report document
 */
export declare function generateReport(summary: ValidationSummary): string;
export {};
//# sourceMappingURL=run-all-validations.d.ts.map