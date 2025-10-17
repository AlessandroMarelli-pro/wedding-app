import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

interface EasterEggConfig {
  clickCount: number;
  timeWindow: number; // milliseconds
  flipDuration: number; // seconds
  imageSrc: string;
  imageAlt: string;
  text?: string; // Optional text to display under the image
}

const defaultConfig: EasterEggConfig = {
  clickCount: 10,
  timeWindow: 2000, // 2 seconds
  flipDuration: 1.5,
  imageSrc: '/images/hackerman.png', // You'll need to add this image
  imageAlt: 'Easter Egg!',
  text: 'Une production Hackerman',
};

export const useEasterEgg = (config: Partial<EasterEggConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const clickTimesRef = useRef<number[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastInteractionRef = useRef<number>(0);

  // Add subtle hint for developers who check the console
  useEffect(() => {
    console.log(`
    🔍 Developer Console Detected!
    ═══════════════════════════════════════
    💡 Hint: This website has a hidden secret...
    🎯 Try clicking around rapidly! 
    ⚡ You might discover something amazing!
    ═══════════════════════════════════════
    `);
  }, []);

  const checkEasterEgg = () => {
    if (isEasterEggActive || isRevealed) return;

    const now = Date.now();
    const recentClicks = clickTimesRef.current.filter(
      (time) => now - time < finalConfig.timeWindow,
    );

    if (recentClicks.length >= finalConfig.clickCount) {
      triggerEasterEgg();
    }
  };

  const triggerEasterEgg = () => {
    if (isEasterEggActive) return;

    // Funny console.log for fellow developers! 🎉
    console.log(`
    🕵️‍♂️ HACKERMAN DETECTED! 🕵️‍♂️
    ═══════════════════════════════════════
    🎯 Easter Egg Activated!
    🚀 Someone found the secret!
    💻 Developer Level: HACKERMAN
    🎨 Rainbow Text: ENABLED
    ⚡ Animation: MAXIMUM OVERDRIVE
    ═══════════════════════════════════════
    🎉 Congratulations! You've unlocked the
       ultimate developer achievement!
    🏆 "Master of Rapid Clicking"
    ═══════════════════════════════════════
    `);

    setIsEasterEggActive(true);

    // Prevent body scrolling and interactions
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className =
      'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'auto';
    overlay.style.touchAction = 'none';
    overlay.style.userSelect = 'none';
    overlay.style.webkitUserSelect = 'none';
    (overlay.style as any).webkitTouchCallout = 'none';
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    // Create container for image and text
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center gap-4';
    overlay.appendChild(container);

    // Create image
    const image = document.createElement('img');
    image.src = finalConfig.imageSrc;
    image.alt = finalConfig.imageAlt;
    image.className =
      'max-w-90vw max-h-70vh object-contain rounded-lg shadow-2xl';
    image.style.transform = 'rotateY(180deg)';
    image.style.opacity = '0';
    container.appendChild(image);
    imageRef.current = image;

    // Create text if provided
    if (finalConfig.text) {
      const textElement = document.createElement('div');
      textElement.className =
        'absolute bottom-[25%] text-center text-xl font-bold px-4';
      textElement.textContent = finalConfig.text;
      textElement.style.opacity = '0';
      textElement.style.transform = 'translateY(40px)';

      // Add rainbow animation styles
      textElement.style.background =
        'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
      textElement.style.backgroundSize = '400% 400%';
      textElement.style.webkitBackgroundClip = 'text';
      textElement.style.backgroundClip = 'text';
      textElement.style.webkitTextFillColor = 'transparent';
      textElement.style.animation = 'rainbow 3s ease-in-out infinite';

      // Add the rainbow keyframes animation
      if (!document.getElementById('rainbow-styles')) {
        const style = document.createElement('style');
        style.id = 'rainbow-styles';
        style.textContent = `
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `;
        document.head.appendChild(style);
      }

      container.appendChild(textElement);
    }

    // Animate overlay in
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    });

    // Animate flip effect
    gsap.to(image, {
      rotateY: 0,
      opacity: 1,
      duration: finalConfig.flipDuration,
      ease: 'power2.out',
      delay: 0.2,
      onComplete: () => {
        setIsRevealed(true);

        // Animate text if it exists
        if (finalConfig.text) {
          const textElement = container.querySelector('div');
          if (textElement) {
            gsap.to(textElement, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.5,
            });
          }
        }
      },
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      closeEasterEgg();
    }, 100000);
  };

  const closeEasterEgg = () => {
    if (!overlayRef.current) return;

    // Animate out
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        if (overlayRef.current && overlayRef.current.parentNode) {
          try {
            overlayRef.current.parentNode.removeChild(overlayRef.current);
          } catch (error) {
            console.warn('Error removing overlay:', error);
          }
        }
        // Restore body styles
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        setIsEasterEggActive(false);
        setIsRevealed(false);
        clickTimesRef.current = []; // Reset clicks
      },
    });
  };

  const handleInteraction = (e: Event) => {
    if (isEasterEggActive || isRevealed) return;

    const now = Date.now();

    // Debounce rapid interactions (minimum 100ms between interactions)
    if (now - lastInteractionRef.current < 100) {
      return;
    }
    lastInteractionRef.current = now;

    clickTimesRef.current.push(now);

    // Clean old clicks
    clickTimesRef.current = clickTimesRef.current.filter(
      (time) => now - time < finalConfig.timeWindow,
    );

    checkEasterEgg();
  };

  useEffect(() => {
    // Detect if device is mobile and use appropriate event
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      // On mobile, use touchstart with passive: true to allow scrolling
      document.addEventListener('touchstart', handleInteraction, {
        passive: true,
      });
    } else {
      // On desktop, use click events
      document.addEventListener('click', handleInteraction);
    }

    return () => {
      if (isMobile) {
        document.removeEventListener('touchstart', handleInteraction);
      } else {
        document.removeEventListener('click', handleInteraction);
      }
    };
  }, [isEasterEggActive]);

  return {
    isEasterEggActive,
    isRevealed,
    closeEasterEgg,
  };
};
