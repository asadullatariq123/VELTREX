import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

export interface StoredMediaInfo {
  storagePath: string; // Storage key (e.g. "field-reports/rep-123/1788599000_a1b2c3.jpg" for S3 or local path)
  publicUrl: string;   // HTTPS pre-signed URL or public URL
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  storageProvider: 'LOCAL' | 'S3';
}

export interface MediaStorageProvider {
  storeMedia(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    reportId?: string
  ): Promise<StoredMediaInfo>;
  deleteMedia(storagePath: string): Promise<boolean>;
  getSignedUrl?(storagePath: string): Promise<string>;
}

export class LocalMediaStorageProvider implements MediaStorageProvider {
  private uploadDir: string;
  private publicBaseUrl: string;

  constructor(
    uploadDir = path.join(process.cwd(), 'uploads', 'field-reports'),
    publicBaseUrl = '/uploads/field-reports'
  ) {
    this.uploadDir = uploadDir;
    this.publicBaseUrl = publicBaseUrl;

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async storeMedia(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    reportId = 'general'
  ): Promise<StoredMediaInfo> {
    const ext = path.extname(originalFileName) || (mimeType.startsWith('video/') ? '.mp4' : '.jpg');
    const uniqueHash = crypto.randomBytes(8).toString('hex');
    const fileName = `report_${Date.now()}_${uniqueHash}${ext}`;
    const targetPath = path.join(this.uploadDir, fileName);

    await fs.promises.writeFile(targetPath, fileBuffer);

    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const publicUrl = `${this.publicBaseUrl}/${fileName}`;

    return {
      storagePath: targetPath,
      publicUrl,
      fileName,
      mimeType,
      fileSize: fileBuffer.length,
      checksum,
      storageProvider: 'LOCAL',
    };
  }

  public async deleteMedia(storagePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(storagePath)) {
        await fs.promises.unlink(storagePath);
        return true;
      }
    } catch {
      // Ignore deletion failure
    }
    return false;
  }

  public async getSignedUrl(storagePath: string): Promise<string> {
    const fileName = path.basename(storagePath);
    return `${this.publicBaseUrl}/${fileName}`;
  }
}

export class S3MediaStorageProvider implements MediaStorageProvider {
  private region: string;
  private bucket: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private expirationSec: number;

  constructor() {
    this.region = env.AWS_REGION || process.env.AWS_REGION || '';
    this.bucket = env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET || '';
    this.accessKeyId = env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
    this.secretAccessKey = env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
    this.expirationSec = env.AWS_S3_URL_EXPIRATION_SEC || 3600;

    if (!this.region || !this.bucket || !this.accessKeyId || !this.secretAccessKey) {
      throw new AppError(
        'MEDIA_STORAGE_PROVIDER is configured as S3, but mandatory AWS S3 credentials (AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are missing in environment variables.',
        500,
        'MEDIA_UPLOAD_FAILED'
      );
    }
  }

  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  }

  public async getSignedUrl(objectKey: string): Promise<string> {
    const cleanKey = objectKey.startsWith('/') ? objectKey.substring(1) : objectKey;
    const host = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const queryParams: Record<string, string> = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${this.accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': this.expirationSec.toString(),
      'X-Amz-SignedHeaders': 'host',
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
      .join('&');

    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';
    const payloadHash = 'UNSIGNED-PAYLOAD';

    const canonicalRequest = `GET\n/${encodeURI(cleanKey)}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    return `https://${host}/${encodeURI(cleanKey)}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  }

  public async storeMedia(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    reportId = 'general'
  ): Promise<StoredMediaInfo> {
    const ext = path.extname(originalFileName) || (mimeType.startsWith('video/') ? '.mp4' : '.jpg');
    const uniqueHash = crypto.randomBytes(8).toString('hex');
    const fileName = `evidence_${Date.now()}_${uniqueHash}${ext}`;
    const objectKey = `field-reports/${reportId}/${fileName}`;
    const host = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const url = `https://${host}/${encodeURI(objectKey)}`;

    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Generate AWS SigV4 signed request for PutObject
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const canonicalHeaders = `content-type:${mimeType}\nhost:${host}\nx-amz-content-sha256:${checksum}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = `PUT\n/${encodeURI(objectKey)}\n\n${canonicalHeaders}\n${signedHeaders}\n${checksum}`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'x-amz-date': amzDate,
          'x-amz-content-sha256': checksum,
          Authorization: authorizationHeader,
        },
        body: new Uint8Array(fileBuffer),
      });

      if (!res.ok) {
        throw new Error(`S3 PutObject HTTP ${res.status}: ${await res.text().catch(() => '')}`);
      }
    } catch (err: any) {
      console.error(`[S3MediaStorageProvider] Upload failed for key ${objectKey}:`, err.message || err);
      throw new AppError(
        `Persistent media storage upload failed to S3 bucket '${this.bucket}'. Ensure AWS credentials and bucket permissions are valid.`,
        500,
        'MEDIA_UPLOAD_FAILED'
      );
    }

    const publicUrl = await this.getSignedUrl(objectKey);

    return {
      storagePath: objectKey,
      publicUrl,
      fileName,
      mimeType,
      fileSize: fileBuffer.length,
      checksum,
      storageProvider: 'S3',
    };
  }

  public async deleteMedia(storagePath: string): Promise<boolean> {
    const cleanKey = storagePath.startsWith('/') ? storagePath.substring(1) : storagePath;
    const host = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const url = `https://${host}/${encodeURI(cleanKey)}`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    const checksum = crypto.createHash('sha256').update('').digest('hex');

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${checksum}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = `DELETE\n/${encodeURI(cleanKey)}\n\n${canonicalHeaders}\n${signedHeaders}\n${checksum}`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = this.getSignatureKey(this.secretAccessKey, dateStamp, this.region, 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-amz-date': amzDate,
          'x-amz-content-sha256': checksum,
          Authorization: authorizationHeader,
        },
      });

      return res.ok || res.status === 204 || res.status === 404;
    } catch (err: any) {
      console.warn(`[S3MediaStorageProvider] Deletion warning for key ${cleanKey}:`, err.message || err);
      return false;
    }
  }
}

export function getMediaStorageProvider(): MediaStorageProvider {
  const providerType = (env.MEDIA_STORAGE_PROVIDER || process.env.MEDIA_STORAGE_PROVIDER || 'LOCAL').toUpperCase();
  if (providerType === 'S3') {
    return new S3MediaStorageProvider();
  }
  return new LocalMediaStorageProvider();
}

export const mediaStorageProvider = getMediaStorageProvider();
