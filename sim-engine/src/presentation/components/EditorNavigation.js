/**
 * EditorNavigation Component - Unified navigation system for all editors
 * 
 * Provides consistent navigation between editors with world foundation requirements,
 * unsaved changes warnings, and breadcrumb navigation.
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  Globe, 
  MapPin, 
  Users, 
  MessageSquare, 
  Sword,
  ChevronRight,
  AlertTriangle,
  Lock
} from 'lucide-react';
import useEditorNavigation from '../hooks/useEditorNavigation';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

const EditorNavigation = ({ className = '' }) => {
  const location = useLocation();
  const { 
    navigateToEditor, 
    getAvailableEditors,
    isWorldFoundationComplete 
  } = useEditorNavigation();
  const { hasUnsavedChanges } = useUnsavedChanges();

  // Editor definitions with icons and metadata
  const editors = [
    {
      id: 'world',
      name: 'World Foundation',
      path: '/builder',
      icon: Globe,
      description: 'Create world basics',
      requiresWorld: false,
      color: 'text-emerald-400',
      hoverColor: 'hover:bg-emerald-500/10'
    },
    {
      id: 'nodes',
      name: 'Node Editor',
      path: '/editors/nodes',
      icon: MapPin,
      description: 'Create locations',
      requiresWorld: true,
      color: 'text-amber-400',
      hoverColor: 'hover:bg-amber-500/10'
    },
    {
      id: 'characters',
      name: 'Character Editor',
      path: '/editors/characters',
      icon: Users,
      description: 'Create characters',
      requiresWorld: true,
      color: 'text-purple-400',
      hoverColor: 'hover:bg-purple-500/10'
    },
    {
      id: 'interactions',
      name: 'Interaction Editor',
      path: '/editors/interactions',
      icon: MessageSquare,
      description: 'Define interactions',
      requiresWorld: true,
      color: 'text-red-400',
      hoverColor: 'hover:bg-red-500/10'
    },
    {
      id: 'encounters',
      name: 'Encounter Editor',
      path: '/editors/encounters',
      icon: Sword,
      description: 'Create encounters',
      requiresWorld: true,
      color: 'text-pink-400',
      hoverColor: 'hover:bg-pink-500/10'
    }
  ];

  const availableEditors = getAvailableEditors();
  const worldComplete = isWorldFoundationComplete();

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/', icon: Home }
    ];

    const currentEditorData = editors.find(e => e.path === location.pathname);
    if (currentEditorData) {
      breadcrumbs.push({
        label: currentEditorData.name,
        path: currentEditorData.path,
        icon: currentEditorData.icon
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleEditorClick = (editor) => {
    if (!availableEditors.includes(editor.id)) {
      return; // Editor not available
    }

    navigateToEditor(editor.id, editor.path);
  };

  const isEditorActive = (editor) => {
    return location.pathname === editor.path;
  };

  const isEditorAvailable = (editor) => {
    return availableEditors.includes(editor.id);
  };

  const getEditorStatus = (editor) => {
    if (!editor.requiresWorld) return 'available';
    if (!worldComplete) return 'locked';
    return 'available';
  };

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 ${className}`}>
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <div className="flex items-center space-x-1">
                <crumb.icon className="w-4 h-4" />
                <span className={index === breadcrumbs.length - 1 ? 'text-white font-medium' : ''}>
                  {crumb.label}
                </span>
              </div>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* World Foundation Status */}
      {!worldComplete && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">World Foundation Required</span>
          </div>
          <p className="text-xs text-amber-300/80 mt-1">
            Complete the World Foundation before accessing other editors
          </p>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Unsaved Changes</span>
          </div>
          <p className="text-xs text-red-300/80 mt-1">
            You have unsaved changes that will be lost if you navigate away
          </p>
        </div>
      )}

      {/* Editor Navigation */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Editors</h3>
        
        {editors.map((editor) => {
          const isActive = isEditorActive(editor);
          const isAvailable = isEditorAvailable(editor);
          const status = getEditorStatus(editor);
          const IconComponent = editor.icon;

          return (
            <button
              key={editor.id}
              onClick={() => handleEditorClick(editor)}
              disabled={!isAvailable}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? `bg-slate-700/50 border border-slate-600 ${editor.color}` 
                  : isAvailable
                    ? `bg-slate-800/30 border border-slate-700/30 text-slate-300 ${editor.hoverColor} hover:border-slate-600`
                    : 'bg-slate-800/20 border border-slate-700/20 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-lg 
                  ${isActive 
                    ? `bg-current/10 ${editor.color}` 
                    : isAvailable
                      ? 'bg-slate-700/50 text-slate-400'
                      : 'bg-slate-800/50 text-slate-600'
                  }
                `}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {editor.name}
                    </span>
                    {isActive && (
                      <span className="text-xs bg-current/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-75">
                    {editor.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {status === 'locked' && (
                  <Lock className="w-4 h-4 text-slate-500" />
                )}
                {isActive && (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateToEditor('world', '/builder')}
            className="p-2 text-xs bg-slate-800/30 hover:bg-slate-700/30 border border-slate-700/30 hover:border-slate-600 rounded-lg transition-colors text-slate-300"
          >
            New World
          </button>
          <button
            onClick={() => window.location.href = '/simulation'}
            disabled={!worldComplete}
            className={`
              p-2 text-xs rounded-lg transition-colors
              ${worldComplete
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/20 border border-slate-700/20 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            Run Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorNavigation;