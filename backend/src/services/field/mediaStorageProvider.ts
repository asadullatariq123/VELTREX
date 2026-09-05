import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredMediaInfo {
  storagePath: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
}

export interface MediaStorageProvider {
  storeMedia(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string
  ): Promise<StoredMediaInfo>;
  deleteMedia(storagePath: string): Promise<boolean>;
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
    mimeType: string
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
}

export const mediaStorageProvider = new LocalMediaStorageProvider();
