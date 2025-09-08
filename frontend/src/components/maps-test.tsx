'use client';

import { useEffect, useState } from 'react';
import { AccommodationMap, VenueMap, mapsService } from './maps';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Test data
const testAccommodations = [
  {
    id: '1',
    name: 'Hotel Test 1',
    description: 'A beautiful hotel in the heart of the city',
    address: '123 Main Street, Paris, France',
    contactInfo: '+33 1 23 45 67 89',
    priceRange: '€150-200/night',
    isRecommended: true,
    displayOrder: 1,
    latitude: 48.8566,
    longitude: 2.3522,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Hotel Test 2',
    description: 'Another great accommodation option',
    address: '456 Oak Avenue, Paris, France',
    contactInfo: '+33 1 98 76 54 32',
    priceRange: '€100-150/night',
    isRecommended: false,
    displayOrder: 2,
    latitude: 48.8606,
    longitude: 2.3376,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const testWeddingInfo = {
  weddingAddress:
    'Château de Malmaison, Avenue du Château, 92500 Rueil-Malmaison, France',
  weddingDate: '2024-06-15T14:00:00Z',
  coupleNames: 'Ariane & Timothe',
  locationDirections: 'Take the A86 highway and exit at Rueil-Malmaison.',
  latitude: 48.8706,
  longitude: 2.1676,
};

export default function MapsTest() {
  const [mapsStatus, setMapsStatus] = useState<string>('Checking...');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    checkMapsStatus();
  }, []);

  const checkMapsStatus = async () => {
    try {
      setMapsStatus('Initializing Google Maps...');
      const initialized = await mapsService.initialize();

      if (initialized) {
        setMapsStatus('✅ Google Maps initialized successfully!');
        setIsInitialized(true);
      } else {
        setMapsStatus('❌ Failed to initialize Google Maps');
      }
    } catch (error) {
      setMapsStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Google Maps Integration Test
        </h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Status:</h2>
            <p className="text-sm">{mapsStatus}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Configuration:</h2>
            <div className="text-sm space-y-1">
              <p>
                API Key:{' '}
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  ? '✅ Set'
                  : '❌ Not set'}
              </p>
              <p>Environment: {process.env.NODE_ENV}</p>
            </div>
          </div>

          <Button onClick={checkMapsStatus} variant="outline">
            Recheck Status
          </Button>
        </div>
      </Card>

      {isInitialized && (
        <>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Accommodation Map Test
            </h2>
            <AccommodationMap
              accommodations={testAccommodations}
              weddingLocation={{
                address: testWeddingInfo.weddingAddress,
                latitude: testWeddingInfo.latitude,
                longitude: testWeddingInfo.longitude,
              }}
              height="400px"
              showDirections={true}
              showDetails={true}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Venue Map Test</h2>
            <VenueMap
              weddingInfo={testWeddingInfo}
              height="400px"
              showDirections={true}
              showDetails={true}
            />
          </Card>
        </>
      )}
    </div>
  );
}
