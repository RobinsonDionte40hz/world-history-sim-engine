// src/domain/value-objects/__tests__/Prestige.test.js

import { Prestige } from '../Prestige';

describe('Prestige Value Object', () => {
  const mockTracks = [
    {
      id: 'military',
      name: 'Military',
      description: 'Military prowess and reputation',
      min: 0,
      max: 100,
      defaultValue: 10,
      decayRate: 0.02,
      category: 'combat',
      categoryWeight: 1.2,
      levels: [
        { name: 'Unknown', min: 0, max: 19, politicalPower: 0, socialBenefits: [] },
        { name: 'Recognized', min: 20, max: 39, politicalPower: 5, socialBenefits: ['military_respect'] },
        { name: 'Renowned', min: 40, max: 69, politicalPower: 15, socialBenefits: ['military_respect', 'veteran_status'] },
        { name: 'Legendary', min: 70, max: 100, politicalPower: 30, socialBenefits: ['military_respect', 'veteran_status', 'hero_status'] }
      ]
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Social standing and reputation',
      min: 0,
      max: 100,
      defaultValue: 15,
      decayRate: 0.015,
      category: 'social',
      categoryWeight: 1.0,
      levels: [
        { name: 'Commoner', min: 0, max: 24, politicalPower: 0, socialBenefits: [] },
        { name: 'Respected', min: 25, max: 49, politicalPower: 3, socialBenefits: ['social_invitations'] },
        { name: 'Influential', min: 50, max: 74, politicalPower: 10, socialBenefits: ['social_invitations', 'opinion_leader'] },
        { name: 'Elite', min: 75, max: 100, politicalPower: 20, socialBenefits: ['social_invitations', 'opinion_leader', 'high_society'] }
      ]
    }
  ];

  describe('Construction', () => {
    test('should create prestige with default values', () => {
      const prestige = new Prestige(mockTracks);
      
      expect(prestige.getValue('military')).toBe(10);
      expect(prestige.getValue('social')).toBe(15);
      expect(prestige.tracks).toHaveLength(2);
    });

    test('should create prestige with custom values', () => {
      const values = { military: 50, social: 30 };
      const prestige = new Prestige(mockTracks, values);
      
      expect(prestige.getValue('military')).toBe(50);
      expect(prestige.getValue('social')).toBe(30);
    });

    test('should throw error for empty tracks', () => {
      expect(() => new Prestige([])).toThrow('Prestige must have at least one track');
    });

    test('should throw error for invalid track', () => {
      const invalidTracks = [{ id: 'test' }]; // Missing required fields
      expect(() => new Prestige(invalidTracks)).toThrow();
    });

    test('should validate track structure', () => {
      const invalidTrack = [{
        id: 'invalid',
        name: 'Invalid',
        description: 'Invalid track',
        min: 100, // min > max
        max: 0,
        defaultValue: 50,
        decayRate: 0.01,
        levels: []
      }];
      
      expect(() => new Prestige(invalidTrack)).toThrow('Track min value must be less than max value');
    });
  });

  describe('Immutability', () => {
    test('should be immutable', () => {
      const prestige = new Prestige(mockTracks);
      
      expect(() => {
        prestige._values.military = 100;
      }).toThrow();
      
      expect(() => {
        prestige.tracks.push({});
      }).toThrow();
    });

    test('should create new instance with withChange', () => {
      const prestige = new Prestige(mockTracks);
      const newPrestige = prestige.withChange('military', 25, 'Victory in battle');
      
      expect(prestige.getValue('military')).toBe(10);
      expect(newPrestige.getValue('military')).toBe(35);
      expect(prestige).not.toBe(newPrestige);
    });

    test('should create new instance with withDecay', () => {
      const prestige = new Prestige(mockTracks, { military: 50, social: 40 });
      const decayRates = new Map([['military', 5], ['social', 3]]);
      const decayedPrestige = prestige.withDecay(decayRates);
      
      expect(prestige.getValue('military')).toBe(50);
      expect(decayedPrestige.getValue('military')).toBe(45);
      expect(decayedPrestige.getValue('social')).toBe(37);
      expect(prestige).not.toBe(decayedPrestige);
    });
  });

  describe('Value Operations', () => {
    test('should get correct values', () => {
      const prestige = new Prestige(mockTracks, { military: 75, social: 45 });
      
      expect(prestige.getValue('military')).toBe(75);
      expect(prestige.getValue('social')).toBe(45);
    });

    test('should throw error for unknown track', () => {
      const prestige = new Prestige(mockTracks);
      
      expect(() => prestige.getValue('unknown')).toThrow("Prestige track 'unknown' not found");
    });

    test('should clamp values to track bounds', () => {
      const prestige = new Prestige(mockTracks);
      const newPrestige = prestige.withChange('military', 200, 'Excessive achievement');
      
      expect(newPrestige.getValue('military')).toBe(100); // Clamped to max
    });

    test('should handle negative changes', () => {
      const prestige = new Prestige(mockTracks, { military: 50 });
      const newPrestige = prestige.withChange('military', -60, 'Major defeat');
      
      expect(newPrestige.getValue('military')).toBe(0); // Clamped to min
    });
  });

  describe('Level Operations', () => {
    test('should get correct level', () => {
      const prestige = new Prestige(mockTracks, { military: 75, social: 30 });
      
      expect(prestige.getLevel('military').name).toBe('Legendary');
      expect(prestige.getLevel('social').name).toBe('Respected');
    });

    test('should return null for value outside levels', () => {
      // This shouldn't happen with proper level setup, but test defensive code
      const badTracks = [{
        id: 'test',
        name: 'Test',
        description: 'Test track',
        min: 0,
        max: 100,
        defaultValue: 50,
        decayRate: 0.01,
        levels: [{ name: 'Only', min: 10, max: 20, politicalPower: 0, socialBenefits: [] }]
      }];
      
      const prestige = new Prestige(badTracks);
      expect(prestige.getLevel('test')).toBe(null);
    });
  });

  describe('Decay Operations', () => {
    test('should apply decay to specified tracks', () => {
      const prestige = new Prestige(mockTracks, { military: 60, social: 50 });
      const decayRates = new Map([
        ['military', 10],
        ['social', 5]
      ]);
      
      const decayedPrestige = prestige.withDecay(decayRates);
      
      expect(decayedPrestige.getValue('military')).toBe(50);
      expect(decayedPrestige.getValue('social')).toBe(45);
    });

    test('should record decay in history', () => {
      const prestige = new Prestige(mockTracks, { military: 40 });
      const decayRates = new Map([['military', 5]]);
      
      const decayedPrestige = prestige.withDecay(decayRates);
      const history = decayedPrestige.getTrackHistory('military');
      
      expect(history).toHaveLength(1);
      expect(history[0].change).toBe(-5);
      expect(history[0].reason).toBe('Time decay');
      expect(history[0].newValue).toBe(35);
    });

    test('should not record decay if no actual change occurs', () => {
      const prestige = new Prestige(mockTracks, { military: 0 }); // Already at minimum
      const decayRates = new Map([['military', 5]]);
      
      const decayedPrestige = prestige.withDecay(decayRates);
      const history = decayedPrestige.getTrackHistory('military');
      
      expect(history).toHaveLength(0);
      expect(decayedPrestige.getValue('military')).toBe(0);
    });

    test('should skip unknown tracks in decay', () => {
      const prestige = new Prestige(mockTracks, { military: 50 });
      const decayRates = new Map([
        ['military', 5],
        ['unknown', 10] // Should be ignored
      ]);
      
      const decayedPrestige = prestige.withDecay(decayRates);
      
      expect(decayedPrestige.getValue('military')).toBe(45);
      // Should not throw error for unknown track
    });

    test('should validate decay rates', () => {
      const prestige = new Prestige(mockTracks);
      
      expect(() => {
        prestige.withDecay('not a map');
      }).toThrow('Decay rates must be provided as a Map');
      
      expect(() => {
        const invalidRates = new Map([['military', -5]]);
        prestige.withDecay(invalidRates);
      }).toThrow('Decay amount for track \'military\' must be a non-negative number');
    });
  });

  describe('History Tracking', () => {
    test('should track changes in history', () => {
      const prestige = new Prestige(mockTracks);
      const socialContext = {
        witnessCount: 50,
        settlementId: 'capital',
        witnessData: new Map([['nobles', 10]])
      };
      
      const newPrestige = prestige.withChange('military', 30, 'Great victory', socialContext);
      
      const history = newPrestige.getTrackHistory('military');
      expect(history).toHaveLength(1);
      expect(history[0].change).toBe(30);
      expect(history[0].newValue).toBe(40);
      expect(history[0].reason).toBe('Great victory');
      expect(history[0].socialContext.witnessCount).toBe(50);
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    test('should get last change', () => {
      let prestige = new Prestige(mockTracks);
      prestige = prestige.withChange('military', 15, 'First victory');
      prestige = prestige.withChange('military', 20, 'Second victory');
      
      const lastChange = prestige.getLastChange('military');
      expect(lastChange.reason).toBe('Second victory');
      expect(lastChange.newValue).toBe(45);
    });

    test('should return null for track with no changes', () => {
      const prestige = new Prestige(mockTracks);
      expect(prestige.getLastChange('military')).toBe(null);
    });

    test('should maintain separate histories for different tracks', () => {
      let prestige = new Prestige(mockTracks);
      prestige = prestige.withChange('military', 20, 'Military achievement');
      prestige = prestige.withChange('social', 15, 'Social achievement');
      
      const militaryHistory = prestige.getTrackHistory('military');
      const socialHistory = prestige.getTrackHistory('social');
      
      expect(militaryHistory).toHaveLength(1);
      expect(socialHistory).toHaveLength(1);
      expect(militaryHistory[0].reason).toBe('Military achievement');
      expect(socialHistory[0].reason).toBe('Social achievement');
    });
  });

  describe('Utility Methods', () => {
    test('should get summary', () => {
      const prestige = new Prestige(mockTracks, { military: 75, social: 30 });
      const summary = prestige.getSummary();
      
      expect(summary.military.value).toBe(75);
      expect(summary.military.level.name).toBe('Legendary');
      expect(summary.social.value).toBe(30);
      expect(summary.social.level.name).toBe('Respected');
    });

    test('should check track existence', () => {
      const prestige = new Prestige(mockTracks);
      
      expect(prestige.hasTrack('military')).toBe(true);
      expect(prestige.hasTrack('unknown')).toBe(false);
    });

    test('should get track definition', () => {
      const prestige = new Prestige(mockTracks);
      const track = prestige.getTrack('military');
      
      expect(track.name).toBe('Military');
      expect(track.min).toBe(0);
      expect(track.max).toBe(100);
      expect(track.decayRate).toBe(0.02);
    });

    test('should get track IDs', () => {
      const prestige = new Prestige(mockTracks);
      const trackIds = prestige.getTrackIds();
      
      expect(trackIds).toContain('military');
      expect(trackIds).toContain('social');
      expect(trackIds).toHaveLength(2);
    });

    test('should calculate total prestige with weights', () => {
      const prestige = new Prestige(mockTracks, { military: 50, social: 40 });
      const total = prestige.getTotalPrestige();
      
      // military: 50 * 1.2 = 60, social: 40 * 1.0 = 40, total = 100
      expect(total).toBe(100);
    });

    test('should convert toString', () => {
      const prestige = new Prestige(mockTracks, { military: 75, social: 30 });
      const str = prestige.toString();
      
      expect(str).toContain('military: 75 (Legendary)');
      expect(str).toContain('social: 30 (Respected)');
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON', () => {
      const prestige = new Prestige(mockTracks, { military: 50 });
      const json = prestige.toJSON();
      
      expect(json.tracks).toEqual(mockTracks);
      expect(json.values.military).toBe(50);
      expect(json.history).toBeDefined();
    });

    test('should deserialize from JSON', () => {
      const prestige = new Prestige(mockTracks, { military: 50 });
      const json = prestige.toJSON();
      const restored = Prestige.fromJSON(json);
      
      expect(restored.getValue('military')).toBe(50);
      expect(restored.tracks).toHaveLength(2);
    });

    test('should handle round-trip serialization', () => {
      let prestige = new Prestige(mockTracks, { military: 40, social: 35 });
      
      const socialContext = {
        witnessData: new Map([['nobles', 5], ['commoners', 20]]),
        socialConnections: new Map([['allies', 3], ['rivals', 1]])
      };
      
      prestige = prestige.withChange('military', 20, 'Test achievement', socialContext);
      
      const json = prestige.toJSON();
      const restored = Prestige.fromJSON(json);
      
      expect(restored.equals(prestige)).toBe(true);
      expect(restored.getLastChange('military').reason).toBe('Test achievement');
      
      // Check that Maps were properly serialized and deserialized
      const restoredContext = restored.getLastChange('military').socialContext;
      expect(restoredContext.witnessData).toBeInstanceOf(Map);
      expect(restoredContext.witnessData.get('nobles')).toBe(5);
      expect(restoredContext.socialConnections).toBeInstanceOf(Map);
      expect(restoredContext.socialConnections.get('allies')).toBe(3);
    });

    test('should handle serialization with decay history', () => {
      let prestige = new Prestige(mockTracks, { military: 60 });
      const decayRates = new Map([['military', 10]]);
      prestige = prestige.withDecay(decayRates);
      
      const json = prestige.toJSON();
      const restored = Prestige.fromJSON(json);
      
      expect(restored.getValue('military')).toBe(50);
      expect(restored.getLastChange('military').reason).toBe('Time decay');
    });

    test('should throw error for invalid JSON', () => {
      expect(() => Prestige.fromJSON(null)).toThrow('Invalid JSON data for Prestige');
      expect(() => Prestige.fromJSON('not an object')).toThrow('Invalid JSON data for Prestige');
    });
  });

  describe('Compatibility', () => {
    test('should create from PrestigeManager format', () => {
      const managerData = {
        tracks: mockTracks,
        playerPrestige: { military: 45, social: 25 },
        history: {
          military: [{ timestamp: new Date(), change: 35, newValue: 45, reason: 'Test victory' }],
          social: []
        }
      };
      
      const prestige = Prestige.fromPrestigeManager(managerData);
      
      expect(prestige.getValue('military')).toBe(45);
      expect(prestige.getValue('social')).toBe(25);
      expect(prestige.getLastChange('military').reason).toBe('Test victory');
    });

    test('should throw error for null manager', () => {
      expect(() => Prestige.fromPrestigeManager(null)).toThrow('PrestigeManager is required');
    });
  });

  describe('Equality and Comparison', () => {
    test('should compare equality correctly', () => {
      const prestige1 = new Prestige(mockTracks, { military: 50, social: 30 });
      const prestige2 = new Prestige(mockTracks, { military: 50, social: 30 });
      const prestige3 = new Prestige(mockTracks, { military: 60, social: 30 });
      
      expect(prestige1.equals(prestige2)).toBe(true);
      expect(prestige1.equals(prestige3)).toBe(false);
      expect(prestige1.equals('not a prestige')).toBe(false);
    });

    test('should handle equality with history differences', () => {
      const prestige1 = new Prestige(mockTracks, { military: 50 });
      let prestige2 = new Prestige(mockTracks, { military: 30 });
      prestige2 = prestige2.withChange('military', 20, 'Achievement');
      
      // Same final values but different histories
      expect(prestige1.equals(prestige2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme values', () => {
      const prestige = new Prestige(mockTracks, { military: 100, social: 0 });
      
      // Try to exceed maximum
      const maxPrestige = prestige.withChange('military', 50, 'Extreme achievement');
      expect(maxPrestige.getValue('military')).toBe(100);
      
      // Try to go below minimum
      const minPrestige = prestige.withChange('social', -50, 'Major scandal');
      expect(minPrestige.getValue('social')).toBe(0);
    });

    test('should handle zero decay amounts', () => {
      const prestige = new Prestige(mockTracks, { military: 50 });
      const decayRates = new Map([['military', 0]]);
      
      const result = prestige.withDecay(decayRates);
      
      expect(result.getValue('military')).toBe(50);
      expect(result.getTrackHistory('military')).toHaveLength(0);
    });

    test('should handle empty social context', () => {
      const prestige = new Prestige(mockTracks);
      const newPrestige = prestige.withChange('military', 20, 'Achievement', null);
      
      const history = newPrestige.getTrackHistory('military');
      expect(history[0].socialContext).toBe(null);
    });

    test('should handle tracks with no category weight', () => {
      const tracksWithoutWeight = [{
        id: 'test',
        name: 'Test',
        description: 'Test track',
        min: 0,
        max: 100,
        defaultValue: 10,
        decayRate: 0.01,
        levels: [
          { name: 'Basic', min: 0, max: 100, politicalPower: 0, socialBenefits: [] }
        ]
      }];
      
      const prestige = new Prestige(tracksWithoutWeight, { test: 50 });
      const total = prestige.getTotalPrestige();
      
      expect(total).toBe(50); // Should use default weight of 1.0
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle multiple changes and decay over time', () => {
      let prestige = new Prestige(mockTracks);
      
      // Initial achievement
      prestige = prestige.withChange('military', 30, 'First victory');
      expect(prestige.getValue('military')).toBe(40);
      
      // Another achievement
      prestige = prestige.withChange('military', 25, 'Second victory');
      expect(prestige.getValue('military')).toBe(65);
      
      // Apply decay
      const decayRates = new Map([['military', 15]]);
      prestige = prestige.withDecay(decayRates);
      expect(prestige.getValue('military')).toBe(50);
      
      // Social achievement
      prestige = prestige.withChange('social', 20, 'Social event');
      expect(prestige.getValue('social')).toBe(35);
      
      // Check complete history
      const militaryHistory = prestige.getTrackHistory('military');
      const socialHistory = prestige.getTrackHistory('social');
      
      expect(militaryHistory).toHaveLength(3); // Two achievements + one decay
      expect(socialHistory).toHaveLength(1); // One achievement
      
      expect(militaryHistory[0].reason).toBe('First victory');
      expect(militaryHistory[1].reason).toBe('Second victory');
      expect(militaryHistory[2].reason).toBe('Time decay');
      expect(socialHistory[0].reason).toBe('Social event');
    });

    test('should maintain consistency across operations', () => {
      const prestige = new Prestige(mockTracks, { military: 45, social: 55 });
      
      // Check levels
      expect(prestige.getLevel('military').name).toBe('Renowned');
      expect(prestige.getLevel('social').name).toBe('Influential');
      
      // Check summary consistency
      const summary = prestige.getSummary();
      expect(summary.military.value).toBe(prestige.getValue('military'));
      expect(summary.military.level).toBe(prestige.getLevel('military'));
      
      // Check total prestige calculation
      const expectedTotal = 45 * 1.2 + 55 * 1.0; // 54 + 55 = 109
      expect(prestige.getTotalPrestige()).toBe(expectedTotal);
    });
  });
});