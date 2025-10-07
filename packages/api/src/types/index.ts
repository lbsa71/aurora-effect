import { SimulationConfig } from '@aurora-effect/simulator';

export interface SimulationStatus {
  id: string;
  status: 'created' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  currentTime: number;
  totalSteps: number;
  config: SimulationConfig;
  createdAt: Date;
  startedAt?: Date;
  stoppedAt?: Date;
  error?: string;
}

export interface CreateSimulationRequest {
  config: SimulationConfig;
  maxSteps?: number;
  updateInterval?: number;
}

export interface SimulationUpdate {
  id: string;
  time: number;
  settledFraction: number;
  activeCivilizations: number;
  probesInFlight: number;
  frontPosition: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}
