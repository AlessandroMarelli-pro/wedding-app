'use client';

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
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
import { motion } from 'motion/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface AdminSidebarProps {
  currentPath?: string;
}

function AdminLogo() {
  const { open, animate } = useSidebar();

  return (
    <div className="px-2 py-4 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <motion.span
          animate={{
            display: animate
              ? open
                ? 'inline-block'
                : 'none'
              : 'inline-block',
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-lg font-serif text-neutral-800 dark:text-neutral-200 whitespace-pre inline-block !p-0 !m-0"
        >
          Admin Panel
        </motion.span>
      </div>
    </div>
  );
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const navigation = [
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

  const isActive = (path: string) => {
    return currentPath === path || router.pathname === path;
  };

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <Sidebar>
        <SidebarBody className="flex flex-col justify-between h-full">
          <div className="space-y-2">
            {/* Admin Logo/Brand */}
            <AdminLogo />

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <SidebarLink
                  key={item.id}
                  link={{
                    label: item.label,
                    href: item.href,
                    icon: item.icon,
                  }}
                  className={`rounded-lg px-2 py-2 transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                />
              ))}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <SidebarLink
              link={{
                label: 'View Site',
                href: '/',
                icon: <ExternalLink className="w-4 h-4" />,
              }}
              className="rounded-lg px-2 py-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300"
            />
            <SidebarLink
              link={{
                label: 'Logout',
                href: '#',
                icon: <LogOut className="w-4 h-4" />,
              }}
              className="rounded-lg px-2 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
