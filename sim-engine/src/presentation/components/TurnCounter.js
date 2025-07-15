// src/presentation/components/TurnCounter.js

import React from 'react';
import TurnCounterErrorBoundary from './TurnCounterErrorBoundary.js';

const TurnCounterDisplay = ({ currentTurn, className = "text-sm text-gray-500 dark:text-gray-400" }) => {
  try {
    // Validate the currentTurn value
    if (currentTurn === null || currentTurn === undefined) {
      console.warn('TurnCounter: currentTurn is null or undefined, displaying fallback');
      return <span className={className}>Turn: --</span>;
    }

    if (typeof currentTurn !== 'number') {
      console.warn('TurnCounter: currentTurn is not a number:', typeof currentTurn, currentTurn);
      return <span className={className}>Turn: --</span>;
    }

    if (!Number.isFinite(currentTurn)) {
      console.warn('TurnCounter: currentTurn is not finite:', currentTurn);
      return <span className={className}>Turn: --</span>;
    }

    if (currentTurn < 0) {
      console.warn('TurnCounter: currentTurn is negative:', currentTurn);
      return <span className={className}>Turn: --</span>;
    }

    // Display the valid turn counter
    return (
      <span className={className}>
        Turn: {currentTurn.toLocaleString()}
      </span>
    );
  } catch (error) {
    console.error('TurnCounter: Error rendering turn counter:', error);
    console.error('TurnCounter: currentTurn value:', currentTurn);
    return <span className={className}>Turn: --</span>;
  }
};

const TurnCounter = ({ currentTurn, className }) => {
  return (
    <TurnCounterErrorBoundary currentTurn={currentTurn}>
      <TurnCounterDisplay currentTurn={currentTurn} className={className} />
    </TurnCounterErrorBoundary>
  );
};

export default TurnCounter;