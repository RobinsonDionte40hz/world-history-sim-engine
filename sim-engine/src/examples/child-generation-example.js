// src/examples/child-generation-example.js

import Character from '../domain/entities/Character.js';
import ChildGenerationService from '../domain/services/ChildGenerationService.js';
import RacialTraits from '../domain/value-objects/RacialTraits.js';

/**
 * Example demonstrating child generation from parent characters
 */
class ChildGenerationExample {
  constructor() {
    this.childGenerationService = new ChildGenerationService();
  }

  /**
   * Example 1: Basic child generation
   */
  async basicChildGeneration() {
    console.log('\n=== Basic Child Generation Example ===');

    // Create parent characters
    const mother = new Character({
      id: 'mother1',
      name: 'Elena Brightleaf',
      age: 28,
      baseAttributes: {
        strength: 12,
        dexterity: 16,
        constitution: 14,
        intelligence: 15,
        wisdom: 17,
        charisma: 13
      },
      personalityConfig: {
        traits: [
          { id: 'empathy', intensity: 0.9 },
          { id: 'patience', intensity: 0.8 },
          { id: 'curiosity', intensity: 0.7 }
        ]
      },
      consciousness: {
        frequency: 42,
        coherence: 0.8
      },
      racialTraits: new RacialTraits('elf', 'High Elf')
    });

    const father = new Character({
      id: 'father1',
      name: 'Marcus Brightleaf',
      age: 32,
      baseAttributes: {
        strength: 16,
        dexterity: 13,
        constitution: 15,
        intelligence: 14,
        wisdom: 12,
        charisma: 16
      },
      personalityConfig: {
        traits: [
          { id: 'courage', intensity: 0.8 },
          { id: 'loyalty', intensity: 0.9 },
          { id: 'ambition', intensity: 0.6 }
        ]
      },
      consciousness: {
        frequency: 38,
        coherence: 0.7
      },
      racialTraits: new RacialTraits('human')
    });

    const settlement = {
      id: 'moonhaven',
      name: 'Moonhaven',
      culture: {
        language: 'elvish',
        traditions: ['starwatch_ceremony', 'forest_blessing'],
        values: { nature: 0.9, family: 0.8, wisdom: 0.7 }
      }
    };

    // Generate child
    const child = this.childGenerationService.generateChild(mother, father, settlement);

    console.log(`Parents: ${mother.name} & ${father.name}`);
    console.log(`Child: ${child.name} (Age: ${child.age})`);
    console.log(`\nInherited Attributes:`);
    console.log(`- Strength: ${child.baseAttributes.strength} (Parents: ${mother.baseAttributes.strength}/${father.baseAttributes.strength})`);
    console.log(`- Dexterity: ${child.baseAttributes.dexterity} (Parents: ${mother.baseAttributes.dexterity}/${father.baseAttributes.dexterity})`);
    console.log(`- Intelligence: ${child.baseAttributes.intelligence} (Parents: ${mother.baseAttributes.intelligence}/${father.baseAttributes.intelligence})`);
    console.log(`- Wisdom: ${child.baseAttributes.wisdom} (Parents: ${mother.baseAttributes.wisdom}/${father.baseAttributes.wisdom})`);

    console.log(`\nConsciousness:`);
    console.log(`- Frequency: ${child.consciousness.frequency} Hz (Parents: ${mother.consciousness.frequency}/${father.consciousness.frequency})`);
    console.log(`- Coherence: ${child.consciousness.coherence} (Starting low for development)`);

    console.log(`\nPersonality Traits:`);
    child.personality.getAllTraits().forEach(trait => {
      console.log(`- ${trait.id}: ${trait.intensity.toFixed(2)}`);
    });

    console.log(`\nFamily Relationships:`);
    console.log(`- Relationship with ${mother.name}: ${child.relationships.get(mother.id).value} (${child.relationships.get(mother.id).type})`);
    console.log(`- Relationship with ${father.name}: ${child.relationships.get(father.id).value} (${child.relationships.get(father.id).type})`);

    console.log(`\nGoals:`);
    child.goals.forEach(goal => {
      console.log(`- ${goal.id} (${goal.type}, priority: ${goal.priority})`);
    });

    return child;
  }

  /**
   * Example 2: Multiple children from same parents
   */
  async multipleChildrenExample() {
    console.log('\n=== Multiple Children Example ===');

    const parent1 = new Character({
      id: 'dad',
      name: 'Thorin Ironforge',
      age: 45,
      baseAttributes: {
        strength: 18,
        dexterity: 10,
        constitution: 17,
        intelligence: 12,
        wisdom: 14,
        charisma: 11
      },
      personalityConfig: {
        traits: [
          { id: 'determination', intensity: 0.9 },
          { id: 'loyalty', intensity: 0.8 },
          { id: 'stubbornness', intensity: 0.7 }
        ]
      },
      consciousness: {
        frequency: 35,
        coherence: 0.9
      },
      racialTraits: new RacialTraits('dwarf', 'Mountain Dwarf')
    });

    const parent2 = new Character({
      id: 'mom',
      name: 'Dara Ironforge',
      age: 42,
      baseAttributes: {
        strength: 14,
        dexterity: 13,
        constitution: 16,
        intelligence: 15,
        wisdom: 17,
        charisma: 14
      },
      personalityConfig: {
        traits: [
          { id: 'wisdom', intensity: 0.8 },
          { id: 'craftsmanship', intensity: 0.9 },
          { id: 'patience', intensity: 0.7 }
        ]
      },
      consciousness: {
        frequency: 40,
        coherence: 0.8
      },
      racialTraits: new RacialTraits('dwarf', 'Hill Dwarf')
    });

    const settlement = {
      id: 'ironhold',
      name: 'Ironhold',
      culture: {
        language: 'dwarven',
        traditions: ['forge_blessing', 'clan_gathering'],
        values: { craftsmanship: 0.9, honor: 0.8, family: 0.9 }
      }
    };

    console.log(`Generating three children for ${parent1.name} & ${parent2.name}...\n`);

    // Generate multiple children
    const children = [];
    for (let i = 0; i < 3; i++) {
      const child = this.childGenerationService.generateChild(parent1, parent2, settlement);
      children.push(child);
      
      console.log(`Child ${i + 1}: ${child.name}`);
      console.log(`- Strength: ${child.baseAttributes.strength}, Constitution: ${child.baseAttributes.constitution}`);
      console.log(`- Key traits: ${child.personality.getAllTraits().slice(0, 3).map(t => `${t.id}(${t.intensity.toFixed(1)})`).join(', ')}`);
      console.log(`- Race: ${child.racialTraits._raceId}\n`);
    }

    return children;
  }

  /**
   * Example 3: Cross-racial parentage
   */
  async crossRacialExample() {
    console.log('\n=== Cross-Racial Parentage Example ===');

    const elfParent = new Character({
      id: 'elf_parent',
      name: 'Aelindra Starweaver',
      age: 150,
      baseAttributes: {
        strength: 10,
        dexterity: 17,
        constitution: 12,
        intelligence: 16,
        wisdom: 15,
        charisma: 14
      },
      personalityConfig: {
        traits: [
          { id: 'grace', intensity: 0.9 },
          { id: 'wisdom', intensity: 0.8 },
          { id: 'nature_affinity', intensity: 0.9 }
        ]
      },
      consciousness: {
        frequency: 50,
        coherence: 0.9
      },
      racialTraits: new RacialTraits('elf', 'Wood Elf')
    });

    const humanParent = new Character({
      id: 'human_parent',
      name: 'Gabriel Stormwind',
      age: 35,
      baseAttributes: {
        strength: 15,
        dexterity: 13,
        constitution: 16,
        intelligence: 14,
        wisdom: 12,
        charisma: 17
      },
      personalityConfig: {
        traits: [
          { id: 'ambition', intensity: 0.8 },
          { id: 'charisma', intensity: 0.9 },
          { id: 'adaptability', intensity: 0.8 }
        ]
      },
      consciousness: {
        frequency: 42,
        coherence: 0.7
      },
      racialTraits: new RacialTraits('human')
    });

    const settlement = {
      id: 'harmony_city',
      name: 'Harmony City',
      culture: {
        language: 'common',
        traditions: ['unity_festival', 'cultural_exchange'],
        values: { diversity: 0.9, tolerance: 0.8, progress: 0.7 }
      }
    };

    const child = this.childGenerationService.generateChild(elfParent, humanParent, settlement);

    console.log(`Cross-racial parents: ${elfParent.name} (${elfParent.racialTraits._raceId}) & ${humanParent.name} (${humanParent.racialTraits._raceId})`);
    console.log(`Child: ${child.name}`);
    console.log(`Inherited race: ${child.racialTraits._raceId} (${child.racialTraits._subraceId || 'no subrace'})`);
    
    console.log(`\nAttribute inheritance:`);
    console.log(`- Dexterity: ${child.baseAttributes.dexterity} (Elf parent: ${elfParent.baseAttributes.dexterity}, Human parent: ${humanParent.baseAttributes.dexterity})`);
    console.log(`- Charisma: ${child.baseAttributes.charisma} (Elf parent: ${elfParent.baseAttributes.charisma}, Human parent: ${humanParent.baseAttributes.charisma})`);
    
    console.log(`\nPersonality blend:`);
    child.personality.getAllTraits().forEach(trait => {
      console.log(`- ${trait.id}: ${trait.intensity.toFixed(2)}`);
    });

    return child;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🧬 Child Generation Service Examples 🧬');
    
    await this.basicChildGeneration();
    await this.multipleChildrenExample();
    await this.crossRacialExample();
    
    console.log('\n✨ All examples completed! ✨');
  }
}

// Export for use in other files
export default ChildGenerationExample;

// If running directly, execute examples
if (import.meta.url === `file://${process.argv[1]}`) {
  const example = new ChildGenerationExample();
  example.runAllExamples().catch(console.error);
}
