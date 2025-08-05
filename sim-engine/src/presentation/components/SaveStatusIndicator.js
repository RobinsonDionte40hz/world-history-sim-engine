/**
 * SaveStatusIndicator - Visual indicator for world save status
 * 
 * Shows current save status, unsaved changes indicator, and save controls.
 * Integrates with the WorldSaveManager through useWorldSave hook.
 */

import React, { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle, CheckCircle, Loader, Wifi, WifiOff } from 'lucide-react';
import { useWorldSave } from '../hooks/useWorldSave';
import editorStateManager from '../../application/services/EditorStateManager';

const SaveStatusIndicator = ({ 
  showAutoSaveToggle = true, 
  showManualSave = true,
  compact = false,
  showPersistenceStatus = true 
}) => {
  const {
    saveStatus,
    error,
    lastSaveTime,
    triggerSave,
    enableAutoSave,
    disableAutoSave,
    clearError,
    canSave,
    hasUnsavedChanges,
    isSaving,
    autoSaveEnabled
  } = useWorldSave();

  // Enhanced persistence status tracking
  const [persistenceStatus, setPersistenceStatus] = useState('idle');
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('online');

  // Listen to EditorStateManager for detailed save status
  useEffect(() => {
    const unsubscribeSaveStatus = editorStateManager.subscribe('saveStatusChanged', 
      ({ status, message }) => {
        setPersistenceStatus(status);
        if (status === 'saved') {
          setLastAutoSave(new Date());
        }
      }
    );

    const unsubscribeAutoSave = editorStateManager.subscribe('autoSaveCompleted', 
      (worldData) => {
        setLastAutoSave(new Date());
        setPersistenceStatus('saved');
      }
    );

    const unsubscribeAutoSaveError = editorStateManager.subscribe('autoSaveError', 
      (error) => {
        setPersistenceStatus('error');
      }
    );

    // Monitor connection status (simplified)
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeSaveStatus();
      unsubscribeAutoSave();
      unsubscribeAutoSaveError();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatLastSaveTime = (time) => {
    if (!time) return 'Never saved';
    
    const now = new Date();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just saved';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Saved ${hours}h ago`;
    
    return time.toLocaleDateString();
  };

  const getSaveStatusIcon = () => {
    // Connection status takes priority
    if (connectionStatus === 'offline') {
      return <WifiOff className="w-4 h-4 text-gray-500" />;
    }

    // Then check save status
    if (isSaving || persistenceStatus === 'saving') {
      return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (error || persistenceStatus === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    if (hasUnsavedChanges) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    
    if (persistenceStatus === 'saved' || saveStatus.saveStatus === 'saved') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const getSaveStatusText = () => {
    // Connection status messages
    if (connectionStatus === 'offline') {
      return 'Offline - changes saved locally';
    }

    // Save status messages
    if (isSaving || persistenceStatus === 'saving') {
      return 'Saving...';
    }
    
    if (error || persistenceStatus === 'error') {
      return 'Save failed';
    }
    
    if (hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    
    if (persistenceStatus === 'saved') {
      return 'All changes saved';
    }
    
    return 'Ready';
  };

  const getPersistenceStatusText = () => {
    if (connectionStatus === 'offline') {
      return 'Working offline';
    }

    if (autoSaveEnabled && lastAutoSave) {
      const timeSinceAutoSave = Math.floor((new Date() - lastAutoSave) / 1000);
      if (timeSinceAutoSave < 60) {
        return `Auto-saved ${timeSinceAutoSave}s ago`;
      }
      const minutes = Math.floor(timeSinceAutoSave / 60);
      return `Auto-saved ${minutes}m ago`;
    }

    if (persistenceStatus === 'saved' && lastSaveTime) {
      return formatLastSaveTime(lastSaveTime);
    }

    return 'Ready to save';
  };

  const handleManualSave = async () => {
    try {
      await triggerSave();
    } catch (error) {
      // Error is handled by the hook
      console.error('Manual save failed:', error);
    }
  };

  const handleAutoSaveToggle = () => {
    if (autoSaveEnabled) {
      disableAutoSave();
    } else {
      enableAutoSave();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getSaveStatusIcon()}
        {showPersistenceStatus && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getPersistenceStatusText()}
          </span>
        )}
        {hasUnsavedChanges && showManualSave && (
          <button
            onClick={handleManualSave}
            disabled={!canSave || isSaving}
            className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            title="Save now"
          >
            <Save className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getSaveStatusIcon()}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getSaveStatusText()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {showPersistenceStatus ? getPersistenceStatusText() : formatLastSaveTime(lastSaveTime)}
            </div>
            {connectionStatus === 'offline' && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Changes will sync when online
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showAutoSaveToggle && (
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={handleAutoSaveToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Auto-save</span>
            </label>
          )}

          {showManualSave && (
            <button
              onClick={handleManualSave}
              disabled={!canSave || isSaving}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Persistence Status Details */}
      {showPersistenceStatus && (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Persistence Status</span>
            <div className="flex items-center space-x-1">
              {connectionStatus === 'online' ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-gray-500" />
              )}
              <span className={connectionStatus === 'online' ? 'text-green-600' : 'text-gray-500'}>
                {connectionStatus}
              </span>
            </div>
          </div>
          
          <div className="space-y-1 text-gray-600 dark:text-gray-400">
            <div>Status: <span className="font-mono">{persistenceStatus}</span></div>
            {autoSaveEnabled && (
              <div>Auto-save: <span className="text-green-600">enabled</span></div>
            )}
            {lastAutoSave && (
              <div>Last auto-save: <span className="font-mono">{lastAutoSave.toLocaleTimeString()}</span></div>
            )}
          </div>
        </div>
      )}

      {saveStatus.saveStatus === 'saved' && !hasUnsavedChanges && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
          ✓ World saved successfully
        </div>
      )}
    </div>
  );
};

export default SaveStatusIndicator;