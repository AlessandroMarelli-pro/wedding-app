import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramEvent } from '../entities/program-event.entity';

export interface iCalEvent {
  uid: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  url?: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    name: string;
    email: string;
    role?: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'NON-PARTICIPANT';
  }>;
  categories?: string[];
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
  transparency?: 'OPAQUE' | 'TRANSPARENT';
  priority?: number; // 0-9, where 0 is undefined, 1 is highest, 9 is lowest
}

export interface iCalOptions {
  calendarName?: string;
  description?: string;
  timezone?: string;
  url?: string;
  ttl?: number; // Time to live in minutes
  method?:
    | 'PUBLISH'
    | 'REQUEST'
    | 'REPLY'
    | 'ADD'
    | 'CANCEL'
    | 'REFRESH'
    | 'COUNTER'
    | 'DECLINECOUNTER';
  prodId?: string;
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(ProgramEvent)
    private readonly programEventRepository: Repository<ProgramEvent>,
  ) {}

  /**
   * Generate iCal content for program events
   */
  async generateProgramCalendar(options: iCalOptions = {}): Promise<string> {
    const events = await this.programEventRepository.find({
      where: { includeInCalendar: true },
      order: { startTime: 'ASC' },
    });

    const iCalEvents: iCalEvent[] = events.map((event) => ({
      uid: `program-event-${event.id}@wedding-app`,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      status: 'CONFIRMED',
      categories: ['Wedding', 'Program'],
      priority: 5,
    }));

    return this.generateiCal(iCalEvents, {
      calendarName: 'Wedding Program',
      description: 'Wedding ceremony and reception program',
      timezone: 'UTC',
      ...options,
    });
  }

  /**
   * Generate iCal content for a single program event
   */
  async generateEventCalendar(
    eventId: string,
    options: iCalOptions = {},
  ): Promise<string> {
    const event = await this.programEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const iCalEvent: iCalEvent = {
      uid: `program-event-${event.id}@wedding-app`,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      status: 'CONFIRMED',
      categories: ['Wedding', 'Program'],
      priority: 5,
    };

    return this.generateiCal([iCalEvent], {
      calendarName: event.title,
      description: `Wedding event: ${event.title}`,
      timezone: 'UTC',
      ...options,
    });
  }

  /**
   * Generate custom iCal content from provided events
   */
  generateCustomCalendar(
    events: iCalEvent[],
    options: iCalOptions = {},
  ): string {
    return this.generateiCal(events, options);
  }

  /**
   * Core iCal generation method
   */
  private generateiCal(events: iCalEvent[], options: iCalOptions = {}): string {
    const {
      calendarName = 'Wedding Calendar',
      description = 'Wedding events calendar',
      timezone = 'UTC',
      url,
      ttl = 60, // 1 hour default
      method = 'PUBLISH',
      prodId = '-//Wedding App//Wedding Calendar//EN',
    } = options;

    const now = new Date();
    const timestamp = this.formatDateTimeUTC(now);

    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:${prodId}`,
      `METHOD:${method}`,
      `CALSCALE:GREGORIAN`,
      `X-WR-CALNAME:${this.escapeText(calendarName)}`,
      `X-WR-CALDESC:${this.escapeText(description)}`,
      `X-WR-TIMEZONE:${timezone}`,
    ];

    // Add URL if provided
    if (url) {
      ical.push(`URL:${url}`);
    }

    // Add TTL (refresh interval)
    if (ttl > 0) {
      ical.push(`REFRESH-INTERVAL;VALUE=DURATION:PT${ttl}M`);
      ical.push(`X-PUBLISHED-TTL:PT${ttl}M`);
    }

    // Add timezone information
    if (timezone !== 'UTC') {
      ical.push(
        'BEGIN:VTIMEZONE',
        `TZID:${timezone}`,
        'BEGIN:STANDARD',
        'DTSTART:19701025T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
        'TZNAME:Standard Time',
        'TZOFFSETFROM:-0000',
        'TZOFFSETTO:-0000',
        'END:STANDARD',
        'BEGIN:DAYLIGHT',
        'DTSTART:19700405T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU',
        'TZNAME:Daylight Time',
        'TZOFFSETFROM:-0000',
        'TZOFFSETTO:-0000',
        'END:DAYLIGHT',
        'END:VTIMEZONE',
      );
    }

    // Add events
    for (const event of events) {
      ical.push(...this.generateVEvent(event, timezone, timestamp));
    }

    ical.push('END:VCALENDAR');

    return ical.join('\r\n');
  }

  /**
   * Generate VEVENT block for a single event
   */
  private generateVEvent(
    event: iCalEvent,
    timezone: string,
    timestamp: string,
  ): string[] {
    const vevent = [
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART${timezone === 'UTC' ? '' : `;TZID=${timezone}`}:${this.formatDateTime(event.startTime, timezone)}`,
      `DTEND${timezone === 'UTC' ? '' : `;TZID=${timezone}`}:${this.formatDateTime(event.endTime, timezone)}`,
      `SUMMARY:${this.escapeText(event.title)}`,
    ];

    // Add optional fields
    if (event.description) {
      vevent.push(`DESCRIPTION:${this.escapeText(event.description)}`);
    }

    if (event.location) {
      vevent.push(`LOCATION:${this.escapeText(event.location)}`);
    }

    if (event.url) {
      vevent.push(`URL:${event.url}`);
    }

    if (event.organizer) {
      vevent.push(
        `ORGANIZER;CN=${this.escapeText(event.organizer.name)}:mailto:${event.organizer.email}`,
      );
    }

    if (event.attendees && event.attendees.length > 0) {
      for (const attendee of event.attendees) {
        const role = attendee.role || 'REQ-PARTICIPANT';
        vevent.push(
          `ATTENDEE;CN=${this.escapeText(attendee.name)};ROLE=${role}:mailto:${attendee.email}`,
        );
      }
    }

    if (event.categories && event.categories.length > 0) {
      vevent.push(
        `CATEGORIES:${event.categories.map((cat) => this.escapeText(cat)).join(',')}`,
      );
    }

    if (event.status) {
      vevent.push(`STATUS:${event.status}`);
    }

    if (event.transparency) {
      vevent.push(`TRANSP:${event.transparency}`);
    } else {
      vevent.push('TRANSP:OPAQUE'); // Default to opaque (busy)
    }

    if (
      event.priority !== undefined &&
      event.priority >= 0 &&
      event.priority <= 9
    ) {
      vevent.push(`PRIORITY:${event.priority}`);
    }

    // Add classification
    vevent.push('CLASS:PUBLIC');

    // Add sequence number (for updates)
    vevent.push('SEQUENCE:0');

    vevent.push('END:VEVENT');

    return vevent;
  }

  /**
   * Format date/time for iCal (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ for UTC)
   */
  private formatDateTime(date: Date, timezone: string = 'UTC'): string {
    if (timezone === 'UTC') {
      return this.formatDateTimeUTC(date);
    }

    // For non-UTC timezones, format as local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  /**
   * Format date/time in UTC for iCal
   */
  private formatDateTimeUTC(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Escape special characters in iCal text fields
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/;/g, '\\;') // Escape semicolons
      .replace(/,/g, '\\,') // Escape commas
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '') // Remove carriage returns
      .trim();
  }

  /**
   * Validate iCal event data
   */
  validateEvent(event: iCalEvent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.uid || event.uid.trim().length === 0) {
      errors.push('Event UID is required');
    }

    if (!event.title || event.title.trim().length === 0) {
      errors.push('Event title is required');
    }

    if (
      !event.startTime ||
      !(event.startTime instanceof Date) ||
      isNaN(event.startTime.getTime())
    ) {
      errors.push('Valid start time is required');
    }

    if (
      !event.endTime ||
      !(event.endTime instanceof Date) ||
      isNaN(event.endTime.getTime())
    ) {
      errors.push('Valid end time is required');
    }

    if (event.startTime && event.endTime && event.startTime >= event.endTime) {
      errors.push('End time must be after start time');
    }

    if (
      event.priority !== undefined &&
      (event.priority < 0 || event.priority > 9)
    ) {
      errors.push('Priority must be between 0 and 9');
    }

    if (
      event.organizer &&
      (!event.organizer.email || !this.isValidEmail(event.organizer.email))
    ) {
      errors.push('Organizer email must be valid');
    }

    if (event.attendees) {
      for (let i = 0; i < event.attendees.length; i++) {
        const attendee = event.attendees[i];
        if (!attendee.email || !this.isValidEmail(attendee.email)) {
          errors.push(`Attendee ${i + 1} email must be valid`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get calendar statistics
   */
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
    const now = new Date();

    const [
      totalEvents,
      upcomingEvents,
      pastEvents,
      eventsIncludedInCalendar,
      nextEvent,
    ] = await Promise.all([
      this.programEventRepository.count(),
      this.programEventRepository.count({
        where: {
          startTime: { $gte: now } as any,
        },
      }),
      this.programEventRepository.count({
        where: {
          startTime: { $lt: now } as any,
        },
      }),
      this.programEventRepository.count({
        where: { includeInCalendar: true },
      }),
      this.programEventRepository.findOne({
        where: {
          startTime: { $gte: now } as any,
        },
        order: { startTime: 'ASC' },
      }),
    ]);

    const stats = {
      totalEvents,
      upcomingEvents,
      pastEvents,
      eventsIncludedInCalendar,
    };

    if (nextEvent) {
      return {
        ...stats,
        nextEvent: {
          title: nextEvent.title,
          startTime: nextEvent.startTime,
          location: nextEvent.location,
        },
      };
    }

    return stats;
  }
}
