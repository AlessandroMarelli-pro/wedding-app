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
      className={cn('h-screen', backgroundClasses[background], className)}
    >
      <div className="mx-auto h-full">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('text-center ', className)}>
      <h2 className="text-4xl md:text-5xl lg:text-5xl  text-foreground mt-6 ">
        {title}
      </h2>
      <div className="w-24  mx-auto mb-6" />
      {subtitle && (
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
