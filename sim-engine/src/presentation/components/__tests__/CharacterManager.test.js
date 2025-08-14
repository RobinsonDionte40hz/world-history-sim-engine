/**
 * CharacterManager Component Tests
 * 
 * Tests for the comprehensive character management interface
 * covering listing, searching, filtering, and character actions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterManager from '../CharacterManager';
import { useSimulationContext } from '../../contexts/SimulationContext';

// Mock the SimulationContext
jest.mock('../../contexts/SimulationContext');

// Mock the Modal component
jest.mock('../Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    );
  };
});

// Mock data
const mockCharacters = [
  {
    id: 'char1',
    name: 'Aragorn',
    description: 'A skilled ranger and future king',
    race: 'Human',
    characterClass: 'Ranger',
    level: 10,
    attributes: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 12,
      wisdom: 13,
      charisma: 14
    },
    characterType: {
      typeId: 'warrior',
      category: 'important'
    },
    assignedInteractions: ['interact1', 'interact2'],
    tags: ['hero', 'ranger', 'king'],
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'char2',
    name: 'Gandalf',
    description: 'A wise wizard with great power',
    race: 'Maiar',
    characterClass: 'Wizard',
    level: 20,
    attributes: {
      strength: 10,
      dexterity: 12,
      constitution: 14,
      intelligence: 20,
      wisdom: 18,
      charisma: 16
    },
    characterType: {
      typeId: 'scholar',
      category: 'important'
    },
    assignedInteractions: ['interact3'],
    tags: ['wizard', 'wise', 'powerful'],
    createdAt: '2023-01-02T00:00:00Z'
  },
  {
    id: 'char3',
    name: 'Merchant Bob',
    description: 'A simple trader in the marketplace',
    race: 'Human',
    characterClass: 'Commoner',
    level: 1,
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 12,
      wisdom: 10,
      charisma: 14
    },
    characterType: {
      typeId: 'merchant',
      category: 'npc'
    },
    assignedInteractions: [],
    tags: ['trader', 'common'],
    createdAt: '2023-01-03T00:00:00Z'
  }
];

const mockWorldBuilder = {
  getAllCharacters: jest.fn(() => mockCharacters),
  deleteCharacter: jest.fn(),
  worldConfig: {
    nodePopulations: {
      'node1': ['char1'],
      'node2': ['char2']
    },
    nodes: [
      { id: 'node1', name: 'Minas Tirith' },
      { id: 'node2', name: 'Rivendell' }
    ]
  }
};

const mockTemplateManager = {
  getTemplate: jest.fn(),
  saveTemplate: jest.fn()
};

const defaultMockContext = {
  worldBuilder: mockWorldBuilder,
  templateManager: mockTemplateManager
};

describe('CharacterManager', () => {
  const mockOnEditCharacter = jest.fn();
  const mockOnCreateCharacter = jest.fn();
  const mockOnViewCharacter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useSimulationContext.mockReturnValue(defaultMockContext);
  });

  describe('Component Rendering', () => {
    test('renders character manager with header', async () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
          onViewCharacter={mockOnViewCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Character Management')).toBeInTheDocument();
        expect(screen.getByText('3 of 3')).toBeInTheDocument();
        expect(screen.getByText('Create Character')).toBeInTheDocument();
      });
    });

    test('displays loading state initially', () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      expect(screen.getByText('Loading characters...')).toBeInTheDocument();
    });

    test('displays error state when loading fails', async () => {
      const errorWorldBuilder = {
        ...mockWorldBuilder,
        getAllCharacters: jest.fn(() => {
          throw new Error('Failed to load');
        })
      };

      useSimulationContext.mockReturnValue({
        ...defaultMockContext,
        worldBuilder: errorWorldBuilder
      });

      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error Loading Characters')).toBeInTheDocument();
        expect(screen.getByText('Failed to load characters. Please try again.')).toBeInTheDocument();
      });
    });

    test('displays empty state when no characters exist', async () => {
      const emptyWorldBuilder = {
        ...mockWorldBuilder,
        getAllCharacters: jest.fn(() => [])
      };

      useSimulationContext.mockReturnValue({
        ...defaultMockContext,
        worldBuilder: emptyWorldBuilder
      });

      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No Characters Created')).toBeInTheDocument();
        expect(screen.getByText('Create your first character to get started with world building.')).toBeInTheDocument();
      });
    });
  });

  describe('Character Display', () => {
    test('displays all characters in cards', async () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Merchant Bob')).toBeInTheDocument();
      });
    });

    test('displays character information correctly', async () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        // Check Aragorn's info
        const aragornCard = screen.getByText('Aragorn').closest('div');
        expect(within(aragornCard).getByText('Warrior • Level 10')).toBeInTheDocument();
        expect(within(aragornCard).getByText('A skilled ranger and future king')).toBeInTheDocument();
        expect(within(aragornCard).getByText('Assigned')).toBeInTheDocument();
      });
    });

    test('displays assignment status correctly', async () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        // Aragorn should be assigned (has node and interactions)
        const aragornCard = screen.getByText('Aragorn').closest('div');
        expect(within(aragornCard).getByText('Assigned')).toBeInTheDocument();

        // Merchant Bob should be unassigned (no assignments)
        const bobCard = screen.getByText('Merchant Bob').closest('div');
        expect(within(bobCard).getByText('Unassigned')).toBeInTheDocument();
      });
    });

    test('displays character tags', async () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('hero')).toBeInTheDocument();
        expect(screen.getByText('ranger')).toBeInTheDocument();
        expect(screen.getByText('king')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('filters characters by name search', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search characters/);
      await user.type(searchInput, 'Aragorn');

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.queryByText('Gandalf')).not.toBeInTheDocument();
        expect(screen.queryByText('Merchant Bob')).not.toBeInTheDocument();
        expect(screen.getByText('1 of 3')).toBeInTheDocument();
      });
    });

    test('filters characters by description search', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search characters/);
      await user.type(searchInput, 'wizard');

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.queryByText('Aragorn')).not.toBeInTheDocument();
        expect(screen.queryByText('Merchant Bob')).not.toBeInTheDocument();
      });
    });

    test('filters characters by race search', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search characters/);
      await user.type(searchInput, 'Maiar');

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.queryByText('Aragorn')).not.toBeInTheDocument();
        expect(screen.queryByText('Merchant Bob')).not.toBeInTheDocument();
      });
    });

    test('filters characters by tags search', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Merchant Bob')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search characters/);
      await user.type(searchInput, 'trader');

      await waitFor(() => {
        expect(screen.getByText('Merchant Bob')).toBeInTheDocument();
        expect(screen.queryByText('Aragorn')).not.toBeInTheDocument();
        expect(screen.queryByText('Gandalf')).not.toBeInTheDocument();
      });
    });

    test('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search characters/);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No Characters Match Filters')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search query or filters to find characters.')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    test('shows and hides filter panel', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });

      // Filters should not be visible initially
      expect(screen.queryByText('Character Type')).not.toBeInTheDocument();

      // Click to show filters
      await user.click(screen.getByText('Filters'));

      await waitFor(() => {
        expect(screen.getByText('Character Type')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Assignment Status')).toBeInTheDocument();
      });
    });

    test('filters by character type', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Show filters
      await user.click(screen.getByText('Filters'));

      await waitFor(() => {
        expect(screen.getByText('Character Type')).toBeInTheDocument();
      });

      // Filter by warrior type
      const typeSelect = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeSelect, 'warrior');

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.queryByText('Gandalf')).not.toBeInTheDocument();
        expect(screen.queryByText('Merchant Bob')).not.toBeInTheDocument();
        expect(screen.getByText('1 of 3')).toBeInTheDocument();
      });
    });

    test('filters by assignment status', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Merchant Bob')).toBeInTheDocument();
      });

      // Show filters
      await user.click(screen.getByText('Filters'));

      await waitFor(() => {
        expect(screen.getByText('Assignment Status')).toBeInTheDocument();
      });

      // Filter by unassigned
      const statusSelect = screen.getByDisplayValue('All Characters');
      await user.selectOptions(statusSelect, 'unassigned');

      await waitFor(() => {
        expect(screen.getByText('Merchant Bob')).toBeInTheDocument();
        expect(screen.queryByText('Aragorn')).not.toBeInTheDocument();
        expect(screen.queryByText('Gandalf')).not.toBeInTheDocument();
      });
    });

    test('filters by level range', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
      });

      // Show filters
      await user.click(screen.getByText('Filters'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
      });

      // Filter by min level 15
      const minLevelInput = screen.getByPlaceholderText('1');
      await user.type(minLevelInput, '15');

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.queryByText('Aragorn')).not.toBeInTheDocument();
        expect(screen.queryByText('Merchant Bob')).not.toBeInTheDocument();
      });
    });

    test('clears all filters', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Show filters and apply a filter
      await user.click(screen.getByText('Filters'));
      
      await waitFor(() => {
        expect(screen.getByText('Character Type')).toBeInTheDocument();
      });

      const typeSelect = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeSelect, 'warrior');

      await waitFor(() => {
        expect(screen.getByText('1 of 3')).toBeInTheDocument();
      });

      // Clear filters
      await user.click(screen.getByText('Clear All Filters'));

      await waitFor(() => {
        expect(screen.getByText('3 of 3')).toBeInTheDocument();
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Merchant Bob')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    test('sorts characters by name', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Default sort should be by name ascending
      const characterCards = screen.getAllByText(/Level \d+/);
      expect(characterCards[0]).toHaveTextContent('Warrior • Level 10'); // Aragorn
      expect(characterCards[1]).toHaveTextContent('Scholar • Level 20'); // Gandalf
      expect(characterCards[2]).toHaveTextContent('Commoner • Level 1'); // Merchant Bob
    });

    test('sorts characters by level', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Change sort to level
      const sortSelect = screen.getByDisplayValue('Name');
      await user.selectOptions(sortSelect, 'level');

      await waitFor(() => {
        const characterCards = screen.getAllByText(/Level \d+/);
        expect(characterCards[0]).toHaveTextContent('Commoner • Level 1'); // Merchant Bob
        expect(characterCards[1]).toHaveTextContent('Warrior • Level 10'); // Aragorn
        expect(characterCards[2]).toHaveTextContent('Scholar • Level 20'); // Gandalf
      });
    });

    test('toggles sort order', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Toggle sort order to descending
      const sortOrderButton = screen.getByRole('button', { name: '' }); // Sort button
      await user.click(sortOrderButton);

      await waitFor(() => {
        const characterCards = screen.getAllByText(/Level \d+/);
        expect(characterCards[0]).toHaveTextContent('Commoner • Level 1'); // Merchant Bob (reverse alphabetical)
        expect(characterCards[1]).toHaveTextContent('Scholar • Level 20'); // Gandalf
        expect(characterCards[2]).toHaveTextContent('Warrior • Level 10'); // Aragorn
      });
    });
  });

  describe('Character Actions', () => {
    test('calls onEditCharacter when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Find Aragorn's card and click the actions menu
      const aragornCard = screen.getByText('Aragorn').closest('div');
      const actionsButton = within(aragornCard).getByRole('button', { name: '' });
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));

      expect(mockOnEditCharacter).toHaveBeenCalledWith(mockCharacters[0]);
    });

    test('calls onViewCharacter when view button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
          onViewCharacter={mockOnViewCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Find Aragorn's card and click the actions menu
      const aragornCard = screen.getByText('Aragorn').closest('div');
      const actionsButton = within(aragornCard).getByRole('button', { name: '' });
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText('View')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View'));

      expect(mockOnViewCharacter).toHaveBeenCalledWith(mockCharacters[0]);
    });

    test('shows delete confirmation modal', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Find Aragorn's card and click the actions menu
      const aragornCard = screen.getByText('Aragorn').closest('div');
      const actionsButton = within(aragornCard).getByRole('button', { name: '' });
      await user.click(actionsButton);

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Delete Character');
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });
    });

    test('deletes character when confirmed', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Open delete modal
      const aragornCard = screen.getByText('Aragorn').closest('div');
      const actionsButton = within(aragornCard).getByRole('button', { name: '' });
      await user.click(actionsButton);
      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // Confirm deletion
      await user.click(screen.getByText('Delete Character'));

      expect(mockWorldBuilder.deleteCharacter).toHaveBeenCalledWith('char1');
    });

    test('calls onCreateCharacter when create button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Create Character')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create Character'));

      expect(mockOnCreateCharacter).toHaveBeenCalled();
    });
  });

  describe('Character Selection', () => {
    test('selects and deselects characters', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Find checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);

      // Select first character
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('Actions (1)')).toBeInTheDocument();
      });

      // Select second character
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText('Actions (2)')).toBeInTheDocument();
      });

      // Deselect first character
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('Actions (1)')).toBeInTheDocument();
      });
    });

    test('shows bulk actions when characters are selected', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Select a character
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      await waitFor(() => {
        expect(screen.getByText('Actions (1)')).toBeInTheDocument();
      });

      // Click to show bulk actions
      await user.click(screen.getByText('Actions (1)'));

      await waitFor(() => {
        expect(screen.getByText('1 character(s) selected')).toBeInTheDocument();
        expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      });
    });

    test('performs bulk delete', async () => {
      const user = userEvent.setup();
      
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Select characters
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText('Actions (2)')).toBeInTheDocument();
      });

      // Show bulk actions and delete
      await user.click(screen.getByText('Actions (2)'));
      await user.click(screen.getByText('Delete Selected'));

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete 2 character(s)? This action cannot be undone.'
      );
      expect(mockWorldBuilder.deleteCharacter).toHaveBeenCalledTimes(2);

      // Restore window.confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Error Handling', () => {
    test('handles delete error gracefully', async () => {
      const user = userEvent.setup();
      
      const errorWorldBuilder = {
        ...mockWorldBuilder,
        deleteCharacter: jest.fn(() => {
          throw new Error('Delete failed');
        })
      };

      useSimulationContext.mockReturnValue({
        ...defaultMockContext,
        worldBuilder: errorWorldBuilder
      });

      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Try to delete character
      const aragornCard = screen.getByText('Aragorn').closest('div');
      const actionsButton = within(aragornCard).getByRole('button', { name: '' });
      await user.click(actionsButton);
      await user.click(screen.getByText('Delete'));
      await user.click(screen.getByText('Delete Character'));

      // Should handle error gracefully (no crash)
      expect(errorWorldBuilder.deleteCharacter).toHaveBeenCalled();
    });

    test('handles missing worldBuilder gracefully', () => {
      useSimulationContext.mockReturnValue({
        worldBuilder: null,
        templateManager: mockTemplateManager
      });

      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      // Should not crash and show loading state
      expect(screen.getByText('Loading characters...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Check for proper roles
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
      expect(screen.getAllByRole('button')).toHaveLength(8); // Various buttons
      expect(screen.getByRole('textbox')).toBeInTheDocument(); // Search input
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <CharacterManager
          onEditCharacter={mockOnEditCharacter}
          onCreateCharacter={mockOnCreateCharacter}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Tab through elements
      await user.tab();
      expect(screen.getByPlaceholderText(/Search characters/)).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Filters')).toHaveFocus();
    });
  });
});