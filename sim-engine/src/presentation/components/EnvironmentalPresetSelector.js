import React, { useState, useMemo } from 'react';
import EnvironmentalPresetService from '../../domain/services/EnvironmentalPresetService';
import { TERRAIN_DESCRIPTIONS } from '../../shared/constants/TerrainTypes';
import { CLIMATE_DESCRIPTIONS } from '../../shared/constants/ClimateTypes';
import { Sparkles, Mountain, TreePine, Waves, Flame, Snowflake, Search, Filter, Star } from 'lucide-react';

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
  const [showDetails, setShowDetails] = useState({});

  // Get all presets and categories
  const allPresets = useMemo(() => EnvironmentalPresetService.getPresets(), []);
  const categories = useMemo(() => EnvironmentalPresetService.getPresetCategories(), []);

  // Get recommendations if enabled
  const recommendations = useMemo(() => {
    if (!showRecommendations || !currentNodeData) return [];
    return EnvironmentalPresetService.getPresetRecommendations(currentNodeData);
  }, [currentNodeData, showRecommendations]);

  // Filter presets based on search and category
  const filteredPresets = useMemo(() => {
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
  }, [allPresets, selectedCategory, searchTerm]);

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

  // Toggle details for a preset
  const toggleDetails = (presetId) => {
    setShowDetails(prev => ({
      ...prev,
      [presetId]: !prev[presetId]
    }));
  };

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  // Handle preset preview
  const handlePresetPreview = (preset) => {
    if (onPresetPreview) {
      onPresetPreview(preset);
    }
  };

  // Render hazard chips
  const renderHazards = (hazards) => {
    if (!hazards || hazards.length === 0) {
      return <span className="text-green-400 text-xs">No Hazards</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {hazards.map((hazard, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30"
            title={hazard.description}
          >
            {hazard.type} ({hazard.severity})
          </span>
        ))}
      </div>
    );
  };

  // Render environmental stats
  const renderEnvironmentalStats = (environment) => {
    const stats = [
      { label: 'Shelter', value: environment.shelterQuality, color: 'blue' },
      { label: 'Air Quality', value: environment.airQuality, color: 'green' },
      { label: 'Water', value: environment.waterAvailability, color: 'cyan' },
      { label: 'Density', value: environment.density, color: 'purple' }
    ];

    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{stat.label}:</span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${stat.color}-500 transition-all duration-300`}
                  style={{ width: `${stat.value * 100}%` }}
                />
              </div>
              <span className="text-xs text-white">{Math.round(stat.value * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render preset card
  const renderPresetCard = (preset, isRecommended = false) => {
    const IconComponent = getPresetIcon(preset);
    const isSelected = selectedPresetId === preset.id;
    const isExpanded = showDetails[preset.id];

    return (
      <div
        key={preset.id}
        className={`
          relative border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer
          ${isSelected 
            ? 'border-blue-500 bg-blue-500/20' 
            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
          }
          ${isRecommended ? 'ring-2 ring-yellow-500/50' : ''}
        `}
        onClick={() => handlePresetSelect(preset)}
      >
        {/* Recommended badge */}
        {isRecommended && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Recommended
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${isSelected ? 'bg-blue-600' : 'bg-white/10'}
            `}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{preset.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{preset.category}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePresetPreview(preset);
              }}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10"
              title="Preview"
            >
              Preview
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDetails(preset.id);
              }}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10"
            >
              {isExpanded ? 'Hide' : 'Details'}
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-3">{preset.description}</p>

        {/* Environment summary */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">
            {TERRAIN_DESCRIPTIONS[preset.environment.terrain]}
          </span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
            {CLIMATE_DESCRIPTIONS[preset.environment.climate]}
          </span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
            {preset.environment.temperature}°C
          </span>
        </div>

        {/* Hazards */}
        {renderHazards(preset.environment.hazards)}

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/20">
            {renderEnvironmentalStats(preset.environment)}
            
            <div className="mt-3 text-xs text-gray-400">
              <p><strong>Size:</strong> {preset.nodeProperties.size}</p>
              <p><strong>Lighting:</strong> {preset.environment.lighting}</p>
              <p><strong>Humidity:</strong> {Math.round(preset.environment.humidity * 100)}%</p>
              <p><strong>Wind:</strong> {Math.round(preset.environment.windStrength * 100)}%</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Environmental Presets</h3>
        <p className="text-sm text-gray-400">
          Choose a preset to quickly configure environmental properties for your node.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
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
        </div>
      </div>

      {/* Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Recommended for Your Node
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map(rec => 
              renderPresetCard(rec.preset, true)
            )}
          </div>
        </div>
      )}

      {/* All Presets Section */}
      <div>
        <h4 className="font-medium text-white mb-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </ul>
      </div>
    </div>
  );
};

export default EnvironmentalPresetSelector;
