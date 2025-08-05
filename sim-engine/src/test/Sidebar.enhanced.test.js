/**
 * Enhanced Sidebar Tests
 * 
 * Tests the enhanced Sidebar component with loading state handling
 * and manual refresh capabilities.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../presentation/UI/Sidebar';
import { useWorldContext } from '../presentation/hooks/useWorldContext';
import { useWorldSave } from '../presentation/hooks/useWorldSave';

// Mock the hooks
jest.mock('../presentation/hooks/useWorldContext');
jest.mock('../presentation/hooks/useWorldSave');
jest.mock('../presentation/components/WorldSelector', () => {
  return function MockWorldSelector({ disabled, onWorldSelected, onCreateNew }) {
    return (
      <div data-testid="world-selector">
        <button 
          data-testid="select-world-btn" 
          disabled={disabled}
          onClick={() => onWorldSelected({ id: 'test-world', name: 'Test World' })}
        >
          Select World
        </button>
        <button 
          data-testid="create-new-btn" 
          disabled={disabled}
          onClick={onCreateNew}
        >
          Create New
        </button>
      </div>
    );
  };
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

describe('Enhanced Sidebar - Loading States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    useWorldContext.mockReturnValue({
      currentWorld: null,
      worldNodes: [],
      worldCharacters: [],
      worldInteractions: [],
      isLoading: false,
      hasWorld: false,
      refreshWorldContext: jest.fn()
    });
    
    useWorldSave.mockReturnValue({
      navigateToEditor: jest.fn(),
      hasUnsavedChanges: false
    });
  });

  describe('Loading State Display', () => {
    test('should show loading spinner when world is loading', () => {
      useWorldContext.mockReturnValue({
        currentWorld: null,
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: true,
        hasWorld: true,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should show loading spinner
      expect(screen.getByText('Loading world...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    test('should show world info when loaded', () => {
      const mockWorld = {
        id: 'world-123',
        name: 'Test World',
        description: 'A test world for testing'
      };

      useWorldContext.mockReturnValue({
        currentWorld: mockWorld,
        worldNodes: [{ id: 'node1' }, { id: 'node2' }],
        worldCharacters: [{ id: 'char1' }],
        worldInteractions: [{ id: 'int1' }, { id: 'int2' }, { id: 'int3' }],
        isLoading: false,
        hasWorld: true,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should show world info
      expect(screen.getByText('Test World')).toBeInTheDocument();
      expect(screen.getByText('A test world for testing')).toBeInTheDocument();
      
      // Should show stats
      expect(screen.getByText('2')).toBeInTheDocument(); // Nodes count
      expect(screen.getByText('1')).toBeInTheDocument(); // Characters count
      expect(screen.getByText('3')).toBeInTheDocument(); // Interactions count
    });

    test('should disable buttons when loading', () => {
      useWorldContext.mockReturnValue({
        currentWorld: { id: 'world-123', name: 'Test World', description: 'Test' },
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: true,
        hasWorld: true,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Quick action buttons should be disabled
      const nodeButton = screen.getByRole('button', { name: /Nodes/i });
      const characterButton = screen.getByRole('button', { name: /Characters/i });
      const interactionButton = screen.getByRole('button', { name: /Interactions/i });
      
      expect(nodeButton).toBeDisabled();
      expect(characterButton).toBeDisabled();
      expect(interactionButton).toBeDisabled();
    });

    test('should disable WorldSelector when loading', () => {
      useWorldContext.mockReturnValue({
        currentWorld: null,
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: true,
        hasWorld: false,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // WorldSelector buttons should be disabled
      expect(screen.getByTestId('select-world-btn')).toBeDisabled();
      expect(screen.getByTestId('create-new-btn')).toBeDisabled();
    });
  });

  describe('Manual Refresh Functionality', () => {
    test('should call refreshWorldContext when sidebar opens with world', async () => {
      const mockRefresh = jest.fn();
      
      useWorldContext.mockReturnValue({
        currentWorld: { id: 'world-123', name: 'Test World' },
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: false,
        hasWorld: true,
        refreshWorldContext: mockRefresh
      });

      // Render with sidebar closed first
      const { rerender } = renderSidebar({ isOpen: false });
      
      expect(mockRefresh).not.toHaveBeenCalled();
      
      // Open sidebar
      rerender(
        <BrowserRouter>
          <Sidebar isOpen={true} onClose={jest.fn()} />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    test('should show refresh button when world is loaded', () => {
      useWorldContext.mockReturnValue({
        currentWorld: { id: 'world-123', name: 'Test World' },
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: false,
        hasWorld: true,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should show refresh button
      expect(screen.getByText('Refresh World Data')).toBeInTheDocument();
    });

    test('should call refreshWorldContext when refresh button is clicked', () => {
      const mockRefresh = jest.fn();
      
      useWorldContext.mockReturnValue({
        currentWorld: { id: 'world-123', name: 'Test World' },
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: false,
        hasWorld: true,
        refreshWorldContext: mockRefresh
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click refresh button
      fireEvent.click(screen.getByText('Refresh World Data'));
      
      expect(mockRefresh).toHaveBeenCalledWith();
    });

    test('should not show refresh button when loading', () => {
      useWorldContext.mockReturnValue({
        currentWorld: { id: 'world-123', name: 'Test World' },
        worldNodes: [],
        worldCharacters: [],
        worldInteractions: [],
        isLoading: true,
        hasWorld: true,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should not show refresh button when loading
      expect(screen.queryByText('Refresh World Data')).not.toBeInTheDocument();
    });
  });

  describe('Tools Tab Loading States', () => {
    test('should disable quick action buttons in tools tab when loading', () => {
      useWorldContext.mockReturnValue({
        currentWorld: { id: 'world-123', name: 'Test World' },
        worldNodes: [{ id: 'node1' }],
        worldCharacters: [{ id: 'char1' }],
        worldInteractions: [],
        isLoading: true,
        hasWorld: true,
        refreshWorldContext: jest.fn()
      });

      renderSidebar();
      
      // Switch to tools tab (should be default)
      fireEvent.click(screen.getByText('Tools'));
      
      // Quick action buttons should be disabled
      const addNodeButton = screen.getByText(/Add Node/);
      const addCharacterButton = screen.getByText(/Add Character/);
      
      expect(addNodeButton.closest('button')).toHaveStyle('opacity: 0.5');
      expect(addCharacterButton.closest('button')).toHaveStyle('opacity: 0.5');
    });
  });
});