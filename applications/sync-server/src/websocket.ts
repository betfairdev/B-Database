import { Server as SocketIOServer } from 'socket.io';
import { DBManager } from '@dbmanager/core';

export function initializeWebSocket(io: SocketIOServer, dbManager: DBManager) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join database-specific rooms
    socket.on('join-database', (databaseId: string) => {
      socket.join(`db:${databaseId}`);
      console.log(`Client ${socket.id} joined database room: ${databaseId}`);
    });

    // Leave database rooms
    socket.on('leave-database', (databaseId: string) => {
      socket.leave(`db:${databaseId}`);
      console.log(`Client ${socket.id} left database room: ${databaseId}`);
    });

    // Real-time sync request
    socket.on('sync-request', async (data) => {
      try {
        const syncReport = await dbManager.sync();
        socket.emit('sync-response', {
          success: true,
          report: syncReport,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        socket.emit('sync-response', {
          success: false,
          error: error instanceof Error ? error.message : 'Sync failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Schema change notifications
    socket.on('schema-change', (data) => {
      // Broadcast schema changes to other clients in the same database
      socket.to(`db:${data.databaseId}`).emit('schema-updated', {
        type: data.type,
        table: data.table,
        changes: data.changes,
        timestamp: new Date().toISOString()
      });
    });

    // Record change notifications
    socket.on('record-change', (data) => {
      // Broadcast record changes to other clients
      socket.to(`db:${data.databaseId}`).emit('record-updated', {
        table: data.table,
        recordId: data.recordId,
        operation: data.operation,
        data: data.data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast system-wide notifications
  const broadcastNotification = (type: string, message: string, data?: any) => {
    io.emit('notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // Export broadcast function for use in other parts of the application
  return { broadcastNotification };
}