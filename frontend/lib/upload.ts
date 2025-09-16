import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { logger } from './logger';

// Upload directory configuration
// On Vercel, use /tmp directory which is writable
const isVercel = process.env.VERCEL === '1';
const baseUploadDir = isVercel ? '/tmp' : './uploads';

export const UPLOAD_PATHS =
  (process.env.UPLOAD_PATHS &&
    (JSON.parse(process.env.UPLOAD_PATHS.replace(/\\"/g, '"')) as Record<
      string,
      string
    >)) ||
  ({
    IMAGES: `${baseUploadDir}/images`,
    DOCUMENTS: `${baseUploadDir}/documents`,
    TEMP: `${baseUploadDir}/temp`,
    THUMBNAILS: `${baseUploadDir}/thumbnails`,
    OPTIMIZED: `${baseUploadDir}/optimized`,
  } as const);

// File type configurations
export const FILE_TYPES = {
  IMAGES: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  DOCUMENTS: {
    mimeTypes: [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    maxSize: 20 * 1024 * 1024, // 5MB
    extensions: ['.pdf', '.csv', '.xls', '.xlsx'],
  },
} as const;

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

/**
 * Ensure upload directories exist with proper permissions
 */
export function ensureUploadDirectories(): void {
  logger.debug('Ensuring upload directories exist', {
    isVercel: process.env.VERCEL === '1',
    baseUploadDir: isVercel ? '/tmp' : './uploads',
  });

  Object.values(UPLOAD_PATHS).forEach((dir) => {
    try {
      if (!fs.existsSync(dir)) {
        logger.info(`Creating upload directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      }
    } catch (error: any) {
      logger.error(`Failed to create upload directory: ${dir}`, error as Error);
      if (error.code === 'ENOENT') {
        try {
          fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        } catch (retryError: any) {
          logger.error(
            `Retry failed for directory: ${dir}`,
            retryError as Error,
          );
          // On Vercel, if we can't create directories, we'll work with what's available
          if (process.env.VERCEL === '1') {
            logger.warn(`Skipping directory creation on Vercel: ${dir}`);
          } else {
            throw retryError;
          }
        }
      }
    }
  });

  logger.debug('Upload directories verified');
}

/**
 * Generate unique filename to prevent conflicts
 */
export function generateUniqueFilename(originalName: string): string {
  logger.debug(`Generating unique filename for: ${originalName}`);

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);

  // Sanitize filename
  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50); // Limit length

  const uniqueFilename = `${timestamp}_${randomString}_${sanitizedBaseName}${ext}`;

  logger.debug(`Generated unique filename: ${uniqueFilename}`);
  return uniqueFilename;
}

/**
 * Validate file security (basic checks)
 */
export function validateFileSecurity(filename: string): boolean {
  logger.debug(`Validating file security for: ${filename}`);

  // Check for null bytes (potential path traversal)
  if (filename.includes('\0')) {
    logger.warn('File security validation failed: null bytes detected', {
      filename,
    });
    return false;
  }

  // Check for path traversal attempts
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    logger.warn(
      'File security validation failed: path traversal attempt detected',
      { filename },
    );
    return false;
  }

  // Check filename length
  if (filename.length > 255) {
    logger.warn('File security validation failed: filename too long', {
      filename,
      length: filename.length,
    });
    return false;
  }

  logger.debug('File security validation passed');
  return true;
}

/**
 * Validate file type and size
 */
export function validateFile(
  filename: string,
  mimeType: string,
  size: number,
  allowedTypes: keyof typeof FILE_TYPES,
): { isValid: boolean; error?: string } {
  logger.debug(`Validating file: ${filename}`, {
    filename,
    mimeType,
    size,
    allowedTypes,
  });

  const config = FILE_TYPES[allowedTypes];

  // Check file size
  if (size > config.maxSize) {
    const error = `File size exceeds limit of ${formatFileSize(config.maxSize)}`;
    logger.warn('File validation failed: size exceeded', {
      filename,
      size,
      maxSize: config.maxSize,
    });
    return {
      isValid: false,
      error,
    };
  }

  // Check MIME type
  const mimeTypeArray = config.mimeTypes as readonly string[];
  if (!mimeTypeArray.includes(mimeType)) {
    const error = `Invalid file type. Allowed: ${config.mimeTypes.join(', ')}`;
    logger.warn('File validation failed: invalid MIME type', {
      filename,
      mimeType,
      allowedTypes: config.mimeTypes,
    });
    return {
      isValid: false,
      error,
    };
  }

  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  const extArray = config.extensions as readonly string[];
  if (!extArray.includes(ext)) {
    const error = `Invalid file extension. Allowed: ${config.extensions.join(', ')}`;
    logger.warn('File validation failed: invalid extension', {
      filename,
      extension: ext,
      allowedExtensions: config.extensions,
    });
    return {
      isValid: false,
      error,
    };
  }

  // Check security
  if (!validateFileSecurity(filename)) {
    const error = 'Invalid filename - potential security risk';
    logger.warn('File validation failed: security check', { filename });
    return {
      isValid: false,
      error,
    };
  }

  logger.debug('File validation passed');
  return { isValid: true };
}

/**
 * Process image with Sharp
 */
export async function processImage(
  buffer: Buffer,
  outputPath: string,
  options: ImageProcessingOptions = {},
): Promise<ProcessedImageResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp',
  } = options;

  logger.info('Starting image processing', {
    outputPath,
    bufferSize: buffer.length,
    options: { maxWidth, maxHeight, quality, format },
  });

  try {
    // Get original image metadata
    const metadata = await sharp(buffer).metadata();
    logger.debug('Original image metadata', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    });

    // Process image
    const processedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();

    // Write processed image
    try {
      fs.writeFileSync(outputPath, processedBuffer);
      logger.logFileOperation(
        'write',
        path.basename(outputPath),
        processedBuffer.length,
      );
    } catch (writeError: any) {
      logger.error(
        'Failed to write processed image',
        { outputPath },
        writeError as Error,
      );
      // On Vercel, if we can't write to the filesystem, we'll still return the processed buffer
      if (process.env.VERCEL === '1') {
        logger.warn(
          'Running on Vercel - file write failed, continuing with buffer',
        );
      } else {
        throw writeError;
      }
    }

    // Get processed image metadata
    const processedMetadata = await sharp(processedBuffer).metadata();

    const result = {
      filename: path.basename(outputPath),
      size: processedBuffer.length,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      path: outputPath,
      mimeType: `image/${format}`,
    };

    logger.info('Image processing completed', {
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio:
        (
          ((buffer.length - processedBuffer.length) / buffer.length) *
          100
        ).toFixed(2) + '%',
      dimensions: `${result.width}x${result.height}`,
    });

    return result;
  } catch (error) {
    logger.error(
      'Image processing failed',
      { outputPath, options },
      error as Error,
    );
    throw new Error(`Image processing failed: ${error}`);
  }
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Cleanup old temporary files
 */
export async function cleanupTempFiles(
  olderThanHours: number = 24,
): Promise<number> {
  logger.info('Starting cleanup of temporary files', {
    olderThanHours,
    isVercel: process.env.VERCEL === '1',
  });

  const tempDir = UPLOAD_PATHS.TEMP;

  // On Vercel, temp files are automatically cleaned up, so we can skip this
  if (process.env.VERCEL === '1') {
    logger.debug('Running on Vercel - temp files are automatically cleaned up');
    return 0;
  }

  if (!fs.existsSync(tempDir)) {
    logger.debug('Temp directory does not exist, skipping cleanup');
    return 0;
  }

  const files = fs.readdirSync(tempDir);
  const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
  let deletedCount = 0;

  logger.debug(`Found ${files.length} files in temp directory`);

  for (const file of files) {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime.getTime() < cutoffTime) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        logger.debug(`Deleted old temp file: ${file}`);
      } catch (error) {
        logger.error(
          `Failed to delete temp file: ${file}`,
          { filePath },
          error as Error,
        );
      }
    }
  }

  logger.info('Cleanup completed', { deletedCount, totalFiles: files.length });
  return deletedCount;
}

/**
 * Initialize upload system
 */
export function initializeUploadSystem(): void {
  logger.info('🔧 Initializing upload system...');

  // Create directories
  ensureUploadDirectories();

  // Log configuration
  logger.info('📁 Upload directories created:');
  Object.entries(UPLOAD_PATHS).forEach(([key, path]) => {
    logger.debug(`  ${key}: ${path}`);
  });

  logger.info('📝 File type configurations:');
  Object.entries(FILE_TYPES).forEach(([key, config]) => {
    logger.debug(
      `  ${key}: ${formatFileSize(config.maxSize)} max, ${config.extensions.join(', ')}`,
    );
  });

  logger.info('✅ Upload system initialized');
}
