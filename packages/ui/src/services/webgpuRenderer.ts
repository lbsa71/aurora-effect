/**
 * WebGPU renderer for galaxy visualization
 * Handles efficient rendering of 10,000+ star systems using GPU instancing
 */

/// <reference types="@webgpu/types" />

import type { StarSystem, ViewMode, CameraState } from '../types';

interface RenderOptions {
  viewMode: ViewMode;
  camera: CameraState;
  colorByCivilization: boolean;
  boxSize: number;
  // UI-driven
  pointSizeScale?: number;
  brightness?: number;
}

// Vertex shader for point rendering
const vertexShaderCode = `
struct Uniforms {
  projectionMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  pointSize: f32,
  boxSize: f32,
}

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) color: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pointCoord: vec2<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(input: VertexInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  
  // Transform position
  let worldPos = vec4<f32>(input.position, 1.0);
  let viewPos = uniforms.viewMatrix * worldPos;
  output.position = uniforms.projectionMatrix * viewPos;
  
  // Point sprite coordinates
  let offset = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0,  1.0)
  );
  
  let cornerOffset = offset[vertexIndex % 4u];
  output.position.x += cornerOffset.x * uniforms.pointSize / output.position.w;
  output.position.y += cornerOffset.y * uniforms.pointSize / output.position.w;
  
  output.color = input.color;
  output.pointCoord = cornerOffset * 0.5 + 0.5;
  
  return output;
}
`;

// Fragment shader for point rendering
const fragmentShaderCode = `
struct FragmentInput {
  @location(0) color: vec4<f32>,
  @location(1) pointCoord: vec2<f32>,
}

@fragment
fn fragmentMain(input: FragmentInput) -> @location(0) vec4<f32> {
  // Circular point shape
  let dist = length(input.pointCoord - vec2<f32>(0.5, 0.5));
  if (dist > 0.55) {
    discard;
  }
  
  // Brighter core with softer, less aggressive falloff
  let edge = smoothstep(0.45, 0.55, dist);
  let alpha = mix(1.0, 0.85, edge);
  let brightness = mix(1.3, 1.0, edge); // slight bloom towards center
  return vec4<f32>(min(input.color.rgb * brightness, vec3<f32>(1.0)), input.color.a * alpha);
}
`;

export class WebGPURenderer {
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private vertexBuffer: GPUBuffer | null = null;
  private colorBuffer: GPUBuffer | null = null;
  private vertexCount = 0;
  private debugFrame = 0;

  async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
    console.log('[WebGPU] Starting initialization...');
    
    // Check for WebGPU support
    if (!navigator.gpu) {
      console.warn('[WebGPU] navigator.gpu not available');
      return false;
    }
    console.log('[WebGPU] navigator.gpu available');

    try {
      // Request adapter and device
      console.log('[WebGPU] Requesting adapter...');
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.warn('[WebGPU] Failed to get adapter');
        return false;
      }
      console.log('[WebGPU] Adapter obtained:', adapter);

      console.log('[WebGPU] Requesting device...');
      this.device = await adapter.requestDevice();
      console.log('[WebGPU] Device obtained:', this.device);
      // Surface uncaptured validation/runtime errors
      this.device.onuncapturederror = (event) => {
        console.error('[WebGPU] Uncaptured error:', event.error);
      };
      
      // Configure canvas context
      console.log('[WebGPU] Getting canvas context...');
      this.context = canvas.getContext('webgpu');
      if (!this.context) {
        console.warn('[WebGPU] Failed to get WebGPU context');
        return false;
      }
      console.log('[WebGPU] Canvas context obtained:', this.context);

      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
      console.log('[WebGPU] Preferred format:', presentationFormat);
      this.context.configure({
        device: this.device,
        format: presentationFormat,
        alphaMode: 'premultiplied',
      });
      console.log('[WebGPU] Context configured');

      // Create shader modules (with validation scopes)
      console.log('[WebGPU] Creating shader modules...');
      await this.device.pushErrorScope('validation');
      const vertexShaderModule = this.device.createShaderModule({
        code: vertexShaderCode,
        label: 'vertex-shader',
      });

      const fragmentShaderModule = this.device.createShaderModule({
        code: fragmentShaderCode,
        label: 'fragment-shader',
      });
      const shaderScopeError = await this.device.popErrorScope();
      if (shaderScopeError) {
        console.error('[WebGPU] Shader module error:', shaderScopeError);
      } else {
        console.log('[WebGPU] Shader modules created successfully');
      }

      // Create uniform buffer
      console.log('[WebGPU] Creating uniform buffer...');
      this.uniformBuffer = this.device.createBuffer({
        size: 144, // 2x mat4x4 + 2x f32 + padding
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        label: 'uniform-buffer',
      });

      // Create bind group layout
      console.log('[WebGPU] Creating bind group layout...');
      const bindGroupLayout = this.device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: { type: 'uniform' },
          },
        ],
        label: 'bind-group-layout',
      });

      // Create bind group
      console.log('[WebGPU] Creating bind group...');
      this.bindGroup = this.device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: { buffer: this.uniformBuffer },
          },
        ],
        label: 'bind-group-0',
      });

      // Create pipeline
      console.log('[WebGPU] Creating render pipeline...');
      await this.device.pushErrorScope('validation');
      this.pipeline = this.device.createRenderPipeline({
        layout: this.device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout],
          label: 'pipeline-layout',
        }),
        vertex: {
          module: vertexShaderModule,
          entryPoint: 'vertexMain',
          buffers: [
            {
              arrayStride: 12, // vec3<f32>
              stepMode: 'instance',
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: 'float32x3',
                },
              ],
            },
            {
              arrayStride: 16, // vec4<f32>
              stepMode: 'instance',
              attributes: [
                {
                  shaderLocation: 1,
                  offset: 0,
                  format: 'float32x4',
                },
              ],
            },
          ],
        },
        fragment: {
          module: fragmentShaderModule,
          entryPoint: 'fragmentMain',
          targets: [
            {
              format: presentationFormat,
              blend: {
                color: {
                  srcFactor: 'src-alpha',
                  dstFactor: 'one-minus-src-alpha',
                  operation: 'add',
                },
                alpha: {
                  srcFactor: 'one',
                  dstFactor: 'one-minus-src-alpha',
                  operation: 'add',
                },
              },
            },
          ],
        },
        primitive: {
          topology: 'triangle-strip',
        },
        depthStencil: {
          format: 'depth24plus',
          depthWriteEnabled: true,
          depthCompare: 'less',
        },
        label: 'render-pipeline',
      });
      const pipelineScopeError = await this.device.popErrorScope();
      if (pipelineScopeError) {
        console.error('[WebGPU] Pipeline creation error:', pipelineScopeError);
      } else {
        console.log('[WebGPU] Render pipeline created successfully');
      }

      console.log('[WebGPU] Initialization completed successfully');
      
      // Load test data immediately
      this.updateGeometry([], false);
      
      return true;
    } catch (error) {
      console.error('[WebGPU] Initialization failed:', error);
      return false;
    }
  }

  updateGeometry(systems: StarSystem[], colorByCivilization: boolean): void {
    if (!this.device) return;

    // Use real data if available, otherwise fall back to test data
    const systemsToUse = systems.length > 0 ? systems : this.createTestSystems();
    
    console.log(`[WebGPU] Using ${systemsToUse.length} systems (${systems.length > 0 ? 'real' : 'test'} data)`);
    
    // Coerce positions and filter invalid entries
    const coerceToVec3 = (pos: unknown): [number, number, number] | null => {
      if (Array.isArray(pos) && pos.length >= 3) {
        const x = Number(pos[0]);
        const y = Number(pos[1]);
        const z = Number(pos[2]);
        return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) ? [x, y, z] : null;
      }
      if (pos && typeof pos === 'object') {
        const anyPos = pos as Record<string, unknown>;
        const x = Number(anyPos.x);
        const y = Number(anyPos.y);
        const z = Number(anyPos.z);
        return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) ? [x, y, z] : null;
      }
      return null;
    };

    const coercedPositions: [number, number, number][] = [];
    for (const s of systemsToUse) {
      const p = coerceToVec3(s.position);
      if (p) coercedPositions.push(p);
    }

    if (coercedPositions.length === 0) {
      console.warn('[WebGPU] No valid positions after coercion; skipping geometry update');
      return;
    }

    // Calculate bounding box for debugging (robust to non-finite values)
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let validForBounds = 0;
    for (const p of coercedPositions) {
      const x = p[0], y = p[1], z = p[2];
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        validForBounds++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }
    if (validForBounds === 0 || !Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(minZ) || !Number.isFinite(maxX) || !Number.isFinite(maxY) || !Number.isFinite(maxZ)) {
      console.warn('[WebGPU] No finite positions for bounds; skipping geometry update');
      return;
    }
    const boundingBox = {
      min: [minX, minY, minZ] as [number, number, number],
      max: [maxX, maxY, maxZ] as [number, number, number],
      center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2] as [number, number, number],
      size: [maxX - minX, maxY - minY, maxZ - minZ] as [number, number, number],
      count: coercedPositions.length,
      invalidCount: systemsToUse.length - coercedPositions.length,
    };
    console.log('[WebGPU] Bounding box:', boundingBox);
    
    const vertexPositions: number[] = [];
    const colors: number[] = [];

    // Generate civilization colors
    const civColors = new Map<number, [number, number, number]>();
    
    // Compute centroid to recenter the cloud near the origin for visibility
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const p of coercedPositions) {
      sumX += p[0];
      sumY += p[1];
      sumZ += p[2];
    }
    const invCount = 1 / coercedPositions.length;
    const cx = sumX * invCount;
    const cy = sumY * invCount;
    const cz = sumZ * invCount;

    for (let i = 0; i < coercedPositions.length; i++) {
      const system = systemsToUse[i];
      const pos = coercedPositions[i];
      // Recenter around centroid so the camera points to the cloud
      vertexPositions.push(pos[0] - cx, pos[1] - cy, pos[2] - cz);

      // Determine color based on state
      let color: [number, number, number, number];
      
      if (system.isSettled) {
        if (colorByCivilization && system.civilizationId !== undefined) {
          // Get or generate color for civilization
          if (!civColors.has(system.civilizationId)) {
            const hue = (system.civilizationId * 137.5) % 360; // Golden angle
            civColors.set(system.civilizationId, this.hslToRgb(hue, 0.9, 0.8));
          }
          const rgb = civColors.get(system.civilizationId)!;
          color = [...rgb, 1.0];
        } else {
          color = [1.0, 0.2, 0.2, 1.0]; // Bright red for settled
        }
      } else if (system.isTargeted) {
        color = [0.2, 1.0, 0.2, 1.0]; // Bright green for targeted
      } else if (system.isSettleable) {
        color = [0.3, 0.6, 1.0, 1.0]; // Bright blue for settleable
      } else {
        color = [0.6, 0.6, 0.6, 0.8]; // Brighter gray for unsettleable
      }

      colors.push(...color);
    }

    // Create or update vertex buffer
    if (this.vertexBuffer) {
      this.vertexBuffer.destroy();
    }
    this.vertexBuffer = this.device.createBuffer({
      size: vertexPositions.length * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
      label: 'positions-buffer',
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexPositions);
    this.vertexBuffer.unmap();

    // Create or update color buffer
    if (this.colorBuffer) {
      this.colorBuffer.destroy();
    }
    this.colorBuffer = this.device.createBuffer({
      size: colors.length * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
      label: 'colors-buffer',
    });
    new Float32Array(this.colorBuffer.getMappedRange()).set(colors);
    this.colorBuffer.unmap();

    // One instance per system; 4 vertices will be drawn per instance
    this.vertexCount = coercedPositions.length;
  }

  private createTestSystems(): StarSystem[] {
    const systems: StarSystem[] = [];
    const numSystems = 1000;
    
    console.log('[WebGPU] Creating test systems...');
    
    // Add a bright test star at the origin first
    systems.push({
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      isSettled: true, // Bright red
      isTargeted: false,
      isSettleable: true,
      civilizationId: undefined,
    });
    
    for (let i = 0; i < numSystems; i++) {
      // Create a spiral galaxy pattern
      const angle = (i / numSystems) * Math.PI * 8; // Multiple spirals
      const radius = 20 + (i / numSystems) * 30; // Inner to outer radius
      const height = (Math.random() - 0.5) * 10; // Random height
      
      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;
      
      // Add some randomness
      const noise = 0.1;
      const finalX = x + (Math.random() - 0.5) * noise * radius;
      const finalY = y + (Math.random() - 0.5) * noise * radius;
      const finalZ = z + (Math.random() - 0.5) * noise * radius;
      
      systems.push({
        position: [finalX, finalY, finalZ],
        velocity: [0, 0, 0],
        isSettled: Math.random() < 0.1, // 10% settled
        isTargeted: Math.random() < 0.05, // 5% targeted
        isSettleable: Math.random() < 0.7, // 70% settleable
        civilizationId: Math.random() < 0.1 ? Math.floor(Math.random() * 5) : undefined,
      });
    }
    
    console.log(`[WebGPU] Created ${systems.length} test systems`);
    console.log('[WebGPU] First few positions:', systems.slice(0, 3).map(s => s.position));
    
    // Log position ranges
    const positions = systems.map(s => s.position);
    const xRange = [Math.min(...positions.map(p => p[0])), Math.max(...positions.map(p => p[0]))];
    const yRange = [Math.min(...positions.map(p => p[1])), Math.max(...positions.map(p => p[1]))];
    const zRange = [Math.min(...positions.map(p => p[2])), Math.max(...positions.map(p => p[2]))];
    console.log('[WebGPU] Position ranges:', { xRange, yRange, zRange });
    
    return systems;
  }

  render(options: RenderOptions, width: number, height: number): void {
    // Always try to clear/submit a frame so we can visually confirm activity
    if (!this.device || !this.context) {
      return;
    }

    // Update uniforms
    const uniformData = new Float32Array(36);
    
    // Projection matrix
    const aspect = width / height;
    const projectionMatrix = this.createProjectionMatrix(options.viewMode, aspect, options.camera);
    uniformData.set(projectionMatrix, 0);
    
    // View matrix
    const viewMatrix = this.createViewMatrix(options.viewMode, options.camera);
    uniformData.set(viewMatrix, 16);
    
    // Point size (in clip-space-ish units): increase for visibility (auto scales with zoom)
    const sizeScale = options.pointSizeScale ?? 1.0;
    uniformData[32] = Math.max(0.3, (9.0 * sizeScale) / Math.max(0.1, options.camera.zoom));
    uniformData[33] = options.boxSize;
    
    // Debug camera info occasionally
    if (this.debugFrame % 60 === 0) {
      console.log('[WebGPU] Camera debug:', {
        position: options.camera.position,
        target: options.camera.target,
        zoom: options.camera.zoom,
        viewMode: options.viewMode,
        pointSize: uniformData[32],
        boxSize: uniformData[33]
      });
    }

    this.device.queue.writeBuffer(this.uniformBuffer!, 0, uniformData);

    // Create command encoder with debug markers
    const commandEncoder = this.device.createCommandEncoder({ label: 'frame-encoder' });
    commandEncoder.insertDebugMarker(`frame-start-${this.debugFrame}`);
    
    const textureView = this.context.getCurrentTexture().createView();
    
    // Create depth texture
    const depthTexture = this.device.createTexture({
      size: { width, height },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
      label: 'render-pass',
    });

    // Only attempt draw if pipeline and geometry are ready
    if (this.pipeline && this.bindGroup && this.vertexBuffer && this.colorBuffer && this.vertexCount > 0) {
      renderPass.pushDebugGroup('draw-instances');
      renderPass.setPipeline(this.pipeline);
      renderPass.setBindGroup(0, this.bindGroup);
      renderPass.setVertexBuffer(0, this.vertexBuffer);
      renderPass.setVertexBuffer(1, this.colorBuffer);
      // Draw 4 vertices per instance (quad), with instance count equal to number of systems
      renderPass.draw(4, this.vertexCount);
      renderPass.popDebugGroup();
      
      // Debug logging
      if (this.debugFrame % 60 === 0) { // Log every second
        console.log(`[WebGPU] Drawing ${this.vertexCount} instances, frame ${this.debugFrame}`);
      }
    } else {
      if (this.debugFrame % 60 === 0) {
        console.log('[WebGPU] Not drawing - missing:', {
          pipeline: !!this.pipeline,
          bindGroup: !!this.bindGroup,
          vertexBuffer: !!this.vertexBuffer,
          colorBuffer: !!this.colorBuffer,
          vertexCount: this.vertexCount
        });
      }
    }
    renderPass.end();

    commandEncoder.insertDebugMarker('frame-submit');
    this.device.queue.submit([commandEncoder.finish()]);
    this.debugFrame++;
    
    depthTexture.destroy();
  }

  private createProjectionMatrix(viewMode: ViewMode, aspect: number, camera: CameraState): Float32Array {
    const fov = Math.PI / 4; // 45 degrees
    const near = 0.1;
    const far = 1000;
    
    if (viewMode === '3D') {
      return this.perspectiveMatrix(fov, aspect, near, far);
    } else {
      // Orthographic projection for 2D views
      const size = 100 / camera.zoom;
      return this.orthographicMatrix(-size * aspect, size * aspect, -size, size, near, far);
    }
  }

  private createViewMatrix(viewMode: ViewMode, camera: CameraState): Float32Array {
    const pos = camera.position;
    const target = camera.target;
    
    if (viewMode === '3D') {
      return this.lookAtMatrix(pos, target, [0, 1, 0]);
    } else {
      // For 2D views, adjust camera position based on plane
      let adjustedPos: [number, number, number];
      switch (viewMode) {
        case '2D-XY':
          adjustedPos = [target[0], target[1], 100];
          break;
        case '2D-XZ':
          adjustedPos = [target[0], 100, target[2]];
          break;
        case '2D-YZ':
          adjustedPos = [100, target[1], target[2]];
          break;
        default:
          adjustedPos = pos;
      }
      return this.lookAtMatrix(adjustedPos, target, [0, 1, 0]);
    }
  }

  private perspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1.0 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ]);
  }

  private orthographicMatrix(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    return new Float32Array([
      -2 * lr, 0, 0, 0,
      0, -2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1,
    ]);
  }

  private lookAtMatrix(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): Float32Array {
    const zAxis = this.normalize([
      eye[0] - target[0],
      eye[1] - target[1],
      eye[2] - target[2],
    ]);
    const xAxis = this.normalize(this.cross(up, zAxis));
    const yAxis = this.cross(zAxis, xAxis);

    return new Float32Array([
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1,
    ]);
  }

  private normalize(v: number[]): [number, number, number] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  }

  private cross(a: number[], b: number[]): [number, number, number] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  private dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = h / 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return [r + m, g + m, b + m];
  }

  destroy(): void {
    this.vertexBuffer?.destroy();
    this.colorBuffer?.destroy();
    this.uniformBuffer?.destroy();
    this.device?.destroy();
  }
}
