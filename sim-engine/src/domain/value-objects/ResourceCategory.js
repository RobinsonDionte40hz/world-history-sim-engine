/**
 * ResourceCategory - Value object for categorizing resources
 * 
 * Provides abstract groupings for resources to simplify queries and UI organization.
 * Resources can belong to multiple categories for flexible classification.
 */

export const RESOURCE_CATEGORIES = {
  // Basic survival resources
  FOOD: {
    id: 'food',
    name: 'Food',
    description: 'Consumable items that satisfy hunger',
    icon: '🍞',
    storage: {
      perishable: true,
      stackable: true,
      defaultCapacity: 1000
    }
  },
  
  WATER: {
    id: 'water',
    name: 'Water',
    description: 'Drinkable liquids for hydration',
    icon: '💧',
    storage: {
      perishable: false,
      stackable: true,
      defaultCapacity: 5000
    }
  },
  
  // Raw materials
  MATERIALS: {
    id: 'materials',
    name: 'Raw Materials',
    description: 'Unprocessed resources for crafting',
    icon: '🪨',
    subcategories: ['ore', 'wood', 'stone', 'fiber'],
    storage: {
      perishable: false,
      stackable: true,
      defaultCapacity: 2000
    }
  },
  
  // Crafted goods
  TOOLS: {
    id: 'tools',
    name: 'Tools',
    description: 'Implements used for work and crafting',
    icon: '🔨',
    storage: {
      perishable: false,
      stackable: false,
      defaultCapacity: 100
    }
  },
  
  WEAPONS: {
    id: 'weapons',
    name: 'Weapons',
    description: 'Equipment for combat and defense',
    icon: '⚔️',
    storage: {
      perishable: false,
      stackable: false,
      defaultCapacity: 200
    }
  },
  
  ARMOR: {
    id: 'armor',
    name: 'Armor',
    description: 'Protective gear and clothing',
    icon: '🛡️',
    storage: {
      perishable: false,
      stackable: false,
      defaultCapacity: 150
    }
  },
  
  // Economic goods
  LUXURY: {
    id: 'luxury',
    name: 'Luxury Goods',
    description: 'High-value items for trade and prestige',
    icon: '💎',
    storage: {
      perishable: false,
      stackable: true,
      defaultCapacity: 500
    }
  },
  
  CURRENCY: {
    id: 'currency',
    name: 'Currency',
    description: 'Money and tradeable value tokens',
    icon: '💰',
    storage: {
      perishable: false,
      stackable: true,
      defaultCapacity: 999999
    }
  },
  
  // Services and abstract resources
  SERVICES: {
    id: 'services',
    name: 'Services',
    description: 'Non-physical goods like education, healing, etc.',
    icon: '🎓',
    storage: {
      perishable: true,
      stackable: false,
      defaultCapacity: 0
    }
  },
  
  // Intermediate goods
  COMPONENTS: {
    id: 'components',
    name: 'Components',
    description: 'Processed materials for further crafting',
    icon: '⚙️',
    subcategories: ['refined_ore', 'lumber', 'fabric', 'leather'],
    storage: {
      perishable: false,
      stackable: true,
      defaultCapacity: 1500
    }
  }
};

/**
 * ResourceCategory class for working with category definitions
 */
export class ResourceCategory {
  constructor(categoryId) {
    const category = RESOURCE_CATEGORIES[categoryId.toUpperCase()];
    
    if (!category) {
      throw new Error(`Invalid resource category: ${categoryId}`);
    }
    
    this.id = category.id;
    this.name = category.name;
    this.description = category.description;
    this.icon = category.icon;
    this.subcategories = category.subcategories || [];
    this.storage = category.storage;
  }
  
  /**
   * Check if this category is perishable
   */
  isPerishable() {
    return this.storage.perishable;
  }
  
  /**
   * Check if items in this category can stack
   */
  isStackable() {
    return this.storage.stackable;
  }
  
  /**
   * Get default storage capacity for this category
   */
  getDefaultCapacity() {
    return this.storage.defaultCapacity;
  }
  
  /**
   * Check if a subcategory exists
   */
  hasSubcategory(subcategory) {
    return this.subcategories.includes(subcategory);
  }
  
  /**
   * Get all category IDs
   */
  static getAllCategoryIds() {
    return Object.values(RESOURCE_CATEGORIES).map(cat => cat.id);
  }
  
  /**
   * Get all categories as ResourceCategory instances
   */
  static getAllCategories() {
    return Object.values(RESOURCE_CATEGORIES).map(cat => new ResourceCategory(cat.id));
  }
  
  /**
   * Get category by ID
   */
  static getById(categoryId) {
    return new ResourceCategory(categoryId);
  }
  
  /**
   * Get categories that match criteria
   */
  static findCategories(criteria) {
    return Object.values(RESOURCE_CATEGORIES)
      .filter(cat => {
        if (criteria.perishable !== undefined && cat.storage.perishable !== criteria.perishable) {
          return false;
        }
        if (criteria.stackable !== undefined && cat.storage.stackable !== criteria.stackable) {
          return false;
        }
        return true;
      })
      .map(cat => new ResourceCategory(cat.id));
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      subcategories: this.subcategories,
      storage: this.storage
    };
  }
}

export default ResourceCategory;
