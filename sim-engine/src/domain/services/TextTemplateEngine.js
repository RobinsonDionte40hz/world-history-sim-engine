/**
 * TextTemplateEngine - Core engine for processing text templates with placeholder resolution
 * Supports {{placeholder}} syntax, conditional blocks, and random text selection
 */
class TextTemplateEngine {
  constructor() {
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
    this.conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;
    this.randomRegex = /\{\{random:([^}]*)\}\}/g;
  }

  /**
   * Resolve a template string with the provided context
   * @param {string} template - Template string with placeholders
   * @param {object} context - Context object containing data for placeholder resolution
   * @returns {object} - { resolved: string, errors: string[], warnings: string[] }
   */
  resolve(template, context = {}) {
    if (!template || typeof template !== 'string') {
      return {
        resolved: template || '',
        errors: [],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];
    let resolved = template;

    try {
      // First, process conditional blocks
      resolved = this.processConditionals(resolved, context, errors, warnings);
      
      // Then process random selections
      resolved = this.processRandomSelections(resolved, errors, warnings);
      
      // Finally, resolve regular placeholders
      resolved = this.resolvePlaceholders(resolved, context, errors, warnings);

      return {
        resolved,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Template processing failed: ${error.message}`);
      return {
        resolved: template,
        errors,
        warnings
      };
    }
  }

  /**
   * Process conditional blocks in the template
   * @param {string} template - Template string
   * @param {object} context - Context object
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   * @returns {string} - Processed template
   */
  processConditionals(template, context, errors, warnings) {
    // Process conditionals iteratively to handle nesting
    let processed = template;
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops
    
    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;
      
      processed = processed.replace(this.conditionalRegex, (match, condition, content) => {
        try {
          // Check if condition references non-existent properties
          const placeholders = this.extractPlaceholdersFromCondition(condition.trim());
          const missingPlaceholders = placeholders.filter(placeholder => {
            return this.getNestedValue(context, placeholder) === undefined && !this.isLiteral(placeholder);
          });
          
          if (missingPlaceholders.length > 0) {
            errors.push(`Conditional references missing placeholders: ${missingPlaceholders.join(', ')}`);
            return match;
          }
          
          const result = this.evaluateCondition(condition.trim(), context);
          hasChanges = true;
          return result ? content : '';
        } catch (error) {
          errors.push(`Conditional evaluation failed: ${condition} - ${error.message}`);
          return match; // Return original if evaluation fails
        }
      });
    }
    
    return processed;
  }

  /**
   * Process random text selections
   * @param {string} template - Template string
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   * @returns {string} - Processed template
   */
  processRandomSelections(template, errors, warnings) {
    return template.replace(this.randomRegex, (match, options) => {
      try {
        const choices = options.split(',').map(choice => choice.trim()).filter(choice => choice.length > 0);
        if (choices.length === 0) {
          errors.push(`Empty random selection: ${match}`);
          return match;
        }
        const randomIndex = Math.floor(Math.random() * choices.length);
        return choices[randomIndex];
      } catch (error) {
        errors.push(`Random selection failed: ${match} - ${error.message}`);
        return match;
      }
    });
  }

  /**
   * Resolve regular placeholders in the template
   * @param {string} template - Template string
   * @param {object} context - Context object
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   * @returns {string} - Processed template
   */
  resolvePlaceholders(template, context, errors, warnings) {
    return template.replace(this.placeholderRegex, (match, placeholder) => {
      try {
        const value = this.getNestedValue(context, placeholder.trim());
        if (value === undefined || value === null) {
          errors.push(`Placeholder not found: ${placeholder}`);
          return match; // Keep original placeholder if not found
        }
        return String(value);
      } catch (error) {
        errors.push(`Placeholder resolution failed: ${placeholder} - ${error.message}`);
        return match;
      }
    });
  }

  /**
   * Evaluate a condition string against the context
   * @param {string} condition - Condition to evaluate (e.g., "character.attributes.strength > 15")
   * @param {object} context - Context object
   * @returns {boolean} - Evaluation result
   */
  evaluateCondition(condition, context) {
    // Simple condition evaluation - supports basic comparisons
    const operators = ['>=', '<=', '>', '<', '==', '!='];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const leftValue = this.getNestedValue(context, left);
        
        let rightValue;
        // Handle quoted strings
        if ((right.startsWith('"') && right.endsWith('"')) || (right.startsWith("'") && right.endsWith("'"))) {
          rightValue = right.slice(1, -1); // Remove quotes
        } else if (!isNaN(right)) {
          rightValue = parseFloat(right);
        } else {
          rightValue = this.getNestedValue(context, right);
        }
        
        switch (op) {
          case '>': return leftValue > rightValue;
          case '<': return leftValue < rightValue;
          case '>=': return leftValue >= rightValue;
          case '<=': return leftValue <= rightValue;
          case '==': return leftValue == rightValue;
          case '!=': return leftValue != rightValue;
        }
      }
    }
    
    // If no operator found, treat as boolean check
    const value = this.getNestedValue(context, condition);
    return Boolean(value);
  }

  /**
   * Get nested value from object using dot notation
   * @param {object} obj - Object to search
   * @param {string} path - Dot-separated path (e.g., "character.attributes.strength")
   * @returns {any} - Value at path or undefined
   */
  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Extract all placeholders from a template
   * @param {string} template - Template string
   * @returns {string[]} - Array of unique placeholder names
   */
  extractPlaceholders(template) {
    if (!template || typeof template !== 'string') return [];
    
    const placeholders = new Set();
    
    // Extract regular placeholders
    let match;
    const regex = new RegExp(this.placeholderRegex);
    while ((match = regex.exec(template)) !== null) {
      placeholders.add(match[1].trim());
    }
    
    // Extract placeholders from conditionals
    const conditionalMatches = template.matchAll(this.conditionalRegex);
    for (const conditionalMatch of conditionalMatches) {
      const condition = conditionalMatch[1];
      const conditionPlaceholders = this.extractPlaceholdersFromCondition(condition);
      conditionPlaceholders.forEach(p => placeholders.add(p));
      
      // Also check content inside conditional
      const content = conditionalMatch[2];
      const contentPlaceholders = this.extractPlaceholders(content);
      contentPlaceholders.forEach(p => placeholders.add(p));
    }
    
    return Array.from(placeholders);
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
   * Check if a value is a literal (number or quoted string)
   * @param {string} value - Value to check
   * @returns {boolean} - True if literal
   */
  isLiteral(value) {
    return !isNaN(value) || (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  }

  /**
   * Validate a template for syntax errors
   * @param {string} template - Template to validate
   * @returns {object} - { isValid: boolean, errors: string[], warnings: string[] }
   */
  validateTemplate(template) {
    const errors = [];
    const warnings = [];
    
    if (!template || typeof template !== 'string') {
      return { isValid: true, errors, warnings };
    }

    try {
      // Check for unmatched braces
      const openBraces = (template.match(/\{\{/g) || []).length;
      const closeBraces = (template.match(/\}\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push('Unmatched template braces');
      }

      // Check for unmatched conditionals
      const ifBlocks = (template.match(/\{\{#if/g) || []).length;
      const endifBlocks = (template.match(/\{\{\/if\}\}/g) || []).length;
      
      if (ifBlocks !== endifBlocks) {
        errors.push('Unmatched conditional blocks');
      }

      // Check for empty placeholders
      if (template.includes('{{}}')) {
        errors.push('Empty placeholder found');
      }

      // Check for nested placeholders (not supported)
      const nestedPlaceholders = template.match(/\{\{[^}]*\{\{[^}]*\}\}[^}]*\}\}/g);
      if (nestedPlaceholders) {
        errors.push('Nested placeholders are not supported');
      }

      // Extract and validate placeholders
      const placeholders = this.extractPlaceholders(template);
      if (placeholders.length === 0 && template.includes('{{')) {
        warnings.push('Template contains braces but no valid placeholders');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Template validation failed: ${error.message}`);
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Get context-aware suggestions for placeholders
   * @param {object} context - Available context
   * @returns {object[]} - Array of suggestion objects
   */
  getPlaceholderSuggestions(context) {
    const suggestions = [];
    
    const addSuggestions = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        suggestions.push({
          placeholder: fullPath,
          type: typeof value,
          description: this.getDescriptionForPath(fullPath),
          example: this.getExampleForValue(value)
        });
        
        // Recursively add nested suggestions (limit depth to avoid infinite recursion)
        if (typeof value === 'object' && value !== null && prefix.split('.').length < 2) {
          addSuggestions(value, fullPath);
        }
      });
    };
    
    addSuggestions(context);
    return suggestions;
  }

  /**
   * Get description for a placeholder path
   * @param {string} path - Placeholder path
   * @returns {string} - Description
   */
  getDescriptionForPath(path) {
    const descriptions = {
      'character.name': 'Character name',
      'character.attributes.strength': 'Character strength attribute',
      'character.attributes.dexterity': 'Character dexterity attribute',
      'character.attributes.constitution': 'Character constitution attribute',
      'character.attributes.intelligence': 'Character intelligence attribute',
      'character.attributes.wisdom': 'Character wisdom attribute',
      'character.attributes.charisma': 'Character charisma attribute',
      'character.personality.aggression': 'Character aggression level',
      'character.personality.curiosity': 'Character curiosity level',
      'character.personality.empathy': 'Character empathy level',
      'node.name': 'Node name',
      'node.type': 'Node type',
      'node.environmentalProperties': 'Environmental properties of the node',
      'node.culturalContext': 'Cultural context of the node',
      'world.name': 'World name',
      'world.theme': 'World theme'
    };
    
    return descriptions[path] || `Value at ${path}`;
  }

  /**
   * Get example value for display
   * @param {any} value - Value to get example for
   * @returns {string} - Example string
   */
  getExampleForValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object' && value !== null) return '{object}';
    return String(value);
  }
}

export default TextTemplateEngine;