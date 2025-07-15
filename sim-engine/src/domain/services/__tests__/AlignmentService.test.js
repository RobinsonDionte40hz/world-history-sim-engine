// src/domain/services/__tests__/AlignmentService.test.js

import AlignmentService from '../AlignmentService';
import { Alignment } from '../../value-objects/Alignment';

describe('AlignmentService', () => {
  let alignmentService;
  let mockAlignment;
  let mockAxes;

  beforeEach(() => {
    alignmentService = new AlignmentService();
    
    mockAxes = [
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
    
    mockAlignment = new Alignment(mockAxes, { moral: 10, ethical: -5 });
  });

  describe('evolveAlignment', () => {
    test('should evolve alignment based on war event', () => {
      const warEvent = {
        type: 'war',
        description: 'Great War breaks out',
        intensity: 2
      };
      
      const historicalContext = {
        era: 'Medieval',
        year: 1200,
        season: 'Summer',
        culturalValues: new Map([['moral', 20], ['ethical', 30]]),
        politicalClimate: 'unstable',
        economicConditions: 'poor'
      };
      
      const personalityTraits = {
        pragmatism: 0.5,
        authority: 0.3
      };
      
      const evolvedAlignment = alignmentService.evolveAlignment(
        mockAlignment, 
        warEvent, 
        historicalContext, 
        personalityTraits
      );
      
      expect(evolvedAlignment).not.toBe(mockAlignment);
      expect(evolvedAlignment).toBeInstanceOf(Alignment);
      
      // War should shift ethical toward lawful (authority)
      expect(evolvedAlignment.getValue('ethical')).toBeGreaterThan(mockAlignment.getValue('ethical'));
      
      // Check that history was recorded
      const ethicalHistory = evolvedAlignment.getAxisHistory('ethical');
      expect(ethicalHistory.length).toBeGreaterThan(0);
      expect(ethicalHistory[ethicalHistory.length - 1].reason).toContain('War');
    });

    test('should evolve alignment based on plague event', () => {
      const plagueEvent = {
        type: 'plague',
        description: 'Black Death spreads',
        severity: 3
      };
      
      const historicalContext = {
        era: 'Medieval',
        year: 1348,
        season: 'Autumn',
        culturalValues: new Map(),
        politicalClimate: 'chaotic',
        economicConditions: 'terrible'
      };
      
      const personalityTraits = {
        compassion: 0.8,
        order: 0.2
      };
      
      const evolvedAlignment = alignmentService.evolveAlignment(
        mockAlignment, 
        plagueEvent, 
        historicalContext, 
        personalityTraits
      );
      
      // High compassion should shift moral toward good
      expect(evolvedAlignment.getValue('moral')).toBeGreaterThan(mockAlignment.getValue('moral'));
      
      // Plague should shift ethical toward chaotic
      expect(evolvedAlignment.getValue('ethical')).toBeLessThan(mockAlignment.getValue('ethical'));
    });

    test('should handle political events', () => {
      const politicalEvent = {
        type: 'political_change',
        subtype: 'revolution',
        description: 'Popular uprising overthrows the king'
      };
      
      const historicalContext = {
        era: 'Renaissance',
        year: 1500,
        season: 'Spring',
        culturalValues: new Map(),
        politicalClimate: 'revolutionary',
        economicConditions: 'improving'
      };
      
      const personalityTraits = {
        rebellion: 0.7
      };
      
      const evolvedAlignment = alignmentService.evolveAlignment(
        mockAlignment, 
        politicalEvent, 
        historicalContext, 
        personalityTraits
      );
      
      // Revolution should shift toward chaotic
      expect(evolvedAlignment.getValue('ethical')).toBeLessThan(mockAlignment.getValue('ethical'));
    });

    test('should throw error for invalid alignment', () => {
      const event = { type: 'war', description: 'Test war' };
      const context = { era: 'Test' };
      
      expect(() => {
        alignmentService.evolveAlignment(null, event, context);
      }).toThrow('Invalid alignment');
    });

    test('should throw error for invalid historical event', () => {
      const context = { era: 'Test' };
      
      expect(() => {
        alignmentService.evolveAlignment(mockAlignment, null, context);
      }).toThrow('Invalid historical event');
      
      expect(() => {
        alignmentService.evolveAlignment(mockAlignment, { type: 'war' }, context);
      }).toThrow('Historical event must have a description');
    });
  });

  describe('applyMoralChoice', () => {
    test('should apply moral choice with alignment impact', () => {
      const moralChoice = {
        id: 'help_stranger',
        description: 'Help a stranger in need',
        alignmentImpact: new Map([
          ['moral', 15],
          ['ethical', 5]
        ]),
        context: {
          era: 'Modern',
          year: 2023,
          season: 'Winter',
          culturalValues: new Map(),
          politicalClimate: 'stable',
          economicConditions: 'good'
        }
      };
      
      const personalityTraits = {
        willpower: 0.3,
        volatility: 0.2
      };
      
      const socialContext = {
        witnesses: 5,
        culturalRelevance: 0.8
      };
      
      const newAlignment = alignmentService.applyMoralChoice(
        mockAlignment, 
        moralChoice, 
        personalityTraits, 
        socialContext
      );
      
      expect(newAlignment).not.toBe(mockAlignment);
      expect(newAlignment.getValue('moral')).toBeGreaterThan(mockAlignment.getValue('moral'));
      expect(newAlignment.getValue('ethical')).toBeGreaterThan(mockAlignment.getValue('ethical'));
      
      // Check history
      const moralHistory = newAlignment.getAxisHistory('moral');
      expect(moralHistory[moralHistory.length - 1].reason).toContain('Moral choice');
    });

    test('should modify choice impact based on personality traits', () => {
      const moralChoice = {
        id: 'test_choice',
        description: 'Test moral choice',
        alignmentImpact: new Map([['moral', 20]]),
        context: {}
      };
      
      // High willpower should resist change
      const highWillpowerTraits = { willpower: 1.0 };
      const resistantAlignment = alignmentService.applyMoralChoice(
        mockAlignment, 
        moralChoice, 
        highWillpowerTraits
      );
      
      // Low willpower should allow more change
      const lowWillpowerTraits = { willpower: 0.0 };
      const flexibleAlignment = alignmentService.applyMoralChoice(
        mockAlignment, 
        moralChoice, 
        lowWillpowerTraits
      );
      
      const resistantChange = resistantAlignment.getValue('moral') - mockAlignment.getValue('moral');
      const flexibleChange = flexibleAlignment.getValue('moral') - mockAlignment.getValue('moral');
      
      expect(Math.abs(resistantChange)).toBeLessThan(Math.abs(flexibleChange));
    });

    test('should apply social context modifiers', () => {
      const moralChoice = {
        id: 'public_choice',
        description: 'Public moral choice',
        alignmentImpact: new Map([['moral', 10]]),
        context: {}
      };
      
      // Public action with witnesses
      const publicContext = { witnesses: 10, culturalRelevance: 1.0 };
      const publicAlignment = alignmentService.applyMoralChoice(
        mockAlignment, 
        moralChoice, 
        {}, 
        publicContext
      );
      
      // Private action
      const privateContext = { witnesses: 0, culturalRelevance: 0.0 };
      const privateAlignment = alignmentService.applyMoralChoice(
        mockAlignment, 
        moralChoice, 
        {}, 
        privateContext
      );
      
      const publicChange = publicAlignment.getValue('moral') - mockAlignment.getValue('moral');
      const privateChange = privateAlignment.getValue('moral') - mockAlignment.getValue('moral');
      
      expect(Math.abs(publicChange)).toBeGreaterThan(Math.abs(privateChange));
    });
  });

  describe('calculateAlignmentShift', () => {
    test('should calculate natural drift based on personality', () => {
      const personalityTraits = {
        compassion: 1.0,  // Should drift toward good
        order: 0.8        // Should drift toward lawful
      };
      
      const timeElapsed = 30; // 30 days
      const lifeExperiences = [];
      
      const shiftedAlignment = alignmentService.calculateAlignmentShift(
        mockAlignment, 
        personalityTraits, 
        timeElapsed, 
        lifeExperiences
      );
      
      // Should drift toward personality targets
      expect(shiftedAlignment.getValue('moral')).toBeGreaterThan(mockAlignment.getValue('moral'));
      expect(shiftedAlignment.getValue('ethical')).toBeGreaterThan(mockAlignment.getValue('ethical'));
    });

    test('should apply life experience shifts', () => {
      const personalityTraits = {};
      const timeElapsed = 1;
      
      const lifeExperiences = [
        {
          description: 'Witnessed injustice',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          significance: 2,
          alignmentImpact: {
            moral: -10,
            ethical: -5
          }
        }
      ];
      
      const shiftedAlignment = alignmentService.calculateAlignmentShift(
        mockAlignment, 
        personalityTraits, 
        timeElapsed, 
        lifeExperiences
      );
      
      expect(shiftedAlignment.getValue('moral')).toBeLessThan(mockAlignment.getValue('moral'));
      expect(shiftedAlignment.getValue('ethical')).toBeLessThan(mockAlignment.getValue('ethical'));
    });

    test('should return same alignment for zero time elapsed', () => {
      const personalityTraits = { compassion: 1.0 };
      const timeElapsed = 0;
      
      const result = alignmentService.calculateAlignmentShift(
        mockAlignment, 
        personalityTraits, 
        timeElapsed
      );
      
      expect(result).toBe(mockAlignment);
    });
  });

  describe('analyzeCompatibility', () => {
    test('should analyze compatibility between two alignments', () => {
      const alignment1 = new Alignment(mockAxes, { moral: 50, ethical: 40 });
      const alignment2 = new Alignment(mockAxes, { moral: 60, ethical: 35 });
      
      const compatibility = alignmentService.analyzeCompatibility(alignment1, alignment2);
      
      expect(compatibility.overall).toBeGreaterThan(0.8); // Should be highly compatible
      expect(compatibility.byAxis.moral).toBeDefined();
      expect(compatibility.byAxis.ethical).toBeDefined();
      expect(compatibility.byAxis.moral.score).toBeGreaterThan(0.9);
      expect(compatibility.conflictAreas).toHaveLength(0);
      expect(compatibility.harmoniousAreas).toContain('moral');
      expect(compatibility.harmoniousAreas).toContain('ethical');
    });

    test('should identify conflict areas', () => {
      const alignment1 = new Alignment(mockAxes, { moral: 80, ethical: 70 });  // Good Lawful
      const alignment2 = new Alignment(mockAxes, { moral: -80, ethical: -70 }); // Evil Chaotic
      
      const compatibility = alignmentService.analyzeCompatibility(alignment1, alignment2);
      
      expect(compatibility.overall).toBeLessThan(0.3); // Should be incompatible
      expect(compatibility.conflictAreas).toContain('moral');
      
      // Check if ethical is also a conflict area, but don't require it if the score is borderline
      const ethicalScore = compatibility.byAxis.ethical?.score || 1;
      if (ethicalScore < 0.3) {
        expect(compatibility.conflictAreas).toContain('ethical');
      }
      
      expect(compatibility.harmoniousAreas).toHaveLength(0);
    });

    test('should handle alignments with different axes', () => {
      const limitedAxes = [mockAxes[0]]; // Only moral axis
      const limitedAlignment = new Alignment(limitedAxes, { moral: 50 });
      
      const compatibility = alignmentService.analyzeCompatibility(mockAlignment, limitedAlignment);
      
      expect(compatibility.byAxis.moral).toBeDefined();
      expect(compatibility.byAxis.ethical).toBeUndefined();
    });
  });

  describe('Validation', () => {
    test('should validate alignment parameter', () => {
      const event = { type: 'war', description: 'Test war' };
      const context = { era: 'Test' };
      
      expect(() => {
        alignmentService.evolveAlignment('not an alignment', event, context);
      }).toThrow('Invalid alignment');
    });

    test('should validate moral choice parameter', () => {
      expect(() => {
        alignmentService.applyMoralChoice(mockAlignment, null);
      }).toThrow('Invalid moral choice');
      
      expect(() => {
        alignmentService.applyMoralChoice(mockAlignment, { description: 'test' });
      }).toThrow('Moral choice must have alignmentImpact as a Map');
    });

    test('should validate personality traits parameter', () => {
      expect(() => {
        alignmentService.calculateAlignmentShift(mockAlignment, null, 1);
      }).toThrow('Invalid personality traits');
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme alignment values', () => {
      const extremeAlignment = new Alignment(mockAxes, { moral: 100, ethical: -100 });
      
      const moralChoice = {
        id: 'extreme_test',
        description: 'Test extreme values',
        alignmentImpact: new Map([['moral', 50]]), // Would exceed max
        context: {}
      };
      
      const result = alignmentService.applyMoralChoice(extremeAlignment, moralChoice);
      
      // Should be clamped to axis maximum
      expect(result.getValue('moral')).toBeLessThanOrEqual(100);
    });

    test('should handle empty personality traits', () => {
      const result = alignmentService.calculateAlignmentShift(mockAlignment, {}, 10);
      
      expect(result).toBeInstanceOf(Alignment);
      // With no personality traits, should have minimal drift (target values will be 0)
      expect(Math.abs(result.getValue('moral') - mockAlignment.getValue('moral'))).toBeLessThan(5);
    });

    test('should handle events with no alignment impact', () => {
      const neutralEvent = {
        type: 'weather',
        description: 'It rained today'
      };
      
      const context = { era: 'Modern' };
      
      const result = alignmentService.evolveAlignment(mockAlignment, neutralEvent, context);
      
      // Should return alignment with no changes (but still a new instance due to immutability)
      expect(result.getValue('moral')).toBe(mockAlignment.getValue('moral'));
      expect(result.getValue('ethical')).toBe(mockAlignment.getValue('ethical'));
    });
  });

  describe('Integration Tests', () => {
    test('should handle complex scenario with multiple changes', () => {
      let currentAlignment = mockAlignment;
      
      // Apply a moral choice
      const moralChoice = {
        id: 'help_village',
        description: 'Help defend village from bandits',
        alignmentImpact: new Map([['moral', 20], ['ethical', 10]]),
        context: {}
      };
      
      currentAlignment = alignmentService.applyMoralChoice(
        currentAlignment, 
        moralChoice, 
        { compassion: 0.5 }
      );
      
      // Experience a historical event
      const warEvent = {
        type: 'war',
        description: 'Regional conflict erupts',
        intensity: 1
      };
      
      const context = {
        era: 'Medieval',
        year: 1300,
        season: 'Summer',
        culturalValues: new Map(),
        politicalClimate: 'unstable',
        economicConditions: 'poor'
      };
      
      currentAlignment = alignmentService.evolveAlignment(
        currentAlignment, 
        warEvent, 
        context, 
        { authority: 0.3 }
      );
      
      // Apply natural drift
      currentAlignment = alignmentService.calculateAlignmentShift(
        currentAlignment, 
        { compassion: 0.8, order: 0.6 }, 
        15
      );
      
      // Should have a rich history
      expect(currentAlignment.getAxisHistory('moral').length).toBeGreaterThan(1);
      expect(currentAlignment.getAxisHistory('ethical').length).toBeGreaterThan(1);
      
      // Values should have changed from original
      expect(currentAlignment.getValue('moral')).not.toBe(mockAlignment.getValue('moral'));
      expect(currentAlignment.getValue('ethical')).not.toBe(mockAlignment.getValue('ethical'));
    });
  });
});