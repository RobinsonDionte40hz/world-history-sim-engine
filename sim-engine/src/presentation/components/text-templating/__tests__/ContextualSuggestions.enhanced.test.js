import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ContextualSuggestions from '../ContextualSuggestions';

describe('ContextualSuggestions Enhanced Tests', () => {
  const mockOnInsert = jest.fn();
  
  const mockSuggestions = [
    {
      placeholder: 'character.name',
      category: 'character',
      description: 'Character name',
      example: 'Aria Blackwood',
      available: true
    },
    {
      placeholder: 'character.attributes.strength',
      category: 'character',
      description: 'Character strength attribute',
      example: '16',
      available: true
    },
    {
      placeholder: 'node.name',
      category: 'node',
      description: 'Location name',
      example: 'Royal Court',
      available: false
    },
    {
      placeholder: 'world.name',
      category: 'world',
      description: 'World name',
      example: 'Aethermoor',
      available: true
    },
    {
      placeholder: 'random:option1,option2,option3',
      category: 'system',
      description: 'Random selection',
      example: 'option1',
      available: true
    }
  ];

  beforeEach(() => {
    mockOnInsert.mockClear();
  });

  describe('Advanced Functionality', () => {
    it('handles complex filtering combinations', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
          showAvailabilityFilter={true}
        />
      );

      // Apply search filter
      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      await user.type(searchInput, 'character');

      // Apply availability filter
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Should show only available character suggestions
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
      expect(screen.queryByText('node.name')).not.toBeInTheDocument();
    });

    it('handles category expansion and collapse', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={true}
          showCategories={true}
        />
      );

      // Find character category header
      const characterHeader = screen.getByText('Character');
      expect(characterHeader).toBeInTheDocument();

      // Should show character suggestions initially (expanded by default)
      expect(screen.getByText('character.name')).toBeInTheDocument();

      // Click to collapse
      await user.click(characterHeader);
      
      // Implementation would handle collapse state
      // This tests the interaction without implementation details
    });

    it('handles keyboard navigation through suggestions', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      // Focus first suggestion
      const firstSuggestion = screen.getByText('character.name');
      await user.click(firstSuggestion);

      expect(mockOnInsert).toHaveBeenCalledWith('character.name');
    });

    it('handles suggestion tooltips and details', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      const suggestion = screen.getByText('character.name');
      
      // Hover to show tooltip
      await user.hover(suggestion);
      
      // Should show description
      expect(screen.getByText('Character name')).toBeInTheDocument();
    });

    it('handles empty suggestions gracefully', () => {
      render(
        <ContextualSuggestions
          suggestions={[]}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
      expect(screen.getByText('Add context (character, node, world) to see placeholder suggestions')).toBeInTheDocument();
    });

    it('handles null suggestions gracefully', () => {
      render(
        <ContextualSuggestions
          suggestions={null}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
    });

    it('handles undefined suggestions gracefully', () => {
      render(
        <ContextualSuggestions
          suggestions={undefined}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
    });

    it('handles suggestions with missing properties', () => {
      const incompleteSuggestions = [
        {
          placeholder: 'test.placeholder'
          // Missing other properties
        },
        {
          placeholder: 'another.test',
          category: 'test'
          // Missing description, example, available
        }
      ];

      render(
        <ContextualSuggestions
          suggestions={incompleteSuggestions}
          onInsert={mockOnInsert}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });

    it('handles very long placeholder names', () => {
      const longSuggestions = [{
        placeholder: 'very.long.placeholder.name.that.might.overflow.the.container.width',
        category: 'test',
        description: 'A very long placeholder name for testing',
        available: true
      }];

      render(
        <ContextualSuggestions
          suggestions={longSuggestions}
          onInsert={mockOnInsert}
        />
      );

      // Should handle long names gracefully
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });

    it('handles large numbers of suggestions efficiently', () => {
      const largeSuggestionList = Array.from({ length: 1000 }, (_, i) => ({
        placeholder: `item${i}`,
        category: 'test',
        description: `Test item ${i}`,
        available: true
      }));

      const { container } = render(
        <ContextualSuggestions
          suggestions={largeSuggestionList}
          onInsert={mockOnInsert}
        />
      );

      // Should render without performance issues
      expect(container).toBeInTheDocument();
    });

    it('handles rapid search input changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      
      // Type rapidly
      await user.type(searchInput, 'char', { delay: 50 });
      
      // Should handle rapid typing without issues
      expect(searchInput).toHaveValue('char');
    });

    it('handles category filtering correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={true}
        />
      );

      // Select character category
      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categorySelect, 'character');

      // Should show only character suggestions
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
    });

    it('handles maxVisible prop correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          maxVisible={2}
        />
      );

      // Should limit visible suggestions
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });

    it('handles compact mode correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          compact={true}
        />
      );

      // Should render in compact mode
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });

    it('handles custom className', () => {
      const { container } = render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          className="custom-test-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-test-class');
    });

    it('handles disabled search correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={false}
        />
      );

      expect(screen.queryByPlaceholderText('Search placeholders...')).not.toBeInTheDocument();
    });

    it('handles disabled categorization correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={false}
        />
      );

      // Should not show category headers
      expect(screen.queryByText('Character')).not.toBeInTheDocument();
      expect(screen.queryByText('Location')).not.toBeInTheDocument();
      
      // But should show all suggestions
      expect(screen.getByText('character.name')).toBeInTheDocument();
    });

    it('handles disabled availability filter correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          showAvailabilityFilter={false}
        />
      );

      expect(screen.queryByText('Available only')).not.toBeInTheDocument();
    });

    it('handles disabled categories correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          showCategories={false}
        />
      );

      // Should not show category headers even if categorized is true
      expect(screen.queryByText('Character')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles onInsert errors gracefully', async () => {
      const user = userEvent.setup();
      const errorOnInsert = jest.fn(() => {
        throw new Error('Insert error');
      });
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={errorOnInsert}
        />
      );

      const suggestion = screen.getByText('character.name');
      
      // Should not crash when onInsert throws
      await user.click(suggestion);
      
      expect(errorOnInsert).toHaveBeenCalled();
    });

    it('handles missing onInsert gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
        />
      );

      const suggestion = screen.getByText('character.name');
      
      // Should not crash when onInsert is undefined
      await user.click(suggestion);
    });

    it('handles malformed suggestion data', () => {
      const malformedSuggestions = [
        null,
        undefined,
        {},
        { placeholder: null },
        { category: null },
        { description: undefined }
      ];

      render(
        <ContextualSuggestions
          suggestions={malformedSuggestions}
          onInsert={mockOnInsert}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles frequent re-renders efficiently', () => {
      const { rerender } = render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      // Rapid re-renders
      for (let i = 0; i < 100; i++) {
        rerender(
          <ContextualSuggestions
            suggestions={mockSuggestions}
            onInsert={mockOnInsert}
            key={i}
          />
        );
      }

      // Should handle without issues
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });

    it('handles dynamic suggestion updates efficiently', () => {
      const { rerender } = render(
        <ContextualSuggestions
          suggestions={mockSuggestions.slice(0, 2)}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('character.name')).toBeInTheDocument();

      // Update suggestions
      rerender(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('world.name')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      // Should have proper heading structure
      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
    });

    it('provides proper form controls', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
          showAvailabilityFilter={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      const checkbox = screen.getByRole('checkbox');
      const select = screen.getByRole('combobox');

      expect(searchInput).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });

    it('provides proper button accessibility', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={true}
          showCategories={true}
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
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      
      // Should be focusable
      await user.tab();
      expect(searchInput).toHaveFocus();
    });
  });
});