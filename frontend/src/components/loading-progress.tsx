import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import React, { useEffect, useState } from 'react';

type LoadingProgressProps = {
  endFunction: () => any;
  bilbo: NextFontWithVariable;
};

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  endFunction,
  bilbo,
}) => {
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    const interval: NodeJS.Timeout | null = null;

    // Remove any anchor from the URL on page load
    if (window.location.hash) {
      // Remove the hash from URL without triggering scroll
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Ensure we're at the top of the page
    window.scrollTo(0, 0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          endFunction();

          // Hide progress bar after completion
          setTimeout(() => {
            setShowProgress(false);
          }, 100);
          return 100;
        }
        return prev + 10;
      });
    }, 20);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <>
      <motion.div
        animate={{
          x: showProgress ? '0%' : '-100%',
        }}
        exit={{
          opacity: 0,
          display: 'none',
        }}
        transition={{ duration: 1, delay: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
        className="fixed left-0  z-[500] w-[50%] h-full bg-theme-accent flex flex-col items-center justify-center space-y-4"
      ></motion.div>

      <motion.div
        animate={{ x: showProgress ? '0%' : '100%' }}
        transition={{ duration: 1, delay: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
        exit={{
          opacity: 0,
          display: 'none',
        }}
        className="fixed right-0  z-[500]  w-[50%] h-full bg-theme-accent flex flex-col items-center justify-center space-y-4"
      ></motion.div>

      {showProgress && (
        <div className="absolute top-0  z-[500] min-h-screen w-full bg-transparent flex flex-col items-center justify-center space-y-4">
          <span className={cn(bilbo.className, 'text-white text-5xl')}>
            Bienvenue
          </span>

          <Progress
            value={progress}
            className="h-1  w-[50%]"
            style={
              {
                '--progress-background': '#F38181',
                '--progress-foreground': 'white',
              } as React.CSSProperties
            }
          />
        </div>
      )}
    </>
  );
};
