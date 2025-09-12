import { DirectionsForm } from '@/components/admin/directions-form';
import { Badge } from '@/components/ui';
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

export const formSchema = z.object({
  id: z.string().min(2).max(300),
  coupleNames: z.string().min(2).max(50),
  presentationMessage: z.string().min(2).max(2000),
  weddingAddress: z.string().min(2).max(300),
  weddingDate: z.date(),
  locationDirections: z.array(
    z.object({
      type: z.enum(['car', 'train', 'car rental']),
      information: z.string().min(2).max(300),
      location: z.object({
        address: z.string().min(2).max(300),
        link: z.string().min(2).max(300).optional(),
      }),
    }),
  ),
});

export interface WeddingInfo {
  id: string;
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: Date;
  locationDirections: Direction[];
}

export default function AdminWedding() {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [originalWeddingInfo, setOriginalWeddingInfo] =
    useState<WeddingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 0: no changes, 1: changes, 2: changes and unsaved
  const [changesStatus, setChangesStatus] = useState('0');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const router = useRouter();

  // 1. Define your form.

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: weddingInfo?.id || '',
      coupleNames: weddingInfo?.coupleNames || '',
      presentationMessage: weddingInfo?.presentationMessage || '',
      weddingAddress: weddingInfo?.weddingAddress || '',
      weddingDate:
        (weddingInfo?.weddingDate && new Date(weddingInfo?.weddingDate)) ||
        undefined,
      locationDirections: weddingInfo?.locationDirections || [],
    },
  });
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

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
          body: JSON.stringify(values),
        },
      );

      if (response.ok) {
        // Update original data to reflect saved state
        setOriginalWeddingInfo({
          ...values,
          weddingDate: new Date(values.weddingDate),
        });
        setChangesStatus('2');
      } else {
        const data = await response.json();
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update wedding information.',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
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
    verifyHasUnsavedChanges();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (verifyHasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = (url: string) => {
      if (verifyHasUnsavedChanges()) {
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
  }, [router, form.getValues()]);

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
        form.reset({ ...data, weddingDate: new Date(data.weddingDate) });
        setOriginalWeddingInfo({
          ...data,
          weddingDate: new Date(data.weddingDate),
        }); // Deep copy for comparison
      }
    } catch (error) {
      console.error('Error fetching wedding info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyHasUnsavedChanges = () => {
    if (!form.getValues() || !originalWeddingInfo) return false;
    // compare each field
    const formValues = form.getValues();
    const originalValues = originalWeddingInfo;
    for (const key in originalValues) {
      if (
        formValues[key as keyof typeof formValues]?.toString() !==
        originalValues[key as keyof typeof originalValues]?.toString()
      ) {
        setChangesStatus('1');
        return true;
      }
    }
    return false;
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl  text-foreground flex items-center gap-2 mb-2 justify-between">
              Informations
              {changesStatus === '0' && (
                <Badge variant="default">Aucune modifications en cours</Badge>
              )}
              {changesStatus === '1' && (
                <Badge variant="warning">Modifications en cours</Badge>
              )}
              {changesStatus === '2' && (
                <Badge variant="success">Modifications sauvegardées</Badge>
              )}
            </h1>

            <p className="text-muted-foreground">
              Mettez à jour les détails qui apparaissent sur votre site de
              mariage
            </p>
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
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          )}
          <Button
            type="button"
            onClick={() => window.open('/', '_blank')}
            variant="default"
          >
            Preview Site
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col lg:flex-row w-full gap-4">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-col lg:flex-row w-full gap-4">
                  <FormField
                    control={form.control}
                    name="coupleNames"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Nom du couple</FormLabel>
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
                      <FormItem className=" w-full">
                        <FormLabel>Date du mariage</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full  text-left font-normal h-10',
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
                            className="w-[15rem] lg:w-[20rem] p-0 font-sans"
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
                          Cette date sera affichée sur la page d'accueil.
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
                        <FormLabel>Message de présentation</FormLabel>
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
                          <span>{field.value.length}/2000 caractères</span>
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
                          Cette adresse sera affichée après la page d'accueil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DirectionsForm form={form} setWeddingInfo={setWeddingInfo} />
            </div>

            <Button type="submit" className="cursor-pointer">
              Submit
            </Button>
          </form>
        </Form>
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
