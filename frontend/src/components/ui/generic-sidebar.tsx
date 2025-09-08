'use client';

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { motion } from 'motion/react';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';

interface NavigationItem {
  label: string;
  href: string;
  icon: ReactNode;
  id: string;
}

interface FooterAction {
  label: string;
  href: string;
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
}

interface GenericSidebarProps {
  logo: {
    icon: ReactNode;
    text: string;
  };
  navigation: NavigationItem[];
  footerActions: FooterAction[];
  currentPath?: string;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  activeColorScheme?: 'blue' | 'rose';
}

function SidebarLogo({ logo }: { logo: GenericSidebarProps['logo'] }) {
  const { open, animate } = useSidebar();

  return (
    <div className="px-2 py-4 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          {logo.icon}
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
          {logo.text}
        </motion.span>
      </div>
    </div>
  );
}

export function GenericSidebar({
  logo,
  navigation,
  footerActions,
  currentPath,
  currentSection,
  onSectionChange,
  activeColorScheme = 'blue',
}: GenericSidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavigationItem) => {
    if (currentPath) {
      return currentPath === item.href || router.pathname === item.href;
    }
    if (currentSection) {
      return currentSection === item.id;
    }
    return false;
  };

  const getActiveStyles = (isItemActive: boolean) => {
    const baseStyles = 'rounded-lg px-2 py-2 transition-colors';

    if (isItemActive) {
      if (activeColorScheme === 'rose') {
        return `${baseStyles} bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300`;
      }
      return `${baseStyles} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`;
    }

    return `${baseStyles} text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200`;
  };

  const handleItemClick = (item: NavigationItem) => {
    if (onSectionChange && item.href.startsWith('#')) {
      onSectionChange(item.id);
      setOpen(false); // Close mobile sidebar when navigating
    }
  };

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <Sidebar>
        <SidebarBody className="flex flex-col justify-between h-full">
          <div className="space-y-2">
            {/* Logo/Brand */}
            <SidebarLogo logo={logo} />

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
                  className={getActiveStyles(isActive(item))}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
            {footerActions.map((action, index) => (
              <SidebarLink
                key={index}
                link={{
                  label: action.label,
                  href: action.href,
                  icon: action.icon,
                }}
                className={
                  action.className ||
                  'rounded-lg px-2 py-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300'
                }
                onClick={action.onClick}
              />
            ))}
          </div>
        </SidebarBody>
      </Sidebar>
    </SidebarProvider>
  );
}
