// src/presentation/components/AlignmentAxisEditor.js

import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Edit, ChevronDown, ChevronUp, Scale } from 'lucide-react';

export const AlignmentAxisEditor = ({ axis, updateAxis, deleteAxis, onCancel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAxis, setEditedAxis] = useState({
    id: axis.id || '',
    name: axis.name || '',
    description: axis.description || '',
    min: axis.min || -100,
    max: axis.max || 100,
    defaultValue: axis.defaultValue || 0,
    zones: axis.zones || []
  });
  const [editingZone, setEditingZone] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleAxisChange = (field, value) => {
    setEditedAxis(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleZoneChange = (zoneIndex, field, value) => {
    const updatedZones = [...editedAxis.zones];
    updatedZones[zoneIndex] = {
      ...updatedZones[zoneIndex],
      [field]: value
    };
    setEditedAxis(prev => ({
      ...prev,
      zones: updatedZones
    }));
  };

  const addZone = () => {
    const newZone = {
      id: `zone_${Date.now()}`,
      name: 'New Zone',
      description: '',
      min: editedAxis.min,
      max: editedAxis.max,
      color: '#3b82f6'
    };
    setEditedAxis(prev => ({
      ...prev,
      zones: [...prev.zones, newZone]
    }));
    setEditingZone(editedAxis.zones.length);
  };

  const removeZone = (zoneIndex) => {
    const updatedZones = editedAxis.zones.filter((_, index) => index !== zoneIndex);
    setEditedAxis(prev => ({
      ...prev,
      zones: updatedZones
    }));
    if (editingZone === zoneIndex) {
      setEditingZone(null);
    }
  };

  const handleSave = () => {
    // Validate axis data
    if (!editedAxis.name.trim()) {
      alert('Axis name is required');
      return;
    }
    
    if (editedAxis.min >= editedAxis.max) {
      alert('Minimum value must be less than maximum value');
      return;
    }

    // Validate zones
    for (let i = 0; i < editedAxis.zones.length; i++) {
      const zone = editedAxis.zones[i];
      if (!zone.name.trim()) {
        alert(`Zone ${i + 1} name is required`);
        return;
      }
      if (zone.min >= zone.max) {
        alert(`Zone "${zone.name}" minimum must be less than maximum`);
        return;
      }
    }

    updateAxis(editedAxis);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsEditing(false);
      setEditedAxis({
        id: axis.id || '',
        name: axis.name || '',
        description: axis.description || '',
        min: axis.min || -100,
        max: axis.max || 100,
        defaultValue: axis.defaultValue || 0,
        zones: axis.zones || []
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Alignment Axis' : axis.name || 'New Alignment Axis'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                title="Edit Axis"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {deleteAxis && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this alignment axis?')) {
                      deleteAxis(axis.id);
                    }
                  }}
                  className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete Axis"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Axis Properties */}
      {(isEditing || expanded) && (
        <div className="space-y-4">
          {/* Basic Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editedAxis.name}
                onChange={(e) => handleAxisChange('name', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., Good vs Evil"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Value
              </label>
              <input
                type="number"
                value={editedAxis.defaultValue}
                onChange={(e) => handleAxisChange('defaultValue', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={editedAxis.min}
                max={editedAxis.max}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={editedAxis.min}
                onChange={(e) => handleAxisChange('min', parseInt(e.target.value) || -100)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={editedAxis.max}
                onChange={(e) => handleAxisChange('max', parseInt(e.target.value) || 100)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={editedAxis.description}
              onChange={(e) => handleAxisChange('description', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Describe what this alignment axis represents..."
            />
          </div>

          {/* Zones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
                Alignment Zones ({editedAxis.zones.length})
              </h4>
              {isEditing && (
                <button
                  onClick={addZone}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  <Plus className="w-3 h-3" />
                  Add Zone
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {editedAxis.zones.map((zone, index) => (
                <div
                  key={zone.id || index}
                  className="border border-gray-200 dark:border-gray-600 rounded-md p-3"
                  style={{ borderLeftColor: zone.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) => handleZoneChange(index, 'name', e.target.value)}
                      disabled={!isEditing}
                      className="font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                      placeholder="Zone name"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeZone(index)}
                        className="p-1 text-red-500 hover:text-red-600"
                        title="Remove Zone"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Min</label>
                      <input
                        type="number"
                        value={zone.min}
                        onChange={(e) => handleZoneChange(index, 'min', parseInt(e.target.value) || editedAxis.min)}
                        disabled={!isEditing}
                        min={editedAxis.min}
                        max={editedAxis.max}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Max</label>
                      <input
                        type="number"
                        value={zone.max}
                        onChange={(e) => handleZoneChange(index, 'max', parseInt(e.target.value) || editedAxis.max)}
                        disabled={!isEditing}
                        min={editedAxis.min}
                        max={editedAxis.max}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Color</label>
                      <input
                        type="color"
                        value={zone.color || '#3b82f6'}
                        onChange={(e) => handleZoneChange(index, 'color', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <textarea
                    value={zone.description || ''}
                    onChange={(e) => handleZoneChange(index, 'description', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Zone description..."
                  />
                </div>
              ))}
              
              {editedAxis.zones.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No zones defined. Click "Add Zone" to create alignment zones.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary view when collapsed */}
      {!isEditing && !expanded && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-1">{axis.description || 'No description'}</p>
          <div className="flex items-center gap-4">
            <span>Range: {axis.min || -100} to {axis.max || 100}</span>
            <span>Default: {axis.defaultValue || 0}</span>
            <span>Zones: {(axis.zones || []).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};