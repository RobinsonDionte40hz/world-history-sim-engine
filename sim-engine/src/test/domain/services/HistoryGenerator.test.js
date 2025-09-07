// src/test/domain/services/HistoryGenerator.test.js

import HistoryGenerator from '../../../domain/services/HistoryGenerator.js';

describe('HistoryGenerator - Need Satisfaction Events', () => {
  let historyGenerator;
  let mockSettlement;
  let mockPreviousSatisfaction;
  let mockCurrentSatisfaction;
  let mockConsequences;

  beforeEach(() => {
    historyGenerator = new HistoryGenerator();
    historyGenerator.clearEvents();

    mockSettlement = {
      id: 'settlement-1',
      name: 'Test Settlement',
      type: 'village',
      population: { total: 100 }
    };

    mockPreviousSatisfaction = {
      overall: 0.5,
      needs: {
        food: 0.3, // Significant change from 0.3 to 0.8
        water: 0.7,
        shelter: 0.5,
        goods: 0.4,
        services: 0.3
      }
    };

    mockCurrentSatisfaction = {
      overall: 0.7,
      needs: {
        food: 0.8, // Significant change
        water: 0.6,
        shelter: 0.7,
        goods: 0.6,
        services: 0.5
      }
    };

    mockConsequences = [
      { id: 'consequence-1', type: 'famine', severity: 'major' },
      { id: 'consequence-2', type: 'unrest', severity: 'moderate' }
    ];
  });

  describe('generateNeedSatisfactionEvents', () => {
    test('should generate events for need satisfaction changes', () => {
      const events = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        mockConsequences
      );

      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('id');
      expect(events[0]).toHaveProperty('timestamp');
      expect(events[0]).toHaveProperty('type');
      expect(events[0]).toHaveProperty('settlementId', mockSettlement.id);
    });

    test('should generate individual need events for significant changes', () => {
      const events = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        []
      );

      const needEvents = events.filter(event => event.type === 'need_satisfaction');
      expect(needEvents.length).toBeGreaterThan(0);

      needEvents.forEach(event => {
        expect(event.subtype).toMatch(/food|water|shelter|goods|services/);
        expect(event.severity).toMatch(/major|moderate|minor/);
        expect(event.change).toBeDefined();
        expect(event.currentLevel).toBeDefined();
      });
    });

    test('should generate overall satisfaction events for significant changes', () => {
      const events = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        { overall: 0.3, needs: mockPreviousSatisfaction.needs },
        { overall: 0.8, needs: mockCurrentSatisfaction.needs },
        []
      );

      const overallEvents = events.filter(event => event.type === 'settlement_prosperity');
      expect(overallEvents.length).toBeGreaterThan(0);

      overallEvents.forEach(event => {
        expect(event.subtype).toMatch(/prosperity|decline/);
        expect(event.severity).toMatch(/major|moderate|minor/);
      });
    });

    test('should generate consequence events', () => {
      const events = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        mockConsequences
      );

      const consequenceEvents = events.filter(event => event.type === 'need_consequence');
      expect(consequenceEvents.length).toBe(mockConsequences.length);

      consequenceEvents.forEach(event => {
        expect(event.subtype).toBeDefined();
        expect(event.severity).toBeDefined();
        expect(event.description).toContain(mockSettlement.name);
      });
    });

    test('should generate regional events for extreme conditions', () => {
      // Test crisis condition
      const crisisEvents = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        { overall: 0.2, needs: mockCurrentSatisfaction.needs },
        []
      );

      const regionalCrisisEvents = crisisEvents.filter(event => event.type === 'regional_crisis');
      expect(regionalCrisisEvents.length).toBeGreaterThan(0);

      // Test prosperity condition
      const prosperityEvents = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        { overall: 0.95, needs: mockCurrentSatisfaction.needs },
        []
      );

      const regionalProsperityEvents = prosperityEvents.filter(event => event.type === 'regional_prosperity');
      expect(regionalProsperityEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Event Filtering and Retrieval', () => {
    beforeEach(() => {
      historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        mockConsequences
      );
    });

    test('should filter events by type', () => {
      const needEvents = historyGenerator.getEvents({ type: 'need_satisfaction' });
      expect(needEvents.every(event => event.type === 'need_satisfaction')).toBe(true);
    });

    test('should filter events by settlement ID', () => {
      const settlementEvents = historyGenerator.getEvents({ settlementId: mockSettlement.id });
      expect(settlementEvents.every(event => event.settlementId === mockSettlement.id)).toBe(true);
    });

    test('should filter events by severity', () => {
      const majorEvents = historyGenerator.getEvents({ severity: 'major' });
      expect(majorEvents.every(event => event.severity === 'major')).toBe(true);
    });

    test('should filter events by minimum significance', () => {
      const significantEvents = historyGenerator.getEvents({ minSignificance: 0.5 });
      expect(significantEvents.every(event => event.significance >= 0.5)).toBe(true);
    });

    test('should get need satisfaction events for settlement', () => {
      const needEvents = historyGenerator.getNeedSatisfactionEvents(mockSettlement.id);
      expect(needEvents.every(event => event.type === 'need_satisfaction')).toBe(true);
      expect(needEvents.every(event => event.settlementId === mockSettlement.id)).toBe(true);
    });

    test('should get consequence events for settlement', () => {
      const consequenceEvents = historyGenerator.getConsequenceEvents(mockSettlement.id);
      expect(consequenceEvents.every(event => event.type === 'need_consequence')).toBe(true);
      expect(consequenceEvents.every(event => event.settlementId === mockSettlement.id)).toBe(true);
    });

    test('should get prosperity events for settlement', () => {
      const prosperityEvents = historyGenerator.getSettlementProsperityEvents(mockSettlement.id);
      expect(prosperityEvents.every(event => event.type === 'settlement_prosperity')).toBe(true);
      expect(prosperityEvents.every(event => event.settlementId === mockSettlement.id)).toBe(true);
    });
  });

  describe('Event Significance Calculation', () => {
    test('should calculate need event severity correctly', () => {
      // Test major severity
      expect(historyGenerator._calculateNeedEventSeverity(0.2, 0.1)).toBe('major');
      expect(historyGenerator._calculateNeedEventSeverity(0.5, 0.5)).toBe('major');

      // Test moderate severity
      expect(historyGenerator._calculateNeedEventSeverity(0.4, 0.1)).toBe('moderate');
      expect(historyGenerator._calculateNeedEventSeverity(0.6, 0.3)).toBe('moderate');

      // Test minor severity
      expect(historyGenerator._calculateNeedEventSeverity(0.6, 0.1)).toBe('minor');

      // Test trivial severity
      expect(historyGenerator._calculateNeedEventSeverity(0.8, 0.05)).toBe('trivial');
    });

    test('should calculate overall event severity correctly', () => {
      // Test major severity
      expect(historyGenerator._calculateOverallEventSeverity(0.1, 0.1)).toBe('major');
      expect(historyGenerator._calculateOverallEventSeverity(0.95, 0.1)).toBe('major');
      expect(historyGenerator._calculateOverallEventSeverity(0.5, 0.4)).toBe('major');

      // Test moderate severity
      expect(historyGenerator._calculateOverallEventSeverity(0.3, 0.1)).toBe('moderate');
      expect(historyGenerator._calculateOverallEventSeverity(0.85, 0.1)).toBe('moderate');

      // Test minor severity
      expect(historyGenerator._calculateOverallEventSeverity(0.5, 0.15)).toBe('minor');
    });

    test('should calculate need event significance scores', () => {
      expect(historyGenerator._calculateNeedEventSignificance('major', 0.3)).toBeGreaterThan(0.8);
      expect(historyGenerator._calculateNeedEventSignificance('moderate', 0.2)).toBeGreaterThan(0.5);
      expect(historyGenerator._calculateNeedEventSignificance('minor', 0.1)).toBeGreaterThan(0.2);
      expect(historyGenerator._calculateNeedEventSignificance('trivial', 0.05)).toBeLessThan(0.1);
    });

    test('should calculate consequence significance', () => {
      const famineConsequence = { type: 'famine', severity: 'critical' };
      const unrestConsequence = { type: 'unrest', severity: 'moderate' };

      expect(historyGenerator._calculateConsequenceSignificance(famineConsequence)).toBeGreaterThan(0.8);
      expect(historyGenerator._calculateConsequenceSignificance(unrestConsequence)).toBeGreaterThan(0.3);
    });
  });

  describe('Event Descriptions', () => {
    test('should generate appropriate need event descriptions', () => {
      const foodImprovement = historyGenerator._generateNeedEventDescription(
        mockSettlement, 'food', true, 'major', 0.8
      );
      expect(foodImprovement).toContain(mockSettlement.name);
      expect(foodImprovement).toMatch(/food|harvests|bountiful|satisfaction/);

      const waterDecline = historyGenerator._generateNeedEventDescription(
        mockSettlement, 'water', false, 'moderate', 0.4
      );
      expect(waterDecline).toContain(mockSettlement.name);
      expect(waterDecline).toMatch(/water|drought|satisfaction/);
    });

    test('should generate appropriate overall event descriptions', () => {
      const prosperityDesc = historyGenerator._generateOverallEventDescription(
        mockSettlement, true, 'major', 0.85
      );
      expect(prosperityDesc).toContain(mockSettlement.name);
      expect(prosperityDesc).toMatch(/prosperity|success|improvements|satisfaction/);

      const declineDesc = historyGenerator._generateOverallEventDescription(
        mockSettlement, false, 'moderate', 0.35
      );
      expect(declineDesc).toContain(mockSettlement.name);
      expect(declineDesc).toMatch(/challenges|difficulties|struggles|satisfaction/);
    });

    test('should generate appropriate consequence event descriptions', () => {
      const famineDesc = historyGenerator._generateConsequenceEventDescription(
        mockSettlement, { type: 'famine' }
      );
      expect(famineDesc).toContain(mockSettlement.name);
      expect(famineDesc).toContain('famine');

      const unrestDesc = historyGenerator._generateConsequenceEventDescription(
        mockSettlement, { type: 'unrest' }
      );
      expect(unrestDesc).toContain(mockSettlement.name);
      expect(unrestDesc).toContain('unrest');
    });
  });

  describe('Event Statistics', () => {
    beforeEach(() => {
      historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        mockConsequences
      );
    });

    test('should generate event statistics', () => {
      const stats = historyGenerator.getEventStatistics();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('bySeverity');
      expect(stats).toHaveProperty('bySettlement');
      expect(stats).toHaveProperty('averageSignificance');
      expect(stats).toHaveProperty('timeRange');

      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.averageSignificance).toBe('number');
    });

    test('should track events by type', () => {
      // Generate events with significant need changes
      historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        { overall: 0.5, needs: { food: 0.3, water: 0.7, shelter: 0.5, goods: 0.4, services: 0.3 } },
        { overall: 0.7, needs: { food: 0.8, water: 0.6, shelter: 0.7, goods: 0.6, services: 0.5 } },
        mockConsequences
      );

      const stats = historyGenerator.getEventStatistics();
      expect(stats.byType).toHaveProperty('need_satisfaction');
      expect(stats.byType).toHaveProperty('need_consequence');
    });

    test('should track events by settlement', () => {
      const stats = historyGenerator.getEventStatistics();
      expect(stats.bySettlement).toHaveProperty(mockSettlement.id);
      expect(stats.bySettlement[mockSettlement.id]).toBeGreaterThan(0);
    });
  });

  describe('Event Storage', () => {
    test('should save events to memory and localStorage', () => {
      const initialCount = historyGenerator.events.length;

      historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        []
      );

      expect(historyGenerator.events.length).toBeGreaterThan(initialCount);
    });

    test('should clear events from both memory and localStorage', () => {
      historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        mockPreviousSatisfaction,
        mockCurrentSatisfaction,
        []
      );

      expect(historyGenerator.events.length).toBeGreaterThan(0);

      historyGenerator.clearEvents();

      expect(historyGenerator.events.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle settlements without population data', () => {
      const settlementNoPop = { ...mockSettlement, population: null };

      expect(() => {
        historyGenerator.generateNeedSatisfactionEvents(
          settlementNoPop,
          mockPreviousSatisfaction,
          mockCurrentSatisfaction,
          []
        );
      }).not.toThrow();
    });

    test('should handle missing need satisfaction data', () => {
      const incompletePrevious = { overall: 0.5, needs: {} };
      const incompleteCurrent = { overall: 0.7, needs: {} };

      expect(() => {
        historyGenerator.generateNeedSatisfactionEvents(
          mockSettlement,
          incompletePrevious,
          incompleteCurrent,
          []
        );
      }).not.toThrow();
    });

    test('should skip events for insignificant changes', () => {
      const minimalChange = historyGenerator.generateNeedSatisfactionEvents(
        mockSettlement,
        { overall: 0.5, needs: mockPreviousSatisfaction.needs },
        { overall: 0.51, needs: mockPreviousSatisfaction.needs },
        []
      );

      // Should generate no events for insignificant changes
      expect(minimalChange.length).toBe(0);
    });    test('should handle empty consequences array', () => {
      expect(() => {
        historyGenerator.generateNeedSatisfactionEvents(
          mockSettlement,
          mockPreviousSatisfaction,
          mockCurrentSatisfaction,
          []
        );
      }).not.toThrow();
    });
  });
});
