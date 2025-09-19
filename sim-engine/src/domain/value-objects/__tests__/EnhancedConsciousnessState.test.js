import { EnhancedConsciousnessState } from '../EnhancedConsciousnessState';

describe('EnhancedConsciousnessState', () => {
    describe('Constructor and Initialization', () => {
        test('should create with default values', () => {
            const consciousness = new EnhancedConsciousnessState();
            
            expect(consciousness.baseFrequency).toBe(7.5);
            expect(consciousness.baseCoherence).toBe(0.7);
            expect(consciousness.updateTriggerThreshold).toBe(0.3);
            expect(consciousness.significantEvents).toEqual([]);
            expect(consciousness.behavioralState).toBeDefined();
        });

        test('should create with custom configuration', () => {
            const config = {
                baseFrequency: 10.0,
                baseCoherence: 0.8,
                updateTriggerThreshold: 0.4,
                id: 'test-consciousness'
            };
            
            const consciousness = new EnhancedConsciousnessState(config);
            
            expect(consciousness.baseFrequency).toBe(10.0);
            expect(consciousness.baseCoherence).toBe(0.8);
            expect(consciousness.updateTriggerThreshold).toBe(0.4);
            expect(consciousness.id).toBe('test-consciousness');
        });

        test('should enforce frequency bounds during initialization', () => {
            const consciousness = new EnhancedConsciousnessState({
                baseFrequency: 20.0 // Above max
            });
            
            expect(consciousness.baseFrequency).toBe(15.0);
        });

        test('should enforce coherence bounds during initialization', () => {
            const consciousness = new EnhancedConsciousnessState({
                baseCoherence: 1.5 // Above max
            });
            
            expect(consciousness.baseCoherence).toBe(1.0);
        });
    });

    describe('Behavioral State Generation', () => {
        test('should generate behavioral state from consciousness parameters', () => {
            const consciousness = new EnhancedConsciousnessState({
                baseFrequency: 8.0,
                baseCoherence: 0.8
            });
            
            const behavioralState = consciousness.getBehavioralState();
            
            expect(behavioralState).toHaveProperty('energy');
            expect(behavioralState).toHaveProperty('focus');
            expect(behavioralState).toHaveProperty('mood');
            expect(behavioralState).toHaveProperty('socialDrive');
            expect(behavioralState).toHaveProperty('riskTolerance');
            expect(behavioralState).toHaveProperty('ambition');
        });

        test('should map frequency to energy levels correctly', () => {
            const consciousness = new EnhancedConsciousnessState();
            
            expect(consciousness.mapFrequencyToEnergy(4.0)).toBe('low');
            expect(consciousness.mapFrequencyToEnergy(7.5)).toBe('moderate');
            expect(consciousness.mapFrequencyToEnergy(12.0)).toBe('high');
        });

        test('should map coherence to focus levels correctly', () => {
            const consciousness = new EnhancedConsciousnessState();
            
            expect(consciousness.mapCoherenceToFocus(0.3)).toBe('scattered');
            expect(consciousness.mapCoherenceToFocus(0.6)).toBe('balanced');
            expect(consciousness.mapCoherenceToFocus(0.9)).toBe('focused');
        });
    });

    describe('Event-Driven Updates', () => {
        test('should check significance threshold correctly', () => {
            const consciousness = new EnhancedConsciousnessState();
            
            const significantEvent = { significance: 0.5 };
            const insignificantEvent = { significance: 0.2 };
            
            expect(consciousness.shouldUpdateFromEvent(significantEvent)).toBe(true);
            expect(consciousness.shouldUpdateFromEvent(insignificantEvent)).toBe(false);
        });

        test('should update from significant events', () => {
            const consciousness = new EnhancedConsciousnessState();
            const initialFrequency = consciousness.baseFrequency;
            
            const event = {
                type: 'goal_completion',
                significance: 0.5,
                outcome: 'success'
            };
            
            const updated = consciousness.updateFromEvent(event);
            
            expect(updated).toBe(true);
            expect(consciousness.baseFrequency).toBeGreaterThan(initialFrequency);
            expect(consciousness.significantEvents).toHaveLength(1);
        });

        test('should not update from insignificant events', () => {
            const consciousness = new EnhancedConsciousnessState();
            const initialFrequency = consciousness.baseFrequency;
            
            const event = {
                type: 'minor_interaction',
                significance: 0.1
            };
            
            const updated = consciousness.updateFromEvent(event);
            
            expect(updated).toBe(false);
            expect(consciousness.baseFrequency).toBe(initialFrequency);
            expect(consciousness.significantEvents).toHaveLength(0);
        });
    });

    describe('Checkpoint System', () => {
        test('should create checkpoint with all necessary data', () => {
            const consciousness = new EnhancedConsciousnessState({
                baseFrequency: 9.0,
                baseCoherence: 0.8
            });
            
            const checkpoint = consciousness.createCheckpoint();
            
            expect(checkpoint).toHaveProperty('baseFrequency', 9.0);
            expect(checkpoint).toHaveProperty('baseCoherence', 0.8);
            expect(checkpoint).toHaveProperty('behavioralState');
            expect(checkpoint).toHaveProperty('significantEvents');
            expect(checkpoint).toHaveProperty('lastUpdate');
        });

        test('should restore from checkpoint correctly', () => {
            const consciousness = new EnhancedConsciousnessState();
            
            const checkpointData = {
                baseFrequency: 11.0,
                baseCoherence: 0.9,
                behavioralState: { energy: 'high', focus: 'focused' },
                significantEvents: [{ type: 'test', timestamp: Date.now() }],
                updateCount: 5
            };
            
            consciousness.restoreFromCheckpoint(checkpointData);
            
            expect(consciousness.baseFrequency).toBe(11.0);
            expect(consciousness.baseCoherence).toBe(0.9);
            expect(consciousness.updateCount).toBe(5);
            expect(consciousness.significantEvents).toHaveLength(1);
        });
    });
});