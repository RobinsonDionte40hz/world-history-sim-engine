// src/test/unit/InteractionFactory.content-fix.test.js

import InteractionFactory from '../../domain/entities/interactions/InteractionFactory.js';

describe('InteractionFactory Content Type Fix', () => {
  describe('fromJSON with content interactions', () => {
    test('should deserialize interaction with type "content"', () => {
      const contentJSON = {
        id: 'test-interaction',
        name: 'Seek Counsel',
        description: 'Seek advice from a wise character',
        type: 'content',
        category: 'social',
        requirements: [],
        effects: []
      };

      const interaction = InteractionFactory.fromJSON(contentJSON);
      
      expect(interaction).toBeDefined();
      expect(interaction.type).toBe('content');
      expect(interaction.name).toBe('Seek Counsel');
      expect(interaction.isContentInteraction).toBe(true);
      expect(typeof interaction.canExecute).toBe('function');
    });

    test('should still work with type "contentinteraction"', () => {
      const contentJSON = {
        id: 'test-interaction',
        name: 'Browse Wares',
        description: 'Look at available goods',
        type: 'contentinteraction',
        category: 'economic',
        requirements: [],
        effects: []
      };

      const interaction = InteractionFactory.fromJSON(contentJSON);
      
      expect(interaction).toBeDefined();
      expect(interaction.type).toBe('content'); // ContentInteraction constructor normalizes this
      expect(interaction.name).toBe('Browse Wares');
      expect(interaction.isContentInteraction).toBe(true);
      expect(typeof interaction.canExecute).toBe('function');
    });

    test('should provide helpful error message for unknown types', () => {
      const invalidJSON = {
        id: 'test-interaction',
        name: 'Invalid',
        type: 'unknown-type'
      };

      expect(() => {
        InteractionFactory.fromJSON(invalidJSON);
      }).toThrow('Unknown interaction type in JSON: unknown-type. Supported types: wait, rest, examine, movement, perception, content, social, observational, administrative, economic, labor, planning, innovation, creative, analytical, system, base');
    });

    test('should handle both short and long system interaction types', () => {
      const waitJSON = { id: 'w1', name: 'Wait', type: 'wait' };
      const restJSON = { id: 'r1', name: 'Rest', type: 'rest' };
      
      const waitInteraction = InteractionFactory.fromJSON(waitJSON);
      const restInteraction = InteractionFactory.fromJSON(restJSON);
      
      // System interactions normalize to 'system' type but keep their specific names
      expect(waitInteraction.name).toBe('Wait');
      expect(restInteraction.name).toBe('Rest');
      expect(typeof waitInteraction.canExecute).toBe('function');
      expect(typeof restInteraction.canExecute).toBe('function');
    });
  });

  describe('Real-world demo interaction scenario', () => {
    test('should handle demo interactions like those from DemoService', () => {
      // This simulates how demo interactions are stored and loaded
      const demoInteractions = [
        {
          id: 'seek_counsel',
          name: 'Seek Counsel',
          description: 'Approach the wise elder for guidance on important matters',
          type: 'content',
          category: 'social',
          requirements: [{ type: 'attribute', name: 'wisdom', value: 5 }],
          effects: [{ type: 'mood', value: 'thoughtful' }],
          culturalContext: ['wisdom-seeking', 'respect']
        },
        {
          id: 'browse_wares',
          name: 'Browse Wares',
          description: 'Examine the merchant\'s goods with interest',
          type: 'content',
          category: 'economic',
          requirements: [],
          effects: [{ type: 'knowledge', value: 'market-prices' }],
          culturalContext: ['trade', 'commerce']
        }
      ];

      // Test that all demo interactions can be properly deserialized
      const deserializedInteractions = demoInteractions.map(json => {
        const interaction = InteractionFactory.fromJSON(json);
        expect(interaction).toBeDefined();
        expect(interaction.type).toBe('content');
        expect(interaction.isContentInteraction).toBe(true);
        expect(typeof interaction.canExecute).toBe('function');
        return interaction;
      });

      expect(deserializedInteractions).toHaveLength(2);
      expect(deserializedInteractions[0].name).toBe('Seek Counsel');
      expect(deserializedInteractions[1].name).toBe('Browse Wares');
    });
  });
});