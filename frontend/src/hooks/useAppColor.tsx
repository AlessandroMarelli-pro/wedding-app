import { useEffect, useState } from 'react';

interface ColorResponse {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  timestamp: string;
  error?: string;
}

export const useAppColor = () => {
  const [primaryColor, setPrimaryColor] = useState<string>('#95E1D3'); // Default fallback color
  const [secondaryColor, setSecondaryColor] = useState<string>('#EAFFD0'); // Default fallback color
  const [accentColor, setAccentColor] = useState<string>('#F38181'); // Default fallback color
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/config/color');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ColorResponse = await response.json();
        setPrimaryColor(data.primaryColor);
        setSecondaryColor(data.secondaryColor);
        setAccentColor(data.accentColor);
      } catch (err) {
        console.error('Failed to fetch app colors:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep the default colors on error
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, []);

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    loading,
    error,
    // Legacy support for existing code
    color: primaryColor,
  };
};
