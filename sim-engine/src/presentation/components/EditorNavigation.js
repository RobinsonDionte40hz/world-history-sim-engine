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
  Package,
  Zap,
  BookOpen,
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
      requiresWorld: false,
      color: 'text-amber-400',
      hoverColor: 'hover:bg-amber-500/10'
    },
    {
      id: 'characters',
      name: 'Character Editor',
      path: '/editors/characters',
      icon: Users,
      description: 'Create characters',
      requiresWorld: false,
      color: 'text-purple-400',
      hoverColor: 'hover:bg-purple-500/10'
    },
    {
      id: 'interactions',
      name: 'Interaction Editor',
      path: '/editors/interactions',
      icon: MessageSquare,
      description: 'Define interactions',
      requiresWorld: false,
      color: 'text-red-400',
      hoverColor: 'hover:bg-red-500/10'
    },
    {
      id: 'encounters',
      name: 'Encounter Editor',
      path: '/editors/encounters',
      icon: Sword,
      description: 'Create encounters',
      requiresWorld: false,
      color: 'text-pink-400',
      hoverColor: 'hover:bg-pink-500/10'
    },
    {
      id: 'items',
      name: 'Item Editor',
      path: '/editors/items',
      icon: Package,
      description: 'Create items',
      requiresWorld: false,
      color: 'text-blue-400',
      hoverColor: 'hover:bg-blue-500/10'
    },
    {
      id: 'abilities',
      name: 'Ability Editor',
      path: '/editors/abilities',
      icon: Zap,
      description: 'Create abilities',
      requiresWorld: false,
      color: 'text-yellow-400',
      hoverColor: 'hover:bg-yellow-500/10'
    },
    {
      id: 'skills',
      name: 'Skill Editor',
      path: '/editors/skills',
      icon: BookOpen,
      description: 'Create skills',
      requiresWorld: false,
      color: 'text-cyan-400',
      hoverColor: 'hover:bg-cyan-500/10'
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
    <div className={`${className}`}>
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
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Editors</h3>
        
        {/* Top row - 4 editors */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {editors.slice(0, 4).map((editor) => {
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
                  flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[60px] group
                  ${isActive 
                    ? `bg-slate-700/50 border border-slate-500 ${editor.color} shadow-md` 
                    : isAvailable
                      ? `bg-slate-800/40 border border-slate-700/40 text-slate-300 ${editor.hoverColor} hover:border-slate-600 hover:shadow-md hover:scale-105`
                      : 'bg-slate-800/20 border border-slate-700/20 text-slate-500 cursor-not-allowed opacity-60'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-md mb-1 transition-all duration-200
                  ${isActive 
                    ? `bg-current/20 ${editor.color}` 
                    : isAvailable
                      ? 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50'
                      : 'bg-slate-800/50 text-slate-600'
                  }
                `}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <span className="font-medium text-xs text-center leading-tight">
                  {editor.name.replace(' Editor', '').replace(' Foundation', '')}
                </span>

                {status === 'locked' && (
                  <Lock className="w-3 h-3 text-slate-500 mt-1" />
                )}
                {isActive && (
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom row - 4 editors */}
        <div className="grid grid-cols-4 gap-2">
          {editors.slice(4, 8).map((editor) => {
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
                  flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[60px] group
                  ${isActive 
                    ? `bg-slate-700/50 border border-slate-500 ${editor.color} shadow-md` 
                    : isAvailable
                      ? `bg-slate-800/40 border border-slate-700/40 text-slate-300 ${editor.hoverColor} hover:border-slate-600 hover:shadow-md hover:scale-105`
                      : 'bg-slate-800/20 border border-slate-700/20 text-slate-500 cursor-not-allowed opacity-60'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-md mb-1 transition-all duration-200
                  ${isActive 
                    ? `bg-current/20 ${editor.color}` 
                    : isAvailable
                      ? 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50'
                      : 'bg-slate-800/50 text-slate-600'
                  }
                `}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <span className="font-medium text-xs text-center leading-tight">
                  {editor.name.replace(' Editor', '')}
                </span>

                {status === 'locked' && (
                  <Lock className="w-3 h-3 text-slate-500 mt-1" />
                )}
                {isActive && (
                  <div className="w-1 h-1 bg-current rounded-full animate-pulse mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateToEditor('world', '/builder')}
            className="p-2 text-xs bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/40 hover:border-slate-600 rounded-lg transition-all duration-200 text-slate-300 hover:text-white hover:scale-105 flex flex-col items-center space-y-1"
          >
            <Globe className="w-3 h-3" />
            <span>New World</span>
          </button>
          <button
            onClick={() => window.location.href = '/simulation'}
            disabled={!worldComplete}
            className={`
              p-2 text-xs rounded-lg transition-all duration-200 flex flex-col items-center space-y-1
              ${worldComplete
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 hover:scale-105'
                : 'bg-slate-800/20 border border-slate-700/20 text-slate-500 cursor-not-allowed opacity-60'
              }
            `}
          >
            <div className="flex items-center space-x-1">
              {!worldComplete && <Lock className="w-2 h-2" />}
              <span>Simulation</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorNavigation;