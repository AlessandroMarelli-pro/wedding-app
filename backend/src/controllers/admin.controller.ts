import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CSVUpload } from '../entities/csv-upload.entity';
import { Guest } from '../entities/guest.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtPayload } from '../services/auth.service';
import { GuestService } from '../services/guest.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly guestService: GuestService) {}

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
}
