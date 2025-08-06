/**
 * Debug Panel Component
 * 
 * A development-only component that provides UI controls for debugging
 * world data flow and state management.
 */

import React, { useState } from 'react';
import { 
  debugWorldFlow, 
  debugSaveLoadCycle, 
  clearAllWorldData, 
  exportWorldData,
  simpleDebugWorldFlow 
} from '../../shared/utils/debugWorldFlow';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugOutput, setDebugOutput] = useState('');

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runDebugFunction = async (debugFn, name) => {
    console.clear();
    setDebugOutput(`Running ${name}...`);
    
    try {
      await debugFn();
      setDebugOutput(`✅ ${name} completed - check console for details`);
    } catch (error) {
      setDebugOutput(`❌ ${name} failed: ${error.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #333',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isOpen ? '10px' : '0'
      }}>
        <span>🛠️ Debug Panel</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: '1px solid #666',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <div>
          <div style={{ marginBottom: '10px', fontSize: '10px', color: '#ccc' }}>
            World Data Flow Debug Tools
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button
              onClick={() => runDebugFunction(simpleDebugWorldFlow, 'Simple Debug')}
              style={buttonStyle}
            >
              🔍 Quick Debug
            </button>

            <button
              onClick={() => runDebugFunction(debugWorldFlow, 'Full Debug')}
              style={buttonStyle}
            >
              📊 Full Data Flow
            </button>

            <button
              onClick={() => runDebugFunction(debugSaveLoadCycle, 'Save/Load Test')}
              style={buttonStyle}
            >
              🔄 Test Save/Load
            </button>

            <button
              onClick={() => runDebugFunction(exportWorldData, 'Export Data')}
              style={buttonStyle}
            >
              📤 Export Data
            </button>

            <button
              onClick={() => {
                if (window.confirm('This will delete ALL world data. Are you sure?')) {
                  runDebugFunction(clearAllWorldData, 'Clear All Data');
                }
              }}
              style={{ ...buttonStyle, background: '#dc2626' }}
            >
              🗑️ Clear All Data
            </button>
          </div>

          {debugOutput && (
            <div style={{
              marginTop: '10px',
              padding: '5px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              fontSize: '10px',
              wordBreak: 'break-word'
            }}>
              {debugOutput}
            </div>
          )}

          <div style={{ 
            marginTop: '10px', 
            fontSize: '9px', 
            color: '#888',
            borderTop: '1px solid #333',
            paddingTop: '5px'
          }}>
            💡 All functions also available in console:
            <br />• window.debugWorldFlow()
            <br />• window.simpleDebugWorldFlow()
          </div>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  background: '#374151',
  border: '1px solid #6b7280',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px',
  textAlign: 'left'
};

export default DebugPanel;