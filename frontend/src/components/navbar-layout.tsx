'use client';

import { useNavbarTheme } from '@/context/navbar-theme-context';
import { ReactNode, useState } from 'react';
import { cn } from 'src/lib/utils';
import MobileNav2 from './mobile-nav';
import { MagneticButton } from './ui';
import { Navbar, NavBody, NavItems } from './ui/resizable-navbar';

interface NavbarLayoutProps {
  children: ReactNode;
}

// Public navigation configuration
const navItems = [
  {
    name: 'Un petit mot',
    link: '#nous',
  },
  {
    name: 'Informations',
    link: '#informations',
  },
  {
    name: 'Où dormir ?',
    link: '#logements',
  },
  {
    name: 'Programme',
    link: '#programme',
  },
];

export function NavbarLayout({ children }: NavbarLayoutProps) {
  // Configure navbar based on type

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string,
  ) => {
    e.preventDefault();
    const sectionId = link.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const { theme } = useNavbarTheme();

  return (
    <div className="min-h-screen bg-background">
      <MobileNav2 items={navItems} />

      <Navbar className={cn('fixed h-15', theme.navColor)}>
        {!theme.hideNavbar && (
          <NavBody className={cn('h-15 flex flex-row items-start justify-end')}>
            <NavItems
              items={navItems}
              className={cn('font-bold', theme.navItemsColor)}
              onItemClick={handleNavClick}
            />
            <MagneticButton
              variant="stroke"
              className={cn(
                'h-10 rounded-full   hover:after:border-1     ',
                theme.rsvpItemsHoverColor,
                theme.rsvpItemsColor,
                theme.rsvpAfterBorderColor,
              )}
              flairClassName={cn(
                'bg-theme-default ',
                theme.rsvpItemsFlairColor,
              )}
              strokeColor={cn(
                'bg-theme-accent-dark',
                theme.rsvpItemsStrokeColor,
              )}
              onClick={() =>
                window.open('https://form.typeform.com/to/JlsM3llP', '_blank')
              }
            >
              RSVP
            </MagneticButton>
          </NavBody>
        )}

        {/* Mobile Navigation */}
      </Navbar>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
