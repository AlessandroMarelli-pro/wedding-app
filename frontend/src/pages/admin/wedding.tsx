import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin-layout';

interface WeddingInfo {
  id: string;
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: string;
  locationDirections: string;
}

export default function AdminWedding() {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
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

    fetchWeddingInfo();
  }, [router]);

  const fetchWeddingInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/wedding`,
      );
      if (response.ok) {
        const data = await response.json();
        setWeddingInfo(data);
      }
    } catch (error) {
      console.error('Error fetching wedding info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingInfo) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/wedding`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingInfo),
        },
      );

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Wedding information updated successfully!',
        });
      } else {
        const data = await response.json();
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update wedding information.',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof WeddingInfo, value: string) => {
    if (!weddingInfo) return;
    setWeddingInfo({ ...weddingInfo, [field]: value });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Wedding Information - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-gray-800 mb-2">
              Wedding Information
            </h1>
            <p className="text-gray-600">
              Update the details that appear on your wedding website
            </p>
          </div>

          {weddingInfo ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-100">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="coupleNames"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Couple Names
                  </label>
                  <input
                    type="text"
                    id="coupleNames"
                    value={weddingInfo.coupleNames}
                    onChange={(e) =>
                      handleInputChange('coupleNames', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    placeholder="e.g., Ariane & Timothe"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="presentationMessage"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Presentation Message
                  </label>
                  <textarea
                    id="presentationMessage"
                    value={weddingInfo.presentationMessage}
                    onChange={(e) =>
                      handleInputChange('presentationMessage', e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    placeholder="A personal message from the couple to their guests..."
                    maxLength={2000}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {weddingInfo.presentationMessage.length}/2000 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="weddingDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Wedding Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="weddingDate"
                      value={
                        weddingInfo.weddingDate
                          ? new Date(weddingInfo.weddingDate)
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange('weddingDate', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="weddingAddress"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Wedding Address
                    </label>
                    <input
                      type="text"
                      id="weddingAddress"
                      value={weddingInfo.weddingAddress}
                      onChange={(e) =>
                        handleInputChange('weddingAddress', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      placeholder="Venue name and address"
                      maxLength={300}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="locationDirections"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Directions & Additional Info
                  </label>
                  <textarea
                    id="locationDirections"
                    value={weddingInfo.locationDirections}
                    onChange={(e) =>
                      handleInputChange('locationDirections', e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    placeholder="Parking information, directions, or other helpful details for guests..."
                    required
                  />
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-center">
                      {message.type === 'success' ? (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      <p className="font-medium">{message.text}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => window.open('/', '_blank')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Preview Site
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100 text-center">
              <p className="text-gray-600 mb-4">
                No wedding information found.
              </p>
              <p className="text-sm text-gray-500">
                Please contact support to set up your wedding information.
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
