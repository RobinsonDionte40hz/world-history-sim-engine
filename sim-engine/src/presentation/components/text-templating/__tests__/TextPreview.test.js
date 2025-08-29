import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextPreview from '../TextPreview';

describe('TextPreview', () => {
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

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<TextPreview {...defaultProps} />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('does not render when no content is provided', () => {
      const { container } = render(<TextPreview originalText="" resolvedText="" />);
      expect(container.firstChild).toBeNull();
    });

    it('displays status correctly for partial resolution', () => {
      render(<TextPreview {...defaultProps} />);
      expect(screen.getByText('Partial')).toBeInTheDocument();
    });

    it('displays status correctly for full resolution', () => {
      render(<TextPreview 
        {...defaultProps} 
        isResolved={true}
        placeholderAnalysis={{ resolved: mockPlaceholderAnalysis.resolved, unresolved: [] }}
      />);
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });

    it('displays status correctly for errors', () => {
      render(<TextPreview 
        {...defaultProps} 
        errors={['Template syntax error']}
      />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('displays status correctly for warnings', () => {
      render(<TextPreview 
        {...defaultProps} 
        warnings={['Missing context data']}
      />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('renders side-by-side mode correctly', () => {
      render(<TextPreview {...defaultProps} mode="side-by-side" />);
      expect(screen.getByText('Original Template')).toBeInTheDocument();
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
    });

    it('renders overlay mode correctly', () => {
      render(<TextPreview {...defaultProps} mode="overlay" />);
      expect(screen.getByText(/Resolved Text/)).toBeInTheDocument();
      expect(screen.queryByText('Original Template')).not.toBeInTheDocument();
    });

    it('renders toggle mode correctly', () => {
      render(<TextPreview {...defaultProps} mode="toggle" />);
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });

    it('switches views in toggle mode', () => {
      render(<TextPreview {...defaultProps} mode="toggle" />);
      
      // Should start with resolved view
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
      
      // Click original button
      fireEvent.click(screen.getByText('Original'));
      expect(screen.getByText('Original Template')).toBeInTheDocument();
      
      // Click resolved button
      fireEvent.click(screen.getByText('Resolved'));
      expect(screen.getByText('Resolved Text')).toBeInTheDocument();
    });

    it('calls onModeChange when mode selector is clicked', () => {
      const mockOnModeChange = jest.fn();
      render(<TextPreview {...defaultProps} onModeChange={mockOnModeChange} />);
      
      // Mode selector buttons should be present
      const modeButtons = screen.getAllByRole('button');
      const overlayButton = modeButtons.find(button => button.title === 'Overlay');
      
      if (overlayButton) {
        fireEvent.click(overlayButton);
        expect(mockOnModeChange).toHaveBeenCalledWith('overlay');
      }
    });
  });

  describe('Error and Warning Display', () => {
    it('displays errors when showErrors is true', () => {
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

    it('displays warnings correctly', () => {
      render(<TextPreview 
        {...defaultProps} 
        warnings={['Context missing', 'Deprecated syntax']}
      />);
      
      expect(screen.getByText('Context missing')).toBeInTheDocument();
      expect(screen.getByText('Deprecated syntax')).toBeInTheDocument();
    });
  });

  describe('Placeholder Information', () => {
    it('displays resolved placeholders when showPlaceholderInfo is true', () => {
      render(<TextPreview {...defaultProps} showPlaceholderInfo={true} />);
      
      expect(screen.getByText('Resolved:')).toBeInTheDocument();
      expect(screen.getByText('character.name')).toBeInTheDocument();
      expect(screen.getByText('character.attributes.strength')).toBeInTheDocument();
    });

    it('displays unresolved placeholders when showPlaceholderInfo is true', () => {
      render(<TextPreview {...defaultProps} showPlaceholderInfo={true} />);
      
      expect(screen.getByText('Unresolved:')).toBeInTheDocument();
      expect(screen.getByText('node.name')).toBeInTheDocument();
      expect(screen.getByText('world.theme')).toBeInTheDocument();
    });

    it('hides placeholder info when showPlaceholderInfo is false', () => {
      render(<TextPreview {...defaultProps} showPlaceholderInfo={false} />);
      
      expect(screen.queryByText('Resolved:')).not.toBeInTheDocument();
      expect(screen.queryByText('Unresolved:')).not.toBeInTheDocument();
    });

    it('does not show placeholder info when no placeholders exist', () => {
      render(<TextPreview 
        {...defaultProps} 
        placeholderAnalysis={{ resolved: [], unresolved: [] }}
        showPlaceholderInfo={true}
      />);
      
      expect(screen.queryByText('Resolved:')).not.toBeInTheDocument();
      expect(screen.queryByText('Unresolved:')).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('toggles expanded state when expand button is clicked', () => {
      render(<TextPreview {...defaultProps} compact={false} />);
      
      const expandButton = screen.getByTitle('Expand');
      fireEvent.click(expandButton);
      
      expect(screen.getByTitle('Collapse')).toBeInTheDocument();
    });

    it('does not show expand button when compact is true', () => {
      render(<TextPreview {...defaultProps} compact={true} />);
      
      expect(screen.queryByTitle('Expand')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Collapse')).not.toBeInTheDocument();
    });
  });

  describe('Text Highlighting', () => {
    it('renders text content with proper structure', () => {
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
  });

  describe('Accessibility', () => {
    it('provides proper titles for interactive elements', () => {
      const mockOnModeChange = jest.fn();
      render(<TextPreview {...defaultProps} onModeChange={mockOnModeChange} />);
      
      expect(screen.getByTitle('Side by Side')).toBeInTheDocument();
      expect(screen.getByTitle('Overlay')).toBeInTheDocument();
      expect(screen.getByTitle('Toggle')).toBeInTheDocument();
    });

    it('provides expand/collapse button titles', () => {
      render(<TextPreview {...defaultProps} compact={false} />);
      
      expect(screen.getByTitle('Expand')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<TextPreview {...defaultProps} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies status-based styling correctly', () => {
      const { container } = render(<TextPreview {...defaultProps} errors={['Error']} />);
      
      expect(container.firstChild).toHaveClass('bg-red-50');
    });
  });
});