/**
 * ItemEditorPage - Dedicated full-page interface for item editing
 * 
 * Provides a focused environment for creating and editing items
 * with equipment properties, effects, and requirements.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package,
  AlertTriangle,
  Download,
  Upload,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import ItemEditor from '../components/ItemEditor';
import WorldDropdown from '../UI/WorldDropdown';
import { useWorldContext } from '../contexts/WorldContext';
import Item from '../../domain/entities/Item';

const ItemEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract initial data from route state
  const routeState = location.state || {};
  const initialItem = routeState.item || null;
  const editMode = routeState.editMode || false;
  
  // WorldContext integration
  const { 
    currentWorldId,
    currentWorld,
    worldBuilder,
    error: worldError
  } = useWorldContext();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState(initialItem);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation
  const validateItem = useCallback(() => {
    const errors = [];
    
    if (!currentItem?.name?.trim()) {
      errors.push({ field: 'name', message: 'Item name is required' });
    } else if (currentItem.name.length < 2) {
      errors.push({ field: 'name', message: 'Item name must be at least 2 characters' });
    }
    
    if (currentItem?.weight < 0) {
      errors.push({ field: 'weight', message: 'Weight cannot be negative' });
    }
    
    if (currentItem?.value < 0) {
      errors.push({ field: 'value', message: 'Value cannot be negative' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentItem]);

  // Real-time validation
  useEffect(() => {
    if (currentItem) {
      validateItem();
    }
  }, [currentItem, validateItem]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentItem) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentItem, autoSaveEnabled]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !validateItem()) return;
    
    setIsSaving(true);
    try {
      await saveItemToWorld();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Auto-saved item...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, validateItem, currentItem]);

  const saveItemToWorld = async () => {
    if (!currentWorld || !currentItem) return;

    try {
      // Get current items from world
      const currentItems = currentWorld.worldConfig?.items || [];
      
      // Check if updating existing item or adding new one
      const existingIndex = currentItems.findIndex(i => i.id === currentItem.id);
      
      let updatedItems;
      if (existingIndex >= 0) {
        // Update existing
        updatedItems = [...currentItems];
        updatedItems[existingIndex] = currentItem;
      } else {
        // Add new
        updatedItems = [...currentItems, currentItem];
      }

      // Update world config
      const updatedWorldConfig = {
        ...currentWorld.worldConfig,
        items: updatedItems
      };

      // Save to localStorage
      const worlds = JSON.parse(localStorage.getItem('worlds') || '[]');
      const worldIndex = worlds.findIndex(w => w.id === currentWorldId);
      
      if (worldIndex >= 0) {
        worlds[worldIndex] = {
          ...worlds[worldIndex],
          worldConfig: updatedWorldConfig
        };
        localStorage.setItem('worlds', JSON.stringify(worlds));
      }

      return true;
    } catch (error) {
      console.error('Failed to save item to world:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!validateItem()) {
      alert('Please fix validation errors before saving.');
      return;
    }
    
    if (!currentWorldId) {
      alert('No world selected. Please select a world first.');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveItemToWorld();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      console.log('Item saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    // Return to World Foundation editor instead of browser history
    navigate('/builder');
  };

  const handleChange = (itemData) => {
    setHasUnsavedChanges(true);
    setCurrentItem(itemData);
  };

  const handleExport = () => {
    if (!currentItem) {
      alert('No item to export.');
      return;
    }

    const dataStr = JSON.stringify(currentItem, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentItem.name.replace(/\s+/g, '_').toLowerCase()}_item.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result);
        setCurrentItem(imported);
        setHasUnsavedChanges(true);
      } catch (error) {
        alert('Failed to import item. Invalid JSON format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Get field-specific errors
  const getFieldError = (fieldName) => {
    const error = validationErrors.find(e => e.field === fieldName);
    return error ? error.message : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {editMode ? 'Edit Item' : 'Create Item'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Define equipment, consumables, and quest items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* World Selector */}
            <WorldDropdown />
            
            {/* Save Status */}
            {isSaving && (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                Saving...
              </div>
            )}
            {lastSaved && !isSaving && (
              <div className="text-sm text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-medium mb-2">Validation Errors</h3>
                <ul className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-300">
                      • {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Item saved successfully!</span>
            </div>
          </div>
        )}

        {/* World Error */}
        {worldError && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400">{worldError}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving || validationErrors.length > 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Item
          </button>
          
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <div className="flex-1"></div>

          <button
            onClick={handleExport}
            disabled={!currentItem}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Item Editor */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <ItemEditor
            initialItem={currentItem}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={editMode ? 'edit' : 'create'}
            currentWorld={currentWorld}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Items are automatically saved to the selected world</p>
          {autoSaveEnabled && (
            <p className="mt-1">Auto-save is enabled (saves every 30 seconds)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemEditorPage;
