/**
 * EditorLayout - Consistent wrapper component for all editors
 * 
 * Provides a unified layout structure for all editor pages with consistent
 * navigation, header, status indicators, and content areas.
 * 
 * Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4
 */

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navigation from '../UI/Navigation';
import editorStateManager from '../../application/services/EditorStateManager';

/**
 * EditorLayout Component
 * @param {Object} props - Component props
 * @param {string} props.editorType - Type of editor (world, nodes, characters, etc.)
 * @param {React.ReactNode} props.children - Editor content
 * @param {Array} props.validationErrors - Array of validation errors
 */
const EditorLayout = ({
  editorType,
  children,
  validationErrors = []
}) => {
  
  // Subscribe to editor state changes
  useEffect(() => {
    const unsubscribeStateChange = editorStateManager.subscribe('stateChanged', () => {
      // State change handled by individual useEffect hooks below
    });

    const unsubscribeSaveStatus = editorStateManager.subscribe('saveStatusChanged', () => {
      // Save status change handled by individual useEffect hooks below
    });

    const unsubscribeUnsavedChanges = editorStateManager.subscribe('unsavedChangesChanged', () => {
      // Unsaved changes handled by individual useEffect hooks below
    });

    return () => {
      unsubscribeStateChange();
      unsubscribeSaveStatus();
      unsubscribeUnsavedChanges();
    };
  }, []);

  // Update editor state manager when props change
  useEffect(() => {
    if (editorType) {
      editorStateManager.setCurrentEditor(editorType);
    }
  }, [editorType]);

  useEffect(() => {
    editorStateManager.setValidationErrors(validationErrors);
  }, [validationErrors]);

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />

      {/* Validation Errors Panel */}
      {validationErrors.length > 0 && (
        <div className="px-8 py-3 bg-red-600/10 border-b border-red-600/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-red-400 text-sm font-medium mb-2">
                Please fix the following errors before saving:
              </div>
              <ul className="text-red-300 text-xs space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.message || error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;