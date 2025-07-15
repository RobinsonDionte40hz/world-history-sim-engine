// src/domain/services/InfluenceService.js

import { Influence } from '../value-objects/Influence.js';

/**
 * Domain service for handling influence evolution and settlement-based changes
 * Provides business logic for how influence changes over time and in response to settlement events
 */
class InfluenceService {
  /**
   * Update influence based on settlement-based changes
   * @param {Influence} influence - Current influence state
   * @param {Object} settlement - Settlement where the influence change occurs
   * @param {Object} event - Event that triggers the influence change
   * @param {Object} character - Character whose influence is being updated
   * @returns {Influence} New influence state after settlement-based update
   */
  updateInfluence(influence, settlement, event, character = {}) {
    this._validateInfluence(influence);
    this._validateSettlement(settlement);
    this._validateEvent(event);
    
    // Calculate influence changes based on the event and settlement context
    const influenceChanges = this._calculateSettlementEventChanges(
      influence,
      settlement,
      event,
      character
    );
    
    // Apply all calculated changes
    let updatedInfluence = influence;
    for (const change of influenceChanges) {
      const settlementContext = {
        settlementId: settlement.id,
        settlementName: settlement.name,
        settlementType: settlement.type,
        eventType: event.type,
        eventDescription: event.description,
        settlementData: new Map([
          ['population', settlement.population],
          ['prosperity', settlement.prosperity],
          ['stability', settlement.stability]
        ])
      };
      
      updatedInfluence = updatedInfluence.withChange(
        change.domainId,
        change.amount,
        change.reason,
        settlementContext
      );
    }
    
    return updatedInfluence;
  }
  
  /**
   * Calculate influence decay over time
   * @param {Influence} influence - Current influence state
   * @param {number} timeElapsed - Time elapsed in days
   * @param {Object} character - Character whose influence is decaying
   * @param {Array} activeSettlements - Settlements where character is active
   * @returns {Influence} New influence state after applying temporal degradation
   */
  calculateInfluenceDecay(influence, timeElapsed, character = {}, activeSettlements = []) {
    this._validateInfluence(influence);
    
    if (timeElapsed <= 0) {
      return influence;
    }
    
    // Calculate decay for each domain
    const decayChanges = this._calculateTemporalDecay(
      influence,
      timeElapsed,
      character,
      activeSettlements
    );
    
    // Apply decay changes
    let decayedInfluence = influence;
    for (const decay of decayChanges) {
      decayedInfluence = decayedInfluence.withChange(
        decay.domainId,
        decay.amount,
        decay.reason
      );
    }
    
    return decayedInfluence;
  }
  
  /**
   * Apply multiple settlement events in bulk
   * @param {Influence} influence - Current influence state
   * @param {Array} settlementEvents - Array of settlement events to process
   * @param {Object} character - Character whose influence is being updated
   * @returns {Influence} New influence state after processing all events
   */
  applySettlementEvents(influence, settlementEvents, character = {}) {
    this._validateInfluence(influence);
    
    if (!Array.isArray(settlementEvents)) {
      throw new Error('Settlement events must be an array');
    }
    
    let processedInfluence = influence;
    
    // Process events in chronological order
    const sortedEvents = settlementEvents.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    for (const eventData of sortedEvents) {
      if (eventData.settlement && eventData.event) {
        processedInfluence = this.updateInfluence(
          processedInfluence,
          eventData.settlement,
          eventData.event,
          character
        );
      }
    }
    
    return processedInfluence;
  }
  
  /**
   * Calculate influence changes based on character actions in settlements
   * @param {Influence} influence - Current influence state
   * @param {Object} action - Action performed by the character
   * @param {Object} settlement - Settlement where action was performed
   * @param {Object} character - Character performing the action
   * @returns {Influence} New influence state after applying action effects
   */
  applyCharacterAction(influence, action, settlement, character = {}) {
    this._validateInfluence(influence);
    this._validateSettlement(settlement);
    this._validateAction(action);
    
    const actionChanges = this._calculateActionInfluenceChanges(
      influence,
      action,
      settlement,
      character
    );
    
    let actionInfluence = influence;
    for (const change of actionChanges) {
      const actionContext = {
        settlementId: settlement.id,
        settlementName: settlement.name,
        actionType: action.type,
        actionDescription: action.description,
        actionSuccess: action.success || false,
        settlementData: new Map([
          ['population', settlement.population],
          ['relationshipLevel', settlement.relationshipLevel || 0]
        ])
      };
      
      actionInfluence = actionInfluence.withChange(
        change.domainId,
        change.amount,
        change.reason,
        actionContext
      );
    }
    
    return actionInfluence;
  }
  
  /**
   * Analyze influence distribution across domains
   * @param {Influence} influence - Current influence state
   * @returns {Object} Analysis of influence distribution
   */
  analyzeInfluenceDistribution(influence) {
    this._validateInfluence(influence);
    
    const summary = influence.getSummary();
    const domainIds = influence.getDomainIds();
    
    const analysis = {
      totalInfluence: 0,
      averageInfluence: 0,
      dominantDomains: [],
      weakDomains: [],
      balanceScore: 0,
      tierDistribution: {}
    };
    
    // Calculate totals and averages
    const values = domainIds.map(id => influence.getValue(id));
    analysis.totalInfluence = values.reduce((sum, val) => sum + val, 0);
    analysis.averageInfluence = values.length > 0 ? analysis.totalInfluence / values.length : 0;
    
    // Find dominant and weak domains
    const sortedDomains = domainIds
      .map(id => ({ id, value: influence.getValue(id), tier: influence.getTier(id) }))
      .sort((a, b) => b.value - a.value);
    
    analysis.dominantDomains = sortedDomains.slice(0, Math.ceil(sortedDomains.length / 3));
    analysis.weakDomains = sortedDomains.slice(-Math.ceil(sortedDomains.length / 3));
    
    // Calculate balance score (lower is more balanced)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - analysis.averageInfluence, 2), 0) / values.length;
    analysis.balanceScore = Math.sqrt(variance);
    
    // Tier distribution
    for (const domainId of domainIds) {
      const tier = influence.getTier(domainId);
      const tierName = tier ? tier.name : 'Unknown';
      analysis.tierDistribution[tierName] = (analysis.tierDistribution[tierName] || 0) + 1;
    }
    
    return analysis;
  }
  
  /**
   * Private helper methods
   */
  
  _calculateSettlementEventChanges(influence, settlement, event, character) {
    const changes = [];
    
    // Different types of settlement events affect influence differently
    switch (event.type) {
      case 'political_event':
        changes.push(...this._calculatePoliticalEventChanges(influence, settlement, event, character));
        break;
      case 'economic_event':
        changes.push(...this._calculateEconomicEventChanges(influence, settlement, event, character));
        break;
      case 'social_event':
        changes.push(...this._calculateSocialEventChanges(influence, settlement, event, character));
        break;
      case 'military_event':
        changes.push(...this._calculateMilitaryEventChanges(influence, settlement, event, character));
        break;
      case 'cultural_event':
        changes.push(...this._calculateCulturalEventChanges(influence, settlement, event, character));
        break;
      default:
        changes.push(...this._calculateGenericEventChanges(influence, settlement, event, character));
    }
    
    return changes;
  }
  
  _calculatePoliticalEventChanges(influence, settlement, event, character) {
    const changes = [];
    const eventIntensity = event.intensity || 1;
    const characterRole = character.role || 'citizen';
    
    // Political events primarily affect political influence
    if (influence.hasDomain('political')) {
      let changeAmount = 0;
      
      switch (event.subtype) {
        case 'election':
          changeAmount = characterRole === 'leader' ? 15 * eventIntensity : 5 * eventIntensity;
          break;
        case 'policy_change':
          changeAmount = characterRole === 'advisor' ? 10 * eventIntensity : 3 * eventIntensity;
          break;
        case 'scandal':
          changeAmount = characterRole === 'politician' ? -20 * eventIntensity : -2 * eventIntensity;
          break;
        default:
          changeAmount = 2 * eventIntensity;
      }
      
      if (changeAmount !== 0) {
        changes.push({
          domainId: 'political',
          amount: this._clamp(changeAmount, -30, 30),
          reason: `Political event in ${settlement.name}: ${event.description}`
        });
      }
    }
    
    // Political events can also affect social influence
    if (influence.hasDomain('social') && Math.abs(eventIntensity) > 1) {
      const socialChange = eventIntensity * (characterRole === 'leader' ? 5 : 2);
      changes.push({
        domainId: 'social',
        amount: this._clamp(socialChange, -15, 15),
        reason: `Social impact of political event: ${event.description}`
      });
    }
    
    return changes;
  }
  
  _calculateEconomicEventChanges(influence, settlement, event, character) {
    const changes = [];
    const eventIntensity = event.intensity || 1;
    const characterWealth = character.wealth || 0;
    const characterRole = character.role || 'citizen';
    
    // Economic events primarily affect economic influence
    if (influence.hasDomain('economic')) {
      let changeAmount = 0;
      
      switch (event.subtype) {
        case 'trade_boom':
          changeAmount = (characterRole === 'merchant' ? 20 : 8) * eventIntensity;
          break;
        case 'market_crash':
          changeAmount = -(characterWealth > 100 ? 15 : 5) * eventIntensity;
          break;
        case 'new_trade_route':
          changeAmount = (characterRole === 'trader' ? 12 : 4) * eventIntensity;
          break;
        case 'resource_discovery':
          changeAmount = 6 * eventIntensity;
          break;
        default:
          changeAmount = 3 * eventIntensity;
      }
      
      if (changeAmount !== 0) {
        changes.push({
          domainId: 'economic',
          amount: this._clamp(changeAmount, -25, 25),
          reason: `Economic event in ${settlement.name}: ${event.description}`
        });
      }
    }
    
    return changes;
  }
  
  _calculateSocialEventChanges(influence, settlement, event, character) {
    const changes = [];
    const eventIntensity = event.intensity || 1;
    const characterCharisma = character.charisma || 0;
    
    // Social events primarily affect social influence
    if (influence.hasDomain('social')) {
      let changeAmount = 0;
      
      switch (event.subtype) {
        case 'festival':
          changeAmount = (5 + characterCharisma) * eventIntensity;
          break;
        case 'public_speech':
          changeAmount = (8 + characterCharisma * 2) * eventIntensity;
          break;
        case 'social_scandal':
          changeAmount = -(10 + characterCharisma) * eventIntensity;
          break;
        case 'community_service':
          changeAmount = (6 + characterCharisma) * eventIntensity;
          break;
        default:
          changeAmount = (2 + characterCharisma * 0.5) * eventIntensity;
      }
      
      if (changeAmount !== 0) {
        changes.push({
          domainId: 'social',
          amount: this._clamp(changeAmount, -20, 20),
          reason: `Social event in ${settlement.name}: ${event.description}`
        });
      }
    }
    
    return changes;
  }
  
  _calculateMilitaryEventChanges(influence, settlement, event, character) {
    const changes = [];
    const eventIntensity = event.intensity || 1;
    const characterRole = character.role || 'citizen';
    const militaryRank = character.militaryRank || 0;
    
    // Military events primarily affect military influence
    if (influence.hasDomain('military')) {
      let changeAmount = 0;
      
      switch (event.subtype) {
        case 'battle_victory':
          changeAmount = (10 + militaryRank * 5) * eventIntensity;
          break;
        case 'battle_defeat':
          changeAmount = -(8 + militaryRank * 3) * eventIntensity;
          break;
        case 'military_promotion':
          changeAmount = 15 * eventIntensity;
          break;
        case 'defense_success':
          changeAmount = (12 + militaryRank * 2) * eventIntensity;
          break;
        default:
          changeAmount = (characterRole === 'soldier' ? 5 : 2) * eventIntensity;
      }
      
      if (changeAmount !== 0) {
        changes.push({
          domainId: 'military',
          amount: this._clamp(changeAmount, -30, 30),
          reason: `Military event in ${settlement.name}: ${event.description}`
        });
      }
    }
    
    // Military events can affect political influence for leaders
    if (influence.hasDomain('political') && (characterRole === 'leader' || militaryRank > 5)) {
      const politicalChange = eventIntensity * (event.subtype === 'battle_victory' ? 8 : -4);
      changes.push({
        domainId: 'political',
        amount: this._clamp(politicalChange, -15, 15),
        reason: `Political impact of military event: ${event.description}`
      });
    }
    
    return changes;
  }
  
  _calculateCulturalEventChanges(influence, settlement, event, character) {
    const changes = [];
    const eventIntensity = event.intensity || 1;
    const characterCulture = character.culture || 'unknown';
    const settlementCulture = settlement.dominantCulture || 'unknown';
    
    // Cultural events can affect multiple domains
    const culturalAlignment = characterCulture === settlementCulture ? 1.5 : 0.8;
    
    if (influence.hasDomain('social')) {
      const socialChange = 4 * eventIntensity * culturalAlignment;
      changes.push({
        domainId: 'social',
        amount: this._clamp(socialChange, -10, 10),
        reason: `Cultural event in ${settlement.name}: ${event.description}`
      });
    }
    
    if (influence.hasDomain('religious') && event.subtype === 'religious_ceremony') {
      const religiousChange = 6 * eventIntensity * culturalAlignment;
      changes.push({
        domainId: 'religious',
        amount: this._clamp(religiousChange, -12, 12),
        reason: `Religious cultural event: ${event.description}`
      });
    }
    
    return changes;
  }
  
  _calculateGenericEventChanges(influence, settlement, event, character) {
    const changes = [];
    
    // Generic events have minimal, broad impact
    if (event.influenceImpact) {
      for (const [domainId, impact] of Object.entries(event.influenceImpact)) {
        if (influence.hasDomain(domainId) && Math.abs(impact) > 0) {
          changes.push({
            domainId,
            amount: this._clamp(impact, -5, 5),
            reason: `Event impact in ${settlement.name}: ${event.description}`
          });
        }
      }
    }
    
    return changes;
  }
  
  _calculateTemporalDecay(influence, timeElapsed, character, activeSettlements) {
    const decayChanges = [];
    const baseDecayRate = 0.05; // Base decay per day
    
    for (const domainId of influence.getDomainIds()) {
      const currentValue = influence.getValue(domainId);
      const domain = influence.getDomain(domainId);
      
      // Calculate decay rate for this domain
      let domainDecayRate = baseDecayRate;
      
      // Reduce decay if character is active in relevant settlements
      const relevantSettlements = activeSettlements.filter(settlement => 
        this._isSettlementRelevantToDomain(settlement, domainId)
      );
      
      if (relevantSettlements.length > 0) {
        domainDecayRate *= (1 - Math.min(relevantSettlements.length * 0.2, 0.8));
      }
      
      // Higher influence decays faster (harder to maintain)
      const tier = influence.getTier(domainId);
      if (tier && tier.name === 'High') {
        domainDecayRate *= 1.5;
      } else if (tier && tier.name === 'Very High') {
        domainDecayRate *= 2.0;
      }
      
      // Calculate decay amount
      const decayAmount = -currentValue * domainDecayRate * timeElapsed;
      
      if (Math.abs(decayAmount) > 0.1) {
        decayChanges.push({
          domainId,
          amount: this._clamp(decayAmount, -10, 0),
          reason: `Natural influence decay over ${Math.round(timeElapsed)} days`
        });
      }
    }
    
    return decayChanges;
  }
  
  _calculateActionInfluenceChanges(influence, action, settlement, character) {
    const changes = [];
    const actionSuccess = action.success || false;
    const actionIntensity = action.intensity || 1;
    
    // Map action types to influence domains
    const actionDomainMap = {
      'political_negotiation': 'political',
      'trade_deal': 'economic',
      'public_speech': 'social',
      'military_command': 'military',
      'religious_ceremony': 'religious',
      'diplomatic_mission': 'political',
      'merchant_activity': 'economic',
      'social_gathering': 'social'
    };
    
    const primaryDomain = actionDomainMap[action.type];
    
    if (primaryDomain && influence.hasDomain(primaryDomain)) {
      const baseChange = actionSuccess ? 8 : -3;
      const finalChange = baseChange * actionIntensity;
      
      changes.push({
        domainId: primaryDomain,
        amount: this._clamp(finalChange, -15, 15),
        reason: `${actionSuccess ? 'Successful' : 'Failed'} ${action.type}: ${action.description}`
      });
    }
    
    // Some actions have secondary effects
    if (actionSuccess && action.type === 'public_speech' && influence.hasDomain('political')) {
      changes.push({
        domainId: 'political',
        amount: this._clamp(3 * actionIntensity, -8, 8),
        reason: `Political impact of successful public speech`
      });
    }
    
    return changes;
  }
  
  _isSettlementRelevantToDomain(settlement, domainId) {
    // Determine if a settlement is relevant for maintaining influence in a domain
    switch (domainId) {
      case 'political':
        return settlement.type === 'capital' || settlement.type === 'city' || settlement.hasGovernment;
      case 'economic':
        return settlement.type === 'trade_hub' || settlement.type === 'city' || settlement.hasMarket;
      case 'military':
        return settlement.type === 'fortress' || settlement.type === 'military_base' || settlement.hasBarracks;
      case 'religious':
        return settlement.hasTemple || settlement.hasShrine || settlement.type === 'holy_site';
      case 'social':
        return settlement.population > 100; // Any reasonably sized settlement
      default:
        return false;
    }
  }
  
  _clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Validation methods
   */
  
  _validateInfluence(influence) {
    if (!(influence instanceof Influence)) {
      throw new Error('Invalid influence: must be an instance of Influence');
    }
  }
  
  _validateSettlement(settlement) {
    if (!settlement || typeof settlement !== 'object') {
      throw new Error('Invalid settlement: must be an object');
    }
    
    if (!settlement.id || typeof settlement.id !== 'string') {
      throw new Error('Settlement must have a valid id');
    }
    
    if (!settlement.name || typeof settlement.name !== 'string') {
      throw new Error('Settlement must have a valid name');
    }
  }
  
  _validateEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('Invalid event: must be an object');
    }
    
    if (!event.type || typeof event.type !== 'string') {
      throw new Error('Event must have a valid type');
    }
    
    if (!event.description || typeof event.description !== 'string') {
      throw new Error('Event must have a description');
    }
  }
  
  _validateAction(action) {
    if (!action || typeof action !== 'object') {
      throw new Error('Invalid action: must be an object');
    }
    
    if (!action.type || typeof action.type !== 'string') {
      throw new Error('Action must have a valid type');
    }
    
    if (!action.description || typeof action.description !== 'string') {
      throw new Error('Action must have a description');
    }
  }
}

export default InfluenceService;