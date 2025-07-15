// src/domain/services/PrestigeService.js

import { Prestige } from '../value-objects/Prestige.js';

/**
 * Domain service for handling prestige evolution and reputation management
 * Provides business logic for how prestige changes over time and in response to achievements
 */
class PrestigeService {
  /**
   * Update prestige based on achievement-based changes
   * @param {Prestige} prestige - Current prestige state
   * @param {Object} achievement - Achievement that triggers the prestige change
   * @param {Object} socialContext - Social context where the achievement occurred
   * @param {Object} character - Character whose prestige is being updated
   * @returns {Prestige} New prestige state after achievement-based update
   */
  updatePrestige(prestige, achievement, socialContext, character = {}) {
    this._validatePrestige(prestige);
    this._validateAchievement(achievement);
    this._validateSocialContext(socialContext);
    
    // Calculate prestige changes based on the achievement and social context
    const prestigeChanges = this._calculateAchievementChanges(
      prestige,
      achievement,
      socialContext,
      character
    );
    
    // Apply all calculated changes
    let updatedPrestige = prestige;
    for (const change of prestigeChanges) {
      const contextData = {
        achievementType: achievement.type,
        achievementDescription: achievement.description,
        witnessCount: socialContext.witnesses || 0,
        settlementId: socialContext.settlementId,
        settlementName: socialContext.settlementName,
        witnessData: new Map([
          ['nobles', socialContext.nobleWitnesses || 0],
          ['commoners', socialContext.commonerWitnesses || 0],
          ['foreigners', socialContext.foreignWitnesses || 0]
        ]),
        socialConnections: new Map([
          ['allies', socialContext.alliesPresent || 0],
          ['rivals', socialContext.rivalsPresent || 0],
          ['neutrals', socialContext.neutralsPresent || 0]
        ])
      };
      
      updatedPrestige = updatedPrestige.withChange(
        change.trackId,
        change.amount,
        change.reason,
        contextData
      );
    }
    
    return updatedPrestige;
  }
  
  /**
   * Apply time decay to prestige values
   * @param {Prestige} prestige - Current prestige state
   * @param {number} timeElapsed - Time elapsed in days
   * @param {Map} decayRates - Custom decay rates per track (optional)
   * @param {Object} character - Character whose prestige is decaying
   * @returns {Prestige} New prestige state after applying reputation degradation
   */
  applyTimeDecay(prestige, timeElapsed, decayRates = null, character = {}) {
    this._validatePrestige(prestige);
    
    if (timeElapsed <= 0) {
      return prestige;
    }
    
    // Calculate decay rates for each track
    const calculatedDecayRates = this._calculateDecayRates(
      prestige,
      timeElapsed,
      decayRates,
      character
    );
    
    return prestige.withDecay(calculatedDecayRates);
  }
  
  /**
   * Calculate social standing based on prestige levels
   * @param {Prestige} prestige - Current prestige state
   * @param {Object} settlement - Settlement context for social standing calculation
   * @param {Object} character - Character whose social standing is being calculated
   * @returns {Object} Social standing analysis and metrics
   */
  calculateSocialStanding(prestige, settlement, character = {}) {
    this._validatePrestige(prestige);
    this._validateSettlement(settlement);
    
    const standing = {
      overallRank: 0,
      socialClass: 'commoner',
      politicalPower: 0,
      socialInfluence: 0,
      economicStanding: 0,
      culturalStatus: 0,
      trackStandings: {},
      settlementRank: 0,
      privileges: [],
      responsibilities: []
    };
    
    // Calculate standings for each track
    let totalWeightedPrestige = 0;
    let totalWeight = 0;
    
    for (const trackId of prestige.getTrackIds()) {
      const track = prestige.getTrack(trackId);
      const value = prestige.getValue(trackId);
      const level = prestige.getLevel(trackId);
      
      // Calculate track-specific standing
      const trackStanding = this._calculateTrackStanding(
        track,
        value,
        level,
        settlement,
        character
      );
      
      standing.trackStandings[trackId] = trackStanding;
      
      // Accumulate weighted prestige
      const weight = this._getTrackWeight(trackId, settlement);
      totalWeightedPrestige += value * weight;
      totalWeight += weight;
      
      // Accumulate specific metrics
      if (level) {
        standing.politicalPower += level.politicalPower || 0;
        standing.privileges.push(...(level.socialBenefits || []));
        standing.responsibilities.push(...(level.responsibilities || []));
      }
    }
    
    // Calculate overall metrics
    standing.overallRank = totalWeight > 0 ? totalWeightedPrestige / totalWeight : 0;
    standing.socialClass = this._determineSocialClass(standing.overallRank, prestige);
    standing.socialInfluence = this._calculateSocialInfluence(prestige, settlement);
    standing.economicStanding = this._calculateEconomicStanding(prestige, settlement);
    standing.culturalStatus = this._calculateCulturalStatus(prestige, settlement);
    standing.settlementRank = this._calculateSettlementRank(standing.overallRank, settlement);
    
    // Remove duplicate privileges and responsibilities
    standing.privileges = [...new Set(standing.privileges)];
    standing.responsibilities = [...new Set(standing.responsibilities)];
    
    return standing;
  }
  
  /**
   * Calculate prestige changes from social interactions
   * @param {Prestige} prestige - Current prestige state
   * @param {Object} interaction - Social interaction that occurred
   * @param {Object} otherCharacter - Other character involved in the interaction
   * @param {Object} socialContext - Context of the interaction
   * @returns {Prestige} New prestige state after social interaction
   */
  applySocialInteraction(prestige, interaction, otherCharacter, socialContext = {}) {
    this._validatePrestige(prestige);
    this._validateInteraction(interaction);
    
    const interactionChanges = this._calculateSocialInteractionChanges(
      prestige,
      interaction,
      otherCharacter,
      socialContext
    );
    
    let interactionPrestige = prestige;
    for (const change of interactionChanges) {
      const contextData = {
        interactionType: interaction.type,
        interactionDescription: interaction.description,
        otherCharacterName: otherCharacter.name || 'Unknown',
        otherCharacterPrestige: otherCharacter.prestigeLevel || 0,
        witnessCount: socialContext.witnesses || 0,
        socialConnections: new Map([
          ['mutual_friends', socialContext.mutualFriends || 0],
          ['social_rivals', socialContext.socialRivals || 0]
        ])
      };
      
      interactionPrestige = interactionPrestige.withChange(
        change.trackId,
        change.amount,
        change.reason,
        contextData
      );
    }
    
    return interactionPrestige;
  }
  
  /**
   * Analyze prestige trends over time
   * @param {Prestige} prestige - Current prestige state
   * @param {number} timeWindow - Time window in days to analyze
   * @returns {Object} Trend analysis
   */
  analyzePrestigeTrends(prestige, timeWindow = 30) {
    this._validatePrestige(prestige);
    
    const trends = {
      overallTrend: 'stable',
      trackTrends: {},
      recentChanges: [],
      significantEvents: [],
      projectedDecay: {}
    };
    
    const cutoffDate = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000);
    
    for (const trackId of prestige.getTrackIds()) {
      const history = prestige.getTrackHistory(trackId);
      const recentHistory = history.filter(change => 
        new Date(change.timestamp) >= cutoffDate
      );
      
      if (recentHistory.length > 0) {
        const totalChange = recentHistory.reduce((sum, change) => sum + change.change, 0);
        const trend = totalChange > 5 ? 'rising' : totalChange < -5 ? 'declining' : 'stable';
        
        trends.trackTrends[trackId] = {
          trend,
          totalChange,
          changeCount: recentHistory.length,
          averageChange: totalChange / recentHistory.length
        };
        
        trends.recentChanges.push(...recentHistory.map(change => ({
          ...change,
          trackId
        })));
      }
      
      // Calculate projected decay
      const track = prestige.getTrack(trackId);
      const currentValue = prestige.getValue(trackId);
      const projectedDecay = currentValue * track.decayRate * timeWindow;
      trends.projectedDecay[trackId] = projectedDecay;
    }
    
    // Determine overall trend
    const trendValues = Object.values(trends.trackTrends);
    const risingCount = trendValues.filter(t => t.trend === 'rising').length;
    const decliningCount = trendValues.filter(t => t.trend === 'declining').length;
    
    if (risingCount > decliningCount) {
      trends.overallTrend = 'rising';
    } else if (decliningCount > risingCount) {
      trends.overallTrend = 'declining';
    }
    
    // Sort recent changes by significance
    trends.recentChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    trends.significantEvents = trends.recentChanges
      .filter(change => Math.abs(change.change) > 10)
      .slice(0, 5);
    
    return trends;
  }
  
  /**
   * Private helper methods
   */
  
  _calculateAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    
    // Different types of achievements affect different prestige tracks
    switch (achievement.type) {
      case 'military_victory':
        changes.push(...this._calculateMilitaryAchievementChanges(prestige, achievement, socialContext, character));
        break;
      case 'political_success':
        changes.push(...this._calculatePoliticalAchievementChanges(prestige, achievement, socialContext, character));
        break;
      case 'economic_achievement':
        changes.push(...this._calculateEconomicAchievementChanges(prestige, achievement, socialContext, character));
        break;
      case 'cultural_contribution':
        changes.push(...this._calculateCulturalAchievementChanges(prestige, achievement, socialContext, character));
        break;
      case 'social_deed':
        changes.push(...this._calculateSocialAchievementChanges(prestige, achievement, socialContext, character));
        break;
      case 'heroic_act':
        changes.push(...this._calculateHeroicAchievementChanges(prestige, achievement, socialContext, character));
        break;
      default:
        changes.push(...this._calculateGenericAchievementChanges(prestige, achievement, socialContext, character));
    }
    
    return changes;
  }
  
  _calculateMilitaryAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    const magnitude = achievement.magnitude || 1;
    const witnessCount = socialContext.witnesses || 0;
    const witnessMultiplier = 1 + Math.min(witnessCount / 100, 2); // Max 3x multiplier
    
    if (prestige.hasTrack('military')) {
      const baseChange = 15 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'military',
        amount: this._clamp(baseChange, 0, 50),
        reason: `Military achievement: ${achievement.description}`
      });
    }
    
    if (prestige.hasTrack('honor') && achievement.subtype === 'heroic_battle') {
      const honorChange = 12 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'honor',
        amount: this._clamp(honorChange, 0, 40),
        reason: `Honorable military conduct: ${achievement.description}`
      });
    }
    
    // Military achievements can boost political prestige for leaders
    if (prestige.hasTrack('political') && (character.role === 'leader' || character.militaryRank > 5)) {
      const politicalChange = 8 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'political',
        amount: this._clamp(politicalChange, 0, 25),
        reason: `Political impact of military success: ${achievement.description}`
      });
    }
    
    return changes;
  }
  
  _calculatePoliticalAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    const magnitude = achievement.magnitude || 1;
    const witnessCount = socialContext.witnesses || 0;
    const nobleWitnesses = socialContext.nobleWitnesses || 0;
    
    // Noble witnesses are more valuable for political prestige
    const witnessMultiplier = 1 + Math.min((witnessCount + nobleWitnesses * 3) / 50, 2.5);
    
    if (prestige.hasTrack('political')) {
      const baseChange = 18 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'political',
        amount: this._clamp(baseChange, 0, 60),
        reason: `Political achievement: ${achievement.description}`
      });
    }
    
    if (prestige.hasTrack('social') && achievement.subtype === 'diplomatic_success') {
      const socialChange = 10 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'social',
        amount: this._clamp(socialChange, 0, 35),
        reason: `Social impact of diplomatic success: ${achievement.description}`
      });
    }
    
    return changes;
  }
  
  _calculateEconomicAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    const magnitude = achievement.magnitude || 1;
    const witnessCount = socialContext.witnesses || 0;
    const witnessMultiplier = 1 + Math.min(witnessCount / 75, 1.8);
    
    if (prestige.hasTrack('wealth')) {
      const baseChange = 12 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'wealth',
        amount: this._clamp(baseChange, 0, 45),
        reason: `Economic achievement: ${achievement.description}`
      });
    }
    
    if (prestige.hasTrack('social') && achievement.subtype === 'charitable_donation') {
      const socialChange = 8 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'social',
        amount: this._clamp(socialChange, 0, 30),
        reason: `Social impact of charitable act: ${achievement.description}`
      });
    }
    
    return changes;
  }
  
  _calculateCulturalAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    const magnitude = achievement.magnitude || 1;
    const witnessCount = socialContext.witnesses || 0;
    const culturalRelevance = socialContext.culturalRelevance || 1;
    const witnessMultiplier = 1 + Math.min(witnessCount / 60, 2) * culturalRelevance;
    
    if (prestige.hasTrack('cultural')) {
      const baseChange = 14 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'cultural',
        amount: this._clamp(baseChange, 0, 50),
        reason: `Cultural achievement: ${achievement.description}`
      });
    }
    
    if (prestige.hasTrack('social')) {
      const socialChange = 6 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'social',
        amount: this._clamp(socialChange, 0, 25),
        reason: `Social recognition of cultural contribution: ${achievement.description}`
      });
    }
    
    return changes;
  }
  
  _calculateSocialAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    const magnitude = achievement.magnitude || 1;
    const witnessCount = socialContext.witnesses || 0;
    const witnessMultiplier = 1 + Math.min(witnessCount / 40, 2.2); // Social acts benefit more from witnesses
    
    if (prestige.hasTrack('social')) {
      const baseChange = 16 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'social',
        amount: this._clamp(baseChange, 0, 55),
        reason: `Social achievement: ${achievement.description}`
      });
    }
    
    if (prestige.hasTrack('honor') && achievement.subtype === 'selfless_act') {
      const honorChange = 10 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'honor',
        amount: this._clamp(honorChange, 0, 35),
        reason: `Honorable social deed: ${achievement.description}`
      });
    }
    
    return changes;
  }
  
  _calculateHeroicAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    const magnitude = achievement.magnitude || 1;
    const witnessCount = socialContext.witnesses || 0;
    const witnessMultiplier = 1 + Math.min(witnessCount / 30, 3); // Heroic acts get maximum witness benefit
    
    // Heroic acts boost multiple tracks
    if (prestige.hasTrack('honor')) {
      const honorChange = 20 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'honor',
        amount: this._clamp(honorChange, 0, 70),
        reason: `Heroic achievement: ${achievement.description}`
      });
    }
    
    if (prestige.hasTrack('social')) {
      const socialChange = 15 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'social',
        amount: this._clamp(socialChange, 0, 50),
        reason: `Social recognition of heroic act: ${achievement.description}`
      });
    }
    
    // Context-specific boosts
    if (achievement.context === 'battle' && prestige.hasTrack('military')) {
      const militaryChange = 12 * magnitude * witnessMultiplier;
      changes.push({
        trackId: 'military',
        amount: this._clamp(militaryChange, 0, 40),
        reason: `Military heroism: ${achievement.description}`
      });
    }
    
    return changes;
  }
  
  _calculateGenericAchievementChanges(prestige, achievement, socialContext, character) {
    const changes = [];
    
    // Generic achievements have minimal impact
    if (achievement.prestigeImpact) {
      for (const [trackId, impact] of Object.entries(achievement.prestigeImpact)) {
        if (prestige.hasTrack(trackId) && Math.abs(impact) > 0) {
          const witnessCount = socialContext.witnesses || 0;
          const witnessMultiplier = 1 + Math.min(witnessCount / 100, 1);
          const finalImpact = impact * witnessMultiplier;
          
          changes.push({
            trackId,
            amount: this._clamp(finalImpact, -10, 10),
            reason: `Achievement impact: ${achievement.description}`
          });
        }
      }
    }
    
    return changes;
  }
  
  _calculateDecayRates(prestige, timeElapsed, customDecayRates, character) {
    const decayRates = new Map();
    
    for (const trackId of prestige.getTrackIds()) {
      const track = prestige.getTrack(trackId);
      const currentValue = prestige.getValue(trackId);
      
      // Use custom decay rate if provided, otherwise use track default
      let decayRate = customDecayRates?.get(trackId) || track.decayRate;
      
      // Modify decay rate based on character traits and current value
      decayRate = this._modifyDecayRate(decayRate, currentValue, track, character);
      
      // Calculate total decay amount
      const decayAmount = currentValue * decayRate * (timeElapsed / 30); // Normalize to monthly decay
      
      if (decayAmount > 0.1) {
        decayRates.set(trackId, decayAmount);
      }
    }
    
    return decayRates;
  }
  
  _modifyDecayRate(baseDecayRate, currentValue, track, character) {
    let modifiedRate = baseDecayRate;
    
    // Higher prestige decays faster (harder to maintain)
    const level = track.levels.find(l => currentValue >= l.min && currentValue <= l.max);
    if (level) {
      if (level.name.includes('Very High') || level.name.includes('Legendary')) {
        modifiedRate *= 1.8;
      } else if (level.name.includes('High')) {
        modifiedRate *= 1.4;
      }
    }
    
    // Character traits affect decay
    const charisma = character.charisma || 0;
    const socialSkill = character.socialSkill || 0;
    
    // High charisma and social skills slow decay
    const skillModifier = 1 - Math.min((charisma + socialSkill) / 200, 0.4);
    modifiedRate *= skillModifier;
    
    // Age affects decay differently for different tracks
    const age = character.age || 30;
    if (track.id === 'physical' && age > 40) {
      modifiedRate *= 1 + (age - 40) / 100; // Physical prestige decays faster with age
    } else if (track.id === 'wisdom' && age > 50) {
      modifiedRate *= 0.8; // Wisdom prestige decays slower with age
    }
    
    return Math.max(modifiedRate, 0);
  }
  
  _calculateTrackStanding(track, value, level, settlement, character) {
    const standing = {
      rank: 0,
      percentile: 0,
      levelName: level ? level.name : 'Unknown',
      relativePosition: 'average'
    };
    
    // Calculate rank within the track's range
    const range = track.max - track.min;
    standing.rank = ((value - track.min) / range) * 100;
    
    // Determine relative position
    if (standing.rank >= 90) {
      standing.relativePosition = 'exceptional';
    } else if (standing.rank >= 75) {
      standing.relativePosition = 'high';
    } else if (standing.rank >= 60) {
      standing.relativePosition = 'above_average';
    } else if (standing.rank >= 40) {
      standing.relativePosition = 'average';
    } else if (standing.rank >= 25) {
      standing.relativePosition = 'below_average';
    } else {
      standing.relativePosition = 'low';
    }
    
    // Calculate percentile based on settlement context
    standing.percentile = this._calculateSettlementPercentile(value, track, settlement);
    
    return standing;
  }
  
  _calculateSettlementPercentile(value, track, settlement) {
    // This is a simplified calculation - in a real system, this would use actual population data
    const settlementSize = settlement.population || 1000;
    const settlementType = settlement.type || 'town';
    
    // Adjust expectations based on settlement characteristics
    let baseExpectation = (track.min + track.max) / 2;
    
    if (settlementType === 'capital' || settlementType === 'major_city') {
      baseExpectation *= 1.3; // Higher expectations in major cities
    } else if (settlementType === 'village') {
      baseExpectation *= 0.8; // Lower expectations in villages
    }
    
    // Calculate percentile relative to adjusted expectations
    const normalizedValue = (value - track.min) / (track.max - track.min);
    const normalizedExpectation = (baseExpectation - track.min) / (track.max - track.min);
    
    return Math.min(Math.max((normalizedValue / normalizedExpectation) * 50, 0), 100);
  }
  
  _getTrackWeight(trackId, settlement) {
    // Different settlements value different types of prestige
    const weights = {
      military: 1.0,
      political: 1.0,
      social: 1.0,
      wealth: 1.0,
      cultural: 1.0,
      honor: 1.0
    };
    
    switch (settlement.type) {
      case 'military_base':
      case 'fortress':
        weights.military = 2.0;
        weights.honor = 1.5;
        break;
      case 'capital':
        weights.political = 2.0;
        weights.social = 1.5;
        break;
      case 'trade_hub':
        weights.wealth = 2.0;
        weights.social = 1.3;
        break;
      case 'cultural_center':
        weights.cultural = 2.0;
        weights.social = 1.3;
        break;
    }
    
    return weights[trackId] || 1.0;
  }
  
  _determineSocialClass(overallRank, prestige) {
    if (overallRank >= 80) {
      return 'nobility';
    } else if (overallRank >= 60) {
      return 'upper_class';
    } else if (overallRank >= 40) {
      return 'middle_class';
    } else if (overallRank >= 20) {
      return 'lower_class';
    } else {
      return 'commoner';
    }
  }
  
  _calculateSocialInfluence(prestige, settlement) {
    let influence = 0;
    
    if (prestige.hasTrack('social')) {
      influence += prestige.getValue('social') * 0.4;
    }
    
    if (prestige.hasTrack('political')) {
      influence += prestige.getValue('political') * 0.3;
    }
    
    if (prestige.hasTrack('wealth')) {
      influence += prestige.getValue('wealth') * 0.2;
    }
    
    if (prestige.hasTrack('cultural')) {
      influence += prestige.getValue('cultural') * 0.1;
    }
    
    return Math.min(influence, 100);
  }
  
  _calculateEconomicStanding(prestige, settlement) {
    let standing = 0;
    
    if (prestige.hasTrack('wealth')) {
      standing += prestige.getValue('wealth') * 0.6;
    }
    
    if (prestige.hasTrack('political')) {
      standing += prestige.getValue('political') * 0.2;
    }
    
    if (prestige.hasTrack('social')) {
      standing += prestige.getValue('social') * 0.2;
    }
    
    return Math.min(standing, 100);
  }
  
  _calculateCulturalStatus(prestige, settlement) {
    let status = 0;
    
    if (prestige.hasTrack('cultural')) {
      status += prestige.getValue('cultural') * 0.5;
    }
    
    if (prestige.hasTrack('social')) {
      status += prestige.getValue('social') * 0.3;
    }
    
    if (prestige.hasTrack('honor')) {
      status += prestige.getValue('honor') * 0.2;
    }
    
    return Math.min(status, 100);
  }
  
  _calculateSettlementRank(overallRank, settlement) {
    // Adjust rank based on settlement size and importance
    const population = settlement.population || 1000;
    const populationFactor = Math.log10(population / 100) / 2; // Logarithmic scaling
    
    return Math.min(overallRank * (1 + populationFactor), 100);
  }
  
  _calculateSocialInteractionChanges(prestige, interaction, otherCharacter, socialContext) {
    const changes = [];
    const interactionIntensity = interaction.intensity || 1;
    const otherPrestige = otherCharacter.prestigeLevel || 0;
    
    // Interactions with high-prestige characters have more impact
    const prestigeMultiplier = 1 + Math.min(otherPrestige / 100, 1);
    
    switch (interaction.type) {
      case 'alliance_formed':
        if (prestige.hasTrack('political')) {
          changes.push({
            trackId: 'political',
            amount: this._clamp(8 * interactionIntensity * prestigeMultiplier, 0, 25),
            reason: `Alliance with ${otherCharacter.name || 'notable figure'}`
          });
        }
        break;
        
      case 'public_endorsement':
        if (prestige.hasTrack('social')) {
          changes.push({
            trackId: 'social',
            amount: this._clamp(12 * interactionIntensity * prestigeMultiplier, 0, 35),
            reason: `Public endorsement from ${otherCharacter.name || 'notable figure'}`
          });
        }
        break;
        
      case 'rivalry_declared':
        if (prestige.hasTrack('honor')) {
          changes.push({
            trackId: 'honor',
            amount: this._clamp(5 * interactionIntensity * prestigeMultiplier, 0, 15),
            reason: `Rivalry with ${otherCharacter.name || 'notable figure'}`
          });
        }
        break;
        
      case 'public_insult':
        if (prestige.hasTrack('social')) {
          changes.push({
            trackId: 'social',
            amount: this._clamp(-10 * interactionIntensity * prestigeMultiplier, -30, 0),
            reason: `Public insult from ${otherCharacter.name || 'notable figure'}`
          });
        }
        break;
    }
    
    return changes;
  }
  
  _clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Validation methods
   */
  
  _validatePrestige(prestige) {
    if (!(prestige instanceof Prestige)) {
      throw new Error('Invalid prestige: must be an instance of Prestige');
    }
  }
  
  _validateAchievement(achievement) {
    if (!achievement || typeof achievement !== 'object') {
      throw new Error('Invalid achievement: must be an object');
    }
    
    if (!achievement.type || typeof achievement.type !== 'string') {
      throw new Error('Achievement must have a valid type');
    }
    
    if (!achievement.description || typeof achievement.description !== 'string') {
      throw new Error('Achievement must have a description');
    }
  }
  
  _validateSocialContext(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid social context: must be an object');
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
  
  _validateInteraction(interaction) {
    if (!interaction || typeof interaction !== 'object') {
      throw new Error('Invalid interaction: must be an object');
    }
    
    if (!interaction.type || typeof interaction.type !== 'string') {
      throw new Error('Interaction must have a valid type');
    }
    
    if (!interaction.description || typeof interaction.description !== 'string') {
      throw new Error('Interaction must have a description');
    }
  }
}

export default PrestigeService;