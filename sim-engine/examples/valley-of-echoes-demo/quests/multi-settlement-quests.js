/**
 * Multi-Settlement Quest Definitions
 * Valley of Echoes Demo - Cross-Settlement Quests
 *
 * Quests that span multiple settlements and require cooperation between
 * Oakwood Federation and Ironhold Dominion for completion.
 */

const multiSettlementQuests = [
  {
    id: 'trade-caravan-escort',
    title: 'Trade Caravan Escort',
    description: 'Escort a valuable trade caravan from Oakwood Federation to Ironhold Dominion through potentially dangerous territory.',
    type: 'trade_escort',
    status: 'available',
    settlements: ['oakwood-federation', 'ironhold-dominion'],
    difficulty: 'medium',
    duration: 5, // turns
    requirements: {
      oakwood: {
        characters: ['merchant-guild-leader'],
        resources: { goods: 50, security: 0.7 }
      },
      ironhold: {
        characters: ['captain-garrison'],
        resources: { security: 0.8, military: 20 }
      }
    },
    objectives: [
      {
        id: 'assemble-caravan',
        description: 'Assemble trade caravan in Oakwood Market District',
        settlement: 'oakwood-federation',
        node: 'oakwood-market-district',
        completed: false
      },
      {
        id: 'coordinate-escort',
        description: 'Coordinate military escort from Ironhold Garrison',
        settlement: 'ironhold-dominion',
        node: 'ironhold-barracks',
        completed: false
      },
      {
        id: 'safe-passage',
        description: 'Ensure safe passage through the valley',
        settlement: 'both',
        completed: false
      },
      {
        id: 'successful-delivery',
        description: 'Complete delivery of goods to Ironhold',
        settlement: 'ironhold-dominion',
        node: 'ironhold-forge-district',
        completed: false
      }
    ],
    rewards: {
      oakwood: {
        wealth: 100,
        reputation: 10,
        relationshipBonus: 5
      },
      ironhold: {
        wealth: 80,
        reputation: 8,
        relationshipBonus: 5
      },
      both: {
        tradeBonus: 15,
        diplomaticBonus: 3
      }
    },
    consequences: {
      success: {
        description: 'Strengthened trade relations and increased prosperity',
        effects: {
          tradeVolume: 1.2,
          relationshipStrength: 1.1,
          economicGrowth: 1.05
        }
      },
      failure: {
        description: 'Lost goods and damaged relations',
        effects: {
          tradeVolume: 0.8,
          relationshipStrength: 0.9,
          economicLoss: 50
        }
      }
    }
  },

  {
    id: 'joint-military-exercise',
    title: 'Joint Military Exercise',
    description: 'Conduct a joint military training exercise to improve coordination and defensive capabilities.',
    type: 'military_training',
    status: 'available',
    settlements: ['oakwood-federation', 'ironhold-dominion'],
    difficulty: 'hard',
    duration: 8,
    requirements: {
      oakwood: {
        characters: ['council-chair-elara'],
        resources: { security: 0.6, organization: 0.7 }
      },
      ironhold: {
        characters: ['lord-protector-garret', 'captain-garrison'],
        resources: { military: 30, training: 0.8 }
      }
    },
    objectives: [
      {
        id: 'planning-meeting',
        description: 'Hold planning meeting between settlement leaders',
        settlement: 'oakwood-federation',
        node: 'oakwood-administrative-center',
        completed: false
      },
      {
        id: 'assemble-forces',
        description: 'Assemble combined military forces',
        settlement: 'both',
        completed: false
      },
      {
        id: 'conduct-drills',
        description: 'Execute joint training drills and maneuvers',
        settlement: 'both',
        completed: false
      },
      {
        id: 'debrief-session',
        description: 'Conduct debrief and lessons learned session',
        settlement: 'ironhold-dominion',
        node: 'ironhold-command-center',
        completed: false
      }
    ],
    rewards: {
      oakwood: {
        security: 0.1,
        militarySkill: 5,
        relationshipBonus: 8
      },
      ironhold: {
        security: 0.15,
        militarySkill: 8,
        relationshipBonus: 8
      },
      both: {
        defensiveBonus: 10,
        coordinationBonus: 5
      }
    },
    consequences: {
      success: {
        description: 'Improved military coordination and regional security',
        effects: {
          securityLevel: 1.15,
          militaryEffectiveness: 1.1,
          relationshipStrength: 1.2
        }
      },
      failure: {
        description: 'Training accidents and strained relations',
        effects: {
          securityLevel: 0.95,
          populationMorale: 0.9,
          relationshipStrength: 0.85
        }
      }
    }
  },

  {
    id: 'resource-sharing-alliance',
    title: 'Resource Sharing Alliance',
    description: 'Establish a formal alliance for sharing resources and technology between the settlements.',
    type: 'diplomatic_alliance',
    status: 'available',
    settlements: ['oakwood-federation', 'ironhold-dominion'],
    difficulty: 'medium',
    duration: 12,
    requirements: {
      oakwood: {
        characters: ['council-chair-elara', 'head-farmer'],
        resources: { diplomacy: 0.7, surplus: 0.6 }
      },
      ironhold: {
        characters: ['lord-protector-garret', 'master-smith'],
        resources: { diplomacy: 0.6, technology: 0.7 }
      }
    },
    objectives: [
      {
        id: 'alliance-negotiation',
        description: 'Negotiate terms of the resource sharing alliance',
        settlement: 'oakwood-federation',
        node: 'oakwood-administrative-center',
        completed: false
      },
      {
        id: 'resource-assessment',
        description: 'Assess available resources for sharing',
        settlement: 'both',
        completed: false
      },
      {
        id: 'technology-exchange',
        description: 'Exchange technological knowledge and techniques',
        settlement: 'both',
        completed: false
      },
      {
        id: 'alliance-treaty',
        description: 'Formalize alliance with signed treaty',
        settlement: 'ironhold-dominion',
        node: 'ironhold-command-center',
        completed: false
      }
    ],
    rewards: {
      oakwood: {
        technology: 10,
        resourceAccess: 15,
        relationshipBonus: 12
      },
      ironhold: {
        foodSecurity: 0.1,
        resourceAccess: 12,
        relationshipBonus: 12
      },
      both: {
        economicBonus: 20,
        allianceBonus: 8
      }
    },
    consequences: {
      success: {
        description: 'Strong alliance brings prosperity and security',
        effects: {
          economicGrowth: 1.2,
          resourceEfficiency: 1.15,
          relationshipStrength: 1.3,
          securityLevel: 1.1
        }
      },
      failure: {
        description: 'Failed negotiations damage relations',
        effects: {
          relationshipStrength: 0.8,
          diplomaticPenalty: 5,
          economicInefficiency: 0.95
        }
      }
    }
  },

  {
    id: 'mysterious-valley-exploration',
    title: 'Mysterious Valley Exploration',
    description: 'Explore the uncharted Echo Valley for resources and ancient secrets.',
    type: 'exploration',
    status: 'available',
    settlements: ['oakwood-federation', 'ironhold-dominion'],
    difficulty: 'high',
    duration: 15,
    requirements: {
      oakwood: {
        characters: ['head-farmer'],
        resources: { exploration: 0.5, supplies: 30 }
      },
      ironhold: {
        characters: ['mining-foreman'],
        resources: { exploration: 0.6, equipment: 25 }
      }
    },
    objectives: [
      {
        id: 'assemble-expedition',
        description: 'Assemble joint expedition team',
        settlement: 'both',
        completed: false
      },
      {
        id: 'map-terrain',
        description: 'Map unexplored valley terrain',
        settlement: 'both',
        completed: false
      },
      {
        id: 'discover-resources',
        description: 'Discover and assess new resources',
        settlement: 'both',
        completed: false
      },
      {
        id: 'return-findings',
        description: 'Return with findings and establish claims',
        settlement: 'both',
        completed: false
      }
    ],
    rewards: {
      oakwood: {
        newResources: 20,
        knowledge: 15,
        relationshipBonus: 6
      },
      ironhold: {
        newResources: 25,
        knowledge: 12,
        relationshipBonus: 6
      },
      both: {
        territoryBonus: 10,
        discoveryBonus: 8
      }
    },
    consequences: {
      success: {
        description: 'New resources and knowledge benefit both settlements',
        effects: {
          resourceWealth: 1.25,
          knowledgeGain: 15,
          relationshipStrength: 1.15,
          economicGrowth: 1.1
        }
      },
      failure: {
        description: 'Expedition fails with losses',
        effects: {
          populationLoss: 5,
          resourceLoss: 30,
          moralePenalty: 0.9,
          relationshipDamage: 0.85
        }
      }
    }
  }
];

module.exports = multiSettlementQuests;