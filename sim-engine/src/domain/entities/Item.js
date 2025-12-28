// src/domain/entities/Item.js

import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Item domain entity representing equipment, consumables, quest items, and materials
 * Supports D&D-style equipment system with requirements, effects, and durability
 * Integrates with character inventory and interaction system
 */
class Item {
  constructor(config = {}) {
    // Basic properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Item';
    this.description = config.description || '';
    
    // Classification
    this.category = config.category || 'general'; // weapon, armor, consumable, quest, material, tool, accessory
    this.subtype = config.subtype || null; // longsword, healing_potion, quest_key, etc.
    this.rarity = config.rarity || 'common'; // common, uncommon, rare, epic, legendary, artifact
    
    // Physical properties
    this.weight = config.weight || 0; // In pounds
    this.value = config.value || 0; // Base value in gold
    this.stackable = config.stackable !== undefined ? config.stackable : true;
    this.maxStack = config.maxStack || (this.stackable ? 99 : 1);
    
    // Durability system
    this.durability = config.durability !== undefined ? config.durability : null;
    this.maxDurability = config.maxDurability || null;
    this.repairable = config.repairable !== undefined ? config.repairable : true;
    
    // Charges for consumables/magical items
    this.charges = config.charges || null;
    this.maxCharges = config.maxCharges || null;
    this.rechargeRate = config.rechargeRate || null; // Charges per rest/day
    
    // Equipment properties (for weapons, armor, tools)
    this.equipSlot = config.equipSlot || null; // mainHand, offHand, armor, accessory, tool
    this.twoHanded = config.twoHanded !== undefined ? config.twoHanded : false;
    this.equipped = config.equipped !== undefined ? config.equipped : false;
    
    // Combat properties (for weapons)
    this.damage = config.damage || null; // { dice: '1d8', type: 'slashing', bonus: 0 }
    this.range = config.range || null; // { min: 0, max: 30, type: 'melee' }
    this.properties = config.properties || []; // finesse, versatile, reach, thrown, etc.
    
    // Armor properties
    this.armorClass = config.armorClass || null; // Base AC or AC bonus
    this.armorType = config.armorType || null; // light, medium, heavy, shield
    
    // Effects (buffs, debuffs, special abilities)
    this.effects = config.effects || []; // Array of effect objects
    /*
      Effect structure:
      {
        type: 'attribute' | 'skill' | 'resistance' | 'ability' | 'special',
        target: 'strength' | 'dexterity' | etc.,
        operation: 'add' | 'multiply' | 'set',
        value: number | string,
        duration: null | number (turns),
        condition: null | string (when_equipped, on_use, etc.)
      }
    */
    
    // Requirements
    this.requirements = config.requirements || {};
    /*
      {
        level: number,
        attributes: { strength: 13, dexterity: 10 },
        skills: { athletics: 5 },
        race: ['elf', 'human'],
        class: ['warrior', 'rogue'],
        quests: ['quest_id_1']
      }
    */
    
    // Usage properties
    this.consumable = config.consumable !== undefined ? config.consumable : false;
    this.usable = config.usable !== undefined ? config.usable : false;
    this.questItem = config.questItem !== undefined ? config.questItem : false;
    this.tradeable = config.tradeable !== undefined ? config.tradeable : true;
    
    // Lore and flavor
    this.lore = config.lore || null; // Extended lore text
    this.flavorText = config.flavorText || null; // Flavor description
    this.tags = config.tags || []; // searchable tags
    
    // Crafting
    this.craftable = config.craftable !== undefined ? config.craftable : false;
    this.craftingRecipe = config.craftingRecipe || null;
    /*
      {
        materials: [{ itemId: 'iron_ore', quantity: 5 }],
        tools: ['smithing_hammer'],
        skill: { name: 'smithing', level: 10 },
        time: 240, // minutes
        experience: 50
      }
    */
    
    // Production system (NEW - for building-based production chains)
    this.production = config.production || null;
    /*
      {
        isProducible: true,
        producedBy: ['smithy', 'forge'], // Building types that can produce this
        productionTime: 2, // Turns required to produce
        recipe: {
          inputs: [
            { resourceType: 'iron-ore', quantity: 3 },
            { resourceType: 'wood', quantity: 1 }
          ],
          requiredSkill: 'smithing',
          skillLevel: 5,
          requiredTools: ['hammer', 'anvil'],
          workersRequired: 1,
          baseOutputQuantity: 1
        },
        byproducts: [ // Optional: items produced alongside main product
          { resourceType: 'slag', quantity: 1, chance: 0.5 }
        ],
        qualityFactors: { // What affects quality of output
          workerSkill: 0.6, // 60% from worker skill
          buildingLevel: 0.3, // 30% from building level
          toolQuality: 0.1 // 10% from tool quality
        }
      }
    */
    
    // Market system (NEW - for dynamic pricing)
    this.market = config.market || null;
    /*
      {
        resourceType: 'iron-sword', // Links to ResourceType system
        category: 'weapons', // ResourceCategory
        basePrice: 50,
        priceVolatility: 0.2, // How much price can fluctuate (0-1)
        demandFactors: ['military_focus', 'conflict', 'population_growth'],
        supplyFactors: ['iron_ore_availability', 'skilled_smiths'],
        demandElasticity: 0.8, // How demand responds to price changes
        luxuryGood: false, // Is this a luxury item?
        essentialGood: false, // Is this essential for survival?
        tradeGood: true // Can be traded between settlements
      }
    */
    
    // Origin and metadata
    this.origin = config.origin || null; // Template source
    this.author = config.author || null;
    this.version = config.version || '1.0.0';
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = config.updatedAt || new Date().toISOString();
    
    // Make the object immutable after construction (optional)
    // Object.freeze(this);
  }
  
  /**
   * Generate unique ID for items
   * @private
   */
  _generateId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if character meets requirements to use/equip this item
   * @param {Character} character - The character to check
   * @returns {Object} { canUse: boolean, reasons: string[] }
   */
  canBeUsedBy(character) {
    const reasons = [];
    
    if (!this.requirements || Object.keys(this.requirements).length === 0) {
      return { canUse: true, reasons: [] };
    }
    
    // Check level requirement
    if (this.requirements.level && character.level < this.requirements.level) {
      reasons.push(`Requires level ${this.requirements.level} (character is level ${character.level})`);
    }
    
    // Check attribute requirements
    if (this.requirements.attributes) {
      Object.entries(this.requirements.attributes).forEach(([attr, value]) => {
        const charValue = character.attributes?.[attr] || character.baseAttributes?.[attr] || 0;
        if (charValue < value) {
          reasons.push(`Requires ${attr} ${value} (character has ${charValue})`);
        }
      });
    }
    
    // Check skill requirements
    if (this.requirements.skills) {
      Object.entries(this.requirements.skills).forEach(([skill, value]) => {
        const charValue = character.skills?.[skill] || 0;
        if (charValue < value) {
          reasons.push(`Requires ${skill} ${value} (character has ${charValue})`);
        }
      });
    }
    
    // Check race requirement
    if (this.requirements.race && this.requirements.race.length > 0) {
      const charRace = character.racialTraits?.raceId || character.race || 'unknown';
      if (!this.requirements.race.includes(charRace)) {
        reasons.push(`Restricted to races: ${this.requirements.race.join(', ')}`);
      }
    }
    
    return {
      canUse: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Use/consume the item
   * @returns {Object} { success: boolean, effects: array, message: string }
   */
  use() {
    if (!this.usable && !this.consumable) {
      return {
        success: false,
        effects: [],
        message: 'This item cannot be used'
      };
    }
    
    if (this.charges !== null && this.charges <= 0) {
      return {
        success: false,
        effects: [],
        message: 'This item has no charges remaining'
      };
    }
    
    // Reduce charges if applicable
    if (this.charges !== null) {
      this.charges--;
    }
    
    // Get effects that trigger on use
    const useEffects = this.effects.filter(e => 
      !e.condition || e.condition === 'on_use'
    );
    
    return {
      success: true,
      effects: useEffects,
      message: `Used ${this.name}`,
      consumed: this.consumable
    };
  }
  
  /**
   * Equip the item (if it's equippable)
   * @returns {Object} { success: boolean, effects: array, message: string }
   */
  equip() {
    if (!this.equipSlot) {
      return {
        success: false,
        effects: [],
        message: 'This item cannot be equipped'
      };
    }
    
    if (this.durability !== null && this.durability <= 0) {
      return {
        success: false,
        effects: [],
        message: 'This item is broken and cannot be equipped'
      };
    }
    
    this.equipped = true;
    
    // Get effects that trigger when equipped
    const equipEffects = this.effects.filter(e => 
      !e.condition || e.condition === 'when_equipped'
    );
    
    return {
      success: true,
      effects: equipEffects,
      message: `Equipped ${this.name}`
    };
  }
  
  /**
   * Unequip the item
   * @returns {Object} { success: boolean, message: string }
   */
  unequip() {
    if (!this.equipped) {
      return {
        success: false,
        message: 'Item is not equipped'
      };
    }
    
    this.equipped = false;
    
    return {
      success: true,
      message: `Unequipped ${this.name}`
    };
  }
  
  /**
   * Repair the item
   * @param {number} amount - Amount to repair (null = full repair)
   * @returns {Object} { success: boolean, repaired: number, message: string }
   */
  repair(amount = null) {
    if (!this.repairable) {
      return {
        success: false,
        repaired: 0,
        message: 'This item cannot be repaired'
      };
    }
    
    if (this.durability === null || this.maxDurability === null) {
      return {
        success: false,
        repaired: 0,
        message: 'This item does not have durability'
      };
    }
    
    const oldDurability = this.durability;
    const repairAmount = amount === null 
      ? (this.maxDurability - this.durability)
      : Math.min(amount, this.maxDurability - this.durability);
    
    this.durability = Math.min(this.maxDurability, this.durability + repairAmount);
    
    return {
      success: true,
      repaired: this.durability - oldDurability,
      message: `Repaired ${this.name} by ${this.durability - oldDurability} durability`
    };
  }
  
  /**
   * Damage the item (reduce durability)
   * @param {number} amount - Damage amount
   * @returns {Object} { damaged: number, broken: boolean }
   */
  takeDamage(amount = 1) {
    if (this.durability === null) {
      return { damaged: 0, broken: false };
    }
    
    const oldDurability = this.durability;
    this.durability = Math.max(0, this.durability - amount);
    
    return {
      damaged: oldDurability - this.durability,
      broken: this.durability === 0
    };
  }
  
  /**
   * Recharge the item
   * @param {number} amount - Charges to add (null = recharge rate)
   * @returns {Object} { recharged: number, message: string }
   */
  recharge(amount = null) {
    if (this.charges === null || this.maxCharges === null) {
      return {
        recharged: 0,
        message: 'This item does not have charges'
      };
    }
    
    const oldCharges = this.charges;
    const rechargeAmount = amount === null ? (this.rechargeRate || 0) : amount;
    
    this.charges = Math.min(this.maxCharges, this.charges + rechargeAmount);
    
    return {
      recharged: this.charges - oldCharges,
      message: `Recharged ${this.name} by ${this.charges - oldCharges} charges`
    };
  }
  
  /**
   * Get active effects (when equipped or passive)
   * @returns {Array} Array of active effects
   */
  getActiveEffects() {
    if (!this.equipped) {
      return this.effects.filter(e => e.condition === 'passive');
    }
    
    return this.effects.filter(e => 
      !e.condition || 
      e.condition === 'when_equipped' || 
      e.condition === 'passive'
    );
  }
  
  /**
   * Check if item can be produced in buildings
   * @returns {boolean}
   */
  isProducible() {
    return this.production !== null && this.production.isProducible === true;
  }
  
  /**
   * Check if a building type can produce this item
   * @param {string} buildingType - The building type to check
   * @returns {boolean}
   */
  canBeProducedBy(buildingType) {
    if (!this.isProducible()) return false;
    return this.production.producedBy.includes(buildingType);
  }
  
  /**
   * Get production recipe
   * @returns {Object|null} Production recipe or null
   */
  getProductionRecipe() {
    return this.production?.recipe || null;
  }
  
  /**
   * Calculate production cost
   * @param {Object} resourcePrices - Map of resource types to prices
   * @returns {number} Total production cost
   */
  calculateProductionCost(resourcePrices = {}) {
    if (!this.isProducible()) return 0;
    
    let totalCost = 0;
    const recipe = this.getProductionRecipe();
    
    if (recipe && recipe.inputs) {
      recipe.inputs.forEach(input => {
        const price = resourcePrices[input.resourceType] || 0;
        totalCost += price * input.quantity;
      });
    }
    
    return totalCost;
  }
  
  /**
   * Calculate expected profit margin
   * @param {Object} resourcePrices - Map of resource types to prices
   * @returns {number} Profit margin (price - cost)
   */
  calculateProfitMargin(resourcePrices = {}) {
    const cost = this.calculateProductionCost(resourcePrices);
    const price = this.market?.basePrice || this.value;
    return price - cost;
  }
  
  /**
   * Check if item is profitable to produce
   * @param {Object} resourcePrices - Map of resource types to prices
   * @returns {boolean}
   */
  isProfitableToProduce(resourcePrices = {}) {
    return this.calculateProfitMargin(resourcePrices) > 0;
  }
  
  /**
   * Get market information
   * @returns {Object|null} Market data or null
   */
  getMarketInfo() {
    return this.market || null;
  }
  
  /**
   * Calculate current market price with modifiers
   * @param {Object} modifiers - Price modifiers from market conditions
   * @returns {number}
   */
  calculateMarketPrice(modifiers = {}) {
    if (!this.market) return this.value;
    
    let price = this.market.basePrice;
    
    // Apply demand modifiers
    if (modifiers.demandMultiplier) {
      price *= modifiers.demandMultiplier;
    }
    
    // Apply supply modifiers
    if (modifiers.supplyMultiplier) {
      price /= modifiers.supplyMultiplier;
    }
    
    // Apply volatility
    if (modifiers.applyVolatility && this.market.priceVolatility) {
      const variance = price * this.market.priceVolatility;
      const randomFactor = (Math.random() * 2 - 1) * variance;
      price += randomFactor;
    }
    
    return Math.max(1, Math.round(price)); // Minimum price of 1
  }
  
  /**
   * Clone the item
   * @returns {Item} New item instance with same properties
   */
  clone() {
    return new Item({
      ...this.toJSON(),
      id: this._generateId() // Generate new ID for clone
    });
  }
  
  /**
   * Validate item data
   * @returns {Object} { valid: boolean, errors: array }
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('Item name is required');
    }
    
    if (this.weight < 0) {
      errors.push('Weight cannot be negative');
    }
    
    if (this.value < 0) {
      errors.push('Value cannot be negative');
    }
    
    if (this.durability !== null && this.maxDurability !== null) {
      if (this.durability > this.maxDurability) {
        errors.push('Durability cannot exceed max durability');
      }
      if (this.durability < 0 || this.maxDurability < 0) {
        errors.push('Durability values must be non-negative');
      }
    }
    
    if (this.charges !== null && this.maxCharges !== null) {
      if (this.charges > this.maxCharges) {
        errors.push('Charges cannot exceed max charges');
      }
      if (this.charges < 0 || this.maxCharges < 0) {
        errors.push('Charge values must be non-negative');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      subtype: this.subtype,
      rarity: this.rarity,
      weight: this.weight,
      value: this.value,
      stackable: this.stackable,
      maxStack: this.maxStack,
      durability: this.durability,
      maxDurability: this.maxDurability,
      repairable: this.repairable,
      charges: this.charges,
      maxCharges: this.maxCharges,
      rechargeRate: this.rechargeRate,
      equipSlot: this.equipSlot,
      twoHanded: this.twoHanded,
      equipped: this.equipped,
      damage: this.damage,
      range: this.range,
      properties: [...this.properties],
      armorClass: this.armorClass,
      armorType: this.armorType,
      effects: this.effects.map(e => ({ ...e })),
      requirements: { ...this.requirements },
      consumable: this.consumable,
      usable: this.usable,
      questItem: this.questItem,
      tradeable: this.tradeable,
      lore: this.lore,
      flavorText: this.flavorText,
      tags: [...this.tags],
      craftable: this.craftable,
      craftingRecipe: this.craftingRecipe ? { ...this.craftingRecipe } : null,
      production: this.production ? { ...this.production } : null,
      market: this.market ? { ...this.market } : null,
      origin: this.origin,
      author: this.author,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create Item from JSON
   * @param {Object} data - JSON data
   * @returns {Item} Item instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid JSON data for Item');
    }
    
    return new Item(data);
  }
}

export default Item;
