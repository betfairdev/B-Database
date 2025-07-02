import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import 'reflect-metadata';

import { DBManager } from '@dbmanager/core';
import { createPostgreSQLConfig } from '@dbmanager/adapter-node-postgres';
import { syncRoutes } from './routes/sync';
import { schemaRoutes } from './routes/schema';
import { filesRoutes } from './routes/files';
import { healthRoutes } from './routes/health';
import { analyticsRoutes } from './routes/analytics';
import { initializeWebSocket } from './websocket';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3000;

// Initialize DBManager
let dbManager: DBManager;

async function initializeDBManager() {
  const config = {
    mode: 'sync-server' as const,
    env: 'node' as const,
    ...createPostgreSQLConfig({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'dbmanager',
      ssl: process.env.DB_SSL === 'true'
    }),
    sync: {
      enabled: true,
      pollingIntervalMs: 30000
    },
    logging: {
      level: 'info' as const,
      enableChangeLog: true,
      maxChangeLogEntries: 1000
    },
    fileManager: {
      storageAdapter: 'local' as const,
      basePath: process.env.UPLOAD_PATH || './uploads',
      removeOrphansOnPurge: true,
      thumbnailSizes: [64, 128, 256]
    }
  };

  dbManager = new DBManager(config);
  await dbManager.initialize();
  console.log('✅ DBManager initialized successfully');
}

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make dbManager available to routes
app.use((req: any, res, next) => {
  req.dbManager = dbManager;
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/schema', schemaRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/analytics', analyticsRoutes);

// WebSocket setup
initializeWebSocket(io, dbManager);

// Error handling
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  if (dbManager) {
    await dbManager.close();
    console.log('✅ Database connections closed');
  }
  
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDBManager();
    
    server.listen(PORT, () => {
      console.log(`🚀 DBManager Sync Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready for real-time sync`);
      console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();