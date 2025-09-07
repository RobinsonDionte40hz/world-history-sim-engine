// src/domain/services/ChildGenerationService.js

import Character from '../entities/Character.js';
import BaseDomainService from './BaseDomainService.js';

/**
 * Service for generating children from parent characters
 * Handles trait inheritance, name generation, and initial character setup
 */
export class ChildGenerationService extends BaseDomainService {
  constructor() {
    super();
    this.nameDatabase = this._initializeNameDatabase();
  }

  /**
   * Generate a child character from two parents
   * @param {Character} parent1 - First parent character
   * @param {Character} parent2 - Second parent character
   * @param {Object} settlement - Settlement context for cultural naming
   * @returns {Character} - New child character
   */
  generateChild(parent1, parent2, settlement) {
    if (!parent1 || !parent2) {
      throw new Error('Both parents must be provided');
    }

    // Generate child data
    const childData = {
      name: this.generateChildName(parent1, parent2, settlement?.culture),
      age: 0,
      
      // Inherit D&D attributes from parents with variation
      baseAttributes: this.inheritAttributes(parent1.baseAttributes || parent1.attributes, parent2.baseAttributes || parent2.attributes),
      
      // Inherit personality traits with mutation
      personalityConfig: this.inheritPersonality(parent1.personality, parent2.personality),
      
      // Start with basic consciousness (develops over time)
      consciousness: {
        frequency: (parent1.consciousness.frequency + parent2.consciousness.frequency) / 2 + this.randomVariation(-5, 5),
        coherence: 0.1 // Children start with low coherence
      },
      
      // Family relationships
      relationships: new Map([
        [parent1.id, { 
          value: 90, 
          type: 'family', 
          history: [{ 
            timestamp: Date.now(), 
            change: 90, 
            reason: 'birth - parent' 
          }] 
        }],
        [parent2.id, { 
          value: 90, 
          type: 'family', 
          history: [{ 
            timestamp: Date.now(), 
            change: 90, 
            reason: 'birth - parent' 
          }] 
        }]
      ]),
      
      // Basic goals for children
      goals: [
        { id: 'learn_and_grow', type: 'development', priority: 'high' },
        { id: 'family_bonding', type: 'social', priority: 'medium' }
      ],

      // Inherit racial traits (choose from one parent or mix)
      racialTraits: this.inheritRacialTraits(parent1.racialTraits, parent2.racialTraits),

      // Basic character properties
      health: 100,
      maxEnergy: 30, // Children have lower energy
      energy: 30,
      mood: 70 // Children generally start happy
    };
    
    return new Character(childData);
  }

  /**
   * Inherit attributes from parents with genetic variation
   * @param {Object} parent1Attrs - First parent's attributes
   * @param {Object} parent2Attrs - Second parent's attributes
   * @returns {Object} - Child's base attributes
   */
  inheritAttributes(parent1Attrs, parent2Attrs) {
    const inherited = {};
    
    // Convert attributes to simple format if needed
    const p1Attrs = this._convertAttributesToSimple(parent1Attrs);
    const p2Attrs = this._convertAttributesToSimple(parent2Attrs);
    
    ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach(attr => {
      // Average parents with some random variation
      const parent1Value = p1Attrs[attr] || 10;
      const parent2Value = p2Attrs[attr] || 10;
      const parentAverage = (parent1Value + parent2Value) / 2;
      const variation = this.randomVariation(-2, 2); // ±2 points variation
      inherited[attr] = Math.max(3, Math.min(18, Math.round(parentAverage + variation)));
    });
    
    return inherited;
  }

  /**
   * Inherit personality traits from parents with mutation
   * @param {PersonalityProfile} parent1Personality - First parent's personality
   * @param {PersonalityProfile} parent2Personality - Second parent's personality
   * @returns {Object} - Child's personality configuration
   */
  inheritPersonality(parent1Personality, parent2Personality) {
    const childTraits = {};
    
    // Get trait arrays from both parents
    const p1Traits = parent1Personality.getAllTraits();
    const p2Traits = parent2Personality.getAllTraits();
    
    // Create a map of all unique traits
    const allTraitIds = new Set([
      ...p1Traits.map(t => t.id),
      ...p2Traits.map(t => t.id)
    ]);
    
    allTraitIds.forEach(traitId => {
      const p1Trait = p1Traits.find(t => t.id === traitId);
      const p2Trait = p2Traits.find(t => t.id === traitId);
      
      // Get trait values (default to 0.5 if trait doesn't exist in parent)
      const p1Value = p1Trait ? p1Trait.intensity : 0.5;
      const p2Value = p2Trait ? p2Trait.intensity : 0.5;
      
      // Average with mutation
      const parentAverage = (p1Value + p2Value) / 2;
      const mutation = this.randomVariation(-0.2, 0.2); // ±0.2 variation
      childTraits[traitId] = Math.max(0, Math.min(1, parentAverage + mutation));
    });
    
    return {
      traits: Object.entries(childTraits).map(([id, intensity]) => ({
        id,
        intensity: parseFloat(intensity.toFixed(2))
      }))
    };
  }

  /**
   * Inherit racial traits from parents
   * @param {RacialTraits} parent1Race - First parent's racial traits
   * @param {RacialTraits} parent2Race - Second parent's racial traits
   * @returns {RacialTraits} - Child's racial traits
   */
  inheritRacialTraits(parent1Race, parent2Race) {
    // For now, randomly choose one parent's race
    // In the future, this could be enhanced to handle mixed heritage
    const chosenParent = Math.random() < 0.5 ? parent1Race : parent2Race;
    return chosenParent;
  }

  /**
   * Generate a name for the child based on parents and cultural context
   * @param {Character} parent1 - First parent
   * @param {Character} parent2 - Second parent
   * @param {Object} culture - Settlement culture information
   * @returns {string} - Child's name
   */
  generateChildName(parent1, parent2, culture) {
    const culturalContext = culture?.language || 'common';
    const namePool = this.nameDatabase[culturalContext] || this.nameDatabase.common;
    
    // Get parent names for inspiration
    const parent1Name = parent1.name || 'Unknown';
    const parent2Name = parent2.name || 'Unknown';
    
    // Try to create a name that honors parents or follows cultural patterns
    const possibleNames = [];
    
    // Add cultural names
    possibleNames.push(...namePool.first);
    
    // Add names inspired by parents (simple variations)
    if (parent1Name.length > 3) {
      possibleNames.push(parent1Name.substring(0, 3) + this._getRandomNameEnding());
    }
    if (parent2Name.length > 3) {
      possibleNames.push(parent2Name.substring(0, 3) + this._getRandomNameEnding());
    }
    
    // Select random name
    const firstName = possibleNames[Math.floor(Math.random() * possibleNames.length)];
    
    // Add family name if parents have one
    const familyName = this._deriveFamilyName(parent1Name, parent2Name);
    
    return familyName ? `${firstName} ${familyName}` : firstName;
  }

  /**
   * Generate random variation within a range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random value in range
   */
  randomVariation(min = -0.1, max = 0.1) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Convert attributes to simple format if needed
   * @param {Object} attributesObj - Attributes object
   * @returns {Object} - Simple attributes format
   * @private
   */
  _convertAttributesToSimple(attributesObj) {
    if (!attributesObj) return {};
    
    const result = {};
    Object.keys(attributesObj).forEach(key => {
      if (attributesObj[key] && typeof attributesObj[key] === 'object' && 'score' in attributesObj[key]) {
        result[key] = attributesObj[key].score;
      } else {
        result[key] = attributesObj[key];
      }
    });
    return result;
  }

  /**
   * Derive family name from parents
   * @param {string} parent1Name - First parent's name
   * @param {string} parent2Name - Second parent's name
   * @returns {string|null} - Family name or null
   * @private
   */
  _deriveFamilyName(parent1Name, parent2Name) {
    // Try to extract family names from parents
    const p1Parts = parent1Name.split(' ');
    const p2Parts = parent2Name.split(' ');
    
    if (p1Parts.length > 1) {
      return p1Parts[p1Parts.length - 1]; // Use first parent's family name
    }
    if (p2Parts.length > 1) {
      return p2Parts[p2Parts.length - 1]; // Fall back to second parent's family name
    }
    
    return null; // No family name found
  }

  /**
   * Get random name ending
   * @returns {string} - Random name ending
   * @private
   */
  _getRandomNameEnding() {
    const endings = ['an', 'en', 'in', 'on', 'un', 'ar', 'er', 'ir', 'or', 'el', 'al', 'ia', 'iana', 'ius'];
    return endings[Math.floor(Math.random() * endings.length)];
  }

  /**
   * Initialize name database with cultural variations
   * @returns {Object} - Name database
   * @private
   */
  _initializeNameDatabase() {
    return {
      common: {
        first: [
          'Aiden', 'Bella', 'Connor', 'Diana', 'Ethan', 'Fiona', 'Gabriel', 'Hannah',
          'Isaac', 'Julia', 'Kael', 'Luna', 'Marcus', 'Nora', 'Oliver', 'Penelope',
          'Quinn', 'Rosa', 'Samuel', 'Tessa', 'Ulric', 'Vera', 'William', 'Xara',
          'Yann', 'Zoe'
        ]
      },
      elvish: {
        first: [
          'Aelindra', 'Celeborn', 'Elaria', 'Finrod', 'Galadriel', 'Haldir',
          'Legolas', 'Nimrodel', 'Thranduil', 'Arwen', 'Elrond', 'Glorfindel'
        ]
      },
      dwarven: {
        first: [
          'Thorin', 'Dwalin', 'Balin', 'Fili', 'Kili', 'Dori', 'Nori', 'Ori',
          'Oin', 'Gloin', 'Bifur', 'Bofur', 'Bombur', 'Gimli', 'Dain'
        ]
      },
      human: {
        first: [
          'Alexander', 'Beatrice', 'Charles', 'Delphine', 'Edmund', 'Francesca',
          'Gregory', 'Helena', 'Ivan', 'Josephine', 'Klaus', 'Lydia',
          'Magnus', 'Natasha', 'Orlando', 'Priscilla'
        ]
      }
    };
  }
}

export default ChildGenerationService;
