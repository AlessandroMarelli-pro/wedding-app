import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { CloudflareConfig, CloudflareProcessor } from './cloudflare-processor';
import { logger } from './logger';
import { prisma } from './prisma';
import {
  ImageProcessingOptions,
  UPLOAD_PATHS,
  generateUniqueFilename,
  initializeUploadSystem,
  processImage,
} from './upload';

export interface ImageUploadData {
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  usageLocation: string;
  altText?: string;
}

export class ImageProcessor {
  private readonly uploadDir = UPLOAD_PATHS.IMAGES;
  private cloudflareProcessor?: CloudflareProcessor;
  private readonly useCloudflare: boolean;

  constructor() {
    this.useCloudflare = this.initializeCloudflare();
  }

  private initializeCloudflare(): boolean {
    try {
      const config: CloudflareConfig = {
        accessKey: process.env.CLOUDFLARE_ACCESS_KEY || '',
        secretKey: process.env.CLOUDFLARE_SECRET_KEY || '',
        bucketName: process.env.CLOUDFLARE_BUCKET_NAME || '',
        publicUrl: process.env.CLOUDFLARE_PUBLIC_URL || '',
        region: process.env.CLOUDFLARE_REGION || 'auto',
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
      };

      // Check if all required Cloudflare config is present
      const hasAllConfig =
        config.accountId &&
        config.apiToken &&
        config.bucketName &&
        config.publicUrl;

      if (hasAllConfig) {
        this.cloudflareProcessor = new CloudflareProcessor(config);
        logger.info('Cloudflare R2 integration enabled', {
          bucketName: config.bucketName,
          publicUrl: config.publicUrl,
        });
        return true;
      } else {
        logger.warn(
          'Cloudflare R2 configuration incomplete, falling back to local storage',
          {
            hasAccountId: !!config.accountId,
            hasApiToken: !!config.apiToken,
            hasBucketName: !!config.bucketName,
            hasPublicUrl: !!config.publicUrl,
          },
        );
        return false;
      }
    } catch (error: any) {
      logger.error('Failed to initialize Cloudflare R2', {}, error);
      return false;
    }
  }

  async uploadImage(
    imageData: ImageUploadData,
    uploadedBy: string,
    processingOptions?: ImageProcessingOptions,
  ): Promise<any> {
    logger.info('Starting image upload', {
      originalName: imageData.originalName,
      uploadedBy,
      usageLocation: imageData.usageLocation,
      bufferSize: imageData.buffer.length,
      mimeType: imageData.mimeType,
      useCloudflare: this.useCloudflare,
      isVercel: process.env.VERCEL === '1',
    });

    // Generate unique filename
    const filename = generateUniqueFilename(imageData.originalName);
    const filePath = path.join(this.uploadDir, filename);

    try {
      // Process image with Sharp
      const processedImage = await processImage(
        imageData.buffer,
        filePath,
        processingOptions,
      );

      logger.debug('Image processed successfully', {
        filename,
        size: processedImage.size,
        dimensions: `${processedImage.width}x${processedImage.height}`,
      });

      let cloudflareUrl: string | undefined;
      let cloudflareKey: string | undefined;

      // Upload to Cloudflare R2 if configured
      if (this.useCloudflare && this.cloudflareProcessor) {
        try {
          const nodeEnv = process.env.NODE_ENV || 'development';
          const cloudflareKey = this.cloudflareProcessor.generateFileKey(
            filename,
            'images',
            nodeEnv,
          );

          // Read the processed image file for Cloudflare upload
          let processedBuffer: Buffer;
          try {
            processedBuffer = fs.readFileSync(filePath);
          } catch (readError: any) {
            logger.error(
              'Failed to read processed image file',
              { filePath },
              readError as Error,
            );
            // On Vercel, if the file wasn't written to disk, use the original processed buffer
            if (process.env.VERCEL === '1') {
              logger.warn(
                'Running on Vercel - using processed buffer directly',
              );
              processedBuffer = imageData.buffer; // Use original buffer as fallback
            } else {
              throw readError;
            }
          }

          const uploadResult = await this.cloudflareProcessor.uploadFile(
            processedBuffer,
            cloudflareKey,
            processedImage.mimeType,
            {
              originalName: imageData.originalName,
              uploadedBy,
              usageLocation: imageData.usageLocation,
              altText: imageData.altText || '',
              width: processedImage.width.toString(),
              height: processedImage.height.toString(),
            },
          );

          if (uploadResult.success && uploadResult.url) {
            cloudflareUrl = uploadResult.url;
            logger.info('Image uploaded to Cloudflare R2', {
              filename,
              cloudflareKey,
              cloudflareUrl,
            });

            // Clean up local file after successful Cloudflare upload
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
                logger.debug('Cleaned up local file after Cloudflare upload', {
                  filePath,
                });
              } catch (cleanupError: any) {
                logger.warn(
                  'Failed to cleanup local file after Cloudflare upload',
                  {
                    filePath,
                    error: cleanupError.message,
                  },
                );
                // On Vercel, this is expected since files are automatically cleaned up
                if (process.env.VERCEL !== '1') {
                  throw cleanupError;
                }
              }
            }
          } else {
            logger.warn('Cloudflare R2 upload failed, keeping local file', {
              filename,
              error: uploadResult.error,
            });
          }
        } catch (cloudflareError: any) {
          logger.error(
            'Cloudflare R2 upload error',
            { filename },
            cloudflareError,
          );
          // Continue with local storage
        }
      }

      // Create database record
      const uploadedImage = await prisma.uploadedImage.create({
        data: {
          originalName: imageData.originalName,
          filename,
          mimeType: processedImage.mimeType,
          size: processedImage.size,
          width: processedImage.width,
          height: processedImage.height,
          altText: imageData.altText,
          usageLocation: imageData.usageLocation,
          uploadedBy,
          // Store Cloudflare URL if available
          ...(cloudflareUrl && { cloudflareUrl }),
          ...(cloudflareKey && { cloudflareKey }),
        },
      });

      logger.logDatabase('create', 'uploadedImage', {
        imageId: uploadedImage.id,
        filename,
        uploadedBy,
        cloudflareUrl,
      });

      logger.info('Image upload completed successfully', {
        imageId: uploadedImage.id,
        filename,
        originalSize: imageData.buffer.length,
        processedSize: processedImage.size,
        cloudflareUrl,
      });

      return uploadedImage;
    } catch (error: any) {
      logger.error(
        'Image upload failed',
        {
          originalName: imageData.originalName,
          uploadedBy,
          filename,
        },
        error,
      );

      // Clean up file if it was created
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.debug('Cleaned up failed upload file', { filePath });
        } catch (cleanupError) {
          logger.error(
            'Failed to cleanup upload file',
            { filePath },
            cleanupError as Error,
          );
          // On Vercel, file cleanup failures are less critical
          if (process.env.VERCEL === '1') {
            logger.warn('Running on Vercel - file cleanup failure is expected');
          }
        }
      }
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  async getImageById(id: string): Promise<any> {
    logger.debug('Fetching image by ID', { imageId: id });

    const image = await prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      logger.warn('Image not found', { imageId: id });
      throw new Error('Image not found');
    }

    logger.debug('Image retrieved successfully', {
      imageId: id,
      filename: image.filename,
      size: image.size,
    });

    return image;
  }

  async getAllImages(): Promise<any[]> {
    logger.debug('Fetching all images');

    const images = await prisma.uploadedImage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    logger.debug('Retrieved all images', { count: images.length });
    return images;
  }

  async deleteImage(id: string): Promise<void> {
    logger.info('Starting image deletion', { imageId: id });

    const image = await this.getImageById(id);

    // Delete from Cloudflare R2 if available
    if (this.useCloudflare && this.cloudflareProcessor && image.cloudflareKey) {
      try {
        const deleteResult = await this.cloudflareProcessor.deleteFile(
          image.cloudflareKey,
        );
        if (deleteResult.success) {
          logger.info('Image deleted from Cloudflare R2', {
            imageId: id,
            cloudflareKey: image.cloudflareKey,
          });
        } else {
          logger.warn('Failed to delete image from Cloudflare R2', {
            imageId: id,
            cloudflareKey: image.cloudflareKey,
            error: deleteResult.error,
          });
        }
      } catch (error: any) {
        logger.error('Cloudflare R2 delete error', { imageId: id }, error);
        // Continue with local deletion even if Cloudflare fails
      }
    }

    // Delete file from filesystem (if it exists locally)
    const filePath = path.join(this.uploadDir, image.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.logFileOperation('delete', image.filename, image.size);
      } catch (error) {
        logger.error(
          'Failed to delete image file',
          { filePath },
          error as Error,
        );
        throw new Error(`Failed to delete image file: ${error}`);
      }
    } else {
      logger.debug(
        'Image file not found on filesystem (may be stored in Cloudflare only)',
        { filePath },
      );
    }

    // Delete database record
    await prisma.uploadedImage.delete({
      where: { id },
    });

    logger.logDatabase('delete', 'uploadedImage', { imageId: id });
    logger.info('Image deletion completed', {
      imageId: id,
      filename: image.filename,
      cloudflareKey: image.cloudflareKey,
    });
  }

  async getImageFile(id: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    filename: string;
    cloudflareUrl?: string;
  }> {
    logger.debug('Retrieving image file', { imageId: id });

    const image = await this.getImageById(id);

    // If image is stored in Cloudflare, return the URL instead of buffer
    if (image.cloudflareUrl) {
      logger.debug('Image stored in Cloudflare R2, returning URL', {
        imageId: id,
        cloudflareUrl: image.cloudflareUrl,
      });

      return {
        buffer: Buffer.from(''), // Empty buffer for Cloudflare images
        mimeType: image.mimeType,
        filename: image.filename,
        cloudflareUrl: image.cloudflareUrl,
      };
    }

    // Fallback to local file
    const filePath = path.join(this.uploadDir, image.filename);

    if (!fs.existsSync(filePath)) {
      logger.error('Image file not found on disk', { imageId: id, filePath });
      // On Vercel, if the file doesn't exist locally, it might be stored in Cloudflare only
      if (process.env.VERCEL === '1') {
        logger.warn(
          'Running on Vercel - image file not found locally, may be Cloudflare-only',
        );
        throw new Error(
          'Image file not available locally on Vercel - check Cloudflare storage',
        );
      } else {
        throw new Error('Image file not found on disk');
      }
    }

    const buffer = fs.readFileSync(filePath);

    logger.debug('Image file retrieved successfully', {
      imageId: id,
      filename: image.filename,
      bufferSize: buffer.length,
    });

    return {
      buffer,
      mimeType: image.mimeType,
      filename: image.filename,
    };
  }

  async createThumbnail(imageId: string, size: number = 300): Promise<string> {
    logger.info('Creating thumbnail', {
      imageId,
      size,
      isVercel: process.env.VERCEL === '1',
    });

    const image = await this.getImageById(imageId);
    const originalPath = path.join(this.uploadDir, image.filename);

    // Generate thumbnail filename
    const ext = path.extname(image.filename);
    const baseName = path.basename(image.filename, ext);
    const thumbnailFilename = `${baseName}_thumb_${size}${ext}`;
    const thumbnailPath = path.join(UPLOAD_PATHS.THUMBNAILS, thumbnailFilename);

    // Ensure thumbnail directory exists
    if (!fs.existsSync(UPLOAD_PATHS.THUMBNAILS)) {
      try {
        fs.mkdirSync(UPLOAD_PATHS.THUMBNAILS, { recursive: true });
        logger.debug('Created thumbnail directory', {
          path: UPLOAD_PATHS.THUMBNAILS,
        });
      } catch (mkdirError: any) {
        logger.error(
          'Failed to create thumbnail directory',
          {
            path: UPLOAD_PATHS.THUMBNAILS,
          },
          mkdirError as Error,
        );
        // On Vercel, if we can't create directories, we'll work with what's available
        if (process.env.VERCEL === '1') {
          logger.warn(
            'Running on Vercel - thumbnail directory creation failed',
          );
        } else {
          throw mkdirError;
        }
      }
    }

    try {
      await sharp(originalPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      logger.logFileOperation('create', thumbnailFilename, size);
      logger.info('Thumbnail created successfully', {
        imageId,
        thumbnailFilename,
        size,
      });

      return thumbnailFilename;
    } catch (error) {
      logger.error(
        'Failed to create thumbnail',
        { imageId, size },
        error as Error,
      );
      throw new Error(`Failed to create thumbnail: ${error}`);
    }
  }

  async optimizeImage(
    imageId: string,
    options: ImageProcessingOptions = {},
  ): Promise<string> {
    logger.info('Starting image optimization', {
      imageId,
      options,
      isVercel: process.env.VERCEL === '1',
    });

    const image = await this.getImageById(imageId);
    const originalPath = path.join(this.uploadDir, image.filename);

    // Generate optimized filename
    const ext = path.extname(image.filename);
    const baseName = path.basename(image.filename, ext);
    const optimizedFilename = `${baseName}_optimized${ext}`;
    const optimizedPath = path.join(UPLOAD_PATHS.OPTIMIZED, optimizedFilename);

    // Ensure optimized directory exists
    if (!fs.existsSync(UPLOAD_PATHS.OPTIMIZED)) {
      try {
        fs.mkdirSync(UPLOAD_PATHS.OPTIMIZED, { recursive: true });
        logger.debug('Created optimized directory', {
          path: UPLOAD_PATHS.OPTIMIZED,
        });
      } catch (mkdirError: any) {
        logger.error(
          'Failed to create optimized directory',
          {
            path: UPLOAD_PATHS.OPTIMIZED,
          },
          mkdirError as Error,
        );
        // On Vercel, if we can't create directories, we'll work with what's available
        if (process.env.VERCEL === '1') {
          logger.warn(
            'Running on Vercel - optimized directory creation failed',
          );
        } else {
          throw mkdirError;
        }
      }
    }

    try {
      const originalBuffer = fs.readFileSync(originalPath);
      await processImage(originalBuffer, optimizedPath, options);

      logger.info('Image optimization completed', {
        imageId,
        optimizedFilename,
        originalSize: originalBuffer.length,
      });

      return optimizedFilename;
    } catch (error) {
      logger.error(
        'Failed to optimize image',
        { imageId, options },
        error as Error,
      );
      throw new Error(`Failed to optimize image: ${error}`);
    }
  }

  async getImageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    averageSize: number;
    formats: Record<string, number>;
  }> {
    logger.debug('Generating image statistics');

    const images = await prisma.uploadedImage.findMany({
      select: {
        size: true,
        mimeType: true,
      },
    });

    const totalImages = images.length;
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const averageSize = totalImages > 0 ? totalSize / totalImages : 0;

    const formats: Record<string, number> = {};
    images.forEach((img) => {
      const format = img.mimeType.split('/')[1];
      formats[format] = (formats[format] || 0) + 1;
    });

    const stats = {
      totalImages,
      totalSize,
      averageSize,
      formats,
    };

    logger.debug('Image statistics generated', {
      totalImages,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      averageSizeKB: (averageSize / 1024).toFixed(2),
      formatCount: Object.keys(formats).length,
    });

    return stats;
  }
  async initializeUploadSystem() {
    logger.info('Initializing upload system from ImageProcessor');
    await initializeUploadSystem();
  }
}
