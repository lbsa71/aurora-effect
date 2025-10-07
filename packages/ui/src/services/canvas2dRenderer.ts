/**
 * Canvas 2D fallback renderer for galaxy visualization
 * Used when WebGPU is not available
 */

import type { StarSystem, ViewMode, CameraState } from '../types';

interface RenderOptions {
  viewMode: ViewMode;
  camera: CameraState;
  colorByCivilization: boolean;
  boxSize: number;
}

export class Canvas2DRenderer {
  private ctx: CanvasRenderingContext2D | null = null;
  private systems: StarSystem[] = [];
  private civilizationColors = new Map<number, string>();

  initialize(canvas: HTMLCanvasElement): boolean {
    this.ctx = canvas.getContext('2d');
    return this.ctx !== null;
  }

  updateGeometry(systems: StarSystem[], colorByCivilization: boolean): void {
    this.systems = systems;
    
    // Generate civilization colors
    if (colorByCivilization) {
      const civIds = new Set(systems.map(s => s.civilizationId).filter(id => id !== undefined));
      civIds.forEach((id) => {
        if (id !== undefined && !this.civilizationColors.has(id)) {
          const hue = (id * 137.5) % 360; // Golden angle
          this.civilizationColors.set(id, `hsl(${hue}, 70%, 60%)`);
        }
      });
    }
  }

  render(options: RenderOptions, width: number, height: number): void {
    if (!this.ctx) return;

    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = 'rgb(13, 13, 26)';
    ctx.fillRect(0, 0, width, height);

    if (this.systems.length === 0) {
      // Draw placeholder text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No simulation data. Create a simulation to begin.', width / 2, height / 2);
      return;
    }

    // Transform setup
    const scale = (Math.min(width, height) / options.boxSize) * options.camera.zoom * 0.8;
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw systems
    for (const system of this.systems) {
      // Project 3D position to 2D based on view mode
      let x: number, y: number;
      
      switch (options.viewMode) {
        case '3D':
        case '2D-XY':
          x = system.position[0];
          y = system.position[1];
          break;
        case '2D-XZ':
          x = system.position[0];
          y = system.position[2];
          break;
        case '2D-YZ':
          x = system.position[1];
          y = system.position[2];
          break;
      }

      // Transform to screen coordinates
      const screenX = centerX + x * scale;
      const screenY = centerY - y * scale; // Invert Y for screen coordinates

      // Determine color and size based on state
      let color: string;
      let size: number;
      
      if (system.isSettled) {
        if (options.colorByCivilization && system.civilizationId !== undefined) {
          color = this.civilizationColors.get(system.civilizationId) || 'rgb(255, 77, 77)';
        } else {
          color = 'rgb(255, 77, 77)'; // Red for settled
        }
        size = 3;
      } else if (system.isTargeted) {
        color = 'rgb(77, 255, 77)'; // Green for targeted
        size = 2.5;
      } else if (system.isSettleable) {
        color = 'rgb(128, 179, 255)'; // Light blue for settleable
        size = 2;
      } else {
        color = 'rgba(77, 77, 77, 0.5)'; // Gray for unsettleable
        size = 1.5;
      }

      // Draw point with glow effect
      ctx.beginPath();
      
      // Glow
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ', 0.3)');
      ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw axes for reference (2D views)
    if (options.viewMode !== '3D') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      // X axis
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      
      // Y axis
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();
    }

    // Draw scale indicator
    const scaleBarLength = 50;
    const actualLength = scaleBarLength / scale;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, height - 30);
    ctx.lineTo(20 + scaleBarLength, height - 30);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${actualLength.toFixed(1)} pc`, 20, height - 15);
  }

  destroy(): void {
    this.ctx = null;
    this.systems = [];
    this.civilizationColors.clear();
  }
}
