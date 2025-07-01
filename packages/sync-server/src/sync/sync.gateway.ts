import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    tenantId: string;
    email: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/sync',
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SyncGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // tenantId -> set of socketIds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      // Extract and validate JWT token from handshake
      const token = client.handshake.auth?.token;
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Set user info from token payload
      client.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
      };

      // Add to tenant room
      await client.join(`tenant:${client.user.tenantId}`);
      
      // Track connected client
      if (!this.connectedClients.has(client.user.tenantId)) {
        this.connectedClients.set(client.user.tenantId, new Set());
      }
      this.connectedClients.get(client.user.tenantId)!.add(client.id);

      client.emit('connected', { 
        message: 'Connected to sync server',
        userId: client.user.id,
        tenantId: client.user.tenantId,
      });
      
      this.logger.log(`User ${client.user.email} connected to tenant ${client.user.tenantId}`);
      
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    if (client.user) {
      const tenantClients = this.connectedClients.get(client.user.tenantId);
      if (tenantClients) {
        tenantClients.delete(client.id);
        if (tenantClients.size === 0) {
          this.connectedClients.delete(client.user.tenantId);
        }
      }
      
      this.logger.log(`User ${client.user.email} disconnected from tenant ${client.user.tenantId}`);
    }
  }

  @SubscribeMessage('join-room')
  @UseGuards(JwtAuthGuard)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string }
  ): Promise<void> {
    if (client.user) {
      await client.join(data.room);
      client.emit('joined-room', { room: data.room });
      this.logger.log(`User ${client.user.email} joined room ${data.room}`);
    }
  }

  @SubscribeMessage('leave-room')
  @UseGuards(JwtAuthGuard)
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string }
  ): Promise<void> {
    await client.leave(data.room);
    client.emit('left-room', { room: data.room });
    
    if (client.user) {
      this.logger.log(`User ${client.user.email} left room ${data.room}`);
    }
  }

  @SubscribeMessage('sync-request')
  @UseGuards(JwtAuthGuard)
  async handleSyncRequest(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any
  ): Promise<void> {
    // Handle real-time sync requests
    this.logger.log(`Sync request from ${client.id}:`, data);
    
    // Broadcast to other clients in the same tenant
    if (client.user) {
      client.broadcast
        .to(`tenant:${client.user.tenantId}`)
        .emit('sync-update', {
          ...data,
          userId: client.user.id,
          timestamp: new Date(),
        });
    }
  }

  @SubscribeMessage('ping')
  async handlePing(
    @ConnectedSocket() client: AuthenticatedSocket
  ): Promise<void> {
    client.emit('pong', { timestamp: new Date() });
  }

  /**
   * Broadcast events to all clients in a tenant
   */
  broadcastToTenant(tenantId: string, event: string, data: any): void {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  /**
   * Get number of connected clients for a tenant
   */
  getConnectedClients(tenantId: string): number {
    return this.connectedClients.get(tenantId)?.size || 0;
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, event: string, data: any): void {
    this.server.to(clientId).emit(event, data);
  }

  /**
   * Get all connected tenants
   */
  getConnectedTenants(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Disconnect all clients for a tenant
   */
  disconnectTenant(tenantId: string): void {
    const clients = this.connectedClients.get(tenantId);
    if (clients) {
      clients.forEach(clientId => {
        this.server.to(clientId).emit('force-disconnect', { reason: 'Tenant disconnected' });
        this.server.sockets.sockets.get(clientId)?.disconnect();
      });
      this.connectedClients.delete(tenantId);
    }
  }
}