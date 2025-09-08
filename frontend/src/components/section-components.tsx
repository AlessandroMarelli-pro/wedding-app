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
    muted: 'bg-muted/30',
    accent: 'bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50',
  };

  return (
    <section
      id={id}
      className={cn('py-20 px-4', backgroundClasses[background], className)}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
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
    <div className={cn('text-center mb-16', className)}>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4">
        {title}
      </h2>
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-6" />
      {subtitle && (
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
