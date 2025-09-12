import {
  AccommodationFormData,
  AccomodationFormDialog,
  initialFormData,
} from '@/components/admin/accomodation-form-dialog';
import { Accommodation } from '@/types/api';
import { Edit, GripVertical, MapPin, Phone, Star, Trash2 } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button-pers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

export default function AdminAccommodations() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAccommodation, setEditingAccommodation] =
    useState<Accommodation | null>(null);
  const [formData, setFormData] =
    useState<AccommodationFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    fetchAccommodations();
  }, [router]);

  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/accommodations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAccommodations(
          data.sort(
            (a: Accommodation, b: Accommodation) =>
              a.displayOrder - b.displayOrder,
          ),
        );
      } else {
        throw new Error('Failed to fetch accommodations');
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setMessage({ type: 'error', text: 'Failed to load accommodations' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (accommodation: Accommodation) => {
    setEditingAccommodation(accommodation);
    setFormData({
      name: accommodation.name,
      description: accommodation.description,
      address: accommodation.address,
      contactInfo: accommodation.contactInfo || '',
      latitude: accommodation.latitude?.toString() || '',
      longitude: accommodation.longitude?.toString() || '',
      priceRange: accommodation.priceRange || '',
      isRecommended: accommodation.isRecommended,
      sourceUrl: accommodation.sourceUrl || '',
      imagesUrl: accommodation.imagesUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accommodation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Accommodation deleted successfully',
        });
        fetchAccommodations();
      } else {
        throw new Error('Failed to delete accommodation');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getSourceName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      if (domain.includes('airbnb.com')) return 'Airbnb';
      if (domain.includes('booking.com')) return 'Booking.com';
      if (domain.includes('hostelworld.com')) return 'Hostelworld';
      if (domain.includes('hotels.com')) return 'Hotels.com';
      if (domain.includes('expedia.com')) return 'Expedia';
      if (domain.includes('tripadvisor.com')) return 'TripAdvisor';
      if (domain.includes('agoda.com')) return 'Agoda';
      if (domain.includes('trivago.com')) return 'Trivago';
      if (domain.includes('kayak.com')) return 'Kayak';
      if (domain.includes('priceline.com')) return 'Priceline';
      if (domain.includes('orbitz.com')) return 'Orbitz';
      if (domain.includes('hotwire.com')) return 'Hotwire';
      if (domain.includes('vrbo.com')) return 'VRBO';
      if (domain.includes('homeaway.com')) return 'HomeAway';

      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'External Site';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Accommodations - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center pt-10">
          <div>
            <h1 className="text-3xl  text-gray-800 mb-2">Accommodations</h1>
            <p className="text-gray-600">
              Manage accommodation recommendations for your guests
            </p>
          </div>
          <AccomodationFormDialog
            editingAccommodation={editingAccommodation}
            setEditingAccommodation={setEditingAccommodation}
            setMessage={setMessage}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            accommodationsCount={accommodations.length}
            formData={formData}
            setFormData={setFormData}
          />
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Accommodations List */}
        <div className="space-y-4">
          {accommodations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <MapPin className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No accommodations yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by adding your first accommodation recommendation.
                </p>
                <AccomodationFormDialog
                  editingAccommodation={editingAccommodation}
                  setEditingAccommodation={setEditingAccommodation}
                  setMessage={setMessage}
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  accommodationsCount={accommodations.length}
                  formData={formData}
                  setFormData={setFormData}
                />
              </CardContent>
            </Card>
          ) : (
            accommodations.map((accommodation) => (
              <Card
                key={accommodation.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{accommodation.name}</span>
                          {accommodation.isRecommended && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </CardTitle>
                        {accommodation.priceRange && (
                          <p className="text-sm text-gray-600 mt-1">
                            {accommodation.priceRange}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(accommodation)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(accommodation.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-3">
                    {accommodation.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                      <span>{accommodation.address}</span>
                    </div>

                    {accommodation.contactInfo && (
                      <div className="flex items-start space-x-2">
                        <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                        <span>{accommodation.contactInfo}</span>
                      </div>
                    )}

                    {accommodation.latitude && accommodation.longitude && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                        <span>
                          Coordinates: {accommodation.latitude},{' '}
                          {accommodation.longitude}
                        </span>
                      </div>
                    )}

                    {accommodation.sourceUrl && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                        <a
                          href={accommodation.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View on {getSourceName(accommodation.sourceUrl)}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
