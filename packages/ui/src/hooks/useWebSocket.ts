/**
 * Custom hook for managing WebSocket connection and real-time updates
 */

import { useEffect, useState } from 'react';
import { wsClient, type ConnectionStatus } from '../services/websocket';
import { useSimulationStore } from '../store/simulation';
import { apiClient } from '../services/api';

export const useWebSocket = (simulationId: string | null) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const setLatestUpdate = useSimulationStore((state) => state.setLatestUpdate);
  const setSnapshot = useSimulationStore((state) => state.setSnapshot);
  const setError = useSimulationStore((state) => state.setError);

  useEffect(() => {
    // Connect to WebSocket
    wsClient.connect({
      onConnect: () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
      },
      onUpdate: (update) => {
        setLatestUpdate(update);
      },
      onDemoStarfield: (update) => {
        // Only update demo starfield if no simulation is active
        if (!simulationId) {
          useSimulationStore.getState().setDemoStarfield(update);
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError(error.message);
      },
    });

    return () => {
      wsClient.disconnect();
    };
  }, [setLatestUpdate, setError, simulationId]);

  useEffect(() => {
    if (simulationId && wsClient.isConnected) {
      wsClient.subscribe(simulationId);
      
      return () => {
        wsClient.unsubscribe();
      };
    }
  }, [simulationId]);

  // Periodically fetch snapshot for visualization and legend
  useEffect(() => {
    if (!simulationId) {
      setSnapshot(null);
      return;
    }

    const fetchSnapshot = async () => {
      try {
        const data = await apiClient.getSnapshot(simulationId);
        // API returns { snapshot: {...} } but getSnapshot already unwraps it
        setSnapshot(data);
      } catch (error) {
        console.error('Failed to fetch snapshot:', error);
      }
    };

    // Initial fetch
    fetchSnapshot();

    // Fetch snapshot every 2 seconds while simulation is active
    const interval = setInterval(fetchSnapshot, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [simulationId, setSnapshot]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  };
};
