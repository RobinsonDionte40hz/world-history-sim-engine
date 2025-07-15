// src/domain/value-objects/__tests__/AlignmentImmutability.test.js

import { Alignment } from '../Alignment';

describe('Alignment Immutability Tests', () => {
  const mockAxes = [
    {
      id: 'moral',
      name: 'Moral',
      description: 'Good vs Evil',
      min: -100,
      max: 100,
      defaultValue: 0,
      zones: [
        { name: 'Evil', min: -100, max: -34, description: 'Evil alignment' },
        { name: 'Neutral', min: -33, max: 33, description: 'Neutral alignment' },
        { name: 'Good', min: 34, max: 100, description: 'Good alignment' }
      ]
    }
  ];

  describe('Deep Immutability', () => {
    test('should prevent modification of axes array', () => {
      const alignment = new Alignment(mockAxes);
      
      expect(() => {
        alignment.axes.push({ id: 'new', name: 'New' });
      }).toThrow();
      
      expect(() => {
        alignment._axes.set('new', { id: 'new' });
      }).toThrow();
    });

    test('should prevent modification of values object', () => {
      const alignment = new Alignment(mockAxes, { moral: 50 });
      
      expect(() => {
        alignment.values.moral = 100;
      }).toThrow();
      
      expect(() => {
        alignment._values.moral = 100;
      }).toThrow();
    });

    test('should prevent modification of history arrays', () => {
      let alignment = new Alignment(mockAxes);
      alignment = alignment.withChange('moral', 10, 'Test change');
      
      expect(() => {
        alignment.getAxisHistory('moral').push({ test: 'data' });
      }).toThrow();
      
      expect(() => {
        alignment._history.moral.push({ test: 'data' });
      }).toThrow();
    });

    test('should prevent modification of individual history entries', () => {
      let alignment = new Alignment(mockAxes);
      alignment = alignment.withChange('moral', 10, 'Test change');
      
      const historyEntry = alignment.getAxisHistory('moral')[0];
      
      expect(() => {
        historyEntry.reason = 'Modified reason';
      }).toThrow();
      
      expect(() => {
        historyEntry.newValue = 999;
      }).toThrow();
    });

    test('should prevent modification of core structure', () => {
      const alignment = new Alignment(mockAxes);
      
      expect(() => {
        alignment.axes.push({ id: 'new', name: 'New' });
      }).toThrow();
      
      expect(() => {
        alignment._axes.set('new', { id: 'new' });
      }).toThrow();
    });

    test('should maintain structural integrity', () => {
      const alignment = new Alignment(mockAxes);
      const axis = alignment.getAxis('moral');
      
      // The axis should exist and be properly structured
      expect(axis).toBeDefined();
      expect(axis.zones).toBeDefined();
      expect(Array.isArray(axis.zones)).toBe(true);
      
      // Core arrays should be frozen
      expect(() => {
        alignment.axes.push({ id: 'new', name: 'New' });
      }).toThrow();
    });
  });

  describe('Immutable Operations', () => {
    test('withChange should return new instance', () => {
      const alignment = new Alignment(mockAxes);
      const newAlignment = alignment.withChange('moral', 25, 'Test');
      
      expect(newAlignment).not.toBe(alignment);
      expect(newAlignment).toBeInstanceOf(Alignment);
      expect(alignment.getValue('moral')).toBe(0);
      expect(newAlignment.getValue('moral')).toBe(25);
    });

    test('multiple withChange calls should create separate instances', () => {
      const alignment = new Alignment(mockAxes);
      const alignment1 = alignment.withChange('moral', 10, 'First');
      const alignment2 = alignment.withChange('moral', 20, 'Second');
      const alignment3 = alignment1.withChange('moral', 15, 'Third');
      
      expect(alignment.getValue('moral')).toBe(0);
      expect(alignment1.getValue('moral')).toBe(10);
      expect(alignment2.getValue('moral')).toBe(20);
      expect(alignment3.getValue('moral')).toBe(25); // 10 + 15
      
      expect(alignment1.getAxisHistory('moral')).toHaveLength(1);
      expect(alignment2.getAxisHistory('moral')).toHaveLength(1);
      expect(alignment3.getAxisHistory('moral')).toHaveLength(2);
    });

    test('should maintain separate history chains', () => {
      let alignment = new Alignment(mockAxes);
      
      // Create two separate evolution paths
      let pathA = alignment.withChange('moral', 10, 'Path A - Step 1');
      let pathB = alignment.withChange('moral', -10, 'Path B - Step 1');
      
      pathA = pathA.withChange('moral', 5, 'Path A - Step 2');
      pathB = pathB.withChange('moral', -5, 'Path B - Step 2');
      
      expect(pathA.getValue('moral')).toBe(15);
      expect(pathB.getValue('moral')).toBe(-15);
      
      const historyA = pathA.getAxisHistory('moral');
      const historyB = pathB.getAxisHistory('moral');
      
      expect(historyA).toHaveLength(2);
      expect(historyB).toHaveLength(2);
      expect(historyA[0].reason).toBe('Path A - Step 1');
      expect(historyB[0].reason).toBe('Path B - Step 1');
    });
  });

  describe('Reference Integrity', () => {
    test('should not share references between instances', () => {
      const alignment1 = new Alignment(mockAxes, { moral: 10 });
      const alignment2 = new Alignment(mockAxes, { moral: 20 });
      
      expect(alignment1.values).not.toBe(alignment2.values);
      expect(alignment1.history).not.toBe(alignment2.history);
      expect(alignment1.axes).not.toBe(alignment2.axes);
    });

    test('should not share references after withChange', () => {
      const original = new Alignment(mockAxes);
      const modified = original.withChange('moral', 10, 'Test');
      
      expect(original.values).not.toBe(modified.values);
      expect(original.history).not.toBe(modified.history);
      
      // Axes should be the same reference since they don't change
      expect(original.axes).toEqual(modified.axes);
    });

    test('should handle historical context immutability', () => {
      const historicalContext = {
        era: 'Medieval',
        year: 1200,
        season: 'Summer',
        culturalValues: new Map([['test', 1]]),
        politicalClimate: 'stable',
        economicConditions: 'good'
      };
      
      const alignment = new Alignment(mockAxes);
      const newAlignment = alignment.withChange('moral', 10, 'Test', historicalContext);
      
      const storedContext = newAlignment.getLastChange('moral').historicalContext;
      
      // Should be a deep copy, not the same reference
      expect(storedContext).not.toBe(historicalContext);
      expect(storedContext.culturalValues).not.toBe(historicalContext.culturalValues);
      
      // But values should be equal
      expect(storedContext.era).toBe(historicalContext.era);
      expect(storedContext.culturalValues.get('test')).toBe(1);
      
      // Context should be frozen
      expect(() => {
        storedContext.era = 'Modified';
      }).toThrow();
    });
  });

  describe('Serialization Immutability', () => {
    test('toJSON should create independent data', () => {
      let alignment = new Alignment(mockAxes, { moral: 25 });
      alignment = alignment.withChange('moral', 10, 'Test change');
      
      const json = alignment.toJSON();
      
      // JSON should be a separate object
      expect(json).not.toBe(alignment._values);
      expect(json.values).not.toBe(alignment._values);
      expect(json.history).not.toBe(alignment._history);
      
      // Original alignment should be unchanged
      expect(alignment.getValue('moral')).toBe(35);
      expect(alignment.getAxisHistory('moral')).toHaveLength(1);
    });

    test('fromJSON should create independent instance', () => {
      let alignment = new Alignment(mockAxes, { moral: 25 });
      alignment = alignment.withChange('moral', 10, 'Test change');
      
      const json = alignment.toJSON();
      const restored = Alignment.fromJSON(json);
      
      expect(restored).not.toBe(alignment);
      expect(restored.equals(alignment)).toBe(true);
      
      // Modifying one should not affect the other
      const modified = restored.withChange('moral', 5, 'New change');
      expect(alignment.getValue('moral')).toBe(35);
      expect(modified.getValue('moral')).toBe(40);
    });

    test('serialization round-trip should maintain data integrity', () => {
      let alignment = new Alignment(mockAxes, { moral: 25 });
      alignment = alignment.withChange('moral', 10, 'First change');
      alignment = alignment.withChange('moral', -5, 'Second change');
      
      const json = alignment.toJSON();
      const restored = Alignment.fromJSON(json);
      const reserializedJson = restored.toJSON();
      
      expect(JSON.stringify(json)).toBe(JSON.stringify(reserializedJson));
      
      // Both should be immutable at the top level
      expect(() => {
        restored.values.moral = 999;
      }).toThrow();
      
      expect(() => {
        restored.getAxisHistory('moral').push({ fake: 'data' });
      }).toThrow();
    });
  });

  describe('Concurrent Modifications', () => {
    test('should handle concurrent withChange operations', () => {
      const alignment = new Alignment(mockAxes);
      
      // Simulate concurrent modifications
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(alignment.withChange('moral', i, `Change ${i}`));
      }
      
      // Each should be independent
      for (let i = 0; i < 10; i++) {
        expect(results[i].getValue('moral')).toBe(i);
        expect(results[i].getAxisHistory('moral')).toHaveLength(1);
        expect(results[i].getLastChange('moral').reason).toBe(`Change ${i}`);
      }
      
      // Original should be unchanged
      expect(alignment.getValue('moral')).toBe(0);
      expect(alignment.getAxisHistory('moral')).toHaveLength(0);
    });

    test('should handle chained modifications correctly', () => {
      let alignment = new Alignment(mockAxes);
      
      // Chain multiple modifications
      const changes = [
        { amount: 10, reason: 'First' },
        { amount: -5, reason: 'Second' },
        { amount: 15, reason: 'Third' },
        { amount: -8, reason: 'Fourth' }
      ];
      
      let expectedValue = 0;
      for (const change of changes) {
        alignment = alignment.withChange('moral', change.amount, change.reason);
        expectedValue += change.amount;
        expect(alignment.getValue('moral')).toBe(expectedValue);
      }
      
      // History should contain all changes
      const history = alignment.getAxisHistory('moral');
      expect(history).toHaveLength(changes.length);
      
      for (let i = 0; i < changes.length; i++) {
        expect(history[i].reason).toBe(changes[i].reason);
        expect(history[i].change).toBe(changes[i].amount);
      }
    });
  });
});