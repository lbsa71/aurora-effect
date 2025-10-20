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
  maxSteps: number;
  updateInterval: number;

  // Actions
  setConfig: (config: Partial<SimulationConfig>) => void;
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

export const useConfigStore = create<ConfigState>((set) => ({
  config: defaultConfig,
  maxSteps: 5000,
  updateInterval: 50,

  setConfig: (partialConfig) =>
    set((state) => ({
      config: { ...state.config, ...partialConfig },
    })),
  setMaxSteps: (maxSteps) => set({ maxSteps }),
  setUpdateInterval: (updateInterval) => set({ updateInterval }),
  resetConfig: () =>
    set({
      config: defaultConfig,
      maxSteps: 5000,
      updateInterval: 50,
    }),
}));
