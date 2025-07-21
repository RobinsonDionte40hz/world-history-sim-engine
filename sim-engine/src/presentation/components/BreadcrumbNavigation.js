/**
 * BreadcrumbNavigation Component - Breadcrumb navigation system
 * 
 * Provides breadcrumb navigation showing current editor location and path,
 * with clickable navigation and current world context.
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React from 'react';
import { ChevronRight, Home, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useEditorNavigation from '../hooks/useEditorNavigation';
import editorStateManager from '../../application/services/EditorStateManager';

const BreadcrumbNavigation = ({ className = '', showWorldInfo = true }) => {
  const navigate = useNavigate();
  const { getBreadcrumbs } = useEditorNavigation();
  const editorState = editorStateManager.getState();

  const breadcrumbs = getBreadcrumbs();
  const currentWorld = editorState.currentWorld;

  const handleBreadcrumbClick = (path) => {
    if (path && path !== window.location.pathname) {
      navigate(path);
    }
  };

  return (
    <div className={`bg-slate-800/30 border border-slate-700/30 rounded-lg p-4 ${className}`}>
      {/* World Context */}
      {showWorldInfo && currentWorld && (
        <div className="mb-3 pb-3 border-b border-slate-700/30">
          <div className="flex items-center space-x-2 text-sm">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Current World:</span>
            <span className="text-white font-medium">{currentWorld.name}</span>
          </div>
          {currentWorld.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {currentWorld.description}
            </p>
          )}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const IconComponent = crumb.icon || Home;

          return (
            <React.Fragment key={crumb.path || index}>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                  disabled={isLast || !crumb.path}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded-md transition-colors
                    ${isLast
                      ? 'text-white bg-slate-700/30 cursor-default'
                      : crumb.path
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700/50 cursor-pointer'
                        : 'text-slate-500 cursor-default'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className={isLast ? 'font-medium' : ''}>{crumb.label}</span>
                </button>
              </div>
              
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Additional Context */}
      {breadcrumbs.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-700/30">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {breadcrumbs.length - 1} level{breadcrumbs.length !== 2 ? 's' : ''} deep
            </span>
            <button
              onClick={() => handleBreadcrumbClick('/')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreadcrumbNavigation;