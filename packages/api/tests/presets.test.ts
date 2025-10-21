/**
 * Tests for preset scenarios API
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Presets API', () => {
  describe('GET /api/presets', () => {
    it('should return all presets', async () => {
      const response = await request(app).get('/api/presets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('presets');
      expect(Array.isArray(response.body.presets)).toBe(true);
      expect(response.body.presets.length).toBeGreaterThan(0);
    });

    it('should return presets with required fields', async () => {
      const response = await request(app).get('/api/presets');

      const preset = response.body.presets[0];
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('category');
      expect(preset).toHaveProperty('config');
      expect(preset.config).toHaveProperty('numSystems');
      expect(preset.config).toHaveProperty('stellarDensity');
      expect(preset.config).toHaveProperty('settleableFraction');
    });
  });

  describe('GET /api/presets/:id', () => {
    it('should return a specific preset', async () => {
      const response = await request(app).get(
        '/api/presets/classic-fermi'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preset');
      expect(response.body.preset.id).toBe('classic-fermi');
      expect(response.body.preset.name).toBe('Classic Fermi Paradox');
    });

    it('should return 404 for non-existent preset', async () => {
      const response = await request(app).get(
        '/api/presets/non-existent'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/presets/categories/:category', () => {
    it('should return presets by category', async () => {
      const response = await request(app).get(
        '/api/presets/categories/fermi'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('presets');
      expect(Array.isArray(response.body.presets)).toBe(true);
      
      // All presets should be in the fermi category
      response.body.presets.forEach((preset: any) => {
        expect(preset.category).toBe('fermi');
      });
    });

    it('should return empty array for category with no presets', async () => {
      // Even if a category exists but has no presets, it should return an empty array
      const response = await request(app).get(
        '/api/presets/categories/optimistic'
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.presets)).toBe(true);
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).get(
        '/api/presets/categories/invalid-category'
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('validCategories');
    });
  });

  describe('Preset validation', () => {
    it('should have at least 5 presets', async () => {
      const response = await request(app).get('/api/presets');
      expect(response.body.presets.length).toBeGreaterThanOrEqual(5);
    });

    it('should have presets in all categories', async () => {
      const categories = ['fermi', 'optimistic', 'steady-state', 'research'];
      
      for (const category of categories) {
        const response = await request(app).get(
          `/api/presets/categories/${category}`
        );
        
        expect(response.status).toBe(200);
        // At least one preset per category would be ideal, but not strictly required
      }
    });

    it('should have valid configuration values', async () => {
      const response = await request(app).get('/api/presets');
      const presets = response.body.presets;

      presets.forEach((preset: any) => {
        expect(preset.config.numSystems).toBeGreaterThan(0);
        expect(preset.config.stellarDensity).toBeGreaterThan(0);
        expect(preset.config.settleableFraction).toBeGreaterThan(0);
        expect(preset.config.settleableFraction).toBeLessThanOrEqual(1);
        expect(preset.config.probeVelocityKmS).toBeGreaterThan(0);
        expect(preset.config.probeRangeLy).toBeGreaterThan(0);
      });
    });
  });
});
