import { v4 as uuidv4 } from 'uuid';
import {
  SimulationConfig,
  SimulationState,
  createSimulationState,
  stepSimulation,
  initializeSystems,
  initializeCivilization,
  SettlementStatus,
} from '@aurora-effect/simulator';
import { SimulationStatus, SimulationUpdate, CivilizationConfig, CivilizationMetrics } from '../types';
import { MAX_SIMULATIONS } from '../config';

interface ManagedSimulation {
  id: string;
  state: SimulationState;
  config: SimulationConfig;
  civilizationConfigs: CivilizationConfig[];
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

  createSimulation(
    config: SimulationConfig, 
    maxSteps: number, 
    updateInterval: number,
    civilizationConfigs?: CivilizationConfig[]
  ): string {
    if (this.simulations.size >= MAX_SIMULATIONS) {
      throw new Error(`Maximum number of simulations (${MAX_SIMULATIONS}) reached`);
    }

    const id = uuidv4();
    
    // Initialize systems
    let systems = initializeSystems(config);
    
    // Determine civilizations to create
    const civsToCreate = civilizationConfigs && civilizationConfigs.length > 0
      ? civilizationConfigs
      : [{
          id: 0,
          color: '#00ff00',
          birthTime: 0,
          lifetime: config.civilizationLifetime,
        }];
    
    // Initialize each civilization
    const civilizations = [];
    for (const civConfig of civsToCreate) {
      const result = initializeCivilization(
        systems,
        civConfig.id,
        civConfig.birthTime,
        civConfig.lifetime,
        civConfig.color,
        civConfig.probeVelocity,
        civConfig.probeRange,
        civConfig.probeLaunchPeriod
      );
      systems = result.systems;
      civilizations.push(result.civilization);
    }
    
    const state = createSimulationState(systems, civilizations);

    const simulation: ManagedSimulation = {
      id,
      state,
      config,
      civilizationConfigs: civsToCreate,
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
      civilizations: sim.civilizationConfigs,
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
      civilizations: sim.civilizationConfigs,
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
        // Calculate per-civilization metrics
        const civilizationMetrics: CivilizationMetrics[] = sim.state.civilizations.map(civ => {
          const civConfig = sim.civilizationConfigs.find(c => c.id === civ.id);
          const settledSystemsCount = sim.state.systems.filter(
            s => s.status === SettlementStatus.SETTLED && s.civilizationId === civ.id
          ).length;
          
          return {
            id: civ.id,
            name: civConfig?.name,
            color: civ.color,
            settledSystemsCount,
            activeProbeCount: civ.activeProbeCount,
            active: civ.active,
            birthTime: civ.birthTime,
            deathTime: !civ.active && civ.lifetime > 0 ? civ.birthTime + civ.lifetime : undefined,
          };
        });
        
        callback({
          id: sim.id,
          time: sim.state.time,
          settledFraction: sim.state.metrics.settledFraction,
          activeCivilizations: sim.state.metrics.activeCivilizations,
          probesInFlight: sim.state.metrics.probesInFlight,
          frontPosition: sim.state.metrics.frontPosition,
          civilizationMetrics,
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
