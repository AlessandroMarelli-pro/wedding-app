import { cn } from '@/lib/utils';
import { WeddingInfo } from '../types/api';

interface WeddingPresentationProps {
  weddingInfo: WeddingInfo;
  className?: string;
}

export function WeddingPresentation({
  weddingInfo,
  className,
}: WeddingPresentationProps) {
  const weddingDate = new Date(weddingInfo.weddingDate);
  const isValidDate = !isNaN(weddingDate.getTime());

  return (
    <div className={cn('space-y-4', className)}>
      {/* Couple's Message */}
      <div className="text-[#F38181] container-responsive text-center  flex flex-col items-center justify-center p-10 ">
        <div className="py-4">
          <IconGalaxy className="lg:w-10 lg:h-10 w-5 h-5 animate-[spin_3s_linear_infinite]" />
        </div>
        <p className="  leading-relaxed font-light italic font-small text-justify text-lg">
          "{weddingInfo.presentationMessage}"
        </p>
        <div className="py-4">
          <IconGalaxy className="lg:w-10 lg:h-10 w-5 h-5 animate-[spin_3s_linear_infinite]" />
        </div>
        <span className="text-base lg:text-2xl font-bold">
          {weddingInfo.coupleNames}
        </span>
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
        <p className="text-2xl   text-white">The big day is here! 🎉</p>
      </div>
    );
  }

  return (
    <div className={cn('text-center container-responsive', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto">
        {[
          { label: 'Jours', value: timeLeft.days },
          { label: 'Heures', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Secondes', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="bg-card/60 rounded-lg p-3 sm:p-4 ">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-muted-white">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fix React import for countdown component
import { IconGalaxy } from '@tabler/icons-react';
import * as React from 'react';
