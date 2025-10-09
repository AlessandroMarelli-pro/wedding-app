import React, { useEffect, useRef, useState } from 'react';

interface AdvancedCanvasPaintingProps {
  src: string;
  alt: string;
  className?: string;
  duration?: number;
  delay?: number;
  animationClasses?: number;
}

interface PathData {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: string;
  transform?: string;
  animationClass: number;
}

export const AdvancedCanvasPainting: React.FC<AdvancedCanvasPaintingProps> = ({
  src,
  alt,
  className = '',
  duration = 5000,
  delay = 500,
  animationClasses = 16,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgData, setSvgData] = useState<{
    viewBox: string;
    paths: PathData[];
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetch(src)
      .then((response) => response.text())
      .then((content) => {
        const parsed = parseSVG(content);
        setSvgData(parsed);
        setIsLoaded(true);
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

      // Extract fill from style attribute
      const fillMatch = style.match(/fill:\s*([^;]+)/);
      const fill = fillMatch ? fillMatch[1].trim() : '#000';

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
  ) => {
    ctx.save();

    // Set fill color
    ctx.fillStyle = pathData.fill;

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

    // Calculate scale to fit SVG in container while maintaining aspect ratio
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    const scale = Math.min(scaleX, scaleY);

    // Set canvas size
    canvas.width = containerWidth * window.devicePixelRatio;
    canvas.height = containerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Center the SVG in the canvas
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
          const pathProgress = Math.min(
            (elapsed - pathStartTime) / (pathEndTime - pathStartTime),
            1,
          );

          // Draw path with fade-in effect
          ctx.save();
          ctx.globalAlpha = pathProgress;
          drawPath(
            ctx,
            pathData,
            containerWidth,
            containerHeight,
            svgWidth,
            svgHeight,
          );
          ctx.restore();
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
    return (
      <div className={`animate-pulse bg-gray-200 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
