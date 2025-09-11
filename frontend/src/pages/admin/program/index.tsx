import {
  Bell,
  Cake,
  Calendar,
  Camera,
  Clock,
  Coffee,
  Download,
  Edit,
  Flower,
  Gift,
  Heart,
  MapPin,
  Music,
  PartyPopper,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Users,
  Utensils,
  Wine,
  X,
} from 'lucide-react';
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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

interface ProgramEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  displayOrder: number;
  includeInCalendar: boolean;
  icon?: string;
}

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  includeInCalendar: boolean;
  icon?: string;
}

export default function AdminProgram() {
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ProgramEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    includeInCalendar: true,
    icon: '',
  });
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
        setMessage({ type: 'error', text: 'Failed to load program events' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error loading events' });
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
        displayOrder: editingEvent?.displayOrder || events.length + 1,
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
        setMessage({
          type: 'success',
          text: `Event ${editingEvent ? 'updated' : 'created'} successfully`,
        });
        resetForm();
        fetchEvents();
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'Operation failed',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

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
        setMessage({ type: 'success', text: 'Event deleted successfully' });
        fetchEvents();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete event' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const startEdit = (event: ProgramEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startTime: event.startTime.slice(0, 16), // Format for datetime-local input
      endTime: event.endTime.slice(0, 16),
      location: event.location,
      includeInCalendar: event.includeInCalendar,
      icon: event.icon || '',
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
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      includeInCalendar: true,
      icon: '',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Available icons for selection
  const availableIcons = [
    { name: 'Heart', component: Heart },
    { name: 'Music', component: Music },
    { name: 'Camera', component: Camera },
    { name: 'Utensils', component: Utensils },
    { name: 'Gift', component: Gift },
    { name: 'Users', component: Users },
    { name: 'Sparkles', component: Sparkles },
    { name: 'Coffee', component: Coffee },
    { name: 'Wine', component: Wine },
    { name: 'Cake', component: Cake },
    { name: 'PartyPopper', component: PartyPopper },
    { name: 'Bell', component: Bell },
    { name: 'Star', component: Star },
    { name: 'Flower', component: Flower },
    { name: 'Calendar', component: Calendar },
    { name: 'Clock', component: Clock },
    { name: 'MapPin', component: MapPin },
  ];

  const getIconComponent = (iconName: string) => {
    const icon = availableIcons.find((i) => i.name === iconName);
    return icon ? icon.component : Calendar;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-64"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
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
        <title>Wedding Program - Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl  text-foreground mb-2">Wedding Program</h1>
            <p className="text-muted-foreground">
              Manage your wedding schedule and events
            </p>
          </div>
          <Button
            onClick={startCreate}
            className="flex items-center gap-2 bg-primary text-white "
          >
            <Plus className="w-4 h-4 bg-primary" />
            Add Event
          </Button>
        </div>

        {message && (
          <Card
            className={`border-l-4 ${
              message.type === 'success'
                ? 'border-l-green-500 bg-green-50'
                : 'border-l-red-500 bg-red-50'
            }`}
          >
            <CardContent className="p-4">
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </CardContent>
          </Card>
        )}

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

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2 p-4 border border-input rounded-md">
                    {availableIcons.map(
                      ({ name, component: IconComponent }) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon: name })
                          }
                          className={`p-2 rounded-md border transition-colors ${
                            formData.icon === name
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                          title={name}
                        >
                          <div className="relative">
                            <IconComponent className="w-5 h-5 mx-auto" />
                            {formData.icon === name && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select an icon to represent this event
                    {formData.icon && (
                      <span className="ml-2 text-blue-600 font-medium">
                        Selected: {formData.icon}
                      </span>
                    )}
                  </p>
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
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="includeInCalendar"
                    type="checkbox"
                    checked={formData.includeInCalendar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        includeInCalendar: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="includeInCalendar">
                    Include in calendar export
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Save className="w-4 h-4" />
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl  text-foreground">Current Events</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/program/calendar', '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Calendar
            </Button>
          </div>

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
                          {event.icon && (
                            <div className="text-primary">
                              {(() => {
                                const IconComponent = getIconComponent(
                                  event.icon,
                                );
                                return <IconComponent className="w-5 h-5" />;
                              })()}
                            </div>
                          )}
                          <h3 className="text-lg  text-foreground">
                            {event.title}
                          </h3>
                          {event.includeInCalendar && (
                            <Badge variant="secondary">
                              <Calendar className="w-3 h-3 mr-1" />
                              In Calendar
                            </Badge>
                          )}
                        </div>

                        <p className="text-muted-foreground mb-4">
                          {event.description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(event.startTime)} -{' '}
                            {new Date(event.endTime).toLocaleTimeString(
                              'en-US',
                              {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              },
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </>
  );
}
