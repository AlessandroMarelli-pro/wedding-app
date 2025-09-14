import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { Repository } from 'typeorm';
import {
  FILE_TYPES,
  UPLOAD_PATHS,
  validateFileSecurity,
} from '../config/upload';
import { UploadedImage } from '../entities/uploaded-image.entity';

export interface ImageUploadDto {
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  usageLocation: string;
  altText?: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImageResult {
  filename: string;
  size: number;
  width: number;
  height: number;
  path: string;
  mimeType: string;
}

@Injectable()
export class ImageService {
  private readonly uploadDir = UPLOAD_PATHS.IMAGES;
  private readonly allowedMimeTypes = FILE_TYPES.IMAGES.mimeTypes;
  private readonly maxFileSize = FILE_TYPES.IMAGES.maxSize;

  constructor(
    @InjectRepository(UploadedImage)
    private readonly uploadedImageRepository: Repository<UploadedImage>,
  ) {
    this.ensureUploadDirectory();
  }

  async uploadImage(
    imageData: ImageUploadDto,
    uploadedBy: string,
    processingOptions?: ImageProcessingOptions,
  ): Promise<UploadedImage> {
    // Security validation
    const mockFile: Express.Multer.File = {
      originalname: imageData.originalName,
      mimetype: imageData.mimeType,
      buffer: imageData.buffer,
      size: imageData.buffer.length,
    } as Express.Multer.File;

    if (!validateFileSecurity(mockFile)) {
      throw new BadRequestException('File failed security validation');
    }

    // Validate file size
    if (imageData.buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(imageData.mimeType as any)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Generate unique filename
    const fileExtension = 'webp';
    const filename = this.generateUniqueFilename(fileExtension);
    const filePath = path.join(this.uploadDir, filename);

    try {
      // Process image with Sharp
      const processedImage = await this.processImage(
        imageData.buffer,
        filePath,
        processingOptions,
      );
      console.log('processedImage', processedImage);
      // Get image metadata
      // Create database record
      const uploadedImage = this.uploadedImageRepository.create({
        originalName: imageData.originalName,
        filename,
        mimeType: `image/webp`,
        size: processedImage.size,
        width: processedImage.width,
        height: processedImage.height,
        altText: imageData.altText,
        usageLocation: imageData.usageLocation,
        uploadedBy,
      });

      return await this.uploadedImageRepository.save(uploadedImage);
    } catch (error: any) {
      // Clean up file if it was created
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new BadRequestException(
        `Failed to process image: ${error.message}`,
      );
    }
  }

  async getImageById(id: string): Promise<UploadedImage> {
    const image = await this.uploadedImageRepository.findOne({
      where: { id },
      //relations: ['uploadedByAdmin'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async getImageByUsageLocation(
    usageLocation: string,
  ): Promise<UploadedImage | null> {
    return this.uploadedImageRepository.findOne({
      where: { usageLocation },
      order: { createdAt: 'DESC' },
      // relations: ['uploadedByAdmin'],
    });
  }

  async getAllImages(): Promise<UploadedImage[]> {
    return this.uploadedImageRepository.find({
      order: { createdAt: 'DESC' },
      //relations: ['uploadedByAdmin'],
    });
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.getImageById(id);
    const filePath = path.join(this.uploadDir, image.filename);

    // Remove file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove database record
    await this.uploadedImageRepository.remove(image);
  }

  async updateImageMetadata(
    id: string,
    updateData: { altText?: string; usageLocation?: string },
  ): Promise<UploadedImage> {
    const image = await this.getImageById(id);

    if (updateData.altText !== undefined) {
      image.altText = updateData.altText;
    }

    if (updateData.usageLocation !== undefined) {
      image.usageLocation = updateData.usageLocation;
    }

    return await this.uploadedImageRepository.save(image);
  }

  getImagePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  getImageUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  private async processImage(
    buffer: Buffer,
    outputPath: string,
    options?: ImageProcessingOptions,
  ): Promise<ProcessedImageResult> {
    let sharpInstance = sharp(buffer);
    if (options?.maxWidth || options?.maxHeight) {
      sharpInstance = sharpInstance.resize(
        options.maxWidth,
        options.maxHeight,
        {
          fit: 'inside',
          withoutEnlargement: true,
        },
      );
    }
    sharpInstance = sharpInstance.webp({
      quality: 100,
    });

    // Save processed image

    await sharpInstance.toFile(outputPath);

    // Get final image info
    const finalMetadata = await sharp(outputPath).metadata();
    const stats = fs.statSync(outputPath);

    return {
      filename: path.basename(outputPath),
      size: stats.size,
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
      path: outputPath,
      mimeType: finalMetadata.format,
    };
  }

  private generateUniqueFilename(extension: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `${timestamp}_${randomBytes}.${extension}`;
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return mimeToExt[mimeType] || 'jpg';
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Utility methods for common image processing scenarios
  async createThumbnail(
    imageId: string,
    width: number = 200,
    height: number = 200,
  ): Promise<string> {
    const image = await this.getImageById(imageId);
    const originalPath = path.join(this.uploadDir, image.filename);

    if (!fs.existsSync(originalPath)) {
      throw new NotFoundException('Original image file not found');
    }

    const thumbnailFilename = `thumb_${width}x${height}_${image.filename}`;
    const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);

    await sharp(originalPath)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailFilename;
  }

  async optimizeForWeb(imageId: string): Promise<string> {
    const image = await this.getImageById(imageId);
    const originalPath = path.join(this.uploadDir, image.filename);

    if (!fs.existsSync(originalPath)) {
      throw new NotFoundException('Original image file not found');
    }

    const optimizedFilename = `web_${image.filename.replace(/\.[^.]+$/, '.webp')}`;
    const optimizedPath = path.join(this.uploadDir, optimizedFilename);

    await sharp(originalPath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    return optimizedFilename;
  }

  // Clean up orphaned files (files without database records)
  async cleanupOrphanedFiles(): Promise<number> {
    const dbImages = await this.uploadedImageRepository.find({
      select: ['filename'],
    });
    const dbFilenames = new Set(dbImages.map((img) => img.filename));

    const files = fs.readdirSync(this.uploadDir);
    let deletedCount = 0;

    for (const file of files) {
      if (!dbFilenames.has(file) && this.isImageFile(file)) {
        const filePath = path.join(this.uploadDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }
}
