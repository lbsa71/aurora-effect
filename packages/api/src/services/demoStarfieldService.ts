/**
 * Demo Starfield Service
 * Generates a rotating starfield that runs continuously on the server
 * All connected clients receive the same view
 */

export interface DemoStar {
  id: number;
  position: { x: number; y: number; z: number };
  color: string;
  brightness: number;
}

export interface DemoStarfieldUpdate {
  stars: DemoStar[];
  timestamp: number;
  rotation: number;
}

class DemoStarfieldService {
  private stars: DemoStar[] = [];
  private rotation: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private updateCallbacks: Set<(update: DemoStarfieldUpdate) => void> = new Set();
  private readonly UPDATE_FREQUENCY = 100; // 10 times per second (100ms)
  private readonly ROTATION_SPEED = 0.02; // radians per update

  constructor() {
    this.initializeStars();
  }

  /**
   * Initialize a random starfield with 1000 stars
   */
  private initializeStars(): void {
    const NUM_STARS = 1000;
    const RADIUS = 100; // parsecs

    this.stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
      // Random position in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * RADIUS;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // Random star color and brightness
      const colors = ['#ffffff', '#fffacd', '#ffd700', '#87ceeb', '#ff6b6b'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const brightness = 0.5 + Math.random() * 0.5;

      this.stars.push({
        id: i,
        position: { x, y, z },
        color,
        brightness,
      });
    }
  }

  /**
   * Start the demo starfield service
   */
  start(): void {
    if (this.intervalId) {
      console.log('Demo starfield already running');
      return;
    }

    console.log('Starting demo starfield service');
    this.intervalId = setInterval(() => {
      this.update();
    }, this.UPDATE_FREQUENCY);
  }

  /**
   * Stop the demo starfield service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped demo starfield service');
    }
  }

  /**
   * Update the starfield rotation and notify subscribers
   */
  private update(): void {
    // Increment rotation
    this.rotation += this.ROTATION_SPEED;
    if (this.rotation > Math.PI * 2) {
      this.rotation -= Math.PI * 2;
    }

    // Create rotated star positions
    const rotatedStars = this.stars.map((star) => ({
      ...star,
      position: this.rotatePoint(star.position, this.rotation),
    }));

    const update: DemoStarfieldUpdate = {
      stars: rotatedStars,
      timestamp: Date.now(),
      rotation: this.rotation,
    };

    // Notify all subscribers
    this.updateCallbacks.forEach((callback) => callback(update));
  }

  /**
   * Rotate a point around the Y axis
   */
  private rotatePoint(
    point: { x: number; y: number; z: number },
    angle: number
  ): { x: number; y: number; z: number } {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos - point.z * sin,
      y: point.y,
      z: point.x * sin + point.z * cos,
    };
  }

  /**
   * Subscribe to demo starfield updates
   */
  onUpdate(callback: (update: DemoStarfieldUpdate) => void): void {
    this.updateCallbacks.add(callback);
  }

  /**
   * Unsubscribe from demo starfield updates
   */
  removeUpdateCallback(callback: (update: DemoStarfieldUpdate) => void): void {
    this.updateCallbacks.delete(callback);
  }

  /**
   * Get current state of the demo starfield
   */
  getCurrentState(): DemoStarfieldUpdate {
    const rotatedStars = this.stars.map((star) => ({
      ...star,
      position: this.rotatePoint(star.position, this.rotation),
    }));

    return {
      stars: rotatedStars,
      timestamp: Date.now(),
      rotation: this.rotation,
    };
  }
}

export const demoStarfieldService = new DemoStarfieldService();
