import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus, ApprovalStatus } from '@prisma/client';
import { AppEventsGateway } from '../app-events/app-events.gateway';
import { PublisherService } from './publishing/publisher.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: AppEventsGateway,
    private publisherService: PublisherService,
  ) {}

  // ➤ CREATE POST
  async create(dto: CreatePostDto, userId: string, workspaceId: string) {
    let status = dto.status || PostStatus.DRAFT;
    if (dto.scheduledFor) status = PostStatus.SCHEDULED;

    // Validate social account IDs before attempting the nested connect
    this.logger.log(`Creating post for workspace ${workspaceId} with accounts: ${JSON.stringify(dto.socialAccountIds)}`);
    const foundAccounts = await this.prisma.socialAccount.findMany({
      where: { id: { in: dto.socialAccountIds }, workspaceId },
      select: { id: true },
    });
    if (foundAccounts.length !== dto.socialAccountIds.length) {
      const foundIds = new Set(foundAccounts.map((a) => a.id));
      const missing = dto.socialAccountIds.filter((id) => !foundIds.has(id));
      this.logger.error(`Social accounts not found in workspace ${workspaceId}: ${JSON.stringify(missing)}`);
      throw new BadRequestException(
        `Social account(s) not found or do not belong to this workspace: ${missing.join(', ')}`,
      );
    }

    const post = await this.prisma.post.create({
      data: {
        content: dto.content,
        status,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        workspaceId,
        createdById: userId,
        ...(dto.platformMeta ? { platformMeta: dto.platformMeta } : {}),
        socialAccounts: {
          create: dto.socialAccountIds.map((accId) => ({
            socialAccount: { connect: { id: accId } },
            status: status,
          })),
        },
        media: dto.mediaIds
          ? {
              create: dto.mediaIds.map((mediaId, index) => ({
                media: { connect: { id: mediaId } },
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        socialAccounts: {
          include: {
            socialAccount: { select: { platform: true, username: true } },
          },
        },
        media: { include: { media: true } },
      },
    });

    // Notify Workspace via WebSocket
    this.eventsGateway.sendToWorkspace(workspaceId, 'post_created', post);

    // Increment Workspace Post Count
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { currentPostCount: { increment: 1 } },
    });

    return post;
  }

  // ➤ LIST POSTS (Updated for Analytics Filters)
  async findAll(workspaceId: string, query: any = {}) {
    const { status, limit = 50, search } = query;

    return this.prisma.post.findMany({
      where: {
        workspaceId,
        ...(status ? { status: status as PostStatus } : {}),
        ...(search
          ? { content: { contains: search, mode: 'insensitive' } }
          : {}),
      },
      include: {
        socialAccounts: {
          include: {
            socialAccount: { select: { platform: true, username: true } },
          },
        },
        media: { include: { media: true } },
        createdBy: { select: { firstName: true, avatar: true } },
      },
      orderBy: {
        publishedAt: status === 'PUBLISHED' ? 'desc' : undefined,
        createdAt: status !== 'PUBLISHED' ? 'desc' : undefined,
      },
      take: Number(limit),
    });
  }

  // ➤ CALENDAR: FIND BY RANGE
  async findInDateRange(workspaceId: string, start: Date, end: Date) {
    return this.prisma.post.findMany({
      where: {
        workspaceId,
        scheduledFor: {
          gte: start,
          lte: end,
        },
      },
      include: {
        socialAccounts: {
          include: {
            socialAccount: { select: { platform: true, username: true } },
          },
        },
        media: { include: { media: true } },
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  // ➤ GET ONE (Robust)
  async findOne(id: string, workspaceId?: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        ...(workspaceId ? { workspaceId } : {}),
      },
      include: {
        socialAccounts: { include: { socialAccount: true } },
        media: { include: { media: true } },
        comments: true,
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ➤ UPDATE
  async update(id: string, dto: UpdatePostDto, _userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    if (post.status === PostStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot edit a published post');
    }
    if (
      (post.status === PostStatus.SCHEDULED || post.status === 'PUBLISHING' as PostStatus) &&
      dto.status === PostStatus.DRAFT
    ) {
      throw new ForbiddenException('Use the cancel-schedule endpoint to unschedule a post');
    }

    if (dto.mediaIds !== undefined) {
      await this.prisma.postMedia.deleteMany({ where: { postId: id } });
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        content: dto.content,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        status: dto.status,
        ...(dto.platformMeta !== undefined ? { platformMeta: dto.platformMeta } : {}),
        ...(dto.mediaIds !== undefined && {
          media: {
            create: dto.mediaIds.map((mediaId, index) => ({
              media: { connect: { id: mediaId } },
              order: index,
            })),
          },
        }),
      },
      include: {
        socialAccounts: {
          include: {
            socialAccount: { select: { platform: true, username: true } },
          },
        },
        media: { include: { media: true } },
      },
    });

    // Notify Workspace via WebSocket
    this.eventsGateway.sendToWorkspace(
      updated.workspaceId,
      'post_updated',
      updated,
    );

    return updated;
  }

  // ➤ DELETE
  async remove(id: string, workspaceId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, workspaceId },
      include: {
        socialAccounts: { include: { socialAccount: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');

    // Best-effort delete from each social platform
    for (const psa of post.socialAccounts ?? []) {
      if (psa.platformPostId && psa.socialAccount?.accessToken) {
        await this.publisherService.deleteFromPlatform(
          psa.socialAccount.platform,
          psa.platformPostId,
          psa.socialAccount.accessToken,
        );
      }
    }

    this.eventsGateway.sendToWorkspace(workspaceId, 'post_deleted', { id });
    return this.prisma.post.delete({ where: { id } });
  }

  // ➤ REPOST (clone a published post and publish immediately)
  async repost(postId: string, userId: string, workspaceId: string) {
    const original = await this.prisma.post.findFirst({
      where: { id: postId, workspaceId },
      include: {
        socialAccounts: true,
        media: true,
      },
    });
    if (!original) throw new NotFoundException('Post not found');

    const clone = await this.prisma.post.create({
      data: {
        content: original.content,
        status: PostStatus.DRAFT,
        workspaceId,
        createdById: userId,
        ...(original.platformMeta ? { platformMeta: original.platformMeta as any } : {}),
        socialAccounts: {
          create: original.socialAccounts.map((sa) => ({
            socialAccount: { connect: { id: sa.socialAccountId } },
            status: PostStatus.DRAFT,
          })),
        },
        media: original.media.length > 0
          ? {
              create: original.media.map((pm) => ({
                media: { connect: { id: pm.mediaId } },
                order: pm.order,
              })),
            }
          : undefined,
      },
      include: {
        socialAccounts: {
          include: { socialAccount: { select: { platform: true, username: true } } },
        },
        media: { include: { media: true } },
      },
    });

    this.eventsGateway.sendToWorkspace(workspaceId, 'post_created', clone);

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { currentPostCount: { increment: 1 } },
    });

    await this.publisherService.publishPost(clone.id);

    return clone;
  }

  // ➤ APPROVE
  async approve(id: string, approverId: string) {
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
        status: PostStatus.SCHEDULED,
      },
    });
    this.eventsGateway.sendToWorkspace(
      updated.workspaceId,
      'post_updated',
      updated,
    );
    return updated;
  }

  // ➤ CANCEL SCHEDULE
  async cancelSchedule(id: string) {
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.DRAFT,
        scheduledFor: null,
      },
    });
    this.eventsGateway.sendToWorkspace(
      updated.workspaceId,
      'post_updated',
      updated,
    );
    return updated;
  }
}
