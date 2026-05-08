import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { GcsService } from '../providers/gcs.service';
import { AppEventsGateway } from '../app-events/app-events.gateway';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

const CANVA_BASE = 'https://api.canva.com/rest/v1';
const CANVA_AUTH = 'https://www.canva.com/api/oauth/authorize';
const CANVA_TOKEN = 'https://api.canva.com/rest/v1/oauth/token';

// PKCE state store: state → { codeVerifier, workspaceId, userId }
// TTL: 10 minutes
const pkceStore = new Map<string, { codeVerifier: string; workspaceId: string; userId: string; expiresAt: number }>();

@Injectable()
export class CanvaService {
  private readonly logger = new Logger(CanvaService.name);

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private config: ConfigService,
    private gcs: GcsService,
    private events: AppEventsGateway,
  ) {}

  // ─── OAuth ──────────────────────────────────────────────────────────────────

  generateAuthUrl(workspaceId: string, userId: string): string {
    const clientId = this.config.get<string>('CANVA_CLIENT_ID');
    const redirectUri = this.config.get<string>('CANVA_REDIRECT_URI');

    const codeVerifier = crypto.randomBytes(64).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');

    pkceStore.set(state, {
      codeVerifier,
      workspaceId,
      userId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Clean stale entries
    for (const [k, v] of pkceStore.entries()) {
      if (v.expiresAt < Date.now()) pkceStore.delete(k);
    }

    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri!,
      response_type: 'code',
      scope: 'asset:read asset:write design:meta:read design:content:read',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    return `${CANVA_AUTH}?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<{ workspaceId: string }> {
    const entry = pkceStore.get(state);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
    pkceStore.delete(state);

    const { codeVerifier, workspaceId, userId: _userId } = entry;
    const clientId = this.config.get<string>('CANVA_CLIENT_ID');
    const clientSecret = this.config.get<string>('CANVA_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('CANVA_REDIRECT_URI');

    // Canva requires Basic auth — client credentials must NOT be in the body
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri!,
      code_verifier: codeVerifier,
    });

    const { data } = await firstValueFrom(
      this.http.post<{ access_token: string; refresh_token: string; expires_in: number; token_type: string }>(
        CANVA_TOKEN,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
        },
      ),
    );

    // Get Canva user ID
    const meRes = await firstValueFrom(
      this.http.get<{ user: { id: string } }>(`${CANVA_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }),
    );

    await this.prisma.canvaConnection.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        canvaUserId: meRes.data.user.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
      update: {
        canvaUserId: meRes.data.user.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return { workspaceId };
  }

  consumeState(state: string): string | null {
    const entry = pkceStore.get(state);
    pkceStore.delete(state);
    return entry?.workspaceId ?? null;
  }

  async disconnect(workspaceId: string): Promise<void> {
    await this.prisma.canvaConnection.deleteMany({ where: { workspaceId } });
  }

  isConnected(workspaceId: string) {
    return this.prisma.canvaConnection.findUnique({ where: { workspaceId } });
  }

  // ─── Token management ───────────────────────────────────────────────────────

  private async getValidToken(workspaceId: string): Promise<string> {
    const conn = await this.prisma.canvaConnection.findUnique({ where: { workspaceId } });
    if (!conn) throw new NotFoundException('Canva not connected for this workspace');

    if (conn.expiresAt && conn.expiresAt > new Date(Date.now() + 60_000)) {
      return conn.accessToken;
    }

    if (!conn.refreshToken) throw new UnauthorizedException('Canva token expired — reconnect required');

    const clientId = this.config.get<string>('CANVA_CLIENT_ID');
    const clientSecret = this.config.get<string>('CANVA_CLIENT_SECRET');
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: conn.refreshToken,
    });

    const { data } = await firstValueFrom(
      this.http.post<{ access_token: string; refresh_token?: string; expires_in: number }>(
        CANVA_TOKEN,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
          },
        },
      ),
    );

    await this.prisma.canvaConnection.update({
      where: { workspaceId },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? conn.refreshToken,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return data.access_token;
  }

  // ─── Designs (for Exports API) ──────────────────────────────────────────────

  async listDesigns(workspaceId: string, continuation?: string) {
    const token = await this.getValidToken(workspaceId);
    const params: Record<string, string> = { limit: '20' };
    if (continuation) params['continuation'] = continuation;

    const { data } = await firstValueFrom(
      this.http.get<{ items: any[]; continuation?: string }>(`${CANVA_BASE}/designs`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }),
    );

    return { designs: data.items ?? [], continuation: data.continuation };
  }

  async createExportJob(workspaceId: string, designId: string, format: string) {
    const token = await this.getValidToken(workspaceId);

    const formatMap: Record<string, object> = {
      jpg: { type: 'jpg', quality: 'regular' },
      png: { type: 'png' },
      gif: { type: 'gif' },
      mp4: { type: 'mp4', quality: 'regular' },
      pdf: { type: 'pdf', export_quality: 'regular' },
    };

    const { data } = await firstValueFrom(
      this.http.post<{ job: { id: string; status: string } }>(
        `${CANVA_BASE}/exports`,
        { design_id: designId, format: formatMap[format] ?? { type: format } },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    return data.job;
  }

  async getExportJob(workspaceId: string, jobId: string) {
    const token = await this.getValidToken(workspaceId);

    const { data } = await firstValueFrom(
      this.http.get<{ job: { id: string; status: string; urls?: string[] } }>(
        `${CANVA_BASE}/exports/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    return data.job;
  }

  // ─── Exports → EasyPost Media Library ───────────────────────────────────────

  async importExportedDesign(
    workspaceId: string,
    userId: string,
    jobId: string,
    filename: string,
    folderId?: string,
  ) {
    const job = await this.getExportJob(workspaceId, jobId);
    if (job.status !== 'success' || !job.urls?.length) {
      throw new BadRequestException(`Export job not ready (status: ${job.status})`);
    }

    const fileUrl = job.urls[0];
    return this.downloadAndSave(workspaceId, userId, fileUrl, filename, folderId);
  }

  // ─── Assets API ─────────────────────────────────────────────────────────────

  async listAssets(workspaceId: string, continuation?: string) {
    const token = await this.getValidToken(workspaceId);
    const params: Record<string, string> = { limit: '20' };
    if (continuation) params['continuation'] = continuation;

    const { data } = await firstValueFrom(
      this.http.get<{ items: any[]; continuation?: string }>(`${CANVA_BASE}/assets`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }),
    );

    return { assets: data.items ?? [], continuation: data.continuation };
  }

  async importAssetToLibrary(
    workspaceId: string,
    userId: string,
    assetId: string,
    folderId?: string,
  ) {
    const token = await this.getValidToken(workspaceId);

    // Fetch asset metadata + download URL
    const { data } = await firstValueFrom(
      this.http.get<{ asset: { id: string; name: string; url: string; thumbnail?: { url: string }; media_type: string } }>(
        `${CANVA_BASE}/assets/${assetId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    const asset = data.asset;
    const ext = asset.media_type === 'video' ? 'mp4' : 'jpg';
    const filename = `canva_${asset.name || asset.id}.${ext}`;

    return this.downloadAndSave(workspaceId, userId, asset.url, filename, folderId);
  }

  // ─── Webhook ────────────────────────────────────────────────────────────────

  verifyWebhookSignature(rawBody: Buffer, timestamp: string, signature: string): boolean {
    const secret = this.config.get<string>('CANVA_WEBHOOK_SECRET');
    if (!secret) return false;
    const message = `${timestamp}.${rawBody.toString()}`;
    const expected = crypto.createHmac('sha256', secret).update(message).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async handleWebhookEvent(payload: any): Promise<void> {
    const eventType: string = payload?.type ?? '';
    const designId: string = payload?.design?.id ?? payload?.data?.design?.id ?? '';
    const workspaceId = await this.resolveWorkspaceFromCanvaUser(payload?.user?.id);

    this.logger.log(`Canva webhook: ${eventType} design=${designId} workspace=${workspaceId ?? 'unknown'}`);

    if (workspaceId) {
      this.events.sendToWorkspace(workspaceId, 'canva:event', {
        type: eventType,
        designId,
        payload,
      });
    }
  }

  private async resolveWorkspaceFromCanvaUser(canvaUserId?: string): Promise<string | null> {
    if (!canvaUserId) return null;
    const conn = await this.prisma.canvaConnection.findFirst({ where: { canvaUserId } });
    return conn?.workspaceId ?? null;
  }

  // ─── Shared helper ──────────────────────────────────────────────────────────

  private async downloadAndSave(
    workspaceId: string,
    userId: string,
    remoteUrl: string,
    filename: string,
    folderId?: string,
  ) {
    // Download file into buffer
    const response = await firstValueFrom(
      this.http.get<Buffer>(remoteUrl, { responseType: 'arraybuffer' }),
    );
    const buffer = Buffer.from(response.data);
    const contentType = (response.headers['content-type'] as string) || 'image/jpeg';

    // Upload to GCS via existing service
    const gcsResult = await this.gcs.uploadFile({
      originalname: filename,
      mimetype: contentType,
      buffer,
      size: buffer.length,
    });

    // Save to MediaLibrary
    const media = await this.prisma.mediaLibrary.create({
      data: {
        workspaceId,
        uploadedById: userId,
        url: gcsResult.secure_url,
        filename,
        mimeType: contentType,
        size: buffer.length,
        folderId: folderId || null,
      },
    });

    return media;
  }
}
