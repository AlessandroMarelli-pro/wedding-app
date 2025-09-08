import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface WeddingInfo {
  id: string;
  coupleNames: string;
  weddingDate: string;
  weddingAddress: string;
  presentationMessage: string;
  locationDirections?: string;
  ceremonyTime?: string;
  receptionTime?: string;
  dressCode?: string;
  specialInstructions?: string;
}

interface WeddingPresentationProps {
  weddingInfo: WeddingInfo;
  onRSVPClick?: () => void;
  className?: string;
}

export function WeddingPresentation({
  weddingInfo,
  onRSVPClick,
  className,
}: WeddingPresentationProps) {
  const weddingDate = new Date(weddingInfo.weddingDate);
  const isValidDate = !isNaN(weddingDate.getTime());

  return (
    <div className={cn('space-y-8 sm:space-y-12', className)}>
      {/* Couple's Message */}
      <div className="text-center container-responsive">
        <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg border">
          <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-rose-500 mx-auto mb-4 sm:mb-6" />
          <p className="text-responsive text-muted-foreground leading-relaxed font-light italic">
            "{weddingInfo.presentationMessage}"
          </p>
          <div className="mt-6 sm:mt-8">
            <p className="text-lg sm:text-xl md:text-2xl font-serif text-foreground">
              With love,
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground mt-2">
              {weddingInfo.coupleNames}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {(weddingInfo.dressCode || weddingInfo.specialInstructions) && (
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {weddingInfo.dressCode && (
              <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="heading-responsive font-serif">
                    Dress Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-responsive text-muted-foreground">
                    {weddingInfo.dressCode}
                  </p>
                </CardContent>
              </Card>
            )}

            {weddingInfo.specialInstructions && (
              <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="heading-responsive font-serif">
                    Special Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-responsive text-muted-foreground whitespace-pre-line">
                    {weddingInfo.specialInstructions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* RSVP Call to Action */}
      <div className="text-center container-responsive">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border">
          <h3 className="heading-responsive font-serif text-foreground mb-4">
            Can't wait to celebrate with you!
          </h3>
          <p className="text-responsive text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Please let us know if you'll be joining us for our special day. Your
            presence would make our celebration complete.
          </p>
          <Button
            size="lg"
            onClick={onRSVPClick}
            className="touch-target bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-6 sm:px-8 py-3 text-responsive font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            RSVP Now
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CountdownProps {
  targetDate: string;
  className?: string;
}

export function WeddingCountdown({ targetDate, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return null;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className={cn('text-center', className)}>
        <p className="text-2xl font-serif text-foreground">
          The big day is here! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className={cn('text-center container-responsive', className)}>
      <h3 className="heading-responsive font-serif text-foreground mb-6">
        Counting down to our special day
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card/60 rounded-lg p-3 sm:p-4 border"
          >
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fix React import for countdown component
import * as React from 'react';
