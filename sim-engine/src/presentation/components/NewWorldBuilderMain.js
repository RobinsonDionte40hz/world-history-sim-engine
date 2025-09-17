/**
 * NewWorldBuilderMain - Main world builder interface with view management
 * Provides the primary interface for creating and managing worlds with multiple views
 */

import React, { useState, useCallback } from 'react';
import { Home, Settings, Users, Map, FileText } from 'lucide-react';
import WorldBuilderInterface from './WorldBuilderInterface.js';
import CharacterManager from './CharacterManager.js';
import NodeEditor from './NodeEditor.js';
import InteractionEditor from './InteractionEditor.js';
import TemplateLibraryPanel from './TemplateLibraryPanel.js';

/**
 * NewWorldBuilderMain - Main component for world building with navigation
 * @param {Object} props - Component props
 * @param {Function} props.onViewChange - Callback when view changes
 * @returns {JSX.Element} World builder main interface
 */
const NewWorldBuilderMain = ({ onViewChange }) => {
  const [currentView, setCurrentView] = useState('landing');
  const [worldBuilderState, setWorldBuilderState] = useState({
    worldConfig: {
      name: '',
      description: '',
      rules: {},
      initialConditions: {}
    },
    validation: {
      isValid: false,
      errors: []
    }
  });

  // Handle view changes
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  }, [onViewChange]);

  // Handle world configuration changes
  const handleWorldChange = useCallback((changes) => {
    setWorldBuilderState(prev => ({
      ...prev,
      worldConfig: {
        ...prev.worldConfig,
        ...changes
      }
    }));
  }, []);

  // Navigation items
  const navigationItems = [
    {
      id: 'landing',
      label: 'Home',
      icon: Home,
      description: 'Welcome and overview'
    },
    {
      id: 'world',
      label: 'World',
      icon: Settings,
      description: 'World properties and settings'
    },
    {
      id: 'characters',
      label: 'Characters',
      icon: Users,
      description: 'Create and manage characters'
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: Map,
      description: 'Define locations and contexts'
    },
    {
      id: 'interactions',
      label: 'Interactions',
      icon: FileText,
      description: 'Create character interactions'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      description: 'Manage templates and presets'
    }
  ];

  // Render landing page
  const renderLandingPage = () => (
    <div className="landing-page text-center py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          World History Simulation Builder
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Create rich, dynamic worlds for turn-based historical simulation.
          Build characters, locations, and interactions that evolve over time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <Icon className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.label}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Ready to Start?
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Begin by setting up your world properties, then add characters, locations, and interactions.
          </p>
          <button
            onClick={() => handleViewChange('world')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Start Building
          </button>
        </div>
      </div>
    </div>
  );

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return renderLandingPage();

      case 'world':
        return (
          <WorldBuilderInterface
            worldBuilderState={worldBuilderState}
            onWorldChange={handleWorldChange}
          />
        );

      case 'characters':
        return (
          <CharacterManager
            worldBuilderState={worldBuilderState}
            onWorldChange={handleWorldChange}
          />
        );

      case 'locations':
        return (
          <NodeEditor
            worldBuilderState={worldBuilderState}
            onWorldChange={handleWorldChange}
          />
        );

      case 'interactions':
        return (
          <InteractionEditor
            worldBuilderState={worldBuilderState}
            onWorldChange={handleWorldChange}
          />
        );

      case 'templates':
        return (
          <TemplateLibraryPanel
            worldBuilderState={worldBuilderState}
            onWorldChange={handleWorldChange}
          />
        );

      default:
        return renderLandingPage();
    }
  };

  return (
    <div className="new-world-builder-main">
      {/* Navigation */}
      {currentView !== 'landing' && (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default NewWorldBuilderMain;