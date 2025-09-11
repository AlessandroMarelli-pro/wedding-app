import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { NavbarLayout } from '../../components/admin-navbar-layout';
import { AdminStats } from '../../components/admin-stats';
import { Card, CardContent } from '../../components/ui/card';

interface RSVPStats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  confirmationRate: number;
}

interface RecentConfirmation {
  id: string;
  guestName: string;
  confirmedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<RSVPStats | null>(null);
  const [recentConfirmations, setRecentConfirmations] = useState<
    RecentConfirmation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      // Fetch RSVP stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/rsvp/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }

      // Fetch recent confirmations
      const recentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/rsvp/recent?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (recentResponse.ok) {
        const recent = await recentResponse.json();
        setRecentConfirmations(
          recent.map((r: any) => ({
            id: r.id,
            guestName: `${r.guest.firstName} ${r.guest.lastName}`,
            confirmedAt: r.confirmedAt,
          })),
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({
          type: 'success',
          text: `CSV uploaded successfully! Processed ${data.processedRows} guests.`,
        });
        setUploadFile(null);
        fetchDashboardData(); // Refresh stats
      } else {
        setUploadMessage({
          type: 'error',
          text: data.message || 'Upload failed. Please try again.',
        });
      }
    } catch (error) {
      setUploadMessage({
        type: 'error',
        text: 'Network error. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Dashboard - Wedding Admin</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <NavbarLayout type="admin" currentPath="/admin/dashboard">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </NavbarLayout>
      </>
    );
  }

  return (
    <>
      <div className="">
        {/* Advanced Analytics */}
        <div className="">
          <AdminStats />
        </div>
      </div>
    </>
  );
}
