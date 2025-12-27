// src/configs/entity-templates.js

/**
 * Pre-built entity templates for quick world population
 * Organized by creature type with balanced CR ratings and abilities
 */

export const ENTITY_TEMPLATES = {
  // ===== HUMANOIDS =====
  humanoid: {
    orc_warrior: {
      name: 'Orc Warrior',
      description: 'A brutal warrior from the orc tribes, known for their ferocity in battle.',
      type: 'humanoid',
      subtype: 'orc',
      size: 'medium',
      challengeRating: 1,
      attributes: {
        strength: 16,
        dexterity: 12,
        constitution: 16,
        intelligence: 7,
        wisdom: 11,
        charisma: 10
      },
      combat: {
        armorClass: 13,
        hitPoints: 15,
        maxHitPoints: 15,
        speed: 30,
        initiative: 1
      },
      skills: {
        intimidation: 2,
        survival: 1
      },
      abilities: ['Aggressive', 'Darkvision'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'low',
        tactics: 'direct',
        morale: 70,
        socialability: 'horde'
      },
      loot: {
        guaranteed: ['Battleaxe', 'Hide Armor'],
        possible: ['Healing Potion'],
        currency: 15,
        experience: 200
      },
      isHostile: true,
      territoryBehavior: 'patrol',
      metadata: {
        tags: ['melee', 'tribal', 'aggressive', 'starter_enemy']
      }
    },

    bandit: {
      name: 'Bandit',
      description: 'A desperate outlaw who preys on travelers and merchants.',
      type: 'humanoid',
      subtype: 'human',
      size: 'medium',
      challengeRating: 0.5,
      attributes: {
        strength: 11,
        dexterity: 14,
        constitution: 12,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      combat: {
        armorClass: 12,
        hitPoints: 11,
        maxHitPoints: 11,
        speed: 30,
        initiative: 2
      },
      skills: {
        stealth: 2,
        deception: 1
      },
      abilities: ['Sneak Attack', 'Cunning Action'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'neutral',
        intelligence: 'medium',
        tactics: 'ambush',
        morale: 40,
        socialability: 'pack'
      },
      loot: {
        guaranteed: ['Shortsword', 'Leather Armor'],
        possible: ['Lockpicks', 'Stolen Goods'],
        currency: 25,
        experience: 100
      },
      isHostile: true,
      territoryBehavior: 'patrol',
      metadata: {
        tags: ['melee', 'stealth', 'human', 'criminal']
      }
    },

    city_guard: {
      name: 'City Guard',
      description: 'A trained soldier who maintains law and order in settlements.',
      type: 'humanoid',
      subtype: 'human',
      size: 'medium',
      challengeRating: 1,
      attributes: {
        strength: 13,
        dexterity: 12,
        constitution: 12,
        intelligence: 10,
        wisdom: 11,
        charisma: 10
      },
      combat: {
        armorClass: 16,
        hitPoints: 11,
        maxHitPoints: 11,
        speed: 30,
        initiative: 1
      },
      skills: {
        perception: 2,
        athletics: 1
      },
      abilities: ['Guard Formation', 'Disciplined'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'defensive',
        intelligence: 'medium',
        tactics: 'direct',
        morale: 60,
        socialability: 'pack'
      },
      loot: {
        guaranteed: ['Spear', 'Chain Shirt', 'Shield'],
        possible: ['Healing Potion', 'Signal Horn'],
        currency: 10,
        experience: 200
      },
      isHostile: false,
      territoryBehavior: 'guard',
      metadata: {
        tags: ['melee', 'lawful', 'disciplined', 'neutral']
      }
    },

    goblin_scout: {
      name: 'Goblin Scout',
      description: 'A sneaky goblin that scouts for larger war parties.',
      type: 'humanoid',
      subtype: 'goblinoid',
      size: 'small',
      challengeRating: 0.25,
      attributes: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8
      },
      combat: {
        armorClass: 13,
        hitPoints: 7,
        maxHitPoints: 7,
        speed: 30,
        initiative: 2
      },
      skills: {
        stealth: 4,
        survival: 1
      },
      abilities: ['Nimble Escape', 'Darkvision'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'neutral',
        intelligence: 'medium',
        tactics: 'ambush',
        morale: 30,
        socialability: 'horde'
      },
      loot: {
        guaranteed: ['Shortbow', 'Leather Armor'],
        possible: ['Arrows'],
        currency: 5,
        experience: 50
      },
      isHostile: true,
      territoryBehavior: 'roam',
      metadata: {
        tags: ['ranged', 'stealth', 'cowardly', 'tribal']
      }
    },

    skeleton_warrior: {
      name: 'Skeleton Warrior',
      description: 'An animated skeleton wielding ancient weapons.',
      type: 'undead',
      subtype: 'skeleton',
      size: 'medium',
      challengeRating: 0.25,
      attributes: {
        strength: 10,
        dexterity: 14,
        constitution: 15,
        intelligence: 6,
        wisdom: 8,
        charisma: 5
      },
      combat: {
        armorClass: 13,
        hitPoints: 13,
        maxHitPoints: 13,
        speed: 30,
        initiative: 2
      },
      skills: {},
      abilities: ['Undead Fortitude', 'Darkvision'],
      resistances: [],
      immunities: ['poison', 'psychic'],
      vulnerabilities: ['fire'],
      behavior: {
        temperament: 'neutral',
        intelligence: 'low',
        tactics: 'direct',
        morale: 100,
        socialability: 'horde'
      },
      loot: {
        guaranteed: ['Rusty Sword', 'Bone Fragments'],
        possible: ['Ancient Coin'],
        currency: 0,
        experience: 50
      },
      isHostile: true,
      territoryBehavior: 'guard',
      metadata: {
        tags: ['undead', 'melee', 'fearless', 'necromancy']
      }
    }
  },

  // ===== BEASTS =====
  beast: {
    gray_wolf: {
      name: 'Gray Wolf',
      description: 'A fierce predator that hunts in packs through forests and plains.',
      type: 'beast',
      subtype: 'wolf',
      size: 'medium',
      challengeRating: 0.25,
      attributes: {
        strength: 12,
        dexterity: 15,
        constitution: 12,
        intelligence: 3,
        wisdom: 12,
        charisma: 6
      },
      combat: {
        armorClass: 13,
        hitPoints: 11,
        maxHitPoints: 11,
        speed: 40,
        initiative: 2
      },
      skills: {
        perception: 3,
        stealth: 4
      },
      abilities: ['Pack Tactics', 'Keen Hearing and Smell'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'low',
        tactics: 'direct',
        morale: 50,
        socialability: 'pack'
      },
      loot: {
        guaranteed: ['Wolf Pelt'],
        possible: ['Wolf Fang'],
        currency: 0,
        experience: 50
      },
      isHostile: true,
      territoryBehavior: 'roam',
      metadata: {
        tags: ['beast', 'pack_hunter', 'fast', 'forest']
      }
    },

    cave_bear: {
      name: 'Cave Bear',
      description: 'A massive bear that fiercely defends its territory.',
      type: 'beast',
      subtype: 'bear',
      size: 'large',
      challengeRating: 2,
      attributes: {
        strength: 19,
        dexterity: 10,
        constitution: 16,
        intelligence: 2,
        wisdom: 13,
        charisma: 7
      },
      combat: {
        armorClass: 12,
        hitPoints: 42,
        maxHitPoints: 42,
        speed: 40,
        initiative: 0
      },
      skills: {
        perception: 3
      },
      abilities: ['Multiattack', 'Keen Smell'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'defensive',
        intelligence: 'low',
        tactics: 'direct',
        morale: 80,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: ['Bear Pelt', 'Bear Claws'],
        possible: ['Bear Meat'],
        currency: 0,
        experience: 450
      },
      isHostile: false,
      territoryBehavior: 'guard',
      metadata: {
        tags: ['beast', 'powerful', 'territorial', 'cave']
      }
    },

    giant_spider: {
      name: 'Giant Spider',
      description: 'A monstrous arachnid that lurks in dark places.',
      type: 'beast',
      subtype: 'spider',
      size: 'large',
      challengeRating: 1,
      attributes: {
        strength: 14,
        dexterity: 16,
        constitution: 12,
        intelligence: 2,
        wisdom: 11,
        charisma: 4
      },
      combat: {
        armorClass: 14,
        hitPoints: 26,
        maxHitPoints: 26,
        speed: 30,
        initiative: 3
      },
      skills: {
        stealth: 5
      },
      abilities: ['Web Sense', 'Web Walker', 'Spider Climb'],
      resistances: [],
      immunities: [],
      vulnerabilities: ['fire'],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'low',
        tactics: 'ambush',
        morale: 60,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: ['Spider Silk', 'Venom Gland'],
        possible: ['Web Sac'],
        currency: 0,
        experience: 200
      },
      isHostile: true,
      territoryBehavior: 'guard',
      metadata: {
        tags: ['beast', 'ambush', 'poison', 'web', 'cave']
      }
    },

    dire_wolf: {
      name: 'Dire Wolf',
      description: 'An enormous wolf, larger and more savage than its common kin.',
      type: 'beast',
      subtype: 'wolf',
      size: 'large',
      challengeRating: 1,
      attributes: {
        strength: 17,
        dexterity: 15,
        constitution: 15,
        intelligence: 3,
        wisdom: 12,
        charisma: 7
      },
      combat: {
        armorClass: 14,
        hitPoints: 37,
        maxHitPoints: 37,
        speed: 50,
        initiative: 2
      },
      skills: {
        perception: 3,
        stealth: 4
      },
      abilities: ['Pack Tactics', 'Keen Hearing and Smell'],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'low',
        tactics: 'direct',
        morale: 60,
        socialability: 'pack'
      },
      loot: {
        guaranteed: ['Dire Wolf Pelt'],
        possible: ['Dire Wolf Fang'],
        currency: 0,
        experience: 200
      },
      isHostile: true,
      territoryBehavior: 'roam',
      metadata: {
        tags: ['beast', 'pack_hunter', 'fast', 'powerful']
      }
    }
  },

  // ===== CONSTRUCTS =====
  construct: {
    animated_armor: {
      name: 'Animated Armor',
      description: 'A suit of armor magically animated to guard its creator.',
      type: 'construct',
      subtype: 'animated object',
      size: 'medium',
      challengeRating: 1,
      attributes: {
        strength: 14,
        dexterity: 11,
        constitution: 13,
        intelligence: 1,
        wisdom: 3,
        charisma: 1
      },
      combat: {
        armorClass: 18,
        hitPoints: 33,
        maxHitPoints: 33,
        speed: 25,
        initiative: 0
      },
      skills: {},
      abilities: ['Antimagic Susceptibility', 'False Appearance'],
      resistances: [],
      immunities: ['poison', 'psychic'],
      vulnerabilities: [],
      behavior: {
        temperament: 'neutral',
        intelligence: 'low',
        tactics: 'direct',
        morale: 100,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: ['Plate Armor Pieces'],
        possible: ['Enchanted Metal'],
        currency: 0,
        experience: 200
      },
      isHostile: true,
      territoryBehavior: 'guard',
      metadata: {
        tags: ['construct', 'magical', 'guardian', 'fearless']
      }
    }
  },

  // ===== ABERRATIONS =====
  aberration: {
    intellect_devourer: {
      name: 'Intellect Devourer',
      description: 'A brain-like creature that feeds on intelligence and memories.',
      type: 'aberration',
      subtype: 'aberration',
      size: 'tiny',
      challengeRating: 2,
      attributes: {
        strength: 6,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 11,
        charisma: 10
      },
      combat: {
        armorClass: 12,
        hitPoints: 21,
        maxHitPoints: 21,
        speed: 40,
        initiative: 2
      },
      skills: {
        perception: 2,
        stealth: 4
      },
      abilities: ['Detect Sentience', 'Body Thief', 'Devour Intellect'],
      resistances: ['physical'],
      immunities: ['psychic'],
      vulnerabilities: [],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'high',
        tactics: 'ambush',
        morale: 70,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: [],
        possible: ['Aberrant Essence'],
        currency: 0,
        experience: 450
      },
      isHostile: true,
      territoryBehavior: 'roam',
      metadata: {
        tags: ['aberration', 'psychic', 'intelligent', 'horror']
      }
    }
  },

  // ===== ELEMENTALS =====
  elemental: {
    fire_elemental: {
      name: 'Fire Elemental',
      description: 'A being of pure flame that scorches everything it touches.',
      type: 'elemental',
      subtype: 'fire',
      size: 'large',
      challengeRating: 5,
      attributes: {
        strength: 10,
        dexterity: 17,
        constitution: 16,
        intelligence: 6,
        wisdom: 10,
        charisma: 7
      },
      combat: {
        armorClass: 13,
        hitPoints: 102,
        maxHitPoints: 102,
        speed: 50,
        initiative: 3
      },
      skills: {},
      abilities: ['Fire Form', 'Illumination', 'Water Susceptibility'],
      resistances: ['physical'],
      immunities: ['fire', 'poison'],
      vulnerabilities: ['cold'],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'low',
        tactics: 'direct',
        morale: 100,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: ['Fire Essence'],
        possible: ['Eternal Ember'],
        currency: 0,
        experience: 1800
      },
      isHostile: true,
      territoryBehavior: 'roam',
      metadata: {
        tags: ['elemental', 'fire', 'powerful', 'magical']
      }
    }
  },

  // ===== DRAGONS =====
  dragon: {
    young_dragon: {
      name: 'Young Dragon',
      description: 'A majestic dragon in its youth, still formidable and cunning.',
      type: 'dragon',
      subtype: 'red dragon',
      size: 'large',
      challengeRating: 10,
      attributes: {
        strength: 23,
        dexterity: 10,
        constitution: 21,
        intelligence: 14,
        wisdom: 11,
        charisma: 19
      },
      combat: {
        armorClass: 18,
        hitPoints: 178,
        maxHitPoints: 178,
        speed: 40,
        initiative: 0
      },
      skills: {
        perception: 6,
        stealth: 4
      },
      abilities: ['Multiattack', 'Fire Breath', 'Frightful Presence', 'Legendary Resistance'],
      resistances: [],
      immunities: ['fire'],
      vulnerabilities: [],
      behavior: {
        temperament: 'aggressive',
        intelligence: 'high',
        tactics: 'ranged',
        morale: 90,
        socialability: 'solitary'
      },
      loot: {
        guaranteed: ['Dragon Scale', 'Dragon Claw'],
        possible: ['Dragon Hoard Treasure', 'Magic Item'],
        currency: 5000,
        experience: 5900
      },
      isHostile: true,
      territoryBehavior: 'guard',
      metadata: {
        tags: ['dragon', 'powerful', 'intelligent', 'treasure', 'legendary']
      }
    }
  }
};

/**
 * Get all templates as a flat array
 */
export function getAllTemplates() {
  const templates = [];
  Object.entries(ENTITY_TEMPLATES).forEach(([category, entities]) => {
    Object.entries(entities).forEach(([key, template]) => {
      templates.push({
        id: `${category}_${key}`,
        category,
        key,
        ...template
      });
    });
  });
  return templates;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
  return ENTITY_TEMPLATES[category] || {};
}

/**
 * Get a specific template
 */
export function getTemplate(category, key) {
  return ENTITY_TEMPLATES[category]?.[key] || null;
}

/**
 * Get templates filtered by tags
 */
export function getTemplatesByTags(tags) {
  return getAllTemplates().filter(template =>
    tags.some(tag => template.metadata.tags.includes(tag))
  );
}

/**
 * Get templates by CR range
 */
export function getTemplatesByCR(minCR, maxCR) {
  return getAllTemplates().filter(template =>
    template.challengeRating >= minCR && template.challengeRating <= maxCR
  );
}

/**
 * Template categories for UI organization
 */
export const TEMPLATE_CATEGORIES = {
  humanoid: {
    label: 'Humanoids',
    description: 'Intelligent bipedal creatures including orcs, bandits, and guards',
    icon: 'users'
  },
  beast: {
    label: 'Beasts',
    description: 'Natural animals and predators like wolves, bears, and spiders',
    icon: 'paw-print'
  },
  undead: {
    label: 'Undead',
    description: 'Reanimated creatures like skeletons, zombies, and ghosts',
    icon: 'skull'
  },
  construct: {
    label: 'Constructs',
    description: 'Artificial beings created through magic or technology',
    icon: 'cog'
  },
  aberration: {
    label: 'Aberrations',
    description: 'Unnatural creatures from beyond reality',
    icon: 'eye'
  },
  elemental: {
    label: 'Elementals',
    description: 'Beings of pure elemental energy',
    icon: 'flame'
  },
  dragon: {
    label: 'Dragons',
    description: 'Powerful draconic creatures',
    icon: 'dragon'
  }
};

export default ENTITY_TEMPLATES;
