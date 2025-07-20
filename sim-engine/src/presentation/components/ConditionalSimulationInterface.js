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

import React, { useState, useMemo } from 'react';
import { AlertCircle, Settings } from 'lucide-react';
import WorldBuilderInterface from './WorldBuilderInterface.js';
import NewWorldBuilderMain from './NewWorldBuilderMain.js';
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
  const [transitionError, setTransitionError] = useState(null);
  const [showWorldBuilder, setShowWorldBuilder] = useState(true);
  const [useNewInterface, setUseNewInterface] = useState(true);

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
      completeness: worldBuilderState.validationStatus?.completeness || (completedSteps / 6)
    };
  }, [worldBuilderState]);

  // Handle return to world builder
  const handleReturnToWorldBuilder = () => {
    setShowWorldBuilder(true);
    setTransitionError(null);
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

  // Show world builder interface
  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            World Builder
          </h1>
          
          {/* Interface Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium transition-colors ${!useNewInterface ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Classic
              </span>
              <button
                onClick={() => setUseNewInterface(!useNewInterface)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  useNewInterface ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 bg-white rounded-full transition-transform ${
                    useNewInterface ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${useNewInterface ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                New
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
              useNewInterface 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}>
              {useNewInterface ? 'Flexible Interface' : 'Step-by-Step'}
            </div>
          </div>
        </div>

        {renderTransitionError()}
        {!useNewInterface && renderValidationMessages()}

        {/* Render appropriate interface */}
        {useNewInterface ? (
          <NewWorldBuilderMain />
        ) : (
          <WorldBuilderInterface
            worldBuilderState={worldBuilderState}
            templateManager={templateManager}
            onValidationChange={(validation) => {
              // Validation changes are handled through worldBuilderState updates
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ConditionalSimulationInterface;