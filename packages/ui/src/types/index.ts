/**
 * Type definitions for Aurora Effect UI
 * These types match the API and simulator interfaces
 */

export interface DemoStar {
  id: number;
  position: { x: number; y: number; z: number };
  color: string;
  brightness: number;
}

export interface DemoStarfieldUpdate {
  stars: DemoStar[];
  timestamp: number;
  rotation: number;
}

export interface SimulationConfig {
  stellarDensity: number;          // Stars per pc³
  settleableFraction: number;      // Fraction of settleable systems (0-1)
  stellarVelocityKmS: number;      // Stellar velocity in km/s
  probeVelocityKmS: number;        // Probe velocity in km/s
  probeRangeLy: number;            // Probe range in light-years
  probeLaunchIntervalYr: number;   // Launch interval in years
  civilizationLifetimeYr: number;  // Civilization lifetime in years (0 = infinite)
  numSystems: number;              // Number of star systems
  boxSizePc: number;               // Box size in parsecs
  timeStepYr: number;              // Time step in years
}

export interface CreateSimulationRequest {
  config: SimulationConfig;
  maxSteps?: number;
  updateInterval?: number;
}

export interface SimulationStatus {
  id: string;
  status: 'created' | 'running' | 'paused' | 'stopped';
  currentStep: number;
  config: SimulationConfig;
  maxSteps?: number;
  updateInterval: number;
}

export interface SimulationUpdate {
  time: number;
  step: number;
  settledFraction: number;
  activeCivilizations: number;
  probesInFlight: number;
  frontPosition: number;
}

export interface StarSystem {
  position: [number, number, number];
  velocity: [number, number, number];
  isSettled: boolean;
  isTargeted: boolean;
  isSettleable: boolean;
  civilizationId?: number;
}

export interface Civilization {
  id: number;
  originIndex: number;
  birthTime: number;
  lifetime: number;
  color: string;
  probeCount: number;
  isActive: boolean;
}

export interface Probe {
  sourceIndex: number;
  targetIndex: number;
  launchTime: number;
  interceptTime: number;
  civilizationId: number;
}

export interface SimulationSnapshot {
  systems: StarSystem[];
  civilizations: Civilization[];
  probes: Probe[];
  metrics: {
    time: number;
    step: number;
    settledCount: number;
    settledFraction: number;
    targetedCount: number;
    activeCivilizations: number;
    probesInFlight: number;
    frontPosition: number;
  };
}

export type ViewMode = '3D' | '2D-XY' | '2D-XZ' | '2D-YZ';

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface UIPreferences {
  viewMode: ViewMode;
  showLabels: boolean;
  showMetrics: boolean;
  showLegend: boolean;
  colorBycivilization: boolean;
}
