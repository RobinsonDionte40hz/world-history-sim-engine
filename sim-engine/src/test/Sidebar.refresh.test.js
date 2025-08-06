/**
 * Sidebar Refresh Button Tests
 * 
 * Tests for the refresh buttons added to the Sidebar component
 * for testing world context refresh functionality.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../presentation/UI/Sidebar';
import { useWorldContext } from '../presentation/hooks/useWorldContext';
import { useWorldSave } from '../presentation/hooks/useWorldSave';

// Mock the hooks
jest.mock('../presentation/hooks/useWorldContext');
jest.mock('../presentation/hooks/useWorldSave');
jest.mock('../presentation/components/WorldSelector', () => {
  return function MockWorldSelector() {
    return <div data-testid="world-selector">World Selector</div>;
  };
});

// Mock console.log to verify it's called
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

const renderSidebar = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    menuItems: [],
    title: "Test Sidebar",
    showTip: true,
    ...props
  };

  return render(
    <BrowserRouter>
      <Sidebar {...defaultProps} />
    </BrowserRouter>
  );
};

describe('Sidebar Refresh Buttons', () => {
  const mockRefreshWorldContext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    useWorldContext.mockReturnValue({
      currentWorld: {
        id: 'test-world-123',
        name: 'Test World',
        description: 'A test world for refresh testing'
      },
      worldNodes: [{ id: 'node1' }, { id: 'node2' }],
      worldCharacters: [{ id: 'char1' }],
      worldInteractions: [{ id: 'int1' }, { id: 'int2' }, { id: 'int3' }],
      isLoading: false,
      hasWorld: true,
      refreshWorldContext: mockRefreshWorldContext
    });
    
    useWorldSave.mockReturnValue({
      navigateToEditor: jest.fn(),
      hasUnsavedChanges: false
    });
  });

  describe('Worlds Tab Refresh Button', () => {
    test('should show refresh button in worlds tab when world exists', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should show the refresh button in the header
      expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
    });

    test('should call refreshWorldContext when clicked in worlds tab', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click the refresh button
      fireEvent.click(screen.getByText('🔄 Refresh'));
      
      // Should call the refresh function
      expect(mockRefreshWorldContext).toHaveBeenCalled();
      
      // Should log to console
      expect(console.log).toHaveBeenCalledWith('Manually refreshed world context');
    });

    test('should not show refresh button when no world exists', () => {
      useWorldContext.mockReturnValue({
        currentWorld: null,
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: false,
        hasWorld: false,
        refreshWorldContext: mockRefreshWorldContext
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should not show the refresh button
      expect(screen.queryByText('🔄 Refresh')).not.toBeInTheDocument();
    });

    test('should have proper tooltip on refresh button', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Check tooltip
      const refreshButton = screen.getByText('🔄 Refresh');
      expect(refreshButton).toHaveAttribute('title', 'Refresh world data');
    });
  });

  describe('Tools Tab Refresh Button', () => {
    test('should show refresh button in tools tab when world exists', () => {
      renderSidebar();
      
      // Switch to tools tab (should be default, but click to be sure)
      fireEvent.click(screen.getByText('Tools'));
      
      // Should show the refresh button
      expect(screen.getByText('🔄 Refresh Context')).toBeInTheDocument();
    });

    test('should call refreshWorldContext when clicked in tools tab', () => {
      renderSidebar();
      
      // Switch to tools tab
      fireEvent.click(screen.getByText('Tools'));
      
      // Click the refresh button
      fireEvent.click(screen.getByText('🔄 Refresh Context'));
      
      // Should call the refresh function
      expect(mockRefreshWorldContext).toHaveBeenCalled();
      
      // Should log to console with different message
      expect(console.log).toHaveBeenCalledWith('Manually refreshed world context from tools tab');
    });

    test('should disable refresh button when loading', () => {
      useWorldContext.mockReturnValue({
        currentWorld: {
          id: 'test-world-123',
          name: 'Test World',
          description: 'A test world'
        },
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: true, // Loading state
        hasWorld: true,
        refreshWorldContext: mockRefreshWorldContext
      });

      renderSidebar();
      
      // Switch to tools tab
      fireEvent.click(screen.getByText('Tools'));
      
      // Refresh button should be disabled
      const refreshButton = screen.getByText('🔄 Refresh Context');
      expect(refreshButton).toBeDisabled();
    });

    test('should have proper tooltip on tools refresh button', () => {
      renderSidebar();
      
      // Switch to tools tab
      fireEvent.click(screen.getByText('Tools'));
      
      // Check tooltip
      const refreshButton = screen.getByText('🔄 Refresh Context');
      expect(refreshButton).toHaveAttribute('title', 'Refresh world context data');
    });

    test('should not show tools refresh button when no world exists', () => {
      useWorldContext.mockReturnValue({
        currentWorld: null,
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: false,
        hasWorld: false,
        refreshWorldContext: mockRefreshWorldContext
      });

      renderSidebar();
      
      // Switch to tools tab
      fireEvent.click(screen.getByText('Tools'));
      
      // Should not show the refresh button
      expect(screen.queryByText('🔄 Refresh Context')).not.toBeInTheDocument();
    });
  });

  describe('Refresh Button Styling', () => {
    test('should have proper styling classes for worlds tab button', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      const refreshButton = screen.getByText('🔄 Refresh');
      expect(refreshButton).toHaveClass('text-xs', 'text-blue-400', 'hover:text-blue-300', 'transition-colors');
    });

    test('should have proper inline styles for tools tab button', () => {
      renderSidebar();
      
      // Switch to tools tab
      fireEvent.click(screen.getByText('Tools'));
      
      const refreshButton = screen.getByText('🔄 Refresh Context');
      
      // Check some key style properties
      expect(refreshButton).toHaveStyle({
        width: '100%',
        textAlign: 'center',
        fontSize: '0.75rem'
      });
    });
  });

  describe('Multiple Refresh Buttons', () => {
    test('should have both refresh buttons when world exists', () => {
      renderSidebar();
      
      // Check worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
      
      // Check tools tab
      fireEvent.click(screen.getByText('Tools'));
      expect(screen.getByText('🔄 Refresh Context')).toBeInTheDocument();
    });

    test('should call refresh function from both buttons', () => {
      renderSidebar();
      
      // Test worlds tab button
      fireEvent.click(screen.getByText('Worlds'));
      fireEvent.click(screen.getByText('🔄 Refresh'));
      expect(mockRefreshWorldContext).toHaveBeenCalledTimes(1);
      
      // Test tools tab button
      fireEvent.click(screen.getByText('Tools'));
      fireEvent.click(screen.getByText('🔄 Refresh Context'));
      expect(mockRefreshWorldContext).toHaveBeenCalledTimes(2);
    });
  });
});