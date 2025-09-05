import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractionAssignmentPanel from '../../presentation/components/InteractionAssignmentPanel';
import InteractionEditor from '../../presentation/components/InteractionEditor';

// Mock dependencies
jest.mock('../../presentation/hooks/useTemplates', () => ({
  __esModule: true,
  default: () => ({
    saveTemplate: jest.fn(),
    loadTemplate: jest.fn()
  })
}));

jest.mock('../../presentation/components/TemplateLibraryPanel', () => {
  return function MockTemplateLibraryPanel() {
    return <div data-testid="template-library">Template Library</div>;
  };
});

jest.mock('../../presentation/components/text-templating/PlaceholderEditor', () => {
  return function MockPlaceholderEditor({ value, onChange }) {
    return (
      <textarea
        data-testid="placeholder-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

jest.mock('../../presentation/components/text-templating/DialoguePatterns', () => {
  return function MockDialoguePatterns({ onInsert }) {
    return (
      <button
        data-testid="dialogue-patterns"
        onClick={() => onInsert('Hello there!')}
      >
        Insert Pattern
      </button>
    );
  };
});

jest.mock('../../application/services/EditorContextService', () => ({
  detectContext: jest.fn(() => ({}))
}));

const mockInteractionManager = {
  getAvailableInteractions: jest.fn(() => ({
    systemInteractions: [
      {
        id: 'system_1',
        name: 'System Interaction 1',
        description: 'A system interaction',
        category: 'system',
        type: 'system',
        priority: 'high'
      }
    ],
    contentInteractions: [
      {
        id: 'content_1',
        name: 'Content Interaction 1',
        description: 'A content interaction',
        category: 'dialogue',
        type: 'content',
        author: 'Test User'
      }
    ],
    allInteractions: []
  }))
};

const mockCharacter = {
  id: 'char_1',
  name: 'Test Character'
};

const mockWorldState = {
  id: 'world_1',
  name: 'Test World'
};

const mockCurrentNode = {
  id: 'node_1',
  name: 'Test Node'
};

describe('InteractionAssignmentPanel - Hierarchical System', () => {
  const defaultProps = {
    character: mockCharacter,
    worldState: mockWorldState,
    currentNode: mockCurrentNode,
    assignedInteractions: [],
    availableInteractions: [],
    systemInteractions: [],
    contentInteractions: [],
    interactionManager: mockInteractionManager,
    onAssignInteraction: jest.fn(),
    onUnassignInteraction: jest.fn(),
    onEditInteraction: jest.fn(),
    onCreateInteraction: jest.fn(),
    onExecuteInteraction: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays hierarchical tabs correctly', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);

    expect(screen.getByText('Assigned (0)')).toBeInTheDocument();
    expect(screen.getByText('System (1)')).toBeInTheDocument();
    expect(screen.getByText('Content (1)')).toBeInTheDocument();
    expect(screen.getByText('Quick Create')).toBeInTheDocument();
  });

  test('shows system interactions with correct styling', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);

    const systemTab = screen.getByText('System (1)');
    fireEvent.click(systemTab);

    expect(screen.getByText('System Interactions')).toBeInTheDocument();
    expect(screen.getByText('Core engine behaviors available to all characters')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
    expect(screen.getByText('System Interaction 1')).toBeInTheDocument();
  });

  test('shows content interactions with correct styling', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);

    const contentTab = screen.getByText('Content (1)');
    fireEvent.click(contentTab);

    expect(screen.getByText('Content Interactions')).toBeInTheDocument();
    expect(screen.getByText('Custom interactions created by users')).toBeInTheDocument();
    expect(screen.getByText('Content Interaction 1')).toBeInTheDocument();
    expect(screen.getByText('By: Test User')).toBeInTheDocument();
  });

  test('displays system interaction with priority indicator', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);

    const systemTab = screen.getByText('System (1)');
    fireEvent.click(systemTab);

    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('executes system interaction when execute button is clicked', () => {
    render(<InteractionAssignmentPanel {...defaultProps} />);

    const systemTab = screen.getByText('System (1)');
    fireEvent.click(systemTab);

    const executeButton = screen.getByText('Execute');
    fireEvent.click(executeButton);

    expect(defaultProps.onExecuteInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'system_1',
        type: 'system'
      })
    );
  });
});

describe('InteractionEditor - Hierarchical System', () => {
  const defaultProps = {
    initialInteraction: null,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onChange: jest.fn(),
    mode: 'create'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays interaction type selector', () => {
    render(<InteractionEditor {...defaultProps} />);

    expect(screen.getByText('Interaction Type')).toBeInTheDocument();
    expect(screen.getByText('⚙️ System')).toBeInTheDocument();
    expect(screen.getByText('📝 Content')).toBeInTheDocument();
  });

  test('defaults to content type for new interactions', () => {
    render(<InteractionEditor {...defaultProps} />);

    const contentButton = screen.getByText('📝 Content');
    expect(contentButton).toHaveClass('bg-purple-600');
  });

  test('allows switching between system and content types', () => {
    render(<InteractionEditor {...defaultProps} />);

    const systemButton = screen.getByText('⚙️ System');
    const contentButton = screen.getByText('📝 Content');

    fireEvent.click(systemButton);
    expect(systemButton).toHaveClass('bg-red-600');

    fireEvent.click(contentButton);
    expect(contentButton).toHaveClass('bg-purple-600');
  });

  test('shows type in preview panel', () => {
    render(<InteractionEditor {...defaultProps} />);

    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('updates preview when type changes', () => {
    render(<InteractionEditor {...defaultProps} />);

    const systemButton = screen.getByText('⚙️ System');
    fireEvent.click(systemButton);

    expect(screen.getByText('system')).toBeInTheDocument();
  });

  test('includes type in saved interaction data', () => {
    const mockOnSave = jest.fn();
    render(<InteractionEditor {...defaultProps} onSave={mockOnSave} />);

    const systemButton = screen.getByText('⚙️ System');
    fireEvent.click(systemButton);

    const saveButton = screen.getByText('Create Interaction');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'system'
      })
    );
  });
});

describe('Interaction Display Integration', () => {
  test('maintains backward compatibility with existing interactions', () => {
    const legacyInteraction = {
      id: 'legacy_1',
      name: 'Legacy Interaction',
      description: 'An old interaction without type',
      category: 'dialogue'
      // No type field - should default to content
    };

    render(
      <InteractionEditor
        initialInteraction={legacyInteraction}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        mode="edit"
      />
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('handles system interactions in assignment panel', () => {
    const systemInteraction = {
      id: 'sys_1',
      name: 'System Test',
      type: 'system',
      category: 'system',
      priority: 'critical'
    };

    const props = {
      character: mockCharacter,
      worldState: mockWorldState,
      currentNode: mockCurrentNode,
      assignedInteractions: [],
      availableInteractions: [],
      systemInteractions: [systemInteraction],
      contentInteractions: [],
      interactionManager: {
        getAvailableInteractions: jest.fn(() => ({
          systemInteractions: [systemInteraction],
          contentInteractions: [],
          allInteractions: []
        }))
      },
      onAssignInteraction: jest.fn(),
      onUnassignInteraction: jest.fn(),
      onEditInteraction: jest.fn(),
      onCreateInteraction: jest.fn()
    };

    render(<InteractionAssignmentPanel {...props} />);

    const systemTab = screen.getByText('System (1)');
    fireEvent.click(systemTab);

    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });
});
