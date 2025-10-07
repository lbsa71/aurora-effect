/**
 * Custom hook for managing WebSocket connection and real-time updates
 */

import { useEffect, useState } from 'react';
import { wsClient, type ConnectionStatus } from '../services/websocket';
import { useSimulationStore } from '../store/simulation';

export const useWebSocket = (simulationId: string | null) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const setLatestUpdate = useSimulationStore((state) => state.setLatestUpdate);
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
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError(error.message);
      },
    });

    return () => {
      wsClient.disconnect();
    };
  }, [setLatestUpdate, setError]);

  useEffect(() => {
    if (simulationId && wsClient.isConnected) {
      wsClient.subscribe(simulationId);
      
      return () => {
        wsClient.unsubscribe();
      };
    }
  }, [simulationId]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  };
};
