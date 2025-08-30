import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NodeEditor from '../../presentation/components/NodeEditor';
import Environment from '../../domain/value-objects/Environment';
import EnvironmentalPresetService from '../../domain/services/EnvironmentalPresetService';

// Mock dependencies
jest.mock('../../domain/services/EnvironmentalPresetService');
jest.mock('../../domain/services/WorldValidator', () => ({
  validateSingleNode: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: []
  }))
}));
jest.mock('../../presentation/hooks/useTemplates', () => ({
  __esModule: true,
  default: () => ({
    saveTemplate: jest.fn(),
    loadTemplate: jest.fn()
  })
}));
jest.mock('../../presentation/components/TemplateLibraryPanel', () => {
  return function MockTemplateLibraryPanel() {
    return <div data-testid="template-library-panel">Template Library Panel</div>;
  };
});
jest.mock('../../presentation/components/EnvironmentalPresetSelector', () => {
  return function MockEnvironmentalPresetSelector() {
    return <div data-testid="environmental-preset-selector">Environmental Preset Selector</div>;
  };
});

// Mock Environment
jest.mock('../../domain/value-objects/Environment');

// Mock EnvironmentalHazard
jest.mock('../../domain/entities/EnvironmentalHazard', () => {
  return jest.fn().mockImplementation((data) => ({
    type: data.type,
    severity: data.severity,
    description: data.description,
    toJSON: () => ({
      type: data.type,
      severity: data.severity,
      description: data.description
    })
  }));
});

describe('NodeEditor Environmental Controls', () => {
  const mockEnvironment = {
    terrain: 'forest',
    climate: 'temperate',
    lighting: 'normal',
    density: 0.6,
    shelterQuality: 0.7,
    airQuality: 0.9,
    waterAvailability: 0.8,
    temperature: 15,
    humidity: 0.6,
    windStrength: 0.2,
    hazards: []
  };

  const mockNode = {
    id: 'test_node',
    name: 'Test Node',
    description: 'A test node for environmental controls',
    type: 'settlement',
    environment: mockEnvironment,
    size: 150,
    populationCapacity: 1000,
    features: [],
    resources: [],
    modifiers: {},
    connections: [],
    tags: [],
    metadata: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Environment methods
    Environment.createDefault.mockReturnValue(mockEnvironment);
    Environment.fromJSON.mockReturnValue({
      ...mockEnvironment,
      toJSON: () => mockEnvironment,
      isHospitable: () => true,
      isDangerous: () => false,
      getComfortLevel: () => 0.75,
      hazards: []
    });

    // Mock EnvironmentalPresetService
    EnvironmentalPresetService.applyPreset.mockReturnValue({
      ...mockNode,
      environment: mockEnvironment
    });
  });

  it('renders Environment tab in tab navigation', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText('🌍')).toBeInTheDocument();
  });

  it('shows environmental controls when Environment tab is active', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    expect(screen.getByText('Manual Environmental Configuration')).toBeInTheDocument();
    expect(screen.getByText('Terrain Type')).toBeInTheDocument();
    expect(screen.getByText('Climate Type')).toBeInTheDocument();
    expect(screen.getByText('Lighting Conditions')).toBeInTheDocument();
  });

  it('displays environmental property sliders with correct values', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    expect(screen.getByText('Density (60%)')).toBeInTheDocument();
    expect(screen.getByText('Shelter Quality (70%)')).toBeInTheDocument();
    expect(screen.getByText('Air Quality (90%)')).toBeInTheDocument();
    expect(screen.getByText('Water Availability (80%)')).toBeInTheDocument();
    expect(screen.getByText('Humidity (60%)')).toBeInTheDocument();
    expect(screen.getByText('Wind Strength (20%)')).toBeInTheDocument();
  });

  it('displays temperature control with correct value', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    expect(screen.getByText('Temperature (15°C)')).toBeInTheDocument();
  });

  it('shows node size input with correct value', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    const sizeInput = screen.getByDisplayValue('150');
    expect(sizeInput).toBeInTheDocument();
  });

  it('updates environmental properties when sliders are changed', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        onChange={mockOnChange}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    // Find all sliders and get the first one (density slider)
    const sliders = screen.getAllByDisplayValue('0.6');
    const densitySlider = sliders[0]; // First slider should be density
    
    fireEvent.change(densitySlider, { target: { value: '0.8' } });

    await waitFor(() => {
      expect(Environment.fromJSON).toHaveBeenCalled();
    });
  });

  it('updates terrain type when dropdown is changed', async () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    // Find terrain dropdown (it should show a terrain description)
    const terrainSelect = screen.getByDisplayValue(/Dense woodlands/);
    fireEvent.change(terrainSelect, { target: { value: 'mountains' } });

    await waitFor(() => {
      expect(Environment.fromJSON).toHaveBeenCalled();
    });
  });

  it('displays environmental status in preview panel', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Size:')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Temperature:')).toBeInTheDocument();
    expect(screen.getByText('15°C')).toBeInTheDocument();
  });

  it('shows environmental status indicators in preview', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    expect(screen.getByText('Hospitable')).toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.getByText('Comfort: 75%')).toBeInTheDocument();
  });

  it('handles hazards display in preview when present', () => {
    const nodeWithHazards = {
      ...mockNode,
      environment: {
        ...mockEnvironment,
        hazards: [
          { type: 'altitude', severity: 0.3, description: 'High altitude effects' }
        ]
      }
    };

    // Mock Environment instance with hazards
    Environment.fromJSON.mockReturnValue({
      ...mockEnvironment,
      hazards: [{ type: 'altitude', severity: 0.3, description: 'High altitude effects' }],
      toJSON: () => nodeWithHazards.environment,
      isHospitable: () => true,
      isDangerous: () => false,
      getComfortLevel: () => 0.65
    });

    render(
      <NodeEditor
        initialNode={nodeWithHazards}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    expect(screen.getByText('1 Hazard')).toBeInTheDocument();
  });

  it('updates node size when size input is changed', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        onChange={mockOnChange}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    const sizeInput = screen.getByDisplayValue('150');
    fireEvent.change(sizeInput, { target: { value: '200' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('initializes with default environment when no environment provided', () => {
    const nodeWithoutEnvironment = {
      ...mockNode,
      environment: undefined
    };

    render(
      <NodeEditor
        initialNode={nodeWithoutEnvironment}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    expect(Environment.createDefault).toHaveBeenCalled();
  });

  it('maintains environmental data structure consistency', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    // Verify that environmental controls are present and accessible
    expect(screen.getByText('Terrain Type')).toBeInTheDocument();
    expect(screen.getByText('Climate Type')).toBeInTheDocument();
    expect(screen.getByText('Lighting Conditions')).toBeInTheDocument();
    expect(screen.getByText('Node Size')).toBeInTheDocument();
  });

  it('displays hazard management interface', () => {
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    expect(screen.getByText('Environmental Hazards')).toBeInTheDocument();
    expect(screen.getByText('Add New Hazard')).toBeInTheDocument();
    expect(screen.getByText('Hazard Type')).toBeInTheDocument();
    expect(screen.getByText(/Severity/)).toBeInTheDocument();
  });

  it('allows adding new hazards', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <NodeEditor
        initialNode={mockNode}
        onSave={jest.fn()}
        onChange={mockOnChange}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    // Find and click the add hazard button
    const addHazardButton = screen.getByRole('button', { name: /Add Hazard/ });
    fireEvent.click(addHazardButton);

    await waitFor(() => {
      expect(Environment.fromJSON).toHaveBeenCalled();
    });
  });

  it('displays existing hazards when present', () => {
    const nodeWithHazards = {
      ...mockNode,
      environment: {
        ...mockEnvironment,
        hazards: [
          { type: 'extreme_heat', severity: 0.7, description: 'Dangerous heat levels' }
        ]
      }
    };

    render(
      <NodeEditor
        initialNode={nodeWithHazards}
        onSave={jest.fn()}
        mode="edit"
      />
    );

    // Click the Environment tab
    const environmentTab = screen.getByRole('button', { name: /🌍 Environment/ });
    fireEvent.click(environmentTab);

    expect(screen.getByText('Hazard Summary (1 hazard)')).toBeInTheDocument();
  });
});
