/**
 * Character Template Service Tests
 *
 * Tests for consciousness template functionality including:
 * - Predefined template loading and validation
 * - Custom template creation
 * - Template application to characters
 * - Consciousness parameter validation
 * - Character.fromTemplate integration
 */

import CharacterTemplateService from './CharacterTemplateService.js';
import Character from '../entities/Character.js';
import ConsciousnessUpdateService from './ConsciousnessUpdateService.js';
import BehavioralStateService from './BehavioralStateService.js';

describe('CharacterTemplateService', () => {
    let templateService;
    let mockLogger;
    let mockErrorHandler;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        mockErrorHandler = {
            handleCalculationFailure: jest.fn(),
            handleMissingBehavioralState: jest.fn()
        };

        templateService = new CharacterTemplateService(
            new ConsciousnessUpdateService(),
            new BehavioralStateService(),
            mockLogger,
            mockErrorHandler
        );
    });

    describe('Predefined Templates', () => {
        test('should load all predefined template names', () => {
            const templateNames = templateService.getPredefinedTemplateNames();

            expect(templateNames).toContain('warrior');
            expect(templateNames).toContain('scholar');
            expect(templateNames).toContain('merchant');
            expect(templateNames).toContain('mystic');
            expect(templateNames).toContain('noble');
            expect(templateNames).toContain('rogue');
            expect(templateNames).toContain('peasant');
            expect(templateNames).toHaveLength(7);
        });

        test('should retrieve predefined warrior template', () => {
            const template = templateService.getPredefinedTemplate('warrior');

            expect(template).toBeDefined();
            expect(template.name).toBe('Warrior');
            expect(template.consciousness.frequency).toBe(12.0);
            expect(template.consciousness.coherence).toBe(0.7);
            expect(template.consciousness.behavioralState.energy).toBe(0.9);
            expect(template.consciousness.behavioralState.riskTolerance).toBe(0.9);
        });

        test('should retrieve predefined scholar template', () => {
            const template = templateService.getPredefinedTemplate('scholar');

            expect(template).toBeDefined();
            expect(template.name).toBe('Scholar');
            expect(template.consciousness.frequency).toBe(10.0);
            expect(template.consciousness.coherence).toBe(0.9);
            expect(template.consciousness.behavioralState.focus).toBe(0.95);
            expect(template.consciousness.behavioralState.energy).toBe(0.5);
        });

        test('should return null for non-existent template', () => {
            const template = templateService.getPredefinedTemplate('nonexistent');

            expect(template).toBeNull();
            expect(mockLogger.warn).toHaveBeenCalledWith("Predefined template 'nonexistent' not found");
        });

        test('should handle case-insensitive template names', () => {
            const template = templateService.getPredefinedTemplate('WARRIOR');

            expect(template).toBeDefined();
            expect(template.name).toBe('Warrior');
        });
    });

    describe('Template Validation', () => {
        test('should validate valid consciousness template', () => {
            const validTemplate = {
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.6,
                    behavioralState: {
                        energy: 0.7,
                        focus: 0.8,
                        socialDrive: 0.5,
                        riskTolerance: 0.6
                    }
                }
            };

            const result = templateService.validateConsciousnessTemplate(validTemplate.consciousness);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject invalid frequency values', () => {
            const invalidTemplate = {
                consciousness: {
                    frequency: 20.0, // Too high
                    coherence: 0.6
                }
            };

            const result = templateService.validateConsciousnessTemplate(invalidTemplate.consciousness);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Frequency must be between 3.0 and 15.0 Hz');
        });

        test('should reject invalid coherence values', () => {
            const invalidTemplate = {
                consciousness: {
                    frequency: 8.0,
                    coherence: 1.5 // Too high
                }
            };

            const result = templateService.validateConsciousnessTemplate(invalidTemplate.consciousness);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Coherence must be between 0.2 and 1.0');
        });

        test('should reject invalid behavioral state values', () => {
            const invalidTemplate = {
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.6,
                    behavioralState: {
                        energy: 1.5, // Too high
                        focus: 0.8
                    }
                }
            };

            const result = templateService.validateConsciousnessTemplate(invalidTemplate.consciousness);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('energy must be a number between 0 and 1');
        });
    });

    describe('Custom Template Creation', () => {
        test('should create valid custom template', () => {
            const templateConfig = {
                name: 'Test Warrior',
                description: 'A test warrior template',
                consciousness: {
                    frequency: 11.0,
                    coherence: 0.8,
                    behavioralState: {
                        energy: 0.8,
                        focus: 0.7,
                        socialDrive: 0.4,
                        riskTolerance: 0.8
                    }
                }
            };

            const template = templateService.createCustomTemplate(templateConfig);

            expect(template.name).toBe('Test Warrior');
            expect(template.description).toBe('A test warrior template');
            expect(template.consciousness.frequency).toBe(11.0);
            expect(template.consciousness.coherence).toBe(0.8);
            expect(template.custom).toBe(true);
            expect(template.createdAt).toBeDefined();
        });

        test('should reject custom template with invalid consciousness', () => {
            const invalidConfig = {
                name: 'Invalid Template',
                consciousness: {
                    frequency: 25.0, // Invalid frequency
                    coherence: 0.8
                }
            };

            expect(() => {
                templateService.createCustomTemplate(invalidConfig);
            }).toThrow('Invalid consciousness configuration: Frequency must be between 3.0 and 15.0 Hz');
        });

        test('should reject custom template without name', () => {
            const invalidConfig = {
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.6
                }
            };

            expect(() => {
                templateService.createCustomTemplate(invalidConfig);
            }).toThrow('Template must have a name');
        });
    });

    describe('Template Application', () => {
        test('should apply consciousness template to character data', () => {
            const template = {
                name: 'Test Template',
                consciousness: {
                    frequency: 10.0,
                    coherence: 0.8,
                    behavioralState: {
                        energy: 0.7,
                        focus: 0.9,
                        socialDrive: 0.5,
                        riskTolerance: 0.6
                    }
                }
            };

            const characterData = {
                name: 'Test Character',
                age: 30
            };

            const result = templateService.applyConsciousnessTemplate(characterData, template);

            expect(result.name).toBe('Test Character');
            expect(result.age).toBe(30);
            expect(result.consciousness.frequency).toBe(10.0);
            expect(result.consciousness.coherence).toBe(0.8);
            expect(result.consciousness.behavioralState.energy).toBe(0.7);
            expect(result.templateApplied.name).toBe('Test Template');
        });

        test('should merge customizations with template', () => {
            const template = {
                name: 'Base Template',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.6,
                    behavioralState: {
                        energy: 0.5,
                        focus: 0.5,
                        socialDrive: 0.5,
                        riskTolerance: 0.5
                    }
                }
            };

            const characterData = {
                name: 'Custom Character',
                consciousness: {
                    frequency: 12.0, // Override frequency
                    behavioralState: {
                        energy: 0.9 // Override energy
                    }
                }
            };

            const result = templateService.applyConsciousnessTemplate(characterData, template, characterData.consciousness);

            expect(result.consciousness.frequency).toBe(12.0); // Custom value
            expect(result.consciousness.coherence).toBe(0.6); // Template value
            expect(result.consciousness.behavioralState.energy).toBe(0.9); // Custom value
            expect(result.consciousness.behavioralState.focus).toBe(0.5); // Template value
        });
    });

    describe('Template Recommendations', () => {
        test('should recommend templates based on personality', () => {
            const characterAttributes = {
                personality: {
                    aggression: 0.8,
                    bravery: 0.9,
                    extrovert: 0.3
                }
            };

            const recommendations = templateService.getTemplateRecommendations(characterAttributes);

            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations[0].templateName).toBeDefined();
            expect(recommendations[0].score).toBeGreaterThan(0);
            expect(recommendations[0].reasons).toBeDefined();
        });

        test('should recommend templates based on profession', () => {
            const characterAttributes = {
                profession: 'fighter'
            };

            const recommendations = templateService.getTemplateRecommendations(characterAttributes);

            expect(recommendations.length).toBeGreaterThan(0);
            const warriorRecommendation = recommendations.find(r => r.templateName === 'warrior');
            expect(warriorRecommendation).toBeDefined();
            expect(warriorRecommendation.score).toBeGreaterThan(10);
        });

        test('should return empty array for no matching attributes', () => {
            const recommendations = templateService.getTemplateRecommendations({});

            expect(recommendations).toHaveLength(0);
        });
    });

    describe('Template Serialization', () => {
        test('should export template to JSON', () => {
            const template = {
                name: 'Export Test',
                description: 'Test template for export',
                consciousness: {
                    frequency: 9.0,
                    coherence: 0.7
                }
            };

            const jsonString = templateService.exportTemplate(template);
            const parsed = JSON.parse(jsonString);

            expect(parsed.name).toBe('Export Test');
            expect(parsed.consciousness.frequency).toBe(9.0);
        });

        test('should import template from JSON', () => {
            const templateJson = JSON.stringify({
                name: 'Import Test',
                consciousness: {
                    frequency: 8.5,
                    coherence: 0.75
                }
            });

            const template = templateService.importTemplate(templateJson);

            expect(template.name).toBe('Import Test');
            expect(template.consciousness.frequency).toBe(8.5);
            expect(mockLogger.info).toHaveBeenCalledWith('Imported consciousness template: Import Test');
        });

        test('should reject invalid JSON import', () => {
            expect(() => {
                templateService.importTemplate('invalid json');
            }).toThrow();
        });

        test('should reject import with invalid consciousness', () => {
            const invalidJson = JSON.stringify({
                name: 'Invalid Import',
                consciousness: {
                    frequency: 30.0 // Invalid frequency
                }
            });

            expect(() => {
                templateService.importTemplate(invalidJson);
            }).toThrow('Invalid imported template: Frequency must be between 3.0 and 15.0 Hz');
        });
    });
});

describe('Character.fromTemplate Integration', () => {
    test('should create character from predefined template name', () => {
        const character = Character.fromTemplate('warrior', {
            name: 'Sir Galen',
            age: 35
        });

        expect(character).toBeDefined();
        expect(character.name).toBe('Sir Galen');
        expect(character.age).toBe(35);
        expect(character.consciousness.frequency).toBe(12.0);
        expect(character.consciousness.coherence).toBe(0.7);
        expect(character.consciousness.behavioralState.energy).toBe(0.9);
    });

    test('should create character from template object', () => {
        const template = {
            name: 'Custom Mage',
            consciousness: {
                frequency: 9.0,
                coherence: 0.8,
                behavioralState: {
                    energy: 0.6,
                    focus: 0.9,
                    socialDrive: 0.4,
                    riskTolerance: 0.5
                }
            }
        };

        const character = Character.fromTemplate(template, {
            name: 'Elara the Wise',
            age: 28
        });

        expect(character.name).toBe('Elara the Wise');
        expect(character.age).toBe(28);
        expect(character.consciousness.frequency).toBe(9.0);
        expect(character.consciousness.coherence).toBe(0.8);
    });

    test('should throw error for non-existent template name', () => {
        expect(() => {
            Character.fromTemplate('nonexistent_template');
        }).toThrow("Predefined template 'nonexistent_template' not found");
    });

    test('should throw error for invalid template config', () => {
        expect(() => {
            Character.fromTemplate(null);
        }).toThrow('Template configuration is required');
    });

    test('should merge custom consciousness with template', () => {
        const character = Character.fromTemplate('scholar', {
            name: 'Professor Elm',
            consciousness: {
                frequency: 11.0, // Override template frequency
                behavioralState: {
                    energy: 0.8 // Override energy
                }
            }
        });

        expect(character.consciousness.frequency).toBe(11.0); // Custom value
        expect(character.consciousness.coherence).toBe(0.9); // Template value
        expect(character.consciousness.behavioralState.energy).toBe(0.8); // Custom value
        expect(character.consciousness.behavioralState.focus).toBe(0.95); // Template value
    });
});

describe('Consciousness Parameter Bounds', () => {
    test('should provide correct parameter bounds', () => {
        const templateService = new CharacterTemplateService();
        const bounds = templateService.getConsciousnessParameterBounds();

        expect(bounds.frequency.min).toBe(3.0);
        expect(bounds.frequency.max).toBe(15.0);
        expect(bounds.coherence.min).toBe(0.2);
        expect(bounds.coherence.max).toBe(1.0);
        expect(bounds.behavioralState.energy.min).toBe(0);
        expect(bounds.behavioralState.energy.max).toBe(1);
    });

    test('should validate frequency bounds in character creation', () => {
        const template = {
            name: 'Test Character',
            consciousness: {
                frequency: 2.0, // Below minimum
                coherence: 0.5
            }
        };

        // The Character constructor should clamp invalid values rather than throw
        const character = Character.fromTemplate(template);
        expect(character.consciousness.frequency).toBe(3.0); // Should be clamped to minimum
        expect(character.consciousness.coherence).toBe(0.5);
    });

    test('should validate coherence bounds in character creation', () => {
        const template = {
            name: 'Test Character',
            consciousness: {
                frequency: 8.0,
                coherence: 1.5 // Above maximum
            }
        };

        // The Character constructor should clamp invalid values rather than throw
        const character = Character.fromTemplate(template);
        expect(character.consciousness.frequency).toBe(8.0);
        expect(character.consciousness.coherence).toBe(1.0); // Should be clamped to maximum
    });
});