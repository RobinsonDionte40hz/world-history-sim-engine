// src/domain/entities/Entity.js

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
    
    // Skills and abilities
    this.skills = config.skills || {}; // { perception: 3, stealth: 2, etc. }
    this.abilities = config.abilities || []; // Special abilities
    this.resistances = config.resistances || []; // Damage resistances
    this.immunities = config.immunities || []; // Damage immunities
    this.vulnerabilities = config.vulnerabilities || []; // Damage vulnerabilities
    
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
      abilities: this.abilities,
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
    return new Entity(json);
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
