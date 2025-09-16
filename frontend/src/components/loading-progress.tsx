import { Progress } from '@/components/ui/progress';
import { useAppColor } from '@/hooks/useAppColor';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

type LoadingProgressProps = {
  isLoading: boolean;
};

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  isLoading,
}) => {
  const [progress, setProgress] = useState(0);
  const { color: appColor } = useAppColor();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isLoading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Simulate progress up to 90% while loading
          if (prev < 90) {
            return prev + Math.random() * 10;
          }
          return prev;
        });
      }, 300);
    } else {
      setProgress(100);
      // Optionally, hide after a short delay
      const timeout = setTimeout(() => setProgress(0), 400);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center space-y-4">
      <span className={cn('text-black text-5xl')}>Bienvenue</span>
      <span className={cn('text-black text-5xl')}>{progress} %</span>
      <Progress
        value={progress}
        className="h-1  w-[50%]"
        style={
          {
            '--progress-background': '#F38181',
            '--progress-foreground': appColor,
          } as React.CSSProperties
        }
      />
    </div>
  );
};
