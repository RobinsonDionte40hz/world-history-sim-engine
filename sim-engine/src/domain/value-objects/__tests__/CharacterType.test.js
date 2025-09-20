// src/domain/value-objects/__tests__/CharacterType.test.js

import CharacterType from '../CharacterType.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('CharacterType Value Object', () => {
  describe('Construction', () => {
    test('should create character type with default values', () => {
      const characterType = new CharacterType();
      
      expect(characterType.typeId).toBe('generic');
      expect(characterType.name).toBe('Generic Character');
      expect(characterType.description).toBe('A basic character type');
      expect(characterType.category).toBe('npc');
      expect(characterType.fieldRequirements).toBeDefined();
      expect(characterType.attributeRequirements).toBeDefined();
      expect(characterType.skillRequirements).toBeDefined();
      expect(characterType.assignmentCapabilities).toBeDefined();
    });

    test('should create character type with custom configuration', () => {
      const config = {
        typeId: 'custom-warrior',
        name: 'Custom Warrior',
        description: 'A custom warrior type',
        category: 'fighter',
        roleProperties: {
          weaponPreference: 'sword',
          combatStyle: 'aggressive'
        }
      };

      const characterType = new CharacterType(config);
      
      expect(characterType.typeId).toBe('custom-warrior');
      expect(characterType.name).toBe('Custom Warrior');
      expect(characterType.description).toBe('A custom warrior type');
      expect(characterType.category).toBe('fighter');
      expect(characterType.roleProperties.weaponPreference).toBe('sword');
    });

    test('should validate required fields during construction', () => {
      expect(() => {
        new CharacterType({
          typeId: '',
          name: 'Test'
        });
      }).toThrow(ValidationError);

      expect(() => {
        new CharacterType({
          typeId: 'test',
          name: ''
        });
      }).toThrow(ValidationError);
    });

    test('should validate field requirements format', () => {
      expect(() => {
        new CharacterType({
          fieldRequirements: {
            name: 'invalid_requirement'
          }
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Field Requirements', () => {
    let characterType;

    beforeEach(() => {
      characterType = new CharacterType({
        typeId: 'test',
        name: 'Test Type',
        fieldRequirements: {
          name: 'required',
          age: 'required',
          skills: 'optional',
          memories: 'hidden'
        }
      });
    });

    test('should get field requirement status', () => {
      expect(characterType.getFieldRequirement('name')).toBe('required');
      expect(characterType.getFieldRequirement('age')).toBe('required');
      expect(characterType.getFieldRequirement('skills')).toBe('optional');
      expect(characterType.getFieldRequirement('memories')).toBe('hidden');
      expect(characterType.getFieldRequirement('unknown')).toBe('optional');
    });

    test('should check if field is required', () => {
      expect(characterType.isFieldRequired('name')).toBe(true);
      expect(characterType.isFieldRequired('age')).toBe(true);
      expect(characterType.isFieldRequired('skills')).toBe(false);
      expect(characterType.isFieldRequired('memories')).toBe(false);
    });

    test('should check if field is hidden', () => {
      expect(characterType.isFieldHidden('name')).toBe(false);
      expect(characterType.isFieldHidden('skills')).toBe(false);
      expect(characterType.isFieldHidden('memories')).toBe(true);
    });

    test('should get visible fields', () => {
      const visibleFields = characterType.getVisibleFields();
      
      expect(visibleFields).toContain('name');
      expect(visibleFields).toContain('age');
      expect(visibleFields).toContain('skills');
      expect(visibleFields).not.toContain('memories');
    });

    test('should get required fields', () => {
      const requiredFields = characterType.getRequiredFields();
      
      expect(requiredFields).toContain('name');
      expect(requiredFields).toContain('age');
      expect(requiredFields).not.toContain('skills');
      expect(requiredFields).not.toContain('memories');
    });
  });

  describe('Attribute and Skill Requirements', () => {
    let characterType;

    beforeEach(() => {
      characterType = new CharacterType({
        typeId: 'test-warrior',
        name: 'Test Warrior',
        attributeRequirements: {
          strength: { min: 14, max: 20, default: 16, importance: 'critical' },
          dexterity: { min: 12, max: 20, default: 14, importance: 'high' }
        },
        skillRequirements: {
          athletics: { min: 8, max: 20, default: 12, importance: 'critical' },
          stealth: { min: 0, max: 20, default: 0, importance: 'low' }
        }
      });
    });

    test('should get attribute requirements', () => {
      const strengthReq = characterType.getAttributeRequirement('strength');
      
      expect(strengthReq.min).toBe(14);
      expect(strengthReq.max).toBe(20);
      expect(strengthReq.default).toBe(16);
      expect(strengthReq.importance).toBe('critical');
    });

    test('should get default requirement for unknown attribute', () => {
      const unknownReq = characterType.getAttributeRequirement('unknown');
      
      expect(unknownReq.min).toBe(3);
      expect(unknownReq.max).toBe(20);
      expect(unknownReq.default).toBe(10);
      expect(unknownReq.importance).toBe('normal');
    });

    test('should get skill requirements', () => {
      const athleticsReq = characterType.getSkillRequirement('athletics');
      
      expect(athleticsReq.min).toBe(8);
      expect(athleticsReq.max).toBe(20);
      expect(athleticsReq.default).toBe(12);
      expect(athleticsReq.importance).toBe('critical');
    });
  });

  describe('Assignment Capabilities', () => {
    test('should check assignment capabilities', () => {
      const genericType = new CharacterType({
        assignmentCapabilities: ['node', 'interaction']
      });
      
      expect(genericType.canBeAssignedTo('node')).toBe(true);
      expect(genericType.canBeAssignedTo('interaction')).toBe(true);
      expect(genericType.canBeAssignedTo('settlement')).toBe(false);
      expect(genericType.canBeAssignedTo('faction')).toBe(false);
    });

    test('should handle empty assignment capabilities', () => {
      const restrictedType = new CharacterType({
        assignmentCapabilities: []
      });
      
      expect(restrictedType.canBeAssignedTo('node')).toBe(false);
      expect(restrictedType.canBeAssignedTo('interaction')).toBe(false);
    });
  });

  describe('Character Data Validation', () => {
    let warriorType;

    beforeEach(() => {
      warriorType = new CharacterType({
        typeId: 'warrior',
        name: 'Warrior',
        fieldRequirements: {
          name: 'required',
          attributes: 'required',
          health: 'required'
        },
        attributeRequirements: {
          strength: { min: 14, max: 20, default: 16, importance: 'critical' },
          constitution: { min: 14, max: 20, default: 16, importance: 'critical' }
        },
        skillRequirements: {
          athletics: { min: 8, max: 20, default: 12, importance: 'critical' }
        }
      });
    });

    test('should validate valid character data', () => {
      const characterData = {
        name: 'Strong Warrior',
        attributes: {
          strength: 16,
          constitution: 16,
          dexterity: 12
        },
        skills: {
          athletics: 12
        },
        health: 100
      };

      const validation = warriorType.validateCharacterData(characterData);
      
      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should catch missing required fields', () => {
      const characterData = {
        attributes: { strength: 16 }
        // Missing required 'name' and 'health'
      };

      const validation = warriorType.validateCharacterData(characterData);
      
      expect(validation.success).toBe(false);
      expect(validation.errors.some(err => err.field === 'name')).toBe(true);
      expect(validation.errors.some(err => err.field === 'health')).toBe(true);
    });

    test('should catch attribute value violations', () => {
      const characterData = {
        name: 'Weak Warrior',
        attributes: {
          strength: 10, // Below minimum
          constitution: 25 // Above maximum
        },
        health: 100
      };

      const validation = warriorType.validateCharacterData(characterData);
      
      expect(validation.success).toBe(false);
      expect(validation.errors.some(err => 
        err.field === 'attributes.strength' && err.type === 'range'
      )).toBe(true);
      expect(validation.errors.some(err => 
        err.field === 'attributes.constitution' && err.type === 'range'
      )).toBe(true);
    });

    test('should generate warnings for low critical attributes', () => {
      const characterData = {
        name: 'Borderline Warrior',
        attributes: {
          strength: 15, // Just above minimum but low for critical attribute
          constitution: 15
        },
        health: 100
      };

      const validation = warriorType.validateCharacterData(characterData);
      
      expect(validation.success).toBe(true);
      expect(validation.warnings.some(warn => 
        warn.field === 'attributes.strength' && warn.type === 'importance'
      )).toBe(true);
    });

    test('should catch skill value violations', () => {
      const characterData = {
        name: 'Poor Athlete',
        attributes: { strength: 16, constitution: 16 },
        skills: {
          athletics: 5 // Below minimum
        },
        health: 100
      };

      const validation = warriorType.validateCharacterData(characterData);
      
      expect(validation.success).toBe(false);
      expect(validation.errors.some(err => 
        err.field === 'skills.athletics' && err.type === 'range'
      )).toBe(true);
    });
  });

  describe('Default Character Data Template', () => {
    test('should generate default character data for type', () => {
      const warriorType = new CharacterType({
        typeId: 'warrior',
        name: 'Warrior',
        category: 'fighter',
        attributeRequirements: {
          strength: { min: 14, max: 20, default: 16, importance: 'critical' },
          dexterity: { min: 12, max: 20, default: 14, importance: 'high' }
        },
        skillRequirements: {
          athletics: { min: 8, max: 20, default: 12, importance: 'critical' }
        },
        roleProperties: {
          combatStyle: 'melee'
        }
      });

      const defaultData = warriorType.getDefaultCharacterData();
      
      expect(defaultData.name).toBe('New Warrior');
      expect(defaultData.characterType).toBe('warrior');
      expect(defaultData.category).toBe('fighter');
      expect(defaultData.attributes.strength).toBe(16);
      expect(defaultData.attributes.dexterity).toBe(14);
      expect(defaultData.skills.athletics).toBe(12);
      expect(defaultData.roleProperties.combatStyle).toBe('melee');
    });
  });

  describe('Immutable Updates', () => {
    let characterType;

    beforeEach(() => {
      characterType = new CharacterType({
        typeId: 'base',
        name: 'Base Type',
        fieldRequirements: {
          name: 'required',
          age: 'optional'
        },
        attributeRequirements: {
          strength: { min: 8, max: 18, default: 10, importance: 'normal' }
        }
      });
    });

    test('should create new instance with updated field requirements', () => {
      const updatedType = characterType.withFieldRequirements({
        skills: 'required',
        inventory: 'hidden'
      });
      
      expect(updatedType).not.toBe(characterType);
      expect(updatedType.fieldRequirements.name).toBe('required'); // Preserved
      expect(updatedType.fieldRequirements.skills).toBe('required'); // Added
      expect(updatedType.fieldRequirements.inventory).toBe('hidden'); // Added
      expect(characterType.fieldRequirements.skills).toBeUndefined(); // Original unchanged
    });

    test('should create new instance with updated attribute requirements', () => {
      const updatedType = characterType.withAttributeRequirements({
        intelligence: { min: 12, max: 20, default: 14, importance: 'high' }
      });
      
      expect(updatedType).not.toBe(characterType);
      expect(updatedType.attributeRequirements.strength).toBeDefined(); // Preserved
      expect(updatedType.attributeRequirements.intelligence).toBeDefined(); // Added
      expect(characterType.attributeRequirements.intelligence).toBeUndefined(); // Original unchanged
    });
  });

  describe('Serialization', () => {
    test('should serialize character type to JSON', () => {
      const characterType = new CharacterType({
        typeId: 'test-type',
        name: 'Test Type',
        description: 'A test character type',
        category: 'test',
        fieldRequirements: {
          name: 'required',
          age: 'optional'
        },
        roleProperties: {
          testProperty: 'value'
        },
        assignmentCapabilities: ['node', 'interaction']
      });

      const json = characterType.toJSON();
      
      expect(json).toHaveProperty('typeId', 'test-type');
      expect(json).toHaveProperty('name', 'Test Type');
      expect(json).toHaveProperty('description', 'A test character type');
      expect(json).toHaveProperty('category', 'test');
      expect(json).toHaveProperty('fieldRequirements');
      expect(json).toHaveProperty('attributeRequirements');
      expect(json).toHaveProperty('skillRequirements');
      expect(json).toHaveProperty('roleProperties');
      expect(json).toHaveProperty('assignmentCapabilities');
      expect(json.fieldRequirements.name).toBe('required');
      expect(json.roleProperties.testProperty).toBe('value');
    });

    test('should deserialize character type from JSON', () => {
      const originalType = new CharacterType({
        typeId: 'serialization-test',
        name: 'Serialization Test',
        fieldRequirements: {
          name: 'required',
          skills: 'hidden'
        }
      });

      const json = originalType.toJSON();
      const deserializedType = CharacterType.fromJSON(json);
      
      expect(deserializedType.typeId).toBe(originalType.typeId);
      expect(deserializedType.name).toBe(originalType.name);
      expect(deserializedType.fieldRequirements.name).toBe('required');
      expect(deserializedType.fieldRequirements.skills).toBe('hidden');
      
      expect(deserializedType).toBeInstanceOf(CharacterType);
    });

    test('should handle invalid JSON data', () => {
      expect(() => {
        CharacterType.fromJSON(null);
      }).toThrow('Invalid JSON data for CharacterType');
      
      expect(() => {
        CharacterType.fromJSON('not an object');
      }).toThrow('Invalid JSON data for CharacterType');
    });
  });

  describe('Predefined Character Types', () => {
    let predefinedTypes;

    beforeEach(() => {
      predefinedTypes = CharacterType.createPredefinedTypes();
    });

    test('should create all predefined types', () => {
      expect(predefinedTypes).toHaveProperty('generic');
      expect(predefinedTypes).toHaveProperty('leader');
      expect(predefinedTypes).toHaveProperty('trader');
      expect(predefinedTypes).toHaveProperty('warrior');
      expect(predefinedTypes).toHaveProperty('mage');
      
      Object.values(predefinedTypes).forEach(type => {
        expect(type).toBeInstanceOf(CharacterType);
      });
    });

    test('should have correct assignment capabilities for leader', () => {
      const leader = predefinedTypes.leader;
      
      expect(leader.canBeAssignedTo('node')).toBe(true);
      expect(leader.canBeAssignedTo('interaction')).toBe(true);
      expect(leader.canBeAssignedTo('quest')).toBe(true);
      expect(leader.canBeAssignedTo('settlement')).toBe(true);
      expect(leader.canBeAssignedTo('faction')).toBe(true);
    });

    test('should have correct assignment capabilities for generic NPC', () => {
      const generic = predefinedTypes.generic;
      
      expect(generic.canBeAssignedTo('node')).toBe(true);
      expect(generic.canBeAssignedTo('interaction')).toBe(true);
      expect(generic.canBeAssignedTo('settlement')).toBe(false);
      expect(generic.canBeAssignedTo('faction')).toBe(false);
    });

    test('should have appropriate attribute requirements for warrior', () => {
      const warrior = predefinedTypes.warrior;
      
      const strengthReq = warrior.getAttributeRequirement('strength');
      const intelligenceReq = warrior.getAttributeRequirement('intelligence');
      
      expect(strengthReq.min).toBeGreaterThanOrEqual(14);
      expect(strengthReq.importance).toBe('critical');
      expect(intelligenceReq.importance).toBe('low');
    });

    test('should have appropriate skill requirements for mage', () => {
      const mage = predefinedTypes.mage;
      
      const investigationReq = mage.getSkillRequirement('investigation');
      const athleticsReq = mage.getSkillRequirement('athletics');
      
      expect(investigationReq.min).toBeGreaterThan(0);
      expect(investigationReq.importance).toBe('critical');
      expect(athleticsReq.importance).toBe('normal');
    });

    test('should have role-specific properties for trader', () => {
      const trader = predefinedTypes.trader;
      
      expect(trader.roleProperties).toHaveProperty('merchantType');
      expect(trader.roleProperties).toHaveProperty('tradeRoutes');
      expect(trader.roleProperties).toHaveProperty('specialties');
    });
  });

  describe('Edge Cases', () => {
    test('should handle character data with null/undefined values', () => {
      const characterType = new CharacterType({
        fieldRequirements: {
          name: 'required',
          age: 'required'
        }
      });

      const characterData = {
        name: null,
        age: undefined,
        attributes: {}
      };

      const validation = characterType.validateCharacterData(characterData);
      
      expect(validation.success).toBe(false);
      expect(validation.errors.some(err => err.field === 'name')).toBe(true);
      expect(validation.errors.some(err => err.field === 'age')).toBe(true);
    });

    test('should handle empty character data', () => {
      const characterType = new CharacterType({
        fieldRequirements: {
          name: 'required'
        }
      });

      const validation = characterType.validateCharacterData({});
      
      expect(validation.success).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('name');
    });

    test('should handle character type with no requirements', () => {
      const permissiveType = new CharacterType({
        typeId: 'permissive',
        fieldRequirements: {},
        attributeRequirements: {},
        skillRequirements: {}
      });

      const validation = permissiveType.validateCharacterData({});
      
      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });
});
