/**
 * Navigation Component - Enhanced navigation bar with routing support
 * 
 * Features:
 * - Logo button that acts as a hamburger menu to open/close the sidebar
 * - Breadcrumb navigation with dynamic generation
 * - Search functionality in navigation bar
 * - Mobile-responsive hamburger menu with smooth animations
 * - Navigation highlighting for current page indication
 * - Smooth animations, hover effects, and React Router integration
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Bookmark, 
  History, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Star,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useNavigation } from '../contexts/NavigationContext';
import useSidebar from '../hooks/useSidebar';

const Navigation = ({ 
  title = "World History Simulator",
  menuItems = [],
  navItems = [],
  onLogoClick,
  showSidebar = true,
  showBreadcrumbs = true,
  showSearch = false,
  variant = 'default' // 'default', 'compact', 'landing'
}) => {
  const sidebar = useSidebar(false);
  const [logoSpinning, setLogoSpinning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      label: 'Builder', 
      path: '/builder',
      onClick: () => navigate('/builder')
    }
  ];

  const navItemsToShow = navItems.length > 0 ? navItems : defaultNavItems;

  // Search functionality
  const searchablePages = [
    { title: 'Features', path: '/features', description: 'Explore system capabilities' },
    { title: 'Documentation', path: '/docs', description: 'Comprehensive guides and API reference' },
    { title: 'Examples', path: '/examples', description: 'Sample worlds and scenarios' },
    { title: 'Node Editor', path: '/editors/nodes', description: 'Create and edit world nodes' },
    { title: 'Character Editor', path: '/editors/characters', description: 'Design characters and NPCs' },
    { title: 'Interaction Editor', path: '/editors/interactions', description: 'Build character interactions' },
    { title: 'World Builder', path: '/builder', description: 'Main world building interface' }
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Enhanced breadcrumb component
  const BreadcrumbNavigation = () => {
    if (!showBreadcrumbs || navigation.breadcrumbs.length <= 1) return null;

    return (
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        {navigation.breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index === 0 ? (
              <button
                onClick={() => navigate(crumb.path)}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
                aria-label="Go to home"
              >
                <Home className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate(crumb.path)}
                className={`transition-colors ${
                  index === navigation.breadcrumbs.length - 1
                    ? 'text-white font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {crumb.label}
              </button>
            )}
            {index < navigation.breadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

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
              className="transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
              style={{
                background: 'rgba(129, 140, 248, 0.1)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(129, 140, 248, 0.2)';
                e.target.style.borderColor = 'rgba(129, 140, 248, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(129, 140, 248, 0.1)';
                e.target.style.borderColor = 'rgba(129, 140, 248, 0.3)';
              }}
              aria-label="Toggle sidebar menu"
            >
              <Globe 
                className="w-6 h-6 md:w-8 md:h-8" 
                style={{ 
                  color: '#818cf8',
                  animation: logoSpinning ? 'logoSpin 0.6s ease-in-out' : 'none',
                  transition: 'transform 0.3s ease'
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
          
          {/* Center Section - Search or Breadcrumbs */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            {showSearch ? (
              <SearchComponent />
            ) : (
              <BreadcrumbNavigation />
            )}
          </div>
          
          {/* Right Section - Navigation Items */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-4">
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
            <div className="hidden md:flex items-center space-x-2">
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
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search (when enabled) */}
        {showSearch && (
          <div className="lg:hidden mt-4">
            <SearchComponent />
          </div>
        )}

        {/* Mobile Breadcrumbs */}
        <div className="lg:hidden mt-4">
          <BreadcrumbNavigation />
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={toggleMobileMenu}>
          <div 
            className="absolute top-0 right-0 w-64 h-full bg-gray-800 border-l border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Menu</h3>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {navItemsToShow.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                    isCurrentPath(item.path)
                      ? 'text-white bg-indigo-600/30 border border-indigo-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Bookmarks and History */}
              {navigation.bookmarks.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Bookmarks</h4>
                  {navigation.bookmarks.slice(0, 5).map((bookmark, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(bookmark);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition-colors"
                    >
                      {bookmark}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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