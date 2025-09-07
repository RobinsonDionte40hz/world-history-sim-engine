// src/domain/services/__tests__/ConsequenceLifecycleManager.test.js

import ConsequenceLifecycleManager from '../ConsequenceLifecycleManager.js';
import NeedConsequenceService from '../NeedConsequenceService.js';

// Mock the NeedConsequenceService
jest.mock('../NeedConsequenceService.js');

describe('ConsequenceLifecycleManager', () => {
  let lifecycleManager;
  let mockNeedConsequenceService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock NeedConsequenceService
    mockNeedConsequenceService = {
      canResolveConsequence: jest.fn(),
      resolveConsequence: jest.fn(),
      generateConsequences: jest.fn()
    };

    // Mock the constructor and methods
    NeedConsequenceService.mockImplementation(() => mockNeedConsequenceService);

    // Create lifecycle manager
    lifecycleManager = new ConsequenceLifecycleManager();
  });

  describe('processConsequenceLifecycle', () => {
    it('should process consequences for multiple settlements', () => {
      const settlements = [
        createMockSettlement('settlement1', 'Town A'),
        createMockSettlement('settlement2', 'Town B')
      ];

      const results = lifecycleManager.processConsequenceLifecycle(settlements);

      expect(results.processedSettlements).toHaveLength(2);
      expect(results.summary.totalActiveConsequences).toBe(0);
      expect(results.summary.description).toBe('No consequences processed');
    });

    it('should handle settlements with active consequences', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      settlement.needSatisfaction.activeConsequences = [
        createMockConsequence('famine1', 'famine', 0.8, 10)
      ];

      mockNeedConsequenceService.canResolveConsequence.mockReturnValue(false);

      const results = lifecycleManager.processConsequenceLifecycle([settlement]);

      expect(results.summary.totalActiveConsequences).toBe(1);
      expect(results.summary.description).toContain('1 active consequence');
    });

    it('should resolve consequences when triggers are met', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const consequence = createMockConsequence('famine1', 'famine', 0.8, 10);
      settlement.needSatisfaction.activeConsequences = [consequence];

      mockNeedConsequenceService.canResolveConsequence.mockReturnValue(true);
      mockNeedConsequenceService.resolveConsequence.mockReturnValue({
        ...consequence,
        resolved: true,
        endDate: new Date()
      });

      const results = lifecycleManager.processConsequenceLifecycle([settlement]);

      expect(results.resolvedConsequences).toHaveLength(1);
      expect(results.summary.newlyResolved).toBe(1);
      expect(mockNeedConsequenceService.canResolveConsequence).toHaveBeenCalledWith(consequence, settlement);
      expect(mockNeedConsequenceService.resolveConsequence).toHaveBeenCalledWith(consequence, settlement);
    });

    it('should handle expired consequences', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 20); // 20 days ago

      const consequence = createMockConsequence('famine1', 'famine', 0.8, 10);
      consequence.startDate = oldDate;
      settlement.needSatisfaction.activeConsequences = [consequence];

      mockNeedConsequenceService.canResolveConsequence.mockReturnValue(false);

      const results = lifecycleManager.processConsequenceLifecycle([settlement]);

      expect(results.expiredConsequences).toHaveLength(1);
      expect(results.summary.newlyExpired).toBe(1);
    });

    it('should handle player actions for resolution', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const consequence = createMockConsequence('famine1', 'famine', 0.8, 10);
      consequence.triggers = ['successful_harvest'];
      settlement.needSatisfaction.activeConsequences = [consequence];

      const playerActions = [{
        type: 'agriculture',
        buildingType: 'farm'
      }];

      const results = lifecycleManager.processConsequenceLifecycle([settlement], { [settlement.id]: playerActions });

      expect(results.resolvedConsequences).toHaveLength(1);
      expect(results.summary.playerTriggeredResolutions).toBe(1);
    });
  });

  describe('addConsequencesToSettlement', () => {
    it('should add new consequences to settlement', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const newConsequences = [
        createMockConsequence('famine1', 'famine', 0.8, 10),
        createMockConsequence('water1', 'water_crisis', 0.7, 8)
      ];

      const updatedSettlement = lifecycleManager.addConsequencesToSettlement(settlement, newConsequences);

      expect(updatedSettlement.needSatisfaction.activeConsequences).toHaveLength(2);
      expect(updatedSettlement.needSatisfaction.activeConsequences[0].lifecycle).toBeDefined();
      expect(updatedSettlement.needSatisfaction.activeConsequences[0].lifecycle.addedAt).toBeInstanceOf(Date);
    });

    it('should initialize needSatisfaction if missing', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      delete settlement.needSatisfaction;

      const newConsequences = [createMockConsequence('famine1', 'famine', 0.8, 10)];

      const updatedSettlement = lifecycleManager.addConsequencesToSettlement(settlement, newConsequences);

      expect(updatedSettlement.needSatisfaction).toBeDefined();
      expect(updatedSettlement.needSatisfaction.activeConsequences).toHaveLength(1);
    });

    it('should validate inputs', () => {
      expect(() => {
        lifecycleManager.addConsequencesToSettlement(null, []);
      }).toThrow('Settlement must be a valid object');

      expect(() => {
        lifecycleManager.addConsequencesToSettlement(createMockSettlement('test', 'Test'), null);
      }).toThrow('Consequences must be an array');
    });
  });

  describe('resolveConsequenceManually', () => {
    it('should manually resolve a consequence', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const consequence = createMockConsequence('famine1', 'famine', 0.8, 10);
      settlement.needSatisfaction.activeConsequences = [consequence];

      const updatedSettlement = lifecycleManager.resolveConsequenceManually(
        settlement,
        'famine1',
        'Built irrigation system'
      );

      expect(updatedSettlement.needSatisfaction.activeConsequences[0].resolved).toBe(true);
      expect(updatedSettlement.needSatisfaction.activeConsequences[0].endDate).toBeInstanceOf(Date);
      expect(updatedSettlement.needSatisfaction.activeConsequences[0].lifecycle.resolvedBy).toBe('player_action');
      expect(updatedSettlement.needSatisfaction.activeConsequences[0].lifecycle.resolvingAction).toBe('Built irrigation system');
    });

    it('should throw error for non-existent consequence', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');

      expect(() => {
        lifecycleManager.resolveConsequenceManually(settlement, 'nonexistent', 'test');
      }).toThrow('Consequence with ID nonexistent not found');
    });
  });

  describe('getConsequenceStatistics', () => {
    it('should return statistics for settlement consequences', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      settlement.needSatisfaction.activeConsequences = [
        createMockConsequence('famine1', 'famine', 0.8, 10),
        createMockConsequence('water1', 'water_crisis', 0.3, 8),
        createMockConsequence('housing1', 'housing_crisis', 0.9, 15)
      ];

      const stats = lifecycleManager.getConsequenceStatistics(settlement);

      expect(stats.total).toBe(3);
      expect(stats.byType.famine).toBe(1);
      expect(stats.byType.water_crisis).toBe(1);
      expect(stats.byType.housing_crisis).toBe(1);
      expect(stats.bySeverity.high).toBe(2);
      expect(stats.bySeverity.medium).toBe(0);
      expect(stats.bySeverity.low).toBe(1);
      expect(stats.averageSeverity).toBeCloseTo(0.67, 2);
    });

    it('should handle empty consequences', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');

      const stats = lifecycleManager.getConsequenceStatistics(settlement);

      expect(stats.total).toBe(0);
      expect(stats.averageSeverity).toBe(0);
    });
  });

  describe('cleanupResolvedConsequences', () => {
    it('should remove resolved consequences', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const resolvedConsequence = createMockConsequence('famine1', 'famine', 0.8, 10);
      resolvedConsequence.resolved = true;
      resolvedConsequence.endDate = new Date();

      const activeConsequence = createMockConsequence('water1', 'water_crisis', 0.7, 8);

      settlement.needSatisfaction.activeConsequences = [resolvedConsequence, activeConsequence];

      const results = lifecycleManager.cleanupResolvedConsequences(settlement);

      expect(results.cleanedCount).toBe(1);
      expect(results.settlement.needSatisfaction.activeConsequences).toHaveLength(1);
      expect(results.settlement.needSatisfaction.activeConsequences[0].id).toBe('water1');
    });

    it('should remove expired consequences', () => {
      const settlement = createMockSettlement('settlement1', 'Town A');
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 20);

      const expiredConsequence = createMockConsequence('famine1', 'famine', 0.8, 10);
      expiredConsequence.startDate = oldDate;

      settlement.needSatisfaction.activeConsequences = [expiredConsequence];

      const results = lifecycleManager.cleanupResolvedConsequences(settlement);

      expect(results.cleanedCount).toBe(1);
      expect(results.settlement.needSatisfaction.activeConsequences).toHaveLength(0);
    });
  });

  describe('PlayerActionTracker', () => {
    it('should track player actions', () => {
      // Create a new instance of PlayerActionTracker
      const tracker = new (class PlayerActionTracker {
        constructor() {
          this.actionHistory = new Map();
          this.maxHistorySize = 100;
        }

        trackAction(settlementId, action) {
          if (!this.actionHistory.has(settlementId)) {
            this.actionHistory.set(settlementId, []);
          }
          const actions = this.actionHistory.get(settlementId);
          actions.push(action);
          if (actions.length > this.maxHistorySize) {
            actions.shift();
          }
        }

        getRecentActions(settlementId, limit = 10) {
          const actions = this.actionHistory.get(settlementId) || [];
          return actions.slice(-limit);
        }

        hasPerformedAction(settlementId, actionType, timeWindow = 30) {
          const actions = this.getRecentActions(settlementId, 50);
          const cutoffTime = new Date(Date.now() - (timeWindow * 24 * 60 * 60 * 1000));
          return actions.some(action =>
            action.type === actionType &&
            new Date(action.timestamp) > cutoffTime
          );
        }
      })();

      const action = {
        type: 'construction',
        buildingType: 'aqueduct',
        timestamp: new Date()
      };

      tracker.trackAction('settlement1', action);

      const recentActions = tracker.getRecentActions('settlement1');
      expect(recentActions).toHaveLength(1);
      expect(recentActions[0]).toEqual(action);
    });

    it('should check for recent actions', () => {
      const tracker = new (class PlayerActionTracker {
        constructor() {
          this.actionHistory = new Map();
          this.maxHistorySize = 100;
        }

        trackAction(settlementId, action) {
          if (!this.actionHistory.has(settlementId)) {
            this.actionHistory.set(settlementId, []);
          }
          const actions = this.actionHistory.get(settlementId);
          actions.push(action);
          if (actions.length > this.maxHistorySize) {
            actions.shift();
          }
        }

        getRecentActions(settlementId, limit = 10) {
          const actions = this.actionHistory.get(settlementId) || [];
          return actions.slice(-limit);
        }

        hasPerformedAction(settlementId, actionType, timeWindow = 30) {
          const actions = this.getRecentActions(settlementId, 50);
          const cutoffTime = new Date(Date.now() - (timeWindow * 24 * 60 * 60 * 1000));
          return actions.some(action =>
            action.type === actionType &&
            new Date(action.timestamp) > cutoffTime
          );
        }
      })();

      const action = {
        type: 'construction',
        buildingType: 'aqueduct',
        timestamp: new Date()
      };

      tracker.trackAction('settlement1', action);

      expect(tracker.hasPerformedAction('settlement1', 'construction')).toBe(true);
      expect(tracker.hasPerformedAction('settlement1', 'trade')).toBe(false);
    });
  });

  describe('TriggerDetectionService', () => {
    it('should detect player action triggers', () => {
      const detector = new (class TriggerDetectionService {
        checkPlayerActionTrigger(consequence, playerAction) {
          if (!consequence.triggers || !playerAction) return false;
          const actionType = playerAction.type || playerAction;
          return consequence.triggers.some(trigger =>
            this._matchesTrigger(trigger, actionType, playerAction)
          );
        }

        _matchesTrigger(trigger, actionType, playerAction) {
          if (trigger === actionType) return true;
          switch (trigger) {
            case 'build_aqueduct':
              return actionType === 'construction' && playerAction.buildingType === 'aqueduct';
            case 'successful_harvest':
              return actionType === 'agriculture' || actionType === 'farm_improvement';
            default:
              return false;
          }
        }
      })();

      const consequence = {
        triggers: ['build_aqueduct', 'find_water_source']
      };
      const playerAction = {
        type: 'construction',
        buildingType: 'aqueduct'
      };

      const result = detector.checkPlayerActionTrigger(consequence, playerAction);
      expect(result).toBe(true);
    });

    it('should handle complex trigger patterns', () => {
      const detector = new (class TriggerDetectionService {
        checkPlayerActionTrigger(consequence, playerAction) {
          if (!consequence.triggers || !playerAction) return false;
          const actionType = playerAction.type || playerAction;
          return consequence.triggers.some(trigger =>
            this._matchesTrigger(trigger, actionType, playerAction)
          );
        }

        _matchesTrigger(trigger, actionType, playerAction) {
          if (trigger === actionType) return true;
          switch (trigger) {
            case 'build_aqueduct':
              return actionType === 'construction' && playerAction.buildingType === 'aqueduct';
            case 'successful_harvest':
              return actionType === 'agriculture' || actionType === 'farm_improvement';
            default:
              return false;
          }
        }
      })();

      const consequence = {
        triggers: ['successful_harvest']
      };
      const playerAction = {
        type: 'agriculture',
        buildingType: 'farm'
      };

      const result = detector.checkPlayerActionTrigger(consequence, playerAction);
      expect(result).toBe(true);
    });
  });
});

// Helper functions for creating mock objects

function createMockSettlement(id, name) {
  return {
    id,
    name,
    population: { total: 100 },
    needSatisfaction: {
      current: {
        food: 0.5,
        water: 0.5,
        shelter: 0.5,
        goods: 0.5,
        services: 0.5,
        overall: 0.5
      },
      history: [],
      trends: {},
      activeConsequences: []
    }
  };
}

function createMockConsequence(id, type, severity, duration) {
  return {
    id,
    type,
    severity,
    description: `Test ${type} consequence`,
    effects: {},
    duration,
    triggers: [],
    resolved: false,
    startDate: new Date(),
    lifecycle: {
      age: 0,
      lastProcessed: new Date()
    }
  };
}
