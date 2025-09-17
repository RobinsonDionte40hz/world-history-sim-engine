// src/domain/services/AssignmentConsistencyService.js

/**
 * T044: Assignment Pattern Consistency Service
 * 
 * Enforces bidirectional assignment patterns and validates assignment integrity
 * throughout the system. Uses PatternValidator from T043 for validation logic.
 * 
 * Key Features:
 * 1. Bidirectional Assignment Enforcement
 * 2. Automatic Inconsistency Repair
 * 3. Pattern Validation Integration
 * 4. Assignment Integrity Checks
 * 5. Performance-Optimized Operations
 */

import { PatternValidator } from './PatternValidator.js';

class AssignmentConsistencyService {
  constructor() {
    this.validationCache = new Map();
    this.repairHistory = [];
  }

  /**
   * Validate and repair all assignments in a world
   * @param {Object} world - World object with characters, nodes, interactions
   * @returns {Object} Validation and repair report
   */
  validateAndRepairWorld(world) {
    const report = {
      validationResults: {
        characters: 0,
        nodes: 0,
        interactions: 0,
        totalIssues: 0
      },
      repairResults: {
        fixedAssignments: 0,
        addedReferences: 0,
        removedReferences: 0,
        normalizedProperties: 0
      },
      performanceMetrics: {
        startTime: Date.now(),
        endTime: null,
        duration: null
      }
    };

    try {
      // Create lookup maps for efficient operations
      const characterMap = new Map(world.characters);
      const nodeMap = new Map(world.nodes);
      const interactionMap = new Map(world.interactions);

      // Validate and repair character assignments
      this.validateAndRepairCharacterAssignments(characterMap, nodeMap, interactionMap, report);

      // Validate and repair node assignments
      this.validateAndRepairNodeAssignments(nodeMap, characterMap, report);

      // Validate and repair interaction assignments
      this.validateAndRepairInteractionAssignments(interactionMap, characterMap, report);

      // Validate property naming patterns
      this.validateAndRepairPropertyPatterns(world, report);

      // Final integrity check
      this.performIntegrityCheck(world, report);

    } catch (error) {
      report.error = error.message;
      console.error('AssignmentConsistencyService error:', error);
    } finally {
      report.performanceMetrics.endTime = Date.now();
      report.performanceMetrics.duration = report.performanceMetrics.endTime - report.performanceMetrics.startTime;
    }

    return report;
  }

  /**
   * Validate and repair character assignments
   * @param {Map} characterMap - Map of character ID to character object
   * @param {Map} nodeMap - Map of node ID to node object  
   * @param {Map} interactionMap - Map of interaction ID to interaction object
   * @param {Object} report - Report object to update
   */
  validateAndRepairCharacterAssignments(characterMap, nodeMap, interactionMap, report) {
    for (const [characterId, character] of characterMap) {
      // Ensure character has proper assignment structure
      if (!character.assignments) {
        character.assignments = {
          nodes: new Set(),
          interactions: new Set()
        };
        report.repairResults.fixedAssignments++;
      }

      // Ensure assignments are Sets
      if (!(character.assignments.nodes instanceof Set)) {
        character.assignments.nodes = new Set(character.assignments.nodes || []);
        report.repairResults.fixedAssignments++;
      }

      if (!(character.assignments.interactions instanceof Set)) {
        character.assignments.interactions = new Set(character.assignments.interactions || []);
        report.repairResults.fixedAssignments++;
      }

      // Ensure currentNodeId is in assignments
      if (character.currentNodeId && !character.assignments.nodes.has(character.currentNodeId)) {
        character.assignments.nodes.add(character.currentNodeId);
        report.repairResults.addedReferences++;
      }

      // Validate node assignments exist
      const invalidNodeIds = [];
      for (const nodeId of character.assignments.nodes) {
        if (!nodeMap.has(nodeId)) {
          invalidNodeIds.push(nodeId);
          report.validationResults.totalIssues++;
        }
      }

      // Remove invalid node references
      invalidNodeIds.forEach(nodeId => {
        character.assignments.nodes.delete(nodeId);
        report.repairResults.removedReferences++;
      });

      // Validate interaction assignments exist  
      const invalidInteractionIds = [];
      for (const interactionId of character.assignments.interactions) {
        if (!interactionMap.has(interactionId)) {
          invalidInteractionIds.push(interactionId);
          report.validationResults.totalIssues++;
        }
      }

      // Remove invalid interaction references
      invalidInteractionIds.forEach(interactionId => {
        character.assignments.interactions.delete(interactionId);
        report.repairResults.removedReferences++;
      });

      // Ensure bidirectional consistency with nodes
      for (const nodeId of character.assignments.nodes) {
        const node = nodeMap.get(nodeId);
        if (node) {
          if (!node.characters) {
            node.characters = [];
          }
          if (!node.characters.includes(characterId)) {
            node.characters.push(characterId);
            report.repairResults.addedReferences++;
          }
        }
      }

      report.validationResults.characters++;
    }
  }

  /**
   * Validate and repair node assignments
   * @param {Map} nodeMap - Map of node ID to node object
   * @param {Map} characterMap - Map of character ID to character object
   * @param {Object} report - Report object to update
   */
  validateAndRepairNodeAssignments(nodeMap, characterMap, report) {
    for (const [nodeId, node] of nodeMap) {
      // Ensure node has characters array
      if (!node.characters) {
        node.characters = [];
        report.repairResults.fixedAssignments++;
      }

      // Ensure characters array is actually an array
      if (!Array.isArray(node.characters)) {
        node.characters = Array.from(node.characters || []);
        report.repairResults.fixedAssignments++;
      }

      // Validate character references exist
      const invalidCharacterIds = [];
      for (const characterId of node.characters) {
        if (!characterMap.has(characterId)) {
          invalidCharacterIds.push(characterId);
          report.validationResults.totalIssues++;
        }
      }

      // Remove invalid character references
      invalidCharacterIds.forEach(characterId => {
        const index = node.characters.indexOf(characterId);
        if (index > -1) {
          node.characters.splice(index, 1);
          report.repairResults.removedReferences++;
        }
      });

      // Ensure bidirectional consistency with characters
      for (const characterId of node.characters) {
        const character = characterMap.get(characterId);
        if (character && character.assignments) {
          if (!character.assignments.nodes.has(nodeId)) {
            character.assignments.nodes.add(nodeId);
            report.repairResults.addedReferences++;
          }
        }
      }

      // Remove duplicates
      const uniqueCharacters = [...new Set(node.characters)];
      if (uniqueCharacters.length !== node.characters.length) {
        node.characters = uniqueCharacters;
        report.repairResults.fixedAssignments++;
      }

      report.validationResults.nodes++;
    }
  }

  /**
   * Validate and repair interaction assignments
   * @param {Map} interactionMap - Map of interaction ID to interaction object
   * @param {Map} characterMap - Map of character ID to character object
   * @param {Object} report - Report object to update
   */
  validateAndRepairInteractionAssignments(interactionMap, characterMap, report) {
    for (const [interactionId, interaction] of interactionMap) {
      // Ensure interaction has participants array
      if (!interaction.participants) {
        interaction.participants = [];
        report.repairResults.fixedAssignments++;
      }

      // Validate participant references exist
      const invalidParticipants = [];
      for (const participantId of interaction.participants) {
        if (!characterMap.has(participantId)) {
          invalidParticipants.push(participantId);
          report.validationResults.totalIssues++;
        }
      }

      // Remove invalid participant references
      invalidParticipants.forEach(participantId => {
        const index = interaction.participants.indexOf(participantId);
        if (index > -1) {
          interaction.participants.splice(index, 1);
          report.repairResults.removedReferences++;
        }
      });

      // Ensure bidirectional consistency with characters
      for (const participantId of interaction.participants) {
        const character = characterMap.get(participantId);
        if (character && character.assignments) {
          if (!character.assignments.interactions.has(interactionId)) {
            character.assignments.interactions.add(interactionId);
            report.repairResults.addedReferences++;
          }
        }
      }

      report.validationResults.interactions++;
    }
  }

  /**
   * Validate and repair property naming patterns
   * @param {Object} world - World object
   * @param {Object} report - Report object to update
   */
  validateAndRepairPropertyPatterns(world, report) {
    // Validate character property naming
    for (const character of world.characters.values()) {
      if (!PatternValidator.validatePropertyNaming(character)) {
        // Note: Property renaming is complex and could break references
        // For now, just report the issue
        report.validationResults.totalIssues++;
        console.warn(`Character ${character.id} has non-camelCase properties`);
      }

      // Validate D&D attributes if present
      if (character.attributes && !PatternValidator.validateDnDAttributes(character.attributes)) {
        report.validationResults.totalIssues++;
        console.warn(`Character ${character.id} has invalid D&D attributes`);
      }
    }

    // Validate node property naming and environmental properties
    for (const node of world.nodes.values()) {
      if (!PatternValidator.validatePropertyNaming(node)) {
        report.validationResults.totalIssues++;
        console.warn(`Node ${node.id} has non-camelCase properties`);
      }

      // Validate environmental properties if present
      if (node.environment && !PatternValidator.validateEnvironmentalProperties(node.environment)) {
        report.validationResults.totalIssues++;
        console.warn(`Node ${node.id} has invalid environmental properties`);
      }

      // Validate cultural context if present
      if (node.culture && !PatternValidator.validateCulturalContext(node.culture)) {
        report.validationResults.totalIssues++;
        console.warn(`Node ${node.id} has invalid cultural context`);
      }
    }
  }

  /**
   * Perform final integrity check
   * @param {Object} world - World object
   * @param {Object} report - Report object to update
   */
  performIntegrityCheck(world, report) {
    const characterMap = new Map(world.characters);
    const nodeMap = new Map(world.nodes);

    let integrityIssues = 0;

    // Check all character-node relationships are bidirectional
    for (const character of world.characters.values()) {
      if (!PatternValidator.validateAssignmentPattern(character, nodeMap)) {
        integrityIssues++;
        console.warn(`Character ${character.id} has assignment pattern issues`);
      }
    }

    // Check all node-character relationships are bidirectional
    for (const node of world.nodes.values()) {
      if (node.characters) {
        for (const characterId of node.characters) {
          const character = characterMap.get(characterId);
          if (!character || !character.assignments.nodes.has(node.id)) {
            integrityIssues++;
            console.warn(`Node ${node.id} has orphaned character reference: ${characterId}`);
          }
        }
      }
    }

    report.integrityCheck = {
      issues: integrityIssues,
      passed: integrityIssues === 0
    };
  }

  /**
   * Quick validation check for a single character
   * @param {Object} character - Character object
   * @param {Map} nodeMap - Map of node ID to node object
   * @returns {boolean} True if character assignments are valid
   */
  validateCharacterAssignments(character, nodeMap) {
    const cacheKey = `${character.id}-${Date.now()}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }

    const isValid = PatternValidator.validateAssignmentPattern(character, nodeMap);
    this.validationCache.set(cacheKey, isValid);
    
    // Clean cache periodically
    if (this.validationCache.size > 1000) {
      this.validationCache.clear();
    }

    return isValid;
  }

  /**
   * Quick repair for a single character's assignments
   * @param {Object} character - Character object
   * @param {Map} nodeMap - Map of node ID to node object
   * @returns {Object} Repair report
   */
  repairCharacterAssignments(character, nodeMap) {
    const repairs = {
      fixedStructure: false,
      addedReferences: 0,
      removedReferences: 0
    };

    // Ensure proper assignment structure
    if (!character.assignments) {
      character.assignments = {
        nodes: new Set(),
        interactions: new Set()
      };
      repairs.fixedStructure = true;
    }

    // Ensure Sets
    if (!(character.assignments.nodes instanceof Set)) {
      character.assignments.nodes = new Set(character.assignments.nodes || []);
      repairs.fixedStructure = true;
    }

    // Add currentNodeId if missing
    if (character.currentNodeId && !character.assignments.nodes.has(character.currentNodeId)) {
      character.assignments.nodes.add(character.currentNodeId);
      repairs.addedReferences++;
    }

    // Remove invalid node references
    const invalidNodes = [];
    for (const nodeId of character.assignments.nodes) {
      if (!nodeMap.has(nodeId)) {
        invalidNodes.push(nodeId);
      }
    }

    invalidNodes.forEach(nodeId => {
      character.assignments.nodes.delete(nodeId);
      repairs.removedReferences++;
    });

    // Update bidirectional references
    for (const nodeId of character.assignments.nodes) {
      const node = nodeMap.get(nodeId);
      if (node) {
        if (!node.characters) {
          node.characters = [];
        }
        if (!node.characters.includes(character.id)) {
          node.characters.push(character.id);
          repairs.addedReferences++;
        }
      }
    }

    this.repairHistory.push({
      characterId: character.id,
      timestamp: Date.now(),
      repairs
    });

    return repairs;
  }

  /**
   * Get validation and repair statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    return {
      cacheSize: this.validationCache.size,
      repairHistory: this.repairHistory.length,
      recentRepairs: this.repairHistory.slice(-10)
    };
  }

  /**
   * Clear all caches and history
   */
  clearCaches() {
    this.validationCache.clear();
    this.repairHistory = [];
  }
}

export default AssignmentConsistencyService;