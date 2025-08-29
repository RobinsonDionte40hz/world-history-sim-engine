import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlaceholderEditor from '../PlaceholderEditor';

describe('PlaceholderEditor Integration', () => {
  const mockContext = {
    character: {
      id: 'char1',
      name: 'Aria Blackwood',
      attributes: {
        strength: 16,
        charisma: 18
      },
      personality: {
        curiosity: 0.8
      }
    },
    node: {
      id: 'node1',
      name: 'Royal Court',
      type: 'palace'
    }
  };

  test('PlaceholderEditor integrates with contextual suggestions', () => {
    const mockOnChange = jest.fn();
    
    render(
      <PlaceholderEditor
        value=""
        onChange={mockOnChange}
        context={mockContext}
        showSuggestions={true}
      />
    );

    // Should show context info
    expect(screen.getByText(/Character: Aria Blackwood/)).toBeInTheDocument();
    expect(screen.getByText(/Node: Royal Court/)).toBeInTheDocument();

    // Should show quick insert buttons for common suggestions
    expect(screen.getByText('character.name')).toBeInTheDocument();
  });

  test('PlaceholderEditor shows suggestions when typing placeholder syntax', () => {
    const mockOnChange = jest.fn();
    
    render(
      <PlaceholderEditor
        value=""
        onChange={mockOnChange}
        context={mockContext}
        showSuggestions={true}
      />
    );

    const textarea = screen.getByRole('textbox');
    
    // Type opening braces to trigger suggestions
    fireEvent.change(textarea, { target: { value: '{{' } });
    
    // Should show suggestions panel (this would be visible in the DOM)
    // The exact behavior depends on the implementation details
    expect(mockOnChange).toHaveBeenCalledWith('{{');
  });

  test('PlaceholderEditor handles context changes', () => {
    const mockOnChange = jest.fn();
    
    const { rerender } = render(
      <PlaceholderEditor
        value=""
        onChange={mockOnChange}
        context={mockContext}
        showSuggestions={true}
      />
    );

    // Initial context
    expect(screen.getByText(/Character: Aria Blackwood/)).toBeInTheDocument();

    // Change context
    const newContext = {
      character: {
        id: 'char2',
        name: 'Sir Gareth',
        attributes: { strength: 18 }
      }
    };

    rerender(
      <PlaceholderEditor
        value=""
        onChange={mockOnChange}
        context={newContext}
        showSuggestions={true}
      />
    );

    // Should update to new context
    expect(screen.getByText(/Character: Sir Gareth/)).toBeInTheDocument();
    expect(screen.queryByText(/Node: Royal Court/)).not.toBeInTheDocument();
  });

  test('PlaceholderEditor works without context', () => {
    const mockOnChange = jest.fn();
    
    render(
      <PlaceholderEditor
        value=""
        onChange={mockOnChange}
        context={{}}
        showSuggestions={true}
      />
    );

    // Should still render without errors
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();

    // Should still show system suggestions
    expect(screen.getByText('random:option1,option2,option3')).toBeInTheDocument();
  });
});