import * as fs from 'fs';
import * as path from 'path';
import { prisma } from './prisma';
import { UPLOAD_PATHS, cleanupTempFiles, formatFileSize } from './upload';

export interface StorageUsageReport {
  totalFiles: number;
  totalSize: number;
  directories: Record<string, { files: number; size: number }>;
}

export interface CleanupResult {
  tempFiles: number;
  orphanedFiles: number;
  freedSpace: number;
}

export interface UploadHealthStatus {
  healthy: boolean;
  issues: string[];
  directories: Record<
    string,
    { exists: boolean; writable: boolean; readable: boolean }
  >;
}

export class MaintenanceService {
  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    try {
      console.log('🧹 Starting temporary files cleanup...');
      const deletedCount = await cleanupTempFiles(olderThanHours);

      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} temporary files`);
      } else {
        console.log('ℹ️  No temporary files to clean up');
      }

      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup temporary files:', error);
      throw error;
    }
  }

  /**
   * Clean up orphaned image files
   */
  async cleanupOrphanedFiles(): Promise<CleanupResult> {
    try {
      console.log('🧹 Starting orphaned files cleanup...');

      // Get all image filenames from database
      const dbImages = await prisma.uploadedImage.findMany({
        select: { filename: true },
      });
      const dbFilenames = new Set(dbImages.map((img) => img.filename));

      let deletedCount = 0;
      let freedSpace = 0;

      // Check each upload directory
      for (const [_, dirPath] of Object.entries(UPLOAD_PATHS)) {
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
              console.warn(
                `⚠️  Failed to delete orphaned file ${file}:`,
                error,
              );
            }
          }
        }
      }

      if (deletedCount > 0) {
        console.log(
          `✅ Cleaned up ${deletedCount} orphaned files, freed ${formatFileSize(freedSpace)}`,
        );
      } else {
        console.log('ℹ️  No orphaned files to clean up');
      }

      return {
        tempFiles: 0,
        orphanedFiles: deletedCount,
        freedSpace,
      };
    } catch (error) {
      console.error('❌ Failed to cleanup orphaned files:', error);
      throw error;
    }
  }

  /**
   * Generate storage usage report
   */
  async generateStorageReport(): Promise<StorageUsageReport> {
    try {
      console.log('📊 Generating storage usage report...');

      const report = await this.getStorageUsage();

      console.log('📊 Storage Usage Report:');
      console.log(`Total files: ${report.totalFiles}`);
      console.log(`Total size: ${formatFileSize(report.totalSize)}`);
      console.log('Directory breakdown:');

      for (const [dir, usage] of Object.entries(report.directories)) {
        console.log(
          `  ${dir}: ${usage.files} files, ${formatFileSize(usage.size)}`,
        );
      }

      // Warn if storage is getting high (over 1GB)
      if (report.totalSize > 1024 * 1024 * 1024) {
        console.warn(
          '⚠️  Storage usage is over 1GB, consider cleanup or archiving',
        );
      }

      return report;
    } catch (error) {
      console.error('❌ Failed to generate storage report:', error);
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageUsage(): Promise<StorageUsageReport> {
    const report: StorageUsageReport = {
      totalFiles: 0,
      totalSize: 0,
      directories: {},
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
  async manualCleanup(): Promise<CleanupResult> {
    const result: CleanupResult = {
      tempFiles: 0,
      orphanedFiles: 0,
      freedSpace: 0,
    };

    try {
      // Clean temp files
      result.tempFiles = await this.cleanupTempFiles(1); // Clean files older than 1 hour

      // Clean orphaned files
      const orphanedResult = await this.cleanupOrphanedFiles();
      result.orphanedFiles = orphanedResult.orphanedFiles;
      result.freedSpace = orphanedResult.freedSpace;

      console.log(
        `✅ Manual cleanup completed: ${result.tempFiles} temp files, ${result.orphanedFiles} orphaned files, ${formatFileSize(result.freedSpace)} freed`,
      );
    } catch (error) {
      console.error('❌ Manual cleanup failed:', error);
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
  async validateUploadHealth(): Promise<UploadHealthStatus> {
    const result: UploadHealthStatus = {
      healthy: true,
      issues: [],
      directories: {},
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
