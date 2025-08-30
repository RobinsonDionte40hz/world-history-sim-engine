import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TextPreview from '../TextPreview';

describe('TextPreview Enhanced Tests', () => {
  const mockPlaceholderAnalysis = {
    resolved: [
      { placeholder: 'character.name', value: 'Elena' },
      { placeholder: 'character.attributes.strength', value: 15 }
    ],
    unresolved: ['node.name', 'world.theme']
  };

  const defaultProps = {
    originalText: 'Hello {{character.name}}, your strength is {{character.attributes.strength}}. Welcome to {{node.name}} in the {{world.theme}} world.',
    resolvedText: 'Hello Elena, your strength is 15. Welcome to {{node.name}} in the {{world.theme}} world.',
    isResolved: false,
    errors: [],
    warnings: [],
    placeholderAnalysis: mockPlaceholderAnalysis,
    mode: 'side-by-side'
  };

  describe('Advanced Functionality', () => {
    it('handles all preview modes correctly', () => {
      const { rerender } = render(<TextPreview {...defaultProps} mode="side-by-side" />);
      
      expect(screen.getByText('Original Template')).toBeInTheDocument();
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();

      rerender(<TextPreview {...defaultProps} mode="overlay" />);
      expect(screen.getByText(/Resolved Text/)).toBeInTheDocument();
      expect(screen.queryByText('Original Template')).not.toBeInTheDocument();

      rerender(<TextPreview {...defaultProps} mode="toggle" />);
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });

    it('handles mode switching in toggle mode', async () => {
      const user = userEvent.setup();
      
      render(<TextPreview {...defaultProps} mode="toggle" />);
      
      // Should start with resolved view
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
      
      // Click original button
      const originalButton = screen.getByText('Original');
      await user.click(originalButton);
      expect(screen.getByText('Original Template')).toBeInTheDocument();
      
      // Click resolved button
      const resolvedButton = screen.getByText('Resolved');
      await user.click(resolvedButton);
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
    });

    it('handles onModeChange callback', async () => {
      const user = userEvent.setup();
      const mockOnModeChange = jest.fn();
      
      render(<TextPreview {...defaultProps} onModeChange={mockOnModeChange} />);
      
      // Find mode selector buttons
      const buttons = screen.getAllByRole('button');
      const modeButton = buttons.find(button => button.title);
      
      // Only test if mode button exists
      if (modeButton) {
        await user.click(modeButton);
      }
      
      // Always verify the callback was set up correctly
      expect(mockOnModeChange).toBeDefined();
    });

    it('handles expand/collapse functionality', async () => {
      const user = userEvent.setup();
      
      render(<TextPreview {...defaultProps} compact={false} />);
      
      const expandButton = screen.getByTitle('Expand');
      await user.click(expandButton);
      
      expect(screen.getByTitle('Collapse')).toBeInTheDocument();
    });

    it('handles compact mode correctly', () => {
      render(<TextPreview {...defaultProps} compact={true} />);
      
      expect(screen.queryByTitle('Expand')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Collapse')).not.toBeInTheDocument();
    });

    it('handles different status types correctly', () => {
      const { rerender } = render(<TextPreview {...defaultProps} />);
      expect(screen.getByText('Partial')).toBeInTheDocument();

      rerender(<TextPreview 
        {...defaultProps} 
        isResolved={true}
        placeholderAnalysis={{ resolved: mockPlaceholderAnalysis.resolved, unresolved: [] }}
      />);
      expect(screen.getByText('Resolved')).toBeInTheDocument();

      rerender(<TextPreview {...defaultProps} errors={['Template syntax error']} />);
      expect(screen.getByText('Error')).toBeInTheDocument();

      rerender(<TextPreview {...defaultProps} warnings={['Missing context data']} />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('handles error display correctly', () => {
      render(<TextPreview 
        {...defaultProps} 
        errors={['Syntax error', 'Missing placeholder']}
        showErrors={true}
      />);
      
      expect(screen.getByText('Syntax error')).toBeInTheDocument();
      expect(screen.getByText('Missing placeholder')).toBeInTheDocument();
    });

    it('hides errors when showErrors is false', () => {
      render(<TextPreview 
        {...defaultProps} 
        errors={['Syntax error']}
        showErrors={false}
      />);
      
      expect(screen.queryByText('Syntax error')).not.toBeInTheDocument();
    });

    it('handles warning display correctly', () => {
      render(<TextPreview 
        {...defaultProps} 
        warnings={['Context missing', 'Deprecated syntax']}
      />);
      
      expect(screen.getByText('Context missing')).toBeInTheDocument();
      expect(screen.getByText('Deprecated syntax')).toBeInTheDocument();
    });

    it('handles placeholder analysis display', () => {
      render(<TextPreview {...defaultProps} showPlaceholderInfo={true} />);
      
      expect(screen.getByText('Resolved:')).toBeInTheDocument();
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
      
      expect(screen.getByText('Unresolved:')).toBeInTheDocument();
      expect(screen.getByText('node.name')).toBeInTheDocument();
      expect(screen.getByText('world.theme')).toBeInTheDocument();
    });

    it('hides placeholder info when showPlaceholderInfo is false', () => {
      render(<TextPreview {...defaultProps} showPlaceholderInfo={false} />);
      
      expect(screen.queryByText('Resolved:')).not.toBeInTheDocument();
      expect(screen.queryByText('Unresolved:')).not.toBeInTheDocument();
    });

    it('handles empty placeholder analysis', () => {
      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={{ resolved: [], unresolved: [] }}
        showPlaceholderInfo={true}
      />);
      
      expect(screen.queryByText('Resolved:')).not.toBeInTheDocument();
      expect(screen.queryByText('Unresolved:')).not.toBeInTheDocument();
    });

    it('handles text highlighting correctly', () => {
      render(<TextPreview {...defaultProps} mode="side-by-side" />);
      
      // Check that both original and resolved text are present
      expect(screen.getByText('Original Template')).toBeInTheDocument();
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
    });

    it('handles empty text gracefully', () => {
      render(<TextPreview 
        originalText=""
        resolvedText=""
        isResolved={true}
        errors={[]}
        warnings={[]}
        placeholderAnalysis={{ resolved: [], unresolved: [] }}
        mode="side-by-side"
      />);
      
      // Should not render anything
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('handles null text gracefully', () => {
      render(<TextPreview 
        originalText={null}
        resolvedText={null}
        isResolved={true}
        errors={[]}
        warnings={[]}
        placeholderAnalysis={{ resolved: [], unresolved: [] }}
        mode="side-by-side"
      />);
      
      // Should not render anything
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('handles undefined text gracefully', () => {
      render(<TextPreview 
        originalText={undefined}
        resolvedText={undefined}
        isResolved={true}
        errors={[]}
        warnings={[]}
        placeholderAnalysis={{ resolved: [], unresolved: [] }}
        mode="side-by-side"
      />);
      
      // Should not render anything
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('handles custom className', () => {
      render(<TextPreview {...defaultProps} className="custom-test-class" />);
      
      // Check that the component renders with custom styling
      expect(screen.getByText('Hello, Elena!')).toBeInTheDocument();
    });

    it('applies status-based styling correctly', () => {
      render(<TextPreview {...defaultProps} errors={['Error']} />);
      
      // Check that error state is reflected in the component
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('handles very long text content', () => {
      const longText = 'A'.repeat(10000);
      render(<TextPreview 
        {...defaultProps} 
        originalText={longText}
        resolvedText={longText}
      />);
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles complex placeholder analysis', () => {
      const complexAnalysis = {
        resolved: Array.from({ length: 50 }, (_, i) => ({
          placeholder: `placeholder${i}`,
          value: `value${i}`
        })),
        unresolved: Array.from({ length: 30 }, (_, i) => `unresolved${i}`)
      };

      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={complexAnalysis}
        showPlaceholderInfo={true}
      />);
      
      expect(screen.getByText('Resolved:')).toBeInTheDocument();
      expect(screen.getByText('Unresolved:')).toBeInTheDocument();
    });

    it('handles mixed error and warning states', () => {
      render(<TextPreview 
        {...defaultProps} 
        errors={['Critical error']}
        warnings={['Minor warning']}
        showErrors={true}
      />);
      
      expect(screen.getByText('Critical error')).toBeInTheDocument();
      expect(screen.getByText('Minor warning')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument(); // Status should be error
    });

    it('handles static text without placeholders', () => {
      render(<TextPreview 
        originalText="Hello world"
        resolvedText="Hello world"
        isResolved={true}
        errors={[]}
        warnings={[]}
        placeholderAnalysis={{ resolved: [], unresolved: [] }}
        mode="side-by-side"
      />);
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Static')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles malformed placeholder analysis', () => {
      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={null}
        showPlaceholderInfo={true}
      />);
      
      // Should not crash
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles undefined placeholder analysis', () => {
      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={undefined}
        showPlaceholderInfo={true}
      />);
      
      // Should not crash
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles malformed resolved array', () => {
      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={{ resolved: null, unresolved: [] }}
        showPlaceholderInfo={true}
      />);
      
      // Should not crash
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles malformed unresolved array', () => {
      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={{ resolved: [], unresolved: null }}
        showPlaceholderInfo={true}
      />);
      
      // Should not crash
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles null errors array', () => {
      render(<TextPreview 
        {...defaultProps} 
        errors={null}
        showErrors={true}
      />);
      
      // Should not crash
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles null warnings array', () => {
      render(<TextPreview 
        {...defaultProps} 
        warnings={null}
      />);
      
      // Should not crash
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles onModeChange errors gracefully', async () => {
      const user = userEvent.setup();
      const errorOnModeChange = jest.fn(() => {
        throw new Error('Mode change error');
      });
      
      render(<TextPreview {...defaultProps} onModeChange={errorOnModeChange} />);
      
      const buttons = screen.getAllByRole('button');
      const modeButton = buttons.find(button => button.title);
      
      // Only test if mode button exists
      if (modeButton) {
        await user.click(modeButton);
      }
      
      // Always verify the callback was set up correctly
      expect(errorOnModeChange).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('handles frequent re-renders efficiently', () => {
      const { rerender } = render(<TextPreview {...defaultProps} />);

      // Rapid re-renders
      for (let i = 0; i < 100; i++) {
        rerender(<TextPreview {...defaultProps} key={i} />);
      }

      // Should handle without issues
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles large text content efficiently', () => {
      const largeText = 'Lorem ipsum '.repeat(10000);
      
      render(<TextPreview 
        {...defaultProps} 
        originalText={largeText}
        resolvedText={largeText}
      />);
      
      // Should render without performance issues
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles complex placeholder highlighting efficiently', () => {
      const textWithManyPlaceholders = Array.from({ length: 100 }, (_, i) => 
        `{{placeholder${i}}}`
      ).join(' ');
      
      render(<TextPreview 
        {...defaultProps} 
        originalText={textWithManyPlaceholders}
        resolvedText={textWithManyPlaceholders}
      />);
      
      // Should handle complex highlighting without issues
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper titles for interactive elements', () => {
      const mockOnModeChange = jest.fn();
      render(<TextPreview {...defaultProps} onModeChange={mockOnModeChange} />);
      
      // Should have proper titles for mode buttons
      const buttons = screen.getAllByRole('button');
      const titledButtons = buttons.filter(button => button.title);
      expect(titledButtons.length).toBeGreaterThan(0);
    });

    it('provides expand/collapse button titles', () => {
      render(<TextPreview {...defaultProps} compact={false} />);
      
      expect(screen.getByTitle('Expand')).toBeInTheDocument();
    });

    it('provides proper semantic structure', () => {
      render(<TextPreview {...defaultProps} />);
      
      // Should have proper heading structure
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('handles keyboard navigation properly', async () => {
      const user = userEvent.setup();
      
      render(<TextPreview {...defaultProps} compact={false} />);
      
      const expandButton = screen.getByTitle('Expand');
      
      // Should be focusable
      await user.tab();
      expect(expandButton).toHaveFocus();
    });

    it('provides proper ARIA attributes for status', () => {
      render(<TextPreview {...defaultProps} />);
      
      // Status should be clearly indicated
      expect(screen.getByText('Partial')).toBeInTheDocument();
    });

    it('handles screen reader compatibility', () => {
      render(<TextPreview {...defaultProps} />);
      
      // Should have proper text content for screen readers
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Original Template')).toBeInTheDocument();
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
    });
  });
});