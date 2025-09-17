// src/domain/value-objects/CharacterType.js

import BaseValueObject from './BaseValueObject.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * CharacterType value object that defines character types and their field requirements
 * Manages validation rules and field visibility based on character type
 */
class CharacterType extends BaseValueObject {
  constructor(config = {}) {
    super();
    
    this.typeId = config.typeId !== undefined ? config.typeId : 'generic';
    this.name = config.name !== undefined ? config.name : 'Generic Character';
    this.description = config.description !== undefined ? config.description : 'A basic character type';
    this.category = config.category !== undefined ? config.category : 'npc'; // npc, leader, trader, warrior, mage, etc.
    
    // Field requirements define which fields are required, optional, or hidden
    this.fieldRequirements = config.fieldRequirements || this._getDefaultFieldRequirements();
    
    // Attribute requirements define min/max values and defaults for attributes
    this.attributeRequirements = config.attributeRequirements || this._getDefaultAttributeRequirements();
    
    // Skill requirements define which skills are important for this type
    this.skillRequirements = config.skillRequirements || this._getDefaultSkillRequirements();
    
    // Role-specific properties
    this.roleProperties = config.roleProperties || {};
    
    // Assignment capabilities - what this character type can be assigned to
    this.assignmentCapabilities = config.assignmentCapabilities || this._getDefaultAssignmentCapabilities();
    
    this.validate();
    this.freeze();
  }

  /**
   * Get the visibility status of a field for this character type
   * @param {string} fieldName - The field to check
   * @returns {string} - 'required', 'optional', 'hidden'
   */
  getFieldRequirement(fieldName) {
    return this.fieldRequirements[fieldName] || 'optional';
  }

  /**
   * Check if a field is required for this character type
   * @param {string} fieldName - The field to check
   * @returns {boolean}
   */
  isFieldRequired(fieldName) {
    return this.fieldRequirements[fieldName] === 'required';
  }

  /**
   * Check if a field should be hidden for this character type
   * @param {string} fieldName - The field to check
   * @returns {boolean}
   */
  isFieldHidden(fieldName) {
    return this.fieldRequirements[fieldName] === 'hidden';
  }

  /**
   * Get visible fields for this character type
   * @returns {string[]} - Array of field names that should be visible
   */
  getVisibleFields() {
    return Object.keys(this.fieldRequirements).filter(
      field => this.fieldRequirements[field] !== 'hidden'
    );
  }

  /**
   * Get required fields for this character type
   * @returns {string[]} - Array of field names that are required
   */
  getRequiredFields() {
    return Object.keys(this.fieldRequirements).filter(
      field => this.fieldRequirements[field] === 'required'
    );
  }

  /**
   * Get attribute requirements for a specific attribute
   * @param {string} attributeName - The attribute to check
   * @returns {object} - Requirements object with min, max, default, importance
   */
  getAttributeRequirement(attributeName) {
    return this.attributeRequirements[attributeName] || {
      min: 3,
      max: 20,
      default: 10,
      importance: 'normal'
    };
  }

  /**
   * Get skill requirements for a specific skill
   * @param {string} skillName - The skill to check
   * @returns {object} - Requirements object with min, max, default, importance
   */
  getSkillRequirement(skillName) {
    return this.skillRequirements[skillName] || {
      min: 0,
      max: 20,
      default: 0,
      importance: 'normal'
    };
  }

  /**
   * Check if this character type can be assigned to a specific assignment type
   * @param {string} assignmentType - Type of assignment (node, interaction, quest, etc.)
   * @returns {boolean}
   */
  canBeAssignedTo(assignmentType) {
    return this.assignmentCapabilities.includes(assignmentType);
  }

  /**
   * Validate character data against this type's requirements
   * @param {object} characterData - Character data to validate
   * @returns {object} - Validation result with success flag and errors
   */
  validateCharacterData(characterData) {
    const errors = [];
    const warnings = [];

    // Check required fields
    for (const field of this.getRequiredFields()) {
      if (characterData[field] === null || characterData[field] === undefined) {
        errors.push({
          field,
          type: 'required',
          message: `Field '${field}' is required for character type '${this.name}'`
        });
      }
    }

    // Validate attributes
    if (characterData.attributes) {
      for (const [attrName, attrValue] of Object.entries(characterData.attributes)) {
        const requirement = this.getAttributeRequirement(attrName);
        if (attrValue < requirement.min) {
          errors.push({
            field: `attributes.${attrName}`,
            type: 'range',
            message: `Attribute '${attrName}' value ${attrValue} is below minimum ${requirement.min} for character type '${this.name}'`
          });
        }
        if (attrValue > requirement.max) {
          errors.push({
            field: `attributes.${attrName}`,
            type: 'range',
            message: `Attribute '${attrName}' value ${attrValue} is above maximum ${requirement.max} for character type '${this.name}'`
          });
        }
        if (requirement.importance === 'critical' && attrValue < (requirement.min + 5)) {
          warnings.push({
            field: `attributes.${attrName}`,
            type: 'importance',
            message: `Attribute '${attrName}' is critical for character type '${this.name}' but value ${attrValue} is relatively low`
          });
        }
      }
    }

    // Validate skills
    if (characterData.skills) {
      for (const [skillName, skillValue] of Object.entries(characterData.skills)) {
        const requirement = this.getSkillRequirement(skillName);
        if (skillValue < requirement.min) {
          errors.push({
            field: `skills.${skillName}`,
            type: 'range',
            message: `Skill '${skillName}' value ${skillValue} is below minimum ${requirement.min} for character type '${this.name}'`
          });
        }
        if (skillValue > requirement.max) {
          errors.push({
            field: `skills.${skillName}`,
            type: 'range',
            message: `Skill '${skillName}' value ${skillValue} is above maximum ${requirement.max} for character type '${this.name}'`
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get default character data template for this type
   * @returns {object} - Default character data
   */
  getDefaultCharacterData() {
    const data = {
      name: `New ${this.name}`,
      characterType: this.typeId,
      category: this.category
    };

    // Add default attributes
    data.attributes = {};
    Object.entries(this.attributeRequirements).forEach(([attrName, requirement]) => {
      data.attributes[attrName] = requirement.default;
    });

    // Add default skills
    data.skills = {};
    Object.entries(this.skillRequirements).forEach(([skillName, requirement]) => {
      if (requirement.importance !== 'hidden') {
        data.skills[skillName] = requirement.default;
      }
    });

    // Add role-specific properties
    if (Object.keys(this.roleProperties).length > 0) {
      data.roleProperties = { ...this.roleProperties };
    }

    return data;
  }

  /**
   * Create a new CharacterType with updated field requirements
   * @param {object} newFieldRequirements - New field requirements
   * @returns {CharacterType} - New instance with updated requirements
   */
  withFieldRequirements(newFieldRequirements) {
    return new CharacterType({
      ...this.toJSON(),
      fieldRequirements: { ...this.fieldRequirements, ...newFieldRequirements }
    });
  }

  /**
   * Create a new CharacterType with updated attribute requirements
   * @param {object} newAttributeRequirements - New attribute requirements
   * @returns {CharacterType} - New instance with updated requirements
   */
  withAttributeRequirements(newAttributeRequirements) {
    return new CharacterType({
      ...this.toJSON(),
      attributeRequirements: { ...this.attributeRequirements, ...newAttributeRequirements }
    });
  }

  /**
   * Validate the character type configuration
   */
  validate() {
    this.validateRequired('typeId', this.typeId);
    this.validateRequired('name', this.name);
    this.validateStringLength('typeId', this.typeId, 1, 50);
    this.validateStringLength('name', this.name, 1, 100);
    
    if (typeof this.fieldRequirements !== 'object') {
      throw new ValidationError('fieldRequirements', this.fieldRequirements, 'Must be an object');
    }
    
    if (typeof this.attributeRequirements !== 'object') {
      throw new ValidationError('attributeRequirements', this.attributeRequirements, 'Must be an object');
    }
    
    if (typeof this.skillRequirements !== 'object') {
      throw new ValidationError('skillRequirements', this.skillRequirements, 'Must be an object');
    }
    
    if (!Array.isArray(this.assignmentCapabilities)) {
      throw new ValidationError('assignmentCapabilities', this.assignmentCapabilities, 'Must be an array');
    }

    // Validate field requirements values
    const validRequirements = ['required', 'optional', 'hidden'];
    for (const [field, requirement] of Object.entries(this.fieldRequirements)) {
      if (!validRequirements.includes(requirement)) {
        throw new ValidationError('fieldRequirements', requirement, `Field '${field}' has invalid requirement '${requirement}'. Must be one of: ${validRequirements.join(', ')}`);
      }
    }
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      typeId: this.typeId,
      name: this.name,
      description: this.description,
      category: this.category,
      fieldRequirements: { ...this.fieldRequirements },
      attributeRequirements: { ...this.attributeRequirements },
      skillRequirements: { ...this.skillRequirements },
      roleProperties: { ...this.roleProperties },
      assignmentCapabilities: [...this.assignmentCapabilities]
    };
  }

  /**
   * Create CharacterType from JSON data
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for CharacterType');
    }

    return new CharacterType({
      typeId: data.typeId,
      name: data.name,
      description: data.description,
      category: data.category,
      fieldRequirements: data.fieldRequirements,
      attributeRequirements: data.attributeRequirements,
      skillRequirements: data.skillRequirements,
      roleProperties: data.roleProperties,
      assignmentCapabilities: data.assignmentCapabilities
    });
  }

  /**
   * Get default field requirements
   * @private
   */
  _getDefaultFieldRequirements() {
    return {
      name: 'required',
      age: 'required',
      attributes: 'required',
      skills: 'optional',
      personality: 'optional',
      alignment: 'optional',
      influence: 'optional',
      prestige: 'optional',
      racialTraits: 'optional',
      inventory: 'optional',
      quests: 'optional',
      relationships: 'optional',
      memories: 'optional',
      location: 'optional',
      energy: 'optional',
      health: 'required',
      mood: 'optional',
      goals: 'optional'
    };
  }

  /**
   * Get default attribute requirements
   * @private
   */
  _getDefaultAttributeRequirements() {
    return {
      strength: { min: 3, max: 20, default: 10, importance: 'normal' },
      dexterity: { min: 3, max: 20, default: 10, importance: 'normal' },
      constitution: { min: 3, max: 20, default: 10, importance: 'normal' },
      intelligence: { min: 3, max: 20, default: 10, importance: 'normal' },
      wisdom: { min: 3, max: 20, default: 10, importance: 'normal' },
      charisma: { min: 3, max: 20, default: 10, importance: 'normal' }
    };
  }

  /**
   * Get default skill requirements
   * @private
   */
  _getDefaultSkillRequirements() {
    return {
      athletics: { min: 0, max: 20, default: 0, importance: 'normal' },
      stealth: { min: 0, max: 20, default: 0, importance: 'normal' },
      perception: { min: 0, max: 20, default: 0, importance: 'normal' },
      investigation: { min: 0, max: 20, default: 0, importance: 'normal' },
      persuasion: { min: 0, max: 20, default: 0, importance: 'normal' },
      deception: { min: 0, max: 20, default: 0, importance: 'normal' },
      intimidation: { min: 0, max: 20, default: 0, importance: 'normal' },
      insight: { min: 0, max: 20, default: 0, importance: 'normal' },
      survival: { min: 0, max: 20, default: 0, importance: 'normal' },
      medicine: { min: 0, max: 20, default: 0, importance: 'normal' }
    };
  }

  /**
   * Get default assignment capabilities
   * @private
   */
  _getDefaultAssignmentCapabilities() {
    return ['node', 'interaction', 'quest'];
  }

  /**
   * Create predefined character types
   */
  static createPredefinedTypes() {
    return {
      generic: new CharacterType({
        typeId: 'generic',
        name: 'Generic NPC',
        description: 'A basic non-player character',
        category: 'npc',
        assignmentCapabilities: ['node', 'interaction']
      }),

      leader: new CharacterType({
        typeId: 'leader',
        name: 'Leader',
        description: 'A character in a position of authority',
        category: 'leader',
        fieldRequirements: {
          name: 'required',
          age: 'required',
          attributes: 'required',
          skills: 'required',
          personality: 'required',
          alignment: 'required',
          influence: 'required',
          prestige: 'required',
          health: 'required',
          goals: 'required'
        },
        attributeRequirements: {
          strength: { min: 8, max: 20, default: 12, importance: 'normal' },
          dexterity: { min: 8, max: 20, default: 11, importance: 'normal' },
          constitution: { min: 10, max: 20, default: 14, importance: 'high' },
          intelligence: { min: 12, max: 20, default: 15, importance: 'critical' },
          wisdom: { min: 12, max: 20, default: 16, importance: 'critical' },
          charisma: { min: 14, max: 20, default: 17, importance: 'critical' }
        },
        skillRequirements: {
          persuasion: { min: 5, max: 20, default: 10, importance: 'critical' },
          insight: { min: 3, max: 20, default: 8, importance: 'high' },
          intimidation: { min: 2, max: 20, default: 6, importance: 'normal' },
          investigation: { min: 3, max: 20, default: 7, importance: 'high' }
        },
        assignmentCapabilities: ['node', 'interaction', 'quest', 'settlement', 'faction']
      }),

      trader: new CharacterType({
        typeId: 'trader',
        name: 'Trader',
        description: 'A merchant or trader character',
        category: 'trader',
        fieldRequirements: {
          name: 'required',
          age: 'required',
          attributes: 'required',
          skills: 'required',
          inventory: 'required',
          health: 'required',
          influence: 'optional'
        },
        attributeRequirements: {
          intelligence: { min: 12, max: 20, default: 14, importance: 'high' },
          wisdom: { min: 10, max: 20, default: 13, importance: 'high' },
          charisma: { min: 12, max: 20, default: 15, importance: 'critical' }
        },
        skillRequirements: {
          persuasion: { min: 8, max: 20, default: 12, importance: 'critical' },
          deception: { min: 3, max: 20, default: 6, importance: 'normal' },
          insight: { min: 5, max: 20, default: 9, importance: 'high' },
          investigation: { min: 3, max: 20, default: 7, importance: 'normal' }
        },
        roleProperties: {
          merchantType: 'general',
          tradeRoutes: [],
          specialties: []
        },
        assignmentCapabilities: ['node', 'interaction', 'trade_route', 'market']
      }),

      warrior: new CharacterType({
        typeId: 'warrior',
        name: 'Warrior',
        description: 'A combat-focused character',
        category: 'warrior',
        fieldRequirements: {
          name: 'required',
          age: 'required',
          attributes: 'required',
          skills: 'required',
          health: 'required',
          inventory: 'optional'
        },
        attributeRequirements: {
          strength: { min: 14, max: 20, default: 16, importance: 'critical' },
          dexterity: { min: 12, max: 20, default: 14, importance: 'high' },
          constitution: { min: 14, max: 20, default: 16, importance: 'critical' },
          intelligence: { min: 8, max: 20, default: 10, importance: 'low' },
          wisdom: { min: 10, max: 20, default: 12, importance: 'normal' }
        },
        skillRequirements: {
          athletics: { min: 8, max: 20, default: 12, importance: 'critical' },
          intimidation: { min: 5, max: 20, default: 9, importance: 'high' },
          perception: { min: 3, max: 20, default: 7, importance: 'normal' },
          survival: { min: 3, max: 20, default: 6, importance: 'normal' }
        },
        assignmentCapabilities: ['node', 'interaction', 'combat', 'guard', 'patrol']
      }),

      mage: new CharacterType({
        typeId: 'mage',
        name: 'Mage',
        description: 'A magic-wielding character',
        category: 'mage',
        fieldRequirements: {
          name: 'required',
          age: 'required',
          attributes: 'required',
          skills: 'required',
          health: 'required',
          goals: 'optional'
        },
        attributeRequirements: {
          strength: { min: 6, max: 20, default: 8, importance: 'low' },
          dexterity: { min: 10, max: 20, default: 12, importance: 'normal' },
          constitution: { min: 10, max: 20, default: 12, importance: 'normal' },
          intelligence: { min: 16, max: 20, default: 18, importance: 'critical' },
          wisdom: { min: 14, max: 20, default: 16, importance: 'high' },
          charisma: { min: 10, max: 20, default: 12, importance: 'normal' }
        },
        skillRequirements: {
          investigation: { min: 8, max: 20, default: 12, importance: 'critical' },
          insight: { min: 5, max: 20, default: 9, importance: 'high' },
          perception: { min: 5, max: 20, default: 8, importance: 'high' },
          medicine: { min: 3, max: 20, default: 6, importance: 'normal' }
        },
        roleProperties: {
          magicSchool: 'generalist',
          spellLevel: 1,
          specializations: []
        },
        assignmentCapabilities: ['node', 'interaction', 'magical_research', 'teaching']
      })
    };
  }
}

export default CharacterType;
