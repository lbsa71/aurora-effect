import { z } from 'zod';

// Schema for individual civilization configuration
export const CivilizationConfigSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  birthTime: z.number().nonnegative().default(0),
  lifetime: z.number().nonnegative(),
  originSystemId: z.number().int().nonnegative().optional(),
});

export const SimulationConfigSchema = z.object({
  // Physical parameters
  stellarDensity: z.number().positive(),
  settleableFraction: z.number().min(0).max(1),
  stellarVelocityKmS: z.number().positive(),
  
  // Probe parameters
  probeVelocityKmS: z.number().positive(),
  probeRangeLy: z.number().positive(),
  probeLaunchIntervalYr: z.number().positive(),
  
  // Civilization parameters (legacy - for single civilization)
  civilizationLifetimeYr: z.number().positive(),
  
  // Simulation parameters
  numSystems: z.number().int().positive().default(10000),
  boxSizePc: z.number().positive().default(1000),
  timeStepYr: z.number().positive().default(1000),
});

export const CreateSimulationSchema = z.object({
  config: SimulationConfigSchema,
  civilizations: z.array(CivilizationConfigSchema).min(1).optional(),
  maxSteps: z.number().int().positive().optional().default(10000),
  updateInterval: z.number().int().positive().optional().default(100),
});

export type CivilizationConfigInput = z.infer<typeof CivilizationConfigSchema>;
export type SimulationConfigInput = z.infer<typeof SimulationConfigSchema>;
export type CreateSimulationInput = z.infer<typeof CreateSimulationSchema>;
