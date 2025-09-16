import { useEffect, useState } from 'react';

interface ColorResponse {
  color: string;
  timestamp: string;
  error?: string;
}

export const useAppColor = () => {
  const [color, setColor] = useState<string>('#95E1D3'); // Default fallback color
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/config/color');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ColorResponse = await response.json();
        setColor(data.color);
      } catch (err) {
        console.error('Failed to fetch app color:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep the default color on error
      } finally {
        setLoading(false);
      }
    };

    fetchColor();
  }, []);

  return { color, loading, error };
};
