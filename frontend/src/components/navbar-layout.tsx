'use client';

import { ReactNode, useState } from 'react';
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

  return (
    <div className="min-h-screen bg-background">
      <MobileNav2 items={navItems} />

      <Navbar className={'fixed bg-theme-default-glassy'}>
        {/* Desktop Navigation */}
        <NavBody className="h-15 flex flex-row items-center justify-end bg-theme-default-glassy">
          <NavItems
            items={navItems}
            className="font-bold text-theme-accent-dark "
            onItemClick={handleNavClick}
          />
          <MagneticButton
            variant="stroke"
            className="h-10 rounded-full after:border-theme-accent-dark  hover:after:border-1 bg-theme-default text-theme-accent-dark  hover:text-theme-default "
            flairClassName="bg-theme-default "
            strokeColor="bg-theme-accent-dark"
            onClick={() =>
              window.open('https://form.typeform.com/to/JlsM3llP', '_blank')
            }
          >
            RSVP
          </MagneticButton>
        </NavBody>
        {/* Mobile Navigation */}
      </Navbar>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
