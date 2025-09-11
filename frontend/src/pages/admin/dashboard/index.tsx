import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminStats } from '../../../components/admin-stats';
import { Card, CardContent } from '../../../components/ui/card';

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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Dashboard - Wedding Admin</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="p-6 ">
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="">
        {/* Advanced Analytics */}
        <div className="">
          <AdminStats />
        </div>
      </div>
    </>
  );
}
