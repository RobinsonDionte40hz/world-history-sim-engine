// src/presentation/pages/RaceManagerPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Copy, Save, X, Download, Upload, Sparkles, Users, Heart, Zap, Shield } from 'lucide-react';
import RacialTraits from '../../domain/value-objects/RacialTraits.js';

/**
 * RaceManagerPage - UI for managing races (built-in and custom)
 * 
 * Features:
 * - Browse built-in races
 * - Create custom races from scratch
 * - Create race variants from existing races
 * - Edit custom races
 * - Delete custom races
 * - Save races as templates
 * - Import/export race collections
 * - Race comparison tool
 */
const RaceManagerPage = ({ raceManager, worldBuilder, onClose }) => {
  const [view, setView] = useState('browse'); // 'browse', 'create', 'edit', 'compare'
  const [selectedRace, setSelectedRace] = useState(null);
  const [races, setRaces] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'builtin', 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [compareRaces, setCompareRaces] = useState([]);
  const [editingRace, setEditingRace] = useState(null);

  // Load races
  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = () => {
    if (raceManager) {
      const allRaces = raceManager.getAllRaces(worldBuilder?.worldConfig?.name);
      setRaces(allRaces);
    } else {
      // Fallback to built-in races only
      const builtInRaces = RacialTraits.getAllRaces().map(race => ({ ...race, isCustom: false }));
      setRaces(builtInRaces);
    }
  };

  // Filter and search races
  const filteredRaces = useMemo(() => {
    return races.filter(race => {
      // Apply filter
      if (filter === 'builtin' && race.isCustom) return false;
      if (filter === 'custom' && !race.isCustom) return false;

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          race.name.toLowerCase().includes(query) ||
          (race.description && race.description.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [races, filter, searchQuery]);

  // Calculate race power level (for comparison)
  const calculatePowerLevel = (race) => {
    const attrTotal = Object.values(race.attributeModifiers || {}).reduce((sum, val) => sum + val, 0);
    const skillTotal = Object.values(race.skillModifiers || {}).reduce((sum, val) => sum + val, 0);
    const featureCount = (race.features || []).length;
    return attrTotal + skillTotal * 0.5 + featureCount * 2;
  };

  // Handle race creation
  const handleCreateRace = (raceData) => {
    if (!raceManager) {
      alert('Race Manager not available');
      return;
    }

    try {
      const raceId = raceManager.registerCustomRace(raceData);
      
      // Add to world if worldBuilder is available
      if (worldBuilder) {
        worldBuilder.registerCustomRace(raceData);
      }

      loadRaces();
      setView('browse');
      alert(`Race "${raceData.name}" created successfully!`);
    } catch (error) {
      alert(`Failed to create race: ${error.message}`);
    }
  };

  // Handle race update
  const handleUpdateRace = (raceId, updates) => {
    if (!raceManager) return;

    try {
      raceManager.updateCustomRace(raceId, updates);
      loadRaces();
      setView('browse');
      setEditingRace(null);
      alert('Race updated successfully!');
    } catch (error) {
      alert(`Failed to update race: ${error.message}`);
    }
  };

  // Handle race deletion
  const handleDeleteRace = (raceId) => {
    if (!raceManager) return;
    if (!confirm('Are you sure you want to delete this custom race?')) return;

    try {
      raceManager.deleteCustomRace(raceId);
      if (worldBuilder) {
        worldBuilder.removeCustomRace(raceId);
      }
      loadRaces();
      alert('Race deleted successfully!');
    } catch (error) {
      alert(`Failed to delete race: ${error.message}`);
    }
  };

  // Handle create variant
  const handleCreateVariant = (baseRaceId) => {
    const baseRace = races.find(r => r.id === baseRaceId);
    if (!baseRace) return;

    setEditingRace({
      name: `${baseRace.name} Variant`,
      description: `A variant of ${baseRace.name}`,
      attributeModifiers: { ...(baseRace.attributeModifiers || {}) },
      skillModifiers: { ...(baseRace.skillModifiers || {}) },
      features: [...(baseRace.features || [])],
      lifespan: { ...(baseRace.lifespan || {}) },
      subraces: [],
      baseRaceId: baseRaceId
    });
    setView('create');
  };

  // Render race card
  const RaceCard = ({ race }) => {
    const powerLevel = calculatePowerLevel(race);
    const isInCompare = compareRaces.some(r => r.id === race.id);

    return (
      <div 
        className={`bg-white/5 border rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer ${
          selectedRace?.id === race.id ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-white/20'
        } ${isInCompare ? 'ring-2 ring-purple-500/50' : ''}`}
        onClick={() => setSelectedRace(race)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{race.name}</h3>
            {race.isCustom && (
              <span className="inline-block px-2 py-0.5 bg-indigo-600/30 text-indigo-300 text-xs rounded">
                Custom
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {race.isCustom && raceManager && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRace(race);
                    setView('edit');
                  }}
                  className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRace(race.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateVariant(race.id);
              }}
              className="p-1 text-green-400 hover:text-green-300 transition-colors"
              title="Create Variant"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {race.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{race.description}</p>
        )}

        {/* Attribute Modifiers */}
        {Object.keys(race.attributeModifiers || {}).length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">Attributes:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(race.attributeModifiers).map(([attr, mod]) => (
                <span key={attr} className="px-2 py-0.5 bg-blue-600/20 text-blue-300 text-xs rounded">
                  {attr.slice(0, 3).toUpperCase()} {mod > 0 ? '+' : ''}{mod}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {(race.features || []).length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1">Features:</p>
            <div className="flex flex-wrap gap-1">
              {race.features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs rounded">
                  {feature}
                </span>
              ))}
              {race.features.length > 3 && (
                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs rounded">
                  +{race.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Power Level */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <span className="text-xs text-gray-500">Power Level:</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-semibold">{powerLevel.toFixed(1)}</span>
          </div>
        </div>

        {/* Compare checkbox */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInCompare}
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.checked) {
                  if (compareRaces.length < 4) {
                    setCompareRaces([...compareRaces, race]);
                  } else {
                    alert('Maximum 4 races can be compared');
                  }
                } else {
                  setCompareRaces(compareRaces.filter(r => r.id !== race.id));
                }
              }}
              className="rounded border-gray-600"
            />
            <span className="text-xs text-gray-400">Add to comparison</span>
          </label>
        </div>
      </div>
    );
  };

  // Render race editor (create/edit)
  const RaceEditor = ({ initialRace = null, onSave, onCancel }) => {
    const [raceData, setRaceData] = useState(initialRace || {
      name: '',
      description: '',
      attributeModifiers: {},
      skillModifiers: {},
      features: [],
      lifespan: {
        maturity: 18,
        middleAge: 40,
        old: 60,
        venerable: 80,
        maximum: 100
      },
      subraces: [],
      appearance: {},
      culture: {}
    });

    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {initialRace ? 'Edit Race' : 'Create New Race'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Race Name *
            </label>
            <input
              type="text"
              value={raceData.name}
              onChange={(e) => setRaceData({ ...raceData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Half-Elves, Dragonborn, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={raceData.description}
              onChange={(e) => setRaceData({ ...raceData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Describe the race's characteristics, culture, and traits..."
            />
          </div>
        </div>

        {/* Attribute Modifiers */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Attribute Modifiers</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {attributes.map(attr => (
              <div key={attr}>
                <label className="block text-sm text-gray-400 mb-1 capitalize">{attr}</label>
                <input
                  type="number"
                  value={raceData.attributeModifiers[attr] || 0}
                  onChange={(e) => setRaceData({
                    ...raceData,
                    attributeModifiers: {
                      ...raceData.attributeModifiers,
                      [attr]: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="-5"
                  max="5"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Racial Features</h3>
          <div className="space-y-2">
            {(raceData.features || []).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...raceData.features];
                    newFeatures[idx] = e.target.value;
                    setRaceData({ ...raceData, features: newFeatures });
                  }}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Darkvision, Keen Senses, etc."
                />
                <button
                  onClick={() => setRaceData({
                    ...raceData,
                    features: raceData.features.filter((_, i) => i !== idx)
                  })}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setRaceData({
                ...raceData,
                features: [...(raceData.features || []), '']
              })}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>
          </div>
        </div>

        {/* Lifespan */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Lifespan (in years)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['maturity', 'middleAge', 'old', 'venerable', 'maximum'].map(stage => (
              <div key={stage}>
                <label className="block text-sm text-gray-400 mb-1 capitalize">
                  {stage.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  value={raceData.lifespan[stage]}
                  onChange={(e) => setRaceData({
                    ...raceData,
                    lifespan: {
                      ...raceData.lifespan,
                      [stage]: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/20">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!raceData.name) {
                alert('Race name is required');
                return;
              }
              onSave(raceData);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {initialRace ? 'Save Changes' : 'Create Race'}
          </button>
        </div>
      </div>
    );
  };

  // Render race comparison view
  const RaceComparison = () => {
    if (compareRaces.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Select races to compare by checking the boxes on race cards</p>
          <p className="text-sm mt-2">You can compare up to 4 races at once</p>
        </div>
      );
    }

    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Race Comparison</h2>
          <button
            onClick={() => setCompareRaces([])}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Property</th>
                {compareRaces.map(race => (
                  <th key={race.id} className="text-left py-3 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{race.name}</span>
                      <button
                        onClick={() => setCompareRaces(compareRaces.filter(r => r.id !== race.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Attributes */}
              <tr className="border-b border-white/10">
                <td colSpan={compareRaces.length + 1} className="py-2 px-4 text-gray-400 font-semibold bg-white/5">
                  Attributes
                </td>
              </tr>
              {attributes.map(attr => (
                <tr key={attr} className="border-b border-white/10">
                  <td className="py-2 px-4 text-gray-400 capitalize">{attr}</td>
                  {compareRaces.map(race => {
                    const mod = race.attributeModifiers?.[attr] || 0;
                    return (
                      <td key={race.id} className="py-2 px-4">
                        <span className={mod > 0 ? 'text-green-400' : mod < 0 ? 'text-red-400' : 'text-gray-400'}>
                          {mod > 0 ? '+' : ''}{mod}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Features */}
              <tr className="border-b border-white/10">
                <td colSpan={compareRaces.length + 1} className="py-2 px-4 text-gray-400 font-semibold bg-white/5">
                  Features
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2 px-4 text-gray-400">Count</td>
                {compareRaces.map(race => (
                  <td key={race.id} className="py-2 px-4 text-white">
                    {(race.features || []).length}
                  </td>
                ))}
              </tr>

              {/* Lifespan */}
              <tr className="border-b border-white/10">
                <td colSpan={compareRaces.length + 1} className="py-2 px-4 text-gray-400 font-semibold bg-white/5">
                  Lifespan
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2 px-4 text-gray-400">Maximum</td>
                {compareRaces.map(race => (
                  <td key={race.id} className="py-2 px-4 text-white">
                    {race.lifespan?.maximum || 'N/A'} years
                  </td>
                ))}
              </tr>

              {/* Power Level */}
              <tr className="border-b border-white/10">
                <td colSpan={compareRaces.length + 1} className="py-2 px-4 text-gray-400 font-semibold bg-white/5">
                  Power Level
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-gray-400">Overall</td>
                {compareRaces.map(race => (
                  <td key={race.id} className="py-2 px-4">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">
                        {calculatePowerLevel(race).toFixed(1)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              Race Manager
            </h1>
            <p className="text-gray-400">Manage built-in and custom races for your world</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/20">
          <button
            onClick={() => setView('browse')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'browse' || view === 'edit'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Browse Races
          </button>
          <button
            onClick={() => {
              setEditingRace(null);
              setView('create');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'create'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create New Race
          </button>
          <button
            onClick={() => setView('compare')}
            className={`px-4 py-2 font-medium transition-colors ${
              view === 'compare'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Compare Races {compareRaces.length > 0 && `(${compareRaces.length})`}
          </button>
        </div>

        {/* Content */}
        {view === 'browse' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search races..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  All ({races.length})
                </button>
                <button
                  onClick={() => setFilter('builtin')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'builtin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Built-in ({races.filter(r => !r.isCustom).length})
                </button>
                <button
                  onClick={() => setFilter('custom')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'custom'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  Custom ({races.filter(r => r.isCustom).length})
                </button>
              </div>
            </div>

            {/* Race Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRaces.map(race => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>

            {filteredRaces.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No races found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <RaceEditor
            initialRace={editingRace}
            onSave={handleCreateRace}
            onCancel={() => {
              setView('browse');
              setEditingRace(null);
            }}
          />
        )}

        {view === 'edit' && editingRace && (
          <RaceEditor
            initialRace={editingRace}
            onSave={(data) => handleUpdateRace(editingRace.id, data)}
            onCancel={() => {
              setView('browse');
              setEditingRace(null);
            }}
          />
        )}

        {view === 'compare' && <RaceComparison />}
      </div>
    </div>
  );
};

export default RaceManagerPage;
