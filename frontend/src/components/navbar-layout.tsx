'use client';

import { ReactNode, useState } from 'react';
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavBody,
  NavItems,
} from './ui/resizable-navbar';

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
      <Navbar className={'fixed lg:absolute'}>
        {/* Desktop Navigation */}
        <NavBody className="h-20">
          <NavItems
            items={navItems}
            className="font-bold text-[#F38181]"
            onItemClick={handleNavClick}
          />
          {/* <RSVPFormModal
            shadowCls="shadow-none"
            btnColor="bg-[#F38181]"
            btnTextColor="text-[#95E1D3] font-bold"
          /> */}
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => {
                  handleNavClick(e, item.link);
                  setIsMobileMenuOpen(false);
                }}
                className="relative text-white"
              >
                <span className="flew flex-row">{item.name}</span>
              </a>
            ))}
            {/*  <RSVPFormModal
              shadowCls="shadow-none"
              btnColor="bg-[#F38181]"
              btnTextColor="text-[#95E1D3] font-bold"
              containerCls="w-full"
            /> */}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
