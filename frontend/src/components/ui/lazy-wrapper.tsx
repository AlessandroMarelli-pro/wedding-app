'use client';

import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface LazyWrapperProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string;
}

export function LazyWrapper({
  children,
  className,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  minHeight = '200px',
}: LazyWrapperProps) {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className={cn('w-full', className)} style={{ minHeight }}>
      {hasIntersected ? (
        children
      ) : (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
          {fallback || (
            <div className="animate-pulse bg-muted rounded-lg w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized lazy wrapper for images
interface LazyImageWrapperProps {
  children: ReactNode;
  className?: string;
  aspectRatio?: string;
}

export function LazyImageWrapper({
  children,
  className,
  aspectRatio = '16/9',
}: LazyImageWrapperProps) {
  return (
    <LazyWrapper
      className={cn('relative overflow-hidden', className)}
      minHeight="0"
      fallback={
        <div
          className="bg-muted animate-pulse rounded-lg w-full h-full flex items-center justify-center"
          style={{ aspectRatio }}
        >
          <span className="text-muted-foreground text-sm">
            Loading image...
          </span>
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
}

// Specialized lazy wrapper for cards
interface LazyCardWrapperProps {
  children: ReactNode;
  className?: string;
}

export function LazyCardWrapper({ children, className }: LazyCardWrapperProps) {
  return (
    <LazyWrapper
      className={cn('bg-card rounded-lg border shadow-sm', className)}
      minHeight="300px"
      fallback={
        <div className="p-6 space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
}
