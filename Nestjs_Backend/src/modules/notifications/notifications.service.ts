import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppEventsGateway } from '../app-events/app-events.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: AppEventsGateway,
  ) {}

  async create(userId: string, workspaceId: string | null, type: NotificationType, title: string, message: string, data?: any) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        workspaceId,
        type,
        title,
        message,
        data: data || {},
      },
    });

    // Notify user via WebSocket
    this.eventsGateway.sendToUser(userId, 'notification_received', notification);

    // If it's a workspace notification, notify others if needed (logic can vary)
    if (workspaceId) {
        // Option: emit to workspace room too
        // this.eventsGateway.sendToWorkspace(workspaceId, 'workspace_notification', notification);
    }

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
