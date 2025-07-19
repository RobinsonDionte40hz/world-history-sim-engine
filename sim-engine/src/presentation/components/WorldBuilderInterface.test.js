/**
 * WorldBuilderInterface Component Tests
 * 
 * Tests the step-by-step world building interface component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorldBuilderInterface from './WorldBuilderInterface';

// Mock the useWorldBuilder hook
jest.mock('../hooks/useWorldBuilder', () => {
  return jest.fn(() => ({
    worldConfig: {
      name: '',
      description: '',
      rules: {},
      initialConditions: {},
      nodes: [],
      interactions: [],
      characters: [],
      nodePopulations: {},
      stepValidation: {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false
      }
    },
    currentStep: 1,
    validationStatus: null,
    availableTemplates: {
      worlds: [],
      nodes: [],
      interactions: [],
      characters: [],
      composite: []
    },
    isLoading: false,
    error: null,
    stepValidationStatus: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false
    },
    isWorldComplete: false,
    currentStepRequirements: {
      title: 'Create World Properties',
      description: 'Set world name, description, rules, and initial conditions',
      required: ['name', 'description', 'rules', 'initialConditions'],
      completed: false
    },
    
    // Mock methods
    canProceedToStep: jest.fn((step) => step === 1),
    proceedToStep: jest.fn(),
    validateCurrentStep: jest.fn(),
    setWorldProperties: jest.fn(),
    setRules: jest.fn(),
    setInitialConditions: jest.fn(),
    addNode: jest.fn(),
    addNodeFromTemplate: jest.fn(),
    removeNode: jest.fn(),
    addInteraction: jest.fn(),
    addInteractionFromTemplate: jest.fn(),
    removeInteraction: jest.fn(),
    addCharacter: jest.fn(),
    addCharacterFromTemplate: jest.fn(),
    removeCharacter: jest.fn(),
    assignCharacterToNode: jest.fn(),
    populateNode: jest.fn(),
    validateWorld: jest.fn(),
    buildWorld: jest.fn(),
    resetBuilder: jest.fn(),
    saveAsTemplate: jest.fn()
  }));
});

describe('WorldBuilderInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders world builder interface with step indicators', () => {
    render(<WorldBuilderInterface />);
    
    // Check main title
    expect(screen.getByText('World Builder')).toBeInTheDocument();
    expect(screen.getByText(/Create your world step-by-step/)).toBeInTheDocument();
    
    // Check step indicators
    expect(screen.getByText('Step 1: Create World')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Create Nodes')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Create Interactions')).toBeInTheDocument();
    expect(screen.getByText('Step 4: Create Characters')).toBeInTheDocument();
    expect(screen.getByText('Step 5: Populate Nodes')).toBeInTheDocument();
    expect(screen.getByText('Step 6: Simulation Ready')).toBeInTheDocument();
  });

  test('renders validation panel with current step requirements', () => {
    render(<WorldBuilderInterface />);
    
    // Check validation panel
    expect(screen.getByText('Validation Status')).toBeInTheDocument();
    expect(screen.getByText('Current Step: Create World Properties')).toBeInTheDocument();
    expect(screen.getByText('Set world name, description, rules, and initial conditions')).toBeInTheDocument();
    expect(screen.getByText('Status: Incomplete')).toBeInTheDocument();
  });

  test('renders step 1 world properties editor', () => {
    render(<WorldBuilderInterface />);
    
    // Check step 1 content
    expect(screen.getByText('Step 1: World Properties')).toBeInTheDocument();
    expect(screen.getByText(/Define the basic properties of your world/)).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText('World Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('World Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('World Rules')).toBeInTheDocument();
    expect(screen.getByLabelText('Initial Conditions')).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByText('Save World Properties')).toBeInTheDocument();
  });

  test('handles world properties form submission', async () => {
    const mockSetWorldProperties = jest.fn();
    const mockSetRules = jest.fn();
    const mockSetInitialConditions = jest.fn();
    
    // Update the mock to return our custom functions
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      setWorldProperties: mockSetWorldProperties,
      setRules: mockSetRules,
      setInitialConditions: mockSetInitialConditions
    });

    render(<WorldBuilderInterface />);
    
    // Fill in form fields
    const nameInput = screen.getByLabelText('World Name *');
    const descriptionInput = screen.getByLabelText('World Description *');
    const rulesInput = screen.getByLabelText('World Rules');
    
    fireEvent.change(nameInput, { target: { value: 'Test World' } });
    fireEvent.change(descriptionInput, { target: { value: 'A test world for testing' } });
    fireEvent.change(rulesInput, { target: { value: '{"timeProgression": "realtime"}' } });
    
    // Submit form
    const submitButton = screen.getByText('Save World Properties');
    fireEvent.click(submitButton);
    
    // Check that methods were called
    await waitFor(() => {
      expect(mockSetWorldProperties).toHaveBeenCalledWith('Test World', 'A test world for testing');
    });
  });

  test('handles step navigation', () => {
    const mockProceedToStep = jest.fn();
    const mockCanProceedToStep = jest.fn((step) => step <= 2);
    
    // Update the mock
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      proceedToStep: mockProceedToStep,
      canProceedToStep: mockCanProceedToStep,
      currentStep: 1
    });

    render(<WorldBuilderInterface />);
    
    // Try to click on step 2 (should be accessible)
    const step2Indicator = screen.getByRole('button', { name: /Step 2: Create Nodes/i }) || 
                          screen.getByText('Step 2: Create Nodes');
    fireEvent.click(step2Indicator);
    
    expect(mockProceedToStep).toHaveBeenCalledWith(2);
  });

  test('displays error messages', () => {
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      error: 'Test error message'
    });

    render(<WorldBuilderInterface />);
    
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      isLoading: true
    });

    render(<WorldBuilderInterface />);
    
    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });

  test('handles reset builder action', () => {
    const mockResetBuilder = jest.fn();
    
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      resetBuilder: mockResetBuilder
    });

    render(<WorldBuilderInterface />);
    
    const resetButton = screen.getByText('Reset Builder');
    fireEvent.click(resetButton);
    
    expect(mockResetBuilder).toHaveBeenCalled();
  });

  test('handles save as template action', () => {
    const mockSaveAsTemplate = jest.fn();
    
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      saveAsTemplate: mockSaveAsTemplate,
      worldConfig: {
        ...useWorldBuilder().worldConfig,
        name: 'Test World'
      }
    });

    render(<WorldBuilderInterface />);
    
    const saveButton = screen.getByText('Save as Template');
    fireEvent.click(saveButton);
    
    expect(mockSaveAsTemplate).toHaveBeenCalledWith('world', 'Test World', 'Custom world template');
  });

  test('shows different content for different steps', () => {
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    
    // Test step 2
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      currentStep: 2,
      currentStepRequirements: {
        title: 'Create Nodes',
        description: 'Add abstract locations/contexts to your world',
        required: ['At least one node'],
        completed: false
      }
    });

    const { rerender } = render(<WorldBuilderInterface />);
    
    expect(screen.getByText('Step 2: Create Nodes')).toBeInTheDocument();
    expect(screen.getByText(/Add abstract locations\/contexts to your world/)).toBeInTheDocument();
    
    // Test step 6
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      currentStep: 6,
      isWorldComplete: true,
      currentStepRequirements: {
        title: 'Simulation Ready',
        description: 'World is ready for simulation',
        required: ['All previous steps completed'],
        completed: true
      }
    });

    rerender(<WorldBuilderInterface />);
    
    expect(screen.getByText('Step 6: Simulation Ready')).toBeInTheDocument();
    expect(screen.getByText('Build World & Start Simulation')).toBeInTheDocument();
  });

  test('handles world building completion', () => {
    const mockBuildWorld = jest.fn(() => ({ id: 'test-world' }));
    const mockValidateWorld = jest.fn(() => ({ isValid: true }));
    const mockOnWorldReady = jest.fn();
    
    const useWorldBuilder = require('../hooks/useWorldBuilder');
    useWorldBuilder.mockReturnValue({
      ...useWorldBuilder(),
      currentStep: 6,
      isWorldComplete: true,
      buildWorld: mockBuildWorld,
      validateWorld: mockValidateWorld
    });

    render(<WorldBuilderInterface onWorldReady={mockOnWorldReady} />);
    
    const buildButton = screen.getByText('Build World & Start Simulation');
    fireEvent.click(buildButton);
    
    expect(mockValidateWorld).toHaveBeenCalled();
    expect(mockBuildWorld).toHaveBeenCalled();
    expect(mockOnWorldReady).toHaveBeenCalledWith({ id: 'test-world' });
  });
});