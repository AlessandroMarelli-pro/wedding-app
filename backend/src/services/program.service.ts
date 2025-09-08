import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramEvent } from '../entities/program-event.entity';

export interface CreateProgramEventDto {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  displayOrder: number;
  includeInCalendar?: boolean;
  icon?: string;
}

export interface UpdateProgramEventDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  displayOrder?: number;
  includeInCalendar?: boolean;
  icon?: string;
}

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(ProgramEvent)
    private readonly programEventRepository: Repository<ProgramEvent>,
  ) {}

  async getAllEvents(): Promise<ProgramEvent[]> {
    return this.programEventRepository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async getEventById(id: string): Promise<ProgramEvent> {
    const event = await this.programEventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Program event with ID ${id} not found`);
    }

    return event;
  }

  async createEvent(createDto: CreateProgramEventDto): Promise<ProgramEvent> {
    const event = this.programEventRepository.create({
      ...createDto,
      startTime: new Date(createDto.startTime),
      endTime: new Date(createDto.endTime),
      includeInCalendar: createDto.includeInCalendar ?? true,
    });

    return this.programEventRepository.save(event);
  }

  async updateEvent(
    id: string,
    updateDto: UpdateProgramEventDto,
  ): Promise<ProgramEvent> {
    const event = await this.getEventById(id);

    const updateData: Partial<ProgramEvent> = {
      ...updateDto,
      startTime: updateDto.startTime
        ? new Date(updateDto.startTime)
        : undefined,
      endTime: updateDto.endTime ? new Date(updateDto.endTime) : undefined,
    };

    Object.assign(event, updateData);
    return this.programEventRepository.save(event);
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    await this.programEventRepository.remove(event);
  }

  async generateCalendar(): Promise<string> {
    const events = await this.programEventRepository.find({
      where: { includeInCalendar: true },
      order: { startTime: 'ASC' },
    });

    if (events.length === 0) {
      throw new NotFoundException('No calendar events found');
    }

    const icalEvents = events.map((event) => this.formatEventAsICal(event));

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Website//Wedding Program//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...icalEvents,
      'END:VCALENDAR',
    ].join('\r\n');

    return icalContent;
  }

  private formatEventAsICal(event: ProgramEvent): string {
    const formatDateTime = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const uid = `${event.id}@wedding-website.com`;
    const dtstart = formatDateTime(event.startTime);
    const dtend = formatDateTime(event.endTime);
    const summary = event.title.replace(/,/g, '\\,');
    const description = event.description
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
    const location = event.location.replace(/,/g, '\\,');
    const dtstamp = formatDateTime(new Date());

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\r\n');
  }

  async reorderEvents(eventIds: string[]): Promise<ProgramEvent[]> {
    const events = await this.programEventRepository.findByIds(eventIds);

    if (events.length !== eventIds.length) {
      throw new NotFoundException('Some events not found');
    }

    // Update display order based on array position
    const updates = eventIds.map((id, index) => ({
      id,
      displayOrder: index + 1,
    }));

    await Promise.all(
      updates.map(({ id, displayOrder }) =>
        this.programEventRepository.update(id, { displayOrder }),
      ),
    );

    return this.getAllEvents();
  }
}
