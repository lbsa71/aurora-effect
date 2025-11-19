/**
 * API client for Aurora Effect backend
 */

import type {
  SimulationConfig,
  CreateSimulationRequest,
  SimulationStatus,
  SimulationSnapshot,
} from '../types';
import type { PresetScenario } from '../types/presets';

// Extend Window interface to include runtime-injected base path
interface WindowWithBasePath extends Window {
  __BASE_PATH__?: string;
}

// Use relative paths for API calls - works with subpath deployments
// Check for runtime-injected base path first, then fall back to env var
const getBaseUrl = (): string => {
  // Check for runtime-injected base path (set by server when BASE_PATH is configured)
  if (typeof window !== 'undefined') {
    const windowWithBasePath = window as WindowWithBasePath;
    if (windowWithBasePath.__BASE_PATH__) {
      return windowWithBasePath.__BASE_PATH__;
    }
  }
  // Fall back to environment variable
  return import.meta.env.VITE_API_URL || '';
};

const API_BASE_URL = getBaseUrl();

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createSimulation(
    request: CreateSimulationRequest
  ): Promise<{ simulation: SimulationStatus }> {
    const response = await fetch(`${this.baseUrl}/api/simulations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create simulation');
    }

    return response.json();
  }

  async listSimulations(): Promise<{ simulations: SimulationStatus[] }> {
    const response = await fetch(`${this.baseUrl}/api/simulations`);

    if (!response.ok) {
      throw new Error('Failed to list simulations');
    }

    return response.json();
  }

  async getSimulation(id: string): Promise<{ simulation: SimulationStatus }> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}`);

    if (!response.ok) {
      throw new Error('Failed to get simulation');
    }

    return response.json();
  }

  async startSimulation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start simulation');
    }
  }

  async pauseSimulation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}/pause`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to pause simulation');
    }
  }

  async resumeSimulation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}/resume`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to resume simulation');
    }
  }

  async stopSimulation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to stop simulation');
    }
  }

  async deleteSimulation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete simulation');
    }
  }

  async getSnapshot(id: string): Promise<SimulationSnapshot> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}/snapshot`);

    if (!response.ok) {
      throw new Error('Failed to get snapshot');
    }

    const data = await response.json();
    return data.snapshot;
  }

  async getConfig(id: string): Promise<{ config: SimulationConfig }> {
    const response = await fetch(`${this.baseUrl}/api/simulations/${id}/config`);

    if (!response.ok) {
      throw new Error('Failed to get config');
    }

    return response.json();
  }

  async getPresets(): Promise<{ presets: PresetScenario[] }> {
    const response = await fetch(`${this.baseUrl}/api/presets`);

    if (!response.ok) {
      throw new Error('Failed to get presets');
    }

    return response.json();
  }

  async getPreset(id: string): Promise<{ preset: PresetScenario }> {
    const response = await fetch(`${this.baseUrl}/api/presets/${id}`);

    if (!response.ok) {
      throw new Error('Failed to get preset');
    }

    return response.json();
  }

  async getPresetsByCategory(category: string): Promise<{ presets: PresetScenario[] }> {
    const response = await fetch(`${this.baseUrl}/api/presets/categories/${category}`);

    if (!response.ok) {
      throw new Error('Failed to get presets by category');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
