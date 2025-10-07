/**
 * Galaxy Canvas Component
 * WebGPU-based visualization of star systems
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { WebGPURenderer } from '../../services/webgpuRenderer';
import { Canvas2DRenderer } from '../../services/canvas2dRenderer';
import { useSimulationStore } from '../../store/simulation';
import { useVisualizationStore } from '../../store/visualization';

type Renderer = WebGPURenderer | Canvas2DRenderer;

export const GalaxyCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationFrameRef = useRef<number>();
  const [rendererType, setRendererType] = React.useState<'webgpu' | 'canvas2d' | null>(null);

  const snapshot = useSimulationStore((state) => state.snapshot);
  const currentSimulation = useSimulationStore((state) => state.currentSimulation);
  const viewMode = useVisualizationStore((state) => state.viewMode);
  const camera = useVisualizationStore((state) => state.camera);
  const colorByCivilization = useVisualizationStore((state) => state.colorByCivilization);
  const autoRotate = useVisualizationStore((state) => state.autoRotate);
  const setCamera = useVisualizationStore((state) => state.setCamera);

  // Initialize WebGPU renderer
  useEffect(() => {
    const initRenderer = async () => {
      if (!canvasRef.current) return;

      const renderer = new WebGPURenderer();
      const supported = await renderer.initialize(canvasRef.current);
      
      if (supported) {
        console.log('Using WebGPU renderer');
        rendererRef.current = renderer;
        setRendererType('webgpu');
      } else {
        console.log('WebGPU not supported, using Canvas 2D fallback');
        const fallbackRenderer = new Canvas2DRenderer();
        if (fallbackRenderer.initialize(canvasRef.current)) {
          rendererRef.current = fallbackRenderer;
          setRendererType('canvas2d');
        }
      }
    };

    initRenderer();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      rendererRef.current?.destroy();
    };
  }, []);

  // Update geometry when simulation data changes
  useEffect(() => {
    if (rendererRef.current && snapshot?.systems) {
      rendererRef.current.updateGeometry(snapshot.systems, colorByCivilization);
    }
  }, [snapshot, colorByCivilization]);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || viewMode !== '3D') return;

    const interval = setInterval(() => {
      setCamera({
        position: [
          Math.cos(Date.now() / 2000) * camera.position[2],
          camera.position[1],
          Math.sin(Date.now() / 2000) * camera.position[2],
        ],
      });
    }, 16);

    return () => clearInterval(interval);
  }, [autoRotate, viewMode, camera.position, setCamera]);

  // Render loop
  const render = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const canvas = canvasRef.current;
    const boxSize = currentSimulation?.config.boxSizePc || 100;

    rendererRef.current.render(
      {
        viewMode,
        camera,
        colorByCivilization,
        boxSize,
      },
      canvas.width,
      canvas.height
    );

    animationFrameRef.current = requestAnimationFrame(render);
  }, [viewMode, camera, colorByCivilization, currentSimulation]);

  // Start render loop
  useEffect(() => {
    if (rendererRef.current) {
      animationFrameRef.current = requestAnimationFrame(render);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [render]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction for camera control
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== '3D') return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = [...camera.position] as [number, number, number];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) * 0.01;
      const deltaY = (moveEvent.clientY - startY) * 0.01;

      // Rotate camera around target
      const radius = Math.sqrt(
        startPos[0] * startPos[0] +
        startPos[1] * startPos[1] +
        startPos[2] * startPos[2]
      );

      const theta = Math.atan2(startPos[2], startPos[0]) + deltaX;
      const phi = Math.asin(startPos[1] / radius) - deltaY;

      setCamera({
        position: [
          radius * Math.cos(phi) * Math.cos(theta),
          radius * Math.sin(phi),
          radius * Math.cos(phi) * Math.sin(theta),
        ],
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [viewMode, camera.position, setCamera]);

  // Mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    setCamera({
      zoom: Math.max(0.1, Math.min(10, camera.zoom * zoomFactor)),
    });
  }, [camera.zoom, setCamera]);

  if (rendererType === null) {
    // Show initializing while canvas initializes
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'black',
        borderRadius: 1,
      }}
    >
      {rendererType === null ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Typography color="text.secondary">
            Initializing renderer...
          </Typography>
        </Box>
      ) : null}
      
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          display: 'block',
          cursor: viewMode === '3D' ? 'grab' : 'default',
        }}
      />
      
      {/* Status overlay */}
      {snapshot && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          }}
        >
          {rendererType === 'webgpu' ? '🚀 WebGPU' : '🎨 Canvas 2D'} | 
          Systems: {snapshot.systems.length} | Settled: {snapshot.metrics.settledCount} | 
          Active Civs: {snapshot.metrics.activeCivilizations}
        </Box>
      )}
    </Box>
  );
};
