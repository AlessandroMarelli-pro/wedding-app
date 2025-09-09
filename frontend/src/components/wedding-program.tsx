import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import TimelineComponent from './timeline-layout';

interface ProgramEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  displayOrder: number;
  includeInCalendar: boolean;
}

export function WeddingProgram() {
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/program`,
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(
          data.sort(
            (a: ProgramEvent, b: ProgramEvent) =>
              a.displayOrder - b.displayOrder,
          ),
        );
      }
    } catch (error) {
      console.error('Error fetching program:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calendar download is now handled by the QuickCalendarDownload component

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
        <CardContent className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">
            The wedding program will be available soon.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back closer to the date for the detailed schedule of events.
          </p>
        </CardContent>
      </Card>
    );
  }
  const items = events.map((event) => ({
    id: event.id,
    date: new Date(event.startTime).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    }),
    title: event.title,
    description: event.description,
    location: event.location,
  }));
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <TimelineComponent items={items} />
    </div>
  );
}
