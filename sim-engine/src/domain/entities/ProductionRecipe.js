/**
 * ProductionRecipe - Entity representing a crafting/production recipe
 * 
 * Defines how items are produced from input resources, the buildings/tools required,
 * and the skill levels needed. Supports complex production chains with byproducts
 * and quality variations.
 */

export class ProductionRecipe {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.name = data.name || 'Unnamed Recipe';
    this.description = data.description || '';
    
    // Output
    this.outputItem = data.outputItem || null; // Item ID or ResourceType ID
    this.outputQuantity = data.outputQuantity || 1;
    this.outputQualityRange = data.outputQualityRange || { min: 1, max: 5 };
    
    // Inputs (materials/resources needed)
    this.inputs = data.inputs || [];
    /*
      [
        { resourceType: 'iron-ore', quantity: 3, consumedPerOutput: 3 },
        { resourceType: 'wood', quantity: 1, consumedPerOutput: 1 }
      ]
    */
    
    // Production requirements
    this.productionTime = data.productionTime || 1; // Turns required
    this.workersRequired = data.workersRequired || 1;
    this.buildingTypes = data.buildingTypes || []; // Types of buildings that can use this recipe
    this.requiredTools = data.requiredTools || []; // Tool items that must be present
    
    // Skill requirements
    this.requiredSkill = data.requiredSkill || null; // Skill name (e.g., 'smithing')
    this.skillLevel = data.skillLevel || 0; // Minimum skill level required
    this.skillImpact = data.skillImpact || 0.5; // How much skill affects quality (0-1)
    
    // Byproducts (optional outputs)
    this.byproducts = data.byproducts || [];
    /*
      [
        { resourceType: 'slag', quantity: 1, chance: 0.5 },
        { resourceType: 'scraps', quantity: 2, chance: 0.3 }
      ]
    */
    
    // Quality factors (what affects output quality)
    this.qualityFactors = data.qualityFactors || {
      workerSkill: 0.6,      // 60% from worker skill
      buildingLevel: 0.3,    // 30% from building level
      toolQuality: 0.1       // 10% from tool quality
    };
    
    // Economic properties
    this.experienceGained = data.experienceGained || 10;
    this.failureChance = data.failureChance || 0; // 0-1, chance recipe fails
    this.failureReturns = data.failureReturns || 0.5; // Percentage of inputs returned on failure
    
    // Unlock conditions
    this.prerequisites = data.prerequisites || {
      quests: [],
      discoveries: [],
      reputation: null,
      settlements: [] // Must be in specific settlements
    };
    
    // Classification
    this.category = data.category || 'general'; // crafting, smelting, weaving, cooking, etc.
    this.difficulty = data.difficulty || 'intermediate'; // novice, intermediate, expert, master
    this.tags = data.tags || [];
    
    // Metadata
    this.isTemplate = data.isTemplate || false;
    this.author = data.author || null;
    this.version = data.version || '1.0.0';
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }
  
  /**
   * Generate unique ID
   */
  _generateId() {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if recipe can be executed with given resources
   */
  canExecute(availableResources = {}, availableTools = []) {
    const reasons = [];
    
    // Check input resources
    this.inputs.forEach(input => {
      const available = availableResources[input.resourceType] || 0;
      if (available < input.quantity) {
        reasons.push(`Insufficient ${input.resourceType}: need ${input.quantity}, have ${available}`);
      }
    });
    
    // Check required tools
    this.requiredTools.forEach(tool => {
      if (!availableTools.includes(tool)) {
        reasons.push(`Missing required tool: ${tool}`);
      }
    });
    
    return {
      canExecute: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Check if worker meets skill requirements
   */
  meetsSkillRequirements(worker) {
    if (!this.requiredSkill) return { meets: true, reasons: [] };
    
    const workerSkillLevel = worker.skills?.[this.requiredSkill] || 0;
    
    if (workerSkillLevel < this.skillLevel) {
      return {
        meets: false,
        reasons: [`Requires ${this.requiredSkill} level ${this.skillLevel}, worker has ${workerSkillLevel}`]
      };
    }
    
    return { meets: true, reasons: [] };
  }
  
  /**
   * Calculate output quality based on various factors
   */
  calculateOutputQuality(factors = {}) {
    let quality = 0;
    
    // Worker skill contribution
    if (factors.workerSkill !== undefined) {
      const skillNormalized = factors.workerSkill / 20; // Assuming max skill is 20
      quality += skillNormalized * this.qualityFactors.workerSkill;
    }
    
    // Building level contribution
    if (factors.buildingLevel !== undefined) {
      const levelNormalized = factors.buildingLevel / 10; // Assuming max level is 10
      quality += levelNormalized * this.qualityFactors.buildingLevel;
    }
    
    // Tool quality contribution
    if (factors.toolQuality !== undefined) {
      quality += factors.toolQuality * this.qualityFactors.toolQuality;
    }
    
    // Scale to quality range
    const scaledQuality = this.outputQualityRange.min + 
      (quality * (this.outputQualityRange.max - this.outputQualityRange.min));
    
    return Math.round(Math.max(this.outputQualityRange.min, 
                               Math.min(this.outputQualityRange.max, scaledQuality)));
  }
  
  /**
   * Calculate production cost
   */
  calculateCost(resourcePrices = {}) {
    let totalCost = 0;
    
    this.inputs.forEach(input => {
      const price = resourcePrices[input.resourceType] || 0;
      totalCost += price * input.quantity;
    });
    
    return totalCost;
  }
  
  /**
   * Roll for byproduct generation
   */
  generateByproducts() {
    const generated = [];
    
    this.byproducts.forEach(byproduct => {
      if (Math.random() < byproduct.chance) {
        generated.push({
          resourceType: byproduct.resourceType,
          quantity: byproduct.quantity
        });
      }
    });
    
    return generated;
  }
  
  /**
   * Check if recipe execution fails
   */
  rollForFailure() {
    return Math.random() < this.failureChance;
  }
  
  /**
   * Calculate resources returned on failure
   */
  calculateFailureReturns() {
    const returns = {};
    
    this.inputs.forEach(input => {
      const returnAmount = Math.floor(input.quantity * this.failureReturns);
      if (returnAmount > 0) {
        returns[input.resourceType] = returnAmount;
      }
    });
    
    return returns;
  }
  
  /**
   * Check if recipe is available (prerequisites met)
   */
  isAvailable(context = {}) {
    const reasons = [];
    
    // Check quest prerequisites
    if (this.prerequisites.quests && this.prerequisites.quests.length > 0) {
      const completedQuests = context.completedQuests || [];
      const missingQuests = this.prerequisites.quests.filter(q => !completedQuests.includes(q));
      if (missingQuests.length > 0) {
        reasons.push(`Requires quests: ${missingQuests.join(', ')}`);
      }
    }
    
    // Check reputation
    if (this.prerequisites.reputation) {
      const currentRep = context.reputation || 0;
      if (currentRep < this.prerequisites.reputation) {
        reasons.push(`Requires reputation: ${this.prerequisites.reputation}`);
      }
    }
    
    return {
      available: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Validate recipe data
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Recipe name is required');
    }
    
    if (!this.outputItem) {
      errors.push('Output item is required');
    }
    
    if (this.outputQuantity <= 0) {
      errors.push('Output quantity must be positive');
    }
    
    if (this.inputs.length === 0) {
      errors.push('At least one input resource is required');
    }
    
    if (this.productionTime <= 0) {
      errors.push('Production time must be positive');
    }
    
    if (this.workersRequired <= 0) {
      errors.push('Workers required must be positive');
    }
    
    if (this.failureChance < 0 || this.failureChance > 1) {
      errors.push('Failure chance must be between 0 and 1');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Clone recipe
   */
  clone() {
    return new ProductionRecipe(this.toJSON());
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      outputItem: this.outputItem,
      outputQuantity: this.outputQuantity,
      outputQualityRange: { ...this.outputQualityRange },
      inputs: this.inputs.map(i => ({ ...i })),
      productionTime: this.productionTime,
      workersRequired: this.workersRequired,
      buildingTypes: [...this.buildingTypes],
      requiredTools: [...this.requiredTools],
      requiredSkill: this.requiredSkill,
      skillLevel: this.skillLevel,
      skillImpact: this.skillImpact,
      byproducts: this.byproducts.map(b => ({ ...b })),
      qualityFactors: { ...this.qualityFactors },
      experienceGained: this.experienceGained,
      failureChance: this.failureChance,
      failureReturns: this.failureReturns,
      prerequisites: { ...this.prerequisites },
      category: this.category,
      difficulty: this.difficulty,
      tags: [...this.tags],
      isTemplate: this.isTemplate,
      author: this.author,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new ProductionRecipe(data);
  }
}

export default ProductionRecipe;
