/**
 * Google Maps Configuration and Validation
 * Provides utilities for validating Google Maps API configuration
 */

export interface MapsConfig {
  apiKey: string;
  region: string;
  language: string;
  libraries: string[];
}

export interface MapsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Get Google Maps configuration from environment variables
 */
export function getMapsConfig(): MapsConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    region: process.env.NEXT_PUBLIC_GOOGLE_MAPS_REGION || 'FR',
    language: process.env.NEXT_PUBLIC_GOOGLE_MAPS_LANGUAGE || 'fr',
    libraries: ['places', 'geometry'],
  };
}

/**
 * Validate Google Maps configuration
 */
export function validateMapsConfig(): MapsValidationResult {
  const config = getMapsConfig();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check API key
  if (!config.apiKey) {
    errors.push(
      'Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.',
    );
  } else if (config.apiKey === 'your-google-maps-api-key') {
    errors.push(
      'Google Maps API key is set to placeholder value. Please set a real API key.',
    );
  } else if (config.apiKey.length < 20) {
    warnings.push(
      'Google Maps API key seems too short. Please verify it is correct.',
    );
  }

  // Check region
  if (!config.region || config.region.length !== 2) {
    warnings.push(
      'Google Maps region should be a 2-letter country code (e.g., FR, US).',
    );
  }

  // Check language
  if (!config.language || config.language.length !== 2) {
    warnings.push(
      'Google Maps language should be a 2-letter language code (e.g., fr, en).',
    );
  }

  // Check required libraries
  const requiredLibraries = ['places', 'geometry'];
  const missingLibraries = requiredLibraries.filter(
    (lib) => !config.libraries.includes(lib),
  );
  if (missingLibraries.length > 0) {
    warnings.push(
      `Missing recommended libraries: ${missingLibraries.join(', ')}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if Google Maps is properly configured
 */
export function isMapsConfigured(): boolean {
  const validation = validateMapsConfig();
  return validation.isValid;
}

/**
 * Get Google Maps API URL with configuration
 */
export function getMapsApiUrl(): string {
  const config = getMapsConfig();

  if (!config.apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  const params = new URLSearchParams({
    key: config.apiKey,
    libraries: config.libraries.join(','),
    region: config.region,
    language: config.language,
  });

  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}

/**
 * Log Google Maps configuration status
 */
export function logMapsConfigStatus(): void {
  const validation = validateMapsConfig();

  if (validation.isValid) {
    console.log('✅ Google Maps configuration is valid');
  } else {
    console.error('❌ Google Maps configuration errors:');
    validation.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Google Maps configuration warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

/**
 * Get setup instructions for Google Maps API
 */
export function getMapsSetupInstructions(): string {
  return `
Google Maps API Setup Instructions:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Set the environment variable:
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key

Optional environment variables:
- NEXT_PUBLIC_GOOGLE_MAPS_REGION=FR (default: FR)
- NEXT_PUBLIC_GOOGLE_MAPS_LANGUAGE=fr (default: fr)

For more information, visit: https://developers.google.com/maps/documentation/javascript/get-api-key
  `.trim();
}

/**
 * Check if running in browser environment
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if Google Maps script is already loaded
 */
export function isMapsScriptLoaded(): boolean {
  if (!isBrowserEnvironment()) return false;

  return !!(window.google && window.google.maps && window.google.maps.Map);
}

/**
 * Get Google Maps loading status
 */
export function getMapsLoadingStatus(): {
  isConfigured: boolean;
  isBrowser: boolean;
  isScriptLoaded: boolean;
  canLoad: boolean;
} {
  const isConfigured = isMapsConfigured();
  const isBrowser = isBrowserEnvironment();
  const isScriptLoaded = isMapsScriptLoaded();
  const canLoad = isConfigured && isBrowser && !isScriptLoaded;

  return {
    isConfigured,
    isBrowser,
    isScriptLoaded,
    canLoad,
  };
}
