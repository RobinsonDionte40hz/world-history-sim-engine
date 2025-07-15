// src/presentation/components/TurnCounterErrorBoundary.js

import React from 'react';

class TurnCounterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('TurnCounterErrorBoundary: Turn counter display error:', error);
    console.error('TurnCounterErrorBoundary: Error info:', errorInfo);
    
    // Log additional context if available
    if (this.props.currentTurn !== undefined) {
      console.error('TurnCounterErrorBoundary: Current turn value:', this.props.currentTurn);
    }
    
    // You could also send this to an error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when turn counter display fails
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Turn: --
        </span>
      );
    }

    return this.props.children;
  }
}

export default TurnCounterErrorBoundary;