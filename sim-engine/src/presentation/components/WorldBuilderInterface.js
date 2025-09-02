/**
 * WorldBuilderInterface - Main interface for world building functionality
 * This component provides the primary interface for creating and managing worlds
 */

import React from 'react';

const WorldBuilderInterface = ({ 
  worldBuilderState, 
  templateManager, 
  onValidationChange,
  onWorldChange,
  ...props 
}) => {
  return (
    <div className="world-builder-interface" data-testid="world-builder-interface">
      <div className="world-builder-header">
        <h2>World Builder</h2>
        <p>Create and manage your simulation world</p>
      </div>
      
      <div className="world-builder-content">
        {/* World properties section */}
        <div className="world-properties">
          <h3>World Properties</h3>
          <div className="form-group">
            <label htmlFor="world-name">World Name</label>
            <input 
              id="world-name"
              type="text" 
              placeholder="Enter world name"
              value={worldBuilderState?.worldConfig?.name || ''}
              onChange={(e) => onWorldChange?.({ name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="world-description">Description</label>
            <textarea 
              id="world-description"
              placeholder="Enter world description"
              value={worldBuilderState?.worldConfig?.description || ''}
              onChange={(e) => onWorldChange?.({ description: e.target.value })}
            />
          </div>
        </div>

        {/* Validation status */}
        {worldBuilderState?.validation && (
          <div className="validation-status">
            <h4>Validation Status</h4>
            <div className={`status ${worldBuilderState.validation.isValid ? 'valid' : 'invalid'}`}>
              {worldBuilderState.validation.isValid ? 'Valid' : 'Invalid'}
            </div>
            {worldBuilderState.validation.errors?.length > 0 && (
              <div className="errors">
                <h5>Errors:</h5>
                <ul>
                  {worldBuilderState.validation.errors.map((error, index) => (
                    <li key={index}>{error.message || error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Template manager integration */}
        {templateManager && (
          <div className="template-section">
            <h3>Templates</h3>
            <p>Template manager available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldBuilderInterface;