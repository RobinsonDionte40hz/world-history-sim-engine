/**
 * CharacterManagerPage - Full-page interface for character management
 * 
 * Provides a dedicated page for managing all characters in the current world
 * with navigation integration and proper error handling.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Settings, Download, Upload } from 'lucide-react';
import Navigation from '../UI/Navigation';
import CharacterManager from '../components/CharacterManager';
import CharacterEditor from '../components/CharacterEditor';
import Modal from '../components/Modal';
import { useWorldContext } from '../contexts/WorldContext';
import { saveCharacter } from '../../shared/utils/characterSaveUtils';

const CharacterManagerPage = () => {
  const navigate = useNavigate();
  const { worldBuilder } = useWorldContext();
  
  // State for character editing modal
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [editorMode, setEditorMode] = useState('create');
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle character creation
  const handleCreateCharacter = useCallback(() => {
    setEditingCharacter(null);
    setEditorMode('create');
    setShowCharacterEditor(true);
  }, []);

  // Handle character editing
  const handleEditCharacter = useCallback((character) => {
    setEditingCharacter(character);
    setEditorMode('edit');
    setShowCharacterEditor(true);
  }, []);

  // Handle character viewing (redirect to character editor page)
  const handleViewCharacter = useCallback((character) => {
    navigate(`/editors/character?id=${character.id}&mode=view`);
  }, [navigate]);

  // Handle character save from editor
  const handleSaveCharacter = useCallback(async (characterData) => {
    if (!worldBuilder) {
      console.error('WorldBuilder not available');
      return;
    }

    try {
      // Use unified save utility for consistent behavior
      const saveResult = await saveCharacter(characterData, {
        worldBuilder,
        mode: editorMode
      });
      
      if (saveResult.success) {
        // Close editor
        setShowCharacterEditor(false);
        setEditingCharacter(null);
        
        // Force refresh of character list by updating the refresh key
        setRefreshKey(prev => prev + 1);
        
        console.log(saveResult.message);
      } else {
        throw new Error(saveResult.message);
      }
      
    } catch (error) {
      console.error('Failed to save character:', error);
      alert(`Failed to save character: ${error.message}`);
    }
  }, [worldBuilder, editorMode]);

  // Handle editor cancel
  const handleCancelEdit = useCallback(() => {
    setShowCharacterEditor(false);
    setEditingCharacter(null);
  }, []);

  // Handle bulk export
  const handleExportCharacters = useCallback(() => {
    if (!worldBuilder) return;

    try {
      const characters = worldBuilder.getAllCharacters();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        characters: characters
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `characters-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('Exported characters:', characters.length);
    } catch (error) {
      console.error('Failed to export characters:', error);
      alert('Failed to export characters. Please try again.');
    }
  }, [worldBuilder]);

  // Handle bulk import
  const handleImportCharacters = useCallback((event) => {
    const file = event.target.files[0];
    if (!file || !worldBuilder) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        const characters = importData.characters || importData; // Support both formats
        
        if (!Array.isArray(characters)) {
          throw new Error('Invalid import format: expected array of characters');
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        characters.forEach((characterData, index) => {
          try {
            // Generate new ID to avoid conflicts
            const newCharacterData = {
              ...characterData,
              id: `imported_${Date.now()}_${index}`,
              name: characterData.name ? `${characterData.name} (Imported)` : `Imported Character ${index + 1}`
            };
            
            worldBuilder.addCharacter(newCharacterData);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(`Character ${index + 1}: ${error.message}`);
          }
        });

        if (successCount > 0) {
          alert(`Successfully imported ${successCount} character(s).${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
        }
        
        if (errors.length > 0 && errors.length <= 5) {
          console.warn('Import errors:', errors);
        }
        
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import characters: Invalid file format');
      }
    };
    
    reader.readAsText(file);
    
    // Clear the input so the same file can be imported again
    event.target.value = '';
  }, [worldBuilder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/editors/world')}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to World Builder
              </button>
              
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-400" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Character Management
                  </h1>
                  <p className="text-gray-300">
                    Manage all characters in your world
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Import/Export Controls */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportCharacters}
                  className="hidden"
                  id="import-characters"
                />
                <label
                  htmlFor="import-characters"
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </label>
                
                <button
                  onClick={handleExportCharacters}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Settings */}
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* World Status */}
          {!worldBuilder && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div>
                  <h3 className="text-red-400 font-medium">No World Selected</h3>
                  <p className="text-red-300 text-sm">
                    Please select or create a world to manage characters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Character Manager */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <CharacterManager
              key={refreshKey}
              worldBuilder={worldBuilder}
              onEditCharacter={handleEditCharacter}
              onCreateCharacter={handleCreateCharacter}
              onViewCharacter={handleViewCharacter}
            />
          </div>

          {/* Help Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
              <h3 className="text-white font-medium mb-2">Quick Actions</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Click "Create Character" to add new characters</li>
                <li>• Use search to find specific characters</li>
                <li>• Apply filters to narrow down the list</li>
                <li>• Select multiple characters for bulk actions</li>
              </ul>
            </div>

            <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
              <h3 className="text-white font-medium mb-2">Character Types</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Important:</strong> Main story characters</li>
                <li>• <strong>NPC:</strong> Supporting characters</li>
                <li>• <strong>Generic:</strong> Background characters</li>
                <li>• Each type has different requirements</li>
              </ul>
            </div>

            <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
              <h3 className="text-white font-medium mb-2">Assignment Status</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Assigned:</strong> Has node or interaction assignments</li>
                <li>• <strong>Unassigned:</strong> Not assigned to anything</li>
                <li>• Characters need assignments for simulation</li>
                <li>• Use filters to find unassigned characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Character Editor Modal */}
      {showCharacterEditor && (
        <Modal
          isOpen={showCharacterEditor}
          onClose={handleCancelEdit}
          title={editorMode === 'create' ? 'Create Character' : 'Edit Character'}
          size="large"
        >
          <div className="max-h-[80vh] overflow-y-auto">
            <CharacterEditor
              initialCharacter={editingCharacter}
              onSave={handleSaveCharacter}
              onCancel={handleCancelEdit}
              mode={editorMode}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CharacterManagerPage;