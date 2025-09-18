import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'default' | 'muted' | 'accent';
}

export function Section({
  children,
  className,
  id,
  background = 'default',
}: SectionProps) {
  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-[#EAFFD0]',
    accent: 'bg-[#F38181]',
  };

  return (
    <motion.section
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.8 }}
      id={id}
      className={cn(
        'lg:max-h-screen ',
        backgroundClasses[background],
        className,
      )}
    >
      <div className="mx-auto h-full">{children}</div>
    </motion.section>
  );
}
