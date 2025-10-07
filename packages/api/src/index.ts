import { createServer } from 'http';
import { createApp, setupWebSocket } from './app';
import { PORT } from './config';

const app = createApp();
const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Aurora Effect API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
