'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { PublicSidebar } from './public-sidebar';

interface SidebarLayoutProps {
  children: ReactNode;
  type: 'public' | 'admin';
  currentSection?: string;
  currentPath?: string;
  onSectionChange?: (section: string) => void;
}

export function SidebarLayout({
  children,
  type,
  currentSection,
  currentPath,
  onSectionChange,
}: SidebarLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        {type === 'public' ? (
          <PublicSidebar
            currentSection={currentSection}
            onSectionChange={onSectionChange}
          />
        ) : (
          <AdminSidebar currentPath={currentPath} />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="h-full">{children}</main>
      </div>
    </div>
  );
}
