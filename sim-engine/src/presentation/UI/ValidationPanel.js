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

  const getStepStatus = (step) => {
    const stepData = stepValidation[step];
    if (!stepData) return 'pending';
    if (stepData.isComplete) return 'complete';
    if (stepData.errors?.length > 0) return 'error';
    if (stepData.warnings?.length > 0) return 'warning';
    return 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'complete': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return '○';
    }
  };

  const renderStepSection = (step, stepName) => {
    const status = getStepStatus(step);
    const stepData = stepValidation[step] || {};
    const isExpanded = expandedSections.has(`step-${step}`);
    const isCurrent = step === currentStep;

    return (
      <div key={step} className={`validation-step ${status} ${isCurrent ? 'current' : ''}`}>
        <div 
          className="validation-step-header"
          onClick={() => toggleSection(`step-${step}`)}
        >
          <span className="step-icon">{getStepIcon(status)}</span>
          <span className="step-name">Step {step}: {stepName}</span>
          <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
        </div>
        
        {isExpanded && (
          <div className="validation-step-content">
            {stepData.errors?.map((error, index) => (
              <div key={`error-${index}`} className="validation-message error">
                <span className="message-icon">✗</span>
                <div className="message-content">
                  <div className="message-text">{error.message}</div>
                  {error.suggestion && (
                    <div className="message-suggestion">{error.suggestion}</div>
                  )}
                  {error.fixable && onFixError && (
                    <button 
                      className="fix-button"
                      onClick={() => onFixError(error)}
                    >
                      Fix This
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {stepData.warnings?.map((warning, index) => (
              <div key={`warning-${index}`} className="validation-message warning">
                <span className="message-icon">⚠</span>
                <div className="message-content">
                  <div className="message-text">{warning.message}</div>
                  {warning.suggestion && (
                    <div className="message-suggestion">{warning.suggestion}</div>
                  )}
                </div>
              </div>
            ))}
            
            {stepData.requirements?.map((req, index) => (
              <div key={`req-${index}`} className="validation-message requirement">
                <span className="message-icon">→</span>
                <div className="message-content">
                  <div className="message-text">{req}</div>
                </div>
              </div>
            ))}
            
            {status === 'complete' && (
              <div className="validation-message success">
                <span className="message-icon">✓</span>
                <div className="message-content">
                  <div className="message-text">Step completed successfully</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const stepNames = {
    1: 'Create World',
    2: 'Create Nodes',
    3: 'Create Interactions',
    4: 'Create Characters',
    5: 'Populate Nodes',
    6: 'Final Validation'
  };

  return (
    <div className={`validation-panel ${className}`}>
      <div className="validation-header">
        <h3>World Building Progress</h3>
        <div className={`validation-badge ${isValid ? 'valid' : 'invalid'}`}>
          {Math.round(completeness * 100)}% Complete
        </div>
      </div>
      
      <div className="validation-content">
        {/* Current Step Summary */}
        <div className="validation-section current-section">
          <div 
            className="validation-section-header"
            onClick={() => toggleSection('current')}
          >
            <span>Current Step Summary</span>
            <span className="expand-icon">
              {expandedSections.has('current') ? '−' : '+'}
            </span>
          </div>
          
          {expandedSections.has('current') && (
            <div className="validation-section-content">
              <div className="current-step-info">
                <div className="current-step-name">
                  Step {currentStep}: {stepNames[currentStep]}
                </div>
                <div className="current-step-status">
                  Status: {getStepStatus(currentStep)}
                </div>
              </div>
              
              {nextRequirements[currentStep]?.length > 0 && (
                <div className="next-requirements">
                  <h4>To proceed, you need to:</h4>
                  <ul>
                    {nextRequirements[currentStep].map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* All Steps */}
        <div className="validation-section">
          <div 
            className="validation-section-header"
            onClick={() => toggleSection('steps')}
          >
            <span>All Steps</span>
            <span className="expand-icon">
              {expandedSections.has('steps') ? '−' : '+'}
            </span>
          </div>
          
          {expandedSections.has('steps') && (
            <div className="validation-section-content">
              {Object.entries(stepNames).map(([step, name]) => 
                renderStepSection(parseInt(step), name)
              )}
            </div>
          )}
        </div>
        
        {/* Global Errors */}
        {errors.length > 0 && (
          <div className="validation-section">
            <div 
              className="validation-section-header error"
              onClick={() => toggleSection('errors')}
            >
              <span>Global Errors ({errors.length})</span>
              <span className="expand-icon">
                {expandedSections.has('errors') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('errors') && (
              <div className="validation-section-content">
                {errors.map((error, index) => (
                  <div key={index} className="validation-message error">
                    <span className="message-icon">✗</span>
                    <div className="message-content">
                      <div className="message-text">{error.message}</div>
                      {error.suggestion && (
                        <div className="message-suggestion">{error.suggestion}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Global Warnings */}
        {warnings.length > 0 && (
          <div className="validation-section">
            <div 
              className="validation-section-header warning"
              onClick={() => toggleSection('warnings')}
            >
              <span>Warnings ({warnings.length})</span>
              <span className="expand-icon">
                {expandedSections.has('warnings') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('warnings') && (
              <div className="validation-section-content">
                {warnings.map((warning, index) => (
                  <div key={index} className="validation-message warning">
                    <span className="message-icon">⚠</span>
                    <div className="message-content">
                      <div className="message-text">{warning.message}</div>
                      {warning.suggestion && (
                        <div className="message-suggestion">{warning.suggestion}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;