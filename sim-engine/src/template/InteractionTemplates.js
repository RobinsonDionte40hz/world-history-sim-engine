/**
 * InteractionTemplates - Pre-built interaction templates for common character types
 * Provides quick interaction creation for traders, guards, innkeepers, etc.
 */

export const INTERACTION_TEMPLATES = {
  // Trader/Merchant Templates
  trader: {
    name: 'Trader',
    description: 'Basic trading interactions',
    interactions: [
      {
        id: 'trade_buy',
        name: 'Buy Items',
        description: 'Purchase items from this trader',
        category: 'trade',
        type: 'buy',
        branches: [
          {
            text: 'What do you have for sale?',
            effects: [{ type: 'trigger', action: 'show_inventory' }]
          },
          {
            text: 'I\'d like to buy something',
            prerequisites: [{ type: 'item', item: 'gold', minimum: 1 }],
            effects: [{ type: 'trigger', action: 'open_shop' }]
          },
          {
            text: 'Not interested right now',
            effects: []
          }
        ],
        prerequisites: [],
        tags: ['trade', 'buy', 'merchant']
      },
      {
        id: 'trade_sell',
        name: 'Sell Items',
        description: 'Sell items to this trader',
        category: 'trade',
        type: 'sell',
        branches: [
          {
            text: 'I have something to sell',
            prerequisites: [{ type: 'inventory', minimum: 1 }],
            effects: [{ type: 'trigger', action: 'show_sell_interface' }]
          },
          {
            text: 'What are you buying?',
            effects: [{ type: 'trigger', action: 'show_buy_list' }]
          },
          {
            text: 'Never mind',
            effects: []
          }
        ],
        prerequisites: [],
        tags: ['trade', 'sell', 'merchant']
      },
      {
        id: 'trade_negotiate',
        name: 'Negotiate Prices',
        description: 'Attempt to negotiate better prices',
        category: 'trade',
        type: 'negotiate',
        branches: [
          {
            text: 'Can you give me a better price?',
            prerequisites: [{ type: 'attribute', attribute: 'charisma', minimum: 12 }],
            effects: [
              { type: 'relationship', change: 1 },
              { type: 'trigger', action: 'price_reduction', value: 0.1 }
            ]
          },
          {
            text: 'I\'ll pay your asking price',
            effects: [{ type: 'relationship', change: 2 }]
          }
        ],
        prerequisites: [{ type: 'relationship', minimum: 0 }],
        tags: ['trade', 'negotiate', 'social']
      }
    ]
  },

  // Guard Templates
  guard: {
    name: 'Guard',
    description: 'Security and law enforcement interactions',
    interactions: [
      {
        id: 'guard_halt',
        name: 'Stop and Question',
        description: 'Guard stops and questions the character',
        category: 'social',
        type: 'interrogation',
        branches: [
          {
            text: 'I\'m just passing through',
            prerequisites: [{ type: 'alignment', axis: 'lawChaos', minimum: 0 }],
            effects: [{ type: 'relationship', change: 1 }]
          },
          {
            text: 'Mind your own business',
            prerequisites: [{ type: 'attribute', attribute: 'charisma', minimum: 14 }],
            effects: [
              { type: 'relationship', change: -2 },
              { type: 'trigger', action: 'guard_suspicious' }
            ]
          },
          {
            text: 'Show identification',
            effects: [{ type: 'relationship', change: 2 }]
          }
        ],
        prerequisites: [],
        tags: ['guard', 'law', 'social']
      },
      {
        id: 'guard_report_crime',
        name: 'Report Crime',
        description: 'Report a crime to the guard',
        category: 'social',
        type: 'report',
        branches: [
          {
            text: 'I witnessed a crime',
            effects: [
              { type: 'relationship', change: 3 },
              { type: 'prestige', change: 5 },
              { type: 'trigger', action: 'crime_investigation' }
            ]
          },
          {
            text: 'I was robbed',
            effects: [
              { type: 'quest', action: 'start', questId: 'recover_stolen_goods' },
              { type: 'relationship', change: 1 }
            ]
          }
        ],
        prerequisites: [],
        tags: ['guard', 'law', 'quest']
      }
    ]
  },

  // Innkeeper Templates
  innkeeper: {
    name: 'Innkeeper',
    description: 'Hospitality and information interactions',
    interactions: [
      {
        id: 'inn_room',
        name: 'Rent Room',
        description: 'Rent a room for the night',
        category: 'trade',
        type: 'service',
        branches: [
          {
            text: 'I need a room for the night',
            prerequisites: [{ type: 'item', item: 'gold', minimum: 5 }],
            effects: [
              { type: 'item', action: 'take', item: 'gold', quantity: 5 },
              { type: 'trigger', action: 'rest_at_inn' }
            ]
          },
          {
            text: 'What are your rates?',
            effects: [{ type: 'trigger', action: 'show_room_prices' }]
          },
          {
            text: 'Maybe later',
            effects: []
          }
        ],
        prerequisites: [],
        tags: ['inn', 'service', 'rest']
      },
      {
        id: 'inn_food',
        name: 'Order Food',
        description: 'Order food and drink',
        category: 'trade',
        type: 'service',
        branches: [
          {
            text: 'I\'ll have your finest meal',
            prerequisites: [{ type: 'item', item: 'gold', minimum: 3 }],
            effects: [
              { type: 'item', action: 'take', item: 'gold', quantity: 3 },
              { type: 'attribute', attribute: 'health', change: 10 }
            ]
          },
          {
            text: 'Just some bread and ale',
            prerequisites: [{ type: 'item', item: 'gold', minimum: 1 }],
            effects: [
              { type: 'item', action: 'take', item: 'gold', quantity: 1 },
              { type: 'attribute', attribute: 'health', change: 5 }
            ]
          }
        ],
        prerequisites: [],
        tags: ['inn', 'food', 'service']
      },
      {
        id: 'inn_gossip',
        name: 'Local Gossip',
        description: 'Learn about local events and rumors',
        category: 'social',
        type: 'information',
        branches: [
          {
            text: 'What\'s the local news?',
            effects: [
              { type: 'memory', description: 'Learned local gossip', importance: 'normal' },
              { type: 'trigger', action: 'share_rumors' }
            ]
          },
          {
            text: 'Any interesting travelers lately?',
            effects: [{ type: 'trigger', action: 'traveler_info' }]
          }
        ],
        prerequisites: [{ type: 'relationship', minimum: 5 }],
        tags: ['inn', 'gossip', 'information']
      }
    ]
  },

  // Blacksmith Templates
  blacksmith: {
    name: 'Blacksmith',
    description: 'Weapon and armor crafting interactions',
    interactions: [
      {
        id: 'smith_repair',
        name: 'Repair Equipment',
        description: 'Repair damaged weapons and armor',
        category: 'trade',
        type: 'service',
        branches: [
          {
            text: 'Can you repair this?',
            prerequisites: [
              { type: 'inventory', damaged: true },
              { type: 'item', item: 'gold', minimum: 10 }
            ],
            effects: [
              { type: 'item', action: 'take', item: 'gold', quantity: 10 },
              { type: 'trigger', action: 'repair_equipment' }
            ]
          },
          {
            text: 'How much for repairs?',
            effects: [{ type: 'trigger', action: 'show_repair_prices' }]
          }
        ],
        prerequisites: [],
        tags: ['blacksmith', 'repair', 'service']
      },
      {
        id: 'smith_craft',
        name: 'Commission Weapon',
        description: 'Order a custom weapon or armor',
        category: 'trade',
        type: 'craft',
        branches: [
          {
            text: 'I need a custom weapon',
            prerequisites: [{ type: 'item', item: 'gold', minimum: 50 }],
            effects: [
              { type: 'quest', action: 'start', questId: 'custom_weapon' },
              { type: 'relationship', change: 3 }
            ]
          },
          {
            text: 'What can you make?',
            effects: [{ type: 'trigger', action: 'show_craft_options' }]
          }
        ],
        prerequisites: [{ type: 'relationship', minimum: 10 }],
        tags: ['blacksmith', 'craft', 'custom']
      }
    ]
  },

  // Priest/Cleric Templates
  priest: {
    name: 'Priest',
    description: 'Spiritual and healing interactions',
    interactions: [
      {
        id: 'priest_heal',
        name: 'Request Healing',
        description: 'Ask for divine healing',
        category: 'social',
        type: 'service',
        branches: [
          {
            text: 'I need healing',
            prerequisites: [{ type: 'attribute', attribute: 'health', maximum: 80 }],
            effects: [
              { type: 'attribute', attribute: 'health', change: 25 },
              { type: 'relationship', change: 2 }
            ]
          },
          {
            text: 'Bless my journey',
            effects: [
              { type: 'consciousness', aspect: 'coherence', change: 0.1 },
              { type: 'memory', description: 'Received blessing', importance: 'normal' }
            ]
          }
        ],
        prerequisites: [{ type: 'alignment', axis: 'goodEvil', minimum: 0 }],
        tags: ['priest', 'healing', 'blessing']
      },
      {
        id: 'priest_confession',
        name: 'Confession',
        description: 'Confess sins and seek absolution',
        category: 'social',
        type: 'spiritual',
        branches: [
          {
            text: 'I have sinned',
            prerequisites: [{ type: 'alignment', axis: 'goodEvil', maximum: -10 }],
            effects: [
              { type: 'alignment', axis: 'goodEvil', shift: 10 },
              { type: 'consciousness', aspect: 'coherence', change: 0.2 }
            ]
          },
          {
            text: 'Seek guidance',
            effects: [
              { type: 'memory', description: 'Received spiritual guidance', importance: 'important' },
              { type: 'relationship', change: 3 }
            ]
          }
        ],
        prerequisites: [],
        tags: ['priest', 'confession', 'spiritual']
      }
    ]
  },

  // Scholar/Sage Templates
  scholar: {
    name: 'Scholar',
    description: 'Knowledge and research interactions',
    interactions: [
      {
        id: 'scholar_research',
        name: 'Research Topic',
        description: 'Research a specific topic or question',
        category: 'social',
        type: 'information',
        branches: [
          {
            text: 'I need information about...',
            prerequisites: [{ type: 'item', item: 'gold', minimum: 20 }],
            effects: [
              { type: 'item', action: 'take', item: 'gold', quantity: 20 },
              { type: 'memory', description: 'Learned valuable information', importance: 'important' },
              { type: 'trigger', action: 'research_results' }
            ]
          },
          {
            text: 'What do you study?',
            effects: [{ type: 'trigger', action: 'scholar_specialties' }]
          }
        ],
        prerequisites: [{ type: 'attribute', attribute: 'intelligence', minimum: 12 }],
        tags: ['scholar', 'research', 'knowledge']
      },
      {
        id: 'scholar_teach',
        name: 'Learn Skill',
        description: 'Learn a new skill or improve existing one',
        category: 'social',
        type: 'training',
        branches: [
          {
            text: 'Teach me your knowledge',
            prerequisites: [
              { type: 'item', item: 'gold', minimum: 100 },
              { type: 'attribute', attribute: 'intelligence', minimum: 14 }
            ],
            effects: [
              { type: 'item', action: 'take', item: 'gold', quantity: 100 },
              { type: 'skill', skill: 'knowledge', change: 1 },
              { type: 'relationship', change: 5 }
            ]
          }
        ],
        prerequisites: [{ type: 'relationship', minimum: 15 }],
        tags: ['scholar', 'teaching', 'skill']
      }
    ]
  }
};

/**
 * Get interaction templates for a specific character type
 */
export const getInteractionTemplatesForType = (characterType) => {
  const typeKey = characterType.toLowerCase();
  return INTERACTION_TEMPLATES[typeKey] || null;
};

/**
 * Get all available character types with interaction templates
 */
export const getAvailableCharacterTypes = () => {
  return Object.keys(INTERACTION_TEMPLATES).map(key => ({
    id: key,
    name: INTERACTION_TEMPLATES[key].name,
    description: INTERACTION_TEMPLATES[key].description,
    interactionCount: INTERACTION_TEMPLATES[key].interactions.length
  }));
};

/**
 * Create interaction instances from templates with custom IDs
 */
export const createInteractionsFromTemplate = (characterType, characterId) => {
  const template = getInteractionTemplatesForType(characterType);
  if (!template) return [];

  return template.interactions.map((interaction, index) => ({
    ...interaction,
    id: `${characterId}_${interaction.id}_${Date.now()}_${index}`,
    characterId,
    createdFrom: 'template',
    templateType: characterType
  }));
};

/**
 * Get quick interaction options for any character type
 */
export const getQuickInteractionOptions = () => [
  {
    id: 'basic_talk',
    name: 'Basic Conversation',
    description: 'Simple dialogue interaction',
    category: 'dialogue',
    template: {
      name: 'Talk',
      description: 'Have a conversation with this character',
      branches: [
        { text: 'Hello', effects: [{ type: 'relationship', change: 1 }] },
        { text: 'How are you?', effects: [{ type: 'relationship', change: 1 }] },
        { text: 'Goodbye', effects: [] }
      ]
    }
  },
  {
    id: 'basic_trade',
    name: 'Simple Trade',
    description: 'Basic buying/selling interaction',
    category: 'trade',
    template: {
      name: 'Trade',
      description: 'Trade items with this character',
      branches: [
        { 
          text: 'What do you have?', 
          effects: [{ type: 'trigger', action: 'show_inventory' }] 
        },
        { 
          text: 'I want to sell something', 
          effects: [{ type: 'trigger', action: 'show_sell_interface' }] 
        },
        { text: 'Not interested', effects: [] }
      ]
    }
  },
  {
    id: 'basic_info',
    name: 'Ask for Information',
    description: 'Get information from this character',
    category: 'social',
    template: {
      name: 'Ask Information',
      description: 'Ask this character for information',
      branches: [
        { 
          text: 'Tell me about this place', 
          effects: [{ type: 'memory', description: 'Learned about location', importance: 'normal' }] 
        },
        { 
          text: 'Any news?', 
          effects: [{ type: 'trigger', action: 'share_news' }] 
        },
        { text: 'Never mind', effects: [] }
      ]
    }
  }
];

export default INTERACTION_TEMPLATES;