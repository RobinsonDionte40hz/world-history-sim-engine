// src/domain/value-objects/__tests__/AlignmentSerialization.test.js

import { Alignment } from '../Alignment';

describe('Alignment Serialization Tests', () => {
    const complexAxes = [
        {
            id: 'moral',
            name: 'Moral Alignment',
            description: 'Represents the character\'s moral compass from evil to good',
            min: -100,
            max: 100,
            defaultValue: 0,
            zones: [
                {
                    name: 'Evil',
                    min: -100,
                    max: -34,
                    description: 'Character tends toward selfish and harmful actions',
                    effects: [
                        { type: 'social', value: -10, description: 'Negative reputation' },
                        { type: 'karma', value: -5, description: 'Bad karma accumulation' }
                    ]
                },
                {
                    name: 'Neutral',
                    min: -33,
                    max: 33,
                    description: 'Character is morally balanced',
                    effects: [
                        { type: 'social', value: 0, description: 'Neutral reputation' }
                    ]
                },
                {
                    name: 'Good',
                    min: 34,
                    max: 100,
                    description: 'Character tends toward altruistic and helpful actions',
                    effects: [
                        { type: 'social', value: 10, description: 'Positive reputation' },
                        { type: 'karma', value: 5, description: 'Good karma accumulation' }
                    ]
                }
            ]
        },
        {
            id: 'ethical',
            name: 'Ethical Alignment',
            description: 'Represents the character\'s approach to rules and order',
            min: -100,
            max: 100,
            defaultValue: 0,
            zones: [
                {
                    name: 'Chaotic',
                    min: -100,
                    max: -34,
                    description: 'Character values freedom over rules',
                    effects: [
                        { type: 'authority', value: -15, description: 'Dislikes authority' },
                        { type: 'creativity', value: 10, description: 'Enhanced creativity' }
                    ]
                },
                {
                    name: 'Neutral',
                    min: -33,
                    max: 33,
                    description: 'Character balances order and freedom',
                    effects: [
                        { type: 'adaptability', value: 5, description: 'Flexible approach' }
                    ]
                },
                {
                    name: 'Lawful',
                    min: 34,
                    max: 100,
                    description: 'Character values order and rules',
                    effects: [
                        { type: 'authority', value: 15, description: 'Respects authority' },
                        { type: 'discipline', value: 10, description: 'Enhanced discipline' }
                    ]
                }
            ]
        },
        {
            id: 'social',
            name: 'Social Alignment',
            description: 'Represents the character\'s relationship with society',
            min: -50,
            max: 50,
            defaultValue: 0,
            zones: [
                {
                    name: 'Antisocial',
                    min: -50,
                    max: -17,
                    description: 'Character avoids or opposes social interaction',
                    effects: [
                        { type: 'isolation', value: 20, description: 'Prefers solitude' }
                    ]
                },
                {
                    name: 'Balanced',
                    min: -16,
                    max: 16,
                    description: 'Character has normal social tendencies',
                    effects: []
                },
                {
                    name: 'Prosocial',
                    min: 17,
                    max: 50,
                    description: 'Character seeks and values social interaction',
                    effects: [
                        { type: 'charisma', value: 10, description: 'Enhanced social skills' }
                    ]
                }
            ]
        }
    ];

    describe('Basic Serialization', () => {
        test('should serialize and deserialize empty alignment', () => {
            const alignment = new Alignment(complexAxes);
            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            expect(restored.equals(alignment)).toBe(true);
            expect(restored.getValue('moral')).toBe(0);
            expect(restored.getValue('ethical')).toBe(0);
            expect(restored.getValue('social')).toBe(0);
        });

        test('should serialize and deserialize alignment with custom values', () => {
            const values = { moral: 45, ethical: -30, social: 25 };
            const alignment = new Alignment(complexAxes, values);
            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            expect(restored.equals(alignment)).toBe(true);
            expect(restored.getValue('moral')).toBe(45);
            expect(restored.getValue('ethical')).toBe(-30);
            expect(restored.getValue('social')).toBe(25);
        });

        test('should preserve axis definitions exactly', () => {
            const alignment = new Alignment(complexAxes);
            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            for (const originalAxis of complexAxes) {
                const restoredAxis = restored.getAxis(originalAxis.id);

                expect(restoredAxis.id).toBe(originalAxis.id);
                expect(restoredAxis.name).toBe(originalAxis.name);
                expect(restoredAxis.description).toBe(originalAxis.description);
                expect(restoredAxis.min).toBe(originalAxis.min);
                expect(restoredAxis.max).toBe(originalAxis.max);
                expect(restoredAxis.defaultValue).toBe(originalAxis.defaultValue);
                expect(restoredAxis.zones).toHaveLength(originalAxis.zones.length);

                for (let i = 0; i < originalAxis.zones.length; i++) {
                    const originalZone = originalAxis.zones[i];
                    const restoredZone = restoredAxis.zones[i];

                    expect(restoredZone.name).toBe(originalZone.name);
                    expect(restoredZone.min).toBe(originalZone.min);
                    expect(restoredZone.max).toBe(originalZone.max);
                    expect(restoredZone.description).toBe(originalZone.description);
                    expect(restoredZone.effects).toEqual(originalZone.effects);
                }
            }
        });
    });

    describe('History Serialization', () => {
        test('should serialize and deserialize simple history', () => {
            let alignment = new Alignment(complexAxes);
            alignment = alignment.withChange('moral', 25, 'Good deed');
            alignment = alignment.withChange('ethical', -15, 'Broke a rule');

            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            expect(restored.equals(alignment)).toBe(true);

            const moralHistory = restored.getAxisHistory('moral');
            const ethicalHistory = restored.getAxisHistory('ethical');

            expect(moralHistory).toHaveLength(1);
            expect(ethicalHistory).toHaveLength(1);

            expect(moralHistory[0].change).toBe(25);
            expect(moralHistory[0].newValue).toBe(25);
            expect(moralHistory[0].reason).toBe('Good deed');
            expect(moralHistory[0].timestamp).toBeInstanceOf(Date);

            expect(ethicalHistory[0].change).toBe(-15);
            expect(ethicalHistory[0].newValue).toBe(-15);
            expect(ethicalHistory[0].reason).toBe('Broke a rule');
        });

        test('should serialize and deserialize complex history with context', () => {
            const historicalContext = {
                era: 'Renaissance',
                year: 1503,
                season: 'Autumn',
                culturalValues: new Map([
                    ['art', 0.8],
                    ['science', 0.6],
                    ['religion', 0.7]
                ]),
                politicalClimate: 'unstable',
                economicConditions: 'prosperous'
            };

            let alignment = new Alignment(complexAxes);
            alignment = alignment.withChange('moral', 30, 'Patronized the arts', historicalContext);
            alignment = alignment.withChange('social', 20, 'Hosted grand feast', historicalContext);

            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            expect(restored.equals(alignment)).toBe(true);

            const moralChange = restored.getLastChange('moral');
            const socialChange = restored.getLastChange('social');

            expect(moralChange.historicalContext).toBeDefined();
            expect(moralChange.historicalContext.era).toBe('Renaissance');
            expect(moralChange.historicalContext.year).toBe(1503);
            expect(moralChange.historicalContext.culturalValues.get('art')).toBe(0.8);

            expect(socialChange.historicalContext).toBeDefined();
            expect(socialChange.historicalContext.politicalClimate).toBe('unstable');
            expect(socialChange.historicalContext.economicConditions).toBe('prosperous');
        });

        test('should handle extensive history chains', () => {
            let alignment = new Alignment(complexAxes);

            // Create a complex history
            const changes = [
                { axis: 'moral', amount: 10, reason: 'Helped stranger' },
                { axis: 'ethical', amount: 5, reason: 'Followed law' },
                { axis: 'social', amount: 8, reason: 'Made friends' },
                { axis: 'moral', amount: -3, reason: 'Small lie' },
                { axis: 'ethical', amount: -12, reason: 'Broke curfew' },
                { axis: 'social', amount: 15, reason: 'Organized party' },
                { axis: 'moral', amount: 20, reason: 'Saved life' },
                { axis: 'ethical', amount: 8, reason: 'Reported crime' },
                { axis: 'social', amount: -5, reason: 'Argument with friend' },
                { axis: 'moral', amount: -8, reason: 'Stole food' }
            ];

            for (const change of changes) {
                alignment = alignment.withChange(change.axis, change.amount, change.reason);
            }

            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            expect(restored.equals(alignment)).toBe(true);

            // Verify all history is preserved
            const moralHistory = restored.getAxisHistory('moral');
            const ethicalHistory = restored.getAxisHistory('ethical');
            const socialHistory = restored.getAxisHistory('social');

            expect(moralHistory).toHaveLength(4);
            expect(ethicalHistory).toHaveLength(3);
            expect(socialHistory).toHaveLength(3);

            // Verify final values
            expect(restored.getValue('moral')).toBe(19); // 10 - 3 + 20 - 8
            expect(restored.getValue('ethical')).toBe(1);  // 5 - 12 + 8
            expect(restored.getValue('social')).toBe(18);  // 8 + 15 - 5
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle null and undefined values in JSON', () => {
            expect(() => {
                Alignment.fromJSON(null);
            }).toThrow('Invalid JSON data for Alignment');

            expect(() => {
                Alignment.fromJSON(undefined);
            }).toThrow('Invalid JSON data for Alignment');

            expect(() => {
                Alignment.fromJSON('not an object');
            }).toThrow('Invalid JSON data for Alignment');
        });

        test('should handle empty JSON gracefully', () => {
            const emptyJson = { axes: [], values: {}, history: {} };

            expect(() => {
                Alignment.fromJSON(emptyJson);
            }).toThrow('Alignment must have at least one axis');
        });

        test('should handle malformed JSON data', () => {
            const malformedJson = {
                axes: [{ id: 'test' }], // Missing required fields
                values: {},
                history: {}
            };

            expect(() => {
                Alignment.fromJSON(malformedJson);
            }).toThrow();
        });

        test('should preserve timestamp precision', () => {
            let alignment = new Alignment(complexAxes);
            const beforeTime = new Date();
            alignment = alignment.withChange('moral', 10, 'Test timestamp');
            const afterTime = new Date();

            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            const restoredTimestamp = restored.getLastChange('moral').timestamp;

            expect(restoredTimestamp).toBeInstanceOf(Date);
            expect(restoredTimestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(restoredTimestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });
    });

    describe('Performance and Large Data', () => {
        test('should handle large alignment systems efficiently', () => {
            // Create a large number of axes
            const manyAxes = [];
            for (let i = 0; i < 50; i++) {
                manyAxes.push({
                    id: `axis_${i}`,
                    name: `Axis ${i}`,
                    description: `Test axis number ${i}`,
                    min: -100,
                    max: 100,
                    defaultValue: 0,
                    zones: [
                        { name: 'Low', min: -100, max: -1, description: 'Low zone' },
                        { name: 'High', min: 0, max: 100, description: 'High zone' }
                    ]
                });
            }

            const values = {};
            for (let i = 0; i < 50; i++) {
                values[`axis_${i}`] = Math.floor(Math.random() * 200) - 100;
            }

            const startTime = Date.now();
            const alignment = new Alignment(manyAxes, values);
            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
            expect(restored.equals(alignment)).toBe(true);
            expect(restored.getAxisIds()).toHaveLength(50);
        });

        test('should handle extensive history efficiently', () => {
            let alignment = new Alignment(complexAxes);

            const startTime = Date.now();

            // Add many history entries
            for (let i = 0; i < 1000; i++) {
                const axis = complexAxes[i % complexAxes.length].id;
                alignment = alignment.withChange(axis, Math.random() * 10 - 5, `Change ${i}`);
            }

            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
            expect(restored.equals(alignment)).toBe(true);

            // Verify history length
            let totalHistoryLength = 0;
            for (const axisId of restored.getAxisIds()) {
                totalHistoryLength += restored.getAxisHistory(axisId).length;
            }
            expect(totalHistoryLength).toBe(1000);
        });
    });

    describe('Compatibility and Migration', () => {
        test('should handle legacy AlignmentManager format', () => {
            const legacyData = {
                axes: complexAxes,
                playerAlignment: { moral: 35, ethical: -20, social: 10 },
                history: {
                    moral: [
                        { timestamp: new Date('2023-01-01'), change: 35, newValue: 35, reason: 'Legacy change' }
                    ],
                    ethical: [
                        { timestamp: new Date('2023-01-02'), change: -20, newValue: -20, reason: 'Legacy ethical change' }
                    ],
                    social: []
                }
            };

            const alignment = Alignment.fromAlignmentManager(legacyData);

            expect(alignment.getValue('moral')).toBe(35);
            expect(alignment.getValue('ethical')).toBe(-20);
            expect(alignment.getValue('social')).toBe(10);

            expect(alignment.getAxisHistory('moral')).toHaveLength(1);
            expect(alignment.getAxisHistory('ethical')).toHaveLength(1);
            expect(alignment.getAxisHistory('social')).toHaveLength(0);

            expect(alignment.getLastChange('moral').reason).toBe('Legacy change');
        });

        test('should maintain backward compatibility after serialization', () => {
            const legacyData = {
                axes: complexAxes,
                playerAlignment: { moral: 25, ethical: 15, social: -5 },
                history: {
                    moral: [{ timestamp: new Date(), change: 25, newValue: 25, reason: 'Test' }],
                    ethical: [],
                    social: []
                }
            };

            const alignment = Alignment.fromAlignmentManager(legacyData);
            const json = alignment.toJSON();
            const restored = Alignment.fromJSON(json);

            expect(restored.equals(alignment)).toBe(true);
            expect(restored.getValue('moral')).toBe(25);
            expect(restored.getLastChange('moral').reason).toBe('Test');
        });
    });
});