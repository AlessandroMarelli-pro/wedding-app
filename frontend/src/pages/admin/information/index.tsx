import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Direction } from '../../../types/api';

const formSchema = z.object({
  coupleNames: z.string().min(2).max(50),
  presentationMessage: z.string().min(2).max(2000),
  weddingAddress: z.string().min(2).max(300),
  weddingDate: z.date(),
  locationDirections: z.array(
    z.object({
      type: z.string().min(2).max(300),
      information: z.string().min(2).max(300),
      location: z.object({
        address: z.string().min(2).max(300),
        link: z.string().min(2).max(300),
      }),
    }),
  ),
  heroImageId: z.string().min(2).max(300),
});

interface WeddingInfo {
  id: string;
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: Date;
  locationDirections: Direction[];
  heroImageId?: string;
}

export default function AdminWedding() {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [originalWeddingInfo, setOriginalWeddingInfo] =
    useState<WeddingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [editingDirection, setEditingDirection] = useState<number | null>(null);
  const [newDirection, setNewDirection] = useState<Direction>({
    type: 'car',
    information: '',
    location: { address: '', link: '' },
  });
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coupleNames: weddingInfo?.coupleNames || '',
      presentationMessage: weddingInfo?.presentationMessage || '',
      weddingAddress: weddingInfo?.weddingAddress || '',
      weddingDate:
        (weddingInfo?.weddingDate && new Date(weddingInfo?.weddingDate)) ||
        undefined,
      locationDirections: weddingInfo?.locationDirections || [],
      heroImageId: weddingInfo?.heroImageId || '',
    },
  });
  console.log(form.formState.errors);
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.info(values);
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchWeddingInfo();
  }, [router]);

  // Check for unsaved changes before leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = (url: string) => {
      if (hasUnsavedChanges()) {
        const shouldLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave this page?',
        );
        if (!shouldLeave) {
          router.events.emit('routeChangeError');
          throw 'routeChange aborted.';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, weddingInfo, originalWeddingInfo]);

  const fetchWeddingInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/wedding`,
      );
      if (response.ok) {
        const data = await response.json();
        // Ensure locationDirections is an array
        if (!Array.isArray(data.locationDirections)) {
          data.locationDirections = [];
        }
        setWeddingInfo(data);
        form.reset(data);
        setOriginalWeddingInfo(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
      }
    } catch (error) {
      console.error('Error fetching wedding info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasUnsavedChanges = () => {
    if (!weddingInfo || !originalWeddingInfo) return false;
    return JSON.stringify(weddingInfo) !== JSON.stringify(originalWeddingInfo);
  };

  const hasAllDirectionTypes = () => {
    if (!weddingInfo) return false;
    const existingTypes = weddingInfo.locationDirections.map((d) => d.type);
    const allTypes: Direction['type'][] = ['car', 'train', 'car rental'];
    return allTypes.every((type) => existingTypes.includes(type));
  };

  const getAvailableTypes = (): Direction['type'][] => {
    if (!weddingInfo) return ['car', 'train', 'car rental'];
    const existingTypes = weddingInfo.locationDirections.map((d) => d.type);
    const allTypes: Direction['type'][] = ['car', 'train', 'car rental'];
    return allTypes.filter((type) => !existingTypes.includes(type));
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
        // Update original data to reflect saved state
        setOriginalWeddingInfo(JSON.parse(JSON.stringify(weddingInfo)));
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

  const addDirection = (direction: Direction) => {
    if (
      !weddingInfo ||
      !direction.information.trim() ||
      !direction.location.address.trim()
    )
      return;

    setWeddingInfo({
      ...weddingInfo,
      locationDirections: [...weddingInfo.locationDirections, { ...direction }],
    });

    // Set the next available type for the new direction
    const availableTypes = getAvailableTypes();
    setNewDirection({
      type: (availableTypes[0] || 'car') as Direction['type'],
      information: '',
      location: { address: '', link: '' },
    });
  };

  const updateDirection = (index: number, direction: Direction) => {
    if (!weddingInfo) return;

    const updatedDirections = [...weddingInfo.locationDirections];
    updatedDirections[index] = direction;
    setWeddingInfo({
      ...weddingInfo,
      locationDirections: updatedDirections,
    });
    setEditingDirection(null);
  };

  const removeDirection = (index: number) => {
    if (!weddingInfo) return;

    const updatedDirections = weddingInfo.locationDirections.filter(
      (_, i) => i !== index,
    );
    setWeddingInfo({
      ...weddingInfo,
      locationDirections: updatedDirections,
    });
  };

  const startEditingDirection = (index: number) => {
    if (!weddingInfo) return;
    setEditingDirection(index);
  };

  const cancelEditingDirection = () => {
    setEditingDirection(null);
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Wedding Info - Wedding Admin</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 2, currentMonth + 2);
  return (
    <>
      <Head>
        <title>Wedding Information - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl  text-foreground mb-2">Informations</h1>
            <p className="text-muted-foreground">
              Mettre à jour les détails qui apparaissent sur votre site de
              mariage
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-row w-full gap-4">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row w-full gap-4">
                  <FormField
                    control={form.control}
                    name="coupleNames"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Couple Names</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Ariane & Timothe"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ce nom sera affiché sur la page d'accueil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weddingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[20rem] p-0 font-sans"
                            align="start"
                          >
                            <Calendar
                              showOutsideDays
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              className="rounded-md border shadow-sm w-full"
                              endMonth={endMonth}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Your date of birth is used to calculate your age.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="presentationMessage"
                    defaultValue={weddingInfo?.presentationMessage || ''}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presentation Message</FormLabel>
                        <FormControl>
                          <Textarea
                            className="h-40"
                            placeholder="Un message personnalisé à adresser à vos invités"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex flex-row justify-between">
                          <span>
                            Ce message sera affiché après la page d'accueil.
                          </span>
                          <span>
                            {weddingInfo?.presentationMessage.length}/2000
                            characters
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="weddingAddress"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Adresse du lieu</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Veuillez entrer l'adresse du lieu"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ce nom sera affiché sur la page d'accueil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Directions & Additional Info
                </label>

                {/* Existing Directions */}
                <div className="space-y-4 mb-6">
                  {weddingInfo.locationDirections.map((direction, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      {editingDirection === index ? (
                        <DirectionEditForm
                          direction={direction}
                          onSave={(updatedDirection) =>
                            updateDirection(index, updatedDirection)
                          }
                          onCancel={cancelEditingDirection}
                          availableTypes={['car', 'train', 'car rental']}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
                                {direction.type === 'car'
                                  ? 'En voiture'
                                  : direction.type === 'train'
                                    ? 'En train'
                                    : 'Location de voiture'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">
                              {direction.information}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">📍</span>
                              {direction.location.link ? (
                                <a
                                  href={direction.location.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  {direction.location.address}
                                </a>
                              ) : (
                                <span className="text-gray-600 text-sm">
                                  {direction.location.address}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              type="button"
                              onClick={() => startEditingDirection(index)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDirection(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Direction */}
                {!hasAllDirectionTypes() && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Add New Direction
                    </h4>
                    <DirectionEditForm
                      direction={newDirection}
                      onSave={addDirection}
                      onCancel={() => {
                        const availableTypes = getAvailableTypes();
                        setNewDirection({
                          type: (availableTypes[0] ||
                            'car') as Direction['type'],
                          information: '',
                          location: { address: '', link: '' },
                        });
                      }}
                      isNew={true}
                      availableTypes={getAvailableTypes()}
                    />
                  </div>
                )}

                {/* Show message when all types are present */}
                {hasAllDirectionTypes() && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2"
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
                      <p className="text-green-800 font-medium">
                        All direction types have been added! You can edit or
                        remove existing directions above.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit">Submit</Button>
          </form>
        </Form>

        {weddingInfo ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            <p className="text-gray-600 mb-4">No wedding information found.</p>
            <p className="text-sm text-gray-500">
              Please contact support to set up your wedding information.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

interface DirectionEditFormProps {
  direction: Direction;
  onSave: (direction: Direction) => void;
  onCancel: () => void;
  isNew?: boolean;
  availableTypes?: Direction['type'][];
}

function DirectionEditForm({
  direction,
  onSave,
  onCancel,
  isNew = false,
  availableTypes = ['car', 'train', 'car rental'] as Direction['type'][],
}: DirectionEditFormProps) {
  const [formData, setFormData] = useState<Direction>({ ...direction });

  // Update formData when direction prop changes (for editing)
  useEffect(() => {
    setFormData({ ...direction });
  }, [direction]);

  const handleSave = () => {
    if (!formData.information.trim() || !formData.location.address.trim())
      return;
    onSave(formData);
  };

  const handleChange = (field: keyof Direction, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (
    field: keyof Direction['location'],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            handleChange('type', e.target.value as Direction['type'])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
        >
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'car'
                ? 'En voiture'
                : type === 'train'
                  ? 'En train'
                  : 'Location de voiture'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Information (Markdown supported)
        </label>
        <textarea
          value={formData.information}
          onChange={(e) => handleChange('information', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          placeholder="Directions, parking info, or other helpful details..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          value={formData.location.address}
          onChange={(e) => handleLocationChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          placeholder="Full address"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link (optional)
        </label>
        <input
          type="url"
          value={formData.location.link || ''}
          onChange={(e) => handleLocationChange('link', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          {isNew ? 'Add Direction' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
