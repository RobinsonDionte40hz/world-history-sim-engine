/**
 * TemplateValidationService - Comprehensive template validation combining syntax and context validation
 * Provides unified validation interface with real-time error reporting and user guidance
 */
import TemplateSyntaxValidator from './TemplateSyntaxValidator';
import TemplateContextValidator from './TemplateContextValidator';

class TemplateValidationService {
  constructor() {
    this.syntaxValidator = new TemplateSyntaxValidator();
    this.contextValidator = new TemplateContextValidator();
  }

  /**
   * Perform comprehensive template validation
   * @param {string} template - Template string to validate
   * @param {object} context - Available context data
   * @param {object} options - Validation options
   * @returns {object} - Complete validation result
   */
  validateTemplate(template, context = {}, options = {}) {
    const {
      validateSyntax = true,
      validateContext = true,
      includeWarnings = true,
      includeSuggestions = true,
      realTimeMode = false
    } = options;

    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      syntaxElements: [],
      availabilityMap: new Map(),
      missingPlaceholders: [],
      suggestions: [],
      guidance: [],
      performance: {
        syntaxValidationTime: 0,
        contextValidationTime: 0,
        totalTime: 0
      }
    };

    const startTime = performance.now();

    try {
      // Perform syntax validation
      if (validateSyntax) {
        const syntaxStart = performance.now();
        const syntaxResult = this.syntaxValidator.validateTemplate(template);
        result.performance.syntaxValidationTime = performance.now() - syntaxStart;

        result.errors.push(...syntaxResult.errors);
        if (includeWarnings) {
          result.warnings.push(...syntaxResult.warnings);
        }
        result.syntaxElements = syntaxResult.syntaxElements;

        // If syntax is invalid, don't proceed with context validation
        if (!syntaxResult.isValid && !realTimeMode) {
          result.isValid = false;
          result.performance.totalTime = performance.now() - startTime;
          return result;
        }
      }

      // Perform context validation
      if (validateContext) {
        const contextStart = performance.now();
        const contextResult = this.contextValidator.validateContextAvailability(template, context);
        result.performance.contextValidationTime = performance.now() - contextStart;

        result.errors.push(...contextResult.errors);
        if (includeWarnings) {
          result.warnings.push(...contextResult.warnings);
        }
        result.availabilityMap = contextResult.availabilityMap;
        result.missingPlaceholders = contextResult.missingPlaceholders;

        if (includeSuggestions) {
          result.suggestions.push(...contextResult.suggestions);
        }

        // Generate user guidance
        result.guidance = this.contextValidator.provideUserGuidance(contextResult);
      }

      // Determine overall validity
      result.isValid = result.errors.length === 0;
      result.performance.totalTime = performance.now() - startTime;

      return result;
    } catch (error) {
      result.errors.push(`Validation failed: ${error.message}`);
      result.isValid = false;
      result.performance.totalTime = performance.now() - startTime;
      return result;
    }
  }

  /**
   * Validate template syntax only (faster for real-time validation)
   * @param {string} template - Template string
   * @returns {object} - Syntax validation result
   */
  validateSyntaxOnly(template) {
    return this.syntaxValidator.validateTemplate(template);
  }

  /**
   * Validate context availability only
   * @param {string} template - Template string
   * @param {object} context - Available context
   * @returns {object} - Context validation result
   */
  validateContextOnly(template, context) {
    return this.contextValidator.validateContextAvailability(template, context);
  }

  /**
   * Get real-time validation for typing scenarios
   * @param {string} template - Current template text
   * @param {object} context - Available context
   * @param {object} options - Real-time options
   * @returns {object} - Lightweight validation result
   */
  getRealTimeValidation(template, context = {}, options = {}) {
    const {
      debounceMs = 300,
      maxErrors = 5,
      prioritizeSyntax = true
    } = options;

    // For real-time, prioritize syntax validation and limit error reporting
    const result = this.validateTemplate(template, context, {
      validateSyntax: true,
      validateContext: !prioritizeSyntax || template.length > 50, // Only validate context for longer templates
      includeWarnings: false, // Skip warnings for performance
      includeSuggestions: false, // Skip suggestions for performance
      realTimeMode: true
    });

    // Limit errors for better UX
    if (result.errors.length > maxErrors) {
      result.errors = result.errors.slice(0, maxErrors);
      result.errors.push(`... and ${result.errors.length - maxErrors} more errors`);
    }

    return result;
  }

  /**
   * Get syntax highlighting information
   * @param {string} template - Template string
   * @returns {object[]} - Array of syntax elements for highlighting
   */
  getSyntaxHighlighting(template) {
    const syntaxResult = this.syntaxValidator.validateTemplate(template);
    return syntaxResult.syntaxElements.map(element => ({
      ...element,
      className: this.getSyntaxHighlightClass(element.type, syntaxResult.errors.length > 0)
    }));
  }

  /**
   * Get CSS class for syntax highlighting
   * @param {string} type - Element type
   * @param {boolean} hasErrors - Whether template has errors
   * @returns {string} - CSS class name
   */
  getSyntaxHighlightClass(type, hasErrors) {
    const baseClasses = {
      'placeholder': 'template-placeholder',
      'conditional-start': 'template-conditional-start',
      'conditional-end': 'template-conditional-end',
      'random-selection': 'template-random'
    };

    const errorClass = hasErrors ? ' template-error' : '';
    return (baseClasses[type] || 'template-unknown') + errorClass;
  }

  /**
   * Create validation report for debugging
   * @param {string} template - Template string
   * @param {object} context - Available context
   * @returns {object} - Detailed validation report
   */
  createValidationReport(template, context = {}) {
    const fullValidation = this.validateTemplate(template, context, {
      validateSyntax: true,
      validateContext: true,
      includeWarnings: true,
      includeSuggestions: true
    });

    const report = {
      template,
      contextSummary: this.summarizeContext(context),
      validation: fullValidation,
      recommendations: this.generateRecommendations(fullValidation),
      debugInfo: {
        templateLength: template.length,
        placeholderCount: (template.match(/\{\{[^}]+\}\}/g) || []).length,
        conditionalCount: (template.match(/\{\{#if/g) || []).length,
        randomCount: (template.match(/\{\{random:/g) || []).length,
        contextDepth: this.calculateContextDepth(context),
        validationTime: fullValidation.performance.totalTime
      }
    };

    return report;
  }

  /**
   * Summarize context for reporting
   * @param {object} context - Context object
   * @returns {object} - Context summary
   */
  summarizeContext(context) {
    const summary = {
      hasCharacter: !!context.character,
      hasNode: !!context.node,
      hasWorld: !!context.world,
      totalProperties: 0,
      availablePaths: []
    };

    const countProperties = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const path = prefix ? `${prefix}.${key}` : key;
        summary.totalProperties++;
        
        if (typeof obj[key] !== 'object' || obj[key] === null) {
          summary.availablePaths.push(path);
        } else {
          countProperties(obj[key], path);
        }
      });
    };

    countProperties(context);
    return summary;
  }

  /**
   * Calculate context depth for analysis
   * @param {object} context - Context object
   * @returns {number} - Maximum depth
   */
  calculateContextDepth(context) {
    const getDepth = (obj, currentDepth = 0) => {
      if (!obj || typeof obj !== 'object') return currentDepth;
      
      let maxDepth = currentDepth;
      Object.values(obj).forEach(value => {
        if (typeof value === 'object' && value !== null) {
          maxDepth = Math.max(maxDepth, getDepth(value, currentDepth + 1));
        }
      });
      
      return maxDepth;
    };

    return getDepth(context);
  }

  /**
   * Generate recommendations based on validation results
   * @param {object} validationResult - Validation result
   * @returns {object[]} - Array of recommendations
   */
  generateRecommendations(validationResult) {
    const recommendations = [];

    // Syntax recommendations
    if (validationResult.errors.some(e => e.includes('Unmatched'))) {
      recommendations.push({
        type: 'syntax',
        priority: 'high',
        title: 'Fix Syntax Errors',
        description: 'Template has unmatched braces or conditional blocks',
        action: 'Check that all {{ have matching }} and all {{#if}} have matching {{/if}}'
      });
    }

    // Context recommendations
    if (validationResult.missingPlaceholders.length > 0) {
      recommendations.push({
        type: 'context',
        priority: 'medium',
        title: 'Missing Context Data',
        description: `${validationResult.missingPlaceholders.length} placeholder(s) cannot be resolved`,
        action: 'Ensure required data is available or use conditional statements'
      });
    }

    // Performance recommendations
    if (validationResult.performance.totalTime > 10) {
      recommendations.push({
        type: 'performance',
        priority: 'low',
        title: 'Validation Performance',
        description: 'Template validation is taking longer than expected',
        action: 'Consider simplifying the template or reducing placeholder count'
      });
    }

    // Complexity recommendations
    const placeholderCount = validationResult.syntaxElements.length;
    if (placeholderCount > 20) {
      recommendations.push({
        type: 'complexity',
        priority: 'low',
        title: 'Template Complexity',
        description: `Template has ${placeholderCount} placeholders`,
        action: 'Consider breaking into smaller, more focused templates'
      });
    }

    return recommendations;
  }

  /**
   * Validate multiple templates in batch
   * @param {object[]} templates - Array of {template, context} objects
   * @param {object} options - Batch validation options
   * @returns {object[]} - Array of validation results
   */
  validateBatch(templates, options = {}) {
    const {
      stopOnFirstError = false,
      includePerformanceMetrics = false
    } = options;

    const results = [];
    const batchStartTime = performance.now();

    for (let i = 0; i < templates.length; i++) {
      const { template, context, id } = templates[i];
      
      const result = this.validateTemplate(template, context, options);
      result.templateId = id || i;
      
      results.push(result);
      
      if (stopOnFirstError && !result.isValid) {
        break;
      }
    }

    if (includePerformanceMetrics) {
      const batchTime = performance.now() - batchStartTime;
      return {
        results,
        batchMetrics: {
          totalTime: batchTime,
          averageTime: batchTime / results.length,
          templatesProcessed: results.length,
          errorsFound: results.reduce((sum, r) => sum + r.errors.length, 0),
          warningsFound: results.reduce((sum, r) => sum + r.warnings.length, 0)
        }
      };
    }

    return results;
  }

  /**
   * Get validation suggestions for autocomplete
   * @param {string} partialTemplate - Partial template text
   * @param {object} context - Available context
   * @param {number} cursorPosition - Current cursor position
   * @returns {object[]} - Array of autocomplete suggestions
   */
  getAutocompleteSuggestions(partialTemplate, context, cursorPosition) {
    const suggestions = [];
    
    // Check if cursor is inside a placeholder
    const beforeCursor = partialTemplate.substring(0, cursorPosition);
    const afterCursor = partialTemplate.substring(cursorPosition);
    
    const openBraceMatch = beforeCursor.match(/\{\{([^}]*)$/);
    const closeBraceMatch = afterCursor.match(/^([^}]*)\}\}/);
    
    if (openBraceMatch) {
      const partialPlaceholder = openBraceMatch[1];
      
      // Generate context-based suggestions
      const contextSuggestions = this.generateContextSuggestions(context, partialPlaceholder);
      suggestions.push(...contextSuggestions);
      
      // Add common patterns
      if (partialPlaceholder.length === 0) {
        suggestions.push(
          { text: '#if ', description: 'Conditional statement', type: 'conditional' },
          { text: 'random:', description: 'Random selection', type: 'random' }
        );
      }
    }
    
    return suggestions.slice(0, 10); // Limit suggestions
  }

  /**
   * Generate context-based autocomplete suggestions
   * @param {object} context - Available context
   * @param {string} partial - Partial placeholder text
   * @returns {object[]} - Array of suggestions
   */
  generateContextSuggestions(context, partial) {
    const suggestions = [];
    
    const addSuggestions = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        
        if (fullPath.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.push({
            text: fullPath,
            description: this.getDescriptionForPath(fullPath),
            type: 'placeholder',
            value: obj[key]
          });
        }
        
        // Recurse for nested objects (limit depth)
        if (typeof obj[key] === 'object' && obj[key] !== null && prefix.split('.').length < 2) {
          addSuggestions(obj[key], fullPath);
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
      'character.attributes.strength': 'Character strength',
      'character.attributes.dexterity': 'Character dexterity',
      'character.attributes.constitution': 'Character constitution',
      'character.attributes.intelligence': 'Character intelligence',
      'character.attributes.wisdom': 'Character wisdom',
      'character.attributes.charisma': 'Character charisma',
      'node.name': 'Location name',
      'node.type': 'Location type',
      'world.name': 'World name'
    };
    
    return descriptions[path] || `Property: ${path}`;
  }
}

export default TemplateValidationService;