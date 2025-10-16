/**
 * Consciousness Template Integration Test
 *
 * Demonstrates the complete workflow of consciousness template integration
 * with character creation and validation.
 */

import CharacterTemplateService from './CharacterTemplateService.js';
import Character from '../entities/Character.js';
import ConsciousnessUpdateService from './ConsciousnessUpdateService.js';

describe('Consciousness Template Integration', () => {
    let templateService;

    beforeEach(() => {
        templateService = new CharacterTemplateService();
    });

    test('should create warrior character with consciousness template', async () => {
        // Create a warrior character using the predefined template
        const warrior = await Character.fromTemplate('warrior', {
            name: 'Thrain Ironfist',
            age: 32
        });

        // Verify basic character properties
        expect(warrior.name).toBe('Thrain Ironfist');
        expect(warrior.age).toBe(32);

        // Verify consciousness configuration from template
        expect(warrior.consciousness.frequency).toBe(12.0);
        expect(warrior.consciousness.coherence).toBe(0.7);
        expect(warrior.consciousness.behavioralState.energy).toBe(0.9);
        expect(warrior.consciousness.behavioralState.focus).toBe(0.8);
        expect(warrior.consciousness.behavioralState.socialDrive).toBe(0.4);
        expect(warrior.consciousness.behavioralState.riskTolerance).toBe(0.9);

        // Verify template application metadata
        expect(warrior.templateApplied).toBeDefined();
        expect(warrior.templateApplied.name).toBe('Warrior');
        expect(warrior.templateApplied.appliedAt).toBeDefined();
    });

    test('should create scholar character with custom consciousness overrides', async () => {
        // Create a scholar character with custom consciousness settings
        const scholar = await Character.fromTemplate('scholar', {
            name: 'Elara Mindweaver',
            age: 28,
            consciousness: {
                frequency: 11.0, // Slightly override template frequency
                behavioralState: {
                    energy: 0.7, // Override energy level
                    socialDrive: 0.6 // Override social drive
                }
            }
        });

        // Verify basic properties
        expect(scholar.name).toBe('Elara Mindweaver');
        expect(scholar.age).toBe(28);

        // Verify custom consciousness overrides
        expect(scholar.consciousness.frequency).toBe(11.0); // Custom value
        expect(scholar.consciousness.coherence).toBe(0.9); // Template value
        expect(scholar.consciousness.behavioralState.energy).toBe(0.7); // Custom value
        expect(scholar.consciousness.behavioralState.focus).toBe(0.95); // Template value
        expect(scholar.consciousness.behavioralState.socialDrive).toBe(0.6); // Custom value
    });

    test('should create custom template and use it for character creation', () => {
        // Create a custom template
        const customTemplate = templateService.createCustomTemplate({
            name: 'Mystic Warrior',
            description: 'A warrior with mystical consciousness',
            consciousness: {
                frequency: 9.5,
                coherence: 0.85,
                behavioralState: {
                    energy: 0.8,
                    focus: 0.9,
                    socialDrive: 0.3,
                    riskTolerance: 0.7
                }
            }
        });

        // Use the custom template to create a character
        const character = Character.fromTemplate(customTemplate, {
            name: 'Kai Spiritblade',
            age: 35
        });

        // Verify the character uses the custom template
        expect(character.name).toBe('Kai Spiritblade');
        expect(character.consciousness.frequency).toBe(9.5);
        expect(character.consciousness.coherence).toBe(0.85);
        expect(character.consciousness.behavioralState.energy).toBe(0.8);
        expect(character.templateApplied.name).toBe('Mystic Warrior');
    });

    test('should validate consciousness parameters during character creation', () => {
        // Create character with invalid consciousness parameters
        const character = Character.fromTemplate({
            name: 'Test Character',
            consciousness: {
                frequency: 25.0, // Invalid - too high
                coherence: -0.5, // Invalid - too low
                behavioralState: {
                    energy: 1.5, // Invalid - too high
                    focus: -0.2 // Invalid - too low
                }
            }
        });

        // Verify parameters are clamped to valid bounds
        expect(character.consciousness.frequency).toBe(15.0); // Clamped to max
        expect(character.consciousness.coherence).toBe(0.2); // Clamped to min
        expect(character.consciousness.behavioralState.energy).toBe(1.0); // Clamped to max
        expect(character.consciousness.behavioralState.focus).toBe(0.0); // Clamped to min
    });

    test('should integrate with consciousness update service', () => {
        // Create a character with initial consciousness
        const character = Character.fromTemplate('merchant', {
            name: 'Marcus Tradeborn'
        });

        // Simulate an event that should update consciousness
        const updateService = new ConsciousnessUpdateService();
        const initialFrequency = character.consciousness.frequency;
        const initialCoherence = character.consciousness.coherence;

        // Process a significant event (economic gain)
        const event = {
            type: 'economic_gain',
            significance: 0.8,
            description: 'Made a profitable trade deal'
        };

        const result = updateService.processEvent(character, event);

        // Verify consciousness was updated
        expect(result.success).toBe(true);
        expect(result.updated).toBe(true);
        expect(character.consciousness.frequency).not.toBe(initialFrequency);
        expect(character.consciousness.coherence).not.toBe(initialCoherence);
    });

    test('should support template recommendations based on character attributes', () => {
        const characterAttributes = {
            personality: {
                aggression: 0.8,
                bravery: 0.9,
                discipline: 0.3
            },
            profession: 'fighter'
        };

        const recommendations = templateService.getTemplateRecommendations(characterAttributes);

        // Should recommend warrior template for fighter profession
        expect(recommendations.length).toBeGreaterThan(0);
        const warriorRecommendation = recommendations.find(r => r.templateName === 'warrior');
        expect(warriorRecommendation).toBeDefined();
        expect(warriorRecommendation.score).toBeGreaterThan(0);
    });

    test('should export and import consciousness templates', () => {
        // Create a custom template
        const originalTemplate = templateService.createCustomTemplate({
            name: 'Test Export',
            description: 'Template for export/import test',
            consciousness: {
                frequency: 10.0,
                coherence: 0.8,
                behavioralState: {
                    energy: 0.7,
                    focus: 0.8,
                    socialDrive: 0.5,
                    riskTolerance: 0.6
                }
            }
        });

        // Export to JSON
        const jsonString = templateService.exportTemplate(originalTemplate);

        // Import from JSON
        const importedTemplate = templateService.importTemplate(jsonString);

        // Verify the imported template matches the original
        expect(importedTemplate.name).toBe(originalTemplate.name);
        expect(importedTemplate.description).toBe(originalTemplate.description);
        expect(importedTemplate.consciousness.frequency).toBe(originalTemplate.consciousness.frequency);
        expect(importedTemplate.consciousness.coherence).toBe(originalTemplate.consciousness.coherence);
        expect(importedTemplate.consciousness.behavioralState.energy).toBe(originalTemplate.consciousness.behavioralState.energy);
    });

    test('should handle edge cases in template application', () => {
        // Test with minimal template
        const minimalTemplate = {
            name: 'Minimal Template',
            consciousness: {
                frequency: 7.0,
                coherence: 0.5
            }
        };

        const character = Character.fromTemplate(minimalTemplate, {
            name: 'Minimal Character'
        });

        // Should have default behavioral state applied
        expect(character.consciousness.frequency).toBe(7.0);
        expect(character.consciousness.coherence).toBe(0.5);
        expect(character.consciousness.behavioralState.energy).toBe(0.6); // Default from Character class
        expect(character.consciousness.behavioralState.focus).toBe(0.5); // Default from Character class
    });

    test('should maintain consciousness bounds across operations', () => {
        const character = Character.fromTemplate('warrior', {
            name: 'Bound Test Character'
        });

        // Verify initial bounds
        expect(character.consciousness.frequency).toBeGreaterThanOrEqual(3.0);
        expect(character.consciousness.frequency).toBeLessThanOrEqual(15.0);
        expect(character.consciousness.coherence).toBeGreaterThanOrEqual(0.2);
        expect(character.consciousness.coherence).toBeLessThanOrEqual(1.0);

        // Apply multiple updates
        const updateService = new ConsciousnessUpdateService();
        const events = [
            { type: 'conflict', significance: 0.9 },
            { type: 'goal_completion', significance: 0.8 },
            { type: 'traumatic_encounter', significance: 0.95 }
        ];

        events.forEach(event => {
            updateService.processEvent(character, event);
        });

        // Verify bounds are still maintained after updates
        expect(character.consciousness.frequency).toBeGreaterThanOrEqual(3.0);
        expect(character.consciousness.frequency).toBeLessThanOrEqual(15.0);
        expect(character.consciousness.coherence).toBeGreaterThanOrEqual(0.2);
        expect(character.consciousness.coherence).toBeLessThanOrEqual(1.0);
    });
});