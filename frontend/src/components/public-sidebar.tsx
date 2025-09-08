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
  Clock,
  ExternalLink,
  Heart,
  Home,
  Mail,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface PublicSidebarProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

function PublicLogo() {
  const { open, animate } = useSidebar();

  return (
    <div className="px-2 py-4 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
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
          Ariane & Timothe
        </motion.span>
      </div>
    </div>
  );
}

export function PublicSidebar({
  currentSection = 'home',
  onSectionChange,
}: PublicSidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navigation = [
    {
      label: 'Home',
      href: '#home',
      icon: <Home className="w-5 h-5" />,
      id: 'home',
    },
    {
      label: 'Our Story',
      href: '#our-story',
      icon: <Heart className="w-5 h-5" />,
      id: 'our-story',
    },
    {
      label: 'Details',
      href: '#details',
      icon: <Calendar className="w-5 h-5" />,
      id: 'details',
    },
    {
      label: 'Accommodations',
      href: '#accommodations',
      icon: <MapPin className="w-5 h-5" />,
      id: 'accommodations',
    },
    {
      label: 'Program',
      href: '#program',
      icon: <Clock className="w-5 h-5" />,
      id: 'program',
    },
    {
      label: 'RSVP',
      href: '#rsvp',
      icon: <Mail className="w-5 h-5" />,
      id: 'rsvp',
    },
  ];

  const handleSectionChange = (sectionId: string) => {
    onSectionChange?.(sectionId);
    setOpen(false); // Close mobile sidebar when navigating
  };

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <Sidebar>
        <SidebarBody className="flex flex-col justify-between h-full">
          <div className="space-y-2">
            {/* Logo/Brand */}
            <PublicLogo />

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
                    currentSection === item.id
                      ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
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
                label: 'View Full Site',
                href: '/',
                icon: <ExternalLink className="w-4 h-4" />,
              }}
              className="rounded-lg px-2 py-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300"
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
