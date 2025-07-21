/**

 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { useCallback } from 'react';
import ConditionalSimulationInterface from '../components/ConditionalSimulationInterface.js';
import { useSimulationContext } from '../contexts/SimulationContext.js';

const MainPage = () => {
  const {
    templateManager,
    worldBuilder,
    simulation
  } = useSimulationContext();

  // Handle world completion and transition to simulation
  const handleWorldComplete = useCallback(async (worldState) => {
    try {
      console.log('MainPage: World building completed, transitioning to simulation');
      console.log('MainPage: World state:', worldState);
      
      // The simulation hook will automatically initialize when worldBuilder.isWorldComplete becomes true
      // No manual initialization needed here as it's handled by the context
      
    } catch (error) {
      console.error('MainPage: Error handling world completion:', error);
      throw error;
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <ConditionalSimulationInterface
        worldBuilderState={worldBuilder}
        simulationState={simulation}
        onWorldComplete={handleWorldComplete}
        templateManager={templateManager}
      />
    </div>
  );
};

export default MainPage;