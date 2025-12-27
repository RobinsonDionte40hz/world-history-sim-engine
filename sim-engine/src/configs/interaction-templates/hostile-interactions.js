// src/configs/interaction-templates/hostile-interactions.js

/**
 * Hostile Interaction Templates
 * 
 * Pre-built interaction templates for enemy relationships and hostile scenarios.
 * These can be used as starting points for conflict, confrontation, and vendetta situations.
 */

export const HOSTILE_INTERACTIONS = {
  // Basic hostile confrontation
  confrontation: {
    id: 'hostile_confrontation',
    name: 'Hostile Confrontation',
    description: 'Direct confrontation between enemies with escalating tension',
    type: 'conflict',
    category: 'hostile',
    requirements: {
      courage: 12,
      energy: 20
    },
    effects: {
      tension: 0.3,
      reputation: -0.1,
      energy: -20
    },
    branches: [
      {
        text: 'Threaten them verbally',
        prerequisites: [{ type: 'attribute', attr: 'charisma', min: 12 }],
        effects: [
          { type: 'relationship', change: -10, target: 'opponent' },
          { type: 'reputation', change: -5 }
        ],
        outcomes: [
          'You deliver harsh threats, escalating the tension between you',
          'Your words cut deep, poisoning the relationship further'
        ]
      },
      {
        text: 'Challenge to duel',
        prerequisites: [
          { type: 'attribute', attr: 'charisma', min: 14 },
          { type: 'attribute', attr: 'courage', min: 15 }
        ],
        effects: [
          { type: 'event', trigger: 'duel_initiated' },
          { type: 'honor', change: 0.1 }
        ],
        outcomes: [
          'You formally challenge your enemy to honorable combat',
          'The challenge is issued - only one of you will emerge victorious'
        ]
      },
      {
        text: 'Attempt intimidation',
        prerequisites: [{ type: 'attribute', attr: 'strength', min: 14 }],
        effects: [
          { type: 'relationship', change: -15, target: 'opponent' },
          { type: 'fear', value: 0.2, target: 'opponent' }
        ],
        outcomes: [
          'Your imposing presence makes your enemy reconsider their stance',
          'Through physical intimidation, you assert your dominance'
        ]
      },
      {
        text: 'Walk away with contempt',
        effects: [
          { type: 'relationship', change: -5, target: 'opponent' },
          { type: 'self_control', change: 0.1 }
        ],
        outcomes: [
          'You turn your back on them, showing utter contempt',
          'Your dismissive attitude stings more than words ever could'
        ]
      }
    ]
  },

  // Ambush planning
  ambush: {
    id: 'hostile_ambush',
    name: 'Plan Ambush',
    description: 'Carefully plan and execute an ambush against an enemy',
    type: 'stealth',
    category: 'hostile',
    requirements: {
      stealth: 14,
      intelligence: 12,
      energy: 30
    },
    effects: {
      energy: -30
    },
    branches: [
      {
        text: 'Scout their routine',
        prerequisites: [{ type: 'skill', skill: 'observation', min: 12 }],
        effects: [
          { type: 'knowledge', value: 'enemy_routine' },
          { type: 'preparation', value: 0.3 }
        ],
        outcomes: [
          'You carefully observe their daily patterns and vulnerabilities',
          'Knowledge of their routine gives you a critical advantage'
        ]
      },
      {
        text: 'Recruit allies for the ambush',
        prerequisites: [
          { type: 'attribute', attr: 'charisma', min: 13 },
          { type: 'reputation', min: 0.3 }
        ],
        effects: [
          { type: 'allies', count: 2 },
          { type: 'preparation', value: 0.5 }
        ],
        outcomes: [
          'You convince others to join your cause against this enemy',
          'With allies at your side, the ambush becomes more formidable'
        ]
      },
      {
        text: 'Prepare traps and obstacles',
        prerequisites: [
          { type: 'skill', skill: 'crafting', min: 10 },
          { type: 'attribute', attr: 'intelligence', min: 14 }
        ],
        effects: [
          { type: 'trap_quality', value: 0.7 },
          { type: 'preparation', value: 0.6 }
        ],
        outcomes: [
          'You set cunning traps that will ensure your enemy\'s downfall',
          'The ambush site becomes a deadly maze of your design'
        ]
      }
    ]
  },

  // Sabotage
  sabotage: {
    id: 'hostile_sabotage',
    name: 'Sabotage Enemy',
    description: 'Undermine your enemy\'s efforts through covert sabotage',
    type: 'stealth',
    category: 'hostile',
    requirements: {
      stealth: 15,
      intelligence: 13,
      energy: 25
    },
    effects: {
      energy: -25
    },
    branches: [
      {
        text: 'Sabotage their equipment',
        prerequisites: [
          { type: 'skill', skill: 'crafting', min: 12 },
          { type: 'attribute', attr: 'dexterity', min: 14 }
        ],
        effects: [
          { type: 'enemy_effectiveness', change: -0.3 },
          { type: 'relationship', change: -20, target: 'opponent' }
        ],
        outcomes: [
          'You carefully damage their tools and equipment without detection',
          'Their capabilities are severely hampered by your sabotage'
        ]
      },
      {
        text: 'Spread damaging rumors',
        prerequisites: [
          { type: 'attribute', attr: 'charisma', min: 13 },
          { type: 'skill', skill: 'persuasion', min: 14 }
        ],
        effects: [
          { type: 'enemy_reputation', change: -0.4 },
          { type: 'relationship', change: -15, target: 'opponent' }
        ],
        outcomes: [
          'Your whispered lies spread through the community like wildfire',
          'Their reputation crumbles as people believe your carefully crafted stories'
        ]
      },
      {
        text: 'Interfere with their plans',
        prerequisites: [
          { type: 'intelligence', min: 15 },
          { type: 'knowledge', value: 'enemy_plans' }
        ],
        effects: [
          { type: 'enemy_success', change: -0.5 },
          { type: 'relationship', change: -25, target: 'opponent' }
        ],
        outcomes: [
          'You subtly disrupt their schemes from the shadows',
          'Their carefully laid plans unravel thanks to your interference'
        ]
      }
    ]
  },

  // Public humiliation
  public_humiliation: {
    id: 'hostile_humiliation',
    name: 'Public Humiliation',
    description: 'Humiliate your enemy in front of others to damage their standing',
    type: 'social',
    category: 'hostile',
    requirements: {
      charisma: 14,
      intelligence: 12,
      energy: 20
    },
    effects: {
      energy: -20
    },
    branches: [
      {
        text: 'Challenge them publicly',
        prerequisites: [
          { type: 'attribute', attr: 'charisma', min: 15 },
          { type: 'courage', min: 13 }
        ],
        effects: [
          { type: 'enemy_reputation', change: -0.3 },
          { type: 'your_reputation', change: 0.1 },
          { type: 'relationship', change: -30, target: 'opponent' }
        ],
        outcomes: [
          'You call out their failures and weaknesses for all to see',
          'The crowd watches as your enemy squirms under public scrutiny'
        ]
      },
      {
        text: 'Expose their secrets',
        prerequisites: [
          { type: 'knowledge', value: 'enemy_secrets' },
          { type: 'attribute', attr: 'charisma', min: 14 }
        ],
        effects: [
          { type: 'enemy_reputation', change: -0.5 },
          { type: 'relationship', change: -40, target: 'opponent' },
          { type: 'vendetta_risk', value: 0.8 }
        ],
        outcomes: [
          'You reveal their darkest secrets to the public',
          'Their carefully maintained façade crumbles as truth comes to light'
        ]
      },
      {
        text: 'Mock their abilities',
        prerequisites: [{ type: 'attribute', attr: 'wit', min: 13 }],
        effects: [
          { type: 'enemy_confidence', change: -0.2 },
          { type: 'relationship', change: -20, target: 'opponent' }
        ],
        outcomes: [
          'Your cutting remarks about their incompetence draw laughter from onlookers',
          'Each jest strikes at their pride, diminishing them in the eyes of others'
        ]
      }
    ]
  },

  // Vendetta declaration
  vendetta: {
    id: 'hostile_vendetta',
    name: 'Declare Vendetta',
    description: 'Formally declare an irreconcilable blood feud',
    type: 'social',
    category: 'hostile',
    requirements: {
      charisma: 13,
      courage: 15,
      energy: 30
    },
    effects: {
      energy: -30,
      relationship: -100 // Maximum hostility
    },
    branches: [
      {
        text: 'Swear a blood oath',
        prerequisites: [
          { type: 'attribute', attr: 'wisdom', min: 12 },
          { type: 'tradition', value: 'blood_oaths' }
        ],
        effects: [
          { type: 'vendetta', status: 'sworn' },
          { type: 'honor', change: 0.2 },
          { type: 'relationship', value: -100, permanent: true }
        ],
        outcomes: [
          'You swear by blood and honor that this feud will only end in death',
          'The vendetta is now officially recognized - there is no turning back'
        ]
      },
      {
        text: 'Rally your family/faction',
        prerequisites: [
          { type: 'attribute', attr: 'charisma', min: 16 },
          { type: 'family_ties', min: 0.5 }
        ],
        effects: [
          { type: 'vendetta', status: 'factional' },
          { type: 'allies', faction: 'family' },
          { type: 'escalation', value: 0.9 }
        ],
        outcomes: [
          'Your entire family/faction joins in this vendetta',
          'This conflict now spans generations and family lines'
        ]
      },
      {
        text: 'Issue formal challenge',
        prerequisites: [{ type: 'honor', min: 0.6 }],
        effects: [
          { type: 'vendetta', status: 'formal' },
          { type: 'duel_inevitable', value: true },
          { type: 'honor', change: 0.1 }
        ],
        outcomes: [
          'You issue a formal challenge that must be answered in blood',
          'Honor demands this vendetta be settled through combat'
        ]
      }
    ]
  },

  // Assassination attempt
  assassination: {
    id: 'hostile_assassination',
    name: 'Assassination Attempt',
    description: 'Attempt to permanently eliminate an enemy (high risk)',
    type: 'stealth',
    category: 'hostile',
    requirements: {
      stealth: 18,
      courage: 16,
      energy: 50
    },
    effects: {
      energy: -50
    },
    branches: [
      {
        text: 'Poison their food/drink',
        prerequisites: [
          { type: 'skill', skill: 'alchemy', min: 15 },
          { type: 'attribute', attr: 'intelligence', min: 16 },
          { type: 'access', value: 'enemy_meals' }
        ],
        effects: [
          { type: 'assassination_chance', value: 0.6 },
          { type: 'detection_risk', value: 0.3 }
        ],
        outcomes: [
          'You carefully administer a lethal poison to their meal',
          'If successful, they will die seemingly of natural causes'
        ]
      },
      {
        text: 'Hire an assassin',
        prerequisites: [
          { type: 'wealth', min: 1000 },
          { type: 'connections', faction: 'assassins_guild' }
        ],
        effects: [
          { type: 'assassination_chance', value: 0.8 },
          { type: 'wealth', change: -1000 },
          { type: 'detection_risk', value: 0.2 }
        ],
        outcomes: [
          'You contract a professional to eliminate your enemy',
          'The guild\'s reputation ensures a clean kill if all goes well'
        ]
      },
      {
        text: 'Personal elimination',
        prerequisites: [
          { type: 'combat', min: 17 },
          { type: 'attribute', attr: 'courage', min: 18 }
        ],
        effects: [
          { type: 'assassination_chance', value: 0.5 },
          { type: 'detection_risk', value: 0.8 },
          { type: 'honor_loss', value: -0.5 }
        ],
        outcomes: [
          'You personally strike at your enemy in the shadows',
          'The deed, if successful, will haunt you - but your enemy will be gone'
        ]
      }
    ]
  }
};

/**
 * Get all hostile interaction templates
 */
export const getAllHostileInteractions = () => {
  return Object.values(HOSTILE_INTERACTIONS);
};

/**
 * Get hostile interaction by ID
 */
export const getHostileInteraction = (id) => {
  return Object.values(HOSTILE_INTERACTIONS).find(interaction => interaction.id === id);
};

/**
 * Get hostile interactions by category
 */
export const getHostileInteractionsByCategory = (category) => {
  return Object.values(HOSTILE_INTERACTIONS).filter(
    interaction => interaction.category === category
  );
};

/**
 * Enemy Encounter Templates
 * 
 * Pre-built encounter templates designed for enemy relationships.
 * These can be used in the EncounterEditor to quickly create hostile scenarios.
 */
export const ENEMY_ENCOUNTER_TEMPLATES = {
  // Ambush encounter
  ambush: {
    name: 'Enemy Ambush',
    description: 'A surprise attack by enemies lying in wait',
    type: 'combat',
    difficulty: 'hard',
    challengeRating: 5,
    turnBased: {
      duration: 3,
      initiative: 'attribute',
      timing: 'immediate',
      sequencing: 'sequential'
    },
    enemyRelationships: {
      requiresEnemies: true,
      minEnemyCount: 1,
      specificEnemies: [],
      severityThreshold: 0.5,
      allowNonEnemies: false
    },
    triggers: [
      {
        type: 'probability',
        probability: 0.3
      }
    ],
    outcomes: [
      {
        description: 'Successfully repel the ambush',
        probability: 0.4,
        effects: [
          { type: 'experience', value: 150 },
          { type: 'influence', value: 10 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Escape with minor injuries',
        probability: 0.4,
        effects: [
          { type: 'health', value: -30 },
          { type: 'experience', value: 50 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Captured or severely wounded',
        probability: 0.2,
        effects: [
          { type: 'health', value: -60 },
          { type: 'influence', value: -15 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      }
    ],
    prerequisites: []
  },

  // Confrontation encounter
  confrontation: {
    name: 'Hostile Confrontation',
    description: 'A direct confrontation with an enemy, tensions running high',
    type: 'social',
    difficulty: 'medium',
    challengeRating: 3,
    turnBased: {
      duration: 2,
      initiative: 'fixed',
      timing: 'immediate',
      sequencing: 'sequential'
    },
    enemyRelationships: {
      requiresEnemies: true,
      minEnemyCount: 1,
      specificEnemies: [],
      severityThreshold: 0.3,
      allowNonEnemies: true
    },
    triggers: [
      {
        type: 'probability',
        probability: 0.4
      }
    ],
    outcomes: [
      {
        description: 'Intimidate them into backing down',
        probability: 0.3,
        effects: [
          { type: 'influence', value: 15 },
          { type: 'reputation', value: 5 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Heated argument escalates tension',
        probability: 0.5,
        effects: [
          { type: 'relationship', value: -10 },
          { type: 'stress', value: 20 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Violence erupts',
        probability: 0.2,
        effects: [
          { type: 'health', value: -20 },
          { type: 'relationship', value: -20 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      }
    ],
    prerequisites: [
      { type: 'attribute', attribute: 'charisma', value: 10 }
    ]
  },

  // Vendetta encounter
  vendetta: {
    name: 'Blood Vendetta',
    description: 'A sworn enemy seeks final vengeance in a deadly confrontation',
    type: 'combat',
    difficulty: 'deadly',
    challengeRating: 10,
    turnBased: {
      duration: 5,
      initiative: 'attribute',
      timing: 'conditional',
      sequencing: 'sequential'
    },
    enemyRelationships: {
      requiresEnemies: true,
      minEnemyCount: 1,
      specificEnemies: [],
      severityThreshold: 0.8,
      allowNonEnemies: false
    },
    triggers: [
      {
        type: 'probability',
        probability: 0.1
      }
    ],
    outcomes: [
      {
        description: 'Defeat your nemesis decisively',
        probability: 0.4,
        effects: [
          { type: 'experience', value: 500 },
          { type: 'reputation', value: 25 },
          { type: 'influence', value: 30 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Both sides withdraw, vendetta continues',
        probability: 0.3,
        effects: [
          { type: 'health', value: -40 },
          { type: 'relationship', value: -30 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Defeated by your nemesis',
        probability: 0.3,
        effects: [
          { type: 'health', value: -80 },
          { type: 'influence', value: -40 },
          { type: 'reputation', value: -20 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      }
    ],
    prerequisites: [
      { type: 'attribute', attribute: 'strength', value: 14 },
      { type: 'attribute', attribute: 'constitution', value: 12 }
    ]
  },

  // Sabotage encounter
  sabotage_discovered: {
    name: 'Sabotage Discovered',
    description: 'An enemy\'s plot to undermine you has been uncovered',
    type: 'social',
    difficulty: 'medium',
    challengeRating: 4,
    turnBased: {
      duration: 2,
      initiative: 'fixed',
      timing: 'conditional',
      sequencing: 'simultaneous'
    },
    enemyRelationships: {
      requiresEnemies: true,
      minEnemyCount: 1,
      specificEnemies: [],
      severityThreshold: 0.4,
      allowNonEnemies: true
    },
    triggers: [
      {
        type: 'probability',
        probability: 0.25
      }
    ],
    outcomes: [
      {
        description: 'Expose their plot publicly',
        probability: 0.5,
        effects: [
          { type: 'reputation', value: 15 },
          { type: 'influence', value: 10 },
          { type: 'relationship', value: -25 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Counter-sabotage their efforts',
        probability: 0.3,
        effects: [
          { type: 'influence', value: 5 },
          { type: 'relationship', value: -15 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Fail to stop them in time',
        probability: 0.2,
        effects: [
          { type: 'resources', value: -50 },
          { type: 'reputation', value: -10 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      }
    ],
    prerequisites: [
      { type: 'attribute', attribute: 'intelligence', value: 13 },
      { type: 'attribute', attribute: 'wisdom', value: 11 }
    ]
  },

  // Gang warfare encounter
  gang_warfare: {
    name: 'Gang Warfare',
    description: 'Multiple enemies coordinate an attack against you',
    type: 'combat',
    difficulty: 'hard',
    challengeRating: 7,
    turnBased: {
      duration: 4,
      initiative: 'random',
      timing: 'immediate',
      sequencing: 'sequential'
    },
    enemyRelationships: {
      requiresEnemies: true,
      minEnemyCount: 3,
      specificEnemies: [],
      severityThreshold: 0.5,
      allowNonEnemies: true
    },
    triggers: [
      {
        type: 'probability',
        probability: 0.15
      }
    ],
    outcomes: [
      {
        description: 'Fight off all attackers',
        probability: 0.3,
        effects: [
          { type: 'experience', value: 300 },
          { type: 'reputation', value: 20 },
          { type: 'health', value: -30 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Tactical retreat with allies',
        probability: 0.4,
        effects: [
          { type: 'health', value: -40 },
          { type: 'influence', value: -10 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Overwhelmed by superior numbers',
        probability: 0.3,
        effects: [
          { type: 'health', value: -70 },
          { type: 'resources', value: -100 },
          { type: 'reputation', value: -15 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      }
    ],
    prerequisites: []
  },

  // Assassination attempt
  assassination_attempt: {
    name: 'Assassination Attempt',
    description: 'A deadly enemy attempts to end your life through covert means',
    type: 'combat',
    difficulty: 'deadly',
    challengeRating: 12,
    turnBased: {
      duration: 2,
      initiative: 'attribute',
      timing: 'conditional',
      sequencing: 'sequential'
    },
    enemyRelationships: {
      requiresEnemies: true,
      minEnemyCount: 1,
      specificEnemies: [],
      severityThreshold: 0.9,
      allowNonEnemies: false
    },
    triggers: [
      {
        type: 'probability',
        probability: 0.05
      }
    ],
    outcomes: [
      {
        description: 'Detect and neutralize the assassin',
        probability: 0.35,
        effects: [
          { type: 'experience', value: 400 },
          { type: 'reputation', value: 15 },
          { type: 'influence', value: 20 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Narrowly survive the attempt',
        probability: 0.4,
        effects: [
          { type: 'health', value: -60 },
          { type: 'experience', value: 200 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      },
      {
        description: 'Critically wounded by assassin',
        probability: 0.25,
        effects: [
          { type: 'health', value: -90 },
          { type: 'influence', value: -30 }
        ],
        turnDuration: 1,
        timing: 'immediate'
      }
    ],
    prerequisites: [
      { type: 'attribute', attribute: 'dexterity', value: 14 },
      { type: 'attribute', attribute: 'wisdom', value: 13 }
    ]
  }
};

/**
 * Get all enemy encounter templates
 */
export const getAllEnemyEncounterTemplates = () => {
  return Object.values(ENEMY_ENCOUNTER_TEMPLATES);
};

/**
 * Get a specific enemy encounter template by ID
 */
export const getEnemyEncounterTemplate = (id) => {
  return ENEMY_ENCOUNTER_TEMPLATES[id];
};

export default HOSTILE_INTERACTIONS;
