import { UploadedImage } from '@/entities/uploaded-image.entity';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { ImageService } from '../services/image.service';

@ApiTags('Public')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all uploaded images' })
  @ApiResponse({
    status: 200,
    description: 'List of uploaded images',
    type: [UploadedImage],
  })
  async getImages(): Promise<UploadedImage[]> {
    return this.imageService.getAllImages();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Serve image by ID' })
  @ApiParam({
    name: 'id',
    description: 'Image UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Image file served successfully',
    headers: {
      'Content-Type': {
        description: 'Image MIME type',
        example: 'image/jpeg',
      },
      'Cache-Control': {
        description: 'Cache control header',
        example: 'public, max-age=31536000',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image ID',
  })
  async serveImage(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new BadRequestException('Invalid image ID format');
      }

      // Get image metadata from database
      const image = await this.imageService.getImageById(id);

      // Construct file path
      const filePath = this.imageService.getImagePath(image.filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Image file not found on disk');
      }

      // Set appropriate headers
      res.setHeader('Content-Type', image.mimeType);
      res.setHeader('Content-Length', image.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('ETag', `"${image.id}"`);

      // Set filename for download if needed
      if (image.altText) {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${image.altText}"`,
        );
      }

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Handle stream errors
      fileStream.on('error', (error) => {
        if (!res.headersSent) {
          res.status(500).json({
            error: 'File read error',
            message: 'Failed to read image file',
          });
        }
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to serve image',
      });
    }
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Serve image thumbnail by ID' })
  @ApiParam({
    name: 'id',
    description: 'Image UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Thumbnail image served successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async serveThumbnail(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new BadRequestException('Invalid image ID format');
      }

      // Get image metadata from database
      const image = await this.imageService.getImageById(id);

      // Try to find existing thumbnail
      const thumbnailFilename = `thumb_200x200_${image.filename}`;
      const thumbnailPath = this.imageService.getImagePath(thumbnailFilename);

      let finalPath = thumbnailPath;
      let finalMimeType = 'image/jpeg'; // Thumbnails are always JPEG

      // If thumbnail doesn't exist, create it
      if (!fs.existsSync(thumbnailPath)) {
        try {
          const createdThumbnail = await this.imageService.createThumbnail(
            id,
            200,
            200,
          );
          finalPath = this.imageService.getImagePath(createdThumbnail);
        } catch (error) {
          // If thumbnail creation fails, serve original image
          finalPath = this.imageService.getImagePath(image.filename);
          finalMimeType = image.mimeType;
        }
      }

      // Check if file exists
      if (!fs.existsSync(finalPath)) {
        throw new NotFoundException('Image file not found on disk');
      }

      // Set appropriate headers
      res.setHeader('Content-Type', finalMimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('ETag', `"${image.id}-thumb"`);

      // Stream the file
      const fileStream = fs.createReadStream(finalPath);
      fileStream.pipe(res);

      // Handle stream errors
      fileStream.on('error', (error) => {
        if (!res.headersSent) {
          res.status(500).json({
            error: 'File read error',
            message: 'Failed to read thumbnail file',
          });
        }
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to serve thumbnail',
      });
    }
  }

  @Get(':id/optimized')
  @ApiOperation({ summary: 'Serve optimized image by ID' })
  @ApiParam({
    name: 'id',
    description: 'Image UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Optimized image served successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async serveOptimized(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new BadRequestException('Invalid image ID format');
      }

      // Get image metadata from database
      const image = await this.imageService.getImageById(id);

      // Try to find existing optimized version
      const optimizedFilename = `web_${image.filename.replace(/\.[^.]+$/, '.webp')}`;
      const optimizedPath = this.imageService.getImagePath(optimizedFilename);

      let finalPath = optimizedPath;
      let finalMimeType = 'image/webp'; // Optimized images are WebP

      // If optimized version doesn't exist, create it
      if (!fs.existsSync(optimizedPath)) {
        try {
          const createdOptimized = await this.imageService.optimizeForWeb(id);
          finalPath = this.imageService.getImagePath(createdOptimized);
        } catch (error) {
          // If optimization fails, serve original image
          finalPath = this.imageService.getImagePath(image.filename);
          finalMimeType = image.mimeType;
        }
      }

      // Check if file exists
      if (!fs.existsSync(finalPath)) {
        throw new NotFoundException('Image file not found on disk');
      }

      // Set appropriate headers
      res.setHeader('Content-Type', finalMimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('ETag', `"${image.id}-optimized"`);

      // Stream the file
      const fileStream = fs.createReadStream(finalPath);
      fileStream.pipe(res);

      // Handle stream errors
      fileStream.on('error', (error) => {
        if (!res.headersSent) {
          res.status(500).json({
            error: 'File read error',
            message: 'Failed to read optimized image file',
          });
        }
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to serve optimized image',
      });
    }
  }
}
