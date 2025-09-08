import {
  Edit,
  GripVertical,
  MapPin,
  Phone,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingNavbarLayout } from '../../components/floating-navbar-layout';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface Accommodation {
  id: string;
  name: string;
  description: string;
  address: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  isRecommended: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AccommodationFormData {
  name: string;
  description: string;
  address: string;
  contactInfo: string;
  latitude: string;
  longitude: string;
  priceRange: string;
  isRecommended: boolean;
}

const initialFormData: AccommodationFormData = {
  name: '',
  description: '',
  address: '',
  contactInfo: '',
  latitude: '',
  longitude: '',
  priceRange: '',
  isRecommended: false,
};

export default function AdminAccommodations() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
        displayOrder:
          editingAccommodation?.displayOrder || accommodations.length + 1,
      };

      const url = editingAccommodation
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations/${editingAccommodation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations`;

      const method = editingAccommodation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Accommodation ${editingAccommodation ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchAccommodations();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save accommodation');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
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

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingAccommodation(null);
  };

  const handleInputChange = (
    field: keyof AccommodationFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <FloatingNavbarLayout type="admin" currentPath="/admin/accommodations">
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
      </FloatingNavbarLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Accommodations - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <FloatingNavbarLayout type="admin" currentPath="/admin/accommodations">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif text-gray-800 mb-2">
                Accommodations
              </h1>
              <p className="text-gray-600">
                Manage accommodation recommendations for your guests
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Accommodation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAccommodation
                      ? 'Edit Accommodation'
                      : 'Add New Accommodation'}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        required
                        placeholder="Hotel name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange('description', e.target.value)
                        }
                        required
                        placeholder="Brief description of the accommodation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        required
                        placeholder="Full address"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="contactInfo">Contact Information</Label>
                      <Input
                        id="contactInfo"
                        type="text"
                        value={formData.contactInfo}
                        onChange={(e) =>
                          handleInputChange('contactInfo', e.target.value)
                        }
                        placeholder="Phone, email, or website"
                      />
                    </div>

                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          handleInputChange('latitude', e.target.value)
                        }
                        placeholder="e.g., 48.8566"
                      />
                    </div>

                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          handleInputChange('longitude', e.target.value)
                        }
                        placeholder="e.g., 2.3522"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="priceRange">Price Range</Label>
                      <Input
                        id="priceRange"
                        type="text"
                        value={formData.priceRange}
                        onChange={(e) =>
                          handleInputChange('priceRange', e.target.value)
                        }
                        placeholder="e.g., €120-180/night"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center space-x-2">
                      <input
                        id="isRecommended"
                        type="checkbox"
                        checked={formData.isRecommended}
                        onChange={(e) =>
                          handleInputChange('isRecommended', e.target.checked)
                        }
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <Label htmlFor="isRecommended">Mark as recommended</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-rose-600 hover:bg-rose-700"
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : editingAccommodation
                          ? 'Update'
                          : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                    Get started by adding your first accommodation
                    recommendation.
                  </p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(true);
                    }}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Accommodation
                  </Button>
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
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </FloatingNavbarLayout>
    </>
  );
}
