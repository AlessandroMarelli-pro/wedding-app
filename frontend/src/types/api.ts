// Wedding Information
export interface WeddingInfo {
  id: string;
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: string;
  locationDirections: string;
  heroImageId?: string;
  createdAt: string;
  updatedAt: string;
}

// Accommodations
export interface Accommodation {
  id: string;
  name: string;
  description: string;
  address: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  isRecommended: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// RSVP
export interface RSVPRequest {
  hashCode: string;
}

export interface RSVPResponse {
  success: boolean;
  guestName: string;
  message: string;
  confirmedAt: string;
}

export interface RSVPStats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  confirmationRate: number;
}

// Program Events
export interface ProgramEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  displayOrder: number;
  includeInCalendar: boolean;
  createdAt: string;
  updatedAt: string;
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

// Admin
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  hashCode: string;
  csvUploadId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CSVUpload {
  id: string;
  filename: string;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorLog?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSVPConfirmation {
  id: string;
  hashCode: string;
  guestId: string;
  confirmedAt: string;
  ipAddress: string;
  userAgent?: string;
  guest?: Guest;
}

// Analytics
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
    timestamp: string;
  }>;
}

export interface DashboardSummary {
  totalGuests: number;
  responseRate: number;
  attendanceRate: number;
  confirmedAttendees: number;
  recentResponses: number;
  pendingInvitations: number;
}

export interface UploadAnalytics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalGuestsImported: number;
  averageGuestsPerUpload: number;
  uploadHistory: Array<{
    filename: string;
    uploadDate: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
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
  rsvpDate?: string;
  createdAt: string;
}
