'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Edit3,
  Image,
  LayoutDashboard,
  MapPin,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';

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
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4 shrink-0 " />,
  },
  {
    label: 'Informations',
    href: '/admin/information',
    icon: <Edit3 className="h-4 w-4 shrink-0 " />,
  },
  {
    label: 'Logements',
    href: '/admin/accommodations',
    icon: <MapPin className="h-4 w-4 shrink-0 " />,
  },
  {
    label: 'Programme',
    href: '/admin/program',
    icon: <Calendar className="h-4 w-4 shrink-0 " />,
  },
  {
    label: 'Liste des invités',
    href: '/admin/guests',
    icon: <Users className="h-4 w-4 shrink-0 " />,
  },
  {
    label: 'Images',
    href: '/admin/images',
    icon: <Image className="h-4 w-4 shrink-0 " />,
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

  // Configure navbar based on type
  const navItems = adminNavigation;

  const [open, setOpen] = useState(false);
  const {
    currentUser,
    loading: userLoading,
    error: userError,
  } = useCurrentUser();
  if (userLoading) {
    return <div>Loading...</div>;
  }
  if (userError) {
    return <div>Error: {userError}</div>;
  }

  return (
    <div
      className={cn(
        ' flex w-screen  flex-1 flex-col overflow-hidden  rounded-l-none  border-8 border-foreground bg-foreground md:flex-row ',
        'h-screen', // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div
            className={cn(
              'flex flex-1 flex-col overflow-x-hidden overflow-y-auto',
            )}
          >
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navItems.map((link, idx) => (
                <SidebarLink key={idx} link={link} className="px-2" />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: userLoading
                  ? 'Loading...'
                  : userError
                    ? 'Error loading user'
                    : currentUser?.email || 'Admin User',
                href: '#',
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                    {userLoading
                      ? '...'
                      : userError
                        ? '!'
                        : currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {/* Main Content */}
      <main className="overflow-scroll flex h-full w-full flex-1 flex-col gap-2 rounded-2xl border border-foreground bg-white p-2 md:p-10 ">
        {children}
      </main>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-[#EEEEEE] "
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-[#EEEEEE] "
      >
        Administration du mariage
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-white" />
    </a>
  );
};
