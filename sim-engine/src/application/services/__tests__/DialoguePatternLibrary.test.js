import dialoguePatternLibrary, { DialoguePatternLibrary } from '../DialoguePatternLibrary';

describe('DialoguePatternLibrary', () => {
  let library;

  beforeEach(() => {
    library = new DialoguePatternLibrary();
  });

  test('initializes with default patterns', () => {
    const patterns = library.getAllPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    
    // Check that we have patterns in different categories
    const categories = library.getCategories();
    expect(categories).toContain('greetings');
    expect(categories).toContain('farewells');
    expect(categories).toContain('questions');
    expect(categories).toContain('reactions');
  });

  test('validates patterns correctly', () => {
    const validPattern = {
      name: 'Test Pattern',
      template: 'Hello {{character.name}}!',
      category: 'greetings',
      description: 'Test pattern'
    };

    const invalidPattern = {
      name: '', // Invalid: empty name
      template: 'Hello {{character.name}}!',
      category: 'greetings'
    };

    expect(library.validatePattern(validPattern)).toBe(true);
    expect(library.validatePattern(invalidPattern)).toBe(false);
  });

  test('adds custom patterns', () => {
    const customPattern = {
      name: 'Custom Greeting',
      template: 'Greetings, {{character.name}}! Welcome to {{node.name}}.',
      category: 'greetings',
      description: 'Custom greeting pattern',
      tags: ['custom']
    };

    const patternId = library.createCustomPattern(customPattern);
    expect(patternId).toBeDefined();

    const retrievedPattern = library.getPattern(patternId);
    expect(retrievedPattern).toBeDefined();
    expect(retrievedPattern.name).toBe('Custom Greeting');
    expect(retrievedPattern.isCustom).toBe(true);
  });

  test('filters patterns by context', () => {
    const context = {
      character: {
        id: 'test-char',
        name: 'Test Character',
        attributes: { charisma: 16 },
        reputation: 12
      }
    };

    const contextualPatterns = library.getAllPatterns({ contextFilter: context });
    const allPatterns = library.getAllPatterns();

    // Contextual patterns should be a subset of all patterns
    expect(contextualPatterns.length).toBeLessThanOrEqual(allPatterns.length);

    // All contextual patterns should be available in the given context
    contextualPatterns.forEach(pattern => {
      expect(library.isPatternAvailableInContext(pattern, context)).toBe(true);
    });
  });

  test('calculates relevance scores', () => {
    const context = {
      character: {
        name: 'Test Character',
        attributes: { charisma: 18 },
        reputation: 15
      },
      node: {
        name: 'Test Location'
      }
    };

    const patterns = library.getAllPatterns();
    const pattern = patterns.find(p => p.category === 'greetings');

    if (pattern) {
      const score = library.calculateRelevanceScore(pattern, context);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  test('gets contextual suggestions', () => {
    const context = {
      character: {
        name: 'Test Character',
        attributes: { charisma: 16 }
      }
    };

    const suggestions = library.getContextualSuggestions(context, { maxSuggestions: 5 });
    expect(suggestions.length).toBeLessThanOrEqual(5);
    
    // Suggestions should be sorted by relevance
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i].relevanceScore).toBeLessThanOrEqual(suggestions[i - 1].relevanceScore);
    }
  });

  test('validates template syntax', () => {
    expect(library.validateTemplateSyntax('Hello {{character.name}}!')).toBe(true);
    expect(library.validateTemplateSyntax('{{#if character.reputation > 10}}Hello{{/if}}')).toBe(true);
    expect(library.validateTemplateSyntax('{{random:hello,hi,greetings}}')).toBe(true);
    
    // Invalid syntax
    expect(library.validateTemplateSyntax('Hello {{character.name')).toBe(false); // Missing closing brace
    expect(library.validateTemplateSyntax('{{#if condition}}text')).toBe(false); // Missing /if
  });

  test('exports and imports patterns', () => {
    // Add a custom pattern
    const customPattern = {
      name: 'Export Test',
      template: 'Test {{character.name}}',
      category: 'greetings',
      description: 'Test pattern for export'
    };
    library.createCustomPattern(customPattern);

    // Export patterns
    const exportData = library.exportPatterns({ includeCustom: true });
    expect(exportData).toBeDefined();
    
    const parsedData = JSON.parse(exportData);
    expect(parsedData.patterns).toBeDefined();
    expect(parsedData.patterns.length).toBeGreaterThan(0);

    // Create new library and import
    const newLibrary = new DialoguePatternLibrary();
    newLibrary.resetToDefaults(); // Clear to defaults only
    
    const importResult = newLibrary.importPatterns(exportData, { markAsCustom: true });
    expect(importResult.imported).toBeGreaterThan(0);
    expect(importResult.errors.length).toBe(0);
  });

  test('gets library statistics', () => {
    const stats = library.getLibraryStats();
    expect(stats.totalPatterns).toBeGreaterThan(0);
    expect(stats.defaultPatterns).toBeGreaterThan(0);
    expect(stats.categories).toBeGreaterThan(0);
    expect(stats.categoryStats).toBeDefined();
  });

  test('singleton instance works correctly', () => {
    const patterns1 = dialoguePatternLibrary.getAllPatterns();
    const patterns2 = dialoguePatternLibrary.getAllPatterns();
    
    expect(patterns1.length).toBe(patterns2.length);
    expect(dialoguePatternLibrary).toBeDefined();
  });
});