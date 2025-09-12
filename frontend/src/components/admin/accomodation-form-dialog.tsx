import { Button } from '@/components/ui/button-pers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accommodation } from '@/types/api';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export interface AccommodationFormData {
  name: string;
  description: string;
  address: string;
  contactInfo: string;
  latitude: string;
  longitude: string;
  priceRange: string;
  isRecommended: boolean;
  sourceUrl: string;
  imagesUrl: string;
}

export const initialFormData: AccommodationFormData = {
  name: '',
  description: '',
  address: '',
  contactInfo: '',
  latitude: '',
  longitude: '',
  priceRange: '',
  isRecommended: false,
  sourceUrl: '',
  imagesUrl: '',
};

export const AccomodationFormDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  accommodationsCount,
  formData,
  setFormData,
  setMessage,
  editingAccommodation,
  setEditingAccommodation,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  accommodationsCount: number;
  formData: AccommodationFormData;
  setFormData: (formData: AccommodationFormData) => void;
  setMessage: (message: { type: 'success' | 'error'; text: string }) => void;
  editingAccommodation: Accommodation | null;
  setEditingAccommodation: (editingAccommodation: Accommodation | null) => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [urlInput, setUrlInput] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);

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
          editingAccommodation?.displayOrder || accommodationsCount + 1,
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

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingAccommodation(null);
  };

  const handleInputChange = (
    field: keyof AccommodationFormData,
    value: string | boolean,
  ) => {
    setFormData((prev: AccommodationFormData) => ({ ...prev, [field]: value }));
  };

  const handleParseUrl = async () => {
    if (!urlInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setIsParsingUrl(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/accommodations/parse-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: urlInput }),
        },
      );

      if (response.ok) {
        const parsedData = await response.json();
        setFormData((prev) => ({
          ...prev,
          name: parsedData.name,
          description: parsedData.description,
          address: parsedData.address,
          contactInfo: parsedData.contactInfo || '',
          priceRange: parsedData.priceRange || '',
          sourceUrl: parsedData.sourceUrl,
          imagesUrl: parsedData.imagesUrl || '',
        }));
        setMessage({
          type: 'success',
          text: 'URL parsed successfully! Please review and complete the form.',
        });
        setUrlInput('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse URL');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsParsingUrl(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild className="space-y-2">
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

        {/* URL Parser Section */}
        {!editingAccommodation && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label htmlFor="urlInput" className="text-sm font-medium">
                Quick Add from URL
              </Label>
              <p className="text-xs text-gray-600 mb-2">
                Paste a URL from Airbnb, Booking.com, or other accommodation
                sites to auto-fill the form
              </p>
              <div className="flex space-x-2">
                <Input
                  id="urlInput"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.airbnb.com/rooms/..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleParseUrl}
                  disabled={isParsingUrl || !urlInput.trim()}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  {isParsingUrl ? 'Parsing...' : 'Parse URL'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                onChange={(e) => handleInputChange('address', e.target.value)}
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
                onChange={(e) => handleInputChange('latitude', e.target.value)}
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
                onChange={(e) => handleInputChange('longitude', e.target.value)}
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

            <div className="md:col-span-2">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                placeholder="https://www.airbnb.com/rooms/..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="imagesUrl">Images URL</Label>
              <Input
                id="imagesUrl"
                type="url"
                value={formData.imagesUrl}
                onChange={(e) => handleInputChange('imagesUrl', e.target.value)}
                placeholder="https://example.com/images/..."
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
  );
};
