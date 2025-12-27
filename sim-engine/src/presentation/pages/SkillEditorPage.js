/**
 * SkillEditorPage - Dedicated full-page interface for skill editing
 * 
 * Provides a focused environment for creating and editing skills
 * with progression systems, passive effects, and training configuration.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen,
  AlertTriangle,
  Download,
  Upload,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import SkillEditor from '../components/SkillEditor';
import WorldDropdown from '../UI/WorldDropdown';
import { useWorldContext } from '../contexts/WorldContext';
import Skill from '../../domain/entities/Skill';

const SkillEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract initial data from route state
  const routeState = location.state || {};
  const initialSkill = routeState.skill || null;
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
  const [currentSkill, setCurrentSkill] = useState(initialSkill);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation
  const validateSkill = useCallback(() => {
    const errors = [];
    
    if (!currentSkill?.name?.trim()) {
      errors.push({ field: 'name', message: 'Skill name is required' });
    } else if (currentSkill.name.length < 2) {
      errors.push({ field: 'name', message: 'Skill name must be at least 2 characters' });
    }
    
    if (currentSkill?.level < 0 || currentSkill?.level > 100) {
      errors.push({ field: 'level', message: 'Level must be between 0 and 100' });
    }
    
    if (currentSkill?.experience < 0) {
      errors.push({ field: 'experience', message: 'Experience cannot be negative' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentSkill]);

  // Real-time validation
  useEffect(() => {
    if (currentSkill) {
      validateSkill();
    }
  }, [currentSkill, validateSkill]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentSkill) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentSkill, autoSaveEnabled]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !validateSkill()) return;
    
    setIsSaving(true);
    try {
      await saveSkillToWorld();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Auto-saved skill...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, validateSkill, currentSkill]);

  const saveSkillToWorld = async () => {
    if (!currentWorld || !currentSkill) return;

    try {
      // Get current skills from world
      const currentSkills = currentWorld.worldConfig?.skills || [];
      
      // Check if updating existing skill or adding new one
      const existingIndex = currentSkills.findIndex(s => s.id === currentSkill.id);
      
      let updatedSkills;
      if (existingIndex >= 0) {
        // Update existing
        updatedSkills = [...currentSkills];
        updatedSkills[existingIndex] = currentSkill;
      } else {
        // Add new
        updatedSkills = [...currentSkills, currentSkill];
      }

      // Update world config
      const updatedWorldConfig = {
        ...currentWorld.worldConfig,
        skills: updatedSkills
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
      console.error('Failed to save skill to world:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!validateSkill()) {
      alert('Please fix validation errors before saving.');
      return;
    }
    
    if (!currentWorldId) {
      alert('No world selected. Please select a world first.');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveSkillToWorld();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      console.log('Skill saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save skill. Please try again.');
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

  const handleChange = (skillData) => {
    setHasUnsavedChanges(true);
    setCurrentSkill(skillData);
  };

  const handleExport = () => {
    if (!currentSkill) {
      alert('No skill to export.');
      return;
    }

    const dataStr = JSON.stringify(currentSkill, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSkill.name.replace(/\s+/g, '_').toLowerCase()}_skill.json`;
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
        setCurrentSkill(imported);
        setHasUnsavedChanges(true);
      } catch (error) {
        alert('Failed to import skill. Invalid JSON format.');
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
            <BookOpen className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {editMode ? 'Edit Skill' : 'Create Skill'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Define character skills and progression systems
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
              <span className="text-green-400 font-medium">Skill saved successfully!</span>
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
            Save Skill
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
            disabled={!currentSkill}
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

        {/* Skill Editor */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <SkillEditor
            initialSkill={currentSkill}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={editMode ? 'edit' : 'create'}
            currentWorld={currentWorld}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Skills are automatically saved to the selected world</p>
          {autoSaveEnabled && (
            <p className="mt-1">Auto-save is enabled (saves every 30 seconds)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillEditorPage;
