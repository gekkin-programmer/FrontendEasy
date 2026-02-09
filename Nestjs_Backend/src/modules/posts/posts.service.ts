import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus, ApprovalStatus, NotificationType } from '@prisma/client';
import { AppEventsGateway } from '../app-events/app-events.gateway';
import { PublisherService } from './publishing/publisher.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: AppEventsGateway,
    private publisherService: PublisherService,
    private notificationsService: NotificationsService,
  ) {}

  // ➤ CREATE POST
  async create(dto: CreatePostDto, userId: string, workspaceId: string) {
    let status = dto.status || PostStatus.DRAFT;
    const isInstant = !dto.scheduledFor && status !== PostStatus.DRAFT && status !== PostStatus.REVIEW;
    
    if (dto.scheduledFor) status = PostStatus.SCHEDULED;

    const post = await this.prisma.post.create({
      data: {
        content: dto.content,
        status,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        workspaceId,
        createdById: userId,
        socialAccounts: {
          create: dto.socialAccountIds.map(accId => ({
            socialAccount: { connect: { id: accId } },
            status: status 
          }))
        },
        media: dto.mediaIds ? {
          create: dto.mediaIds.map((mediaId, index) => ({
            media: { connect: { id: mediaId } },
            order: index
          }))
        } : undefined
      },
      include: { 
        socialAccounts: { include: { socialAccount: { select: { platform: true, username: true } } } },
        media: { include: { media: true } }
      }
    });

    // Notify Workspace via WebSocket
    this.eventsGateway.sendToWorkspace(workspaceId, 'post_created', post);

    // Increment Workspace Post Count
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { currentPostCount: { increment: 1 } }
    });

    // If it's an instant post, trigger publisher immediately
    if (isInstant) {
        this.publisherService.publishPost(post.id);
    }

    return post;
  }

  // ➤ LIST POSTS (Updated for Analytics Filters)
  async findAll(workspaceId: string, query: any = {}) {
    const { status, limit = 50, search } = query;

    return this.prisma.post.findMany({
      where: { 
        workspaceId,
        ...(status ? { status: status as PostStatus } : {}),
        ...(search ? { content: { contains: search, mode: 'insensitive' } } : {})
      },
      include: { 
        socialAccounts: { include: { socialAccount: { select: { platform: true, username: true } } } },
        media: { include: { media: true } },
        createdBy: { select: { firstName: true, avatar: true } }
      },
      orderBy: { 
        publishedAt: status === 'PUBLISHED' ? 'desc' : undefined,
        createdAt: status !== 'PUBLISHED' ? 'desc' : undefined
      },
      take: Number(limit)
    });
  }

  // ➤ CALENDAR: FIND BY RANGE
  async findInDateRange(workspaceId: string, start: Date, end: Date) {
    return this.prisma.post.findMany({
      where: {
        workspaceId,
        scheduledFor: {
          gte: start,
          lte: end
        }
      },
      include: {
        socialAccounts: { include: { socialAccount: { select: { platform: true, username: true } } } },
        media: { include: { media: true } }
      },
      orderBy: { scheduledFor: 'asc' }
    });
  }

  // ➤ GET ONE (Robust)
  async findOne(id: string, workspaceId?: string) {
    const post = await this.prisma.post.findFirst({
      where: { 
        id,
        ...(workspaceId ? { workspaceId } : {})
      },
      include: {
        socialAccounts: { include: { socialAccount: true } },
        media: { include: { media: true } },
        comments: true
      }
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ➤ UPDATE
  async update(id: string, dto: UpdatePostDto, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.status === PostStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot edit a published post');
    }
    
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        content: dto.content,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        status: dto.status,
      },
      include: {
        socialAccounts: { include: { socialAccount: { select: { platform: true, username: true } } } },
        media: { include: { media: true } }
      }
    });

    // Notify Workspace via WebSocket
    this.eventsGateway.sendToWorkspace(updated.workspaceId, 'post_updated', updated);

    return updated;
  }

  // ➤ DELETE
  async remove(id: string, workspaceId: string) {
    const post = await this.prisma.post.findFirst({ where: { id, workspaceId }});
    if (!post) throw new NotFoundException('Post not found');

    // Notify Workspace via WebSocket (Before Deletion)
    this.eventsGateway.sendToWorkspace(workspaceId, 'post_deleted', { id });

    return this.prisma.post.delete({ where: { id } });
  }

  // ➤ APPROVE
  async approve(id: string, approverId: string) {
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
        status: PostStatus.SCHEDULED 
      }
    });
    this.eventsGateway.sendToWorkspace(updated.workspaceId, 'post_updated', updated);
    return updated;
  }

  // ➤ REJECT
  async reject(id: string, rejectorId: string) {
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        status: PostStatus.DRAFT 
      }
    });
    this.eventsGateway.sendToWorkspace(updated.workspaceId, 'post_updated', updated);

    // Notify Creator
    await this.notificationsService.create(
        updated.createdById, 
        updated.workspaceId, 
        NotificationType.APPROVAL_REJECTED, 
        'Post Rejected', 
        'Your content needs revision and has been moved back to drafts.'
    );

    return updated;
  }

  // ➤ CANCEL SCHEDULE
  async cancelSchedule(id: string) {
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.DRAFT,
        scheduledFor: null
      }
    });
    this.eventsGateway.sendToWorkspace(updated.workspaceId, 'post_updated', updated);
    return updated;
  }

  // ➤ ADD COMMENT (Internal Review)
  async addComment(id: string, userId: string, content: string) {
    const comment = await this.prisma.postComment.create({
      data: {
        postId: id,
        userId,
        content,
        publishedAt: new Date(),
        status: 'read'
      },
      include: {
        user: { select: { firstName: true, avatar: true } }
      }
    });

    const post = await this.prisma.post.findUnique({ where: { id } });
    if (post) {
        this.eventsGateway.sendToWorkspace(post.workspaceId, 'post_updated', { id, comment });

        // Notify other workspace members
        const workspaceMembers = await this.prisma.workspaceMember.findMany({ 
            where: { workspaceId: post.workspaceId } 
        });

        for (const member of workspaceMembers) {
            if (member.userId !== userId) {
                await this.notificationsService.create(
                    member.userId, 
                    post.workspaceId, 
                    NotificationType.COMMENT, 
                    'New Post Comment', 
                    `New feedback on review from ${comment.user?.firstName || 'a teammate'}`
                );
            }
        }
    }

    return comment;
  }
}
