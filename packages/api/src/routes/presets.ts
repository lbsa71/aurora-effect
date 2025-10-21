/**
 * Routes for scenario presets
 * Implements Ticket 4.4: Scenario Presets
 */

import { Router, Request, Response } from 'express';
import {
  getAllPresets,
  getPresetById,
  getPresetsByCategory,
  PresetScenario,
} from '../services/presetService';

const router = Router();

/**
 * GET /api/presets
 * Get all available scenario presets
 */
router.get('/', (_req: Request, res: Response) => {
  const presets = getAllPresets();
  res.json({ presets });
});

/**
 * GET /api/presets/categories/:category
 * Get presets by category
 */
router.get(
  '/categories/:category',
  (req: Request, res: Response) => {
    const { category } = req.params;
    
    const validCategories: PresetScenario['category'][] = [
      'fermi',
      'optimistic',
      'steady-state',
      'research',
    ];
    
    if (!validCategories.includes(category as PresetScenario['category'])) {
      res.status(400).json({
        error: 'Invalid category',
        validCategories,
      });
      return;
    }
    
    const presets = getPresetsByCategory(category as PresetScenario['category']);
    res.json({ presets });
  }
);

/**
 * GET /api/presets/:id
 * Get a specific preset by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const preset = getPresetById(id);
  
  if (!preset) {
    res.status(404).json({ error: 'Preset not found' });
    return;
  }
  
  res.json({ preset });
});

export default router;
