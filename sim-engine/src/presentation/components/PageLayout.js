/**
 * PageLayout Component - Consistent page structure for all pages
 * 
 * Provides a reusable layout with header, main content, and footer areas.
 * Includes responsive grid system, loading states, and error boundaries.
 * Supports different layout variants and accessibility features.
 */

import React, { Suspense } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Navigation from '../UI/Navigation';

// Error Boundary Component for page-level error handling
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('PageLayout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-300 mb-4">
                {this.props.errorMessage || 'An unexpected error occurred while loading this page.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Reload Page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-red-300 hover:text-red-200">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-red-200 bg-red-900/30 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Spinner Component
const LoadingSpinner = ({ size = 'default', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-indigo-400 animate-spin mb-2`} />
      <p className="text-gray-300 text-sm">{message}</p>
    </div>
  );
};

// Main PageLayout Component
const PageLayout = ({
  children,
  title,
  subtitle,
  navigation = {},
  loading = false,
  loadingMessage = 'Loading...',
  error = null,
  errorMessage,
  className = '',
  variant = 'default',
  showNavigation = true,
  showFooter = true,
  fullHeight = true,
  maxWidth = 'max-w-7xl',
  padding = 'p-6'
}) => {
  // Layout variants
  const variants = {
    default: 'bg-gray-900 text-white',
    editor: 'bg-gray-900 text-white min-h-screen',
    landing: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white',
    documentation: 'bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white'
  };

  const containerClasses = `
    ${variants[variant]}
    ${fullHeight ? 'min-h-screen' : ''}
    ${className}
  `.trim();

  // Handle loading state
  if (loading) {
    return (
      <PageErrorBoundary errorMessage={errorMessage}>
        <div className={containerClasses}>
          {showNavigation && <Navigation {...navigation} />}
          <main className="flex-1 flex items-center justify-center">
            <LoadingSpinner message={loadingMessage} />
          </main>
        </div>
      </PageErrorBoundary>
    );
  }

  // Handle error state
  if (error) {
    return (
      <PageErrorBoundary errorMessage={errorMessage}>
        <div className={containerClasses}>
          {showNavigation && <Navigation {...navigation} />}
          <main className="flex-1 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Error Loading Page
                </h2>
                <p className="text-gray-300 mb-4">
                  {errorMessage || error.message || 'An error occurred while loading this page.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary errorMessage={errorMessage}>
      <div className={containerClasses}>
        {/* Header Section */}
        {showNavigation && (
          <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
            <Navigation {...navigation} />
          </header>
        )}

        {/* Page Title Section */}
        {(title || subtitle) && (
          <section className="border-b border-gray-700 bg-gray-800/50">
            <div className={`mx-auto ${maxWidth} ${padding}`}>
              {title && (
                <h1 className="text-3xl font-bold text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-gray-300 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          <div className={`mx-auto w-full ${maxWidth} ${padding} flex-1`}>
            <Suspense fallback={<LoadingSpinner message="Loading content..." />}>
              {children}
            </Suspense>
          </div>
        </main>

        {/* Footer Section */}
        {showFooter && (
          <footer className="border-t border-gray-700 bg-gray-800/50 mt-auto">
            <div className={`mx-auto ${maxWidth} ${padding}`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-400 text-sm">
                  © 2024 World History Simulation Engine. Built for creators, educators, and researchers.
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Powered by React & Redux</span>
                  <span>•</span>
                  <span>Clean Architecture</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </PageErrorBoundary>
  );
};

// Responsive Grid System Components
export const GridContainer = ({ children, className = '', cols = 'auto' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[cols]} gap-6 ${className}`}>
      {children}
    </div>
  );
};

export const FlexContainer = ({ 
  children, 
  className = '', 
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'gap-4'
}) => {
  const directionClass = direction === 'column' ? 'flex-col' : 'flex-row';
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div className={`flex ${directionClass} ${alignClass} ${justifyClass} ${wrapClass} ${gap} ${className}`}>
      {children}
    </div>
  );
};

// Section Component for consistent spacing
export const Section = ({ 
  children, 
  className = '', 
  spacing = 'py-8',
  background = 'transparent'
}) => {
  const bgClasses = {
    transparent: '',
    surface: 'bg-gray-800/30',
    card: 'bg-gray-800 rounded-lg border border-gray-700'
  };

  return (
    <section className={`${spacing} ${bgClasses[background]} ${className}`}>
      {children}
    </section>
  );
};

// Card Component for content containers
export const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false,
  border = true
}) => {
  const hoverClass = hover ? 'hover:bg-gray-700/50 transition-colors' : '';
  const borderClass = border ? 'border border-gray-700' : '';

  return (
    <div className={`bg-gray-800 rounded-lg ${borderClass} ${padding} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout;
export { PageErrorBoundary, LoadingSpinner };