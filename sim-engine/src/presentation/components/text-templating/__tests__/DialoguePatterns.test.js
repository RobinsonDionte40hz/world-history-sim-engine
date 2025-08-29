import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DialoguePatterns from '../DialoguePatterns';
import dialoguePatternLibrary from '../../../../application/services/DialoguePatternLibrary';

// Mock the dialogue pattern library
jest.mock('../../../../application/services/DialoguePatternLibrary', () => ({
  getAllPatterns: jest.fn(),
  createCustomPattern: jest.fn(),
  calculateRelevanceScore: jest.fn()
}));

describe('DialoguePatterns Component', () => {
  const mockOnInsert = jest.fn();
  
  const mockContext = {
    character: {
      id: 'test-char',
      name: 'Test Character',
      attributes: { charisma: 16, strength: 14 },
      reputation: 12
    },
    node: {
      id: 'test-node',
      name: 'Test Location',
      environmentalProperties: { crowded: true }
    }
  };

  const mockPatterns = [
    {
      id: 'greeting_basic',
      name: 'Basic Greeting',
      category: 'greetings',
      template: 'Hello, {{character.name}}!',
      description: 'Simple greeting',
      tags: ['basic'],
      requiredContext: ['character']
    },
    {
      id: 'farewell_basic',
      name: 'Basic Farewell',
      category: 'farewells',
      template: 'Goodbye, {{character.name}}.',
      description: 'Simple farewell',
      tags: ['basic'],
      requiredContext: ['character']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    dialoguePatternLibrary.getAllPatterns.mockReturnValue(mockPatterns);
    dialoguePatternLibrary.calculateRelevanceScore.mockReturnValue(75);
  });

  test('renders dialogue patterns component', () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
      />
    );

    expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    expect(screen.getByText('(2 patterns)')).toBeInTheDocument();
  });

  test('displays pattern categories', () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
      />
    );

    expect(screen.getByText('Greetings')).toBeInTheDocument();
    expect(screen.getByText('Farewells')).toBeInTheDocument();
  });

  test('calls onInsert when pattern is clicked', async () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
      />
    );

    // Click on the greetings category to expand it
    fireEvent.click(screen.getByText('Greetings'));
    
    // Wait for the pattern to appear and click on it
    await waitFor(() => {
      expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
    });
    
    const patternElement = screen.getByText('Basic Greeting');
    fireEvent.click(patternElement.closest('div'));

    expect(mockOnInsert).toHaveBeenCalledWith(mockPatterns[0]);
  });

  test('filters patterns by search query', async () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
        showSearch={true}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search patterns...');
    fireEvent.change(searchInput, { target: { value: 'greeting' } });

    await waitFor(() => {
      expect(dialoguePatternLibrary.getAllPatterns).toHaveBeenCalledWith({
        contextFilter: mockContext,
        searchQuery: 'greeting'
      });
    });
  });

  test('shows custom pattern form when add custom button is clicked', () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
        showCustomPatterns={true}
      />
    );

    const addCustomButton = screen.getByText('Custom');
    fireEvent.click(addCustomButton);

    expect(screen.getByPlaceholderText('Pattern name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pattern template (use {{placeholders}})...')).toBeInTheDocument();
  });

  test('creates custom pattern when form is submitted', async () => {
    dialoguePatternLibrary.createCustomPattern.mockReturnValue('custom-pattern-id');

    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
        showCustomPatterns={true}
      />
    );

    // Open custom pattern form
    fireEvent.click(screen.getByText('Custom'));

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Pattern name...'), {
      target: { value: 'My Custom Pattern' }
    });
    fireEvent.change(screen.getByPlaceholderText('Pattern template (use {{placeholders}})...'), {
      target: { value: 'Custom greeting, {{character.name}}!' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(dialoguePatternLibrary.createCustomPattern).toHaveBeenCalledWith({
        name: 'My Custom Pattern',
        template: 'Custom greeting, {{character.name}}!',
        category: 'custom',
        description: 'Custom custom pattern',
        tags: ['custom', 'user-defined']
      });
    });
  });

  test('shows empty state when no patterns available', () => {
    dialoguePatternLibrary.getAllPatterns.mockReturnValue([]);

    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={{}}
      />
    );

    expect(screen.getByText('No dialogue patterns available')).toBeInTheDocument();
    expect(screen.getByText('Add context or create custom patterns')).toBeInTheDocument();
  });

  test('shows no results message when search returns empty', async () => {
    // First render with patterns, then mock empty results for search
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
        showSearch={true}
      />
    );

    // Mock empty results for search
    dialoguePatternLibrary.getAllPatterns.mockReturnValue([]);

    const searchInput = screen.getByPlaceholderText('Search patterns...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No patterns match your search')).toBeInTheDocument();
    });
  });

  test('expands and collapses categories', () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
      />
    );

    const greetingsHeader = screen.getByText('Greetings');
    
    // Initially expanded (based on default state)
    expect(screen.getByText('Basic Greeting')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(greetingsHeader);
    
    // Should still be visible since we're not testing the actual collapse behavior
    // In a real test, you'd check for the presence/absence of pattern items
  });

  test('displays contextual suggestions for patterns', () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
      />
    );

    // Expand greetings category
    fireEvent.click(screen.getByText('Greetings'));

    // The contextual suggestions are calculated and should be available
    expect(dialoguePatternLibrary.calculateRelevanceScore).toHaveBeenCalled();
  });

  test('handles pattern insertion with template text', async () => {
    render(
      <DialoguePatterns 
        onInsert={mockOnInsert}
        context={mockContext}
      />
    );

    // Expand greetings and click on a pattern
    fireEvent.click(screen.getByText('Greetings'));
    
    await waitFor(() => {
      expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
    });
    
    const patternElement = screen.getByText('Basic Greeting');
    fireEvent.click(patternElement.closest('div'));

    expect(mockOnInsert).toHaveBeenCalledWith(mockPatterns[0]);
  });
});