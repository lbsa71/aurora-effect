/**
 * WebSocket client for real-time simulation updates
 */

import { io, Socket } from 'socket.io-client';
import type { SimulationUpdate, DemoStarfieldUpdate } from '../types';

// Use relative path for WebSocket - works with subpath deployments
const WS_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onStatus?: (status: string) => void;
  onUpdate?: (update: SimulationUpdate) => void;
  onDemoStarfield?: (update: DemoStarfieldUpdate) => void;
  onError?: (error: Error) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private currentSimulationId: string | null = null;

  connect(callbacks: WebSocketCallbacks = {}): void {
    this.callbacks = callbacks;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('status', (status: string) => {
      console.log('Status:', status);
      this.callbacks.onStatus?.(status);
    });

    this.socket.on('update', (update: SimulationUpdate) => {
      this.callbacks.onUpdate?.(update);
    });

    this.socket.on('demo-starfield', (update: DemoStarfieldUpdate) => {
      this.callbacks.onDemoStarfield?.(update);
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.callbacks.onError?.(error);
    });
  }

  subscribe(simulationId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.currentSimulationId = simulationId;
    this.socket.emit('subscribe', simulationId);
    console.log(`Subscribed to simulation ${simulationId}`);
  }

  unsubscribe(): void {
    if (!this.socket?.connected || !this.currentSimulationId) {
      return;
    }

    this.socket.emit('unsubscribe', this.currentSimulationId);
    console.log(`Unsubscribed from simulation ${this.currentSimulationId}`);
    this.currentSimulationId = null;
  }

  disconnect(): void {
    if (this.socket) {
      this.unsubscribe();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  get connectionStatus(): ConnectionStatus {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();
