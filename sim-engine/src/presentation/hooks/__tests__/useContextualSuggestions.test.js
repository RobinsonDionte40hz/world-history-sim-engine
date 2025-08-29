import { renderHook } from '@testing-library/react';
import useContextualSuggestions from '../useContextualSuggestions';

describe('useContextualSuggestions', () => {
  const mockContext = {
    character: {
      id: 'char1',
      name: 'Aria Blackwood',
      attributes: {
        strength: 16,
        dexterity: 14,
        charisma: 18
      },
      personality: {
        aggression: 0.3,
        curiosity: 0.8
      },
      consciousness: {
        frequency: 45,
        coherence: 0.8
      },
      reputation: 15
    },
    node: {
      id: 'node1',
      name: 'Royal Court',
      type: 'palace',
      environmentalProperties: {
        formal: true,
        crowded: true
      }
    },
    world: {
      id: 'world1',
      name: 'Eldoria',
      theme: 'medieval fantasy'
    }
  };

  test('generates suggestions from context', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    expect(result.current.suggestions).toBeDefined();
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    
    // Check for character suggestions
    const characterNameSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'character.name'
    );
    expect(characterNameSuggestion).toBeDefined();
    expect(characterNameSuggestion.available).toBe(true);
    expect(characterNameSuggestion.example).toBe('Aria Blackwood');
  });

  test('includes D&D attribute suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const strengthSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'character.attributes.strength'
    );
    expect(strengthSuggestion).toBeDefined();
    expect(strengthSuggestion.available).toBe(true);
    expect(strengthSuggestion.example).toBe('16');

    const strengthModifierSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'character.attributes.strengthModifier'
    );
    expect(strengthModifierSuggestion).toBeDefined();
    expect(strengthModifierSuggestion.example).toBe('+3');
  });

  test('includes personality and consciousness suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const aggressionSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'character.personality.aggression'
    );
    expect(aggressionSuggestion).toBeDefined();
    expect(aggressionSuggestion.available).toBe(true);

    const frequencySuggestion = result.current.suggestions.find(
      s => s.placeholder === 'character.consciousness.frequency'
    );
    expect(frequencySuggestion).toBeDefined();
    expect(frequencySuggestion.available).toBe(true);
  });

  test('includes node suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const nodeNameSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'node.name'
    );
    expect(nodeNameSuggestion).toBeDefined();
    expect(nodeNameSuggestion.available).toBe(true);
    expect(nodeNameSuggestion.example).toBe('Royal Court');

    const environmentalSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'node.environmentalProperties.formal'
    );
    expect(environmentalSuggestion).toBeDefined();
    expect(environmentalSuggestion.available).toBe(true);
  });

  test('includes world suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const worldNameSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'world.name'
    );
    expect(worldNameSuggestion).toBeDefined();
    expect(worldNameSuggestion.available).toBe(true);
    expect(worldNameSuggestion.example).toBe('Eldoria');
  });

  test('includes system suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const randomSuggestion = result.current.suggestions.find(
      s => s.placeholder === 'random:option1,option2,option3'
    );
    expect(randomSuggestion).toBeDefined();
    expect(randomSuggestion.available).toBe(true);

    const ifSuggestion = result.current.suggestions.find(
      s => s.placeholder === '#if condition'
    );
    expect(ifSuggestion).toBeDefined();
    expect(ifSuggestion.available).toBe(true);
  });

  test('filters suggestions by category', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const characterSuggestions = result.current.getSuggestionsByCategory('character');
    expect(characterSuggestions.length).toBeGreaterThan(0);
    expect(characterSuggestions.every(s => s.category === 'character')).toBe(true);

    const nodeSuggestions = result.current.getSuggestionsByCategory('node');
    expect(nodeSuggestions.length).toBeGreaterThan(0);
    expect(nodeSuggestions.every(s => s.category === 'node')).toBe(true);
  });

  test('filters available suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const availableSuggestions = result.current.getAvailableSuggestions();
    expect(availableSuggestions.every(s => s.available === true)).toBe(true);
  });

  test('searches suggestions', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    const searchResults = result.current.searchSuggestions('strength');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.some(s => s.placeholder.includes('strength'))).toBe(true);
  });

  test('provides context summary', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    expect(result.current.contextSummary).toBeDefined();
    expect(result.current.contextSummary.hasCharacter).toBe(true);
    expect(result.current.contextSummary.hasNode).toBe(true);
    expect(result.current.contextSummary.hasWorld).toBe(true);
    expect(result.current.contextSummary.characterName).toBe('Aria Blackwood');
  });

  test('validates placeholders', () => {
    const { result } = renderHook(() => useContextualSuggestions(mockContext));

    expect(result.current.validatePlaceholder('character.name')).toBe(true);
    expect(result.current.validatePlaceholder('character.nonexistent')).toBe(false);
  });

  test('handles empty context', () => {
    const { result } = renderHook(() => useContextualSuggestions({}));

    expect(result.current.suggestions).toBeDefined();
    expect(result.current.hasContext).toBe(false);
    expect(result.current.hasCharacterContext).toBe(false);
    
    // Should still have system suggestions
    const systemSuggestions = result.current.getSuggestionsByCategory('system');
    expect(systemSuggestions.length).toBeGreaterThan(0);
  });

  test('caches suggestions for performance', () => {
    const { result, rerender } = renderHook(
      ({ context }) => useContextualSuggestions(context),
      { initialProps: { context: mockContext } }
    );

    const firstSuggestions = result.current.suggestions;
    
    // Re-render with same context
    rerender({ context: mockContext });
    
    const secondSuggestions = result.current.suggestions;
    
    // Should be the same reference due to caching
    expect(firstSuggestions).toBe(secondSuggestions);
  });
});