/**
 * SimulationControl - Simulation control component using SimulationContext
 * 
 * This component now properly uses SimulationContext instead of directly
 * accessing SimulationService, enforcing the proper architectural boundaries.
 */

import React from 'react';
import { useSimulationContext } from '../contexts/SimulationContext.js';
import HistoryTimeline from './HistoryTimeline.js';

const SimulationControl = () => {
  const simulationContext = useSimulationContext();
  
  // Get state from context
  const isInitialized = simulationContext.isInitialized;
  const currentTurn = simulationContext.currentTurn;
  const hasPreparedWorld = simulationContext.simulationReadinessStatus.hasPreparedWorld;

  const handleProcessTurn = () => {
    try {
      if (!hasPreparedWorld) {
        console.error('No prepared world available. Complete world building first.');
        return;
      }
      
      // Process turn through context
      simulationContext.processTurn();
    } catch (error) {
      console.error('Failed to process turn:', error);
    }
  };

  const handleReset = () => {
    try {
      simulationContext.resetSimulation();
    } catch (error) {
      console.error('Failed to reset simulation:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Simulation Controls (Turn-Based)</h2>
      <div className="mb-4">
        <span className="text-sm text-gray-600">
          Current Turn: {currentTurn !== null ? currentTurn : '--'}
        </span>
      </div>
      {!hasPreparedWorld && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>No prepared world available. Complete world building and preparation first.</p>
        </div>
      )}
      <div className="space-x-2 mb-4">
        <button 
          onClick={handleProcessTurn} 
          className={`text-white p-2 rounded ${
            hasPreparedWorld && isInitialized
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasPreparedWorld || !isInitialized}
        >
          Process Next Turn
        </button>
        <button 
          onClick={handleReset} 
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          disabled={!hasPreparedWorld}
        >
          Reset
        </button>
      </div>
      <HistoryTimeline /> {/* Embed analysis */}
    </div>
  );
};

export default SimulationControl;