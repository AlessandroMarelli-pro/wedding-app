'use client';

import type { Variants } from 'motion/react';
import { stagger } from 'motion/react';
import * as motion from 'motion/react-client';
import { useEffect, useRef, useState } from 'react';

export default function MobileNav2({
  items,
}: {
  items: { name: string; link: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(containerRef);

  return (
    <div className="lg:hidden">
      <motion.div animate={{}} style={container}>
        <motion.nav
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          custom={height}
          ref={containerRef}
          style={nav}
        >
          <motion.div style={background} variants={sidebarVariants} />

          <Navigation
            items={items}
            setIsMobileMenuOpen={setIsOpen}
            isOpen={isOpen}
          />

          <MenuToggle toggle={() => setIsOpen(!isOpen)} />
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
}: {
  items: { name: string; link: string }[];
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}) => (
  <motion.ul style={list} variants={navVariants}>
    {items.map((item, index) => (
      <MenuItem
        key={'menu-item-' + item.name}
        item={item}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isOpen={isOpen}
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

const colors = ['#FF008C', '#D309E1', '#9C1AFF', '#7700FF', '#4400FF'];

const MenuItem = ({
  item,
  setIsMobileMenuOpen,
  isOpen,
}: {
  item: { name: string; link: string };
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}) => {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string,
  ) => {
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
          href={item.link}
          onClick={(e) => {
            handleNavClick(e, item.link);
            setIsMobileMenuOpen(false);
          }}
          className="relative text-white"
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

const MenuToggle = ({ toggle }: { toggle: () => void }) => (
  <button style={toggleContainer} onClick={toggle}>
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: {
            d: 'M 2 2.5 L 20 2.5',
            stroke: '#F38181',
          },
          open: {
            d: 'M 3 16.5 L 17 2.5',
            stroke: 'white',
          },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1, stroke: '#F38181' },
          open: { opacity: 0, stroke: 'white' },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: 'M 2 16.346 L 20 16.346', stroke: '#F38181' },
          open: { d: 'M 3 2.5 L 17 16.346', stroke: 'white' },
        }}
      />
    </svg>
  </button>
);

/**
 * ==============   Styles   ================
 */

const container: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flex: 1,
  width: '100vw',
  height: '100vh',
  backgroundColor: '',
  overflow: 'hidden',
  zIndex: 1000,
};

const nav: React.CSSProperties = {
  width: 300,
};

const background: React.CSSProperties = {
  backgroundColor: '#F38181',
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: 300,
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
};

const list: React.CSSProperties = {
  listStyle: 'none',
  padding: 25,
  margin: 0,
  position: 'absolute',
  top: 80,
  width: 230,
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
