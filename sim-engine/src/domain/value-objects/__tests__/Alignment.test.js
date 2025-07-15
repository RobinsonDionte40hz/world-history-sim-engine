// src/domain/value-objects/__tests__/Alignment.test.js

import { Alignment } from '../Alignment';

describe('Alignment Value Object', () => {
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
    },
    {
      id: 'ethical',
      name: 'Ethical',
      description: 'Lawful vs Chaotic',
      min: -100,
      max: 100,
      defaultValue: 0,
      zones: [
        { name: 'Chaotic', min: -100, max: -34, description: 'Chaotic alignment' },
        { name: 'Neutral', min: -33, max: 33, description: 'Neutral alignment' },
        { name: 'Lawful', min: 34, max: 100, description: 'Lawful alignment' }
      ]
    }
  ];

  describe('Construction', () => {
    test('should create alignment with default values', () => {
      const alignment = new Alignment(mockAxes);
      
      expect(alignment.getValue('moral')).toBe(0);
      expect(alignment.getValue('ethical')).toBe(0);
      expect(alignment.axes).toHaveLength(2);
    });

    test('should create alignment with custom values', () => {
      const values = { moral: 50, ethical: -25 };
      const alignment = new Alignment(mockAxes, values);
      
      expect(alignment.getValue('moral')).toBe(50);
      expect(alignment.getValue('ethical')).toBe(-25);
    });

    test('should throw error for empty axes', () => {
      expect(() => new Alignment([])).toThrow('Alignment must have at least one axis');
    });

    test('should throw error for invalid axis', () => {
      const invalidAxes = [{ id: 'test' }]; // Missing required fields
      expect(() => new Alignment(invalidAxes)).toThrow();
    });
  });

  describe('Immutability', () => {
    test('should be immutable', () => {
      const alignment = new Alignment(mockAxes);
      
      expect(() => {
        alignment._values.moral = 100;
      }).toThrow();
      
      expect(() => {
        alignment.axes.push({});
      }).toThrow();
    });

    test('should create new instance with withChange', () => {
      const alignment = new Alignment(mockAxes);
      const newAlignment = alignment.withChange('moral', 50, 'Test change');
      
      expect(alignment.getValue('moral')).toBe(0);
      expect(newAlignment.getValue('moral')).toBe(50);
      expect(alignment).not.toBe(newAlignment);
    });
  });

  describe('Value Operations', () => {
    test('should get correct values', () => {
      const alignment = new Alignment(mockAxes, { moral: 75, ethical: -50 });
      
      expect(alignment.getValue('moral')).toBe(75);
      expect(alignment.getValue('ethical')).toBe(-50);
    });

    test('should throw error for unknown axis', () => {
      const alignment = new Alignment(mockAxes);
      
      expect(() => alignment.getValue('unknown')).toThrow("Alignment axis 'unknown' not found");
    });

    test('should clamp values to axis bounds', () => {
      const alignment = new Alignment(mockAxes);
      const newAlignment = alignment.withChange('moral', 200, 'Excessive change');
      
      expect(newAlignment.getValue('moral')).toBe(100); // Clamped to max
    });
  });

  describe('Zone Operations', () => {
    test('should get correct zone', () => {
      const alignment = new Alignment(mockAxes, { moral: 50, ethical: -50 });
      
      expect(alignment.getZone('moral').name).toBe('Good');
      expect(alignment.getZone('ethical').name).toBe('Chaotic');
    });

    test('should return null for value outside zones', () => {
      // This shouldn't happen with proper zone setup, but test defensive code
      const badAxes = [{
        id: 'test',
        name: 'Test',
        description: 'Test axis',
        min: -100,
        max: 100,
        defaultValue: 0,
        zones: [{ name: 'Only', min: 10, max: 20, description: 'Limited zone' }]
      }];
      
      const alignment = new Alignment(badAxes);
      expect(alignment.getZone('test')).toBe(null);
    });
  });

  describe('History Tracking', () => {
    test('should track changes in history', () => {
      const alignment = new Alignment(mockAxes);
      const newAlignment = alignment.withChange('moral', 25, 'Good deed');
      
      const history = newAlignment.getAxisHistory('moral');
      expect(history).toHaveLength(1);
      expect(history[0].change).toBe(25);
      expect(history[0].newValue).toBe(25);
      expect(history[0].reason).toBe('Good deed');
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    test('should get last change', () => {
      let alignment = new Alignment(mockAxes);
      alignment = alignment.withChange('moral', 10, 'First change');
      alignment = alignment.withChange('moral', 15, 'Second change');
      
      const lastChange = alignment.getLastChange('moral');
      expect(lastChange.reason).toBe('Second change');
      expect(lastChange.newValue).toBe(25);
    });

    test('should return null for axis with no changes', () => {
      const alignment = new Alignment(mockAxes);
      expect(alignment.getLastChange('moral')).toBe(null);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON', () => {
      const alignment = new Alignment(mockAxes, { moral: 50 });
      const json = alignment.toJSON();
      
      expect(json.axes).toEqual(mockAxes);
      expect(json.values.moral).toBe(50);
      expect(json.history).toBeDefined();
    });

    test('should deserialize from JSON', () => {
      const alignment = new Alignment(mockAxes, { moral: 50 });
      const json = alignment.toJSON();
      const restored = Alignment.fromJSON(json);
      
      expect(restored.getValue('moral')).toBe(50);
      expect(restored.axes).toHaveLength(2);
    });

    test('should handle round-trip serialization', () => {
      let alignment = new Alignment(mockAxes, { moral: 25, ethical: -10 });
      alignment = alignment.withChange('moral', 15, 'Test change');
      
      const json = alignment.toJSON();
      const restored = Alignment.fromJSON(json);
      
      expect(restored.equals(alignment)).toBe(true);
      expect(restored.getLastChange('moral').reason).toBe('Test change');
    });
  });

  describe('Utility Methods', () => {
    test('should get summary', () => {
      const alignment = new Alignment(mockAxes, { moral: 50, ethical: -40 });
      const summary = alignment.getSummary();
      
      expect(summary.moral.value).toBe(50);
      expect(summary.moral.zone.name).toBe('Good');
      expect(summary.ethical.value).toBe(-40);
      expect(summary.ethical.zone.name).toBe('Chaotic');
    });

    test('should check axis existence', () => {
      const alignment = new Alignment(mockAxes);
      
      expect(alignment.hasAxis('moral')).toBe(true);
      expect(alignment.hasAxis('unknown')).toBe(false);
    });

    test('should get axis definition', () => {
      const alignment = new Alignment(mockAxes);
      const axis = alignment.getAxis('moral');
      
      expect(axis.name).toBe('Moral');
      expect(axis.min).toBe(-100);
      expect(axis.max).toBe(100);
    });

    test('should convert toString', () => {
      const alignment = new Alignment(mockAxes, { moral: 50, ethical: -40 });
      const str = alignment.toString();
      
      expect(str).toContain('moral: 50 (Good)');
      expect(str).toContain('ethical: -40 (Chaotic)');
    });
  });

  describe('Compatibility', () => {
    test('should create from AlignmentManager format', () => {
      const managerData = {
        axes: mockAxes,
        playerAlignment: { moral: 30, ethical: -20 },
        history: {
          moral: [{ timestamp: new Date(), change: 30, newValue: 30, reason: 'Test' }],
          ethical: []
        }
      };
      
      const alignment = Alignment.fromAlignmentManager(managerData);
      
      expect(alignment.getValue('moral')).toBe(30);
      expect(alignment.getValue('ethical')).toBe(-20);
      expect(alignment.getLastChange('moral').reason).toBe('Test');
    });
  });
});