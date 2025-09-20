/**
 * Integration Tests for Consciousness Template System
 *
 * Tests the complete integration between:
 * - TemplateManager with consciousness support
 * - Character entity with consciousness validation
 * - BehavioralStateTempla      // Add template to manager first
      templateManager.addTemplate('characters', validTemplate);s for archetype configurations
 * - Template instantiation and validation
 */

const TemplateManager = require('../template/TemplateManager').default;
const Character = require('../domain/entities/Character').default;

describe('Consciousness Template Integration', () => {
  let templateManager;

  beforeEach(() => {
    templateManager = new TemplateManager();
  });

  describe('Archetype Template Creation', () => {
    const archetypes = ['warrior', 'merchant', 'scholar', 'noble', 'peasant', 'priest', 'rogue', 'mage'];

    test.each(archetypes)('should create valid %s archetype template', (archetype) => {
      const template = templateManager.createCharacterTemplateWithBehavioralState(archetype);

      expect(template).toBeDefined();
      expect(template.id).toContain(archetype);
      expect(template.consciousness).toBeDefined();
      expect(template.consciousness.frequency).toBeGreaterThanOrEqual(3.0);
      expect(template.consciousness.frequency).toBeLessThanOrEqual(15.0);
      expect(template.consciousness.coherence).toBeGreaterThanOrEqual(0.2);
      expect(template.consciousness.coherence).toBeLessThanOrEqual(1.0);
      expect(template.consciousness.behavioralState).toBeDefined();
      expect(template.consciousness.updateRules).toBeDefined();
    });

    test('should return all available archetypes', () => {
      const availableArchetypes = templateManager.getAvailableBehavioralArchetypes();

      expect(availableArchetypes).toEqual(archetypes);
      expect(availableArchetypes).toHaveLength(archetypes.length);
    });
  });

  describe('Template Instantiation', () => {
    test('should instantiate character from archetype template', () => {
      const template = templateManager.createCharacterTemplateWithBehavioralState('warrior');
      const character = Character.fromTemplate(template, {
        name: 'Test Warrior',
        id: 'test_warrior_001'
      });

      expect(character).toBeInstanceOf(Character);
      expect(character.name).toBe('Test Warrior');
      expect(character.id).toBe('test_warrior_001');
      expect(character.consciousness.frequency).toBe(template.consciousness.frequency);
      expect(character.consciousness.coherence).toBe(template.consciousness.coherence);
    });

    test('should merge customizations with template', () => {
      const template = templateManager.createCharacterTemplateWithBehavioralState('merchant');
      const customizations = {
        name: 'Custom Merchant',
        consciousness: {
          frequency: 12.0,
          behavioralState: {
            energy: 0.9,
            riskTolerance: 0.8
          }
        }
      };

      const character = Character.fromTemplate(template, customizations);

      expect(character.name).toBe('Custom Merchant');
      expect(character.consciousness.frequency).toBe(12.0);
      expect(character.consciousness.behavioralState.energy).toBe(0.9);
      expect(character.consciousness.behavioralState.riskTolerance).toBe(0.8);
      // Other properties should remain from template
      expect(character.consciousness.coherence).toBe(template.consciousness.coherence);
    });

    test('should generate unique IDs for template instances', () => {
      const template = templateManager.createCharacterTemplateWithBehavioralState('scholar');

      const char1 = Character.fromTemplate(template);
      const char2 = Character.fromTemplate(template);

      expect(char1.id).not.toBe(char2.id);
      expect(char1.id).toMatch(/^scholar.*_instance_\d+_[a-z0-9]+$/);
      expect(char2.id).toMatch(/^scholar.*_instance_\d+_[a-z0-9]+$/);
    });
  });

  describe('Consciousness Validation', () => {
    test('should validate correct consciousness configuration', () => {
      const validConfig = {
        frequency: 10.0,
        coherence: 0.8,
        behavioralState: {
          energy: 0.7,
          focus: 0.8,
          socialDrive: 0.6,
          riskTolerance: 0.5,
          ambition: 0.9
        },
        updateRules: {
          significanceThreshold: 0.3,
          adaptationRate: 1.2,
          stabilityFactor: 1.0
        }
      };

      const result = Character.validateConsciousnessConfig(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid frequency values', () => {
      const invalidConfigs = [
        { frequency: 1.0 }, // Too low
        { frequency: 20.0 }, // Too high
        { frequency: '10.0' } // Wrong type
      ];

      invalidConfigs.forEach(config => {
        const result = Character.validateConsciousnessConfig(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Consciousness frequency must be between 3.0 and 15.0');
      });
    });

    test('should reject invalid coherence values', () => {
      const invalidConfigs = [
        { coherence: 0.1 }, // Too low
        { coherence: 1.2 }, // Too high
        { coherence: '0.8' } // Wrong type
      ];

      invalidConfigs.forEach(config => {
        const result = Character.validateConsciousnessConfig(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Consciousness coherence must be between 0.2 and 1.0');
      });
    });

    test('should reject invalid behavioral state values', () => {
      const invalidConfigs = [
        { behavioralState: { energy: -0.1 } },
        { behavioralState: { focus: 1.1 } },
        { behavioralState: { socialDrive: '0.5' } }
      ];

      invalidConfigs.forEach(config => {
        const result = Character.validateConsciousnessConfig(config);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should reject invalid update rule values', () => {
      const invalidConfigs = [
        { updateRules: { significanceThreshold: -0.1 } },
        { updateRules: { adaptationRate: 3.0 } },
        { updateRules: { stabilityFactor: '1.0' } }
      ];

      invalidConfigs.forEach(config => {
        const result = Character.validateConsciousnessConfig(config);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Template Validation', () => {
    test('should validate behavioral state template', () => {
      const validTemplate = {
        id: 'test_template',
        name: 'Test Template',
        description: 'A test template for validation',
        version: '1.0.0',
        tags: ['test'],
        metadata: {},
        consciousness: {
          frequency: 10.0,
          coherence: 0.8,
          behavioralState: {
            energy: 0.7,
            focus: 0.8,
            socialDrive: 0.6,
            riskTolerance: 0.5,
            ambition: 0.9
          },
          updateRules: {
            significanceThreshold: 0.3,
            adaptationRate: 1.2,
            stabilityFactor: 1.0
          }
        },
        personalityTraits: ['test_trait'],
        cognitiveTraits: ['test_cognitive'],
        emotionalTendencies: ['test_emotion'],
        skills: ['test_skill'],
        attributes: { strength: 10 },
        background: 'test_background'
      };

      // Add template to manager first
      templateManager.addTemplate('characters', validTemplate);

      const result = templateManager.validateBehavioralStateTemplate('test_template');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject template with invalid consciousness', () => {
      const invalidTemplate = {
        id: 'invalid_template',
        name: 'Invalid Template',
        description: 'An invalid test template',
        version: '1.0.0',
        tags: ['test'],
        metadata: {},
        consciousness: {
          frequency: 20.0, // Invalid frequency
          coherence: 0.8
        },
        personalityTraits: ['test_trait'],
        cognitiveTraits: ['test_cognitive'],
        emotionalTendencies: ['test_emotion'],
        skills: ['test_skill'],
        attributes: { strength: 10 },
        background: 'test_background'
      };

      // Add template to manager first
      templateManager.addTemplate('characters', invalidTemplate);

      const result = templateManager.validateBehavioralStateTemplate('invalid_template');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Behavioral State Archetypes', () => {
    test('warrior archetype should have high energy and risk tolerance', () => {
      const warrior = templateManager.createCharacterTemplateWithBehavioralState('warrior');

      expect(warrior.consciousness.behavioralState.energy).toBeGreaterThan(0.7);
      expect(warrior.consciousness.behavioralState.riskTolerance).toBeGreaterThan(0.6);
      expect(warrior.consciousness.frequency).toBeGreaterThan(8.0); // Higher frequency for alertness
    });

    test('scholar archetype should have high focus and low social drive', () => {
      const scholar = templateManager.createCharacterTemplateWithBehavioralState('scholar');

      expect(scholar.consciousness.behavioralState.focus).toBeGreaterThan(0.8);
      expect(scholar.consciousness.behavioralState.socialDrive).toBe(0.5); // Moderate social engagement
      expect(scholar.consciousness.coherence).toBeGreaterThan(0.7); // High coherence for concentration
    });

    test('merchant archetype should have balanced risk and social drive', () => {
      const merchant = templateManager.createCharacterTemplateWithBehavioralState('merchant');

      expect(merchant.consciousness.behavioralState.socialDrive).toBeGreaterThan(0.6);
      expect(merchant.consciousness.behavioralState.riskTolerance).toBe(0.2); // Low risk tolerance
      expect(merchant.consciousness.behavioralState.riskTolerance).toBeLessThan(0.8);
    });

    test('priest archetype should have high stability and low risk tolerance', () => {
      const priest = templateManager.createCharacterTemplateWithBehavioralState('priest');

      expect(priest.consciousness.updateRules.stabilityFactor).toBeGreaterThan(1.1);
      expect(priest.consciousness.behavioralState.riskTolerance).toBeLessThan(0.4);
      expect(priest.consciousness.coherence).toBeGreaterThan(0.8); // High coherence for faith
    });
  });

  describe('Error Handling', () => {
    test('should throw error for null template config', () => {
      expect(() => {
        Character.fromTemplate(null);
      }).toThrow('Template configuration is required');
    });

    test('should throw error for undefined template config', () => {
      expect(() => {
        Character.fromTemplate(undefined);
      }).toThrow('Template configuration is required');
    });

    test('should handle missing consciousness in template', () => {
      const templateWithoutConsciousness = {
        id: 'test_template',
        name: 'Test Template'
        // No consciousness property
      };

      const character = Character.fromTemplate(templateWithoutConsciousness, {
        consciousness: {
          frequency: 10.0,
          coherence: 0.8
        }
      });

      expect(character.consciousness.frequency).toBe(10.0);
      expect(character.consciousness.coherence).toBe(0.8);
    });
  });
});