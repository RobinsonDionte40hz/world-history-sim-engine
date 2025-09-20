/**
 * Behavioral State Templates
 *
 * Pre-configured behavioral state templates for common NPC archetypes.
 * These templates define consciousness parameters and behavioral tendencies
 * for different character types to ensure consistent and realistic NPC behavior.
 */

class BehavioralStateTemplates {
  constructor() {
    this.templates = new Map();
    this._initializeTemplates();
  }

  /**
   * Initialize all behavioral state templates
   * @private
   */
  _initializeTemplates() {
    // Warrior archetype - High energy, risk tolerance, low social drive
    this.templates.set('warrior', {
      id: 'warrior_archetype',
      name: 'Warrior',
      description: 'Combat-focused character with high energy and risk tolerance',
      consciousness: {
        frequency: 12.0, // High alertness (beta waves)
        coherence: 0.7,  // High focus and stability
        behavioralState: {
          energy: 0.9,      // High energy for combat
          focus: 0.8,       // Strong concentration
          socialDrive: 0.3, // Low social interest
          riskTolerance: 0.9, // High risk tolerance
          ambition: 0.7     // Driven by achievement
        },
        updateRules: {
          significanceThreshold: 0.4, // Higher threshold for combat focus
          adaptationRate: 1.2,        // Quick adaptation to threats
          stabilityFactor: 0.8        // Less stable under stress
        }
      },
      personalityTraits: ['bravery', 'discipline', 'aggression'],
      cognitiveTraits: ['tactical', 'reactive', 'combat-focused'],
      emotionalTendencies: ['anger', 'determination', 'pride'],
      skills: ['combat', 'athletics', 'endurance', 'weaponry'],
      attributes: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 10,
        wisdom: 12,
        charisma: 11
      },
      background: 'warrior'
    });

    // Merchant archetype - Moderate energy, high social drive, low risk tolerance
    this.templates.set('merchant', {
      id: 'merchant_archetype',
      name: 'Merchant',
      description: 'Trade-focused character with strong social skills and risk aversion',
      consciousness: {
        frequency: 8.0,  // Moderate alertness (alpha waves)
        coherence: 0.8,  // High stability for business
        behavioralState: {
          energy: 0.6,      // Moderate energy
          focus: 0.7,       // Good concentration for deals
          socialDrive: 0.9, // High social engagement
          riskTolerance: 0.2, // Low risk tolerance
          ambition: 0.8     // Business ambition
        },
        updateRules: {
          significanceThreshold: 0.2, // Lower threshold for social/economic events
          adaptationRate: 0.9,        // Slower adaptation
          stabilityFactor: 1.3        // High stability for business
        }
      },
      personalityTraits: ['ambition', 'persuasion', 'caution'],
      cognitiveTraits: ['analytical', 'social', 'business-minded'],
      emotionalTendencies: ['greed', 'anxiety', 'satisfaction'],
      skills: ['negotiation', 'appraisal', 'persuasion', 'mathematics'],
      attributes: {
        strength: 12,
        dexterity: 13,
        constitution: 12,
        intelligence: 14,
        wisdom: 13,
        charisma: 16
      },
      background: 'merchant'
    });

    // Scholar archetype - Low energy, high focus, moderate social drive
    this.templates.set('scholar', {
      id: 'scholar_archetype',
      name: 'Scholar',
      description: 'Intellectual character with deep focus and contemplative nature',
      consciousness: {
        frequency: 6.0,  // Lower frequency (theta waves for deep thought)
        coherence: 0.9,  // Very high stability and focus
        behavioralState: {
          energy: 0.4,      // Low physical energy
          focus: 0.95,      // Extremely focused
          socialDrive: 0.5, // Moderate social engagement
          riskTolerance: 0.4, // Moderate risk tolerance
          ambition: 0.6     // Academic ambition
        },
        updateRules: {
          significanceThreshold: 0.5, // High threshold for intellectual pursuits
          adaptationRate: 0.7,        // Slow adaptation to maintain focus
          stabilityFactor: 1.5        // Very stable for research
        }
      },
      personalityTraits: ['curiosity', 'patience', 'analytical'],
      cognitiveTraits: ['intellectual', 'methodical', 'creative'],
      emotionalTendencies: ['wonder', 'frustration', 'eureka'],
      skills: ['research', 'analysis', 'writing', 'arcana'],
      attributes: {
        strength: 10,
        dexterity: 11,
        constitution: 11,
        intelligence: 17,
        wisdom: 15,
        charisma: 12
      },
      background: 'scholar'
    });

    // Noble archetype - High social drive, moderate risk tolerance, high ambition
    this.templates.set('noble', {
      id: 'noble_archetype',
      name: 'Noble',
      description: 'Aristocratic character with strong social presence and political ambition',
      consciousness: {
        frequency: 9.0,  // High alertness for social/political awareness
        coherence: 0.75, // Good stability with some adaptability
        behavioralState: {
          energy: 0.7,      // Good energy for social activities
          focus: 0.6,       // Moderate focus
          socialDrive: 0.95, // Extremely social
          riskTolerance: 0.6, // Moderate risk tolerance
          ambition: 0.9     // High political ambition
        },
        updateRules: {
          significanceThreshold: 0.25, // Low threshold for social/political events
          adaptationRate: 1.1,         // Quick adaptation to social changes
          stabilityFactor: 1.0         // Balanced stability
        }
      },
      personalityTraits: ['charisma', 'ambition', 'diplomacy'],
      cognitiveTraits: ['strategic', 'social', 'political'],
      emotionalTendencies: ['pride', 'ambition', 'concern'],
      skills: ['diplomacy', 'leadership', 'etiquette', 'politics'],
      attributes: {
        strength: 13,
        dexterity: 12,
        constitution: 13,
        intelligence: 14,
        wisdom: 14,
        charisma: 17
      },
      background: 'noble'
    });

    // Peasant archetype - Moderate energy, low social drive, practical focus
    this.templates.set('peasant', {
      id: 'peasant_archetype',
      name: 'Peasant',
      description: 'Working-class character with practical focus and community ties',
      consciousness: {
        frequency: 7.5, // Moderate alertness
        coherence: 0.6, // Moderate stability
        behavioralState: {
          energy: 0.8,      // High physical energy for work
          focus: 0.5,       // Practical focus
          socialDrive: 0.6, // Moderate social engagement
          riskTolerance: 0.5, // Balanced risk tolerance
          ambition: 0.4     // Low ambition, focused on survival
        },
        updateRules: {
          significanceThreshold: 0.35, // Moderate threshold
          adaptationRate: 1.0,         // Standard adaptation
          stabilityFactor: 1.1         // Slightly more stable
        }
      },
      personalityTraits: ['practical', 'community-minded', 'resilient'],
      cognitiveTraits: ['practical', 'traditional', 'survival-focused'],
      emotionalTendencies: ['contentment', 'worry', 'community-pride'],
      skills: ['farming', 'craftsmanship', 'survival', 'endurance'],
      attributes: {
        strength: 15,
        dexterity: 12,
        constitution: 16,
        intelligence: 11,
        wisdom: 13,
        charisma: 12
      },
      background: 'peasant'
    });

    // Priest/Cleric archetype - High coherence, moderate social drive, spiritual focus
    this.templates.set('priest', {
      id: 'priest_archetype',
      name: 'Priest',
      description: 'Spiritual character with high moral focus and community guidance',
      consciousness: {
        frequency: 5.5, // Lower frequency for contemplation
        coherence: 0.85, // High stability and moral certainty
        behavioralState: {
          energy: 0.5,      // Moderate energy
          focus: 0.8,       // Strong spiritual focus
          socialDrive: 0.7, // Good community engagement
          riskTolerance: 0.3, // Low risk tolerance (moral caution)
          ambition: 0.5     // Moderate spiritual ambition
        },
        updateRules: {
          significanceThreshold: 0.3, // Standard threshold
          adaptationRate: 0.8,        // Slower adaptation for moral consistency
          stabilityFactor: 1.4        // High stability for moral framework
        }
      },
      personalityTraits: ['compassion', 'wisdom', 'devotion'],
      cognitiveTraits: ['moral', 'spiritual', 'guiding'],
      emotionalTendencies: ['compassion', 'serenity', 'zeal'],
      skills: ['religion', 'healing', 'counseling', 'ritual'],
      attributes: {
        strength: 12,
        dexterity: 11,
        constitution: 13,
        intelligence: 13,
        wisdom: 17,
        charisma: 15
      },
      background: 'priest'
    });

    // Rogue/Thief archetype - High risk tolerance, low coherence, opportunistic
    this.templates.set('rogue', {
      id: 'rogue_archetype',
      name: 'Rogue',
      description: 'Opportunistic character with high adaptability and risk-taking',
      consciousness: {
        frequency: 11.0, // High alertness for opportunities
        coherence: 0.4,  // Low stability, highly adaptable
        behavioralState: {
          energy: 0.75,     // Good energy for quick actions
          focus: 0.6,       // Moderate focus
          socialDrive: 0.4, // Low social engagement
          riskTolerance: 0.95, // Very high risk tolerance
          ambition: 0.7     // Personal gain ambition
        },
        updateRules: {
          significanceThreshold: 0.2, // Low threshold for opportunities
          adaptationRate: 1.5,        // Very quick adaptation
          stabilityFactor: 0.6        // Low stability, opportunistic
        }
      },
      personalityTraits: ['cunning', 'opportunistic', 'independent'],
      cognitiveTraits: ['opportunistic', 'deceptive', 'quick-thinking'],
      emotionalTendencies: ['excitement', 'paranoia', 'triumph'],
      skills: ['stealth', 'deception', 'thievery', 'acrobatics'],
      attributes: {
        strength: 12,
        dexterity: 17,
        constitution: 13,
        intelligence: 14,
        wisdom: 12,
        charisma: 13
      },
      background: 'rogue'
    });

    // Mage/Wizard archetype - Very high focus, low energy, intellectual
    this.templates.set('mage', {
      id: 'mage_archetype',
      name: 'Mage',
      description: 'Magical character with intense intellectual focus and mystical tendencies',
      consciousness: {
        frequency: 4.5, // Very low frequency for deep magical contemplation
        coherence: 0.9, // Extremely high stability and focus
        behavioralState: {
          energy: 0.3,      // Low physical energy
          focus: 0.98,      // Near-total concentration
          socialDrive: 0.3, // Low social interest
          riskTolerance: 0.7, // High risk tolerance for magical experimentation
          ambition: 0.8     // High magical ambition
        },
        updateRules: {
          significanceThreshold: 0.6, // High threshold for magical significance
          adaptationRate: 0.6,        // Very slow adaptation to maintain focus
          stabilityFactor: 1.6        // Extremely stable for magical work
        }
      },
      personalityTraits: ['mystical', 'brilliant', 'eccentric'],
      cognitiveTraits: ['arcane', 'analytical', 'creative'],
      emotionalTendencies: ['wonder', 'obsession', 'enlightenment'],
      skills: ['arcana', 'spellcasting', 'research', 'concentration'],
      attributes: {
        strength: 9,
        dexterity: 12,
        constitution: 11,
        intelligence: 18,
        wisdom: 15,
        charisma: 14
      },
      background: 'mage'
    });
  }

  /**
   * Get a behavioral state template by archetype
   * @param {string} archetype - The archetype name (warrior, merchant, etc.)
   * @returns {Object|null} The behavioral state template or null if not found
   */
  getTemplate(archetype) {
    return this.templates.get(archetype) || null;
  }

  /**
   * Get all available archetypes
   * @returns {Array} Array of archetype names
   */
  getAvailableArchetypes() {
    return Array.from(this.templates.keys());
  }

  /**
   * Get all behavioral state templates
   * @returns {Array} Array of all templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Create a custom behavioral state template
   * @param {string} archetype - The archetype name
   * @param {Object} config - Custom configuration
   * @returns {Object} The created template
   */
  createCustomTemplate(archetype, config) {
    const baseTemplate = this.getTemplate(archetype);
    if (!baseTemplate) {
      throw new Error(`Unknown archetype: ${archetype}`);
    }

    const customTemplate = {
      ...baseTemplate,
      ...config,
      id: `${archetype}_custom_${Date.now()}`,
      name: config.name || `${baseTemplate.name} (Custom)`,
      description: config.description || `Custom ${baseTemplate.name} archetype`
    };

    this.templates.set(archetype, customTemplate);
    return customTemplate;
  }

  /**
   * Get consciousness parameters for a specific archetype
   * @param {string} archetype - The archetype name
   * @returns {Object|null} Consciousness configuration or null if not found
   */
  getConsciousnessConfig(archetype) {
    const template = this.getTemplate(archetype);
    return template ? template.consciousness : null;
  }

  /**
   * Get behavioral state parameters for a specific archetype
   * @param {string} archetype - The archetype name
   * @returns {Object|null} Behavioral state configuration or null if not found
   */
  getBehavioralState(archetype) {
    const consciousness = this.getConsciousnessConfig(archetype);
    return consciousness ? consciousness.behavioralState : null;
  }

  /**
   * Validate a behavioral state configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateConfig(config) {
    const errors = [];

    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors };
    }

    // Validate consciousness parameters
    if (config.consciousness) {
      const c = config.consciousness;

      if (c.frequency !== undefined) {
        if (typeof c.frequency !== 'number' || c.frequency < 3.0 || c.frequency > 15.0) {
          errors.push('Consciousness frequency must be between 3.0 and 15.0');
        }
      }

      if (c.coherence !== undefined) {
        if (typeof c.coherence !== 'number' || c.coherence < 0.2 || c.coherence > 1.0) {
          errors.push('Consciousness coherence must be between 0.2 and 1.0');
        }
      }

      // Validate behavioral state parameters
      if (c.behavioralState) {
        const bs = c.behavioralState;
        const behavioralParams = ['energy', 'focus', 'socialDrive', 'riskTolerance', 'ambition'];

        behavioralParams.forEach(param => {
          if (bs[param] !== undefined) {
            if (typeof bs[param] !== 'number' || bs[param] < 0.0 || bs[param] > 1.0) {
              errors.push(`${param} must be between 0.0 and 1.0`);
            }
          }
        });
      }

      // Validate update rules
      if (c.updateRules) {
        const ur = c.updateRules;

        if (ur.significanceThreshold !== undefined) {
          if (typeof ur.significanceThreshold !== 'number' || ur.significanceThreshold < 0.0 || ur.significanceThreshold > 1.0) {
            errors.push('Significance threshold must be between 0.0 and 1.0');
          }
        }

        if (ur.adaptationRate !== undefined) {
          if (typeof ur.adaptationRate !== 'number' || ur.adaptationRate < 0.1 || ur.adaptationRate > 2.0) {
            errors.push('Adaptation rate must be between 0.1 and 2.0');
          }
        }

        if (ur.stabilityFactor !== undefined) {
          if (typeof ur.stabilityFactor !== 'number' || ur.stabilityFactor < 0.1 || ur.stabilityFactor > 2.0) {
            errors.push('Stability factor must be between 0.1 and 2.0');
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get archetype recommendations based on character attributes
   * @param {Object} character - Character with attributes and personality
   * @returns {Array} Array of recommended archetypes with match scores
   */
  getArchetypeRecommendations(character) {
    const recommendations = [];

    this.templates.forEach((template, archetype) => {
      let matchScore = 0;
      let totalFactors = 0;

      // Compare attributes
      if (character.attributes && template.attributes) {
        Object.keys(template.attributes).forEach(attr => {
          if (character.attributes[attr] && template.attributes[attr] > 0) {
            const charValue = character.attributes[attr];
            const templateValue = template.attributes[attr];
            const difference = Math.abs(charValue - templateValue);
            matchScore += (20 - difference) / 20; // Score from 0-1 based on difference
            totalFactors++;
          }
        });
      }

      // Compare personality traits
      if (character.personality && template.personalityTraits) {
        template.personalityTraits.forEach(trait => {
          if (character.personality.hasTrait && character.personality.hasTrait(trait)) {
            matchScore += 1;
            totalFactors++;
          }
        });
      }

      if (totalFactors > 0) {
        const averageScore = matchScore / totalFactors;
        recommendations.push({
          archetype,
          name: template.name,
          matchScore: averageScore,
          description: template.description
        });
      }
    });

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }
}

// Export singleton instance
const behavioralStateTemplates = new BehavioralStateTemplates();
export default behavioralStateTemplates;