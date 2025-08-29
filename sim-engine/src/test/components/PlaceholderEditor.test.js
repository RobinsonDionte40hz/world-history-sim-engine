import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaceholderEditor from '../../presentation/components/text-templating/PlaceholderEditor';

describe('PlaceholderEditor', () => {
  const mockContext = {
    character: {
      name: 'Test Character',
      attributes: {
        strength: 16,
        charisma: 14
      }
    },
    node: {
      name: 'Test Location',
      type: 'tavern'
    }
  };

  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    context: mockContext,
    placeholder: 'Enter text...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should render textarea with placeholder', () => {
      render(<PlaceholderEditor {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Enter text...');
      expect(textarea).toBeInTheDocument();
    });

    test('should display initial value', () => {
      render(<PlaceholderEditor {...defaultProps} value="Hello {{character.name}}" />);
      
      const textarea = screen.getByDisplayValue('Hello {{character.name}}');
      expect(textarea).toBeInTheDocument();
    });

    test('should be disabled when disabled prop is true', () => {
      render(<PlaceholderEditor {...defaultProps} disabled={true} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    test('should apply custom className', () => {
      const { container } = render(<PlaceholderEditor {...defaultProps} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Text Input and Changes', () => {
    test('should call onChange when text is entered', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<PlaceholderEditor {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      
      expect(onChange).toHaveBeenCalledWith('Hello world');
    });

    test('should update value when typing', async () => {
      const user = userEvent.setup();
      let value = '';
      const onChange = (newValue) => { value = newValue; };
      
      const { rerender } = render(<PlaceholderEditor {...defaultProps} value={value} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      
      rerender(<PlaceholderEditor {...defaultProps} value={value} onChange={onChange} />);
      expect(textarea).toHaveValue('Test');
    });
  });

  describe('Placeholder Suggestions', () => {
    test('should show suggestions when typing {{', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{');
      
      await waitFor(() => {
        expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
      });
    });

    test('should filter suggestions based on input', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{char');
      
      await waitFor(() => {
        expect(screen.getByText('character.name')).toBeInTheDocument();
      });
    });

    test('should hide suggestions when not typing placeholder', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      
      await waitFor(() => {
        expect(screen.queryByText('Placeholder Suggestions')).not.toBeInTheDocument();
      });
    });

    test('should insert suggestion when clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<PlaceholderEditor {...defaultProps} onChange={onChange} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{');
      
      await waitFor(() => {
        const suggestion = screen.getByText('character.name');
        expect(suggestion).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('character.name');
      await user.click(suggestion);
      
      expect(onChange).toHaveBeenCalledWith('{{character.name}}');
    });

    test('should navigate suggestions with arrow keys', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{');
      
      await waitFor(() => {
        expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
      });
      
      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      
      // Should not throw errors
      expect(textarea).toBeInTheDocument();
    });

    test('should insert suggestion with Enter key', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<PlaceholderEditor {...defaultProps} onChange={onChange} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{');
      
      await waitFor(() => {
        expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
      });
      
      await user.keyboard('{Enter}');
      
      // Should have called onChange with a placeholder
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall).toMatch(/\{\{.*\}\}/);
    });

    test('should close suggestions with Escape key', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{');
      
      await waitFor(() => {
        expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('Placeholder Suggestions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Quick Insert Buttons', () => {
    test('should show quick insert buttons when suggestions are enabled', () => {
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      // Should show some placeholder buttons
      expect(screen.getByText('character.name')).toBeInTheDocument();
    });

    test('should insert placeholder when quick button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<PlaceholderEditor {...defaultProps} onChange={onChange} showSuggestions={true} />);
      
      const button = screen.getByText('character.name');
      await user.click(button);
      
      expect(onChange).toHaveBeenCalledWith('{{character.name}}');
    });

    test('should not show quick buttons when showSuggestions is false', () => {
      render(<PlaceholderEditor {...defaultProps} showSuggestions={false} />);
      
      expect(screen.queryByText('character.name')).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    test('should show validation errors for invalid templates', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{invalid" showValidation={true} />);
      
      expect(screen.getByText(/Unmatched template braces/)).toBeInTheDocument();
    });

    test('should show validation warnings', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{}}" showValidation={true} />);
      
      expect(screen.getByText(/Empty placeholder found/)).toBeInTheDocument();
    });

    test('should not show validation when disabled', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{invalid" showValidation={false} />);
      
      expect(screen.queryByText(/Unmatched template braces/)).not.toBeInTheDocument();
    });

    test('should apply error styling for invalid templates', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{invalid" showValidation={true} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-300');
    });
  });

  describe('Preview', () => {
    test('should show preview when enabled', () => {
      render(<PlaceholderEditor {...defaultProps} value="Hello {{character.name}}" showPreview={true} />);
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Hello Test Character')).toBeInTheDocument();
    });

    test('should not show preview when disabled', () => {
      render(<PlaceholderEditor {...defaultProps} value="Hello {{character.name}}" showPreview={false} />);
      
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    test('should show resolution errors in preview', () => {
      render(<PlaceholderEditor {...defaultProps} value="Hello {{character.nonexistent}}" showPreview={true} />);
      
      expect(screen.getByText('Resolution Errors:')).toBeInTheDocument();
      expect(screen.getByText(/Placeholder not found: character.nonexistent/)).toBeInTheDocument();
    });

    test('should update preview when value changes', async () => {
      const user = userEvent.setup();
      let value = 'Hello {{character.name}}';
      const onChange = (newValue) => { value = newValue; };
      
      const { rerender } = render(
        <PlaceholderEditor {...defaultProps} value={value} onChange={onChange} showPreview={true} />
      );
      
      expect(screen.getByText('Hello Test Character')).toBeInTheDocument();
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Goodbye {{character.name}}');
      
      rerender(
        <PlaceholderEditor {...defaultProps} value={value} onChange={onChange} showPreview={true} />
      );
      
      expect(screen.getByText('Goodbye Test Character')).toBeInTheDocument();
    });
  });

  describe('Help Text', () => {
    test('should show syntax help', () => {
      render(<PlaceholderEditor {...defaultProps} />);
      
      expect(screen.getByText(/Syntax:/)).toBeInTheDocument();
      expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument();
    });

    test('should explain placeholder syntax', () => {
      render(<PlaceholderEditor {...defaultProps} />);
      
      expect(screen.getByText(/Use.*placeholder.*for variables/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<PlaceholderEditor {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{{');
      
      // Should be able to navigate with keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Escape}');
      
      // Should not throw errors
      expect(textarea).toBeInTheDocument();
    });

    test('should handle focus management', async () => {
      const user = userEvent.setup();
      
      render(<PlaceholderEditor {...defaultProps} showSuggestions={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      expect(textarea).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty context gracefully', () => {
      render(<PlaceholderEditor {...defaultProps} context={{}} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    test('should handle null context', () => {
      render(<PlaceholderEditor {...defaultProps} context={null} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    test('should handle very long text', async () => {
      const user = userEvent.setup();
      const longText = 'Hello {{character.name}} '.repeat(100);
      
      render(<PlaceholderEditor {...defaultProps} value={longText} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(longText);
    });

    test('should handle special characters in placeholders', () => {
      const specialContext = {
        'special-key': 'special value',
        'key with spaces': 'another value'
      };
      
      render(<PlaceholderEditor {...defaultProps} context={specialContext} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    test('should handle rapid typing', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<PlaceholderEditor {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      
      // Type rapidly
      await user.type(textarea, '{{character.name}} is in {{node.name}}', { delay: 1 });
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Integration with TextTemplateEngine', () => {
    test('should validate templates using engine', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{#if character.strength > 15}}Strong{{/if}}" showValidation={true} />);
      
      // Should not show validation errors for valid conditional
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    test('should resolve templates in preview', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{#if character.attributes.strength > 15}}Strong character{{/if}}" showPreview={true} />);
      
      expect(screen.getByText('Strong character')).toBeInTheDocument();
    });

    test('should handle random selections in preview', () => {
      render(<PlaceholderEditor {...defaultProps} value="{{random:hello,hi,greetings}}" showPreview={true} />);
      
      const preview = screen.getByText('Preview').parentElement;
      const previewText = preview.textContent;
      
      expect(['hello', 'hi', 'greetings'].some(word => previewText.includes(word))).toBe(true);
    });
  });
});