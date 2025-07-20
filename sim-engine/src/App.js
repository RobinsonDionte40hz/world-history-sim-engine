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
    <div className="App" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Global Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          zIndex: '-2',
          objectFit: 'cover'
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        <source src="/background-video.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Global Background Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.7))',
          zIndex: '-1'
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: '1', minHeight: '100vh' }}>
        <SimulationProvider>
          <MainPage />
        </SimulationProvider>
      </div>
    </div>
  );
}

export default App;