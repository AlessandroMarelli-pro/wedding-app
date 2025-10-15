'use client';

import { useNavbarTheme } from '@/context/navbar-theme-context';
import { cn } from '@/lib';
import type { Variants } from 'motion/react';
import { stagger } from 'motion/react';
import * as motion from 'motion/react-client';
import { useEffect, useRef, useState } from 'react';

export default function MobileNav2({
  items,
}: {
  items: { name: string; link: string }[];
}) {
  const { theme } = useNavbarTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(containerRef);
  const [navItemsBgColor, setNavItemsBgColor] = useState(
    theme.mobileNavItemsBg,
  );
  const [navItemsTextColor, setNavItemsTextColor] = useState(
    theme.mobileNavItemsTextColor,
  );
  const [navItemsCloseBgColor, setNavItemsCloseBgColor] = useState(
    theme.mobileNavCloseItemsBg,
  );
  useEffect(() => {
    setNavItemsBgColor(theme.mobileNavItemsBg);
    setNavItemsTextColor(theme.mobileNavItemsTextColor);
    setNavItemsCloseBgColor(theme.mobileNavCloseItemsBg);
  }, [theme]);
  return (
    <div className="xl:hidden z-[400]">
      <motion.div
        animate={{}}
        style={{
          ...container,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <motion.nav
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          custom={height}
          ref={containerRef}
          style={nav}
        >
          <motion.div
            style={{ ...background, backgroundColor: navItemsBgColor }}
            variants={sidebarVariants}
          />

          <Navigation
            items={items}
            setIsMobileMenuOpen={setIsOpen}
            isOpen={isOpen}
            textColor={navItemsTextColor}
          />

          <MenuToggle
            toggle={() => setIsOpen(!isOpen)}
            strokeColor={navItemsBgColor}
            strokeColorClose={navItemsCloseBgColor}
          />
        </motion.nav>
      </motion.div>
    </div>
  );
}

const navVariants = {
  open: {
    transition: { delayChildren: stagger(0.07, { startDelay: 0.2 }) },
  },
  closed: {
    transition: { delayChildren: stagger(0.05, { from: 'last' }) },
  },
};

const Navigation = ({
  items,
  setIsMobileMenuOpen,
  isOpen,
  textColor,
}: {
  items: { name: string; link: string }[];
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  textColor: string;
}) => (
  <motion.ul style={list} variants={navVariants}>
    {items.map((item, index) => (
      <MenuItem
        key={'menu-item-' + item.name}
        item={item}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isOpen={isOpen}
        textColor={textColor}
      />
    ))}
  </motion.ul>
);

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const MenuItem = ({
  item,
  setIsMobileMenuOpen,
  isOpen,
  textColor,
}: {
  item: { name: string; link: string };
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  textColor: string;
}) => {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string,
  ) => {
    if (link.startsWith('https://')) {
      window.open(link, '_blank');
      return;
    }
    e.preventDefault();
    const sectionId = link.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.li
      style={listItem}
      variants={itemVariants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {isOpen && (
        <a
          key={`mobile-link-${item.link}`}
          href={item.link.startsWith('https://') ? '#' : '#' + item.link}
          onClick={(e) => {
            handleNavClick(e, item.link);
            setIsMobileMenuOpen(false);
          }}
          className={cn('relative', textColor)}
        >
          <span className="flew flex-row">{item.name}</span>
        </a>
      )}
    </motion.li>
  );
};

const sidebarVariants: Variants = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 20px 30px)`,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(0px at 20px 30px)',
    transition: {
      delay: 0.2,
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

interface PathProps {
  d?: string;
  variants: Variants;
  transition?: { duration: number };
}

const Path = (props: PathProps) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({
  toggle,
  strokeColor,
  strokeColorClose,
}: {
  toggle: () => void;
  strokeColor: string;
  strokeColorClose: string;
}) => (
  <button style={toggleContainer} onClick={toggle}>
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: {
            d: 'M 2 2.5 L 20 2.5',
            stroke: strokeColor,
          },
          open: {
            d: 'M 3 16.5 L 17 2.5',
            stroke: strokeColorClose,
          },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1, stroke: strokeColor },
          open: { opacity: 0, stroke: strokeColorClose },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: {
            d: 'M 2 16.346 L 20 16.346',
            stroke: strokeColor,
          },
          open: { d: 'M 3 2.5 L 17 16.346', stroke: strokeColorClose },
        }}
      />
    </svg>
  </button>
);

/**
 * ==============   Styles   ================
 */

const container: React.CSSProperties = {
  position: 'fixed',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flex: 1,
  width: '100vw',
  height: '100vh',
  backgroundColor: '',
  overflow: 'hidden',
  zIndex: 400,
};

const nav: React.CSSProperties = {
  width: 300,
};

const background: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: 200,
};

const toggleContainer: React.CSSProperties = {
  outline: 'none',
  border: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  cursor: 'pointer',
  position: 'absolute',
  top: 10,
  left: 10,
  width: 50,
  height: 50,
  backgroundColor: 'transparent',
  pointerEvents: 'auto',
  zIndex: 401,
};

const list: React.CSSProperties = {
  listStyle: 'none',
  padding: 25,
  margin: 0,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  top: 50,
  width: 200,
};

const listItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: 0,
  margin: 0,
  listStyle: 'none',
  marginBottom: 20,
  cursor: 'pointer',
};

/**
 * ==============   Utils   ================
 */

// Naive implementation - in reality would want to attach
// a window or resize listener. Also use state/layoutEffect instead of ref/effect
// if this is important to know on initial client render.
// It would be safer to  return null for unmeasured states.
const useDimensions = (ref: React.RefObject<HTMLDivElement | null>) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};
