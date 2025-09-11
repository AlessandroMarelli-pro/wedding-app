import { NavbarLayout } from '@/components/admin-navbar-layout';
import { GuestDetailsModal } from '@/components/guest-details-modal';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { Download, Users } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Mail,
  Phone,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';

interface Guest {
  id: string;
  hashCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  partySize: number;
  dietaryRestrictions: string;
  specialRequests: string;
  createdAt: string;
  rsvpConfirmation?: {
    id: string;
    isAttending: boolean;
    confirmedPartySize: number;
    message: string;
    confirmedAt: string;
  };
}

interface CSVUpload {
  id: string;
  filename: string;
  totalGuests: number;
  successfulImports: number;
  createdAt: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [csvUploads, setCsvUploads] = useState<CSVUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'confirmed' | 'declined' | 'pending'
  >('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('fetching data', process.env.NEXT_PUBLIC_API_URL);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const guestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();

        setGuests(guestsData);
      }

      const uploadsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests/uploads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (uploadsResponse.ok) {
        const uploadsData = await uploadsResponse.json();

        setCsvUploads(uploadsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guest data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

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
        setSelectedFile(null);
        fetchData(); // Refresh stats
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
  const handleExportCSV = async () => {
    try {
      const blob = await ApiService.exportGuestsCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guests-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError('Failed to export guest data');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests/${guestId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      toast({
        title: 'Success',
        description: 'Guest deleted successfully',
      });

      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete guest',
        variant: 'destructive',
      });
    }
  };

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.hashCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'confirmed' &&
        guest.rsvpConfirmation?.isAttending === true) ||
      (statusFilter === 'declined' &&
        guest.rsvpConfirmation?.isAttending === false) ||
      (statusFilter === 'pending' && !guest.rsvpConfirmation);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (guest: Guest) => {
    if (!guest.rsvpConfirmation) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }

    if (guest.rsvpConfirmation.isAttending) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed ({guest.rsvpConfirmation.confirmedPartySize})
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        <X className="w-3 h-3 mr-1" />
        Declined
      </Badge>
    );
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.rsvpConfirmation?.isAttending === true)
      .length,
    declined: guests.filter((g) => g.rsvpConfirmation?.isAttending === false)
      .length,
    pending: guests.filter((g) => !g.rsvpConfirmation).length,
    totalAttendees: guests.reduce(
      (sum, g) => sum + (g.rsvpConfirmation?.confirmedPartySize || 0),
      0,
    ),
  };

  if (isLoading) {
    return (
      <NavbarLayout type="admin" currentPath="/admin/guests">
        <LoadingSpinner />
      </NavbarLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Guest Management - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <NavbarLayout type="admin" currentPath="/admin/guests">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl  text-gray-800 mb-2">Guest Management</h1>
            <p className="text-gray-600">
              Manage your wedding guest list and RSVP responses
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Guests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.confirmed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <X className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Declined</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.declined}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Attendees</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalAttendees}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CSV Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Guest List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    disabled={isUploading}
                  />
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  CSV format: firstName, lastName, email, phoneNumber,
                  partySize, dietaryRestrictions, specialRequests
                </p>
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
                  disabled={!selectedFile || isUploading}
                  onClick={handleFileUpload}
                  className="cursor-pointer w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Upload CSV'}
                </button>{' '}
                {csvUploads.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Uploads:</h4>
                    <div className="space-y-2">
                      {csvUploads.slice(0, 3).map((upload) => (
                        <div
                          key={upload.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="text-sm">{upload.filename}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {upload.successfulImports}/{upload.totalGuests}{' '}
                            imported
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search guests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'confirmed', 'declined', 'pending'] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          statusFilter === status ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Guest List ({filteredGuests.length})</span>{' '}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-2 bg-amber-100"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Guest Data (CSV)</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredGuests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No guests found matching your criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {guest.firstName} {guest.lastName}
                            </h3>
                            {getStatusBadge(guest)}
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {guest.hashCode}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {guest.email}
                            </div>
                            {guest.phoneNumber && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {guest.phoneNumber}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Party size: {guest.partySize}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Added:{' '}
                              {new Date(guest.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {guest.dietaryRestrictions && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">
                                Dietary:{' '}
                              </span>
                              <span className="text-sm text-gray-600">
                                {guest.dietaryRestrictions}
                              </span>
                            </div>
                          )}

                          {guest.specialRequests && (
                            <div className="mt-1">
                              <span className="text-sm font-medium text-gray-700">
                                Special requests:{' '}
                              </span>
                              <span className="text-sm text-gray-600">
                                {guest.specialRequests}
                              </span>
                            </div>
                          )}

                          {guest.rsvpConfirmation?.message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium text-gray-700">
                                RSVP Message:{' '}
                              </span>
                              <span className="text-sm text-gray-600">
                                {guest.rsvpConfirmation.message}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewGuest(guest)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guest Details Modal */}
        <GuestDetailsModal
          guest={selectedGuest}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDelete={handleDeleteGuest}
        />
      </NavbarLayout>
    </>
  );
}
