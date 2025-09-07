// src/domain/services/SettlementFamilyService.js

import BaseDomainService from './BaseDomainService.js';
import FamilyDecisionService from './FamilyDecisionService.js';
import ChildGenerationService from './ChildGenerationService.js';

/**
 * Settlement Family Service
 * 
 * Manages family formation, marriage decisions, and procreation within settlements.
 * Integrates with existing settlement systems and population management.
 */
class SettlementFamilyService extends BaseDomainService {
  constructor(worldBuilder = null) {
    super();
    this.familyDecisionService = new FamilyDecisionService();
    this.childGenerationService = new ChildGenerationService();
    this.worldBuilder = worldBuilder;
  }

  /**
   * Process family formation for a settlement during a turn
   * @param {Object} settlement - Settlement object
   * @param {number} turn - Current turn number
   * @param {Object} options - Processing options
   * @returns {Object} - Results with marriages and births
   */
  processFamilyFormation(settlement, turn, options = {}) {
    if (!settlement || !settlement.assignedCharacters) {
      throw new Error('Settlement must have assignedCharacters array');
    }

    const {
      marriageRate = 0.3,          // Percentage of eligible singles who might marry
      procreationRate = 0.8,       // Percentage of couples who consider children
      minimumMarriageAge = 18,
      maximumChildbearingAge = 45,
      minimumCourtshipPeriod = 1,  // Turns
      debug = false
    } = options;

    if (debug) {
      console.log(`\n=== Processing Family Formation for ${settlement.name} (Turn ${turn}) ===`);
    }

    // Get all characters in settlement
    const characters = this.getSettlementCharacters(settlement);
    
    // Process marriages
    const eligibleSingles = this.getEligibleSingles(characters, minimumMarriageAge);
    const marriages = this.processMarriageDecisions(
      eligibleSingles, 
      settlement, 
      { marriageRate, minimumCourtshipPeriod, debug }
    );
    
    // Formalize marriages
    marriages.forEach(marriage => {
      this.formalizeMarriage(marriage.partner1, marriage.partner2, settlement);
      this.recordHistoricalEvent('marriage', marriage, settlement, turn);
    });
    
    // Process procreation
    const marriedCouples = this.getMarriedCouples(characters, maximumChildbearingAge);
    const births = this.processProcreationDecisions(
      marriedCouples, 
      settlement, 
      { procreationRate, debug }
    );
    
    // Generate children and update population
    births.forEach(birth => {
      const child = this.childGenerationService.generateChild(
        birth.parent1, 
        birth.parent2, 
        settlement
      );
      
      // Add child to settlement and world
      this.addChildToSettlement(child, settlement);
      this.recordHistoricalEvent('birth', { ...birth, child }, settlement, turn);
    });

    if (debug) {
      console.log(`Results: ${marriages.length} marriages, ${births.length} births`);
      console.log(`Population change: ${settlement.population.total} -> ${settlement.population.total + births.length}`);
    }
    
    return { 
      marriages, 
      births, 
      populationGrowth: births.length,
      newPopulation: settlement.population.total
    };
  }

  /**
   * Get all characters in a settlement
   * @param {Object} settlement - Settlement object
   * @returns {Array} - Array of character objects
   */
  getSettlementCharacters(settlement) {
    if (!this.worldBuilder) {
      console.warn('WorldBuilder not available, using empty character list');
      return [];
    }

    const allCharacters = this.worldBuilder.getAllCharacters();
    return settlement.assignedCharacters
      .map(charId => allCharacters.find(char => char.id === charId))
      .filter(char => char != null);
  }

  /**
   * Get eligible single characters for marriage
   * @param {Array} characters - All characters in settlement
   * @param {number} minimumAge - Minimum age for marriage
   * @returns {Array} - Eligible single characters
   */
  getEligibleSingles(characters, minimumAge = 18) {
    return characters.filter(char => {
      // Must be of age
      if (char.age < minimumAge) return false;
      
      // Must not be already married
      if (char.relationshipStatus === 'married') return false;
      
      // Must not have recent marriage (cooldown period)
      if (char.lastMarriageAttempt && 
          char.lastMarriageAttempt.turn && 
          (Date.now() - char.lastMarriageAttempt.turn) < 3) {
        return false;
      }
      
      // Must be alive and healthy enough
      if (char.health < 50) return false;
      
      return true;
    });
  }

  /**
   * Process marriage decisions for eligible singles
   * @param {Array} eligibleSingles - Eligible single characters
   * @param {Object} settlement - Settlement context
   * @param {Object} options - Processing options
   * @returns {Array} - Array of marriage objects
   */
  processMarriageDecisions(eligibleSingles, settlement, options = {}) {
    const { marriageRate = 0.3, debug = false } = options;
    const marriages = [];
    const processed = new Set();

    // Shuffle to ensure random pairing order
    const shuffledSingles = [...eligibleSingles].sort(() => Math.random() - 0.5);

    for (const character of shuffledSingles) {
      if (processed.has(character.id)) continue;
      
      // Random chance to seek marriage this turn
      if (Math.random() > marriageRate) continue;

      // Find potential partners
      const potentialPartners = shuffledSingles.filter(other => 
        other.id !== character.id && 
        !processed.has(other.id) &&
        this.isValidPartnerMatch(character, other)
      );

      if (potentialPartners.length === 0) continue;

      // Evaluate compatibility with potential partners
      const compatibilityScores = potentialPartners.map(partner => ({
        partner,
        compatibility: this.familyDecisionService.evaluateMarriageCompatibility(
          character, partner, settlement
        )
      }));

      // Sort by compatibility score
      compatibilityScores.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

      // Take the best match if compatibility is above threshold
      const bestMatch = compatibilityScores[0];
      if (bestMatch && bestMatch.compatibility.overallScore > 0.6) {
        marriages.push({
          partner1: character,
          partner2: bestMatch.partner,
          compatibility: bestMatch.compatibility,
          settlementId: settlement.id,
          timestamp: Date.now()
        });

        processed.add(character.id);
        processed.add(bestMatch.partner.id);

        if (debug) {
          console.log(`Marriage planned: ${character.name} + ${bestMatch.partner.name} (compatibility: ${bestMatch.compatibility.overallScore.toFixed(2)})`);
        }
      }
    }

    return marriages;
  }

  /**
   * Check if two characters are a valid match for marriage
   * @param {Object} char1 - First character
   * @param {Object} char2 - Second character
   * @returns {boolean} - Whether they can be matched
   */
  isValidPartnerMatch(char1, char2) {
    // Basic validation
    if (!char1 || !char2) return false;
    
    // Age compatibility (within reasonable range)
    const ageDiff = Math.abs(char1.age - char2.age);
    if (ageDiff > 15) return false;
    
    // No family relationships
    if (char1.relationships && char1.relationships.has(char2.id)) {
      const relationship = char1.relationships.get(char2.id);
      if (relationship.type === 'family') return false;
    }
    
    // Both must be available
    if (char1.relationshipStatus === 'married' || char2.relationshipStatus === 'married') {
      return false;
    }
    
    return true;
  }

  /**
   * Formalize a marriage between two characters
   * @param {Object} partner1 - First partner
   * @param {Object} partner2 - Second partner
   * @param {Object} settlement - Settlement context
   */
  formalizeMarriage(partner1, partner2, settlement) {
    // Update relationship status
    partner1.relationshipStatus = 'married';
    partner2.relationshipStatus = 'married';
    
    // Create marriage relationship
    if (!partner1.relationships) partner1.relationships = new Map();
    if (!partner2.relationships) partner2.relationships = new Map();
    
    const marriageRelationship = {
      value: 80, // High starting relationship value
      type: 'marriage',
      history: [{
        timestamp: Date.now(),
        change: 80,
        reason: 'marriage ceremony',
        location: settlement.name
      }]
    };
    
    partner1.relationships.set(partner2.id, { ...marriageRelationship });
    partner2.relationships.set(partner1.id, { ...marriageRelationship });
    
    // Update partner references
    partner1.marriagePartner = partner2.id;
    partner2.marriagePartner = partner1.id;
    
    // Marriage may affect settlement happiness/stability
    if (settlement.socialFactors) {
      settlement.socialFactors.happiness = Math.min(100, 
        (settlement.socialFactors.happiness || 70) + 2
      );
    }
  }

  /**
   * Get married couples in settlement
   * @param {Array} characters - All characters in settlement
   * @param {number} maxAge - Maximum age for childbearing
   * @returns {Array} - Array of married couple arrays [partner1, partner2]
   */
  getMarriedCouples(characters, maxAge = 45) {
    const couples = [];
    const processed = new Set();

    for (const character of characters) {
      if (processed.has(character.id)) continue;
      if (character.relationshipStatus !== 'married') continue;
      if (!character.marriagePartner) continue;
      
      const partner = characters.find(c => c.id === character.marriagePartner);
      if (!partner) continue;
      
      // Check if either partner is within childbearing age
      if (character.age > maxAge && partner.age > maxAge) continue;
      
      couples.push([character, partner]);
      processed.add(character.id);
      processed.add(partner.id);
    }

    return couples;
  }

  /**
   * Process procreation decisions for married couples
   * @param {Array} marriedCouples - Array of married couple arrays
   * @param {Object} settlement - Settlement context
   * @param {Object} options - Processing options
   * @returns {Array} - Array of birth decisions
   */
  processProcreationDecisions(marriedCouples, settlement, options = {}) {
    const { procreationRate = 0.8, debug = false } = options;
    const births = [];

    for (const couple of marriedCouples) {
      // Random chance to consider procreation this turn
      if (Math.random() > procreationRate) continue;

      // Check if couple already has recent children (spacing)
      if (this.hasRecentChild(couple, 2)) continue; // 2 turn spacing

      try {
        const decision = this.familyDecisionService.evaluateProcreationDecision(
          couple, 
          settlement
        );

        if (decision.decision) {
          births.push({
            parent1: couple[0],
            parent2: couple[1],
            decision,
            settlementId: settlement.id,
            timestamp: Date.now()
          });

          if (debug) {
            console.log(`Birth planned: ${couple[0].name} + ${couple[1].name} -> child (probability: ${decision.probability.toFixed(2)})`);
          }
        } else if (debug) {
          console.log(`Birth declined: ${couple[0].name} + ${couple[1].name} (probability: ${decision.probability.toFixed(2)})`);
        }
      } catch (error) {
        console.warn(`Error evaluating procreation for couple ${couple[0].name} + ${couple[1].name}:`, error.message);
      }
    }

    return births;
  }

  /**
   * Check if a couple has had a recent child
   * @param {Array} couple - Married couple array
   * @param {number} spacing - Minimum turns between children
   * @returns {boolean} - Whether they have a recent child
   */
  hasRecentChild(couple, spacing = 2) {
    const [parent1, parent2] = couple;
    
    // Check both parents for recent children
    for (const parent of [parent1, parent2]) {
      if (parent.lastChildBirth && 
          parent.lastChildBirth.turn && 
          (Date.now() - parent.lastChildBirth.turn) < spacing) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Add child to settlement and world
   * @param {Character} child - Generated child character
   * @param {Object} settlement - Settlement object
   */
  addChildToSettlement(child, settlement) {
    // Update settlement population
    settlement.population.total += 1;
    settlement.assignedCharacters.push(child.id);
    
    // Add to world if WorldBuilder available
    if (this.worldBuilder) {
      this.worldBuilder.addCharacter(child);
    }
    
    // Update population demographics
    if (settlement.demographics) {
      settlement.demographics.children = (settlement.demographics.children || 0) + 1;
      settlement.demographics.ageDistribution = settlement.demographics.ageDistribution || {};
      settlement.demographics.ageDistribution['0-5'] = 
        (settlement.demographics.ageDistribution['0-5'] || 0) + 1;
    }
    
    // Update parent records
    child.relationships.forEach((relationship, parentId) => {
      if (relationship.type === 'family') {
        const parent = this.worldBuilder?.getAllCharacters().find(c => c.id === parentId);
        if (parent) {
          parent.lastChildBirth = {
            childId: child.id,
            turn: Date.now(),
            settlement: settlement.id
          };
          
          // Update parent's children count
          parent.childrenCount = (parent.childrenCount || 0) + 1;
        }
      }
    });
  }

  /**
   * Record a historical event
   * @param {string} eventType - Type of event ('marriage' or 'birth')
   * @param {Object} eventData - Event data
   * @param {Object} settlement - Settlement context
   * @param {number} turn - Current turn number
   */
  recordHistoricalEvent(eventType, eventData, settlement, turn) {
    if (!settlement.history) {
      settlement.history = [];
    }

    const event = {
      id: this.generateEventId(),
      type: eventType,
      turn,
      timestamp: Date.now(),
      settlementId: settlement.id,
      settlementName: settlement.name,
      data: eventData
    };

    if (eventType === 'marriage') {
      event.description = `${eventData.partner1.name} married ${eventData.partner2.name}`;
      event.participants = [eventData.partner1.id, eventData.partner2.id];
      event.significance = 'minor';
    } else if (eventType === 'birth') {
      event.description = `${eventData.parent1.name} and ${eventData.parent2.name} had a child: ${eventData.child?.name || 'Unknown'}`;
      event.participants = [eventData.parent1.id, eventData.parent2.id];
      if (eventData.child) {
        event.participants.push(eventData.child.id);
      }
      event.significance = 'minor';
    }

    settlement.history.push(event);

    // Keep history manageable (last 100 events)
    if (settlement.history.length > 100) {
      settlement.history = settlement.history.slice(-100);
    }
  }

  /**
   * Generate unique event ID
   * @returns {string} - Unique event identifier
   */
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get family formation statistics for a settlement
   * @param {Object} settlement - Settlement object
   * @param {number} turnsToAnalyze - Number of recent turns to analyze
   * @returns {Object} - Family formation statistics
   */
  getFamilyFormationStats(settlement, turnsToAnalyze = 10) {
    if (!settlement.history) {
      return {
        totalMarriages: 0,
        totalBirths: 0,
        marriages: 0,
        births: 0,
        marriageRate: 0,
        birthRate: 0,
        populationGrowth: 0,
        averageMarriagesPerTurn: 0,
        averageBirthsPerTurn: 0
      };
    }

    // Get the most recent turn from history or assume current turn
    const currentTurn = Math.max(...settlement.history.map(e => e.turn || 0), 0);
    const earliestTurn = Math.max(0, currentTurn - turnsToAnalyze + 1);
    
    const recentEvents = settlement.history.filter(event => 
      event.turn && event.turn >= earliestTurn
    );

    const marriages = recentEvents.filter(e => e.type === 'marriage').length;
    const births = recentEvents.filter(e => e.type === 'birth').length;
    
    const totalPopulation = settlement.population.total || 1;
    
    return {
      totalMarriages: marriages,
      totalBirths: births,
      marriages,
      births,
      marriageRate: (marriages / totalPopulation) * 100,
      birthRate: (births / totalPopulation) * 100,
      populationGrowth: births,
      averageMarriagesPerTurn: marriages / turnsToAnalyze,
      averageBirthsPerTurn: births / turnsToAnalyze
    };
  }

  /**
   * Process population aging (separate from family formation)
   * @param {Object} settlement - Settlement object
   * @param {number} turn - Current turn number
   */
  processPopulationAging(settlement, turn) {
    const characters = this.getSettlementCharacters(settlement);
    
    characters.forEach(character => {
      // Age characters (assuming 1 turn = 1 year for simplicity)
      character.age += 1;
      
      // Handle mortality (very simplified)
      if (character.age > 80 && Math.random() < 0.1) {
        this.handleCharacterDeath(character, settlement, turn);
      }
    });
  }

  /**
   * Handle character death (placeholder for mortality system)
   * @param {Object} character - Character who died
   * @param {Object} settlement - Settlement context
   * @param {number} turn - Current turn number
   */
  handleCharacterDeath(character, settlement, turn) {
    // Remove from settlement
    const charIndex = settlement.assignedCharacters.indexOf(character.id);
    if (charIndex >= 0) {
      settlement.assignedCharacters.splice(charIndex, 1);
      settlement.population.total -= 1;
    }
    
    // Record death event
    this.recordHistoricalEvent('death', {
      character: character,
      age: character.age,
      cause: 'old age'
    }, settlement, turn);
    
    // Handle inheritance and family impact (could be expanded)
    if (character.marriagePartner) {
      const partner = this.getSettlementCharacters(settlement)
        .find(c => c.id === character.marriagePartner);
      if (partner) {
        partner.relationshipStatus = 'widowed';
        partner.marriagePartner = null;
      }
    }
  }
}

export default SettlementFamilyService;
