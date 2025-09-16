// src/domain/services/DecisionAnalysisService.js

/**
 * Service for analyzing character decision patterns and formatting decision reasoning
 * for display in the behavior analysis panel
 */
class DecisionAnalysisService {
  constructor() {
    this.decisionPatterns = new Map();
  }

  /**
   * Analyze a character's recent decision history
   * @param {Character} character - The character to analyze
   * @param {number} recentLimit - Number of recent decisions to analyze (default: 10)
   * @returns {Object} Analysis of decision patterns and reasoning
   */
  analyzeDecisionHistory(character, recentLimit = 10) {
    if (!character.decisionHistory || character.decisionHistory.length === 0) {
      return {
        recentDecisions: [],
        patterns: {},
        reasoning: 'No decision history available'
      };
    }

    const recentDecisions = character.decisionHistory.slice(-recentLimit);
    
    return {
      recentDecisions: recentDecisions.map(decision => this.formatDecisionSummary(decision)),
      patterns: this.analyzeDecisionPatterns(recentDecisions),
      reasoning: this.generateDecisionAnalysis(recentDecisions)
    };
  }

  /**
   * Format a single decision for display in the UI
   * @param {Object} decision - Decision context object
   * @returns {Object} Formatted decision summary
   */
  formatDecisionSummary(decision) {
    const reasoning = decision.reasoning || {};
    const selected = decision.selectedInteraction || {};
    
    return {
      timestamp: decision.timestamp,
      selectedAction: selected.name || 'Unknown',
      weight: selected.weight || 0,
      reasoning: {
        primary: this.getPrimaryReasoningFactor(reasoning),
        consciousness: this.formatConsciousnessInfluence(reasoning.consciousnessInfluence),
        personality: this.formatPersonalityInfluence(reasoning.personalityFactors),
        environment: this.formatEnvironmentalInfluence(reasoning.environmentalFactors),
        needs: this.formatNeedInfluence(reasoning.needFactors),
        emergency: reasoning.emergencyOverride || false
      },
      alternatives: (decision.availableInteractions || [])
        .slice(0, 3)
        .map(alt => ({ name: alt.name, weight: alt.weight }))
    };
  }

  /**
   * Identify the primary reasoning factor for a decision
   * @param {Object} reasoning - Complete reasoning object
   * @returns {string} Primary factor description
   */
  getPrimaryReasoningFactor(reasoning) {
    if (reasoning.emergencyOverride) {
      return 'Emergency Override';
    }

    const needFactors = reasoning.needFactors || {};
    if (needFactors.energyLevel < 0.2) {
      return 'Critical Energy Need';
    }

    if (needFactors.goals && needFactors.goals.length > 0) {
      return `Goal: ${needFactors.goals[0]}`;
    }

    const personalityFactors = reasoning.personalityFactors || {};
    if (personalityFactors.dominantTraits && personalityFactors.dominantTraits.length > 0) {
      const topTrait = personalityFactors.dominantTraits[0];
      return `Personality: ${topTrait.name} (${(topTrait.value * 100).toFixed(0)}%)`;
    }

    const envFactors = reasoning.environmentalFactors || {};
    if (envFactors.isDangerous) {
      return 'Environmental Danger';
    }

    return 'Weighted Random Selection';
  }

  /**
   * Format consciousness influence for display
   * @param {Object} consciousness - Consciousness data
   * @returns {string} Formatted consciousness description
   */
  formatConsciousnessInfluence(consciousness) {
    if (!consciousness) return 'No consciousness data';
    
    const freq = consciousness.frequency || 0;
    const coherence = consciousness.coherence || 0;
    const emotional = consciousness.emotionalState;
    
    let description = `Freq: ${freq.toFixed(1)}Hz, Coherence: ${(coherence * 100).toFixed(0)}%`;
    
    if (emotional && emotional.primary) {
      description += `, Emotional: ${emotional.primary}`;
      if (emotional.intensity) {
        description += ` (${(emotional.intensity * 100).toFixed(0)}%)`;
      }
    }
    
    return description;
  }

  /**
   * Format personality influence for display
   * @param {Object} personality - Personality factors
   * @returns {string} Formatted personality description
   */
  formatPersonalityInfluence(personality) {
    if (!personality || !personality.dominantTraits || personality.dominantTraits.length === 0) {
      return 'No dominant traits';
    }
    
    return personality.dominantTraits
      .map(trait => `${trait.name}: ${(trait.value * 100).toFixed(0)}%`)
      .join(', ');
  }

  /**
   * Format environmental influence for display
   * @param {Object} environment - Environmental factors
   * @returns {string} Formatted environment description
   */
  formatEnvironmentalInfluence(environment) {
    if (!environment) return 'No environment data';
    
    let description = environment.nodeType || 'Unknown location';
    
    if (environment.climate) {
      description += ` (${environment.climate})`;
    }
    
    if (environment.isDangerous) {
      description += ' - DANGEROUS';
    }
    
    return description;
  }

  /**
   * Format need influence for display
   * @param {Object} needs - Need factors
   * @returns {string} Formatted needs description
   */
  formatNeedInfluence(needs) {
    if (!needs) return 'No need data';
    
    let description = `Energy: ${(needs.energyLevel * 100).toFixed(0)}%`;
    
    if (needs.criticalNeeds && needs.criticalNeeds.length > 0) {
      description += `, Critical: ${needs.criticalNeeds.join(', ')}`;
    }
    
    if (needs.goals && needs.goals.length > 0) {
      description += `, Goals: ${needs.goals.join(', ')}`;
    }
    
    return description;
  }

  /**
   * Analyze patterns in recent decisions
   * @param {Array} decisions - Array of recent decisions
   * @returns {Object} Pattern analysis
   */
  analyzeDecisionPatterns(decisions) {
    if (decisions.length === 0) return {};

    const patterns = {
      mostCommonActions: this.getMostCommonActions(decisions),
      averageWeight: this.getAverageWeight(decisions),
      emergencyFrequency: this.getEmergencyFrequency(decisions),
      consciousnessStability: this.getConsciousnessStability(decisions),
      personalityConsistency: this.getPersonalityConsistency(decisions)
    };

    return patterns;
  }

  /**
   * Get most common actions from decisions
   * @param {Array} decisions - Array of decisions
   * @returns {Array} Most common actions with counts
   */
  getMostCommonActions(decisions) {
    const actionCounts = {};
    decisions.forEach(decision => {
      const action = decision.selectedInteraction?.name || 'Unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([action, count]) => ({ action, count, percentage: (count / decisions.length * 100).toFixed(0) }));
  }

  /**
   * Calculate average decision weight
   * @param {Array} decisions - Array of decisions
   * @returns {number} Average weight
   */
  getAverageWeight(decisions) {
    const weights = decisions
      .map(d => d.selectedInteraction?.weight || 0)
      .filter(w => w > 0);
    
    return weights.length > 0 ? 
      weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
  }

  /**
   * Calculate emergency decision frequency
   * @param {Array} decisions - Array of decisions
   * @returns {number} Emergency frequency percentage
   */
  getEmergencyFrequency(decisions) {
    const emergencyCount = decisions.filter(d => d.reasoning?.emergencyOverride).length;
    return decisions.length > 0 ? (emergencyCount / decisions.length * 100) : 0;
  }

  /**
   * Analyze consciousness stability
   * @param {Array} decisions - Array of decisions
   * @returns {Object} Consciousness stability metrics
   */
  getConsciousnessStability(decisions) {
    const consciousnessData = decisions
      .map(d => d.reasoning?.consciousnessInfluence)
      .filter(c => c && typeof c.coherence === 'number');

    if (consciousnessData.length === 0) {
      return { stability: 'No data', variance: 0 };
    }

    const coherenceValues = consciousnessData.map(c => c.coherence);
    const average = coherenceValues.reduce((sum, c) => sum + c, 0) / coherenceValues.length;
    const variance = coherenceValues.reduce((sum, c) => sum + Math.pow(c - average, 2), 0) / coherenceValues.length;

    return {
      stability: variance < 0.1 ? 'Stable' : variance < 0.3 ? 'Moderate' : 'Unstable',
      variance: variance,
      averageCoherence: average
    };
  }

  /**
   * Analyze personality consistency
   * @param {Array} decisions - Array of decisions
   * @returns {string} Personality consistency description
   */
  getPersonalityConsistency(decisions) {
    const personalityData = decisions
      .map(d => d.reasoning?.personalityFactors?.dominantTraits)
      .filter(traits => traits && traits.length > 0);

    if (personalityData.length === 0) {
      return 'No personality data available';
    }

    const traitFrequency = {};
    personalityData.forEach(traits => {
      traits.forEach(trait => {
        traitFrequency[trait.name] = (traitFrequency[trait.name] || 0) + 1;
      });
    });

    const mostConsistentTrait = Object.entries(traitFrequency)
      .sort((a, b) => b[1] - a[1])[0];

    if (mostConsistentTrait) {
      const consistency = (mostConsistentTrait[1] / personalityData.length * 100).toFixed(0);
      return `${mostConsistentTrait[0]} appears in ${consistency}% of decisions`;
    }

    return 'Inconsistent personality expression';
  }

  /**
   * Generate a natural language analysis of decision patterns
   * @param {Array} decisions - Array of recent decisions
   * @returns {string} Natural language analysis
   */
  generateDecisionAnalysis(decisions) {
    if (decisions.length === 0) {
      return 'This character has no recorded decision history.';
    }

    const patterns = this.analyzeDecisionPatterns(decisions);
    const primaryReason = this.getPrimaryReasoningFactor(decisions[decisions.length - 1]?.reasoning || {});
    
    let analysis = `Based on ${decisions.length} recent decisions, this character `;

    // Most common behavior
    if (patterns.mostCommonActions && patterns.mostCommonActions.length > 0) {
      const topAction = patterns.mostCommonActions[0];
      analysis += `frequently chooses "${topAction.action}" (${topAction.percentage}% of decisions). `;
    }

    // Decision confidence
    if (patterns.averageWeight > 8) {
      analysis += 'Decisions are made with high confidence, suggesting clear goals or strong personality traits. ';
    } else if (patterns.averageWeight < 3) {
      analysis += 'Decisions are made with low confidence, suggesting uncertainty or conflicting motivations. ';
    }

    // Emergency behavior
    if (patterns.emergencyFrequency > 20) {
      analysis += `Emergency overrides occur frequently (${patterns.emergencyFrequency.toFixed(0)}%), indicating a reactive decision-making style. `;
    }

    // Consciousness patterns
    if (patterns.consciousnessStability) {
      analysis += `Consciousness coherence is ${patterns.consciousnessStability.stability.toLowerCase()}. `;
    }

    // Current primary reasoning
    analysis += `Most recent decision was primarily driven by: ${primaryReason}.`;

    return analysis;
  }
}

export default DecisionAnalysisService;