import { cn, formatTime } from '@/lib';
import { motion } from 'motion/react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import dynamic from 'next/dynamic';
import { Fragment, useEffect, useRef, useState } from 'react';
const BrowserStylePainting = dynamic(() => import('./browser-style-painting'));

interface ProgramEvent {
  id: string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
  location: string;
  displayOrder: number;
  includeInCalendar: boolean;
  icon?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ShakingDiv = ({
  children,
  index,
  id,
  className,
}: {
  children: React.ReactNode;
  index: number;
  id: string;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5, once: true }}
      transition={{
        duration: 0.8,
        ease: 'linear',
        delay: index * 0.2,
      }}
      id={id}
      key={id}
      className={className}
    >
      <motion.div
        animate={{ rotate: [-5, 15], transformOrigin: 'bottom center' }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
          duration: 2,
        }}
        className={'h-full flex flex-col justify-center items-center'}
        style={{ transformOrigin: '0% center' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const AnimatedDiv = ({
  children,
  index,
  id,
  className,
}: {
  children: React.ReactNode;
  index: number;
  id: string;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5, once: true }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
        delay: index * 0.2,
      }}
      id={id}
      key={id}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export function WeddingProgram({
  font,
  events,
}: {
  font: NextFontWithVariable;
  events: ProgramEvent[];
}) {
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Intersection Observer to detect when component enters viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('Intersection Observer:', entry.isIntersecting);
          if (entry.isIntersecting) {
            setIsInViewport(true);
            setIsLoaded(true);
          } else {
            setIsInViewport(false);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 10% of the component is visible
        rootMargin: '10px', // Start animation 50px before component enters viewport
      },
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isInViewport]);

  return (
    <div
      ref={containerRef}
      className="w-full xl:h-full flex xl:flex-row flex-col justify-center items-center text-theme-accent-dark xl:gap-5 xl:gap-0 gap-5    p-10 z-[99999]"
    >
      {events.map((item, index) => (
        <Fragment key={item.id}>
          <AnimatedDiv
            index={index}
            id={item.id}
            className="flex flex-col flex-[1_1_20%] justify-center items-center text-center  pt-4 xl:pt-0 h-full space-y-5 xl:space-y-0"
          >
            <div
              className={cn(
                'text-5xl xl:text-6xl h-full flex items-center justify-center',
                'roundhand-regular',
              )}
            >
              {item.title}
            </div>
            <div className="flex flex-col xl:gap-2 gap-2">
              <div className={cn('text-md xl:text-2xl xl:text-2xl ')}>
                {new Date(item.startTime).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',

                  hour12: false,
                })}
              </div>
              <div className={cn('text-md xl:text-2xl xl:text-2xl ')}>
                {formatTime(
                  typeof item.startTime === 'string'
                    ? item.startTime
                    : item.startTime.toISOString(),
                )
                  ?.split(':')
                  ?.join('h ')
                  ?.replace('h 00', 'h')}
              </div>
              {item.location &&
                typeof item.location === 'string' &&
                item.location.split(',').map((loc) => (
                  <div
                    key={loc}
                    className={cn('text-md xl:text-2xl xl:text-2xl ')}
                  >
                    {loc}
                  </div>
                ))}
            </div>
          </AnimatedDiv>
          {index !== events.length - 1 && (isInViewport || isLoaded) && (
            <ShakingDiv
              index={index}
              id={item.id}
              className="flex justify-center items-center  xl:w-full w-xs h-1/3 xl:h-xs"
            >
              <BrowserStylePainting
                scaleMultiplier={0.8}
                src="/images/lavande.svg"
                alt="lavande"
                duration={5000}
                delay={10}
                pathDelay={30}
                useSetMode={false}
                setPercentage={4}
                className={cn(
                  'justify-center items-center flex flex-col max-w-xs xl:max-w-xs translate-x-5 xl:translate-x-0',
                )}
              />
            </ShakingDiv>
          )}
        </Fragment>
      ))}
    </div>
  );
}
