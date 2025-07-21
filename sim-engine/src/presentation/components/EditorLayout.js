/**
 * EditorLayout - Consistent wrapper component for all editors
 * 
 * Provides a unified layout structure for all editor pages with consistent
 * navigation, header, status indicators, and content areas.
 * 
 * Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Save, X, Eye, ArrowLeft, Home, ChevronRight, AlertTriangle, 
  CheckCircle, Clock, Loader, Download, Upload 
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import editorStateManager from '../../application/services/EditorStateManager';
import useNavigationGuard from '../hooks/useNavigationGuard';

/**
 * EditorLayout Component
 * @param {Object} props - Component props
 * @param {string} props.title - Editor title
 * @param {string} props.editorType - Type of editor (world, nodes, characters, etc.)
 * @param {React.ReactNode} props.children - Editor content
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @param {boolean} props.isSaving - Whether save is in progress
 * @param {Array} props.validationErrors - Array of validation errors
 * @param {Object} props.saveStatus - Save status object
 * @param {boolean} props.previewMode - Whether in preview mode
 * @param {Function} props.onPreviewToggle - Preview mode toggle handler
 * @param {Array} props.breadcrumbs - Custom breadcrumb items
 * @param {Array} props.headerActions - Additional header actions
 * @param {Object} props.exportImportConfig - Export/import configuration
 * @param {boolean} props.autoSaveEnabled - Whether auto-save is enabled
 * @param {Function} props.onAutoSaveToggle - Auto-save toggle handler
 */
const EditorLayout = ({
  title,
  editorType,
  children,
  onSave,
  onCancel,
  hasUnsavedChanges = false,
  isSaving = false,
  validationErrors = [],
  saveStatus = null,
  previewMode = false,
  onPreviewToggle,
  breadcrumbs = [],
  headerActions = [],
  exportImportConfig = null,
  autoSaveEnabled = true,
  onAutoSaveToggle
}) => {
  const location = useLocation();
  
  // Navigation guard to prevent accidental navigation with unsaved changes
  const navigationGuard = useNavigationGuard({
    enabled: true,
    confirmMessage: 'You have unsaved changes. Are you sure you want to leave?',
    onNavigationBlocked: () => {
      console.log('Navigation blocked due to unsaved changes');
    },
    onNavigationAllowed: () => {
      console.log('Navigation allowed');
    }
  });

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
    editorStateManager.setUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (isSaving) {
      editorStateManager.setSaveStatus('saving');
    } else if (saveStatus) {
      editorStateManager.setSaveStatus(saveStatus.status, saveStatus.message);
    }
  }, [isSaving, saveStatus]);

  useEffect(() => {
    editorStateManager.setValidationErrors(validationErrors);
  }, [validationErrors]);

  // Default breadcrumbs if none provided
  const defaultBreadcrumbs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'World Builder', path: '/builder' },
    { label: title, path: location.pathname, current: true }
  ];

  const finalBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  // Handle navigation
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigationGuard.navigate('/builder');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  // Export/Import handlers
  const handleExport = () => {
    if (exportImportConfig?.onExport) {
      exportImportConfig.onExport();
    }
  };

  const handleImport = (event) => {
    if (exportImportConfig?.onImport) {
      exportImportConfig.onImport(event);
    }
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    if (isSaving) {
      return (
        <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded flex items-center gap-1">
          <Loader className="w-3 h-3 animate-spin" />
          Saving...
        </span>
      );
    }

    if (hasUnsavedChanges) {
      return (
        <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Unsaved Changes
        </span>
      );
    }

    if (validationErrors.length > 0) {
      return (
        <span className="px-2 py-1 text-xs bg-red-600/20 text-red-400 border border-red-600/30 rounded flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {validationErrors.length} Error{validationErrors.length !== 1 ? 's' : ''}
        </span>
      );
    }

    if (saveStatus?.status === 'saved') {
      return (
        <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 border border-green-600/30 rounded flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Saved {saveStatus.timestamp ? new Date(saveStatus.timestamp).toLocaleTimeString() : ''}
        </span>
      );
    }

    return null;
  };

  // Check if world foundation is required and missing
  const isWorldFoundationRequired = () => {
    return editorType !== 'world' && !editorStateManager.isWorldFoundationComplete();
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />
      
      {/* Breadcrumb Navigation */}
      <div className="px-8 py-3 border-b border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {finalBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.current ? (
                <span className="text-slate-200 flex items-center gap-1">
                  {crumb.icon && <crumb.icon className="w-4 h-4" />}
                  {crumb.label}
                </span>
              ) : (
                <button 
                  onClick={() => navigationGuard.navigate(crumb.path)}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                >
                  {crumb.icon && <crumb.icon className="w-4 h-4" />}
                  {crumb.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* World Foundation Warning */}
      {isWorldFoundationRequired() && (
        <div className="px-8 py-3 bg-yellow-600/10 border-b border-yellow-600/30">
          <div className="flex items-center gap-3 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">
              World foundation must be completed before using this editor.
            </span>
            <button
              onClick={() => navigationGuard.navigate('/builder')}
              className="text-sm underline hover:no-underline"
            >
              Go to World Foundation Editor
            </button>
          </div>
        </div>
      )}
      
      {/* Editor Header */}
      <div className="px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Builder
            </button>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            <h1 className="text-2xl font-bold text-white">
              {title}
            </h1>
            
            <div className="flex items-center gap-2">
              {renderSaveStatus()}
              
              {onAutoSaveToggle && (
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => onAutoSaveToggle(e.target.checked)}
                    className="rounded"
                  />
                  Auto-save
                </label>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Export/Import Controls */}
            {exportImportConfig && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept={exportImportConfig.acceptedFileTypes || '.json'}
                    onChange={handleImport}
                    className="hidden"
                    id={`import-${editorType}`}
                  />
                  <label
                    htmlFor={`import-${editorType}`}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </label>
                  
                  <button
                    onClick={handleExport}
                    disabled={exportImportConfig.exportDisabled}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                
                <div className="h-6 w-px bg-slate-600"></div>
              </>
            )}

            {/* Custom Header Actions */}
            {headerActions.map((action, index) => (
              <React.Fragment key={index}>
                {action}
                {index < headerActions.length - 1 && <div className="h-6 w-px bg-slate-600"></div>}
              </React.Fragment>
            ))}

            {/* Preview Toggle */}
            {onPreviewToggle && (
              <>
                <button
                  onClick={onPreviewToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewMode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
                
                <div className="h-6 w-px bg-slate-600"></div>
              </>
            )}
            
            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || validationErrors.length > 0 || isWorldFoundationRequired()}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save {title.replace(' Editor', '')}
            </button>
          </div>
        </div>
      </div>

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
          {isWorldFoundationRequired() ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                World Foundation Required
              </h2>
              <p className="text-slate-300 mb-6">
                You must complete the world foundation before accessing this editor.
                The world foundation defines the basic structure and rules for your world.
              </p>
              <button
                onClick={() => navigationGuard.navigate('/builder')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to World Foundation Editor
              </button>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;