import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { imageUploadConfig } from '../config/upload';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CSVUpload } from '../entities/csv-upload.entity';
import { Guest } from '../entities/guest.entity';
import { UploadedImage } from '../entities/uploaded-image.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';
import { JwtPayload } from '../services/auth.service';
import { GuestService } from '../services/guest.service';
import {
  ImageProcessingOptions,
  ImageService,
} from '../services/image.service';
import { UploadMaintenanceService } from '../services/upload-maintenance.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly guestService: GuestService,
    private readonly imageService: ImageService,
    private readonly uploadMaintenanceService: UploadMaintenanceService,
  ) {}

  @Post('guests/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel'
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @ApiOperation({ summary: 'Upload CSV file with guests' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'CSV upload initiated',
    type: CSVUpload,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or format',
  })
  async uploadGuestCSV(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<CSVUpload> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!file.buffer) {
      throw new Error('File buffer is empty or invalid');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new Error('File must have a .csv extension');
    }

    try {
      const fileContent = file.buffer.toString('utf-8');
      if (!fileContent.trim()) {
        throw new Error('CSV file is empty');
      }

      return this.guestService.processCSVFile(
        fileContent,
        file.originalname,
        user.sub,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Invalid byte sequence')
      ) {
        throw new Error(
          'File encoding is not valid UTF-8. Please save your CSV file with UTF-8 encoding.',
        );
      }
      throw error;
    }
  }

  @Get('guests')
  @ApiOperation({ summary: 'Get all guests' })
  @ApiResponse({
    status: 200,
    description: 'List of all guests',
    type: [Guest],
  })
  async getAllGuests(): Promise<Guest[]> {
    return this.guestService.getAllGuests();
  }

  @Get('guests/uploads')
  @ApiOperation({ summary: 'Get all CSV uploads' })
  @ApiResponse({
    status: 200,
    description: 'List of CSV uploads',
    type: [CSVUpload],
  })
  async getCSVUploads(): Promise<CSVUpload[]> {
    return this.guestService.getCSVUploads();
  }

  @Get('guests/uploads/:id')
  @ApiOperation({ summary: 'Get CSV upload details' })
  @ApiResponse({
    status: 200,
    description: 'CSV upload details',
    type: CSVUpload,
  })
  async getCSVUpload(@Param('id') id: string): Promise<CSVUpload> {
    const upload = await this.guestService.getCSVUpload(id);
    if (!upload) {
      throw new Error(`CSV upload with ID ${id} not found`);
    }
    return upload;
  }

  @Get('guests/uploads/:id/report')
  @ApiOperation({ summary: 'Get detailed CSV upload report' })
  @ApiResponse({
    status: 200,
    description: 'Detailed upload report with errors and warnings',
    schema: {
      type: 'object',
      properties: {
        upload: {
          type: 'object',
          description: 'Upload metadata',
        },
        errorReport: {
          type: 'object',
          properties: {
            simpleErrors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Simple error messages',
            },
            detailedErrors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  row: { type: 'number' },
                  field: { type: 'string' },
                  value: { type: 'string' },
                  message: { type: 'string' },
                  severity: { type: 'string', enum: ['error', 'warning'] },
                  code: { type: 'string' },
                },
              },
            },
            warnings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  row: { type: 'number' },
                  field: { type: 'string' },
                  value: { type: 'string' },
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                duplicatesSkipped: { type: 'number' },
                emptyRowsSkipped: { type: 'number' },
                validationErrors: { type: 'number' },
                dataWarnings: { type: 'number' },
                fieldsProcessed: { type: 'array', items: { type: 'string' } },
                processingTime: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Upload not found',
  })
  async getCSVUploadReport(@Param('id') uploadId: string): Promise<{
    upload: CSVUpload;
    errorReport?: {
      simpleErrors: string[];
      detailedErrors: any[];
      warnings: any[];
      summary: any;
    };
  }> {
    return this.guestService.getCSVUploadReport(uploadId);
  }

  @Get('guests/validation-stats')
  @ApiOperation({ summary: 'Get CSV validation statistics' })
  @ApiResponse({
    status: 200,
    description: 'CSV validation statistics',
    schema: {
      type: 'object',
      properties: {
        totalUploads: { type: 'number' },
        successfulUploads: { type: 'number' },
        failedUploads: { type: 'number' },
        totalRowsProcessed: { type: 'number' },
        totalErrors: { type: 'number' },
        commonErrors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              count: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
        commonWarnings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              count: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getCSVValidationStats(): Promise<{
    totalUploads: number;
    successfulUploads: number;
    failedUploads: number;
    totalRowsProcessed: number;
    totalErrors: number;
    commonErrors: { code: string; count: number; message: string }[];
    commonWarnings: { code: string; count: number; message: string }[];
  }> {
    return this.guestService.getCSVValidationStats();
  }

  @Get('guests/uploads/:id/guests')
  @ApiOperation({ summary: 'Get guests from specific upload' })
  @ApiResponse({
    status: 200,
    description: 'List of guests from upload',
    type: [Guest],
  })
  async getGuestsByUpload(@Param('id') uploadId: string): Promise<Guest[]> {
    return this.guestService.getGuestsByUpload(uploadId);
  }

  @Delete('guests/:id')
  @ApiOperation({ summary: 'Delete a guest' })
  @ApiResponse({
    status: 200,
    description: 'Guest deleted',
  })
  async deleteGuest(@Param('id') id: string): Promise<void> {
    return this.guestService.deleteGuest(id);
  }

  @Delete('guests/uploads/:id/guests')
  @ApiOperation({ summary: 'Delete all guests from a specific upload' })
  @ApiResponse({
    status: 200,
    description: 'All guests from upload deleted',
  })
  async deleteGuestsByUpload(@Param('id') uploadId: string): Promise<void> {
    return this.guestService.deleteGuestsByUpload(uploadId);
  }

  @Post('seed/accommodations')
  @ApiOperation({ summary: 'Seed default accommodations' })
  @ApiResponse({
    status: 201,
    description: 'Default accommodations seeded',
  })
  async seedAccommodations(): Promise<{ message: string }> {
    // This would require AccommodationService injection
    return { message: 'Seeding endpoint - implement in future iteration' };
  }

  // Image Management Endpoints

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('image', imageUploadConfig))
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        usageLocation: {
          type: 'string',
          description:
            'Where the image will be used (e.g., "hero", "information", "accommodation")',
        },
        altText: {
          type: 'string',
          description: 'Alternative text for accessibility',
        },
        maxWidth: {
          type: 'number',
          description: 'Maximum width for resizing',
        },
        maxHeight: {
          type: 'number',
          description: 'Maximum height for resizing',
        },
        quality: {
          type: 'number',
          description: 'Image quality (1-100)',
        },
        format: {
          type: 'string',
          enum: ['jpeg', 'png', 'webp'],
          description: 'Output format',
        },
      },
      required: ['image', 'usageLocation'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadedImage,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or parameters',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('usageLocation') usageLocation: string,
    @CurrentUser() user: JwtPayload,
    @Body('altText') altText?: string,
    @Body('maxWidth') maxWidth?: string,
    @Body('maxHeight') maxHeight?: string,
    @Body('quality') quality?: string,
    @Body('format') format?: 'jpeg' | 'png' | 'webp',
  ): Promise<UploadedImage> {
    if (!file) {
      throw new Error('No image file uploaded');
    }

    if (!file.buffer) {
      throw new Error('File buffer is empty or invalid');
    }

    if (!usageLocation) {
      throw new Error('Usage location is required');
    }

    const processingOptions: ImageProcessingOptions = {};

    if (maxWidth) {
      processingOptions.maxWidth = parseInt(maxWidth, 10);
    }

    if (maxHeight) {
      processingOptions.maxHeight = parseInt(maxHeight, 10);
    }

    if (quality) {
      processingOptions.quality = parseInt(quality, 10);
    }

    if (format) {
      processingOptions.format = format;
    }

    return this.imageService.uploadImage(
      {
        originalName: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype,
        usageLocation,
        altText,
      },
      user.sub,
      processingOptions,
    );
  }

  @Get('images')
  @ApiOperation({ summary: 'Get all uploaded images' })
  @ApiResponse({
    status: 200,
    description: 'List of uploaded images',
    type: [UploadedImage],
  })
  async getImages(): Promise<UploadedImage[]> {
    return this.imageService.getAllImages();
  }

  @Get('images/:id')
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiResponse({
    status: 200,
    description: 'Image details',
    type: UploadedImage,
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async getImageById(@Param('id') id: string): Promise<UploadedImage> {
    return this.imageService.getImageById(id);
  }

  @Put('images/:id')
  @ApiOperation({ summary: 'Update image metadata' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        altText: {
          type: 'string',
          description: 'Alternative text for accessibility',
        },
        usageLocation: {
          type: 'string',
          description: 'Where the image is used',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image metadata updated',
    type: UploadedImage,
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async updateImageMetadata(
    @Param('id') id: string,
    @Body() updateData: { altText?: string; usageLocation?: string },
  ): Promise<UploadedImage> {
    return this.imageService.updateImageMetadata(id, updateData);
  }

  @Delete('images/:id')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async deleteImage(@Param('id') id: string): Promise<{ message: string }> {
    await this.imageService.deleteImage(id);
    return { message: 'Image deleted successfully' };
  }

  @Post('images/:id/thumbnail')
  @ApiOperation({ summary: 'Generate thumbnail for an image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        width: {
          type: 'number',
          default: 200,
          description: 'Thumbnail width',
        },
        height: {
          type: 'number',
          default: 200,
          description: 'Thumbnail height',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Thumbnail generated',
    schema: {
      type: 'object',
      properties: {
        thumbnailFilename: {
          type: 'string',
        },
        thumbnailUrl: {
          type: 'string',
        },
      },
    },
  })
  async generateThumbnail(
    @Param('id') id: string,
    @Body('width') width?: number,
    @Body('height') height?: number,
  ): Promise<{ thumbnailFilename: string; thumbnailUrl: string }> {
    const thumbnailFilename = await this.imageService.createThumbnail(
      id,
      width || 200,
      height || 200,
    );

    return {
      thumbnailFilename,
      thumbnailUrl: this.imageService.getImageUrl(thumbnailFilename),
    };
  }

  @Post('images/:id/optimize')
  @ApiOperation({ summary: 'Optimize image for web' })
  @ApiResponse({
    status: 201,
    description: 'Web-optimized version created',
    schema: {
      type: 'object',
      properties: {
        optimizedFilename: {
          type: 'string',
        },
        optimizedUrl: {
          type: 'string',
        },
      },
    },
  })
  async optimizeForWeb(
    @Param('id') id: string,
  ): Promise<{ optimizedFilename: string; optimizedUrl: string }> {
    const optimizedFilename = await this.imageService.optimizeForWeb(id);

    return {
      optimizedFilename,
      optimizedUrl: this.imageService.getImageUrl(optimizedFilename),
    };
  }

  @Post('images/cleanup')
  @ApiOperation({ summary: 'Clean up orphaned image files' })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed',
    schema: {
      type: 'object',
      properties: {
        deletedFilesCount: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
  async cleanupOrphanedFiles(): Promise<{
    deletedFilesCount: number;
    message: string;
  }> {
    const deletedCount = await this.imageService.cleanupOrphanedFiles();

    return {
      deletedFilesCount: deletedCount,
      message: `Cleaned up ${deletedCount} orphaned image files`,
    };
  }

  // Upload System Maintenance Endpoints

  @Post('system/cleanup')
  @ApiOperation({ summary: 'Manual cleanup of temporary and orphaned files' })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed',
    schema: {
      type: 'object',
      properties: {
        tempFiles: { type: 'number' },
        orphanedFiles: { type: 'number' },
        freedSpace: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async manualCleanup(): Promise<{
    tempFiles: number;
    orphanedFiles: number;
    freedSpace: number;
    message: string;
  }> {
    const result = await this.uploadMaintenanceService.manualCleanup();

    return {
      ...result,
      message: `Cleanup completed: ${result.tempFiles} temp files, ${result.orphanedFiles} orphaned files removed`,
    };
  }

  @Get('system/storage')
  @ApiOperation({ summary: 'Get storage usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Storage usage report',
    schema: {
      type: 'object',
      properties: {
        totalFiles: { type: 'number' },
        totalSize: { type: 'number' },
        totalSizeFormatted: { type: 'string' },
        directories: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              files: { type: 'number' },
              size: { type: 'number' },
              sizeFormatted: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getStorageUsage(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    directories: Record<
      string,
      { files: number; size: number; sizeFormatted: string }
    >;
  }> {
    const usage = await this.uploadMaintenanceService.getStorageUsage();

    // Format sizes for readability
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formattedDirectories: Record<
      string,
      { files: number; size: number; sizeFormatted: string }
    > = {};

    for (const [dir, stats] of Object.entries(usage.directories)) {
      formattedDirectories[dir] = {
        ...stats,
        sizeFormatted: formatFileSize(stats.size),
      };
    }

    return {
      totalFiles: usage.totalFiles,
      totalSize: usage.totalSize,
      totalSizeFormatted: formatFileSize(usage.totalSize),
      directories: formattedDirectories,
    };
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Check upload system health' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    schema: {
      type: 'object',
      properties: {
        healthy: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
        directories: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              exists: { type: 'boolean' },
              writable: { type: 'boolean' },
              readable: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async checkSystemHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    directories: Record<
      string,
      { exists: boolean; writable: boolean; readable: boolean }
    >;
  }> {
    return this.uploadMaintenanceService.validateUploadHealth();
  }

  // Analytics and Reporting Endpoints

  @Get('analytics/rsvp')
  @ApiOperation({ summary: 'Get comprehensive RSVP analytics' })
  @ApiResponse({
    status: 200,
    description: 'RSVP analytics data',
    schema: {
      type: 'object',
      properties: {
        overview: {
          type: 'object',
          properties: {
            totalGuests: { type: 'number' },
            totalInvited: { type: 'number' },
            totalConfirmed: { type: 'number' },
            totalDeclined: { type: 'number' },
            totalPending: { type: 'number' },
            responseRate: { type: 'number' },
            attendanceRate: { type: 'number' },
          },
        },
        attendance: {
          type: 'object',
          properties: {
            totalExpectedAttendees: { type: 'number' },
            confirmedAttendees: { type: 'number' },
            averagePartySize: { type: 'number' },
            partySizeDistribution: { type: 'object' },
          },
        },
        timeline: {
          type: 'object',
          properties: {
            dailyResponses: { type: 'array' },
            weeklyResponses: { type: 'array' },
            monthlyResponses: { type: 'array' },
          },
        },
        demographics: {
          type: 'object',
          properties: {
            dietaryRestrictions: { type: 'array' },
            specialRequests: { type: 'array' },
            phoneNumberProvided: { type: 'object' },
            emailProvided: { type: 'object' },
          },
        },
        recentActivity: { type: 'array' },
      },
    },
  })
  async getRSVPAnalytics() {
    return this.analyticsService.getRSVPAnalytics();
  }

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get dashboard summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary data',
    schema: {
      type: 'object',
      properties: {
        totalGuests: { type: 'number' },
        responseRate: { type: 'number' },
        attendanceRate: { type: 'number' },
        confirmedAttendees: { type: 'number' },
        recentResponses: { type: 'number' },
        pendingInvitations: { type: 'number' },
      },
    },
  })
  async getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('analytics/uploads')
  @ApiOperation({ summary: 'Get upload analytics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Upload analytics data',
    schema: {
      type: 'object',
      properties: {
        totalUploads: { type: 'number' },
        successfulUploads: { type: 'number' },
        failedUploads: { type: 'number' },
        totalGuestsImported: { type: 'number' },
        averageGuestsPerUpload: { type: 'number' },
        uploadHistory: { type: 'array' },
        errorAnalysis: {
          type: 'object',
          properties: {
            commonErrors: { type: 'array' },
            errorTrends: { type: 'array' },
          },
        },
      },
    },
  })
  async getUploadAnalytics() {
    return this.analyticsService.getUploadAnalytics();
  }

  @Get('guests/export')
  @ApiOperation({ summary: 'Export all guest data as CSV' })
  @ApiResponse({
    status: 200,
    description: 'CSV file with guest data',
    headers: {
      'Content-Type': {
        description: 'text/csv',
        schema: { type: 'string' },
      },
      'Content-Disposition': {
        description: 'attachment; filename="guests-export.csv"',
        schema: { type: 'string' },
      },
    },
  })
  async exportGuestsCSV(@Res() res: Response) {
    const csvContent = await this.analyticsService.generateGuestCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="guests-export.csv"',
    );
    res.send(csvContent);
  }

  @Get('guests/export/data')
  @ApiOperation({ summary: 'Get guest export data as JSON' })
  @ApiResponse({
    status: 200,
    description: 'Guest data for export',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          phoneNumber: { type: 'string' },
          partySize: { type: 'number' },
          dietaryRestrictions: { type: 'string' },
          specialRequests: { type: 'string' },
          hashCode: { type: 'string' },
          rsvpStatus: {
            type: 'string',
            enum: ['pending', 'confirmed', 'declined'],
          },
          confirmedPartySize: { type: 'number' },
          rsvpMessage: { type: 'string' },
          rsvpDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getGuestExportData() {
    return this.analyticsService.getGuestExportData();
  }
}
