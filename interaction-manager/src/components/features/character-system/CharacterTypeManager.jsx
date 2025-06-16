import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Info, ChevronDown, ChevronUp, Tag, Users, Star, Heart, Brain, Search, Grid, List } from 'lucide-react';
import { RaceSystem } from '../../../systems/character/RaceSystem';

const CharacterTypeManager = () => {
  const [characterTypes, setCharacterTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [raceSystem] = useState(new RaceSystem());
  const [expandedType, setExpandedType] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load character types from localStorage on mount
  useEffect(() => {
    const savedTypes = localStorage.getItem('characterTypes');
    if (savedTypes) {
      setCharacterTypes(JSON.parse(savedTypes));
    }
  }, []);

  // Save character types to localStorage when they change
  useEffect(() => {
    localStorage.setItem('characterTypes', JSON.stringify(characterTypes));
  }, [characterTypes]);

  const addCharacterType = () => {
    const newType = {
      id: Date.now().toString(),
      name: 'New Character Type',
      description: '',
      color: '#4A90E2',
      category: 'default',
      race: null,
      personalityTraits: [],
      cognitiveTraits: [],
      emotionalTendencies: [],
      attributes: {},
      skills: [],
      tags: []
    };
    setCharacterTypes([...characterTypes, newType]);
    setEditingType(newType);
    setIsEditing(true);
  };

  const editCharacterType = (type) => {
    setEditingType(type);
    setIsEditing(true);
  };

  const deleteCharacterType = (id) => {
    if (window.confirm('Are you sure you want to delete this character type?')) {
      setCharacterTypes(characterTypes.filter(type => type.id !== id));
    }
  };

  const handleSave = (updatedType) => {
    setCharacterTypes(characterTypes.map(type => 
      type.id === updatedType.id ? updatedType : type
    ));
    setIsEditing(false);
    setEditingType(null);
  };

  const handleRaceSelect = (typeId, raceId, subraceName = null) => {
    const race = raceSystem.getRace(raceId);
    const updatedTypes = characterTypes.map(type => {
      if (type.id === typeId) {
        return {
          ...type,
          race: {
            id: race.id,
            name: race.name,
            description: race.description,
            subrace: subraceName ? raceSystem.getSubrace(raceId, subraceName) : null,
            traits: race.traits,
            lifespan: race.lifespan
          }
        };
      }
      return type;
    });
    setCharacterTypes(updatedTypes);
  };

  const toggleExpand = (typeId) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  const filteredTypes = characterTypes
    .filter(type => 
      type.name.toLowerCase().includes(filter.toLowerCase()) ||
      type.description.toLowerCase().includes(filter.toLowerCase()) ||
      type.race?.name.toLowerCase().includes(filter.toLowerCase()) ||
      type.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'race':
          return (a.race?.name || '').localeCompare(b.race?.name || '');
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const renderCharacterTypeCard = (type) => {
    const isExpanded = expandedType === type.id;

    return (
      <div key={type.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div 
          className="p-4 cursor-pointer"
          onClick={() => toggleExpand(type.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{type.name}</h3>
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{type.description}</p>
              
              {/* Tags */}
              {type.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editCharacterType(type);
                }}
                className="text-amber-600 hover:text-amber-700"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCharacterType(type.id);
                }}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            {/* Race Information */}
            {type.race && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Users size={16} />
                  <span>Race: {type.race.name}</span>
                  {type.race.subrace && (
                    <span className="text-gray-500">({type.race.subrace.name})</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.race.traits?.map(trait => (
                    <span key={trait.name} className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full">
                      {trait.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {type.personalityTraits?.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Heart size={16} />
                  <span>Personality Traits</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.personalityTraits.map(trait => (
                    <span key={trait.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {trait.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cognitive Traits */}
            {type.cognitiveTraits?.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Brain size={16} />
                  <span>Cognitive Traits</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.cognitiveTraits.map(trait => (
                    <span key={trait.id} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {trait.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Tendencies */}
            {type.emotionalTendencies?.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Star size={16} />
                  <span>Emotional Tendencies</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.emotionalTendencies.map(tendency => (
                    <span key={tendency.id} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {tendency.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {Object.keys(type.attributes || {}).length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Attributes</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(type.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {type.skills?.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editingType) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Edit Character Type</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                value={editingType.name}
                onChange={e => setEditingType({ ...editingType, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={editingType.description}
                onChange={e => setEditingType({ ...editingType, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
              <input
                type="color"
                value={editingType.color}
                onChange={e => setEditingType({ ...editingType, color: e.target.value })}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <input
                type="text"
                value={editingType.category}
                onChange={e => setEditingType({ ...editingType, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Race Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Race</label>
              <select
                value={editingType.race?.id || ''}
                onChange={e => handleRaceSelect(editingType.id, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a race</option>
                {raceSystem.getAllRaces().map(race => (
                  <option key={race.id} value={race.id}>{race.name}</option>
                ))}
              </select>
            </div>

            {/* Subrace Selection */}
            {editingType.race && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subrace</label>
                <select
                  value={editingType.race.subrace?.name || ''}
                  onChange={e => handleRaceSelect(editingType.id, editingType.race.id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a subrace</option>
                  {raceSystem.getRace(editingType.race.id).subraces.map(subrace => (
                    <option key={subrace.name} value={subrace.name}>{subrace.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
              <input
                type="text"
                value={editingType.tags?.join(', ') || ''}
                onChange={e => setEditingType({ 
                  ...editingType, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                })}
                placeholder="Enter tags separated by commas"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingType)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Character Types</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage character types and their attributes
          </p>
        </div>
        <button
          onClick={addCharacterType}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-2"
        >
          <Plus size={16} />
          Add Character Type
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-64">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search character types..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="block w-40 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="race">Sort by Race</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}
            title="Grid View"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Character Type List/Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredTypes.map(type => renderCharacterTypeCard(type))}
      </div>

      {/* Edit Form Modal */}
      {isEditing && renderEditForm()}
    </div>
  );
};

export default CharacterTypeManager; 