import React from 'react';
import { Users, Eye, Rocket, Settings, Copy, Trash2 } from 'lucide-react';

/**
 * BulkControls - Reusable component for batch operations across editors
 * Provides consistent batch control interface for creating, editing, and managing multiple items
 */
const BulkControls = ({
  title = "Bulk Operations",
  itemType = "items",
  itemTypePlural = "items",

  // Core batch generation options
  bulkOptions = {},
  onBulkOptionsChange = () => {},

  // Batch operations
  onPreview = () => {},
  onGenerate = () => {},
  onDuplicate = () => {},
  onDeleteSelected = () => {},

  // Selection management
  selectedItems = [],
  totalItems = 0,
  onSelectAll = () => {},
  onDeselectAll = () => {},

  // Configuration
  showGeneration = true,
  showSelection = true,
  showPreview = true,
  showDuplicate = true,
  showDelete = true,

  // Custom buttons
  customButtons = [],

  // Styling
  className = "",
  compact = false
}) => {
  const hasSelection = selectedItems.length > 0;
  const allSelected = selectedItems.length === totalItems && totalItems > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const handleDuplicate = () => {
    if (hasSelection) {
      onDuplicate(selectedItems);
    }
  };

  const handleDeleteSelected = () => {
    if (hasSelection && window.confirm(`Delete ${selectedItems.length} selected ${itemTypePlural}?`)) {
      onDeleteSelected(selectedItems);
    }
  };

  if (compact) {
    return (
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {showSelection && totalItems > 0 && (
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            {allSelected ? '☑️' : '☐'} {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}

        {showDuplicate && hasSelection && (
          <button
            onClick={handleDuplicate}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <Copy className="w-3 h-3" />
            Duplicate ({selectedItems.length})
          </button>
        )}

        {showDelete && hasSelection && (
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete ({selectedItems.length})
          </button>
        )}

        {customButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            disabled={button.disabled}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${button.className || 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            {button.icon && <span className="w-3 h-3">{button.icon}</span>}
            {button.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`border-2 border-dashed border-blue-500/30 rounded-lg p-4 ${className}`}>
      <h4 className="font-medium text-white mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {title}
      </h4>

      <div className="space-y-4">
        {/* Selection Controls */}
        {showSelection && totalItems > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
            >
              {allSelected ? '☑️' : '☐'} {allSelected ? 'Deselect All' : 'Select All'} ({totalItems})
            </button>

            {hasSelection && (
              <>
                {showDuplicate && (
                  <button
                    onClick={handleDuplicate}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate ({selectedItems.length})
                  </button>
                )}

                {showDelete && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete ({selectedItems.length})
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Generation Options */}
        {showGeneration && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Number to Generate</label>
              <input
                type="number"
                min="1"
                max="50"
                value={bulkOptions.count || 5}
                onChange={(e) => onBulkOptionsChange({ ...bulkOptions, count: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Distribution Strategy</label>
              <select
                value={bulkOptions.distribution || 'random'}
                onChange={(e) => onBulkOptionsChange({ ...bulkOptions, distribution: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="random" className="bg-gray-800">Random Distribution</option>
                <option value="even" className="bg-gray-800">Even Distribution</option>
                <option value="weighted" className="bg-gray-800">Population Weighted</option>
                <option value="clustered" className="bg-gray-800">Clustered</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {showPreview && (
            <button
              onClick={onPreview}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview {itemTypePlural}
            </button>
          )}

          {showGeneration && (
            <button
              onClick={onGenerate}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Generate & Place
            </button>
          )}

          {customButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              disabled={button.disabled}
              className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${button.className || 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              {button.icon && <span className="w-4 h-4">{button.icon}</span>}
              {button.label}
            </button>
          ))}
        </div>

        {/* Status Info */}
        {(hasSelection || (bulkOptions.count && bulkOptions.count > 1)) && (
          <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Settings className="w-4 h-4" />
              {hasSelection ? (
                <span>{selectedItems.length} {itemTypePlural} selected</span>
              ) : (
                <span>Ready to generate {bulkOptions.count || 5} {itemTypePlural}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkControls;
