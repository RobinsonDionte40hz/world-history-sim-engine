// src/configs/skill-templates.js

/**
 * Pre-built skill templates for quick character/entity creation
 * Organized by category with balanced progression and effects
 */

export const SKILL_TEMPLATES = {
  // ===== COMBAT SKILLS =====
  combat: {
    swordsmanship: {
      name: 'Swordsmanship',
      description: 'Mastery of blade combat, from daggers to greatswords.',
      category: 'combat',
      linkedAttribute: 'strength',
      difficultyClass: 10,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Apprentice Swordsman', bonuses: [] },
        apprentice: { level: 20, name: 'Trained Fighter', bonuses: [{ type: 'attack', value: 1 }] },
        journeyman: { level: 40, name: 'Skilled Warrior', bonuses: [{ type: 'attack', value: 2 }, { type: 'damage', value: 1 }] },
        expert: { level: 60, name: 'Master Swordsman', bonuses: [{ type: 'attack', value: 3 }, { type: 'damage', value: 2 }] },
        master: { level: 80, name: 'Legendary Blade', bonuses: [{ type: 'attack', value: 4 }, { type: 'damage', value: 3 }] },
        grandmaster: { level: 100, name: 'Sword Saint', bonuses: [{ type: 'attack', value: 5 }, { type: 'damage', value: 4 }, { type: 'critical_chance', value: 0.1 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'attack_bonus', value: 1 },
        { minLevel: 40, type: 'damage_bonus', value: 1 },
        { minLevel: 60, type: 'critical_chance', value: 0.05 },
        { minLevel: 80, type: 'parry_chance', value: 0.1 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'power_slash', name: 'Power Slash' },
        { level: 30, abilityId: 'blade_dance', name: 'Blade Dance' },
        { level: 50, abilityId: 'whirlwind_strike', name: 'Whirlwind Strike' },
        { level: 70, abilityId: 'legendary_strike', name: 'Legendary Strike' }
      ],
      metadata: {
        tags: ['combat', 'melee', 'physical', 'weapon']
      }
    },

    archery: {
      name: 'Archery',
      description: 'Precision and power with bows and crossbows.',
      category: 'combat',
      linkedAttribute: 'dexterity',
      difficultyClass: 10,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Rookie Archer', bonuses: [] },
        apprentice: { level: 20, name: 'Trained Bowman', bonuses: [{ type: 'ranged_attack', value: 1 }] },
        journeyman: { level: 40, name: 'Skilled Marksman', bonuses: [{ type: 'ranged_attack', value: 2 }, { type: 'range', value: 10 }] },
        expert: { level: 60, name: 'Master Archer', bonuses: [{ type: 'ranged_attack', value: 3 }, { type: 'range', value: 20 }] },
        master: { level: 80, name: 'Legendary Shot', bonuses: [{ type: 'ranged_attack', value: 4 }, { type: 'range', value: 30 }] },
        grandmaster: { level: 100, name: 'Deadeye', bonuses: [{ type: 'ranged_attack', value: 5 }, { type: 'range', value: 50 }, { type: 'critical_multiplier', value: 3 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'ranged_attack_bonus', value: 1 },
        { minLevel: 40, type: 'range_bonus', value: 10 },
        { minLevel: 60, type: 'critical_chance', value: 0.1 },
        { minLevel: 80, type: 'reload_speed', value: 0.5 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'aimed_shot', name: 'Aimed Shot' },
        { level: 30, abilityId: 'multi_shot', name: 'Multi-Shot' },
        { level: 50, abilityId: 'piercing_arrow', name: 'Piercing Arrow' },
        { level: 70, abilityId: 'volley', name: 'Volley' }
      ],
      metadata: {
        tags: ['combat', 'ranged', 'physical', 'precision']
      }
    },

    defense: {
      name: 'Defense',
      description: 'The art of blocking, parrying, and avoiding harm.',
      category: 'combat',
      linkedAttribute: 'constitution',
      difficultyClass: 10,
      experienceCurve: 'slow',
      masteryTiers: {
        novice: { level: 0, name: 'Untrained', bonuses: [] },
        apprentice: { level: 20, name: 'Defensive Fighter', bonuses: [{ type: 'ac', value: 1 }] },
        journeyman: { level: 40, name: 'Shield Bearer', bonuses: [{ type: 'ac', value: 2 }, { type: 'damage_reduction', value: 1 }] },
        expert: { level: 60, name: 'Stalwart Guardian', bonuses: [{ type: 'ac', value: 3 }, { type: 'damage_reduction', value: 2 }] },
        master: { level: 80, name: 'Unbreakable Wall', bonuses: [{ type: 'ac', value: 4 }, { type: 'damage_reduction', value: 3 }] },
        grandmaster: { level: 100, name: 'Impenetrable Fortress', bonuses: [{ type: 'ac', value: 5 }, { type: 'damage_reduction', value: 5 }, { type: 'block_chance', value: 0.25 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'ac_bonus', value: 1 },
        { minLevel: 40, type: 'damage_reduction', value: 1 },
        { minLevel: 60, type: 'block_chance', value: 0.1 },
        { minLevel: 80, type: 'hp_bonus', value: 10 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'shield_bash', name: 'Shield Bash' },
        { level: 30, abilityId: 'defensive_stance', name: 'Defensive Stance' },
        { level: 50, abilityId: 'counter_attack', name: 'Counter Attack' },
        { level: 70, abilityId: 'last_stand', name: 'Last Stand' }
      ],
      metadata: {
        tags: ['combat', 'defense', 'protection', 'tank']
      }
    }
  },

  // ===== MAGIC SKILLS =====
  magic: {
    evocation: {
      name: 'Evocation',
      description: 'Mastery of destructive magic and elemental forces.',
      category: 'magic',
      linkedAttribute: 'intelligence',
      difficultyClass: 12,
      experienceCurve: 'slow',
      masteryTiers: {
        novice: { level: 0, name: 'Apprentice Evoker', bonuses: [] },
        apprentice: { level: 20, name: 'Trained Spellcaster', bonuses: [{ type: 'spell_damage', value: 2 }] },
        journeyman: { level: 40, name: 'Skilled Evoker', bonuses: [{ type: 'spell_damage', value: 4 }, { type: 'mana_cost_reduction', value: 0.1 }] },
        expert: { level: 60, name: 'Master of Elements', bonuses: [{ type: 'spell_damage', value: 6 }, { type: 'mana_cost_reduction', value: 0.15 }] },
        master: { level: 80, name: 'Archmage of Destruction', bonuses: [{ type: 'spell_damage', value: 8 }, { type: 'mana_cost_reduction', value: 0.2 }] },
        grandmaster: { level: 100, name: 'Storm Lord', bonuses: [{ type: 'spell_damage', value: 10 }, { type: 'mana_cost_reduction', value: 0.25 }, { type: 'aoe_radius', value: 5 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'spell_damage_bonus', value: 2 },
        { minLevel: 40, type: 'mana_efficiency', value: 0.1 },
        { minLevel: 60, type: 'spell_critical_chance', value: 0.1 },
        { minLevel: 80, type: 'cast_speed', value: 0.2 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'magic_missile', name: 'Magic Missile' },
        { level: 30, abilityId: 'fireball', name: 'Fireball' },
        { level: 50, abilityId: 'chain_lightning', name: 'Chain Lightning' },
        { level: 70, abilityId: 'meteor_storm', name: 'Meteor Storm' }
      ],
      metadata: {
        tags: ['magic', 'damage', 'elemental', 'offensive']
      }
    },

    healing: {
      name: 'Healing',
      description: 'Divine magic focused on restoration and protection.',
      category: 'magic',
      linkedAttribute: 'wisdom',
      difficultyClass: 10,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Healer', bonuses: [] },
        apprentice: { level: 20, name: 'Trained Cleric', bonuses: [{ type: 'healing', value: 2 }] },
        journeyman: { level: 40, name: 'Skilled Healer', bonuses: [{ type: 'healing', value: 4 }, { type: 'heal_efficiency', value: 0.1 }] },
        expert: { level: 60, name: 'Master Cleric', bonuses: [{ type: 'healing', value: 6 }, { type: 'heal_efficiency', value: 0.2 }] },
        master: { level: 80, name: 'Divine Channeler', bonuses: [{ type: 'healing', value: 8 }, { type: 'heal_efficiency', value: 0.3 }] },
        grandmaster: { level: 100, name: 'Miracle Worker', bonuses: [{ type: 'healing', value: 10 }, { type: 'heal_efficiency', value: 0.4 }, { type: 'resurrection_chance', value: 0.5 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'healing_bonus', value: 2 },
        { minLevel: 40, type: 'mana_efficiency', value: 0.1 },
        { minLevel: 60, type: 'hp_regeneration', value: 2 },
        { minLevel: 80, type: 'ailment_resistance', value: 0.2 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'cure_wounds', name: 'Cure Wounds' },
        { level: 30, abilityId: 'greater_restoration', name: 'Greater Restoration' },
        { level: 50, abilityId: 'mass_heal', name: 'Mass Heal' },
        { level: 70, abilityId: 'resurrection', name: 'Resurrection' }
      ],
      metadata: {
        tags: ['magic', 'healing', 'divine', 'support']
      }
    },

    illusion: {
      name: 'Illusion',
      description: 'The art of deception, misdirection, and mind manipulation.',
      category: 'magic',
      linkedAttribute: 'charisma',
      difficultyClass: 12,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Trickster', bonuses: [] },
        apprentice: { level: 20, name: 'Illusionist', bonuses: [{ type: 'stealth', value: 5 }] },
        journeyman: { level: 40, name: 'Master of Deception', bonuses: [{ type: 'stealth', value: 10 }, { type: 'charm_chance', value: 0.1 }] },
        expert: { level: 60, name: 'Grand Illusionist', bonuses: [{ type: 'stealth', value: 15 }, { type: 'charm_chance', value: 0.2 }] },
        master: { level: 80, name: 'Phantasm Weaver', bonuses: [{ type: 'stealth', value: 20 }, { type: 'charm_chance', value: 0.3 }] },
        grandmaster: { level: 100, name: 'Master of Reality', bonuses: [{ type: 'stealth', value: 25 }, { type: 'charm_chance', value: 0.5 }, { type: 'illusion_duration', value: 2 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'stealth_bonus', value: 5 },
        { minLevel: 40, type: 'deception_bonus', value: 5 },
        { minLevel: 60, type: 'mind_resistance', value: 0.2 },
        { minLevel: 80, type: 'spell_duration', value: 0.5 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'disguise_self', name: 'Disguise Self' },
        { level: 30, abilityId: 'invisibility', name: 'Invisibility' },
        { level: 50, abilityId: 'phantasmal_killer', name: 'Phantasmal Killer' },
        { level: 70, abilityId: 'programmed_illusion', name: 'Programmed Illusion' }
      ],
      metadata: {
        tags: ['magic', 'illusion', 'deception', 'stealth']
      }
    }
  },

  // ===== SOCIAL SKILLS =====
  social: {
    persuasion: {
      name: 'Persuasion',
      description: 'The ability to convince others through charm and logic.',
      category: 'social',
      linkedAttribute: 'charisma',
      difficultyClass: 10,
      experienceCurve: 'fast',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Speaker', bonuses: [] },
        apprentice: { level: 20, name: 'Convincing', bonuses: [{ type: 'persuasion', value: 2 }] },
        journeyman: { level: 40, name: 'Silver Tongue', bonuses: [{ type: 'persuasion', value: 4 }, { type: 'reputation_gain', value: 0.1 }] },
        expert: { level: 60, name: 'Master Diplomat', bonuses: [{ type: 'persuasion', value: 6 }, { type: 'reputation_gain', value: 0.2 }] },
        master: { level: 80, name: 'Legendary Orator', bonuses: [{ type: 'persuasion', value: 8 }, { type: 'reputation_gain', value: 0.3 }] },
        grandmaster: { level: 100, name: 'Voice of Nations', bonuses: [{ type: 'persuasion', value: 10 }, { type: 'reputation_gain', value: 0.5 }, { type: 'negotiation_bonus', value: 0.25 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'persuasion_bonus', value: 2 },
        { minLevel: 40, type: 'reputation_multiplier', value: 0.1 },
        { minLevel: 60, type: 'price_reduction', value: 0.1 },
        { minLevel: 80, type: 'quest_reward_bonus', value: 0.15 }
      ],
      metadata: {
        tags: ['social', 'persuasion', 'charisma', 'dialogue']
      }
    },

    intimidation: {
      name: 'Intimidation',
      description: 'Force compliance through fear and displays of power.',
      category: 'social',
      linkedAttribute: 'strength',
      difficultyClass: 12,
      experienceCurve: 'fast',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Bully', bonuses: [] },
        apprentice: { level: 20, name: 'Menacing', bonuses: [{ type: 'intimidation', value: 2 }] },
        journeyman: { level: 40, name: 'Fearsome', bonuses: [{ type: 'intimidation', value: 4 }, { type: 'morale_damage', value: 5 }] },
        expert: { level: 60, name: 'Terrifying', bonuses: [{ type: 'intimidation', value: 6 }, { type: 'morale_damage', value: 10 }] },
        master: { level: 80, name: 'Living Nightmare', bonuses: [{ type: 'intimidation', value: 8 }, { type: 'morale_damage', value: 15 }] },
        grandmaster: { level: 100, name: 'Breaker of Wills', bonuses: [{ type: 'intimidation', value: 10 }, { type: 'morale_damage', value: 25 }, { type: 'fear_aura', value: 10 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'intimidation_bonus', value: 2 },
        { minLevel: 40, type: 'enemy_morale_reduction', value: 5 },
        { minLevel: 60, type: 'fear_duration', value: 1 },
        { minLevel: 80, type: 'combat_presence', value: 0.2 }
      ],
      metadata: {
        tags: ['social', 'intimidation', 'fear', 'morale']
      }
    },

    deception: {
      name: 'Deception',
      description: 'The art of lying, bluffing, and concealing the truth.',
      category: 'social',
      linkedAttribute: 'charisma',
      difficultyClass: 12,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Liar', bonuses: [] },
        apprentice: { level: 20, name: 'Convincing Liar', bonuses: [{ type: 'deception', value: 2 }] },
        journeyman: { level: 40, name: 'Master Liar', bonuses: [{ type: 'deception', value: 4 }, { type: 'insight_resistance', value: 2 }] },
        expert: { level: 60, name: 'Grand Deceiver', bonuses: [{ type: 'deception', value: 6 }, { type: 'insight_resistance', value: 4 }] },
        master: { level: 80, name: 'Living Falsehood', bonuses: [{ type: 'deception', value: 8 }, { type: 'insight_resistance', value: 6 }] },
        grandmaster: { level: 100, name: 'Truth Bender', bonuses: [{ type: 'deception', value: 10 }, { type: 'insight_resistance', value: 10 }, { type: 'disguise_detection_immunity', value: true }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'deception_bonus', value: 2 },
        { minLevel: 40, type: 'disguise_effectiveness', value: 0.2 },
        { minLevel: 60, type: 'lie_detection_resistance', value: 0.3 },
        { minLevel: 80, type: 'charm_chance', value: 0.15 }
      ],
      metadata: {
        tags: ['social', 'deception', 'lying', 'bluff']
      }
    },

    insight: {
      name: 'Insight',
      description: 'Read people\'s intentions and detect lies.',
      category: 'social',
      linkedAttribute: 'wisdom',
      difficultyClass: 12,
      experienceCurve: 'slow',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Observer', bonuses: [] },
        apprentice: { level: 20, name: 'Perceptive', bonuses: [{ type: 'insight', value: 2 }] },
        journeyman: { level: 40, name: 'Mind Reader', bonuses: [{ type: 'insight', value: 4 }, { type: 'lie_detection', value: 0.2 }] },
        expert: { level: 60, name: 'Master Psychologist', bonuses: [{ type: 'insight', value: 6 }, { type: 'lie_detection', value: 0.4 }] },
        master: { level: 80, name: 'Soul Gazer', bonuses: [{ type: 'insight', value: 8 }, { type: 'lie_detection', value: 0.6 }] },
        grandmaster: { level: 100, name: 'Omniscient Eye', bonuses: [{ type: 'insight', value: 10 }, { type: 'lie_detection', value: 0.9 }, { type: 'emotion_sense', value: true }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'insight_bonus', value: 2 },
        { minLevel: 40, type: 'detect_lies', value: 0.2 },
        { minLevel: 60, type: 'predict_behavior', value: 0.3 },
        { minLevel: 80, type: 'empathy_bonus', value: 5 }
      ],
      metadata: {
        tags: ['social', 'insight', 'wisdom', 'detection']
      }
    }
  },

  // ===== CRAFTING SKILLS =====
  crafting: {
    blacksmithing: {
      name: 'Blacksmithing',
      description: 'Forge weapons, armor, and tools from metal.',
      category: 'crafting',
      linkedAttribute: 'strength',
      difficultyClass: 12,
      experienceCurve: 'slow',
      masteryTiers: {
        novice: { level: 0, name: 'Apprentice Smith', bonuses: [] },
        apprentice: { level: 20, name: 'Journeyman Smith', bonuses: [{ type: 'craft_quality', value: 0.1 }] },
        journeyman: { level: 40, name: 'Master Smith', bonuses: [{ type: 'craft_quality', value: 0.2 }, { type: 'craft_speed', value: 0.1 }] },
        expert: { level: 60, name: 'Artisan Blacksmith', bonuses: [{ type: 'craft_quality', value: 0.3 }, { type: 'craft_speed', value: 0.2 }] },
        master: { level: 80, name: 'Master Craftsman', bonuses: [{ type: 'craft_quality', value: 0.4 }, { type: 'craft_speed', value: 0.3 }] },
        grandmaster: { level: 100, name: 'Legendary Forgemaster', bonuses: [{ type: 'craft_quality', value: 0.5 }, { type: 'craft_speed', value: 0.5 }, { type: 'masterwork_chance', value: 0.25 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'item_durability', value: 0.1 },
        { minLevel: 40, type: 'material_efficiency', value: 0.15 },
        { minLevel: 60, type: 'repair_effectiveness', value: 0.25 },
        { minLevel: 80, type: 'enchantment_capacity', value: 1 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'repair_item', name: 'Repair Item' },
        { level: 30, abilityId: 'craft_masterwork', name: 'Craft Masterwork' },
        { level: 50, abilityId: 'forge_magic_item', name: 'Forge Magic Item' },
        { level: 70, abilityId: 'legendary_smithing', name: 'Legendary Smithing' }
      ],
      metadata: {
        tags: ['crafting', 'blacksmithing', 'weapons', 'armor']
      }
    },

    alchemy: {
      name: 'Alchemy',
      description: 'Create potions, poisons, and magical concoctions.',
      category: 'crafting',
      linkedAttribute: 'intelligence',
      difficultyClass: 12,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Apprentice Alchemist', bonuses: [] },
        apprentice: { level: 20, name: 'Trained Alchemist', bonuses: [{ type: 'potion_potency', value: 0.1 }] },
        journeyman: { level: 40, name: 'Skilled Alchemist', bonuses: [{ type: 'potion_potency', value: 0.2 }, { type: 'ingredient_efficiency', value: 0.1 }] },
        expert: { level: 60, name: 'Master Alchemist', bonuses: [{ type: 'potion_potency', value: 0.3 }, { type: 'ingredient_efficiency', value: 0.2 }] },
        master: { level: 80, name: 'Grand Alchemist', bonuses: [{ type: 'potion_potency', value: 0.4 }, { type: 'ingredient_efficiency', value: 0.3 }] },
        grandmaster: { level: 100, name: 'Philosopher', bonuses: [{ type: 'potion_potency', value: 0.5 }, { type: 'ingredient_efficiency', value: 0.5 }, { type: 'transmutation_chance', value: 0.1 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'potion_duration', value: 0.2 },
        { minLevel: 40, type: 'brewing_speed', value: 0.25 },
        { minLevel: 60, type: 'potion_quality', value: 0.3 },
        { minLevel: 80, type: 'discover_recipe_chance', value: 0.15 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'brew_basic_potion', name: 'Brew Basic Potion' },
        { level: 30, abilityId: 'brew_advanced_potion', name: 'Brew Advanced Potion' },
        { level: 50, abilityId: 'create_elixir', name: 'Create Elixir' },
        { level: 70, abilityId: 'philosophers_stone', name: 'Philosopher\'s Stone' }
      ],
      metadata: {
        tags: ['crafting', 'alchemy', 'potions', 'magic']
      }
    },

    enchanting: {
      name: 'Enchanting',
      description: 'Imbue items with magical properties.',
      category: 'crafting',
      linkedAttribute: 'intelligence',
      difficultyClass: 15,
      experienceCurve: 'slow',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Enchanter', bonuses: [] },
        apprentice: { level: 20, name: 'Apprentice Enchanter', bonuses: [{ type: 'enchantment_power', value: 0.1 }] },
        journeyman: { level: 40, name: 'Skilled Enchanter', bonuses: [{ type: 'enchantment_power', value: 0.2 }, { type: 'enchantment_slots', value: 1 }] },
        expert: { level: 60, name: 'Master Enchanter', bonuses: [{ type: 'enchantment_power', value: 0.3 }, { type: 'enchantment_slots', value: 2 }] },
        master: { level: 80, name: 'Arcane Artisan', bonuses: [{ type: 'enchantment_power', value: 0.4 }, { type: 'enchantment_slots', value: 3 }] },
        grandmaster: { level: 100, name: 'Archmage Enchanter', bonuses: [{ type: 'enchantment_power', value: 0.5 }, { type: 'enchantment_slots', value: 5 }, { type: 'artifact_chance', value: 0.05 }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'enchantment_duration', value: 0.2 },
        { minLevel: 40, type: 'essence_efficiency', value: 0.15 },
        { minLevel: 60, type: 'enchantment_stability', value: 0.25 },
        { minLevel: 80, type: 'multi_enchant_chance', value: 0.2 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'basic_enchantment', name: 'Basic Enchantment' },
        { level: 30, abilityId: 'advanced_enchantment', name: 'Advanced Enchantment' },
        { level: 50, abilityId: 'legendary_enchantment', name: 'Legendary Enchantment' },
        { level: 70, abilityId: 'artifact_creation', name: 'Artifact Creation' }
      ],
      metadata: {
        tags: ['crafting', 'enchanting', 'magic', 'items']
      }
    }
  },

  // ===== UTILITY SKILLS =====
  utility: {
    lockpicking: {
      name: 'Lockpicking',
      description: 'Open locks without keys using finesse and tools.',
      category: 'utility',
      linkedAttribute: 'dexterity',
      difficultyClass: 12,
      experienceCurve: 'fast',
      masteryTiers: {
        novice: { level: 0, name: 'Novice Thief', bonuses: [] },
        apprentice: { level: 20, name: 'Trained Lockpick', bonuses: [{ type: 'lockpicking', value: 5 }] },
        journeyman: { level: 40, name: 'Skilled Thief', bonuses: [{ type: 'lockpicking', value: 10 }, { type: 'pick_speed', value: 0.2 }] },
        expert: { level: 60, name: 'Master Locksmith', bonuses: [{ type: 'lockpicking', value: 15 }, { type: 'pick_speed', value: 0.4 }] },
        master: { level: 80, name: 'Legendary Picker', bonuses: [{ type: 'lockpicking', value: 20 }, { type: 'pick_speed', value: 0.6 }] },
        grandmaster: { level: 100, name: 'Unbreakable Opener', bonuses: [{ type: 'lockpicking', value: 25 }, { type: 'pick_speed', value: 1.0 }, { type: 'no_failed_picks', value: true }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'lockpicking_bonus', value: 5 },
        { minLevel: 40, type: 'tool_durability', value: 0.25 },
        { minLevel: 60, type: 'silent_picking', value: 0.5 },
        { minLevel: 80, type: 'trap_detection', value: 0.3 }
      ],
      metadata: {
        tags: ['utility', 'lockpicking', 'rogue', 'dexterity']
      }
    },

    stealth: {
      name: 'Stealth',
      description: 'Move silently and remain unseen.',
      category: 'utility',
      linkedAttribute: 'dexterity',
      difficultyClass: 10,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'Clumsy', bonuses: [] },
        apprentice: { level: 20, name: 'Sneaky', bonuses: [{ type: 'stealth', value: 5 }] },
        journeyman: { level: 40, name: 'Shadow Walker', bonuses: [{ type: 'stealth', value: 10 }, { type: 'detection_range_reduction', value: 0.2 }] },
        expert: { level: 60, name: 'Ghost', bonuses: [{ type: 'stealth', value: 15 }, { type: 'detection_range_reduction', value: 0.4 }] },
        master: { level: 80, name: 'Invisible Blade', bonuses: [{ type: 'stealth', value: 20 }, { type: 'detection_range_reduction', value: 0.6 }] },
        grandmaster: { level: 100, name: 'Master of Shadows', bonuses: [{ type: 'stealth', value: 25 }, { type: 'detection_range_reduction', value: 0.8 }, { type: 'vanish_ability', value: true }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'stealth_bonus', value: 5 },
        { minLevel: 40, type: 'movement_noise_reduction', value: 0.3 },
        { minLevel: 60, type: 'hide_in_combat', value: 0.5 },
        { minLevel: 80, type: 'backstab_damage', value: 0.5 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'hide', name: 'Hide' },
        { level: 30, abilityId: 'sneak_attack', name: 'Sneak Attack' },
        { level: 50, abilityId: 'shadow_step', name: 'Shadow Step' },
        { level: 70, abilityId: 'assassinate', name: 'Assassinate' }
      ],
      metadata: {
        tags: ['utility', 'stealth', 'rogue', 'sneaking']
      }
    },

    survival: {
      name: 'Survival',
      description: 'Navigate wilderness, track prey, and endure harsh conditions.',
      category: 'utility',
      linkedAttribute: 'wisdom',
      difficultyClass: 10,
      experienceCurve: 'standard',
      masteryTiers: {
        novice: { level: 0, name: 'City Dweller', bonuses: [] },
        apprentice: { level: 20, name: 'Outdoorsman', bonuses: [{ type: 'survival', value: 5 }] },
        journeyman: { level: 40, name: 'Ranger', bonuses: [{ type: 'survival', value: 10 }, { type: 'tracking_range', value: 20 }] },
        expert: { level: 60, name: 'Master Tracker', bonuses: [{ type: 'survival', value: 15 }, { type: 'tracking_range', value: 40 }] },
        master: { level: 80, name: 'Wilderness Master', bonuses: [{ type: 'survival', value: 20 }, { type: 'tracking_range', value: 60 }] },
        grandmaster: { level: 100, name: 'One with Nature', bonuses: [{ type: 'survival', value: 25 }, { type: 'tracking_range', value: 100 }, { type: 'weather_immunity', value: true }] }
      },
      passiveEffects: [
        { minLevel: 20, type: 'survival_bonus', value: 5 },
        { minLevel: 40, type: 'food_efficiency', value: 0.2 },
        { minLevel: 60, type: 'environmental_resistance', value: 0.3 },
        { minLevel: 80, type: 'animal_companion_bonus', value: 0.25 }
      ],
      abilityUnlocks: [
        { level: 10, abilityId: 'track', name: 'Track' },
        { level: 30, abilityId: 'forage', name: 'Forage' },
        { level: 50, abilityId: 'tame_beast', name: 'Tame Beast' },
        { level: 70, abilityId: 'call_of_the_wild', name: 'Call of the Wild' }
      ],
      metadata: {
        tags: ['utility', 'survival', 'tracking', 'nature']
      }
    }
  }
};

/**
 * Get all skill templates as a flat array
 */
export function getAllSkillTemplates() {
  const skills = [];
  for (const category in SKILL_TEMPLATES) {
    for (const key in SKILL_TEMPLATES[category]) {
      skills.push({
        ...SKILL_TEMPLATES[category][key],
        templateKey: key,
        templateCategory: category
      });
    }
  }
  return skills;
}

/**
 * Get skill templates by category
 */
export function getSkillTemplatesByCategory(category) {
  return SKILL_TEMPLATES[category] || {};
}

/**
 * Get a specific skill template
 */
export function getSkillTemplate(category, key) {
  return SKILL_TEMPLATES[category]?.[key] || null;
}

/**
 * Get skill templates filtered by tags
 */
export function getSkillTemplatesByTags(tags) {
  const skills = getAllSkillTemplates();
  return skills.filter(skill => 
    tags.some(tag => skill.metadata?.tags?.includes(tag))
  );
}

/**
 * Get skill templates by linked attribute
 */
export function getSkillTemplatesByAttribute(attribute) {
  const skills = getAllSkillTemplates();
  return skills.filter(skill => skill.linkedAttribute === attribute);
}

/**
 * Skill template categories for UI organization
 */
export const SKILL_TEMPLATE_CATEGORIES = {
  combat: {
    label: 'Combat',
    description: 'Physical fighting and weapon skills',
    icon: 'crossed-swords'
  },
  magic: {
    label: 'Magic',
    description: 'Spellcasting and magical schools',
    icon: 'wand'
  },
  social: {
    label: 'Social',
    description: 'Interaction and influence skills',
    icon: 'users'
  },
  crafting: {
    label: 'Crafting',
    description: 'Creation and manufacturing skills',
    icon: 'hammer'
  },
  utility: {
    label: 'Utility',
    description: 'Practical and exploration skills',
    icon: 'compass'
  }
};

export default SKILL_TEMPLATES;
