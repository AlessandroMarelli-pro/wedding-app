'use client';

import { gsap } from 'gsap';
import React, { ReactNode, useEffect, useRef } from 'react';
import { cn } from 'src/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  flairClassName?: string;
  variant?: 'default' | 'stroke';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  strokeColor?: string;
  [key: string]: any; // Allow additional props to be passed through
}

export const MagneticButton = ({
  children,
  className,
  flairClassName,
  variant = 'default',
  onClick,
  disabled = false,
  type = 'button',
  strokeColor = 'bg-transparent',
  ...props
}: MagneticButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const button = buttonRef.current;
    const flair = flairRef.current;

    if (!button || !flair) return;

    // Initialize GSAP quick setters for performance
    const xSet = gsap.quickSetter(flair, 'xPercent');
    const ySet = gsap.quickSetter(flair, 'yPercent');

    // Get mouse position relative to button as percentage
    const getXY = (e: MouseEvent) => {
      const { left, top, width, height } = button.getBoundingClientRect();

      const xTransformer = gsap.utils.pipe(
        gsap.utils.mapRange(0, width, 0, 100),
        gsap.utils.clamp(0, 100),
      );

      const yTransformer = gsap.utils.pipe(
        gsap.utils.mapRange(0, height, 0, 100),
        gsap.utils.clamp(0, 100),
      );

      return {
        x: xTransformer(e.clientX - left),
        y: yTransformer(e.clientY - top),
      };
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const { x, y } = getXY(e);

      xSet(x);
      ySet(y);

      gsap.to(flair, {
        scale: 2,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const { x, y } = getXY(e);

      gsap.killTweensOf(flair);

      gsap.to(flair, {
        xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
        yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
        scale: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getXY(e);

      gsap.to(flair, {
        xPercent: x,
        yPercent: y,
        duration: 0.4,
        ease: 'power2',
      });
    };

    // Add event listeners
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mousemove', handleMouseMove);

    // Cleanup function
    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('mousemove', handleMouseMove);
      gsap.killTweensOf(flair);
    };
  }, [disabled]);

  const getButtonClasses = () => {
    const baseClasses =
      'relative cursor-pointer overflow-hidden inline-flex items-center justify-center font-semibold text-lg tracking-tight leading-tight ';

    if (variant === 'stroke') {
      return cn(
        baseClasses,
        'bg-transparent text-white rounded-full px-6 py-4',
        'hover:text-black transition-colors duration-150',
        'after:absolute after:inset-0 after:border-2 after:border-white after:rounded-full after:pointer-events-none after:bg-transparent',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      );
    }

    return cn(
      baseClasses,
      'rounded-full px-6 py-4',
      disabled && 'cursor-not-allowed opacity-50',
      className,
    );
  };

  const getFlairClasses = () => {
    if (variant === 'stroke') {
      return cn(
        'absolute inset-0 pointer-events-none transform-gpu scale-0',
        flairClassName,
      );
    }

    return cn(
      'absolute pointer-events-none rounded-full bg-transparent',
      'transform-gpu scale-0',
      flairClassName,
    );
  };

  const getFlairStyle = () => {
    if (variant === 'stroke') {
      return {
        transformOrigin: '0 0',
        willChange: 'transform',
      };
    }

    return {
      width: '100px',
      height: '100px',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      className={getButtonClasses()}
      {...props}
    >
      <div ref={flairRef} className={getFlairClasses()} style={getFlairStyle()}>
        {variant === 'stroke' && (
          <div
            className={cn('absolute rounded-full ', strokeColor)}
            style={{
              aspectRatio: '1/1',
              width: '170%',
              left: 0,
              top: 0,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
      <span className="relative z-10 text-center transition-colors duration-50 ">
        {children}
      </span>
    </button>
  );
};
