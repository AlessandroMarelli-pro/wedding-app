import { Button } from '@/components/ui/button-pers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Using basic HTML select since Select component is not available
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  CalendarDays,
  Clock,
  Download,
  MapPin,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  eventsIncludedInCalendar: number;
  nextEvent?: {
    title: string;
    startTime: string;
    location?: string;
  };
}

interface CalendarDownloadProps {
  variant?: 'default' | 'minimal' | 'detailed';
  showStats?: boolean;
  className?: string;
}

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

export function CalendarDownload({
  variant = 'default',
  showStats = true,
  className = '',
}: CalendarDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [calendarName, setCalendarName] = useState('Wedding Program');
  const [timezone, setTimezone] = useState('UTC');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch calendar stats when component mounts or stats are requested
  const fetchStats = async () => {
    if (stats) return stats; // Return cached stats

    try {
      const response = await fetch('/api/program/calendar/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch calendar statistics');
      }
      const data = await response.json();
      setStats(data);
      return data;
    } catch (error) {
      console.error('Error fetching calendar stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar information',
        variant: 'destructive',
      });
      return null;
    }
  };

  const downloadCalendar = async (customOptions?: {
    name?: string;
    timezone?: string;
  }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (customOptions?.name || calendarName !== 'Wedding Program') {
        params.append('name', customOptions?.name || calendarName);
      }
      if (customOptions?.timezone || timezone !== 'UTC') {
        params.append('timezone', customOptions?.timezone || timezone);
      }

      const url = `/api/program/calendar${params.toString() ? `?${params.toString()}` : ''}`;

      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `wedding-program-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Calendar downloaded successfully',
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to download calendar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadEventCalendar = async (eventId: string, eventTitle: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (timezone !== 'UTC') {
        params.append('timezone', timezone);
      }

      const url = `/api/program/events/${eventId}/calendar${params.toString() ? `?${params.toString()}` : ''}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = `wedding-${eventTitle.toLowerCase().replace(/\s+/g, '-')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: `${eventTitle} calendar downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading event calendar:', error);
      toast({
        title: 'Error',
        description: `Failed to download ${eventTitle} calendar`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Minimal variant - just a download button
  if (variant === 'minimal') {
    return (
      <Button
        onClick={() => downloadCalendar()}
        disabled={isLoading}
        size="sm"
        className={className}
      >
        <Download className="w-4 h-4 mr-2" />
        {isLoading ? 'Downloading...' : 'Download Calendar'}
      </Button>
    );
  }

  // Default and detailed variants
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-5 h-5 mr-2 text-rose-500" />
              Wedding Calendar
            </CardTitle>
            <CardDescription>
              Download the complete wedding program to your calendar app
            </CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Options
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Calendar Download Options</DialogTitle>
                <DialogDescription>
                  Customize your calendar download settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calendar-name">Calendar Name</Label>
                  <Input
                    id="calendar-name"
                    value={calendarName}
                    onChange={(e) => setCalendarName(e.target.value)}
                    placeholder="Wedding Program"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    {TIMEZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => downloadCalendar()}
                    disabled={isLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isLoading ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick download section */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => downloadCalendar()}
            disabled={isLoading}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'Downloading...' : 'Download Complete Program'}
          </Button>
          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Show Details
          </Button>
        </div>

        {/* Calendar statistics */}
        {showStats && stats && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Calendar Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-900">
                  {stats.totalEvents}
                </div>
                <div className="text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-green-600">
                  {stats.upcomingEvents}
                </div>
                <div className="text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-gray-500">
                  {stats.pastEvents}
                </div>
                <div className="text-gray-600">Past</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-blue-600">
                  {stats.eventsIncludedInCalendar}
                </div>
                <div className="text-gray-600">In Calendar</div>
              </div>
            </div>

            {stats.nextEvent && (
              <div className="border-t pt-3">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-rose-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Next Event: {stats.nextEvent.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(stats.nextEvent.startTime).toLocaleString()}
                    </div>
                    {stats.nextEvent.location && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {stats.nextEvent.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed variant additional features */}
        {variant === 'detailed' && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Calendar App Instructions
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    📱 Mobile Devices
                  </div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>iPhone: Opens in Calendar app automatically</li>
                    <li>Android: Choose Google Calendar or default app</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    💻 Desktop Apps
                  </div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Outlook: File → Import → Calendar</li>
                    <li>Google Calendar: Settings → Import & Export</li>
                    <li>Apple Calendar: File → Import</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 text-sm font-medium">💡 Tip:</div>
                <div className="text-blue-700 text-sm">
                  The calendar file (.ics) works with all major calendar
                  applications including Google Calendar, Apple Calendar,
                  Outlook, and more. Events will include location details and
                  descriptions.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export additional components for specific use cases
export function QuickCalendarDownload({
  className = '',
}: {
  className?: string;
}) {
  return (
    <CalendarDownload
      variant="minimal"
      showStats={false}
      className={className}
    />
  );
}

export function DetailedCalendarDownload({
  className = '',
}: {
  className?: string;
}) {
  return (
    <CalendarDownload
      variant="detailed"
      showStats={true}
      className={className}
    />
  );
}
