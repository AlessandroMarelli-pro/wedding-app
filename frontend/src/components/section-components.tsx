import { cn } from '@/lib/utils';
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
    <section
      id={id}
      className={cn(
        'sm:max-h-screen ',
        backgroundClasses[background],
        className,
      )}
    >
      <div className="mx-auto">{children}</div>
    </section>
  );
}
