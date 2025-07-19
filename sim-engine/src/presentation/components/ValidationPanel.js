/**
 * ValidationPanel - Component for step-by-step validation feedback
 * 
 * Implements detailed error message display for each step in the six-step flow.
 * Adds error categorization (step dependency errors, validation errors, warnings).
 * Implements error resolution suggestions and guidance for mappless world building.
 * Shows step completion status and next step requirements.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import React, { useState } from 'react';
import './ValidationPanel.css';

const ValidationPanel = ({ 
  validationResult, 
  currentStep,
  onFixError,
  onGoToStep,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set(['current']));

  if (!validationResult) {
    return (
      <div className={`validation-panel ${className}`}>
        <div className="validation-header">
          <h3>Validation Status</h3>
          <div className="validation-badge loading">Validating...</div>
        </div>
      </div>
    );
  }

  const { 
    isValid, 
    errors = [], 
    warnings = [], 
    stepValidation = {}, 
    completeness = 0, 
    nextRequirements = {},
    currentStep: validationCurrentStep = 1
  } = validationResult;

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStepName = (step) => {
    const stepNames = {
      1: 'World Properties',
      2: 'Nodes',
      3: 'Interactions',
      4: 'Characters',
      5: 'Node Populations',
      6: 'Final Validation'
    };
    return stepNames[step] || `Step ${step}`;
  };

  const getStepIcon = (step) => {
    if (stepValidation[step]) return '✓';
    if (step === validationCurrentStep) return '⚠';
    if (step < validationCurrentStep) return '✗';
    return '○';
  };

  const getStepStatus = (step) => {
    if (stepValidation[step]) return 'completed';
    if (step === validationCurrentStep) return 'current';
    if (step < validationCurrentStep) return 'error';
    return 'pending';
  };

  const getErrorsByStep = (stepNumber) => {
    return errors.filter(error => error.step === stepNumber);
  };

  const getWarningsByStep = (stepNumber) => {
    return warnings.filter(warning => warning.step === stepNumber);
  };

  const getErrorSeverity = (error) => {
    if (error.field === 'completeness') return 'critical';
    if (['name', 'id', 'type'].includes(error.field)) return 'high';
    if (['unassigned', 'capabilities'].includes(error.field)) return 'high';
    return 'medium';
  };

  const getErrorSuggestion = (error) => {
    const suggestions = {
      name: 'Add a descriptive name to help identify this component.',
      id: 'Ensure each item has a unique identifier.',
      type: 'Select an appropriate type from the available options.',
      nodes: 'Create at least one node where characters can be placed.',
      interactions: 'Define at least one interaction type for character capabilities.',
      characters: 'Create at least one character for the simulation.',
      capabilities: 'Assign at least one capability to each character.',
      unassigned: 'Assign all characters to nodes in Step 5.',
      nodePopulations: 'Populate nodes with characters in Step 5.',
      completeness: 'Complete all previous steps before final validation.'
    };
    
    return suggestions[error.field] || 'Review and fix this validation issue.';
  };

  return (
    <div className={`validation-panel ${className} ${isValid ? 'valid' : 'invalid'}`}>
      {/* Header with overall status */}
      <div className="validation-header">
        <h3>Validation Status</h3>
        <div className={`validation-badge ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? 'Valid' : `${errors.length} Error${errors.length !== 1 ? 's' : ''}`}
        </div>
        <div className="completeness-bar">
          <div 
            className="completeness-fill" 
            style={{ width: `${completeness * 100}%` }}
          ></div>
          <span className="completeness-text">{Math.round(completeness * 100)}% Complete</span>
        </div>
      </div>

      {/* Step progress indicator */}
      <div className="step-progress">
        {[1, 2, 3, 4, 5, 6].map(step => (
          <div 
            key={step} 
            className={`step-indicator ${getStepStatus(step)}`}
            onClick={() => onGoToStep && onGoToStep(step)}
            title={`${getStepName(step)} - Click to go to step`}
          >
            <div className="step-icon">{getStepIcon(step)}</div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>

      {/* Current step requirements */}
      {!nextRequirements.isComplete && (
        <div className="validation-section current-requirements">
          <div 
            className="section-header" 
            onClick={() => toggleSection('current')}
          >
            <h4>
              <span className="expand-icon">
                {expandedSections.has('current') ? '▼' : '▶'}
              </span>
              Current Step: {getStepName(validationCurrentStep)}
            </h4>
          </div>
          
          {expandedSections.has('current') && (
            <div className="section-content">
              <p className="step-requirement">{nextRequirements.requirement}</p>
              
              {nextRequirements.errors && nextRequirements.errors.length > 0 && (
                <div className="step-errors">
                  <h5>Issues to fix:</h5>
                  {nextRequirements.errors.map((error, index) => (
                    <div key={index} className={`error-item ${getErrorSeverity(error)}`}>
                      <div className="error-message">{error.message}</div>
                      <div className="error-suggestion">{getErrorSuggestion(error)}</div>
                      {onFixError && (
                        <button 
                          className="fix-error-btn"
                          onClick={() => onFixError(error)}
                        >
                          Fix This
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Errors section */}
      {errors.length > 0 && (
        <div className="validation-section errors-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('errors')}
          >
            <h4>
              <span className="expand-icon">
                {expandedSections.has('errors') ? '▼' : '▶'}
              </span>
              Errors ({errors.length})
            </h4>
          </div>
          
          {expandedSections.has('errors') && (
            <div className="section-content">
              {[1, 2, 3, 4, 5, 6].map(step => {
                const stepErrors = getErrorsByStep(step);
                if (stepErrors.length === 0) return null;
                
                return (
                  <div key={step} className="step-errors-group">
                    <h5 className="step-errors-header">
                      Step {step}: {getStepName(step)} ({stepErrors.length} errors)
                    </h5>
                    {stepErrors.map((error, index) => (
                      <div key={index} className={`error-item ${getErrorSeverity(error)}`}>
                        <div className="error-message">{error.message}</div>
                        <div className="error-field">Field: {error.field}</div>
                        <div className="error-suggestion">{getErrorSuggestion(error)}</div>
                        {onFixError && (
                          <button 
                            className="fix-error-btn"
                            onClick={() => onFixError(error)}
                          >
                            Fix This
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Warnings section */}
      {warnings.length > 0 && (
        <div className="validation-section warnings-section">
          <div 
            className="section-header" 
            onClick={() => toggleSection('warnings')}
          >
            <h4>
              <span className="expand-icon">
                {expandedSections.has('warnings') ? '▼' : '▶'}
              </span>
              Warnings ({warnings.length})
            </h4>
          </div>
          
          {expandedSections.has('warnings') && (
            <div className="section-content">
              {[1, 2, 3, 4, 5, 6].map(step => {
                const stepWarnings = getWarningsByStep(step);
                if (stepWarnings.length === 0) return null;
                
                return (
                  <div key={step} className="step-warnings-group">
                    <h5 className="step-warnings-header">
                      Step {step}: {getStepName(step)} ({stepWarnings.length} warnings)
                    </h5>
                    {stepWarnings.map((warning, index) => (
                      <div key={index} className="warning-item">
                        <div className="warning-message">{warning.message}</div>
                        <div className="warning-field">Field: {warning.field}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Success message */}
      {isValid && (
        <div className="validation-section success-section">
          <div className="success-message">
            <span className="success-icon">✓</span>
            World is complete and ready for simulation!
          </div>
        </div>
      )}

      {/* Validation help */}
      <div className="validation-section help-section">
        <div 
          className="section-header" 
          onClick={() => toggleSection('help')}
        >
          <h4>
            <span className="expand-icon">
              {expandedSections.has('help') ? '▼' : '▶'}
            </span>
            Validation Help
          </h4>
        </div>
        
        {expandedSections.has('help') && (
          <div className="section-content">
            <div className="help-content">
              <h5>Six-Step World Building Process:</h5>
              <ol className="help-steps">
                <li><strong>World Properties:</strong> Set name, description, rules, and initial conditions</li>
                <li><strong>Nodes:</strong> Create abstract locations with environmental properties</li>
                <li><strong>Interactions:</strong> Define character capabilities and interaction types</li>
                <li><strong>Characters:</strong> Create characters with assigned capabilities</li>
                <li><strong>Node Populations:</strong> Assign all characters to specific nodes</li>
                <li><strong>Final Validation:</strong> Ensure all components are complete and consistent</li>
              </ol>
              
              <div className="help-tips">
                <h5>Tips:</h5>
                <ul>
                  <li>Each step must be completed before moving to the next</li>
                  <li>Red errors must be fixed to proceed</li>
                  <li>Yellow warnings are recommendations for better simulation quality</li>
                  <li>Click on step numbers to navigate between steps</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;
