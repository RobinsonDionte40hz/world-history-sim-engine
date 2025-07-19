/**
 * App - Updated for mappless world building integration
 * 
 * Integrates SimulationProvider with template manager initialization.
 * Uses MainPage with conditional interface for six-step world building.
 * Ensures no automatic simulation startup (only manual after world completion).
 */

import React from 'react';
import { SimulationProvider } from './presentation/contexts/SimulationContext.js';
import MainPage from './presentation/pages/MainPage.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <SimulationProvider>
        <MainPage />
      </SimulationProvider>
    </div>
  );
}

export default App;