// Debug script to check if content interactions are properly instantiated
console.log('🔍 Testing content interaction instantiation...');

// Test the InteractionFactory conversion
const testInteraction = {
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
};

// Mock InteractionFactory test
console.log('📋 Original interaction:', {
  name: testInteraction.name,
  hasCanExecute: !!testInteraction.canExecute,
  hasIsAvailable: !!testInteraction.isAvailable,
  constructor: testInteraction.constructor.name
});

console.log('✅ Ready to test with proper InteractionFactory conversion');