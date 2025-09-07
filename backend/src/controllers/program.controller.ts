import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ProgramEvent } from '../entities/program-event.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreateProgramEventDto,
  ProgramService,
  UpdateProgramEventDto,
} from '../services/program.service';

@ApiTags('Public')
@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  @ApiOperation({ summary: 'Get all program events' })
  @ApiResponse({
    status: 200,
    description: 'List of program events',
    type: [ProgramEvent],
  })
  async getAllEvents(): Promise<ProgramEvent[]> {
    return this.programService.getAllEvents();
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Download calendar file (.ics)' })
  @ApiResponse({
    status: 200,
    description: 'iCalendar file',
    headers: {
      'Content-Type': {
        description: 'text/calendar',
      },
      'Content-Disposition': {
        description: 'attachment; filename=wedding-program.ics',
      },
    },
  })
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename=wedding-program.ics')
  async downloadCalendar(@Res() res: Response): Promise<void> {
    try {
      const icalContent = await this.programService.generateCalendar();
      res.send(icalContent);
    } catch (error) {
      res.status(404).json({
        error: 'Calendar not available',
        message: 'No program events found or calendar generation failed',
      });
    }
  }
}

@ApiTags('Admin')
@Controller('admin/program')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  @ApiOperation({ summary: 'Get all program events (admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of program events',
    type: [ProgramEvent],
  })
  async getAllEvents(): Promise<ProgramEvent[]> {
    return this.programService.getAllEvents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Program event details',
    type: ProgramEvent,
  })
  async getEventById(@Param('id') id: string): Promise<ProgramEvent> {
    return this.programService.getEventById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new program event' })
  @ApiResponse({
    status: 201,
    description: 'Program event created',
    type: ProgramEvent,
  })
  async createEvent(
    @Body() createDto: CreateProgramEventDto,
  ): Promise<ProgramEvent> {
    return this.programService.createEvent(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update program event' })
  @ApiResponse({
    status: 200,
    description: 'Program event updated',
    type: ProgramEvent,
  })
  async updateEvent(
    @Param('id') id: string,
    @Body() updateDto: UpdateProgramEventDto,
  ): Promise<ProgramEvent> {
    return this.programService.updateEvent(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete program event' })
  @ApiResponse({
    status: 200,
    description: 'Program event deleted',
  })
  async deleteEvent(@Param('id') id: string): Promise<{ message: string }> {
    await this.programService.deleteEvent(id);
    return { message: 'Program event deleted successfully' };
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder program events' })
  @ApiResponse({
    status: 200,
    description: 'Events reordered',
    type: [ProgramEvent],
  })
  async reorderEvents(
    @Body() body: { eventIds: string[] },
  ): Promise<ProgramEvent[]> {
    return this.programService.reorderEvents(body.eventIds);
  }
}
