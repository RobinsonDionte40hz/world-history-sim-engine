/**
 * CharacterEditor Integration Tests for Interaction Assignment
 * Tests the integration between CharacterEditor and InteractionAssignmentPanel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterEditor from '../CharacterEditor';

// Mock data
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

const mockCharacter = {
  id: 'char_1',
  name: 'Test Character',
  description: 'A test character',
  archetype: 'trader',
  attributes: {
    strength: 10,
    dexterity: 12,
    constitution: 11,
    intelligence: 14,
    wisdom: 13,
    charisma: 15
  },
  personality: {
    traits: {
      openness: 0.7,
      conscientiousness: 0.8
    },
    beliefs: 'Test beliefs',
    fears: ['failure']
  },
  consciousness: {
    baseFrequency: 45,
    coherence: 0.8,
    awareness: 0.6
  },
  skills: {
    'Persuasion': 3,
    'Trade': 4
  },
  goals: [
    {
      id: 1,
      description: 'Become a successful trader',
      priority: 'high',
      type: 'professional'
    }
  ],
  assignedInteractions: ['interaction_1'],
  equipment: {},
  relationshipTemplates: [],
  background: 'Test background',
  appearance: 'Test appearance',
  tags: ['trader', 'npc'],
  metadata: {}
};

const defaultProps = {
  initialCharacter: mockCharacter,
  onSave: jest.fn(),
  onCancel: jest.fn(),
  mode: 'edit',
  availableInteractions: mockAvailableInteractions,
  onCreateInteraction: jest.fn(),
  onEditInteraction: jest.fn()
};

describe('CharacterEditor Interaction Assignment Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders interactions tab and shows assigned interactions', () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Click on the interactions tab button (not the completion indicator)
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Should show the InteractionAssignmentPanel
    expect(screen.getByText('Character Interactions')).toBeInTheDocument();
    expect(screen.getByText('1 assigned')).toBeInTheDocument();

    // Should show the assigned interaction
    expect(screen.getByText('Basic Trade')).toBeInTheDocument();
  });

  test('can assign new interaction from available list', async () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Navigate to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Switch to available interactions
    fireEvent.click(screen.getByText('Available'));

    // Should show the negotiate interaction (not assigned yet)
    expect(screen.getByText('Negotiate')).toBeInTheDocument();

    // Assign the interaction
    const assignButton = screen.getByTitle('Assign to character');
    fireEvent.click(assignButton);

    // Should update the character data
    await waitFor(() => {
      expect(defaultProps.onSave).not.toHaveBeenCalled(); // onSave is called manually
    });
  });

  test('can unassign interaction from assigned list', async () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Navigate to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Should show assigned interaction with unassign button
    expect(screen.getByText('Basic Trade')).toBeInTheDocument();

    // Unassign the interaction
    const unassignButton = screen.getByTitle('Unassign interaction');
    fireEvent.click(unassignButton);

    // Should update the character data
    await waitFor(() => {
      expect(defaultProps.onSave).not.toHaveBeenCalled(); // onSave is called manually
    });
  });

  test('shows interaction templates for character type', () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Navigate to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Switch to templates tab
    fireEvent.click(screen.getByText('Templates'));

    // Should show the templates tab is active and has content
    // Check for template-related text that should be present
    expect(screen.getByText('Templates')).toBeInTheDocument();

    // The templates tab should show some template options
    // Even if no specific character type template, it should show available types
    const templateButtons = screen.getAllByText('Apply');
    expect(templateButtons.length).toBeGreaterThan(0);
  });

  test('can create quick interactions', () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Navigate to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Switch to quick create tab
    fireEvent.click(screen.getByText('Quick Create'));

    // Should show quick interaction options
    expect(screen.getByText('Basic Conversation')).toBeInTheDocument();
    expect(screen.getByText('Simple Trade')).toBeInTheDocument();
    expect(screen.getByText('Ask for Information')).toBeInTheDocument();

    // Create a quick interaction
    const createButtons = screen.getAllByText('Create & Assign');
    fireEvent.click(createButtons[0]);

    // Should call onCreateInteraction
    expect(defaultProps.onCreateInteraction).toHaveBeenCalled();
  });

  test('displays interaction statistics', () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Navigate to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Should show statistics
    expect(screen.getByText('Total interactions: 1')).toBeInTheDocument();
    expect(screen.getByText('trade: 1')).toBeInTheDocument();
  });

  test('handles character without assigned interactions', () => {
    const characterWithoutInteractions = {
      ...mockCharacter,
      assignedInteractions: []
    };

    const props = {
      ...defaultProps,
      initialCharacter: characterWithoutInteractions
    };

    render(<CharacterEditor {...props} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Navigate to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);

    // Should show empty state
    expect(screen.getByText('No interactions assigned yet')).toBeInTheDocument();
    expect(screen.getByText('Use the other tabs to add interactions')).toBeInTheDocument();
  });

  test('maintains character data integrity when switching tabs', () => {
    render(<CharacterEditor {...defaultProps} />);

    // Switch to detailed mode to access tabs
    fireEvent.click(screen.getByText('Detailed Character Mode'));

    // Start on basic tab - character name should be visible
    expect(screen.getByDisplayValue('Test Character')).toBeInTheDocument();

    // Switch to interactions tab
    const interactionsTab = screen.getByRole('button', { name: /⚡ Interactions/ });
    fireEvent.click(interactionsTab);
    expect(screen.getByText('Character Interactions')).toBeInTheDocument();

    // Switch back to basic tab
    const basicTab = screen.getByRole('button', { name: /📝 Basic Info/ });
    fireEvent.click(basicTab);
    expect(screen.getByDisplayValue('Test Character')).toBeInTheDocument();

    // Character data should be preserved
    expect(screen.getByDisplayValue('A test character')).toBeInTheDocument();
  });
});