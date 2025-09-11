'use client';

import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { RSVPFormModal } from './rsvp-form-modal';
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
  currentSection?: string;
  currentPath?: string;
  onSectionChange?: (section: string) => void;
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

export function NavbarLayout({
  children,
  currentSection,
  currentPath,
  onSectionChange,
}: NavbarLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // Configure navbar based on type

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar className={'fixed lg:absolute'}>
        {/* Desktop Navigation */}
        <NavBody className="">
          <NavItems items={navItems} className="font-bold text-[#F38181] " />
          <RSVPFormModal
            shadowCls="shadow-none"
            btnColor="bg-[#F38181]"
            btnTextColor="text-[#95E1D3] font-bold"
          />
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
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
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-white"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <RSVPFormModal
              shadowCls="shadow-none"
              btnColor="bg-[#F38181]"
              btnTextColor="text-[#95E1D3] font-bold"
              containerCls="w-full"
            />
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
