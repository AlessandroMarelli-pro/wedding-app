import { cn } from '@/lib/utils';
import parse from 'html-react-parser';
import { WeddingInfo } from '../types/api';
// Fix React import for countdown component
import { IconGalaxy } from '@tabler/icons-react';
import Image from 'next/image';
import * as React from 'react';
import { DivWithAnimation } from './animations';

interface WeddingPresentationProps {
  weddingInfo: WeddingInfo;
  className?: string;
}

export function WeddingPresentation({
  weddingInfo,
  className,
}: WeddingPresentationProps) {
  const presentationMessage =
    '<span>' +
    weddingInfo.presentationMessage?.trim().replace(/(?:\r\n|\r|\n)/g, '<br>') +
    '</span>';
  return (
    <div className={cn('space-y-4', className)}>
      {' '}
      <div className="flex flex-col items-center justify-center min-h-10" />
      {/* Couple's Message */}
      <DivWithAnimation className="text-theme-accent-dark  text-center  flex flex-col xl:flex-row items-center justify-center  p-10 gap-6 xl:h-screen pt-0">
        <div className="xl:m-10 ">
          <Image
            src={'/images/couple.jpeg'}
            alt={'couple'}
            width={6000}
            height={600}
            className="object-cover w-full shadow-xl"
          />
        </div>
        <div className="container-responsive flex flex-col items-center justify-center gap-6">
          <div>
            <IconGalaxy className="xl:w-10 xl:h-10 w-8 h-8 animate-[spin_3s_linear_infinite]" />
          </div>
          <p className=" leading-relaxed font-light italic font-small text-justify text-lg">
            {parse(presentationMessage)}
          </p>
          <div>
            <IconGalaxy className="xl:w-10 xl:h-10 w-8 h-8 animate-[spin_3s_linear_infinite]" />
          </div>
          <span className="text-3xl xl:text-4xl font-bold roundhand-bold">
            {weddingInfo.coupleNames}
          </span>
        </div>
      </DivWithAnimation>
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
