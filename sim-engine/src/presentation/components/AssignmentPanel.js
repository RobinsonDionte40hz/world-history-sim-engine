// src/presentation/components/AssignmentPanel.js

import React, { useState } from 'react';
import { Users, MapPin, Zap, Link, Unlink, AlertCircle } from 'lucide-react';
import { useAssignmentManager } from '../hooks/useAssignmentManager';

const AssignmentPanel = ({ characterId, nodeId, interactionId }) => {
  const {
    statistics,
    isLoading,
    error,
    assignCharacterToNode,
    assignCharacterToInteraction,
    unassignCharacterFromNode,
    unassignCharacterFromInteraction,
    getCharacterAssignments,
    getCharactersByNode,
    getInteractionsByCharacter,
    validateAssignments,
    clearError
  } = useAssignmentManager();

  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [validation, setValidation] = useState(null);

  const handleAssignToNode = async () => {
    if (characterId && nodeId) {
      const success = await assignCharacterToNode(characterId, nodeId);
      if (success) {
        console.log(`Character ${characterId} assigned to node ${nodeId}`);
      }
    }
  };

  const handleAssignToInteraction = async () => {
    if (characterId && interactionId) {
      const success = await assignCharacterToInteraction(characterId, interactionId);
      if (success) {
        console.log(`Character ${characterId} assigned to interaction ${interactionId}`);
      }
    }
  };

  const handleValidate = () => {
    const result = validateAssignments();
    setValidation(result);
  };

  // Get current assignments
  const assignments = characterId ? getCharacterAssignments(characterId) : null;
  const nodeCharacters = nodeId ? getCharactersByNode(nodeId) : [];
  const characterInteractions = characterId ? getInteractionsByCharacter(characterId) : [];

  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">Assignment Manager</h3>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-xs">Total Characters</div>
          <div className="text-white text-lg font-semibold">{statistics.totalCharacters}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-xs">Assigned to Nodes</div>
          <div className="text-white text-lg font-semibold">{statistics.charactersWithNodes}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-xs">With Interactions</div>
          <div className="text-white text-lg font-semibold">{statistics.charactersWithInteractions}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="text-gray-400 text-xs">Avg per Node</div>
          <div className="text-white text-lg font-semibold">
            {statistics.averageCharactersPerNode.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      {assignments && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-white mb-3">Current Assignments for {characterId}</h4>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Node:</span>
              <span className="text-white">{assignments.node || 'Unassigned'}</span>
              {assignments.node && (
                <button
                  onClick={() => unassignCharacterFromNode(characterId)}
                  className="ml-auto p-1 text-red-400 hover:text-red-300"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Interactions:</span>
              <span className="text-white">
                {assignments.interactions.length > 0
                  ? assignments.interactions.join(', ')
                  : 'None'}
              </span>
              {assignments.interactions.length > 0 && (
                <button
                  onClick={() => {
                    assignments.interactions.forEach(interactionId =>
                      unassignCharacterFromInteraction(characterId, interactionId)
                    );
                  }}
                  className="ml-auto p-1 text-red-400 hover:text-red-300"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Node Characters Display */}
      {nodeId && nodeCharacters.length > 0 && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Characters in Node {nodeId}
          </h4>
          <div className="flex flex-wrap gap-2">
            {nodeCharacters.map(charId => (
              <span key={charId} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                {charId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Character Interactions Display */}
      {characterId && characterInteractions.length > 0 && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Interactions for {characterId}
          </h4>
          <div className="flex flex-wrap gap-2">
            {characterInteractions.map(interactionId => (
              <span key={interactionId} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                {interactionId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Character Selection */}
      {!characterId && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-white mb-3">Select Characters for Batch Operations</h4>
          <div className="text-sm text-gray-400 mb-2">
            Selected: {selectedCharacters.length} characters
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCharacters([])}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Clear Selection
            </button>
            <button
              onClick={() => {
                // This would need access to all characters - placeholder for now
                console.log('Select all characters');
              }}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Select All
            </button>
          </div>
        </div>
      )}

      {/* Assignment Actions */}
      <div className="space-y-3">
        {characterId && nodeId && (
          <button
            onClick={handleAssignToNode}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Link className="w-4 h-4" />
            Assign Character to Node
          </button>
        )}

        {characterId && interactionId && (
          <button
            onClick={handleAssignToInteraction}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Link className="w-4 h-4" />
            Assign Character to Interaction
          </button>
        )}

        {selectedCharacters.length > 0 && nodeId && (
          <button
            onClick={() => {
              selectedCharacters.forEach(charId =>
                assignCharacterToNode(charId, nodeId)
              );
              setSelectedCharacters([]);
            }}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Link className="w-4 h-4" />
            Assign Selected Characters to Node
          </button>
        )}

        <button
          onClick={handleValidate}
          className="w-full px-4 py-2 border border-white/20 hover:bg-white/10 text-gray-300 rounded-lg"
        >
          Validate All Assignments
        </button>
      </div>

      {/* Validation Results */}
      {validation && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-white mb-2">
            Validation {validation.valid ? 'Passed' : 'Failed'}
          </h4>
          {validation.issues.length > 0 && (
            <ul className="text-sm text-red-300 space-y-1">
              {validation.issues.map((issue, idx) => (
                <li key={idx}>• {issue.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentPanel;