import http from 'http';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { realtimeServer } from './realtime/realtimeServer';

const PORT = env.PORT;

const httpServer = http.createServer(app);

// Initialize Socket.IO Real-time Intelligence Server
realtimeServer.initialize(httpServer);

const HOST = process.env.HOST || '0.0.0.0';

const server = httpServer.listen(PORT, HOST, () => {
  console.log(`==================================================`);
  console.log(`⚡ VELTREX Real-Time Backend Engine Online`);
  console.log(`📍 Host: ${HOST} | Port: ${PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API Endpoint: /api/v1/health`);
  console.log(`==================================================`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('PostgreSQL Prisma connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
