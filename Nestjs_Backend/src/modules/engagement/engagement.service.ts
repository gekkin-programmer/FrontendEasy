import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { FacebookService } from '../social-accounts/platforms/facebook.service';
import { InstagramService } from '../social-accounts/platforms/instagram.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);
  private readonly YT = 'https://www.googleapis.com/youtube/v3';

  constructor(
    private prisma: PrismaService,
    private facebookService: FacebookService,
    private instagramService: InstagramService,
    private http: HttpService,
  ) {}

  // ─── 1. UNIFIED INBOX ────────────────────────────────────────────────────────

  async findAll(workspaceId: string) {
    const [comments, inboxConversations] = await Promise.all([
      this.prisma.postComment.findMany({
        where: { post: { workspaceId }, isReply: false },
        include: { post: true },
        orderBy: { publishedAt: 'desc' },
        take: 200,
      }),
      this.prisma.inboxConversation.findMany({
        where: { workspaceId },
        orderBy: { lastMessageAt: 'desc' },
        include: { messages: { orderBy: { sentAt: 'desc' }, take: 1 } },
      }),
    ]);

    const commentItems = comments.map((c) => ({
      _id: c.id,
      type: 'comment' as const,
      authorName: c.authorName ?? 'User',
      authorHandle: null,
      authorAvatar: c.authorAvatar ?? null,
      platform: c.platform?.toLowerCase() ?? 'facebook',
      content: c.content,
      receivedAt: c.publishedAt,
      status: c.status,
      sentiment: (c.sentiment as string) || 'neutral',
      externalId: c.externalId,
      postId: c.postId,
    }));

    const inboxItems = inboxConversations.map((conv) => ({
      _id: conv.id,
      type: 'dm' as const,
      authorName: conv.participantName ?? conv.participantId ?? 'Unknown',
      authorHandle: conv.participantId ?? null,
      authorAvatar: conv.participantAvatar ?? null,
      platform: conv.platform.toLowerCase().replace('_dm', ''),
      content: conv.messages[0]?.content ?? '',
      receivedAt: conv.lastMessageAt,
      status: conv.status,
      sentiment: 'neutral' as const,
      externalId: conv.externalId,
      postId: null,
      unreadCount: conv.unreadCount,
      conversationId: conv.id,
    }));

    return [...inboxItems, ...commentItems].sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
  }

  // ─── 2. REPLY ─────────────────────────────────────────────────────────────────

  async reply(id: string, text: string, workspaceId: string) {
    // Check DM conversation first
    const conv = await this.prisma.inboxConversation.findFirst({
      where: { id, workspaceId },
    });
    if (conv) {
      return { success: false, redirect: `/whatsapp/inbox/${conv.id}/send` };
    }

    const comment = await this.prisma.postComment.findUnique({
      where: { id },
      include: { post: { include: { socialAccount: true } } },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const account = comment.post.socialAccount;
    if (!account) throw new NotFoundException('Linked account not found');

    if (comment.externalId) {
      if (comment.platform === 'FACEBOOK') {
        await this.facebookService.replyToComment(
          account.accessToken,
          comment.externalId,
          text,
        );
      } else if (comment.platform === 'INSTAGRAM') {
        await this.instagramService.replyToComment(
          account.accessToken,
          comment.externalId,
          text,
        );
      } else if (comment.platform === 'YOUTUBE') {
        await this.replyToYouTubeComment(
          account.accessToken,
          comment.externalId,
          text,
        );
      }
      // TikTok: comment.list + reply requires approved commercial content scope
    }

    await this.prisma.postComment.create({
      data: {
        content: text,
        postId: comment.postId,
        externalId: `reply_${Date.now()}`,
        authorName: 'Me',
        platform: comment.platform,
        publishedAt: new Date(),
        isReply: true,
        parentId: comment.id,
        status: 'replied',
      },
    });

    await this.prisma.postComment.update({
      where: { id },
      data: { status: 'replied' },
    });

    return { success: true };
  }

  // ─── 3. STATUS UPDATE ────────────────────────────────────────────────────────

  async updateStatus(id: string, status: string) {
    const conv = await this.prisma.inboxConversation.findUnique({
      where: { id },
    });
    if (conv)
      return this.prisma.inboxConversation.update({
        where: { id },
        data: { status },
      });
    return this.prisma.postComment.update({ where: { id }, data: { status } });
  }

  // ─── 4. ON-DEMAND COMMENT SYNC ───────────────────────────────────────────────
  // Fetches fresh comments from all connected platforms and upserts to PostComment.

  async syncComments(workspaceId: string): Promise<{ synced: number }> {
    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        workspaceId,
        isActive: true,
        platform: { in: ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE'] },
      },
    });

    let synced = 0;

    for (const account of accounts) {
      try {
        if (account.platform === 'FACEBOOK') {
          synced += await this.syncFacebookComments(account);
        } else if (account.platform === 'INSTAGRAM') {
          synced += await this.syncInstagramComments(account);
        } else if (account.platform === 'YOUTUBE') {
          synced += await this.syncYouTubeComments(account);
        }
      } catch (err: any) {
        this.logger.warn(
          `Comment sync failed for ${account.platform} ${account.id}: ${err?.message}`,
        );
      }
    }

    return { synced };
  }

  private async syncFacebookComments(account: any): Promise<number> {
    let count = 0;
    const psas = await this.prisma.postSocialAccount.findMany({
      where: { socialAccountId: account.id, platformPostId: { not: null } },
      take: 20,
      orderBy: { publishedAt: 'desc' },
    });

    for (const psa of psas) {
      try {
        // Update engagement metrics
        const metricsUrl = `https://graph.facebook.com/v19.0/${psa.platformPostId}?fields=reactions.summary(true),comments.summary(true),shares&access_token=${account.accessToken}`;
        const { data: metrics } = await firstValueFrom(
          this.http.get(metricsUrl),
        );
        await this.prisma.postSocialAccount.update({
          where: { id: psa.id },
          data: {
            likes: metrics?.reactions?.summary?.total_count ?? psa.likes,
            comments: metrics?.comments?.summary?.total_count ?? psa.comments,
            shares: metrics?.shares?.count ?? psa.shares,
          },
        });

        // Fetch and upsert comments
        const commentsUrl = `https://graph.facebook.com/v19.0/${psa.platformPostId}/comments?fields=id,message,created_time,from&access_token=${account.accessToken}&limit=25`;
        const { data } = await firstValueFrom(this.http.get(commentsUrl));
        for (const c of data?.data ?? []) {
          await this.prisma.postComment.upsert({
            where: { externalId: c.id },
            create: {
              postId: psa.postId,
              externalId: c.id,
              content: c.message ?? '',
              authorName: c.from?.name ?? 'Facebook User',
              authorId: c.from?.id,
              platform: 'FACEBOOK',
              publishedAt: new Date(c.created_time),
              isReply: false,
              status: 'unread',
            },
            update: { content: c.message ?? '' },
          });
          count++;
        }
      } catch {
        /* skip this post */
      }
    }
    return count;
  }

  private async syncInstagramComments(account: any): Promise<number> {
    let count = 0;
    const psas = await this.prisma.postSocialAccount.findMany({
      where: { socialAccountId: account.id, platformPostId: { not: null } },
      take: 20,
      orderBy: { publishedAt: 'desc' },
    });

    for (const psa of psas) {
      try {
        // Update engagement metrics
        const metricsUrl = `https://graph.facebook.com/v19.0/${psa.platformPostId}?fields=like_count,comments_count&access_token=${account.accessToken}`;
        const { data: metrics } = await firstValueFrom(
          this.http.get(metricsUrl),
        );
        await this.prisma.postSocialAccount.update({
          where: { id: psa.id },
          data: {
            likes: metrics?.like_count ?? psa.likes,
            comments: metrics?.comments_count ?? psa.comments,
          },
        });

        // Fetch and upsert comments
        const commentsUrl = `https://graph.facebook.com/v19.0/${psa.platformPostId}/comments?fields=id,text,timestamp,from&access_token=${account.accessToken}&limit=25`;
        const { data } = await firstValueFrom(this.http.get(commentsUrl));
        for (const c of data?.data ?? []) {
          await this.prisma.postComment.upsert({
            where: { externalId: c.id },
            create: {
              postId: psa.postId,
              externalId: c.id,
              content: c.text ?? '',
              authorName: c.from?.username ?? 'Instagram User',
              authorId: c.from?.id,
              platform: 'INSTAGRAM',
              publishedAt: new Date(c.timestamp),
              isReply: false,
              status: 'unread',
            },
            update: { content: c.text ?? '' },
          });
          count++;
        }
      } catch {
        /* skip this post */
      }
    }
    return count;
  }

  private async syncYouTubeComments(account: any): Promise<number> {
    let count = 0;
    const headers = { Authorization: `Bearer ${account.accessToken}` };
    const psas = await this.prisma.postSocialAccount.findMany({
      where: { socialAccountId: account.id, platformPostId: { not: null } },
      take: 20,
      orderBy: { publishedAt: 'desc' },
    });

    for (const psa of psas) {
      const videoId = psa.platformPostId!.replace(
        'https://www.youtube.com/watch?v=',
        '',
      );

      try {
        const { data } = await firstValueFrom(
          this.http.get(`${this.YT}/commentThreads`, {
            headers,
            params: { part: 'snippet', videoId, maxResults: 50, order: 'time' },
          }),
        );
        for (const item of data?.items ?? []) {
          const s = item.snippet?.topLevelComment?.snippet ?? {};
          const externalId = item.id as string;
          await this.prisma.postComment.upsert({
            where: { externalId },
            create: {
              postId: psa.postId,
              externalId,
              content: (s.textDisplay as string) || '',
              authorName: (s.authorDisplayName as string) || 'YouTube User',
              authorId: s.authorChannelId?.value as string | undefined,
              platform: 'YOUTUBE',
              publishedAt: new Date(s.publishedAt as string),
              isReply: false,
              status: 'unread',
            },
            update: { content: (s.textDisplay as string) || '' },
          });
          count++;
        }
      } catch {
        /* comment disabled or quota */
      }
    }
    return count;
  }

  private async replyToYouTubeComment(
    accessToken: string,
    commentId: string,
    text: string,
  ) {
    await firstValueFrom(
      this.http.post(
        `${this.YT}/comments`,
        {
          snippet: {
            parentId: commentId,
            textOriginal: text,
          },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { part: 'snippet' },
        },
      ),
    );
  }
}
