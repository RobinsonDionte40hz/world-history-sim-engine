/**
 * Family Decision Integration Example
 * 
 * Demonstrates how to integrate the Family Decision Service with
 * existing family aspiration goals and template systems.
 */

import FamilyDecisionService from '../domain/services/FamilyDecisionService.js';
import FamilyAspirationGoals from '../template/FamilyAspirationGoals.js';
import TemplateManager from '../template/TemplateManager.js';

class FamilyDecisionIntegration {
  constructor() {
    this.templateManager = new TemplateManager();
    this.familyGoals = new FamilyAspirationGoals(this.templateManager);
    this.decisionService = new FamilyDecisionService();
    
    // Initialize family goal templates
    this.familyGoals.initializeTemplates();
  }

  /**
   * Comprehensive marriage evaluation that integrates with goal system
   */
  evaluateMarriageProposal(suitor, target, settlement) {
    // 1. Check marriage readiness for both characters
    const suitorReadiness = this.decisionService.evaluateMarriageReadiness(suitor, settlement);
    const targetReadiness = this.decisionService.evaluateMarriageReadiness(target, settlement);

    // 2. Evaluate compatibility
    const compatibility = this.decisionService.evaluateMarriageCompatibility(
      suitor, 
      target, 
      settlement
    );

    // 3. Check family goal prerequisites
    const familyGoalCompatibility = this.evaluateFamilyGoalCompatibility(suitor, target);

    // 4. Generate comprehensive decision
    return this.generateMarriageDecision({
      suitorReadiness,
      targetReadiness,
      compatibility,
      familyGoalCompatibility,
      suitor,
      target
    });
  }

  /**
   * Evaluates how well the couple aligns with family aspiration goals
   */
  evaluateFamilyGoalCompatibility(character1, character2) {
    const availableGoals1 = this.familyGoals.getAvailableFamilyGoalsForCharacter(character1);
    const availableGoals2 = this.familyGoals.getAvailableFamilyGoalsForCharacter(character2);

    // Simulate married state to check future goal compatibility
    const marriedChar1 = { ...character1, relationship_status: 'married' };
    const marriedChar2 = { ...character2, relationship_status: 'married' };

    const futureGoals1 = this.familyGoals.getAvailableFamilyGoalsForCharacter(marriedChar1);
    const futureGoals2 = this.familyGoals.getAvailableFamilyGoalsForCharacter(marriedChar2);

    return {
      currentAlignment: this.calculateGoalAlignment(availableGoals1, availableGoals2),
      futureAlignment: this.calculateGoalAlignment(futureGoals1, futureGoals2),
      sharedGoals: this.findSharedGoals(futureGoals1, futureGoals2),
      complementaryGoals: this.findComplementaryGoals(futureGoals1, futureGoals2)
    };
  }

  /**
   * Calculates alignment between two sets of goals
   */
  calculateGoalAlignment(goals1, goals2) {
    if (goals1.length === 0 && goals2.length === 0) return 1;
    if (goals1.length === 0 || goals2.length === 0) return 0.5;

    const goalIds1 = goals1.map(g => g.id);
    const goalIds2 = goals2.map(g => g.id);
    const intersection = goalIds1.filter(id => goalIds2.includes(id));
    const union = [...new Set([...goalIds1, ...goalIds2])];

    return intersection.length / union.length;
  }

  /**
   * Finds goals that both characters can pursue together
   */
  findSharedGoals(goals1, goals2) {
    const goalIds1 = goals1.map(g => g.id);
    const goalIds2 = goals2.map(g => g.id);
    const sharedIds = goalIds1.filter(id => goalIds2.includes(id));

    return sharedIds.map(id => goals1.find(g => g.id === id));
  }

  /**
   * Finds goals that complement each other
   */
  findComplementaryGoals(goals1, goals2) {
    const complementaryPairs = [
      ['start_family', 'raise_family'],
      ['raise_family', 'family_legacy'],
      ['find_partner', 'start_family']
    ];

    const goalIds1 = goals1.map(g => g.id);
    const goalIds2 = goals2.map(g => g.id);
    const complementary = [];

    complementaryPairs.forEach(([goal1, goal2]) => {
      if (goalIds1.includes(goal1) && goalIds2.includes(goal2)) {
        complementary.push({ char1Goal: goal1, char2Goal: goal2 });
      }
      if (goalIds1.includes(goal2) && goalIds2.includes(goal1)) {
        complementary.push({ char1Goal: goal2, char2Goal: goal1 });
      }
    });

    return complementary;
  }

  /**
   * Generates comprehensive marriage decision with actionable advice
   */
  generateMarriageDecision(evaluationData) {
    const {
      suitorReadiness,
      targetReadiness,
      compatibility,
      familyGoalCompatibility,
      suitor,
      target
    } = evaluationData;

    // Calculate overall decision score
    const readinessScore = (suitorReadiness.readiness + targetReadiness.readiness) / 2;
    const compatibilityScore = compatibility.overallScore;
    const goalScore = (familyGoalCompatibility.currentAlignment + familyGoalCompatibility.futureAlignment) / 2;

    const overallScore = (readinessScore * 0.3) + (compatibilityScore * 0.5) + (goalScore * 0.2);

    // Generate decision
    const decision = {
      recommend: overallScore > 0.6,
      confidence: compatibility.decisionConfidence,
      overallScore,
      
      scores: {
        readiness: readinessScore,
        compatibility: compatibilityScore,
        familyGoals: goalScore
      },

      analysis: {
        strengths: this.identifyStrengths(evaluationData),
        concerns: this.identifyConcerns(evaluationData),
        opportunities: this.identifyOpportunities(evaluationData)
      },

      recommendations: this.generateActionableRecommendations(evaluationData),
      
      timeline: this.generateComprehensiveTimeline(evaluationData),
      
      familyPlanning: this.generateFamilyPlan(familyGoalCompatibility, suitor, target),

      contingencies: this.generateContingencyPlans(evaluationData)
    };

    return decision;
  }

  /**
   * Identifies relationship strengths
   */
  identifyStrengths(data) {
    const strengths = [];
    const { compatibility, familyGoalCompatibility } = data;

    // Compatibility strengths
    Object.entries(compatibility.compatibility).forEach(([area, score]) => {
      if (score > 0.7) {
        strengths.push(`Excellent ${area} compatibility (${Math.round(score * 100)}%)`);
      }
    });

    // Goal alignment strengths
    if (familyGoalCompatibility.sharedGoals.length > 0) {
      strengths.push(`Shared family aspirations: ${familyGoalCompatibility.sharedGoals.map(g => g.name).join(', ')}`);
    }

    if (familyGoalCompatibility.complementaryGoals.length > 0) {
      strengths.push(`Complementary family goals support mutual growth`);
    }

    return strengths;
  }

  /**
   * Identifies potential concerns
   */
  identifyConcerns(data) {
    const concerns = [];
    const { suitorReadiness, targetReadiness, compatibility } = data;

    // Readiness concerns
    if (suitorReadiness.readiness < 0.6) {
      concerns.push(`Suitor readiness concerns: ${suitorReadiness.recommendations.join(', ')}`);
    }

    if (targetReadiness.readiness < 0.6) {
      concerns.push(`Target readiness concerns: ${targetReadiness.recommendations.join(', ')}`);
    }

    // Compatibility concerns
    compatibility.potentialChallenges.forEach(challenge => {
      if (challenge.severity === 'high') {
        concerns.push(`Major concern: ${challenge.description}`);
      }
    });

    return concerns;
  }

  /**
   * Identifies growth opportunities
   */
  identifyOpportunities(data) {
    const opportunities = [];
    const { compatibility, familyGoalCompatibility } = data;

    // Areas for improvement
    Object.entries(compatibility.compatibility).forEach(([area, score]) => {
      if (score > 0.4 && score < 0.7) {
        opportunities.push(`Opportunity to strengthen ${area} compatibility`);
      }
    });

    // Family goal opportunities
    if (familyGoalCompatibility.futureAlignment > familyGoalCompatibility.currentAlignment) {
      opportunities.push('Marriage will unlock new shared family aspirations');
    }

    return opportunities;
  }

  /**
   * Generates actionable recommendations
   */
  generateActionableRecommendations(data) {
    const recommendations = [];
    const { compatibility, familyGoalCompatibility } = data;

    // Immediate actions
    if (compatibility.overallScore > 0.7) {
      recommendations.push({
        priority: 'high',
        category: 'proceed',
        action: 'Begin formal courtship process',
        timeline: 'immediate'
      });
    } else if (compatibility.overallScore > 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'improve',
        action: 'Address compatibility concerns before proceeding',
        timeline: '1-3 months'
      });
    }

    // Specific improvements
    if (compatibility.compatibility.economic < 0.6) {
      recommendations.push({
        priority: 'high',
        category: 'economic',
        action: 'Establish financial stability plan',
        timeline: '3-6 months'
      });
    }

    if (compatibility.compatibility.consciousness < 0.6) {
      recommendations.push({
        priority: 'medium',
        category: 'personal',
        action: 'Focus on personal growth and emotional development',
        timeline: '6-12 months'
      });
    }

    // Family goal preparation
    if (familyGoalCompatibility.sharedGoals.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'planning',
        action: `Prepare for shared goals: ${familyGoalCompatibility.sharedGoals.map(g => g.name).join(', ')}`,
        timeline: 'ongoing'
      });
    }

    return recommendations;
  }

  /**
   * Generates comprehensive timeline including family goals
   */
  generateComprehensiveTimeline(data) {
    const baseTimeline = data.compatibility.timeline;
    const { familyGoalCompatibility } = data;

    return {
      ...baseTimeline,
      familyMilestones: this.planFamilyMilestones(familyGoalCompatibility),
      keyDecisionPoints: this.identifyDecisionPoints(data)
    };
  }

  /**
   * Plans family milestone timeline
   */
  planFamilyMilestones(goalCompatibility) {
    const milestones = [];

    goalCompatibility.sharedGoals.forEach(goal => {
      switch (goal.id) {
        case 'start_family':
          milestones.push({
            goal: goal.name,
            timeframe: '1-2 years after marriage',
            prerequisites: ['Stable housing', 'Financial security']
          });
          break;
        case 'raise_family':
          milestones.push({
            goal: goal.name,
            timeframe: '15-20 years',
            prerequisites: ['Children present', 'Educational resources']
          });
          break;
        case 'family_legacy':
          milestones.push({
            goal: goal.name,
            timeframe: '20+ years',
            prerequisites: ['Established wealth', 'Business foundation']
          });
          break;
        default:
          milestones.push({
            goal: goal.name,
            timeframe: 'TBD',
            prerequisites: ['Goal-specific requirements']
          });
      }
    });

    return milestones;
  }

  /**
   * Identifies key decision points in the relationship
   */
  identifyDecisionPoints(data) {
    const decisionPoints = [];
    const { compatibility } = data;

    decisionPoints.push({
      point: 'Formal Courtship Decision',
      timeframe: 'immediate',
      factors: ['Initial compatibility', 'Mutual interest'],
      threshold: 0.5
    });

    decisionPoints.push({
      point: 'Engagement Decision',
      timeframe: `${compatibility.timeline.courtship} days`,
      factors: ['Deep compatibility', 'Family approval'],
      threshold: 0.7
    });

    decisionPoints.push({
      point: 'Marriage Decision',
      timeframe: `${compatibility.timeline.total} days`,
      factors: ['Final compatibility assessment', 'Readiness confirmation'],
      threshold: 0.8
    });

    return decisionPoints;
  }

  /**
   * Generates family planning strategy
   */
  generateFamilyPlan(goalCompatibility, suitor, target) {
    const plan = {
      sharedAspirations: goalCompatibility.sharedGoals.map(g => g.name),
      timeline: [],
      resourceRequirements: {},
      roleDistribution: this.suggestRoleDistribution(suitor, target)
    };

    // Plan timeline based on goals
    goalCompatibility.sharedGoals.forEach(goal => {
      plan.timeline.push({
        goal: goal.name,
        estimatedStart: this.estimateGoalStart(goal),
        estimatedDuration: goal.metadata.estimated_duration,
        keyMilestones: goal.steps.map(step => step.name)
      });

      // Aggregate resource requirements
      if (goal.requirements.resources) {
        Object.entries(goal.requirements.resources).forEach(([resource, amount]) => {
          plan.resourceRequirements[resource] = (plan.resourceRequirements[resource] || 0) + amount;
        });
      }
    });

    return plan;
  }

  /**
   * Suggests role distribution based on character strengths
   */
  suggestRoleDistribution(char1, char2) {
    const roles = {
      primaryProvider: null,
      primaryCaregiver: null,
      financialManager: null,
      socialRepresentative: null
    };

    // Determine primary provider based on income and ambition
    const char1Income = char1.resources?.income || 0;
    const char2Income = char2.resources?.income || 0;
    const char1Ambition = char1.personality?.traits?.ambition || 0.5;
    const char2Ambition = char2.personality?.traits?.ambition || 0.5;

    if (char1Income > char2Income || char1Ambition > char2Ambition) {
      roles.primaryProvider = char1.id;
    } else {
      roles.primaryProvider = char2.id;
    }

    // Determine primary caregiver based on empathy and patience
    const char1Empathy = char1.personality?.traits?.empathy || 0.5;
    const char2Empathy = char2.personality?.traits?.empathy || 0.5;
    const char1Patience = char1.personality?.traits?.patience || 0.5;
    const char2Patience = char2.personality?.traits?.patience || 0.5;

    if ((char1Empathy + char1Patience) > (char2Empathy + char2Patience)) {
      roles.primaryCaregiver = char1.id;
    } else {
      roles.primaryCaregiver = char2.id;
    }

    // Financial manager based on wisdom and resources
    const char1Wisdom = char1.attributes?.wisdom?.score || 10;
    const char2Wisdom = char2.attributes?.wisdom?.score || 10;
    const char1Wealth = char1.resources?.wealth || 0;
    const char2Wealth = char2.resources?.wealth || 0;

    if ((char1Wisdom + char1Wealth / 100) > (char2Wisdom + char2Wealth / 100)) {
      roles.financialManager = char1.id;
    } else {
      roles.financialManager = char2.id;
    }

    // Social representative based on charisma and reputation
    const char1Charisma = char1.attributes?.charisma?.score || 10;
    const char2Charisma = char2.attributes?.charisma?.score || 10;
    const char1Reputation = char1.social?.reputation || 50;
    const char2Reputation = char2.social?.reputation || 50;

    if ((char1Charisma + char1Reputation / 10) > (char2Charisma + char2Reputation / 10)) {
      roles.socialRepresentative = char1.id;
    } else {
      roles.socialRepresentative = char2.id;
    }

    return roles;
  }

  /**
   * Estimates when a goal should start based on dependencies
   */
  estimateGoalStart(goal) {
    const goalStartTimes = {
      'find_partner': 0, // Should already be done if evaluating marriage
      'start_family': 365, // ~1 year after marriage
      'raise_family': 730, // ~2 years after marriage (when children arrive)
      'family_legacy': 7300 // ~20 years after marriage (when established)
    };

    return goalStartTimes[goal.id] || 365;
  }

  /**
   * Generates contingency plans for various scenarios
   */
  generateContingencyPlans(data) {
    const contingencies = [];
    const { compatibility } = data;

    // Low compatibility contingency
    if (compatibility.overallScore < 0.6) {
      contingencies.push({
        scenario: 'Compatibility Improvement Needed',
        actions: [
          'Extended courtship period for better understanding',
          'Counseling or guidance from respected community members',
          'Gradual introduction to each other\'s families and cultures'
        ],
        timeframe: '6-12 months',
        successMetrics: ['Improved compatibility scores', 'Mutual comfort level']
      });
    }

    // Economic instability contingency
    if (compatibility.compatibility.economic < 0.5) {
      contingencies.push({
        scenario: 'Economic Challenges',
        actions: [
          'Delay marriage until financial stability improves',
          'Combine resources and skills strategically',
          'Seek economic opportunities together'
        ],
        timeframe: '6-18 months',
        successMetrics: ['Combined income target met', 'Savings goal achieved']
      });
    }

    // Family pressure contingency
    contingencies.push({
      scenario: 'Family or Social Opposition',
      actions: [
        'Demonstrate compatibility through community involvement',
        'Gradual introduction and relationship building',
        'Seek respected mediator if needed'
      ],
      timeframe: '3-6 months',
      successMetrics: ['Family acceptance', 'Community support']
    });

    return contingencies;
  }
}

export default FamilyDecisionIntegration;
