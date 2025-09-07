import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Heart, MapPin } from 'lucide-react';

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
    <div className={cn('space-y-12', className)}>
      {/* Couple's Message */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-6" />
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light italic">
            "{weddingInfo.presentationMessage}"
          </p>
          <div className="mt-8">
            <p className="text-2xl font-serif text-foreground">With love,</p>
            <p className="text-3xl font-serif text-foreground mt-2">
              {weddingInfo.coupleNames}
            </p>
          </div>
        </div>
      </div>

      {/* Wedding Details Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Date & Time */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-serif">When</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isValidDate && (
              <>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {weddingDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {weddingInfo.ceremonyTime && (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Ceremony: {weddingInfo.ceremonyTime}</span>
                  </div>
                )}

                {weddingInfo.receptionTime && (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Reception: {weddingInfo.receptionTime}</span>
                  </div>
                )}
              </>
            )}

            {!isValidDate && (
              <p className="text-muted-foreground">Date to be announced</p>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-serif">Where</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-foreground leading-relaxed">
              {weddingInfo.weddingAddress}
            </p>

            {weddingInfo.locationDirections && (
              <div className="text-sm text-muted-foreground">
                <Separator className="my-4" />
                <p className="whitespace-pre-line">
                  {weddingInfo.locationDirections}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {(weddingInfo.dressCode || weddingInfo.specialInstructions) && (
        <div className="grid md:grid-cols-2 gap-8">
          {weddingInfo.dressCode && (
            <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-serif">Dress Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{weddingInfo.dressCode}</p>
              </CardContent>
            </Card>
          )}

          {weddingInfo.specialInstructions && (
            <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-serif">
                  Special Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground whitespace-pre-line">
                  {weddingInfo.specialInstructions}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* RSVP Call to Action */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8 border">
          <h3 className="text-2xl font-serif text-foreground mb-4">
            Can't wait to celebrate with you!
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Please let us know if you'll be joining us for our special day. Your
            presence would make our celebration complete.
          </p>
          <Button
            size="lg"
            onClick={onRSVPClick}
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
    <div className={cn('text-center', className)}>
      <h3 className="text-xl font-serif text-foreground mb-6">
        Counting down to our special day
      </h3>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="bg-card/60 rounded-lg p-4 border">
            <div className="text-2xl font-bold text-foreground">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fix React import for countdown component
import * as React from 'react';
