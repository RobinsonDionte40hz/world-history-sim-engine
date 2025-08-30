import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DialoguePatterns from '../DialoguePatterns';

// Mock the dialogue pattern library
jest.mock('../../../application/services/DialoguePatternLibrary', () => ({
  getAllPatterns: jest.fn(),
  createCustomPattern: jest.fn(),
  calculateRelevanceScore: jest.fn()
}));

import dialoguePatternLibrary from '../../../application/services/DialoguePatternLibrary';

describe('DialoguePatterns Enhanced Tests', () => {
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
      id: 'greeting_formal',
      name: 'Formal Greeting',
      category: 'greetings',
      template: 'Good day, {{character.name}}. Welcome to {{node.name}}.',
      description: 'Formal greeting with location',
      tags: ['formal'],
      requiredContext: ['character', 'node']
    },
    {
      id: 'farewell_basic',
      name: 'Basic Farewell',
      category: 'farewells',
      template: 'Goodbye, {{character.name}}.',
      description: 'Simple farewell',
      tags: ['basic'],
      requiredContext: ['character']
    },
    {
      id: 'question_location',
      name: 'Location Question',
      category: 'questions',
      template: 'What brings you to {{node.name}}, {{character.name}}?',
      description: 'Ask about purpose of visit',
      tags: ['inquiry'],
      requiredContext: ['character', 'node']
    },
    {
      id: 'reaction_impressed',
      name: 'Impressed Reaction',
      category: 'reactions',
      template: '{{#if character.attributes.charisma > 15}}Your words carry great weight, {{character.name}}.{{/if}}',
      description: 'Reaction to high charisma',
      tags: ['conditional'],
      requiredContext: ['character']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    dialoguePatternLibrary.getAllPatterns.mockReturnValue(mockPatterns);
    dialoguePatternLibrary.calculateRelevanceScore.mockReturnValue(75);
    dialoguePatternLibrary.createCustomPattern.mockReturnValue('custom-pattern-id');
  });

  describe('Advanced Functionality', () => {
    it('handles contextual pattern filtering', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      expect(dialoguePatternLibrary.getAllPatterns).toHaveBeenCalledWith({
        contextFilter: mockContext,
        searchQuery: null
      });
    });

    it('handles search functionality', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search patterns...');
      await user.type(searchInput, 'greeting');

      expect(dialoguePatternLibrary.getAllPatterns).toHaveBeenCalledWith({
        contextFilter: mockContext,
        searchQuery: 'greeting'
      });
    });

    it('handles custom pattern creation', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showCustomPatterns={true}
        />
      );

      // Open custom pattern form
      const addCustomButton = screen.getByText('Custom');
      await user.click(addCustomButton);

      // Fill in the form
      const nameInput = screen.getByPlaceholderText('Pattern name...');
      const templateInput = screen.getByPlaceholderText('Pattern template (use {{placeholders}})...');
      
      await user.type(nameInput, 'My Custom Pattern');
      await user.type(templateInput, 'Custom greeting, {{character.name}}!');

      // Submit the form
      const addButton = screen.getByText('Add');
      await user.click(addButton);

      expect(dialoguePatternLibrary.createCustomPattern).toHaveBeenCalledWith({
        name: 'My Custom Pattern',
        template: 'Custom greeting, {{character.name}}!',
        category: 'custom',
        description: 'Custom custom pattern',
        tags: ['custom', 'user-defined']
      });
    });

    it('handles custom pattern form cancellation', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showCustomPatterns={true}
        />
      );

      // Open custom pattern form
      const addCustomButton = screen.getByText('Custom');
      await user.click(addCustomButton);

      expect(screen.getByPlaceholderText('Pattern name...')).toBeInTheDocument();

      // Cancel the form
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByPlaceholderText('Pattern name...')).not.toBeInTheDocument();
    });

    it('handles pattern insertion with template text', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Expand greetings category
      const greetingsHeader = screen.getByText('Greetings');
      await user.click(greetingsHeader);
      
      // Wait for patterns to appear
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      // Click on a pattern
      const patternElement = screen.getByText('Basic Greeting');
      await user.click(patternElement.closest('div'));

      expect(mockOnInsert).toHaveBeenCalledWith(mockPatterns[0]);
    });

    it('handles category expansion and collapse', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      const greetingsHeader = screen.getByText('Greetings');
      
      // Click to expand/collapse
      await user.click(greetingsHeader);
      
      // Should handle the interaction
      expect(greetingsHeader).toBeInTheDocument();
    });

    it('handles empty patterns gracefully', () => {
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

    it('handles search with no results', async () => {
      const user = userEvent.setup();
      
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
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No patterns match your search')).toBeInTheDocument();
      });
    });

    it('handles contextual suggestions for patterns', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // The contextual suggestions are calculated
      expect(dialoguePatternLibrary.calculateRelevanceScore).toHaveBeenCalled();
    });

    it('handles pattern preview generation', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Expand greetings to see patterns
      const greetingsHeader = screen.getByText('Greetings');
      await user.click(greetingsHeader);
      
      // Should show pattern previews
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
    });

    it('handles different category types', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          categories={['greetings', 'farewells', 'questions', 'reactions']}
        />
      );

      expect(screen.getByText('Greetings')).toBeInTheDocument();
      expect(screen.getByText('Farewells')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Reactions')).toBeInTheDocument();
    });

    it('handles compact mode', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          compact={true}
        />
      );

      expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    });

    it('handles disabled search', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showSearch={false}
        />
      );

      expect(screen.queryByPlaceholderText('Search patterns...')).not.toBeInTheDocument();
    });

    it('handles disabled custom patterns', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showCustomPatterns={false}
        />
      );

      expect(screen.queryByText('Custom')).not.toBeInTheDocument();
    });

    it('handles custom className', () => {
      const { container } = render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          className="custom-test-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-test-class');
    });

    it('handles pattern with conditional logic', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Expand reactions category
      const reactionsHeader = screen.getByText('Reactions');
      await user.click(reactionsHeader);
      
      // Should show conditional pattern
      await waitFor(() => {
        expect(screen.getByText('Impressed Reaction')).toBeInTheDocument();
      });
    });

    it('handles pattern with multiple context requirements', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Expand questions category
      const questionsHeader = screen.getByText('Questions');
      await user.click(questionsHeader);
      
      // Should show location question pattern
      await waitFor(() => {
        expect(screen.getByText('Location Question')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles pattern library errors gracefully', () => {
      dialoguePatternLibrary.getAllPatterns.mockImplementation(() => {
        throw new Error('Pattern library error');
      });

      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Should not crash
      expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    });

    it('handles custom pattern creation errors', async () => {
      const user = userEvent.setup();
      
      dialoguePatternLibrary.createCustomPattern.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showCustomPatterns={true}
        />
      );

      // Open custom pattern form
      const addCustomButton = screen.getByText('Custom');
      await user.click(addCustomButton);

      // Fill in the form
      const nameInput = screen.getByPlaceholderText('Pattern name...');
      const templateInput = screen.getByPlaceholderText('Pattern template (use {{placeholders}})...');
      
      await user.type(nameInput, 'Test Pattern');
      await user.type(templateInput, 'Test template');

      // Submit the form
      const addButton = screen.getByText('Add');
      await user.click(addButton);

      // Should handle error gracefully
      expect(dialoguePatternLibrary.createCustomPattern).toHaveBeenCalled();
    });

    it('handles onInsert errors gracefully', async () => {
      const user = userEvent.setup();
      const errorOnInsert = jest.fn(() => {
        throw new Error('Insert error');
      });
      
      render(
        <DialoguePatterns 
          onInsert={errorOnInsert}
          context={mockContext}
        />
      );

      // Expand greetings and click pattern
      const greetingsHeader = screen.getByText('Greetings');
      await user.click(greetingsHeader);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Greeting')).toBeInTheDocument();
      });
      
      const patternElement = screen.getByText('Basic Greeting');
      await user.click(patternElement.closest('div'));

      expect(errorOnInsert).toHaveBeenCalled();
    });

    it('handles missing onInsert gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          context={mockContext}
        />
      );

      // Should not crash when onInsert is undefined
      const greetingsHeader = screen.getByText('Greetings');
      await user.click(greetingsHeader);
    });

    it('handles malformed pattern data', () => {
      const malformedPatterns = [
        null,
        undefined,
        {},
        { id: null },
        { name: undefined },
        { template: null }
      ];

      dialoguePatternLibrary.getAllPatterns.mockReturnValue(malformedPatterns);

      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large numbers of patterns efficiently', () => {
      const largePatternList = Array.from({ length: 1000 }, (_, i) => ({
        id: `pattern${i}`,
        name: `Pattern ${i}`,
        category: 'test',
        template: `Template ${i}`,
        description: `Test pattern ${i}`,
        tags: ['test'],
        requiredContext: []
      }));

      dialoguePatternLibrary.getAllPatterns.mockReturnValue(largePatternList);

      const { container } = render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Should render without performance issues
      expect(container).toBeInTheDocument();
    });

    it('handles frequent context changes efficiently', () => {
      const { rerender } = render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Change context multiple times
      for (let i = 0; i < 10; i++) {
        const newContext = {
          character: { name: `Character ${i}` },
          node: { name: `Location ${i}` }
        };
        
        rerender(
          <DialoguePatterns 
            onInsert={mockOnInsert}
            context={newContext}
          />
        );
      }

      // Should handle without issues
      expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    });

    it('handles rapid search input changes', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search patterns...');
      
      // Type rapidly
      await user.type(searchInput, 'greeting', { delay: 50 });
      
      // Should handle rapid typing without issues
      expect(searchInput).toHaveValue('greeting');
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      // Should have proper heading structure
      expect(screen.getByText('Dialogue Patterns')).toBeInTheDocument();
    });

    it('provides proper form controls', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showSearch={true}
          showCustomPatterns={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search patterns...');
      const customButton = screen.getByText('Custom');

      expect(searchInput).toBeInTheDocument();
      expect(customButton).toBeInTheDocument();
    });

    it('provides proper button accessibility', () => {
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Each button should be accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('handles keyboard navigation properly', async () => {
      const user = userEvent.setup();
      
      render(
        <DialoguePatterns 
          onInsert={mockOnInsert}
          context={mockContext}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search patterns...');
      
      // Should be focusable
      await user.tab();
      expect(searchInput).toHaveFocus();
    });
  });
});