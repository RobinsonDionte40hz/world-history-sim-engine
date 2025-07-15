// src/domain/services/__tests__/InfluenceService.test.js

import InfluenceService from '../InfluenceService';
import { Influence } from '../../value-objects/Influence';

describe('InfluenceService', () => {
  let influenceService;
  let mockDomains;
  let mockInfluence;
  let mockSettlement;
  let mockCharacter;

  beforeEach(() => {
    influenceService = new InfluenceService();
    
    mockDomains = [
      {
        id: 'political',
        name: 'Political',
        description: 'Political influence',
        min: 0,
        max: 100,
        defaultValue: 10,
        tiers: [
          { name: 'None', min: 0, max: 9, description: 'No influence' },
          { name: 'Low', min: 10, max: 29, description: 'Low influence' },
          { name: 'Medium', min: 30, max: 59, description: 'Medium influence' },
          { name: 'High', min: 60, max: 89, description: 'High influence' },
          { name: 'Very High', min: 90, max: 100, description: 'Very high influence' }
        ]
      },
      {
        id: 'economic',
        name: 'Economic',
        description: 'Economic influence',
        min: 0,
        max: 100,
        defaultValue: 5,
        tiers: [
          { name: 'Poor', min: 0, max: 19, description: 'Poor' },
          { name: 'Modest', min: 20, max: 49, description: 'Modest' },
          { name: 'Wealthy', min: 50, max: 79, description: 'Wealthy' },
          { name: 'Very Wealthy', min: 80, max: 100, description: 'Very wealthy' }
        ]
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Social influence',
        min: 0,
        max: 100,
        defaultValue: 15,
        tiers: [
          { name: 'Unknown', min: 0, max: 14, description: 'Unknown' },
          { name: 'Known', min: 15, max: 39, description: 'Known' },
          { name: 'Respected', min: 40, max: 69, description: 'Respected' },
          { name: 'Renowned', min: 70, max: 100, description: 'Renowned' }
        ]
      },
      {
        id: 'military',
        name: 'Military',
        description: 'Military influence',
        min: 0,
        max: 100,
        defaultValue: 0,
        tiers: [
          { name: 'Civilian', min: 0, max: 9, description: 'No military influence' },
          { name: 'Recruit', min: 10, max: 29, description: 'Basic military influence' },
          { name: 'Officer', min: 30, max: 59, description: 'Officer level influence' },
          { name: 'Commander', min: 60, max: 89, description: 'Command level influence' },
          { name: 'General', min: 90, max: 100, description: 'General level influence' }
        ]
      }
    ];

    mockInfluence = new Influence(mockDomains, { political: 30, economic: 20, social: 25, military: 15 });

    mockSettlement = {
      id: 'settlement1',
      name: 'Test City',
      type: 'city',
      population: 5000,
      prosperity: 60,
      stability: 70,
      hasGovernment: true,
      hasMarket: true,
      dominantCulture: 'human'
    };

    mockCharacter = {
      id: 'char1',
      name: 'Test Character',
      role: 'citizen',
      wealth: 50,
      charisma: 3,
      culture: 'human',
      militaryRank: 0
    };
  });

  describe('updateInfluence', () => {
    test('should update political influence for political events', () => {
      const event = {
        type: 'political_event',
        subtype: 'election',
        description: 'Local election held',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);

      expect(result.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(result.getLastChange('political').reason).toContain('Political event');
    });

    test('should update economic influence for economic events', () => {
      const event = {
        type: 'economic_event',
        subtype: 'trade_boom',
        description: 'Trade routes flourishing',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);

      expect(result.getValue('economic')).toBeGreaterThan(mockInfluence.getValue('economic'));
      expect(result.getLastChange('economic').reason).toContain('Economic event');
    });

    test('should update social influence for social events', () => {
      const event = {
        type: 'social_event',
        subtype: 'festival',
        description: 'Annual harvest festival',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);

      expect(result.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
      expect(result.getLastChange('social').reason).toContain('Social event');
    });

    test('should update military influence for military events', () => {
      const event = {
        type: 'military_event',
        subtype: 'battle_victory',
        description: 'Victory in local skirmish',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);

      expect(result.getValue('military')).toBeGreaterThan(mockInfluence.getValue('military'));
      expect(result.getLastChange('military').reason).toContain('Military event');
    });

    test('should include settlement context in changes', () => {
      const event = {
        type: 'political_event',
        subtype: 'election',
        description: 'Local election',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);
      const lastChange = result.getLastChange('political');

      expect(lastChange.settlementContext.settlementId).toBe('settlement1');
      expect(lastChange.settlementContext.settlementName).toBe('Test City');
      expect(lastChange.settlementContext.settlementData.get('population')).toBe(5000);
    });

    test('should handle character roles in political events', () => {
      const leaderCharacter = { ...mockCharacter, role: 'leader' };
      const event = {
        type: 'political_event',
        subtype: 'election',
        description: 'Local election',
        intensity: 1
      };

      const citizenResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);
      const leaderResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, leaderCharacter);

      expect(leaderResult.getValue('political')).toBeGreaterThan(citizenResult.getValue('political'));
    });

    test('should handle character wealth in economic events', () => {
      const wealthyCharacter = { ...mockCharacter, wealth: 200 };
      const event = {
        type: 'economic_event',
        subtype: 'market_crash',
        description: 'Market crash',
        intensity: 1
      };

      const poorResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);
      const wealthyResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, wealthyCharacter);

      // Wealthy characters lose more in market crashes
      expect(wealthyResult.getValue('economic')).toBeLessThan(poorResult.getValue('economic'));
    });

    test('should handle character charisma in social events', () => {
      const charismaticCharacter = { ...mockCharacter, charisma: 8 };
      const event = {
        type: 'social_event',
        subtype: 'public_speech',
        description: 'Public speech',
        intensity: 1
      };

      const normalResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);
      const charismaticResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, charismaticCharacter);

      expect(charismaticResult.getValue('social')).toBeGreaterThan(normalResult.getValue('social'));
    });

    test('should handle military rank in military events', () => {
      const officerCharacter = { ...mockCharacter, militaryRank: 5 };
      const event = {
        type: 'military_event',
        subtype: 'battle_victory',
        description: 'Battle victory',
        intensity: 1
      };

      const civilianResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);
      const officerResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, officerCharacter);

      expect(officerResult.getValue('military')).toBeGreaterThan(civilianResult.getValue('military'));
    });

    test('should handle cultural alignment in cultural events', () => {
      const alienCharacter = { ...mockCharacter, culture: 'elf' };
      const event = {
        type: 'cultural_event',
        subtype: 'cultural_festival',
        description: 'Human cultural festival',
        intensity: 1
      };

      const humanResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);
      const elfResult = influenceService.updateInfluence(mockInfluence, mockSettlement, event, alienCharacter);

      // Human character should gain more from human cultural events
      expect(humanResult.getValue('social')).toBeGreaterThan(elfResult.getValue('social'));
    });
  });

  describe('calculateInfluenceDecay', () => {
    test('should apply decay over time', () => {
      const timeElapsed = 30; // 30 days
      const result = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter);

      // All influence values should be lower due to decay
      expect(result.getValue('political')).toBeLessThan(mockInfluence.getValue('political'));
      expect(result.getValue('economic')).toBeLessThan(mockInfluence.getValue('economic'));
      expect(result.getValue('social')).toBeLessThan(mockInfluence.getValue('social'));
    });

    test('should not apply decay for zero time elapsed', () => {
      const result = influenceService.calculateInfluenceDecay(mockInfluence, 0, mockCharacter);

      expect(result.equals(mockInfluence)).toBe(true);
    });

    test('should reduce decay for active settlements', () => {
      const activeSettlements = [
        { ...mockSettlement, type: 'capital', hasGovernment: true },
        { type: 'trade_hub', hasMarket: true }
      ];

      const timeElapsed = 30;
      const withoutActiveResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, []);
      const withActiveResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, activeSettlements);

      // Active settlements should reduce decay (values should be higher or equal)
      expect(withActiveResult.getValue('political')).toBeGreaterThanOrEqual(withoutActiveResult.getValue('political'));
      expect(withActiveResult.getValue('economic')).toBeGreaterThanOrEqual(withoutActiveResult.getValue('economic'));
    });

    test('should apply higher decay for high influence tiers', () => {
      const highInfluence = new Influence(mockDomains, { political: 85, economic: 20, social: 25, military: 15 });
      const timeElapsed = 30;

      const normalResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter);
      const highResult = influenceService.calculateInfluenceDecay(highInfluence, timeElapsed, mockCharacter);

      // High influence should decay more (proportionally)
      const normalDecay = mockInfluence.getValue('political') - normalResult.getValue('political');
      const highDecay = highInfluence.getValue('political') - highResult.getValue('political');

      expect(highDecay).toBeGreaterThanOrEqual(normalDecay);
    });

    test('should include decay reason in history', () => {
      const timeElapsed = 15;
      const result = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter);

      const lastChange = result.getLastChange('political');
      expect(lastChange.reason).toContain('Natural influence decay over 15 days');
      expect(lastChange.change).toBeLessThan(0); // Should be negative
    });
  });

  describe('applySettlementEvents', () => {
    test('should process multiple events in chronological order', () => {
      const events = [
        {
          timestamp: new Date('2023-01-01'),
          settlement: mockSettlement,
          event: {
            type: 'political_event',
            subtype: 'election',
            description: 'First election',
            intensity: 1
          }
        },
        {
          timestamp: new Date('2023-01-02'),
          settlement: mockSettlement,
          event: {
            type: 'economic_event',
            subtype: 'trade_boom',
            description: 'Trade boom',
            intensity: 1
          }
        }
      ];

      const result = influenceService.applySettlementEvents(mockInfluence, events, mockCharacter);

      expect(result.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(result.getValue('economic')).toBeGreaterThan(mockInfluence.getValue('economic'));
      expect(result.getDomainHistory('political')).toHaveLength(1);
      expect(result.getDomainHistory('economic')).toHaveLength(1);
    });

    test('should handle empty events array', () => {
      const result = influenceService.applySettlementEvents(mockInfluence, [], mockCharacter);

      expect(result.equals(mockInfluence)).toBe(true);
    });

    test('should handle events with missing data gracefully', () => {
      const events = [
        { timestamp: new Date(), settlement: null, event: null },
        {
          timestamp: new Date(),
          settlement: mockSettlement,
          event: {
            type: 'political_event',
            subtype: 'election',
            description: 'Valid event',
            intensity: 1
          }
        }
      ];

      const result = influenceService.applySettlementEvents(mockInfluence, events, mockCharacter);

      // Should only process the valid event
      expect(result.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(result.getDomainHistory('political')).toHaveLength(1);
    });
  });

  describe('applyCharacterAction', () => {
    test('should apply successful action effects', () => {
      const action = {
        type: 'political_negotiation',
        description: 'Negotiated trade agreement',
        success: true,
        intensity: 1
      };

      const result = influenceService.applyCharacterAction(mockInfluence, action, mockSettlement, mockCharacter);

      expect(result.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(result.getLastChange('political').reason).toContain('Successful political_negotiation');
    });

    test('should apply failed action effects', () => {
      const action = {
        type: 'political_negotiation',
        description: 'Failed negotiation',
        success: false,
        intensity: 1
      };

      const result = influenceService.applyCharacterAction(mockInfluence, action, mockSettlement, mockCharacter);

      expect(result.getValue('political')).toBeLessThan(mockInfluence.getValue('political'));
      expect(result.getLastChange('political').reason).toContain('Failed political_negotiation');
    });

    test('should handle different action types', () => {
      const tradeAction = {
        type: 'trade_deal',
        description: 'Successful trade',
        success: true,
        intensity: 1
      };

      const socialAction = {
        type: 'public_speech',
        description: 'Inspiring speech',
        success: true,
        intensity: 1
      };

      const tradeResult = influenceService.applyCharacterAction(mockInfluence, tradeAction, mockSettlement, mockCharacter);
      const socialResult = influenceService.applyCharacterAction(mockInfluence, socialAction, mockSettlement, mockCharacter);

      expect(tradeResult.getValue('economic')).toBeGreaterThan(mockInfluence.getValue('economic'));
      expect(socialResult.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
    });

    test('should include action context in history', () => {
      const action = {
        type: 'political_negotiation',
        description: 'Trade negotiation',
        success: true,
        intensity: 1
      };

      const result = influenceService.applyCharacterAction(mockInfluence, action, mockSettlement, mockCharacter);
      const lastChange = result.getLastChange('political');

      expect(lastChange.settlementContext.actionType).toBe('political_negotiation');
      expect(lastChange.settlementContext.actionSuccess).toBe(true);
      expect(lastChange.settlementContext.settlementId).toBe('settlement1');
    });

    test('should handle secondary effects', () => {
      const action = {
        type: 'public_speech',
        description: 'Political rally',
        success: true,
        intensity: 2
      };

      const result = influenceService.applyCharacterAction(mockInfluence, action, mockSettlement, mockCharacter);

      // Should affect both social and political influence
      expect(result.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
      expect(result.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
    });
  });

  describe('analyzeInfluenceDistribution', () => {
    test('should calculate basic distribution metrics', () => {
      const analysis = influenceService.analyzeInfluenceDistribution(mockInfluence);

      expect(analysis.totalInfluence).toBe(90); // 30 + 20 + 25 + 15
      expect(analysis.averageInfluence).toBe(22.5);
      expect(analysis.dominantDomains).toHaveLength(2); // Top third
      expect(analysis.weakDomains).toHaveLength(2); // Bottom third
    });

    test('should identify dominant and weak domains', () => {
      const analysis = influenceService.analyzeInfluenceDistribution(mockInfluence);

      expect(analysis.dominantDomains[0].id).toBe('political'); // Highest value
      expect(analysis.weakDomains[analysis.weakDomains.length - 1].id).toBe('military'); // Lowest value
    });

    test('should calculate balance score', () => {
      const balancedInfluence = new Influence(mockDomains, { political: 25, economic: 25, social: 25, military: 25 });
      const unbalancedInfluence = new Influence(mockDomains, { political: 80, economic: 5, social: 5, military: 5 });

      const balancedAnalysis = influenceService.analyzeInfluenceDistribution(balancedInfluence);
      const unbalancedAnalysis = influenceService.analyzeInfluenceDistribution(unbalancedInfluence);

      expect(balancedAnalysis.balanceScore).toBeLessThan(unbalancedAnalysis.balanceScore);
    });

    test('should calculate tier distribution', () => {
      const analysis = influenceService.analyzeInfluenceDistribution(mockInfluence);

      expect(analysis.tierDistribution).toBeDefined();
      expect(Object.keys(analysis.tierDistribution).length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    test('should validate influence parameter', () => {
      const event = { type: 'test', description: 'test' };

      expect(() => {
        influenceService.updateInfluence(null, mockSettlement, event, mockCharacter);
      }).toThrow('Invalid influence: must be an instance of Influence');

      expect(() => {
        influenceService.updateInfluence({}, mockSettlement, event, mockCharacter);
      }).toThrow('Invalid influence: must be an instance of Influence');
    });

    test('should validate settlement parameter', () => {
      const event = { type: 'test', description: 'test' };

      expect(() => {
        influenceService.updateInfluence(mockInfluence, null, event, mockCharacter);
      }).toThrow('Invalid settlement: must be an object');

      expect(() => {
        influenceService.updateInfluence(mockInfluence, {}, event, mockCharacter);
      }).toThrow('Settlement must have a valid id');

      expect(() => {
        influenceService.updateInfluence(mockInfluence, { id: 'test' }, event, mockCharacter);
      }).toThrow('Settlement must have a valid name');
    });

    test('should validate event parameter', () => {
      expect(() => {
        influenceService.updateInfluence(mockInfluence, mockSettlement, null, mockCharacter);
      }).toThrow('Invalid event: must be an object');

      expect(() => {
        influenceService.updateInfluence(mockInfluence, mockSettlement, {}, mockCharacter);
      }).toThrow('Event must have a valid type');

      expect(() => {
        influenceService.updateInfluence(mockInfluence, mockSettlement, { type: 'test' }, mockCharacter);
      }).toThrow('Event must have a description');
    });

    test('should validate action parameter', () => {
      expect(() => {
        influenceService.applyCharacterAction(mockInfluence, null, mockSettlement, mockCharacter);
      }).toThrow('Invalid action: must be an object');

      expect(() => {
        influenceService.applyCharacterAction(mockInfluence, {}, mockSettlement, mockCharacter);
      }).toThrow('Action must have a valid type');

      expect(() => {
        influenceService.applyCharacterAction(mockInfluence, { type: 'test' }, mockSettlement, mockCharacter);
      }).toThrow('Action must have a description');
    });

    test('should validate settlement events array', () => {
      expect(() => {
        influenceService.applySettlementEvents(mockInfluence, 'not an array', mockCharacter);
      }).toThrow('Settlement events must be an array');
    });
  });

  describe('Settlement Integration Tests', () => {
    test('should handle different settlement types affecting influence differently', () => {
      const capitalSettlement = { ...mockSettlement, type: 'capital', hasGovernment: true };
      const tradeHubSettlement = { ...mockSettlement, type: 'trade_hub', hasMarket: true };
      const fortressSettlement = { ...mockSettlement, type: 'fortress', hasBarracks: true };

      const politicalEvent = {
        type: 'political_event',
        subtype: 'election',
        description: 'Local election',
        intensity: 1
      };

      const capitalResult = influenceService.updateInfluence(mockInfluence, capitalSettlement, politicalEvent, mockCharacter);
      const tradeResult = influenceService.updateInfluence(mockInfluence, tradeHubSettlement, politicalEvent, mockCharacter);
      const fortressResult = influenceService.updateInfluence(mockInfluence, fortressSettlement, politicalEvent, mockCharacter);

      // All should increase political influence, but amounts may vary based on settlement context
      expect(capitalResult.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(tradeResult.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(fortressResult.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
    });

    test('should properly serialize settlement data in context', () => {
      const complexSettlement = {
        ...mockSettlement,
        customData: new Map([
          ['tradeRoutes', 5],
          ['militaryStrength', 80],
          ['culturalDiversity', 0.7]
        ])
      };

      const event = {
        type: 'economic_event',
        subtype: 'trade_boom',
        description: 'Major trade expansion',
        intensity: 2
      };

      const result = influenceService.updateInfluence(mockInfluence, complexSettlement, event, mockCharacter);
      const lastChange = result.getLastChange('economic');

      expect(lastChange.settlementContext.settlementId).toBe(complexSettlement.id);
      expect(lastChange.settlementContext.settlementData).toBeInstanceOf(Map);
      expect(lastChange.settlementContext.settlementData.get('population')).toBe(complexSettlement.population);
    });

    test('should handle settlement prosperity and stability effects', () => {
      const prosperousSettlement = { ...mockSettlement, prosperity: 90, stability: 85 };
      const strugglingSettlement = { ...mockSettlement, prosperity: 20, stability: 30 };

      const economicEvent = {
        type: 'economic_event',
        subtype: 'trade_boom',
        description: 'Trade expansion',
        intensity: 1
      };

      const prosperousResult = influenceService.updateInfluence(mockInfluence, prosperousSettlement, economicEvent, mockCharacter);
      const strugglingResult = influenceService.updateInfluence(mockInfluence, strugglingSettlement, economicEvent, mockCharacter);

      // Both should increase economic influence
      expect(prosperousResult.getValue('economic')).toBeGreaterThan(mockInfluence.getValue('economic'));
      expect(strugglingResult.getValue('economic')).toBeGreaterThan(mockInfluence.getValue('economic'));
    });

    test('should handle settlement population effects on social influence', () => {
      const largeCity = { ...mockSettlement, population: 50000 };
      const smallTown = { ...mockSettlement, population: 500 };

      const socialEvent = {
        type: 'social_event',
        subtype: 'festival',
        description: 'Community celebration',
        intensity: 1
      };

      const cityResult = influenceService.updateInfluence(mockInfluence, largeCity, socialEvent, mockCharacter);
      const townResult = influenceService.updateInfluence(mockInfluence, smallTown, socialEvent, mockCharacter);

      // Both should increase social influence
      expect(cityResult.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
      expect(townResult.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
    });

    test('should handle religious settlements for cultural events', () => {
      const religiousSettlement = { 
        ...mockSettlement, 
        hasTemple: true, 
        hasShrine: true, 
        type: 'holy_site',
        dominantCulture: 'human'
      };

      const religiousEvent = {
        type: 'cultural_event',
        subtype: 'religious_ceremony',
        description: 'Sacred ritual performed',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, religiousSettlement, religiousEvent, mockCharacter);

      // Should affect both social and potentially religious influence if domain exists
      expect(result.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
    });
  });

  describe('Temporal Decay Logic Tests', () => {
    test('should apply different decay rates based on influence tiers', () => {
      const lowInfluence = new Influence(mockDomains, { political: 15, economic: 10, social: 20, military: 5 });
      const highInfluence = new Influence(mockDomains, { political: 85, economic: 90, social: 80, military: 75 });

      const timeElapsed = 30;

      const lowResult = influenceService.calculateInfluenceDecay(lowInfluence, timeElapsed, mockCharacter);
      const highResult = influenceService.calculateInfluenceDecay(highInfluence, timeElapsed, mockCharacter);

      // High influence should decay more in absolute terms due to higher base values
      const lowPoliticalDecay = lowInfluence.getValue('political') - lowResult.getValue('political');
      const highPoliticalDecay = highInfluence.getValue('political') - highResult.getValue('political');

      // Both should have some decay, and high influence should decay more in absolute terms
      expect(lowPoliticalDecay).toBeGreaterThan(0);
      expect(highPoliticalDecay).toBeGreaterThan(0);
      expect(highPoliticalDecay).toBeGreaterThanOrEqual(lowPoliticalDecay);
    });

    test('should handle very long time periods', () => {
      const timeElapsed = 365; // One year
      const result = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter);

      // All values should be significantly lower but not negative
      expect(result.getValue('political')).toBeLessThan(mockInfluence.getValue('political'));
      expect(result.getValue('economic')).toBeLessThan(mockInfluence.getValue('economic'));
      expect(result.getValue('social')).toBeLessThan(mockInfluence.getValue('social'));
      expect(result.getValue('military')).toBeLessThan(mockInfluence.getValue('military'));

      // But should not go below domain minimums
      expect(result.getValue('political')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('economic')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('social')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('military')).toBeGreaterThanOrEqual(0);
    });

    test('should handle fractional time periods', () => {
      const timeElapsed = 0.5; // Half day
      const result = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter);

      // Should have minimal decay
      const politicalDecay = mockInfluence.getValue('political') - result.getValue('political');
      expect(politicalDecay).toBeGreaterThanOrEqual(0);
      expect(politicalDecay).toBeLessThan(1); // Very small decay
    });

    test('should reduce decay for characters active in relevant settlements', () => {
      const activeSettlements = [
        { type: 'capital', hasGovernment: true, population: 10000 },
        { type: 'trade_hub', hasMarket: true, population: 5000 },
        { type: 'fortress', hasBarracks: true, population: 2000 }
      ];

      const timeElapsed = 30;
      const withoutActiveResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, []);
      const withActiveResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, activeSettlements);

      // Active settlements should reduce decay
      expect(withActiveResult.getValue('political')).toBeGreaterThanOrEqual(withoutActiveResult.getValue('political'));
      expect(withActiveResult.getValue('economic')).toBeGreaterThanOrEqual(withoutActiveResult.getValue('economic'));
      expect(withActiveResult.getValue('military')).toBeGreaterThanOrEqual(withoutActiveResult.getValue('military'));
    });

    test('should handle settlement relevance to specific domains', () => {
      const politicalSettlements = [{ type: 'capital', hasGovernment: true }];
      const economicSettlements = [{ type: 'trade_hub', hasMarket: true }];
      const militarySettlements = [{ type: 'fortress', hasBarracks: true }];

      const timeElapsed = 30;

      const politicalResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, politicalSettlements);
      const economicResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, economicSettlements);
      const militaryResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, militarySettlements);

      // Each should preserve influence better in their relevant domain
      const baseResult = influenceService.calculateInfluenceDecay(mockInfluence, timeElapsed, mockCharacter, []);

      expect(politicalResult.getValue('political')).toBeGreaterThanOrEqual(baseResult.getValue('political'));
      expect(economicResult.getValue('economic')).toBeGreaterThanOrEqual(baseResult.getValue('economic'));
      expect(militaryResult.getValue('military')).toBeGreaterThanOrEqual(baseResult.getValue('military'));
    });

    test('should handle multiple active settlements with overlapping benefits', () => {
      const overlappingSettlements = [
        { type: 'city', hasGovernment: true, hasMarket: true, population: 15000 },
        { type: 'capital', hasGovernment: true, hasTemple: true, population: 25000 }
      ];

      const timeElapsed = 30;
      const singleSettlementResult = influenceService.calculateInfluenceDecay(
        mockInfluence, 
        timeElapsed, 
        mockCharacter, 
        [overlappingSettlements[0]]
      );
      const multipleSettlementResult = influenceService.calculateInfluenceDecay(
        mockInfluence, 
        timeElapsed, 
        mockCharacter, 
        overlappingSettlements
      );

      // Multiple settlements should provide better decay protection
      expect(multipleSettlementResult.getValue('political')).toBeGreaterThanOrEqual(singleSettlementResult.getValue('political'));
      expect(multipleSettlementResult.getValue('social')).toBeGreaterThanOrEqual(singleSettlementResult.getValue('social'));
    });
  });

  describe('Comprehensive Edge Cases', () => {
    test('should handle influence at domain boundaries', () => {
      const boundaryInfluence = new Influence(mockDomains, { political: 0, economic: 100, social: 50, military: 25 });
      const event = {
        type: 'political_event',
        subtype: 'election',
        description: 'Election',
        intensity: 1
      };

      const result = influenceService.updateInfluence(boundaryInfluence, mockSettlement, event, mockCharacter);

      expect(result.getValue('political')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('economic')).toBeLessThanOrEqual(100);
    });

    test('should handle very high intensity events', () => {
      const event = {
        type: 'political_event',
        subtype: 'election',
        description: 'Major election',
        intensity: 10
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, mockCharacter);

      // Should still be within domain bounds
      expect(result.getValue('political')).toBeLessThanOrEqual(100);
      expect(result.getValue('political')).toBeGreaterThanOrEqual(0);
    });

    test('should handle character with extreme attributes', () => {
      const extremeCharacter = {
        ...mockCharacter,
        wealth: 10000,
        charisma: 20,
        militaryRank: 15
      };

      const event = {
        type: 'social_event',
        subtype: 'public_speech',
        description: 'Major speech',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, extremeCharacter);

      // Should still produce valid results
      expect(result.getValue('social')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('social')).toBeLessThanOrEqual(100);
    });

    test('should handle negative intensity events', () => {
      const negativeEvent = {
        type: 'political_event',
        subtype: 'scandal',
        description: 'Political scandal',
        intensity: -2
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, negativeEvent, mockCharacter);

      // Should handle negative events (the service may interpret negative intensity differently)
      expect(result.getValue('political')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('political')).toBeLessThanOrEqual(100);
    });

    test('should handle events with missing optional properties', () => {
      const minimalEvent = {
        type: 'generic_event',
        description: 'Something happened'
        // Missing subtype, intensity, etc.
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, minimalEvent, mockCharacter);

      // Should handle gracefully without throwing errors
      expect(result).toBeInstanceOf(Influence);
      expect(result.getDomainIds()).toEqual(mockInfluence.getDomainIds());
    });

    test('should handle character with missing optional properties', () => {
      const minimalCharacter = {
        id: 'minimal',
        name: 'Minimal Character'
        // Missing role, wealth, charisma, etc.
      };

      const event = {
        type: 'social_event',
        subtype: 'festival',
        description: 'Community festival',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, event, minimalCharacter);

      // Should handle gracefully with default values
      expect(result.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
    });

    test('should handle settlement with missing optional properties', () => {
      const minimalSettlement = {
        id: 'minimal',
        name: 'Minimal Settlement'
        // Missing type, population, prosperity, etc.
      };

      const event = {
        type: 'economic_event',
        subtype: 'trade_boom',
        description: 'Trade increase',
        intensity: 1
      };

      const result = influenceService.updateInfluence(mockInfluence, minimalSettlement, event, mockCharacter);

      // Should handle gracefully
      expect(result).toBeInstanceOf(Influence);
    });

    test('should handle zero intensity events', () => {
      const zeroEvent = {
        type: 'political_event',
        subtype: 'minor_meeting',
        description: 'Routine meeting',
        intensity: 0
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, zeroEvent, mockCharacter);

      // Should have minimal change (the service may still apply base changes)
      const politicalChange = Math.abs(result.getValue('political') - mockInfluence.getValue('political'));
      expect(politicalChange).toBeLessThanOrEqual(5); // Allow for small base changes
    });

    test('should handle very small fractional intensity', () => {
      const fractionalEvent = {
        type: 'social_event',
        subtype: 'casual_interaction',
        description: 'Brief social interaction',
        intensity: 0.1
      };

      const result = influenceService.updateInfluence(mockInfluence, mockSettlement, fractionalEvent, mockCharacter);

      // Should have very small change
      const socialChange = Math.abs(result.getValue('social') - mockInfluence.getValue('social'));
      expect(socialChange).toBeGreaterThan(0);
      expect(socialChange).toBeLessThan(2);
    });

    test('should handle influence distribution analysis edge cases', () => {
      // Test with all equal values
      const equalInfluence = new Influence(mockDomains, { political: 50, economic: 50, social: 50, military: 50 });
      const equalAnalysis = influenceService.analyzeInfluenceDistribution(equalInfluence);

      expect(equalAnalysis.balanceScore).toBe(0); // Perfect balance
      expect(equalAnalysis.averageInfluence).toBe(50);

      // Test with extreme imbalance
      const imbalancedInfluence = new Influence(mockDomains, { political: 100, economic: 0, social: 0, military: 0 });
      const imbalancedAnalysis = influenceService.analyzeInfluenceDistribution(imbalancedInfluence);

      expect(imbalancedAnalysis.balanceScore).toBeGreaterThan(equalAnalysis.balanceScore);
      expect(imbalancedAnalysis.dominantDomains[0].id).toBe('political');
    });

    test('should handle bulk event processing with mixed success/failure', () => {
      const mixedEvents = [
        {
          timestamp: new Date('2023-01-01'),
          settlement: mockSettlement,
          event: { type: 'political_event', subtype: 'election', description: 'Won election', intensity: 2 }
        },
        {
          timestamp: new Date('2023-01-02'),
          settlement: mockSettlement,
          event: { type: 'economic_event', subtype: 'market_crash', description: 'Lost money', intensity: 1 }
        },
        {
          timestamp: new Date('2023-01-03'),
          settlement: mockSettlement,
          event: { type: 'social_event', subtype: 'festival', description: 'Community event', intensity: 1 }
        }
      ];

      const result = influenceService.applySettlementEvents(mockInfluence, mixedEvents, mockCharacter);

      // Should have mixed results - political and social should increase
      expect(result.getValue('political')).toBeGreaterThan(mockInfluence.getValue('political'));
      expect(result.getValue('social')).toBeGreaterThan(mockInfluence.getValue('social'));
      // Economic may increase or decrease depending on how market_crash is handled
      expect(result.getValue('economic')).toBeGreaterThanOrEqual(0);
      expect(result.getValue('economic')).toBeLessThanOrEqual(100);
    });
  });
});