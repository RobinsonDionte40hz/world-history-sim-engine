/**
 * WorldBuilderInterface - Step-by-step world building interface component
 * 
 * Creates step-by-step interface with clear progression indicators.
 * Implements world settings editors (no dimensions, just rules and initial conditions).
 * Adds step navigation with dependency validation (cannot skip steps).
 * Adds validation panel showing current step status and errors.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import React, { useState, useEffect } from 'react';
import useWorldBuilder from '../hooks/useWorldBuilder';

const WorldBuilderInterface = ({ 
  templateManager = null, 
  onWorldReady = null,
  className = '' 
}) => {
  const worldBuilderHook = useWorldBuilder(templateManager);
  
  // Handle case where hook returns undefined (e.g., in tests)
  if (!worldBuilderHook) {
    return (
      <div className={`world-builder-interface ${className}`} style={{ padding: '20px' }}>
        <div style={{ color: '#dc2626', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
          Error: World builder hook not properly initialized
        </div>
      </div>
    );
  }

  const {
    worldConfig = {},
    currentStep = 1,
    validationStatus = { isValid: false, errors: [] },
    availableTemplates = { worlds: [], nodes: [], interactions: [], characters: [] },
    isLoading = false,
    error = null,
    stepValidationStatus = {},
    isWorldComplete = false,
    currentStepRequirements = [],
    
    // Step navigation
    canProceedToStep = () => false,
    proceedToStep = () => {},
    validateCurrentStep = () => {},
    
    // Step 1 methods
    setWorldProperties = () => {},
    setRules = () => {},
    setInitialConditions = () => {},
    
    // Step 2 methods
    addNode = () => {},
    addNodeFromTemplate = () => {},
    removeNode = () => {},
    
    // Step 3 methods
    addInteraction = () => {},
    addInteractionFromTemplate = () => {},
    removeInteraction = () => {},
    
    // Step 4 methods
    addCharacter = () => {},
    addCharacterFromTemplate = () => {},
    removeCharacter = () => {},
    
    // Step 5 methods
    assignCharacterToNode = () => {},
    populateNode = () => {},
    
    // Final methods
    validateWorld = () => {},
    buildWorld = () => {},
    resetBuilder = () => {},
    saveAsTemplate = () => {}
  } = worldBuilderHook || {};

  // Local state for form inputs
  const [worldName, setWorldName] = useState(worldConfig?.name || '');
  const [worldDescription, setWorldDescription] = useState(worldConfig?.description || '');
  const [worldRules, setWorldRules] = useState(worldConfig?.rules || {});
  const [localInitialConditions, setLocalInitialConditions] = useState(worldConfig?.initialConditions || {});
  
  // Update local state when worldConfig changes
  useEffect(() => {
    if (worldConfig) {
      setWorldName(worldConfig.name || '');
      setWorldDescription(worldConfig.description || '');
      setWorldRules(worldConfig.rules || {});
      setLocalInitialConditions(worldConfig.initialConditions || {});
    }
  }, [worldConfig]);

  // Handle step navigation
  const handleStepClick = (stepNumber) => {
    if (canProceedToStep(stepNumber)) {
      proceedToStep(stepNumber);
    }
  };

  // Handle world properties submission
  const handleWorldPropertiesSubmit = (e) => {
    e.preventDefault();
    try {
      setWorldProperties(worldName, worldDescription);
      if (Object.keys(worldRules).length > 0) {
        setRules(worldRules);
      }
      if (Object.keys(localInitialConditions).length > 0) {
        setInitialConditions(localInitialConditions);
      }
    } catch (err) {
      console.error('Error setting world properties:', err);
    }
  };

  // Handle world completion
  const handleBuildWorld = async () => {
    try {
      const validation = validateWorld();
      if (validation.isValid) {
        const worldState = buildWorld();
        if (onWorldReady) {
          onWorldReady(worldState);
        }
      }
    } catch (err) {
      console.error('Error building world:', err);
    }
  };

  // Step progression indicators
  const StepIndicator = ({ stepNumber, title, isActive, isCompleted, canAccess }) => (
    <div 
      className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${canAccess ? 'accessible' : 'disabled'}`}
      onClick={() => canAccess && handleStepClick(stepNumber)}
      style={{
        padding: '12px 16px',
        margin: '4px 0',
        border: '2px solid',
        borderColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : canAccess ? '#6b7280' : '#d1d5db',
        backgroundColor: isCompleted ? '#ecfdf5' : isActive ? '#eff6ff' : canAccess ? '#f9fafb' : '#f3f4f6',
        borderRadius: '8px',
        cursor: canAccess ? 'pointer' : 'not-allowed',
        opacity: canAccess ? 1 : 0.5,
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#6b7280',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {isCompleted ? '✓' : stepNumber}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', color: isCompleted ? '#065f46' : isActive ? '#1e40af' : '#374151' }}>
            Step {stepNumber}: {title}
          </div>
          {isActive && currentStepRequirements && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {currentStepRequirements.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Validation panel
  const ValidationPanel = () => (
    <div style={{ 
      padding: '16px', 
      backgroundColor: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Validation Status</h3>
      
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '4px',
          color: '#dc2626',
          marginBottom: '12px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {currentStepRequirements && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Current Step: {currentStepRequirements.title}
          </div>
          <div style={{ color: '#6b7280', marginBottom: '8px' }}>
            {currentStepRequirements.description}
          </div>
          <div style={{ fontSize: '14px' }}>
            <strong>Requirements:</strong>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              {currentStepRequirements.required.map((req, index) => (
                <li key={index} style={{ color: '#6b7280' }}>{req}</li>
              ))}
            </ul>
          </div>
          <div style={{ 
            marginTop: '8px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: currentStepRequirements.completed ? '#dcfce7' : '#fef3c7',
            color: currentStepRequirements.completed ? '#166534' : '#92400e',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Status: {currentStepRequirements.completed ? 'Completed ✓' : 'Incomplete'}
          </div>
        </div>
      )}

      {validationStatus && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Overall Progress:</strong> {Math.round(validationStatus.completeness * 100)}%
          </div>
          
          {validationStatus.errors.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#dc2626' }}>Errors:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '20px', color: '#dc2626' }}>
                {validationStatus.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationStatus.warnings.length > 0 && (
            <div>
              <strong style={{ color: '#d97706' }}>Warnings:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '20px', color: '#d97706' }}>
                {validationStatus.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Step 1: World Properties Editor
  const WorldPropertiesEditor = () => (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Step 1: World Properties</h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Define the basic properties of your world. No spatial dimensions are needed - this is a mappless world system.
      </p>
      
      <form onSubmit={handleWorldPropertiesSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            World Name *
          </label>
          <input
            type="text"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
            placeholder="Enter world name..."
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            World Description *
          </label>
          <textarea
            value={worldDescription}
            onChange={(e) => setWorldDescription(e.target.value)}
            placeholder="Describe your world..."
            required
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            World Rules
          </label>
          <textarea
            value={JSON.stringify(worldRules, null, 2)}
            onChange={(e) => {
              try {
                setWorldRules(JSON.parse(e.target.value));
              } catch (err) {
                // Invalid JSON, keep as string for now
              }
            }}
            placeholder='{"timeProgression": "realtime", "simulationSpeed": 1}'
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Enter rules as JSON (time progression, simulation parameters, etc.)
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            Initial Conditions
          </label>
          <textarea
            value={JSON.stringify(localInitialConditions, null, 2)}
            onChange={(e) => {
              try {
                setLocalInitialConditions(JSON.parse(e.target.value));
              } catch (err) {
                // Invalid JSON, keep as string for now
              }
            }}
            placeholder='{"startingYear": 1000, "season": "spring"}'
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Enter initial conditions as JSON
          </div>
        </div>

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Save World Properties
        </button>
      </form>
    </div>
  );

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WorldPropertiesEditor />;
      case 2:
        return (
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3>Step 2: Create Nodes</h3>
            <p style={{ color: '#6b7280' }}>
              Add abstract locations/contexts to your world. Nodes represent places or situations where characters can interact.
            </p>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
              <p><strong>Current Nodes:</strong> {worldConfig.nodes.length}</p>
              {worldConfig.nodes.map(node => (
                <div key={node.id} style={{ margin: '8px 0', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <strong>{node.name}</strong> ({node.type}) - {node.description}
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#6b7280' }}>
              Node editor components will be implemented in the next subtasks.
            </p>
          </div>
        );
      case 3:
        return (
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3>Step 3: Create Interactions</h3>
            <p style={{ color: '#6b7280' }}>
              Define character capabilities and actions. Interactions represent what characters can DO in your world.
            </p>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
              <p><strong>Current Interactions:</strong> {worldConfig.interactions.length}</p>
              {worldConfig.interactions.map(interaction => (
                <div key={interaction.id} style={{ margin: '8px 0', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <strong>{interaction.name}</strong> ({interaction.type})
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#6b7280' }}>
              Interaction editor components will be implemented in the next subtasks.
            </p>
          </div>
        );
      case 4:
        return (
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3>Step 4: Create Characters</h3>
            <p style={{ color: '#6b7280' }}>
              Add characters with assigned capabilities. Characters are defined by what they can DO (their interactions).
            </p>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
              <p><strong>Current Characters:</strong> {worldConfig.characters.length}</p>
              {worldConfig.characters.map(character => (
                <div key={character.id} style={{ margin: '8px 0', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <strong>{character.name}</strong> - {character.assignedInteractions?.length || 0} capabilities
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#6b7280' }}>
              Character editor components will be implemented in the next subtasks.
            </p>
          </div>
        );
      case 5:
        return (
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3>Step 5: Populate Nodes</h3>
            <p style={{ color: '#6b7280' }}>
              Assign characters to nodes. Each node must have at least one character.
            </p>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
              <p><strong>Node Populations:</strong></p>
              {worldConfig.nodes.map(node => (
                <div key={node.id} style={{ margin: '8px 0', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <strong>{node.name}:</strong> {worldConfig.nodePopulations[node.id]?.length || 0} characters
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#6b7280' }}>
              Node population editor components will be implemented in the next subtasks.
            </p>
          </div>
        );
      case 6:
        return (
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3>Step 6: Simulation Ready</h3>
            <p style={{ color: '#6b7280' }}>
              Your world is ready for simulation! All dependencies have been met.
            </p>
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '4px', border: '1px solid #10b981' }}>
              <p style={{ color: '#065f46', fontWeight: 'bold' }}>✓ World Complete</p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#065f46' }}>
                <li>World properties defined</li>
                <li>{worldConfig.nodes.length} nodes created</li>
                <li>{worldConfig.interactions.length} interactions defined</li>
                <li>{worldConfig.characters.length} characters created</li>
                <li>All nodes populated with characters</li>
              </ul>
            </div>
            <button
              onClick={handleBuildWorld}
              disabled={!isWorldComplete}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: isWorldComplete ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isWorldComplete ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Build World & Start Simulation
            </button>
          </div>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className={`world-builder-interface ${className}`} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>World Builder</h1>
        <p style={{ color: '#6b7280', margin: '0' }}>
          Create your world step-by-step. Each step depends on the previous ones being completed.
        </p>
      </div>

      {isLoading && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#1e40af'
        }}>
          Loading templates...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
        {/* Step Navigation Sidebar */}
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b' }}>Progress</h2>
          
          <StepIndicator
            stepNumber={1}
            title="Create World"
            isActive={currentStep === 1}
            isCompleted={stepValidationStatus[1]}
            canAccess={canProceedToStep(1)}
          />
          
          <StepIndicator
            stepNumber={2}
            title="Create Nodes"
            isActive={currentStep === 2}
            isCompleted={stepValidationStatus[2]}
            canAccess={canProceedToStep(2)}
          />
          
          <StepIndicator
            stepNumber={3}
            title="Create Interactions"
            isActive={currentStep === 3}
            isCompleted={stepValidationStatus[3]}
            canAccess={canProceedToStep(3)}
          />
          
          <StepIndicator
            stepNumber={4}
            title="Create Characters"
            isActive={currentStep === 4}
            isCompleted={stepValidationStatus[4]}
            canAccess={canProceedToStep(4)}
          />
          
          <StepIndicator
            stepNumber={5}
            title="Populate Nodes"
            isActive={currentStep === 5}
            isCompleted={stepValidationStatus[5]}
            canAccess={canProceedToStep(5)}
          />
          
          <StepIndicator
            stepNumber={6}
            title="Simulation Ready"
            isActive={currentStep === 6}
            isCompleted={stepValidationStatus[6]}
            canAccess={canProceedToStep(6)}
          />

          {/* Action buttons */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={resetBuilder}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reset Builder
            </button>
            
            <button
              onClick={() => saveAsTemplate('world', worldName || 'My World', 'Custom world template')}
              disabled={!worldConfig.name}
              style={{
                padding: '8px 16px',
                backgroundColor: worldConfig.name ? '#8b5cf6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: worldConfig.name ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              Save as Template
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          <ValidationPanel />
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default WorldBuilderInterface;