import * as fs from 'fs';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';

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
    maxSize: 20 * 1024 * 1024, // 10MB
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
 * File filter factory for different file types
 */
export function createFileFilter(allowedTypes: keyof typeof FILE_TYPES) {
  return (req: any, file: Express.Multer.File, callback: any) => {
    const config = FILE_TYPES[allowedTypes];

    if ((config.mimeTypes as readonly string[]).includes(file.mimetype)) {
      // Additional extension check for security
      const ext = path.extname(file.originalname).toLowerCase();
      if ((config.extensions as readonly string[]).includes(ext)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `Invalid file extension. Allowed: ${config.extensions.join(', ')}`,
          ),
          false,
        );
      }
    } else {
      callback(
        new Error(`Invalid file type. Allowed: ${config.mimeTypes.join(', ')}`),
        false,
      );
    }
  };
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
 * Multer configuration for image uploads (memory storage for processing)
 */
export const imageUploadConfig = {
  storage: memoryStorage(),
  fileFilter: createFileFilter('IMAGES'),
  limits: {
    fileSize: FILE_TYPES.IMAGES.maxSize,
    files: 10, // Max 10 files per upload
  },
};

/**
 * Multer configuration for document uploads (CSV, etc.)
 */
export const documentUploadConfig = {
  storage: memoryStorage(),
  fileFilter: createFileFilter('DOCUMENTS'),
  limits: {
    fileSize: FILE_TYPES.DOCUMENTS.maxSize,
    files: 5, // Max 5 documents per upload
  },
};

/**
 * Multer configuration for disk storage (when processing is not needed)
 */
export function createDiskUploadConfig(
  destination: string,
  fileType: keyof typeof FILE_TYPES,
) {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(destination);
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, generateUniqueFilename(file.originalname));
      },
    }),
    fileFilter: createFileFilter(fileType),
    limits: {
      fileSize: FILE_TYPES[fileType].maxSize,
    },
  };
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
 * Validate file security (basic checks)
 */
export function validateFileSecurity(file: Express.Multer.File): boolean {
  // Check for null bytes (potential path traversal)
  if (file.originalname.includes('\0')) {
    return false;
  }

  // Check for path traversal attempts
  if (
    file.originalname.includes('..') ||
    file.originalname.includes('/') ||
    file.originalname.includes('\\')
  ) {
    return false;
  }

  // Check filename length
  if (file.originalname.length > 255) {
    return false;
  }

  return true;
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
