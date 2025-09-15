import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CSVUpload, UploadStatus } from '../entities/csv-upload.entity';
import { Guest } from '../entities/guest.entity';
import { RSVPConfirmation } from '../entities/rsvp-confirmation.entity';

export interface RSVPAnalytics {
  overview: {
    totalGuests: number;
    totalInvited: number;
    totalConfirmed: number;
    totalDeclined: number;
    totalPending: number;
    responseRate: number;
    attendanceRate: number;
  };
  attendance: {
    totalExpectedAttendees: number;
    confirmedAttendees: number;
    averagePartySize: number;
    partySizeDistribution: { [size: number]: number };
  };
  timeline: {
    dailyResponses: Array<{
      date: string;
      confirmed: number;
      declined: number;
      total: number;
    }>;
    weeklyResponses: Array<{
      week: string;
      confirmed: number;
      declined: number;
      total: number;
    }>;
    monthlyResponses: Array<{
      month: string;
      confirmed: number;
      declined: number;
      total: number;
    }>;
  };
  demographics: {
    dietaryRestrictions: Array<{
      restriction: string;
      count: number;
      percentage: number;
    }>;
    specialRequests: Array<{
      request: string;
      count: number;
    }>;
    phoneNumberProvided: {
      count: number;
      percentage: number;
    };
    emailProvided: {
      count: number;
      percentage: number;
    };
  };
  recentActivity: Array<{
    guestName: string;
    action: 'confirmed' | 'declined';
    confirmedPartySize?: number;
    message?: string;
    timestamp: Date;
  }>;
}

export interface GuestExportData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  partySize: number;
  dietaryRestrictions?: string;
  specialRequests?: string;
  hashCode: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  confirmedPartySize?: number;
  rsvpMessage?: string;
  rsvpDate?: Date;
  createdAt: Date;
}

export interface UploadAnalytics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalGuestsImported: number;
  averageGuestsPerUpload: number;
  uploadHistory: Array<{
    filename: string;
    uploadDate: Date;
    status: UploadStatus;
    totalRows: number;
    processedRows: number;
    errorRows: number;
  }>;
  errorAnalysis: {
    commonErrors: Array<{
      errorType: string;
      count: number;
      percentage: number;
    }>;
    errorTrends: Array<{
      date: string;
      errorCount: number;
    }>;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    @InjectRepository(RSVPConfirmation)
    private readonly rsvpConfirmationRepository: Repository<RSVPConfirmation>,
    @InjectRepository(CSVUpload)
    private readonly csvUploadRepository: Repository<CSVUpload>,
  ) {}

  /**
   * Get comprehensive RSVP analytics
   */
  async getRSVPAnalytics(): Promise<RSVPAnalytics> {
    const [guests, confirmations] = await Promise.all([
      this.guestRepository.find({
        relations: ['rsvpConfirmation'],
      }),
      this.rsvpConfirmationRepository.find({
        relations: ['guest'],
        order: { confirmedAt: 'DESC' },
      }),
    ]);

    // Overview statistics
    const totalGuests = guests.reduce(
      (sum, guest) => sum + (guest.partySize || 0),
      0,
    );
    const confirmedGuests = guests.filter(
      (g) => g.rsvpConfirmation?.isAttending === true,
    );
    const declinedGuests = guests.filter(
      (g) => g.rsvpConfirmation?.isAttending === false,
    );

    const pendingGuests = guests.filter((g) => !g.rsvpConfirmation);

    const totalConfirmed = confirmedGuests.reduce(
      (sum, guest) => sum + (guest.rsvpConfirmation?.confirmedPartySize || 0),
      0,
    );
    const totalDeclined = declinedGuests.reduce(
      (sum, guest) => sum + (guest.partySize || 0),
      0,
    );
    const totalPending = pendingGuests.reduce(
      (sum, guest) => sum + (guest.partySize || 0),
      0,
    );
    const totalResponded = totalConfirmed + totalDeclined;

    const responseRate = Math.round((totalResponded / totalGuests) * 1000) / 10;
    const attendanceRate =
      totalGuests > 0
        ? Math.round((totalConfirmed / totalGuests) * 1000) / 10
        : 0;

    // Attendance statistics
    const confirmedAttendees = confirmedGuests.reduce(
      (sum, guest) => sum + (guest.rsvpConfirmation?.confirmedPartySize || 0),
      0,
    );
    const totalExpectedAttendees = guests.reduce(
      (sum, guest) => sum + guest.partySize,
      0,
    );
    const averagePartySize =
      confirmedGuests.length > 0
        ? confirmedAttendees / confirmedGuests.length
        : 0;

    // Party size distribution
    const partySizeDistribution: { [size: number]: number } = {};
    confirmedGuests.forEach((guest) => {
      const size = guest.rsvpConfirmation?.confirmedPartySize || 0;
      partySizeDistribution[size] = (partySizeDistribution[size] || 0) + 1;
    });

    // Timeline analysis
    const timeline = await this.getResponseTimeline(confirmations);

    // Demographics analysis
    const demographics = this.analyzeDemographics(guests);

    // Recent activity
    const recentActivity = confirmations.map((confirmation) => ({
      guestName: `${confirmation.guest.firstName} ${confirmation.guest.lastName}`,
      action: confirmation.isAttending
        ? ('confirmed' as const)
        : ('declined' as const),
      confirmedPartySize: confirmation.confirmedPartySize,
      message: confirmation.message,
      timestamp: confirmation.confirmedAt,
    }));

    return {
      overview: {
        totalGuests,
        totalInvited: totalGuests,
        totalConfirmed,
        totalDeclined,
        totalPending,
        responseRate: Math.round(responseRate * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      attendance: {
        totalExpectedAttendees,
        confirmedAttendees,
        averagePartySize: Math.round(averagePartySize * 100) / 100,
        partySizeDistribution,
      },
      timeline,
      demographics,
      recentActivity,
    };
  }

  /**
   * Analyze response timeline
   */
  private async getResponseTimeline(confirmations: RSVPConfirmation[]) {
    const dailyResponses: {
      [date: string]: { confirmed: number; declined: number };
    } = {};
    const weeklyResponses: {
      [week: string]: { confirmed: number; declined: number };
    } = {};
    const monthlyResponses: {
      [month: string]: { confirmed: number; declined: number };
    } = {};

    confirmations.forEach((confirmation) => {
      const confirmedAt = new Date(confirmation.confirmedAt);
      const date = confirmedAt.toISOString().split('T')[0];
      const week = this.getWeekKey(confirmedAt);
      const month = this.getMonthKey(confirmedAt);

      // Daily
      if (!dailyResponses[date]) {
        dailyResponses[date] = { confirmed: 0, declined: 0 };
      }
      if (confirmation.isAttending) {
        dailyResponses[date].confirmed++;
      } else {
        dailyResponses[date].declined++;
      }

      // Weekly
      if (!weeklyResponses[week]) {
        weeklyResponses[week] = { confirmed: 0, declined: 0 };
      }
      if (confirmation.isAttending) {
        weeklyResponses[week].confirmed++;
      } else {
        weeklyResponses[week].declined++;
      }

      // Monthly
      if (!monthlyResponses[month]) {
        monthlyResponses[month] = { confirmed: 0, declined: 0 };
      }
      if (confirmation.isAttending) {
        monthlyResponses[month].confirmed++;
      } else {
        monthlyResponses[month].declined++;
      }
    });

    return {
      dailyResponses: Object.entries(dailyResponses)
        .map(([date, data]) => ({
          date,
          confirmed: data.confirmed,
          declined: data.declined,
          total: data.confirmed + data.declined,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      weeklyResponses: Object.entries(weeklyResponses)
        .map(([week, data]) => ({
          week,
          confirmed: data.confirmed,
          declined: data.declined,
          total: data.confirmed + data.declined,
        }))
        .sort((a, b) => a.week.localeCompare(b.week)),
      monthlyResponses: Object.entries(monthlyResponses)
        .map(([month, data]) => ({
          month,
          confirmed: data.confirmed,
          declined: data.declined,
          total: data.confirmed + data.declined,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Analyze guest demographics
   */
  private analyzeDemographics(guests: Guest[]) {
    // Dietary restrictions analysis
    const dietaryMap: { [key: string]: number } = {};
    const specialRequestsList: string[] = [];
    let phoneCount = 0;
    let emailCount = 0;

    guests.forEach((guest) => {
      // Count dietary restrictions
      if (guest.dietaryRestrictions) {
        const restrictions = guest.dietaryRestrictions
          .split(',')
          .map((r) => r.trim().toLowerCase())
          .filter((r) => r.length > 0);

        restrictions.forEach((restriction) => {
          dietaryMap[restriction] = (dietaryMap[restriction] || 0) + 1;
        });
      }

      // Collect special requests
      if (guest.specialRequests) {
        specialRequestsList.push(guest.specialRequests);
      }

      // Count contact info
      if (guest.phoneNumber) phoneCount++;
      if (guest.email) emailCount++;
    });

    const totalGuests = guests.length;
    const dietaryRestrictions = Object.entries(dietaryMap)
      .map(([restriction, count]) => ({
        restriction,
        count,
        percentage: Math.round((count / totalGuests) * 10000) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Analyze special requests (simple frequency count)
    const requestMap: { [key: string]: number } = {};
    specialRequestsList.forEach((request) => {
      const words = request.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.length > 3) {
          // Only count meaningful words
          requestMap[word] = (requestMap[word] || 0) + 1;
        }
      });
    });

    const specialRequests = Object.entries(requestMap)
      .map(([request, count]) => ({ request, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 most common words

    return {
      dietaryRestrictions,
      specialRequests,
      phoneNumberProvided: {
        count: phoneCount,
        percentage: Math.round((phoneCount / totalGuests) * 10000) / 100,
      },
      emailProvided: {
        count: emailCount,
        percentage: Math.round((emailCount / totalGuests) * 10000) / 100,
      },
    };
  }

  /**
   * Get guest data for CSV export
   */
  async getGuestExportData(): Promise<GuestExportData[]> {
    const guests = await this.guestRepository.find({
      relations: ['rsvpConfirmation'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return guests.map((guest) => ({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phoneNumber: guest.phoneNumber,
      partySize: guest.partySize,
      dietaryRestrictions: guest.dietaryRestrictions,
      specialRequests: guest.specialRequests,
      hashCode: guest.hashCode,
      rsvpStatus: guest.rsvpConfirmation
        ? guest.rsvpConfirmation.isAttending
          ? 'confirmed'
          : 'declined'
        : 'pending',
      confirmedPartySize: guest.rsvpConfirmation?.confirmedPartySize,
      rsvpMessage: guest.rsvpConfirmation?.message,
      rsvpDate: guest.rsvpConfirmation?.confirmedAt,
      createdAt: guest.createdAt,
    }));
  }

  /**
   * Generate CSV content from guest data
   */
  async generateGuestCSV(): Promise<string> {
    const guests = await this.getGuestExportData();

    // CSV headers
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone Number',
      'Party Size',
      'Dietary Restrictions',
      'Special Requests',
      'Hash Code',
      'RSVP Status',
      'Confirmed Party Size',
      'RSVP Message',
      'RSVP Date',
      'Added Date',
    ];

    // CSV rows
    const rows = guests.map((guest) => [
      guest.firstName,
      guest.lastName,
      guest.email || '',
      guest.phoneNumber || '',
      guest.partySize.toString(),
      guest.dietaryRestrictions || '',
      guest.specialRequests || '',
      guest.hashCode,
      guest.rsvpStatus,
      guest.confirmedPartySize?.toString() || '',
      guest.rsvpMessage || '',
      guest.rsvpDate ? guest.rsvpDate.toISOString() : '',
      guest.createdAt.toISOString(),
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            // Escape cells that contain commas, quotes, or newlines
            if (
              cell.includes(',') ||
              cell.includes('"') ||
              cell.includes('\n')
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(','),
      )
      .join('\n');

    return csvContent;
  }

  /**
   * Get upload analytics
   */
  async getUploadAnalytics(): Promise<UploadAnalytics> {
    const uploads = await this.csvUploadRepository.find({
      order: { createdAt: 'DESC' },
    });

    const totalUploads = uploads.length;
    const successfulUploads = uploads.filter(
      (u) => u.status === UploadStatus.COMPLETED,
    ).length;
    const failedUploads = uploads.filter(
      (u) => u.status === UploadStatus.FAILED,
    ).length;

    const totalGuestsImported = uploads.reduce(
      (sum, upload) => sum + upload.processedRows,
      0,
    );
    const averageGuestsPerUpload =
      totalUploads > 0
        ? Math.round((totalGuestsImported / totalUploads) * 100) / 100
        : 0;

    const uploadHistory = uploads.map((upload) => ({
      filename: upload.filename,
      uploadDate: upload.createdAt,
      status: upload.status as UploadStatus,
      totalRows: upload.totalRows,
      processedRows: upload.processedRows,
      errorRows: upload.errorRows,
    }));

    // Analyze errors from failed uploads
    const errorAnalysis = this.analyzeUploadErrors(uploads);

    return {
      totalUploads,
      successfulUploads,
      failedUploads,
      totalGuestsImported,
      averageGuestsPerUpload,
      uploadHistory,
      errorAnalysis,
    };
  }

  /**
   * Analyze upload errors
   */
  private analyzeUploadErrors(uploads: CSVUpload[]) {
    const errorCounts: { [errorType: string]: number } = {};
    const errorByDate: { [date: string]: number } = {};
    let totalErrors = 0;

    uploads.forEach((upload) => {
      if (upload.errorLog) {
        try {
          const errorData = JSON.parse(upload.errorLog);

          // Count errors by type
          if (errorData.detailedErrors) {
            errorData.detailedErrors.forEach((error: any) => {
              const errorType = error.code || 'UNKNOWN';
              errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
              totalErrors++;
            });
          }

          // Count errors by date
          const date = upload.createdAt.toISOString().split('T')[0];
          errorByDate[date] = (errorByDate[date] || 0) + upload.errorRows;
        } catch (error) {
          // Handle old format or malformed error logs
          errorCounts['PARSING_ERROR'] =
            (errorCounts['PARSING_ERROR'] || 0) + upload.errorRows;
          totalErrors += upload.errorRows;
        }
      }
    });

    const commonErrors = Object.entries(errorCounts)
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage:
          totalErrors > 0 ? Math.round((count / totalErrors) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const errorTrends = Object.entries(errorByDate)
      .map(([date, errorCount]) => ({ date, errorCount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      commonErrors,
      errorTrends,
    };
  }

  /**
   * Get analytics dashboard summary
   */
  async getDashboardSummary(): Promise<{
    totalGuests: number;
    responseRate: number;
    attendanceRate: number;
    confirmedAttendees: number;
    recentResponses: number;
    pendingInvitations: number;
  }> {
    const analytics = await this.getRSVPAnalytics();

    // Count recent responses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentResponses = analytics.recentActivity.filter(
      (activity) => activity.timestamp > sevenDaysAgo,
    ).length;

    return {
      totalGuests: analytics.overview.totalGuests,
      responseRate: analytics.overview.responseRate,
      attendanceRate: analytics.overview.attendanceRate,
      confirmedAttendees: analytics.attendance.confirmedAttendees,
      recentResponses,
      pendingInvitations: analytics.overview.totalPending,
    };
  }

  /**
   * Helper methods for date formatting
   */
  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
