import React, { useEffect, useRef, useState } from 'react';

interface BrowserStylePaintingProps {
  src: string;
  alt: string;
  className?: string;
  duration?: number;
  delay?: number;
  pathDelay?: number; // Delay between each path
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
  }, [src]);

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

    // Browser-style progressive drawing
    let currentPathIndex = 0;
    const totalPaths = svgData.paths.length;

    const drawNextPath = () => {
      if (currentPathIndex < totalPaths) {
        // Draw the current path
        drawPath(ctx, svgData.paths[currentPathIndex]);
        currentPathIndex++;

        // Schedule next path
        if (currentPathIndex < totalPaths) {
          setTimeout(drawNextPath, pathDelay);
        }
      }
    };

    // Start drawing after delay
    const timer = setTimeout(() => {
      drawNextPath();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [svgData, delay, pathDelay]);

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
