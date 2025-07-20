/**
 * NavigationContext - Manages navigation state, breadcrumbs, and routing
 * 
 * Provides centralized navigation state management including:
 * - Current route and page tracking
 * - Breadcrumb navigation
 * - Sidebar state
 * - Navigation history
 * - Search functionality
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Navigation state interface
const initialState = {
  currentRoute: '/',
  currentPage: 'Landing',
  breadcrumbs: [],
  sidebarOpen: false,
  searchQuery: '',
  recentPages: [],
  bookmarks: [],
  navigationHistory: []
};

// Action types
const NavigationActionTypes = {
  SET_CURRENT_ROUTE: 'SET_CURRENT_ROUTE',
  SET_BREADCRUMBS: 'SET_BREADCRUMBS',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  ADD_TO_RECENT: 'ADD_TO_RECENT',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  REMOVE_BOOKMARK: 'REMOVE_BOOKMARK',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY'
};

// Route to page name mapping
const routeToPageMap = {
  '/': 'Home',
  '/features': 'Features',
  '/docs': 'Documentation',
  '/examples': 'Examples',
  '/editors/nodes': 'Node Editor',
  '/editors/characters': 'Character Editor',
  '/editors/interactions': 'Interaction Editor',
  '/builder': 'World Builder',
  '/simulation': 'Simulation',
  '/history': 'History'
};

// Generate breadcrumbs from route
const generateBreadcrumbs = (route) => {
  const segments = route.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label: routeToPageMap[currentPath] || label,
      path: currentPath
    });
  });
  
  return breadcrumbs;
};

// Navigation reducer
const navigationReducer = (state, action) => {
  switch (action.type) {
    case NavigationActionTypes.SET_CURRENT_ROUTE:
      const newRoute = action.payload;
      const pageName = routeToPageMap[newRoute] || 'Unknown';
      const breadcrumbs = generateBreadcrumbs(newRoute);
      
      return {
        ...state,
        currentRoute: newRoute,
        currentPage: pageName,
        breadcrumbs,
        recentPages: [
          pageName,
          ...state.recentPages.filter(page => page !== pageName)
        ].slice(0, 10) // Keep only last 10 pages
      };
      
    case NavigationActionTypes.SET_BREADCRUMBS:
      return {
        ...state,
        breadcrumbs: action.payload
      };
      
    case NavigationActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
      
    case NavigationActionTypes.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload
      };
      
    case NavigationActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
      
    case NavigationActionTypes.ADD_TO_RECENT:
      return {
        ...state,
        recentPages: [
          action.payload,
          ...state.recentPages.filter(page => page !== action.payload)
        ].slice(0, 10)
      };
      
    case NavigationActionTypes.ADD_BOOKMARK:
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload]
      };
      
    case NavigationActionTypes.REMOVE_BOOKMARK:
      return {
        ...state,
        bookmarks: state.bookmarks.filter(bookmark => bookmark !== action.payload)
      };
      
    case NavigationActionTypes.ADD_TO_HISTORY:
      return {
        ...state,
        navigationHistory: [
          ...state.navigationHistory,
          {
            route: action.payload.route,
            timestamp: Date.now(),
            pageName: action.payload.pageName
          }
        ].slice(-50) // Keep only last 50 history entries
      };
      
    default:
      return state;
  }
};

// Create context
const NavigationContext = createContext();

// Navigation provider component
export const NavigationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Update current route when location changes
  useEffect(() => {
    dispatch({
      type: NavigationActionTypes.SET_CURRENT_ROUTE,
      payload: location.pathname
    });
    
    dispatch({
      type: NavigationActionTypes.ADD_TO_HISTORY,
      payload: {
        route: location.pathname,
        pageName: routeToPageMap[location.pathname] || 'Unknown'
      }
    });
  }, [location.pathname]);
  
  // Navigation actions
  const actions = {
    navigateTo: (path) => {
      navigate(path);
    },
    
    goBack: () => {
      navigate(-1);
    },
    
    goForward: () => {
      navigate(1);
    },
    
    toggleSidebar: () => {
      dispatch({ type: NavigationActionTypes.TOGGLE_SIDEBAR });
    },
    
    setSidebarOpen: (isOpen) => {
      dispatch({
        type: NavigationActionTypes.SET_SIDEBAR_OPEN,
        payload: isOpen
      });
    },
    
    setSearchQuery: (query) => {
      dispatch({
        type: NavigationActionTypes.SET_SEARCH_QUERY,
        payload: query
      });
    },
    
    addBookmark: (route) => {
      if (!state.bookmarks.includes(route)) {
        dispatch({
          type: NavigationActionTypes.ADD_BOOKMARK,
          payload: route
        });
      }
    },
    
    removeBookmark: (route) => {
      dispatch({
        type: NavigationActionTypes.REMOVE_BOOKMARK,
        payload: route
      });
    },
    
    setBreadcrumbs: (breadcrumbs) => {
      dispatch({
        type: NavigationActionTypes.SET_BREADCRUMBS,
        payload: breadcrumbs
      });
    }
  };
  
  const contextValue = {
    ...state,
    ...actions
  };
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;