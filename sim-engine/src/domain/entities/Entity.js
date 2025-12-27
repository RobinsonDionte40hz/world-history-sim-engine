// src/domain/entities/Entity.js

import Item from './Item.js';
import Ability from './Ability.js';
import Skill from './Skill.js';

/**
 * Entity - Represents hostile NPCs, creatures, and other non-player entities
 * 
 * Entities are different from Characters (player-controlled or story NPCs).
 * They represent opponents, wildlife, guards, monsters, etc. that can:
 * - Be encountered in locations
 * - Join groups/factions
 * - Have territorial behaviors
 * - Participate in combat encounters
 * - Have simple AI behaviors
 * - Use items, abilities, and skills
 */

// Utility function to generate UUID
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

class Entity {
  constructor(config = {}) {
    this.id = config.id || generateId();
    this.name = config.name || 'Unnamed Entity';
    this.description = config.description || '';
    
    // Entity classification
    this.type = config.type || 'humanoid'; // humanoid, beast, undead, elemental, construct, aberration
    this.subtype = config.subtype || null; // orc, wolf, skeleton, etc.
    this.size = config.size || 'medium'; // tiny, small, medium, large, huge, gargantuan
    this.challengeRating = config.challengeRating || 1; // Difficulty rating (0.125 to 30)
    
    // Combat statistics (D&D-style)
    this.attributes = {
      strength: config.attributes?.strength || 10,
      dexterity: config.attributes?.dexterity || 10,
      constitution: config.attributes?.constitution || 10,
      intelligence: config.attributes?.intelligence || 10,
      wisdom: config.attributes?.wisdom || 10,
      charisma: config.attributes?.charisma || 10
    };
    
    // Combat stats
    this.combat = {
      armorClass: config.combat?.armorClass || 10,
      hitPoints: config.combat?.hitPoints || 10,
      maxHitPoints: config.combat?.maxHitPoints || config.combat?.hitPoints || 10,
      speed: config.combat?.speed || 30,
      initiative: config.combat?.initiative || 0
    };
    
    // Skills and abilities - enhanced with full Item/Ability/Skill system
    this.skills = config.skills || {}; // Simple skill bonuses { perception: 3, stealth: 2, etc. }
    this.skillLevels = config.skillLevels || new Map(); // Full skill system with Skill objects
    this.abilities = config.abilities || []; // Ability objects with full functionality
    this.resistances = config.resistances || []; // Damage resistances
    this.immunities = config.immunities || []; // Damage immunities
    this.vulnerabilities = config.vulnerabilities || []; // Damage vulnerabilities
    
    // Item management
    this.items = config.items || []; // Inventory of Item objects
    this.equippedItems = config.equippedItems || new Map(); // slot -> itemId mapping
    
    // Behavioral traits
    this.behavior = {
      temperament: config.behavior?.temperament || 'neutral', // aggressive, defensive, neutral, passive, fearful
      intelligence: config.behavior?.intelligence || 'low', // low, medium, high
      tactics: config.behavior?.tactics || 'direct', // direct, ambush, ranged, support
      morale: config.behavior?.morale || 50, // 0-100, affects flee behavior
      socialability: config.behavior?.socialability || 'solitary' // solitary, pack, horde
    };
    
    // Loot and rewards
    this.loot = {
      guaranteed: config.loot?.guaranteed || [], // Always drop
      possible: config.loot?.possible || [], // Chance to drop
      currency: config.loot?.currency || 0, // Gold/currency value
      experience: config.loot?.experience || this.calculateExperience()
    };
    
    // Group membership
    this.groupId = config.groupId || null;
    this.role = config.role || 'member'; // member, leader, elite, scout, etc.
    
    // Combat positioning (for 2x5 grid formation)
    this.combatPosition = config.combatPosition || {
      row: null, // 'front' or 'back'
      column: null, // 0-4 (5 positions per row)
      preferredRow: this._calculatePreferredRow(config.behavior), // Preferred placement based on tactics
      canSwitchRows: true // Whether entity can move between rows
    };
    
    // Location/territory
    this.assignedNodes = config.assignedNodes || []; // Node IDs where entity can be encountered
    this.territoryBehavior = config.territoryBehavior || 'patrol'; // patrol, guard, roam, stationary
    
    // State tracking
    this.isAlive = config.isAlive !== false;
    this.isHostile = config.isHostile !== false; // Whether entity is hostile by default
    this.isActive = config.isActive !== false; // Whether entity is currently active in simulation
    
    // Metadata
    this.metadata = {
      created: config.metadata?.created || new Date().toISOString(),
      lastModified: config.metadata?.lastModified || new Date().toISOString(),
      version: config.metadata?.version || '1.0.0',
      isTemplate: config.metadata?.isTemplate || false,
      tags: config.metadata?.tags || []
    };
  }

  /**
   * Calculate experience points based on challenge rating
   * @returns {number} XP value
   */
  calculateExperience() {
    const xpByCR = {
      0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
      1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
      6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
      11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
      16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
      21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
      26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
    };
    return xpByCR[this.challengeRating] || 200;
  }

  /**
   * Calculate attribute modifier
   * @param {string} attribute - Attribute name
   * @returns {number} Modifier value
   */
  getAttributeModifier(attribute) {
    const score = this.attributes[attribute] || 10;
    return Math.floor((score - 10) / 2);
  }

  /**
   * Get skill bonus including attribute modifier
   * @param {string} skill - Skill name
   * @returns {number} Total skill bonus
   */
  getSkillBonus(skill) {
    const skillValue = this.skills[skill] || 0;
    // Map skills to attributes (simplified)
    const skillAttributes = {
      perception: 'wisdom',
      stealth: 'dexterity',
      athletics: 'strength',
      intimidation: 'charisma',
      survival: 'wisdom'
    };
    const attr = skillAttributes[skill] || 'wisdom';
    return skillValue + this.getAttributeModifier(attr);
  }

  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @param {string} type - Damage type (for resistances/immunities)
   * @returns {Object} Damage result
   */
  takeDamage(amount, type = 'physical') {
    if (this.immunities.includes(type)) {
      return { damage: 0, absorbed: amount, killed: false };
    }

    let actualDamage = amount;
    if (this.resistances.includes(type)) {
      actualDamage = Math.floor(amount / 2);
    }
    if (this.vulnerabilities.includes(type)) {
      actualDamage = Math.floor(amount * 1.5);
    }

    this.combat.hitPoints = Math.max(0, this.combat.hitPoints - actualDamage);
    
    const killed = this.combat.hitPoints <= 0;
    if (killed) {
      this.isAlive = false;
      this.isActive = false;
    }

    return {
      damage: actualDamage,
      absorbed: amount - actualDamage,
      currentHP: this.combat.hitPoints,
      killed
    };
  }

  /**
   * Heal entity
   * @param {number} amount - Healing amount
   * @returns {number} Actual healing done
   */
  heal(amount) {
    const oldHP = this.combat.hitPoints;
    this.combat.hitPoints = Math.min(
      this.combat.maxHitPoints,
      this.combat.hitPoints + amount
    );
    return this.combat.hitPoints - oldHP;
  }

  /**
   * Check if entity should flee based on morale and HP
   * @returns {boolean} Should flee
   */
  shouldFlee() {
    const hpPercent = (this.combat.hitPoints / this.combat.maxHitPoints) * 100;
    const moraleThreshold = this.behavior.morale;
    
    // Fearful entities flee easier
    if (this.behavior.temperament === 'fearful') {
      return hpPercent < moraleThreshold * 1.5;
    }
    
    // Aggressive entities flee less
    if (this.behavior.temperament === 'aggressive') {
      return hpPercent < moraleThreshold * 0.5;
    }
    
    return hpPercent < moraleThreshold;
  }

  /**
   * Get threat level based on CR relative to a target level
   * @param {number} targetLevel - Target character/party level
   * @returns {string} Threat level
   */
  getThreatLevel(targetLevel) {
    const diff = this.challengeRating - targetLevel;
    if (diff <= -4) return 'trivial';
    if (diff <= -2) return 'easy';
    if (diff <= 0) return 'medium';
    if (diff <= 2) return 'hard';
    if (diff <= 4) return 'deadly';
    return 'impossible';
  }

  /**
   * Assign to a group
   * @param {string} groupId - Group ID
   * @param {string} role - Role in group
   */
  assignToGroup(groupId, role = 'member') {
    this.groupId = groupId;
    this.role = role;
  }

  /**
   * Remove from group
   */
  removeFromGroup() {
    this.groupId = null;
    this.role = 'member';
  }

  /**
   * Calculate preferred combat row based on tactics (private helper)
   * @param {Object} behavior - Behavior configuration
   * @returns {string} 'front' or 'back'
   * @private
   */
  _calculatePreferredRow(behavior) {
    if (!behavior) return 'front';
    
    const tactics = behavior.tactics;
    
    // Ranged and support tactics prefer back row
    if (tactics === 'ranged' || tactics === 'support') {
      return 'back';
    }
    
    // Ambush tactics depend on temperament
    if (tactics === 'ambush') {
      return behavior.temperament === 'aggressive' ? 'front' : 'back';
    }
    
    // Direct tactics always front row
    return 'front';
  }

  /**
   * Gets preferred combat row based on entity's combat tactics
   * @returns {string} 'front' or 'back'
   */
  getPreferredCombatRow() {
    return this.combatPosition.preferredRow;
  }

  /**
   * Sets combat position in formation grid
   * @param {string} row - 'front' or 'back'
   * @param {number} column - 0-4
   */
  setCombatPosition(row, column) {
    if (!['front', 'back'].includes(row)) {
      throw new Error('Row must be "front" or "back"');
    }
    if (column < 0 || column > 4) {
      throw new Error('Column must be between 0 and 4');
    }
    
    this.combatPosition.row = row;
    this.combatPosition.column = column;
  }

  /**
   * Clears combat position (removes from formation)
   */
  clearCombatPosition() {
    this.combatPosition.row = null;
    this.combatPosition.column = null;
  }

  /**
   * Checks if entity can reach target in opposing formation
   * @param {Object} targetPosition - Target's combat position {row, column}
   * @param {boolean} enemyFrontRowEmpty - Whether enemy's front row is empty
   * @returns {boolean} True if target is reachable
   */
  canReachTarget(targetPosition, enemyFrontRowEmpty = false) {
    if (!this.combatPosition.row || !targetPosition.row) {
      return false;
    }

    const myRow = this.combatPosition.row;
    const targetRow = targetPosition.row;
    const tactics = this.behavior.tactics;

    // Ranged attacks can reach any position
    if (tactics === 'ranged') {
      return true;
    }

    // Melee attacks from front row can hit front row of enemy
    if (myRow === 'front' && targetRow === 'front') {
      return true;
    }

    // Melee attacks from front row can reach back row only if enemy front is empty
    if (myRow === 'front' && targetRow === 'back' && enemyFrontRowEmpty) {
      return true;
    }

    // Back row melee generally cannot attack (must move to front first)
    if (myRow === 'back' && tactics === 'direct') {
      return false;
    }

    // Support entities in back row don't attack directly
    if (tactics === 'support') {
      return false;
    }

    return false;
  }

  /**
   * Assign to location(s)
   * @param {string|Array} nodeIds - Node ID(s)
   */
  assignToLocation(nodeIds) {
    if (Array.isArray(nodeIds)) {
      this.assignedNodes = [...nodeIds];
    } else {
      this.assignedNodes = [nodeIds];
    }
  }

  /**
   * Check if entity is in a specific location
   * @param {string} nodeId - Node ID
   * @returns {boolean} Is in location
   */
  isInLocation(nodeId) {
    return this.assignedNodes.includes(nodeId);
  }

  /**
   * Create a copy/instance of this entity
   * @param {Object} overrides - Property overrides
   * @returns {Entity} New entity instance
   */
  createInstance(overrides = {}) {
    return new Entity({
      ...this.toJSON(),
      id: generateId(),
      groupId: overrides.groupId || null,
      assignedNodes: overrides.assignedNodes || [],
      metadata: {
        ...this.metadata,
        isTemplate: false,
        created: new Date().toISOString()
      },
      ...overrides
    });
  }

  // ===========================
  // Item Management Methods
  // ===========================

  /**
   * Add an item to the entity's inventory
   * @param {Item|Object} item - Item to add (Item object or JSON)
   * @returns {Entity} New entity instance with item added
   */
  addItem(item) {
    const itemInstance = item instanceof Item ? item : Item.fromJSON(item);
    return new Entity({
      ...this.toJSON(),
      items: [...this.items, itemInstance]
    });
  }

  /**
   * Remove an item from inventory
   * @param {string} itemId - ID of item to remove
   * @returns {Entity} New entity instance with item removed
   */
  removeItem(itemId) {
    const updatedItems = this.items.filter(item => item.id !== itemId);
    const updatedEquipped = new Map(this.equippedItems);
    
    // Unequip if equipped
    for (const [slot, id] of updatedEquipped.entries()) {
      if (id === itemId) {
        updatedEquipped.delete(slot);
      }
    }
    
    return new Entity({
      ...this.toJSON(),
      items: updatedItems,
      equippedItems: updatedEquipped
    });
  }

  /**
   * Equip an item to a specific slot
   * @param {string} itemId - ID of item to equip
   * @param {string} slot - Equipment slot (mainHand, offHand, armor, etc.)
   * @returns {Entity} New entity instance with item equipped
   */
  equipItem(itemId, slot) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found in inventory`);
    }
    
    if (!item.equipmentSlots || !item.equipmentSlots.includes(slot)) {
      throw new Error(`Item ${item.name} cannot be equipped to slot ${slot}`);
    }
    
    const updatedEquipped = new Map(this.equippedItems);
    updatedEquipped.set(slot, itemId);
    
    return new Entity({
      ...this.toJSON(),
      equippedItems: updatedEquipped
    });
  }

  /**
   * Unequip an item from a slot
   * @param {string} slot - Equipment slot to clear
   * @returns {Entity} New entity instance with slot cleared
   */
  unequipItem(slot) {
    const updatedEquipped = new Map(this.equippedItems);
    updatedEquipped.delete(slot);
    
    return new Entity({
      ...this.toJSON(),
      equippedItems: updatedEquipped
    });
  }

  /**
   * Check if entity has a specific item
   * @param {string} itemId - Item ID to check
   * @returns {boolean} True if item is in inventory
   */
  hasItem(itemId) {
    return this.items.some(item => item.id === itemId);
  }

  /**
   * Get an item by ID
   * @param {string} itemId - Item ID
   * @returns {Item|null} Item if found, null otherwise
   */
  getItem(itemId) {
    return this.items.find(item => item.id === itemId) || null;
  }

  /**
   * Get all equipped items
   * @returns {Array<{slot: string, item: Item}>} Array of equipped items with slots
   */
  getEquippedItems() {
    const equipped = [];
    for (const [slot, itemId] of this.equippedItems.entries()) {
      const item = this.getItem(itemId);
      if (item) {
        equipped.push({ slot, item });
      }
    }
    return equipped;
  }

  /**
   * Check if an item is equipped
   * @param {string} itemId - Item ID
   * @returns {boolean} True if item is equipped
   */
  isItemEquipped(itemId) {
    for (const id of this.equippedItems.values()) {
      if (id === itemId) return true;
    }
    return false;
  }

  /**
   * Get total armor class from equipped armor and bonuses
   * @returns {number} Total AC
   */
  getTotalArmorClass() {
    let totalAC = this.combat.armorClass || 10;
    
    for (const { item } of this.getEquippedItems()) {
      if (item.category === 'armor' && item.armorClass) {
        totalAC += item.armorClass;
      }
    }
    
    return totalAC;
  }

  // ===========================
  // Ability Management Methods
  // ===========================

  /**
   * Add an ability to the entity
   * @param {Ability|Object} ability - Ability to add (Ability object or JSON)
   * @returns {Entity} New entity instance with ability added
   */
  addAbility(ability) {
    const abilityInstance = ability instanceof Ability ? ability : Ability.fromJSON(ability);
    return new Entity({
      ...this.toJSON(),
      abilities: [...this.abilities, abilityInstance]
    });
  }

  /**
   * Remove an ability from the entity
   * @param {string} abilityId - ID of ability to remove
   * @returns {Entity} New entity instance with ability removed
   */
  removeAbility(abilityId) {
    const updatedAbilities = this.abilities.filter(ability => ability.id !== abilityId);
    return new Entity({
      ...this.toJSON(),
      abilities: updatedAbilities
    });
  }

  /**
   * Upgrade an ability to the next level
   * @param {string} abilityId - ID of ability to upgrade
   * @returns {Entity} New entity instance with upgraded ability
   */
  upgradeAbility(abilityId) {
    const abilityIndex = this.abilities.findIndex(a => a.id === abilityId);
    if (abilityIndex === -1) {
      throw new Error(`Ability ${abilityId} not found`);
    }
    
    const ability = this.abilities[abilityIndex];
    const upgraded = ability.upgrade();
    
    const updatedAbilities = [...this.abilities];
    updatedAbilities[abilityIndex] = upgraded;
    
    return new Entity({
      ...this.toJSON(),
      abilities: updatedAbilities
    });
  }

  /**
   * Check if entity has a specific ability
   * @param {string} abilityId - Ability ID to check
   * @returns {boolean} True if entity has the ability
   */
  hasAbility(abilityId) {
    return this.abilities.some(ability => ability.id === abilityId);
  }

  /**
   * Get an ability by ID
   * @param {string} abilityId - Ability ID
   * @returns {Ability|null} Ability if found, null otherwise
   */
  getAbility(abilityId) {
    return this.abilities.find(ability => ability.id === abilityId) || null;
  }

  /**
   * Get abilities by type
   * @param {string} type - Ability type (active, passive, triggered, etc.)
   * @returns {Array<Ability>} Abilities of specified type
   */
  getAbilitiesByType(type) {
    return this.abilities.filter(ability => ability.type === type);
  }

  /**
   * Get all abilities that can be used in current state
   * @returns {Array<Ability>} Usable abilities
   */
  getUsableAbilities() {
    return this.abilities.filter(ability => ability.canActivate());
  }

  // ===========================
  // Skill Management Methods
  // ===========================

  /**
   * Add a skill to the entity
   * @param {Skill|Object} skill - Skill to add (Skill object or JSON)
   * @param {number} initialLevel - Initial skill level (default: 0)
   * @param {number} initialExperience - Initial experience (default: 0)
   * @returns {Entity} New entity instance with skill added
   */
  addSkill(skill, initialLevel = 0, initialExperience = 0) {
    const skillInstance = skill instanceof Skill ? skill : Skill.fromJSON(skill);
    const updatedLevels = new Map(this.skillLevels);
    
    updatedLevels.set(skillInstance.id, {
      level: initialLevel,
      experience: initialExperience,
      skill: skillInstance
    });
    
    return new Entity({
      ...this.toJSON(),
      skillLevels: updatedLevels
    });
  }

  /**
   * Remove a skill from the entity
   * @param {string} skillId - ID of skill to remove
   * @returns {Entity} New entity instance with skill removed
   */
  removeSkill(skillId) {
    const updatedLevels = new Map(this.skillLevels);
    updatedLevels.delete(skillId);
    
    return new Entity({
      ...this.toJSON(),
      skillLevels: updatedLevels
    });
  }

  /**
   * Add experience to a skill
   * @param {string} skillId - Skill ID
   * @param {number} amount - Amount of experience to add
   * @returns {Entity} New entity instance with updated skill
   */
  addSkillExperience(skillId, amount) {
    const skillData = this.skillLevels.get(skillId);
    if (!skillData) {
      throw new Error(`Skill ${skillId} not found`);
    }
    
    const updated = skillData.skill.addExperience(amount, skillData.level, skillData.experience);
    const updatedLevels = new Map(this.skillLevels);
    
    updatedLevels.set(skillId, {
      level: updated.level,
      experience: updated.experience,
      skill: skillData.skill
    });
    
    return new Entity({
      ...this.toJSON(),
      skillLevels: updatedLevels
    });
  }

  /**
   * Perform a skill check
   * @param {string} skillId - Skill ID
   * @param {number} difficulty - Difficulty of the check
   * @param {Object} modifiers - Additional modifiers
   * @returns {Object} Check result { success: boolean, roll: number, total: number, margin: number }
   */
  performSkillCheck(skillId, difficulty = 10, modifiers = {}) {
    const skillData = this.skillLevels.get(skillId);
    if (!skillData) {
      throw new Error(`Skill ${skillId} not found`);
    }
    
    return skillData.skill.performCheck(skillData.level, difficulty, modifiers);
  }

  /**
   * Check if entity has a specific skill
   * @param {string} skillId - Skill ID to check
   * @returns {boolean} True if entity has the skill
   */
  hasSkill(skillId) {
    return this.skillLevels.has(skillId);
  }

  /**
   * Get a skill by ID
   * @param {string} skillId - Skill ID
   * @returns {Object|null} Skill data { level, experience, skill } or null
   */
  getSkill(skillId) {
    return this.skillLevels.get(skillId) || null;
  }

  /**
   * Get skill level
   * @param {string} skillId - Skill ID
   * @returns {number} Skill level (0 if not found)
   */
  getSkillLevel(skillId) {
    const skillData = this.skillLevels.get(skillId);
    return skillData ? skillData.level : 0;
  }

  /**
   * Get skill mastery level
   * @param {string} skillId - Skill ID
   * @returns {string} Mastery level (novice, apprentice, journeyman, expert, master, grandmaster)
   */
  getSkillMasteryLevel(skillId) {
    const skillData = this.skillLevels.get(skillId);
    if (!skillData) return 'novice';
    return skillData.skill.getMasteryLevel(skillData.level);
  }

  /**
   * Get skills by category
   * @param {string} category - Skill category
   * @returns {Array<Object>} Skills in category with their data
   */
  getSkillsByCategory(category) {
    const skills = [];
    for (const [skillId, skillData] of this.skillLevels.entries()) {
      if (skillData.skill.category === category) {
        skills.push({ skillId, ...skillData });
      }
    }
    return skills;
  }

  /**
   * Serialize entity to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      subtype: this.subtype,
      size: this.size,
      challengeRating: this.challengeRating,
      attributes: this.attributes,
      combat: this.combat,
      skills: this.skills,
      skillLevels: this.skillLevels ? Array.from(this.skillLevels.entries()).map(([id, data]) => ({
        skillId: id,
        level: data.level,
        experience: data.experience,
        skill: data.skill.toJSON()
      })) : [],
      abilities: this.abilities.map(ability => ability.toJSON ? ability.toJSON() : ability),
      items: this.items.map(item => item.toJSON ? item.toJSON() : item),
      equippedItems: this.equippedItems ? Array.from(this.equippedItems.entries()) : [],
      resistances: this.resistances,
      immunities: this.immunities,
      vulnerabilities: this.vulnerabilities,
      behavior: this.behavior,
      loot: this.loot,
      groupId: this.groupId,
      role: this.role,
      assignedNodes: this.assignedNodes,
      territoryBehavior: this.territoryBehavior,
      isAlive: this.isAlive,
      isHostile: this.isHostile,
      isActive: this.isActive,
      metadata: this.metadata
    };
  }

  /**
   * Create entity from JSON
   * @param {Object} json - JSON data
   * @returns {Entity} New entity
   */
  static fromJSON(json) {
    const config = { ...json };
    
    // Deserialize items
    if (config.items) {
      config.items = config.items.map(item => 
        item instanceof Item ? item : Item.fromJSON(item)
      );
    }
    
    // Deserialize abilities
    if (config.abilities) {
      config.abilities = config.abilities.map(ability =>
        ability instanceof Ability ? ability : Ability.fromJSON(ability)
      );
    }
    
    // Deserialize equipped items Map
    if (config.equippedItems) {
      config.equippedItems = Array.isArray(config.equippedItems)
        ? new Map(config.equippedItems)
        : new Map(Object.entries(config.equippedItems));
    }
    
    // Deserialize skill levels Map
    if (config.skillLevels) {
      config.skillLevels = Entity._deserializeSkillLevels(config.skillLevels);
    }
    
    return new Entity(config);
  }
  
  /**
   * Helper to deserialize skill levels from JSON
   * @param {Array|Map} skillLevels - Serialized skill levels
   * @returns {Map} Deserialized Map
   * @private
   */
  static _deserializeSkillLevels(skillLevels) {
    if (skillLevels instanceof Map) {
      return skillLevels;
    }
    
    const map = new Map();
    if (Array.isArray(skillLevels)) {
      for (const entry of skillLevels) {
        const skill = entry.skill instanceof Skill ? entry.skill : Skill.fromJSON(entry.skill);
        map.set(entry.skillId, {
          level: entry.level,
          experience: entry.experience,
          skill
        });
      }
    }
    return map;
  }

  /**
   * Create entity from template
   * @param {Object} template - Template data
   * @param {Object} overrides - Property overrides
   * @returns {Entity} New entity
   */
  static fromTemplate(template, overrides = {}) {
    return new Entity({
      ...template,
      id: generateId(),
      metadata: {
        ...template.metadata,
        isTemplate: false,
        created: new Date().toISOString()
      },
      ...overrides
    });
  }
}

export default Entity;
