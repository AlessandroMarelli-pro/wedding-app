'use client';

import { cn } from '@/lib/utils';
import { Accommodation } from '@/types/api';
import { gsap } from 'gsap';
import parse from 'html-react-parser';
import { useEffect, useRef, useState } from 'react';
import { LinkPreview } from './ui/link-preview';

interface AccommodationSliderProps {
  accommodations: Accommodation[];
  className?: string;
}

export default function AccommodationSlider({
  accommodations,
  className,
}: AccommodationSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);

  // Initialize GSAP animations
  useEffect(() => {
    if (!sliderRef.current || accommodations.length === 0) return;

    const slides = slidesRef.current;

    // Set initial positions - only show first slide
    slides.forEach((slide, slideIndex) => {
      if (slide) {
        gsap.set(slide, {
          x: slideIndex === 0 ? '0%' : '100%',
        });
      }
    });
  }, [accommodations.length]);

  const slideToIndex = (index: number) => {
    if (isAnimating || !slidesRef.current[index] || index === currentSlide)
      return;

    const slides = slidesRef.current;
    const targetSlide = slides[index];
    const currentSlideElement = slides[currentSlide];

    if (!targetSlide || !currentSlideElement) {
      return;
    }

    setIsAnimating(true);

    // Determine slide direction
    const direction = index > currentSlide ? 1 : -1;

    // Create timeline for coordinated animation
    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        setCurrentSlide(index);

        // Reset all slides to proper positions
        slides.forEach((slide, slideIndex) => {
          if (slide) {
            if (slideIndex === index) {
              gsap.set(slide, { x: '0%' });
            } else {
              gsap.set(slide, { x: '100%' });
            }
          }
        });
      },
    });

    // Position target slide off-screen first
    tl.set(targetSlide, { x: direction > 0 ? '100%' : '-100%' })
      // Animate both slides simultaneously
      .to(
        currentSlideElement,
        {
          x: direction > 0 ? '-100%' : '100%',
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0,
      )
      .to(
        targetSlide,
        {
          x: '0%',
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0,
      );
  };

  const nextSlide = () => {
    setAutoAdvanceEnabled(false); // Disable auto-advance when user interacts
    const next = (currentSlide + 1) % accommodations.length;
    slideToIndex(next);
  };

  if (accommodations.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-96', className)}>
        <p className="text-theme-accent-dark">Aucun hébergement disponible</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full h-[75vh] bg-theme-muted overflow-hidden',
        className,
      )}
    >
      {/* Global Slider Container for GSAP */}
      <div
        ref={sliderRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-theme-accent"
      >
        {accommodations.map((accommodation, index) => (
          <div
            key={accommodation.id}
            ref={(el) => {
              if (el) {
                slidesRef.current[index] = el;
              }
            }}
            className="absolute top-0 left-0 w-full h-full "
          >
            <div className="flex flex-row p-5 items-start justify-center  gap-5">
              {/* Background Image */}
              <div className="h-full flex flex-col gap-4 flex-wrap w-1/2 ">
                <div className="flex flex-row gap-10 flex-wrap justify-end ">
                  {accommodation.imagesUrl &&
                    accommodation.imagesUrl.split(',').length > 0 &&
                    accommodation.imagesUrl
                      .split(',')
                      .slice(0, 4)
                      .map((image) => (
                        <img
                          key={image}
                          src={image}
                          width={1000}
                          height={1000}
                          alt={accommodation.name}
                          className="object-cover rounded-lg shadow-lg aspect-video max-w-[47%] hover:scale-105 transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            window.open(accommodation.sourceUrl, '_blank');
                          }}
                        />
                      ))}
                </div>
              </div>

              {/* Content Overlay */}
              <div className="inset-0 flex flex-col items-center justify-start text-theme-accent-dark max-h-[50vh] w-1/2">
                <div className="flex justify-between items-left  text-theme-accent-dark ">
                  <div className="text-left space-y-4">
                    <div className="flex flex-row items-center justify-between items-left">
                      <h3 className="font-bold text-lg lg:text-2xl">
                        {accommodation.name}
                      </h3>
                      <LinkPreview
                        width={300}
                        height={200}
                        url={accommodation.sourceUrl || ''}
                        className=" py-3  rounded-full font-bold text-sm lg:text-base underline z-[1000]"
                        side="bottom"
                      >
                        Voir l'annonce
                      </LinkPreview>
                    </div>
                    <p className="text-sm lg:text-md text-justify ">
                      {parse(
                        accommodation.description?.replace(
                          /(?:\r\n|\r|\n)/g,
                          '<br>',
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-6 md:bottom-10 md:left-6 flex flex-col md:flex-row gap-6 md:gap-8 z-10">
        {/* Slide Indicators */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {accommodations.map((accommodation, index) => (
            <div
              key={index}
              onClick={() => {
                setAutoAdvanceEnabled(false);
                slideToIndex(index);
              }}
              className={cn(
                'flex flex-col items-start cursor-pointer transition-opacity duration-500',
                index === currentSlide ? 'opacity-100' : 'opacity-50',
              )}
            >
              <span className="text-theme-accent-dark font-bold text-base md:text-lg mb-5 transition-opacity duration-500">
                {accommodation.name}
              </span>
              <div
                className={cn(
                  'h-1 bg-theme-accent-dark/50 relative overflow-hidden transition-all duration-500',
                  index === currentSlide
                    ? 'w-24 md:w-48 opacity-100'
                    : 'w-16 md:w-32 opacity-50',
                )}
              >
                <div
                  className={cn(
                    'absolute top-0 left-0 h-full bg-theme-accent-dark transition-transform duration-500',
                    index === currentSlide
                      ? 'translate-x-0'
                      : '-translate-x-full',
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
