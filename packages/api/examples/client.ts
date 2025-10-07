/**
 * Example client demonstrating how to use the Aurora Effect API
 * This script creates a simulation, starts it, and subscribes to real-time updates
 */

import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000';

async function createSimulation() {
  const config = {
    stellarDensity: 0.1,
    settleableFraction: 0.5,
    stellarVelocityKmS: 30,
    probeVelocityKmS: 1000,
    probeRangeLy: 10,
    probeLaunchIntervalYr: 1000,
    civilizationLifetimeYr: 1000000,
    numSystems: 1000,
    boxSizePc: 100,
    timeStepYr: 1000,
  };

  const response = await fetch(`${API_URL}/api/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config,
      maxSteps: 5000,
      updateInterval: 50,
    }),
  });

  const data = await response.json();
  return data.simulation.id;
}

async function startSimulation(id: string) {
  const response = await fetch(`${API_URL}/api/simulations/${id}/start`, {
    method: 'POST',
  });

  return response.json();
}

async function main() {
  try {
    console.log('Creating simulation...');
    const simulationId = await createSimulation();
    console.log(`Simulation created: ${simulationId}`);

    // Connect to WebSocket
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('WebSocket connected');
      
      // Subscribe to updates
      socket.emit('subscribe', simulationId);
      console.log(`Subscribed to simulation ${simulationId}`);
    });

    socket.on('status', (status) => {
      console.log('Status:', status);
    });

    socket.on('update', (update) => {
      console.log(
        `Time: ${update.time.toFixed(0)} yr | ` +
        `Settled: ${(update.settledFraction * 100).toFixed(1)}% | ` +
        `Civs: ${update.activeCivilizations} | ` +
        `Probes: ${update.probesInFlight} | ` +
        `Front: ${update.frontPosition.toFixed(1)} ly`
      );
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Start simulation
    console.log('Starting simulation...');
    await startSimulation(simulationId);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
