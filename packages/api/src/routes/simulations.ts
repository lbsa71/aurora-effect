import { Router, Request, Response } from 'express';
import { simulationService } from '../services/simulationService';
import { validateRequest } from '../middleware/validation';
import { CreateSimulationSchema } from '../types/validation';
import { SimulationConfig, Vector3D } from '@aurora-effect/simulator';

const router = Router();

// GET /api/simulations - List all simulations
router.get('/', (req: Request, res: Response) => {
  const simulations = simulationService.getAllSimulations();
  res.json({ simulations });
});

// POST /api/simulations - Create new simulation
router.post('/', validateRequest(CreateSimulationSchema), (req: Request, res: Response) => {
  try {
    const { config, maxSteps, updateInterval } = req.body;

    // Convert input config to simulator config format
    const boxSize: Vector3D = {
      x: config.boxSizePc || 1000,
      y: config.boxSizePc || 1000,
      z: config.boxSizePc || 1000,
    };

    const simulatorConfig: SimulationConfig = {
      numSystems: config.numSystems || 10000,
      boxSize,
      density: config.stellarDensity,
      settleableFraction: config.settleableFraction,
      stellarVelocity: config.stellarVelocityKmS,
      probeVelocity: config.probeVelocityKmS / 299792.458, // Convert km/s to fraction of c
      probeRange: config.probeRangeLy,
      probeLaunchPeriod: config.probeLaunchIntervalYr,
      civilizationLifetime: config.civilizationLifetimeYr,
      initialSettledFraction: 0,
      timeStep: config.timeStepYr || 1000,
    };

    const id = simulationService.createSimulation(
      simulatorConfig,
      maxSteps || 10000,
      updateInterval || 100
    );

    const simulation = simulationService.getSimulation(id);
    res.status(201).json({ simulation });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to create simulation',
      code: 'CREATE_FAILED',
    });
  }
});

// GET /api/simulations/:id - Get simulation status
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const simulation = simulationService.getSimulation(id);

  if (!simulation) {
    return res.status(404).json({
      message: `Simulation ${id} not found`,
      code: 'NOT_FOUND',
    });
  }

  res.json({ simulation });
});

// POST /api/simulations/:id/start - Start simulation
router.post('/:id/start', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    simulationService.startSimulation(id);
    const simulation = simulationService.getSimulation(id);
    res.json({ simulation });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to start simulation',
      code: 'START_FAILED',
    });
  }
});

// POST /api/simulations/:id/pause - Pause simulation
router.post('/:id/pause', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    simulationService.pauseSimulation(id);
    const simulation = simulationService.getSimulation(id);
    res.json({ simulation });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to pause simulation',
      code: 'PAUSE_FAILED',
    });
  }
});

// POST /api/simulations/:id/resume - Resume simulation
router.post('/:id/resume', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    simulationService.resumeSimulation(id);
    const simulation = simulationService.getSimulation(id);
    res.json({ simulation });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to resume simulation',
      code: 'RESUME_FAILED',
    });
  }
});

// POST /api/simulations/:id/stop - Stop simulation
router.post('/:id/stop', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    simulationService.stopSimulation(id);
    const simulation = simulationService.getSimulation(id);
    res.json({ simulation });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to stop simulation',
      code: 'STOP_FAILED',
    });
  }
});

// DELETE /api/simulations/:id - Delete simulation
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    simulationService.deleteSimulation(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to delete simulation',
      code: 'DELETE_FAILED',
    });
  }
});

// GET /api/simulations/:id/snapshot - Get current state snapshot
router.get('/:id/snapshot', (req: Request, res: Response) => {
  const { id } = req.params;
  const state = simulationService.getSimulationState(id);

  if (!state) {
    return res.status(404).json({
      message: `Simulation ${id} not found`,
      code: 'NOT_FOUND',
    });
  }

  res.json({
    snapshot: {
      time: state.time,
      systems: state.systems,
      probes: state.probes,
      civilizations: state.civilizations,
      metrics: state.metrics,
    },
  });
});

// GET /api/simulations/:id/config - Get simulation config
router.get('/:id/config', (req: Request, res: Response) => {
  const { id } = req.params;
  const simulation = simulationService.getSimulation(id);

  if (!simulation) {
    return res.status(404).json({
      message: `Simulation ${id} not found`,
      code: 'NOT_FOUND',
    });
  }

  res.json({ config: simulation.config });
});

export default router;
