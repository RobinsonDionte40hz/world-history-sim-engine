// src/domain/entities/EntityGroup.js

/**
 * EntityGroup - Represents a group, faction, or pack of entities
 * 
 * Groups can be:
 * - Orc warbands
 * - Bandit gangs
 * - Wolf packs
 * - Guard patrols
 * - Monster hordes
 * - Defensive forces
 * 
 * Groups provide:
 * - Collective behavior
 * - Territorial control
 * - Combat coordination
 * - Morale effects
 * - Leadership bonuses
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

class EntityGroup {
  constructor(config = {}) {
    this.id = config.id || generateId();
    this.name = config.name || 'Unnamed Group';
    this.description = config.description || '';
    
    // Group classification
    this.type = config.type || 'warband'; // warband, pack, patrol, horde, gang, tribe, cult
    this.faction = config.faction || null; // Larger faction affiliation
    this.allegiance = config.allegiance || 'independent'; // independent, ally, enemy, neutral
    
    // Members
    this.members = config.members || []; // Array of entity IDs
    this.maxMembers = config.maxMembers || 50;
    this.composition = config.composition || {}; // { warrior: 10, archer: 5, etc. }
    
    // Leadership
    this.leaderId = config.leaderId || null; // Entity ID of leader
    this.hasLeader = config.hasLeader !== false;
    this.leadershipBonus = config.leadershipBonus || 0; // Bonus to group morale/combat
    
    // Collective behavior
    this.behavior = {
      stance: config.behavior?.stance || 'defensive', // aggressive, defensive, neutral, passive
      territory: config.behavior?.territory || 'patrol', // patrol, guard, roam, stationary, nomadic
      hostility: config.behavior?.hostility || 'hostile', // hostile, defensive, neutral, friendly
      intelligence: config.behavior?.intelligence || 'medium', // low, medium, high
      coordination: config.behavior?.coordination || 0.5 // 0-1, affects combat effectiveness
    };
    
    // Territory and locations
    this.territory = {
      homeNodeId: config.territory?.homeNodeId || null, // Primary base
      controlledNodes: config.territory?.controlledNodes || [], // Nodes under control
      patrolRoutes: config.territory?.patrolRoutes || [], // Routes between nodes
      territoryRadius: config.territory?.territoryRadius || 1, // How far they defend
      contested: config.territory?.contested || false // Whether territory is under dispute
    };
    
    // Combat capabilities (2x5 grid formation system)
    this.combat = {
      averageCR: config.combat?.averageCR || 1,
      totalCR: config.combat?.totalCR || 1,
      packTactics: config.combat?.packTactics || false, // Advantage when outnumbering
      formation: config.combat?.formation || {
        frontRow: [null, null, null, null, null], // 5 positions in front row
        backRow: [null, null, null, null, null]   // 5 positions in back row
      },
      formationType: config.combat?.formationType || 'standard', // standard, defensive, aggressive, skirmish
      retreatThreshold: config.combat?.retreatThreshold || 0.3 // HP % when group retreats
    };
    
    // Group morale and cohesion
    this.morale = {
      current: config.morale?.current || 100,
      base: config.morale?.base || 100,
      modifiers: config.morale?.modifiers || [], // Factors affecting morale
      leaderEffect: config.morale?.leaderEffect || 20 // Bonus from having leader alive
    };
    
    // Resources and loot
    this.resources = {
      treasury: config.resources?.treasury || 0,
      equipment: config.resources?.equipment || [],
      supplies: config.resources?.supplies || 0
    };
    
    // Relationships with other groups
    this.relationships = config.relationships || {}; // { groupId: { status: 'ally', strength: 0.8 } }
    
    // Activity and encounter data
    this.encounters = {
      totalEncounters: config.encounters?.totalEncounters || 0,
      victories: config.encounters?.victories || 0,
      defeats: config.encounters?.defeats || 0,
      lastEncounter: config.encounters?.lastEncounter || null,
      reputation: config.encounters?.reputation || 0 // -100 to 100
    };
    
    // State tracking
    this.isActive = config.isActive !== false;
    this.isHostile = config.isHostile !== false;
    this.isDefeated = config.isDefeated || false;
    
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
   * Add member to group
   * @param {string} entityId - Entity ID
   * @returns {boolean} Success
   */
  addMember(entityId) {
    if (this.members.length >= this.maxMembers) {
      return false;
    }
    if (this.members.includes(entityId)) {
      return false;
    }
    this.members.push(entityId);
    this.recalculateCombatRating();
    return true;
  }

  /**
   * Remove member from group
   * @param {string} entityId - Entity ID
   * @returns {boolean} Success
   */
  removeMember(entityId) {
    const index = this.members.indexOf(entityId);
    if (index === -1) {
      return false;
    }
    this.members.splice(index, 1);
    
    // If leader was removed, group loses leader
    if (entityId === this.leaderId) {
      this.leaderId = null;
    }
    
    this.recalculateCombatRating();
    this.checkGroupStatus();
    return true;
  }

  /**
   * Set leader of group
   * @param {string} entityId - Entity ID
   * @returns {boolean} Success
   */
  setLeader(entityId) {
    if (!this.members.includes(entityId)) {
      return false;
    }
    this.leaderId = entityId;
    this.hasLeader = true;
    return true;
  }

  /**
   * Get member count
   * @returns {number} Number of members
   */
  getMemberCount() {
    return this.members.length;
  }

  /**
   * Check if group has a leader
   * @returns {boolean} Has active leader
   */
  hasActiveLeader() {
    return this.hasLeader && this.leaderId && this.members.includes(this.leaderId);
  }

  /**
   * Recalculate combat rating based on members
   * @param {Array} entities - Optional array of entity objects
   */
  recalculateCombatRating(entities = null) {
    if (!entities || entities.length === 0) {
      // If no entity data provided, use member count as approximation
      this.combat.totalCR = this.members.length * this.combat.averageCR;
      return;
    }

    // Calculate from actual entities
    let totalCR = 0;
    entities.forEach(entity => {
      if (this.members.includes(entity.id)) {
        totalCR += entity.challengeRating;
      }
    });

    this.combat.totalCR = totalCR;
    this.combat.averageCR = totalCR / this.members.length || 1;
  }

  /**
   * Calculate current morale
   * @returns {number} Morale value (0-100)
   */
  getCurrentMorale() {
    let morale = this.morale.base;

    // Leader bonus
    if (this.hasActiveLeader()) {
      morale += this.morale.leaderEffect;
    } else if (this.hasLeader) {
      // Penalty if leader is supposed to exist but doesn't
      morale -= this.morale.leaderEffect;
    }

    // Size penalty (smaller groups have lower morale)
    const sizeRatio = this.members.length / this.maxMembers;
    if (sizeRatio < 0.5) {
      morale -= (0.5 - sizeRatio) * 40;
    }

    // Apply modifiers
    this.morale.modifiers.forEach(mod => {
      morale += mod.value;
    });

    return Math.max(0, Math.min(100, morale));
  }

  /**
   * Check if group controls a node
   * @param {string} nodeId - Node ID
   * @returns {boolean} Controls node
   */
  controlsNode(nodeId) {
    return this.territory.controlledNodes.includes(nodeId) || 
           this.territory.homeNodeId === nodeId;
  }

  /**
   * Add node to territory
   * @param {string} nodeId - Node ID
   */
  claimNode(nodeId) {
    if (!this.territory.controlledNodes.includes(nodeId)) {
      this.territory.controlledNodes.push(nodeId);
    }
  }

  /**
   * Remove node from territory
   * @param {string} nodeId - Node ID
   */
  abandonNode(nodeId) {
    const index = this.territory.controlledNodes.indexOf(nodeId);
    if (index !== -1) {
      this.territory.controlledNodes.splice(index, 1);
    }
  }

  /**
   * Set relationship with another group
   * @param {string} groupId - Other group ID
   * @param {string} status - Relationship status
   * @param {number} strength - Relationship strength (0-1)
   */
  setRelationship(groupId, status, strength = 0.5) {
    this.relationships[groupId] = {
      status, // ally, enemy, neutral, rival
      strength,
      established: new Date().toISOString()
    };
  }

  /**
   * Get relationship with another group
   * @param {string} groupId - Other group ID
   * @returns {Object|null} Relationship data
   */
  getRelationship(groupId) {
    return this.relationships[groupId] || null;
  }

  /**
   * Record encounter outcome
   * @param {string} outcome - victory, defeat, retreat, stalemate
   * @param {number} casualties - Number of members lost
   */
  recordEncounter(outcome, casualties = 0) {
    this.encounters.totalEncounters++;
    this.encounters.lastEncounter = new Date().toISOString();

    if (outcome === 'victory') {
      this.encounters.victories++;
      this.encounters.reputation += 5;
      this.morale.base = Math.min(100, this.morale.base + 10);
    } else if (outcome === 'defeat') {
      this.encounters.defeats++;
      this.encounters.reputation -= 10;
      this.morale.base = Math.max(0, this.morale.base - 20);
    }

    // Handle casualties
    if (casualties > 0) {
      this.morale.base = Math.max(0, this.morale.base - casualties * 2);
    }
  }

  /**
   * Check if group should retreat in combat
   * @param {number} memberCount - Current alive members
   * @returns {boolean} Should retreat
   */
  shouldRetreat(memberCount) {
    const survivalRatio = memberCount / this.members.length;
    const morale = this.getCurrentMorale();
    
    // Retreat if below threshold and low morale
    if (survivalRatio <= this.combat.retreatThreshold) {
      return morale < 50;
    }
    
    // Aggressive groups fight longer
    if (this.behavior.stance === 'aggressive') {
      return survivalRatio <= this.combat.retreatThreshold * 0.5 && morale < 30;
    }
    
    // Defensive groups retreat earlier
    if (this.behavior.stance === 'defensive') {
      return survivalRatio <= this.combat.retreatThreshold * 1.5 || morale < 40;
    }
    
    return false;
  }

  /**
   * Check group status and update state
   */
  checkGroupStatus() {
    // Group is defeated if too few members remain
    if (this.members.length < Math.max(1, this.maxMembers * 0.1)) {
      this.isDefeated = true;
      this.isActive = false;
    }

    // Group becomes inactive if no members
    if (this.members.length === 0) {
      this.isActive = false;
    }
  }

  /**
   * Get group threat level
   * @param {number} targetLevel - Target character/party level
   * @returns {string} Threat level
   */
  getThreatLevel(targetLevel) {
    const effectiveCR = this.combat.totalCR / 4; // Roughly 4 members = 1 CR higher
    const diff = effectiveCR - targetLevel;
    
    if (diff <= -4) return 'trivial';
    if (diff <= -2) return 'easy';
    if (diff <= 0) return 'medium';
    if (diff <= 2) return 'hard';
    if (diff <= 4) return 'deadly';
    return 'impossible';
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      faction: this.faction,
      allegiance: this.allegiance,
      members: this.members,
      maxMembers: this.maxMembers,
      composition: this.composition,
      leaderId: this.leaderId,
      hasLeader: this.hasLeader,
      leadershipBonus: this.leadershipBonus,
      behavior: this.behavior,
      territory: this.territory,
      combat: this.combat,
      morale: this.morale,
      resources: this.resources,
      relationships: this.relationships,
      encounters: this.encounters,
      isActive: this.isActive,
      isHostile: this.isHostile,
      isDefeated: this.isDefeated,
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   * @param {Object} json - JSON data
   * @returns {EntityGroup} New group
   */
  static fromJSON(json) {
    return new EntityGroup(json);
  }

  /**
   * Create from template
   * @param {Object} template - Template data
   * @param {Object} overrides - Property overrides
   * @returns {EntityGroup} New group
   */
  static fromTemplate(template, overrides = {}) {
    return new EntityGroup({
      ...template,
      id: generateId(),
      members: [], // New group starts empty
      metadata: {
        ...template.metadata,
        isTemplate: false,
        created: new Date().toISOString()
      },
      ...overrides
    });
  }

  // ===== COMBAT FORMATION METHODS (2x5 Grid) =====

  /**
   * Initializes combat formation (2x5 grid) from group members
   * Places members in formation based on their preferred positions
   * @param {Array} entityInstances - Array of Entity instances
   */
  initializeCombatFormation(entityInstances) {
    // Initialize empty formation grid
    this.combat.formation = {
      frontRow: [null, null, null, null, null],
      backRow: [null, null, null, null, null]
    };

    if (!entityInstances || entityInstances.length === 0) {
      return;
    }

    // Separate entities by preferred row
    const frontRowEntities = [];
    const backRowEntities = [];

    entityInstances.forEach(entity => {
      const preferredRow = entity.getPreferredCombatRow();
      if (preferredRow === 'front') {
        frontRowEntities.push(entity);
      } else {
        backRowEntities.push(entity);
      }
    });

    // Place leader in center of preferred row if available
    if (this.leadership.hasLeader) {
      const leader = entityInstances.find(e => e.id === this.leadership.leaderId);
      if (leader) {
        const leaderRow = leader.getPreferredCombatRow();
        const centerPosition = 2; // Middle of 5 positions
        
        if (leaderRow === 'front') {
          this.combat.formation.frontRow[centerPosition] = leader.id;
          leader.setCombatPosition('front', centerPosition);
          const index = frontRowEntities.indexOf(leader);
          if (index > -1) frontRowEntities.splice(index, 1);
        } else {
          this.combat.formation.backRow[centerPosition] = leader.id;
          leader.setCombatPosition('back', centerPosition);
          const index = backRowEntities.indexOf(leader);
          if (index > -1) backRowEntities.splice(index, 1);
        }
      }
    }

    // Place remaining front row entities
    let frontCol = 0;
    for (const entity of frontRowEntities) {
      while (frontCol < 5 && this.combat.formation.frontRow[frontCol] !== null) {
        frontCol++;
      }
      if (frontCol < 5) {
        this.combat.formation.frontRow[frontCol] = entity.id;
        entity.setCombatPosition('front', frontCol);
        frontCol++;
      } else {
        // Front row full, place in back row
        backRowEntities.push(entity);
      }
    }

    // Place back row entities
    let backCol = 0;
    for (const entity of backRowEntities) {
      while (backCol < 5 && this.combat.formation.backRow[backCol] !== null) {
        backCol++;
      }
      if (backCol < 5) {
        this.combat.formation.backRow[backCol] = entity.id;
        entity.setCombatPosition('back', backCol);
        backCol++;
      }
      // If both rows full (10+ entities), remaining entities are in reserve (no position)
    }
  }

  /**
   * Gets entity position in formation
   * @param {string} entityId - Entity ID
   * @returns {Object|null} {row: 'front'|'back', column: 0-4} or null
   */
  getEntityPosition(entityId) {
    const frontIndex = this.combat.formation.frontRow.indexOf(entityId);
    if (frontIndex !== -1) {
      return { row: 'front', column: frontIndex };
    }

    const backIndex = this.combat.formation.backRow.indexOf(entityId);
    if (backIndex !== -1) {
      return { row: 'back', column: backIndex };
    }

    return null; // Entity not in formation (dead, incapacitated, or in reserve)
  }

  /**
   * Removes entity from formation (when killed or incapacitated)
   * @param {string} entityId - Entity ID
   */
  removeFromFormation(entityId) {
    const frontIndex = this.combat.formation.frontRow.indexOf(entityId);
    if (frontIndex !== -1) {
      this.combat.formation.frontRow[frontIndex] = null;
      return;
    }

    const backIndex = this.combat.formation.backRow.indexOf(entityId);
    if (backIndex !== -1) {
      this.combat.formation.backRow[backIndex] = null;
    }
  }

  /**
   * Moves entity between rows (if allowed by entity capabilities)
   * @param {string} entityId - Entity ID
   * @param {string} newRow - 'front' or 'back'
   * @param {Object} entity - Entity instance (to check if movement allowed)
   * @returns {boolean} True if moved successfully
   */
  moveEntityToRow(entityId, newRow, entity) {
    if (!entity.combatPosition.canSwitchRows) {
      return false;
    }

    const currentPos = this.getEntityPosition(entityId);
    if (!currentPos || currentPos.row === newRow) {
      return false;
    }

    // Find empty position in target row
    const targetRow = newRow === 'front' ? this.combat.formation.frontRow : this.combat.formation.backRow;
    const emptyIndex = targetRow.indexOf(null);
    
    if (emptyIndex === -1) {
      return false; // No space in target row
    }

    // Remove from current row
    this.removeFromFormation(entityId);

    // Add to new row
    targetRow[emptyIndex] = entityId;
    entity.setCombatPosition(newRow, emptyIndex);

    return true;
  }

  /**
   * Gets all entities in front row
   * @returns {Array} Entity IDs in front row (excluding nulls)
   */
  getFrontRowEntities() {
    return this.combat.formation.frontRow.filter(id => id !== null);
  }

  /**
   * Gets all entities in back row
   * @returns {Array} Entity IDs in back row (excluding nulls)
   */
  getBackRowEntities() {
    return this.combat.formation.backRow.filter(id => id !== null);
  }

  /**
   * Checks if front row is empty (allows back row to be attacked in melee)
   * @returns {boolean} True if front row has no active entities
   */
  isFrontRowEmpty() {
    return this.getFrontRowEntities().length === 0;
  }

  /**
   * Gets total entities in formation (both rows)
   * @returns {number} Count of entities in formation
   */
  getFormationCount() {
    return this.getFrontRowEntities().length + this.getBackRowEntities().length;
  }

  /**
   * Applies formation type which affects combat bonuses/penalties
   * @param {string} formationType - 'standard', 'defensive', 'aggressive', 'skirmish'
   */
  setFormationType(formationType) {
    const validTypes = ['standard', 'defensive', 'aggressive', 'skirmish'];
    if (!validTypes.includes(formationType)) {
      throw new Error(`Invalid formation type: ${formationType}`);
    }

    this.combat.formationType = formationType;

    // Formation type effects:
    // - standard: balanced, no bonuses/penalties
    // - defensive: +2 AC to front row, -1 damage, harder to break through
    // - aggressive: +1 damage, -1 AC, front row pushes forward aggressively
    // - skirmish: +1 initiative, entities can move more freely, less organized defense
  }

  /**
   * Gets formation type bonuses/penalties
   * @returns {Object} Bonuses and penalties for current formation
   */
  getFormationModifiers() {
    const modifiers = {
      ac: 0,
      damage: 0,
      initiative: 0,
      special: []
    };

    switch (this.combat.formationType) {
      case 'defensive':
        modifiers.ac = 2;
        modifiers.damage = -1;
        modifiers.special.push('front_row_fortified');
        break;
      case 'aggressive':
        modifiers.ac = -1;
        modifiers.damage = 1;
        modifiers.special.push('relentless_advance');
        break;
      case 'skirmish':
        modifiers.initiative = 1;
        modifiers.special.push('mobile', 'evasive');
        break;
      default: // standard
        // No modifiers
        break;
    }

    return modifiers;
  }

}

export default EntityGroup;
