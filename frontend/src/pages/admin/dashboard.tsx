import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminStats } from '../../components/admin-stats';
import { NavbarLayout } from '../../components/navbar-layout';
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
      <Head>
        <title>Dashboard - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <NavbarLayout type="admin" currentPath="/admin/dashboard">
        <div className="p-6 ">
          {/* Advanced Analytics */}
          <div className="">
            <AdminStats />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CSV Upload */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <h2 className="text-xl  text-gray-800 mb-4">Upload Guest List</h2>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV File (firstname, lastname, email)
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    disabled={isUploading}
                  />
                </div>

                {uploadMessage && (
                  <div
                    className={`p-3 rounded-md ${
                      uploadMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    <p className="text-sm">{uploadMessage.text}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Upload CSV'}
                </button>
              </form>
            </div>

            {/* Recent Confirmations */}
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <h2 className="text-xl  text-gray-800 mb-4">Recent RSVPs</h2>

              {recentConfirmations.length > 0 ? (
                <div className="space-y-3">
                  {recentConfirmations.map((confirmation) => (
                    <div
                      key={confirmation.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="font-medium text-gray-900">
                        {confirmation.guestName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(confirmation.confirmedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No confirmations yet
                </p>
              )}
            </div>
          </div>
        </div>
      </NavbarLayout>
    </>
  );
}
