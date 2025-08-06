/**
 * Sidebar Debug Button Tests
 * 
 * Tests for the debug button added to help troubleshoot
 * world persistence and naming issues.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../presentation/UI/Sidebar';
import { useWorldContext } from '../presentation/hooks/useWorldContext';
import { useWorldSave } from '../presentation/hooks/useWorldSave';
import editorStateManager from '../application/services/EditorStateManager';

// Mock the hooks and services
jest.mock('../presentation/hooks/useWorldContext');
jest.mock('../presentation/hooks/useWorldSave');
jest.mock('../application/services/EditorStateManager');
jest.mock('../presentation/components/WorldSelector', () => {
  return function MockWorldSelector() {
    return <div data-testid="world-selector">World Selector</div>;
  };
});

// Mock console.log to verify debug output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get keys() {
      return Object.keys(store);
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
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

describe('Sidebar Debug Button', () => {
  const mockRefreshWorldContext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Default mock implementations
    useWorldContext.mockReturnValue({
      currentWorld: null,
      worldNodes: [],
      worldCharacters: [],
      worldInteractions: [],
      isLoading: false,
      hasWorld: false,
      refreshWorldContext: mockRefreshWorldContext
    });
    
    useWorldSave.mockReturnValue({
      navigateToEditor: jest.fn(),
      hasUnsavedChanges: false
    });

    editorStateManager.getState = jest.fn(() => ({
      currentWorld: null,
      hasUnsavedChanges: false,
      saveStatus: 'idle',
      currentEditor: null,
      editorData: {
        world: null,
        nodes: {},
        characters: {},
        interactions: {},
        encounters: {}
      }
    }));
  });

  describe('Debug Button Visibility', () => {
    test('should show debug button in worlds tab', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Should show the debug button
      expect(screen.getByText('🔍 Debug Naming Issue')).toBeInTheDocument();
    });

    test('should show debug button even when no world exists', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Debug button should be visible even without a world
      expect(screen.getByText('🔍 Debug Naming Issue')).toBeInTheDocument();
    });
  });

  describe('Debug Button Functionality', () => {
    test('should call debug function when clicked', () => {
      // Mock the global debug function
      window.debugNamingIssue = jest.fn();

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click the debug button
      fireEvent.click(screen.getByText('🔍 Debug Naming Issue'));
      
      // Should call the debug function
      expect(window.debugNamingIssue).toHaveBeenCalled();
      
      // Should also call refresh
      expect(mockRefreshWorldContext).toHaveBeenCalled();
    });

    test('should use fallback debug when global function not available', () => {
      // Ensure global debug function is not available
      delete window.debugNamingIssue;

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click the debug button
      fireEvent.click(screen.getByText('🔍 Debug Naming Issue'));
      
      // Should call console.log with fallback message
      expect(console.log).toHaveBeenCalledWith('🔍 DEBUGGING WORLD PERSISTENCE (Fallback):');
      
      // Should still call refresh
      expect(mockRefreshWorldContext).toHaveBeenCalled();
    });

    test('should check localStorage when debugging', () => {
      // Set up some test data in localStorage
      localStorageMock.setItem('worldHistorySimulator_worlds', JSON.stringify([
        { id: 'test-world', name: 'Test World' }
      ]));
      localStorageMock.setItem('other_key', 'other_value');

      // Mock Object.keys to return our test keys
      const originalKeys = Object.keys;
      Object.keys = jest.fn(() => [
        'worldHistorySimulator_worlds',
        'worldHistorySimulator_world_test-world',
        'other_key'
      ]);

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click the debug button
      fireEvent.click(screen.getByText('🔍 Debug Naming Issue'));
      
      // Should check localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('worldHistorySimulator_worlds');
      
      // Restore Object.keys
      Object.keys = originalKeys;
    });

    test('should check editor state when debugging', () => {
      const mockEditorState = {
        currentWorld: { id: 'test-world', name: 'Test World' },
        hasUnsavedChanges: true,
        editorData: { world: { name: 'Test World' } }
      };

      editorStateManager.getState.mockReturnValue(mockEditorState);

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click the debug button
      fireEvent.click(screen.getByText('🔍 Debug Naming Issue'));
      
      // Should call getState
      expect(editorStateManager.getState).toHaveBeenCalled();
    });
  });

  describe('Debug Button Styling', () => {
    test('should have proper styling classes', () => {
      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      const debugButton = screen.getByText('🔍 Debug Naming Issue');
      
      // Check styling classes
      expect(debugButton).toHaveClass(
        'w-full',
        'flex',
        'items-center',
        'justify-center',
        'px-2',
        'py-1.5',
        'bg-red-600/20',
        'hover:bg-red-600/30',
        'text-red-400',
        'text-xs',
        'rounded',
        'border',
        'border-red-600/30',
        'transition-colors'
      );
    });
  });

  describe('Integration with Debug Utilities', () => {
    test('should work with global debug utilities when available', () => {
      // Mock all global debug functions
      window.debugNamingIssue = jest.fn();
      window.debugWorldFlow = jest.fn();
      window.debugWorldCreationFlow = jest.fn();

      renderSidebar();
      
      // Switch to worlds tab
      fireEvent.click(screen.getByText('Worlds'));
      
      // Click the debug button
      fireEvent.click(screen.getByText('🔍 Debug Naming Issue'));
      
      // Should use the global function
      expect(window.debugNamingIssue).toHaveBeenCalled();
      expect(window.debugWorldFlow).not.toHaveBeenCalled(); // Only naming debug should be called
    });
  });
});