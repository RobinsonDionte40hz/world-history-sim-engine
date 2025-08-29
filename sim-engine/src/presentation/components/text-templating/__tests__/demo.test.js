import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContextualSuggestions from '../ContextualSuggestions';
import useContextualSuggestions from '../../../hooks/useContextualSuggestions';
import EditorContextService from '../../../../application/services/EditorContextService';

describe('Contextual Suggestion System Demo', () => {
    test('demonstrates the complete contextual suggestion system', () => {
        // Create sample context
        const context = EditorContextService.createSampleContext('full');

        // Test the hook
        const TestHookComponent = () => {
            const { suggestions, contextSummary } = useContextualSuggestions(context);

            return (
                <div>
                    <div data-testid="context-summary">
                        Character: {contextSummary.characterName},
                        Node: {contextSummary.nodeName},
                        World: {contextSummary.worldName}
                    </div>
                    <div data-testid="suggestion-count">
                        Suggestions: {suggestions.length}
                    </div>
                </div>
            );
        };

        render(<TestHookComponent />);

        // Verify context is properly detected
        expect(screen.getByTestId('context-summary')).toHaveTextContent('Character: Aria Blackwood');
        expect(screen.getByTestId('context-summary')).toHaveTextContent('Node: Royal Court');
        expect(screen.getByTestId('context-summary')).toHaveTextContent('World: Eldoria');

        // Verify suggestions are generated
        const suggestionCount = screen.getByTestId('suggestion-count');
        expect(suggestionCount).toHaveTextContent(/Suggestions: \d+/);
    });

    test('demonstrates ContextualSuggestions component with full context', () => {
        const context = EditorContextService.createSampleContext('full');
        const mockOnInsert = jest.fn();

        render(
            <ContextualSuggestions
                suggestions={EditorContextService.generateContextualSuggestions(context)}
                onInsert={mockOnInsert}
                searchable={true}
                categorized={true}
                showCategories={true}
            />
        );

        // Should show the component with suggestions
        expect(screen.getByText('Placeholder Suggestions')).toBeInTheDocument();

        // Should show category headers (categories are expanded by default for character and node)
        expect(screen.getByText('Character')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();

        // Should show character suggestions (character category is expanded by default)
        expect(screen.getByText('character.name')).toBeInTheDocument();

        // Should show node suggestions (node category is expanded by default)
        expect(screen.getByText('node.name')).toBeInTheDocument();
    });

    test('demonstrates EditorContextService functionality', () => {
        // Test context detection
        const mockEditorProps = {
            character: { id: 'char1', name: 'Test Character' },
            node: { id: 'node1', name: 'Test Location' },
            world: { id: 'world1', name: 'Test World' }
        };

        const detectedContext = EditorContextService.detectContext('interaction', mockEditorProps);

        expect(detectedContext.character.name).toBe('Test Character');
        expect(detectedContext.node.name).toBe('Test Location');
        expect(detectedContext.world.name).toBe('Test World');

        // Test suggestion generation
        const suggestions = EditorContextService.generateContextualSuggestions(detectedContext);
        expect(suggestions.length).toBeGreaterThan(0);

        // Should have character suggestions
        const characterSuggestions = suggestions.filter(s => s.category === 'character');
        expect(characterSuggestions.length).toBeGreaterThan(0);

        // Should have system suggestions
        const systemSuggestions = suggestions.filter(s => s.category === 'system');
        expect(systemSuggestions.length).toBeGreaterThan(0);
    });

    test('demonstrates placeholder validation', () => {
        const context = {
            character: {
                name: 'Test Character',
                attributes: { strength: 16, charisma: 14 }
            }
        };

        // Valid placeholders should return true
        expect(EditorContextService.validatePlaceholder('character.name', context)).toBe(true);
        expect(EditorContextService.validatePlaceholder('character.attributes.strength', context)).toBe(true);

        // Invalid placeholders should return false
        expect(EditorContextService.validatePlaceholder('character.nonexistent', context)).toBe(false);
        expect(EditorContextService.validatePlaceholder('node.name', context)).toBe(false);
    });

    test('demonstrates context change detection', () => {
        const oldContext = {
            character: { name: 'Old Character' }
        };

        const newContext = {
            character: { name: 'New Character' },
            node: { name: 'New Location' }
        };

        const changes = EditorContextService.detectContextChanges(oldContext, newContext);

        expect(changes.hasChanges).toBe(true);
        expect(changes.addedContexts).toContain('node');
        expect(changes.modifiedContexts).toContain('character');
    });
});