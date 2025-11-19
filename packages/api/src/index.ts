import { createServer } from 'http';
import { createApp, setupWebSocket } from './app';
import { PORT, NODE_ENV, CORS_ORIGIN, MAX_SIMULATIONS, UPDATE_INTERVAL_MS, BASE_PATH } from './config';

const app = createApp();
const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Aurora Effect API Server');
  console.log('='.repeat(60));
  console.log(`Environment:     ${NODE_ENV}`);
  console.log(`Port:             ${PORT}`);
  console.log(`Base Path:        ${BASE_PATH || '/'} (${BASE_PATH ? 'configured' : 'default'})`);
  console.log(`CORS Origin:      ${CORS_ORIGIN}`);
  console.log(`Max Simulations:  ${MAX_SIMULATIONS}`);
  console.log(`Update Interval:  ${UPDATE_INTERVAL_MS}ms`);
  console.log('='.repeat(60));
  console.log(`Health check:     http://localhost:${PORT}/health`);
  console.log(`WebSocket:        Ready`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
