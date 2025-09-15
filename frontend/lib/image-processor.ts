import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { prisma } from './prisma';
import {
  ImageProcessingOptions,
  UPLOAD_PATHS,
  generateUniqueFilename,
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
    // Test if this.uploadDir exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

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

      return uploadedImage;
    } catch (error: any) {
      // Clean up file if it was created
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  async getImageById(id: string): Promise<any> {
    const image = await prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    return image;
  }

  async getAllImages(): Promise<any[]> {
    return await prisma.uploadedImage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.getImageById(id);

    // Delete file from filesystem
    const filePath = path.join(this.uploadDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.uploadedImage.delete({
      where: { id },
    });
  }

  async getImageFile(
    id: string,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    const image = await this.getImageById(id);
    const filePath = path.join(this.uploadDir, image.filename);

    if (!fs.existsSync(filePath)) {
      throw new Error('Image file not found on disk');
    }

    const buffer = fs.readFileSync(filePath);
    return {
      buffer,
      mimeType: image.mimeType,
      filename: image.filename,
    };
  }

  async createThumbnail(imageId: string, size: number = 300): Promise<string> {
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
    }

    try {
      await sharp(originalPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return thumbnailFilename;
    } catch (error) {
      throw new Error(`Failed to create thumbnail: ${error}`);
    }
  }

  async optimizeImage(
    imageId: string,
    options: ImageProcessingOptions = {},
  ): Promise<string> {
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
    }

    try {
      await processImage(fs.readFileSync(originalPath), optimizedPath, options);

      return optimizedFilename;
    } catch (error) {
      throw new Error(`Failed to optimize image: ${error}`);
    }
  }

  async getImageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    averageSize: number;
    formats: Record<string, number>;
  }> {
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

    return {
      totalImages,
      totalSize,
      averageSize,
      formats,
    };
  }
}
