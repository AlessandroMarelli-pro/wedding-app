'use client';

import { MapPin, Navigation } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { mapsService } from '../../services/maps.service';
import { Accommodation } from '../../types/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface AccommodationMapProps {
  accommodations: Accommodation[];
  weddingLocation?: {
    address: string;
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
  weddingLocation,
  className = '',
  height = '400px',
  showDirections = true,
  showDetails = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

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
        mapsService.convertAccommodationsToMarkers(accommodations);

      // Calculate map bounds and center
      const bounds = mapsService.calculateBounds(markers);
      const center = mapsService.calculateCenter(markers) || {
        lat: 48.8566,
        lng: 2.3522,
      }; // Default to Paris

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: bounds ? 12 : 10,
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
      if (
        weddingLocation &&
        weddingLocation.latitude &&
        weddingLocation.longitude
      ) {
        const weddingMarker = new google.maps.Marker({
          position: new google.maps.LatLng(
            weddingLocation.latitude,
            weddingLocation.longitude,
          ),
          map,
          title: 'Wedding Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        weddingMarker.addListener('click', () => {
          const content = `
            <div class="p-2">
              <h3 class="font-semibold text-lg text-red-600">💒 Wedding Location</h3>
              <p class="text-sm text-gray-600">${weddingLocation.address}</p>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(map, weddingMarker);
        });

        googleMarkers.push(weddingMarker);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map');
      setIsLoading(false);
    }
  }, [accommodations, weddingLocation]);

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
      if (!weddingLocation || !weddingLocation.address) {
        alert('Wedding location not available for directions');
        return;
      }

      try {
        const directionsResult = await mapsService.getDirections({
          origin: weddingLocation.address,
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

          renderer.setDirections(directionsResult);
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
    [weddingLocation, directionsRenderer],
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

          {showDirections && weddingLocation && (
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

      {/* Accommodations List */}
      {accommodations.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">
            Accommodations ({accommodations.length})
          </h3>
          <div className="space-y-2">
            {accommodations.map((accommodation) => (
              <div
                key={accommodation.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedAccommodation(accommodation)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{accommodation.name}</span>
                    {accommodation.isRecommended && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        Recommandé
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {accommodation.address}
                  </p>
                </div>
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AccommodationMap;
