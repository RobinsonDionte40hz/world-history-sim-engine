// src/presentation/components/features/SimulationControl.js

import React, { useState } from 'react';
import SimulationService from '../../../application/use-cases/services/SimulationService.js';

const SimulationControl = () => {
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    SimulationService.initialize();
    SimulationService.start();
    setIsRunning(true);
  };

  const handleStop = () => {
    SimulationService.stop();
    setIsRunning(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Simulation Controls</h2>
      <button onClick={handleStart} disabled={isRunning} className="bg-green-500 text-white p-2 mr-2">Start</button>
      <button onClick={handleStop} disabled={!isRunning} className="bg-red-500 text-white p-2">Stop</button>
      <HistoryTimeline />  // Embed analysis
    </div>
  );
};

export default SimulationControl;