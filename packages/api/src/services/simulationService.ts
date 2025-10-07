import { v4 as uuidv4 } from 'uuid';
import {
  SimulationConfig,
  SimulationState,
  createSimulationState,
  stepSimulation,
  initializeSystems,
  initializeCivilization,
} from '@aurora-effect/simulator';
import { SimulationStatus, SimulationUpdate } from '../types';
import { MAX_SIMULATIONS } from '../config';

interface ManagedSimulation {
  id: string;
  state: SimulationState;
  config: SimulationConfig;
  status: SimulationStatus['status'];
  currentStep: number;
  maxSteps: number;
  updateInterval: number;
  intervalId?: NodeJS.Timeout;
  createdAt: Date;
  startedAt?: Date;
  stoppedAt?: Date;
  error?: string;
}

class SimulationService {
  private simulations: Map<string, ManagedSimulation> = new Map();
  private updateCallbacks: Map<string, (update: SimulationUpdate) => void> = new Map();

  createSimulation(config: SimulationConfig, maxSteps: number, updateInterval: number): string {
    if (this.simulations.size >= MAX_SIMULATIONS) {
      throw new Error(`Maximum number of simulations (${MAX_SIMULATIONS}) reached`);
    }

    const id = uuidv4();
    
    // Initialize systems and civilization
    const systems = initializeSystems(config);
    const { civilization } = initializeCivilization(
      systems,
      0, // civilization ID
      0, // birth time
      config.civilizationLifetime,
      '#00ff00' // green color
    );
    const state = createSimulationState(systems, [civilization]);

    const simulation: ManagedSimulation = {
      id,
      state,
      config,
      status: 'created',
      currentStep: 0,
      maxSteps,
      updateInterval,
      createdAt: new Date(),
    };

    this.simulations.set(id, simulation);
    return id;
  }

  getSimulation(id: string): SimulationStatus | null {
    const sim = this.simulations.get(id);
    if (!sim) return null;

    return {
      id: sim.id,
      status: sim.status,
      currentTime: sim.state.time,
      totalSteps: sim.currentStep,
      config: sim.config,
      createdAt: sim.createdAt,
      startedAt: sim.startedAt,
      stoppedAt: sim.stoppedAt,
      error: sim.error,
    };
  }

  getAllSimulations(): SimulationStatus[] {
    return Array.from(this.simulations.values()).map(sim => ({
      id: sim.id,
      status: sim.status,
      currentTime: sim.state.time,
      totalSteps: sim.currentStep,
      config: sim.config,
      createdAt: sim.createdAt,
      startedAt: sim.startedAt,
      stoppedAt: sim.stoppedAt,
      error: sim.error,
    }));
  }

  startSimulation(id: string): void {
    const sim = this.simulations.get(id);
    if (!sim) {
      throw new Error(`Simulation ${id} not found`);
    }

    if (sim.status === 'running') {
      throw new Error(`Simulation ${id} is already running`);
    }

    if (sim.status === 'completed') {
      throw new Error(`Simulation ${id} has already completed`);
    }

    sim.status = 'running';
    sim.startedAt = sim.startedAt || new Date();

    // Run simulation in intervals
    sim.intervalId = setInterval(() => {
      try {
        this.runSimulationStep(id);
      } catch (error) {
        this.handleSimulationError(id, error);
      }
    }, 10); // Run steps every 10ms
  }

  private runSimulationStep(id: string): void {
    const sim = this.simulations.get(id);
    if (!sim || sim.status !== 'running') return;

    // Run one step
    stepSimulation(sim.state, sim.config);
    sim.currentStep++;

    // Emit update if needed
    if (sim.currentStep % sim.updateInterval === 0) {
      const callback = this.updateCallbacks.get(id);
      if (callback) {
        callback({
          id: sim.id,
          time: sim.state.time,
          settledFraction: sim.state.metrics.settledFraction,
          activeCivilizations: sim.state.metrics.activeCivilizations,
          probesInFlight: sim.state.metrics.probesInFlight,
          frontPosition: sim.state.metrics.frontPosition,
        });
      }
    }

    // Check if completed
    if (sim.currentStep >= sim.maxSteps) {
      this.stopSimulation(id, true);
    }
  }

  pauseSimulation(id: string): void {
    const sim = this.simulations.get(id);
    if (!sim) {
      throw new Error(`Simulation ${id} not found`);
    }

    if (sim.status !== 'running') {
      throw new Error(`Simulation ${id} is not running`);
    }

    if (sim.intervalId) {
      clearInterval(sim.intervalId);
      sim.intervalId = undefined;
    }

    sim.status = 'paused';
  }

  resumeSimulation(id: string): void {
    const sim = this.simulations.get(id);
    if (!sim) {
      throw new Error(`Simulation ${id} not found`);
    }

    if (sim.status !== 'paused') {
      throw new Error(`Simulation ${id} is not paused`);
    }

    this.startSimulation(id);
  }

  stopSimulation(id: string, completed: boolean = false): void {
    const sim = this.simulations.get(id);
    if (!sim) {
      throw new Error(`Simulation ${id} not found`);
    }

    if (sim.intervalId) {
      clearInterval(sim.intervalId);
      sim.intervalId = undefined;
    }

    sim.status = completed ? 'completed' : 'stopped';
    sim.stoppedAt = new Date();
  }

  deleteSimulation(id: string): void {
    const sim = this.simulations.get(id);
    if (!sim) {
      throw new Error(`Simulation ${id} not found`);
    }

    if (sim.intervalId) {
      clearInterval(sim.intervalId);
    }

    this.simulations.delete(id);
    this.updateCallbacks.delete(id);
  }

  getSimulationState(id: string): SimulationState | null {
    const sim = this.simulations.get(id);
    return sim ? sim.state : null;
  }

  onUpdate(id: string, callback: (update: SimulationUpdate) => void): void {
    this.updateCallbacks.set(id, callback);
  }

  removeUpdateCallback(id: string): void {
    this.updateCallbacks.delete(id);
  }

  private handleSimulationError(id: string, error: unknown): void {
    const sim = this.simulations.get(id);
    if (!sim) return;

    if (sim.intervalId) {
      clearInterval(sim.intervalId);
      sim.intervalId = undefined;
    }

    sim.status = 'error';
    sim.error = error instanceof Error ? error.message : String(error);
    sim.stoppedAt = new Date();
  }
}

export const simulationService = new SimulationService();
