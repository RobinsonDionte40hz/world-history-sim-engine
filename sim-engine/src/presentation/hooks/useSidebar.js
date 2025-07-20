/**
 * useSidebar Hook - Manages sidebar state and animations
 * 
 * A custom hook for managing sidebar open/close state with smooth animations.
 * Can be used across different components that need sidebar functionality.
 */

import { useState, useCallback } from 'react';

const useSidebar = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const open = useCallback(() => {
    if (!isOpen && !isAnimating) {
      setIsAnimating(true);
      setIsOpen(true);
      setTimeout(() => setIsAnimating(false), 400); // Match transition duration
    }
  }, [isOpen, isAnimating]);

  const close = useCallback(() => {
    if (isOpen && !isAnimating) {
      setIsAnimating(true);
      setIsOpen(false);
      setTimeout(() => setIsAnimating(false), 400); // Match transition duration
    }
  }, [isOpen, isAnimating]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    isAnimating,
    open,
    close,
    toggle
  };
};

export default useSidebar;