'use client';

import {
  Calendar,
  Edit3,
  ExternalLink,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  Users,
} from 'lucide-react';
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
  type: 'public' | 'admin';
  currentSection?: string;
  currentPath?: string;
  onSectionChange?: (section: string) => void;
}

// Admin navigation configuration
const adminNavigation = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    name: 'Informations',
    link: '/admin/wedding',
    icon: <Edit3 className="w-4 h-4" />,
  },
  {
    name: 'Logements',
    link: '/admin/accommodations',
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    name: 'Programme',
    link: '/admin/program',
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    name: 'Liste des invités',
    link: '/admin/guests',
    icon: <Users className="w-4 h-4" />,
  },
  {
    name: 'Images',
    link: '/admin/images',
    icon: <Image className="w-4 h-4" />,
  },
];

// Public navigation configuration
const publicNavigation = [
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
  type,
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
  const navItems = type === 'public' ? publicNavigation : adminNavigation;

  // Handle section changes for public navigation
  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  // Add footer actions to navbar items
  const navbarItems =
    type === 'public'
      ? [
          ...navItems.map((item) => ({
            ...item,
            onClick: item.link.startsWith('#')
              ? () => handleSectionClick(item.link.substring(1))
              : undefined,
          })),
        ]
      : [
          ...navItems,
          {
            name: 'View Site',
            link: '/',
            icon: <ExternalLink className="w-4 h-4" />,
          },
          {
            name: 'Logout',
            link: '#',
            icon: <LogOut className="w-4 h-4" />,
            onClick: handleLogout,
          },
        ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        className={
          type === 'public'
            ? 'fixed lg:absolute'
            : 'relative bg-black text-white'
        }
      >
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
