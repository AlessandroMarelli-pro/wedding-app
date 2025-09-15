import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

// Upload directory configuration
export const UPLOAD_PATHS = {
  IMAGES: './uploads/images',
  DOCUMENTS: './uploads/documents',
  TEMP: './uploads/temp',
  THUMBNAILS: './uploads/thumbnails',
  OPTIMIZED: './uploads/optimized',
} as const;

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
    maxSize: 5 * 1024 * 1024, // 5MB
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
  Object.values(UPLOAD_PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
  });
}

/**
 * Generate unique filename to prevent conflicts
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);

  // Sanitize filename
  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50); // Limit length

  return `${timestamp}_${randomString}_${sanitizedBaseName}${ext}`;
}

/**
 * Validate file security (basic checks)
 */
export function validateFileSecurity(filename: string): boolean {
  // Check for null bytes (potential path traversal)
  if (filename.includes('\0')) {
    return false;
  }

  // Check for path traversal attempts
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return false;
  }

  // Check filename length
  if (filename.length > 255) {
    return false;
  }

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
  const config = FILE_TYPES[allowedTypes];

  // Check file size
  if (size > config.maxSize) {
    return {
      isValid: false,
      error: `File size exceeds limit of ${formatFileSize(config.maxSize)}`,
    };
  }

  // Check MIME type
  if (!config.mimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${config.mimeTypes.join(', ')}`,
    };
  }

  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  if (!config.extensions.includes(ext)) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed: ${config.extensions.join(', ')}`,
    };
  }

  // Check security
  if (!validateFileSecurity(filename)) {
    return {
      isValid: false,
      error: 'Invalid filename - potential security risk',
    };
  }

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

  try {
    // Get original image metadata
    const metadata = await sharp(buffer).metadata();

    // Process image
    const processedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();

    // Write processed image
    fs.writeFileSync(outputPath, processedBuffer);

    // Get processed image metadata
    const processedMetadata = await sharp(processedBuffer).metadata();

    return {
      filename: path.basename(outputPath),
      size: processedBuffer.length,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      path: outputPath,
      mimeType: `image/${format}`,
    };
  } catch (error) {
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
  const tempDir = UPLOAD_PATHS.TEMP;
  if (!fs.existsSync(tempDir)) {
    return 0;
  }

  const files = fs.readdirSync(tempDir);
  const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime.getTime() < cutoffTime) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete temp file ${file}:`, error);
      }
    }
  }

  return deletedCount;
}

/**
 * Initialize upload system
 */
export function initializeUploadSystem(): void {
  console.log('🔧 Initializing upload system...');

  // Create directories
  ensureUploadDirectories();

  // Log configuration
  console.log('📁 Upload directories created:');
  Object.entries(UPLOAD_PATHS).forEach(([key, path]) => {
    console.log(`  ${key}: ${path}`);
  });

  console.log('📝 File type configurations:');
  Object.entries(FILE_TYPES).forEach(([key, config]) => {
    console.log(
      `  ${key}: ${formatFileSize(config.maxSize)} max, ${config.extensions.join(', ')}`,
    );
  });

  console.log('✅ Upload system initialized');
}
