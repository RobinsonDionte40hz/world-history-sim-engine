// src/configs/ability-templates.js

/**
 * Pre-built ability templates for quick character/entity creation
 * Organized by type with balanced costs, effects, and cooldowns
 */

export const ABILITY_TEMPLATES = {
  // ===== COMBAT ABILITIES =====
  combat: {
    power_attack: {
      name: 'Power Attack',
      description: 'A devastating strike that trades accuracy for raw damage.',
      type: 'active',
      targetType: 'single',
      range: 5,
      costs: {
        energy: 20
      },
      cooldown: 2,
      effects: {
        success: [
          {
            type: 'damage',
            value: '2d8+STR',
            damageType: 'physical',
            description: 'Deals 2d8 + Strength modifier damage'
          }
        ]
      },
      requirements: {
        attributes: { strength: 14 }
      },
      metadata: {
        tags: ['combat', 'melee', 'damage', 'physical']
      }
    },

    cleave: {
      name: 'Cleave',
      description: 'Sweep your weapon through multiple nearby enemies.',
      type: 'active',
      targetType: 'area',
      range: 5,
      areaOfEffect: { shape: 'cone', size: 10 },
      costs: {
        energy: 30
      },
      cooldown: 3,
      effects: {
        success: [
          {
            type: 'damage',
            value: '1d8+STR',
            damageType: 'slashing',
            description: 'Deals 1d8 + Strength damage to all targets in cone'
          }
        ]
      },
      requirements: {
        attributes: { strength: 15 },
        level: 5
      },
      metadata: {
        tags: ['combat', 'aoe', 'melee', 'slashing']
      }
    },

    precise_strike: {
      name: 'Precise Strike',
      description: 'A carefully aimed attack targeting vital points.',
      type: 'active',
      targetType: 'single',
      range: 5,
      costs: {
        energy: 15
      },
      cooldown: 2,
      effects: {
        success: [
          {
            type: 'damage',
            value: '1d8+DEX',
            damageType: 'piercing',
            description: 'Deals 1d8 + Dexterity damage'
          }
        ],
        critical: [
          {
            type: 'damage',
            value: '3d8+DEX',
            damageType: 'piercing',
            description: 'Critical: Triple damage dice'
          }
        ]
      },
      requirements: {
        attributes: { dexterity: 14 }
      },
      metadata: {
        tags: ['combat', 'finesse', 'precision', 'critical']
      }
    },

    shield_bash: {
      name: 'Shield Bash',
      description: 'Slam your shield into an enemy, potentially stunning them.',
      type: 'active',
      targetType: 'single',
      range: 5,
      costs: {
        energy: 10
      },
      cooldown: 2,
      effects: {
        success: [
          {
            type: 'damage',
            value: '1d6+STR',
            damageType: 'bludgeoning',
            description: 'Deals 1d6 + Strength damage'
          },
          {
            type: 'condition',
            condition: 'stunned',
            duration: 1,
            chance: 0.5,
            description: '50% chance to stun for 1 turn'
          }
        ]
      },
      requirements: {
        attributes: { strength: 12 },
        equipment: { slot: 'offHand', type: 'shield' }
      },
      metadata: {
        tags: ['combat', 'control', 'stun', 'shield']
      }
    },

    whirlwind: {
      name: 'Whirlwind',
      description: 'Spin in a devastating circle, hitting all nearby enemies.',
      type: 'active',
      targetType: 'area',
      range: 0,
      areaOfEffect: { shape: 'circle', size: 10 },
      costs: {
        energy: 40
      },
      cooldown: 5,
      effects: {
        success: [
          {
            type: 'damage',
            value: '2d6+STR',
            damageType: 'slashing',
            description: 'Deals 2d6 + Strength damage to all adjacent enemies'
          }
        ]
      },
      requirements: {
        attributes: { strength: 16 },
        level: 8
      },
      metadata: {
        tags: ['combat', 'aoe', 'melee', 'ultimate']
      }
    }
  },

  // ===== MAGIC ABILITIES =====
  magic: {
    fireball: {
      name: 'Fireball',
      description: 'Launch a ball of flame that explodes on impact.',
      type: 'active',
      targetType: 'area',
      range: 150,
      areaOfEffect: { shape: 'sphere', size: 20 },
      costs: {
        mana: 30
      },
      cooldown: 3,
      castTime: 1,
      effects: {
        success: [
          {
            type: 'damage',
            value: '8d6',
            damageType: 'fire',
            description: 'Deals 8d6 fire damage to all in area'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 14 },
        level: 5
      },
      metadata: {
        tags: ['magic', 'fire', 'aoe', 'evocation']
      }
    },

    healing_touch: {
      name: 'Healing Touch',
      description: 'Channel divine energy to mend wounds.',
      type: 'active',
      targetType: 'single',
      range: 5,
      costs: {
        mana: 20
      },
      cooldown: 1,
      castTime: 0,
      effects: {
        success: [
          {
            type: 'heal',
            value: '2d8+WIS',
            description: 'Restores 2d8 + Wisdom hit points'
          }
        ]
      },
      requirements: {
        attributes: { wisdom: 13 },
        level: 1
      },
      metadata: {
        tags: ['magic', 'healing', 'support', 'divine']
      }
    },

    lightning_bolt: {
      name: 'Lightning Bolt',
      description: 'Unleash a stroke of lightning in a line.',
      type: 'active',
      targetType: 'line',
      range: 100,
      areaOfEffect: { shape: 'line', size: 5, length: 100 },
      costs: {
        mana: 25
      },
      cooldown: 2,
      castTime: 1,
      effects: {
        success: [
          {
            type: 'damage',
            value: '6d6',
            damageType: 'lightning',
            description: 'Deals 6d6 lightning damage to all in line'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 14 },
        level: 5
      },
      metadata: {
        tags: ['magic', 'lightning', 'line', 'evocation']
      }
    },

    ice_shard: {
      name: 'Ice Shard',
      description: 'Fire a shard of magical ice at your enemy.',
      type: 'active',
      targetType: 'single',
      range: 60,
      costs: {
        mana: 15
      },
      cooldown: 1,
      castTime: 0,
      effects: {
        success: [
          {
            type: 'damage',
            value: '2d8',
            damageType: 'cold',
            description: 'Deals 2d8 cold damage'
          },
          {
            type: 'condition',
            condition: 'slowed',
            duration: 2,
            chance: 0.6,
            description: '60% chance to slow for 2 turns'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 12 },
        level: 3
      },
      metadata: {
        tags: ['magic', 'cold', 'control', 'evocation']
      }
    },

    shield_spell: {
      name: 'Arcane Shield',
      description: 'Conjure a magical barrier that absorbs damage.',
      type: 'active',
      targetType: 'self',
      range: 0,
      costs: {
        mana: 20
      },
      cooldown: 3,
      castTime: 0,
      effects: {
        success: [
          {
            type: 'shield',
            value: 20,
            duration: 5,
            description: 'Grants 20 temporary hit points for 5 turns'
          },
          {
            type: 'ac_bonus',
            value: 2,
            duration: 5,
            description: '+2 AC for 5 turns'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 13 },
        level: 2
      },
      metadata: {
        tags: ['magic', 'defense', 'abjuration', 'shield']
      }
    },

    teleport: {
      name: 'Teleport',
      description: 'Instantly transport yourself to a nearby location.',
      type: 'active',
      targetType: 'self',
      range: 30,
      costs: {
        mana: 30
      },
      cooldown: 4,
      castTime: 0,
      effects: {
        success: [
          {
            type: 'teleport',
            maxDistance: 30,
            description: 'Teleport up to 30 feet'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 15 },
        level: 7
      },
      metadata: {
        tags: ['magic', 'movement', 'conjuration', 'utility']
      }
    }
  },

  // ===== PASSIVE ABILITIES =====
  passive: {
    iron_will: {
      name: 'Iron Will',
      description: 'Your mental fortitude protects against mind-affecting effects.',
      type: 'passive',
      effects: {
        passive: [
          {
            type: 'saving_throw_bonus',
            savingThrow: 'wisdom',
            value: 2,
            description: '+2 to Wisdom saving throws'
          },
          {
            type: 'resistance',
            damageType: 'psychic',
            description: 'Resistance to psychic damage'
          }
        ]
      },
      requirements: {
        attributes: { wisdom: 14 },
        level: 5
      },
      metadata: {
        tags: ['passive', 'mental', 'resistance', 'wisdom']
      }
    },

    nimble_dodge: {
      name: 'Nimble Dodge',
      description: 'Your reflexes allow you to avoid attacks more easily.',
      type: 'passive',
      effects: {
        passive: [
          {
            type: 'ac_bonus',
            value: 1,
            description: '+1 AC'
          },
          {
            type: 'saving_throw_bonus',
            savingThrow: 'dexterity',
            value: 2,
            description: '+2 to Dexterity saving throws'
          }
        ]
      },
      requirements: {
        attributes: { dexterity: 14 },
        level: 3
      },
      metadata: {
        tags: ['passive', 'defense', 'dexterity', 'ac']
      }
    },

    battle_focus: {
      name: 'Battle Focus',
      description: 'You maintain concentration even in the heat of combat.',
      type: 'passive',
      effects: {
        passive: [
          {
            type: 'concentration_bonus',
            value: 5,
            description: '+5 to concentration checks'
          },
          {
            type: 'critical_chance',
            value: 0.05,
            description: '+5% critical hit chance'
          }
        ]
      },
      requirements: {
        level: 4
      },
      metadata: {
        tags: ['passive', 'combat', 'concentration', 'critical']
      }
    },

    regeneration: {
      name: 'Regeneration',
      description: 'You naturally heal wounds over time.',
      type: 'passive',
      effects: {
        passive: [
          {
            type: 'heal_over_time',
            value: 5,
            interval: 1,
            description: 'Heal 5 HP per turn'
          }
        ]
      },
      requirements: {
        attributes: { constitution: 16 },
        level: 8
      },
      metadata: {
        tags: ['passive', 'healing', 'constitution', 'regeneration']
      }
    },

    lucky: {
      name: 'Lucky',
      description: 'Fortune favors you more than others.',
      type: 'passive',
      effects: {
        passive: [
          {
            type: 'reroll_chance',
            value: 0.1,
            description: '10% chance to reroll failed checks'
          }
        ]
      },
      requirements: {
        attributes: { charisma: 14 },
        level: 5
      },
      metadata: {
        tags: ['passive', 'luck', 'reroll', 'charisma']
      }
    }
  },

  // ===== SUPPORT ABILITIES =====
  support: {
    rally: {
      name: 'Rally',
      description: 'Inspire nearby allies, boosting their morale and combat prowess.',
      type: 'active',
      targetType: 'area',
      range: 30,
      areaOfEffect: { shape: 'sphere', size: 30 },
      costs: {
        energy: 25
      },
      cooldown: 5,
      effects: {
        success: [
          {
            type: 'buff',
            attribute: 'attack',
            value: 2,
            duration: 3,
            description: '+2 to attack rolls for 3 turns'
          },
          {
            type: 'buff',
            attribute: 'morale',
            value: 20,
            duration: 5,
            description: '+20 morale for 5 turns'
          }
        ]
      },
      requirements: {
        attributes: { charisma: 14 },
        level: 5
      },
      metadata: {
        tags: ['support', 'buff', 'morale', 'leadership']
      }
    },

    haste: {
      name: 'Haste',
      description: 'Accelerate an ally, granting them extra speed and actions.',
      type: 'active',
      targetType: 'single',
      range: 30,
      costs: {
        mana: 30
      },
      cooldown: 5,
      castTime: 1,
      effects: {
        success: [
          {
            type: 'buff',
            attribute: 'speed',
            value: 20,
            duration: 3,
            description: '+20 feet movement speed'
          },
          {
            type: 'extra_action',
            duration: 3,
            description: 'Grants 1 extra action per turn for 3 turns'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 15 },
        level: 6
      },
      metadata: {
        tags: ['support', 'buff', 'speed', 'transmutation']
      }
    },

    bless: {
      name: 'Bless',
      description: 'Grant divine favor to allies, improving their rolls.',
      type: 'active',
      targetType: 'multiple',
      range: 30,
      maxTargets: 3,
      costs: {
        mana: 15
      },
      cooldown: 0,
      castTime: 1,
      duration: 10,
      effects: {
        success: [
          {
            type: 'buff',
            attribute: 'attack_rolls',
            value: '1d4',
            duration: 10,
            description: '+1d4 to attack rolls'
          },
          {
            type: 'buff',
            attribute: 'saving_throws',
            value: '1d4',
            duration: 10,
            description: '+1d4 to saving throws'
          }
        ]
      },
      requirements: {
        attributes: { wisdom: 13 },
        level: 1
      },
      metadata: {
        tags: ['support', 'buff', 'divine', 'enchantment']
      }
    },

    cure_wounds: {
      name: 'Cure Wounds',
      description: 'Channel positive energy to heal wounds.',
      type: 'active',
      targetType: 'single',
      range: 5,
      costs: {
        mana: 10
      },
      cooldown: 0,
      castTime: 0,
      scaling: {
        attribute: 'wisdom',
        effect: 'healing'
      },
      effects: {
        success: [
          {
            type: 'heal',
            value: '1d8+WIS',
            description: 'Heals 1d8 + Wisdom modifier HP'
          }
        ]
      },
      requirements: {
        attributes: { wisdom: 13 },
        level: 1
      },
      metadata: {
        tags: ['support', 'healing', 'divine', 'basic']
      }
    },

    mass_heal: {
      name: 'Mass Heal',
      description: 'Release a wave of healing energy that affects all nearby allies.',
      type: 'active',
      targetType: 'area',
      range: 30,
      areaOfEffect: { shape: 'sphere', size: 30 },
      costs: {
        mana: 50
      },
      cooldown: 10,
      castTime: 1,
      effects: {
        success: [
          {
            type: 'heal',
            value: '4d8+WIS',
            description: 'Heals all allies for 4d8 + Wisdom HP'
          },
          {
            type: 'remove_condition',
            conditions: ['poisoned', 'diseased'],
            description: 'Removes poison and disease'
          }
        ]
      },
      requirements: {
        attributes: { wisdom: 16 },
        level: 10
      },
      metadata: {
        tags: ['support', 'healing', 'aoe', 'divine', 'ultimate']
      }
    }
  },

  // ===== UTILITY ABILITIES =====
  utility: {
    detect_magic: {
      name: 'Detect Magic',
      description: 'Sense magical auras in the surrounding area.',
      type: 'active',
      targetType: 'area',
      range: 30,
      areaOfEffect: { shape: 'sphere', size: 30 },
      costs: {
        mana: 5
      },
      cooldown: 0,
      castTime: 1,
      duration: 10,
      effects: {
        success: [
          {
            type: 'detect',
            detectType: 'magic',
            description: 'Reveals magical items and effects'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 11 },
        level: 1
      },
      metadata: {
        tags: ['utility', 'detection', 'magic', 'divination']
      }
    },

    invisibility: {
      name: 'Invisibility',
      description: 'Become invisible to the naked eye.',
      type: 'active',
      targetType: 'self',
      range: 0,
      costs: {
        mana: 25
      },
      cooldown: 6,
      castTime: 1,
      duration: 5,
      effects: {
        success: [
          {
            type: 'condition',
            condition: 'invisible',
            duration: 5,
            description: 'Become invisible for 5 turns'
          },
          {
            type: 'skill_bonus',
            skill: 'stealth',
            value: 10,
            duration: 5,
            description: '+10 to Stealth while invisible'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 13 },
        level: 3
      },
      metadata: {
        tags: ['utility', 'stealth', 'illusion', 'invisibility']
      }
    },

    dispel_magic: {
      name: 'Dispel Magic',
      description: 'End magical effects on a creature or object.',
      type: 'active',
      targetType: 'single',
      range: 60,
      costs: {
        mana: 20
      },
      cooldown: 2,
      castTime: 1,
      effects: {
        success: [
          {
            type: 'dispel',
            description: 'Ends magical effects on target'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 13 },
        level: 5
      },
      metadata: {
        tags: ['utility', 'dispel', 'abjuration', 'counter']
      }
    },

    summon_familiar: {
      name: 'Summon Familiar',
      description: 'Call forth a small magical creature to serve you.',
      type: 'active',
      targetType: 'self',
      range: 10,
      costs: {
        mana: 30
      },
      cooldown: 0,
      castTime: 3,
      duration: -1,
      effects: {
        success: [
          {
            type: 'summon',
            summonType: 'familiar',
            description: 'Summons a familiar until dismissed'
          }
        ]
      },
      requirements: {
        attributes: { intelligence: 13 },
        level: 3
      },
      metadata: {
        tags: ['utility', 'summon', 'conjuration', 'familiar']
      }
    }
  }
};

/**
 * Get all ability templates as a flat array
 */
export function getAllAbilityTemplates() {
  const abilities = [];
  for (const category in ABILITY_TEMPLATES) {
    for (const key in ABILITY_TEMPLATES[category]) {
      abilities.push({
        ...ABILITY_TEMPLATES[category][key],
        templateKey: key,
        templateCategory: category
      });
    }
  }
  return abilities;
}

/**
 * Get ability templates by category
 */
export function getAbilityTemplatesByCategory(category) {
  return ABILITY_TEMPLATES[category] || {};
}

/**
 * Get a specific ability template
 */
export function getAbilityTemplate(category, key) {
  return ABILITY_TEMPLATES[category]?.[key] || null;
}

/**
 * Get ability templates filtered by tags
 */
export function getAbilityTemplatesByTags(tags) {
  const abilities = getAllAbilityTemplates();
  return abilities.filter(ability => 
    tags.some(tag => ability.metadata?.tags?.includes(tag))
  );
}

/**
 * Get ability templates by type
 */
export function getAbilityTemplatesByType(type) {
  const abilities = getAllAbilityTemplates();
  return abilities.filter(ability => ability.type === type);
}

/**
 * Ability template categories for UI organization
 */
export const ABILITY_TEMPLATE_CATEGORIES = {
  combat: {
    label: 'Combat',
    description: 'Direct damage and offensive abilities',
    icon: 'sword'
  },
  magic: {
    label: 'Magic',
    description: 'Spells and magical attacks',
    icon: 'wand-sparkles'
  },
  passive: {
    label: 'Passive',
    description: 'Always-active bonuses and traits',
    icon: 'shield-check'
  },
  support: {
    label: 'Support',
    description: 'Buffs, healing, and ally assistance',
    icon: 'heart-pulse'
  },
  utility: {
    label: 'Utility',
    description: 'Non-combat abilities and problem-solving',
    icon: 'wrench'
  }
};

export default ABILITY_TEMPLATES;
