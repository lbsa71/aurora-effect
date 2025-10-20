/**
 * Tests for demo starfield service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { demoStarfieldService, DemoStarfieldUpdate } from '../src/services/demoStarfieldService';

describe('DemoStarfieldService', () => {
  beforeEach(() => {
    demoStarfieldService.stop();
  });

  afterEach(() => {
    demoStarfieldService.stop();
  });

  it('should initialize with 1000 stars', () => {
    const state = demoStarfieldService.getCurrentState();
    expect(state.stars).toHaveLength(1000);
  });

  it('should have stars with valid positions', () => {
    const state = demoStarfieldService.getCurrentState();
    
    state.stars.forEach((star) => {
      expect(star.id).toBeGreaterThanOrEqual(0);
      expect(star.position.x).toBeDefined();
      expect(star.position.y).toBeDefined();
      expect(star.position.z).toBeDefined();
      expect(star.color).toBeDefined();
      expect(star.brightness).toBeGreaterThanOrEqual(0.5);
      expect(star.brightness).toBeLessThanOrEqual(1);
    });
  });

  it('should start and stop service', () => {
    demoStarfieldService.start();
    // Service should be running
    demoStarfieldService.stop();
    // Service should be stopped
  });

  it('should emit updates when started', async () => {
    const updates: DemoStarfieldUpdate[] = [];
    const callback = (update: DemoStarfieldUpdate) => {
      updates.push(update);
    };

    demoStarfieldService.onUpdate(callback);
    demoStarfieldService.start();

    // Wait for a few updates
    await new Promise((resolve) => setTimeout(resolve, 350));

    demoStarfieldService.stop();
    demoStarfieldService.removeUpdateCallback(callback);

    // Should have received multiple updates (at least 2-3 in 350ms at 100ms interval)
    expect(updates.length).toBeGreaterThanOrEqual(2);
  });

  it('should rotate stars over time', async () => {
    const updates: DemoStarfieldUpdate[] = [];
    const callback = (update: DemoStarfieldUpdate) => {
      updates.push(update);
    };

    demoStarfieldService.onUpdate(callback);
    demoStarfieldService.start();

    // Wait for a few updates
    await new Promise((resolve) => setTimeout(resolve, 350));

    demoStarfieldService.stop();
    demoStarfieldService.removeUpdateCallback(callback);

    // Rotation should increase over time
    expect(updates.length).toBeGreaterThanOrEqual(2);
    if (updates.length >= 2) {
      expect(updates[updates.length - 1].rotation).toBeGreaterThan(updates[0].rotation);
    }
  });

  it('should provide consistent star count in updates', async () => {
    const updates: DemoStarfieldUpdate[] = [];
    const callback = (update: DemoStarfieldUpdate) => {
      updates.push(update);
    };

    demoStarfieldService.onUpdate(callback);
    demoStarfieldService.start();

    await new Promise((resolve) => setTimeout(resolve, 350));

    demoStarfieldService.stop();
    demoStarfieldService.removeUpdateCallback(callback);

    // All updates should have 1000 stars
    updates.forEach((update) => {
      expect(update.stars).toHaveLength(1000);
    });
  });

  it('should support multiple subscribers', async () => {
    const updates1: DemoStarfieldUpdate[] = [];
    const updates2: DemoStarfieldUpdate[] = [];
    
    const callback1 = (update: DemoStarfieldUpdate) => {
      updates1.push(update);
    };
    const callback2 = (update: DemoStarfieldUpdate) => {
      updates2.push(update);
    };

    demoStarfieldService.onUpdate(callback1);
    demoStarfieldService.onUpdate(callback2);
    demoStarfieldService.start();

    await new Promise((resolve) => setTimeout(resolve, 250));

    demoStarfieldService.stop();
    demoStarfieldService.removeUpdateCallback(callback1);
    demoStarfieldService.removeUpdateCallback(callback2);

    // Both subscribers should receive updates
    expect(updates1.length).toBeGreaterThanOrEqual(1);
    expect(updates2.length).toBeGreaterThanOrEqual(1);
    expect(updates1.length).toBe(updates2.length);
  });

  it('should get current state without starting service', () => {
    const state = demoStarfieldService.getCurrentState();
    
    expect(state.stars).toHaveLength(1000);
    expect(state.rotation).toBeDefined();
    expect(state.timestamp).toBeDefined();
  });
});
