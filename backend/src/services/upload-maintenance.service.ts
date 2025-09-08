import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import {
  UPLOAD_PATHS,
  cleanupTempFiles,
  formatFileSize,
} from '../config/upload';
import { UploadedImage } from '../entities/uploaded-image.entity';

@Injectable()
export class UploadMaintenanceService {
  private readonly logger = new Logger(UploadMaintenanceService.name);

  constructor(
    @InjectRepository(UploadedImage)
    private readonly uploadedImageRepository: Repository<UploadedImage>,
  ) {}

  /**
   * Clean up temporary files every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTempFiles(): Promise<void> {
    try {
      this.logger.log('Starting temporary files cleanup...');
      const deletedCount = await cleanupTempFiles(24); // Files older than 24 hours

      if (deletedCount > 0) {
        this.logger.log(`Cleaned up ${deletedCount} temporary files`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup temporary files:', error);
    }
  }

  /**
   * Clean up orphaned image files daily at 2 AM
   */
  @Cron('0 2 * * *')
  async cleanupOrphanedFiles(): Promise<void> {
    try {
      this.logger.log('Starting orphaned files cleanup...');

      // Get all image filenames from database
      const dbImages = await this.uploadedImageRepository.find({
        select: ['filename'],
      });
      const dbFilenames = new Set(dbImages.map((img) => img.filename));

      let deletedCount = 0;
      let freedSpace = 0;

      // Check each upload directory
      for (const [dirName, dirPath] of Object.entries(UPLOAD_PATHS)) {
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          if (!dbFilenames.has(file) && this.isImageFile(file)) {
            const filePath = path.join(dirPath, file);
            try {
              const stats = fs.statSync(filePath);
              freedSpace += stats.size;
              fs.unlinkSync(filePath);
              deletedCount++;
            } catch (error) {
              this.logger.warn(
                `Failed to delete orphaned file ${file}:`,
                error,
              );
            }
          }
        }
      }

      if (deletedCount > 0) {
        this.logger.log(
          `Cleaned up ${deletedCount} orphaned files, freed ${formatFileSize(freedSpace)}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to cleanup orphaned files:', error);
    }
  }

  /**
   * Generate storage usage report weekly on Sundays at 3 AM
   */
  @Cron('0 3 * * 0')
  async generateStorageReport(): Promise<void> {
    try {
      this.logger.log('Generating storage usage report...');

      const report = await this.getStorageUsage();

      this.logger.log('📊 Storage Usage Report:');
      this.logger.log(`Total files: ${report.totalFiles}`);
      this.logger.log(`Total size: ${formatFileSize(report.totalSize)}`);
      this.logger.log('Directory breakdown:');

      for (const [dir, usage] of Object.entries(report.directories)) {
        this.logger.log(
          `  ${dir}: ${usage.files} files, ${formatFileSize(usage.size)}`,
        );
      }

      // Warn if storage is getting high (over 1GB)
      if (report.totalSize > 1024 * 1024 * 1024) {
        this.logger.warn(
          '⚠️  Storage usage is over 1GB, consider cleanup or archiving',
        );
      }
    } catch (error) {
      this.logger.error('Failed to generate storage report:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    directories: Record<string, { files: number; size: number }>;
  }> {
    const report = {
      totalFiles: 0,
      totalSize: 0,
      directories: {} as Record<string, { files: number; size: number }>,
    };

    for (const [dirName, dirPath] of Object.entries(UPLOAD_PATHS)) {
      const dirStats = { files: 0, size: 0 };

      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              dirStats.files++;
              dirStats.size += stats.size;
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }

      report.directories[dirName] = dirStats;
      report.totalFiles += dirStats.files;
      report.totalSize += dirStats.size;
    }

    return report;
  }

  /**
   * Manually trigger cleanup operations
   */
  async manualCleanup(): Promise<{
    tempFiles: number;
    orphanedFiles: number;
    freedSpace: number;
  }> {
    const result = {
      tempFiles: 0,
      orphanedFiles: 0,
      freedSpace: 0,
    };

    try {
      // Clean temp files
      result.tempFiles = await cleanupTempFiles(1); // Clean files older than 1 hour

      // Clean orphaned files
      const dbImages = await this.uploadedImageRepository.find({
        select: ['filename'],
      });
      const dbFilenames = new Set(dbImages.map((img) => img.filename));

      for (const [dirName, dirPath] of Object.entries(UPLOAD_PATHS)) {
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          if (!dbFilenames.has(file) && this.isImageFile(file)) {
            const filePath = path.join(dirPath, file);
            try {
              const stats = fs.statSync(filePath);
              result.freedSpace += stats.size;
              fs.unlinkSync(filePath);
              result.orphanedFiles++;
            } catch (error) {
              // Skip files that can't be deleted
            }
          }
        }
      }

      this.logger.log(
        `Manual cleanup completed: ${result.tempFiles} temp files, ${result.orphanedFiles} orphaned files, ${formatFileSize(result.freedSpace)} freed`,
      );
    } catch (error) {
      this.logger.error('Manual cleanup failed:', error);
      throw error;
    }

    return result;
  }

  /**
   * Check if file is an image based on extension
   */
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * Validate upload directory health
   */
  async validateUploadHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    directories: Record<
      string,
      { exists: boolean; writable: boolean; readable: boolean }
    >;
  }> {
    const result = {
      healthy: true,
      issues: [] as string[],
      directories: {} as Record<
        string,
        { exists: boolean; writable: boolean; readable: boolean }
      >,
    };

    for (const [dirName, dirPath] of Object.entries(UPLOAD_PATHS)) {
      const dirStatus = {
        exists: fs.existsSync(dirPath),
        writable: false,
        readable: false,
      };

      if (dirStatus.exists) {
        try {
          // Test write access
          const testFile = path.join(dirPath, '.write-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          dirStatus.writable = true;
        } catch (error) {
          result.healthy = false;
          result.issues.push(`Directory ${dirName} is not writable`);
        }

        try {
          // Test read access
          fs.readdirSync(dirPath);
          dirStatus.readable = true;
        } catch (error) {
          result.healthy = false;
          result.issues.push(`Directory ${dirName} is not readable`);
        }
      } else {
        result.healthy = false;
        result.issues.push(`Directory ${dirName} does not exist`);
      }

      result.directories[dirName] = dirStatus;
    }

    return result;
  }
}
