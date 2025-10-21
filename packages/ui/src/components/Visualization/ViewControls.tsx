/**
 * View Controls Component
 * Controls for camera, view mode, and visualization preferences
 */

import {
  Box,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Divider,
  Slider,
} from '@mui/material';
import {
  ThreeDRotation,
  GridOn,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  Autorenew,
  Label,
  Palette,
} from '@mui/icons-material';
import { useVisualizationStore } from '../../store/visualization';
import type { ViewMode } from '../../types';

export const ViewControls = () => {
  const viewMode = useVisualizationStore((state) => state.viewMode);
  const camera = useVisualizationStore((state) => state.camera);
  const showLabels = useVisualizationStore((state) => state.showLabels);
  const colorByCivilization = useVisualizationStore((state) => state.colorByCivilization);
  const autoRotate = useVisualizationStore((state) => state.autoRotate);
  const setViewMode = useVisualizationStore((state) => state.setViewMode);
  const setCamera = useVisualizationStore((state) => state.setCamera);
  const setShowLabels = useVisualizationStore((state) => state.setShowLabels);
  const setColorByCivilization = useVisualizationStore((state) => state.setColorByCivilization);
  const setAutoRotate = useVisualizationStore((state) => state.setAutoRotate);
  const resetCamera = useVisualizationStore((state) => state.resetCamera);
  const pointSizeScale = useVisualizationStore((state) => state.pointSizeScale);
  const brightness = useVisualizationStore((state) => state.brightness);
  const setPointSizeScale = useVisualizationStore((state) => state.setPointSizeScale);
  const setBrightness = useVisualizationStore((state) => state.setBrightness);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== '3D') {
      setAutoRotate(false); // Disable auto-rotate for 2D views
    }
  };

  const handleZoomIn = () => {
    setCamera({ zoom: Math.min(10, camera.zoom * 1.2) });
  };

  const handleZoomOut = () => {
    setCamera({ zoom: Math.max(0.01, camera.zoom / 1.2) });
  };

  const handleZoomChange = (_: unknown, value: number | number[]) => {
    setCamera({ zoom: value as number });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* View Mode Selector */}
      <Box>
        <Box sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>
          View Mode
        </Box>
        <ButtonGroup size="small" fullWidth>
          <Button
            variant={viewMode === '3D' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('3D')}
            startIcon={<ThreeDRotation />}
          >
            3D
          </Button>
          <Button
            variant={viewMode === '2D-XY' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('2D-XY')}
            startIcon={<GridOn />}
          >
            XY
          </Button>
          <Button
            variant={viewMode === '2D-XZ' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('2D-XZ')}
            startIcon={<GridOn />}
          >
            XZ
          </Button>
          <Button
            variant={viewMode === '2D-YZ' ? 'contained' : 'outlined'}
            onClick={() => handleViewModeChange('2D-YZ')}
            startIcon={<GridOn />}
          >
            YZ
          </Button>
        </ButtonGroup>
      </Box>

      <Divider />

      {/* Camera Controls */}
      <Box>
        <Box sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>
          Camera Controls
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset View">
            <IconButton size="small" onClick={resetCamera}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 'auto', fontSize: '0.875rem', color: 'text.secondary' }}>
            Zoom: {camera.zoom.toFixed(2)}x
          </Box>
        </Box>
        <Box>
          <Box sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>
            Zoom Level
          </Box>
          <Slider
            size="small"
            min={0.01}
            max={10}
            step={0.01}
            value={camera.zoom}
            onChange={handleZoomChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toFixed(2)}x`}
          />
        </Box>
      </Box>

      <Divider />

      {/* Visual Options */}
      <Box>
        <Box sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>
          Display Options
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={colorByCivilization}
                onChange={(e) => setColorByCivilization(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                <Palette sx={{ fontSize: '1rem' }} />
                Color by Civilization
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                <Label sx={{ fontSize: '1rem' }} />
                Show Labels
              </Box>
            }
          />
          {viewMode === '3D' && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                  <Autorenew sx={{ fontSize: '1rem' }} />
                  Auto Rotate
                </Box>
              }
            />
          )}
          <Box sx={{ mt: 1 }}>
            <Box sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>
              Star Size
            </Box>
            <Slider
              size="small"
              min={0.2}
              max={3}
              step={0.1}
              value={pointSizeScale}
              onChange={(_, v) => setPointSizeScale(v as number)}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box>
            <Box sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>
              Brightness
            </Box>
            <Slider
              size="small"
              min={0.4}
              max={2.5}
              step={0.1}
              value={brightness}
              onChange={(_, v) => setBrightness(v as number)}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      </Box>

      {/* Instructions */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'action.hover',
          borderRadius: 1,
          fontSize: '0.75rem',
          color: 'text.secondary',
        }}
      >
        {viewMode === '3D' ? (
          <>
            <div>🖱️ Drag to rotate</div>
            <div>🔍 Scroll to zoom</div>
          </>
        ) : (
          <>
            <div>🔍 Scroll to zoom</div>
            <div>📊 Viewing {viewMode} plane</div>
          </>
        )}
      </Box>
    </Box>
  );
};
