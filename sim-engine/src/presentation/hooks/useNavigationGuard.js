/**
 * useNavigationGuard Hook - Prevent navigation with unsaved changes
 * 
 * Provides navigation protection functionality to prevent users from
 * accidentally losing unsaved work when navigating between editors.
 * 
 * Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import editorStateManager from '../../application/services/EditorStateManager';

/**
 * Custom hook for navigation protection with unsaved changes
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation guard utilities
 */
const useNavigationGuard = (options = {}) => {
  const {
    enabled = true,
    confirmMessage = 'You have unsaved changes. Are you sure you want to leave?',
    onBeforeUnload = null,
    onNavigationBlocked = null,
    onNavigationAllowed = null
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);

  /**
   * Check if navigation should be blocked
   * @returns {boolean} Whether navigation should be blocked
   */
  const shouldBlockNavigation = useCallback(() => {
    if (!enabled) return false;
    
    const state = editorStateManager.getState();
    return state.hasUnsavedChanges;
  }, [enabled]);

  /**
   * Handle navigation attempt
   * @param {Function} navigationFn - Navigation function to execute
   * @param {Array} args - Arguments for navigation function
   */
  const handleNavigation = useCallback((navigationFn, ...args) => {
    if (shouldBlockNavigation() && !isNavigatingRef.current) {
      const confirmed = window.confirm(confirmMessage);
      
      if (confirmed) {
        // User confirmed, allow navigation
        isNavigatingRef.current = true;
        editorStateManager.setUnsavedChanges(false); // Clear unsaved changes
        
        if (onNavigationAllowed) {
          onNavigationAllowed();
        }
        
        navigationFn(...args);
        
        // Reset flag after navigation
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      } else {
        // User cancelled navigation
        if (onNavigationBlocked) {
          onNavigationBlocked();
        }
      }
    } else {
      // No unsaved changes or already navigating, proceed normally
      navigationFn(...args);
    }
  }, [shouldBlockNavigation, confirmMessage, onNavigationAllowed, onNavigationBlocked]);

  /**
   * Protected navigate function
   * @param {string|number} to - Navigation target
   * @param {Object} options - Navigation options
   */
  const guardedNavigate = useCallback((to, options = {}) => {
    handleNavigation(navigate, to, options);
  }, [navigate, handleNavigation]);

  /**
   * Protected back navigation
   */
  const guardedGoBack = useCallback(() => {
    handleNavigation(() => navigate(-1));
  }, [navigate, handleNavigation]);

  /**
   * Protected forward navigation
   */
  const guardedGoForward = useCallback(() => {
    handleNavigation(() => navigate(1));
  }, [navigate, handleNavigation]);

  /**
   * Force navigation without protection (use with caution)
   * @param {string|number} to - Navigation target
   * @param {Object} options - Navigation options
   */
  const forceNavigate = useCallback((to, options = {}) => {
    isNavigatingRef.current = true;
    editorStateManager.setUnsavedChanges(false);
    navigate(to, options);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [navigate]);

  /**
   * Check if navigation is currently blocked
   * @returns {boolean} Whether navigation is blocked
   */
  const isNavigationBlocked = useCallback(() => {
    return shouldBlockNavigation() && !isNavigatingRef.current;
  }, [shouldBlockNavigation]);

  /**
   * Manually trigger navigation confirmation
   * @returns {boolean} Whether user confirmed navigation
   */
  const confirmNavigation = useCallback(() => {
    if (!shouldBlockNavigation()) return true;
    
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      editorStateManager.setUnsavedChanges(false);
    }
    return confirmed;
  }, [shouldBlockNavigation, confirmMessage]);

  // Handle browser back/forward buttons and page refresh
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event) => {
      if (shouldBlockNavigation()) {
        event.preventDefault();
        event.returnValue = confirmMessage;
        
        if (onBeforeUnload) {
          onBeforeUnload(event);
        }
        
        return confirmMessage;
      }
    };

    const handlePopState = () => {
      if (shouldBlockNavigation() && !isNavigatingRef.current) {
        const confirmed = window.confirm(confirmMessage);
        
        if (!confirmed) {
          // Prevent the navigation by pushing the current state back
          window.history.pushState(null, '', location.pathname + location.search);
          
          if (onNavigationBlocked) {
            onNavigationBlocked();
          }
        } else {
          editorStateManager.setUnsavedChanges(false);
          
          if (onNavigationAllowed) {
            onNavigationAllowed();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, shouldBlockNavigation, confirmMessage, location, onBeforeUnload, onNavigationBlocked, onNavigationAllowed]);

  // Handle React Router navigation blocking
  useEffect(() => {
    if (!enabled) return;

    // This is a simplified approach - in a real implementation,
    // you might want to use React Router's unstable_useBlocker
    // or implement a more sophisticated solution
    
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      if (shouldBlockNavigation() && !isNavigatingRef.current) {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          if (onNavigationBlocked) {
            onNavigationBlocked();
          }
          return;
        }
        editorStateManager.setUnsavedChanges(false);
        if (onNavigationAllowed) {
          onNavigationAllowed();
        }
      }
      originalPushState.apply(this, args);
    };

    window.history.replaceState = function(...args) {
      if (shouldBlockNavigation() && !isNavigatingRef.current) {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          if (onNavigationBlocked) {
            onNavigationBlocked();
          }
          return;
        }
        editorStateManager.setUnsavedChanges(false);
        if (onNavigationAllowed) {
          onNavigationAllowed();
        }
      }
      originalReplaceState.apply(this, args);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [enabled, shouldBlockNavigation, confirmMessage, onNavigationBlocked, onNavigationAllowed]);

  return {
    // Navigation functions
    navigate: guardedNavigate,
    goBack: guardedGoBack,
    goForward: guardedGoForward,
    forceNavigate,
    
    // State checks
    isNavigationBlocked,
    shouldBlockNavigation,
    hasUnsavedChanges: shouldBlockNavigation,
    
    // Manual controls
    confirmNavigation,
    
    // Utilities
    clearUnsavedChanges: () => editorStateManager.setUnsavedChanges(false),
    setUnsavedChanges: (hasChanges) => editorStateManager.setUnsavedChanges(hasChanges)
  };
};

export default useNavigationGuard;