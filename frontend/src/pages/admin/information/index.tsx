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
import { cn, formatDate } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconLoader } from '@tabler/icons-react';
import { CalendarIcon, Eye, Save } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Direction } from '../../../types/api';

export const formSchema = z.object({
  id: z.string().min(2).max(300).optional(),
  coupleNames: z.string().min(2).max(50),
  presentationMessage: z.string().min(2).max(2000),
  weddingAddress: z.string().min(2).max(300),
  weddingDate: z.date(),
  heroMessage: z.string().min(2).max(500),
  heroAddress: z.string().min(2).max(200),
  locationDirections: z
    .array(
      z.object({
        type: z.enum(['car', 'train', 'car rental']),
        information: z.string().min(2).max(2000),
        location: z.object({
          address: z.string().min(2).max(300),
          link: z.string().min(2).max(300).optional(),
        }),
      }),
    )
    .optional(),
});

export interface WeddingInfo {
  id: string;
  coupleNames: string;
  presentationMessage: string;
  weddingAddress: string;
  weddingDate: Date;
  heroMessage: string;
  heroAddress: string;
  locationDirections: Direction[];
}

const ButtonComponent = ({
  visibility,
  changesStatus,
}: {
  visibility: string;
  changesStatus: string;
}) => (
  <div
    className={cn('flex gap-2 justify-between lg:justify-start', visibility)}
  >
    <Button
      type="submit"
      variant={changesStatus === '1' ? 'default' : 'secondary'}
      className={cn('cursor-pointer')}
      disabled={changesStatus !== '1'}
    >
      Enregistrer <span className="hidden lg:block">les modifications</span>{' '}
      <Save />
    </Button>
    <Button
      type="button"
      onClick={() => window.open('/', '_blank')}
      variant="ghost"
    >
      Prévisualiser <span className="hidden lg:block">le site</span>
      <Eye />
    </Button>
  </div>
);

export default function AdminWedding() {
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
      id: undefined,
      coupleNames: '',
      presentationMessage: '',
      weddingAddress: '',
      weddingDate: new Date(),
      heroMessage: '',
      heroAddress: '',
      locationDirections: [],
    },
  });

  useEffect(() => {
    console.log('form errors', form.formState.errors);
  }, [form.formState.errors]);
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setMessage(null);

    // Add 12h to weddingDate by adding milliseconds
    const updatedValues = {
      ...values,
      weddingDate: values.weddingDate
        ? new Date(values.weddingDate.getTime() + 12 * 60 * 60 * 1000)
        : values.weddingDate,
    };

    try {
      const response = await fetch(`/api/admin/wedding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedValues),
      });

      if (response.ok) {
        // Reset form with original values to prevent date increment on subsequent saves
        form.reset(values);
        setChangesStatus('2');
        toast.success(`Informations mises à jour avec succès! `, {
          duration: 10000,
        });
      } else {
        const data = await response.json();
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update wedding information.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `An error occurred: ${error}`,
      });
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
  }, [router, form.formState.isDirty]);

  const fetchWeddingInfo = async () => {
    try {
      const response = await fetch(`/api/admin/wedding`);
      if (response.ok) {
        const data = await response.json();
        // Ensure locationDirections is an array
        if (!Array.isArray(data.locationDirections)) {
          data.locationDirections = [];
        }

        form.reset({ ...data, weddingDate: new Date(data.weddingDate) });
      }
    } catch (error) {
      console.error('Error fetching wedding info:', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyHasUnsavedChanges = () => {
    if (!form.getValues() || !form.formState.defaultValues) return false;
    // compare each field
    const formValues = form.getValues();
    const originalValues = form.formState.defaultValues;
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

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 2, currentMonth + 2);
  return (
    <>
      <Head>
        <title>Admin - Informations</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="p-4 lg:p-6 space-y-8 ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            id="information-form"
          >
            <div className="flex justify-between items-start flex-col lg:flex-row ">
              <div className="flex flex-col ">
                <h1 className="text-3xl  text-foreground flex items-center gap-2 mb-2 justify-between flex-col lg:flex-row">
                  Informations
                  {changesStatus === '0' && (
                    <Badge variant="secondary">
                      Aucune modifications en cours
                    </Badge>
                  )}
                  {changesStatus === '1' && (
                    <Badge variant="warning">
                      <IconLoader size={16} /> Modifications en cours (non
                      sauvegardées)
                    </Badge>
                  )}
                  {changesStatus === '2' && (
                    <Badge variant="success">
                      <IconCheck size={16} /> Modifications sauvegardées
                    </Badge>
                  )}
                </h1>

                <p className="text-muted-foreground text-sm lg:text-base">
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
              <ButtonComponent
                visibility={'hidden lg:flex'}
                changesStatus={changesStatus}
              />
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-4 ">
              <div className="flex flex-col w-full gap-4">
                <div
                  className="flex flex-col lg:flex-row w-full gap-4"
                  id="information-form-names"
                >
                  <FormField
                    control={form.control}
                    name="coupleNames"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Nom du couple</FormLabel>
                        <FormControl>
                          <Input
                            className="text-xs lg:text-sm"
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
                                  'w-full  text-left font-normal h-10 text-xs lg:text-sm',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  formatDate(field.value.toISOString())
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
                <div className="flex flex-col lg:flex-row w-full gap-4">
                  <FormField
                    control={form.control}
                    name="heroMessage"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Message d'invitation</FormLabel>
                        <FormControl>
                          <Input
                            className="text-xs lg:text-sm"
                            placeholder="Nous avons le plaisir de vous inviter à notre mariage le 13 Juillet 2026"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex flex-row justify-between">
                          Ce message sera affiché sur la page d'accueil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heroAddress"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Adresse du lieu (page d'accueil)</FormLabel>
                        <FormControl>
                          <Input
                            className="text-xs lg:text-sm"
                            placeholder="Lauziers, Condillac"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ce message sera affiché sur la page d'accueil.
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message de présentation</FormLabel>
                        <FormControl>
                          <Textarea
                            className="h-30 text-xs lg:text-sm"
                            placeholder="Un message personnalisé à adresser à vos invités"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex flex-row justify-between">
                          <span>
                            Ce message sera affiché après la page d'accueil.
                          </span>
                          <span>{field.value?.length}/2000 caractères</span>
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
                        <FormLabel>Adresse complète du lieu</FormLabel>
                        <FormControl>
                          <Input
                            className="text-xs lg:text-sm"
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

              <DirectionsForm form={form} setChangesStatus={setChangesStatus} />
            </div>
            <ButtonComponent
              visibility={'flex lg:hidden'}
              changesStatus={changesStatus}
            />
          </form>
        </Form>
      </div>
    </>
  );
}
