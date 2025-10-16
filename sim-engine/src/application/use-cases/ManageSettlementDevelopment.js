// src/application/use-cases/ManageSettlementDevelopment.js

import SettlementDevelopmentService from '../../../domain/services/SettlementDevelopmentService.js';
import DevelopmentTree from '../../../domain/value-objects/DevelopmentTree.js';
import SettlementGovernance from '../../../domain/value-objects/SettlementGovernance.js';

/**
 * Manage Settlement Development Use Case
 *
 * Handles settlement development operations including upgrade management,
 * prerequisite checking, resource validation, and development tree progression.
 * Provides a unified interface for settlement development activities.
 */
class ManageSettlementDevelopment {
  constructor(settlementDevelopmentService = null) {
    this.settlementDevelopmentService = settlementDevelopmentService || new SettlementDevelopmentService();
  }

  /**
   * Get available upgrades for a settlement
   * @param {Object} settlement - Settlement object
   * @param {Object} availableResources - Available resources (gold, materials, etc.)
   * @param {Set} completedUpgrades - Set of already completed upgrade IDs
   * @returns {Array} List of available upgrades with costs and effects
   */
  getAvailableUpgrades(settlement, availableResources = {}, completedUpgrades = new Set()) {
    if (!settlement) {
      throw new Error('Settlement is required');
    }

    const settlementType = settlement.type || 'village';
    const available = [];

    // Get upgrade definitions for this settlement type
    const upgradeDefinitions = this.settlementDevelopmentService.getUpgradeDefinitions(settlementType);

    for (const [upgradeId, upgrade] of upgradeDefinitions) {
      // Check if already completed
      if (completedUpgrades.has(upgradeId)) {
        continue;
      }

      // Check prerequisites
      const prerequisitesMet = this._checkPrerequisites(upgrade, completedUpgrades);
      if (!prerequisitesMet) {
        continue;
      }

      // Check resource requirements
      const canAfford = this._checkResourceRequirements(upgrade, availableResources);
      if (!canAfford) {
        continue;
      }

      // Check settlement requirements (population, etc.)
      const requirementsMet = this._checkSettlementRequirements(upgrade, settlement);
      if (!requirementsMet) {
        continue;
      }

      available.push({
        id: upgradeId,
        name: upgrade.name,
        description: upgrade.description,
        cost: { ...upgrade.cost },
        requirements: { ...upgrade.requirements },
        infrastructure: { ...upgrade.infrastructure },
        benefits: { ...upgrade.benefits },
        canAfford,
        prerequisitesMet,
        requirementsMet
      });
    }

    return available;
  }

  /**
   * Purchase and apply an upgrade to a settlement
   * @param {Object} settlement - Settlement object
   * @param {string} upgradeId - ID of the upgrade to purchase
   * @param {Object} availableResources - Available resources
   * @param {Set} completedUpgrades - Set of completed upgrades
   * @returns {Object} Result of the upgrade operation
   */
  purchaseUpgrade(settlement, upgradeId, availableResources = {}, completedUpgrades = new Set()) {
    if (!settlement || !upgradeId) {
      throw new Error('Settlement and upgrade ID are required');
    }

    const settlementType = settlement.type || 'village';
    const upgrade = this.settlementDevelopmentService.getUpgradeDefinition(settlementType, upgradeId);

    if (!upgrade) {
      throw new Error(`Upgrade ${upgradeId} not found for settlement type ${settlementType}`);
    }

    // Validate all requirements
    const validation = this._validateUpgradePurchase(settlement, upgrade, availableResources, completedUpgrades);
    if (!validation.canPurchase) {
      throw new Error(`Cannot purchase upgrade: ${validation.reason}`);
    }

    // Deduct resources
    const updatedResources = { ...availableResources };
    Object.entries(upgrade.cost).forEach(([resource, cost]) => {
      updatedResources[resource] = (updatedResources[resource] || 0) - cost;
    });

    // Add to completed upgrades
    const updatedCompletedUpgrades = new Set([...completedUpgrades, upgradeId]);

    // Apply upgrade effects to settlement
    const updatedSettlement = this._applyUpgradeEffects(settlement, upgrade);

    return {
      success: true,
      settlement: updatedSettlement,
      resources: updatedResources,
      completedUpgrades: updatedCompletedUpgrades,
      upgrade: {
        id: upgradeId,
        name: upgrade.name,
        effects: upgrade.benefits
      }
    };
  }

  /**
   * Get development tree for a settlement
   * @param {Object} settlement - Settlement object
   * @returns {DevelopmentTree} Development tree instance
   */
  getDevelopmentTree(settlement) {
    if (!settlement) {
      throw new Error('Settlement is required');
    }

    const category = settlement.type === 'federation' ? 'economic' :
                    settlement.type === 'dominion' ? 'military' : 'economic';

    return DevelopmentTree.get(category);
  }

  /**
   * Get development progress for a settlement
   * @param {Object} settlement - Settlement object
   * @param {Set} completedUpgrades - Set of completed upgrades
   * @returns {Object} Development progress information
   */
  getDevelopmentProgress(settlement, completedUpgrades = new Set()) {
    if (!settlement) {
      throw new Error('Settlement is required');
    }

    const tree = this.getDevelopmentTree(settlement);
    const available = this.getAvailableUpgrades(settlement, {}, completedUpgrades);

    return {
      settlementId: settlement.id,
      settlementName: settlement.name,
      settlementType: settlement.type,
      completedCount: completedUpgrades.size,
      availableCount: available.length,
      totalUpgrades: tree.getAllUpgradeIds().size,
      progressRatio: completedUpgrades.size / tree.getAllUpgradeIds().size,
      nextUpgrades: available.slice(0, 3), // Show next 3 available upgrades
      category: tree.category
    };
  }

  /**
   * Get governance impact on development
   * @param {Object} settlement - Settlement object
   * @returns {Object} Governance effects on development
   */
  getGovernanceDevelopmentImpact(settlement) {
    if (!settlement || !settlement.governance) {
      return {
        economicEfficiency: 1.0,
        developmentSpeed: 1.0,
        corruptionPenalty: 0.0,
        citizenSatisfaction: 0.5
      };
    }

    const governance = SettlementGovernance.fromJSON(settlement.governance);
    const modifiers = governance.getGovernanceModifiers();

    return {
      economicEfficiency: modifiers.economicEfficiency,
      developmentSpeed: modifiers.citizenSatisfaction,
      corruptionPenalty: modifiers.corruptionPenalty,
      citizenSatisfaction: modifiers.citizenSatisfaction
    };
  }

  /**
   * Calculate development cost with governance modifiers
   * @param {Object} upgrade - Upgrade definition
   * @param {Object} settlement - Settlement object
   * @returns {Object} Modified costs
   */
  calculateModifiedCosts(upgrade, settlement) {
    const governanceImpact = this.getGovernanceDevelopmentImpact(settlement);
    const modifiedCosts = {};

    Object.entries(upgrade.cost).forEach(([resource, cost]) => {
      // Apply corruption penalty (increases costs)
      const corruptionMultiplier = 1 + governanceImpact.corruptionPenalty;
      // Apply economic efficiency (decreases costs)
      const efficiencyMultiplier = 1 / governanceImpact.economicEfficiency;

      modifiedCosts[resource] = Math.ceil(cost * corruptionMultiplier * efficiencyMultiplier);
    });

    return modifiedCosts;
  }

  /**
   * Check if prerequisites are met for an upgrade
   * @private
   */
  _checkPrerequisites(upgrade, completedUpgrades) {
    if (!upgrade.prerequisites || upgrade.prerequisites.length === 0) {
      return true;
    }

    return upgrade.prerequisites.every(prereq => completedUpgrades.has(prereq));
  }

  /**
   * Check if resource requirements are met
   * @private
   */
  _checkResourceRequirements(upgrade, availableResources) {
    return Object.entries(upgrade.cost).every(([resource, cost]) => {
      return (availableResources[resource] || 0) >= cost;
    });
  }

  /**
   * Check if settlement requirements are met
   * @private
   */
  _checkSettlementRequirements(upgrade, settlement) {
    if (!upgrade.requirements) {
      return true;
    }

    // Check population requirements
    if (upgrade.requirements.population) {
      const settlementPopulation = settlement.assignedCharacters?.length || 0;
      if (settlementPopulation < upgrade.requirements.population) {
        return false;
      }
    }

    // Check other requirements as needed
    return true;
  }

  /**
   * Validate upgrade purchase
   * @private
   */
  _validateUpgradePurchase(settlement, upgrade, availableResources, completedUpgrades) {
    // Check prerequisites
    if (!this._checkPrerequisites(upgrade, completedUpgrades)) {
      return { canPurchase: false, reason: 'Prerequisites not met' };
    }

    // Check resources
    if (!this._checkResourceRequirements(upgrade, availableResources)) {
      return { canPurchase: false, reason: 'Insufficient resources' };
    }

    // Check settlement requirements
    if (!this._checkSettlementRequirements(upgrade, settlement)) {
      return { canPurchase: false, reason: 'Settlement requirements not met' };
    }

    return { canPurchase: true };
  }

  /**
   * Apply upgrade effects to settlement
   * @private
   */
  _applyUpgradeEffects(settlement, upgrade) {
    const updatedSettlement = { ...settlement };

    // Apply infrastructure changes
    if (upgrade.infrastructure) {
      updatedSettlement.infrastructure = {
        ...updatedSettlement.infrastructure,
        ...upgrade.infrastructure
      };
    }

    // Apply benefits/effects
    if (upgrade.benefits) {
      updatedSettlement.benefits = {
        ...updatedSettlement.benefits,
        ...upgrade.benefits
      };
    }

    // Update development tracking
    if (!updatedSettlement.completedUpgrades) {
      updatedSettlement.completedUpgrades = [];
    }
    // Note: The upgrade ID would be added by the caller

    return updatedSettlement;
  }
}

export default ManageSettlementDevelopment;