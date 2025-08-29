import React, { useState, useMemo, useCallback } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Plus, Search, Filter, Shuffle } from 'lucide-react';
import dialoguePatternLibrary from '../../../application/services/DialoguePatternLibrary';

/**
 * DialoguePatterns - Component for quick-insert common dialogue patterns
 * 
 * Features:
 * - Pattern categories (greetings, farewells, questions, reactions)
 * - Pattern templates with placeholder syntax
 * - Insertion logic that maintains cursor position
 * - Contextual pattern suggestions based on editor context
 * - Pattern customization system for user-defined patterns
 */
const DialoguePatterns = ({
  onInsert,
  context = {},
  categories = ['greetings', 'farewells', 'questions', 'reactions'],
  showSearch = true,
  showCustomPatterns = true,
  compact = false,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState('greetings');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['greetings']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customPattern, setCustomPattern] = useState({ name: '', template: '', category: 'custom' });

  // Get dialogue patterns with contextual filtering
  const { patterns, patternsByCategory } = useMemo(() => {
    // Get patterns from the library with context filtering
    const allPatterns = dialoguePatternLibrary.getAllPatterns({
      contextFilter: context,
      searchQuery: searchQuery.trim() || null
    });
    
    // Filter by selected categories
    let filtered = allPatterns;
    if (categories.length > 0) {
      filtered = allPatterns.filter(pattern => categories.includes(pattern.category));
    }

    // Group by category
    const byCategory = {};
    categories.forEach(category => {
      byCategory[category] = filtered.filter(p => p.category === category);
    });

    return {
      patterns: filtered,
      patternsByCategory: byCategory
    };
  }, [context, searchQuery, categories]);

  // Handle pattern insertion
  const handleInsert = useCallback((pattern) => {
    if (onInsert && pattern) {
      onInsert(pattern.template);
    }
  }, [onInsert]);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Get category display info
  const getCategoryInfo = (category) => {
    const categoryInfo = {
      greetings: { label: 'Greetings', icon: '👋', color: 'blue', description: 'Opening dialogue patterns' },
      farewells: { label: 'Farewells', icon: '👋', color: 'green', description: 'Closing dialogue patterns' },
      questions: { label: 'Questions', icon: '❓', color: 'purple', description: 'Inquiry and conversation starters' },
      reactions: { label: 'Reactions', icon: '💭', color: 'orange', description: 'Responses and emotional reactions' },
      custom: { label: 'Custom', icon: '⭐', color: 'gray', description: 'User-defined patterns' }
    };
    return categoryInfo[category] || { label: category, icon: '💬', color: 'gray', description: 'Dialogue patterns' };
  };

  // Handle custom pattern creation
  const handleAddCustomPattern = () => {
    if (customPattern.name && customPattern.template) {
      try {
        dialoguePatternLibrary.createCustomPattern({
          name: customPattern.name,
          template: customPattern.template,
          category: customPattern.category,
          description: `Custom ${customPattern.category} pattern`,
          tags: ['custom', 'user-defined']
        });
        setCustomPattern({ name: '', template: '', category: 'custom' });
        setShowCustomForm(false);
      } catch (error) {
        console.error('Failed to add custom pattern:', error);
        // In a real implementation, show user-friendly error message
      }
    }
  };

  // Get contextual suggestions for patterns
  const getContextualSuggestions = (pattern) => {
    const suggestions = [];
    
    if (context.character?.name) {
      suggestions.push(`Use {{character.name}} for "${context.character.name}"`);
    }
    
    if (context.node?.name) {
      suggestions.push(`Use {{node.name}} for "${context.node.name}"`);
    }
    
    if (pattern.template.includes('{{#if')) {
      suggestions.push('This pattern includes conditional logic');
    }
    
    if (pattern.template.includes('{{random:')) {
      suggestions.push('This pattern includes random variations');
    }

    // Add relevance score information
    const relevanceScore = dialoguePatternLibrary.calculateRelevanceScore(pattern, context);
    if (relevanceScore > 70) {
      suggestions.push('Highly relevant to current context');
    } else if (relevanceScore > 40) {
      suggestions.push('Moderately relevant to current context');
    }
    
    return suggestions;
  };

  if (!patterns.length && !searchQuery) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No dialogue patterns available</p>
        <p className="text-xs">Add context or create custom patterns</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-900">Dialogue Patterns</span>
            <span className="text-xs text-gray-500">
              ({patterns.length} patterns)
            </span>
          </div>
          
          {showCustomPatterns && (
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
              title="Add custom pattern"
            >
              <Plus className="w-3 h-3" />
              <span>Custom</span>
            </button>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Custom Pattern Form */}
      {showCustomForm && (
        <div className="p-3 border-b border-gray-200 bg-blue-50">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Pattern name..."
              value={customPattern.name}
              onChange={(e) => setCustomPattern(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <textarea
              placeholder="Pattern template (use {{placeholders}})..."
              value={customPattern.template}
              onChange={(e) => setCustomPattern(prev => ({ ...prev, template: e.target.value }))}
              rows={2}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <div className="flex items-center justify-between">
              <select
                value={customPattern.category}
                onChange={(e) => setCustomPattern(prev => ({ ...prev, category: e.target.value }))}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="custom">Custom</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{getCategoryInfo(cat).label}</option>
                ))}
              </select>
              <div className="flex space-x-1">
                <button
                  onClick={handleAddCustomPattern}
                  disabled={!customPattern.name || !customPattern.template}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patterns List */}
      <div className="max-h-80 overflow-y-auto">
        {categories.map(category => {
          const categoryPatterns = patternsByCategory[category] || [];
          if (!categoryPatterns.length) return null;

          const info = getCategoryInfo(category);
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{info.icon}</span>
                  <span className="font-medium text-sm text-gray-900">{info.label}</span>
                  <span className="text-xs text-gray-500">({categoryPatterns.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Category Patterns */}
              {isExpanded && (
                <div className="bg-gray-50">
                  {categoryPatterns.map((pattern, index) => (
                    <PatternItem
                      key={`${pattern.id}-${index}`}
                      pattern={pattern}
                      onInsert={handleInsert}
                      context={context}
                      compact={compact}
                      contextualSuggestions={getContextualSuggestions(pattern)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {patterns.length === 0 && searchQuery && (
          <div className="p-4 text-center text-gray-500">
            <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No patterns match your search</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Click to insert pattern at cursor</span>
          <span>Patterns adapt to your context</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual pattern item component
 */
const PatternItem = ({ pattern, onInsert, context, compact, contextualSuggestions }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    onInsert(pattern);
  };

  const handleToggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // Preview the pattern with current context
  const getPatternPreview = () => {
    let preview = pattern.template;
    
    // Simple preview substitution (not full template engine)
    if (context.character?.name) {
      preview = preview.replace(/\{\{character\.name\}\}/g, context.character.name);
    }
    if (context.node?.name) {
      preview = preview.replace(/\{\{node\.name\}\}/g, context.node.name);
    }
    
    // Handle random selections for preview
    const randomMatches = preview.match(/\{\{random:([^}]+)\}\}/g);
    if (randomMatches) {
      randomMatches.forEach(match => {
        const options = match.replace(/\{\{random:|\}\}/g, '').split(',');
        const randomOption = options[0]; // Use first option for preview
        preview = preview.replace(match, randomOption);
      });
    }
    
    return preview;
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div
        className="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Pattern Name */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-gray-900">{pattern.name}</span>
              {pattern.requiredContext && pattern.requiredContext.length > 0 && (
                <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                  context-aware
                </span>
              )}
            </div>

            {/* Pattern Template */}
            {!compact && (
              <div className="text-xs text-gray-600 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                {pattern.template}
              </div>
            )}

            {/* Pattern Preview */}
            {!compact && (
              <div className="text-xs text-gray-800 mt-1 italic">
                Preview: "{getPatternPreview()}"
              </div>
            )}

            {/* Description */}
            {!compact && pattern.description && (
              <div className="text-xs text-gray-500 mt-1">
                {pattern.description}
              </div>
            )}

            {/* Tags */}
            {!compact && pattern.tags && pattern.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {pattern.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-400 bg-gray-200 px-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {contextualSuggestions.length > 0 && (
              <button
                onClick={handleToggleDetails}
                className="text-xs text-blue-600 hover:text-blue-800"
                title="Show contextual suggestions"
              >
                <Filter className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleClick}
              className="text-xs text-green-600 hover:text-green-800"
              title="Insert pattern"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Contextual Suggestions */}
        {showDetails && contextualSuggestions.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="font-medium text-blue-800 mb-1">Contextual Suggestions:</div>
            <ul className="space-y-1">
              {contextualSuggestions.map((suggestion, index) => (
                <li key={index} className="text-blue-700">• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};



export default DialoguePatterns;