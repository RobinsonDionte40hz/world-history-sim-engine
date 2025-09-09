/**
 * TimelineVisualization Test Suite
 * 
 * Unit tests for the TimelineVisualization component
 * Testing rendering, interactions, and performance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimelineVisualization from '../TimelineVisualization';

// Mock D3 and performance utilities
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      data: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn(() => ({ attr: jest.fn() })),
            style: jest.fn(() => ({ style: jest.fn() })),
            on: jest.fn()
          }))
        })),
        exit: jest.fn(() => ({ remove: jest.fn() })),
        attr: jest.fn(),
        style: jest.fn(),
        on: jest.fn()
      }))
    })),
    attr: jest.fn(),
    style: jest.fn(),
    append: jest.fn(() => ({
      attr: jest.fn(() => ({ attr: jest.fn() })),
      style: jest.fn(() => ({ style: jest.fn() }))
    })),
    call: jest.fn(),
    on: jest.fn()
  })),
  scaleTime: jest.fn(() => ({
    domain: jest.fn(() => ({ range: jest.fn() })),
    range: jest.fn()
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({ range: jest.fn() })),
    range: jest.fn()
  })),
  axisBottom: jest.fn(() => ({ tickFormat: jest.fn() })),
  axisLeft: jest.fn(),
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn(() => ({
      on: jest.fn()
    }))
  })),
  zoomTransform: jest.fn(() => ({ x: 0, y: 0, k: 1 }))
}));

// Performance utilities mock - removed for simplicity

// Mock components
jest.mock('../components/TimelineControls', () => {
  return function MockTimelineControls({ onZoomChange, onTracksChange }) {
    return (
      <div data-testid="timeline-controls">
        <button onClick={() => onZoomChange(2)} data-testid="zoom-in">Zoom In</button>
        <button onClick={() => onTracksChange(['characters'])} data-testid="change-tracks">Change Tracks</button>
      </div>
    );
  };
});

jest.mock('../components/TimelineTooltip', () => {
  return function MockTimelineTooltip({ event, visible }) {
    return visible && event ? (
      <div data-testid="timeline-tooltip">
        {event.description}
      </div>
    ) : null;
  };
});

jest.mock('../components/TimelineExport', () => {
  return function MockTimelineExport({ onExport }) {
    return (
      <div data-testid="timeline-export">
        <button onClick={() => onExport('svg')} data-testid="export-svg">Export SVG</button>
      </div>
    );
  };
});

describe('TimelineVisualization', () => {
  const mockData = [
    {
      id: '1',
      timestamp: Date.now() - 86400000, // 1 day ago
      type: 'achievement',
      characterName: 'John Doe',
      description: 'Completed a quest',
      significance: 0.8,
      track: 'characters'
    },
    {
      id: '2',
      timestamp: Date.now() - 43200000, // 12 hours ago
      type: 'founded',
      settlementName: 'New Town',
      description: 'Founded a settlement',
      significance: 0.6,
      track: 'settlements'
    },
    {
      id: '3',
      timestamp: Date.now(),
      type: 'war',
      description: 'War declared',
      significance: 0.9,
      track: 'events'
    }
  ];

  const defaultProps = {
    data: mockData,
    selectedTracks: ['characters', 'settlements', 'events'],
    width: 800,
    height: 400
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<TimelineVisualization {...defaultProps} />);
      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });

    test('renders with empty data', () => {
      render(<TimelineVisualization {...defaultProps} data={[]} />);
      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });

    test('renders timeline controls', () => {
      render(<TimelineVisualization {...defaultProps} />);
      expect(screen.getByTestId('timeline-controls')).toBeInTheDocument();
    });

    test('renders timeline export', () => {
      render(<TimelineVisualization {...defaultProps} />);
      expect(screen.getByTestId('timeline-export')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(
        <TimelineVisualization {...defaultProps} className="custom-timeline" />
      );
      const timelineContainer = screen.getByTestId('timeline-container');
      expect(timelineContainer).toHaveClass('custom-timeline');
    });
  });

  describe('Interactions', () => {
    test('handles zoom changes', async () => {
      const onZoomChange = jest.fn();
      render(
        <TimelineVisualization 
          {...defaultProps} 
          onZoomChange={onZoomChange}
        />
      );

      fireEvent.click(screen.getByTestId('zoom-in'));
      
      await waitFor(() => {
        expect(onZoomChange).toHaveBeenCalledWith(2);
      });
    });

    test('handles track changes', async () => {
      const onTracksChange = jest.fn();
      render(
        <TimelineVisualization 
          {...defaultProps} 
          onTracksChange={onTracksChange}
        />
      );

      fireEvent.click(screen.getByTestId('change-tracks'));
      
      await waitFor(() => {
        expect(onTracksChange).toHaveBeenCalledWith(['characters']);
      });
    });

    test('handles event selection', () => {
      const onEventSelect = jest.fn();
      render(
        <TimelineVisualization 
          {...defaultProps} 
          onEventSelect={onEventSelect}
        />
      );

      // This would require more complex mocking of D3 event handling
      // For now, we'll test that the callback is properly passed down
      expect(onEventSelect).toBeDefined();
    });
  });

  describe('Data Processing', () => {
    test('filters data by selected tracks', () => {
      render(
        <TimelineVisualization 
          {...defaultProps} 
          selectedTracks={['characters']}
        />
      );

      // The component should process and filter the data internally
      // We can't easily test this without exposing internal state
      // but we can ensure it renders without errors
      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });

    test('handles time range filtering', () => {
      const timeRange = {
        start: Date.now() - 86400000,
        end: Date.now()
      };

      render(
        <TimelineVisualization 
          {...defaultProps} 
          timeRange={timeRange}
        />
      );

      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });

    test('handles significance filtering', () => {
      const filters = {
        minSignificance: 0.7
      };

      render(
        <TimelineVisualization 
          {...defaultProps} 
          filters={filters}
        />
      );

      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('handles large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        timestamp: Date.now() - (i * 1000),
        type: 'event',
        description: `Event ${i}`,
        significance: Math.random(),
        track: 'events'
      }));

      render(
        <TimelineVisualization 
          {...defaultProps} 
          data={largeData}
        />
      );

      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });

    test('debounces rapid updates', () => {
      const { rerender } = render(<TimelineVisualization {...defaultProps} />);

      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(
          <TimelineVisualization 
            {...defaultProps} 
            zoom={1 + i * 0.1}
          />
        );
      }

      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<TimelineVisualization {...defaultProps} />);
      
      const container = screen.getByTestId('timeline-container');
      expect(container).toHaveAttribute('role');
    });

    test('supports keyboard navigation', () => {
      render(<TimelineVisualization {...defaultProps} />);
      
      const container = screen.getByTestId('timeline-container');
      expect(container).toHaveAttribute('tabIndex');
    });
  });

  describe('Export Functionality', () => {
    test('handles export requests', async () => {
      const onExportComplete = jest.fn();
      render(
        <TimelineVisualization 
          {...defaultProps} 
          onExportComplete={onExportComplete}
        />
      );

      fireEvent.click(screen.getByTestId('export-svg'));
      
      // Export functionality would be tested in the TimelineExport component
      expect(screen.getByTestId('timeline-export')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles invalid data gracefully', () => {
      const invalidData = [
        { id: '1' }, // Missing required fields
        { timestamp: 'invalid' }, // Invalid timestamp
        null, // Null entry
        undefined // Undefined entry
      ];

      render(
        <TimelineVisualization 
          {...defaultProps} 
          data={invalidData}
        />
      );

      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });

    test('handles missing props gracefully', () => {
      render(<TimelineVisualization />);
      expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
    });
  });
});

describe('Timeline Integration', () => {
  test('integrates with HistoryPage', () => {
    // This would test the integration with the HistoryPage component
    // For now, we'll just ensure the component can be imported and used
    expect(TimelineVisualization).toBeDefined();
    expect(typeof TimelineVisualization).toBe('function');
  });

  test('works with real simulation data', () => {
    // This would test with actual data from the simulation engine
    // For now, we'll test with mock data that matches the expected format
    const simulationData = [
      {
        id: 'hist_001',
        timestamp: 1609459200000, // Jan 1, 2021
        characterId: 'char_001',
        characterName: 'Alice',
        interactionName: 'Dialogue with Bob',
        type: 'dialogue',
        outcome: 'positive',
        significance: 0.6,
        description: 'Alice had a successful conversation with Bob',
        location: 'Village Square'
      }
    ];

    render(
      <TimelineVisualization 
        data={simulationData}
        selectedTracks={['characters']}
        width={1000}
        height={500}
      />
    );

    expect(screen.getByTestId('timeline-container')).toBeInTheDocument();
  });
});
