import TextTemplateEngine from '../../domain/services/TextTemplateEngine';

describe('TextTemplateEngine', () => {
  let engine;
  let sampleContext;

  beforeEach(() => {
    engine = new TextTemplateEngine();
    sampleContext = {
      character: {
        name: 'Aria Blackwood',
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 15,
          charisma: 18
        },
        personality: {
          aggression: 0.3,
          curiosity: 0.8,
          empathy: 0.7
        }
      },
      node: {
        name: 'Royal Court',
        type: 'palace',
        environmentalProperties: {
          formal: true,
          crowded: true
        }
      },
      world: {
        name: 'Eldoria',
        theme: 'medieval fantasy'
      }
    };
  });

  describe('Basic Placeholder Resolution', () => {
    test('should resolve simple placeholders', () => {
      const template = 'Hello {{character.name}}!';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('Hello Aria Blackwood!');
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should resolve nested placeholders', () => {
      const template = '{{character.name}} has {{character.attributes.strength}} strength.';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('Aria Blackwood has 16 strength.');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle missing placeholders gracefully', () => {
      const template = 'Hello {{character.nonexistent}}!';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('Hello {{character.nonexistent}}!');
      expect(result.errors).toContain('Placeholder not found: character.nonexistent');
    });

    test('should handle empty context', () => {
      const template = 'Hello {{character.name}}!';
      const result = engine.resolve(template, {});
      
      expect(result.resolved).toBe('Hello {{character.name}}!');
      expect(result.errors).toContain('Placeholder not found: character.name');
    });

    test('should handle null and undefined values', () => {
      const context = { value: null, other: undefined };
      const template = 'Value: {{value}}, Other: {{other}}';
      const result = engine.resolve(template, context);
      
      expect(result.resolved).toBe('Value: {{value}}, Other: {{other}}');
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('Conditional Blocks', () => {
    test('should process simple conditionals', () => {
      const template = '{{#if character.attributes.strength > 15}}You are strong!{{/if}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('You are strong!');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle false conditionals', () => {
      const template = '{{#if character.attributes.strength > 20}}You are very strong!{{/if}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle different comparison operators', () => {
      const templates = [
        '{{#if character.attributes.strength >= 16}}Strong{{/if}}',
        '{{#if character.attributes.strength <= 16}}Not too strong{{/if}}',
        '{{#if character.attributes.strength == 16}}Exactly 16{{/if}}',
        '{{#if character.attributes.strength != 15}}Not 15{{/if}}'
      ];
      
      templates.forEach(template => {
        const result = engine.resolve(template, sampleContext);
        expect(result.errors).toHaveLength(0);
        expect(result.resolved).toBeTruthy();
      });
    });

    test('should handle boolean conditionals', () => {
      const template = '{{#if node.environmentalProperties.formal}}This is a formal place{{/if}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('This is a formal place');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle nested conditionals', () => {
      const template = '{{#if character.attributes.strength > 15}}{{#if character.attributes.charisma > 15}}Strong and charismatic!{{/if}}{{/if}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('Strong and charismatic!');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle invalid conditionals gracefully', () => {
      const template = '{{#if invalid.condition}}Text{{/if}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Random Text Selection', () => {
    test('should select from random options', () => {
      const template = '{{random:hello,hi,greetings}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(['hello', 'hi', 'greetings']).toContain(result.resolved);
      expect(result.errors).toHaveLength(0);
    });

    test('should handle single option', () => {
      const template = '{{random:only}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toBe('only');
      expect(result.errors).toHaveLength(0);
    });

    test('should handle empty random selection', () => {
      const template = '{{random:}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.errors).toContain('Empty random selection: {{random:}}');
    });

    test('should trim whitespace in options', () => {
      const template = '{{random: hello , hi , greetings }}';
      const result = engine.resolve(template, sampleContext);
      
      expect(['hello', 'hi', 'greetings']).toContain(result.resolved);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Complex Templates', () => {
    test('should handle mixed template features', () => {
      const template = `{{character.name}} {{random:walks,strides,moves}} into {{node.name}}. {{#if character.attributes.charisma > 15}}Everyone notices their presence.{{/if}}`;
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toContain('Aria Blackwood');
      expect(result.resolved).toContain('Royal Court');
      expect(result.resolved).toContain('Everyone notices their presence.');
      expect(result.errors).toHaveLength(0);
    });

    test('should process features in correct order', () => {
      const template = '{{#if character.attributes.strength > 15}}{{random:Strong,Powerful}} {{character.name}}{{/if}}';
      const result = engine.resolve(template, sampleContext);
      
      expect(result.resolved).toMatch(/(Strong|Powerful) Aria Blackwood/);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Placeholder Extraction', () => {
    test('should extract simple placeholders', () => {
      const template = 'Hello {{character.name}} from {{world.name}}!';
      const placeholders = engine.extractPlaceholders(template);
      
      expect(placeholders).toContain('character.name');
      expect(placeholders).toContain('world.name');
      expect(placeholders).toHaveLength(2);
    });

    test('should extract placeholders from conditionals', () => {
      const template = '{{#if character.attributes.strength > 15}}Strong {{character.name}}{{/if}}';
      const placeholders = engine.extractPlaceholders(template);
      
      expect(placeholders).toContain('character.attributes.strength');
      expect(placeholders).toContain('character.name');
    });

    test('should handle duplicate placeholders', () => {
      const template = '{{character.name}} and {{character.name}} again';
      const placeholders = engine.extractPlaceholders(template);
      
      expect(placeholders).toContain('character.name');
      expect(placeholders).toHaveLength(1);
    });

    test('should handle empty template', () => {
      const placeholders = engine.extractPlaceholders('');
      expect(placeholders).toHaveLength(0);
    });
  });

  describe('Template Validation', () => {
    test('should validate correct templates', () => {
      const template = 'Hello {{character.name}}! {{#if character.attributes.strength > 15}}You are strong!{{/if}}';
      const validation = engine.validateTemplate(template);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect unmatched braces', () => {
      const template = 'Hello {{character.name}!';
      const validation = engine.validateTemplate(template);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unmatched template braces');
    });

    test('should detect unmatched conditionals', () => {
      const template = '{{#if character.attributes.strength > 15}}Strong character';
      const validation = engine.validateTemplate(template);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unmatched conditional blocks');
    });

    test('should detect empty placeholders', () => {
      const template = 'Hello {{}}!';
      const validation = engine.validateTemplate(template);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Empty placeholder found');
    });

    test('should detect nested placeholders', () => {
      const template = 'Hello {{character.{{nested}}}}!';
      const validation = engine.validateTemplate(template);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Nested placeholders are not supported');
    });

    test('should handle null/undefined templates', () => {
      expect(engine.validateTemplate(null).isValid).toBe(true);
      expect(engine.validateTemplate(undefined).isValid).toBe(true);
      expect(engine.validateTemplate('').isValid).toBe(true);
    });
  });

  describe('Placeholder Suggestions', () => {
    test('should generate suggestions from context', () => {
      const suggestions = engine.getPlaceholderSuggestions(sampleContext);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.placeholder === 'character.name')).toBe(true);
      expect(suggestions.some(s => s.placeholder === 'character.attributes.strength')).toBe(true);
      expect(suggestions.some(s => s.placeholder === 'node.name')).toBe(true);
    });

    test('should include type information in suggestions', () => {
      const suggestions = engine.getPlaceholderSuggestions(sampleContext);
      const nameSuggestion = suggestions.find(s => s.placeholder === 'character.name');
      
      expect(nameSuggestion.type).toBe('string');
      expect(nameSuggestion.description).toBeTruthy();
    });

    test('should handle empty context', () => {
      const suggestions = engine.getPlaceholderSuggestions({});
      expect(suggestions).toHaveLength(0);
    });

    test('should limit nesting depth', () => {
      const deepContext = {
        level1: {
          level2: {
            level3: {
              level4: 'deep value'
            }
          }
        }
      };
      
      const suggestions = engine.getPlaceholderSuggestions(deepContext);
      const deepSuggestions = suggestions.filter(s => s.placeholder.split('.').length > 3);
      
      expect(deepSuggestions).toHaveLength(0);
    });
  });

  describe('Condition Evaluation', () => {
    test('should evaluate numeric comparisons', () => {
      expect(engine.evaluateCondition('character.attributes.strength > 15', sampleContext)).toBe(true);
      expect(engine.evaluateCondition('character.attributes.strength < 15', sampleContext)).toBe(false);
      expect(engine.evaluateCondition('character.attributes.strength >= 16', sampleContext)).toBe(true);
      expect(engine.evaluateCondition('character.attributes.strength <= 16', sampleContext)).toBe(true);
      expect(engine.evaluateCondition('character.attributes.strength == 16', sampleContext)).toBe(true);
      expect(engine.evaluateCondition('character.attributes.strength != 15', sampleContext)).toBe(true);
    });

    test('should evaluate boolean conditions', () => {
      expect(engine.evaluateCondition('node.environmentalProperties.formal', sampleContext)).toBe(true);
      expect(engine.evaluateCondition('node.environmentalProperties.quiet', sampleContext)).toBe(false);
    });

    test('should handle string comparisons', () => {
      expect(engine.evaluateCondition('character.name == "Aria Blackwood"', sampleContext)).toBe(true);
      expect(engine.evaluateCondition('character.name != "John Doe"', sampleContext)).toBe(true);
    });

    test('should handle missing values in conditions', () => {
      expect(() => engine.evaluateCondition('character.nonexistent > 10', sampleContext)).not.toThrow();
    });
  });

  describe('Nested Value Access', () => {
    test('should get nested values correctly', () => {
      expect(engine.getNestedValue(sampleContext, 'character.name')).toBe('Aria Blackwood');
      expect(engine.getNestedValue(sampleContext, 'character.attributes.strength')).toBe(16);
      expect(engine.getNestedValue(sampleContext, 'node.environmentalProperties.formal')).toBe(true);
    });

    test('should return undefined for missing paths', () => {
      expect(engine.getNestedValue(sampleContext, 'character.nonexistent')).toBeUndefined();
      expect(engine.getNestedValue(sampleContext, 'nonexistent.path')).toBeUndefined();
    });

    test('should handle null/undefined objects', () => {
      expect(engine.getNestedValue(null, 'any.path')).toBeUndefined();
      expect(engine.getNestedValue(undefined, 'any.path')).toBeUndefined();
    });

    test('should handle empty paths', () => {
      expect(engine.getNestedValue(sampleContext, '')).toBeUndefined();
      expect(engine.getNestedValue(sampleContext, null)).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed templates gracefully', () => {
      const malformedTemplates = [
        '{{character.name',
        'character.name}}',
        '{{#if}}{{/if}}',
        '{{random}}',
        '{{{{nested}}}}'
      ];

      malformedTemplates.forEach(template => {
        const result = engine.resolve(template, sampleContext);
        expect(result).toHaveProperty('resolved');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
      });
    });

    test('should handle circular references safely', () => {
      const circularContext = { a: {} };
      circularContext.a.b = circularContext.a;
      
      expect(() => engine.getPlaceholderSuggestions(circularContext)).not.toThrow();
    });

    test('should handle very long templates', () => {
      const longTemplate = 'Hello {{character.name}}! '.repeat(1000);
      const result = engine.resolve(longTemplate, sampleContext);
      
      expect(result.resolved).toContain('Aria Blackwood');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    test('should handle large contexts efficiently', () => {
      const largeContext = {};
      for (let i = 0; i < 1000; i++) {
        largeContext[`item${i}`] = { value: i, name: `Item ${i}` };
      }

      const start = Date.now();
      const suggestions = engine.getPlaceholderSuggestions(largeContext);
      const end = Date.now();

      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should handle many placeholders efficiently', () => {
      const template = Array.from({ length: 100 }, (_, i) => `{{item${i}.name}}`).join(' ');
      const context = {};
      for (let i = 0; i < 100; i++) {
        context[`item${i}`] = { name: `Item ${i}` };
      }

      const start = Date.now();
      const result = engine.resolve(template, context);
      const end = Date.now();

      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
      expect(result.errors).toHaveLength(0);
    });
  });
});