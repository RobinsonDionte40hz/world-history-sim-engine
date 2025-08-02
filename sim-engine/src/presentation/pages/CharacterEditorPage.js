/**
 * CharacterEditorPage - Dedicated full-page interface for character editing
 * 
 * Provides a focused environment for creating and editing characters
 * with D&D attributes, personality traits, and consciousness settings.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Dice6 } from 'lucide-react';
import CharacterEditor from '../components/CharacterEditor';
import EditorLayout from '../components/EditorLayout';

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

  // Custom header actions for character editor
  const headerActions = [
    // Character Archetypes
    <div key="archetypes" className="flex items-center gap-2">
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
    </div>,
    // Roll Attributes Button
    <button
      key="roll"
      onClick={rollAttributes}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
    >
      <Dice6 className="w-4 h-4" />
      Roll Attributes
    </button>
  ];

  return (
    <EditorLayout
      title="Character Editor"
      editorType="characters"
      onSave={handleSave}
      onCancel={handleCancel}
      hasUnsavedChanges={hasUnsavedChanges}
      isSaving={isSaving}
      validationErrors={Object.values(validationErrors)}
      previewMode={previewMode}
      onPreviewToggle={() => setPreviewMode(!previewMode)}
      autoSaveEnabled={autoSaveEnabled}
      onAutoSaveToggle={setAutoSaveEnabled}
      saveStatus={lastSaved ? { status: 'saved', timestamp: lastSaved } : null}
      headerActions={headerActions}
      exportImportConfig={{
        onExport: handleExportTemplate,
        onImport: handleImportTemplate,
        exportDisabled: !currentCharacter,
        acceptedFileTypes: '.json'
      }}
    >
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
      )}
    </EditorLayout>
  );
};

export default CharacterEditorPage;