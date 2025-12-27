/**
 * Navigation Component - Simple navigation bar with routing support
 * 
 * Features:
 * - Logo button that acts as a hamburger menu to open/close the sidebar
 * - Search functionality in navigation bar
 * - Mobile-responsive hamburger menu with smooth animations
 * - Navigation highlighting for current page indication
 * - Smooth animations, hover effects, and React Router integration
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Star,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useNavigation } from '../contexts/NavigationContext';

const Navigation = ({ 
  title = "World History Simulator",
  menuItems = [],
  navItems = [],
  onLogoClick,
  showSidebar = true,
  showSearch = false,
  variant = 'default' // 'default', 'compact', 'landing'
}) => {
  const [logoSpinning, setLogoSpinning] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();

  const defaultNavItems = [
    { 
      label: 'Features', 
      path: '/features',
      onClick: () => navigate('/features')
    },
    { 
      label: 'Documentation', 
      path: '/docs',
      onClick: () => navigate('/docs')
    },
    { 
      label: 'Examples', 
      path: '/examples',
      onClick: () => navigate('/examples')
    },
    { 
      label: 'World Foundation', 
      path: '/builder',
      onClick: () => navigate('/builder')
    }
  ];

  const navItemsToShow = navItems.length > 0 ? navItems : defaultNavItems;

  // Search functionality
  const searchablePages = [
    { title: 'Universe Manager', path: '/universe', description: 'Manage multiple worlds in universes' },
    { title: 'Features', path: '/features', description: 'Explore system capabilities' },
    { title: 'Documentation', path: '/docs', description: 'Comprehensive guides and API reference' },
    { title: 'Examples', path: '/examples', description: 'Sample worlds and scenarios' },
    { title: 'World Foundation', path: '/builder', description: 'Create world basics and foundation' },
    { title: 'Template Library', path: '/templates', description: 'Browse and manage reusable templates' },
    { title: 'Node Editor', path: '/editors/nodes', description: 'Create and edit world nodes' },
    { title: 'Character Editor', path: '/editors/characters', description: 'Design characters and NPCs' },
    { title: 'Character Manager', path: '/editors/character-manager', description: 'Manage all characters (under Character Editor)' },
    { title: 'Origin Builder', path: '/origins/builder', description: 'Create character origins and backstories' },
    { title: 'Interaction Editor', path: '/editors/interactions', description: 'Build character interactions' },
    { title: 'Encounter Editor', path: '/editors/encounters', description: 'Create dynamic encounters' },
    { title: 'Simulation', path: '/simulation', description: 'Run world history simulation' }
  ];

  // Check if current path matches nav item
  const isCurrentPath = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const handleLogoClick = () => {
    setLogoSpinning(true);
    navigation.toggleSidebar();
    setTimeout(() => setLogoSpinning(false), 600);
    
    if (onLogoClick) {
      onLogoClick(!navigation.sidebarOpen);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    navigation.setSearchQuery(query);
    
    if (query.trim()) {
      const filtered = searchablePages.filter(page =>
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (page) => {
    navigate(page.path);
    navigation.setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced search component
  const SearchComponent = () => {
    if (!showSearch) return null;

    return (
      <div className="relative max-w-md w-full" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages..."
            value={navigation.searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${
              searchFocused 
                ? 'border-indigo-500 bg-gray-700 ring-2 ring-indigo-500/20' 
                : 'border-gray-600 bg-gray-800'
            } text-white placeholder-gray-400 focus:outline-none`}
          />
        </div>
        
        {/* Search Results Dropdown */}
        {searchFocused && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.map((page, index) => (
              <button
                key={page.path}
                onClick={() => handleSearchSelect(page)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
              >
                <div className="font-medium text-white">{page.title}</div>
                <div className="text-sm text-gray-400">{page.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav 
        className={`px-4 md:px-8 py-4 md:py-6 border-b border-gray-700 ${
          variant === 'compact' ? 'py-3' : ''
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          {/* Left Section - Logo and Brand */}
          <div className="flex items-center space-x-4">
            {/* Logo Button (Hamburger) */}
            <button
              onClick={handleLogoClick}
              className="transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-transparent rounded-xl"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0',
                cursor: 'pointer'
              }}
              aria-label="Toggle sidebar menu"
            >
              <img 
                src="/images/logo.png"
                alt="World History Simulator Logo"
                className="w-12 h-12 md:w-16 md:h-16 object-contain" 
                style={{ 
                  animation: logoSpinning ? 'logoSpin 0.6s ease-in-out' : 'none',
                  transition: 'transform 0.3s ease',
                  filter: 'brightness(1.1) saturate(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} 
                onError={(e) => {
                  // Fallback to Globe icon if image fails to load
                  e.target.style.display = 'none';
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.innerHTML = `<svg class="w-12 h-12 md:w-16 md:h-16" style="color: #818cf8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
                  e.target.parentNode.appendChild(fallbackIcon.firstChild);
                }}
              />
            </button>
            
            {/* Brand Text - Clickable to go home */}
            <button
              onClick={() => navigate('/')}
              className="text-xl md:text-2xl font-bold transition-opacity hover:opacity-80 focus:outline-none focus:opacity-80"
              style={{ 
                background: 'linear-gradient(to right, #818cf8, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {title}
            </button>
          </div>
          
          {/* Center Section - Search only */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            {showSearch && <SearchComponent />}
          </div>
          
          {/* Right Section - Navigation Items moved to top right */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation Items - moved to far right */}
            <div className="flex items-center space-x-4">
              {navItemsToShow.map((item, index) => (
                <button 
                  key={index}
                  onClick={item.onClick}
                  className={`transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium ${
                    isCurrentPath(item.path) 
                      ? 'text-white bg-indigo-600/30 border border-indigo-500/50 shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Bookmarks and History (Desktop) */}
            <div className="hidden md:flex items-center space-x-2 ml-4">
              {navigation.bookmarks.length > 0 && (
                <button
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                  title="Bookmarks"
                >
                  <Star className="w-5 h-5" />
                </button>
              )}
              
              {navigation.recentPages.length > 0 && (
                <button
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                  title="Recent Pages"
                >
                  <Clock className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isOpen={navigation.sidebarOpen}
          onClose={() => navigation.setSidebarOpen(false)}
          menuItems={menuItems}
        />
      )}

      {/* Enhanced Styles */}
      <style>{`
        @keyframes logoSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .mobile-menu-enter {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navigation;