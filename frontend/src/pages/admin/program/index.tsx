import { Calendar } from '@/components/ui/calendar';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDateTime } from '@/lib';
import {
  CalendarIcon,
  Clock,
  Edit,
  MapPin,
  Plus,
  Save,
  Trash,
  X,
} from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

interface ProgramEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  location: string;
  displayOrder: number;
  includeInCalendar: boolean;
  icon?: string;
}

interface EventFormData {
  id?: string;
  title: string;
  startTime: Date;
  location: string;
}

export const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(300),
  startTime: z.date(),
  location: z.string().min(2).max(300),
});

export default function AdminProgram() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      title: '',
      startTime: new Date(),
      location: '',
    },
  });
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/program`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setEvents(data);
      } else {
        toast.error('Erreur lors de la récupération des événements !');
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération des événements !', {
        description: error as string,
      });
    } finally {
      setIsLoading(false);
    }
  };
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    console.log(values);
    try {
      const url = editingEvent
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/program/${editingEvent.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/program`;

      const method = editingEvent ? 'PUT' : 'POST';

      const payload = {
        ...values,
        includeInCalendar: true,
        description: '',
        icon: '',
        endTime: values.startTime,
      };
      delete payload.id;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          `${editingEvent ? 'Misé à jour' : 'Création'}  réussi !`,
          {
            description: `L'événement a été ${editingEvent ? 'mis à jour' : 'créé'}.`,
          },
        );
        resetForm();
        fetchEvents();
      } else {
        const error = await response.json();

        toast.error("Erreur lors de la mise à jour de l'événement !", {
          description: error.message || 'Operation failed',
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'événement !", {
        description: error as string,
      });
    }
  }

  const handleDelete = async (eventId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/program/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.warning('Événement supprimé avec succès !');
        fetchEvents();
      } else {
        toast.error("Erreur lors de la suppression de l'événement !");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'événement !", {
        description: error as string,
      });
    }
  };

  const startEdit = (event: ProgramEvent) => {
    const startTime = new Date(event.startTime);
    const editingEvent: EventFormData = {
      id: event.id,
      title: event.title,
      startTime: startTime,
      location: event.location,
    };
    setEditingEvent(editingEvent);
    form.reset(editingEvent);

    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingEvent(null);
    resetFormData();
  };

  const resetForm = () => {
    setEditingEvent(null);
    setIsCreating(false);
    resetFormData();
  };

  const resetFormData = () => {
    form.reset({
      id: '',
      title: '',
      startTime: new Date(),
      location: '',
    });
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const endMonth = new Date(currentYear + 2, currentMonth + 2);

  return (
    <>
      <Head>
        <title>Wedding Program - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="p-6 space-y-8 flex flex-col">
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl  text-foreground flex items-center gap-2 mb-2 justify-between">
                Programme de mariage
              </h1>

              <p className="text-muted-foreground">
                Gérez votre calendrier de mariage et vos événements
              </p>
            </div>
            <Button onClick={startCreate}>
              Ajouter un événement <Plus />
            </Button>
          </div>

          {(isCreating || editingEvent) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingEvent
                    ? "Mettre à jour l'événement"
                    : 'Créer un nouvel événement'}
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Nom de l'événement</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cérémonie de mariage"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Ex: Cérémonie de mariage, Repas, Soirée, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Lieu de l'événement</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nom et ville du lieu"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Ex: Eglise, Condillac
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem className=" w-full">
                            <FormLabel>Date de l'événement</FormLabel>
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
                                      formatDateTime(field.value.toISOString())
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
                                  showOutsideDays={true}
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
                              Date à laquelle l'événement aura lieu.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" variant="success">
                        {editingEvent ? 'Mettre à jour' : 'Créer'} <Save />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Pas d'événements programmés pour le moment. Créez votre
                    premier événement pour commencer.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg  text-foreground">
                              {event.title}
                            </h3>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDateTime(event.startTime)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            onClick={() => startEdit(event)}
                            size="icon"
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(event.id)}
                            size="icon"
                            className="bg-destructive"
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
