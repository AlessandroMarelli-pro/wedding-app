import { cn } from '@/lib/utils';
import Head from 'next/head';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  heroImage?: string;
  className?: string;
  showHeroImage?: boolean;
}

export function Layout({
  children,
  title = 'Wedding Celebration',
  description = 'Join us for our special day',
  heroImage = '/images/hero-wedding.jpg',
  className,
  showHeroImage = true,
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background">
        {showHeroImage && (
          <div className="relative h-screen w-full overflow-hidden">
            {/* Hero Image - Fixed Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-fixed"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${heroImage}')`,
              }}
            />

            {/* Hero Content Overlay */}
            <div className="relative z-10 flex items-center justify-center h-full px-4">
              <div className="text-center text-white max-w-4xl mx-auto">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8" />

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-tight">
                  Ariane & Timothe
                </h1>

                <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8" />

                <p className="text-xl md:text-2xl mb-12 font-light opacity-90">
                  Together forever starts here
                </p>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Scrollable */}
        <main className={cn('relative z-20', className)}>{children}</main>
      </div>
    </>
  );
}

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

interface NavigationProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  sections?: Array<{ id: string; label: string }>;
}

export function Navigation({
  currentSection = 'home',
  onSectionChange,
  sections = [
    { id: 'home', label: 'Home' },
    { id: 'our-story', label: 'Our Story' },
    { id: 'details', label: 'Details' },
    { id: 'accommodations', label: 'Stay' },
    { id: 'program', label: 'Schedule' },
    { id: 'rsvp', label: 'RSVP' },
  ],
}: NavigationProps) {
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-center space-x-2 md:space-x-8 overflow-x-auto">
          {sections.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange?.(item.id)}
              className={cn(
                'px-3 md:px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap text-sm md:text-base',
                currentSection === item.id
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
