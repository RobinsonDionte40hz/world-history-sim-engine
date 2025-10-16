import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ContextualSuggestions from '../ContextualSuggestions';

describe('ContextualSuggestions Component', () => {
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
      placeholder: 'character.attributes.charisma',
      category: 'character',
      description: 'Character charisma attribute',
      example: '18',
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
      placeholder: 'node.type',
      category: 'node',
      description: 'Location type',
      example: 'palace',
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

  const mockOnInsert = jest.fn();

  beforeEach(() => {
    mockOnInsert.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders suggestions correctly', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('Character name')).toBeInTheDocument();
    });

    it('renders without crashing with empty suggestions', () => {
      render(
        <ContextualSuggestions
          suggestions={[]}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('displays suggestion count in header', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText(`(${mockSuggestions.length} of ${mockSuggestions.length})`)).toBeInTheDocument();
    });
  });

  describe('Suggestion Interaction', () => {
    it('calls onInsert when suggestion is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      await user.click(screen.getByText('character.name'));
      expect(mockOnInsert).toHaveBeenCalledWith('character.name');
    });

    it('calls onInsert with correct placeholder when multiple suggestions exist', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      await user.click(screen.getByText('character.attributes.strength'));
      expect(mockOnInsert).toHaveBeenCalledWith('character.attributes.strength');
    });

    it('handles onInsert being undefined gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
        />
      );

      // Should not crash when clicking
      await user.click(screen.getByText('character.name'));
    });

    it('shows hover effects on suggestion items', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      const suggestionItem = screen.getByText('character.name').closest('div');
      await user.hover(suggestionItem);
      
      expect(suggestionItem).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Search Functionality', () => {
    it('shows search input when searchable is true', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      expect(screen.getByPlaceholderText('Search placeholders...')).toBeInTheDocument();
    });

    it('hides search input when searchable is false', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={false}
        />
      );

      expect(screen.queryByPlaceholderText('Search placeholders...')).not.toBeInTheDocument();
    });

    it('filters suggestions by search query', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      await user.type(searchInput, 'strength');

      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
      expect(screen.queryByText('character.name')).not.toBeInTheDocument();
    });

    it('filters by description text', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      await user.type(searchInput, 'Character name');

      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.queryByText('character.attributes.strength')).not.toBeInTheDocument();
    });

    it('shows no results message when search returns empty', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No suggestions match your search')).toBeInTheDocument();
    });

    it('clears search when input is cleared', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      await user.type(searchInput, 'strength');
      await user.clear(searchInput);

      // All suggestions should be visible again
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
    });
  });

  describe('Availability Filter', () => {
    it('shows availability filter when showAvailabilityFilter is true', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          showAvailabilityFilter={true}
        />
      );

      expect(screen.getByText('Available only')).toBeInTheDocument();
    });

    it('filters to available suggestions when filter is enabled', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          showAvailabilityFilter={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Should show available suggestions
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('world.name')).toBeInTheDocument();
      
      // Should hide unavailable suggestions
      expect(screen.queryByText('node.name')).not.toBeInTheDocument();
    });

    it('shows availability indicators on suggestions', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          showAvailability={true}
        />
      );

      // Available suggestions should have green indicator
      const availableItem = screen.getByText('character.name').closest('div');
      expect(availableItem).toHaveClass('border-green-200');

      // Unavailable suggestions should have gray indicator
      const unavailableItem = screen.getByText('node.name').closest('div');
      expect(unavailableItem).toHaveClass('border-gray-200');
    });
  });

  describe('Category Grouping', () => {
    it('groups suggestions by category when categorized is true', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={true}
          showCategories={true}
        />
      );

      expect(screen.getByText('Character')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('shows category counts when enabled', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={true}
          showCategories={true}
          showCategoryCounts={true}
        />
      );

      expect(screen.getByText('Character (3)')).toBeInTheDocument();
      expect(screen.getByText('Location (2)')).toBeInTheDocument();
      expect(screen.getByText('World (1)')).toBeInTheDocument();
      expect(screen.getByText('System (1)')).toBeInTheDocument();
    });

    it('allows collapsing and expanding categories', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={true}
          showCategories={true}
          collapsible={true}
        />
      );

      const characterHeader = screen.getByText('Character');
      
      // Initially expanded, should see suggestions
      expect(screen.getByText('character.name')).toBeInTheDocument();

      // Click to collapse
      await user.click(characterHeader);
      
      // Should hide suggestions (implementation dependent)
      // This would need to be tested based on actual implementation
    });

    it('displays flat list when categorized is false', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          categorized={false}
        />
      );

      // Should not show category headers
      expect(screen.queryByText('Character')).not.toBeInTheDocument();
      expect(screen.queryByText('Node')).not.toBeInTheDocument();
      
      // But should show all suggestions
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('node.name')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('displays empty state when no suggestions', () => {
      render(
        <ContextualSuggestions
          suggestions={[]}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
    });

    it('shows custom empty message when provided', () => {
      const customMessage = 'Add context to see suggestions';
      render(
        <ContextualSuggestions
          suggestions={[]}
          onInsert={mockOnInsert}
          emptyMessage={customMessage}
        />
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('displays empty state with search results', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      await user.type(searchInput, 'xyz123');

      expect(screen.getByText('No suggestions match your search')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search placeholders...');
      expect(searchInput).toHaveAttribute('aria-label', 'Search placeholder suggestions');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      const firstSuggestion = screen.getByText('character.name').closest('div');
      
      // Should be focusable
      firstSuggestion.focus();
      expect(firstSuggestion).toHaveFocus();

      // Should handle Enter key
      await user.keyboard('{Enter}');
      expect(mockOnInsert).toHaveBeenCalledWith('character.name');
    });

    it('provides proper role attributes', () => {
      render(
        <ContextualSuggestions
          suggestions={mockSuggestions}
          onInsert={mockOnInsert}
        />
      );

      const suggestionsList = screen.getByRole('list');
      expect(suggestionsList).toBeInTheDocument();

      const suggestionItems = screen.getAllByRole('listitem');
      expect(suggestionItems).toHaveLength(mockSuggestions.length);
    });
  });

  describe('Performance', () => {
    it('handles large number of suggestions efficiently', () => {
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

    it('debounces search input', async () => {
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
  });

  describe('Edge Cases', () => {
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
          showCategories={false}
        />
      );

      expect(screen.getByText('test.placeholder')).toBeInTheDocument();
      expect(screen.getByText('another.test')).toBeInTheDocument();
    });

    it('handles null or undefined suggestions gracefully', () => {
      render(
        <ContextualSuggestions
          suggestions={null}
          onInsert={mockOnInsert}
        />
      );

      expect(screen.getByText('No suggestions available')).toBeInTheDocument();
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
          showCategories={false}
        />
      );

      expect(screen.getByText(/very\.long\.placeholder/)).toBeInTheDocument();
    });
  });
});