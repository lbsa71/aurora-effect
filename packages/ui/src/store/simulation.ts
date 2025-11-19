/**
 * Zustand store for simulation state management
 */

import { create } from 'zustand';
import type {
  SimulationConfig,
  SimulationStatus,
  SimulationUpdate,
  SimulationSnapshot,
  DemoStarfieldUpdate,
  CivilizationConfig,
} from '../types';

interface SimulationState {
  // Current simulation
  currentSimulation: SimulationStatus | null;
  
  // Real-time updates
  latestUpdate: SimulationUpdate | null;
  
  // Snapshot data
  snapshot: SimulationSnapshot | null;
  
  // Demo starfield data (when no simulation is active)
  demoStarfield: DemoStarfieldUpdate | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentSimulation: (simulation: SimulationStatus | null) => void;
  setLatestUpdate: (update: SimulationUpdate) => void;
  setSnapshot: (snapshot: SimulationSnapshot | null) => void;
  setDemoStarfield: (update: DemoStarfieldUpdate | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentSimulation: null,
  latestUpdate: null,
  snapshot: null,
  demoStarfield: null,
  isLoading: false,
  error: null,

  setCurrentSimulation: (simulation) => set({ currentSimulation: simulation }),
  setLatestUpdate: (update) => set({ latestUpdate: update }),
  setSnapshot: (snapshot) => set({ snapshot }),
  setDemoStarfield: (update) => set({ demoStarfield: update }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearSimulation: () =>
    set({
      currentSimulation: null,
      latestUpdate: null,
      snapshot: null,
      error: null,
    }),
}));

interface ConfigState {
  // Configuration form state
  config: SimulationConfig;
  civilizations: CivilizationConfig[];
  maxSteps: number;
  updateInterval: number;

  // Actions
  setConfig: (config: Partial<SimulationConfig>) => void;
  setCivilizations: (civilizations: CivilizationConfig[]) => void;
  addCivilization: () => void;
  removeCivilization: (id: number) => void;
  updateCivilization: (id: number, updates: Partial<CivilizationConfig>) => void;
  setMaxSteps: (maxSteps: number) => void;
  setUpdateInterval: (interval: number) => void;
  resetConfig: () => void;
}

const defaultConfig: SimulationConfig = {
  stellarDensity: 0.1,
  settleableFraction: 0.5,
  stellarVelocityKmS: 30,
  probeVelocityKmS: 1000,
  probeRangeLy: 10,
  probeLaunchIntervalYr: 1000,
  civilizationLifetimeYr: 1000000,
  numSystems: 1000,
  boxSizePc: 100,
  timeStepYr: 1000,
};

const defaultCivilizations: CivilizationConfig[] = [
  { id: 0, color: '#00ff00', birthTime: 0, lifetime: 1000000 },
];

// Convert HSL to hex color
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Generate a color using golden angle for better distribution
const generateCivilizationColor = (index: number): string => {
  const goldenAngle = 137.5;
  const hue = (index * goldenAngle) % 360;
  return hslToHex(hue, 70, 50);
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  civilizations: defaultCivilizations,
  maxSteps: 5000,
  updateInterval: 50,

  setConfig: (partialConfig) =>
    set((state) => ({
      config: { ...state.config, ...partialConfig },
    })),
  
  setCivilizations: (civilizations) => set({ civilizations }),
  
  addCivilization: () =>
    set((state) => {
      const newId = state.civilizations.length > 0 
        ? Math.max(...state.civilizations.map(c => c.id)) + 1
        : 0;
      const newCiv: CivilizationConfig = {
        id: newId,
        name: `Civilization ${newId + 1}`,
        color: generateCivilizationColor(newId),
        birthTime: 0,
        lifetime: state.config.civilizationLifetimeYr,
      };
      return {
        civilizations: [...state.civilizations, newCiv],
      };
    }),
  
  removeCivilization: (id) =>
    set((state) => ({
      civilizations: state.civilizations.filter((c) => c.id !== id),
    })),
  
  updateCivilization: (id, updates) =>
    set((state) => ({
      civilizations: state.civilizations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  
  setMaxSteps: (maxSteps) => set({ maxSteps }),
  setUpdateInterval: (updateInterval) => set({ updateInterval }),
  resetConfig: () =>
    set({
      config: defaultConfig,
      civilizations: defaultCivilizations,
      maxSteps: 5000,
      updateInterval: 50,
    }),
}));
