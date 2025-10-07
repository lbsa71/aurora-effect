import { z } from 'zod';

export const SimulationConfigSchema = z.object({
  // Physical parameters
  stellarDensity: z.number().positive(),
  settleableFraction: z.number().min(0).max(1),
  stellarVelocityKmS: z.number().positive(),
  
  // Probe parameters
  probeVelocityKmS: z.number().positive(),
  probeRangeLy: z.number().positive(),
  probeLaunchIntervalYr: z.number().positive(),
  
  // Civilization parameters
  civilizationLifetimeYr: z.number().positive(),
  
  // Simulation parameters
  numSystems: z.number().int().positive().default(10000),
  boxSizePc: z.number().positive().default(1000),
  timeStepYr: z.number().positive().default(1000),
});

export const CreateSimulationSchema = z.object({
  config: SimulationConfigSchema,
  maxSteps: z.number().int().positive().optional().default(10000),
  updateInterval: z.number().int().positive().optional().default(100),
});

export type SimulationConfigInput = z.infer<typeof SimulationConfigSchema>;
export type CreateSimulationInput = z.infer<typeof CreateSimulationSchema>;
