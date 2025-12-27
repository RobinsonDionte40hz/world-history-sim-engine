import React, { useState, useMemo } from 'react';
import { Skull, AlertTriangle, Swords, Users, X, Plus, History } from 'lucide-react';
import MemoryService from '../../domain/services/MemoryService.js';

/**
 * EnemyRelationshipManager - UI for managing hostile relationships between characters
 * 
 * Features:
 * - Mark characters as enemies
 * - View existing enemy relationships
 * - Adjust hostility levels
 * - Track vendetta status
 * - View relationship history
 */
const EnemyRelationshipManager = ({
  character,
  allCharacters = [],
  onRelationshipUpdate,
  readonly = false
}) => {
  const memoryService = useMemo(() => new MemoryService(), []);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [enemyReason, setEnemyReason] = useState('');
  const [hostilitySeverity, setHostilitySeverity] = useState(0.65);
  const [isVendetta, setIsVendetta] = useState(false);
  const [showHistory, setShowHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get current enemies
  const currentEnemies = useMemo(() => {
    if (!character) return [];
    return memoryService.getEnemies(character);
  }, [character, memoryService]);

  // Filter available characters (exclude self and current enemies)
  const availableCharacters = useMemo(() => {
    if (!allCharacters || !character) return [];
    
    const enemyIds = new Set(currentEnemies.map(e => e.characterId));
    return allCharacters.filter(c => 
      c.id !== character.id && 
      !enemyIds.has(c.id) &&
      (searchTerm === '' || 
       c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allCharacters, character, currentEnemies, searchTerm]);

  // Get character name by ID
  const getCharacterName = (characterId) => {
    const char = allCharacters.find(c => c.id === characterId);
    return char?.name || 'Unknown Character';
  };

  // Handle marking as enemy
  const handleMarkAsEnemy = () => {
    if (!selectedTarget || !character) return;
    
    let updatedCharacter = { ...character };
    
    if (isVendetta) {
      memoryService.createVendetta(
        updatedCharacter,
        selectedTarget,
        enemyReason || 'Personal vendetta',
        {
          severity: hostilitySeverity >= 0.8 ? 'extreme' : 'major'
        }
      );
    } else {
      memoryService.markAsEnemy(
        updatedCharacter,
        selectedTarget,
        enemyReason || 'Declared enemy',
        hostilitySeverity
      );
    }

    // Reset form
    setSelectedTarget('');
    setEnemyReason('');
    setHostilitySeverity(0.65);
    setIsVendetta(false);

    // Notify parent
    if (onRelationshipUpdate) {
      onRelationshipUpdate(updatedCharacter);
    }
  };

  // Handle removing enemy status
  const handleRemoveEnemy = (targetId) => {
    if (!character) return;

    let updatedCharacter = { ...character };
    
    // Set relationship to neutral
    const relationship = updatedCharacter.relationships.get(targetId);
    if (relationship) {
      relationship.value = 0;
      relationship.type = 'neutral';
      relationship.history.push({
        timestamp: Date.now(),
        change: -relationship.value,
        reason: 'Enemy status removed',
        interactionType: 'reconciliation'
      });
      delete relationship.isVendetta;
      delete relationship.vendettaStartDate;
      delete relationship.vendettaReason;
      
      updatedCharacter.relationships.set(targetId, relationship);
    }

    if (onRelationshipUpdate) {
      onRelationshipUpdate(updatedCharacter);
    }
  };

  // Severity label and color
  const getSeverityInfo = (value) => {
    if (value <= -80) return { label: 'Mortal Enemy', color: 'text-red-500', bg: 'bg-red-500/20' };
    if (value <= -60) return { label: 'Hostile', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    if (value <= -30) return { label: 'Enemy', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { label: 'Dislike', color: 'text-gray-500', bg: 'bg-gray-500/20' };
  };

  if (!character) {
    return (
      <div className="p-6 text-center text-gray-400">
        <Skull className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No character selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <Swords className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Enemy Relationships</h3>
          <p className="text-sm text-gray-400">
            Manage hostile relationships for {character.name}
          </p>
        </div>
      </div>

      {/* Add Enemy Section */}
      {!readonly && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-red-400" />
            <h4 className="font-medium text-white">Declare New Enemy</h4>
          </div>

          {/* Character Search */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Search Character
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Target Character
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Select a character...</option>
              {availableCharacters.map(char => (
                <option key={char.id} value={char.id} className="bg-gray-800">
                  {char.name} {char.description && `- ${char.description.substring(0, 50)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reason for Enmity
            </label>
            <textarea
              value={enemyReason}
              onChange={(e) => setEnemyReason(e.target.value)}
              rows={2}
              placeholder="Why are they enemies? (e.g., 'Killed family member', 'Betrayed trust')"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          {/* Hostility Level */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Hostility Level: {hostilitySeverity.toFixed(2)} ({
                hostilitySeverity >= 0.8 ? 'Mortal Enemy' :
                hostilitySeverity >= 0.65 ? 'Enemy' :
                hostilitySeverity >= 0.5 ? 'Hostile' : 'Dislike'
              })
            </label>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={hostilitySeverity}
              onChange={(e) => setHostilitySeverity(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Dislike</span>
              <span>Hostile</span>
              <span>Enemy</span>
              <span>Mortal Enemy</span>
            </div>
          </div>

          {/* Vendetta Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="vendetta"
              checked={isVendetta}
              onChange={(e) => setIsVendetta(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="vendetta" className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Mark as Vendetta (irreconcilable blood feud)
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleMarkAsEnemy}
            disabled={!selectedTarget}
            className={`
              w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2
              ${selectedTarget
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Skull className="w-4 h-4" />
            Declare Enemy
          </button>
        </div>
      )}

      {/* Current Enemies List */}
      <div>
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-400" />
          Current Enemies ({currentEnemies.length})
        </h4>

        {currentEnemies.length === 0 ? (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center text-gray-400">
            No enemies declared
          </div>
        ) : (
          <div className="space-y-3">
            {currentEnemies.map(enemy => {
              const severityInfo = getSeverityInfo(enemy.relationshipValue);
              const targetName = getCharacterName(enemy.characterId);
              const lastReason = enemy.history[enemy.history.length - 1]?.reason || 'Unknown';
              
              return (
                <div
                  key={enemy.characterId}
                  className="p-4 bg-white/5 rounded-lg border border-red-500/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-white">{targetName}</h5>
                        {memoryService.hasVendetta(character, enemy.characterId) && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Vendetta
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 ${severityInfo.bg} ${severityInfo.color} text-xs rounded font-medium`}>
                          {severityInfo.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          Value: {enemy.relationshipValue}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-400">Last reason:</span> {lastReason}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowHistory(showHistory === enemy.characterId ? null : enemy.characterId)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded"
                        title="View history"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      
                      {!readonly && (
                        <button
                          onClick={() => handleRemoveEnemy(enemy.characterId)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                          title="Remove enemy status"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* History Panel */}
                  {showHistory === enemy.characterId && enemy.history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs font-medium text-gray-400 mb-2">Relationship History</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {enemy.history.slice().reverse().map((event, idx) => (
                          <div key={idx} className="p-2 bg-white/5 rounded text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-400">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                              <span className={`font-mono ${event.change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {event.change > 0 ? '+' : ''}{event.change}
                              </span>
                            </div>
                            <p className="text-gray-300">{event.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">About Enemy Relationships</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Enemy status affects character interactions and decision-making</li>
              <li>Vendettas are permanent blood feuds that cannot be easily reconciled</li>
              <li>Higher hostility levels increase chances of conflict interactions</li>
              <li>Relationship history is preserved for narrative purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnemyRelationshipManager;
