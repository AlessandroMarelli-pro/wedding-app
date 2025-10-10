import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';

interface BrowserStylePaintingProps {
  src: string;
  alt: string;
  className?: string;
  duration?: number;
  delay?: number;
  pathDelay?: number; // Delay between each path
  progressivePercentage?: number; // Percentage of paths to draw progressively (default 30%)
  setPercentage?: number; // Percentage of paths per set (default 10%)
  useSetMode?: boolean; // If true, draw by sets instead of progressive (default false)
  onPositionUpdate?: (position: {
    offsetX: number;
    scaledWidth: number;
    containerWidth: number;
    svgWidth: number;
    svgHeight: number;
  }) => void;
}

interface PathData {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: string;
  transform?: string;
}

export const BrowserStylePainting: React.FC<BrowserStylePaintingProps> = ({
  src,
  alt,
  className = '',
  duration = 3000,
  delay = 500,
  pathDelay = 10, // 10ms between each path
  progressivePercentage = 30, // 30% of paths drawn progressively
  setPercentage = 10, // 10% of paths per set
  useSetMode = false, // Use set mode instead of progressive
  onPositionUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgData, setSvgData] = useState<{
    viewBox: string;
    paths: PathData[];
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [scrollAcceleration, setScrollAcceleration] = useState(1);

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
  }, [src]);

  // Scroll acceleration effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.min(
        scrollY / (documentHeight - windowHeight),
        1,
      );

      // Accelerate painting based on scroll progress
      // More scroll = faster painting (up to 10x speed)
      const acceleration = 1 + scrollProgress * 9; // 1x to 10x speed
      setScrollAcceleration(acceleration);

      // Update timeline speed if it exists
      if (timelineRef.current) {
        timelineRef.current.timeScale(acceleration);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parseSVG = (svgContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return null;

    const viewBox = svg.getAttribute('viewBox') || '0 0 100 100';
    const paths: PathData[] = [];

    // Extract all path elements in order
    const pathElements = svg.querySelectorAll('path');
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
        paths.push({
          d,
          fill,
          stroke,
          strokeWidth,
          transform,
        });
      }
    });

    return { viewBox, paths };
  };

  const drawPath = (ctx: CanvasRenderingContext2D, pathData: PathData) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = pathData.fill || '#000';

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

  // Main animation effect
  useEffect(() => {
    if (!svgData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parse viewBox (x, y, width, height)
    let [x, y, svgWidth, svgHeight] = svgData.viewBox.split(' ').map(Number);
    svgWidth = Math.max(svgWidth, 1000);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate scale to fit the container while maintaining aspect ratio
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    const scale = Math.min(scaleX, scaleY) * 1.5; // Use Math.min to fit within container
    console.log(scale);
    // Set canvas size
    canvas.width = containerWidth * window.devicePixelRatio;
    canvas.height = containerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Position the SVG in the center of the canvas
    const scaledWidth = svgWidth * scale;
    const scaledHeight = svgHeight * scale;

    const offsetX = (containerWidth - scaledWidth) / 2; // Center horizontally
    const offsetY = (containerHeight - scaledHeight) / 4; // Position at bottom
    // Apply viewBox offset to account for negative coordinates

    // Notify parent component of position changes
    if (onPositionUpdate) {
      onPositionUpdate({
        offsetX,
        scaledWidth,
        containerWidth,
        svgWidth: svgWidth * scale,
        svgHeight: svgHeight * scale,
      });
    }

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform to position and scale (viewBox offset is handled in drawPath)
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // GSAP-optimized drawing with configurable modes
    const totalPaths = svgData.paths.length;
    const pathsPerSet = Math.floor(totalPaths * (setPercentage / 100));

    // Create GSAP timeline for smooth animation
    const tl = gsap.timeline({ delay: delay / 1000 }); // Convert ms to seconds
    timelineRef.current = tl; // Store reference for scroll acceleration

    if (useSetMode) {
      // Set mode: Draw by sets of X% with GSAP
      const totalSets = Math.ceil(totalPaths / pathsPerSet);

      for (let setIndex = 0; setIndex < totalSets; setIndex++) {
        const setStartIndex = setIndex * pathsPerSet;
        const setEndIndex = Math.min(setStartIndex + pathsPerSet, totalPaths);

        tl.call(
          () => {
            // Draw all paths in this set at once
            for (let i = setStartIndex; i < setEndIndex; i++) {
              drawPath(ctx, svgData.paths[i]);
            }
          },
          [],
          setIndex * (pathDelay / 1000),
        ); // Convert ms to seconds
      }
    } else {
      // Progressive mode: Draw individual paths with acceleration
      const pathsPerProgressivePeriod = Math.floor(
        totalPaths * (progressivePercentage / 100),
      );

      // Progressive phase
      for (let i = 0; i < pathsPerProgressivePeriod; i++) {
        tl.call(
          () => {
            drawPath(ctx, svgData.paths[i]);
          },
          [],
          i * (pathDelay / 1000),
        );
      }

      // Accelerated sets phase
      const remainingPaths = totalPaths - pathsPerProgressivePeriod;
      const remainingSets = Math.ceil(remainingPaths / pathsPerSet);

      for (let setIndex = 0; setIndex < remainingSets; setIndex++) {
        const setStartIndex =
          pathsPerProgressivePeriod + setIndex * pathsPerSet;
        const setEndIndex = Math.min(setStartIndex + pathsPerSet, totalPaths);

        tl.call(
          () => {
            // Draw all paths in this set at once
            for (let i = setStartIndex; i < setEndIndex; i++) {
              drawPath(ctx, svgData.paths[i]);
            }
          },
          [],
          (pathsPerProgressivePeriod * pathDelay) / 1000 +
            (setIndex * pathDelay * 5) / 1000,
        );
      }
    }

    return () => {
      tl.kill(); // Kill GSAP timeline on cleanup
      timelineRef.current = null; // Clear timeline reference
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    svgData,
    duration,
    delay,
    pathDelay,
    progressivePercentage,
    setPercentage,
    useSetMode,
  ]);

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
          zIndex: 5,
        }}
      />

      {/* Scroll acceleration indicator */}
      {scrollAcceleration > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {scrollAcceleration.toFixed(1)}x speed
        </div>
      )}
    </div>
  );
};
