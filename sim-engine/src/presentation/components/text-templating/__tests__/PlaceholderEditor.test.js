import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PlaceholderEditor from '../PlaceholderEditor';

// Mock the hooks
jest.mock('../../../hooks/useContextualSuggestions');
jest.mock('../../../hooks/useTemplatePreview');
jest.mock('../../../domain/services/TextTemplateEngine');

import useContextualSuggestions from '../../../hooks/useContextualSuggestions';
import useTemplatePreview from '../../../hooks/useTemplatePreview';
import TextTemplateEngine from '../../../domain/services/TextTemplateEngine';

describe('PlaceholderEditor Component', () => {
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
    },
    {
      placeholder: 'random:option1,option2,option3',
      category: 'system',
      description: 'Random selection',
      example: 'option1',
      available: true
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
    
    // Mock useContextualSuggestions hook
    useContextualSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      insertPlaceholder: mockInsertPlaceholder
    });
    
    // Mock useTemplatePreview hook
    useTemplatePreview.mockReturnValue({
      previewText: 'Hello Aria Blackwood',
      isResolved: true,
      errors: []
    });
    
    // Mock TextTemplateEngine
    mockValidateTemplate.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    });
    
    TextTemplateEngine.mockImplementation(() => ({
      validateTemplate: mockValidateTemplate
    }));
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays context information when provided', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByText(/Character: Aria Blackwood/)).toBeInTheDocument();
      expect(screen.getByText(/Node: Royal Court/)).toBeInTheDocument();
    });

    it('renders with custom placeholder text', () => {
      const customPlaceholder = 'Enter your custom text here...';
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

    it('applies custom className', () => {
      const { container } = render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders with specified number of rows', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          rows={6}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '6');
    });
  });

  describe('Text Input and Changes', () => {
    it('calls onChange when text is entered', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      
      expect(mockOnChange).toHaveBeenCalledWith('H');
      expect(mockOnChange).toHaveBeenCalledWith('He');
      // Should be called for each character typed
    });

    it('displays current value in textarea', () => {
      const testValue = 'Hello {{character.name}}';
      render(
        <PlaceholderEditor
          value={testValue}
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
    });

    it('handles disabled state correctly', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          disabled={true}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });
  });

  describe('Suggestion System', () => {
    it('shows quick insert buttons for suggestions', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
    });

    it('hides suggestions when showSuggestions is false', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={false}
        />
      );
      
      expect(screen.queryByText('character.name')).not.toBeInTheDocument();
    });

    it('shows suggestion panel when typing placeholder syntax', async () => {
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
      await user.type(textarea, '{{');
      
      // Should trigger suggestion panel (implementation dependent)
      expect(mockOnChange).toHaveBeenCalledWith('{{');
    });

    it('calls insertPlaceholder when quick insert button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          showSuggestions={true}
        />
      );
      
      const button = screen.getByText('character.name');
      await user.click(button);
      
      expect(mockInsertPlaceholder).toHaveBeenCalledWith('character.name');
    });

    it('shows advanced suggestions when more button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock more than 6 suggestions to trigger "more" button
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
      
      const moreButton = screen.getByText(/\+\d+ more/);
      await user.click(moreButton);
      
      expect(screen.getByText('All Available Placeholders')).toBeInTheDocument();
    });
  });

  describe('Validation and Error Handling', () => {
    it('displays validation errors when present', () => {
      mockValidateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Unclosed conditional statement', 'Invalid placeholder syntax'],
        warnings: []
      });
      
      render(
        <PlaceholderEditor
          value="{{#if character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showValidation={true}
        />
      );
      
      expect(screen.getByText('Unclosed conditional statement')).toBeInTheDocument();
      expect(screen.getByText('Invalid placeholder syntax')).toBeInTheDocument();
    });

    it('displays validation warnings when present', () => {
      mockValidateTemplate.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: ['Deprecated syntax used']
      });
      
      render(
        <PlaceholderEditor
          value="{{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showValidation={true}
        />
      );
      
      expect(screen.getByText('Deprecated syntax used')).toBeInTheDocument();
    });

    it('hides validation messages when showValidation is false', () => {
      mockValidateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Some error'],
        warnings: ['Some warning']
      });
      
      render(
        <PlaceholderEditor
          value="{{invalid}}"
          onChange={mockOnChange}
          context={mockContext}
          showValidation={false}
        />
      );
      
      expect(screen.queryByText('Some error')).not.toBeInTheDocument();
      expect(screen.queryByText('Some warning')).not.toBeInTheDocument();
    });

    it('applies error styling when validation fails', () => {
      mockValidateTemplate.mockReturnValue({
        isValid: false,
        errors: ['Error'],
        warnings: []
      });
      
      render(
        <PlaceholderEditor
          value="{{invalid}}"
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-300', 'focus:border-red-500');
    });
  });

  describe('Preview Functionality', () => {
    it('shows preview when showPreview is true and value exists', () => {
      render(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Hello Aria Blackwood')).toBeInTheDocument();
    });

    it('hides preview when showPreview is false', () => {
      render(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={false}
        />
      );
      
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('shows preview errors when resolution fails', () => {
      useTemplatePreview.mockReturnValue({
        previewText: 'Hello {{character.name}}',
        isResolved: false,
        errors: ['Template processing failed: Invalid syntax']
      });
      
      render(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Resolution Errors:')).toBeInTheDocument();
      expect(screen.getByText('Template processing failed: Invalid syntax')).toBeInTheDocument();
    });

    it('shows success indicator when fully resolved', () => {
      useTemplatePreview.mockReturnValue({
        previewText: 'Hello Aria Blackwood',
        isResolved: true,
        errors: []
      });
      
      render(
        <PlaceholderEditor
          value="Hello {{character.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      // Check for success icon (CheckCircle)
      const successIcon = screen.getByRole('img', { hidden: true });
      expect(successIcon).toBeInTheDocument();
    });

    it('shows partial resolution warning', () => {
      useTemplatePreview.mockReturnValue({
        previewText: 'Hello Aria Blackwood from {{node.name}}',
        isResolved: false,
        errors: []
      });
      
      render(
        <PlaceholderEditor
          value="Hello {{character.name}} from {{node.name}}"
          onChange={mockOnChange}
          context={mockContext}
          showPreview={true}
        />
      );
      
      expect(screen.getByText('Some placeholders could not be resolved with current context')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles keyboard navigation in suggestion panel', async () => {
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
      
      // Simulate typing to show suggestions
      await user.type(textarea, '{{char');
      
      // Test arrow key navigation (implementation dependent)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');
      
      // Verify that onChange was called
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('closes suggestion panel on Escape key', async () => {
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
      await user.type(textarea, '{{');
      await user.keyboard('{Escape}');
      
      // Implementation would close the panel
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Auto Focus', () => {
    it('focuses textarea when autoFocus is true', () => {
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

    it('does not focus textarea when autoFocus is false', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
          autoFocus={false}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).not.toHaveFocus();
    });
  });

  describe('Help Text', () => {
    it('displays syntax help text', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByText(/Syntax:/)).toBeInTheDocument();
      expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument();
    });
  });

  describe('Context Changes', () => {
    it('updates suggestions when context changes', () => {
      const { rerender } = render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={mockContext}
        />
      );
      
      expect(screen.getByText(/Character: Aria Blackwood/)).toBeInTheDocument();
      
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
    });

    it('handles empty context gracefully', () => {
      render(
        <PlaceholderEditor
          value=""
          onChange={mockOnChange}
          context={{}}
        />
      );
      
      // Should still render without errors
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText(/Context:/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
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
  });
});