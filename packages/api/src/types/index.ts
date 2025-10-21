import { SimulationConfig } from '@aurora-effect/simulator';

export interface CivilizationConfig {
  id: number;
  name?: string;
  color: string;
  birthTime: number;
  lifetime: number;
  originSystemId?: number;
  /** Probe velocity relative to host system (fraction of c) - optional, defaults to config value */
  probeVelocity?: number;
  /** Maximum probe range (light-years) - optional, defaults to config value */
  probeRange?: number;
  /** Probe launch period - time to assemble new probe (years) - optional, defaults to config value */
  probeLaunchPeriod?: number;
}

export interface SimulationStatus {
  id: string;
  status: 'created' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  currentTime: number;
  totalSteps: number;
  config: SimulationConfig;
  civilizations?: CivilizationConfig[];
  createdAt: Date;
  startedAt?: Date;
  stoppedAt?: Date;
  error?: string;
}

export interface CreateSimulationRequest {
  config: SimulationConfig;
  civilizations?: CivilizationConfig[];
  maxSteps?: number;
  updateInterval?: number;
}

export interface CivilizationMetrics {
  id: number;
  name?: string;
  color: string;
  settledSystemsCount: number;
  activeProbeCount: number;
  active: boolean;
  birthTime: number;
  deathTime?: number;
}

export interface SimulationUpdate {
  id: string;
  time: number;
  settledFraction: number;
  activeCivilizations: number;
  probesInFlight: number;
  frontPosition: number;
  civilizationMetrics?: CivilizationMetrics[];
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}
