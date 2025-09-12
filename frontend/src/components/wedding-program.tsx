import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib';
import { IconGalaxy } from '@tabler/icons-react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
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

export function WeddingProgram({ font }: { font: NextFontWithVariable }) {
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

  events.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return (
    <div className="w-full lg:h-full flex lg:flex-row flex-col justify-center items-center text-[#F38181] xl:gap-10 lg:gap-0 gap-10 py-10 lg:py-0">
      {events.map((item, index) => (
        <>
          <div
            id={item.id}
            className="flex flex-col justify-center items-center text-center space-y-4 pt-4 lg:pt-0"
          >
            <div
              className={cn(
                'text-3xl lg:text-4xl xl:text-6xl ',
                font.className,
              )}
            >
              {item.title}
            </div>
            <div className={cn('text-md lg:text-2xl xl:text-2xl ')}>
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
              <div className={cn('text-md lg:text-2xl xl:text-2xl ')}>
                {loc}
              </div>
            ))}
          </div>
          {index !== events.length - 1 && (
            <IconGalaxy className="lg:w-10 lg:h-10 w-5 h-5" />
          )}
        </>
      ))}
    </div>
  );
}
