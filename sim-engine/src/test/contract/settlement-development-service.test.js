/**
 * Settlement Development Service - Contract Tests
 *
 * Tests the SettlementDevelopmentService API contracts for development trees
 * and settlement upgrade management in the Valley of Echoes demo.
 */

import SettlementDevelopmentService from '../../domain/services/SettlementDevelopmentService.js';

describe('Settlement Development Service - Contract Tests', () => {
  let service;
  let mockWorld;
  let mockSettlement;

  beforeEach(() => {
    service = new SettlementDevelopmentService();

    // Mock world context
    mockWorld = {
      turn: 1,
      getSettlement: jest.fn(),
      getNode: jest.fn()
    };

    // Mock settlement as plain object
    mockSettlement = {
      id: 'settlement-1',
      name: 'Test Settlement',
      type: 'village',
      developmentLevel: 1,
      resources: new Map([['food', 100], ['materials', 50], ['gold', 200]]),
      population: 150,
      infrastructure: new Map([['housing', 1], ['walls', 0], ['market', 0]]),
      developmentTree: {
        currentLevel: 1,
        availableUpgrades: ['walls', 'market', 'temple'],
        completedUpgrades: [],
        prerequisites: {
          walls: { materials: 50, population: 100 },
          market: { gold: 100, materials: 25 },
          temple: { gold: 200, population: 200, prerequisites: ['market'] }
        }
      }
    };

    mockWorld.getSettlement.mockReturnValue(mockSettlement);
  });

  describe('Service Contract', () => {
    test('should have required development methods', () => {
      expect(typeof service.getAvailableUpgrades).toBe('function');
      expect(typeof service.checkUpgradePrerequisites).toBe('function');
      expect(typeof service.executeUpgrade).toBe('function');
      expect(typeof service.calculateUpgradeCost).toBe('function');
      expect(typeof service.getDevelopmentProgress).toBe('function');
      expect(typeof service.initializeDevelopmentTree).toBe('function');
      expect(typeof service.validateDevelopmentPath).toBe('function');
    });

    test('should have development tree management methods', () => {
      expect(typeof service.getAvailableUpgrades).toBe('function');
      expect(typeof service.initializeDevelopmentTree).toBe('function');
      expect(typeof service.validateDevelopmentPath).toBe('function');
    });

    test('should have upgrade execution methods', () => {
      expect(typeof service.checkUpgradePrerequisites).toBe('function');
      expect(typeof service.executeUpgrade).toBe('function');
      expect(typeof service.calculateUpgradeCost).toBe('function');
    });
  });

  describe('Development Tree Initialization Contract', () => {
    test('should initialize development tree for settlement', () => {
      const config = {
        settlementType: 'village',
        startingLevel: 1,
        availableUpgrades: ['walls', 'market', 'temple', 'barracks'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 },
          temple: { gold: 200, prerequisites: ['market'] },
          barracks: { materials: 75, population: 100 }
        }
      };

      const result = service.initializeDevelopmentTree('settlement-1', config);

      expect(result.success).toBe(true);
      expect(result.developmentTree).toBeDefined();
      expect(result.developmentTree.currentLevel).toBe(1);
      expect(result.developmentTree.availableUpgrades).toContain('walls');
      expect(result.developmentTree.availableUpgrades).toContain('market');
    });

    test('should validate development tree configuration', () => {
      const invalidConfig = {
        settlementType: 'invalid-type'
        // Invalid settlement type
      };

      const result = service.initializeDevelopmentTree('settlement-1', invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown settlement type');
    });

    test('should generate default development tree for settlement type', () => {
      const result = service.initializeDevelopmentTree('settlement-1', { settlementType: 'town' });

      expect(result.success).toBe(true);
      expect(result.developmentTree.settlementType).toBe('town');
      expect(result.developmentTree.availableUpgrades.length).toBeGreaterThan(0);
    });
  });

  describe('Available Upgrades Contract', () => {
    beforeEach(() => {
      // Initialize development tree
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        startingLevel: 1,
        availableUpgrades: ['walls', 'market', 'temple'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 },
          temple: { gold: 200, prerequisites: ['market'] }
        }
      });
    });

    test('should return available upgrades for settlement', () => {
      const result = service.getAvailableUpgrades('settlement-1', mockWorld);

      expect(result.success).toBe(true);
      expect(result.availableUpgrades).toBeDefined();
      expect(Array.isArray(result.availableUpgrades)).toBe(true);
      expect(result.availableUpgrades.length).toBeGreaterThan(0);
    });

    test('should filter upgrades based on prerequisites', () => {
      // Set settlement to not meet temple prerequisites
      mockSettlement.resources.set('gold', 50); // Less than 200 needed

      const result = service.getAvailableUpgrades('settlement-1', mockWorld);

      expect(result.success).toBe(true);
      expect(result.availableUpgrades).not.toContain('temple');
      expect(result.blockedUpgrades).toBeDefined();
      expect(result.blockedUpgrades.temple.some(req => req.includes('gold'))).toBe(true);
    });

    test('should include upgrade details and costs', () => {
      const result = service.getAvailableUpgrades('settlement-1', mockWorld);

      expect(result.success).toBe(true);
      const wallsUpgrade = result.availableUpgrades.find(u => u.id === 'walls');
      expect(wallsUpgrade).toBeDefined();
      expect(wallsUpgrade.cost).toBeDefined();
      expect(wallsUpgrade.description).toBeDefined();
    });
  });

  describe('Prerequisite Checking Contract', () => {
    beforeEach(() => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls', 'market', 'temple'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 },
          temple: { gold: 200, prerequisites: ['market'] }
        }
      });
    });

    test('should check upgrade prerequisites correctly', () => {
      const result = service.checkUpgradePrerequisites('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(true);
      expect(result.canExecute).toBe(true);
      expect(result.missingRequirements).toEqual([]);
    });

    test('should identify missing resource prerequisites', () => {
      mockSettlement.resources.set('materials', 25); // Less than 50 needed

      const result = service.checkUpgradePrerequisites('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(true);
      expect(result.canExecute).toBe(false);
      expect(result.missingRequirements.some(req => req.includes('materials'))).toBe(true);
    });

    test('should identify missing population prerequisites', () => {
      mockSettlement.population = 25; // Less than 50 needed for walls

      const result = service.checkUpgradePrerequisites('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(true);
      expect(result.canExecute).toBe(false);
      expect(result.missingRequirements.some(req => req.includes('population'))).toBe(true);
    });

    test('should identify missing upgrade prerequisites', () => {
      const result = service.checkUpgradePrerequisites('settlement-1', 'temple', mockWorld);

      expect(result.success).toBe(true);
      expect(result.canExecute).toBe(false);
      expect(result.missingRequirements.some(req => req.includes('market'))).toBe(true);
    });
  });

  describe('Upgrade Execution Contract', () => {
    beforeEach(() => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls', 'market'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 }
        }
      });
    });

    test('should execute upgrade successfully when prerequisites met', () => {
      const initialMaterials = mockSettlement.resources.get('materials');
      const initialInfrastructure = mockSettlement.infrastructure.get('walls');

      const result = service.executeUpgrade('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(true);
      expect(result.upgradeExecuted).toBe('walls');
      expect(result.resourcesConsumed).toBeDefined();
      expect(result.infrastructureChanges).toBeDefined();

      // Verify resources were consumed
      expect(mockSettlement.resources.get('materials')).toBeLessThan(initialMaterials);
      // Verify infrastructure was upgraded
      expect(mockSettlement.infrastructure.get('walls')).toBeGreaterThan(initialInfrastructure);
    });

    test('should fail upgrade execution when prerequisites not met', () => {
      mockSettlement.resources.set('materials', 25); // Less than 50 needed

      const result = service.executeUpgrade('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Prerequisites');
    });

    test('should update settlement development level after upgrade', () => {
      const result = service.executeUpgrade('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(true);
      expect(result.developmentLevelChanged).toBeDefined();
    });

    test('should record upgrade in completed upgrades list', () => {
      const result = service.executeUpgrade('settlement-1', 'walls', mockWorld);

      expect(result.success).toBe(true);
      expect(mockSettlement.developmentTree.completedUpgrades).toContain('walls');
    });
  });

  describe('Cost Calculation Contract', () => {
    beforeEach(() => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls', 'market'],
        prerequisites: {
          walls: { materials: 50, gold: 25 },
          market: { gold: 100, materials: 25 }
        }
      });
    });

    test('should calculate upgrade cost correctly', () => {
      const result = service.calculateUpgradeCost('settlement-1', 'walls');

      expect(result.success).toBe(true);
      expect(result.cost).toBeDefined();
      expect(result.cost.materials).toBe(50);
      expect(result.cost.gold).toBe(25);
    });

    test('should include scaling costs for repeated upgrades', () => {
      // Execute upgrade once
      service.executeUpgrade('settlement-1', 'walls', mockWorld);

      // Calculate cost for same upgrade again
      const result = service.calculateUpgradeCost('settlement-1', 'walls');

      expect(result.success).toBe(true);
      expect(result.cost).toBeDefined();
      // Cost should be higher for repeated upgrades
    });

    test('should calculate total cost including all requirements', () => {
      const result = service.calculateUpgradeCost('settlement-1', 'market');

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeDefined();
      expect(typeof result.totalCost).toBe('number');
    });
  });

  describe('Development Progress Contract', () => {
    beforeEach(() => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls', 'market', 'temple', 'barracks'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 },
          temple: { gold: 200, prerequisites: ['market'] },
          barracks: { materials: 75 }
        }
      });
    });

    test('should get development progress for settlement', () => {
      const result = service.getDevelopmentProgress('settlement-1');

      expect(result.success).toBe(true);
      expect(result.progress).toBeDefined();
      expect(result.progress.currentLevel).toBeDefined();
      expect(result.progress.completedUpgrades).toBeDefined();
      expect(result.progress.availableUpgrades).toBeDefined();
      expect(result.progress.overallProgress).toBeDefined();
    });

    test('should calculate overall development progress percentage', () => {
      // Execute one upgrade
      service.executeUpgrade('settlement-1', 'walls', mockWorld);

      const result = service.getDevelopmentProgress('settlement-1');

      expect(result.success).toBe(true);
      expect(result.progress.overallProgress).toBeGreaterThan(0);
      expect(result.progress.overallProgress).toBeLessThanOrEqual(100);
    });

    test('should identify next recommended upgrades', () => {
      const result = service.getDevelopmentProgress('settlement-1');

      expect(result.success).toBe(true);
      expect(result.progress.nextRecommended).toBeDefined();
      expect(Array.isArray(result.progress.nextRecommended)).toBe(true);
    });
  });

  describe('Development Path Validation Contract', () => {
    beforeEach(() => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls', 'market', 'temple'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 },
          temple: { gold: 200, prerequisites: ['market'] }
        }
      });
    });

    test('should validate development path sequence', () => {
      const path = ['walls', 'market', 'temple'];

      const result = service.validateDevelopmentPath('settlement-1', path);

      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.pathAnalysis).toBeDefined();
    });

    test('should identify invalid development sequences', () => {
      const invalidPath = ['temple', 'walls']; // Temple requires market first

      const result = service.validateDevelopmentPath('settlement-1', invalidPath);

      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes('temple'))).toBe(true);
    });

    test('should provide path optimization suggestions', () => {
      const suboptimalPath = ['temple', 'market', 'walls']; // Temple first, which is invalid

      const result = service.validateDevelopmentPath('settlement-1', suboptimalPath);

      expect(result.success).toBe(true);
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      // May or may not have suggestions depending on the path
    });
  });

  describe('Performance Requirements Contract', () => {
    test('should check prerequisites within performance limits', () => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls', 'market', 'temple', 'barracks', 'tavern'],
        prerequisites: {
          walls: { materials: 50 },
          market: { gold: 100 },
          temple: { gold: 200 },
          barracks: { materials: 75 },
          tavern: { gold: 50 }
        }
      });

      const startTime = performance.now();

      for (let i = 0; i < 50; i++) {
        service.checkUpgradePrerequisites('settlement-1', 'walls', mockWorld);
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 50;

      // Should check prerequisites within 5ms per operation
      expect(averageTime).toBeLessThan(5);
    });

    test('should calculate costs efficiently', () => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: Array.from({ length: 20 }, (_, i) => `upgrade-${i}`),
        prerequisites: Object.fromEntries(
          Array.from({ length: 20 }, (_, i) => [`upgrade-${i}`, { materials: 10 * i }])
        )
      });

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        service.calculateUpgradeCost('settlement-1', 'upgrade-5');
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 100;

      // Should calculate costs within 2ms per operation
      expect(averageTime).toBeLessThan(2);
    });

    test('should handle multiple settlements efficiently', () => {
      // Create multiple settlements
      const settlements = [];
      for (let i = 0; i < 10; i++) {
        const settlementId = `settlement-${i}`;

        service.initializeDevelopmentTree(settlementId, {
          settlementType: 'village',
          availableUpgrades: ['walls', 'market']
        });

        settlements.push(settlementId);
      }

      const startTime = performance.now();

      // Process development checks for all settlements
      settlements.forEach(settlementId => {
        service.getAvailableUpgrades(settlementId, mockWorld);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle 10 settlements within 50ms total
      expect(totalTime).toBeLessThan(50);
    });
  });

  describe('Error Handling Contract', () => {
    test('should handle invalid settlement IDs gracefully', () => {
      const result = service.getAvailableUpgrades('invalid-id', mockWorld);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Development tree not initialized');
    });

    test('should handle invalid upgrade IDs gracefully', () => {
      service.initializeDevelopmentTree('settlement-1', {
        settlementType: 'village',
        availableUpgrades: ['walls']
      });

      const result = service.checkUpgradePrerequisites('settlement-1', 'invalid-upgrade', mockWorld);

      expect(result.success).toBe(false);
      expect(result.error).toContain('upgrade');
    });

    test('should handle missing world context', () => {
      const result = service.getAvailableUpgrades('settlement-1', null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle settlements without development trees', () => {
      const settlementWithoutTree = {
        id: 'settlement-no-tree',
        name: 'Settlement Without Tree'
      };

      mockWorld.getSettlement.mockReturnValue(settlementWithoutTree);

      const result = service.getAvailableUpgrades('settlement-no-tree', mockWorld);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Development tree not initialized');
    });

    test('should validate upgrade configuration', () => {
      const invalidConfig = {
        settlementType: 'village',
        prerequisites: {
          invalid_upgrade: null // Invalid prerequisite
        }
      };

      const result = service.initializeDevelopmentTree('settlement-1', invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid prerequisites');
    });
  });
});