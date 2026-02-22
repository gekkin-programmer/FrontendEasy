import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
  namespace: 'events',
})
export class AppEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppEventsGateway.name);

  constructor(private configService: ConfigService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client trying to connect: ${client.id}`);
  }

  handleGatewayDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() workspaceId: string,
  ) {
    client.join(`workspace_${workspaceId}`);
    this.logger.log(`Client ${client.id} joined workspace_${workspaceId}`);
    return { event: 'joined', data: workspaceId };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: new Date().toISOString() };
  }

  // Generic method to send events to a workspace
  sendToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace_${workspaceId}`).emit(event, data);
  }

  // Generic method to send events to a specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }
}