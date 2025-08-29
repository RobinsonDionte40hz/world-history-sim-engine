/**
 * TemplateContextValidator - Validates placeholder availability against context
 * Provides warnings for placeholders that may not resolve and fallback handling
 */
class TemplateContextValidator {
  constructor() {
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
    this.conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;
  }

  /**
   * Validate that placeholders reference available data in context
   * @param {string} template - Template string to validate
   * @param {object} context - Available context data
   * @returns {object} - Validation result with availability info
   */
  validateContextAvailability(template, context = {}) {
    if (!template || typeof template !== 'string') {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        availabilityMap: new Map(),
        missingPlaceholders: [],
        suggestions: []
      };
    }

    const errors = [];
    const warnings = [];
    const availabilityMap = new Map();
    const missingPlaceholders = [];
    const suggestions = [];

    try {
      // Extract all placeholders from template
      const placeholders = this.extractAllPlaceholders(template);
      
      // Check availability for each placeholder
      for (const placeholder of placeholders) {
        const availability = this.checkPlaceholderAvailability(placeholder, context);
        availabilityMap.set(placeholder, availability);
        
        if (!availability.available) {
          missingPlaceholders.push(placeholder);
          
          if (availability.severity === 'error') {
            errors.push(`Placeholder not available: {{${placeholder}}}`);
          } else {
            warnings.push(`Placeholder may not resolve: {{${placeholder}}} - ${availability.reason}`);
          }
          
          // Add suggestions for missing placeholders
          const placeholderSuggestions = this.suggestAlternatives(placeholder, context);
          suggestions.push(...placeholderSuggestions);
        } else if (availability.warning) {
          warnings.push(`Placeholder warning: {{${placeholder}}} - ${availability.warning}`);
        }
      }

      // Check for context data that's available but not used
      const unusedContextSuggestions = this.suggestUnusedContext(placeholders, context);
      suggestions.push(...unusedContextSuggestions);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        availabilityMap,
        missingPlaceholders,
        suggestions
      };
    } catch (error) {
      errors.push(`Context validation failed: ${error.message}`);
      return {
        isValid: false,
        errors,
        warnings,
        availabilityMap: new Map(),
        missingPlaceholders: [],
        suggestions: []
      };
    }
  }

  /**
   * Extract all placeholders from template including conditionals
   * @param {string} template - Template string
   * @returns {Set} - Set of unique placeholder names
   */
  extractAllPlaceholders(template) {
    const placeholders = new Set();
    
    // Extract regular placeholders
    let match;
    const regex = new RegExp(this.placeholderRegex);
    while ((match = regex.exec(template)) !== null) {
      const placeholder = match[1].trim();
      
      // Skip conditionals and random selections
      if (!placeholder.startsWith('#if') && 
          !placeholder.startsWith('/if') && 
          !placeholder.startsWith('random:')) {
        placeholders.add(placeholder);
      }
    }
    
    // Extract placeholders from conditionals
    const conditionalMatches = template.matchAll(this.conditionalRegex);
    for (const conditionalMatch of conditionalMatches) {
      const condition = conditionalMatch[1];
      const conditionPlaceholders = this.extractPlaceholdersFromCondition(condition);
      conditionPlaceholders.forEach(p => placeholders.add(p));
      
      // Also check content inside conditional
      const content = conditionalMatch[2];
      const contentPlaceholders = this.extractAllPlaceholders(content);
      contentPlaceholders.forEach(p => placeholders.add(p));
    }
    
    return placeholders;
  }

  /**
   * Extract placeholders from a condition string
   * @param {string} condition - Condition string
   * @returns {string[]} - Array of placeholder names
   */
  extractPlaceholdersFromCondition(condition) {
    const placeholders = [];
    const operators = ['>=', '<=', '>', '<', '==', '!='];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        if (!this.isLiteral(left)) placeholders.push(left);
        if (!this.isLiteral(right)) placeholders.push(right);
        return placeholders;
      }
    }
    
    // No operator found, entire condition is a placeholder
    if (!this.isLiteral(condition.trim())) {
      placeholders.push(condition.trim());
    }
    
    return placeholders;
  }

  /**
   * Check if a placeholder is available in the context
   * @param {string} placeholder - Placeholder path
   * @param {object} context - Context object
   * @returns {object} - Availability information
   */
  checkPlaceholderAvailability(placeholder, context) {
    const path = placeholder.split('.');
    let current = context;
    let availablePath = '';
    
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      availablePath = availablePath ? `${availablePath}.${segment}` : segment;
      
      if (!current || typeof current !== 'object') {
        return {
          available: false,
          severity: 'error',
          reason: `Path stops at '${availablePath.substring(0, availablePath.lastIndexOf('.'))}' - not an object`,
          partialPath: availablePath.substring(0, availablePath.lastIndexOf('.')),
          missingSegment: segment
        };
      }
      
      if (!current.hasOwnProperty(segment)) {
        // Check if this is a common typo or alternative
        const alternatives = this.findSimilarKeys(segment, current);
        
        return {
          available: false,
          severity: alternatives.length > 0 ? 'warning' : 'error',
          reason: alternatives.length > 0 
            ? `Property '${segment}' not found, did you mean: ${alternatives.join(', ')}?`
            : `Property '${segment}' not found in context`,
          partialPath: availablePath.substring(0, availablePath.lastIndexOf('.')),
          missingSegment: segment,
          alternatives
        };
      }
      
      current = current[segment];
    }
    
    // Check for potential issues with the resolved value
    const warnings = this.checkValueWarnings(current, placeholder);
    
    return {
      available: true,
      value: current,
      type: typeof current,
      warning: warnings.length > 0 ? warnings.join('; ') : null
    };
  }

  /**
   * Find similar keys that might be typos
   * @param {string} target - Target key name
   * @param {object} obj - Object to search in
   * @returns {string[]} - Array of similar key names
   */
  findSimilarKeys(target, obj) {
    if (!obj || typeof obj !== 'object') return [];
    
    const keys = Object.keys(obj);
    const similar = [];
    
    for (const key of keys) {
      // Check for case differences
      if (key.toLowerCase() === target.toLowerCase() && key !== target) {
        similar.push(key);
      }
      
      // Check for common typos (Levenshtein distance of 1-2)
      if (this.calculateLevenshteinDistance(target, key) <= 2 && key.length > 2) {
        similar.push(key);
      }
      
      // Check for underscore/camelCase variations
      const targetNormalized = target.replace(/_/g, '').toLowerCase();
      const keyNormalized = key.replace(/_/g, '').toLowerCase();
      if (targetNormalized === keyNormalized && target !== key) {
        similar.push(key);
      }
    }
    
    return similar.slice(0, 3); // Limit to top 3 suggestions
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} - Edit distance
   */
  calculateLevenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  /**
   * Check for warnings about resolved values
   * @param {any} value - Resolved value
   * @param {string} placeholder - Placeholder path
   * @returns {string[]} - Array of warning messages
   */
  checkValueWarnings(value, placeholder) {
    const warnings = [];
    
    if (value === null) {
      warnings.push('Value is null');
    } else if (value === undefined) {
      warnings.push('Value is undefined');
    } else if (value === '') {
      warnings.push('Value is empty string');
    } else if (typeof value === 'number' && isNaN(value)) {
      warnings.push('Value is NaN');
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      warnings.push('Value is an object - will display as [object Object]');
    } else if (Array.isArray(value)) {
      warnings.push(`Value is an array with ${value.length} items - will display as comma-separated list`);
    } else if (typeof value === 'function') {
      warnings.push('Value is a function - will not display properly');
    }
    
    return warnings;
  }

  /**
   * Suggest alternative placeholders for missing ones
   * @param {string} placeholder - Missing placeholder
   * @param {object} context - Available context
   * @returns {object[]} - Array of suggestion objects
   */
  suggestAlternatives(placeholder, context) {
    const suggestions = [];
    const path = placeholder.split('.');
    
    // If it's a nested path, suggest available properties at each level
    if (path.length > 1) {
      let current = context;
      let currentPath = '';
      
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        currentPath = currentPath ? `${currentPath}.${segment}` : segment;
        
        if (current && current[segment]) {
          current = current[segment];
          
          if (typeof current === 'object' && current !== null) {
            const availableProps = Object.keys(current);
            for (const prop of availableProps) {
              suggestions.push({
                type: 'alternative',
                placeholder: `${currentPath}.${prop}`,
                description: `Available property: ${prop}`,
                confidence: 'medium'
              });
            }
          }
        } else {
          break;
        }
      }
    }
    
    // Suggest similar top-level properties
    const topLevelSimilar = this.findSimilarKeys(path[0], context);
    for (const similar of topLevelSimilar) {
      suggestions.push({
        type: 'typo-fix',
        placeholder: placeholder.replace(path[0], similar),
        description: `Did you mean '${similar}' instead of '${path[0]}'?`,
        confidence: 'high'
      });
    }
    
    // Suggest common placeholder patterns
    const commonSuggestions = this.getCommonPlaceholderSuggestions(placeholder, context);
    suggestions.push(...commonSuggestions);
    
    return suggestions.slice(0, 5); // Limit suggestions
  }

  /**
   * Get common placeholder suggestions based on context
   * @param {string} placeholder - Original placeholder
   * @param {object} context - Available context
   * @returns {object[]} - Array of common suggestions
   */
  getCommonPlaceholderSuggestions(placeholder, context) {
    const suggestions = [];
    
    // Character-related suggestions
    if (context.character) {
      if (placeholder.includes('name') && context.character.name) {
        suggestions.push({
          type: 'common',
          placeholder: 'character.name',
          description: 'Character name',
          confidence: 'high'
        });
      }
      
      if (placeholder.includes('strength') && context.character.attributes?.strength !== undefined) {
        suggestions.push({
          type: 'common',
          placeholder: 'character.attributes.strength',
          description: 'Character strength attribute',
          confidence: 'high'
        });
      }
    }
    
    // Node-related suggestions
    if (context.node) {
      if (placeholder.includes('name') && context.node.name) {
        suggestions.push({
          type: 'common',
          placeholder: 'node.name',
          description: 'Node name',
          confidence: 'high'
        });
      }
      
      if (placeholder.includes('type') && context.node.type) {
        suggestions.push({
          type: 'common',
          placeholder: 'node.type',
          description: 'Node type',
          confidence: 'high'
        });
      }
    }
    
    // World-related suggestions
    if (context.world) {
      if (placeholder.includes('name') && context.world.name) {
        suggestions.push({
          type: 'common',
          placeholder: 'world.name',
          description: 'World name',
          confidence: 'high'
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Suggest unused context data that could be helpful
   * @param {Set} usedPlaceholders - Set of placeholders used in template
   * @param {object} context - Available context
   * @returns {object[]} - Array of unused context suggestions
   */
  suggestUnusedContext(usedPlaceholders, context) {
    const suggestions = [];
    const usedPaths = new Set(usedPlaceholders);
    
    // Recursively find available but unused paths
    const findUnusedPaths = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
      
      Object.keys(obj).forEach(key => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        
        if (!usedPaths.has(fullPath)) {
          const value = obj[key];
          
          // Only suggest simple values that would be useful in templates
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            suggestions.push({
              type: 'unused-context',
              placeholder: fullPath,
              description: `Available but unused: ${this.getDescriptionForPath(fullPath)}`,
              value: value,
              confidence: 'low'
            });
          }
        }
        
        // Recurse for nested objects (limit depth)
        if (typeof obj[key] === 'object' && obj[key] !== null && prefix.split('.').length < 2) {
          findUnusedPaths(obj[key], fullPath);
        }
      });
    };
    
    findUnusedPaths(context);
    
    return suggestions.slice(0, 3); // Limit unused suggestions
  }

  /**
   * Get description for a placeholder path
   * @param {string} path - Placeholder path
   * @returns {string} - Description
   */
  getDescriptionForPath(path) {
    const descriptions = {
      'character.name': 'Character name',
      'character.attributes.strength': 'Character strength',
      'character.attributes.dexterity': 'Character dexterity',
      'character.attributes.constitution': 'Character constitution',
      'character.attributes.intelligence': 'Character intelligence',
      'character.attributes.wisdom': 'Character wisdom',
      'character.attributes.charisma': 'Character charisma',
      'character.personality.aggression': 'Aggression level',
      'character.personality.curiosity': 'Curiosity level',
      'character.personality.empathy': 'Empathy level',
      'node.name': 'Location name',
      'node.type': 'Location type',
      'world.name': 'World name'
    };
    
    return descriptions[path] || `Property: ${path}`;
  }

  /**
   * Check if a value is a literal (number or quoted string)
   * @param {string} value - Value to check
   * @returns {boolean} - True if literal
   */
  isLiteral(value) {
    return !isNaN(value) || 
           (value.startsWith('"') && value.endsWith('"')) || 
           (value.startsWith("'") && value.endsWith("'")) ||
           value === 'true' ||
           value === 'false';
  }

  /**
   * Create fallback handling for missing context data
   * @param {string} template - Template string
   * @param {object} context - Available context
   * @param {object} fallbackOptions - Fallback configuration
   * @returns {object} - Fallback handling result
   */
  createFallbackHandling(template, context, fallbackOptions = {}) {
    const {
      showPlaceholders = true,
      defaultValues = {},
      removeUnresolved = false,
      warnOnFallback = true
    } = fallbackOptions;

    const validation = this.validateContextAvailability(template, context);
    const fallbacks = new Map();
    const warnings = [];

    for (const placeholder of validation.missingPlaceholders) {
      let fallbackValue;
      
      if (defaultValues[placeholder]) {
        fallbackValue = defaultValues[placeholder];
      } else if (removeUnresolved) {
        fallbackValue = '';
      } else if (showPlaceholders) {
        fallbackValue = `{{${placeholder}}}`;
      } else {
        fallbackValue = `[${placeholder}]`;
      }
      
      fallbacks.set(placeholder, fallbackValue);
      
      if (warnOnFallback) {
        warnings.push(`Using fallback for missing placeholder: ${placeholder}`);
      }
    }

    return {
      fallbacks,
      warnings,
      hasUnresolved: validation.missingPlaceholders.length > 0
    };
  }

  /**
   * Provide user guidance for resolving context issues
   * @param {object} validationResult - Result from validateContextAvailability
   * @returns {object[]} - Array of guidance objects
   */
  provideUserGuidance(validationResult) {
    const guidance = [];
    
    if (validationResult.missingPlaceholders.length > 0) {
      guidance.push({
        type: 'missing-data',
        title: 'Missing Context Data',
        message: `${validationResult.missingPlaceholders.length} placeholder(s) cannot be resolved with current context`,
        actions: [
          'Check that the required data is available in the current context',
          'Verify placeholder spelling and path structure',
          'Consider using conditional statements to handle missing data'
        ]
      });
    }
    
    if (validationResult.suggestions.length > 0) {
      const typoFixes = validationResult.suggestions.filter(s => s.type === 'typo-fix');
      if (typoFixes.length > 0) {
        guidance.push({
          type: 'typo-suggestions',
          title: 'Possible Typos Detected',
          message: 'Some placeholders might have typos',
          suggestions: typoFixes
        });
      }
      
      const alternatives = validationResult.suggestions.filter(s => s.type === 'alternative');
      if (alternatives.length > 0) {
        guidance.push({
          type: 'alternatives',
          title: 'Available Alternatives',
          message: 'Consider these available placeholders',
          suggestions: alternatives
        });
      }
    }
    
    if (validationResult.warnings.length > 0) {
      guidance.push({
        type: 'warnings',
        title: 'Potential Issues',
        message: 'These placeholders may not work as expected',
        warnings: validationResult.warnings
      });
    }
    
    return guidance;
  }
}

export default TemplateContextValidator;