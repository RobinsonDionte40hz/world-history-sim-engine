// src/domain/entities/Attributes.js

class Attributes {
  constructor(config = {}) {
    // Core D&D attributes (reused from old project's flexible Record approach)
    this.strength = {
      score: config.strength?.score || 10,
      modifier: config.strength?.modifier || Math.floor((config.strength?.score || 10 - 10) / 2),
      racialBonus: config.strength?.racialBonus || 0,
      temporaryModifiers: config.strength?.temporaryModifiers || [],
    };
    this.dexterity = {
      score: config.dexterity?.score || 10,
      modifier: config.dexterity?.modifier || Math.floor((config.dexterity?.score || 10 - 10) / 2),
      racialBonus: config.dexterity?.racialBonus || 0,
      temporaryModifiers: config.dexterity?.temporaryModifiers || [],
    };
    this.constitution = {
      score: config.constitution?.score || 10,
      modifier: config.constitution?.modifier || Math.floor((config.constitution?.score || 10 - 10) / 2),
      racialBonus: config.constitution?.racialBonus || 0,
      temporaryModifiers: config.constitution?.temporaryModifiers || [],
    };
    this.intelligence = {
      score: config.intelligence?.score || 10,
      modifier: config.intelligence?.modifier || Math.floor((config.intelligence?.score || 10 - 10) / 2),
      racialBonus: config.intelligence?.racialBonus || 0,
      temporaryModifiers: config.intelligence?.temporaryModifiers || [],
    };
    this.wisdom = {
      score: config.wisdom?.score || 10,
      modifier: config.wisdom?.modifier || Math.floor((config.wisdom?.score || 10 - 10) / 2),
      racialBonus: config.wisdom?.racialBonus || 0,
      temporaryModifiers: config.wisdom?.temporaryModifiers || [],
    };
    this.charisma = {
      score: config.charisma?.score || 10,
      modifier: config.charisma?.modifier || Math.floor((config.charisma?.score || 10 - 10) / 2),
      racialBonus: config.charisma?.racialBonus || 0,
      temporaryModifiers: config.charisma?.temporaryModifiers || [],
    };

    // Freeze to enforce immutability (value object principle)
    Object.freeze(this);
  }

  // Compute total modifier (including temporary mods, e.g., from effects)
  getTotalModifier(attrName) {
    const attr = this[attrName.toLowerCase()];
    if (!attr) return 0;
    const tempMod = attr.temporaryModifiers.reduce((sum, mod) => sum + mod.value, 0);
    return attr.modifier + attr.racialBonus + tempMod;
  }

  // Quantum-inspired method: Proxy energy state for resonance eq (E1 in R(E1,E2,t))
  getEnergyProxy() {
    // Average of INT and WIS as cognitive "energy" (inspired by papers' microtubule energy)
    const intMod = this.getTotalModifier('intelligence');
    const wisMod = this.getTotalModifier('wisdom');
    return (intMod + wisMod) / 2 + 10;  // Base 10 + modifiers for scale
  }

  // Serialize for persistence (match old JSON format)
  toJSON() {
    return {
      strength: { ...this.strength },
      dexterity: { ...this.dexterity },
      constitution: { ...this.constitution },
      intelligence: { ...this.intelligence },
      wisdom: { ...this.wisdom },
      charisma: { ...this.charisma },
    };
  }
}

export default Attributes;