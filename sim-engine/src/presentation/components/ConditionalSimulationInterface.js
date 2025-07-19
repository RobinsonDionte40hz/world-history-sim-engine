/**
 * ConditionalSimulationInterface Component - Six-step world validation checking and conditional rendering
 * 
 * Implements six-step world validation checking and conditional rendering.
 * Adds world builder to simulation interface transitions (only after Step 6 completion).
 * Creates initialization loading and error states for mappless world processing.
 * Shows step-by-step progress when world is incomplete.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle, Clock, Play, Settings } from 'lucide-react';
import WorldBuilderInterface from './WorldBuilderInterface.js';
import SimulationControl from '../features/SimulationControl.js';
import HistoryTimeline from '../features/HistoryTimeline.js';
import NpcViewer from '../features/NpcViewer.js';
import WorldMap from '../features/WorldMap.js';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState(null);
  const [showWorldBuilder, setShowWorldBuilder] = useState(true);

  // Six-step world validation checking
  const worldValidation = useMemo(() => {
    if (!worldBuilderState) {
      return {
        isComplete: false,
        currentStep: 1,
        completedSteps: 0,
        stepStatus: {
          1: false, 2: false, 3: false, 4: false, 5: false, 6: false
        },
        errors: ['World builder not initialized'],
        canStartSimulation: false
      };
    }

    const stepStatus = worldBuilderState.stepValidationStatus || {};
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const isComplete = worldBuilderState.isWorldComplete || false;
    const currentStep = worldBuilderState.currentStep || 1;

    return {
      isComplete,
      currentStep,
      completedSteps,
      stepStatus,
      errors: worldBuilderState.validationStatus?.errors || [],
      warnings: worldBuilderState.validationStatus?.warnings || [],
      canStartSimulation: isComplete && stepStatus[6],
      completeness: worldBuilderState.validationStatus?.completeness || 0
    };
  }, [worldBuilderState]);

  // Transition to simulation when Step 6 is complete
  const handleTransitionToSimulation = useCallback(async () => {
    if (!worldValidation.canStartSimulation) {
      setTransitionError('World building must be completed before starting simulation');
      return;
    }

    try {
      setIsTransitioning(true);
      setTransitionError(null);

      // Build the world state for simulation
      const worldState = worldBuilderState.buildWorld();
      
      // Notify parent component that world is complete
      if (onWorldComplete) {
        await onWorldComplete(worldState);
      }

      // Switch to simulation interface
      setShowWorldBuilder(false);
      
    } catch (error) {
      console.error('ConditionalSimulationInterface: Transition error:', error);
      setTransitionError(`Failed to transition to simulation: ${error.message}`);
    } finally {
      setIsTransitioning(false);
    }
  }, [worldValidation.canStartSimulation, worldBuilderState, onWorldComplete]);

  // Handle world builder to simulation interface transitions
  useEffect(() => {
    if (worldValidation.canStartSimulation && !simulationState?.isInitialized) {
      handleTransitionToSimulation();
    }
  }, [worldValidation.canStartSimulation, simulationState?.isInitialized, handleTransitionToSimulation]);



  // Handle manual transition request
  const handleStartSimulation = () => {
    if (worldValidation.canStartSimulation) {
      handleTransitionToSimulation();
    }
  };

  // Handle return to world builder
  const handleReturnToWorldBuilder = () => {
    setShowWorldBuilder(true);
    setTransitionError(null);
  };

  // Render step-by-step progress when world is incomplete
  const renderStepProgress = () => {
    const steps = [
      { number: 1, title: 'Create World', description: 'Set world properties and rules' },
      { number: 2, title: 'Create Nodes', description: 'Add abstract locations/contexts' },
      { number: 3, title: 'Create Interactions', description: 'Define character capabilities' },
      { number: 4, title: 'Create Characters', description: 'Add NPCs with capabilities' },
      { number: 5, title: 'Populate Nodes', description: 'Assign characters to locations' },
      { number: 6, title: 'Simulation Ready', description: 'World ready for simulation' }
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          World Building Progress
        </h3>
        
        <div className="space-y-3">
          {steps.map((step) => {
            const isCompleted = worldValidation.stepStatus[step.number];
            const isCurrent = worldValidation.currentStep === step.number;
            
            return (
              <div
                key={step.number}
                className={`flex items-center p-3 rounded-lg border ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      isCompleted
                        ? 'text-green-800 dark:text-green-200'
                        : isCurrent
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Step {step.number}: {step.title}
                    </h4>
                    
                    <span className={`text-sm px-2 py-1 rounded ${
                      isCompleted
                        ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                        : isCurrent
                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {isCompleted ? 'Complete' : isCurrent ? 'Current' : 'Pending'}
                    </span>
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    isCompleted
                      ? 'text-green-600 dark:text-green-300'
                      : isCurrent
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress: {worldValidation.completedSteps}/6 steps</span>
            <span>{Math.round(worldValidation.completeness * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${worldValidation.completeness * 100}%` }}
            />
          </div>
        </div>

        {/* Start simulation button */}
        {worldValidation.canStartSimulation && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleStartSimulation}
              disabled={isTransitioning}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
            >
              {isTransitioning ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Initializing Simulation...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render validation errors and warnings
  const renderValidationMessages = () => {
    if (worldValidation.errors.length === 0 && worldValidation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 space-y-3">
        {/* Errors */}
        {worldValidation.errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Validation Errors
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {worldValidation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {worldValidation.warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Warnings
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {worldValidation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
        {/* Header with return to world builder option */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            World History Simulation
          </h1>
          <button
            onClick={handleReturnToWorldBuilder}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit World
          </button>
        </div>

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
  if (!showWorldBuilder && worldValidation.canStartSimulation && simulationState?.isInitialized) {
    return (
      <div className="p-4">
        {renderTransitionError()}
        {renderSimulationInterface()}
      </div>
    );
  }

  // Show world builder interface with progress
  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          World Builder
        </h1>

        {renderTransitionError()}
        {renderValidationMessages()}
        {renderStepProgress()}

        {/* World builder interface */}
        <WorldBuilderInterface
          worldBuilderState={worldBuilderState}
          templateManager={templateManager}
          onValidationChange={(validation) => {
            // Validation changes are handled through worldBuilderState updates
          }}
        />
      </div>
    </div>
  );
};

export default ConditionalSimulationInterface;