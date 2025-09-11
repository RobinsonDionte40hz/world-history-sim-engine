import React, { useState, useEffect } from 'react';
import searchEngine from '../../application/services/SearchEngine';
import './FilterPresets.css';

const FilterPresets = ({ onPresetApply, onClose, currentQuery }) => {
  const [presets, setPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    const loadedPresets = searchEngine.getFilterPresets();
    setPresets(loadedPresets);
  };

  const handleApplyPreset = (preset) => {
    onPresetApply(preset.query);
    onClose();
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    if (!currentQuery) {
      alert('No current search query to save');
      return;
    }

    try {
      searchEngine.saveFilterPreset(newPresetName.trim(), currentQuery);
      setNewPresetName('');
      setShowCreateForm(false);
      loadPresets();
    } catch (error) {
      alert('Error saving preset: ' + error.message);
    }
  };

  const handleDeletePreset = (presetName) => {
    if (window.confirm(`Are you sure you want to delete the preset "${presetName}"?`)) {
      searchEngine.deleteFilterPreset(presetName);
      loadPresets();
    }
  };

  const formatPresetDescription = (query) => {
    const parts = [];

    if (query.filters && query.filters.length > 0) {
      parts.push(`${query.filters.length} filter${query.filters.length !== 1 ? 's' : ''}`);
    }

    if (query.resultTypes && query.resultTypes.length > 0) {
      const types = query.resultTypes.map(type =>
        type.charAt(0).toUpperCase() + type.slice(1)
      );
      parts.push(`Types: ${types.join(', ')}`);
    }

    if (query.sortBy) {
      parts.push(`Sort: ${query.sortBy}`);
    }

    return parts.join(' • ');
  };

  const getPresetStats = (preset) => {
    return {
      usageCount: preset.usageCount || 0,
      createdDate: new Date(preset.createdAt).toLocaleDateString(),
      filterCount: preset.query.filters ? preset.query.filters.length : 0
    };
  };

  return (
    <div className="filter-presets">
      <div className="presets-header">
        <h3>Filter Presets</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="presets-content">
        {/* Create New Preset */}
        <div className="create-preset-section">
          <button
            className="create-preset-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Preset'}
          </button>

          {showCreateForm && (
            <div className="create-preset-form">
              <input
                type="text"
                placeholder="Enter preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="preset-name-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
              <button
                className="save-preset-button"
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
              >
                Save Preset
              </button>
            </div>
          )}
        </div>

        {/* Presets List */}
        <div className="presets-list">
          {presets.length === 0 ? (
            <div className="no-presets">
              <div className="no-presets-icon">📋</div>
              <p>No saved presets yet</p>
              <p className="no-presets-hint">
                Create presets to quickly apply your favorite filter combinations
              </p>
            </div>
          ) : (
            presets.map((preset) => {
              const stats = getPresetStats(preset);
              return (
                <div key={preset.name} className="preset-item">
                  <div className="preset-info">
                    <div className="preset-header">
                      <h4 className="preset-name">{preset.name}</h4>
                      <div className="preset-actions">
                        <button
                          className="apply-preset-button"
                          onClick={() => handleApplyPreset(preset)}
                          title="Apply this preset"
                        >
                          Apply
                        </button>
                        <button
                          className="delete-preset-button"
                          onClick={() => handleDeletePreset(preset.name)}
                          title="Delete this preset"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <p className="preset-description">
                      {formatPresetDescription(preset.query)}
                    </p>

                    <div className="preset-stats">
                      <span className="stat-item">
                        Used {stats.usageCount} time{stats.usageCount !== 1 ? 's' : ''}
                      </span>
                      <span className="stat-item">
                        Created {stats.createdDate}
                      </span>
                      <span className="stat-item">
                        {stats.filterCount} filter{stats.filterCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export { FilterPresets };
