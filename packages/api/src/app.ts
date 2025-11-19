import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import simulationsRouter from './routes/simulations';
import presetsRouter from './routes/presets';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { simulationService } from './services/simulationService';
import { demoStarfieldService } from './services/demoStarfieldService';
import { CORS_ORIGIN, BASE_PATH } from './config';

export function createApp(): express.Application {
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
  app.use('/api/presets', presetsRouter);

  // Serve static files from UI build (if available)
  // __dirname is /app/packages/api/dist/api/src in production
  // We need to get to /app/packages/ui/dist
  const uiDistPath = path.join(__dirname, '../../../../ui/dist');
  
  // Intercept index.html requests to rewrite asset paths if BASE_PATH is set
  app.get('/', (req, res, next) => {
    if (BASE_PATH && BASE_PATH !== '/') {
      const indexPath = path.join(uiDistPath, 'index.html');
      try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        // Normalize base path (ensure it starts with / and doesn't end with /)
        const basePath = BASE_PATH.startsWith('/') 
          ? (BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH)
          : `/${BASE_PATH.replace(/\/$/, '')}`;
        
        console.log(`[Base Path Rewrite] Base path: ${basePath}`);
        console.log(`[Base Path Rewrite] Original HTML snippet: ${html.substring(0, 200)}...`);
        
        // Rewrite absolute asset paths to include base path
        // Match src="/assets/..." or href="/assets/..." (with any attributes before)
        // This handles: <script src="/assets/...">, <link href="/assets/...">, etc.
        html = html.replace(/(src|href)="\/(assets\/[^"]+)"/g, (match, attr, path) => {
          const newPath = `${basePath}/${path}`;
          console.log(`[Base Path Rewrite] Rewriting ${attr}="/${path}" to ${attr}="${newPath}"`);
          return `${attr}="${newPath}"`;
        });
        
        // Also handle other absolute paths to static assets
        html = html.replace(/(src|href)="\/([^"]+\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))"/g, (match, attr, path) => {
          // Skip if already rewritten (contains basePath)
          if (path.includes(basePath)) {
            return match;
          }
          const newPath = `${basePath}/${path}`;
          console.log(`[Base Path Rewrite] Rewriting ${attr}="/${path}" to ${attr}="${newPath}"`);
          return `${attr}="${newPath}"`;
        });
        
        console.log(`[Base Path Rewrite] Rewritten HTML snippet: ${html.substring(0, 200)}...`);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } catch (err) {
        console.error('Error rewriting HTML with base path:', err);
        next(); // Fall through to static middleware
      }
    } else {
      next(); // No base path, let static middleware handle it
    }
  });
  
  app.use(express.static(uiDistPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Don't handle API routes or health check
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return next();
    }
    
    // Serve index.html for SPA routing
    const indexPath = path.join(uiDistPath, 'index.html');
    
    // If BASE_PATH is set, rewrite asset paths in HTML at runtime
    if (BASE_PATH && BASE_PATH !== '/') {
      try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        // Normalize base path (ensure it starts with / and doesn't end with /)
        const basePath = BASE_PATH.startsWith('/') 
          ? (BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH)
          : `/${BASE_PATH.replace(/\/$/, '')}`;
        
        console.log(`[Base Path Rewrite] Base path: ${basePath}`);
        console.log(`[Base Path Rewrite] Original HTML snippet: ${html.substring(0, 200)}...`);
        
        // Rewrite absolute asset paths to include base path
        // Match src="/assets/..." or href="/assets/..." (with any attributes before)
        // This handles: <script src="/assets/...">, <link href="/assets/...">, etc.
        html = html.replace(/(src|href)="\/(assets\/[^"]+)"/g, (match, attr, path) => {
          const newPath = `${basePath}/${path}`;
          console.log(`[Base Path Rewrite] Rewriting ${attr}="/${path}" to ${attr}="${newPath}"`);
          return `${attr}="${newPath}"`;
        });
        
        // Also handle other absolute paths to static assets
        html = html.replace(/(src|href)="\/([^"]+\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))"/g, (match, attr, path) => {
          // Skip if already rewritten (contains basePath)
          if (path.includes(basePath)) {
            return match;
          }
          const newPath = `${basePath}/${path}`;
          console.log(`[Base Path Rewrite] Rewriting ${attr}="/${path}" to ${attr}="${newPath}"`);
          return `${attr}="${newPath}"`;
        });
        
        console.log(`[Base Path Rewrite] Rewritten HTML snippet: ${html.substring(0, 200)}...`);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } catch (err) {
        console.error('Error rewriting HTML with base path:', err);
        // Fallback to regular file serving if rewrite fails
        res.sendFile(indexPath, (err) => {
          if (err) {
            next();
          }
        });
      }
    } else {
      // No base path, serve normally
      res.sendFile(indexPath, (err) => {
        if (err) {
          // If UI files don't exist, fall through to 404 handler
          next();
        }
      });
    }
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function setupWebSocket(server: ReturnType<typeof createServer>): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Start demo starfield service and broadcast updates to all clients
  demoStarfieldService.start();
  demoStarfieldService.onUpdate((update) => {
    io.emit('demo-starfield', update);
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current demo starfield state immediately upon connection
    const currentState = demoStarfieldService.getCurrentState();
    socket.emit('demo-starfield', currentState);

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
