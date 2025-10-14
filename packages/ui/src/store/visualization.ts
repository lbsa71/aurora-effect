/**
 * Zustand store for visualization state management
 */

import { create } from 'zustand';
import type { ViewMode, CameraState } from '../types';

interface VisualizationState {
  // View mode
  viewMode: ViewMode;
  
  // Camera state
  camera: CameraState;
  
  // Visual preferences
  showLabels: boolean;
  colorByCivilization: boolean;
  autoRotate: boolean;
  pointSizeScale: number; // UI-controlled multiplier for star size
  brightness: number;     // UI-controlled multiplier for star brightness
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setShowLabels: (show: boolean) => void;
  setColorByCivilization: (colorBy: boolean) => void;
  setAutoRotate: (rotate: boolean) => void;
  setPointSizeScale: (scale: number) => void;
  setBrightness: (brightness: number) => void;
  resetCamera: () => void;
}

const defaultCamera: CameraState = {
  position: [0, 0, 100],
  target: [0, 0, 0],
  zoom: 1,
};

export const useVisualizationStore = create<VisualizationState>((set) => ({
  viewMode: '3D',
  camera: defaultCamera,
  showLabels: false,
  colorByCivilization: true,
  autoRotate: false,
  pointSizeScale: 1.0,
  brightness: 1.0,

  setViewMode: (mode) => set({ viewMode: mode }),
  setCamera: (partialCamera) =>
    set((state) => ({
      camera: { ...state.camera, ...partialCamera },
    })),
  setShowLabels: (show) => set({ showLabels: show }),
  setColorByCivilization: (colorBy) => set({ colorByCivilization: colorBy }),
  setAutoRotate: (rotate) => set({ autoRotate: rotate }),
  setPointSizeScale: (scale) => set({ pointSizeScale: Math.max(0.1, Math.min(5, scale)) }),
  setBrightness: (brightness) => set({ brightness: Math.max(0.2, Math.min(3, brightness)) }),
  resetCamera: () => set({ camera: defaultCamera }),
}));
