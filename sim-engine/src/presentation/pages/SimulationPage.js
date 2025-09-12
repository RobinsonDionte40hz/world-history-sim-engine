import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WorldHistorySimInterface from '../components/WorldHistorySimInterface';
import Navigation from '../UI/Navigation';
import { useSimulationContext } from '../contexts/SimulationContext';

const SimulationPage = () => {
  const location = useLocation();
  const { 
    acceptPreparedWorld, 
    simulationReadinessStatus,
    worldState
  } = useSimulationContext();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoError, setDemoError] = useState(null);

  useEffect(() => {
    // Check if demo world data was passed via navigation state
    const demoWorldData = location.state?.preparedWorld;
    const isDemoWorld = location.state?.isDemoWorld;
    
    // Only load demo if we have demo data, it's a demo world, and we don't already have prepared world data
    if (demoWorldData && isDemoWorld && !simulationReadinessStatus.hasPreparedWorld && !isLoadingDemo) {
      setIsLoadingDemo(true);
      setDemoError(null);
      
      try {
        // Accept the demo world through the proper pipeline
        const result = acceptPreparedWorld(demoWorldData);
        
        if (!result.success) {
          setDemoError('Failed to load demo world');
        }
      } catch (error) {
        console.error('SimulationPage: Error loading demo world:', error);
        setDemoError(`Error loading demo world: ${error.message}`);
      } finally {
        setIsLoadingDemo(false);
      }
    }
  }, [location.state, acceptPreparedWorld, simulationReadinessStatus.hasPreparedWorld, isLoadingDemo]);

  // Show loading state while demo is being processed
  if (isLoadingDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Demo World</h2>
          <p className="text-gray-300">Preparing simulation environment...</p>
        </div>
      </div>
    );
  }

  // Show error state if demo loading failed
  if (demoError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Demo Loading Failed</h2>
          <p className="text-gray-300 mb-4">{demoError}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation 
        title="World History Simulation"
        variant="default"
        showSearch={true}
      />
      <WorldHistorySimInterface 
        worldState={worldState}
        simulationService={null}
      />
    </div>
  );
};

export default SimulationPage;
