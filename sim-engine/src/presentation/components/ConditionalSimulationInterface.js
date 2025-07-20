/**
 * Conimport React, { useState, useMemo, useCallback } from 'react';
import { AlertCircle, Settings } from 'lucide-react';
import NewWorldBuilderMain from './NewWorldBuilderMain.js';
import SimulationControl from '../features/SimulationControl.js';
import HistoryTimeline from '../features/HistoryTimeline.js';
import NpcViewer from '../features/NpcViewer.js';
import WorldMap from '../features/WorldMap.js';SimulationInterface Component - Six-step world validation checking and conditional rendering
 * 
 * Implements six-step world validation checking and conditional rendering.
 * Adds world builder to simulation interface transitions (only after Step 6 completion).
 * Creates initialization loading and error states for mappless world processing.
 * Shows step-by-step progress when world is incomplete.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, Settings } from 'lucide-react';
import NewWorldBuilderMain from './NewWorldBuilderMain.js';
import SimulationControl from '../features/SimulationControl.js';
import HistoryTimeline from '../features/HistoryTimeline.js';
import NpcViewer from '../features/NpcViewer.js';
import WorldMap from '../features/WorldMap.js';
import { Navigation } from '../UI';

/**
 * ConditionalSimulationInterface - Manages transition between world building and simulation
 * @param {Object} props - Component props
 * @param {Object} props.worldBuilderState - Current world builder state
 * @param {Object} props.simulationState - Current simulation state
 * @param {Function} props.onWorldComplete - Callback when world building is complete
 * @param {Object} props.templateManager - Template manager instance
 * @returns {JSX.Element} Conditional interface component
 */
const ConditionalSimulationInterface = ({
  worldBuilderState,
  simulationState,
  onWorldComplete,
  templateManager
}) => {
  const [transitionError, setTransitionError] = useState(null);
  const [showWorldBuilder, setShowWorldBuilder] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // Track the current view in NewWorldBuilderMain

  // Handle view changes from NewWorldBuilderMain
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Handle return to world builder
  const handleReturnToWorldBuilder = () => {
    setShowWorldBuilder(true);
    setTransitionError(null);
  };

  // Render transition error
  const renderTransitionError = () => {
    if (!transitionError) return null;

    return (
      <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
              Transition Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {transitionError}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render simulation interface
  const renderSimulationInterface = () => {
    const selectedNpc = simulationState?.worldState?.npcs?.[0];

    return (
      <div className="space-y-6">
        {/* Simulation controls */}
        <SimulationControl />

        {/* Main simulation interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorldMap />
          <NpcViewer npc={selectedNpc} />
        </div>

        {/* History timeline */}
        <HistoryTimeline />
      </div>
    );
  };

  // Main render logic with conditional rendering
  if (!worldBuilderState) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            World Builder Not Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please initialize the world builder to begin.
          </p>
        </div>
      </div>
    );
  }

  // Show simulation interface if world is complete and we're not in world builder mode
  if (!showWorldBuilder && worldBuilderState?.isWorldComplete && simulationState?.isInitialized) {
    return (
      <div className="min-h-screen" style={{ background: 'transparent' }}>
        <Navigation 
          title="World History Simulation"
          navItems={[
            { label: 'Edit World', onClick: handleReturnToWorldBuilder },
            { label: 'Export', onClick: () => console.log('Export clicked') },
            { label: 'Settings', onClick: () => console.log('Settings clicked') }
          ]}
          menuItems={[
            {
              id: 'simulation',
              label: '🎮 Simulation',
              onClick: () => console.log('Simulation clicked'),
              hoverColor: 'rgba(129, 140, 248, 0.1)',
              hoverBorder: 'rgba(129, 140, 248, 0.3)'
            },
            {
              id: 'history',
              label: '📜 History',
              onClick: () => console.log('History clicked'),
              hoverColor: 'rgba(52, 211, 153, 0.1)',
              hoverBorder: 'rgba(52, 211, 153, 0.3)'
            },
            {
              id: 'characters',
              label: '👥 Characters',
              onClick: () => console.log('Characters clicked'),
              hoverColor: 'rgba(251, 191, 36, 0.1)',
              hoverBorder: 'rgba(251, 191, 36, 0.3)'
            },
            {
              id: 'world-map',
              label: '🗺️ World Map',
              onClick: () => console.log('World Map clicked'),
              hoverColor: 'rgba(168, 85, 247, 0.1)',
              hoverBorder: 'rgba(168, 85, 247, 0.3)'
            },
            {
              id: 'export',
              label: '💾 Export',
              onClick: () => console.log('Export clicked'),
              hoverColor: 'rgba(239, 68, 68, 0.1)',
              hoverBorder: 'rgba(239, 68, 68, 0.3)'
            }
          ]}
        />
        <div className="p-4">
          {renderTransitionError()}
          {renderSimulationInterface()}
        </div>
      </div>
    );
  }

  // Show world builder interface
  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        {/* Only show header when not on landing page */}
        {currentView !== 'landing' && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              World Builder
            </h1>
          </div>
        )}

        {renderTransitionError()}

        <NewWorldBuilderMain onViewChange={handleViewChange} />
      </div>
    </div>
  );
};

export default ConditionalSimulationInterface;