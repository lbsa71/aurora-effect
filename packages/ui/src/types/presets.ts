/**
 * Type definitions for scenario presets
 */

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  category: 'fermi' | 'optimistic' | 'steady-state' | 'research';
  config: {
    numSystems: number;
    stellarDensity: number;
    settleableFraction: number;
    stellarVelocityKmS: number;
    probeVelocityKmS: number;
    probeRangeLy: number;
    probeLaunchIntervalYr: number;
    civilizationLifetimeYr: number;
    boxSizePc: number;
    timeStepYr: number;
  };
  maxSteps?: number;
  updateInterval?: number;
}
