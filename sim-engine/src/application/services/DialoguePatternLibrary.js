/**
 * DialoguePatternLibrary - Service for managing dialogue patterns
 * 
 * Features:
 * - Comprehensive set of dialogue patterns using existing TextTemplateEngine syntax
 * - Contextual pattern suggestions based on editor context
 * - Support for conditional patterns based on character attributes
 * - Pattern customization system for user-defined patterns
 * - Pattern validation and testing
 * - Import/export functionality for pattern collections
 */
class DialoguePatternLibrary {
  constructor() {
    this.patterns = new Map();
    this.customPatterns = new Map();
    this.patternCategories = new Set();
    this.initializeDefaultPatterns();
  }

  /**
   * Initialize the default pattern library
   */
  initializeDefaultPatterns() {
    const defaultPatterns = this.getDefaultPatterns();
    defaultPatterns.forEach(pattern => {
      this.addPattern(pattern);
    });
  }

  /**
   * Add a pattern to the library
   * @param {object} pattern - Pattern object
   * @returns {boolean} Success status
   */
  addPattern(pattern) {
    if (!this.validatePattern(pattern)) {
      throw new Error(`Invalid pattern: ${pattern.name || 'unnamed'}`);
    }

    const patternId = pattern.id || this.generatePatternId(pattern);
    const fullPattern = {
      ...pattern,
      id: patternId,
      createdAt: new Date().toISOString(),
      isCustom: pattern.isCustom || false
    };

    if (fullPattern.isCustom) {
      this.customPatterns.set(patternId, fullPattern);
    } else {
      this.patterns.set(patternId, fullPattern);
    }

    this.patternCategories.add(pattern.category);
    return true;
  }

  /**
   * Remove a pattern from the library
   * @param {string} patternId - Pattern ID
   * @returns {boolean} Success status
   */
  removePattern(patternId) {
    const removed = this.patterns.delete(patternId) || this.customPatterns.delete(patternId);
    return removed;
  }

  /**
   * Get pattern by ID
   * @param {string} patternId - Pattern ID
   * @returns {object|null} Pattern object or null
   */
  getPattern(patternId) {
    return this.patterns.get(patternId) || this.customPatterns.get(patternId) || null;
  }

  /**
   * Get all patterns
   * @param {object} options - Filter options
   * @returns {Array} Array of patterns
   */
  getAllPatterns(options = {}) {
    const {
      category = null,
      includeCustom = true,
      contextFilter = null,
      searchQuery = null
    } = options;

    let allPatterns = [
      ...Array.from(this.patterns.values())
    ];

    if (includeCustom) {
      allPatterns.push(...Array.from(this.customPatterns.values()));
    }

    // Apply category filter
    if (category) {
      allPatterns = allPatterns.filter(p => p.category === category);
    }

    // Apply context filter
    if (contextFilter) {
      allPatterns = allPatterns.filter(p => 
        this.isPatternAvailableInContext(p, contextFilter)
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allPatterns = allPatterns.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.template.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    return allPatterns;
  }

  /**
   * Get patterns by category
   * @param {string} category - Pattern category
   * @param {object} context - Available context for filtering
   * @returns {Array} Array of patterns in category
   */
  getPatternsByCategory(category, context = null) {
    return this.getAllPatterns({ 
      category, 
      contextFilter: context 
    });
  }

  /**
   * Get contextual pattern suggestions
   * @param {object} context - Available context
   * @param {object} options - Suggestion options
   * @returns {Array} Array of suggested patterns
   */
  getContextualSuggestions(context, options = {}) {
    const {
      maxSuggestions = 10,
      preferredCategories = null,
      includeConditional = true
    } = options;

    let suggestions = this.getAllPatterns({ contextFilter: context });

    // Score patterns based on context relevance
    suggestions = suggestions.map(pattern => ({
      ...pattern,
      relevanceScore: this.calculateRelevanceScore(pattern, context)
    }));

    // Sort by relevance score
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Filter by preferred categories if specified
    if (preferredCategories && preferredCategories.length > 0) {
      suggestions = suggestions.filter(p => preferredCategories.includes(p.category));
    }

    // Filter conditional patterns if not wanted
    if (!includeConditional) {
      suggestions = suggestions.filter(p => !p.template.includes('{{#if'));
    }

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Calculate relevance score for a pattern given context
   * @param {object} pattern - Pattern to score
   * @param {object} context - Available context
   * @returns {number} Relevance score (0-100)
   */
  calculateRelevanceScore(pattern, context) {
    let score = 0;

    // Base score for all patterns
    score += 10;

    // Bonus for having required context available
    if (pattern.requiredContext) {
      const availableContext = pattern.requiredContext.filter(ctx => 
        context[ctx] !== undefined && context[ctx] !== null
      );
      score += (availableContext.length / pattern.requiredContext.length) * 30;
    }

    // Bonus for character-specific patterns when character is available
    if (context.character) {
      if (pattern.category === 'greetings' || pattern.category === 'farewells') {
        score += 15;
      }
      
      // Bonus for attribute-based patterns when attributes match
      if (pattern.template.includes('character.attributes')) {
        score += 10;
      }
      
      // Bonus for reputation-based patterns
      if (pattern.template.includes('character.reputation') && context.character.reputation !== undefined) {
        score += 10;
      }
    }

    // Bonus for location-specific patterns when node is available
    if (context.node) {
      if (pattern.template.includes('node.name') || pattern.template.includes('node.')) {
        score += 15;
      }
    }

    // Bonus for world-specific patterns when world is available
    if (context.world) {
      if (pattern.template.includes('world.')) {
        score += 10;
      }
    }

    // Penalty for patterns requiring unavailable context
    if (pattern.requiredContext) {
      const missingContext = pattern.requiredContext.filter(ctx => 
        context[ctx] === undefined || context[ctx] === null
      );
      score -= missingContext.length * 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if a pattern is available in the given context
   * @param {object} pattern - Pattern to check
   * @param {object} context - Available context
   * @returns {boolean} Whether pattern is available
   */
  isPatternAvailableInContext(pattern, context) {
    if (!pattern.requiredContext || pattern.requiredContext.length === 0) {
      return true; // No context required
    }

    return pattern.requiredContext.every(contextType => {
      return context[contextType] !== undefined && context[contextType] !== null;
    });
  }

  /**
   * Validate a pattern object
   * @param {object} pattern - Pattern to validate
   * @returns {boolean} Whether pattern is valid
   */
  validatePattern(pattern) {
    if (!pattern || typeof pattern !== 'object') {
      return false;
    }

    // Required fields
    if (!pattern.name || typeof pattern.name !== 'string') {
      return false;
    }

    if (!pattern.template || typeof pattern.template !== 'string') {
      return false;
    }

    if (!pattern.category || typeof pattern.category !== 'string') {
      return false;
    }

    // Optional fields validation
    if (pattern.requiredContext && !Array.isArray(pattern.requiredContext)) {
      return false;
    }

    if (pattern.tags && !Array.isArray(pattern.tags)) {
      return false;
    }

    // Template syntax validation (basic)
    if (!this.validateTemplateSyntax(pattern.template)) {
      return false;
    }

    return true;
  }

  /**
   * Basic template syntax validation
   * @param {string} template - Template string to validate
   * @returns {boolean} Whether template syntax is valid
   */
  validateTemplateSyntax(template) {
    try {
      // Check for balanced braces
      const openBraces = (template.match(/\{\{/g) || []).length;
      const closeBraces = (template.match(/\}\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        return false;
      }

      // Check for balanced conditionals
      const ifCount = (template.match(/\{\{#if/g) || []).length;
      const endifCount = (template.match(/\{\{\/if\}\}/g) || []).length;
      
      if (ifCount !== endifCount) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a unique pattern ID
   * @param {object} pattern - Pattern object
   * @returns {string} Generated ID
   */
  generatePatternId(pattern) {
    const base = `${pattern.category}_${pattern.name.toLowerCase().replace(/\s+/g, '_')}`;
    let id = base;
    let counter = 1;

    while (this.patterns.has(id) || this.customPatterns.has(id)) {
      id = `${base}_${counter}`;
      counter++;
    }

    return id;
  }

  /**
   * Get all available categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    return Array.from(this.patternCategories).sort();
  }

  /**
   * Get category statistics
   * @returns {object} Statistics by category
   */
  getCategoryStats() {
    const stats = {};
    
    this.getCategories().forEach(category => {
      const patterns = this.getPatternsByCategory(category);
      const customPatterns = patterns.filter(p => p.isCustom);
      
      stats[category] = {
        total: patterns.length,
        default: patterns.length - customPatterns.length,
        custom: customPatterns.length
      };
    });

    return stats;
  }

  /**
   * Export patterns to JSON
   * @param {object} options - Export options
   * @returns {string} JSON string of patterns
   */
  exportPatterns(options = {}) {
    const {
      includeCustom = true,
      categories = null,
      format = 'json'
    } = options;

    const patterns = this.getAllPatterns({
      includeCustom,
      category: categories ? categories[0] : null // Simple implementation
    });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patterns: patterns.map(pattern => ({
        ...pattern,
        // Remove internal fields
        createdAt: undefined
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import patterns from JSON
   * @param {string} jsonData - JSON string of patterns
   * @param {object} options - Import options
   * @returns {object} Import result
   */
  importPatterns(jsonData, options = {}) {
    const {
      overwriteExisting = false,
      markAsCustom = true
    } = options;

    try {
      const data = JSON.parse(jsonData);
      
      if (!data.patterns || !Array.isArray(data.patterns)) {
        throw new Error('Invalid import data format');
      }

      const results = {
        imported: 0,
        skipped: 0,
        errors: []
      };

      data.patterns.forEach(pattern => {
        try {
          const patternToImport = {
            ...pattern,
            isCustom: markAsCustom,
            id: undefined // Let the system generate new IDs
          };

          if (!overwriteExisting && this.getPattern(pattern.id)) {
            results.skipped++;
            return;
          }

          this.addPattern(patternToImport);
          results.imported++;
        } catch (error) {
          results.errors.push(`Failed to import pattern "${pattern.name}": ${error.message}`);
        }
      });

      return results;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Create a custom pattern
   * @param {object} patternData - Pattern data
   * @returns {string} Created pattern ID
   */
  createCustomPattern(patternData) {
    const patternId = this.generatePatternId(patternData);
    const pattern = {
      ...patternData,
      id: patternId,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    this.addPattern(pattern);
    return patternId;
  }

  /**
   * Update an existing pattern
   * @param {string} patternId - Pattern ID
   * @param {object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  updatePattern(patternId, updates) {
    const pattern = this.getPattern(patternId);
    if (!pattern) {
      return false;
    }

    const updatedPattern = {
      ...pattern,
      ...updates,
      id: patternId, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    if (!this.validatePattern(updatedPattern)) {
      throw new Error('Updated pattern is invalid');
    }

    if (pattern.isCustom) {
      this.customPatterns.set(patternId, updatedPattern);
    } else {
      this.patterns.set(patternId, updatedPattern);
    }

    return true;
  }

  /**
   * Get the default pattern library
   * @returns {Array} Array of default patterns
   */
  getDefaultPatterns() {
    return [
      // Greetings
      {
        name: 'Basic Greeting',
        category: 'greetings',
        template: '{{random:Greetings,Hello,Well met}}, {{character.name}}!',
        description: 'Simple greeting with character name',
        tags: ['basic', 'friendly'],
        requiredContext: ['character']
      },
      {
        name: 'Formal Greeting',
        category: 'greetings',
        template: '{{#if character.reputation > 10}}My lord {{character.name}}, welcome{{/if}}{{#if character.reputation <= 10}}Greetings, stranger{{/if}}.',
        description: 'Formal greeting based on reputation',
        tags: ['formal', 'reputation-based'],
        requiredContext: ['character']
      },
      {
        name: 'Location-Based Greeting',
        category: 'greetings',
        template: 'Welcome to {{node.name}}, {{character.name}}. {{#if node.environmentalProperties.crowded}}Mind the crowds{{/if}}{{#if node.environmentalProperties.peaceful}}Enjoy the tranquility{{/if}}.',
        description: 'Greeting that references current location',
        tags: ['location', 'environmental'],
        requiredContext: ['character', 'node']
      },
      {
        name: 'Time-Sensitive Greeting',
        category: 'greetings',
        template: '{{random:Good morning,Good day,Good evening}}, {{character.name}}. {{#if character.attributes.charisma > 14}}Your presence brightens this place{{/if}}.',
        description: 'Time-aware greeting with charisma check',
        tags: ['time', 'charisma'],
        requiredContext: ['character']
      },
      {
        name: 'Attribute-Based Greeting',
        category: 'greetings',
        template: '{{#if character.attributes.strength > 16}}Hail, mighty warrior!{{/if}}{{#if character.attributes.intelligence > 16}}Greetings, learned one{{/if}}{{#if character.attributes.charisma > 16}}Well met, charming {{character.name}}{{/if}}',
        description: 'Greeting based on high attributes',
        tags: ['attributes', 'conditional'],
        requiredContext: ['character']
      },

      // Farewells
      {
        name: 'Basic Farewell',
        category: 'farewells',
        template: 'Safe travels, {{character.name}}.',
        description: 'Simple farewell wishing safe travels',
        tags: ['basic', 'travel'],
        requiredContext: ['character']
      },
      {
        name: 'Blessed Farewell',
        category: 'farewells',
        template: 'May {{random:fortune,luck,the gods}} favor you, {{character.name}}.',
        description: 'Farewell with blessing or good wishes',
        tags: ['blessing', 'luck'],
        requiredContext: ['character']
      },
      {
        name: 'Location Farewell',
        category: 'farewells',
        template: 'Until we meet again{{#if node.name}}, remember {{node.name}} fondly{{/if}}.',
        description: 'Farewell referencing current location',
        tags: ['location', 'memory'],
        requiredContext: ['node']
      },
      {
        name: 'Reputation-Based Farewell',
        category: 'farewells',
        template: '{{#if character.reputation > 15}}It has been an honor, {{character.name}}{{/if}}{{#if character.reputation <= 5}}Good riddance{{/if}}{{#if character.reputation > 5 && character.reputation <= 15}}Farewell, {{character.name}}{{/if}}.',
        description: 'Farewell that changes based on reputation',
        tags: ['reputation', 'conditional'],
        requiredContext: ['character']
      },
      {
        name: 'Encouraging Farewell',
        category: 'farewells',
        template: 'Go forth with confidence, {{character.name}}. {{#if character.attributes.wisdom > 14}}Your wisdom will guide you{{/if}}{{#if character.attributes.strength > 14}}Your strength will protect you{{/if}}.',
        description: 'Encouraging farewell based on attributes',
        tags: ['encouraging', 'attributes'],
        requiredContext: ['character']
      },

      // Questions
      {
        name: 'Purpose Inquiry',
        category: 'questions',
        template: 'What brings you to {{node.name}}, {{character.name}}?',
        description: 'Ask about the character\'s purpose for being here',
        tags: ['purpose', 'location'],
        requiredContext: ['character', 'node']
      },
      {
        name: 'News Inquiry',
        category: 'questions',
        template: 'Have you heard any news from {{random:the capital,other settlements,your travels}}, {{character.name}}?',
        description: 'Ask about news from various places',
        tags: ['news', 'information'],
        requiredContext: ['character']
      },
      {
        name: 'Skills Inquiry',
        category: 'questions',
        template: '{{#if character.attributes.intelligence > 14}}You seem learned, {{character.name}}. What knowledge do you possess?{{/if}}{{#if character.attributes.strength > 14}}You look strong, {{character.name}}. Are you a warrior?{{/if}}{{#if character.attributes.dexterity > 14}}You move with grace, {{character.name}}. Are you perhaps a rogue or ranger?{{/if}}',
        description: 'Ask about skills based on attributes',
        tags: ['skills', 'attributes'],
        requiredContext: ['character']
      },
      {
        name: 'Opinion Request',
        category: 'questions',
        template: 'What do you think of {{node.name}}, {{character.name}}? {{#if node.environmentalProperties.prosperous}}Quite prosperous, isn\'t it?{{/if}}{{#if node.environmentalProperties.dangerous}}Dangerous place, wouldn\'t you say?{{/if}}',
        description: 'Ask for opinion about current location',
        tags: ['opinion', 'location'],
        requiredContext: ['character', 'node']
      },
      {
        name: 'Background Inquiry',
        category: 'questions',
        template: 'Tell me, {{character.name}}, what is your story? {{#if character.archetype}}You have the bearing of {{random:a,an}} {{character.archetype}}{{/if}}.',
        description: 'Ask about character background and story',
        tags: ['background', 'story'],
        requiredContext: ['character']
      },

      // Reactions
      {
        name: 'Impressed Reaction',
        category: 'reactions',
        template: '{{#if character.attributes.charisma > 14}}Your words carry weight, {{character.name}}{{/if}}{{#if character.attributes.intelligence > 14}}Your wisdom is evident, {{character.name}}{{/if}}{{#if character.attributes.strength > 14}}Your strength is impressive, {{character.name}}{{/if}}.',
        description: 'Positive reaction based on high attributes',
        tags: ['positive', 'attributes'],
        requiredContext: ['character']
      },
      {
        name: 'Suspicious Reaction',
        category: 'reactions',
        template: '{{#if character.reputation < 5}}I\'m not sure I trust you, stranger{{/if}}{{#if character.reputation >= 5}}Something seems off about you, {{character.name}}{{/if}}.',
        description: 'Suspicious reaction based on low reputation',
        tags: ['negative', 'reputation'],
        requiredContext: ['character']
      },
      {
        name: 'Surprised Reaction',
        category: 'reactions',
        template: '{{random:By the gods,Incredible,Astonishing}}! I never expected {{#if character.name}}{{character.name}}{{/if}}{{#if !character.name}}someone like you{{/if}} to {{random:say such a thing,do that,be here}}.',
        description: 'Surprised reaction with random expressions',
        tags: ['surprise', 'random'],
        requiredContext: []
      },
      {
        name: 'Thoughtful Reaction',
        category: 'reactions',
        template: '{{random:Hmm,Indeed,Interesting}}... {{#if character.attributes.wisdom > 14}}Your insight is valuable, {{character.name}}{{/if}}{{#if character.attributes.wisdom <= 14}}Let me consider this{{/if}}.',
        description: 'Thoughtful reaction with wisdom consideration',
        tags: ['thoughtful', 'wisdom'],
        requiredContext: ['character']
      },
      {
        name: 'Dismissive Reaction',
        category: 'reactions',
        template: '{{#if character.reputation < 10}}{{random:Bah,Nonsense,Ridiculous}}! {{#if character.name}}{{character.name}}, you{{/if}}{{#if !character.name}}You{{/if}} speak foolishly{{/if}}.',
        description: 'Dismissive reaction for low reputation characters',
        tags: ['negative', 'dismissive'],
        requiredContext: ['character']
      },
      {
        name: 'Encouraging Reaction',
        category: 'reactions',
        template: '{{random:Excellent,Well done,Splendid}}! {{#if character.attributes.charisma > 12}}You have a way with words, {{character.name}}{{/if}}{{#if character.reputation > 12}}Your reputation precedes you{{/if}}.',
        description: 'Encouraging reaction for positive interactions',
        tags: ['positive', 'encouraging'],
        requiredContext: ['character']
      },

      // Contextual Patterns
      {
        name: 'Weather Comment',
        category: 'reactions',
        template: '{{#if node.environmentalProperties.rainy}}This rain is {{random:refreshing,troublesome,persistent}}{{/if}}{{#if node.environmentalProperties.sunny}}What a {{random:beautiful,glorious,pleasant}} day{{/if}}{{#if node.environmentalProperties.cold}}Quite {{random:chilly,frigid,cold}} today{{/if}}.',
        description: 'Comment about weather based on environmental properties',
        tags: ['weather', 'environmental'],
        requiredContext: ['node']
      },
      {
        name: 'Crowd Observation',
        category: 'reactions',
        template: '{{#if node.environmentalProperties.crowded}}{{random:Quite busy,So many people,What a crowd}} here in {{node.name}}{{/if}}{{#if node.environmentalProperties.empty}}{{node.name}} seems {{random:quiet,deserted,peaceful}} today{{/if}}.',
        description: 'Observation about crowd levels',
        tags: ['crowd', 'observation'],
        requiredContext: ['node']
      },
      {
        name: 'Cultural Reference',
        category: 'questions',
        template: '{{#if node.culturalContext.customs}}Are you familiar with the {{node.culturalContext.customs}} customs of {{node.name}}?{{/if}}{{#if world.properties.religion}}Do you follow the {{world.properties.religion}} faith?{{/if}}',
        description: 'Reference to local culture or world religion',
        tags: ['culture', 'religion'],
        requiredContext: ['node', 'world']
      }
    ];
  }

  /**
   * Reset library to default patterns only
   */
  resetToDefaults() {
    this.patterns.clear();
    this.customPatterns.clear();
    this.patternCategories.clear();
    this.initializeDefaultPatterns();
  }

  /**
   * Validate a pattern object
   * @param {object} pattern - Pattern to validate
   * @returns {boolean} Whether pattern is valid
   */
  validatePattern(pattern) {
    if (!pattern || typeof pattern !== 'object') {
      return false;
    }

    // Required fields
    if (!pattern.name || typeof pattern.name !== 'string') {
      return false;
    }

    if (!pattern.template || typeof pattern.template !== 'string') {
      return false;
    }

    if (!pattern.category || typeof pattern.category !== 'string') {
      return false;
    }

    // Optional fields validation
    if (pattern.requiredContext && !Array.isArray(pattern.requiredContext)) {
      return false;
    }

    if (pattern.tags && !Array.isArray(pattern.tags)) {
      return false;
    }

    return true;
  }

  /**
   * Generate a unique pattern ID
   * @param {object} pattern - Pattern object
   * @returns {string} Generated ID
   */
  generatePatternId(pattern) {
    const timestamp = Date.now();
    const nameSlug = pattern.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${pattern.category}_${nameSlug}_${timestamp}`;
  }

  /**
   * Check if a pattern is available in the given context
   * @param {object} pattern - Pattern to check
   * @param {object} context - Available context
   * @returns {boolean} Whether pattern is available
   */
  isPatternAvailableInContext(pattern, context) {
    if (!pattern.requiredContext || pattern.requiredContext.length === 0) {
      return true; // No requirements, always available
    }

    // Check if all required context is available
    return pattern.requiredContext.every(requirement => {
      return context && context[requirement] !== undefined && context[requirement] !== null;
    });
  }

  /**
   * Calculate relevance score for a pattern given context
   * @param {object} pattern - Pattern to score
   * @param {object} context - Available context
   * @returns {number} Relevance score (0-100)
   */
  calculateRelevanceScore(pattern, context) {
    let score = 50; // Base score

    if (!pattern || !context) {
      return score;
    }

    // Check required context availability
    if (pattern.requiredContext && Array.isArray(pattern.requiredContext)) {
      const availableContexts = pattern.requiredContext.filter(req => context[req]);
      const contextScore = (availableContexts.length / pattern.requiredContext.length) * 30;
      score += contextScore;
    }

    // Boost score for matching interaction category
    if (context.interactionCategory && pattern.tags) {
      if (pattern.tags.includes(context.interactionCategory)) {
        score += 20;
      }
    }

    // Boost score for attribute-based patterns when character has high attributes
    if (context.character && context.character.attributes && pattern.tags) {
      const attributeTags = pattern.tags.filter(tag => 
        ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(tag)
      );
      
      attributeTags.forEach(attr => {
        if (context.character.attributes[attr] && context.character.attributes[attr] > 14) {
          score += 10;
        }
      });
    }

    // Boost score for reputation-based patterns
    if (context.character && context.character.reputation !== undefined && pattern.tags) {
      if (pattern.tags.includes('reputation') || pattern.tags.includes('reputation-based')) {
        score += 15;
      }
    }

    // Boost score for location-based patterns when node context is available
    if (context.node && pattern.tags) {
      if (pattern.tags.includes('location') || pattern.tags.includes('environmental')) {
        score += 15;
      }
    }

    // Cap the score at 100
    return Math.min(score, 100);
  }

  /**
   * Get category statistics
   * @returns {object} Category statistics
   */
  getCategoryStats() {
    const stats = {};
    
    // Initialize stats for all categories
    this.patternCategories.forEach(category => {
      stats[category] = { total: 0, custom: 0, default: 0 };
    });

    // Count default patterns
    this.patterns.forEach(pattern => {
      if (stats[pattern.category]) {
        stats[pattern.category].total++;
        stats[pattern.category].default++;
      }
    });

    // Count custom patterns
    this.customPatterns.forEach(pattern => {
      if (stats[pattern.category]) {
        stats[pattern.category].total++;
        stats[pattern.category].custom++;
      }
    });

    return stats;
  }

  /**
   * Get library statistics
   * @returns {object} Library statistics
   */
  getLibraryStats() {
    return {
      totalPatterns: this.patterns.size + this.customPatterns.size,
      defaultPatterns: this.patterns.size,
      customPatterns: this.customPatterns.size,
      categories: this.patternCategories.size,
      categoryStats: this.getCategoryStats()
    };
  }
}

// Create singleton instance
const dialoguePatternLibrary = new DialoguePatternLibrary();

export default dialoguePatternLibrary;
export { DialoguePatternLibrary };