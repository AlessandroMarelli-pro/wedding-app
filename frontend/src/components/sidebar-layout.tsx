'use client';

import {
  IconCalendar,
  IconClock,
  IconExternalLink,
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
  Settings,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { GenericSidebar } from './ui/generic-sidebar';

interface SidebarLayoutProps {
  children: ReactNode;
  type: 'public' | 'admin';
  currentSection?: string;
  currentPath?: string;
  onSectionChange?: (section: string) => void;
}

// Admin navigation configuration
const adminNavigation = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    id: 'dashboard',
  },
  {
    label: 'Wedding Info',
    href: '/admin/wedding',
    icon: <Edit3 className="w-5 h-5" />,
    id: 'wedding',
  },
  {
    label: 'Accommodations',
    href: '/admin/accommodations',
    icon: <MapPin className="w-5 h-5" />,
    id: 'accommodations',
  },
  {
    label: 'Program',
    href: '/admin/program',
    icon: <Calendar className="w-5 h-5" />,
    id: 'program',
  },
  {
    label: 'Guest List',
    href: '/admin/guests',
    icon: <Users className="w-5 h-5" />,
    id: 'guests',
  },
  {
    label: 'Images',
    href: '/admin/images',
    icon: <Image className="w-5 h-5" />,
    id: 'images',
  },
];

// Public navigation configuration
const publicNavigation = [
  {
    label: 'Home',
    href: '#home',
    icon: (
      <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    id: 'home',
  },
  {
    label: 'Our Story',
    href: '#our-story',
    icon: (
      <IconHeart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    id: 'our-story',
  },
  {
    label: 'Details',
    href: '#details',
    icon: (
      <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    id: 'details',
  },
  {
    label: 'Accommodations',
    href: '#accommodations',
    icon: (
      <IconMapPin className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    id: 'accommodations',
  },
  {
    label: 'Program',
    href: '#program',
    icon: (
      <IconClock className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    id: 'program',
  },
  {
    label: 'RSVP',
    href: '#rsvp',
    icon: (
      <IconMail className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    id: 'rsvp',
  },
];

export function SidebarLayout({
  children,
  type,
  currentSection,
  currentPath,
  onSectionChange,
}: SidebarLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // Configure sidebar based on type
  const sidebarConfig =
    type === 'public'
      ? {
          logo: {
            icon: (
              <IconHeart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
            text: 'Ariane & Timothe',
          },
          navigation: publicNavigation,
          footerActions: [
            {
              label: 'View Full Site',
              href: '/',
              icon: <IconExternalLink className="w-4 h-4" />,
            },
          ],
          activeColorScheme: 'rose' as const,
        }
      : {
          logo: {
            icon: <Settings className="w-4 h-4 text-white" />,
            text: 'Admin Panel',
          },
          navigation: adminNavigation,
          footerActions: [
            {
              label: 'View Site',
              href: '/',
              icon: <ExternalLink className="w-4 h-4" />,
            },
            {
              label: 'Logout',
              href: '#',
              icon: <LogOut className="w-4 h-4" />,
              onClick: handleLogout,
              className:
                'rounded-lg px-2 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300',
            },
          ],
          activeColorScheme: 'blue' as const,
        };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <GenericSidebar
          logo={sidebarConfig.logo}
          navigation={sidebarConfig.navigation}
          footerActions={sidebarConfig.footerActions}
          currentPath={currentPath}
          currentSection={currentSection}
          onSectionChange={onSectionChange}
          activeColorScheme={sidebarConfig.activeColorScheme}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
}
