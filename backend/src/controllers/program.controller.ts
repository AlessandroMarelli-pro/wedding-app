import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ProgramEvent } from '../entities/program-event.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CalendarService } from '../services/calendar.service';
import {
  CreateProgramEventDto,
  ProgramService,
  UpdateProgramEventDto,
} from '../services/program.service';

@ApiTags('Public')
@Controller('program')
export class ProgramController {
  constructor(
    private readonly programService: ProgramService,
    private readonly calendarService: CalendarService,
  ) {}

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
  @ApiOperation({
    summary: 'Download complete wedding program calendar (.ics)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Custom calendar name',
    example: 'Wedding Program',
  })
  @ApiQuery({
    name: 'timezone',
    required: false,
    description: 'Calendar timezone',
    example: 'America/New_York',
  })
  @ApiResponse({
    status: 200,
    description: 'iCalendar file for all program events',
    headers: {
      'Content-Type': {
        description: 'text/calendar',
      },
      'Content-Disposition': {
        description: 'attachment; filename=wedding-program.ics',
      },
    },
  })
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  async downloadCalendar(
    @Res() res: Response,
    @Query('name') calendarName?: string,
    @Query('timezone') timezone?: string,
  ): Promise<void> {
    try {
      const icalContent = await this.calendarService.generateProgramCalendar({
        calendarName: calendarName || 'Wedding Program',
        description: 'Complete wedding ceremony and reception program',
        timezone: timezone || 'UTC',
        method: 'PUBLISH',
      });

      const filename = `wedding-program-${new Date().toISOString().split('T')[0]}.ics`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(icalContent);
    } catch (error) {
      res.status(500).json({
        error: 'Calendar generation failed',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  @Get('events/:id/calendar')
  @ApiOperation({ summary: 'Download single event calendar (.ics)' })
  @ApiQuery({
    name: 'timezone',
    required: false,
    description: 'Calendar timezone',
    example: 'America/New_York',
  })
  @ApiResponse({
    status: 200,
    description: 'iCalendar file for single event',
    headers: {
      'Content-Type': {
        description: 'text/calendar',
      },
      'Content-Disposition': {
        description: 'attachment; filename=wedding-event.ics',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  async downloadEventCalendar(
    @Param('id') eventId: string,
    @Res() res: Response,
    @Query('timezone') timezone?: string,
  ): Promise<void> {
    try {
      const icalContent = await this.calendarService.generateEventCalendar(
        eventId,
        {
          timezone: timezone || 'UTC',
          method: 'PUBLISH',
        },
      );

      const event = await this.programService.getEventById(eventId);
      const filename = `wedding-${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(icalContent);
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({
          error: 'Event not found',
          message: `Program event with ID ${eventId} not found`,
        });
      } else {
        res.status(500).json({
          error: 'Calendar generation failed',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }
  }

  @Get('calendar/stats')
  @ApiOperation({ summary: 'Get calendar statistics' })
  @ApiResponse({
    status: 200,
    description: 'Calendar statistics',
    schema: {
      type: 'object',
      properties: {
        totalEvents: { type: 'number' },
        upcomingEvents: { type: 'number' },
        pastEvents: { type: 'number' },
        eventsIncludedInCalendar: { type: 'number' },
        nextEvent: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
          },
        },
      },
    },
  })
  async getCalendarStats(): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    eventsIncludedInCalendar: number;
    nextEvent?: {
      title: string;
      startTime: Date;
      location?: string;
    };
  }> {
    return this.calendarService.getCalendarStats();
  }
}

@ApiTags('Admin')
@Controller('admin/program')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminProgramController {
  constructor(
    private readonly programService: ProgramService,
    private readonly calendarService: CalendarService,
  ) {}

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
