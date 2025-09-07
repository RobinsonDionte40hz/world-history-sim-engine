/**
 * Family Aspiration Goal Templates
 *
 * Pre-defined goal templates for family-related aspirations and life milestones.
 * These templates provide structured pathways for characters to pursue family goals
 * with realistic requirements, progression steps, and consequences.
 */

import TemplateManager from './TemplateManager.js';

class FamilyAspirationGoals {
  constructor(templateManager) {
    this.templateManager = templateManager || new TemplateManager();
  }

  /**
   * Initialize all family aspiration goal templates
   */
  initializeTemplates() {
    this.createFindPartnerTemplate();
    this.createStartFamilyTemplate();
    this.createRaiseFamilyTemplate();
    this.createFamilyLegacyTemplate();
  }

  /**
   * Create "Find a Partner" goal template
   */
  createFindPartnerTemplate() {
    const template = {
      id: 'find_partner',
      name: 'Find a Partner',
      description: 'Find a compatible romantic partner to start a relationship',
      type: 'social',
      category: 'family',
      priority: 'medium',
      requirements: {
        age: { min: 18, max: 50 },
        attributes: { charisma: 10 },
        personality: { empathy: 0.3 },
        relationship_status: 'single'
      },
      steps: [
        {
          id: 'socialize_in_settlement',
          name: 'Socialize in Settlement',
          description: 'Spend time in social areas of the settlement to meet people',
          order: 1,
          requirements: {},
          actions: ['socialize', 'attend_social_event', 'visit_tavern'],
          duration: 7,
          success_probability: 0.8
        },
        {
          id: 'identify_compatible_partner',
          name: 'Identify Compatible Partner',
          description: 'Find someone with compatible personality and interests',
          order: 2,
          requirements: { social_interactions: 5 },
          actions: ['meet_people', 'converse', 'share_interests'],
          duration: 14,
          success_probability: 0.6
        },
        {
          id: 'build_romantic_relationship',
          name: 'Build Romantic Relationship',
          description: 'Develop a romantic connection with the partner',
          order: 3,
          requirements: { conversations: 10 },
          actions: ['date', 'court', 'romantic_gesture', 'spend_time_together'],
          duration: 30,
          success_probability: 0.7
        },
        {
          id: 'propose_marriage',
          name: 'Propose Marriage',
          description: 'Formally propose marriage to your partner',
          order: 4,
          requirements: { relationship_bond: 70 },
          actions: ['propose_marriage'],
          duration: 1,
          success_probability: 0.8
        }
      ],
      success_conditions: {
        primary: 'marriage_proposal_accepted',
        secondary: ['romantic_relationship_established'],
        time_limit: 180,
        failure_conditions: ['partner_rejects_proposal', 'relationship_ends']
      },
      rewards: {
        experience: 500,
        attributes: { charisma: 1, wisdom: 1 },
        relationships: { partner: 50 },
        reputation: 10,
        resources: { happiness: 20 }
      },
      consequences: {
        success: {
          immediate: { happiness: 20, social_status: 5 },
          long_term: { relationship_status: 'dating', marriage_potential: true }
        },
        failure: {
          immediate: { happiness: -10, social_penalty: -5 },
          long_term: { dating_cooldown: 30, reputation_penalty: -2 }
        }
      },
      metadata: {
        difficulty: 'medium',
        estimated_duration: 52,
        social_impact: 0.8,
        economic_impact: 0.1,
        historical_significance: 0.3,
        tags: ['romance', 'courtship', 'marriage', 'social']
      }
    };

    return this.templateManager.addTemplate('goals', {
      ...template,
      version: '1.0.0',
      tags: ['family', 'aspiration', 'romance', 'social'],
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'System',
        type: 'goal-template',
        ...template.metadata
      }
    });
  }

  /**
   * Create "Start a Family" goal template
   */
  createStartFamilyTemplate() {
    const template = {
      id: 'start_family',
      name: 'Start a Family',
      description: 'Build a stable family unit with children',
      type: 'family',
      category: 'family',
      priority: 'high',
      requirements: {
        relationship_status: 'married',
        resources: { housing: 1, income: 100 },
        attributes: { constitution: 12, wisdom: 10 },
        age: { min: 20, max: 45 }
      },
      steps: [
        {
          id: 'establish_stable_home',
          name: 'Establish Stable Home',
          description: 'Secure adequate housing and financial stability',
          order: 1,
          requirements: { housing: 1, savings: 200 },
          actions: ['purchase_house', 'save_money', 'improve_home'],
          duration: 30,
          success_probability: 0.9
        },
        {
          id: 'prepare_for_parenthood',
          name: 'Prepare for Parenthood',
          description: 'Learn about childcare and prepare emotionally',
          order: 2,
          requirements: { knowledge_childcare: 1 },
          actions: ['study_childcare', 'discuss_parenthood', 'visit_families'],
          duration: 14,
          success_probability: 0.8
        },
        {
          id: 'conceive_child',
          name: 'Conceive Child',
          description: 'Successfully conceive a child',
          order: 3,
          requirements: { health: 80, partner_health: 80 },
          actions: ['intimate_encounter', 'consult_healer'],
          duration: 30,
          success_probability: 0.7
        },
        {
          id: 'prepare_for_birth',
          name: 'Prepare for Birth',
          description: 'Prepare home and resources for newborn',
          order: 4,
          requirements: { nursery_prepared: true, supplies_ready: true },
          actions: ['prepare_nursery', 'stock_supplies', 'hire_help'],
          duration: 7,
          success_probability: 0.9
        }
      ],
      success_conditions: {
        primary: 'child_born_healthy',
        secondary: ['home_prepared', 'family_stable'],
        time_limit: 180,
        failure_conditions: ['miscarriage', 'health_complications']
      },
      rewards: {
        experience: 1000,
        attributes: { wisdom: 2, constitution: 1 },
        relationships: { spouse: 20, child: 100 },
        reputation: 15,
        resources: { happiness: 30, family_legacy: 1 }
      },
      consequences: {
        success: {
          immediate: { happiness: 50, family_bond: 30 },
          long_term: { legacy: 1, family_lineage: true, parental_responsibility: true }
        },
        failure: {
          immediate: { happiness: -30, health_penalty: -10 },
          long_term: { fertility_penalty: -20, emotional_trauma: 15 }
        }
      },
      metadata: {
        difficulty: 'hard',
        estimated_duration: 81,
        social_impact: 0.9,
        economic_impact: 0.6,
        historical_significance: 0.7,
        tags: ['parenthood', 'legacy', 'stability']
      }
    };

    return this.templateManager.addTemplate('goals', {
      ...template,
      version: '1.0.0',
      tags: ['family', 'aspiration', 'parenthood', 'legacy'],
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'System',
        type: 'goal-template',
        ...template.metadata
      }
    });
  }

  /**
   * Create "Raise Family" goal template
   */
  createRaiseFamilyTemplate() {
    const template = {
      id: 'raise_family',
      name: 'Raise a Family',
      description: 'Successfully raise children to adulthood',
      type: 'family',
      category: 'family',
      priority: 'high',
      requirements: {
        children: { min: 1 },
        resources: { housing: 1, income: 150 },
        attributes: { wisdom: 12 },
        personality: { patience: 0.5 }
      },
      steps: [
        {
          id: 'infant_care',
          name: 'Infant Care',
          description: 'Care for infant needs and development',
          order: 1,
          requirements: { child_age: 1 },
          actions: ['feed_child', 'change_diapers', 'bond_with_child'],
          duration: 365,
          success_probability: 0.85
        },
        {
          id: 'early_education',
          name: 'Early Education',
          description: 'Teach basic skills and values',
          order: 2,
          requirements: { child_age: 5 },
          actions: ['teach_basic_skills', 'read_stories', 'teach_manners'],
          duration: 1825, // 5 years
          success_probability: 0.8
        },
        {
          id: 'adolescent_guidance',
          name: 'Adolescent Guidance',
          description: 'Guide teenager through challenges',
          order: 3,
          requirements: { child_age: 13 },
          actions: ['provide_guidance', 'set_boundaries', 'support_growth'],
          duration: 2190, // 6 years
          success_probability: 0.75
        },
        {
          id: 'launch_adult',
          name: 'Launch into Adulthood',
          description: 'Prepare child for independent life',
          order: 4,
          requirements: { child_age: 18 },
          actions: ['teach_life_skills', 'provide_resources', 'emotional_support'],
          duration: 365,
          success_probability: 0.9
        }
      ],
      success_conditions: {
        primary: 'child_becomes_adult',
        secondary: ['child_healthy', 'child_educated', 'family_bond_strong'],
        time_limit: 6570, // 18 years
        failure_conditions: ['child_dies', 'child_runs_away', 'family_breaks_apart']
      },
      rewards: {
        experience: 2000,
        attributes: { wisdom: 3, charisma: 1 },
        relationships: { child: 80, spouse: 40 },
        reputation: 25,
        resources: { legacy_points: 50, family_honor: 20 }
      },
      consequences: {
        success: {
          immediate: { happiness: 60, fulfillment: 40 },
          long_term: { legacy: 2, family_continuity: true, wisdom_boost: 10 }
        },
        failure: {
          immediate: { happiness: -50, grief: 30 },
          long_term: { emotional_scars: 20, family_reputation_penalty: -10 }
        }
      },
      metadata: {
        difficulty: 'hard',
        estimated_duration: 6570,
        social_impact: 0.95,
        economic_impact: 0.7,
        historical_significance: 0.8,
        tags: ['parenting', 'legacy', 'nurturing', 'long-term']
      }
    };

    return this.templateManager.addTemplate('goals', {
      ...template,
      version: '1.0.0',
      tags: ['family', 'aspiration', 'parenting', 'legacy'],
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'System',
        type: 'goal-template',
        ...template.metadata
      }
    });
  }

  /**
   * Create "Family Legacy" goal template
   */
  createFamilyLegacyTemplate() {
    const template = {
      id: 'family_legacy',
      name: 'Build Family Legacy',
      description: 'Create a lasting family legacy through generations',
      type: 'family',
      category: 'family',
      priority: 'critical',
      requirements: {
        children: { min: 2 },
        resources: { wealth: 1000, property: 5 },
        attributes: { wisdom: 15, leadership: 12 },
        age: { min: 40 }
      },
      steps: [
        {
          id: 'establish_family_business',
          name: 'Establish Family Business',
          description: 'Create a sustainable family business or enterprise',
          order: 1,
          requirements: { capital: 500 },
          actions: ['start_business', 'hire_family', 'build_reputation'],
          duration: 365,
          success_probability: 0.7
        },
        {
          id: 'build_family_wealth',
          name: 'Build Family Wealth',
          description: 'Accumulate wealth and assets for future generations',
          order: 2,
          requirements: { business_profit: 1000 },
          actions: ['invest_wisely', 'diversify_assets', 'save_for_future'],
          duration: 1825, // 5 years
          success_probability: 0.8
        },
        {
          id: 'educate_heirs',
          name: 'Educate Heirs',
          description: 'Ensure children receive proper education and training',
          order: 3,
          requirements: { children_educated: true },
          actions: ['hire_tutors', 'send_to_school', 'teach_family_values'],
          duration: 2190, // 6 years
          success_probability: 0.85
        },
        {
          id: 'create_family_traditions',
          name: 'Create Family Traditions',
          description: 'Establish lasting family traditions and values',
          order: 4,
          requirements: { family_bonds: 80 },
          actions: ['organize_family_events', 'document_history', 'teach_heritage'],
          duration: 365,
          success_probability: 0.9
        }
      ],
      success_conditions: {
        primary: 'multi_generational_success',
        secondary: ['business_established', 'wealth_accumulated', 'heirs_prepared'],
        time_limit: 7300, // 20 years
        failure_conditions: ['business_failure', 'family_dissolution', 'heir_death']
      },
      rewards: {
        experience: 5000,
        attributes: { wisdom: 5, leadership: 3 },
        relationships: { family: 100, community: 50 },
        reputation: 50,
        resources: { legacy_points: 100, family_influence: 30 }
      },
      consequences: {
        success: {
          immediate: { fulfillment: 80, pride: 60 },
          long_term: { historical_legacy: true, family_name_eternal: true }
        },
        failure: {
          immediate: { disappointment: -60, stress: 40 },
          long_term: { family_name_tarnished: true, personal_regret: 30 }
        }
      },
      metadata: {
        difficulty: 'legendary',
        estimated_duration: 7300,
        social_impact: 0.9,
        economic_impact: 0.95,
        historical_significance: 0.9,
        tags: ['legacy', 'wealth', 'tradition', 'multi-generational']
      }
    };

    return this.templateManager.addTemplate('goals', {
      ...template,
      version: '1.0.0',
      tags: ['family', 'aspiration', 'legacy', 'wealth'],
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'System',
        type: 'goal-template',
        ...template.metadata
      }
    });
  }

  /**
   * Get all family aspiration goal templates
   */
  getAllFamilyGoals() {
    return [
      'find_partner',
      'start_family',
      'raise_family',
      'family_legacy'
    ].map(id => this.templateManager.getTemplate('goals', id));
  }

  /**
   * Get family goals available for a specific character
   */
  getAvailableFamilyGoalsForCharacter(character) {
    return this.templateManager.getAvailableGoalsForCharacter(character)
      .filter(goal => goal.category === 'family');
  }
}

export default FamilyAspirationGoals;
