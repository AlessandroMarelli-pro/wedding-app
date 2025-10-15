import useWindowSize from '@/hooks/useWindowResize';
import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';

interface BrowserStylePaintingProps {
  scaleMultiplier?: number;
  offsetYDivider?: number;
  src: string;
  alt: string;
  className?: string;
  duration?: number;
  delay?: number;
  pathDelay?: number; // Delay between each path
  progressivePercentage?: number; // Percentage of paths to draw progressively (default 30%)
  setPercentage?: number; // Percentage of paths per set (default 10%)
  useSetMode?: boolean; // If true, draw by sets instead of progressive (default false)
  centerSvg?: boolean; // If true, center the SVG in the container (default true)
  preserveAspectRatio?: boolean; // If true, maintain aspect ratio (default true)
  maxHeight?: number | null; // Maximum height in pixels (default null)
}

interface PathData {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: string;
  transform?: string;
}

export const BrowserStylePainting: React.FC<BrowserStylePaintingProps> = ({
  scaleMultiplier = 1.5,
  offsetYDivider = 2,
  src,
  alt,
  className = '',
  duration = 3000,
  delay = 500,
  pathDelay = 10, // 10ms between each path
  progressivePercentage = 30, // 30% of paths drawn progressively
  setPercentage = 10, // 10% of paths per set
  useSetMode = false, // Use set mode instead of progressive
  centerSvg = true, // Center the SVG in the container
  preserveAspectRatio = true, // Maintain aspect ratio
  maxHeight = null, // Maximum height in pixels (default null)
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
  const { width: windowWidth, height: windowHeight } = useWindowSize();

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
        }, 50);
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

      if (fill === '#fff' || fill === '#ffffff' || fill === 'white') {
        return;
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

  // Parse and apply SVG transforms
  const parseAndApplyTransform = (
    ctx: CanvasRenderingContext2D,
    transform: string,
  ) => {
    // Handle multiple transforms separated by spaces
    const transforms = transform.trim().split(/\s+(?=\w+\()/);

    transforms.forEach((transformStr) => {
      // Translate: translate(x, y) or translate(x)
      const translateMatch = transformStr.match(/translate\(([^)]+)\)/);
      if (translateMatch) {
        const coords = translateMatch[1].split(/[,\s]+/).map(Number);
        const tx = coords[0] || 0;
        const ty = coords[1] || 0;
        ctx.translate(tx, ty);
      }

      // Scale: scale(x, y) or scale(x)
      const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        const coords = scaleMatch[1].split(/[,\s]+/).map(Number);
        const sx = coords[0] || 1;
        const sy = coords[1] || sx;
        ctx.scale(sx, sy);
      }

      // Rotate: rotate(angle) or rotate(angle, cx, cy)
      const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
      if (rotateMatch) {
        const coords = rotateMatch[1].split(/[,\s]+/).map(Number);
        const angle = coords[0] || 0;
        const cx = coords[1] || 0;
        const cy = coords[2] || 0;

        if (cx !== 0 || cy !== 0) {
          ctx.translate(cx, cy);
          ctx.rotate((angle * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        } else {
          ctx.rotate((angle * Math.PI) / 180);
        }
      }

      // Matrix: matrix(a, b, c, d, e, f)
      const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/);
      if (matrixMatch) {
        const coords = matrixMatch[1].split(/[,\s]+/).map(Number);
        if (coords.length === 6) {
          ctx.transform(
            coords[0],
            coords[1],
            coords[2],
            coords[3],
            coords[4],
            coords[5],
          );
        }
      }
    });
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
      parseAndApplyTransform(ctx, pathData.transform);
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
    const [x, y, initialSvgWidth, svgHeight] = svgData.viewBox
      .split(' ')
      .map(Number);
    const svgWidth = Math.max(initialSvgWidth, 1000);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate scale to fit the container while maintaining aspect ratio
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;

    // Apply maxHeight constraint if specified
    let constrainedScaleY = scaleY;
    if (maxHeight !== null && maxHeight > 0) {
      const maxHeightScale = maxHeight / svgHeight;
      constrainedScaleY = Math.min(scaleY, maxHeightScale);
    }

    const baseScale = Math.min(scaleX, constrainedScaleY);
    const scale = !scaleMultiplier ? baseScale : baseScale * scaleMultiplier;
    // Set canvas size
    canvas.width = containerWidth * window.devicePixelRatio;
    canvas.height = containerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Calculate proper positioning based on viewBox
    const scaledWidth = svgWidth * scale;
    const scaledHeight = svgHeight * scale;

    // Calculate offset to position SVG correctly
    let offsetX = 0;
    let offsetY = 0;

    if (centerSvg) {
      // Center the SVG in the container, accounting for viewBox offset
      offsetX = (containerWidth - scaledWidth) / 2 - x * scale;
      offsetY = (containerHeight - scaledHeight) / offsetYDivider - y * scale;
    } else {
      // Position at origin, accounting for viewBox offset
      offsetX = -(x * scale);
      offsetY = -(y * scale);
    }

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform to position and scale
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
    centerSvg,
    preserveAspectRatio,
    maxHeight,
    windowWidth,
    windowHeight,
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
    </div>
  );
};

export default BrowserStylePainting;
