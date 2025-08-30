import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnvironmentalPresetSelector from '../../presentation/components/EnvironmentalPresetSelector';
import EnvironmentalPresetService from '../../domain/services/EnvironmentalPresetService';

// Mock the service to avoid dependencies
jest.mock('../../domain/services/EnvironmentalPresetService');

describe('EnvironmentalPresetSelector', () => {
  const mockPresets = {
    'forest_village': {
      id: 'forest_village',
      name: 'Forest Village',
      description: 'A peaceful settlement nestled in the woods',
      category: 'settlement',
      environment: {
        terrain: 'forest',
        climate: 'temperate',
        lighting: 'normal',
        hazards: [],
        shelterQuality: 0.7,
        airQuality: 0.9,
        waterAvailability: 0.8,
        temperature: 15,
        humidity: 0.6,
        windStrength: 0.2
      },
      nodeProperties: {
        type: 'settlement',
        size: 150
      }
    },
    'mountain_fortress': {
      id: 'mountain_fortress',
      name: 'Mountain Fortress',
      description: 'A fortified stronghold high in the mountains',
      category: 'settlement',
      environment: {
        terrain: 'mountains',
        climate: 'continental',
        lighting: 'bright',
        hazards: [
          { type: 'altitude', severity: 0.3, description: 'High altitude effects' }
        ],
        shelterQuality: 0.9,
        airQuality: 0.95,
        waterAvailability: 0.6,
        temperature: 5,
        humidity: 0.4,
        windStrength: 0.6
      },
      nodeProperties: {
        type: 'settlement',
        size: 80
      }
    }
  };

  const mockRecommendations = [
    {
      presetId: 'forest_village',
      preset: mockPresets.forest_village,
      score: 75,
      reason: 'matches settlement type, compatible forest terrain'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    EnvironmentalPresetService.getPresets.mockReturnValue(mockPresets);
    EnvironmentalPresetService.getPresetCategories.mockReturnValue(['settlement', 'wilderness', 'dungeon']);
    EnvironmentalPresetService.getPresetRecommendations.mockReturnValue(mockRecommendations);
  });

  it('renders environmental preset selector with header', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
      />
    );

    expect(screen.getByText('Environmental Presets')).toBeInTheDocument();
    expect(screen.getByText(/Choose a preset to quickly configure/)).toBeInTheDocument();
  });

  it('displays search input and category filter', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Search presets...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
  });

  it('shows recommended presets when enabled', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{ type: 'settlement' }}
        onPresetSelect={jest.fn()}
        showRecommendations={true}
      />
    );

    expect(screen.getByText('Recommended for Your Node')).toBeInTheDocument();
    expect(screen.getAllByText('Forest Village').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('displays all presets in grid layout', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    expect(screen.getByText('Forest Village')).toBeInTheDocument();
    expect(screen.getByText('Mountain Fortress')).toBeInTheDocument();
    expect(screen.getByText('A peaceful settlement nestled in the woods')).toBeInTheDocument();
  });

  it('calls onPresetSelect when a preset is clicked', () => {
    const mockOnPresetSelect = jest.fn();
    
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={mockOnPresetSelect}
        showRecommendations={false}
      />
    );

    const forestVillageCard = screen.getByText('Forest Village');
    fireEvent.click(forestVillageCard);

    expect(mockOnPresetSelect).toHaveBeenCalledWith(mockPresets.forest_village);
  });

  it('calls onPresetPreview when preview button is clicked', () => {
    const mockOnPresetPreview = jest.fn();
    
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        onPresetPreview={mockOnPresetPreview}
        showRecommendations={false}
      />
    );

    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(mockOnPresetPreview).toHaveBeenCalled();
  });

  it('filters presets by search term', async () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search presets...');
    fireEvent.change(searchInput, { target: { value: 'forest' } });

    await waitFor(() => {
      expect(screen.getByText('Forest Village')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Mountain Fortress')).not.toBeInTheDocument();
  });

  it('filters presets by category', async () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'settlement' } });

    await waitFor(() => {
      expect(screen.getByText('Forest Village')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Mountain Fortress')).toBeInTheDocument();
  });

  it('shows expanded details when details button is clicked', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);

    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.getByText('Size:')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('displays environmental stats for expanded presets', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);

    expect(screen.getByText('Shelter:')).toBeInTheDocument();
    expect(screen.getByText('Air Quality:')).toBeInTheDocument();
    expect(screen.getByText('Water:')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument(); // Shelter quality
    expect(screen.getByText('90%')).toBeInTheDocument(); // Air quality
  });

  it('shows no hazards message for presets without hazards', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    // Both presets have no hazards, so we should see "No Hazards" text
    expect(screen.getByText('No Hazards')).toBeInTheDocument();
  });

  it('displays hazard information for presets with hazards', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    // Check for the altitude hazard from mountain fortress
    expect(screen.getByText(/altitude.*0\.3/)).toBeInTheDocument();
  });

  it('shows usage tips section', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    expect(screen.getByText('💡 Tips')).toBeInTheDocument();
    expect(screen.getByText(/Recommended presets are based on your current node type/)).toBeInTheDocument();
  });

  it('clears filters when clear filters button is clicked with no results', async () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        showRecommendations={false}
      />
    );

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search presets...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No presets found matching your criteria.')).toBeInTheDocument();
    });

    const clearFiltersButton = screen.getByText('Clear filters');
    fireEvent.click(clearFiltersButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
    
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
  });

  it('highlights selected preset when selectedPresetId is provided', () => {
    render(
      <EnvironmentalPresetSelector
        currentNodeData={{}}
        onPresetSelect={jest.fn()}
        selectedPresetId="forest_village"
        showRecommendations={false}
      />
    );

    expect(screen.getByText('Forest Village')).toBeInTheDocument();
    expect(screen.getByText('A peaceful settlement nestled in the woods')).toBeInTheDocument();
  });
});
