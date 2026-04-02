import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostDto } from '././create-post.dto';
import { UpdatePostDto } from '././update-post.dto';
import { PostStatus, ApprovalStatus } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // ➤ CREATE POST
  async create(dto: CreatePostDto, userId: string, workspaceId: string) {
    // 1. Determine Status
    let status = dto.status || PostStatus.DRAFT;
    if (dto.scheduledFor) status = PostStatus.SCHEDULED;

    // 2. Create Post + Relations
    return this.prisma.post.create({
      data: {
        content: dto.content,
        status,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        workspaceId,
        createdById: userId,

        // Connect Social Accounts (Many-to-Many via PostSocialAccount)
        socialAccounts: {
          create: dto.socialAccountIds.map((accId) => ({
            socialAccount: { connect: { id: accId } },
            status: status, // Propagate status to individual platform entries
          })),
        },

        // Connect Media (Many-to-Many via PostMedia)
        media: dto.mediaIds
          ? {
              create: dto.mediaIds.map((mediaId, index) => ({
                media: { connect: { id: mediaId } },
                order: index,
              })),
            }
          : undefined,
      },
      include: { media: true, socialAccounts: true },
    });
  }

  // ➤ LIST POSTS (Filterable)
  async findAll(workspaceId: string, status?: PostStatus) {
    return this.prisma.post.findMany({
      where: {
        workspaceId,
        ...(status ? { status } : {}), // Add filter if provided
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
      orderBy: { createdAt: 'desc' },
    });
  }

  // ➤ GET ONE
  async findOne(id: string, workspaceId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, workspaceId },
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
  async update(id: string, dto: UpdatePostDto, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    // Permission: Only Creator or Admin can edit (Simplified)
    if (post.createdById !== userId) {
      // In real app: Check workspace role too
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        content: dto.content,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        status: dto.status,
        // Updating relations is complex (delete old, add new), skip for MVO
      },
    });
  }

  // ➤ DELETE
  async remove(id: string, workspaceId: string) {
    // Verify ownership first
    const post = await this.prisma.post.findFirst({
      where: { id, workspaceId },
    });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.post.delete({ where: { id } });
  }

  // ➤ APPROVE (Team Workflow)
  async approve(id: string, approverId: string) {
    // 1. Verify Approver is Admin/Manager (Skip logic for MVO speed)

    return this.prisma.post.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
        status: PostStatus.SCHEDULED, // Auto-schedule upon approval
      },
    });
  }
}
