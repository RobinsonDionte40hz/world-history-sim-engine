// src/configs/item-templates.js

/**
 * Pre-built item templates for quick world population
 * Organized by category with balanced properties and effects
 */

export const ITEM_TEMPLATES = {
  // ===== WEAPONS =====
  weapons: {
    longsword: {
      name: 'Longsword',
      description: 'A versatile blade favored by knights and warriors.',
      category: 'weapon',
      rarity: 'common',
      weight: 3,
      value: 15,
      equipmentSlots: ['mainHand'],
      damageDice: '1d8',
      damageType: 'slashing',
      weaponProperties: ['versatile'],
      versatileDice: '1d10',
      requirements: {
        attributes: { strength: 10 }
      },
      metadata: {
        tags: ['melee', 'martial', 'versatile', 'common']
      }
    },

    shortsword: {
      name: 'Shortsword',
      description: 'A light blade perfect for quick strikes.',
      category: 'weapon',
      rarity: 'common',
      weight: 2,
      value: 10,
      equipmentSlots: ['mainHand', 'offHand'],
      damageDice: '1d6',
      damageType: 'piercing',
      weaponProperties: ['light', 'finesse'],
      requirements: {
        attributes: { dexterity: 10 }
      },
      metadata: {
        tags: ['melee', 'martial', 'light', 'finesse']
      }
    },

    greatsword: {
      name: 'Greatsword',
      description: 'A massive two-handed blade that deals devastating damage.',
      category: 'weapon',
      rarity: 'common',
      weight: 6,
      value: 50,
      equipmentSlots: ['mainHand'],
      damageDice: '2d6',
      damageType: 'slashing',
      weaponProperties: ['twoHanded', 'heavy'],
      requirements: {
        attributes: { strength: 14 }
      },
      metadata: {
        tags: ['melee', 'martial', 'two-handed', 'heavy']
      }
    },

    dagger: {
      name: 'Dagger',
      description: 'A small blade useful for both combat and utility.',
      category: 'weapon',
      rarity: 'common',
      weight: 1,
      value: 2,
      equipmentSlots: ['mainHand', 'offHand'],
      damageDice: '1d4',
      damageType: 'piercing',
      weaponProperties: ['light', 'finesse', 'thrown'],
      throwRange: { normal: 20, maximum: 60 },
      requirements: {},
      metadata: {
        tags: ['melee', 'simple', 'light', 'thrown']
      }
    },

    battleaxe: {
      name: 'Battleaxe',
      description: 'A heavy axe designed for cleaving through armor.',
      category: 'weapon',
      rarity: 'common',
      weight: 4,
      value: 10,
      equipmentSlots: ['mainHand'],
      damageDice: '1d8',
      damageType: 'slashing',
      weaponProperties: ['versatile'],
      versatileDice: '1d10',
      requirements: {
        attributes: { strength: 12 }
      },
      metadata: {
        tags: ['melee', 'martial', 'versatile', 'axe']
      }
    },

    longbow: {
      name: 'Longbow',
      description: 'A powerful bow with exceptional range.',
      category: 'weapon',
      rarity: 'common',
      weight: 2,
      value: 50,
      equipmentSlots: ['mainHand'],
      damageDice: '1d8',
      damageType: 'piercing',
      weaponProperties: ['twoHanded', 'ammunition', 'heavy'],
      range: { normal: 150, maximum: 600 },
      requirements: {
        attributes: { strength: 10, dexterity: 12 }
      },
      metadata: {
        tags: ['ranged', 'martial', 'two-handed', 'ammunition']
      }
    },

    crossbow_light: {
      name: 'Light Crossbow',
      description: 'An easy-to-use ranged weapon with decent power.',
      category: 'weapon',
      rarity: 'common',
      weight: 5,
      value: 25,
      equipmentSlots: ['mainHand'],
      damageDice: '1d8',
      damageType: 'piercing',
      weaponProperties: ['ammunition', 'loading', 'twoHanded'],
      range: { normal: 80, maximum: 320 },
      requirements: {},
      metadata: {
        tags: ['ranged', 'simple', 'crossbow', 'ammunition']
      }
    },

    staff: {
      name: 'Quarterstaff',
      description: 'A simple wooden staff useful for both combat and magic.',
      category: 'weapon',
      rarity: 'common',
      weight: 4,
      value: 2,
      equipmentSlots: ['mainHand'],
      damageDice: '1d6',
      damageType: 'bludgeoning',
      weaponProperties: ['versatile'],
      versatileDice: '1d8',
      requirements: {},
      metadata: {
        tags: ['melee', 'simple', 'versatile', 'magic-focus']
      }
    },

    warhammer: {
      name: 'Warhammer',
      description: 'A heavy hammer designed to crush armor and bone.',
      category: 'weapon',
      rarity: 'common',
      weight: 2,
      value: 15,
      equipmentSlots: ['mainHand'],
      damageDice: '1d8',
      damageType: 'bludgeoning',
      weaponProperties: ['versatile'],
      versatileDice: '1d10',
      requirements: {
        attributes: { strength: 12 }
      },
      metadata: {
        tags: ['melee', 'martial', 'versatile', 'bludgeoning']
      }
    },

    rapier: {
      name: 'Rapier',
      description: 'An elegant blade favored by duelists and nobles.',
      category: 'weapon',
      rarity: 'common',
      weight: 2,
      value: 25,
      equipmentSlots: ['mainHand'],
      damageDice: '1d8',
      damageType: 'piercing',
      weaponProperties: ['finesse'],
      requirements: {
        attributes: { dexterity: 12 }
      },
      metadata: {
        tags: ['melee', 'martial', 'finesse', 'dueling']
      }
    }
  },

  // ===== ARMOR =====
  armor: {
    leather_armor: {
      name: 'Leather Armor',
      description: 'Light armor made from tanned hides.',
      category: 'armor',
      rarity: 'common',
      weight: 10,
      value: 10,
      equipmentSlots: ['body'],
      armorClass: 11,
      armorType: 'light',
      requirements: {},
      metadata: {
        tags: ['light', 'armor', 'basic']
      }
    },

    chainmail: {
      name: 'Chainmail',
      description: 'Medium armor made from interlocking metal rings.',
      category: 'armor',
      rarity: 'common',
      weight: 55,
      value: 75,
      equipmentSlots: ['body'],
      armorClass: 16,
      armorType: 'medium',
      requirements: {
        attributes: { strength: 13 }
      },
      metadata: {
        tags: ['medium', 'armor', 'metal']
      }
    },

    plate_armor: {
      name: 'Plate Armor',
      description: 'Heavy armor offering excellent protection.',
      category: 'armor',
      rarity: 'uncommon',
      weight: 65,
      value: 1500,
      equipmentSlots: ['body'],
      armorClass: 18,
      armorType: 'heavy',
      requirements: {
        attributes: { strength: 15 }
      },
      metadata: {
        tags: ['heavy', 'armor', 'metal', 'expensive']
      }
    },

    shield_wooden: {
      name: 'Wooden Shield',
      description: 'A basic shield that provides modest protection.',
      category: 'armor',
      rarity: 'common',
      weight: 6,
      value: 10,
      equipmentSlots: ['offHand'],
      armorClass: 2,
      armorType: 'shield',
      requirements: {},
      metadata: {
        tags: ['shield', 'basic', 'wooden']
      }
    },

    shield_steel: {
      name: 'Steel Shield',
      description: 'A sturdy metal shield offering excellent defense.',
      category: 'armor',
      rarity: 'common',
      weight: 10,
      value: 25,
      equipmentSlots: ['offHand'],
      armorClass: 3,
      armorType: 'shield',
      requirements: {
        attributes: { strength: 10 }
      },
      metadata: {
        tags: ['shield', 'metal', 'durable']
      }
    }
  },

  // ===== CONSUMABLES =====
  consumables: {
    health_potion_minor: {
      name: 'Minor Healing Potion',
      description: 'A small vial that restores a modest amount of health.',
      category: 'consumable',
      rarity: 'common',
      weight: 0.5,
      value: 50,
      stackable: true,
      maxStack: 10,
      charges: 1,
      effects: [
        {
          type: 'heal',
          target: 'self',
          value: '2d4+2',
          condition: 'on_use',
          description: 'Restores 2d4+2 hit points'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'healing', 'potion', 'common']
      }
    },

    health_potion: {
      name: 'Healing Potion',
      description: 'A standard healing potion that restores vitality.',
      category: 'consumable',
      rarity: 'common',
      weight: 0.5,
      value: 100,
      stackable: true,
      maxStack: 10,
      charges: 1,
      effects: [
        {
          type: 'heal',
          target: 'self',
          value: '4d4+4',
          condition: 'on_use',
          description: 'Restores 4d4+4 hit points'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'healing', 'potion']
      }
    },

    health_potion_greater: {
      name: 'Greater Healing Potion',
      description: 'A powerful potion that rapidly restores health.',
      category: 'consumable',
      rarity: 'uncommon',
      weight: 0.5,
      value: 250,
      stackable: true,
      maxStack: 5,
      charges: 1,
      effects: [
        {
          type: 'heal',
          target: 'self',
          value: '8d4+8',
          condition: 'on_use',
          description: 'Restores 8d4+8 hit points'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'healing', 'potion', 'powerful']
      }
    },

    mana_potion: {
      name: 'Mana Potion',
      description: 'A glowing blue liquid that restores magical energy.',
      category: 'consumable',
      rarity: 'common',
      weight: 0.5,
      value: 100,
      stackable: true,
      maxStack: 10,
      charges: 1,
      effects: [
        {
          type: 'restore_resource',
          target: 'self',
          resource: 'mana',
          value: 50,
          condition: 'on_use',
          description: 'Restores 50 mana'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'mana', 'potion', 'magic']
      }
    },

    antidote: {
      name: 'Antidote',
      description: 'A bitter concoction that neutralizes poisons.',
      category: 'consumable',
      rarity: 'common',
      weight: 0.5,
      value: 50,
      stackable: true,
      maxStack: 5,
      charges: 1,
      effects: [
        {
          type: 'remove_condition',
          target: 'self',
          condition: 'poisoned',
          duration: 'instant',
          description: 'Removes poisoned condition'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'antidote', 'cure', 'poison']
      }
    },

    elixir_strength: {
      name: 'Elixir of Strength',
      description: 'A red potion that temporarily enhances physical power.',
      category: 'consumable',
      rarity: 'uncommon',
      weight: 0.5,
      value: 150,
      stackable: true,
      maxStack: 3,
      charges: 1,
      effects: [
        {
          type: 'buff',
          target: 'self',
          attribute: 'strength',
          value: 4,
          duration: 3600,
          condition: 'on_use',
          description: '+4 Strength for 1 hour'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'buff', 'strength', 'temporary']
      }
    },

    rations: {
      name: 'Rations',
      description: 'Preserved food suitable for travel.',
      category: 'consumable',
      rarity: 'common',
      weight: 2,
      value: 5,
      stackable: true,
      maxStack: 20,
      charges: 1,
      effects: [
        {
          type: 'satisfy_need',
          target: 'self',
          need: 'food',
          value: 100,
          condition: 'on_use',
          description: 'Satisfies hunger'
        }
      ],
      consumeOnUse: true,
      metadata: {
        tags: ['consumable', 'food', 'survival']
      }
    }
  },

  // ===== TOOLS =====
  tools: {
    lockpicks: {
      name: 'Lockpicks',
      description: 'A set of tools for opening locks.',
      category: 'tool',
      rarity: 'common',
      weight: 0.5,
      value: 25,
      durability: 10,
      maxDurability: 10,
      effects: [
        {
          type: 'skill_bonus',
          target: 'self',
          skill: 'lockpicking',
          value: 5,
          condition: 'when_equipped',
          description: '+5 to lockpicking checks'
        }
      ],
      metadata: {
        tags: ['tool', 'rogue', 'lockpicking']
      }
    },

    rope: {
      name: 'Rope (50 ft)',
      description: 'A sturdy hemp rope useful for climbing and binding.',
      category: 'tool',
      rarity: 'common',
      weight: 10,
      value: 1,
      stackable: false,
      metadata: {
        tags: ['tool', 'utility', 'rope']
      }
    },

    grappling_hook: {
      name: 'Grappling Hook',
      description: 'A metal hook attached to rope for climbing.',
      category: 'tool',
      rarity: 'common',
      weight: 4,
      value: 2,
      stackable: false,
      metadata: {
        tags: ['tool', 'climbing', 'utility']
      }
    },

    torch: {
      name: 'Torch',
      description: 'A wooden stick with burning cloth, providing light.',
      category: 'tool',
      rarity: 'common',
      weight: 1,
      value: 0.1,
      stackable: true,
      maxStack: 10,
      durability: 60,
      maxDurability: 60,
      effects: [
        {
          type: 'provide_light',
          target: 'area',
          radius: 20,
          condition: 'when_equipped',
          description: 'Provides light in 20 ft radius'
        }
      ],
      metadata: {
        tags: ['tool', 'light', 'fire', 'consumable']
      }
    }
  },

  // ===== ACCESSORIES =====
  accessories: {
    ring_protection: {
      name: 'Ring of Protection',
      description: 'A magical ring that enhances the wearer\'s defenses.',
      category: 'accessory',
      rarity: 'rare',
      weight: 0.1,
      value: 3500,
      equipmentSlots: ['ring'],
      effects: [
        {
          type: 'ac_bonus',
          target: 'self',
          value: 1,
          condition: 'when_equipped',
          description: '+1 to AC'
        },
        {
          type: 'saving_throw_bonus',
          target: 'self',
          value: 1,
          condition: 'when_equipped',
          description: '+1 to all saving throws'
        }
      ],
      metadata: {
        tags: ['accessory', 'ring', 'magic', 'protection']
      }
    },

    amulet_health: {
      name: 'Amulet of Health',
      description: 'A necklace that bolsters the wearer\'s vitality.',
      category: 'accessory',
      rarity: 'rare',
      weight: 0.5,
      value: 8000,
      equipmentSlots: ['neck'],
      effects: [
        {
          type: 'set_attribute',
          target: 'self',
          attribute: 'constitution',
          value: 19,
          condition: 'when_equipped',
          description: 'Sets Constitution to 19 (if lower)'
        }
      ],
      metadata: {
        tags: ['accessory', 'amulet', 'magic', 'constitution']
      }
    },

    boots_speed: {
      name: 'Boots of Speed',
      description: 'Enchanted boots that increase movement speed.',
      category: 'accessory',
      rarity: 'rare',
      weight: 1,
      value: 4000,
      equipmentSlots: ['feet'],
      effects: [
        {
          type: 'speed_bonus',
          target: 'self',
          value: 10,
          condition: 'when_equipped',
          description: '+10 ft movement speed'
        }
      ],
      metadata: {
        tags: ['accessory', 'boots', 'magic', 'speed']
      }
    },

    cloak_elvenkind: {
      name: 'Cloak of Elvenkind',
      description: 'A magical cloak that aids in stealth.',
      category: 'accessory',
      rarity: 'uncommon',
      weight: 1,
      value: 1000,
      equipmentSlots: ['back'],
      effects: [
        {
          type: 'skill_bonus',
          target: 'self',
          skill: 'stealth',
          value: 10,
          condition: 'when_equipped',
          description: '+10 to Stealth checks'
        }
      ],
      metadata: {
        tags: ['accessory', 'cloak', 'magic', 'stealth', 'elf']
      }
    }
  },

  // ===== QUEST ITEMS =====
  quest: {
    ancient_key: {
      name: 'Ancient Key',
      description: 'A weathered bronze key with mysterious runes.',
      category: 'quest',
      rarity: 'epic',
      weight: 0.5,
      value: 0,
      questItem: true,
      metadata: {
        tags: ['quest', 'key', 'ancient', 'plot']
      }
    },

    royal_seal: {
      name: 'Royal Seal',
      description: 'An official seal bearing the king\'s crest.',
      category: 'quest',
      rarity: 'rare',
      weight: 0.1,
      value: 0,
      questItem: true,
      metadata: {
        tags: ['quest', 'seal', 'royal', 'authority']
      }
    },

    mysterious_orb: {
      name: 'Mysterious Orb',
      description: 'A glowing sphere that pulses with arcane energy.',
      category: 'quest',
      rarity: 'legendary',
      weight: 5,
      value: 0,
      questItem: true,
      effects: [
        {
          type: 'provide_light',
          target: 'area',
          radius: 10,
          condition: 'passive',
          description: 'Emits magical light'
        }
      ],
      metadata: {
        tags: ['quest', 'orb', 'magic', 'artifact']
      }
    }
  },

  // ===== CRAFTING MATERIALS =====
  materials: {
    iron_ore: {
      name: 'Iron Ore',
      description: 'Raw iron extracted from mines.',
      category: 'material',
      rarity: 'common',
      weight: 5,
      value: 5,
      stackable: true,
      maxStack: 50,
      metadata: {
        tags: ['material', 'ore', 'metal', 'crafting']
      }
    },

    leather: {
      name: 'Leather',
      description: 'Tanned animal hide suitable for crafting.',
      category: 'material',
      rarity: 'common',
      weight: 2,
      value: 2,
      stackable: true,
      maxStack: 50,
      metadata: {
        tags: ['material', 'leather', 'crafting']
      }
    },

    magical_essence: {
      name: 'Magical Essence',
      description: 'Concentrated magical energy in crystalline form.',
      category: 'material',
      rarity: 'rare',
      weight: 0.1,
      value: 100,
      stackable: true,
      maxStack: 10,
      metadata: {
        tags: ['material', 'magic', 'essence', 'enchanting']
      }
    },

    dragon_scale: {
      name: 'Dragon Scale',
      description: 'A scale from a mighty dragon, incredibly durable.',
      category: 'material',
      rarity: 'legendary',
      weight: 1,
      value: 1000,
      stackable: true,
      maxStack: 5,
      metadata: {
        tags: ['material', 'dragon', 'scale', 'rare', 'crafting']
      }
    }
  }
};

/**
 * Get all item templates as a flat array
 */
export function getAllItemTemplates() {
  const items = [];
  for (const category in ITEM_TEMPLATES) {
    for (const key in ITEM_TEMPLATES[category]) {
      items.push({
        ...ITEM_TEMPLATES[category][key],
        templateKey: key,
        templateCategory: category
      });
    }
  }
  return items;
}

/**
 * Get item templates by category
 */
export function getItemTemplatesByCategory(category) {
  return ITEM_TEMPLATES[category] || {};
}

/**
 * Get a specific item template
 */
export function getItemTemplate(category, key) {
  return ITEM_TEMPLATES[category]?.[key] || null;
}

/**
 * Get item templates filtered by tags
 */
export function getItemTemplatesByTags(tags) {
  const items = getAllItemTemplates();
  return items.filter(item => 
    tags.some(tag => item.metadata?.tags?.includes(tag))
  );
}

/**
 * Get item templates by rarity
 */
export function getItemTemplatesByRarity(rarity) {
  const items = getAllItemTemplates();
  return items.filter(item => item.rarity === rarity);
}

/**
 * Item template categories for UI organization
 */
export const ITEM_TEMPLATE_CATEGORIES = {
  weapons: {
    label: 'Weapons',
    description: 'Swords, axes, bows, and other implements of combat',
    icon: 'sword'
  },
  armor: {
    label: 'Armor',
    description: 'Protective gear including armor and shields',
    icon: 'shield'
  },
  consumables: {
    label: 'Consumables',
    description: 'Potions, food, and single-use items',
    icon: 'flask'
  },
  tools: {
    label: 'Tools',
    description: 'Utility items for exploration and problem-solving',
    icon: 'wrench'
  },
  accessories: {
    label: 'Accessories',
    description: 'Magical rings, amulets, and wearable enchantments',
    icon: 'gem'
  },
  quest: {
    label: 'Quest Items',
    description: 'Special story-related items',
    icon: 'scroll'
  },
  materials: {
    label: 'Materials',
    description: 'Crafting components and raw resources',
    icon: 'box'
  }
};

export default ITEM_TEMPLATES;
