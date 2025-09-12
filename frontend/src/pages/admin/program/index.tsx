import {
  Calendar,
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
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

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
  title: string;
  startTime: string;
  location: string;
}

export default function AdminProgram() {
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ProgramEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    startTime: '',
    location: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const url = editingEvent
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/program/${editingEvent.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/program`;

      const method = editingEvent ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        includeInCalendar: true,
        description: '',
        icon: '',
        endTime: formData.startTime,
      };

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
  };

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
    setEditingEvent(event);
    setFormData({
      title: event.title,
      startTime: event.startTime.slice(0, 16), // Format for datetime-local input
      location: event.location,
    });
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
    setFormData({
      title: '',
      startTime: '',
      location: '',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

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
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="success">
                      {editingEvent ? 'Update Event' : 'Create Event'} <Save />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No events scheduled yet. Create your first event to get
                    started.
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
