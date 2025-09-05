/**
 * CharacterManager - Comprehensive character management interface
 * 
 * Provides listing, searching, filtering, and management of characters
 * with real-time filtering across multiple fields and character actions.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 4.1, 4.7, 10.1, 10.2
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus, 
  Eye,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react';
import { useSimulationContext } from '../contexts/SimulationContext';
import Modal from './Modal';

const CharacterManager = ({ 
  onEditCharacter, 
  onCreateCharacter,
  onViewCharacter,
  className = '' 
}) => {
  const { worldBuilder } = useSimulationContext();
  
  // State management
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    characterType: '',
    category: '',
    assignmentStatus: '',
    minLevel: '',
    maxLevel: '',
    hasInteractions: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCharacters, setSelectedCharacters] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load characters from WorldBuilder
  const loadCharacters = useCallback(async () => {
    if (!worldBuilder) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const allCharacters = worldBuilder.getAllCharacters() || [];
      setCharacters(allCharacters);
      console.log('Loaded characters:', allCharacters.length);
    } catch (err) {
      console.error('Failed to load characters:', err);
      setError('Failed to load characters. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [worldBuilder]);

  // Load characters on component mount and when worldBuilder changes
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // Real-time filtering and searching
  const applyFiltersAndSearch = useCallback(() => {
    if (!characters || !Array.isArray(characters)) {
      setFilteredCharacters([]);
      return;
    }
    
    let filtered = [...characters];

    // Apply text search across multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(character => {
        const searchableFields = [
          character.name || '',
          character.description || '',
          character.race || '',
          character.characterClass || '',
          character.background || '',
          character.appearance || '',
          ...(character.tags || [])
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(query)
        );
      });
    }

    // Apply character type filter
    if (filters.characterType) {
      filtered = filtered.filter(character => {
        const charType = character.characterType?.typeId || 'generic';
        return charType === filters.characterType;
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(character => {
        const category = character.characterType?.category || 'npc';
        return category === filters.category;
      });
    }

    // Apply assignment status filter
    if (filters.assignmentStatus) {
      filtered = filtered.filter(character => {
        const hasNodeAssignments = worldBuilder?.getCharactersAtNode && 
          Object.keys(worldBuilder.worldConfig?.nodePopulations || {}).some(nodeId =>
            (worldBuilder.worldConfig.nodePopulations[nodeId] || []).includes(character.id)
          );
        
        const hasInteractionAssignments = character.assignedInteractions && 
          character.assignedInteractions.length > 0;
        
        const hasAnyAssignments = hasNodeAssignments || hasInteractionAssignments;
        
        switch (filters.assignmentStatus) {
          case 'assigned':
            return hasAnyAssignments;
          case 'unassigned':
            return !hasAnyAssignments;
          case 'node-assigned':
            return hasNodeAssignments;
          case 'interaction-assigned':
            return hasInteractionAssignments;
          default:
            return true;
        }
      });
    }

    // Apply level range filter
    if (filters.minLevel || filters.maxLevel) {
      filtered = filtered.filter(character => {
        const level = character.level || 1;
        const meetsMin = !filters.minLevel || level >= parseInt(filters.minLevel);
        const meetsMax = !filters.maxLevel || level <= parseInt(filters.maxLevel);
        return meetsMin && meetsMax;
      });
    }

    // Apply interaction filter
    if (filters.hasInteractions) {
      filtered = filtered.filter(character => {
        const hasInteractions = character.assignedInteractions && 
          character.assignedInteractions.length > 0;
        return filters.hasInteractions === 'yes' ? hasInteractions : !hasInteractions;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'level':
          aValue = a.level || 1;
          bValue = b.level || 1;
          break;
        case 'type':
          aValue = a.characterType?.typeId || 'generic';
          bValue = b.characterType?.typeId || 'generic';
          break;
        case 'created':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCharacters(filtered);
  }, [characters, searchQuery, filters, sortBy, sortOrder, worldBuilder]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const characterTypes = new Set();
    const categories = new Set();
    
    // Ensure characters is an array before calling forEach
    const safeCharacters = characters || [];
    safeCharacters.forEach(character => {
      const type = character.characterType?.typeId || 'generic';
      const category = character.characterType?.category || 'npc';
      characterTypes.add(type);
      categories.add(category);
    });
    
    return {
      characterTypes: Array.from(characterTypes).sort(),
      categories: Array.from(categories).sort()
    };
  }, [characters]);

  // Handle character deletion
  const handleDeleteCharacter = useCallback(async (characterId) => {
    if (!worldBuilder) return;
    
    try {
      worldBuilder.deleteCharacter(characterId);
      await loadCharacters();
      setShowDeleteConfirm(false);
      setCharacterToDelete(null);
      console.log('Deleted character:', characterId);
    } catch (err) {
      console.error('Failed to delete character:', err);
      setError('Failed to delete character. Please try again.');
    }
  }, [worldBuilder, loadCharacters]);

  // Handle bulk actions
  const handleBulkDelete = useCallback(async () => {
    if (!worldBuilder || selectedCharacters.size === 0) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedCharacters.size} character(s)? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      for (const characterId of selectedCharacters) {
        worldBuilder.deleteCharacter(characterId);
      }
      await loadCharacters();
      setSelectedCharacters(new Set());
      setShowBulkActions(false);
      console.log('Bulk deleted characters:', selectedCharacters.size);
    } catch (err) {
      console.error('Failed to bulk delete characters:', err);
      setError('Failed to delete characters. Please try again.');
    }
  }, [worldBuilder, selectedCharacters, loadCharacters]);

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      characterType: '',
      category: '',
      assignmentStatus: '',
      minLevel: '',
      maxLevel: '',
      hasInteractions: ''
    });
  };

  // Toggle character selection
  const toggleCharacterSelection = (characterId) => {
    setSelectedCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(characterId)) {
        newSet.delete(characterId);
      } else {
        newSet.add(characterId);
      }
      return newSet;
    });
  };

  // Select all filtered characters
  const selectAllFiltered = () => {
    const allIds = new Set(filteredCharacters.map(c => c.id));
    setSelectedCharacters(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCharacters(new Set());
  };

  // Get character assignment info
  const getCharacterAssignments = useCallback((character) => {
    const assignments = {
      nodes: [],
      interactions: character.assignedInteractions || []
    };
    
    if (worldBuilder?.worldConfig?.nodePopulations) {
      Object.entries(worldBuilder.worldConfig.nodePopulations).forEach(([nodeId, characterIds]) => {
        if (characterIds.includes(character.id)) {
          const node = worldBuilder.worldConfig.nodes?.find(n => n.id === nodeId);
          if (node) {
            assignments.nodes.push(node);
          }
        }
      });
    }
    
    return assignments;
  }, [worldBuilder]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading characters...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Error Loading Characters</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <button
                onClick={loadCharacters}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Character Management</h2>
          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
            {filteredCharacters.length} of {characters.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCharacters.size > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
            >
              Actions ({selectedCharacters.size})
            </button>
          )}
          
          <button
            onClick={onCreateCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create Character
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search characters by name, description, race, class, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="name" className="bg-gray-800">Name</option>
            <option value="level" className="bg-gray-800">Level</option>
            <option value="type" className="bg-gray-800">Type</option>
            <option value="created" className="bg-gray-800">Created</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? 
              <SortAsc className="w-4 h-4 text-gray-300" /> : 
              <SortDesc className="w-4 h-4 text-gray-300" />
            }
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 bg-white/10 border border-white/20 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Character Type Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Character Type</label>
                <select
                  value={filters.characterType}
                  onChange={(e) => handleFilterChange('characterType', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="" className="bg-gray-800">All Types</option>
                  {filterOptions.characterTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="" className="bg-gray-800">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Assignment Status</label>
                <select
                  value={filters.assignmentStatus}
                  onChange={(e) => handleFilterChange('assignmentStatus', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="" className="bg-gray-800">All Characters</option>
                  <option value="assigned" className="bg-gray-800">Assigned</option>
                  <option value="unassigned" className="bg-gray-800">Unassigned</option>
                  <option value="node-assigned" className="bg-gray-800">Node Assigned</option>
                  <option value="interaction-assigned" className="bg-gray-800">Interaction Assigned</option>
                </select>
              </div>

              {/* Level Range */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Min Level</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={filters.minLevel}
                  onChange={(e) => handleFilterChange('minLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Max Level</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={filters.maxLevel}
                  onChange={(e) => handleFilterChange('maxLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="20"
                />
              </div>

              {/* Has Interactions Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Has Interactions</label>
                <select
                  value={filters.hasInteractions}
                  onChange={(e) => handleFilterChange('hasInteractions', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="" className="bg-gray-800">Any</option>
                  <option value="yes" className="bg-gray-800">Yes</option>
                  <option value="no" className="bg-gray-800">No</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
              
              <div className="text-sm text-gray-400">
                Showing {filteredCharacters.length} of {characters.length} characters
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedCharacters.size > 0 && (
        <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-orange-300 font-medium">
                {selectedCharacters.size} character(s) selected
              </span>
              <button
                onClick={selectAllFiltered}
                className="text-orange-300 hover:text-orange-200 text-sm"
              >
                Select All ({filteredCharacters.length})
              </button>
              <button
                onClick={clearSelection}
                className="text-orange-300 hover:text-orange-200 text-sm"
              >
                Clear Selection
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character List */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {characters.length === 0 ? 'No Characters Created' : 'No Characters Match Filters'}
          </h3>
          <p className="text-gray-400 mb-4">
            {characters.length === 0 
              ? 'Create your first character to get started with world building.'
              : 'Try adjusting your search query or filters to find characters.'
            }
          </p>
          {characters.length === 0 && (
            <button
              onClick={onCreateCharacter}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Create First Character
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map(character => {
            const assignments = getCharacterAssignments(character);
            const isSelected = selectedCharacters.has(character.id);
            
            return (
              <CharacterCard
                key={character.id}
                character={character}
                assignments={assignments}
                isSelected={isSelected}
                onSelect={() => toggleCharacterSelection(character.id)}
                onEdit={() => onEditCharacter(character)}
                onView={() => onViewCharacter && onViewCharacter(character)}
                onDelete={() => {
                  setCharacterToDelete(character);
                  setShowDeleteConfirm(true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && characterToDelete && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setCharacterToDelete(null);
          }}
          title="Delete Character"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-medium">Confirm Deletion</h3>
                <p className="text-red-300 text-sm">
                  This action cannot be undone. All assignments will be removed.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-white/10 rounded-lg">
              <h4 className="text-white font-medium mb-2">Character to Delete:</h4>
              <p className="text-gray-300">
                <strong>{characterToDelete.name}</strong>
                {characterToDelete.description && (
                  <span className="text-gray-400"> - {characterToDelete.description}</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCharacterToDelete(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCharacter(characterToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Character
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Character Card Component
const CharacterCard = ({ 
  character, 
  assignments, 
  isSelected, 
  onSelect, 
  onEdit, 
  onView, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getCharacterTypeInfo = (character) => {
    const type = character.characterType?.typeId || 'generic';
    const category = character.characterType?.category || 'npc';
    
    const typeIcons = {
      warrior: '⚔️',
      scholar: '📚',
      merchant: '💰',
      noble: '👑',
      priest: '🙏',
      artisan: '🔨',
      rogue: '🗡️',
      generic: '👤'
    };
    
    return {
      icon: typeIcons[type] || '👤',
      label: type.charAt(0).toUpperCase() + type.slice(1),
      category: category.toUpperCase()
    };
  };

  const typeInfo = getCharacterTypeInfo(character);
  const hasAssignments = assignments.nodes.length > 0 || assignments.interactions.length > 0;

  return (
    <div className={`relative p-4 bg-white/10 border rounded-lg transition-all hover:bg-white/15 ${
      isSelected ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/20'
    }`} data-testid={`character-card-${character.id}`}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
        />
      </div>

      {/* Actions Menu */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          aria-label="Character actions menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {showActions && (
          <div className="absolute right-0 top-8 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-10 min-w-[120px]">
            {onView && (
              <button
                onClick={() => {
                  onView();
                  setShowActions(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            )}
            <button
              onClick={() => {
                onEdit();
                setShowActions(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setShowActions(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="mt-6 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{character.name}</h3>
            <p className="text-sm text-gray-400">
              {typeInfo.label} • Level {character.level || 1}
            </p>
          </div>
        </div>

        {/* Description */}
        {character.description && (
          <p className="text-sm text-gray-300 line-clamp-2" data-testid={`character-description-${character.id}`}>
            {character.description}
          </p>
        )}

        {/* Attributes Summary */}
        {character.attributes && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">STR</span>
            <span className="text-white">{character.attributes.strength || 10}</span>
            <span className="text-gray-400">DEX</span>
            <span className="text-white">{character.attributes.dexterity || 10}</span>
            <span className="text-gray-400">INT</span>
            <span className="text-white">{character.attributes.intelligence || 10}</span>
          </div>
        )}

        {/* Assignment Status */}
        <div className="flex items-center justify-between" data-testid={`assignment-status-${character.id}`}>
          <div className="flex items-center gap-2">
            {hasAssignments ? (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Assigned</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {assignments.nodes.length > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{assignments.nodes.length}</span>
              </div>
            )}
            {assignments.interactions.length > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{assignments.interactions.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/20 text-xs text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/20 text-xs text-gray-400 rounded-full">
                +{character.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterManager;