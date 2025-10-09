import { UploadedImage, WeddingInfo } from '@/types/api';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { useEffect, useRef, useState } from 'react';
import { BrowserStylePainting } from './browser-style-painting';

export const WeddingHero = ({
  weddingInfo,
  heroImage,
  scrollToSection,
  font,
}: {
  weddingInfo: WeddingInfo;
  heroImage: UploadedImage;
  scrollToSection: (sectionId: string) => void;
  font: NextFontWithVariable;
}) => {
  const [imagePosition, setImagePosition] = useState<{
    offsetX: number;
    scaledWidth: number;
    containerWidth: number;
    svgWidth: number;
    svgHeight: number;
  } | null>(null);

  const textElementsRef = useRef<{
    coupleNames: HTMLHeadingElement | null;
    heroMessage: HTMLHeadingElement | null;
    heroAddress: HTMLHeadingElement | null;
  }>({
    coupleNames: null,
    heroMessage: null,
    heroAddress: null,
  });

  const handlePositionUpdate = (position: {
    offsetX: number;
    scaledWidth: number;
    containerWidth: number;
    svgWidth: number;
    svgHeight: number;
  }) => {
    console.log(position);
    setImagePosition(position);

    // Use GSAP for smooth responsive positioning
    const rightEdgePercent = calculateRightEdgePosition(position);

    // Animate text elements to new positions smoothly
    gsap.to(textElementsRef.current.coupleNames, {
      left: `${rightEdgePercent}%`,
      duration: 0.3,
      ease: 'power2.out',
    });

    gsap.to(textElementsRef.current.heroMessage, {
      left: `${rightEdgePercent}%`,
      duration: 0.3,
      ease: 'power2.out',
    });

    gsap.to(textElementsRef.current.heroAddress, {
      left: `${rightEdgePercent}%`,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

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
          fontSize: '2rem',
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

    // Split text animations
    // Set initial opacity for all h1 elements
    gsap.set('h1', { opacity: 1 });

    // Animate coupleNames
    if (textElementsRef.current.coupleNames) {
      const coupleNamesSplit = SplitText.create(
        textElementsRef.current.coupleNames,
        { type: 'chars' },
      );
      gsap.from(coupleNamesSplit.chars, {
        y: 20,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out',
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
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.3, // Slight delay after coupleNames
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
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.6, // Delay after heroMessage
      });
    }

    return () => mm.revert();
  }, []);

  return (
    <div className="relative w-full h-screen bg-theme-default overflow-hidden">
      <BrowserStylePainting
        src="/images/aqua.svg"
        alt="Ariane and Timothé"
        className="absolute inset-0"
        duration={4000}
        delay={50}
        pathDelay={200}
        useSetMode={true}
        setPercentage={4}
      />
      <h1
        ref={(el) => {
          textElementsRef.current.coupleNames = el;
        }}
        id="couple-names"
        className="absolute text-theme-accent-dark font-bold top-[calc(9%)] roundhand-regular z-10 w-max"
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
        className="absolute text-theme-blue font-bold bottom-[calc(10%)] roundhand-bold z-10"
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
        className="absolute text-theme-blue font-bold bottom-[calc(3%)] roundhand-regular z-10"
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
