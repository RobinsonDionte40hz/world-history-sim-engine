/**
 * CharacterEditorPage - Dedicated full-page interface for character editing
 * 
 * Provides a focused environment for creating and editing characters
 * with D&D attributes, personality traits, and consciousness settings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Dice6, 
  AlertCircle,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState([]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentCharacter) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentCharacter, autoSaveEnabled]);

  // Validation
  const validateCharacter = useCallback(() => {
    const errors = [];
    
    if (!currentCharacter?.name?.trim()) {
      errors.push({ field: 'name', message: 'Character name is required' });
    } else if (currentCharacter.name.length < 2) {
      errors.push({ field: 'name', message: 'Character name must be at least 2 characters' });
    }
    
    if (!currentCharacter?.description?.trim()) {
      errors.push({ field: 'description', message: 'Character description is required' });
    } else if (currentCharacter.description.length < 10) {
      errors.push({ field: 'description', message: 'Character description must be at least 10 characters' });
    }
    
    // Validate D&D attributes
    const attributes = currentCharacter?.attributes || {};
    Object.keys(attributes).forEach(attr => {
      const value = attributes[attr];
      if (value < 1 || value > 20) {
        errors.push({ field: `attribute_${attr}`, message: `${attr} must be between 1 and 20` });
      }
    });
    
    // Validate goals
    if (!currentCharacter?.goals || currentCharacter.goals.length === 0) {
      errors.push({ field: 'goals', message: 'At least one goal is required' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentCharacter]);

  // Real-time validation
  useEffect(() => {
    if (currentCharacter) {
      validateCharacter();
    }
  }, [currentCharacter, validateCharacter]);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !validateCharacter()) return;
    
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
    if (!validateCharacter()) {
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
    navigate('/editors/world');
  };

  const handleChange = (characterData) => {
    setHasUnsavedChanges(true);
    setCurrentCharacter(characterData);
  };

  // Get field-specific errors
  const getFieldError = (fieldName) => {
    const error = validationErrors.find(e => e.field === fieldName);
    return error ? error.message : null;
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

  const rollAttributes = () => {
    // Roll 4d6, drop lowest for each attribute
    const rollAttribute = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const rolledAttributes = {
      strength: rollAttribute(),
      dexterity: rollAttribute(),
      constitution: rollAttribute(),
      intelligence: rollAttribute(),
      wisdom: rollAttribute(),
      charisma: rollAttribute()
    };

    const newCharacter = {
      ...currentCharacter,
      attributes: rolledAttributes
    };

    setCurrentCharacter(newCharacter);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-600/10 border-b border-red-600/30 px-4 sm:px-6 lg:px-8 py-3">
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

      {/* Main Content - Full width responsive container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-10 h-10 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Character Editor
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Design NPCs with personalities, attributes, and consciousness
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>

            {/* Character Archetypes */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadArchetype('warrior')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                ⚔️ Warrior
              </button>
              <button
                onClick={() => loadArchetype('scholar')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                📚 Scholar
              </button>
              <button
                onClick={() => loadArchetype('merchant')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                💰 Merchant
              </button>
            </div>

            <button
              onClick={rollAttributes}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Dice6 className="w-4 h-4" />
              Roll Attributes
            </button>

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
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              
              <button
                onClick={handleExportTemplate}
                disabled={!currentCharacter}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving || validationErrors.length > 0}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${hasUnsavedChanges && !isSaving && validationErrors.length === 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save Character' : 'Saved')}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {previewMode ? (
              /* Preview Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Character Preview</h2>
                {currentCharacter ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{currentCharacter.name || 'Unnamed Character'}</h3>
                        <p className="text-gray-300">{currentCharacter.description || 'No description provided'}</p>
                      </div>
                    </div>
                    
                    {/* Attributes Preview */}
                    {currentCharacter.attributes && (
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-white mb-3">D&D Attributes</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(currentCharacter.attributes).map(([attr, value]) => (
                            <div key={attr} className="bg-white/10 p-3 rounded border border-white/20">
                              <div className="text-sm text-gray-400 uppercase">{attr}</div>
                              <div className="text-lg font-bold text-white">{value}</div>
                              <div className="text-xs text-gray-400">
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
                            <div key={index} className="bg-white/10 p-3 rounded border border-white/20">
                              <div className="text-white">{goal.description}</div>
                              <div className="text-sm text-gray-400">
                                Priority: {goal.priority} • Type: {goal.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No character data to preview. Create or load a character to see the preview.
                  </p>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Character Configuration</h2>
                
                {/* Use existing CharacterEditor component */}
                <CharacterEditor 
                  initialCharacter={currentCharacter}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentCharacter ? 'edit' : 'create'}
                />
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <button
                onClick={() => navigate('/editors/nodes')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Nodes</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define locations and contexts within your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/interactions')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Interactions</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define actions and capabilities for your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/encounters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Encounters</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Design dynamic encounters with turn-based mechanics
                </p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharacterEditorPage;
