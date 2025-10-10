import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export interface NavbarTheme {
  navColor: string;
  navItemsColor: string;
  navItemsHoverColor: string;
  navItemsStrokeColor: string;
  navItemsFlairColor: string;

  rsvpItemsColor: string;
  rsvpItemsHoverColor: string;
  rsvpAfterBorderColor: string;
  rsvpItemsFlairColor: string;
  rsvpItemsStrokeColor: string;

  hideNavbar?: boolean;
}

const defaultNavbarTheme: NavbarTheme = {
  navColor: 'bg-theme-default-glassy',
  navItemsColor: 'text-theme-accent-dark',
  navItemsHoverColor: 'hover:text-theme-default',
  navItemsStrokeColor: 'bg-theme-accent-dark',
  navItemsFlairColor: 'bg-theme-accent-dark',
  rsvpItemsColor: 'text-theme-accent-dark',
  rsvpItemsHoverColor: 'hover:text-theme-default',
  rsvpAfterBorderColor: 'after:border-theme-accent-dark',
  rsvpItemsFlairColor: 'bg-theme-accent-dark',
  rsvpItemsStrokeColor: 'bg-theme-accent-dark',
  hideNavbar: false,
};

const NavbarThemeContext = createContext<{
  theme: NavbarTheme;
  setTheme: (theme: NavbarTheme) => void;
  updateTheme: <K extends keyof NavbarTheme>(
    key: K,
    value: NavbarTheme[K],
  ) => void;
  resetTheme: () => void;
  mergeTheme: (partialTheme: Partial<NavbarTheme>) => void;
} | null>(null);

interface NavbarThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<NavbarTheme>;
}

export function NavbarThemeProvider({
  children,
  initialTheme = {},
}: NavbarThemeProviderProps) {
  const [theme, setTheme] = useState<NavbarTheme>({
    ...defaultNavbarTheme,
    ...initialTheme,
  });

  const updateTheme = <K extends keyof NavbarTheme>(
    key: K,
    value: NavbarTheme[K],
  ) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetTheme = () => {
    setTheme(defaultNavbarTheme);
  };

  const mergeTheme = (partialTheme: Partial<NavbarTheme>) => {
    setTheme((prev) => ({
      ...prev,
      ...partialTheme,
    }));
  };

  const themeValue = useMemo(
    () => ({
      theme,
      setTheme,
      updateTheme,
      resetTheme,
      mergeTheme,
    }),
    [theme],
  );

  return (
    <NavbarThemeContext.Provider value={themeValue}>
      {children}
    </NavbarThemeContext.Provider>
  );
}

export function useNavbarTheme() {
  const context = useContext(NavbarThemeContext);
  if (!context) {
    throw new Error('useNavbarTheme must be used within a NavbarThemeProvider');
  }
  return context;
}

// Predefined theme variants
export const navbarThemes = {
  default: defaultNavbarTheme,
  yellow: defaultNavbarTheme,
  pink: {
    rsvpItemsColor: 'text-theme-accent-dark',
    rsvpItemsHoverColor: 'hover:text-theme-accent',
    rsvpAfterBorderColor: 'after:border-theme-accent-dark',
    rsvpItemsFlairColor: 'bg-theme-accent-dark',
    rsvpItemsStrokeColor: 'bg-theme-accent-dark',

    navColor: 'bg-theme-accent-glassy',
    navItemsColor: 'text-theme-accent-dark',
    navItemsHoverColor: 'hover:text-theme-accent',
    navItemsStrokeColor: 'bg-theme-accent-dark',
    navItemsFlairColor: 'bg-theme-accent-dark',
    navItemsActiveColor: 'text-theme-accent',
  },
  white: {
    rsvpItemsColor: 'text-theme-accent-dark',
    rsvpItemsHoverColor: 'hover:text-white',
    rsvpAfterBorderColor: 'after:border-theme-accent-dark',

    navColor: 'bg-theme-none-glassy',
    navItemsColor: 'text-theme-accent-dark',
    navItemsHoverColor: 'hover:text-white',
    navItemsStrokeColor: 'bg-theme-accent-dark',
    navItemsFlairColor: 'bg-theme-accent-dark',
  },
  transparent: {
    rsvpAfterBorderColor: 'after:border-theme-white',
    rsvpItemsColor: 'text-white',
    rsvpItemsHoverColor: 'hover:text-white',
    rsvpItemsFlairColor: 'bg-white/10',
    rsvpItemsStrokeColor: 'bg-white',

    navColor: 'bg-transparent',
    navItemsColor: 'text-none',
    navItemsHoverColor: 'hover:text-gray-300',
    navItemsStrokeColor: 'bg-white',
    navItemsFlairColor: 'bg-white/10',
    navItemsActiveColor: 'text-white',
    hideNavbar: true,
  },
} as const;

export type NavbarThemeVariant = keyof typeof navbarThemes;
