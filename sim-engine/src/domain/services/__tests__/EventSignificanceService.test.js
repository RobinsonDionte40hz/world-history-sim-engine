/**
 * Unit tests for EventSignificanceService
 * Tests significance calculation, event classification, and edge cases
 */

const EventSignificanceService = require('../EventSignificanceService');

describe('EventSignificanceService', () => {
  let service;

  beforeEach(() => {
    service = new EventSignificanceService();
  });

  describe('Constructor', () => {
    test('should initialize with default significance threshold', () => {
      expect(service.getSignificanceThreshold()).toBe(0.3);
    });

    test('should initialize with predefined event type significances', () => {
      const eventTypes = service.getSupportedEventTypes();
      expect(eventTypes).toHaveProperty('social_success', 0.4);
      expect(eventTypes).toHaveProperty('goal_completion', 0.7);
      expect(eventTypes).toHaveProperty('death', 0.9);
      expect(eventTypes).toHaveProperty('default', 0.2);
    });
  });

  describe('calculateEventSignificance', () => {
    test('should calculate basic significance for known event type', () => {
      const event = {
        type: 'social_success',
        outcome: 'success',
        emotionalImpact: 0.5
      };

      const significance = service.calculateEventSignificance(event);
      
      // social_success (0.4) * success (1.2) * moderate emotional impact (1.0) = 0.48
      expect(significance).toBeCloseTo(0.48, 2);
    });

    test('should handle unknown event types with default significance', () => {
      const event = {
        type: 'unknown_event_type',
        outcome: 'neutral',
        emotionalImpact: 0.5
      };

      const significance = service.calculateEventSignificance(event);
      
      // default (0.2) * neutral (1.0) * moderate (1.0) = 0.2
      expect(significance).toBeCloseTo(0.2, 2);
    });

    test('should apply outcome modifiers correctly', () => {
      const baseEvent = {
        type: 'trade_success',
        outcome: 'neutral',
        emotionalImpact: 0.5
      };

      const baseSignificance = service.calculateEventSignificance(baseEvent);

      const criticalSuccess = service.calculateEventSignificance({
        ...baseEvent,
        outcome: 'critical_success'
      });

      const criticalFailure = service.calculateEventSignificance({
        ...baseEvent,
        outcome: 'critical_failure'
      });

      // Both critical outcomes should have higher significance than neutral
      expect(criticalSuccess).toBeGreaterThan(baseSignificance);
      expect(criticalFailure).toBeGreaterThan(baseSignificance);
      
      // Critical failure should have higher significance than critical success
      // due to higher outcome modifier (1.6 vs 1.5)
      expect(criticalFailure).toBeGreaterThan(criticalSuccess);
    });

    test('should apply emotional impact multipliers', () => {
      const baseEvent = {
        type: 'conflict',
        outcome: 'neutral'
      };

      const minimalImpact = service.calculateEventSignificance({
        ...baseEvent,
        emotionalImpact: 0.1
      });

      const extremeImpact = service.calculateEventSignificance({
        ...baseEvent,
        emotionalImpact: 0.9
      });

      expect(extremeImpact).toBeGreaterThan(minimalImpact);
    });

    test('should handle string emotional impact values', () => {
      const event = {
        type: 'social_success',
        outcome: 'success',
        emotionalImpact: 'high'
      };

      const significance = service.calculateEventSignificance(event);
      expect(significance).toBeGreaterThan(0);
    });

    test('should apply contextual modifiers', () => {
      const event = {
        type: 'social_success',
        outcome: 'success',
        emotionalImpact: 0.5
      };

      const baseSignificance = service.calculateEventSignificance(event);
      
      const firstTimeSignificance = service.calculateEventSignificance(event, {
        isFirstTime: true
      });

      const repeatedSignificance = service.calculateEventSignificance(event, {
        repetitionCount: 3
      });

      expect(firstTimeSignificance).toBeGreaterThan(baseSignificance);
      expect(repeatedSignificance).toBeLessThan(baseSignificance);
    });

    test('should bound significance between 0.0 and 1.0', () => {
      const highSignificanceEvent = {
        type: 'death',
        outcome: 'critical_failure',
        emotionalImpact: 'extreme'
      };

      const significance = service.calculateEventSignificance(highSignificanceEvent, {
        isFirstTime: true,
        characterImportance: 'hero',
        relationshipStrength: 90
      });

      expect(significance).toBeGreaterThanOrEqual(0.0);
      expect(significance).toBeLessThanOrEqual(1.0);
    });

    test('should throw error for invalid event object', () => {
      expect(() => service.calculateEventSignificance(null)).toThrow('Event must be a valid object');
      expect(() => service.calculateEventSignificance('invalid')).toThrow('Event must be a valid object');
      expect(() => service.calculateEventSignificance(undefined)).toThrow('Event must be a valid object');
    });
  });

  describe('getBaseSignificance', () => {
    test('should return correct significance for known event types', () => {
      expect(service.getBaseSignificance('social_success')).toBe(0.4);
      expect(service.getBaseSignificance('goal_completion')).toBe(0.7);
      expect(service.getBaseSignificance('death')).toBe(0.9);
    });

    test('should be case insensitive', () => {
      expect(service.getBaseSignificance('SOCIAL_SUCCESS')).toBe(0.4);
      expect(service.getBaseSignificance('Social_Success')).toBe(0.4);
    });

    test('should return default for unknown types', () => {
      expect(service.getBaseSignificance('unknown_type')).toBe(0.2);
      expect(service.getBaseSignificance('')).toBe(0.2);
      expect(service.getBaseSignificance(null)).toBe(0.2);
    });
  });

  describe('getOutcomeModifier', () => {
    test('should return correct modifiers for known outcomes', () => {
      expect(service.getOutcomeModifier('critical_success')).toBe(1.5);
      expect(service.getOutcomeModifier('success')).toBe(1.2);
      expect(service.getOutcomeModifier('neutral')).toBe(1.0);
      expect(service.getOutcomeModifier('failure')).toBe(1.3);
      expect(service.getOutcomeModifier('critical_failure')).toBe(1.6);
    });

    test('should be case insensitive', () => {
      expect(service.getOutcomeModifier('CRITICAL_SUCCESS')).toBe(1.5);
      expect(service.getOutcomeModifier('Critical_Success')).toBe(1.5);
    });

    test('should return neutral for unknown outcomes', () => {
      expect(service.getOutcomeModifier('unknown_outcome')).toBe(1.0);
      expect(service.getOutcomeModifier('')).toBe(1.0);
      expect(service.getOutcomeModifier(null)).toBe(1.0);
    });
  });

  describe('getEmotionalImpactMultiplier', () => {
    test('should handle numeric emotional impact values', () => {
      expect(service.getEmotionalImpactMultiplier(0.1)).toBe(0.8); // minimal
      expect(service.getEmotionalImpactMultiplier(0.3)).toBe(0.9); // low
      expect(service.getEmotionalImpactMultiplier(0.5)).toBe(1.0); // moderate
      expect(service.getEmotionalImpactMultiplier(0.7)).toBe(1.2); // high
      expect(service.getEmotionalImpactMultiplier(0.9)).toBe(1.5); // extreme
    });

    test('should handle string emotional impact values', () => {
      expect(service.getEmotionalImpactMultiplier('minimal')).toBe(0.8);
      expect(service.getEmotionalImpactMultiplier('low')).toBe(0.9);
      expect(service.getEmotionalImpactMultiplier('moderate')).toBe(1.0);
      expect(service.getEmotionalImpactMultiplier('high')).toBe(1.2);
      expect(service.getEmotionalImpactMultiplier('extreme')).toBe(1.5);
    });

    test('should be case insensitive for strings', () => {
      expect(service.getEmotionalImpactMultiplier('HIGH')).toBe(1.2);
      expect(service.getEmotionalImpactMultiplier('High')).toBe(1.2);
    });

    test('should return moderate for invalid values', () => {
      expect(service.getEmotionalImpactMultiplier('invalid')).toBe(1.0);
      expect(service.getEmotionalImpactMultiplier(null)).toBe(1.0);
      expect(service.getEmotionalImpactMultiplier(undefined)).toBe(1.0);
    });
  });

  describe('applyContextualModifiers', () => {
    test('should apply first-time event modifier', () => {
      const baseSignificance = 0.5;
      const context = { isFirstTime: true };
      
      const modified = service.applyContextualModifiers(baseSignificance, {}, context);
      expect(modified).toBeCloseTo(0.65, 2); // 0.5 * 1.3
    });

    test('should apply repetition penalty', () => {
      const baseSignificance = 0.5;
      const context = { repetitionCount: 3 };
      
      const modified = service.applyContextualModifiers(baseSignificance, {}, context);
      expect(modified).toBeLessThan(baseSignificance);
    });

    test('should apply character importance modifier', () => {
      const baseSignificance = 0.5;
      const context = { characterImportance: 'hero' };
      
      const modified = service.applyContextualModifiers(baseSignificance, {}, context);
      expect(modified).toBeCloseTo(0.75, 2); // 0.5 * 1.5
    });

    test('should apply relationship strength modifier', () => {
      const baseSignificance = 0.5;
      const context = { relationshipStrength: 85 };
      
      const modified = service.applyContextualModifiers(baseSignificance, {}, context);
      expect(modified).toBeCloseTo(0.7, 2); // 0.5 * 1.4
    });

    test('should apply time-based modifier', () => {
      const baseSignificance = 0.5;
      const context = { timeSinceLastSimilarEvent: 3 };
      
      const modified = service.applyContextualModifiers(baseSignificance, {}, context);
      expect(modified).toBeCloseTo(0.35, 2); // 0.5 * 0.7
    });

    test('should combine multiple modifiers', () => {
      const baseSignificance = 0.5;
      const context = {
        isFirstTime: true,
        characterImportance: 'hero',
        relationshipStrength: 85
      };
      
      const modified = service.applyContextualModifiers(baseSignificance, {}, context);
      // 0.5 * 1.3 (first time) * 1.5 (hero) * 1.4 (relationship) = 1.365
      expect(modified).toBeCloseTo(1.365, 2);
    });
  });

  describe('getCharacterImportanceModifier', () => {
    test('should return correct modifiers for importance levels', () => {
      expect(service.getCharacterImportanceModifier('background')).toBe(0.8);
      expect(service.getCharacterImportanceModifier('minor')).toBe(0.9);
      expect(service.getCharacterImportanceModifier('important')).toBe(1.1);
      expect(service.getCharacterImportanceModifier('major')).toBe(1.3);
      expect(service.getCharacterImportanceModifier('hero')).toBe(1.5);
    });

    test('should be case insensitive', () => {
      expect(service.getCharacterImportanceModifier('HERO')).toBe(1.5);
      expect(service.getCharacterImportanceModifier('Hero')).toBe(1.5);
    });

    test('should return 1.0 for unknown importance levels', () => {
      expect(service.getCharacterImportanceModifier('unknown')).toBe(1.0);
    });
  });

  describe('getRelationshipModifier', () => {
    test('should return higher modifiers for stronger relationships', () => {
      expect(service.getRelationshipModifier(85)).toBe(1.4);
      expect(service.getRelationshipModifier(-85)).toBe(1.4); // Absolute value
      expect(service.getRelationshipModifier(65)).toBe(1.3);
      expect(service.getRelationshipModifier(45)).toBe(1.2);
      expect(service.getRelationshipModifier(25)).toBe(1.1);
      expect(service.getRelationshipModifier(15)).toBe(1.0);
    });

    test('should return 1.0 for invalid relationship values', () => {
      expect(service.getRelationshipModifier('invalid')).toBe(1.0);
      expect(service.getRelationshipModifier(null)).toBe(1.0);
      expect(service.getRelationshipModifier(undefined)).toBe(1.0);
    });
  });

  describe('getTimeBasedModifier', () => {
    test('should return lower modifiers for recent similar events', () => {
      expect(service.getTimeBasedModifier(3)).toBe(0.7);
      expect(service.getTimeBasedModifier(8)).toBe(0.8);
      expect(service.getTimeBasedModifier(15)).toBe(0.9);
      expect(service.getTimeBasedModifier(25)).toBe(1.0);
    });

    test('should return 1.0 for invalid time values', () => {
      expect(service.getTimeBasedModifier(-5)).toBe(1.0);
      expect(service.getTimeBasedModifier('invalid')).toBe(1.0);
      expect(service.getTimeBasedModifier(null)).toBe(1.0);
    });
  });

  describe('isEventSignificant', () => {
    test('should return true for events above threshold', () => {
      const significantEvent = {
        type: 'goal_completion',
        outcome: 'success',
        emotionalImpact: 0.5
      };

      expect(service.isEventSignificant(significantEvent)).toBe(true);
    });

    test('should return false for events below threshold', () => {
      const insignificantEvent = {
        type: 'trade_success',
        outcome: 'neutral',
        emotionalImpact: 0.2
      };

      expect(service.isEventSignificant(insignificantEvent)).toBe(false);
    });

    test('should consider context in significance determination', () => {
      const event = {
        type: 'trade_success',
        outcome: 'neutral',
        emotionalImpact: 0.2
      };

      // Without context, should be insignificant
      expect(service.isEventSignificant(event)).toBe(false);

      // With hero character context, should become significant
      const context = { characterImportance: 'hero', isFirstTime: true };
      expect(service.isEventSignificant(event, context)).toBe(true);
    });
  });

  describe('classifyEventSignificance', () => {
    test('should classify events into correct significance levels', () => {
      // Test with carefully crafted events to hit specific significance ranges
      const minimalEvent = { type: 'default', outcome: 'neutral', emotionalImpact: 'minimal' };
      // default (0.2) * neutral (1.0) * minimal (0.8) = 0.16 -> minimal
      
      const lowEvent = { type: 'trade_success', outcome: 'neutral', emotionalImpact: 'minimal' };
      // trade_success (0.3) * neutral (1.0) * minimal (0.8) = 0.24 -> low
      
      const moderateEvent = { type: 'social_success', outcome: 'success', emotionalImpact: 'moderate' };
      // social_success (0.4) * success (1.2) * moderate (1.0) = 0.48 -> moderate
      
      const highEvent = { type: 'conflict', outcome: 'neutral', emotionalImpact: 'moderate' };
      // conflict (0.7) * neutral (1.0) * moderate (1.0) = 0.7 -> high
      
      const actualExtremeEvent = { type: 'death', outcome: 'critical_failure', emotionalImpact: 'extreme' };
      // death (0.9) * critical_failure (1.6) * extreme (1.5) = 2.16 -> capped at 1.0 -> extreme

      expect(service.classifyEventSignificance(minimalEvent)).toBe('minimal');
      expect(service.classifyEventSignificance(lowEvent)).toBe('low');
      expect(service.classifyEventSignificance(moderateEvent)).toBe('moderate');
      expect(service.classifyEventSignificance(highEvent)).toBe('high');
      expect(service.classifyEventSignificance(actualExtremeEvent)).toBe('extreme');
    });
  });

  describe('threshold management', () => {
    test('should allow setting valid significance threshold', () => {
      service.setSignificanceThreshold(0.5);
      expect(service.getSignificanceThreshold()).toBe(0.5);
    });

    test('should throw error for invalid threshold values', () => {
      expect(() => service.setSignificanceThreshold(-0.1)).toThrow();
      expect(() => service.setSignificanceThreshold(1.1)).toThrow();
      expect(() => service.setSignificanceThreshold('invalid')).toThrow();
    });
  });

  describe('event type management', () => {
    test('should allow adding new event types', () => {
      service.setEventTypeSignificance('custom_event', 0.6);
      expect(service.getBaseSignificance('custom_event')).toBe(0.6);
    });

    test('should allow updating existing event types', () => {
      service.setEventTypeSignificance('social_success', 0.8);
      expect(service.getBaseSignificance('social_success')).toBe(0.8);
    });

    test('should throw error for invalid event type parameters', () => {
      expect(() => service.setEventTypeSignificance('', 0.5)).toThrow();
      expect(() => service.setEventTypeSignificance('valid_type', -0.1)).toThrow();
      expect(() => service.setEventTypeSignificance('valid_type', 1.1)).toThrow();
      expect(() => service.setEventTypeSignificance(null, 0.5)).toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle events with missing properties gracefully', () => {
      const incompleteEvent = { type: 'social_success' };
      
      expect(() => service.calculateEventSignificance(incompleteEvent)).not.toThrow();
      expect(service.calculateEventSignificance(incompleteEvent)).toBeGreaterThan(0);
    });

    test('should handle extreme contextual modifier combinations', () => {
      const event = {
        type: 'social_success',
        outcome: 'critical_success',
        emotionalImpact: 'extreme'
      };

      const extremeContext = {
        isFirstTime: true,
        characterImportance: 'hero',
        relationshipStrength: 95,
        repetitionCount: 1
      };

      const significance = service.calculateEventSignificance(event, extremeContext);
      expect(significance).toBeGreaterThanOrEqual(0.0);
      expect(significance).toBeLessThanOrEqual(1.0);
    });

    test('should handle zero and negative relationship strengths', () => {
      expect(service.getRelationshipModifier(0)).toBe(1.0);
      expect(service.getRelationshipModifier(-50)).toBe(1.2);
    });
  });
});