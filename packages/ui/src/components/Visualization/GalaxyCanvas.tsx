/**
 * Galaxy Canvas Component
 * WebGPU-based visualization of star systems
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { WebGPURenderer } from '../../services/webgpuRenderer';
import { useSimulationStore } from '../../store/simulation';
import { useVisualizationStore } from '../../store/visualization';

export const GalaxyCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGPURenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [rendererType, setRendererType] = React.useState<'webgpu' | null>(null);
  
  // Debug renderer type changes
  useEffect(() => {
    console.log('[GalaxyCanvas] Renderer type changed to:', rendererType);
  }, [rendererType]);

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
        console.error('WebGPU not supported - no fallback available');
        setRendererType(null);
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

  // Auto-rotation effect (requestAnimationFrame-based)
  useEffect(() => {
    if (!autoRotate || viewMode !== '3D') return;

    let rafId: number | null = null;
    let startTime = performance.now();
    const startPos = [...camera.position] as [number, number, number];

    const animate = () => {
      const t = (performance.now() - startTime) / 2000; // seconds scale factor
      const radius = Math.sqrt(
        startPos[0] * startPos[0] + startPos[1] * startPos[1] + startPos[2] * startPos[2]
      );
      const theta = Math.atan2(startPos[2], startPos[0]) + t;
      const phi = Math.asin(startPos[1] / radius);
      setCamera({
        position: [
          radius * Math.cos(phi) * Math.cos(theta),
          radius * Math.sin(phi),
          radius * Math.cos(phi) * Math.sin(theta),
        ],
      });
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [autoRotate, viewMode, camera.position, setCamera]);

  // Render loop
  const render = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const canvas = canvasRef.current;
    const boxSize = currentSimulation?.config.boxSizePc || 100;

    // Debug which renderer is being used
    const rendererName = 'WebGPU';
    if (Math.random() < 0.01) { // Log occasionally to avoid spam
      console.log('[GalaxyCanvas] Rendering with:', rendererName);
    }

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

  // Start render loop when renderer becomes available or render deps change
  useEffect(() => {
    if (!rendererRef.current) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [render, rendererType]);

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

  // Mouse wheel for zoom via non-passive listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      setCamera({
        zoom: Math.max(0.1, Math.min(10, (useVisualizationStore.getState().camera.zoom) * zoomFactor)),
      });
    };

    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', wheelHandler as EventListener);
    };
  }, [setCamera]);

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
        overscrollBehavior: 'none',
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
          🚀 WebGPU | 
          Systems: {snapshot.systems.length} | Settled: {snapshot.metrics.settledCount} | 
          Active Civs: {snapshot.metrics.activeCivilizations}
        </Box>
      )}
      
      {/* Debug overlay - always visible */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
        }}
      >
        Debug: {rendererType || 'null'} | {rendererRef.current ? 'WebGPU OK' : 'No Renderer'}
      </Box>
    </Box>
  );
};
