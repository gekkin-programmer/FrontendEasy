import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);

  constructor(private prisma: PrismaService) {}

  async publishPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        socialAccounts: { include: { socialAccount: true } },
        media: { include: { media: true } },
      },
    });

    if (!post) return;

    // 1. Double Publication Protection
    if (post.status === 'PUBLISHED') {
      this.logger.warn(`Post ${postId} already published. Skipping.`);
      return;
    }

    let successCount = 0;
    const retryLimit = 2;

    // Prepare Media
    const mediaUrl =
      post.media.length > 0 ? post.media[0].media.url : undefined;
    const mediaMimeType =
      post.media.length > 0 ? post.media[0].media.mimeType : undefined;

    for (const postAccount of post.socialAccounts) {
      const account = postAccount.socialAccount;

      // Skip if already published for this specific account (in case of partial retry)
      if (postAccount.status === 'PUBLISHED') {
        successCount++;
        continue;
      }

      // Skip paused accounts — their queued posts stay pending until unpaused
      if (account.isPaused) {
        this.logger.log(
          ` Skipping ${account.platform} @${account.username} — queue is paused`,
        );
        continue;
      }

      let attempts = 0;
      let platformPostId = '';
      let lastError = '';

      while (attempts < retryLimit && !platformPostId) {
        try {
          attempts++;
          this.logger.log(
            ` Publishing to ${account.platform} (Attempt ${attempts})...`,
          );

          const formattedContent = this.formatContent(
            post.content,
            account.platform,
          );

          switch (account.platform) {
            case 'FACEBOOK':
              platformPostId = await this.postToFacebook(
                account.accessToken,
                account.platformUserId,
                formattedContent,
                mediaUrl,
                mediaMimeType,
              );
              break;
            case 'LINKEDIN':
              platformPostId = await this.postToLinkedIn(
                account.accessToken,
                account.platformUserId,
                formattedContent,
                mediaUrl,
                mediaMimeType,
              );
              break;
            case 'TWITTER':
              platformPostId = await this.postToTwitter(
                account.accessToken,
                formattedContent,
              );
              break;
            case 'TIKTOK': {
              if (!mediaUrl) throw new Error('TikTok requires a video file.');
              const meta = post.platformMeta as Record<string, any> | null;
              const ttHashtags: string | undefined = meta?.tiktok?.hashtags;
              const tiktokCaption = ttHashtags
                ? `${formattedContent}\n\n${ttHashtags}`
                : formattedContent;
              platformPostId = await this.postToTikTok(
                account.accessToken,
                mediaUrl,
                tiktokCaption,
                mediaMimeType,
              );
              break;
            }
            case 'YOUTUBE':
              if (!mediaUrl) throw new Error('YouTube requires a video file.');
              if (!mediaMimeType?.startsWith('video/'))
                throw new Error(
                  'YouTube only accepts video files, not images.',
                );
              platformPostId = await this.postToYouTube(
                account.accessToken,
                post.content,
                mediaUrl,
                mediaMimeType,
              );
              break;
            case 'INSTAGRAM': {
              const meta = post.platformMeta as Record<string, any> | null;
              const igFirstComment: string | undefined =
                meta?.firstComment || undefined;
              platformPostId = await this.postToInstagram(
                account.accessToken,
                account.platformUserId,
                formattedContent,
                mediaUrl,
                mediaMimeType,
                igFirstComment,
              );
              break;
            }
            case 'THREADS':
              platformPostId = await this.postToThreads(
                account.accessToken,
                formattedContent,
                mediaUrl,
              );
              break;
            default:
              await this.simulateApiCall(account.platform);
              platformPostId = 'simulated-id';
          }
        } catch (error) {
          lastError =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message;
          this.logger.error(
            ` Attempt ${attempts} failed for ${account.platform}: ${lastError}`,
          );

          // On 401, attempt token refresh before giving up
          if (error.response?.status === 401) {
            const platform = account.platform as string;
            const canRefresh =
              account.refreshToken &&
              attempts < retryLimit &&
              ['YOUTUBE', 'LINKEDIN', 'TWITTER'].includes(platform);

            if (canRefresh) {
              try {
                let newToken: string;
                if (platform === 'YOUTUBE') {
                  newToken = await this.refreshGoogleToken(
                    account.id,
                    account.refreshToken as string,
                  );
                } else if (platform === 'LINKEDIN') {
                  newToken = await this.refreshLinkedInToken(
                    account.id,
                    account.refreshToken as string,
                  );
                } else {
                  newToken = await this.refreshTwitterToken(
                    account.id,
                    account.refreshToken as string,
                  );
                }
                account.accessToken = newToken;
                this.logger.log(` Token refreshed for ${platform} — retrying`);
              } catch {
                this.logger.error(
                  ` Token refresh failed for ${platform} — marking inactive`,
                );
                await this.prisma.socialAccount.update({
                  where: { id: account.id },
                  data: { isActive: false },
                });
                break;
              }
            } else {
              await this.prisma.socialAccount.update({
                where: { id: account.id },
                data: { isActive: false },
              });
              break;
            }
          }

          // Wait before retry
          if (attempts < retryLimit)
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (platformPostId) {
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            platformPostId,
            errorMessage: null,
          },
        });
        successCount++;
      } else {
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: {
            status: 'FAILED',
            errorMessage: lastError,
          },
        });
      }
    }

    const dbStatus =
      successCount === post.socialAccounts.length
        ? 'PUBLISHED'
        : successCount > 0
          ? 'PUBLISHED'
          : 'FAILED';
    // Note: status is PUBLISHED even if partial, to avoid infinite retry loops in cron
    // A better way would be 'PARTIALLY_PUBLISHED' but let's keep it simple for MVP.

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: dbStatus,
        publishedAt: successCount > 0 ? new Date() : null,
      },
    });

    await this.notifyUser(post.createdById, post.content, dbStatus);
  }

  private formatContent(content: string, platform: string): string {
    if (platform === 'TWITTER' && content.length > 280) {
      return content.substring(0, 277) + '...';
    }
    return content;
  }

  // =================================================================
  // 1. FACEBOOK (Graph API)
  // =================================================================
  private async postToFacebook(
    token: string,
    pageId: string,
    message: string,
    mediaUrl?: string,
    mimeType?: string,
  ) {
    let endpoint: string;
    const body: any = { access_token: token };

    if (mediaUrl && mimeType?.startsWith('video/')) {
      endpoint = `https://graph.facebook.com/${pageId}/videos`;
      body.description = message;
      body.file_url = mediaUrl;
    } else if (mediaUrl) {
      endpoint = `https://graph.facebook.com/${pageId}/photos`;
      body.message = message;
      body.url = mediaUrl;
    } else {
      endpoint = `https://graph.facebook.com/${pageId}/feed`;
      body.message = message;
    }

    const res = await axios.post(endpoint, body, { timeout: 60_000 });

    // Facebook returns HTTP 200 even for API-level errors
    if (res.data?.error) {
      const fb = res.data.error;
      throw new Error(
        `Facebook API error ${fb.code}: ${fb.message} (fbtrace: ${fb.fbtrace_id ?? 'n/a'})`,
      );
    }

    if (!res.data?.id) {
      throw new Error('Facebook API returned no post ID');
    }

    return res.data.id;
  }

  // =================================================================
  // 2. INSTAGRAM (Graph API — image or video via 2-step container flow)
  // =================================================================
  private async postToInstagram(
    pageToken: string,
    igUserId: string,
    caption: string,
    mediaUrl?: string,
    mimeType?: string,
    firstComment?: string,
  ) {
    if (!mediaUrl) throw new Error('Instagram requires an image or video.');

    const isVideo = mimeType?.startsWith('video/');
    const isReel = isVideo; // treat all videos as Reels (most supported format)

    // Step 1: Create media container
    const containerParams: Record<string, string> = {
      caption,
      access_token: pageToken,
    };

    if (isReel) {
      containerParams.media_type = 'REELS';
      containerParams.video_url = mediaUrl;
      containerParams.share_to_feed = 'true';
    } else {
      containerParams.image_url = mediaUrl;
    }

    const containerRes = await axios.post(
      `https://graph.facebook.com/v19.0/${igUserId}/media`,
      null,
      { params: containerParams, timeout: 60_000 },
    );

    const containerId: string = containerRes.data?.id;
    if (!containerId) {
      throw new Error(
        `Instagram media container creation failed: ${JSON.stringify(containerRes.data)}`,
      );
    }

    // Step 2: For videos, poll until container is ready (FINISHED)
    if (isReel) {
      const maxAttempts = 30; // 30 × 5s = 150s max
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await axios.get(
          `https://graph.facebook.com/v19.0/${containerId}`,
          {
            params: { fields: 'status_code', access_token: pageToken },
            timeout: 10_000,
          },
        );
        const statusCode: string = statusRes.data?.status_code;
        this.logger.log(
          `Instagram container ${containerId} status: ${statusCode}`,
        );
        if (statusCode === 'FINISHED') break;
        if (statusCode === 'ERROR') {
          throw new Error(
            `Instagram video processing failed for container ${containerId}`,
          );
        }
        if (i === maxAttempts - 1) {
          throw new Error('Instagram video processing timed out after 150s');
        }
      }
    }

    // Step 3: Publish the container
    const publishRes = await axios.post(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
      null,
      {
        params: { creation_id: containerId, access_token: pageToken },
        timeout: 30_000,
      },
    );

    const postId: string = publishRes.data?.id;
    if (!postId) {
      throw new Error(
        `Instagram publish returned no post ID: ${JSON.stringify(publishRes.data)}`,
      );
    }

    // Post first comment if provided (requires instagram_manage_comments permission)
    if (firstComment) {
      try {
        await axios.post(
          `https://graph.facebook.com/v19.0/${postId}/comments`,
          null,
          {
            params: { message: firstComment, access_token: pageToken },
            timeout: 15_000,
          },
        );
        this.logger.log(`Instagram first comment posted on ${postId}`);
      } catch (err: any) {
        const msg =
          err.response?.data?.error?.message || err.message;
        this.logger.warn(`Instagram first comment failed (non-fatal): ${msg}`);
      }
    }

    return postId;
  }

  // =================================================================
  // 3. LINKEDIN (UGC API — image + video)
  // =================================================================
  private async postToLinkedIn(
    token: string,
    personUrn: string,
    text: string,
    mediaUrl?: string,
    mimeType?: string,
  ) {
    const liHeaders = {
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    };

    let assetUrn: string | undefined;
    const isVideo = mimeType?.startsWith('video/');

    if (mediaUrl && mimeType && (mimeType.startsWith('image/') || isVideo)) {
      const recipe = isVideo
        ? 'urn:li:digitalmediaRecipe:feedshare-video'
        : 'urn:li:digitalmediaRecipe:feedshare-image';

      // Step 1: Register upload
      const registerRes = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            recipes: [recipe],
            owner: `urn:li:person:${personUrn}`,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        },
        { headers: liHeaders, timeout: 30_000 },
      );

      assetUrn = registerRes.data.value.asset as string;
      const uploadUrl = registerRes.data.value.uploadMechanism[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ].uploadUrl as string;

      // Step 2: Stream media to LinkedIn (avoids buffering large videos in memory)
      const mediaStream = await axios.get(mediaUrl, {
        responseType: 'stream',
        timeout: 120_000,
      });

      await axios.put(uploadUrl, mediaStream.data, {
        headers: { 'Content-Type': mimeType },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120_000,
      });

      // Step 3 (video only): Poll until LinkedIn finishes processing the asset
      if (isVideo) {
        const assetId = assetUrn.split(':').pop();
        const maxAttempts = 30; // 30 × 2s = 60s max wait
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const statusRes = await axios.get(
            `https://api.linkedin.com/v2/assets/${assetId}`,
            { headers: liHeaders, timeout: 10_000 },
          );
          const assetStatus: string = statusRes.data?.recipes?.[0]?.status;
          this.logger.debug(`LinkedIn asset ${assetId} status: ${assetStatus}`);
          if (assetStatus === 'AVAILABLE') break;
          if (assetStatus === 'FAILED')
            throw new Error('LinkedIn video processing failed');
          if (i === maxAttempts - 1)
            throw new Error('LinkedIn video processing timed out after 60s');
        }
      }
    }

    // Step 4: Create the UGC post
    const shareCategory = assetUrn ? (isVideo ? 'VIDEO' : 'IMAGE') : 'NONE';
    const shareContent: any = {
      shareCommentary: { text },
      shareMediaCategory: shareCategory,
    };

    if (assetUrn) {
      shareContent.media = [
        {
          status: 'READY',
          description: { text: '' },
          media: assetUrn,
          title: { text: '' },
        },
      ];
    }

    const body = {
      author: `urn:li:person:${personUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
      headers: liHeaders,
      timeout: 30_000,
    });
    return res.data.id;
  }

  // =================================================================
  // 3. TWITTER / X (API v2)
  // =================================================================
  private async postToTwitter(token: string, text: string) {
    const res = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 30_000 },
    );
    return res.data.data.id;
  }

  // =================================================================
  // 4. TIKTOK (Content Posting API — FILE_UPLOAD)
  // =================================================================
  private async postToTikTok(
    token: string,
    videoUrl: string,
    text: string,
    mimeType?: string,
  ) {
    const tiktokRequest = async <T>(
      label: string,
      fn: () => Promise<T>,
    ): Promise<T> => {
      try {
        return await fn();
      } catch (err: any) {
        const status = err.response?.status;
        const body = err.response?.data;
        this.logger.error(
          `TikTok [${label}] HTTP ${status ?? 'no-response'}: ${JSON.stringify(body)}`,
        );
        throw new Error(body?.error?.message || body?.message || err.message);
      }
    };

    // Step 1: Download video to buffer (needed to get exact byte size for init)
    const videoRes = await axios.get<ArrayBuffer>(videoUrl, {
      responseType: 'arraybuffer',
      timeout: 120_000,
    });
    const videoBuffer = Buffer.from(videoRes.data);
    const videoSize = videoBuffer.length;
    const contentType = mimeType?.startsWith('video/') ? mimeType : 'video/mp4';

    // Step 2: Init the upload session — Direct Post to TikTok feed
    const initRes = await tiktokRequest('init', () =>
      axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title: text.substring(0, 2200),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false,
            video_cover_timestamp_ms: 1000,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: videoSize,
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          timeout: 30_000,
        },
      ),
    );

    const tiktokError = initRes.data?.error;
    if (tiktokError?.code && tiktokError.code !== 'ok') {
      throw new Error(
        `TikTok init error: ${tiktokError.message} (${tiktokError.code})`,
      );
    }

    const { publish_id, upload_url } = initRes.data?.data ?? {};
    if (!publish_id || !upload_url) {
      throw new Error(
        `TikTok init returned no upload URL: ${JSON.stringify(initRes.data)}`,
      );
    }

    // Step 3: Upload video bytes in a single chunk
    await tiktokRequest('upload', () =>
      axios.put(upload_url, videoBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
          'Content-Length': String(videoSize),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120_000,
      }),
    );

    // Step 4: Poll until TikTok finishes processing the upload
    const maxAttempts = 30; // 30 × 2s = 60s max wait
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await tiktokRequest('status', () =>
        axios.post(
          'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
          { publish_id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json; charset=UTF-8',
            },
            timeout: 10_000,
          },
        ),
      );
      const status = statusRes.data?.data?.status as string;
      this.logger.log(`TikTok publish_id=${publish_id} status: ${status}`);
      // PUBLISH_COMPLETE = direct post succeeded
      // SEND_TO_USER_INBOX = inbox/draft upload succeeded
      if (status === 'PUBLISH_COMPLETE' || status === 'SEND_TO_USER_INBOX') {
        return publish_id as string;
      }
      if (status === 'FAILED') {
        throw new Error(
          `TikTok publish failed: ${JSON.stringify(statusRes.data?.data)}`,
        );
      }
      if (i === maxAttempts - 1) {
        throw new Error('TikTok publishing timed out after 60s');
      }
    }

    return publish_id as string;
  }

  // =================================================================
  // 5. THREADS
  // =================================================================
  private async postToThreads(token: string, text: string, imageUrl?: string) {
    // 1. Create a container
    const containerParams: any = {
      media_type: imageUrl ? 'IMAGE' : 'TEXT',
      text,
      access_token: token,
    };
    if (imageUrl) {
      containerParams.image_url = imageUrl;
    }

    const containerRes = await axios.post(
      'https://graph.threads.net/v1.0/me/threads',
      null,
      { params: containerParams },
    );
    const containerId = containerRes.data.id;

    if (!containerId) {
      throw new Error('Failed to create Threads container');
    }

    // 2. Publish the container
    const publishRes = await axios.post(
      'https://graph.threads.net/v1.0/me/threads_publish',
      null,
      { params: { creation_id: containerId, access_token: token } },
    );

    return publishRes.data.id;
  }

  // =================================================================
  // 6. YOUTUBE (Data API v3 — resumable upload)
  // =================================================================
  private async postToYouTube(
    token: string,
    content: string,
    videoUrl: string,
    mimeType: string,
  ) {
    const videoRes = await axios.get<ArrayBuffer>(videoUrl, {
      responseType: 'arraybuffer',
    });
    const videoBuffer = Buffer.from(videoRes.data);

    const title =
      content.length > 100 ? content.substring(0, 97) + '...' : content;

    // Step 1: Initiate resumable upload session
    const initRes = await axios.post(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        snippet: { title, description: content, categoryId: '22' },
        status: { privacyStatus: 'public' },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': videoBuffer.length,
        },
      },
    );

    const uploadUrl = initRes.headers['location'] as string;

    // Step 2: Upload video bytes
    const uploadRes = await axios.put(uploadUrl, videoBuffer, {
      headers: { 'Content-Type': mimeType },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return uploadRes.data.id as string;
  }

  // =================================================================
  // TOKEN REFRESH — Google (YouTube)
  // =================================================================
  private async refreshGoogleToken(
    accountId: string,
    refreshToken: string,
  ): Promise<string> {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await axios.post(
      'https://oauth2.googleapis.com/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const newAccessToken: string = res.data.access_token;
    await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: { accessToken: newAccessToken, isActive: true },
    });

    return newAccessToken;
  }

  // =================================================================
  // TOKEN REFRESH — LinkedIn
  // =================================================================
  private async refreshLinkedInToken(
    accountId: string,
    refreshToken: string,
  ): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    });

    const res = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15_000,
      },
    );

    const newAccessToken: string = res.data.access_token;
    const newRefreshToken: string | undefined = res.data.refresh_token;
    await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        accessToken: newAccessToken,
        ...(newRefreshToken ? { refreshToken: newRefreshToken } : {}),
        isActive: true,
      },
    });
    return newAccessToken;
  }

  // =================================================================
  // TOKEN REFRESH — Twitter / X (OAuth 2.0)
  // =================================================================
  private async refreshTwitterToken(
    accountId: string,
    refreshToken: string,
  ): Promise<string> {
    const clientId = process.env.TWITTER_API_KEY ?? '';
    const clientSecret = process.env.TWITTER_API_SECRET ?? '';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const res = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      params.toString(),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15_000,
      },
    );

    const newAccessToken: string = res.data.access_token;
    const newRefreshToken: string | undefined = res.data.refresh_token;
    await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        accessToken: newAccessToken,
        ...(newRefreshToken ? { refreshToken: newRefreshToken } : {}),
        isActive: true,
      },
    });
    return newAccessToken;
  }

  private async simulateApiCall(_platform: string) {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async notifyUser(userId: string, content: string, status: string) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: status === 'PUBLISHED' ? 'POST_PUBLISHED' : 'POST_FAILED',
        title: status,
        message: content.substring(0, 30),
        isRead: false,
      },
    });
  }

  // =================================================================
  // PLATFORM DELETE
  // =================================================================
  async deleteFromPlatform(
    platform: string,
    platformPostId: string,
    accessToken: string,
  ): Promise<void> {
    try {
      switch (platform) {
        case 'FACEBOOK':
        case 'INSTAGRAM':
          await axios.delete(
            `https://graph.facebook.com/v19.0/${platformPostId}`,
            {
              params: { access_token: accessToken },
            },
          );
          break;
        case 'LINKEDIN':
          await axios.delete(
            `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(platformPostId)}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
              },
            },
          );
          break;
        case 'TIKTOK':
          await axios.post(
            'https://open.tiktokapis.com/v2/video/delete/',
            { video_id: platformPostId },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
              },
            },
          );
          break;
        case 'YOUTUBE':
          await axios.delete('https://www.googleapis.com/youtube/v3/videos', {
            params: { id: platformPostId },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          break;
        case 'THREADS':
          await axios.delete(
            `https://graph.threads.net/v1.0/${platformPostId}`,
            { params: { access_token: accessToken } },
          );
          break;
        case 'TWITTER':
          await axios.delete(
            `https://api.twitter.com/2/tweets/${platformPostId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );
          break;
        default:
          this.logger.warn(`Platform delete not supported: ${platform}`);
      }
      this.logger.log(`Deleted ${platform} post ${platformPostId}`);
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message;
      this.logger.warn(
        `Could not delete ${platform} post ${platformPostId}: ${msg}`,
      );
      // Don't rethrow — always proceed with DB deletion
    }
  }
}
