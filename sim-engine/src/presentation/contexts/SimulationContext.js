// src/presentation/contexts/SimulationContext.js

import React, { createContext, useContext } from 'react';
import useSimulation from '../hooks/useSimulation.js';

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const simulation = useSimulation();
  return (
    <SimulationContext.Provider value={simulation}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationContext = () => useContext(SimulationContext);