// Wedding Information
export interface WeddingInfo {
  id: string;
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: string;
  locationDirections: string;
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
