import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WeddingInfo } from '../entities/wedding-info.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  UpdateWeddingInfoDto,
  WeddingService,
} from '../services/wedding.service';

@ApiTags('Public')
@Controller('wedding')
export class WeddingController {
  constructor(private readonly weddingService: WeddingService) {}

  @Get()
  @ApiOperation({ summary: 'Get wedding information' })
  @ApiResponse({
    status: 200,
    description: 'Wedding information',
    type: WeddingInfo,
  })
  async getWeddingInfo(): Promise<WeddingInfo> {
    return this.weddingService.getWeddingInfo();
  }
}

@ApiTags('Admin')
@Controller('admin/wedding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminWeddingController {
  constructor(private readonly weddingService: WeddingService) {}

  @Put()
  @ApiOperation({ summary: 'Update wedding information' })
  @ApiResponse({
    status: 200,
    description: 'Wedding info updated',
    type: WeddingInfo,
  })
  async updateWeddingInfo(
    @Body() updateDto: UpdateWeddingInfoDto,
  ): Promise<WeddingInfo> {
    return this.weddingService.updateWeddingInfo(updateDto);
  }
}
