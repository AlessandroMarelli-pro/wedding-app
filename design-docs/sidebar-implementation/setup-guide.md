# Sidebar Implementation Setup Guide

## Overview

This guide explains how to implement the new Aceternity UI sidebar navigation for both admin and public pages.

## Installation Commands

```bash
# Install Aceternity UI sidebar component
npx shadcn@latest add https://ui.aceternity.com/registry/sidebar.json
```

## Components Created

### Core Components:

1. **`/src/components/ui/sidebar.tsx`** - Aceternity UI sidebar component
2. **`/src/components/public-sidebar.tsx`** - Public wedding website sidebar
3. **`/src/components/admin-sidebar.tsx`** - Admin panel sidebar
4. **`/src/components/sidebar-layout.tsx`** - Layout wrapper component

### Demo Pages:

1. **`/src/pages/sidebar-demo.tsx`** - Interactive demonstration page
2. **`/src/pages/index-with-sidebar.tsx`** - Public page with sidebar
3. **`/src/pages/admin/dashboard-with-sidebar.tsx`** - Admin page with sidebar

## Usage Examples

### Public Sidebar Implementation:

```tsx
import { SidebarLayout } from "@/components/sidebar-layout";

export default function PublicPage() {
  const [currentSection, setCurrentSection] = useState("home");

  return (
    <SidebarLayout
      type="public"
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {/* Your page content */}
    </SidebarLayout>
  );
}
```

### Admin Sidebar Implementation:

```tsx
import { SidebarLayout } from "@/components/sidebar-layout";

export default function AdminPage() {
  return (
    <SidebarLayout type="admin" currentPath="/admin/dashboard">
      {/* Your admin content */}
    </SidebarLayout>
  );
}
```

## Features

### Desktop Features:

- **Hover to expand/collapse** - Sidebar expands on hover, collapses when mouse leaves
- **Smooth animations** - Framer Motion powered transitions
- **Icon + text navigation** - Clean visual hierarchy
- **Active state indicators** - Current section highlighting
- **Dark mode support** - Automatic theme adaptation

### Mobile Features:

- **Full-screen overlay** - Mobile-optimized navigation
- **Slide-in animation** - Smooth entrance/exit transitions
- **Touch-friendly interface** - Large touch targets
- **Easy close functionality** - Multiple ways to close
- **Responsive design** - Adapts to all screen sizes

## Customization

### Public Sidebar Customization:

- Modify navigation items in `public-sidebar.tsx`
- Update brand logo and colors
- Add/remove sections as needed
- Customize footer actions

### Admin Sidebar Customization:

- Modify navigation items in `admin-sidebar.tsx`
- Update admin branding
- Add/remove admin sections
- Customize logout and external actions

## Integration Steps

1. **Replace existing layouts** - Update pages to use `SidebarLayout`
2. **Update navigation logic** - Implement section change handlers
3. **Test responsiveness** - Verify mobile and desktop behavior
4. **Customize styling** - Adjust colors and spacing as needed
5. **Add to existing pages** - Integrate with current admin and public pages

## Testing

Visit `/sidebar-demo` to see an interactive demonstration of both sidebar types with:

- Live switching between public and admin layouts
- Section navigation demonstration
- Feature overview and implementation notes

## Next Steps

1. Replace existing navigation in main pages
2. Update all admin pages to use sidebar layout
3. Test across different devices and browsers
4. Customize styling to match brand requirements
5. Add any additional navigation items as needed
