// src/presentation/components/features/SimulationControl.js

import React, { useState } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';
import HistoryTimeline from './HistoryTimeline.js';

const SimulationControl = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);

  const handleInitialize = () => {
    try {
      // Try to load existing state first
      let worldState = SimulationService.loadState();
      
      // If no saved state, don't create a default world - user must build manually
      if (!worldState) {
        console.log('No saved state found. User must create world through World Builder.');
        // Don't initialize - user needs to go through world building process
        return;
      }
      
      setIsInitialized(true);
      setCurrentTurn(SimulationService.getCurrentTurn());
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  };

  const handleProcessTurn = () => {
    try {
      // Ensure we're initialized before processing a turn
      if (!isInitialized) {
        handleInitialize();
      }
      
      // Process turn directly - no need to "start" simulation for turn-based mode
      const result = SimulationService.processTurn();
      if (result && result.success) {
        setCurrentTurn(SimulationService.getCurrentTurn());
      }
    } catch (error) {
      console.error('Failed to process turn:', error);
    }
  };

  const handleReset = () => {
    try {
      SimulationService.reset();
      setIsInitialized(false);
      setCurrentTurn(0);
    } catch (error) {
      console.error('Failed to reset simulation:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Simulation Controls (Turn-Based)</h2>
      <div className="mb-4">
        <span className="text-sm text-gray-600">Current Turn: {currentTurn}</span>
      </div>
      <div className="space-x-2 mb-4">
        {!isInitialized && (
          <button 
            onClick={handleInitialize} 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Load Saved World
          </button>
        )}
        <button 
          onClick={handleProcessTurn} 
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={!isInitialized}
        >
          Process Next Turn
        </button>
        <button 
          onClick={handleReset} 
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>
      <HistoryTimeline /> {/* Embed analysis */}
    </div>
  );
};

export default SimulationControl;