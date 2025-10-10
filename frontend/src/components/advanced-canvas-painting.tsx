import React, { useEffect, useRef, useState } from 'react';

interface AdvancedCanvasPaintingProps {
  src: string;
  alt: string;
  className?: string;
  duration?: number;
  delay?: number;
  animationClasses?: number;
  easingFunction?: keyof typeof easingFunctions;
}

interface PathData {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: string;
  transform?: string;
  animationClass: number;
}

// Easing functions for smoother animations
const easingFunctions = {
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number): number =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeIn: (t: number): number => t * t * t,
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  // Custom easing for painting effect - starts slow, accelerates, then slows down
  paintEase: (t: number): number => {
    if (t < 0.3) {
      return 0.5 * Math.pow(t / 0.3, 2);
    } else if (t < 0.7) {
      return 0.5 + 0.3 * ((t - 0.3) / 0.4);
    } else {
      return 0.8 + 0.2 * (1 - Math.pow((1 - t) / 0.3, 2));
    }
  },
};

export const AdvancedCanvasPainting: React.FC<AdvancedCanvasPaintingProps> = ({
  src,
  alt,
  className = '',
  duration = 5000,
  delay = 500,
  animationClasses = 16,
  easingFunction = 'paintEase',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgData, setSvgData] = useState<{
    viewBox: string;
    paths: PathData[];
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetch(src)
      .then((response) => response.text())
      .then((content) => {
        const parsed = parseSVG(content);
        setSvgData(parsed);
        setIsLoaded(true);

        // Smooth fade-in after a short delay
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      })
      .catch((error) => {
        console.error('Error loading SVG:', error);
      });
  }, [src, animationClasses]);

  const parseSVG = (svgContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return null;

    const viewBox = svg.getAttribute('viewBox') || '0 0 100 100';
    const paths: PathData[] = [];

    // Extract all path elements
    const pathElements = svg.querySelectorAll('path');
    let pathIndex = 0;

    pathElements.forEach((path) => {
      const d = path.getAttribute('d') || '';
      const style = path.getAttribute('style') || '';

      // Extract fill from style attribute or fill attribute
      let fill = '#000'; // default fallback
      const fillMatch = style.match(/fill:\s*([^;]+)/);
      if (fillMatch) {
        fill = fillMatch[1].trim();
      } else {
        // Try to get fill from fill attribute
        const fillAttr = path.getAttribute('fill');
        if (fillAttr) {
          fill = fillAttr;
        }
      }

      // Ensure we have a valid color
      if (!fill || fill === 'none' || fill === 'transparent') {
        fill = '#000';
      }

      // Extract other properties
      const strokeMatch = style.match(/stroke:\s*([^;]+)/);
      const stroke = strokeMatch ? strokeMatch[1].trim() : undefined;

      const strokeWidthMatch = style.match(/stroke-width:\s*([^;]+)/);
      const strokeWidth = strokeWidthMatch
        ? strokeWidthMatch[1].trim()
        : undefined;

      const transform = path.getAttribute('transform') || undefined;

      if (d) {
        // Assign animation class in round-robin fashion
        const animationClass = (pathIndex % animationClasses) + 1;
        paths.push({
          d,
          fill,
          stroke,
          strokeWidth,
          transform,
          animationClass,
        });
        pathIndex++;
      }
    });

    return { viewBox, paths };
  };

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    pathData: PathData,
    canvasWidth: number,
    canvasHeight: number,
    svgWidth: number,
    svgHeight: number,
    progress: number = 1,
  ) => {
    ctx.save();

    // Set fill color with transparency based on progress
    const fillColor = pathData.fill || '#000';
    const alpha = progress; // Use progress as alpha for fade-in effect
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = alpha;

    // Set stroke if present
    if (pathData.stroke) {
      ctx.strokeStyle = pathData.stroke;
      ctx.lineWidth = parseFloat(pathData.strokeWidth || '1');
    }

    // Apply transform if present
    if (pathData.transform) {
      // Simple transform parsing - you might want to make this more robust
      const translateMatch = pathData.transform.match(/translate\(([^)]+)\)/);
      if (translateMatch) {
        const [tx, ty] = translateMatch[1].split(',').map(Number);
        ctx.translate(tx, ty);
      }
    }

    // Create and draw path
    const path = new Path2D(pathData.d);
    ctx.fill(path);

    if (pathData.stroke) {
      ctx.stroke(path);
    }

    ctx.restore();
  };

  useEffect(() => {
    if (!svgData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parse viewBox
    const [x, y, svgWidth, svgHeight] = svgData.viewBox.split(' ').map(Number);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate scale to fill the container while maintaining aspect ratio
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    const scale = Math.max(scaleX, scaleY); // Use Math.max to fill the screen

    // Set canvas size
    canvas.width = containerWidth * window.devicePixelRatio;
    canvas.height = containerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Center the SVG in the canvas (it will be larger than container in one dimension)
    const scaledWidth = svgWidth * scale;
    const scaledHeight = svgHeight * scale;
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;

    // Apply transform to center and scale
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime - delay;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw paths based on their animation class timing
      svgData.paths.forEach((pathData) => {
        const classDelay =
          (pathData.animationClass - 1) * (duration / animationClasses);
        const pathStartTime = classDelay;
        const pathEndTime = pathStartTime + duration / animationClasses;

        if (elapsed >= pathStartTime) {
          let pathProgress = Math.min(
            (elapsed - pathStartTime) / (pathEndTime - pathStartTime),
            1,
          );

          // Apply selected easing function for smoother animation
          pathProgress = easingFunctions[easingFunction](pathProgress);

          // Draw path with fade-in effect
          drawPath(
            ctx,
            pathData,
            containerWidth,
            containerHeight,
            svgWidth,
            svgHeight,
            pathProgress,
          );
        }
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [svgData, duration, delay, animationClasses]);

  if (!isLoaded) {
    return;
  }

  return (
    <div
      className={`w-full h-full transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};
