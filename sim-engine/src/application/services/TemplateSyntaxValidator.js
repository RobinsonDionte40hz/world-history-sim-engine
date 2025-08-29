/**
 * TemplateSyntaxValidator - Comprehensive validation system for template syntax
 * Provides real-time validation, error reporting, and syntax highlighting support
 */
class TemplateSyntaxValidator {
  constructor() {
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
    this.conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;
    this.randomRegex = /\{\{random:([^}]*)\}\}/g;
    this.openBraceRegex = /\{\{/g;
    this.closeBraceRegex = /\}\}/g;
    this.ifBlockRegex = /\{\{#if/g;
    this.endifBlockRegex = /\{\{\/if\}\}/g;
  }

  /**
   * Validate template syntax comprehensively
   * @param {string} template - Template string to validate
   * @returns {object} - Validation result with errors, warnings, and syntax info
   */
  validateTemplate(template) {
    if (!template || typeof template !== 'string') {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        syntaxElements: []
      };
    }

    const errors = [];
    const warnings = [];
    const syntaxElements = [];

    try {
      // Check for basic syntax errors
      this.validateBasicSyntax(template, errors, warnings);
      
      // Check for conditional statement errors
      this.validateConditionalStatements(template, errors, warnings);
      
      // Check for placeholder syntax errors
      this.validatePlaceholderSyntax(template, errors, warnings);
      
      // Check for random selection syntax errors
      this.validateRandomSelections(template, errors, warnings);
      
      // Extract syntax elements for highlighting
      this.extractSyntaxElements(template, syntaxElements);
      
      // Check for potential issues
      this.checkPotentialIssues(template, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        syntaxElements
      };
    } catch (error) {
      errors.push(`Template validation failed: ${error.message}`);
      return {
        isValid: false,
        errors,
        warnings,
        syntaxElements: []
      };
    }
  }

  /**
   * Validate basic template syntax
   * @param {string} template - Template string
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   */
  validateBasicSyntax(template, errors, warnings) {
    // Check for unmatched braces
    const openBraces = (template.match(this.openBraceRegex) || []).length;
    const closeBraces = (template.match(this.closeBraceRegex) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push(`Unmatched template braces: ${openBraces} opening, ${closeBraces} closing`);
    }

    // Check for empty placeholders
    if (template.includes('{{}}')) {
      errors.push('Empty placeholder found: {{}}');
    }

    // Check for incomplete placeholders
    const incompleteStart = template.match(/\{\{[^}]*$/);
    if (incompleteStart) {
      errors.push('Incomplete placeholder at end of template');
    }

    const incompleteEnd = template.match(/^[^{]*\}\}/);
    if (incompleteEnd) {
      errors.push('Incomplete placeholder at start of template');
    }

    // Check for nested placeholders (not supported)
    const nestedPlaceholders = template.match(/\{\{[^}]*\{\{[^}]*\}\}[^}]*\}\}/g);
    if (nestedPlaceholders) {
      errors.push('Nested placeholders are not supported');
    }

    // Check for single braces that might be typos
    const singleOpenBrace = template.match(/(?<!\{)\{(?!\{)/g);
    const singleCloseBrace = template.match(/(?<!\})\}(?!\})/g);
    
    if (singleOpenBrace) {
      warnings.push('Single opening brace found - did you mean {{?');
    }
    
    if (singleCloseBrace) {
      warnings.push('Single closing brace found - did you mean }}?');
    }
  }

  /**
   * Validate conditional statements
   * @param {string} template - Template string
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   */
  validateConditionalStatements(template, errors, warnings) {
    // Check for unmatched conditionals
    const ifBlocks = (template.match(this.ifBlockRegex) || []).length;
    const endifBlocks = (template.match(this.endifBlockRegex) || []).length;
    
    if (ifBlocks !== endifBlocks) {
      errors.push(`Unmatched conditional blocks: ${ifBlocks} {{#if}}, ${endifBlocks} {{/if}}`);
    }

    // Check for malformed conditional syntax
    const malformedIf = template.match(/\{\{#if\s*\}\}/g);
    if (malformedIf) {
      errors.push('Empty conditional statement: {{#if}} requires a condition');
    }

    // Check for invalid conditional operators
    const conditionalMatches = template.matchAll(/\{\{#if\s+([^}]+)\}\}/g);
    for (const match of conditionalMatches) {
      const condition = match[1].trim();
      this.validateConditionSyntax(condition, errors, warnings);
    }

    // Check for orphaned endif blocks
    const orphanedEndif = template.match(/\{\{\/if\}\}/g);
    if (orphanedEndif && orphanedEndif.length > ifBlocks) {
      errors.push('Orphaned {{/if}} block found without matching {{#if}}');
    }

    // Check for nested conditionals (warn about complexity)
    const nestedConditionals = this.findNestedConditionals(template);
    if (nestedConditionals.length > 0) {
      warnings.push(`Nested conditionals found (${nestedConditionals.length}) - ensure proper nesting`);
    }
  }

  /**
   * Validate condition syntax within conditionals
   * @param {string} condition - Condition string
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   */
  validateConditionSyntax(condition, errors, warnings) {
    if (!condition || condition.trim().length === 0) {
      errors.push('Empty condition in {{#if}} block');
      return;
    }

    const operators = ['>=', '<=', '>', '<', '==', '!='];
    const hasOperator = operators.some(op => condition.includes(op));

    if (hasOperator) {
      // Validate comparison syntax
      const operatorFound = operators.find(op => condition.includes(op));
      const parts = condition.split(operatorFound);
      
      if (parts.length !== 2) {
        errors.push(`Invalid comparison syntax: ${condition}`);
        return;
      }

      const [left, right] = parts.map(p => p.trim());
      
      if (!left || !right) {
        errors.push(`Incomplete comparison: ${condition}`);
        return;
      }

      // Check for invalid placeholder syntax in conditions
      this.validatePlaceholderInCondition(left, errors);
      this.validatePlaceholderInCondition(right, errors);
    } else {
      // Boolean condition - validate placeholder syntax
      this.validatePlaceholderInCondition(condition, errors);
    }
  }

  /**
   * Validate placeholder syntax in conditions
   * @param {string} placeholder - Placeholder string
   * @param {string[]} errors - Error array to populate
   */
  validatePlaceholderInCondition(placeholder, errors) {
    const trimmed = placeholder.trim();
    
    // Skip literals (numbers and quoted strings)
    if (this.isLiteral(trimmed)) {
      return;
    }

    // Check for invalid characters in placeholder paths
    if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(trimmed)) {
      errors.push(`Invalid placeholder syntax in condition: ${trimmed}`);
    }

    // Check for consecutive dots
    if (trimmed.includes('..')) {
      errors.push(`Invalid placeholder path (consecutive dots): ${trimmed}`);
    }

    // Check for leading/trailing dots
    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      errors.push(`Invalid placeholder path (leading/trailing dot): ${trimmed}`);
    }
  }

  /**
   * Validate placeholder syntax
   * @param {string} template - Template string
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   */
  validatePlaceholderSyntax(template, errors, warnings) {
    const placeholderMatches = template.matchAll(this.placeholderRegex);
    
    for (const match of placeholderMatches) {
      const placeholder = match[1].trim();
      
      // Skip conditionals and random selections (handled separately)
      if (placeholder.startsWith('#if') || placeholder.startsWith('/if') || placeholder.startsWith('random:')) {
        continue;
      }

      // Check for empty placeholder content
      if (!placeholder) {
        errors.push('Empty placeholder content');
        continue;
      }

      // Check for invalid characters
      if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(placeholder)) {
        errors.push(`Invalid placeholder syntax: {{${placeholder}}}`);
        continue;
      }

      // Check for consecutive dots
      if (placeholder.includes('..')) {
        errors.push(`Invalid placeholder path (consecutive dots): {{${placeholder}}}`);
        continue;
      }

      // Check for leading/trailing dots
      if (placeholder.startsWith('.') || placeholder.endsWith('.')) {
        errors.push(`Invalid placeholder path (leading/trailing dot): {{${placeholder}}}`);
        continue;
      }

      // Warn about very deep nesting
      const depth = (placeholder.match(/\./g) || []).length;
      if (depth > 4) {
        warnings.push(`Very deep placeholder nesting: {{${placeholder}}} (${depth + 1} levels)`);
      }
    }
  }

  /**
   * Validate random selection syntax
   * @param {string} template - Template string
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   */
  validateRandomSelections(template, errors, warnings) {
    const randomMatches = template.matchAll(this.randomRegex);
    
    for (const match of randomMatches) {
      const options = match[1];
      
      if (!options || options.trim().length === 0) {
        errors.push('Empty random selection: {{random:}}');
        continue;
      }

      const choices = options.split(',').map(choice => choice.trim()).filter(choice => choice.length > 0);
      
      if (choices.length === 0) {
        errors.push(`Random selection with no valid options: {{random:${options}}}`);
        continue;
      }

      if (choices.length === 1) {
        warnings.push(`Random selection with only one option: {{random:${options}}}`);
        continue;
      }

      // Check for duplicate options
      const uniqueChoices = new Set(choices);
      if (uniqueChoices.size !== choices.length) {
        warnings.push(`Random selection has duplicate options: {{random:${options}}}`);
      }

      // Warn about very long option lists
      if (choices.length > 10) {
        warnings.push(`Random selection has many options (${choices.length}) - consider splitting`);
      }
    }
  }

  /**
   * Extract syntax elements for highlighting
   * @param {string} template - Template string
   * @param {object[]} syntaxElements - Array to populate with syntax elements
   */
  extractSyntaxElements(template, syntaxElements) {
    // Extract all template elements with their positions
    const allMatches = [];
    
    // Find all placeholder matches
    let match;
    const placeholderRegex = new RegExp(this.placeholderRegex);
    while ((match = placeholderRegex.exec(template)) !== null) {
      allMatches.push({
        type: this.getPlaceholderType(match[1]),
        start: match.index,
        end: match.index + match[0].length,
        content: match[0],
        placeholder: match[1].trim()
      });
    }

    // Sort by position
    allMatches.sort((a, b) => a.start - b.start);
    
    syntaxElements.push(...allMatches);
  }

  /**
   * Determine the type of placeholder for syntax highlighting
   * @param {string} placeholder - Placeholder content
   * @returns {string} - Placeholder type
   */
  getPlaceholderType(placeholder) {
    const trimmed = placeholder.trim();
    
    if (trimmed.startsWith('#if')) return 'conditional-start';
    if (trimmed === '/if') return 'conditional-end';
    if (trimmed.startsWith('random:')) return 'random-selection';
    
    return 'placeholder';
  }

  /**
   * Check for potential issues that might cause problems
   * @param {string} template - Template string
   * @param {string[]} warnings - Warning array to populate
   */
  checkPotentialIssues(template, warnings) {
    // Check for very long templates
    if (template.length > 1000) {
      warnings.push('Very long template - consider breaking into smaller parts');
    }

    // Check for excessive placeholder density
    const placeholderCount = (template.match(this.placeholderRegex) || []).length;
    const textLength = template.length;
    const density = placeholderCount / Math.max(textLength, 1);
    
    if (density > 0.1) {
      warnings.push('High placeholder density - template may be hard to read');
    }

    // Check for potential infinite loops in conditionals
    const conditionalMatches = template.matchAll(/\{\{#if\s+([^}]+)\}\}/g);
    for (const match of conditionalMatches) {
      const condition = match[1].trim();
      if (condition === 'true' || condition === '1') {
        warnings.push('Conditional with always-true condition may cause issues');
      }
    }

    // Check for common typos
    if (template.includes('{{if ')) {
      warnings.push('Found "{{if " - did you mean "{{#if "?');
    }
    
    if (template.includes('{{endif}}')) {
      warnings.push('Found "{{endif}}" - did you mean "{{/if}}"?');
    }
  }

  /**
   * Find nested conditional structures
   * @param {string} template - Template string
   * @returns {object[]} - Array of nested conditional info
   */
  findNestedConditionals(template) {
    const nested = [];
    const stack = [];
    
    // Simple nested detection - could be enhanced for more complex cases
    const ifMatches = [...template.matchAll(/\{\{#if\s+([^}]+)\}\}/g)];
    const endifMatches = [...template.matchAll(/\{\{\/if\}\}/g)];
    
    let ifIndex = 0;
    let endifIndex = 0;
    
    while (ifIndex < ifMatches.length && endifIndex < endifMatches.length) {
      const ifPos = ifMatches[ifIndex].index;
      const endifPos = endifMatches[endifIndex].index;
      
      if (ifPos < endifPos) {
        stack.push({ type: 'if', pos: ifPos, condition: ifMatches[ifIndex][1] });
        ifIndex++;
      } else {
        if (stack.length > 1) {
          nested.push({
            depth: stack.length,
            outerCondition: stack[stack.length - 2].condition,
            innerCondition: stack[stack.length - 1].condition
          });
        }
        stack.pop();
        endifIndex++;
      }
    }
    
    return nested;
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
   * Get detailed error information for a specific position
   * @param {string} template - Template string
   * @param {number} position - Character position
   * @returns {object} - Error context information
   */
  getErrorContext(template, position) {
    const lines = template.split('\n');
    let currentPos = 0;
    let lineNumber = 0;
    let columnNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentPos + lineLength > position) {
        lineNumber = i + 1;
        columnNumber = position - currentPos + 1;
        break;
      }
      currentPos += lineLength;
    }
    
    const contextStart = Math.max(0, position - 20);
    const contextEnd = Math.min(template.length, position + 20);
    const context = template.substring(contextStart, contextEnd);
    
    return {
      line: lineNumber,
      column: columnNumber,
      context,
      position
    };
  }

  /**
   * Suggest fixes for common syntax errors
   * @param {string} error - Error message
   * @param {string} template - Template string
   * @returns {string[]} - Array of suggested fixes
   */
  suggestFixes(error, template) {
    const suggestions = [];
    
    if (error.includes('Unmatched template braces')) {
      suggestions.push('Check that every {{ has a matching }}');
      suggestions.push('Look for incomplete placeholders at the start or end');
    }
    
    if (error.includes('Unmatched conditional blocks')) {
      suggestions.push('Ensure every {{#if}} has a matching {{/if}}');
      suggestions.push('Check for proper nesting of conditional blocks');
    }
    
    if (error.includes('Empty placeholder')) {
      suggestions.push('Remove empty {{}} placeholders');
      suggestions.push('Add content between the braces');
    }
    
    if (error.includes('Invalid placeholder syntax')) {
      suggestions.push('Use only letters, numbers, dots, and underscores in placeholders');
      suggestions.push('Start placeholder names with a letter or underscore');
    }
    
    if (error.includes('consecutive dots')) {
      suggestions.push('Remove extra dots from placeholder paths');
      suggestions.push('Use single dots to separate path segments');
    }
    
    return suggestions;
  }
}

export default TemplateSyntaxValidator;