'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0,
    rootMargin = '0px',
    freezeOnceVisible = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already intersected and freezeOnceVisible is true, don't observe again
    if (hasIntersected && freezeOnceVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, freezeOnceVisible, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

// Hook for lazy loading images
export function useLazyImage(
  src: string,
  options: UseIntersectionObserverOptions = {},
) {
  const { ref, isIntersecting, hasIntersected } =
    useIntersectionObserver(options);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isIntersecting && !imageSrc && !hasError) {
      setIsLoading(true);
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc, hasError]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return {
    ref,
    imageSrc,
    isLoading,
    hasError,
    hasIntersected,
    handleLoad,
    handleError,
  };
}

// Hook for lazy loading components
export function useLazyComponent(options: UseIntersectionObserverOptions = {}) {
  const { ref, isIntersecting, hasIntersected } =
    useIntersectionObserver(options);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isIntersecting && !shouldRender) {
      setShouldRender(true);
    }
  }, [isIntersecting, shouldRender]);

  return {
    ref,
    shouldRender,
    hasIntersected,
  };
}
