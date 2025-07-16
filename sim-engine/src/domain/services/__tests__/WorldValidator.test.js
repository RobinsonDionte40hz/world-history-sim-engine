const WorldValidator = require('../WorldValidator');

describe('WorldValidator', () => {
  describe('validateDimensions', () => {
    it('should validate correct dimensions', () => {
      const dimensions = { width: 100, height: 100 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.message).toBe('Valid dimensions');
    });

    it('should reject missing dimensions', () => {
      const result = WorldValidator.validateDimensions(null);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('World dimensions are required');
    });

    it('should reject invalid width', () => {
      const dimensions = { width: -10, height: 100 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('World width must be a positive number');
    });

    it('should reject invalid height', () => {
      const dimensions = { width: 100, height: 0 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('World height must be a positive number');
    });

    it('should warn about large dimensions', () => {
      const dimensions = { width: 1500, height: 1200 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Large world dimensions may impact performance');
    });

    it('should warn about small dimensions', () => {
      const dimensions = { width: 5, height: 8 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Very small world dimensions may limit simulation complexity');
    });

    it('should validate 3D dimensions', () => {
      const dimensions = { width: 100, height: 100, depth: 50 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid depth', () => {
      const dimensions = { width: 100, height: 100, depth: -5 };
      const result = WorldValidator.validateDimensions(dimensions);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('World depth must be a positive number if specified');
    });
  });

  describe('validateNodes', () => {
    it('should validate correct nodes', () => {
      const nodes = [
        {
          id: 'node1',
          name: 'Test Node',
          position: { x: 10, y: 20 }
        },
        {
          id: 'node2',
          name: 'Another Node',
          position: { x: 30, y: 40 }
        }
      ];
      const result = WorldValidator.validateNodes(nodes);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(2);
      expect(result.message).toBe('2 valid nodes');
    });

    it('should reject non-array nodes', () => {
      const result = WorldValidator.validateNodes('not an array');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nodes must be an array');
    });

    it('should reject empty nodes array', () => {
      const result = WorldValidator.validateNodes([]);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one node is required for a valid world');
    });

    it('should reject nodes without required fields', () => {
      const nodes = [
        {
          // missing id, name, position
        }
      ];
      const result = WorldValidator.validateNodes(nodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Node 1: ID is required');
      expect(result.errors).toContain('Node 1: Name is required and must be a string');
      expect(result.errors).toContain('Node 1: Position is required');
    });

    it('should reject duplicate node IDs', () => {
      const nodes = [
        {
          id: 'duplicate',
          name: 'Node 1',
          position: { x: 10, y: 20 }
        },
        {
          id: 'duplicate',
          name: 'Node 2',
          position: { x: 30, y: 40 }
        }
      ];
      const result = WorldValidator.validateNodes(nodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Node 2: Duplicate node ID 'duplicate'");
    });

    it('should reject invalid position coordinates', () => {
      const nodes = [
        {
          id: 'node1',
          name: 'Test Node',
          position: { x: 'invalid', y: 20 }
        }
      ];
      const result = WorldValidator.validateNodes(nodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Node 1: Position x must be a number');
    });

    it('should warn about missing optional fields', () => {
      const nodes = [
        {
          id: 'node1',
          name: 'Test Node',
          position: { x: 10, y: 20 }
          // missing type and description
        }
      ];
      const result = WorldValidator.validateNodes(nodes);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Node 1: Node type not specified, using default');
      expect(result.warnings).toContain('Node 1: Node description not provided');
    });

    it('should warn about large number of nodes', () => {
      const nodes = Array.from({ length: 150 }, (_, i) => ({
        id: `node${i}`,
        name: `Node ${i}`,
        position: { x: i, y: i }
      }));
      const result = WorldValidator.validateNodes(nodes);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Large number of nodes may impact performance');
    });
  });

  describe('validateCharacters', () => {
    it('should validate correct characters', () => {
      const characters = [
        {
          id: 'char1',
          name: 'Test Character',
          attributes: { strength: 10, intelligence: 8, charisma: 12 },
          currentNodeId: 'node1'
        }
      ];
      const result = WorldValidator.validateCharacters(characters);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(1);
      expect(result.message).toBe('1 valid characters');
    });

    it('should handle undefined characters', () => {
      const result = WorldValidator.validateCharacters(undefined);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(0);
      expect(result.message).toBe('No characters defined');
    });

    it('should reject non-array characters', () => {
      const result = WorldValidator.validateCharacters('not an array');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Characters must be an array');
    });

    it('should warn about empty characters array', () => {
      const result = WorldValidator.validateCharacters([]);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('No characters defined - world may lack dynamic interactions');
    });

    it('should reject characters without required fields', () => {
      const characters = [
        {
          // missing id, name, attributes
        }
      ];
      const result = WorldValidator.validateCharacters(characters);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Character 1: ID is required');
      expect(result.errors).toContain('Character 1: Name is required and must be a string');
      expect(result.errors).toContain('Character 1: Attributes are required');
    });

    it('should reject duplicate character IDs', () => {
      const characters = [
        {
          id: 'duplicate',
          name: 'Character 1',
          attributes: { strength: 10 }
        },
        {
          id: 'duplicate',
          name: 'Character 2',
          attributes: { strength: 12 }
        }
      ];
      const result = WorldValidator.validateCharacters(characters);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Character 2: Duplicate character ID 'duplicate'");
    });

    it('should warn about missing attributes', () => {
      const characters = [
        {
          id: 'char1',
          name: 'Test Character',
          attributes: { strength: 10 } // missing intelligence, charisma
        }
      ];
      const result = WorldValidator.validateCharacters(characters);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Character 1: Missing intelligence attribute');
      expect(result.warnings).toContain('Character 1: Missing charisma attribute');
    });

    it('should reject invalid attribute types', () => {
      const characters = [
        {
          id: 'char1',
          name: 'Test Character',
          attributes: { strength: 'invalid' }
        }
      ];
      const result = WorldValidator.validateCharacters(characters);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Character 1: strength must be a number');
    });
  });

  describe('validateInteractions', () => {
    it('should validate correct interactions', () => {
      const interactions = [
        {
          id: 'interaction1',
          name: 'Test Interaction',
          type: 'social'
        }
      ];
      const result = WorldValidator.validateInteractions(interactions);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(1);
      expect(result.message).toBe('1 valid interactions');
    });

    it('should handle undefined interactions', () => {
      const result = WorldValidator.validateInteractions(undefined);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(0);
      expect(result.message).toBe('No interactions defined');
    });

    it('should warn about empty interactions', () => {
      const result = WorldValidator.validateInteractions([]);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('No interactions defined - characters may have limited behaviors');
    });

    it('should reject interactions without required fields', () => {
      const interactions = [
        {
          // missing id, name, type
        }
      ];
      const result = WorldValidator.validateInteractions(interactions);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Interaction 1: ID is required');
      expect(result.errors).toContain('Interaction 1: Name is required and must be a string');
      expect(result.errors).toContain('Interaction 1: Type is required and must be a string');
    });

    it('should reject invalid probability values', () => {
      const interactions = [
        {
          id: 'interaction1',
          name: 'Test Interaction',
          type: 'social',
          probability: 1.5 // invalid - should be 0-1
        }
      ];
      const result = WorldValidator.validateInteractions(interactions);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Interaction 1: Probability must be a number between 0 and 1');
    });
  });

  describe('validateEvents', () => {
    it('should validate correct events', () => {
      const events = [
        {
          id: 'event1',
          name: 'Test Event',
          trigger: { type: 'time', value: 100 }
        }
      ];
      const result = WorldValidator.validateEvents(events);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(1);
      expect(result.message).toBe('1 valid events');
    });

    it('should handle undefined events', () => {
      const result = WorldValidator.validateEvents(undefined);
      
      expect(result.valid).toBe(true);
      expect(result.count).toBe(0);
      expect(result.message).toBe('No events defined');
    });

    it('should warn about empty events', () => {
      const result = WorldValidator.validateEvents([]);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('No events defined - world may lack dynamic occurrences');
    });

    it('should reject events without required fields', () => {
      const events = [
        {
          // missing id, name, trigger
        }
      ];
      const result = WorldValidator.validateEvents(events);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Event 1: ID is required');
      expect(result.errors).toContain('Event 1: Name is required and must be a string');
      expect(result.errors).toContain('Event 1: Trigger is required');
    });
  });

  describe('validateCharacterNodeRelationships', () => {
    const nodes = [
      { id: 'node1', name: 'Node 1' },
      { id: 'node2', name: 'Node 2' }
    ];

    it('should validate correct relationships', () => {
      const characters = [
        { id: 'char1', name: 'Character 1', currentNodeId: 'node1' },
        { id: 'char2', name: 'Character 2', currentNodeId: 'node2' }
      ];
      const result = WorldValidator.validateCharacterNodeRelationships(characters, nodes);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Valid character-node relationships');
    });

    it('should reject invalid node assignments', () => {
      const characters = [
        { id: 'char1', name: 'Character 1', currentNodeId: 'nonexistent' }
      ];
      const result = WorldValidator.validateCharacterNodeRelationships(characters, nodes);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Character 'Character 1' assigned to non-existent node 'nonexistent'");
    });

    it('should warn about unassigned characters', () => {
      const characters = [
        { id: 'char1', name: 'Character 1' } // no currentNodeId
      ];
      const result = WorldValidator.validateCharacterNodeRelationships(characters, nodes);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Characters not assigned to nodes: Character 1');
    });

    it('should warn about overcrowded nodes', () => {
      const characters = Array.from({ length: 15 }, (_, i) => ({
        id: `char${i}`,
        name: `Character ${i}`,
        currentNodeId: 'node1'
      }));
      const result = WorldValidator.validateCharacterNodeRelationships(characters, nodes);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain("Node 'node1' may be overcrowded with 15 characters");
    });
  });

  describe('calculateCompleteness', () => {
    it('should calculate completeness correctly', () => {
      const worldConfig = {
        dimensions: { width: 100, height: 100 },
        nodes: [{ id: 'node1' }],
        characters: [{ id: 'char1' }],
        rules: { physics: {} },
        initialConditions: { characterCount: 1 },
        interactions: [{ id: 'int1' }],
        events: [{ id: 'event1' }]
      };
      
      const details = {
        dimensions: { valid: true },
        nodes: { valid: true, count: 1 },
        characters: { count: 1 },
        interactions: { count: 1 },
        events: { count: 1 }
      };
      
      const completeness = WorldValidator.calculateCompleteness(worldConfig, details);
      expect(completeness).toBe(1.0); // 100% complete
    });

    it('should handle minimal configuration', () => {
      const worldConfig = {
        dimensions: { width: 100, height: 100 },
        nodes: [{ id: 'node1' }]
      };
      
      const details = {
        dimensions: { valid: true },
        nodes: { valid: true, count: 1 },
        characters: { count: 0 },
        interactions: { count: 0 },
        events: { count: 0 }
      };
      
      const completeness = WorldValidator.calculateCompleteness(worldConfig, details);
      expect(completeness).toBe(0.45); // Only dimensions and nodes (45/100)
    });
  });

  describe('validate - full integration', () => {
    it('should validate a complete world configuration', () => {
      const worldConfig = {
        dimensions: { width: 100, height: 100 },
        rules: { physics: {}, interactions: {} },
        initialConditions: { characterCount: 2 },
        nodes: [
          {
            id: 'node1',
            name: 'Test Node',
            position: { x: 10, y: 20 }
          }
        ],
        characters: [
          {
            id: 'char1',
            name: 'Test Character',
            attributes: { strength: 10, intelligence: 8, charisma: 12 },
            currentNodeId: 'node1'
          }
        ],
        interactions: [
          {
            id: 'interaction1',
            name: 'Test Interaction',
            type: 'social'
          }
        ],
        events: [
          {
            id: 'event1',
            name: 'Test Event',
            trigger: { type: 'time', value: 100 }
          }
        ]
      };
      
      const result = WorldValidator.validate(worldConfig);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.completeness).toBeGreaterThan(0.9);
      expect(result.details).toBeDefined();
    });

    it('should identify multiple validation errors', () => {
      const worldConfig = {
        // missing dimensions
        nodes: [], // empty nodes
        characters: [
          {
            // missing required fields
            currentNodeId: 'nonexistent'
          }
        ]
      };
      
      const result = WorldValidator.validate(worldConfig);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.completeness).toBeLessThan(0.5);
    });
  });

  describe('formatValidationFeedback', () => {
    it('should format validation feedback correctly', () => {
      const validationResult = {
        isValid: false,
        errors: ['World dimensions are required', 'Duplicate node ID found'],
        warnings: ['Large world dimensions may impact performance', 'No characters defined'],
        completeness: 0.3,
        details: {
          characters: { count: 0 },
          interactions: { count: 0 },
          events: { count: 0 }
        }
      };
      
      const feedback = WorldValidator.formatValidationFeedback(validationResult);
      
      expect(feedback.status).toBe('invalid');
      expect(feedback.completeness).toBe(30);
      expect(feedback.summary.totalErrors).toBe(2);
      expect(feedback.summary.totalWarnings).toBe(2);
      expect(feedback.summary.readyForSimulation).toBe(false);
      expect(feedback.feedback.critical).toContain('World dimensions are required');
      expect(feedback.feedback.performance).toContain('Large world dimensions may impact performance');
      expect(feedback.feedback.suggestions).toContain('Add characters to create dynamic interactions in your world');
    });
  });

  describe('validateComponent', () => {
    it('should validate individual components', () => {
      const dimensions = { width: 100, height: 100 };
      const result = WorldValidator.validateComponent('dimensions', dimensions);
      
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Valid dimensions');
    });

    it('should reject unknown component types', () => {
      const result = WorldValidator.validateComponent('unknown', {});
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown component type: unknown');
    });
  });
});