import React, { useState } from 'react';
import { useSimulationContext } from '../contexts/SimulationContext';

/**
 * Valley of Echoes Demo Initializer Component
 * Properly initializes the Valley of Echoes demo for the UI
 */
const ValleyOfEchoesInitializer = () => {
  const {
    acceptPreparedWorld,
    pipelineValidationError,
    simulationReadinessStatus,
    isInitialized,
    currentTurn
  } = useSimulationContext();

  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState('');

  const initializeDemo = async () => {
    setIsInitializing(true);
    setInitStatus('Starting Valley of Echoes demo initialization...');

    try {
      // Step 1: Dynamically import the initializer to avoid ES module issues
      setInitStatus('Loading demo world generator...');
      const { initializeValleyOfEchoesForUI } = await import('../../initialize-valley-of-echoes.js');

      // Step 2: Generate and prepare the world
      setInitStatus('Generating Valley of Echoes world...');
      const preparedWorld = await initializeValleyOfEchoesForUI();

      // Step 3: Accept the prepared world through the proper pipeline
      setInitStatus('Initializing simulation...');
      const result = acceptPreparedWorld(preparedWorld);

      if (result.success) {
        setInitStatus('✅ Valley of Echoes demo initialized successfully!');
        console.log('Demo world accepted:', result.worldData);
      } else {
        setInitStatus('❌ Failed to initialize demo');
        console.error('Initialization failed:', result);
      }

    } catch (error) {
      console.error('Demo initialization error:', error);
      setInitStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="valley-of-echoes-initializer p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🌍 Valley of Echoes Demo</h2>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Initialize the Valley of Echoes two-settlement demo world for simulation.
        </p>
        <p className="text-sm text-gray-500">
          This will create Oakwood Federation and Ironhold Dominion with full LOD integration.
        </p>
      </div>

      {/* Status Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="text-sm">
          <strong>Status:</strong> {initStatus || 'Ready to initialize'}
        </div>
        {simulationReadinessStatus.hasPreparedWorld && (
          <div className="text-sm text-green-600 mt-1">
            ✅ World prepared from: {simulationReadinessStatus.source}
          </div>
        )}
        {isInitialized && (
          <div className="text-sm text-blue-600 mt-1">
            🎮 Simulation ready - Current turn: {currentTurn}
          </div>
        )}
      </div>

      {/* Error Display */}
      {pipelineValidationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm text-red-700">
            <strong>Pipeline Error:</strong> {pipelineValidationError}
          </div>
        </div>
      )}

      {/* Initialize Button */}
      <button
        onClick={initializeDemo}
        disabled={isInitializing || isInitialized}
        className={`px-6 py-2 rounded font-medium ${
          isInitializing
            ? 'bg-gray-400 cursor-not-allowed'
            : isInitialized
            ? 'bg-green-500 text-white cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isInitializing
          ? '🔄 Initializing...'
          : isInitialized
          ? '✅ Demo Initialized'
          : '🚀 Initialize Valley of Echoes Demo'
        }
      </button>

      {/* Instructions */}
      {!isInitialized && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-800 mb-2">📋 Instructions:</h3>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Click "Initialize Valley of Echoes Demo" to prepare the world</li>
            <li>Wait for the world to be prepared and simulation to initialize</li>
            <li>Once initialized, you can process turns normally</li>
            <li>The demo includes Oakwood Federation and Ironhold Dominion</li>
          </ol>
        </div>
      )}

      {/* Demo Features */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <h3 className="font-medium text-green-800 mb-2">🎯 Demo Features:</h3>
        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
          <li>Two interconnected settlements</li>
          <li>Hero, Group, and Background LOD tiers</li>
          <li>Multi-settlement quests and diplomacy</li>
          <li>Need satisfaction and economic systems</li>
          <li>Cross-settlement relationships</li>
        </ul>
      </div>
    </div>
  );
};

export default ValleyOfEchoesInitializer;