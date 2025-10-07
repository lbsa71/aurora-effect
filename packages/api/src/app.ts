import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import simulationsRouter from './routes/simulations';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { simulationService } from './services/simulationService';
import { CORS_ORIGIN } from './config';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/simulations', simulationsRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function setupWebSocket(server: ReturnType<typeof createServer>) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Subscribe to simulation updates
    socket.on('subscribe', (simulationId: string) => {
      console.log(`Client ${socket.id} subscribing to simulation ${simulationId}`);
      
      // Join room for this simulation
      socket.join(simulationId);

      // Set up update callback
      simulationService.onUpdate(simulationId, (update) => {
        io.to(simulationId).emit('update', update);
      });

      // Send current state
      const simulation = simulationService.getSimulation(simulationId);
      if (simulation) {
        socket.emit('status', simulation);
      }
    });

    // Unsubscribe from simulation updates
    socket.on('unsubscribe', (simulationId: string) => {
      console.log(`Client ${socket.id} unsubscribing from simulation ${simulationId}`);
      socket.leave(simulationId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
