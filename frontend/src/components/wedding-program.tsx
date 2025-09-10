import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib';
import { IconCarambolaFilled } from '@tabler/icons-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Parisienne } from 'next/font/google';
import { useEffect, useState } from 'react';

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
const bilbo = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bilbo',
});

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
  events.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
  const images = [
    '/images/program/4.jpeg',
    '/images/program/3.jpeg',
    '/images/program/2.jpeg',
    '/images/program/1.jpg',
  ];
  const content = events.map((item, i) => ({
    description: (
      <>
        <div className="flex flex-row space-x-4">
          <time className="font-medium ">
            {new Date(item.startTime).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: false,
            })}
          </time>
        </div>
        <p>{item.description}</p>
        <div className="text-left">
          <span className="text-sm  pr-1">📍</span>
          <span className=" text-sm">{item.location}</span>
        </div>
      </>
    ),
    title: item.title,
    image: images[i],
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
        {item.description}
      </div>
    ),
  }));
  return (
    <div className="w-full h-full flex flex-row justify-center items-center text-[#F38181] gap-10">
      {events.map((item, index) => (
        <>
          <div
            id={item.id}
            className="flex flex-col justify-center items-center text-center space-y-4"
          >
            <div className={cn('text-6xl ', bilbo.className)}>{item.title}</div>
            <div className={cn('text-2xl fraunces-regular')}>
              {new Date(item.startTime).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: false,
              })}
            </div>
            {item.location.split(',').map((loc) => (
              <div className={cn('text-xl ')}>{loc}</div>
            ))}
          </div>
          {index !== events.length - 1 && <IconCarambolaFilled />}
        </>
      ))}
    </div>
  );
}
