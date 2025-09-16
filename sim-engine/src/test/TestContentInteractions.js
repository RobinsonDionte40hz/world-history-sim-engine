// Simple test to validate content interactions are working properly

import React, { useEffect, useState } from 'react';
import GenerateBehavior from '../application/use-cases/npc/GenerateBehavior.js';
import Character from '../domain/entities/Character.js';
import InteractionManager from '../domain/services/InteractionManager.js';

const TestContentInteractions = () => {
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    runTest();
  }, []);

  const runTest = async () => {
    const results = [];
    
    try {
      // Create a simple test world state
      const worldState = {
        time: Date.now(),
        nodes: [
          {
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
          }
        ],
        characters: new Map()
      };

      // Create a test character
      const character = new Character({
        id: 'test-char',
        name: 'Test Character',
        energy: 100,
        maxEnergy: 100,
        attributes: {
          strength: 12,
          dexterity: 14,
          constitution: 13,
          intelligence: 15,
          wisdom: 11,
          charisma: 16
        }
      });
      character.currentNodeId = 'test-village';

      results.push('✅ Created test character and world');

      // Test InteractionManager
      const interactionManager = new InteractionManager();
      const currentNode = worldState.nodes[0];
      
      const availableInteractions = interactionManager.getAvailableInteractions({
        character,
        world: worldState,
        currentNode
      });

      results.push(`📊 System interactions: ${availableInteractions.systemInteractions.length}`);
      results.push(`📊 Content interactions: ${availableInteractions.contentInteractions.length}`);

      // Test each content interaction
      availableInteractions.contentInteractions.forEach((interaction, index) => {
        results.push(`🔍 Content Interaction ${index + 1}: ${interaction.name}`);
        results.push(`  Constructor: ${interaction.constructor.name}`);
        results.push(`  Has required methods: canExecute=${!!interaction.canExecute}, isAvailable=${!!interaction.isAvailable}, selectBranch=${!!interaction.selectBranch}`);
        
        try {
          if (interaction.canExecute) {
            const canExecuteResult = interaction.canExecute(character, worldState);
            results.push(`  canExecute result: ${canExecuteResult}`);
          }
          
          if (interaction.isAvailable) {
            const isAvailableResult = interaction.isAvailable(Date.now());
            results.push(`  isAvailable result: ${isAvailableResult}`);
          }
        } catch (error) {
          results.push(`  ❌ Error testing methods: ${error.message}`);
        }
      });

      // Test GenerateBehavior
      try {
        const behaviorResult = GenerateBehavior(character, worldState);
        if (behaviorResult) {
          results.push(`✅ GenerateBehavior executed successfully`);
          results.push(`  Selected interaction: ${behaviorResult.interaction?.name || 'unknown'}`);
          results.push(`  Resolution: ${behaviorResult.resolution?.outcome || 'unknown'}`);
        } else {
          results.push(`⚠️  GenerateBehavior returned null`);
        }
      } catch (error) {
        results.push(`❌ GenerateBehavior failed: ${error.message}`);
      }

      results.push('✅ Test completed successfully!');

    } catch (error) {
      results.push(`❌ Test failed: ${error.message}`);
      console.error('Test error:', error);
    }

    setTestResults(results);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Content Interaction Seamless Test</h3>
      <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestContentInteractions;