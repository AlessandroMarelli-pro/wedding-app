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
  const indicatorsRef = useRef<HTMLDivElement[]>([]);
  const letterRefs = useRef<HTMLSpanElement[][]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);

  // Initialize GSAP animations
  useEffect(() => {
    if (!sliderRef.current || accommodations.length === 0) return;

    const slides = slidesRef.current;
    const indicators = indicatorsRef.current;

    // Set initial positions - only show first slide
    slides.forEach((slide, slideIndex) => {
      if (slide) {
        gsap.set(slide, {
          x: slideIndex === 0 ? '0%' : '100%',
        });
      }
    });

    // Set initial indicator states
    indicators.forEach((indicator, indicatorIndex) => {
      if (indicator) {
        gsap.set(indicator, {
          width: indicatorIndex === 0 ? '100%' : '67%',
          opacity: indicatorIndex === 0 ? 1 : 0.5,
        });
      }
    });

    // Set initial letter states
    letterRefs.current.forEach((letters, slideIndex) => {
      if (letters) {
        letters.forEach((letter) => {
          if (letter) {
            gsap.set(letter, {
              opacity: slideIndex === 0 ? 1 : 0.5,
            });
          }
        });
      }
    });
  }, [accommodations.length]);

  // Helper function to split text into individual letters
  const splitIntoLetters = (text: string, slideIndex: number) => {
    return text.split('').map((char, letterIndex) => (
      <span
        key={`${slideIndex}-${letterIndex}`}
        ref={(el) => {
          if (el) {
            if (!letterRefs.current[slideIndex]) {
              letterRefs.current[slideIndex] = [];
            }
            letterRefs.current[slideIndex][letterIndex] = el;
          }
        }}
        className="inline-block"
        style={{ opacity: slideIndex === currentSlide ? 1 : 0.5 }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  const slideToIndex = (index: number) => {
    if (isAnimating || !slidesRef.current[index] || index === currentSlide)
      return;

    const slides = slidesRef.current;
    const indicators = indicatorsRef.current;
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

        // Reset indicator animations
        indicators.forEach((indicator, indicatorIndex) => {
          if (indicator) {
            if (indicatorIndex === index) {
              gsap.set(indicator, { width: '100%', opacity: 1 });
            } else {
              gsap.set(indicator, { width: '67%', opacity: 0.5 });
            }
          }
        });

        // Reset letter animations
        letterRefs.current.forEach((letters, slideIndex) => {
          if (letters) {
            letters.forEach((letter) => {
              if (letter) {
                gsap.set(letter, {
                  opacity: slideIndex === index ? 1 : 0.5,
                });
              }
            });
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

    // Animate indicators during transition
    indicators.forEach((indicator, indicatorIndex) => {
      if (indicator) {
        if (indicatorIndex === index) {
          // Growing indicator for target slide
          tl.to(
            indicator,
            {
              width: '100%',
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
            },
            0,
          ).to(
            indicator,
            {
              width: '100%',
              opacity: 1,
              duration: 0.4,
              ease: 'power2.in',
            },
            0.4,
          );
        } else if (indicatorIndex === currentSlide) {
          // Shrinking indicator for current slide
          tl.to(
            indicator,
            {
              width: '67%',
              opacity: 0.3,
              duration: 0.4,
              ease: 'power2.out',
            },
            0,
          ).to(
            indicator,
            {
              width: '67%',
              opacity: 0.5,
              duration: 0.4,
              ease: 'power2.in',
            },
            0.4,
          );
        } else {
          // Other indicators stay in their current state
          tl.to(
            indicator,
            {
              width: '67%',
              opacity: 0.5,
              duration: 0.8,
              ease: 'power2.inOut',
            },
            0,
          );
        }
      }
    });

    // Animate letters during transition with direction awareness
    letterRefs.current.forEach((letters, slideIndex) => {
      if (letters) {
        letters.forEach((letter, letterIndex) => {
          if (letter) {
            if (slideIndex === index) {
              // Letters for target slide - fade in with direction-based stagger
              const staggerDelay =
                direction > 0
                  ? letterIndex * 0.05 // Left to right for forward direction
                  : (letters.length - 1 - letterIndex) * 0.05; // Right to left for backward direction

              tl.to(
                letter,
                {
                  opacity: 1,
                  duration: 0.3,
                  ease: 'power2.out',
                  delay: staggerDelay,
                },
                0.2,
              );
            } else if (slideIndex === currentSlide) {
              // Letters for current slide - fade out with same direction stagger as target slide
              const staggerDelay =
                direction > 0
                  ? letterIndex * 0.03 // Left to right for forward direction (same as target)
                  : (letters.length - 1 - letterIndex) * 0.03; // Right to left for backward direction (same as target)

              tl.to(
                letter,
                {
                  opacity: 0.5,
                  duration: 0.3,
                  ease: 'power2.out',
                  delay: staggerDelay,
                },
                0,
              );
            } else {
              // Other slides stay dimmed
              tl.to(
                letter,
                {
                  opacity: 0.5,
                  duration: 0.8,
                  ease: 'power2.inOut',
                },
                0,
              );
            }
          }
        });
      }
    });
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
        'relative w-full lg:h-[75vh] h-screen bg-theme-muted overflow-hidden',
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
            <div className="flex flex-col lg:flex-row p-5 items-start justify-center  gap-5">
              {/* Background Image */}
              <div className="h-full flex flex-row lg:flex-col gap-4 flex-wrap lg:w-1/2 ">
                <div className="flex flex-row lg:gap-10 gap-1 lg:flex-wrap flex-nowrapjustify-end overflow-x-scroll">
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
                          className="object-cover rounded-lg shadow-lg aspect-video lg:max-w-[47%] max-w-[90%] hover:scale-105 transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            window.open(accommodation.sourceUrl, '_blank');
                          }}
                        />
                      ))}
                </div>
              </div>

              {/* Content Overlay */}
              <div className="inset-0 flex flex-col items-center justify-start text-theme-accent-dark lg:max-h-[50vh] lg:w-1/2">
                <div className="flex flex-col lg:flex-row justify-between items-left  text-theme-accent-dark ">
                  <div className="text-left space-y-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between items-left">
                      <h3 className="font-bold text-lg lg:text-2xl">
                        {accommodation.name}
                      </h3>
                      <LinkPreview
                        width={300}
                        height={200}
                        url={accommodation.sourceUrl || ''}
                        className=" py-3  rounded-full font-bold text-sm lg:text-base underline z-[1000]"
                        side="bottom"
                        align="end"
                      >
                        Voir l'annonce
                      </LinkPreview>
                    </div>
                    <p className="text-sm lg:text-md text-justify max-h-[200px] overflow-y-scroll lg:max-h-none lg:overflow-y-hidden">
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
      <div className="absolute bottom-0 lg:bottom-10 left-6  md:left-6 flex flex-row gap-6 md:gap-8 z-10 w-full justify-center lg:justify-start overflow-x-scroll">
        {/* Slide Indicators */}
        <div className="flex flex-row gap-6 md:gap-8">
          {accommodations.map((accommodation, index) => (
            <div
              key={index}
              onClick={() => {
                setAutoAdvanceEnabled(false);
                slideToIndex(index);
              }}
              className={cn('flex flex-col items-start cursor-pointer ')}
            >
              <span className="text-theme-accent-dark font-bold text-base md:text-lg mb-5">
                {splitIntoLetters(accommodation.name, index)}
              </span>
              <div
                id={`accommodation-slider-indicator-${index}`}
                ref={(el) => {
                  if (el) {
                    indicatorsRef.current[index] = el;
                  }
                }}
                className={cn(
                  'h-1 bg-theme-accent-dark/50 relative overflow-hidden',
                )}
                style={{
                  transformOrigin: 'left center',
                }}
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
