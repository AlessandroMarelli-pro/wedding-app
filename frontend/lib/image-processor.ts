import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
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
        },
      });

      logger.logDatabase('create', 'uploadedImage', {
        imageId: uploadedImage.id,
        filename,
        uploadedBy,
      });

      logger.info('Image upload completed successfully', {
        imageId: uploadedImage.id,
        filename,
        originalSize: imageData.buffer.length,
        processedSize: processedImage.size,
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

    // Delete file from filesystem
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
      logger.warn('Image file not found on filesystem', { filePath });
    }

    // Delete database record
    await prisma.uploadedImage.delete({
      where: { id },
    });

    logger.logDatabase('delete', 'uploadedImage', { imageId: id });
    logger.info('Image deletion completed', {
      imageId: id,
      filename: image.filename,
    });
  }

  async getImageFile(
    id: string,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    logger.debug('Retrieving image file', { imageId: id });

    const image = await this.getImageById(id);
    const filePath = path.join(this.uploadDir, image.filename);

    if (!fs.existsSync(filePath)) {
      logger.error('Image file not found on disk', { imageId: id, filePath });
      throw new Error('Image file not found on disk');
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
    logger.info('Creating thumbnail', { imageId, size });

    const image = await this.getImageById(imageId);
    const originalPath = path.join(this.uploadDir, image.filename);

    // Generate thumbnail filename
    const ext = path.extname(image.filename);
    const baseName = path.basename(image.filename, ext);
    const thumbnailFilename = `${baseName}_thumb_${size}${ext}`;
    const thumbnailPath = path.join(UPLOAD_PATHS.THUMBNAILS, thumbnailFilename);

    // Ensure thumbnail directory exists
    if (!fs.existsSync(UPLOAD_PATHS.THUMBNAILS)) {
      fs.mkdirSync(UPLOAD_PATHS.THUMBNAILS, { recursive: true });
      logger.debug('Created thumbnail directory', {
        path: UPLOAD_PATHS.THUMBNAILS,
      });
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
    logger.info('Starting image optimization', { imageId, options });

    const image = await this.getImageById(imageId);
    const originalPath = path.join(this.uploadDir, image.filename);

    // Generate optimized filename
    const ext = path.extname(image.filename);
    const baseName = path.basename(image.filename, ext);
    const optimizedFilename = `${baseName}_optimized${ext}`;
    const optimizedPath = path.join(UPLOAD_PATHS.OPTIMIZED, optimizedFilename);

    // Ensure optimized directory exists
    if (!fs.existsSync(UPLOAD_PATHS.OPTIMIZED)) {
      fs.mkdirSync(UPLOAD_PATHS.OPTIMIZED, { recursive: true });
      logger.debug('Created optimized directory', {
        path: UPLOAD_PATHS.OPTIMIZED,
      });
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
