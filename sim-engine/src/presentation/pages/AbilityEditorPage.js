/**
 * AbilityEditorPage - Dedicated full-page interface for ability editing
 * 
 * Provides a focused environment for creating and editing abilities
 * with activation mechanics, costs, and effects.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap,
  AlertTriangle,
  Download,
  Upload,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import AbilityEditor from '../components/AbilityEditor';
import WorldDropdown from '../UI/WorldDropdown';
import { useWorldContext } from '../contexts/WorldContext';
import Ability from '../../domain/entities/Ability';

const AbilityEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract initial data from route state
  const routeState = location.state || {};
  const initialAbility = routeState.ability || null;
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
  const [currentAbility, setCurrentAbility] = useState(initialAbility);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation
  const validateAbility = useCallback(() => {
    const errors = [];
    
    if (!currentAbility?.name?.trim()) {
      errors.push({ field: 'name', message: 'Ability name is required' });
    } else if (currentAbility.name.length < 2) {
      errors.push({ field: 'name', message: 'Ability name must be at least 2 characters' });
    }
    
    if (currentAbility?.cooldown < 0) {
      errors.push({ field: 'cooldown', message: 'Cooldown cannot be negative' });
    }
    
    if (currentAbility?.maxUsesPerDay && currentAbility.maxUsesPerDay < 0) {
      errors.push({ field: 'maxUsesPerDay', message: 'Max uses per day cannot be negative' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentAbility]);

  // Real-time validation
  useEffect(() => {
    if (currentAbility) {
      validateAbility();
    }
  }, [currentAbility, validateAbility]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentAbility) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentAbility, autoSaveEnabled]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !validateAbility()) return;
    
    setIsSaving(true);
    try {
      await saveAbilityToWorld();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Auto-saved ability...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, validateAbility, currentAbility]);

  const saveAbilityToWorld = async () => {
    if (!currentWorld || !currentAbility) return;

    try {
      // Get current abilities from world
      const currentAbilities = currentWorld.worldConfig?.abilities || [];
      
      // Check if updating existing ability or adding new one
      const existingIndex = currentAbilities.findIndex(a => a.id === currentAbility.id);
      
      let updatedAbilities;
      if (existingIndex >= 0) {
        // Update existing
        updatedAbilities = [...currentAbilities];
        updatedAbilities[existingIndex] = currentAbility;
      } else {
        // Add new
        updatedAbilities = [...currentAbilities, currentAbility];
      }

      // Update world config
      const updatedWorldConfig = {
        ...currentWorld.worldConfig,
        abilities: updatedAbilities
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
      console.error('Failed to save ability to world:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!validateAbility()) {
      alert('Please fix validation errors before saving.');
      return;
    }
    
    if (!currentWorldId) {
      alert('No world selected. Please select a world first.');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAbilityToWorld();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      console.log('Ability saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save ability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate(-1); // Go back to previous page
  };

  const handleChange = (abilityData) => {
    setHasUnsavedChanges(true);
    setCurrentAbility(abilityData);
  };

  const handleExport = () => {
    if (!currentAbility) {
      alert('No ability to export.');
      return;
    }

    const dataStr = JSON.stringify(currentAbility, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentAbility.name.replace(/\s+/g, '_').toLowerCase()}_ability.json`;
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
        setCurrentAbility(imported);
        setHasUnsavedChanges(true);
      } catch (error) {
        alert('Failed to import ability. Invalid JSON format.');
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
            <Zap className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {editMode ? 'Edit Ability' : 'Create Ability'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Define character abilities, spells, and special actions
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
              <span className="text-green-400 font-medium">Ability saved successfully!</span>
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
            Save Ability
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
            disabled={!currentAbility}
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

        {/* Ability Editor */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <AbilityEditor
            initialAbility={currentAbility}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={editMode ? 'edit' : 'create'}
            currentWorld={currentWorld}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Abilities are automatically saved to the selected world</p>
          {autoSaveEnabled && (
            <p className="mt-1">Auto-save is enabled (saves every 30 seconds)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbilityEditorPage;
