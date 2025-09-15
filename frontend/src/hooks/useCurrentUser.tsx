import { ApiService } from '@/services/api';
import { CurrentUser } from '@/types/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface UseCurrentUserReturn {
  currentUser: CurrentUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login page if not connected

  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Only redirect if not already on the login page
      if (router.pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    }
    // We want to run this effect when loading or currentUser changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, currentUser]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (loading) {
    return {
      currentUser: null,
      loading: true,
      error: null,
      refetch: fetchCurrentUser,
    };
  }

  return {
    currentUser,
    loading,
    error,
    refetch: fetchCurrentUser,
  };
}
