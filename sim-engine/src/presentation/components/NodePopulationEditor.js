import React, { useState, useCallback, useMemo } from 'react';
// Node population editor without Redux

// Character assignment component for individual nodes
const CharacterAssignmentCard = ({ character, isAssigned, onToggle, nodeCapacity, currentPopulation }) => {
  const canAssign = !isAssigned && currentPopulation < nodeCapacity;
  const canRemove = isAssigned;

  return (
    <div className={`
      p-3 border-2 rounded-lg transition-all cursor-pointer
      ${isAssigned 
        ? 'border-green-500 bg-green-50 dark:bg-green-950' 
        : canAssign 
          ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400' 
          : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
      }
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{character.name}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {character.archetype} • {character.description?.substring(0, 50)}...
          </p>
          
          {/* Character capabilities */}
          {character.assignedInteractions && character.assignedInteractions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {character.assignedInteractions.slice(0, 3).map((interactionId, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                  {interactionId}
                </span>
              ))}
              {character.assignedInteractions.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{character.assignedInteractions.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Character attributes preview */}
          {character.attributes && (
            <div className="flex gap-2 text-xs">
              <span>STR: {character.attributes.strength || 10}</span>
              <span>DEX: {character.attributes.dexterity || 10}</span>
              <span>CHA: {character.attributes.charisma || 10}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          {isAssigned && (
            <button
              onClick={() => canRemove && onToggle(character.id, false)}
              disabled={!canRemove}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          )}
          {!isAssigned && (
            <button
              onClick={() => canAssign && onToggle(character.id, true)}
              disabled={!canAssign}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Assign
            </button>
          )}
          
          {!canAssign && !isAssigned && (
            <span className="text-xs text-red-500">Node Full</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Node population panel for a single node
const NodePopulationPanel = ({ 
  node, 
  characters, 
  assignedCharacterIds, 
  onCharacterToggle,
  onBulkAssign,
  onClearAll 
}) => {
  const [filterArchetype, setFilterArchetype] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);

  // Get unique archetypes for filtering
  const archetypes = useMemo(() => {
    const types = [...new Set(characters.map(c => c.archetype))];
    return types.sort();
  }, [characters]);

  // Filter characters based on search and filters
  const filteredCharacters = useMemo(() => {
    return characters.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArchetype = filterArchetype === 'all' || character.archetype === filterArchetype;
      const matchesAssignment = !showOnlyUnassigned || !assignedCharacterIds.includes(character.id);
      
      return matchesSearch && matchesArchetype && matchesAssignment;
    });
  }, [characters, searchTerm, filterArchetype, showOnlyUnassigned, assignedCharacterIds]);

  const currentPopulation = assignedCharacterIds.length;
  const capacity = node.populationCapacity || 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Node header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{node.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${currentPopulation >= capacity 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : currentPopulation >= capacity * 0.8
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }
            `}>
              {currentPopulation}/{capacity}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {node.description}
        </p>

        {/* Node properties */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
            {node.environment || 'Unknown'} Environment
          </span>
          {node.features && node.features.length > 0 && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded">
              {node.features.length} Features
            </span>
          )}
          {node.resources && node.resources.length > 0 && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded">
              {node.resources.length} Resources
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          
          <select
            value={filterArchetype}
            onChange={(e) => setFilterArchetype(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Archetypes</option>
            {archetypes.map(archetype => (
              <option key={archetype} value={archetype}>
                {archetype}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyUnassigned}
              onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Unassigned only</span>
          </label>
        </div>

        {/* Bulk actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onBulkAssign(node.id, 'suitable')}
            disabled={currentPopulation >= capacity}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            Auto-Assign Suitable
          </button>
          <button
            onClick={() => onBulkAssign(node.id, 'random')}
            disabled={currentPopulation >= capacity}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
          >
            Random Fill
          </button>
          <button
            onClick={() => onClearAll(node.id)}
            disabled={currentPopulation === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Character list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterArchetype !== 'all' || showOnlyUnassigned 
              ? 'No characters match your filters'
              : 'No characters available'
            }
          </div>
        ) : (
          filteredCharacters.map(character => (
            <CharacterAssignmentCard
              key={character.id}
              character={character}
              isAssigned={assignedCharacterIds.includes(character.id)}
              onToggle={onCharacterToggle}
              nodeCapacity={capacity}
              currentPopulation={currentPopulation}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Main NodePopulationEditor component
const NodePopulationEditor = ({ 
  nodes = [],
  characters = [],
  nodePopulations = {},
  onPopulationChange,
  onSave,
  onCancel,
  mode = 'edit'
}) => {
  const dispatch = useDispatch();
  
  const [activeNodeId, setActiveNodeId] = useState(nodes[0]?.id || null);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Handle character assignment toggle
  const handleCharacterToggle = useCallback((characterId, shouldAssign) => {
    const newPopulations = { ...nodePopulations };
    
    if (shouldAssign) {
      // Remove character from any other nodes first
      Object.keys(newPopulations).forEach(nodeId => {
        newPopulations[nodeId] = newPopulations[nodeId].filter(id => id !== characterId);
      });
      
      // Add to current node
      if (!newPopulations[activeNodeId]) {
        newPopulations[activeNodeId] = [];
      }
      newPopulations[activeNodeId].push(characterId);
    } else {
      // Remove from current node
      if (newPopulations[activeNodeId]) {
        newPopulations[activeNodeId] = newPopulations[activeNodeId].filter(id => id !== characterId);
      }
    }
    
    onPopulationChange(newPopulations);
    setHasChanges(true);
    setErrors({});
  }, [activeNodeId, nodePopulations, onPopulationChange]);

  // Handle bulk assignment
  const handleBulkAssign = useCallback((nodeId, strategy) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const newPopulations = { ...nodePopulations };
    const currentAssigned = newPopulations[nodeId] || [];
    const availableSlots = (node.populationCapacity || 100) - currentAssigned.length;
    
    if (availableSlots <= 0) return;

    // Get unassigned characters
    const assignedCharacterIds = new Set(Object.values(newPopulations).flat());
    const unassignedCharacters = characters.filter(c => !assignedCharacterIds.has(c.id));
    
    let charactersToAssign = [];
    
    if (strategy === 'suitable') {
      // Try to match characters to node environment/features
      const nodeEnvironment = node.environment?.toLowerCase() || '';
      const nodeFeatures = node.features?.map(f => f.id || f).join(' ').toLowerCase() || '';
      
      charactersToAssign = unassignedCharacters
        .sort((a, b) => {
          // Simple scoring based on archetype suitability
          const aScore = calculateSuitabilityScore(a, nodeEnvironment, nodeFeatures);
          const bScore = calculateSuitabilityScore(b, nodeEnvironment, nodeFeatures);
          return bScore - aScore;
        })
        .slice(0, availableSlots);
    } else if (strategy === 'random') {
      // Random selection
      const shuffled = [...unassignedCharacters].sort(() => Math.random() - 0.5);
      charactersToAssign = shuffled.slice(0, availableSlots);
    }
    
    // Assign characters
    if (!newPopulations[nodeId]) {
      newPopulations[nodeId] = [];
    }
    charactersToAssign.forEach(character => {
      newPopulations[nodeId].push(character.id);
    });
    
    onPopulationChange(newPopulations);
    setHasChanges(true);
    setErrors({});
  }, [nodes, characters, nodePopulations, onPopulationChange]);

  // Simple suitability scoring function
  const calculateSuitabilityScore = (character, nodeEnvironment, nodeFeatures) => {
    let score = 0;
    
    // Archetype-based scoring
    const archetype = character.archetype?.toLowerCase() || '';
    if (nodeEnvironment.includes('urban') && ['merchant', 'noble', 'diplomat'].includes(archetype)) score += 3;
    if (nodeEnvironment.includes('forest') && ['ranger', 'druid', 'hunter'].includes(archetype)) score += 3;
    if (nodeEnvironment.includes('mountain') && ['warrior', 'miner', 'dwarf'].includes(archetype)) score += 3;
    if (nodeFeatures.includes('market') && ['merchant', 'trader'].includes(archetype)) score += 2;
    if (nodeFeatures.includes('temple') && ['priest', 'cleric', 'paladin'].includes(archetype)) score += 2;
    if (nodeFeatures.includes('fortress') && ['warrior', 'guard', 'knight'].includes(archetype)) score += 2;
    
    // Attribute-based scoring
    if (character.attributes) {
      if (nodeEnvironment.includes('dangerous') && character.attributes.strength > 14) score += 1;
      if (nodeFeatures.includes('market') && character.attributes.charisma > 14) score += 1;
      if (nodeEnvironment.includes('wilderness') && character.attributes.wisdom > 14) score += 1;
    }
    
    return score;
  };

  // Handle clear all characters from node
  const handleClearAll = useCallback((nodeId) => {
    const newPopulations = { ...nodePopulations };
    newPopulations[nodeId] = [];
    onPopulationChange(newPopulations);
    setHasChanges(true);
    setErrors({});
  }, [nodePopulations, onPopulationChange]);

  // Validation
  const validatePopulations = useCallback(() => {
    const newErrors = {};
    
    // Check that all nodes have at least one character
    nodes.forEach(node => {
      const population = nodePopulations[node.id] || [];
      if (population.length === 0) {
        newErrors[node.id] = `${node.name} must have at least one character`;
      }
    });
    
    // Check that all characters are assigned
    const assignedCharacterIds = new Set(Object.values(nodePopulations).flat());
    const unassignedCharacters = characters.filter(c => !assignedCharacterIds.has(c.id));
    if (unassignedCharacters.length > 0) {
      newErrors.unassigned = `${unassignedCharacters.length} characters are not assigned to any node`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [nodes, characters, nodePopulations]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validatePopulations()) {
      return;
    }

    if (onSave) {
      onSave(nodePopulations);
    }
    setHasChanges(false);
  }, [nodePopulations, onSave, validatePopulations]);

  // Get current node data
  const activeNode = nodes.find(n => n.id === activeNodeId);
  const assignedCharacterIds = nodePopulations[activeNodeId] || [];

  // Population statistics
  const populationStats = useMemo(() => {
    const totalCharacters = characters.length;
    const assignedCharacters = new Set(Object.values(nodePopulations).flat()).size;
    const totalCapacity = nodes.reduce((sum, node) => sum + (node.populationCapacity || 100), 0);
    const totalPopulated = Object.values(nodePopulations).reduce((sum, pop) => sum + pop.length, 0);
    
    return {
      totalCharacters,
      assignedCharacters,
      unassignedCharacters: totalCharacters - assignedCharacters,
      totalCapacity,
      totalPopulated,
      utilizationRate: totalCapacity > 0 ? (totalPopulated / totalCapacity * 100).toFixed(1) : 0
    };
  }, [characters, nodes, nodePopulations]);

  if (nodes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            No Nodes Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to create nodes before you can populate them with characters.
          </p>
        </div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            No Characters Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to create characters before you can assign them to nodes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Node Population Editor
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Assign characters to nodes to populate your world
        </p>
      </div>

      {/* Statistics panel */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Characters:</span> {populationStats.totalCharacters}
          </div>
          <div>
            <span className="font-medium">Assigned:</span> {populationStats.assignedCharacters}
          </div>
          <div>
            <span className="font-medium">Unassigned:</span> 
            <span className={populationStats.unassignedCharacters > 0 ? 'text-red-600 ml-1' : 'ml-1'}>
              {populationStats.unassignedCharacters}
            </span>
          </div>
          <div>
            <span className="font-medium">Utilization:</span> {populationStats.utilizationRate}%
          </div>
        </div>
      </div>

      {/* Error display */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Validation Errors:</h3>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node selector sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-4">Nodes</h3>
            <div className="space-y-2">
              {nodes.map(node => {
                const population = nodePopulations[node.id] || [];
                const capacity = node.populationCapacity || 100;
                const isActive = node.id === activeNodeId;
                const hasError = errors[node.id];
                
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                      }
                      ${hasError ? 'border-red-500' : ''}
                    `}
                  >
                    <div className="font-medium text-sm">{node.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {population.length}/{capacity}
                      {hasError && <span className="text-red-500 ml-2">⚠</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main population editor */}
        <div className="lg:col-span-3">
          {activeNode && (
            <NodePopulationPanel
              node={activeNode}
              characters={characters}
              assignedCharacterIds={assignedCharacterIds}
              onCharacterToggle={handleCharacterToggle}
              onBulkAssign={handleBulkAssign}
              onClearAll={handleClearAll}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {hasChanges && '• Unsaved changes'}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Save Population
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePopulationEditor;