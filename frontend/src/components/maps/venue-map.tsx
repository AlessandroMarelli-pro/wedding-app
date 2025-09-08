'use client';

import { Calendar, Clock, MapPin, Navigation } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { mapsService } from '../../services/maps.service';

import { Badge, Button, Card } from '@/components/ui';
interface VenueMapProps {
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

interface NearbyPlace {
  name: string;
  address: string;
  distance: string;
  type: string;
}

const VenueMap: React.FC<VenueMapProps> = ({
  weddingInfo,
  className = '',
  height = '400px',
  showDirections = true,
  showDetails = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
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

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: venuePosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
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

      // Create info window
      const infoWindow = new google.maps.InfoWindow();
      infoWindowRef.current = infoWindow;

      // Add click listener to marker
      marker.addListener('click', () => {
        const content = createVenueInfoWindowContent();
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      // Search for nearby places
      await searchNearbyPlaces(venuePosition);

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing venue map:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map');
      setIsLoading(false);
    }
  }, [weddingInfo]);

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

  // Search for nearby places
  const searchNearbyPlaces = async (venuePosition: {
    lat: number;
    lng: number;
  }) => {
    try {
      const places = await mapsService.searchPlaces(
        'hotel restaurant parking',
        venuePosition,
        2000, // 2km radius
      );

      const nearbyPlacesData: NearbyPlace[] = places
        .slice(0, 5)
        .map((place) => ({
          name: place.name,
          address: place.formatted_address,
          distance: 'Nearby', // We could calculate actual distance
          type: 'Place',
        }));

      setNearbyPlaces(nearbyPlacesData);
    } catch (error) {
      console.error('Error searching nearby places:', error);
    }
  };

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        // Add user location marker
        if (mapInstanceRef.current) {
          const userMarker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: mapInstanceRef.current,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
        alert('Unable to get your location');
      },
    );
  }, []);

  // Get directions to venue
  const getDirectionsToVenue = useCallback(async () => {
    if (!userLocation) {
      alert('Please enable location access first');
      return;
    }

    try {
      const directionsResult = await mapsService.getDirections({
        origin: userLocation,
        destination: weddingInfo.weddingAddress,
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
        setDirectionsResult(directionsResult as google.maps.DirectionsResult);
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      alert('Failed to get directions');
    }
  }, [userLocation, weddingInfo.weddingAddress, directionsRenderer]);

  // Clear directions
  const clearDirections = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
      setDirectionsResult(null);
    }
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
          <h3 className="font-semibold">Unable to load venue map</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Button onClick={initializeMap} variant="outline" size="sm">
          Try Again
        </Button>
      </Card>
    );
  }

  const weddingDate = new Date(weddingInfo.weddingDate);
  const formattedDate = weddingDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
                <p className="text-sm text-gray-600">Loading venue map...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Wedding Details */}
      {showDetails && (
        <Card className="p-4">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">💒</div>
            <h3 className="font-bold text-xl text-red-600">
              {weddingInfo.coupleNames}
            </h3>
            <p className="text-gray-600">Mariage</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{formattedDate}</p>
                <p className="text-sm text-gray-500">Date du mariage</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">{weddingInfo.weddingAddress}</p>
                <p className="text-sm text-gray-500">Lieu du mariage</p>
              </div>
            </div>

            {weddingInfo.locationDirections && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Directions</h4>
                <p className="text-sm text-blue-800">
                  {weddingInfo.locationDirections}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Location Controls */}
      {showDirections && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">Get Directions</h3>
          <div className="space-y-2">
            <Button
              onClick={getUserLocation}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {userLocation ? 'Update My Location' : 'Use My Location'}
            </Button>

            {userLocation && (
              <Button
                onClick={getDirectionsToVenue}
                className="w-full flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Directions to Venue
              </Button>
            )}

            {directionsResult && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    {directionsResult.routes[0]?.legs[0]?.duration?.text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {directionsResult.routes[0]?.legs[0]?.distance?.text}
                  </span>
                </div>
                <Button
                  onClick={clearDirections}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Clear Route
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Nearby Places */}
      {nearbyPlaces.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">Nearby Places</h3>
          <div className="space-y-2">
            {nearbyPlaces.map((place, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{place.name}</p>
                  <p className="text-xs text-gray-500">{place.address}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {place.distance}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VenueMap;
