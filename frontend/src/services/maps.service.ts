import {
  getMapsConfig,
  logMapsConfigStatus,
  validateMapsConfig,
} from '../lib/maps-config';
import { Accommodation } from '../types/api';

// Google Maps API types
export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
  region?: string;
  language?: string;
}

export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface DirectionsRequest {
  origin: string | { lat: number; lng: number };
  destination: string | { lat: number; lng: number };
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  avoidHighways?: boolean;
  avoidTolls?: boolean;
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      steps: Array<{
        html_instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }>;
    }>;
  }>;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  website?: string;
  phone_number?: string;
}

// Google Maps service class
export class MapsService {
  private static instance: MapsService;
  private googleMaps: typeof google | null = null;
  private mapsLoaded = false;
  private config: GoogleMapsConfig;

  constructor() {
    this.config = getMapsConfig();

    // Log configuration status in development
    if (process.env.NODE_ENV === 'development') {
      logMapsConfigStatus();
    }
  }

  static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  /**
   * Initialize Google Maps API
   */
  async initialize(): Promise<boolean> {
    if (this.mapsLoaded) {
      return true;
    }

    const validation = validateMapsConfig();
    if (!validation.isValid) {
      console.error('Google Maps configuration invalid:', validation.errors);
      return false;
    }

    try {
      // Check if Google Maps is already loaded
      if (
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps
      ) {
        this.googleMaps = window.google;
        this.mapsLoaded = true;
        return true;
      }

      // Load Google Maps API
      await this.loadGoogleMapsScript();

      // Wait for Google Maps to be available
      await this.waitForGoogleMaps();

      this.googleMaps = window.google;
      this.mapsLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      return false;
    }
  }

  /**
   * Load Google Maps script dynamically
   */
  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(
          new Error('Google Maps can only be loaded in browser environment'),
        );
        return;
      }

      // Check if script is already loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      );
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.apiKey}&libraries=${this.config.libraries.join(',')}&region=${this.config.region}&language=${this.config.language}`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load Google Maps script'));

      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Google Maps API to be available
   */
  private waitForGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = 10000; // 10 seconds timeout
      const startTime = Date.now();

      const checkGoogleMaps = () => {
        if (
          typeof window !== 'undefined' &&
          window.google &&
          window.google.maps
        ) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for Google Maps API'));
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };

      checkGoogleMaps();
    });
  }

  /**
   * Convert accommodations to map markers
   */
  async convertAccommodationsToMarkers(
    accommodations: Accommodation[],
  ): Promise<MapMarker[]> {
    return Promise.all(
      accommodations.map(async (acc) => {
        const geocoded = await mapsService.geocodeAddress(acc.address);
        if (!geocoded) {
          throw new Error('Could not find wedding venue location');
        }
        return {
          id: acc.id,
          position: {
            lat: geocoded.lat!,
            lng: geocoded.lng!,
          },
          title: acc.name,
          description: acc.description,
          color: acc.isRecommended ? '#10b981' : '#6b7280', // Green for recommended, gray for others
        };
      }),
    );
  }

  /**
   * Calculate bounds to fit all markers
   */
  calculateBounds(markers: MapMarker[]): MapBounds | null {
    if (markers.length === 0) return null;

    const lats = markers.map((m) => m.position.lat);
    const lngs = markers.map((m) => m.position.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }

  /**
   * Calculate center point from markers
   */
  calculateCenter(markers: MapMarker[]): MapCenter | null {
    if (markers.length === 0) return null;

    const totalLat = markers.reduce(
      (sum, marker) => sum + marker.position.lat,
      0,
    );
    const totalLng = markers.reduce(
      (sum, marker) => sum + marker.position.lng,
      0,
    );

    return {
      lat: totalLat / markers.length,
      lng: totalLng / markers.length,
    };
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    if (!this.mapsLoaded || !this.googleMaps) {
      throw new Error('Google Maps not initialized');
    }

    const geocoder = new this.googleMaps.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    request: DirectionsRequest,
  ): Promise<DirectionsResult | null> {
    if (!this.mapsLoaded || !this.googleMaps) {
      throw new Error('Google Maps not initialized');
    }

    const directionsService = new this.googleMaps.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: request.origin,
          destination: request.destination,
          travelMode:
            this.googleMaps.maps.TravelMode[request.travelMode || 'DRIVING'],
          avoidHighways: request.avoidHighways || false,
          avoidTolls: request.avoidTolls || false,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result as DirectionsResult);
          } else {
            reject(new Error(`Directions failed: ${status}`));
          }
        },
      );
    });
  }

  /**
   * Search for places near a location
   */
  async searchPlaces(
    query: string,
    location: { lat: number; lng: number },
    radius: number = 5000,
  ): Promise<PlaceDetails[]> {
    if (!this.mapsLoaded || !this.googleMaps) {
      throw new Error('Google Maps not initialized');
    }

    const placesService = new this.googleMaps.maps.places.PlacesService(
      document.createElement('div'), // Dummy div for PlacesService
    );

    return new Promise((resolve, reject) => {
      const request = {
        query,
        location: new this.googleMaps.maps.LatLng(location.lat, location.lng),
        radius,
      };

      placesService.textSearch(request, (results, status) => {
        if (
          status === this.googleMaps.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          const placeDetails = results.map((place) => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            photos: place.photos?.map((photo) => ({
              photo_reference: photo.getUrl({ maxWidth: 400 }),
              height: photo.height,
              width: photo.width,
            })),
          }));
          resolve(placeDetails);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.mapsLoaded || !this.googleMaps) {
      throw new Error('Google Maps not initialized');
    }

    const placesService = new this.googleMaps.maps.places.PlacesService(
      document.createElement('div'), // Dummy div for PlacesService
    );

    return new Promise((resolve, reject) => {
      const request = {
        placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'photos',
          'opening_hours',
          'website',
          'phone_number',
        ],
      };

      placesService.getDetails(request, (place, status) => {
        if (
          status === this.googleMaps.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          resolve({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            photos: place.photos?.map((photo) => ({
              photo_reference: photo.getUrl({ maxWidth: 400 }),
              height: photo.height,
              width: photo.width,
            })),
            opening_hours: place.opening_hours
              ? {
                  open_now: place.opening_hours.open_now,
                  weekday_text: place.opening_hours.weekday_text,
                }
              : undefined,
            website: place.website,
            phone_number: place.formatted_phone_number,
          });
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  /**
   * Check if Google Maps is available
   */
  isAvailable(): boolean {
    return this.mapsLoaded && !!this.googleMaps;
  }

  /**
   * Get configuration
   */
  getConfig(): GoogleMapsConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const mapsService = MapsService.getInstance();
export default mapsService;
