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
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setShowLabels: (show: boolean) => void;
  setColorByCivilization: (colorBy: boolean) => void;
  setAutoRotate: (rotate: boolean) => void;
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

  setViewMode: (mode) => set({ viewMode: mode }),
  setCamera: (partialCamera) =>
    set((state) => ({
      camera: { ...state.camera, ...partialCamera },
    })),
  setShowLabels: (show) => set({ showLabels: show }),
  setColorByCivilization: (colorBy) => set({ colorByCivilization: colorBy }),
  setAutoRotate: (rotate) => set({ autoRotate: rotate }),
  resetCamera: () => set({ camera: defaultCamera }),
}));
