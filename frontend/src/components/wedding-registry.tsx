import { cn } from '@/lib';
import { motion } from 'motion/react';
import Image from 'next/image';
import { DivWithAnimation } from './animations';
import { MagneticButton } from './ui';

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
// Helper function to format time without timezone conversion
const formatTimeLocal = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
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
        animate={{ rotate: [-2, 3], transformOrigin: 'bottom center' }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
          duration: 4,
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

export function WeddingRegistry() {
  return (
    <div className="space-y-4 ">
      <div className="flex flex-col xl:max-h-screen xl:h-screen">
        <div className=" flex flex-col items-center justify-center xl:min-h-10" />
        <DivWithAnimation className=" flex flex-col justify-center items-center text-center px-2 xl:px-0">
          <div className="h-full py-5   ">
            <h1
              className={cn(
                'text-5xl xl:text-8xl text-theme-accent-dark',
                'roundhand-regular',
              )}
            >
              Liste de mariage
            </h1>
            <span className="text-theme-accent-dark/80 text-sm xl:text-base">
              Participez à notre liste de mariage !
            </span>
          </div>
        </DivWithAnimation>
        <div className=" flex flex-col xl:flex-row  xl:gap-10 px-10 pb-10">
          <div className="flex flex-col  xl:w-[50%]  justify-center items-center text-center  2xl:justify-center gap-10">
            <span className="text-theme-accent-dark text-sm xl:text-base xl:text-justify text-center">
              Nous avons comme rêve de prolonger ce jour de fête par un voyage
              en Colombie qui allie sommets andins, vallées du café, plages
              caribéennes, treks vers des cités perdues dans la jungle et villes
              aux milles couleurs. Pour celles et ceux qui souhaiteraient
              participer à nos prochaines aventures, vous trouverez à l'adresse
              suivante quelques idées pour nous accompagner dans ce voyage
              colombien.
            </span>
            <MagneticButton
              variant="stroke"
              className={cn(
                'h-10 xl:h-15 w-auto xl:w-auto rounded-full   hover:after:border-1   backdrop-blur-[2px] ',
                'text-theme-accent-dark',
                'hover:text-theme-default',
                'after:border-theme-accent-dark',
                'bg-transparent ',
                'text-sm xl:text-xl',
              )}
              flairClassName={cn('bg-theme-accent-dark ')}
              strokeColor={cn('bg-theme-accent-dark')}
              onClick={() =>
                window.open(
                  'https://app.youform.com/forms/i15ap0em?mariage=2026-07-13',
                  '_blank',
                )
              }
            >
              Accéder à la liste de mariage
            </MagneticButton>
          </div>
          <div className="flex flex-col xl:w-[50%] gap-10 xl:gap-0">
            <div className=" flex flex-col items-center justify-center xl:min-h-10" />

            <div className="flex flex-col items-center justify-center h-full ">
              <Image
                src="/images/colombie.webp"
                alt="wedding registry"
                className=" w-full"
                width={1000}
                height={1000}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
