/**
 * InteractionAssignmentPanel Tests
 * Tests the interaction assignment UI component functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractionAssignmentPanel from '../InteractionAssignmentPanel';

// Mock data
const mockCharacter = {
  id: 'char_1',
  name: 'Test Character',
  type: 'trader',
  characterClass: 'merchant'
};

const mockAvailableInteractions = [
  {
    id: 'interaction_1',
    name: 'Basic Trade',
    description: 'Simple trading interaction',
    category: 'trade',
    branches: [
      { text: 'Buy items', effects: [] },
      { text: 'Sell items', effects: [] }
    ]
  },
  {
    id: 'interaction_2',
    name: 'Negotiate',
    description: 'Negotiate prices',
    category: 'social',
    branches: [
      { text: 'Ask for discount', effects: [] }
    ]
  }
];

const mockAssignedInteractions = [
  {
    id: 'interaction_1',
    name: 'Basic Trade',
    description: 'Simple trading interaction',
    category: 'trade',
    branches: [
      { text: 'Buy items', effects: [] },
      { text: 'Sell items', effects: [] }
    ]
  }
];

const defaultProps = {
  character: mockCharacter,
  assignedInteractions: mockAssignedInteractions,
  availableInteractions: mockAvailableInteractions,
  onAssignInteraction: jest.fn(),
  onUnassignInteraction: jest.fn(),
  onCreateInteraction: jest.fn(),
  onEditInteraction: jest.fn()
};

describe('InteractionAssignmentPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct tabs', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Quick Create')).toBeInTheDocument();
  });

  test('shows assigned interactions by default', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    expect(screen.getByText('Basic Trade')).toBeInTheDocument();
    expect(screen.getByText('Simple trading interaction')).toBeInTheDocument();
    expect(screen.getByText('2 response options')).toBeInTheDocument();
  });

  test('can switch to available interactions tab', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Available'));
    
    expect(screen.getByPlaceholderText('Search interactions...')).toBeInTheDocument();
    expect(screen.getByText('Negotiate')).toBeInTheDocument();
  });

  test('can assign interaction from available list', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Available'));
    
    // The "Negotiate" interaction should be available since only "Basic Trade" is assigned
    expect(screen.getByText('Negotiate')).toBeInTheDocument();
    
    // Find and click the assign button for the Negotiate interaction
    const assignButtons = screen.getAllByTitle('Assign to character');
    fireEvent.click(assignButtons[0]); // Should be the Negotiate interaction
    
    expect(defaultProps.onAssignInteraction).toHaveBeenCalledWith('char_1', 'interaction_2');
  });

  test('can unassign interaction from assigned list', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    const unassignButton = screen.getByTitle('Unassign interaction');
    fireEvent.click(unassignButton);
    
    expect(defaultProps.onUnassignInteraction).toHaveBeenCalledWith('char_1', 'interaction_1');
  });

  test('shows templates for character type', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Templates'));
    
    expect(screen.getByText('Recommended for Trader')).toBeInTheDocument();
  });

  test('can create quick interaction', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Quick Create'));
    
    const createButton = screen.getAllByText('Create & Assign')[0];
    fireEvent.click(createButton);
    
    expect(defaultProps.onCreateInteraction).toHaveBeenCalled();
    expect(defaultProps.onAssignInteraction).toHaveBeenCalled();
  });

  test('filters available interactions by search term', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Available'));
    
    const searchInput = screen.getByPlaceholderText('Search interactions...');
    fireEvent.change(searchInput, { target: { value: 'negotiate' } });
    
    expect(screen.getByText('Negotiate')).toBeInTheDocument();
    expect(screen.queryByText('Basic Trade')).not.toBeInTheDocument();
  });

  test('shows empty state when no interactions assigned', () => {
    const propsWithNoAssigned = {
      ...defaultProps,
      assignedInteractions: []
    };
    
    render(<InteractionAssignmentPanel {...propsWithNoAssigned} />);
    
    expect(screen.getByText('No interactions assigned yet')).toBeInTheDocument();
    expect(screen.getByText('Use the other tabs to add interactions')).toBeInTheDocument();
  });

  test('displays interaction statistics', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);
    
    expect(screen.getByText('Total interactions: 1')).toBeInTheDocument();
    expect(screen.getByText('trade: 1')).toBeInTheDocument();
  });

  test('handles character without type gracefully', () => {
    const characterWithoutType = {
      ...mockCharacter,
      type: undefined,
      characterClass: undefined
    };
    
    const props = {
      ...defaultProps,
      character: characterWithoutType
    };
    
    render(<InteractionAssignmentPanel {...props} />);
    
    // Should not crash and should still render
    expect(screen.getByText('Character Interactions')).toBeInTheDocument();
  });
});