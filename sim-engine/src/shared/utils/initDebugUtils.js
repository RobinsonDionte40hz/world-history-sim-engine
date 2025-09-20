/**
 * Initialize Debug Utilities
 * 
 * Loads debug utilities in development mode for easy troubleshooting.
 * Import this in your main App.js or index.js to enable debug functions.
 */

import debugWorldFlow from './debugWorldFlow';
import debugNamingIssue from './debugNamingIssue';
import { simulationInterfaceDebugger } from './SimulationInterfaceDebug.js';

/**
 * Initialize debug utilities
 * Only loads in development mode to avoid polluting production
 */
export const initDebugUtils = () => {
  if (process.env.NODE_ENV === 'development') {
    // Initialize debug utilities
    if (debugWorldFlow) {
      // debugWorldFlow exports create their own window functions
    }
    if (debugNamingIssue) {
      // debugNamingIssue exports create their own window functions
    }
    
    // Initialize simulation interface debugger
    simulationInterfaceDebugger.createConsoleUtilities();
    
    console.log('🛠️ Debug utilities initialized for development');
    console.log('Available debug functions:');
    console.log('- window.debugWorldFlow()');
    console.log('- window.debugWorldById(id)');
    console.log('- window.debugSaveLoadCycle()');
    console.log('- window.debugWorldContext()');
    console.log('- window.clearAllWorldData()');
    console.log('- window.exportWorldData()');
    console.log('- window.debugNamingIssue() - Debug naming confusion');
    console.log('- window.debugWorldCreationFlow() - Debug world creation');
    console.log('- window.debugSimInterface - NEW: Simulation interface debugging');
  }
};

export default initDebugUtils;