/**
 * Navigation System Integration Test
 * 
 * Tests the unified navigation system components and hooks
 * to ensure they work together correctly.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationProvider } from '../presentation/contexts/NavigationContext';
import EditorNavigation from '../presentation/components/EditorNavigation';
import WorldSelector from '../presentation/components/WorldSelector';
import BreadcrumbNavigation from '../presentation/components/BreadcrumbNavigation';
import useEditorNavigation from '../presentation/hooks/useEditorNavigation';
import useUnsavedChanges from '../presentation/hooks/useUnsavedChanges';

// Mock the services
jest.mock('../application/services/EditorStateManager', () => ({
  getState: () => ({
    currentEditor: null,
    currentWorld: null,
    hasUnsavedChanges: false,
    saveStatus: 'idle',
    validationErrors: [],
    navigationHistory: [],
    editorData: {
      world: null,
      nodes: {},
      characters: {},
      interactions: {},
      encounters: {}
    }
  }),
  getAvailableEditors: () => ['world'],
  isWorldFoundationComplete: () => false,
  subscribe: () => () => {},
  setCurrentEditor: jest.fn(),
  setUnsavedChanges: jest.fn(),
  setSaveStatus: jest.fn()
}));

jest.mock('../application/services/WorldPersistenceService', () => ({
  getAllWorlds: () => Promise.resolve([]),
  loadWorld: () => Promise.resolve({}),
  saveWorld: () => Promise.resolve({}),
  deleteWorld: () => Promise.resolve(),
  exportWorld: () => Promise.resolve({}),
  importWorld: () => Promise.resolve({})
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <NavigationProvider>
      {children}
    </NavigationProvider>
  </BrowserRouter>
);

describe('Navigation System Integration', () => {
  describe('EditorNavigation Component', () => {
    test('renders without crashing', () => {
      render(
        <TestWrapper>
          <EditorNavigation />
        </TestWrapper>
      );
      
      expect(screen.getByText('Editors')).toBeInTheDocument();
    });

    test('shows world foundation requirement', () => {
      render(
        <TestWrapper>
          <EditorNavigation />
        </TestWrapper>
      );
      
      expect(screen.getByText('World Foundation Required')).toBeInTheDocument();
    });

    test('displays editor buttons', () => {
      render(
        <TestWrapper>
          <EditorNavigation />
        </TestWrapper>
      );
      
      expect(screen.getByText('World Foundation')).toBeInTheDocument();
      expect(screen.getByText('Node Editor')).toBeInTheDocument();
      expect(screen.getByText('Character Editor')).toBeInTheDocument();
    });
  });

  describe('WorldSelector Component', () => {
    test('renders without crashing', async () => {
      render(
        <TestWrapper>
          <WorldSelector />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('World Selector')).toBeInTheDocument();
      });
    });

    test('shows create new world button', async () => {
      render(
        <TestWrapper>
          <WorldSelector />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Create New World')).toBeInTheDocument();
      });
    });

    test('handles create new world click', async () => {
      const mockOnCreateNew = jest.fn();
      
      render(
        <TestWrapper>
          <WorldSelector onCreateNew={mockOnCreateNew} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const createButton = screen.getByText('Create New World');
        fireEvent.click(createButton);
        expect(mockOnCreateNew).toHaveBeenCalled();
      });
    });
  });

  describe('BreadcrumbNavigation Component', () => {
    test('renders without crashing', () => {
      render(
        <TestWrapper>
          <BreadcrumbNavigation />
        </TestWrapper>
      );
      
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('useEditorNavigation Hook', () => {
    test('provides navigation functions', () => {
      let hookResult;
      
      function TestComponent() {
        hookResult = useEditorNavigation();
        return <div>Test</div>;
      }
      
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );
      
      expect(hookResult).toHaveProperty('navigateToEditor');
      expect(hookResult).toHaveProperty('getCurrentEditor');
      expect(hookResult).toHaveProperty('getAvailableEditors');
      expect(hookResult).toHaveProperty('isWorldFoundationComplete');
    });
  });

  describe('useUnsavedChanges Hook', () => {
    test('provides unsaved changes tracking', () => {
      let hookResult;
      
      function TestComponent() {
        hookResult = useUnsavedChanges();
        return <div>Test</div>;
      }
      
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );
      
      expect(hookResult).toHaveProperty('hasUnsavedChanges');
      expect(hookResult).toHaveProperty('markAsSaved');
      expect(hookResult).toHaveProperty('markAsChanged');
      expect(hookResult).toHaveProperty('shouldBlockNavigation');
    });
  });
});

describe('Navigation System Integration Flow', () => {
  test('complete navigation workflow', async () => {
    const mockOnWorldSelected = jest.fn();
    const mockOnCreateNew = jest.fn();
    
    render(
      <TestWrapper>
        <div>
          <EditorNavigation />
          <WorldSelector 
            onWorldSelected={mockOnWorldSelected}
            onCreateNew={mockOnCreateNew}
          />
          <BreadcrumbNavigation />
        </div>
      </TestWrapper>
    );
    
    // Check that all components render
    expect(screen.getByText('Editors')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('World Selector')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    
    // Test create new world flow
    await waitFor(() => {
      const createButton = screen.getByText('Create New World');
      fireEvent.click(createButton);
      expect(mockOnCreateNew).toHaveBeenCalled();
    });
  });
});