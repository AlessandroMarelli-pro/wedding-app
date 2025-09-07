import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RSVPConfirmation } from '../entities/rsvp-confirmation.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  RSVPRequest,
  RSVPResponse,
  RSVPService,
  RSVPStats,
} from '../services/rsvp.service';

@ApiTags('Public')
@Controller('rsvp')
export class RSVPController {
  constructor(private readonly rsvpService: RSVPService) {}

  @Post()
  @ApiOperation({ summary: 'Submit RSVP with hash code' })
  @ApiResponse({
    status: 200,
    description: 'RSVP confirmed',
    type: RSVPResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid hash code or already confirmed',
  })
  async confirmRSVP(
    @Body() rsvpRequest: RSVPRequest,
    @Req() req: Request,
  ): Promise<RSVPResponse> {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');

    return this.rsvpService.confirmRSVP(rsvpRequest, ipAddress, userAgent);
  }

  @Get('check/:hashCode')
  @ApiOperation({ summary: 'Check if hash code is already confirmed' })
  @ApiResponse({
    status: 200,
    description: 'Hash code confirmation status',
  })
  async checkConfirmation(
    @Param('hashCode') hashCode: string,
  ): Promise<{ confirmed: boolean }> {
    const confirmed = await this.rsvpService.isGuestConfirmed(hashCode);
    return { confirmed };
  }
}

@ApiTags('Admin')
@Controller('admin/rsvp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminRSVPController {
  constructor(private readonly rsvpService: RSVPService) {}

  @Get('confirmations')
  @ApiOperation({ summary: 'Get all RSVP confirmations' })
  @ApiResponse({
    status: 200,
    description: 'List of confirmations',
    type: [RSVPConfirmation],
  })
  async getAllConfirmations(): Promise<RSVPConfirmation[]> {
    return this.rsvpService.getAllConfirmations();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get RSVP statistics' })
  @ApiResponse({
    status: 200,
    description: 'RSVP statistics',
    type: RSVPStats,
  })
  async getRSVPStats(): Promise<RSVPStats> {
    return this.rsvpService.getRSVPStats();
  }

  @Get('confirmed')
  @ApiOperation({ summary: 'Get list of confirmed guests' })
  @ApiResponse({
    status: 200,
    description: 'List of confirmed guests',
  })
  async getConfirmedGuests(): Promise<
    Array<{ guestName: string; confirmedAt: Date; email?: string }>
  > {
    return this.rsvpService.getConfirmedGuestsList();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get list of pending guests' })
  @ApiResponse({
    status: 200,
    description: 'List of pending guests',
  })
  async getPendingGuests(): Promise<
    Array<{ guestName: string; hashCode: string; email?: string }>
  > {
    return this.rsvpService.getPendingGuestsList();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent confirmations' })
  @ApiResponse({
    status: 200,
    description: 'Recent confirmations',
    type: [RSVPConfirmation],
  })
  async getRecentConfirmations(
    @Query('limit') limit?: number,
  ): Promise<RSVPConfirmation[]> {
    return this.rsvpService.getRecentConfirmations(limit || 10);
  }

  @Delete('confirmations/:id')
  @ApiOperation({ summary: 'Delete RSVP confirmation' })
  @ApiResponse({
    status: 200,
    description: 'Confirmation deleted',
  })
  async deleteConfirmation(@Param('id') id: string): Promise<void> {
    return this.rsvpService.deleteConfirmation(id);
  }
}
