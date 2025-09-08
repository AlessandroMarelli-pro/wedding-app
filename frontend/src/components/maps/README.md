# Google Maps Integration

This directory contains Google Maps integration components for the wedding website.

## Components

### AccommodationMap

Interactive map component for displaying accommodations with:

- Marker display for each accommodation
- Recommended accommodations highlighted in green
- Click to view accommodation details
- Directions from wedding venue
- Accommodation list with selection

### VenueMap

Wedding venue map component with:

- Wedding location marker
- Venue information display
- Directions from user's location
- Nearby places search
- Wedding details (date, couple names, address)

## Services

### MapsService

Singleton service for Google Maps functionality:

- Dynamic script loading
- Geocoding addresses
- Directions calculation
- Places search
- Configuration validation

## Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_REGION=FR
NEXT_PUBLIC_GOOGLE_MAPS_LANGUAGE=fr
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create API key credentials
5. Restrict key to your domain

## Usage

### Basic Usage

```tsx
import { AccommodationMap, VenueMap } from '@/components/maps';

// Accommodation map
<AccommodationMap
  accommodations={accommodations}
  weddingLocation={weddingInfo}
  height="400px"
  showDirections={true}
  showDetails={true}
/>

// Venue map
<VenueMap
  weddingInfo={weddingInfo}
  height="400px"
  showDirections={true}
  showDetails={true}
/>
```

### Service Usage

```tsx
import { mapsService } from '@/services/maps.service';

// Initialize maps
const initialized = await mapsService.initialize();

// Geocode address
const coords = await mapsService.geocodeAddress('123 Main St, Paris');

// Get directions
const directions = await mapsService.getDirections({
  origin: 'Paris',
  destination: 'Lyon',
  travelMode: 'DRIVING',
});
```

## Features

- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful fallbacks when maps fail to load
- **Performance**: Lazy loading and efficient marker management
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Internationalization**: French language support
- **Security**: API key validation and domain restrictions

## Dependencies

- Google Maps JavaScript API
- React 19+
- TypeScript
- Tailwind CSS for styling

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Google Maps API key not configured"**
   - Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable
   - Restart development server

2. **"Failed to load Google Maps script"**
   - Check API key is valid
   - Verify required APIs are enabled
   - Check browser console for CORS errors

3. **Maps not displaying**
   - Check network connectivity
   - Verify API quotas haven't been exceeded
   - Check browser developer tools for errors

### Debug Mode

Set `NODE_ENV=development` to see detailed configuration logs in the browser console.
