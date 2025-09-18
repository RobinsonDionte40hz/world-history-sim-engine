import React, { useState, useMemo } from 'react';
import EnvironmentalPresetService from '../../domain/services/EnvironmentalPresetService';
import { TERRAIN_DESCRIPTIONS } from '../../shared/constants/TerrainTypes';
import { CLIMATE_DESCRIPTIONS } from '../../shared/constants/ClimateTypes';
import { Sparkles, Mountain, TreePine, Waves, Flame, Snowflake, Search, Filter, Star, Plus, Save } from 'lucide-react';

/**
 * EnvironmentalPresetSelector - Component for selecting and applying environmental presets
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentNodeData - Current node data for recommendations
 * @param {Function} props.onPresetSelect - Callback when a preset is selected
 * @param {Function} props.onPresetPreview - Callback for preset preview (optional)
 * @param {string} props.selectedPresetId - Currently selected preset ID (optional)
 * @param {boolean} props.showRecommendations - Whether to show recommendations (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const EnvironmentalPresetSelector = ({
  currentNodeData = {},
  onPresetSelect,
  onPresetPreview,
  selectedPresetId = null,
  showRecommendations = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [customPresetForm, setCustomPresetForm] = useState({
    name: '',
    description: '',
    category: 'custom'
  });
  const [customPresets, setCustomPresets] = useState(() => {
    // Load custom presets from localStorage
    try {
      const saved = localStorage.getItem('worldHistorySim_customPresets');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load custom presets:', error);
      return {};
    }
  });

  // Get all presets and categories
  const categories = useMemo(() => {
    const builtInCategories = EnvironmentalPresetService.getPresetCategories();
    const customCategories = Object.values(customPresets).map(p => p.category);
    const allCategories = new Set([...builtInCategories, ...customCategories]);
    return Array.from(allCategories).sort();
  }, [customPresets]);

  // Get recommendations if enabled
  const recommendations = useMemo(() => {
    if (!showRecommendations || !currentNodeData) return [];
    return EnvironmentalPresetService.getPresetRecommendations(currentNodeData);
  }, [currentNodeData, showRecommendations]);

  // Filter presets based on search and category
  const filteredPresets = useMemo(() => {
    // Combine built-in and custom presets
    const allPresets = { ...EnvironmentalPresetService.getPresets(), ...customPresets };
    
    let filtered = Object.values(allPresets);

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(preset => preset.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(preset =>
        preset.name.toLowerCase().includes(term) ||
        preset.description.toLowerCase().includes(term) ||
        preset.environment.terrain.toLowerCase().includes(term) ||
        preset.environment.climate.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm, customPresets]);

  // Get icon for preset based on terrain/climate
  const getPresetIcon = (preset) => {
    const terrain = preset.environment.terrain;
    const climate = preset.environment.climate;

    if (terrain === 'mountains') return Mountain;
    if (terrain === 'forest') return TreePine;
    if (terrain === 'coastal') return Waves;
    if (terrain === 'desert' || climate === 'arid') return Flame;
    if (climate === 'arctic' || terrain === 'tundra') return Snowflake;
    if (preset.environment.lighting === 'magical') return Sparkles;
    
    return Mountain; // Default icon
  };

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  // Handle creating custom preset
  const handleCreateCustomPreset = () => {
    try {
      if (!customPresetForm.name.trim() || !customPresetForm.description.trim()) {
        alert('Please provide both name and description for the custom preset.');
        return;
      }

      if (!currentNodeData.environment) {
        alert('No environmental data available to create preset from.');
        return;
      }

      const customPreset = EnvironmentalPresetService.createCustomPreset(
        customPresetForm.name.trim(),
        customPresetForm.description.trim(),
        currentNodeData,
        customPresetForm.category
      );

      // Add to custom presets
      const updatedCustomPresets = {
        ...customPresets,
        [customPreset.id]: customPreset
      };

      setCustomPresets(updatedCustomPresets);

      // Save to localStorage
      try {
        localStorage.setItem('worldHistorySim_customPresets', JSON.stringify(updatedCustomPresets));
      } catch (error) {
        console.warn('Failed to save custom presets to localStorage:', error);
      }

      // Reset form and close modal
      setCustomPresetForm({
        name: '',
        description: '',
        category: 'custom'
      });
      setShowCreateModal(false);

      alert(`Custom preset "${customPreset.name}" created successfully!`);

    } catch (error) {
      console.error('Failed to create custom preset:', error);
      alert(`Failed to create custom preset: ${error.message}`);
    }
  };

  // Handle deleting custom preset
  const handleDeleteCustomPreset = (presetId) => {
    if (!customPresets[presetId]) return;
    setPresetToDelete(presetId);
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const confirmDeletePreset = () => {
    if (!presetToDelete) return;

    const updatedCustomPresets = { ...customPresets };
    delete updatedCustomPresets[presetToDelete];

    setCustomPresets(updatedCustomPresets);

    // Save to localStorage
    try {
      localStorage.setItem('worldHistorySim_customPresets', JSON.stringify(updatedCustomPresets));
    } catch (error) {
      console.warn('Failed to save custom presets to localStorage:', error);
    }

    // Reset state
    setShowDeleteConfirm(false);
    setPresetToDelete(null);
  };

  // Cancel deletion
  const cancelDeletePreset = () => {
    setShowDeleteConfirm(false);
    setPresetToDelete(null);
  };

  // Render preset card
  const renderPresetCard = (preset, isRecommended = false) => {
    const IconComponent = getPresetIcon(preset);
    const isSelected = selectedPresetId === preset.id;
    const isCustom = preset.isCustom || customPresets[preset.id];

    return (
      <div
        key={preset.id}
        className={`
          relative border rounded-lg p-3 transition-all duration-200 cursor-pointer hover:shadow-md
          ${isSelected 
            ? 'border-blue-500 bg-blue-500/20' 
            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
          }
          ${isRecommended ? 'ring-1 ring-yellow-500/50' : ''}
        `}
        onClick={() => handlePresetSelect(preset)}
      >
        {/* Recommended badge */}
        {isRecommended && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
          </div>
        )}

        {/* Custom badge */}
        {isCustom && (
          <div className="absolute -top-1 -left-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            Custom
          </div>
        )}

        {/* Compact Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded ${isSelected ? 'bg-blue-600' : 'bg-white/10'}`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">{preset.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{preset.category}</p>
          </div>
          {/* Delete button for custom presets */}
          {isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCustomPreset(preset.id);
              }}
              className="text-red-400 hover:text-red-300 text-xs p-1"
              title="Delete custom preset"
            >
              ×
            </button>
          )}
        </div>

        {/* Compact Environment summary */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 truncate">
            {TERRAIN_DESCRIPTIONS[preset.environment.terrain]}
          </span>
          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30 truncate">
            {CLIMATE_DESCRIPTIONS[preset.environment.climate]}
          </span>
        </div>

        {/* Hazards - compact */}
        {preset.environment.hazards && preset.environment.hazards.length > 0 && (
          <div className="text-xs text-red-400">
            ⚠️ {preset.environment.hazards.length} hazard{preset.environment.hazards.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Environmental Presets</h3>
        <p className="text-sm text-gray-400">
          Choose a preset to quickly configure environmental properties for your node.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all" className="bg-gray-800">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800 capitalize">
                {category}
              </option>
            ))}
          </select>

          {/* Create Custom Preset Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
            title="Create custom preset from current node"
          >
            <Plus className="w-3 h-3" />
            Create Custom
          </button>
        </div>
      </div>

      {/* Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Recommended for Your Node
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {recommendations.slice(0, 4).map(rec => 
              renderPresetCard(rec.preset, true)
            )}
          </div>
        </div>
      )}

      {/* All Presets Section */}
      <div>
        <h4 className="font-medium text-white mb-2">
          All Presets {filteredPresets.length > 0 && `(${filteredPresets.length})`}
        </h4>
        
        {filteredPresets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No presets found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {filteredPresets.map(preset => renderPresetCard(preset, false))}
          </div>
        )}
      </div>

      {/* Usage Tips */}
      <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <h4 className="font-medium text-white mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Recommended presets are based on your current node type and properties</li>
          <li>Click "Preview" to see how a preset will affect your node before applying</li>
          <li>You can modify preset values after applying them to your node</li>
          <li>Use the search to find presets by name, terrain, or climate type</li>
          <li>Create custom presets to save your favorite environmental configurations</li>
        </ul>
      </div>

      {/* Create Custom Preset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-6 pt-12">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-6xl h-[70vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/20 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Save className="w-6 h-6" />
                Create Custom Preset
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Preset Name *
                      </label>
                      <input
                        type="text"
                        value={customPresetForm.name}
                        onChange={(e) => setCustomPresetForm({ ...customPresetForm, name: e.target.value })}
                        placeholder="Enter preset name..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Description *
                      </label>
                      <textarea
                        value={customPresetForm.description}
                        onChange={(e) => setCustomPresetForm({ ...customPresetForm, description: e.target.value })}
                        placeholder="Describe this environmental preset..."
                        rows={5}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Category
                      </label>
                      <select
                        value={customPresetForm.category}
                        onChange={(e) => setCustomPresetForm({ ...customPresetForm, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 text-lg"
                      >
                        <option value="custom" className="bg-gray-800">Custom</option>
                        <option value="settlement" className="bg-gray-800">Settlement</option>
                        <option value="wilderness" className="bg-gray-800">Wilderness</option>
                        <option value="dungeon" className="bg-gray-800">Dungeon</option>
                        <option value="landmark" className="bg-gray-800">Landmark</option>
                        <option value="resource" className="bg-gray-800">Resource</option>
                        <option value="sacred" className="bg-gray-800">Sacred</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    {/* Current Node Preview */}
                    {currentNodeData.environment && (
                      <div className="p-6 bg-white/5 rounded-lg border border-white/10 h-fit">
                        <h4 className="text-lg font-medium text-white mb-4">Based on current node:</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Terrain:</span>
                            <span className="text-white text-lg">{TERRAIN_DESCRIPTIONS[currentNodeData.environment.terrain] || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Climate:</span>
                            <span className="text-white text-lg">{CLIMATE_DESCRIPTIONS[currentNodeData.environment.climate] || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Temperature:</span>
                            <span className="text-white text-lg">{currentNodeData.environment.temperature || 15}°C</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Lighting:</span>
                            <span className="text-white text-lg">{currentNodeData.environment.lighting || 'Normal'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Air Quality:</span>
                            <span className="text-white text-lg">{Math.round((currentNodeData.environment.airQuality || 0.8) * 100)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Water Availability:</span>
                            <span className="text-white text-lg">{Math.round((currentNodeData.environment.waterAvailability || 0.7) * 100)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-gray-400 font-medium">Shelter Quality:</span>
                            <span className="text-white text-lg">{Math.round((currentNodeData.environment.shelterQuality || 0.7) * 100)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400 font-medium">Density:</span>
                            <span className="text-white text-lg">{Math.round((currentNodeData.environment.density || 0.5) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/20 flex justify-end gap-4 flex-shrink-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomPreset}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-lg"
              >
                <Save className="w-5 h-5" />
                Create Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && presetToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-sm mx-4">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Delete Custom Preset</h3>
            </div>

            <div className="p-4">
              <p className="text-gray-300">
                Are you sure you want to delete the custom preset <strong className="text-white">"{customPresets[presetToDelete].name}"</strong>?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="p-4 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={cancelDeletePreset}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePreset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalPresetSelector;
