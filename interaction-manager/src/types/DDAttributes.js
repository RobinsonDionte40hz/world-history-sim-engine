// D&D style attributes type definition
export const DDAttributes = {
  strength: Number,
  dexterity: Number,
  constitution: Number,
  intelligence: Number,
  wisdom: Number,
  charisma: Number
};

// D&D style skills mapped to their governing attributes
export const DDSkills = {
  // Strength-based skills
  athletics: { attribute: 'strength', weight: 1 },
  
  // Dexterity-based skills
  acrobatics: { attribute: 'dexterity', weight: 1 },
  sleightOfHand: { attribute: 'dexterity', weight: 1 },
  stealth: { attribute: 'dexterity', weight: 1 },
  
  // Intelligence-based skills
  arcana: { attribute: 'intelligence', weight: 1 },
  history: { attribute: 'intelligence', weight: 1 },
  investigation: { attribute: 'intelligence', weight: 1 },
  nature: { attribute: 'intelligence', weight: 1 },
  religion: { attribute: 'intelligence', weight: 1 },
  
  // Wisdom-based skills
  animalHandling: { attribute: 'wisdom', weight: 1 },
  insight: { attribute: 'wisdom', weight: 1 },
  medicine: { attribute: 'wisdom', weight: 1 },
  perception: { attribute: 'wisdom', weight: 1 },
  survival: { attribute: 'wisdom', weight: 1 },
  
  // Charisma-based skills
  deception: { attribute: 'charisma', weight: 1 },
  intimidation: { attribute: 'charisma', weight: 1 },
  performance: { attribute: 'charisma', weight: 1 },
  persuasion: { attribute: 'charisma', weight: 1 }
}; 