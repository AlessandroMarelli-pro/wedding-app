import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import React, { useEffect, useState } from 'react';

type LoadingProgressProps = {
  endFunction: () => any;
  bilbo: NextFontWithVariable;
  isLoading: boolean;
};

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  endFunction,
  bilbo,
  isLoading,
}) => {
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    // Remove any anchor from the URL on page load
    if (window.location.hash) {
      // Remove the hash from URL without triggering scroll
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Ensure we're at the top of the page
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let finishInterval: NodeJS.Timeout | null = null;
    let loadingInterval: NodeJS.Timeout | null = null;

    if (!isLoading && progress < 100) {
      // When loading is complete, finish the progress animation
      finishInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 20; // Faster animation to complete quickly
        });
      }, 10);
    } else if (isLoading && progress < 90) {
      // While loading, gradually increase progress but don't reach 100%
      loadingInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90 || !isLoading) {
            return prev;
          }
          return prev + 2;
        });
      }, 50);
    }

    return () => {
      if (finishInterval) clearInterval(finishInterval);
      if (loadingInterval) clearInterval(loadingInterval);
    };
  }, [isLoading, progress, endFunction]);

  // Separate effect to handle completion when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !isLoading) {
      // Hide progress bar after completion
      setTimeout(() => {
        endFunction();
        setShowProgress(false);
      }, 500);
    }
  }, [progress, isLoading, endFunction]);

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
          <span
            className={cn(bilbo.className, 'text-theme-accent-dark text-5xl')}
          >
            Bienvenue
          </span>

          <Progress
            value={progress}
            className="h-1  w-[50%] text-theme-accent-dark"
            style={
              {
                '--progress-background': '#F38181',
                '--progress-foreground': 'var(--color-theme-accent-dark)',
              } as React.CSSProperties
            }
          />
        </div>
      )}
    </>
  );
};
