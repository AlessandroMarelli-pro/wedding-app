'use client';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'motion/react';
import { encode } from 'qss';
import React from 'react';

import parse from 'html-react-parser';
import { cn } from 'src/lib/utils';

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export const LinkPreview = ({
  children,
  url,
  className,
  width = 200,
  height = 125,
  quality = 50,
  layout = 'fixed',
  isStatic = false,
  imageSrc = '',
  side = 'top',
}: LinkPreviewProps) => {
  let src;
  if (!isStatic) {
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: 'screenshot.url',
      colorScheme: 'dark',
      'viewport.isMobile': true,
      'viewport.deviceScaleFactor': 1,
      'viewport.width': width * 3,
      'viewport.height': height * 3,
    });
    src = `https://api.microlink.io/?${params}`;
  } else {
    src = imageSrc;
  }

  const [isOpen, setOpen] = React.useState(false);

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);

  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2; // Reduce the effect to make it subtle
    x.set(offsetFromCenter);
  };

  return (
    <>
      {isMounted ? (
        <div className="hidden">
          <img src={src} width={width} height={height} alt="hidden image" />
        </div>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn(className)}
          href={url}
        >
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="z-10000 [transform-origin:var(--radix-hover-card-content-transform-origin)]"
          side={side}
          align="center"
          sideOffset={10}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="shadow-xl rounded-xl"
                style={{
                  x: translateX,
                }}
              >
                <a
                  href={url}
                  className="block p-1 bg-white border-2 border-transparent shadow rounded-xl hover:border-neutral-200 dark:hover:border-neutral-800"
                  style={{ fontSize: 0 }}
                  target="_blank"
                >
                  <img
                    src={isStatic ? imageSrc : src}
                    width={width}
                    height={height}
                    className="rounded-lg"
                    alt="preview image"
                  />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};

export const convertTextWithLinksToReactNodes = (
  information: string,
  className?: string,
) => {
  // Regex to match: [text] ([url])
  const linkRegex = /(.*?)(?:\s*\((https?:\/\/[^\s)]+)\))/g;
  const info = information || '';
  const matches = [...info.matchAll(linkRegex)];
  if (matches.length > 0) {
    // There are one or more links in the text
    // We'll split the text and render LinkPreview for each
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    matches.forEach((match, idx) => {
      const [full, text, url] = match;
      const start = match.index ?? 0;
      // Add any text before this match
      if (start > lastIndex) {
        const before = info.slice(lastIndex, start);
        elements.push(
          <span key={`before-${idx}`}>
            {parse(before.replace(/(?:\r\n|\r|\n)/g, '<br>'))}
          </span>,
        );
      }
      // Add the LinkPreview for this match
      elements.push(
        <LinkPreview
          key={`link-${idx}`}
          width={300}
          height={200}
          url={url}
          className={cn(' underline text-sm target:blank', className)}
        >
          {text.trim()}
        </LinkPreview>,
      );
      lastIndex = start + full.length;
    });

    // Add any remaining text after the last match
    if (lastIndex < info.length) {
      const after = info.slice(lastIndex);
      elements.push(
        <span key="after-last">
          {parse(after.replace(/(?:\r\n|\r|\n)/g, '<br>'))}
        </span>,
      );
    }

    return elements;
  } else {
    // No links, just parse as before
    return parse(info.replace(/(?:\r\n|\r|\n)/g, '<br>'));
  }
};
