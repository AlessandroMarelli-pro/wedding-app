'use client';

import { MapPin, Navigation } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { mapsService } from '../../services/maps.service';
import { Accommodation } from '../../types/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button-pers';
import { Card } from '../ui/card';

interface AccommodationMapProps {
  accommodations: Accommodation[];
  weddingInfo: {
    weddingAddress: string;
    weddingDate: string;
    coupleNames: string;
    locationDirections?: string;
    latitude?: number;
    longitude?: number;
  };
  className?: string;
  height?: string;
  showDirections?: boolean;
  showDetails?: boolean;
}

interface SelectedAccommodation extends Accommodation {
  distance?: string;
  duration?: string;
}

const AccommodationMap: React.FC<AccommodationMapProps> = ({
  accommodations,
  weddingInfo,
  className = '',
  height = '400px',
  showDirections = true,
  showDetails = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<SelectedAccommodation | null>(null);
  const [directionsResult, setDirectionsResult] =
    useState<google.maps.DirectionsResult | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Initialize Google Maps service
      const initialized = await mapsService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Maps');
      }

      const google = window.google;
      if (!google) {
        throw new Error('Google Maps not available');
      }

      // Convert accommodations to markers
      const markers =
        await mapsService.convertAccommodationsToMarkers(accommodations);

      // Calculate map bounds and center
      const bounds = mapsService.calculateBounds(markers);

      let venuePosition: { lat: number; lng: number };
      // Use provided coordinates or geocode the address

      if (weddingInfo.latitude && weddingInfo.longitude) {
        venuePosition = {
          lat: weddingInfo.latitude,
          lng: weddingInfo.longitude,
        };
      } else {
        const geocoded = await mapsService.geocodeAddress(
          weddingInfo.weddingAddress,
        );
        if (!geocoded) {
          throw new Error('Could not find wedding venue location');
        }
        venuePosition = geocoded;
      }
      const center = {
        lat: venuePosition.lat,
        lng: venuePosition.lng,
      }; // Default to Paris
      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;
      // Create venue marker
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(venuePosition.lat, venuePosition.lng),
        map,
        title: 'Wedding Venue',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      markerRef.current = marker;

      // Fit bounds if we have multiple accommodations
      if (bounds && markers.length > 1) {
        const googleBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds.south, bounds.west),
          new google.maps.LatLng(bounds.north, bounds.east),
        );
        map.fitBounds(googleBounds);
      }

      // Create info window
      const infoWindow = new google.maps.InfoWindow();
      infoWindowRef.current = infoWindow;
      // Add click listener to marker
      marker.addListener('click', () => {
        const content = createVenueInfoWindowContent();
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });
      // Create markers
      const googleMarkers: google.maps.Marker[] = [];

      markers.forEach((markerData) => {
        const accommodation = accommodations.find(
          (acc) => acc.id === markerData.id,
        );
        if (!accommodation) return;

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(
            markerData.position.lat,
            markerData.position.lng,
          ),
          map,
          title: markerData.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: markerData.color || '#6b7280',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedAccommodation(accommodation);

          const content = createInfoWindowContent(accommodation);
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });

        googleMarkers.push(marker);
      });

      markersRef.current = googleMarkers;

      // Add wedding location marker if provided
      // Use provided coordinates or geocode the address

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map');
      setIsLoading(false);
    }
  }, [accommodations, weddingInfo]);
  // Create venue info window content
  const createVenueInfoWindowContent = (): string => {
    const weddingDate = new Date(weddingInfo.weddingDate);
    const formattedDate = weddingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <div class="p-4 max-w-sm">
        <div class="text-center mb-3">
          <div class="text-2xl mb-1">💒</div>
          <h3 class="font-bold text-lg text-red-600">${weddingInfo.coupleNames}</h3>
          <p class="text-sm text-gray-600">Mariage</p>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 text-gray-500" />
            <span class="text-gray-700">${formattedDate}</span>
          </div>
          <div class="flex items-start gap-2">
            <MapPin class="w-4 h-4 text-gray-500 mt-0.5" />
            <span class="text-gray-700">${weddingInfo.weddingAddress}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Create info window content
  const createInfoWindowContent = (accommodation: Accommodation): string => {
    return `
      <div class="p-3 max-w-xs">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg text-gray-900">${accommodation.name}</h3>
          ${accommodation.isRecommended ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommandé</span>' : ''}
        </div>
        <p class="text-sm text-gray-600 mb-2">${accommodation.description}</p>
        <p class="text-sm text-gray-500 mb-2">📍 ${accommodation.address}</p>
        ${accommodation.priceRange ? `<p class="text-sm text-gray-500 mb-2">💰 ${accommodation.priceRange}</p>` : ''}
        ${accommodation.contactInfo ? `<p class="text-sm text-gray-500">📞 ${accommodation.contactInfo}</p>` : ''}
      </div>
    `;
  };

  // Get directions to selected accommodation
  const getDirections = useCallback(
    async (accommodation: Accommodation) => {
      if (!weddingInfo || !weddingInfo.weddingAddress) {
        alert('Wedding location not available for directions');
        return;
      }

      try {
        const directionsResult = await mapsService.getDirections({
          origin: weddingInfo.weddingAddress,
          destination: accommodation.address,
          travelMode: 'DRIVING',
        });

        if (directionsResult && mapInstanceRef.current) {
          // Clear previous directions
          if (directionsRenderer) {
            directionsRenderer.setMap(null);
          }

          // Create new directions renderer
          const renderer = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#3b82f6',
              strokeWeight: 4,
            },
          });

          renderer.setDirections(
            directionsResult as google.maps.DirectionsResult,
          );
          renderer.setMap(mapInstanceRef.current);
          setDirectionsRenderer(renderer);

          // Update selected accommodation with distance/duration
          const leg = directionsResult.routes[0]?.legs[0];
          if (leg) {
            setSelectedAccommodation({
              ...accommodation,
              distance: leg.distance.text,
              duration: leg.duration.text,
            });
          }
        }
      } catch (error) {
        console.error('Error getting directions:', error);
        alert('Failed to get directions');
      }
    },
    [weddingInfo, directionsRenderer],
  );

  // Clear directions
  const clearDirections = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
    setSelectedAccommodation(null);
  }, [directionsRenderer]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [directionsRenderer]);

  if (error) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-red-600 mb-2">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-semibold">Unable to load map</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Button onClick={initializeMap} variant="outline" size="sm">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <Card className="overflow-hidden">
        <div className="relative">
          <div ref={mapRef} className="w-full" style={{ height }} />
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Selected Accommodation Details */}
      {selectedAccommodation && showDetails && (
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {selectedAccommodation.name}
                </h3>
                {selectedAccommodation.isRecommended && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Recommandé
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {selectedAccommodation.description}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                📍 {selectedAccommodation.address}
              </p>
              {selectedAccommodation.priceRange && (
                <p className="text-sm text-gray-500 mb-1">
                  💰 {selectedAccommodation.priceRange}
                </p>
              )}
              {selectedAccommodation.contactInfo && (
                <p className="text-sm text-gray-500 mb-2">
                  📞 {selectedAccommodation.contactInfo}
                </p>
              )}
              {selectedAccommodation.distance &&
                selectedAccommodation.duration && (
                  <div className="flex items-center gap-4 text-sm text-blue-600">
                    <span>🚗 {selectedAccommodation.distance}</span>
                    <span>⏱️ {selectedAccommodation.duration}</span>
                  </div>
                )}
            </div>
          </div>

          {showDirections && weddingInfo && (
            <div className="flex gap-2">
              <Button
                onClick={() => getDirections(selectedAccommodation)}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </Button>
              {directionsRenderer && (
                <Button onClick={clearDirections} size="sm" variant="outline">
                  Clear Route
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AccommodationMap;
