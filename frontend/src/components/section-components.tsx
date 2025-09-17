import { useAppColor } from '@/hooks/useAppColor';
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
  const { secondaryColor, accentColor } = useAppColor();

  const backgroundClasses = {
    default: 'bg-background',
    muted: `bg-[${secondaryColor}]`,
    accent: `bg-[${accentColor}]`,
  };

  return (
    <section
      id={id}
      className={cn(
        'lg:max-h-screen ',
        backgroundClasses[background],
        className,
      )}
    >
      <div className="mx-auto h-full">{children}</div>
    </section>
  );
}
