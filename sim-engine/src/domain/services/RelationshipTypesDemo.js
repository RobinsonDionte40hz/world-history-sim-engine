/**
 * Enhanced Relationship Types Usage Examples
 *
 * Demonstrates the new sophisticated relationship classification system
 * with romantic, family, professional, and mentorship relationships.
 */

import MemoryService from '../domain/services/MemoryService.js';

// Create memory service instance
const memoryService = new MemoryService();

// Example characters
const alice = {
  id: 'alice',
  name: 'Alice',
  relationships: new Map(),
  consciousness: { frequency: 40, coherence: 0.7 }
};

const bob = {
  id: 'bob',
  name: 'Bob',
  relationships: new Map(),
  consciousness: { frequency: 40, coherence: 0.7 }
};

console.log('=== Enhanced Relationship Types Demo ===\n');

/**
 * Example 1: Romantic Relationship Progression
 */
console.log('1. ROMANTIC RELATIONSHIP PROGRESSION');
console.log('-----------------------------------');

// Start with basic positive interactions
memoryService.updateRelationship(alice, bob.id, 'positive');
console.log(`After first positive interaction: ${alice.relationships.get(bob.id).type}`);

// Add romantic context to history
const aliceBobRelationship = alice.relationships.get(bob.id);
aliceBobRelationship.history.push(
  { timestamp: Date.now(), change: 5, reason: 'romantic dinner date' },
  { timestamp: Date.now(), change: 8, reason: 'courtship interaction' }
);

// Now the relationship type changes based on romantic context
aliceBobRelationship.type = memoryService.calculateRelationshipType(
  aliceBobRelationship.value,
  aliceBobRelationship.history
);
console.log(`After romantic context: ${aliceBobRelationship.type}`);

// Continue building the relationship
for (let i = 0; i < 5; i++) {
  memoryService.updateRelationship(alice, bob.id, 'positive');
}
aliceBobRelationship.type = memoryService.calculateRelationshipType(
  aliceBobRelationship.value,
  aliceBobRelationship.history
);
console.log(`After more positive interactions: ${aliceBobRelationship.type}`);
console.log(`Current bond value: ${aliceBobRelationship.value}\n`);

/**
 * Example 2: Family Relationships
 */
console.log('2. FAMILY RELATIONSHIPS');
console.log('----------------------');

const charlie = {
  id: 'charlie',
  name: 'Charlie',
  relationships: new Map(),
  consciousness: { frequency: 40, coherence: 0.7 }
};

// Start with family context
memoryService.updateRelationship(alice, charlie.id, 'positive');
const aliceCharlieRelationship = alice.relationships.get(charlie.id);
aliceCharlieRelationship.history.push(
  { timestamp: Date.now(), change: 10, reason: 'family gathering' },
  { timestamp: Date.now(), change: 5, reason: 'parent-child interaction' }
);

aliceCharlieRelationship.type = memoryService.calculateRelationshipType(
  aliceCharlieRelationship.value,
  aliceCharlieRelationship.history
);
console.log(`Family relationship: ${aliceCharlieRelationship.type}`);

// Even with lower bond values, family relationships maintain positive classification
aliceCharlieRelationship.value = 15; // Lower bond
aliceCharlieRelationship.type = memoryService.calculateRelationshipType(
  aliceCharlieRelationship.value,
  aliceCharlieRelationship.history
);
console.log(`Family relationship (lower bond): ${aliceCharlieRelationship.type}\n`);

/**
 * Example 3: Professional Relationships
 */
console.log('3. PROFESSIONAL RELATIONSHIPS');
console.log('----------------------------');

const david = {
  id: 'david',
  name: 'David',
  relationships: new Map(),
  consciousness: { frequency: 40, coherence: 0.7 }
};

// Business interactions
memoryService.updateRelationship(alice, david.id, 'positive');
const aliceDavidRelationship = alice.relationships.get(david.id);
aliceDavidRelationship.history.push(
  { timestamp: Date.now(), change: 12, reason: 'business trade' },
  { timestamp: Date.now(), change: 8, reason: 'professional meeting' }
);

aliceDavidRelationship.type = memoryService.calculateRelationshipType(
  aliceDavidRelationship.value,
  aliceDavidRelationship.history
);
console.log(`Professional relationship: ${aliceDavidRelationship.type}`);

// Build trust over time
for (let i = 0; i < 3; i++) {
  memoryService.updateRelationship(alice, david.id, 'positive');
}
aliceDavidRelationship.type = memoryService.calculateRelationshipType(
  aliceDavidRelationship.value,
  aliceDavidRelationship.history
);
console.log(`Trusted professional relationship: ${aliceDavidRelationship.type}\n`);

/**
 * Example 4: Mentorship Relationships
 */
console.log('4. MENTORSHIP RELATIONSHIPS');
console.log('--------------------------');

const eve = {
  id: 'eve',
  name: 'Eve',
  relationships: new Map(),
  consciousness: { frequency: 40, coherence: 0.7 }
};

// Teaching/learning interactions
memoryService.updateRelationship(alice, eve.id, 'positive');
const aliceEveRelationship = alice.relationships.get(eve.id);
aliceEveRelationship.history.push(
  { timestamp: Date.now(), change: 15, reason: 'teaching apprentice' },
  { timestamp: Date.now(), change: 10, reason: 'learning from master' }
);

aliceEveRelationship.type = memoryService.calculateRelationshipType(
  aliceEveRelationship.value,
  aliceEveRelationship.history
);
console.log(`Mentorship relationship: ${aliceEveRelationship.type}`);

// Strong mentorship bond
aliceEveRelationship.value = 75;
aliceEveRelationship.type = memoryService.calculateRelationshipType(
  aliceEveRelationship.value,
  aliceEveRelationship.history
);
console.log(`Strong mentorship relationship: ${aliceEveRelationship.type}\n`);

/**
 * Example 5: Relationship Type Detection Methods
 */
console.log('5. RELATIONSHIP TYPE DETECTION');
console.log('------------------------------');

console.log('Romantic detection:');
console.log(`  "romantic dinner date" -> ${memoryService.hasRomanticCompatibility([{ reason: 'romantic dinner date' }])}`);
console.log(`  "casual conversation" -> ${memoryService.hasRomanticCompatibility([{ reason: 'casual conversation' }])}`);

console.log('\nFamily detection:');
console.log(`  "family gathering" -> ${memoryService.isFamilyRelationship([{ reason: 'family gathering' }])}`);
console.log(`  "casual conversation" -> ${memoryService.isFamilyRelationship([{ reason: 'casual conversation' }])}`);

console.log('\nProfessional detection:');
console.log(`  "business trade" -> ${memoryService.isProfessionalRelationship([{ reason: 'business trade' }])}`);
console.log(`  "casual conversation" -> ${memoryService.isProfessionalRelationship([{ reason: 'casual conversation' }])}`);

console.log('\nMentorship detection:');
console.log(`  "teaching apprentice" -> ${memoryService.isMentorshipRelationship([{ reason: 'teaching apprentice' }])}`);
console.log(`  "casual conversation" -> ${memoryService.isMentorshipRelationship([{ reason: 'casual conversation' }])}`);

/**
 * Example 6: Complete Relationship Summary
 */
console.log('\n6. COMPLETE RELATIONSHIP SUMMARY');
console.log('--------------------------------');

const allRelationships = [
  { character: bob, name: 'Bob', context: 'romantic' },
  { character: charlie, name: 'Charlie', context: 'family' },
  { character: david, name: 'David', context: 'professional' },
  { character: eve, name: 'Eve', context: 'mentorship' }
];

allRelationships.forEach(({ character, name, context }) => {
  const relationship = alice.relationships.get(character.id);
  if (relationship) {
    console.log(`${name} (${context}): ${relationship.type} (bond: ${relationship.value})`);
  }
});

console.log('\n=== Enhanced Relationship System Ready! ===');
console.log('Now supports: Romantic, Family, Professional, and Mentorship relationships');
console.log('Each with nuanced progression based on interaction history and bond strength.');
