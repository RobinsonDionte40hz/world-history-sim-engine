/**
 * ConditionalSimulationInterface Component - Preparation-based validation and conditional rendering
 * 
 * Implements preparation-based world validation checking and conditional rendering.
 * Adds world builder to simulation interface transitions (only after pipeline processing completion).
 * Creates initialization loading and error states for prepared world processing.
 * Shows preparation phase progress and pipeline status throughout the preparation workflow.
 * Enforces mandatory handoff through preparation pipeline before simulation access.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import NewWorldBuilderMain from './NewWorldBuilderMain.js';
import SimulationControl from '../features/SimulationControl.js';
import HistoryTimeline from '../features/HistoryTimeline.js';
import NpcViewer from '../features/NpcViewer.js';
import WorldMap from '../features/WorldMap.js';
import { Navigation } from '../UI';

/**
 * ConditionalSimulationInterface - Manages transition between world building and simulation with preparation pipeline
 * @param {Object} props - Component props
 * @param {Object} props.worldBuilderState - Current world builder state with preparation phase tracking
 * @param {Object} props.simulationState - Current simulation state
 * @param {Function} props.onWorldPrepared - Callback when world preparation is complete
 * @param {Function} props.onSimulationReady - Callback when simulation is ready to start
 * @param {Object} props.templateManager - Template manager instance
 * @param {Object} props.simulationContext - Simulation context with pipeline methods
 * @returns {JSX.Element} Conditional interface component
 */
const ConditionalSimulationInterface = ({
  worldBuilderState,
  simulationState,
  onWorldPrepared,
  onSimulationReady,
  templateManager,
  simulationContext
}) => {
  const [transitionError, setTransitionError] = useState(null);
  const [showWorldBuilder, setShowWorldBuilder] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // Track the current view in NewWorldBuilderMain
  const [pipelineProcessing, setPipelineProcessing] = useState(false);

  // Handle view changes from NewWorldBuilderMain
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Handle world preparation through pipeline
  const handlePrepareWorldForSimulation = useCallback(async () => {
    if (!worldBuilderState?.prepareWorldForSimulation) {
      setTransitionError('World preparation method not available');
      return;
    }

    try {
      setPipelineProcessing(true);
      setTransitionError(null);

      // Prepare world through the WorldBuilder pipeline
      const preparedWorldData = await worldBuilderState.prepareWorldForSimulation();
      
      // Accept the prepared world into simulation context
      const result = await simulationContext.acceptPreparedWorld(preparedWorldData);
      
      if (result.success) {
        setShowWorldBuilder(false);
        if (onWorldPrepared) {
          onWorldPrepared(preparedWorldData);
        }
        if (onSimulationReady) {
          onSimulationReady();
        }
      } else {
        setTransitionError('Failed to accept prepared world for simulation');
      }
    } catch (error) {
      setTransitionError(`Pipeline processing failed: ${error.message}`);
      console.error('World preparation failed:', error);
    } finally {
      setPipelineProcessing(false);
    }
  }, [worldBuilderState, simulationContext, onWorldPrepared, onSimulationReady]);

  // Handle return to world builder
  const handleReturnToWorldBuilder = useCallback(() => {
    setShowWorldBuilder(true);
    setTransitionError(null);
    // Clear prepared world from simulation context
    if (simulationContext?.clearPreparedWorld) {
      simulationContext.clearPreparedWorld();
    }
  }, [simulationContext]);

  // Render pipeline status display instead of step progress
  const renderPipelineStatus = () => {
    if (!worldBuilderState) return null;

    const { simulationReadiness, preparationPhase, simulationCompatibility, performanceAssessment } = worldBuilderState;
    
    const phases = [
      {
        id: 'worldFoundation',
        label: 'World Foundation',
        completed: simulationReadiness?.worldFoundationDefined || false,
        description: 'Basic world properties, rules, and conditions'
      },
      {
        id: 'locations',
        label: 'Locations',
        completed: simulationReadiness?.locationsDefined || false,
        description: 'Abstract locations and contexts'
      },
      {
        id: 'capabilities',
        label: 'Capabilities',
        completed: simulationReadiness?.capabilitiesDefined || false,
        description: 'Character interactions and abilities'
      },
      {
        id: 'actors',
        label: 'Actors',
        completed: simulationReadiness?.actorsDefined || false,
        description: 'Characters with assigned capabilities'
      },
      {
        id: 'assignments',
        label: 'Assignments',
        completed: simulationReadiness?.actorsAssigned || false,
        description: 'Characters assigned to locations'
      },
      {
        id: 'simulation',
        label: 'Simulation Ready',
        completed: simulationReadiness?.readyForSimulation || false,
        description: 'Pipeline processing complete'
      }
    ];

    const completedPhases = phases.filter(phase => phase.completed).length;
    const progressPercentage = (completedPhases / phases.length) * 100;
    const currentPhaseIndex = phases.findIndex(phase => phase.id === preparationPhase);
    const isSimulationReady = simulationReadiness?.readyForSimulation && simulationCompatibility?.isCompatible;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preparation Pipeline Status
          </h3>
          <div className="flex items-center space-x-2">
            {isSimulationReady ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completedPhases}/{phases.length} phases completed
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Phase list */}
        <div className="space-y-3">
          {phases.map((phase, index) => {
            const isCurrent = index === currentPhaseIndex;
            const isCompleted = phase.completed;
            
            return (
              <div 
                key={phase.id}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : isCompleted 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-blue-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      isCompleted 
                        ? 'text-green-800 dark:text-green-200' 
                        : isCurrent 
                          ? 'text-blue-800 dark:text-blue-200'
                          : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {phase.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isCompleted 
                      ? 'text-green-600 dark:text-green-400' 
                      : isCurrent 
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {phase.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compatibility and performance status */}
        {simulationCompatibility && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Simulation Compatibility
              </span>
              <span className={`text-sm font-medium ${
                simulationCompatibility.isCompatible 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {simulationCompatibility.isCompatible ? 'Compatible' : 'Issues Found'}
              </span>
            </div>
            {!simulationCompatibility.isCompatible && simulationCompatibility.issues?.length > 0 && (
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {simulationCompatibility.issues.slice(0, 3).map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
                {simulationCompatibility.issues.length > 3 && (
                  <li>• ... and {simulationCompatibility.issues.length - 3} more issues</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Performance assessment */}
        {performanceAssessment && (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Performance Score
              </span>
              <span className={`text-sm font-medium ${
                performanceAssessment.score > 0.8 
                  ? 'text-green-600 dark:text-green-400' 
                  : performanceAssessment.score > 0.6 
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.round(performanceAssessment.score * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Start Simulation button - only appears when pipeline processed */}
        {isSimulationReady && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrepareWorldForSimulation}
              disabled={pipelineProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {pipelineProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing Pipeline...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Start Simulation
                </>
              )}
            </button>
          </div>
        )}
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

  // Render transition error if any
  const renderTransitionError = () => {
    if (!transitionError) return null;
    
    return (
      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
              Pipeline Processing Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {transitionError}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic with preparation-based conditional rendering
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

  // Show simulation interface if world has been pipeline-processed and simulation is initialized
  const hasValidPreparedWorld = simulationContext?.hasPreparedWorld && simulationContext?.isSimulationReady;
  if (!showWorldBuilder && hasValidPreparedWorld && simulationState?.isInitialized) {
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

        {/* Pipeline status display instead of step progress */}
        {renderPipelineStatus()}

        <NewWorldBuilderMain onViewChange={handleViewChange} />
      </div>
    </div>
  );
};

export default ConditionalSimulationInterface;