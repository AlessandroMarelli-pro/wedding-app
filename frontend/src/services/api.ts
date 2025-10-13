import { logger } from '@/logger';
import { ProgramEvent } from '@prisma/client';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
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
// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  // Use relative URLs - the Next.js API proxy will handle routing to the backend
  const baseURL = `${baseApiUrl}/api`;
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available (for client-side only)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminToken');
          if (
            window.location.pathname.startsWith('/admin') &&
            window.location.pathname !== '/admin/login'
          ) {
            window.location.href = '/admin/login';
          }
        }
      }

      // Log error for debugging
      logger.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
      return Promise.reject(error);
    },
  );

  return client;
};

const api = createApiClient();

// API service class
export class ApiService {
  // Authentication
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  static async getCurrentUser(): Promise<CurrentUser> {
    const response = await api.get<CurrentUser>('/admin/current-user');
    return response.data;
  }

  // Public Wedding Information
  static async getWeddingInfo(): Promise<WeddingInfo> {
    const response = await api.get<WeddingInfo>('/wedding');
    return response.data;
  }

  // Public Programs
  static async getPrograms(): Promise<ProgramEvent[]> {
    const response = await api.get<ProgramEvent[]>('/programs');
    return response.data;
  }
  // Public Accommodations
  static async getAccommodations(): Promise<Accommodation[]> {
    const response = await api.get<Accommodation[]>('/accommodations');

    return response.data;
  }

  static async getRecommendedAccommodations(): Promise<Accommodation[]> {
    const response = await api.get<Accommodation[]>(
      '/accommodations/recommended',
    );
    return response.data;
  }

  // Public RSVP
  static async submitRSVP(rsvpRequest: RSVPRequest): Promise<RSVPResponse> {
    const response = await api.post<RSVPResponse>('/rsvp', rsvpRequest);
    return response.data;
  }

  static async checkRSVPStatus(
    hashCode: string,
  ): Promise<{ confirmed: boolean }> {
    const response = await api.get<{ confirmed: boolean }>(
      `/rsvp/check/${hashCode}`,
    );
    return response.data;
  }

  // Admin Wedding Management
  static async updateWeddingInfo(
    weddingInfo: Partial<WeddingInfo>,
  ): Promise<WeddingInfo> {
    const response = await api.put<WeddingInfo>('/admin/wedding', weddingInfo);
    return response.data;
  }

  // Admin Accommodation Management
  static async createAccommodation(
    accommodation: Omit<Accommodation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Accommodation> {
    const response = await api.post<Accommodation>(
      '/admin/accommodations',
      accommodation,
    );
    return response.data;
  }

  static async updateAccommodation(
    id: string,
    accommodation: Partial<Accommodation>,
  ): Promise<Accommodation> {
    const response = await api.put<Accommodation>(
      `/admin/accommodations/${id}`,
      accommodation,
    );
    return response.data;
  }

  static async deleteAccommodation(id: string): Promise<void> {
    await api.delete(`/admin/accommodations/${id}`);
  }

  static async reorderAccommodations(
    accommodationIds: string[],
  ): Promise<void> {
    await api.put('/admin/accommodations/reorder', { accommodationIds });
  }

  // Admin Guest Management
  static async uploadGuestCSV(file: File): Promise<CSVUpload> {
    const formData = new FormData();
    formData.append('file', file);

    // Use the upload proxy for file uploads
    const response = await api.post<CSVUpload>(
      '/admin/guests/uploads',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }

  static async getAllGuests(): Promise<Guest[]> {
    const response = await api.get<Guest[]>('/admin/guests');
    return response.data;
  }

  static async getCSVUploads(): Promise<CSVUpload[]> {
    const response = await api.get<CSVUpload[]>('/admin/guests/uploads');
    return response.data;
  }

  static async getCSVUpload(id: string): Promise<CSVUpload> {
    const response = await api.get<CSVUpload>(`/admin/guests/uploads/${id}`);
    return response.data;
  }

  static async getGuestsByUpload(uploadId: string): Promise<Guest[]> {
    const response = await api.get<Guest[]>(
      `/admin/guests/uploads/${uploadId}/guests`,
    );
    return response.data;
  }

  static async deleteGuest(id: string): Promise<void> {
    await api.delete(`/admin/guests/${id}`);
  }

  static async deleteGuestsByUpload(uploadId: string): Promise<void> {
    await api.delete(`/admin/guests/uploads/${uploadId}/guests`);
  }

  // Admin RSVP Management
  static async getRSVPStats(): Promise<RSVPStats> {
    const response = await api.get<RSVPStats>('/admin/rsvp/stats');
    return response.data;
  }

  static async getAllConfirmations(): Promise<RSVPConfirmation[]> {
    const response = await api.get<RSVPConfirmation[]>(
      '/admin/rsvp/confirmations',
    );
    return response.data;
  }

  static async getConfirmedGuests(): Promise<
    Array<{ guestName: string; confirmedAt: string; email?: string }>
  > {
    const response = await api.get<
      Array<{ guestName: string; confirmedAt: string; email?: string }>
    >('/admin/rsvp/confirmed');
    return response.data;
  }

  static async getPendingGuests(): Promise<
    Array<{ guestName: string; hashCode: string; email?: string }>
  > {
    const response = await api.get<
      Array<{ guestName: string; hashCode: string; email?: string }>
    >('/admin/rsvp/pending');
    return response.data;
  }

  static async getRecentConfirmations(
    limit: number = 10,
  ): Promise<RSVPConfirmation[]> {
    const response = await api.get<RSVPConfirmation[]>(
      `/admin/rsvp/recent?limit=${limit}`,
    );
    return response.data;
  }

  static async deleteConfirmation(id: string): Promise<void> {
    await api.delete(`/admin/rsvp/confirmations/${id}`);
  }

  // Analytics and Reporting
  static async getRSVPAnalytics(): Promise<RSVPAnalytics> {
    const response = await api.get<RSVPAnalytics>('/admin/analytics/rsvp');
    return response.data;
  }

  static async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>(
      '/admin/analytics/dashboard',
    );
    return response.data;
  }

  static async getUploadAnalytics(): Promise<UploadAnalytics> {
    const response = await api.get<UploadAnalytics>('/admin/analytics/uploads');
    return response.data;
  }

  static async getGuestExportData(): Promise<GuestExportData[]> {
    const response = await api.get<GuestExportData[]>(
      '/admin/guests/export/data',
    );
    return response.data;
  }

  static async exportGuestsCSV(): Promise<Blob> {
    const response = await api.get('/admin/guests/export', {
      responseType: 'blob',
    });
    return response.data;
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

    // Use the upload proxy for file uploads
    const response = await api.post('/admin/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getPublicImages(usageLocation?: string): Promise<any[]> {
    const params = usageLocation ? { usageLocation } : {};
    const response = await api.get('/images', { params });
    return response.data;
  }

  static async getImages(usageLocation?: string): Promise<any[]> {
    const params = usageLocation ? { usageLocation } : {};
    const response = await api.get('/admin/images', { params });
    return response.data;
  }

  static async getPublicImageById(id: string): Promise<any> {
    const response = await api.get(`/admin/images/${id}`);
    return response.data;
  }

  static async getImageById(id: string): Promise<any> {
    const response = await api.get(`/admin/images/${id}`);
    return response.data;
  }

  static async updateImageMetadata(
    id: string,
    data: { altText?: string; usageLocation?: string },
  ): Promise<any> {
    const response = await api.put(`/admin/images/${id}`, data);
    return response.data;
  }

  static async deleteImage(id: string): Promise<void> {
    await api.delete(`/admin/images/${id}`);
  }

  // Utility methods
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get('/health');
      return response.data;
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
}

// Export the configured axios instance for custom requests
export { api };
export default ApiService;
