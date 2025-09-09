import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { QuickCalendarDownload } from './calendar-download';

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

  return (
    <div className="max-h-screen overflow-y-auto">
      <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-8">
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index < events.length - 1 && (
                  <div className="absolute left-8 top-16 w-px h-16 bg-gradient-to-b from-rose-300 to-pink-300"></div>
                )}

                <div className="flex items-start space-x-6">
                  {/* Time indicator */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="flex-grow">
                    <Card className="bg-card/80 border shadow-md">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <h3 className="text-xl  text-foreground">
                            {event.title}
                          </h3>
                          <div className="text-rose-600 font-medium text-sm sm:text-base flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(event.startTime)} -{' '}
                            {formatTime(event.endTime)}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {event.description}
                        </p>

                        <Separator className="mb-4" />

                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2 text-rose-500" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced calendar download */}
      <div className="flex justify-center">
        <QuickCalendarDownload className="bg-card/60 backdrop-blur-sm border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 shadow-md hover:shadow-lg" />
      </div>
    </div>
  );
}
