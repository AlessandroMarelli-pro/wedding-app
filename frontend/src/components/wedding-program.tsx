import { cn, formatTime } from '@/lib';
import { IconGalaxy } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { Fragment } from 'react';

interface ProgramEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  displayOrder: number;
  includeInCalendar: boolean;
}

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
        ease: 'linear',
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
  return (
    <div className="w-full lg:h-full flex lg:flex-row flex-col justify-center items-center text-[#F38181] xl:gap-5 lg:gap-0 gap-5 py-10 lg:py-0 lg:pb-5">
      {events.map((item, index) => (
        <Fragment key={item.id}>
          <AnimatedDiv
            index={index}
            id={item.id}
            className="flex flex-col flex-[1_1_20%] justify-center items-center text-center  pt-4 lg:pt-0 h-full space-y-5 lg:space-y-0"
          >
            <div
              className={cn(
                'text-5xl xl:text-6xl h-full flex items-center justify-center',
                font.className,
              )}
            >
              {item.title}
            </div>
            <div className="flex flex-col lg:gap-5 gap-2">
              <div className={cn('text-md lg:text-2xl xl:text-2xl ')}>
                {new Date(item.startTime).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',

                  hour12: false,
                })}
              </div>
              <div className={cn('text-md lg:text-2xl xl:text-2xl ')}>
                {formatTime(item.startTime)
                  .split(':')
                  .join('h ')
                  .replace('h 00', 'h')}
              </div>
              {item.location.split(',').map((loc) => (
                <div
                  key={loc}
                  className={cn('text-md lg:text-2xl xl:text-2xl ')}
                >
                  {loc}
                </div>
              ))}
            </div>
          </AnimatedDiv>
          {index !== events.length - 1 && (
            <AnimatedDiv index={index} id={item.id}>
              <IconGalaxy className="lg:w-10 lg:h-10 w-8 h-8 animate-[spin_3s_linear_infinite]" />
            </AnimatedDiv>
          )}
        </Fragment>
      ))}
    </div>
  );
}
