import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PlaceholderEditor from '../PlaceholderEditor';
import useContextualSuggestions from '../../../hooks/useContextualSuggestions';
import useTemplatePreview from '../../../hooks/useTemplatePreview';
import TextTemplateEngine from '../../../../domain/services/TextTemplateEngine';

// Mock the hooks
jest.mock('../../../hooks/useContextualSuggestions');
jest.mock('../../../hooks/useTemplatePreview');
jest.mock('../../../../domain/services/TextTemplateEngine');

describe('PlaceholderEditor Enhanced Tests', () => {
  const mockOnChange = jest.fn();
  
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
    }
  ];

  const mockContext = {
    character: {
      id: 'char1',
      name: 'Aria Blackwood',
      attributes: { strength: 16, charisma: 18 }
    },
    node: {
      id: 'node1',
      name: 'Royal Court',
      type: 'palace'
    }
  };

  const mockInsertPlaceholder = jest.fn();
  const mockValidateTemplate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useContextualSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      insertPlaceholder: mockInsertPlaceholder
    });
    
    useTemplatePreview.mockReturnValue({
      previewText: 'Hello Aria Blackwood',
      isResolved: true,
      errors: []
    });
    
    mockValidateTemplate.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    });
    
    TextTemplateEngine.mockImplementation(() => ({
      validateTemplate: mockValidateTemplate
    }));
  });

  describe('Advanced Functionality', () => {
    it('handles progressive disclosure correctly', async () => {
      const user = userEvent.setup();
      
      // Mock more than 6 suggestions to trigger progressive disclosure
      useContextualSuggestions.mockReturnValue({
        suggestions: [...mockSuggestions, ...Array(5).fill(null).map((_, i) => ({
          placeholder: `extra.placeholder${i}`,
          category: 'extra',
          description: `Extra placeholder ${i}`,
          available: true
        }))],
        insertPlaceholder: mockInsertPlaceholder
      });
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      // Should show "more" button
      const moreButton = screen.getByText(/\+\d+ more/);
      expect(moreButton).toBeInTheDocument();
      
      // Click to expand
      await user.click(moreButton);
      
      expect(screen.getByText('All Available Placeholders')).toBeInTheDocument();
      
      // Should show hide button
      const hideButton = screen.getByText('Hide');
      expect(hideButton).toBeInTheDocument();
      
      // Click to collapse
      await user.click(hideButton);
      
      expect(screen.queryByText('All Available Placeholders')).not.toBeInTheDocument();
    });

    it('handles suggestion panel keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Type to trigger suggestions
      await user.type(textarea, '{{');
      
      // Simulate arrow key navigation
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');
      
      // Should have called onChange
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles escape key to close suggestions', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Type to trigger suggestions
      await user.type(textarea, '{{');
      
      // Should see suggestions
      await waitFor(() => {
        expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
      });
      
      // Press escape
      await user.keyboard('{Escape}');
      
      // Suggestions should be closed
      await waitFor(() => {
        expect(screen.queryByText('Placeholder Suggestions')).not.toBeInTheDocument();
      });
    });

    it('handles cursor position tracking', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value="Hello world"
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Click to set cursor position
      await user.click(textarea);
      
      // Type at cursor position
      await user.type(textarea, ' test');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles complex template validation', () => {
      mockValidateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Invalid syntax'],
        warnings: ['Deprecated placeholder']
      });
      
      render(
        <PlaceholderEditor
          value="{{invalid}}"
          onChange={mockOnChange}
          context={mockContext}
          showValidation={true}
        />
      );
      
      expect(screen.getByText('Invalid syntax')).toBeInTheDocument();
      expect(screen.getByText('Deprecated placeholder')).toBeInTheDocument();
    });

    it('handles preview mode switching', () => {
      render(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Hello Aria Blackwood')).toBeInTheDocument();
    });

    it('handles context changes dynamically', () => {
      const { rerender } = render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const newContext = {
        ...mockContext,
        character: { ...mockContext.character, name: 'New Name' }
      };
      
      useTemplatePreview.mockReturnValue({
        previewText: 'Hello New Name',
        isResolved: true,
        errors: []
      });
      
      rerender(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={newContext}
        />
      );
      
      expect(screen.getByText('Hello New Name')).toBeInTheDocument();
    });

    it('handles suggestion insertion with cursor positioning', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      // Find and click the first quick insert button
      const button = screen.getAllByRole('button')[0];
      fireEvent.click(button);
      
      // Check that insertPlaceholder was called with the correct parameters
      // The function signature is: insertPlaceholder(placeholder, startPos, endPos, callback)
      expect(mockInsertPlaceholder).toHaveBeenCalledWith(
        'character.name',
        expect.any(Number),  // startPos
        expect.any(Number),  // endPos  
        expect.any(Function) // callback
      );
    });

    it('handles disabled state properly', () => {
      render(
        <PlaceholderEditor
          value="Test"
          onChange={mockOnChange}
          context={mockContext}
          disabled={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });

    it('handles auto focus functionality', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          autoFocus={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });

    it('handles empty context gracefully', () => {
      useContextualSuggestions.mockReturnValue({
        suggestions: [],
        insertPlaceholder: mockInsertPlaceholder
      });
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={{}}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles null context gracefully', () => {
      useContextualSuggestions.mockReturnValue({
        suggestions: [],
        insertPlaceholder: mockInsertPlaceholder
      });
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={null}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles undefined onChange gracefully', () => {
      render(
        <PlaceholderEditor
          value="Test"
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New value' } });
      
      // Should not crash
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays help text correctly', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      expect(screen.getByText(/for variables/)).toBeInTheDocument();
      expect(screen.getByText(/Type.*to see suggestions/)).toBeInTheDocument();
    });

    it('handles very long text values', () => {
      const longText = 'A'.repeat(10000);
      render(
        <PlaceholderEditor
          value={longText}
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    it('handles custom rows prop', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          rows={8}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '8');
    });

    it('handles custom className', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          className="custom-test-class"
        />
      );
      
      expect(screen.getByRole('textbox')).toHaveClass('custom-test-class');
    });

    it('handles custom placeholder text', () => {
      const customPlaceholder = 'Enter your custom template here...';
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          placeholder={customPlaceholder}
        />
      );
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles template engine errors gracefully', () => {
      // Set up the mock to return safe defaults when there's an error
      mockValidateTemplate.mockImplementation(() => {
        return {
          isValid: false,
          errors: ['Template engine error'],
          warnings: []
        };
      });
      
      render(
        <PlaceholderEditor
          value="{{invalid}}"
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      // Should still render the component
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      // Should display the error message
      expect(screen.getByText('Template engine error')).toBeInTheDocument();
    });

    it('handles hook errors gracefully', () => {
      // Create an error boundary component for testing
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          // eslint-disable-next-line testing-library/no-node-access
          return this.props.children;
        }
      }

      // Mock the hook to throw an error
      useContextualSuggestions.mockImplementation(() => {
        throw new Error('Hook error');
      });
      
      render(
        <ErrorBoundary>
          <PlaceholderEditor
            value=""
            onChange={mockOnChange}
            context={mockContext}
          />
        </ErrorBoundary>
      );
      
      // Should show error boundary fallback
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('handles preview errors gracefully', () => {
      useTemplatePreview.mockReturnValue({
        previewText: '',
        isResolved: false,
        errors: ['Critical preview error']
      });
      
      render(
        <PlaceholderEditor
          value="{{invalid}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Resolution Errors:')).toBeInTheDocument();
      expect(screen.getByText('• Critical preview error')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles rapid text changes without issues', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Rapid typing
      await user.type(textarea, 'Hello world test', { delay: 1 });
      
      // Should handle without issues
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles large suggestion lists efficiently', () => {
      const largeSuggestionList = Array.from({ length: 1000 }, (_, i) => ({
        placeholder: `item${i}`,
        category: 'test',
        description: `Test item ${i}`,
        available: true
      }));
      
      useContextualSuggestions.mockReturnValue({
        suggestions: largeSuggestionList,
        insertPlaceholder: mockInsertPlaceholder
      });
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      // Should only show limited suggestions initially
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeLessThanOrEqual(7); // 6 suggestions + "more" button
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAccessibleName();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Tab to focus
      await user.tab();
      expect(textarea).toHaveFocus();
      
      // Type to trigger suggestions
      await user.type(textarea, '{{');
      
      // Navigate with keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('provides proper focus management', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Focus and blur
      await user.click(textarea);
      expect(textarea).toHaveFocus();
      
      await user.tab();
      expect(textarea).not.toHaveFocus();
    });
  });
});