import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class GcsService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const keyJson = this.configService.get<string>('GCS_KEY_JSON');
    const bucketName = this.configService.get<string>('GCS_BUCKET_NAME');
    const projectId = this.configService.get<string>('GCS_PROJECT_ID');

    if (!bucketName) throw new Error('GCS_BUCKET_NAME env var is required');
    if (!projectId) throw new Error('GCS_PROJECT_ID env var is required');
    if (!keyJson) throw new Error('GCS_KEY_JSON env var is required');

    this.bucketName = bucketName;
    this.storage = new Storage({
      projectId,
      credentials: JSON.parse(keyJson) as object,
    });
  }

  async uploadFile(file: any): Promise<{ secure_url: string }> {
    const safeName = (file.originalname as string).replace(/\s+/g, '_');
    const filename = `eazypost_uploads/${Date.now()}-${safeName}`;
    const blob = this.storage.bucket(this.bucketName).file(filename);

    await new Promise<void>((resolve, reject) => {
      const stream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype as string,
      });
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(file.buffer as Buffer);
    });

    return { secure_url: await this.signBlob(blob) };
  }

  // Returns null for non-GCS URLs (e.g. old Cloudinary URLs still in DB)
  async refreshSignedUrl(currentUrl: string): Promise<string | null> {
    const gcsPath = this.extractGcsPath(currentUrl);
    if (!gcsPath) return null;
    const blob = this.storage.bucket(this.bucketName).file(gcsPath);
    return this.signBlob(blob);
  }

  isGcsSignedUrl(url: string): boolean {
    return (
      url.includes('storage.googleapis.com') && url.includes('X-Goog-Algorithm')
    );
  }

  private async signBlob(
    blob: ReturnType<ReturnType<Storage['bucket']>['file']>,
  ): Promise<string> {
    const [url] = await blob.getSignedUrl({
      action: 'read',
      expires: Date.now() + SIGNED_URL_TTL_MS,
      version: 'v4',
    });
    return url;
  }

  private extractGcsPath(signedUrl: string): string | null {
    try {
      const url = new URL(signedUrl);
      if (!url.hostname.includes('storage.googleapis.com')) return null;
      // pathname = /BUCKET_NAME/OBJECT_PATH → skip leading slash + bucket segment
      const segments = url.pathname.slice(1).split('/');
      return segments.slice(1).join('/');
    } catch {
      return null;
    }
  }
}
