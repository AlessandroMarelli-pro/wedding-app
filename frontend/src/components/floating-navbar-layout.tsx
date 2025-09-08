'use client';

import {
  IconCalendar,
  IconClock,
  IconHeart,
  IconHome,
  IconMail,
  IconMapPin,
} from '@tabler/icons-react';
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
import { ReactNode } from 'react';
import { FloatingNav } from './ui/floating-navbar';

interface FloatingNavbarLayoutProps {
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
    name: 'Wedding Info',
    link: '/admin/wedding',
    icon: <Edit3 className="w-4 h-4" />,
  },
  {
    name: 'Accommodations',
    link: '/admin/accommodations',
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    name: 'Program',
    link: '/admin/program',
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    name: 'Guest List',
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
    name: 'Home',
    link: '#home',
    icon: <IconHome className="w-4 h-4" />,
  },
  {
    name: 'Our Story',
    link: '#our-story',
    icon: <IconHeart className="w-4 h-4" />,
  },
  {
    name: 'Details',
    link: '#details',
    icon: <IconCalendar className="w-4 h-4" />,
  },
  {
    name: 'Accommodations',
    link: '#accommodations',
    icon: <IconMapPin className="w-4 h-4" />,
  },
  {
    name: 'Program',
    link: '#program',
    icon: <IconClock className="w-4 h-4" />,
  },
  {
    name: 'RSVP',
    link: '#rsvp',
    icon: <IconMail className="w-4 h-4" />,
  },
];

export function FloatingNavbarLayout({
  children,
  type,
  currentSection,
  currentPath,
  onSectionChange,
}: FloatingNavbarLayoutProps) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navigation */}
      <FloatingNav navItems={navbarItems} />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
