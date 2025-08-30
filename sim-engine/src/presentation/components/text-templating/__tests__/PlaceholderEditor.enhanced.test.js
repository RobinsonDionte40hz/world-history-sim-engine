import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PlaceholderEditor from '../PlaceholderEditor';

// Mock the hooks
jest.mock('../../../hooks/useContextualSuggestions');
jest.mock('../../../hooks/useTemplatePreview');
jest.mock('../../../../domain/services/TextTemplateEngine');

import useContextualSuggestions from '../../../hooks/useContextualSuggestions';
import useTemplatePreview from '../../../hooks/useTemplatePreview';
import TextTemplateEngine from '../../../../domain/services/TextTemplateEngine';

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
      await user.type(textarea, '{{char');
      
      // Press escape
      await user.keyboard('{Escape}');
      
      // Suggestions should be handled (implementation dependent)
      expect(mockOnChange).toHaveBeenCalled();
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
      
      // Move cursor
      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      
      // Type to trigger change
      await user.type(textarea, ' ');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles complex template validation', () => {
      mockValidateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Unclosed conditional statement', 'Invalid placeholder syntax'],
        warnings: ['Deprecated syntax used']
      });
      
      render(
        <PlaceholderEditor
          value="{{#if character.name}}Hello{{/if"
          onChange={mockOnChange}
          context={mockContext}
          showValidation={true}
        />
      );
      
      expect(screen.getByText('Unclosed conditional statement')).toBeInTheDocument();
      expect(screen.getByText('Invalid placeholder syntax')).toBeInTheDocument();
      expect(screen.getByText('Deprecated syntax used')).toBeInTheDocument();
    });

    it('handles preview mode switching', () => {
      useTemplatePreview.mockReturnValue({
        previewText: 'Hello Aria Blackwood',
        isResolved: true,
        errors: []
      });
      
      const { rerender } = render(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Hello Aria Blackwood')).toBeInTheDocument();
      
      // Test with preview errors
      useTemplatePreview.mockReturnValue({
        previewText: 'Hello {{character.name}}',
        isResolved: false,
        errors: ['Template processing failed']
      });
      
      rerender(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Resolution Errors:')).toBeInTheDocument();
      expect(screen.getByText('Template processing failed')).toBeInTheDocument();
    });

    it('handles context changes dynamically', () => {
      const { rerender } = render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByText(/Character: Aria Blackwood/)).toBeInTheDocument();
      expect(screen.getByText(/Node: Royal Court/)).toBeInTheDocument();
      
      const newContext = {
        character: {
          id: 'char2',
          name: 'Sir Gareth'
        }
      };
      
      rerender(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={newContext}
        />
      );
      
      expect(screen.getByText(/Character: Sir Gareth/)).toBeInTheDocument();
      expect(screen.queryByText(/Node:/)).not.toBeInTheDocument();
    });

    it('handles suggestion insertion with cursor positioning', () => {
      mockInsertPlaceholder.mockImplementation((placeholder, start, end, callback) => {
        const newValue = 'Hello {{character.name}}';
        const newCursorPos = newValue.length;
        callback(newValue, newCursorPos);
      });
      
      render(
        <PlaceholderEditor
          value="Hello "
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      const button = screen.getByText('character.name');
      fireEvent.click(button);
      
      expect(mockInsertPlaceholder).toHaveBeenCalledWith('character.name');
    });

    it('handles disabled state properly', () => {
      render(
        <PlaceholderEditor
          value="Test value"
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
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={{}}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText(/Context:/)).not.toBeInTheDocument();
    });

    it('handles null context gracefully', () => {
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
          value=""
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      
      // Should not crash when typing
      fireEvent.change(textarea, { target: { value: 'test' } });
    });

    it('displays help text correctly', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByText(/Syntax:/)).toBeInTheDocument();
      expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument();
      expect(screen.getByText(/Use.*for variables/)).toBeInTheDocument();
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
      const { container } = render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          className="custom-test-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-test-class');
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
      mockValidateTemplate.mockImplementation(() => {
        throw new Error('Template engine error');
      });
      
      render(
        <PlaceholderEditor
          value="{{invalid}}"
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      // Should not crash
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles hook errors gracefully', () => {
      useContextualSuggestions.mockImplementation(() => {
        throw new Error('Hook error');
      });
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      // Should not crash
      expect(screen.getByRole('textbox')).toBeInTheDocument();
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
      expect(screen.getByText('Critical preview error')).toBeInTheDocument();
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
      
      const { container } = render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      // Should render without performance issues
      expect(container).toBeInTheDocument();
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
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder');
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
      
      // Should be focusable
      await user.tab();
      expect(textarea).toHaveFocus();
      
      // Should handle keyboard input
      await user.keyboard('Hello');
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('provides proper focus management', async () => {
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
      const button = screen.getByText('character.name');
      
      // Focus should move properly
      await user.click(button);
      await user.tab();
      
      expect(mockInsertPlaceholder).toHaveBeenCalled();
    });
  });
});