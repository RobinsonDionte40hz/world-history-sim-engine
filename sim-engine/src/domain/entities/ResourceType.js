/**
 * ResourceType - Entity representing a type of resource in the game
 * 
 * Defines the properties and behavior of resources that can be produced,
 * stored, traded, and consumed in the simulation.
 */

import { ResourceCategory } from '../value-objects/ResourceCategory.js';

export class ResourceType {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.name = data.name || 'Unnamed Resource';
    this.description = data.description || '';
    
    // Category classification
    this.category = data.category || 'materials'; // Primary category
    this.subcategory = data.subcategory || null;  // Optional subcategory
    this.tags = data.tags || [];  // Additional classification tags
    
    // Economic properties
    this.baseValue = data.baseValue || 1;  // Base market value
    this.weight = data.weight || 1;  // Weight per unit (affects transport)
    this.volume = data.volume || 1;  // Volume per unit (affects storage)
    
    // Storage properties
    this.stackable = data.stackable !== undefined ? data.stackable : true;
    this.maxStackSize = data.maxStackSize || 100;
    this.perishable = data.perishable || false;
    this.spoilTime = data.spoilTime || null;  // Turns before spoiling (if perishable)
    
    // Quality properties
    this.hasQuality = data.hasQuality || false;  // Can items have quality levels?
    this.qualityRange = data.qualityRange || { min: 1, max: 5 };
    
    // Market properties
    this.tradeable = data.tradeable !== undefined ? data.tradeable : true;
    this.demandFactors = data.demandFactors || [];  // What increases demand?
    this.supplyFactors = data.supplyFactors || [];  // What increases supply?
    
    // Visual/UI properties
    this.icon = data.icon || '📦';
    this.color = data.color || '#8B7355';
    
    // Metadata
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }
  
  /**
   * Generate unique ID for resource type
   */
  _generateId() {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get the ResourceCategory object for this resource
   */
  getCategory() {
    return ResourceCategory.getById(this.category);
  }
  
  /**
   * Check if resource belongs to a category
   */
  isInCategory(categoryId) {
    return this.category === categoryId || this.tags.includes(categoryId);
  }
  
  /**
   * Calculate value with quality modifier
   */
  calculateValue(quality = 1) {
    if (!this.hasQuality) {
      return this.baseValue;
    }
    
    const qualityModifier = quality / ((this.qualityRange.max + this.qualityRange.min) / 2);
    return Math.round(this.baseValue * qualityModifier);
  }
  
  /**
   * Check if resource can be stored
   */
  canBeStored() {
    return this.category !== 'services';
  }
  
  /**
   * Get storage requirements
   */
  getStorageRequirements(quantity = 1) {
    return {
      space: this.volume * quantity,
      weight: this.weight * quantity,
      specialRequirements: this.perishable ? ['refrigeration'] : []
    };
  }
  
  /**
   * Check if resource has spoiled
   */
  hasSpoiled(age) {
    if (!this.perishable || !this.spoilTime) return false;
    return age >= this.spoilTime;
  }
  
  /**
   * Add a tag
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = Date.now();
    }
  }
  
  /**
   * Remove a tag
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updatedAt = Date.now();
    }
  }
  
  /**
   * Update resource properties
   */
  update(data) {
    const updatableFields = [
      'name', 'description', 'baseValue', 'weight', 'volume',
      'stackable', 'maxStackSize', 'perishable', 'spoilTime',
      'hasQuality', 'qualityRange', 'tradeable', 'demandFactors',
      'supplyFactors', 'icon', 'color', 'subcategory'
    ];
    
    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    });
    
    this.updatedAt = Date.now();
  }
  
  /**
   * Validate resource type data
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Resource name is required');
    }
    
    if (this.baseValue < 0) {
      errors.push('Base value cannot be negative');
    }
    
    if (this.weight < 0) {
      errors.push('Weight cannot be negative');
    }
    
    if (this.volume < 0) {
      errors.push('Volume cannot be negative');
    }
    
    if (this.perishable && (!this.spoilTime || this.spoilTime <= 0)) {
      errors.push('Perishable resources must have a positive spoil time');
    }
    
    try {
      ResourceCategory.getById(this.category);
    } catch (e) {
      errors.push(`Invalid category: ${this.category}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Create a copy of this resource type
   */
  clone() {
    return new ResourceType(this.toJSON());
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      subcategory: this.subcategory,
      tags: [...this.tags],
      baseValue: this.baseValue,
      weight: this.weight,
      volume: this.volume,
      stackable: this.stackable,
      maxStackSize: this.maxStackSize,
      perishable: this.perishable,
      spoilTime: this.spoilTime,
      hasQuality: this.hasQuality,
      qualityRange: { ...this.qualityRange },
      tradeable: this.tradeable,
      demandFactors: [...this.demandFactors],
      supplyFactors: [...this.supplyFactors],
      icon: this.icon,
      color: this.color,
      metadata: { ...this.metadata },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new ResourceType(data);
  }
}

export default ResourceType;
