import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'eazypost_uploads',
        },
        (error, result) => {
          if (error) return reject(error instanceof Error ? error : new Error(String(error)));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadUrl(url: string): Promise<any> {
    return cloudinary.uploader.upload(url, {
      folder: 'eazypost_uploads',
    });
  }
}
