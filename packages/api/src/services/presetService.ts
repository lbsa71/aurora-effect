/**
 * Preset simulation scenarios based on the research paper
 * Implements Ticket 4.4: Scenario Presets
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

/**
 * Predefined simulation scenarios
 */
export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'classic-fermi',
    name: 'Classic Fermi Paradox',
    description:
      'Conservative parameters: slow probes (0.001c), low settleable fraction (10%). ' +
      'Despite being space-faring, civilizations struggle to fill the galaxy.',
    category: 'fermi',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.1,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 300, // 0.001c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 1000,
      civilizationLifetimeYr: 0,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 100000,
    updateInterval: 100,
  },
  {
    id: 'rare-earth',
    name: 'Rare Earth Hypothesis',
    description:
      'Very low settleable fraction (2%) representing the rarity of truly habitable worlds. ' +
      'Even with advanced probes, expansion is severely limited by available targets.',
    category: 'fermi',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.02,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 500,
      civilizationLifetimeYr: 0,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 100000,
    updateInterval: 100,
  },
  {
    id: 'short-lived-civilizations',
    name: 'Short-Lived Civilizations',
    description:
      'Civilizations have finite lifetimes (1 million years). Creates a steady-state equilibrium ' +
      'where only a fraction of settleable systems are occupied at any given time.',
    category: 'steady-state',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.2,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 500,
      civilizationLifetimeYr: 1000000,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 200000,
    updateInterval: 100,
  },
  {
    id: 'full-settlement',
    name: 'Optimistic Full Settlement',
    description:
      'Favorable parameters: fast probes (0.1c), high settleable fraction (50%), frequent launches. ' +
      'Demonstrates rapid galactic colonization in under 10 million years.',
    category: 'optimistic',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.5,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 30000, // 0.1c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 100,
      civilizationLifetimeYr: 0,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 50000,
    updateInterval: 100,
  },
  {
    id: 'stellar-diffusion',
    name: 'Stellar Diffusion Dominant',
    description:
      'Low density (η < 0.88) where stellar motions are crucial for settlement spread. ' +
      'Probes alone cannot reach neighbors, but stellar diffusion enables long-term expansion.',
    category: 'research',
    config: {
      numSystems: 500,
      stellarDensity: 0.04,
      settleableFraction: 0.1,
      stellarVelocityKmS: 50,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 8,
      probeLaunchIntervalYr: 1000,
      civilizationLifetimeYr: 0,
      boxSizePc: 30,
      timeStepYr: 100,
    },
    maxSteps: 150000,
    updateInterval: 100,
  },
  {
    id: 'high-density',
    name: 'High Density Regime',
    description:
      'High settleable density (η > 1) where probes easily reach multiple neighbors. ' +
      'Settlement spreads rapidly via directed probes without needing stellar diffusion.',
    category: 'research',
    config: {
      numSystems: 1000,
      stellarDensity: 0.12,
      settleableFraction: 0.4,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 12,
      probeLaunchIntervalYr: 500,
      civilizationLifetimeYr: 0,
      boxSizePc: 22,
      timeStepYr: 100,
    },
    maxSteps: 50000,
    updateInterval: 100,
  },
  {
    id: 'paper-validation',
    name: 'Paper Validation Case',
    description:
      'Parameters from Carroll-Nellenback et al. (2019) Figure 3. ' +
      'Used for validating simulator accuracy against published results.',
    category: 'research',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.2,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 500,
      civilizationLifetimeYr: 0,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 100000,
    updateInterval: 100,
  },
  {
    id: 'slow-expansion',
    name: 'Slow Conservative Expansion',
    description:
      'Very conservative probe parameters: extremely slow (0.0001c), infrequent launches (10,000 years). ' +
      'Tests the lower bounds of expansion timescales.',
    category: 'fermi',
    config: {
      numSystems: 500,
      stellarDensity: 0.08,
      settleableFraction: 0.15,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 30, // 0.0001c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 10000,
      civilizationLifetimeYr: 0,
      boxSizePc: 20,
      timeStepYr: 500,
    },
    maxSteps: 200000,
    updateInterval: 200,
  },
  {
    id: 'multiple-equilibrium',
    name: 'Multiple Equilibrium States',
    description:
      'Medium lifetime (5 million years) and moderate parameters. ' +
      'Explores equilibrium between settlement and extinction, reaching steady state X = 0.3-0.7.',
    category: 'steady-state',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.25,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 500,
      civilizationLifetimeYr: 5000000,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 300000,
    updateInterval: 150,
  },
  {
    id: 'aurora-effect-demo',
    name: 'Aurora Effect Demonstration',
    description:
      'Clear demonstration of the Aurora Effect: moderate settleable fraction (30%) creates ' +
      'persistent unsettled regions even with capable probes. Shows statistical clustering.',
    category: 'research',
    config: {
      numSystems: 1000,
      stellarDensity: 0.08,
      settleableFraction: 0.3,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 3000, // 0.01c
      probeRangeLy: 10,
      probeLaunchIntervalYr: 500,
      civilizationLifetimeYr: 0,
      boxSizePc: 25,
      timeStepYr: 100,
    },
    maxSteps: 80000,
    updateInterval: 100,
  },
];

/**
 * Get all available presets
 */
export function getAllPresets(): PresetScenario[] {
  return PRESET_SCENARIOS;
}

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): PresetScenario | null {
  return PRESET_SCENARIOS.find((p) => p.id === id) || null;
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(
  category: PresetScenario['category']
): PresetScenario[] {
  return PRESET_SCENARIOS.filter((p) => p.category === category);
}
