
import { useState, useLayoutEffect, useCallback, useRef } from 'react';

export const useTextExpansion = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canBeTruncated, setCanBeTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkOverflow = useCallback(() => {
    if (canBeTruncated) return;
    
    const element = contentRef.current;
    if (element) {
      if (element.scrollHeight > element.clientHeight) {
        setCanBeTruncated(true);
      }
    }
  }, [canBeTruncated]);

  useLayoutEffect(() => {
    const handle = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      clearTimeout(handle);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  const toggleExpansion = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  return { contentRef, isExpanded, canBeTruncated, toggleExpansion };
};
