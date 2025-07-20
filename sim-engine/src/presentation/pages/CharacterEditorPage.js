/**
 * CharacterEditorPage - Dedicated full-page interface for character editing
 * 
 * Provides a focused environment for creating and editing characters
 * with D&D attributes, personality traits, and consciousness settings.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Settings, Plus, ArrowLeft, User, Download, Upload, Home, ChevronRight, Users } from 'lucide-react';
import Navigation from '../UI/Navigation';
import CharacterEditor from '../components/CharacterEditor';

const CharacterEditorPage = () => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentCharacter) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentCharacter, autoSaveEnabled]);

  // Real-time validation
  useEffect(() => {
    if (currentCharacter) {
      validateCharacter(currentCharacter);
    }
  }, [currentCharacter]);

  const validateCharacter = (character) => {
    const errors = {};
    
    if (!character.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!character.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    // Validate D&D attributes
    const attributes = character.attributes || {};
    Object.keys(attributes).forEach(attr => {
      const value = attributes[attr];
      if (value < 1 || value > 20) {
        errors[`attribute_${attr}`] = `${attr} must be between 1 and 20`;
      }
    });
    
    // Validate goals
    if (!character.goals || character.goals.length === 0) {
      errors.goals = 'At least one goal is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !validateCharacter(currentCharacter)) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement actual save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Auto-saved character...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateCharacter(currentCharacter)) {
      alert('Please fix validation errors before saving.');
      return;
    }
    
    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Saving character...');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/builder');
  };

  const handleChange = (characterData) => {
    setHasUnsavedChanges(true);
    setCurrentCharacter(characterData);
  };

  const handleExportTemplate = () => {
    if (currentCharacter) {
      const dataStr = JSON.stringify(currentCharacter, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `character-template-${currentCharacter.name || 'unnamed'}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleImportTemplate = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCharacter = JSON.parse(e.target.result);
          setCurrentCharacter(importedCharacter);
          setHasUnsavedChanges(true);
          console.log('Imported character template:', importedCharacter);
        } catch (error) {
          alert('Error importing template: Invalid JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadArchetype = (archetypeId) => {
    // TODO: Load predefined character archetype
    const archetypes = {
      warrior: {
        name: 'Warrior Template',
        description: 'A strong and brave fighter',
        attributes: { strength: 16, dexterity: 12, constitution: 15, intelligence: 10, wisdom: 13, charisma: 11 },
        skills: { 'Melee Combat': 5, 'Defense': 4, 'Tactics': 3 },
        goals: [{ id: 1, description: 'Protect the innocent', priority: 'high', type: 'ideological' }]
      },
      scholar: {
        name: 'Scholar Template',
        description: 'A wise and knowledgeable researcher',
        attributes: { strength: 8, dexterity: 10, constitution: 12, intelligence: 16, wisdom: 15, charisma: 13 },
        skills: { 'History': 5, 'Arcana': 4, 'Medicine': 3 },
        goals: [{ id: 1, description: 'Discover ancient knowledge', priority: 'high', type: 'personal' }]
      },
      merchant: {
        name: 'Merchant Template',
        description: 'A charismatic and cunning trader',
        attributes: { strength: 10, dexterity: 12, constitution: 13, intelligence: 14, wisdom: 11, charisma: 16 },
        skills: { 'Persuasion': 5, 'Deception': 3, 'Leadership': 4 },
        goals: [{ id: 1, description: 'Build a trading empire', priority: 'high', type: 'professional' }]
      }
    };
    
    const template = archetypes[archetypeId];
    if (template) {
      setCurrentCharacter(template);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />
      
      {/* Breadcrumb Navigation */}
      <div className="px-8 py-3 border-b border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button 
            onClick={() => navigate('/builder')}
            className="hover:text-slate-200 transition-colors"
          >
            World Builder
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-200">Character Editor</span>
        </div>
      </div>
      
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
              Character Editor
            </h1>
            
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded flex items-center gap-1">
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              )}
              
              {hasUnsavedChanges && !isSaving && (
                <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded">
                  Unsaved Changes
                </span>
              )}
              
              {Object.keys(validationErrors).length > 0 && (
                <span className="px-2 py-1 text-xs bg-red-600/20 text-red-400 border border-red-600/30 rounded">
                  {Object.keys(validationErrors).length} Error{Object.keys(validationErrors).length !== 1 ? 's' : ''}
                </span>
              )}
              
              {lastSaved && !hasUnsavedChanges && !isSaving && Object.keys(validationErrors).length === 0 && (
                <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 border border-green-600/30 rounded">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                Auto-save
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Character Archetypes */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadArchetype('warrior')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                ⚔️ Warrior
              </button>
              <button
                onClick={() => loadArchetype('scholar')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                📚 Scholar
              </button>
              <button
                onClick={() => loadArchetype('merchant')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                💰 Merchant
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            {/* Template Import/Export */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                className="hidden"
                id="import-character-template"
              />
              <label
                htmlFor="import-character-template"
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              
              <button
                onClick={handleExportTemplate}
                disabled={!currentCharacter}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || Object.keys(validationErrors).length > 0}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Character
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {previewMode ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Character Preview</h2>
              {currentCharacter ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{currentCharacter.name || 'Unnamed Character'}</h3>
                      <p className="text-slate-300">{currentCharacter.description || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  {/* Attributes Preview */}
                  {currentCharacter.attributes && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-white mb-3">D&D Attributes</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(currentCharacter.attributes).map(([attr, value]) => (
                          <div key={attr} className="bg-slate-700/50 p-3 rounded">
                            <div className="text-sm text-slate-400 uppercase">{attr}</div>
                            <div className="text-lg font-bold text-white">{value}</div>
                            <div className="text-xs text-slate-500">
                              Modifier: {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Goals Preview */}
                  {currentCharacter.goals && currentCharacter.goals.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-white mb-3">Goals</h4>
                      <div className="space-y-2">
                        {currentCharacter.goals.map((goal, index) => (
                          <div key={index} className="bg-slate-700/50 p-3 rounded">
                            <div className="text-white">{goal.description}</div>
                            <div className="text-sm text-slate-400">
                              Priority: {goal.priority} • Type: {goal.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-300">
                  No character data to preview. Create or load a character to see the preview.
                </p>
              )}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Character Configuration</h2>
                  
                  {/* Validation Errors Summary */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3">
                      <div className="text-red-400 text-sm font-medium mb-2">
                        Please fix the following errors:
                      </div>
                      <ul className="text-red-300 text-xs space-y-1">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Use existing CharacterEditor component */}
                <CharacterEditor 
                  initialCharacter={currentCharacter}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentCharacter ? 'edit' : 'create'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterEditorPage;