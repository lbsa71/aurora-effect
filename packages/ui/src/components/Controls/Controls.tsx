/**
 * Simulation control buttons
 */

import { Box, Button, Card, CardContent, Typography, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useSimulationStore, useConfigStore } from '../../store/simulation';
import { apiClient } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';

export const Controls = () => {
  const { currentSimulation, setCurrentSimulation, setLoading, setError, error } = useSimulationStore();
  const { config, maxSteps, updateInterval } = useConfigStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const { connectionStatus } = useWebSocket(currentSimulation?.id || null);

  const handleCreateSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setLocalError(null);

      const response = await apiClient.createSimulation({
        config,
        maxSteps,
        updateInterval,
      });

      setCurrentSimulation(response.simulation);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create simulation';
      setError(errorMsg);
      setLocalError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!currentSimulation) return;

    try {
      setLoading(true);
      setError(null);
      setLocalError(null);
      await apiClient.startSimulation(currentSimulation.id);
      
      // Update local state
      setCurrentSimulation({ ...currentSimulation, status: 'running' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start simulation';
      setError(errorMsg);
      setLocalError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!currentSimulation) return;

    try {
      setLoading(true);
      setError(null);
      setLocalError(null);
      await apiClient.pauseSimulation(currentSimulation.id);
      
      setCurrentSimulation({ ...currentSimulation, status: 'paused' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to pause simulation';
      setError(errorMsg);
      setLocalError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!currentSimulation) return;

    try {
      setLoading(true);
      setError(null);
      setLocalError(null);
      await apiClient.resumeSimulation(currentSimulation.id);
      
      setCurrentSimulation({ ...currentSimulation, status: 'running' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resume simulation';
      setError(errorMsg);
      setLocalError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!currentSimulation) return;

    try {
      setLoading(true);
      setError(null);
      setLocalError(null);
      await apiClient.stopSimulation(currentSimulation.id);
      
      setCurrentSimulation({ ...currentSimulation, status: 'stopped' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop simulation';
      setError(errorMsg);
      setLocalError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Simulation Controls
        </Typography>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localError}
          </Alert>
        )}

        {currentSimulation && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Status: <strong>{currentSimulation.status}</strong>
            </Typography>
            <Typography variant="body2">
              Step: <strong>{currentSimulation.currentStep}</strong>
              {currentSimulation.maxSteps && ` / ${currentSimulation.maxSteps}`}
            </Typography>
            <Typography variant="body2">
              WebSocket: <strong>{connectionStatus}</strong>
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {!currentSimulation ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateSimulation}
            >
              Create Simulation
            </Button>
          ) : (
            <>
              {currentSimulation.status === 'created' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStart}
                >
                  Start
                </Button>
              )}

              {currentSimulation.status === 'running' && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PauseIcon />}
                  onClick={handlePause}
                >
                  Pause
                </Button>
              )}

              {currentSimulation.status === 'paused' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleResume}
                >
                  Resume
                </Button>
              )}

              {(currentSimulation.status === 'running' || currentSimulation.status === 'paused') && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStop}
                >
                  Stop
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
