import { logger } from '@/logger';
import { ProgramEvent } from '@prisma/client';
import {
  Accommodation,
  CSVUpload,
  CurrentUser,
  DashboardSummary,
  Guest,
  GuestExportData,
  LoginRequest,
  LoginResponse,
  RSVPAnalytics,
  RSVPConfirmation,
  RSVPRequest,
  RSVPResponse,
  RSVPStats,
  UploadAnalytics,
  WeddingInfo,
} from '../types/api';

const baseApiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const baseURL = `${baseApiUrl}/api`;

// Custom fetch wrapper with auth and error handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit & {
    next?: { tags?: string[]; revalidate?: number };
  } = {},
): Promise<T> => {
  const url = `${baseURL}${endpoint}`;

  // Get auth token if available (client-side only)
  let headers: HeadersInit = {
    ...options.headers,
  };

  // Don't override cache-control for public endpoints (let server set it)
  if (endpoint === '/wedding' || endpoint === '/programs') {
    // Remove any cache-control headers for public endpoints
    delete (headers as any)['cache-control'];
    delete (headers as any)['Cache-Control'];
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers = {
      ...headers,
      'Content-Type': 'application/json',
    };
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // Extract Next.js specific options
  const { next, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // Add Next.js options if provided
  if (next) {
    (config as any).next = next;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 unauthorized
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        if (
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login'
        ) {
          window.location.href = '/admin/login';
        }
      }
      throw new Error('Unauthorized');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('API Error:', {
        url,
        method: options.method || 'GET',
        status: response.status,
        data: errorData,
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle different response types
    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    } else if (response.headers.get('content-type')?.includes('text/')) {
      return (await response.text()) as unknown as T;
    } else {
      return (await response.blob()) as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('API Request Error:', {
        url,
        method: options.method || 'GET',
        error: error.message,
      });
    }
    throw error;
  }
};

// API service class
export class ApiService {
  // Authentication
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async getCurrentUser(): Promise<CurrentUser> {
    return apiRequest<CurrentUser>('/admin/current-user');
  }

  // Public Wedding Information
  static async getWeddingInfo(): Promise<WeddingInfo> {
    const startTime = Date.now();
    logger.info('Fetching wedding info...');

    const result = await apiRequest<WeddingInfo>('/wedding', {
      // For client-side requests, we rely on HTTP caching
      // The API endpoint will set proper cache headers
    });

    const duration = Date.now() - startTime;
    logger.info(`Wedding info fetched in ${duration}ms`);

    return result;
  }

  // Public Programs
  static async getPrograms(): Promise<ProgramEvent[]> {
    const startTime = Date.now();
    logger.info('Fetching programs...');

    const result = await apiRequest<ProgramEvent[]>('/programs', {
      // For client-side requests, we rely on HTTP caching
      // The API endpoint will set proper cache headers
    });

    const duration = Date.now() - startTime;
    logger.info(`Programs fetched in ${duration}ms`);

    return result;
  }

  // Admin Program Management
  static async createProgramEvent(
    event: Omit<ProgramEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProgramEvent> {
    return apiRequest<ProgramEvent>('/admin/program', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  static async updateProgramEvent(
    id: string,
    event: Partial<ProgramEvent>,
  ): Promise<ProgramEvent> {
    return apiRequest<ProgramEvent>(`/admin/program/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  static async deleteProgramEvent(id: string): Promise<void> {
    await apiRequest<void>(`/admin/program/${id}`, {
      method: 'DELETE',
    });
  }

  // Public Accommodations
  static async getAccommodations(): Promise<Accommodation[]> {
    return apiRequest<Accommodation[]>('/accommodations');
  }

  static async getRecommendedAccommodations(): Promise<Accommodation[]> {
    return apiRequest<Accommodation[]>('/accommodations/recommended');
  }

  // Public RSVP
  static async submitRSVP(rsvpRequest: RSVPRequest): Promise<RSVPResponse> {
    return apiRequest<RSVPResponse>('/rsvp', {
      method: 'POST',
      body: JSON.stringify(rsvpRequest),
    });
  }

  static async checkRSVPStatus(
    hashCode: string,
  ): Promise<{ confirmed: boolean }> {
    return apiRequest<{ confirmed: boolean }>(`/rsvp/check/${hashCode}`);
  }

  // Admin Wedding Management
  static async updateWeddingInfo(
    weddingInfo: Partial<WeddingInfo>,
  ): Promise<WeddingInfo> {
    return apiRequest<WeddingInfo>('/admin/wedding', {
      method: 'PUT',
      body: JSON.stringify(weddingInfo),
    });
  }

  // Admin Accommodation Management
  static async createAccommodation(
    accommodation: Omit<Accommodation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Accommodation> {
    return apiRequest<Accommodation>('/admin/accommodations', {
      method: 'POST',
      body: JSON.stringify(accommodation),
    });
  }

  static async updateAccommodation(
    id: string,
    accommodation: Partial<Accommodation>,
  ): Promise<Accommodation> {
    return apiRequest<Accommodation>(`/admin/accommodations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accommodation),
    });
  }

  static async deleteAccommodation(id: string): Promise<void> {
    await apiRequest<void>(`/admin/accommodations/${id}`, {
      method: 'DELETE',
    });
  }

  static async reorderAccommodations(
    accommodationIds: string[],
  ): Promise<void> {
    await apiRequest<void>('/admin/accommodations/reorder', {
      method: 'PUT',
      body: JSON.stringify({ accommodationIds }),
    });
  }

  // Admin Guest Management
  static async uploadGuestCSV(file: File): Promise<CSVUpload> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<CSVUpload>('/admin/guests/uploads', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  static async getAllGuests(): Promise<Guest[]> {
    return apiRequest<Guest[]>('/admin/guests');
  }

  static async getCSVUploads(): Promise<CSVUpload[]> {
    return apiRequest<CSVUpload[]>('/admin/guests/uploads');
  }

  static async getCSVUpload(id: string): Promise<CSVUpload> {
    return apiRequest<CSVUpload>(`/admin/guests/uploads/${id}`);
  }

  static async getGuestsByUpload(uploadId: string): Promise<Guest[]> {
    return apiRequest<Guest[]>(`/admin/guests/uploads/${uploadId}/guests`);
  }

  static async deleteGuest(id: string): Promise<void> {
    await apiRequest<void>(`/admin/guests/${id}`, {
      method: 'DELETE',
    });
  }

  static async deleteGuestsByUpload(uploadId: string): Promise<void> {
    await apiRequest<void>(`/admin/guests/uploads/${uploadId}/guests`, {
      method: 'DELETE',
    });
  }

  // Admin RSVP Management
  static async getRSVPStats(): Promise<RSVPStats> {
    return apiRequest<RSVPStats>('/admin/rsvp/stats');
  }

  static async getAllConfirmations(): Promise<RSVPConfirmation[]> {
    return apiRequest<RSVPConfirmation[]>('/admin/rsvp/confirmations');
  }

  static async getConfirmedGuests(): Promise<
    Array<{ guestName: string; confirmedAt: string; email?: string }>
  > {
    return apiRequest<
      Array<{ guestName: string; confirmedAt: string; email?: string }>
    >('/admin/rsvp/confirmed');
  }

  static async getPendingGuests(): Promise<
    Array<{ guestName: string; hashCode: string; email?: string }>
  > {
    return apiRequest<
      Array<{ guestName: string; hashCode: string; email?: string }>
    >('/admin/rsvp/pending');
  }

  static async getRecentConfirmations(
    limit: number = 10,
  ): Promise<RSVPConfirmation[]> {
    return apiRequest<RSVPConfirmation[]>(`/admin/rsvp/recent?limit=${limit}`);
  }

  static async deleteConfirmation(id: string): Promise<void> {
    await apiRequest<void>(`/admin/rsvp/confirmations/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics and Reporting
  static async getRSVPAnalytics(): Promise<RSVPAnalytics> {
    return apiRequest<RSVPAnalytics>('/admin/analytics/rsvp');
  }

  static async getDashboardSummary(): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>('/admin/analytics/dashboard');
  }

  static async getUploadAnalytics(): Promise<UploadAnalytics> {
    return apiRequest<UploadAnalytics>('/admin/analytics/uploads');
  }

  static async getGuestExportData(): Promise<GuestExportData[]> {
    return apiRequest<GuestExportData[]>('/admin/guests/export/data');
  }

  static async exportGuestsCSV(): Promise<Blob> {
    return apiRequest<Blob>('/admin/guests/export');
  }

  // Image Management
  static async uploadImage(
    file: File,
    options: {
      usageLocation: string;
      altText?: string;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    },
  ): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('usageLocation', options.usageLocation);

    if (options.altText) formData.append('altText', options.altText);
    if (options.maxWidth)
      formData.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight)
      formData.append('maxHeight', options.maxHeight.toString());
    if (options.quality) formData.append('quality', options.quality.toString());
    if (options.format) formData.append('format', options.format);

    return apiRequest<any>('/admin/images/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  static async getPublicImages(usageLocation?: string): Promise<any[]> {
    const url = usageLocation
      ? `/images?usageLocation=${encodeURIComponent(usageLocation)}`
      : '/images';
    return apiRequest<any[]>(url);
  }

  static async getImages(usageLocation?: string): Promise<any[]> {
    const url = usageLocation
      ? `/admin/images?usageLocation=${encodeURIComponent(usageLocation)}`
      : '/admin/images';
    return apiRequest<any[]>(url);
  }

  static async getPublicImageById(id: string): Promise<any> {
    return apiRequest<any>(`/admin/images/${id}`);
  }

  static async getImageById(id: string): Promise<any> {
    return apiRequest<any>(`/admin/images/${id}`);
  }

  static async updateImageMetadata(
    id: string,
    data: { altText?: string; usageLocation?: string },
  ): Promise<any> {
    return apiRequest<any>(`/admin/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteImage(id: string): Promise<void> {
    await apiRequest<void>(`/admin/images/${id}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await apiRequest<{ status: string; timestamp: string }>('/health');
    } catch (error) {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('adminToken');
    return !!token;
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  }

  // Cache invalidation utility
  static async invalidateCacheTags(tags: string[]): Promise<void> {
    // This would typically be called from a Server Action or Route Handler
    // For now, we'll make a request to trigger cache invalidation
    try {
      await fetch(`${baseURL}/admin/cache/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' &&
          localStorage.getItem('adminToken')
            ? { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            : {}),
        },
        body: JSON.stringify({ tags }),
      });
    } catch (error) {
      logger.error('Failed to invalidate cache tags:', {
        error: error as Error,
        tags,
      });
    }
  }
}

export default ApiService;
