/**
 * OriginTemplates - Pre-built origin templates
 * 
 * Common character origins for quick setup
 */

import Origin from '../entities/Origin.js';

const OriginTemplates = {
  /**
   * Noble's Child - Born into privilege
   */
  noblesChild: new Origin({
    name: "Noble's Child",
    description: "Born into a wealthy noble family with political connections and education",
    category: 'noble',
    startAge: 0,
    playableAge: 16,
    difficulty: 'easy',
    tags: ['noble', 'privileged', 'educated', 'political'],
    initialAttributes: {
      strength: 9,
      dexterity: 10,
      constitution: 10,
      intelligence: 13,
      wisdom: 11,
      charisma: 12
    },
    initialSkills: {
      etiquette: 15,
      reading: 20,
      persuasion: 12,
      history: 10
    },
    initialInventory: [
      { id: 'fine_clothes', name: 'Fine Clothes', type: 'clothing' },
      { id: 'signet_ring', name: 'Family Signet Ring', type: 'jewelry' },
      { id: 'coin_purse', name: 'Gold Coins', type: 'currency', amount: 100 }
    ],
    personalityModifiers: {
      confidence: 0.2,
      ambition: 0.3,
      empathy: -0.1
    },
    backstoryEvents: [
      { age: 0, type: 'birth', description: 'Born in the family castle', isSignificant: true, effects: {} },
      { age: 5, type: 'education', description: 'Private tutors begin your education', isSignificant: false, effects: { intelligence: +1 } },
      { age: 10, type: 'social', description: 'First royal ball - you meet influential nobles', isSignificant: true, effects: { charisma: +1 } },
      { age: 14, type: 'training', description: 'Fencing lessons with the master-at-arms', isSignificant: false, effects: { dexterity: +1 } },
      { age: 16, type: 'comingOfAge', description: 'Your coming-of-age ceremony - society awaits your debut', isSignificant: true, effects: {} }
    ],
    backstorySpeed: 8.0,
    metadata: { isTemplate: true, author: 'system' }
  }),

  /**
   * Orphan - Started with nothing
   */
  orphan: new Origin({
    name: 'Orphan',
    description: 'Lost your parents young and grew up on the streets, learning to survive',
    category: 'commoner',
    startAge: 0,
    playableAge: 16,
    difficulty: 'hard',
    tags: ['orphan', 'survivor', 'streetwise', 'independent'],
    initialAttributes: {
      strength: 11,
      dexterity: 13,
      constitution: 12,
      intelligence: 10,
      wisdom: 11,
      charisma: 9
    },
    initialSkills: {
      stealth: 15,
      survival: 18,
      lockpicking: 10,
      streetwise: 20
    },
    initialInventory: [
      { id: 'worn_clothes', name: 'Worn Clothes', type: 'clothing' },
      { id: 'rusty_dagger', name: 'Rusty Dagger', type: 'weapon' },
      { id: 'coin_purse', name: 'Copper Coins', type: 'currency', amount: 5 }
    ],
    personalityModifiers: {
      resilience: 0.3,
      trust: -0.2,
      independence: 0.3
    },
    backstoryEvents: [
      { age: 0, type: 'birth', description: 'Born in a poor district', isSignificant: false, effects: {} },
      { age: 3, type: 'tragedy', description: 'Your parents die in a plague', isSignificant: true, effects: {} },
      { age: 5, type: 'survival', description: 'Joined a street gang for protection', isSignificant: false, effects: { wisdom: +1 } },
      { age: 10, type: 'training', description: 'An old thief teaches you to pick locks', isSignificant: true, effects: { dexterity: +1 } },
      { age: 12, type: 'conflict', description: 'Gang war forces you to leave the city', isSignificant: false, effects: {} },
      { age: 15, type: 'mentor', description: 'A wandering monk takes you in', isSignificant: true, effects: { wisdom: +2 } },
      { age: 16, type: 'independence', description: 'You strike out on your own', isSignificant: true, effects: {} }
    ],
    backstorySpeed: 5.0,
    metadata: { isTemplate: true, author: 'system' }
  }),

  /**
   * Veteran Warrior - Battle-hardened soldier
   */
  veteranWarrior: new Origin({
    name: 'Veteran Warrior',
    description: 'A seasoned soldier who has seen countless battles',
    category: 'warrior',
    startAge: 0,
    playableAge: 35,
    difficulty: 'normal',
    tags: ['warrior', 'veteran', 'military', 'combat'],
    initialAttributes: {
      strength: 15,
      dexterity: 13,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 9
    },
    initialSkills: {
      swordsmanship: 25,
      tactics: 20,
      endurance: 22,
      leadership: 15
    },
    initialInventory: [
      { id: 'battle_worn_armor', name: 'Battle-Worn Armor', type: 'armor' },
      { id: 'veteran_sword', name: 'Veteran\'s Longsword', type: 'weapon' },
      { id: 'war_horn', name: 'War Horn', type: 'tool' }
    ],
    personalityModifiers: {
      courage: 0.3,
      discipline: 0.3,
      compassion: -0.1
    },
    backstoryEvents: [
      { age: 0, type: 'birth', description: 'Born in a military camp', isSignificant: false, effects: {} },
      { age: 16, type: 'training', description: 'Enlisted in the army', isSignificant: true, effects: {} },
      { age: 18, type: 'combat', description: 'First major battle - you survive', isSignificant: true, effects: { strength: +1, constitution: +1 } },
      { age: 22, type: 'promotion', description: 'Promoted to squad leader', isSignificant: false, effects: { wisdom: +1 } },
      { age: 28, type: 'tragedy', description: 'Lost your unit in a disastrous siege', isSignificant: true, effects: {} },
      { age: 30, type: 'recovery', description: 'Recovered from wounds, harder than before', isSignificant: false, effects: { constitution: +2 } },
      { age: 35, type: 'retirement', description: 'Discharged from service - seeking new purpose', isSignificant: true, effects: {} }
    ],
    backstorySpeed: 20.0,
    metadata: { isTemplate: true, author: 'system' }
  }),

  /**
   * Scholar's Apprentice - Devoted to knowledge
   */
  scholarsApprentice: new Origin({
    name: "Scholar's Apprentice",
    description: 'Raised in a library, devoted to learning and uncovering ancient secrets',
    category: 'scholar',
    startAge: 0,
    playableAge: 20,
    difficulty: 'normal',
    tags: ['scholar', 'intelligent', 'curious', 'bookish'],
    initialAttributes: {
      strength: 8,
      dexterity: 9,
      constitution: 9,
      intelligence: 16,
      wisdom: 14,
      charisma: 10
    },
    initialSkills: {
      reading: 25,
      research: 22,
      history: 20,
      arcana: 18,
      languages: 15
    },
    initialInventory: [
      { id: 'scholars_robes', name: "Scholar's Robes", type: 'clothing' },
      { id: 'ancient_tome', name: 'Ancient Tome', type: 'book' },
      { id: 'quill_and_ink', name: 'Quill and Ink', type: 'tool' }
    ],
    personalityModifiers: {
      curiosity: 0.4,
      patience: 0.2,
      physical_courage: -0.2
    },
    backstoryEvents: [
      { age: 0, type: 'birth', description: 'Born to a librarian family', isSignificant: false, effects: {} },
      { age: 5, type: 'education', description: 'Began reading at an extraordinary age', isSignificant: true, effects: { intelligence: +2 } },
      { age: 10, type: 'discovery', description: 'Found a hidden chamber in the archives', isSignificant: true, effects: {} },
      { age: 15, type: 'apprenticeship', description: 'Became apprentice to the Head Librarian', isSignificant: false, effects: { wisdom: +1 } },
      { age: 18, type: 'discovery', description: 'Decoded an ancient text - revealing lost knowledge', isSignificant: true, effects: { intelligence: +1 } },
      { age: 20, type: 'graduation', description: 'Completed your studies - ready to explore the world', isSignificant: true, effects: {} }
    ],
    backstorySpeed: 10.0,
    metadata: { isTemplate: true, author: 'system' }
  }),

  /**
   * Time Traveler - From another era
   */
  timeTraveler: new Origin({
    name: 'Time Traveler',
    description: 'Displaced from another time, struggling to adapt to a new era',
    category: 'special',
    startAge: 25,
    playableAge: 25,
    difficulty: 'expert',
    tags: ['time_traveler', 'displaced', 'mysterious', 'otherworldly'],
    initialAttributes: {
      strength: 10,
      dexterity: 11,
      constitution: 10,
      intelligence: 14,
      wisdom: 13,
      charisma: 10
    },
    initialSkills: {
      temporal_knowledge: 20,
      adaptation: 15,
      history: 25,
      paradox_resolution: 10
    },
    initialInventory: [
      { id: 'anachronistic_device', name: 'Anachronistic Device', type: 'artifact' },
      { id: 'temporal_journal', name: 'Temporal Journal', type: 'book' }
    ],
    personalityModifiers: {
      confusion: 0.3,
      adaptability: 0.4,
      nostalgia: 0.2
    },
    backstoryEvents: [
      { age: 25, type: 'displacement', description: 'You wake up in a different time', isSignificant: true, effects: {} }
    ],
    backstorySpeed: 1.0,
    metadata: { isTemplate: true, author: 'system' }
  })
};

export default OriginTemplates;
