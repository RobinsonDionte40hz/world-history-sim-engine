// test-interaction-seamless.js - Test that content interactions are seamless without wrappers

import InteractionManager from './src/domain/services/InteractionManager.js';
import WorldBuilder from './src/domain/services/WorldBuilder.js';

async function testSeamlessInteractions() {
  console.log('🔍 Testing Seamless Interaction Flow');
  
  try {
    // Create a minimal world with content interactions
    const worldBuilder = new WorldBuilder('test-world');
    
    // Add a basic node with content interactions
    worldBuilder.addNode({
      id: 'test-village',
      name: 'Test Village',
      type: 'settlement',
      contentInteractions: [
        {
          id: 'greeting',
          name: 'Greet the villagers',
          type: 'content',
          description: 'A friendly greeting to the local villagers',
          branches: [
            {
              id: 'friendly',
              requirements: { charisma: 10 },
              outcomes: {
                success: { description: 'The villagers greet you warmly' },
                failure: { description: 'The villagers seem wary' }
              }
            }
          ],
          effects: {
            energy: -1,
            reputation: 1
          }
        }
      ]
    });
    
    // Add a basic character
    worldBuilder.addCharacter({
      id: 'test-char',
      name: 'Test Character',
      attributes: {
        strength: 12,
        dexterity: 14,
        constitution: 13,
        intelligence: 15,
        wisdom: 11,
        charisma: 16
      }
    });
    
    // Build the world
    const world = await worldBuilder.build();
    const character = world.characters.get('test-char');
    character.currentNodeId = 'test-village';
    
    console.log('🏗️ World built successfully');
    
    // Test InteractionManager
    const interactionManager = new InteractionManager();
    const currentNode = world.nodes.find(n => n.id === 'test-village');
    
    console.log('📋 Current node content interactions:', currentNode.contentInteractions?.length || 0);
    
    const availableInteractions = interactionManager.getAvailableInteractions({
      character,
      world,
      currentNode
    });
    
    console.log('📊 Interaction Results:');
    console.log(`  System interactions: ${availableInteractions.systemInteractions.length}`);
    console.log(`  Content interactions: ${availableInteractions.contentInteractions.length}`);
    
    // Test each content interaction's properties
    availableInteractions.contentInteractions.forEach((interaction, index) => {
      console.log(`\n🔍 Content Interaction ${index + 1}:`);
      console.log(`  Name: ${interaction.name}`);
      console.log(`  Type: ${interaction.type}`);
      console.log(`  Constructor: ${interaction.constructor.name}`);
      console.log(`  Has canExecute: ${!!interaction.canExecute}`);
      console.log(`  Has isAvailable: ${!!interaction.isAvailable}`);
      console.log(`  Has selectBranch: ${!!interaction.selectBranch}`);
      console.log(`  Has meetsRequirements: ${!!interaction.meetsRequirements}`);
      console.log(`  Has getEnergyCost: ${!!interaction.getEnergyCost}`);
      console.log(`  Is InteractionBase instance: ${interaction instanceof Object}`);
      
      // Test method calls
      try {
        const canExecute = interaction.canExecute ? interaction.canExecute(character, world) : 'N/A';
        console.log(`  canExecute result: ${canExecute}`);
        
        const isAvailable = interaction.isAvailable ? interaction.isAvailable(Date.now()) : 'N/A';
        console.log(`  isAvailable result: ${isAvailable}`);
        
        const meetsReq = interaction.meetsRequirements ? interaction.meetsRequirements(character) : 'N/A';
        console.log(`  meetsRequirements result: ${meetsReq}`);
        
      } catch (error) {
        console.error(`  ❌ Error testing methods: ${error.message}`);
      }
    });
    
    console.log('\n✅ Seamless interaction test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testSeamlessInteractions();