/**
 * NewWorldBuilderMain - Main component for the new flexible world builder experience
 * 
 * Manages the transition between the landing page and the flexible builder interface.
 * This replaces the rigid 6-step process with a more open-ended creative experience.
 */

import React, { useState, useCallback } from 'react';
import WorldBuilderLandingPage from '../pages/WorldBuilderLandingPage';
import FlexibleWorldBuilderInterface from './FlexibleWorldBuilderInterface';
import { useSimulationContext } from '../contexts/SimulationContext';

const NewWorldBuilderMain = () => {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'builder'
  const { worldBuilder, templateManager } = useSimulationContext();

  // Handle transitioning to the builder from landing
  const handleCreateWorld = useCallback(() => {
    setCurrentView('builder');
  }, []);

  // Handle returning to landing from builder
  const handleBackToLanding = useCallback(() => {
    setCurrentView('landing');
  }, []);

  // Handle saving the world
  const handleSaveWorld = useCallback(() => {
    // This would integrate with the world builder context to save the world
    console.log('Saving world...');
    // Could show a success message or transition to simulation
  }, []);

  // Render the current view
  switch (currentView) {
    case 'landing':
      return <WorldBuilderLandingPage onCreateWorld={handleCreateWorld} />;
    
    case 'builder':
      return (
        <FlexibleWorldBuilderInterface
          worldBuilderState={worldBuilder}
          templateManager={templateManager}
          onBackToLanding={handleBackToLanding}
          onSaveWorld={handleSaveWorld}
        />
      );
    
    default:
      return <WorldBuilderLandingPage onCreateWorld={handleCreateWorld} />;
  }
};

export default NewWorldBuilderMain;
