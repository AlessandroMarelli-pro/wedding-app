# Feature: Sidebar Implementation with Aceternity UI

## Overview

Implementing a modern sidebar navigation for both admin and public pages using Aceternity UI components.

## Components Required:

### Core Components:

- Sidebar (main container with hover expand/collapse)
- SidebarProvider (context provider for state management)
- SidebarBody (desktop and mobile variants)
- SidebarLink (navigation links with icons)

### Additional Components:

- Button (for actions like logout)
- Separator (for visual grouping)
- Badge (for notifications/counts)

## Component Hierarchy:

### Public Sidebar:

```
SidebarProvider
└── Sidebar
    └── SidebarBody
        ├── Logo/Brand
        ├── SidebarLink (Home)
        ├── SidebarLink (Our Story)
        ├── SidebarLink (Details)
        ├── SidebarLink (Accommodations)
        ├── SidebarLink (Program)
        ├── SidebarLink (RSVP)
        └── Footer Actions
```

### Admin Sidebar:

```
SidebarProvider
└── Sidebar
    └── SidebarBody
        ├── Admin Logo/Brand
        ├── SidebarLink (Dashboard)
        ├── SidebarLink (Wedding Info)
        ├── SidebarLink (Accommodations)
        ├── SidebarLink (Program)
        ├── SidebarLink (Guest List)
        ├── SidebarLink (Images)
        ├── Separator
        ├── Button (View Site)
        └── Button (Logout)
```

## Features:

- Hover to expand/collapse on desktop
- Mobile-responsive with overlay
- Smooth animations
- Dark mode support
- Active state indicators
- Icon + text navigation
- Context-based state management
