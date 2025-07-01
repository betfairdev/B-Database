import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { SyncEngine, ISyncEvent, ISyncState } from '@metadata-platform/core';
import { Logger } from './utils/logger.js';
import { LocalDatabase } from './local-database.js';

export interface ISyncConfig {
  serverUrl: string;
  tenantId: string;
  userId: string;
  authToken: string;
  syncInterval: number; // in milliseconds
  retryInterval: number; // in milliseconds
  maxRetries: number;
}

export class SyncManager extends EventEmitter {
  private socket: Socket | null = null;
  private syncEngine: SyncEngine;
  private isConnected = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private readonly logger = new Logger('SyncManager');

  constructor(
    private config: ISyncConfig,
    private localDb: LocalDatabase
  ) {
    super();
    this.syncEngine = new SyncEngine(config.tenantId, config.userId);
    this.setupSyncEngine();
  }

  async initialize(): Promise<void> {
    try {
      await this.syncEngine.initialize();
      await this.connectToServer();
      this.startSyncInterval();
      this.logger.info('Sync manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize sync manager:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.stopSyncInterval();
    this.disconnectFromServer();
    this.logger.info('Sync manager shut down');
  }

  async syncNow(): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Cannot sync: not connected to server');
      return;
    }

    try {
      await this.syncEngine.performSync();
      this.retryCount = 0; // Reset retry count on successful sync
    } catch (error) {
      this.logger.error('Sync failed:', error);
      this.handleSyncError(error);
    }
  }

  async applyLocalChange(change: Omit<ISyncEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.syncEngine.applyLocalChange(change);
      this.emit('localChange', change);
    } catch (error) {
      this.logger.error('Failed to apply local change:', error);
      throw error;
    }
  }

  getSyncState(): ISyncState {
    return this.syncEngine.getState();
  }

  isOnline(): boolean {
    return this.isConnected && this.syncEngine.getState().isOnline;
  }

  private async connectToServer(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = io(`${this.config.serverUrl}/sync`, {
        auth: {
          token: this.config.authToken,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.config.maxRetries,
        reconnectionDelay: this.config.retryInterval,
      });

      this.setupSocketListeners();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.logger.info('Connected to sync server');
    } catch (error) {
      this.logger.error('Failed to connect to sync server:', error);
      throw error;
    }
  }

  private disconnectFromServer(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.retryCount = 0;
      this.emit('connected');
      this.logger.info('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emit('disconnected', reason);
      this.logger.warn(`Socket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      this.logger.error('Socket connection error:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('sync-events', async (events: ISyncEvent[]) => {
      try {
        await this.syncEngine.applyRemoteChanges(events);
        this.emit('remoteChanges', events);
      } catch (error) {
        this.logger.error('Failed to apply remote changes:', error);
      }
    });

    this.socket.on('sync-conflict', (conflict) => {
      this.emit('syncConflict', conflict);
      this.logger.warn('Sync conflict detected:', conflict);
    });

    this.socket.on('error', (error) => {
      this.logger.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  private setupSyncEngine(): void {
    this.syncEngine.on('localChange', (event) => {
      if (this.isConnected && this.socket) {
        this.socket.emit('sync-request', event);
      }
    });

    this.syncEngine.on('syncStart', () => {
      this.emit('syncStart');
    });

    this.syncEngine.on('syncSuccess', () => {
      this.emit('syncSuccess');
    });

    this.syncEngine.on('syncError', (error) => {
      this.emit('syncError', error);
    });

    this.syncEngine.on('syncEnd', () => {
      this.emit('syncEnd');
    });

    this.syncEngine.on('onlineStatusChange', (isOnline) => {
      this.emit('onlineStatusChange', isOnline);
    });
  }

  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isConnected) {
        this.syncNow().catch(error => {
          this.logger.error('Scheduled sync failed:', error);
        });
      }
    }, this.config.syncInterval);
  }

  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private handleSyncError(error: any): void {
    this.retryCount++;
    
    if (this.retryCount >= this.config.maxRetries) {
      this.logger.error(`Max retry attempts (${this.config.maxRetries}) reached`);
      this.emit('maxRetriesReached', error);
      return;
    }

    // Exponential backoff
    const delay = this.config.retryInterval * Math.pow(2, this.retryCount - 1);
    setTimeout(() => {
      this.syncNow().catch(err => {
        this.logger.error('Retry sync failed:', err);
      });
    }, delay);
  }

  private handleConnectionError(error: any): void {
    this.emit('connectionError', error);
    
    // Attempt to reconnect if not at max retries
    if (this.retryCount < this.config.maxRetries) {
      const delay = this.config.retryInterval * Math.pow(2, this.retryCount);
      setTimeout(() => {
        this.connectToServer().catch(err => {
          this.logger.error('Reconnection attempt failed:', err);
        });
      }, delay);
    }
  }
}