// src/domain/value-objects/RaceSystem.js

class RaceSystem {
    constructor() {
        this.races = new Map();
        this.initializeDefaultRaces();
    }

    initializeDefaultRaces() {
        // Human
        this.createRace({
            id: 'human',
            name: 'Human',
            description: 'Versatile and adaptable, humans are known for their diversity and ambition.',
            subraces: [
                {
                    name: 'Standard',
                    description: 'The most common human variant',
                    attributeModifiers: {
                        versatility: 1
                    },
                    skillModifiers: {
                        adaptability: 1
                    },
                    features: ['Versatile', 'Ambitious']
                }
            ],
            traits: [
                {
                    name: 'Versatility',
                    description: 'Humans can excel in any field they choose',
                    effects: {
                        skillGainRate: 1.1
                    }
                }
            ],
            lifespan: {
                average: 80,
                maximum: 100
            }
        });

        // Elf
        this.createRace({
            id: 'elf',
            name: 'Elf',
            description: 'Graceful and long-lived, elves are known for their wisdom and magical affinity.',
            subraces: [
                {
                    name: 'High Elf',
                    description: 'Scholarly and magical',
                    attributeModifiers: {
                        intelligence: 2,
                        dexterity: 1
                    },
                    skillModifiers: {
                        magic: 2,
                        knowledge: 1
                    },
                    features: ['Arcane Affinity', 'Long-lived']
                },
                {
                    name: 'Wood Elf',
                    description: 'Nature-oriented and agile',
                    attributeModifiers: {
                        dexterity: 2,
                        wisdom: 1
                    },
                    skillModifiers: {
                        nature: 2,
                        stealth: 1
                    },
                    features: ['Nature Bond', 'Agile']
                }
            ],
            traits: [
                {
                    name: 'Longevity',
                    description: 'Elves live for centuries',
                    effects: {
                        lifespan: 2.0
                    }
                },
                {
                    name: 'Magical Affinity',
                    description: 'Natural talent for magic',
                    effects: {
                        magicResistance: 1.2,
                        magicLearning: 1.3
                    }
                }
            ],
            lifespan: {
                average: 750,
                maximum: 1000
            }
        });

        // Dwarf
        this.createRace({
            id: 'dwarf',
            name: 'Dwarf',
            description: 'Sturdy and skilled craftsmen, dwarves are known for their resilience and craftsmanship.',
            subraces: [
                {
                    name: 'Mountain Dwarf',
                    description: 'Strong and resilient',
                    attributeModifiers: {
                        strength: 2,
                        constitution: 2
                    },
                    skillModifiers: {
                        crafting: 2,
                        mining: 1
                    },
                    features: ['Stonecunning', 'Resilient']
                },
                {
                    name: 'Hill Dwarf',
                    description: 'Wise and hardy',
                    attributeModifiers: {
                        constitution: 2,
                        wisdom: 1
                    },
                    skillModifiers: {
                        crafting: 1,
                        survival: 1
                    },
                    features: ['Hardy', 'Wise']
                }
            ],
            traits: [
                {
                    name: 'Resilience',
                    description: 'Dwarves are naturally resistant to physical harm',
                    effects: {
                        physicalResistance: 1.3
                    }
                },
                {
                    name: 'Craftsmanship',
                    description: 'Natural talent for crafting and engineering',
                    effects: {
                        craftingQuality: 1.2,
                        engineeringUnderstanding: 1.3
                    }
                }
            ],
            lifespan: {
                average: 350,
                maximum: 450
            }
        });
    }

    createRace(raceData) {
        if (this.races.has(raceData.id)) {
            throw new Error(`Race with ID ${raceData.id} already exists`);
        }
        this.races.set(raceData.id, raceData);
        return raceData;
    }

    getRace(raceId) {
        const race = this.races.get(raceId);
        if (!race) {
            throw new Error(`Race with ID ${raceId} not found`);
        }
        return race;
    }

    getSubrace(raceId, subraceName) {
        const race = this.getRace(raceId);
        const subrace = race.subraces.find(s => s.name === subraceName);
        if (!subrace) {
            throw new Error(`Subrace ${subraceName} not found in race ${raceId}`);
        }
        return subrace;
    }

    getRacialModifiers(raceId, subraceName = null) {
        const race = this.getRace(raceId);
        const modifiers = {
            attributes: {},
            skills: {},
            features: [],
            effects: {}
        };

        // Apply race traits
        race.traits.forEach(trait => {
            Object.entries(trait.effects).forEach(([key, value]) => {
                modifiers.effects[key] = value;
            });
        });

        // Apply subrace modifiers if specified
        if (subraceName) {
            const subrace = this.getSubrace(raceId, subraceName);
            modifiers.attributes = { ...modifiers.attributes, ...subrace.attributeModifiers };
            modifiers.skills = { ...modifiers.skills, ...subrace.skillModifiers };
            modifiers.features.push(...subrace.features);
        }

        return modifiers;
    }

    getLifespan(raceId) {
        const race = this.getRace(raceId);
        return race.lifespan;
    }

    getAllRaces() {
        return Array.from(this.races.values());
    }

    toJSON() {
        return {
            races: Array.from(this.races.entries())
        };
    }

    static fromJSON(json) {
        const system = new RaceSystem();
        system.races = new Map(json.races);
        return system;
    }

    // Persistence methods for localStorage
    saveToLocalStorage(key = 'raceSystem') {
        try {
            const data = this.toJSON();
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save RaceSystem to localStorage:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key = 'raceSystem') {
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                return null;
            }
            return RaceSystem.fromJSON(JSON.parse(data));
        } catch (error) {
            console.error('Failed to load RaceSystem from localStorage:', error);
            return null;
        }
    }

    clearLocalStorage(key = 'raceSystem') {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to clear RaceSystem from localStorage:', error);
            return false;
        }
    }
}

export default RaceSystem;