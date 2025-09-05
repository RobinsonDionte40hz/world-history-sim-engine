import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterEditor from '../../presentation/components/CharacterEditor';
import NodeEditor from '../../presentation/components/NodeEditor';
import InteractionEditor from '../../presentation/components/InteractionEditor';

// Mock validation utilities
jest.mock('../../shared/utils/characterSaveUtils', () => ({
  validateCharacterForSave: jest.fn().mockReturnValue({ isValid: true, errors: [] })
}));

// Mock the template hooks
jest.mock('../../presentation/hooks/useTemplates', () => ({
  __esModule: true,
  default: () => ({
    saveTemplate: jest.fn().mockResolvedValue({ id: 'test-template' }),
    loadTemplate: jest.fn().mockReturnValue({
      id: 'loaded-template',
      name: 'Test Template',
      description: 'Test Description'
    }),
    templates: {
      characters: [],
      nodes: [],
      interactions: []
    },
    loading: false,
    error: null
  })
}));

// Mock TemplateLibraryPanel
jest.mock('../../presentation/components/TemplateLibraryPanel', () => {
  return function MockTemplateLibraryPanel({ onTemplateSelect }) {
    return (
      <div data-testid="template-library">
        <button 
          onClick={() => onTemplateSelect({ 
            id: 'test-template', 
            name: 'Test Template',
            description: 'Test Description'
          })}
        >
          Select Template
        </button>
      </div>
    );
  };
});

describe('Template Integration', () => {
  describe('CharacterEditor Template Integration', () => {
    const mockProps = {
      onSave: jest.fn(),
      onCancel: jest.fn(),
      mode: 'edit'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders Load Template button', () => {
      render(<CharacterEditor {...mockProps} />);
      
      expect(screen.getByText('Load Template')).toBeInTheDocument();
    });

    test('renders Save as Template button in edit mode', () => {
      render(<CharacterEditor {...mockProps} />);
      
      expect(screen.getByText('Save as Template')).toBeInTheDocument();
    });

    test('does not render Save as Template button in create mode', () => {
      render(<CharacterEditor {...mockProps} mode="create" />);
      
      expect(screen.queryByText('Save as Template')).not.toBeInTheDocument();
    });

    test('opens template library when Load Template is clicked', async () => {
      render(<CharacterEditor {...mockProps} />);
      
      fireEvent.click(screen.getByText('Load Template'));
      
      await waitFor(() => {
        expect(screen.getByTestId('template-library')).toBeInTheDocument();
      });
    });

    test('loads template when selected from library', async () => {
      render(<CharacterEditor {...mockProps} />);
      
      // Open template library
      fireEvent.click(screen.getByText('Load Template'));
      
      await waitFor(() => {
        expect(screen.getByTestId('template-library')).toBeInTheDocument();
      });

      // Select a template
      fireEvent.click(screen.getByText('Select Template'));
      
      // Template library should close
      await waitFor(() => {
        expect(screen.queryByTestId('template-library')).not.toBeInTheDocument();
      });
    });
  });

  describe('NodeEditor Template Integration', () => {
    const mockProps = {
      onSave: jest.fn(),
      onCancel: jest.fn(),
      mode: 'edit'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders Load Template button', () => {
      render(<NodeEditor {...mockProps} />);
      
      expect(screen.getByText('Load Template')).toBeInTheDocument();
    });

    test('renders Save as Template button in edit mode', () => {
      render(<NodeEditor {...mockProps} />);
      
      expect(screen.getByText('Save as Template')).toBeInTheDocument();
    });

    test('opens template library when Load Template is clicked', async () => {
      render(<NodeEditor {...mockProps} />);
      
      fireEvent.click(screen.getByText('Load Template'));
      
      await waitFor(() => {
        expect(screen.getByTestId('template-library')).toBeInTheDocument();
      });
    });
  });

  describe('InteractionEditor Template Integration', () => {
    const mockProps = {
      onSave: jest.fn(),
      onCancel: jest.fn(),
      mode: 'edit'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders Load Template button', () => {
      render(<InteractionEditor {...mockProps} />);
      
      expect(screen.getByText('Load Template')).toBeInTheDocument();
    });

    test('renders Save as Template button in edit mode', () => {
      render(<InteractionEditor {...mockProps} />);
      
      expect(screen.getByText('Save as Template')).toBeInTheDocument();
    });

    test('opens template library when Load Template is clicked', async () => {
      render(<InteractionEditor {...mockProps} />);
      
      fireEvent.click(screen.getByText('Load Template'));
      
      await waitFor(() => {
        expect(screen.getByTestId('template-library')).toBeInTheDocument();
      });
    });
  });

  describe('Template Workflow Integration', () => {
    test('complete save-as-template workflow', async () => {
      // Mock window.prompt
      const mockPrompt = jest.fn()
        .mockReturnValueOnce('My Character Template') // Template name
        .mockReturnValueOnce('A test character template'); // Template description
      
      global.prompt = mockPrompt;
      global.alert = jest.fn();

      const mockProps = {
        onSave: jest.fn(),
        onCancel: jest.fn(),
        mode: 'edit',
        initialCharacter: {
          id: 'test-char',
          name: 'Test Character',
          description: 'Test Description',
          archetype: 'warrior',
          attributes: {
            strength: 15,
            dexterity: 12,
            constitution: 14,
            intelligence: 13,
            wisdom: 11,
            charisma: 16
          },
          goals: ['Test Goal'],
          age: 25,
          culturalBackground: 'Test Culture',
          // Add environmental data to character template in integration test
          assignedNode: 'test-mountain-fortress',
          preferredEnvironment: { 
            terrain: 'mountains', 
            climate: 'arctic',
            preferredLighting: 'dim',
            avoidHazards: ['avalanche']
          },
          environmentalAdaptations: {
            mountains: 0.9,
            tundra: 0.7,
            forest: 0.4,
            desert: 0.2
          },
          metadata: {}
        }
      };

      render(<CharacterEditor {...mockProps} />);
      
      // Click Save as Template
      fireEvent.click(screen.getByText('Save as Template'));
      
      // Verify prompts were called
      expect(mockPrompt).toHaveBeenCalledTimes(2);
      expect(mockPrompt).toHaveBeenNthCalledWith(1, 'Enter template name:', 'Test Character Template');
      expect(mockPrompt).toHaveBeenNthCalledWith(2, 'Enter template description (optional):', 'Template based on Test Character');
      
      // Verify success alert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Template saved successfully!');
      });
    });

    test('handles template save cancellation', async () => {
      // Mock window.prompt to return null (cancelled)
      global.prompt = jest.fn().mockReturnValue(null);
      global.alert = jest.fn();

      const mockProps = {
        onSave: jest.fn(),
        onCancel: jest.fn(),
        mode: 'edit',
        initialCharacter: {
          id: 'test-char',
          name: 'Test Character'
        }
      };

      render(<CharacterEditor {...mockProps} />);
      
      // Click Save as Template
      fireEvent.click(screen.getByText('Save as Template'));
      
      // Verify no alert was shown (operation cancelled)
      expect(global.alert).not.toHaveBeenCalled();
    });
  });
});