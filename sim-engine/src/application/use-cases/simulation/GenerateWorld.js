// src/application/use-cases/simulation/GenerateWorld.js

import Character from '../../../domain/entities/Character.js';
import Interaction from '../../../domain/entities/Interaction.js';
import Position from '../../../domain/value-objects/Positions.js';

// Utility function to generate UUID with fallback for test environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for test environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// Generate sample interactions for nodes
const generateNodeInteractions = () => [
  new Interaction({
    name: 'Trade Goods',
    type: 'dialogue',
    requirements: [{ attr: 'charisma', min: 10 }],
    branches: [{ id: 'success', text: 'Deal made', effects: [{ type: 'influence', value: 5 }] }],
  }),
  new Interaction({
    name: 'Gather Resources',
    type: 'action',
    requirements: [{ attr: 'strength', min: 12 }],
    branches: [{ id: 'success', text: 'Resources gathered', effects: [{ type: 'resource', value: 10, target: 'food' }] }],
  }),
];

// Generate characters from world builder data or templates
const generateCharactersFromWorldData = (worldBuilderData, numCharacters = 5) => {
  console.log('generateCharactersFromWorldData: Creating characters from world builder data:', {
    hasCharacters: !!worldBuilderData?.characters,
    numCharacters: worldBuilderData?.characters?.length || 0,
    hasTemplates: !!worldBuilderData?.characterTemplates,
    numTemplates: worldBuilderData?.characterTemplates?.length || 0,
    requestedCount: numCharacters
  });
  
  const characters = [];
  
  // Use user-created characters first
  if (worldBuilderData?.characters && worldBuilderData.characters.length > 0) {
    console.log('generateCharactersFromWorldData: Using user-created characters');
    for (const userCharacter of worldBuilderData.characters) {
      try {
        // Convert from world builder character format to simulation character
        const character = new Character({
          id: userCharacter.id || generateId(),
          name: userCharacter.name || 'Unnamed Character',
          type: userCharacter.type || 'npc',
          attributes: {
            strength: { score: userCharacter.attributes?.strength || 10 },
            dexterity: { score: userCharacter.attributes?.dexterity || 10 },
            constitution: { score: userCharacter.attributes?.constitution || 10 },
            intelligence: { score: userCharacter.attributes?.intelligence || 10 },
            wisdom: { score: userCharacter.attributes?.wisdom || 10 },
            charisma: { score: userCharacter.attributes?.charisma || 10 }
          },
          personality: userCharacter.personality || { aggression: 0.3, curiosity: 0.7 },
          consciousness: userCharacter.consciousness || {
            frequency: 40,
            coherence: 0.7
          },
          goals: userCharacter.goals || [{ id: 'survive', progress: 0 }],
          energy: 100,
          health: 100,
          mood: 80,
          location: userCharacter.location
        });
        
        characters.push(character);
        console.log(`generateCharactersFromWorldData: Added user-created character: ${character.name}`);
      } catch (error) {
        console.error('generateCharactersFromWorldData: Error creating character from user data:', error, userCharacter);
      }
    }
  }
  
  // If we need more characters and have templates, use them
  if (characters.length < numCharacters && worldBuilderData?.characterTemplates && worldBuilderData.characterTemplates.length > 0) {
    console.log('generateCharactersFromWorldData: Supplementing with template-based characters');
    const remainingCount = numCharacters - characters.length;
    
    for (let i = 0; i < remainingCount && i < worldBuilderData.characterTemplates.length; i++) {
      const template = worldBuilderData.characterTemplates[i];
      try {
        // Instantiate character from template
        const character = new Character({
          id: generateId(),
          name: template.name || `Template Character ${i + 1}`,
          type: template.type || 'npc',
          attributes: {
            strength: { score: template.attributes?.strength || 10 },
            dexterity: { score: template.attributes?.dexterity || 10 },
            constitution: { score: template.attributes?.constitution || 10 },
            intelligence: { score: template.attributes?.intelligence || 10 },
            wisdom: { score: template.attributes?.wisdom || 10 },
            charisma: { score: template.attributes?.charisma || 10 }
          },
          personality: template.personality || { aggression: 0.3, curiosity: 0.7 },
          consciousness: template.consciousness || {
            frequency: 40,
            coherence: 0.7
          },
          goals: template.goals || [{ id: 'survive', progress: 0 }],
          energy: 100,
          health: 100,
          mood: 80,
          location: template.location
        });
        
        characters.push(character);
        console.log(`generateCharactersFromWorldData: Added template-based character: ${character.name}`);
      } catch (error) {
        console.error('generateCharactersFromWorldData: Error creating character from template:', error, template);
      }
    }
  }
  
  // Only create fallback characters if we have none at all
  if (characters.length === 0) {
    console.warn('generateCharactersFromWorldData: No user characters or templates found, creating minimal fallback');
    const fallbackCharacter = new Character({
      id: generateId(),
      name: 'Default Villager',
      consciousness: {
        frequency: 40,
        coherence: 0.5
      },
      personality: { aggression: 0.2, curiosity: 0.5 },
      attributes: {
        strength: { score: 10 },
        dexterity: { score: 10 },
        constitution: { score: 10 },
        intelligence: { score: 10 },
        wisdom: { score: 10 },
        charisma: { score: 10 }
      },
      goals: [{ id: 'survive', progress: 0 }],
      energy: 100,
      health: 100,
      mood: 80
    });
    
    characters.push(fallbackCharacter);
    console.log('generateCharactersFromWorldData: Created fallback character');
  }
  
  console.log(`generateCharactersFromWorldData: Generated ${characters.length} characters total`);
  return characters;
};

const generateWorld = (config = {}, worldData = null) => {
  const {
    size = { width: 10, height: 10 },
    nodeCount = 5,
    characterCount = 10,
    resourceTypes = ['food', 'wood'],
  } = config;

  // Initialize world state
  const worldState = {
    time: 0,
    nodes: [],
    npcs: [],
    resources: {},
  };

  // Generate nodes (reused from old Node Types)
  for (let i = 0; i < nodeCount; i++) {
    const node = {
      id: generateId(),
      name: `Node ${i + 1} - ${['Village', 'Forest', 'Hill'][i % 3]}`,
      position: new Position({
        x: Math.floor(Math.random() * size.width),
        y: Math.floor(Math.random() * size.height),
      }),
      interactions: generateNodeInteractions(),
      population: Math.floor(Math.random() * 1000) + 100, // Random population 100-1100
    };
    worldState.nodes.push(node);
  }

  // Generate characters from world builder data or use fallback
  const characters = generateCharactersFromWorldData(worldData, characterCount);
  characters.forEach(character => {
    // Assign to random node if no location specified
    const targetNodeId = character.location || worldState.nodes[Math.floor(Math.random() * nodeCount)].id;
    character.currentNodeId = targetNodeId;
    worldState.npcs.push(character);
  });

  // Initialize resources (simple distribution)
  resourceTypes.forEach(resource => {
    worldState.resources[resource] = Math.floor(Math.random() * 100);
  });

  return worldState;
};

export default generateWorld;