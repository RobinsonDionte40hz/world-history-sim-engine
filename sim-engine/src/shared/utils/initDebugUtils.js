/**
 * Initialize Debug Utilities
 * 
 * Loads debug utilities in development mode for easy troubleshooting.
 * Import this in your main App.js or index.js to enable debug functions.
 */

import debugWorldFlow from './debugWorldFlow';
import debugNamingIssue from './debugNamingIssue';

/**
 * Initialize debug utilities
 * Only loads in development mode to avoid polluting production
 */
export const initDebugUtils = () => {
  if (process.env.NODE_ENV === 'development') {
    // Load debug utilities
    debugWorldFlow;
    debugNamingIssue;
    
    console.log('🛠️ Debug utilities initialized for development');
    console.log('Available debug functions:');
    console.log('- window.debugWorldFlow()');
    console.log('- window.debugWorldById(id)');
    console.log('- window.debugSaveLoadCycle()');
    console.log('- window.debugWorldContext()');
    console.log('- window.clearAllWorldData()');
    console.log('- window.exportWorldData()');
    console.log('- window.debugNamingIssue() - NEW: Debug naming confusion');
    console.log('- window.debugWorldCreationFlow() - NEW: Debug world creation');
  }
};

export default initDebugUtils;