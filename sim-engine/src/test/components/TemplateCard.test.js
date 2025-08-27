import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TemplateCard from '../../presentation/components/TemplateCard';

describe('TemplateCard', () => {
  const mockTemplate = {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template for unit testing',
    tags: ['test', 'example'],
    metadata: {
      category: 'test',
      difficulty: 'beginner',
      createdAt: '2024-01-01T00:00:00.000Z',
      usageCount: 5,
      lastUsed: '2024-01-15T00:00:00.000Z',
      validationErrors: [],
      validationWarnings: []
    }
  };

  const defaultProps = {
    template: mockTemplate,
    type: 'characters',
    onClick: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onDuplicate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders template information correctly', () => {
    render(<TemplateCard {...defaultProps} />);
    
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('A test template for unit testing')).toBeInTheDocument();
    expect(screen.getAllByText('test')).toHaveLength(2); // One in tag, one in category
    expect(screen.getByText('beginner')).toBeInTheDocument();
  });

  it('displays usage statistics when enabled', () => {
    render(<TemplateCard {...defaultProps} showUsageStats={true} />);
    
    expect(screen.getByText('5 uses')).toBeInTheDocument();
  });

  it('shows validation status when enabled', () => {
    render(<TemplateCard {...defaultProps} showValidationStatus={true} />);
    
    // Should show valid status (green check) since no errors/warnings
    const validationIcon = screen.getByTitle('Template is valid');
    expect(validationIcon).toBeInTheDocument();
  });

  it('displays validation errors when present', () => {
    const templateWithErrors = {
      ...mockTemplate,
      metadata: {
        ...mockTemplate.metadata,
        validationErrors: ['Missing required field'],
        validationWarnings: []
      }
    };

    render(<TemplateCard {...defaultProps} template={templateWithErrors} showValidationStatus={true} />);
    
    const errorIcon = screen.getByTitle('1 validation errors');
    expect(errorIcon).toBeInTheDocument();
  });

  it('displays validation warnings when present', () => {
    const templateWithWarnings = {
      ...mockTemplate,
      metadata: {
        ...mockTemplate.metadata,
        validationErrors: [],
        validationWarnings: ['Recommended field missing']
      }
    };

    render(<TemplateCard {...defaultProps} template={templateWithWarnings} showValidationStatus={true} />);
    
    const warningIcon = screen.getByTitle('1 validation warnings');
    expect(warningIcon).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    render(<TemplateCard {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Test Template'));
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockTemplate);
  });

  it('handles edit action', () => {
    render(<TemplateCard {...defaultProps} />);
    
    const editButton = screen.getByTitle('Edit template');
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTemplate);
  });

  it('handles delete action', () => {
    render(<TemplateCard {...defaultProps} />);
    
    const deleteButton = screen.getByTitle('Delete template');
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockTemplate);
  });

  it('handles duplicate action', () => {
    render(<TemplateCard {...defaultProps} />);
    
    const duplicateButton = screen.getByTitle('Duplicate template');
    fireEvent.click(duplicateButton);
    expect(defaultProps.onDuplicate).toHaveBeenCalledWith(mockTemplate);
  });

  it('shows selected state when isSelected is true', () => {
    render(<TemplateCard {...defaultProps} isSelected={true} />);
    
    // Find the outermost div which should have the border-blue-500 class
    const card = screen.getByText('Test Template').closest('[class*="border-blue-500"]');
    expect(card).toBeInTheDocument();
  });

  it('displays popular badge for high usage templates', () => {
    const popularTemplate = {
      ...mockTemplate,
      metadata: {
        ...mockTemplate.metadata,
        usageCount: 15
      }
    };

    render(<TemplateCard {...defaultProps} template={popularTemplate} showUsageStats={true} />);
    
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('shows recent usage indicator', () => {
    const recentTemplate = {
      ...mockTemplate,
      metadata: {
        ...mockTemplate.metadata,
        lastUsed: new Date().toISOString() // Today
      }
    };

    render(<TemplateCard {...defaultProps} template={recentTemplate} showUsageStats={true} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});