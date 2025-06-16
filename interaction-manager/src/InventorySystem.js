import ItemSystem from './ItemSystem.js';

class InventorySlot {
  constructor(item = null, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
    this.equipped = false;
    this.locked = false; // For quest items or special items
  }

  canStack(item) {
    return this.item && 
           this.item.id === item.id && 
           this.item.stackable && 
           this.quantity < this.item.maxStack;
  }

  addQuantity(amount) {
    const maxAdd = this.item.maxStack - this.quantity;
    const actualAdd = Math.min(amount, maxAdd);
    this.quantity += actualAdd;
    return amount - actualAdd; // Return remaining
  }

  removeQuantity(amount) {
    const actualRemove = Math.min(amount, this.quantity);
    this.quantity -= actualRemove;
    return actualRemove;
  }

  getTotalWeight() {
    return this.item ? this.item.weight * this.quantity : 0;
  }

  getTotalValue() {
    return this.item ? this.item.value * this.quantity : 0;
  }
}

class Inventory {
  constructor(config = {}) {
    this.owner = config.owner || null;
    this.type = config.type || 'personal'; // personal, settlement, merchant, bank
    this.capacity = config.capacity || 20; // Number of slots
    this.weightLimit = config.weightLimit || 100;
    this.slots = new Map();
    this.currency = {
      gold: config.gold || 0,
      silver: config.silver || 0,
      copper: config.copper || 0
    };
    
    // Special inventories
    this.equipped = new Map(); // For equipment slots
    this.quickSlots = new Map(); // For quick access items
    
    // Inventory modifiers
    this.modifiers = {
      capacityBonus: 0,
      weightBonus: 0,
      valueMultiplier: 1.0,
      preservationRate: 1.0 // For perishable items
    };
    
    // Initialize slots
    for (let i = 0; i < this.capacity; i++) {
      this.slots.set(i, new InventorySlot());
    }
  }

  // Add item to inventory
  addItem(item, quantity = 1) {
    if (!item) return { success: false, reason: 'No item provided' };
    
    // Check weight limit
    const totalWeight = item.weight * quantity;
    if (this.getCurrentWeight() + totalWeight > this.getMaxWeight()) {
      return { success: false, reason: 'Too heavy' };
    }
    
    let remaining = quantity;
    
    // Try to stack with existing items first
    if (item.stackable) {
      for (const [key, slot] of this.slots) {
        if (slot.item && slot.canStack(item)) {
          remaining = slot.addQuantity(remaining);
          if (remaining === 0) break;
        }
      }
    }
    
    // Add to empty slots
    if (remaining > 0) {
      for (const [key, slot] of this.slots) {
        if (!slot.item) {
          const addAmount = item.stackable ? Math.min(remaining, item.maxStack) : 1;
          slot.item = item;
          slot.quantity = addAmount;
          remaining -= addAmount;
          
          if (remaining === 0 || !item.stackable) break;
        }
      }
    }
    
    const addedQuantity = quantity - remaining;
    
    if (addedQuantity > 0) {
      this.onItemsAdded(item, addedQuantity);
      return { 
        success: true, 
        added: addedQuantity, 
        remaining: remaining 
      };
    } else {
      return { 
        success: false, 
        reason: 'No space available',
        added: 0,
        remaining: remaining
      };
    }
  }

  // Remove item from inventory
  removeItem(itemId, quantity = 1) {
    let remaining = quantity;
    const removedSlots = [];
    
    for (const [key, slot] of this.slots) {
      if (slot.item && slot.item.id === itemId && !slot.locked) {
        const removed = slot.removeQuantity(remaining);
        remaining -= removed;
        
        if (slot.quantity === 0) {
          slot.item = null;
          removedSlots.push(key);
        }
        
        if (remaining === 0) break;
      }
    }
    
    const removedQuantity = quantity - remaining;
    
    if (removedQuantity > 0) {
      this.onItemsRemoved(itemId, removedQuantity);
      return {
        success: true,
        removed: removedQuantity,
        remaining: remaining
      };
    } else {
      return {
        success: false,
        reason: 'Item not found or insufficient quantity',
        removed: 0,
        remaining: remaining
      };
    }
  }

  // Transfer items between inventories
  transferTo(targetInventory, itemId, quantity = 1) {
    const item = this.getItem(itemId);
    if (!item) {
      return { success: false, reason: 'Item not found' };
    }
    
    // Check if item is tradeable
    if (!item.tradeable) {
      return { success: false, reason: 'Item cannot be traded' };
    }
    
    // Try to remove from source
    const removeResult = this.removeItem(itemId, quantity);
    if (!removeResult.success) {
      return removeResult;
    }
    
    // Try to add to target
    const addResult = targetInventory.addItem(item, removeResult.removed);
    
    // If target couldn't accept all items, add back what wasn't transferred
    if (addResult.remaining > 0) {
      this.addItem(item, addResult.remaining);
    }
    
    return {
      success: true,
      transferred: addResult.added,
      remaining: addResult.remaining
    };
  }

  // Currency management
  addCurrency(amount, type = 'gold') {
    if (this.currency[type] !== undefined) {
      this.currency[type] += amount;
      this.onCurrencyChanged(type, amount);
      return true;
    }
    return false;
  }

  removeCurrency(amount, type = 'gold') {
    if (this.currency[type] !== undefined && this.currency[type] >= amount) {
      this.currency[type] -= amount;
      this.onCurrencyChanged(type, -amount);
      return true;
    }
    return false;
  }

  getTotalCurrencyValue() {
    // Convert to base currency (copper)
    return this.currency.gold * 100 + 
           this.currency.silver * 10 + 
           this.currency.copper;
  }

  canAfford(price) {
    return this.getTotalCurrencyValue() >= price;
  }

  // Equipment management
  equipItem(slotId, equipmentSlot) {
    const slot = this.slots.get(slotId);
    if (!slot || !slot.item) return false;
    
    const item = slot.item;
    
    // Check if item can be equipped
    if (!this.canEquip(item, equipmentSlot)) {
      return false;
    }
    
    // Unequip current item in that slot if any
    const currentEquipped = this.equipped.get(equipmentSlot);
    if (currentEquipped) {
      currentEquipped.equipped = false;
    }
    
    // Equip new item
    slot.equipped = true;
    this.equipped.set(equipmentSlot, slot);
    this.onItemEquipped(item, equipmentSlot);
    
    return true;
  }

  unequipItem(equipmentSlot) {
    const slot = this.equipped.get(equipmentSlot);
    if (slot) {
      slot.equipped = false;
      this.equipped.delete(equipmentSlot);
      this.onItemUnequipped(slot.item, equipmentSlot);
      return true;
    }
    return false;
  }

  // Utility methods
  getItem(itemId) {
    for (const [key, slot] of this.slots) {
      if (slot.item && slot.item.id === itemId) {
        return slot.item;
      }
    }
    return null;
  }

  getItemQuantity(itemId) {
    let total = 0;
    for (const [key, slot] of this.slots) {
      if (slot.item && slot.item.id === itemId) {
        total += slot.quantity;
      }
    }
    return total;
  }

  getCurrentWeight() {
    let weight = 0;
    for (const [key, slot] of this.slots) {
      weight += slot.getTotalWeight();
    }
    return weight;
  }

  getMaxWeight() {
    return this.weightLimit + this.modifiers.weightBonus;
  }

  getTotalValue() {
    let value = 0;
    for (const [key, slot] of this.slots) {
      value += slot.getTotalValue();
    }
    return value * this.modifiers.valueMultiplier + this.getTotalCurrencyValue();
  }

  getEmptySlots() {
    let count = 0;
    for (const [key, slot] of this.slots) {
      if (!slot.item) count++;
    }
    return count;
  }

  isFull() {
    return this.getEmptySlots() === 0;
  }

  // Get items by category
  getItemsByCategory(category) {
    const items = [];
    for (const [key, slot] of this.slots) {
      if (slot.item && slot.item.category === category) {
        items.push({
          slot: key,
          item: slot.item,
          quantity: slot.quantity,
          equipped: slot.equipped
        });
      }
    }
    return items;
  }

  // Check equipment compatibility
  canEquip(item, equipmentSlot) {
    // Check item category matches equipment slot
    const slotRequirements = {
      mainHand: ['Weapon'],
      offHand: ['Weapon', 'Shield'],
      head: ['Armor'],
      chest: ['Armor'],
      legs: ['Armor'],
      feet: ['Armor'],
      hands: ['Armor'],
      ring1: ['Accessory'],
      ring2: ['Accessory'],
      neck: ['Accessory']
    };
    
    const allowedCategories = slotRequirements[equipmentSlot];
    if (!allowedCategories || !allowedCategories.includes(item.category)) {
      return false;
    }
    
    // Check prerequisites
    if (this.owner && item.prerequisites) {
      return this.checkPrerequisites(item.prerequisites);
    }
    
    return true;
  }

  checkPrerequisites(prerequisites) {
    if (!this.owner) return true;
    
    // Check level requirement
    if (prerequisites.level && this.owner.level < prerequisites.level) {
      return false;
    }
    
    // Check attribute requirements
    if (prerequisites.attributes) {
      for (const [attr, value] of Object.entries(prerequisites.attributes)) {
        if (this.owner.attributes[attr] < value) {
          return false;
        }
      }
    }
    
    // Check skill requirements
    if (prerequisites.skills) {
      for (const [skill, value] of Object.entries(prerequisites.skills)) {
        if (!this.owner.skills[skill] || this.owner.skills[skill].level < value) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Event callbacks
  onItemsAdded(item, quantity) {
    // Override in subclasses for specific behavior
  }

  onItemsRemoved(itemId, quantity) {
    // Override in subclasses for specific behavior
  }

  onCurrencyChanged(type, amount) {
    // Override in subclasses for specific behavior
  }

  onItemEquipped(item, slot) {
    // Apply item effects to owner
    if (this.owner && item.effects) {
      this.applyItemEffects(item.effects, true);
    }
  }

  onItemUnequipped(item, slot) {
    // Remove item effects from owner
    if (this.owner && item.effects) {
      this.applyItemEffects(item.effects, false);
    }
  }

  applyItemEffects(effects, equip = true) {
    const multiplier = equip ? 1 : -1;
    
    effects.forEach(effect => {
      switch (effect.type) {
        case 'attribute':
          if (this.owner.attributes[effect.attribute]) {
            this.owner.attributes[effect.attribute] += effect.value * multiplier;
          }
          break;
        case 'skill':
          if (this.owner.skills[effect.skill]) {
            this.owner.skills[effect.skill].bonus = 
              (this.owner.skills[effect.skill].bonus || 0) + effect.value * multiplier;
          }
          break;
        case 'resistance':
          if (this.owner.resistances) {
            this.owner.resistances[effect.damageType] = 
              (this.owner.resistances[effect.damageType] || 0) + effect.value * multiplier;
          }
          break;
      }
    });
  }

  // Serialization
  toJSON() {
    const slotsData = {};
    for (const [key, slot] of this.slots) {
      if (slot.item) {
        slotsData[key] = {
          itemId: slot.item.id,
          quantity: slot.quantity,
          equipped: slot.equipped,
          locked: slot.locked
        };
      }
    }
    
    const equippedData = {};
    for (const [slot, invSlot] of this.equipped) {
      equippedData[slot] = Array.from(this.slots).find(([k, v]) => v === invSlot)?.[0];
    }
    
    return {
      type: this.type,
      capacity: this.capacity,
      weightLimit: this.weightLimit,
      slots: slotsData,
      currency: this.currency,
      equipped: equippedData,
      modifiers: this.modifiers
    };
  }

  fromJSON(data, itemSystem) {
    this.type = data.type || 'personal';
    this.capacity = data.capacity || 20;
    this.weightLimit = data.weightLimit || 100;
    this.currency = data.currency || { gold: 0, silver: 0, copper: 0 };
    this.modifiers = data.modifiers || {
      capacityBonus: 0,
      weightBonus: 0,
      valueMultiplier: 1.0,
      preservationRate: 1.0
    };
    
    // Clear and rebuild slots
    this.slots.clear();
    for (let i = 0; i < this.capacity; i++) {
      const slotData = data.slots[i];
      if (slotData) {
        const item = itemSystem.getItem(slotData.itemId);
        if (item) {
          const slot = new InventorySlot(item, slotData.quantity);
          slot.equipped = slotData.equipped;
          slot.locked = slotData.locked;
          this.slots.set(i, slot);
        } else {
          this.slots.set(i, new InventorySlot());
        }
      } else {
        this.slots.set(i, new InventorySlot());
      }
    }
    
    // Rebuild equipped items
    this.equipped.clear();
    if (data.equipped) {
      for (const [equipSlot, invSlotKey] of Object.entries(data.equipped)) {
        const invSlot = this.slots.get(invSlotKey);
        if (invSlot && invSlot.item) {
          this.equipped.set(equipSlot, invSlot);
        }
      }
    }
  }
}

// Specialized inventory types
class MerchantInventory extends Inventory {
  constructor(config) {
    super({
      ...config,
      type: 'merchant',
      capacity: config.capacity || 50,
      weightLimit: config.weightLimit || 500
    });
    
    this.restockTimer = 0;
    this.restockInterval = config.restockInterval || 7; // days
    this.specialization = config.specialization || 'general';
    this.priceModifiers = config.priceModifiers || {};
    this.reputation = config.reputation || 50;
  }

  getSellingPrice(item) {
    let basePrice = item.value;
    
    // Apply specialization bonus/penalty
    if (item.category === this.specialization) {
      basePrice *= 0.9; // 10% discount for specialized items
    }
    
    // Apply price modifiers
    if (this.priceModifiers[item.id]) {
      basePrice *= this.priceModifiers[item.id];
    }
    
    // Apply reputation modifier
    const repModifier = 1 + (this.reputation - 50) / 200; // ±25% based on reputation
    basePrice *= repModifier;
    
    return Math.floor(basePrice);
  }

  getBuyingPrice(item) {
    return Math.floor(this.getSellingPrice(item) * 0.5); // Merchants buy at 50% of selling price
  }

  restock(itemSystem) {
    // Generate new stock based on specialization
    const stockList = this.generateStockList(itemSystem);
    
    // Clear old inventory
    this.slots.forEach(slot => {
      if (!slot.locked) {
        slot.item = null;
        slot.quantity = 0;
      }
    });
    
    // Add new stock
    stockList.forEach(({ item, quantity }) => {
      this.addItem(item, quantity);
    });
    
    this.restockTimer = 0;
  }

  generateStockList(itemSystem) {
    // Override in specialized merchant subclasses
    const items = itemSystem.getItemsByCategory(this.specialization);
    const stockList = [];
    
    items.forEach(item => {
      if (Math.random() < 0.6) { // 60% chance to stock each item
        const quantity = item.stackable ? 
          Math.floor(Math.random() * 20) + 5 : 
          Math.floor(Math.random() * 3) + 1;
        stockList.push({ item, quantity });
      }
    });
    
    return stockList;
  }
}

class SettlementInventory extends Inventory {
  constructor(config) {
    super({
      ...config,
      type: 'settlement',
      capacity: config.capacity || 200,
      weightLimit: config.weightLimit || 10000
    });
    
    this.resourceStorage = {
      food: { current: 0, max: 1000 },
      wood: { current: 0, max: 1000 },
      stone: { current: 0, max: 1000 },
      iron: { current: 0, max: 500 },
      gold: { current: 0, max: 500 }
    };
    
    this.warehouseLevel = config.warehouseLevel || 1;
  }

  addResource(type, amount) {
    if (!this.resourceStorage[type]) return false;
    
    const storage = this.resourceStorage[type];
    const available = storage.max - storage.current;
    const actualAdd = Math.min(amount, available);
    
    storage.current += actualAdd;
    return actualAdd;
  }

  removeResource(type, amount) {
    if (!this.resourceStorage[type]) return 0;
    
    const storage = this.resourceStorage[type];
    const actualRemove = Math.min(amount, storage.current);
    
    storage.current -= actualRemove;
    return actualRemove;
  }

  upgradeWarehouse() {
    this.warehouseLevel++;
    this.capacity += 50;
    this.weightLimit += 2500;
    
    // Increase resource storage
    Object.values(this.resourceStorage).forEach(storage => {
      storage.max *= 1.5;
    });
  }
}

export { Inventory, MerchantInventory, SettlementInventory, InventorySlot }; 