// Debug utilities for turn data flow verification
// Add these to your browser console to debug data flow issues

// Quick Fix Verification Checklist
const verificationChecklist = {
  step1: 'Check that currentSimulationState is not null after turn processing',
  step2: 'Verify that turnHistory array grows after each turn',
  step3: 'Confirm that events array in worldState increases after turns',
  step4: 'Check that dashboard stats update with new values',
  step5: 'Verify console shows proper data flow logs',
  step6: 'Test that turn counter increments correctly',
  step7: 'Confirm that recent events panel shows new events'
};

// Emergency Fallback - if data still doesn't flow
const EmergencyFallbackTurnManager = ({ simulationService, currentTurn, worldState }) => {
  return {
    getCurrentStatistics: () => {
      // Force refresh from simulation service
      const freshWorldState = simulationService?.getCurrentWorldState?.() || worldState;

      return {
        currentTurn: currentTurn || 0,
        maxTurns: null,
        isPaused: false,
        isProcessing: false,
        historySize: 0,
        summaryCount: 0,
        eventCount: freshWorldState?.events?.length || 0,
        canContinue: true,
        // Force fresh data
        totalPopulation: freshWorldState?.characters?.length || freshWorldState?.npcs?.length || 0,
        totalNodes: freshWorldState?.nodes?.length || 0,
        totalResources: freshWorldState?.resources?.totalGold || 0
      };
    },

    getRecentTurnSummaries: () => [],

    getRecentEvents: () => {
      const freshWorldState = simulationService?.getCurrentWorldState?.() || worldState;
      return freshWorldState?.events?.slice(-5) || [];
    }
  };
};

// Browser Console Commands to Check Data Flow
/*
Run these in your browser console to check data flow:

// Check if SimulationContext is providing current simulation state
window.debugSimulationContext = () => {
  const context = document.querySelector('[data-testid="simulation-context"]'); // Add this testid to your provider
  console.log('Simulation Context State:', context);
};

// Check localStorage for simulation state
window.debugLocalStorage = () => {
  const keys = Object.keys(localStorage).filter(key => key.includes('simulation') || key.includes('world'));
  keys.forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key) || '{}'));
  });
};

// Check component props and state
window.debugComponentState = () => {
  const components = document.querySelectorAll('[data-component="dashboard"]'); // Add this to your dashboard
  console.log('Dashboard Components:', components);
};

// Debug turn processing flow
window.debugTurnFlow = () => {
  console.log('=== TURN FLOW DEBUG ===');
  console.log('Current URL:', window.location.href);
  console.log('LocalStorage keys:', Object.keys(localStorage));
  console.log('SessionStorage keys:', Object.keys(sessionStorage));

  // Check for React dev tools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools available');
  } else {
    console.log('React DevTools not available');
  }
};

// Check for memory leaks
window.debugMemoryUsage = () => {
  if (performance.memory) {
    console.log('Memory Usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  } else {
    console.log('Memory usage API not available');
  }
};

// Debug event listeners
window.debugEventListeners = () => {
  const elements = document.querySelectorAll('*');
  let totalListeners = 0;

  elements.forEach(el => {
    const listeners = getEventListeners(el);
    const count = Object.keys(listeners).length;
    if (count > 0) {
      totalListeners += count;
      console.log(el, listeners);
    }
  });

  console.log('Total event listeners:', totalListeners);
};

// Quick simulation state check
window.checkSimulationState = () => {
  const simulationDiv = document.querySelector('[data-simulation-state]');
  if (simulationDiv) {
    console.log('Simulation state from DOM:', simulationDiv.dataset);
  } else {
    console.log('No simulation state found in DOM');
  }

  // Check for global simulation service
  if (window.simulationService) {
    console.log('Global simulation service found:', window.simulationService.getCurrentWorldState());
  } else {
    console.log('No global simulation service found');
  }
};
*/

// Export for use in components
export {
  verificationChecklist,
  EmergencyFallbackTurnManager
};