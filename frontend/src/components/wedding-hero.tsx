import { UploadedImage, WeddingInfo } from '@/types/api';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { useEffect, useRef, useState } from 'react';
import { BrowserStylePainting } from './browser-style-painting';

export const WeddingHero = ({
  weddingInfo,
  heroImage,
  font,
}: {
  weddingInfo: WeddingInfo;
  heroImage: UploadedImage;
  font: NextFontWithVariable;
}) => {
  const [imagePosition, setImagePosition] = useState<{
    offsetX: number;
    scaledWidth: number;
    containerWidth: number;
    svgWidth: number;
    svgHeight: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const textElementsRef = useRef<{
    coupleNames: HTMLHeadingElement | null;
    heroMessage: HTMLHeadingElement | null;
    heroAddress: HTMLHeadingElement | null;
  }>({
    coupleNames: null,
    heroMessage: null,
    heroAddress: null,
  });

  // Calculate right edge position of the image
  const calculateRightEdgePosition = (position: {
    offsetX: number;
    scaledWidth: number;
    containerWidth: number;
  }) => {
    // SVG is centered, so right edge = center + (SVG width / 2)
    const center = 50; // 50% is the center
    const svgWidthPercent =
      (position.scaledWidth / position.containerWidth) * 100;
    const rightEdge = center + svgWidthPercent / 2;
    return rightEdge;
  };

  const getRightEdgePosition = () => {
    if (!imagePosition) return '50%';
    return `${calculateRightEdgePosition(imagePosition)}%`;
  };

  // GSAP responsive setup
  useEffect(() => {
    // Register SplitText plugin
    gsap.registerPlugin(SplitText);

    // Set initial opacity for all h1 elements to prevent flash
    gsap.set('h1', { opacity: 0 });

    // Set up responsive animations with GSAP
    const mm = gsap.matchMedia();

    mm.add('(max-width: 768px)', () => {
      // Mobile responsive settings
      gsap.set(
        [
          textElementsRef.current.coupleNames,
          textElementsRef.current.heroMessage,
          textElementsRef.current.heroAddress,
        ],
        {
          fontSize: '3rem',
        },
      );
    });

    mm.add('(min-width: 769px)', () => {
      // Desktop responsive settings
      gsap.set([textElementsRef.current.coupleNames], {
        fontSize: '4rem',
      });
      gsap.set(
        [
          textElementsRef.current.heroMessage,
          textElementsRef.current.heroAddress,
        ],
        {
          fontSize: '3rem',
        },
      );
    });

    // Trigger loaded state after a short delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      mm.revert();
      clearTimeout(timer);
    };
  }, []);

  // Separate useEffect for animations that depends on isLoaded
  useEffect(() => {
    if (!isLoaded) return;
    gsap.set('h1', { opacity: 1 });
    // Split text animations - only run when loaded
    // Animate coupleNames - start after SVG begins drawing
    if (textElementsRef.current.coupleNames) {
      const coupleNamesSplit = SplitText.create(
        textElementsRef.current.coupleNames,
        { type: 'chars' },
      );
      gsap.from(coupleNamesSplit.chars, {
        y: 20,
        autoAlpha: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8, // Start after SVG drawing begins
      });
    }

    // Animate heroMessage
    if (textElementsRef.current.heroMessage) {
      const heroMessageSplit = SplitText.create(
        textElementsRef.current.heroMessage,
        { type: 'chars' },
      );
      gsap.from(heroMessageSplit.chars, {
        y: 20,
        autoAlpha: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.2, // Staggered after coupleNames
      });
    }

    // Animate heroAddress
    if (textElementsRef.current.heroAddress) {
      const heroAddressSplit = SplitText.create(
        textElementsRef.current.heroAddress,
        { type: 'chars' },
      );
      gsap.from(heroAddressSplit.chars, {
        y: 20,
        autoAlpha: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.6, // Final text element
      });
    }
  }, [isLoaded]);

  return (
    <div className="relative w-full h-screen bg-theme-default overflow-hidden">
      {/* Loading indicator */}

      <BrowserStylePainting
        src="/images/aqua.svg"
        alt="Ariane and Timothé"
        className="absolute inset-0"
        duration={2000}
        delay={200}
        pathDelay={5}
        progressivePercentage={10}
        drawablePercentage={1}
        batchDelay={30}
        offsetYDivider={4}
      />
      <h1
        ref={(el) => {
          textElementsRef.current.coupleNames = el;
        }}
        id="couple-names"
        className="absolute text-theme-accent-dark font-bold top-15 roundhand-regular z-10 w-max  "
        style={{
          left: imagePosition ? getRightEdgePosition() : '50%',
          transform: imagePosition ? 'translateX(-100%)' : 'translateX(-50%)',
        }}
      >
        {weddingInfo.coupleNames}
      </h1>
      <h1
        ref={(el) => {
          textElementsRef.current.heroMessage = el;
        }}
        id="hero-message"
        className="absolute text-theme-blue font-bold sm:bottom-15 bottom-[calc(25%)] roundhand-regular z-10 w-max "
        style={{
          left: imagePosition ? getRightEdgePosition() : '50%',
          transform: imagePosition ? 'translateX(-100%)' : 'translateX(-50%)',
        }}
      >
        {weddingInfo.heroMessage}
      </h1>
      <h1
        ref={(el) => {
          textElementsRef.current.heroAddress = el;
        }}
        id="hero-address"
        className="absolute text-theme-blue font-bold sm:bottom-0 bottom-[calc(15%)] roundhand-regular z-10 w-max"
        style={{
          left: imagePosition ? getRightEdgePosition() : '50%',
          transform: imagePosition ? 'translateX(-100%)' : 'translateX(-50%)',
        }}
      >
        {weddingInfo.heroAddress}
      </h1>
    </div>
  );
};
