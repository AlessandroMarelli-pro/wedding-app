import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setIsResizing(true);
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsResizing(false);
    }
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Disable on mobile
    window.addEventListener('touchstart', () =>
      window.removeEventListener('resize', handleResize),
    );
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchstart', () =>
        window.removeEventListener('resize', handleResize),
      );
    };
  }, []); // Empty array ensures that effect is only run on mount
  return { ...windowSize, isResizing };
}
export default useWindowSize;
