'use client';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from 'src/lib/utils';

import { useNavbarTheme } from '@/context/navbar-theme-context';
import React, { useRef, useState } from 'react';
import { MagneticButton } from './magnetic-button';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: (e: React.MouseEvent<HTMLAnchorElement>, link: string) => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState<boolean>(false);

  return (
    <motion.div
      id="navbar"
      ref={ref}
      initial={{ scale: 0.9 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 1.5,
        stiffness: 200,
        damping: 50,
      }}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn('absolute inset-x-0  z-40 w-full', className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      style={{
        minWidth: '800px',
      }}
      className={cn(
        'relative z-[60] mx-auto hidden w-full  flex-row items-start justify-between self-start rounded-full bg-transparent px-4 py-2 xl:flex dark:bg-transparent',
        visible && 'bg-white/80 dark:bg-neutral-950/80',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const { theme } = useNavbarTheme();

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 xl:flex xl:space-x-2',
        className,
      )}
    >
      {items.map((item, idx) => (
        <MagneticButton
          variant="stroke"
          className={cn(
            'rounded-full  after:border-none hover:after:border-2   text-sm h-10',
            theme.navItemsHoverColor,
            theme.navItemsColor,
          )}
          flairClassName={cn('bg-theme-accent-dark ', theme.navItemsFlairColor)}
          strokeColor={cn('bg-theme-accent-dark', theme.navItemsStrokeColor)}
          onClick={(e) => onItemClick?.(e, item.link)}
        >
          {item.name}
        </MagneticButton>
        /*   <a
            onMouseEnter={() => setHovered(idx)}
            onClick={(e) => onItemClick?.(e, item.link)}
            className="relative px-4 py-2  hover:text-theme-default"
            key={`link-${idx}`}
            href={item.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-theme-accent text-theme-default hover:text-theme-default"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </a> */
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? 'blur(10px)' : 'none',
        boxShadow: visible
          ? '0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset'
          : 'none',
        width: visible ? '90%' : '100%',
        paddingRight: visible ? '12px' : '0px',
        paddingLeft: visible ? '12px' : '0px',
        borderRadius: visible ? '4px' : '2rem',
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 xl:hidden',
        visible && 'bg-white/80 dark:bg-neutral-950/80',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div className={cn('flex w-full flex-row justify-end', className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed h-full w-full inset-0 bg-theme-accent  p-10 z-[100] flex flex-col justify-start gap-4',
            className,
          )}
        >
          <div
            className="absolute right-10 top-10 z-50 text-white dark:text-white"
            onClick={onClose}
          >
            <IconX />
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({ onClick }: { onClick: () => void }) => {
  return <IconMenu2 className="text-black dark:text-white" onClick={onClick} />;
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="w-30 h-10 relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    ></a>
  );
};
