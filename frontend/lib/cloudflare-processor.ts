import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { logger } from './logger';

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  publicUrl: string;
  region?: string;
}

export interface CloudflareUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface CloudflareDeleteResult {
  success: boolean;
  error?: string;
}

export class CloudflareProcessor {
  private config: CloudflareConfig;
  private s3Client: S3Client;

  constructor(config: CloudflareConfig) {
    this.config = config;

    // Initialize S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: config.region || 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },

      forcePathStyle: true, // Required for R2
    });
  }

  /**
   * Upload a file to Cloudflare R2
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<CloudflareUploadResult> {
    try {
      logger.info('Starting Cloudflare R2 upload', {
        key,
        contentType,
        size: buffer.length,
        metadata,
      });
      if (metadata?.originalName) {
        // Sanitize original name
        metadata.originalName = metadata.originalName.replace(
          /[^a-zA-Z0-9]/g,
          '_',
        );
      }
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      const response = await this.s3Client.send(command);

      const publicUrl = `${this.config.publicUrl}/${key}`;

      logger.info('Cloudflare R2 upload successful', {
        key,
        publicUrl,
        size: buffer.length,
        etag: response.ETag,
      });

      return {
        success: true,
        url: publicUrl,
        key,
      };
    } catch (error: any) {
      logger.error('Cloudflare R2 upload error', { key }, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a file from Cloudflare R2
   */
  async deleteFile(key: string): Promise<CloudflareDeleteResult> {
    try {
      logger.info('Starting Cloudflare R2 delete', { key });

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      logger.info('Cloudflare R2 delete successful', {
        key,
        deleteMarker: response.DeleteMarker,
      });

      return {
        success: true,
      };
    } catch (error: any) {
      logger.error('Cloudflare R2 delete error', { key }, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if a file exists in Cloudflare R2
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      logger.debug('Checking Cloudflare R2 file existence', { key });

      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      logger.debug('Cloudflare R2 file exists', { key });
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        logger.debug('Cloudflare R2 file does not exist', { key });
        return false;
      }

      logger.error('Cloudflare R2 file existence check error', { key }, error);
      return false;
    }
  }

  /**
   * Get file metadata from Cloudflare R2
   */
  async getFileMetadata(key: string): Promise<{
    size?: number;
    contentType?: string;
    lastModified?: string;
    metadata?: Record<string, string>;
  }> {
    try {
      logger.debug('Getting Cloudflare R2 file metadata', { key });

      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      const result = {
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified?.toISOString(),
        metadata: response.Metadata,
      };

      logger.debug('Cloudflare R2 file metadata retrieved', { key, result });

      return result;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        logger.warn('Cloudflare R2 file not found for metadata', { key });
        return {};
      }

      logger.error('Cloudflare R2 file metadata error', { key }, error);
      return {};
    }
  }

  /**
   * Generate a unique key for file storage based on NODE_ENV and folder structure
   */
  generateFileKey(
    originalName: string,
    folder: string = 'images',
    nodeEnv: string = 'development',
  ): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || 'jpg';
    const baseName = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_');

    // Structure: {NODE_ENV}/{folder}/{timestamp}_{random}_{basename}.{ext}
    const key = `${nodeEnv}/${folder}/${timestamp}_${randomSuffix}_${baseName}.${extension}`;

    logger.debug('Generated Cloudflare R2 file key', {
      originalName,
      folder,
      nodeEnv,
      key,
    });

    return key;
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }
}
