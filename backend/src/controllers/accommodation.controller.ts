import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Accommodation } from '../entities/accommodation.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  AccommodationService,
  CreateAccommodationDto,
  UpdateAccommodationDto,
} from '../services/accommodation.service';
import {
  ParsedAccommodationData,
  UrlParserService,
} from '../services/url-parser.service';

@ApiTags('Public')
@Controller('accommodations')
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accommodations' })
  @ApiResponse({
    status: 200,
    description: 'List of accommodations',
    type: [Accommodation],
  })
  async getAllAccommodations(): Promise<Accommodation[]> {
    return this.accommodationService.getAllAccommodations();
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended accommodations' })
  @ApiResponse({
    status: 200,
    description: 'List of recommended accommodations',
    type: [Accommodation],
  })
  async getRecommendedAccommodations(): Promise<Accommodation[]> {
    return this.accommodationService.getRecommendedAccommodations();
  }
}

@ApiTags('Admin')
@Controller('admin/accommodations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminAccommodationController {
  constructor(
    private readonly accommodationService: AccommodationService,
    private readonly urlParserService: UrlParserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new accommodation' })
  @ApiResponse({
    status: 201,
    description: 'Accommodation created',
    type: Accommodation,
  })
  async createAccommodation(
    @Body() createDto: CreateAccommodationDto,
  ): Promise<Accommodation> {
    return this.accommodationService.createAccommodation(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update accommodation' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation updated',
    type: Accommodation,
  })
  async updateAccommodation(
    @Param('id') id: string,
    @Body() updateDto: UpdateAccommodationDto,
  ): Promise<Accommodation> {
    return this.accommodationService.updateAccommodation(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete accommodation' })
  @ApiResponse({
    status: 200,
    description: 'Accommodation deleted',
  })
  async deleteAccommodation(@Param('id') id: string): Promise<void> {
    return this.accommodationService.deleteAccommodation(id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder accommodations' })
  @ApiResponse({
    status: 200,
    description: 'Accommodations reordered',
  })
  async reorderAccommodations(
    @Body() body: { accommodationIds: string[] },
  ): Promise<void> {
    return this.accommodationService.reorderAccommodations(
      body.accommodationIds,
    );
  }

  @Post('parse-url')
  @ApiOperation({ summary: 'Parse accommodation URL and extract data' })
  @ApiResponse({
    status: 200,
    description: 'URL parsed successfully',
    type: Object,
  })
  async parseAccommodationUrl(
    @Body() body: { url: string },
  ): Promise<ParsedAccommodationData> {
    return this.urlParserService.parseAccommodationUrl(body.url);
  }
}
