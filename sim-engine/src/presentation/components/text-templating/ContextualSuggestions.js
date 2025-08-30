import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, Tag, Lightbulb, ChevronDown, ChevronUp, Info } from 'lucide-react';

/**
 * ContextualSuggestions - Component for displaying categorized placeholder suggestions
 * 
 * Features:
 * - Categorized placeholder suggestions by data type
 * - Search and filter functionality for suggestions
 * - Tooltip descriptions for each placeholder
 * - Click-to-insert functionality with cursor positioning
 * - Progressive disclosure for large suggestion lists
 */
const ContextualSuggestions = ({
  suggestions = [],
  onInsert,
  searchable = true,
  categorized = true,
  maxVisible = 10,
  showCategories = true,
  showAvailabilityFilter = true,
  className = '',
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set(['character', 'node']));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(null);
  const searchInputRef = useRef(null);

  // Filter and categorize suggestions
  const { filteredSuggestions, categories, suggestionsByCategory } = useMemo(() => {
    let filtered = suggestions || [];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(suggestion =>
        suggestion.placeholder.toLowerCase().includes(query) ||
        suggestion.description.toLowerCase().includes(query) ||
        suggestion.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.category === selectedCategory);
    }

    // Apply availability filter
    if (showOnlyAvailable) {
      filtered = filtered.filter(suggestion => suggestion.available);
    }

    // Get unique categories
    const categorySet = new Set((suggestions || []).map(s => s.category));
    const categoryList = Array.from(categorySet).sort((a, b) => {
      const order = { character: 0, node: 1, world: 2, system: 3 };
      return (order[a] || 4) - (order[b] || 4);
    });

    // Group by category
    const byCategory = {};
    categoryList.forEach(category => {
      byCategory[category] = filtered.filter(s => s.category === category);
    });

    return {
      filteredSuggestions: filtered,
      categories: categoryList,
      suggestionsByCategory: byCategory
    };
  }, [suggestions, searchQuery, selectedCategory, showOnlyAvailable]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!filteredSuggestions.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            handleInsert(filteredSuggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setSearchQuery('');
          setSelectedIndex(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredSuggestions, selectedIndex]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions]);

  // Handle suggestion insertion
  const handleInsert = (suggestion) => {
    if (onInsert && suggestion) {
      onInsert(suggestion.placeholder);
    }
  };

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
    const categoryLabels = {
      character: { label: 'Character', icon: '👤', color: 'blue' },
      node: { label: 'Location', icon: '🏛️', color: 'green' },
      world: { label: 'World', icon: '🌍', color: 'purple' },
      system: { label: 'System', icon: '⚙️', color: 'gray' }
    };
    return categoryLabels[category] || { label: category, icon: '📝', color: 'gray' };
  };

  // Get availability stats
  const availabilityStats = useMemo(() => {
    const total = suggestions.length;
    const available = suggestions.filter(s => s.available).length;
    return { total, available, unavailable: total - available };
  }, [suggestions]);

  if (!suggestions.length) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No suggestions available</p>
        <p className="text-xs">Add context (character, node, world) to see placeholder suggestions</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-900">Placeholder Suggestions</span>
            <span className="text-xs text-gray-500">
              ({filteredSuggestions.length} of {suggestions.length})
            </span>
          </div>
          
          {showAvailabilityFilter && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-green-600">✓ {availabilityStats.available}</span>
              <span className="text-gray-400">⚪ {availabilityStats.unavailable}</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search placeholders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Category Filter */}
            {categorized && categories.length > 1 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => {
                  const info = getCategoryInfo(category);
                  const count = suggestionsByCategory[category]?.length || 0;
                  return (
                    <option key={category} value={category}>
                      {info.label} ({count})
                    </option>
                  );
                })}
              </select>
            )}

            {/* Availability Filter */}
            {showAvailabilityFilter && (
              <label className="flex items-center space-x-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="w-3 h-3"
                />
                <span>Available only</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-80 overflow-y-auto">
        {categorized && showCategories ? (
          // Categorized view
          <div className="divide-y divide-gray-100">
            {categories.map(category => {
              const categorySuggestions = suggestionsByCategory[category] || [];
              if (!categorySuggestions.length) return null;

              const info = getCategoryInfo(category);
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="bg-white">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{info.icon}</span>
                      <span className="font-medium text-sm text-gray-900">{info.label}</span>
                      <span className="text-xs text-gray-500">({categorySuggestions.length})</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Category Suggestions */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {categorySuggestions.slice(0, maxVisible).map((suggestion, index) => (
                        <SuggestionItem
                          key={suggestion.placeholder}
                          suggestion={suggestion}
                          onInsert={handleInsert}
                          isSelected={filteredSuggestions.indexOf(suggestion) === selectedIndex}
                          compact={compact}
                          showTooltip={showTooltip === suggestion.placeholder}
                          onShowTooltip={(show) => setShowTooltip(show ? suggestion.placeholder : null)}
                        />
                      ))}
                      {categorySuggestions.length > maxVisible && (
                        <div className="px-3 py-2 text-xs text-gray-500 text-center">
                          +{categorySuggestions.length - maxVisible} more in {info.label.toLowerCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Flat view
          <div className="divide-y divide-gray-100">
            {filteredSuggestions.slice(0, maxVisible).map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.placeholder}
                suggestion={suggestion}
                onInsert={handleInsert}
                isSelected={index === selectedIndex}
                compact={compact}
                showTooltip={showTooltip === suggestion.placeholder}
                onShowTooltip={(show) => setShowTooltip(show ? suggestion.placeholder : null)}
              />
            ))}
            {filteredSuggestions.length > maxVisible && (
              <div className="px-3 py-2 text-xs text-gray-500 text-center">
                +{filteredSuggestions.length - maxVisible} more suggestions
              </div>
            )}
          </div>
        )}

        {filteredSuggestions.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No suggestions match your search</p>
            <p className="text-xs">Try a different search term or clear filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Use ↑↓ to navigate, Enter to insert</span>
          <span>Click for details</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual suggestion item component
 */
const SuggestionItem = ({ 
  suggestion, 
  onInsert, 
  isSelected, 
  compact, 
  showTooltip, 
  onShowTooltip 
}) => {
  const handleClick = () => {
    onInsert(suggestion);
  };

  const handleMouseEnter = () => {
    onShowTooltip(true);
  };

  const handleMouseLeave = () => {
    onShowTooltip(false);
  };

  return (
    <div
      className={`
        relative px-3 py-2 cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'}
        ${!suggestion.available ? 'opacity-60' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Placeholder */}
          <div className="flex items-center space-x-2">
            <code className={`
              text-sm font-mono
              ${suggestion.available ? 'text-blue-600' : 'text-gray-400'}
            `}>
              {suggestion.placeholder}
            </code>
            {!suggestion.available && (
              <span className="text-xs text-gray-400">unavailable</span>
            )}
          </div>

          {/* Description */}
          {!compact && (
            <div className="text-xs text-gray-600 mt-1">
              {suggestion.description}
            </div>
          )}

          {/* Example */}
          {!compact && suggestion.example && (
            <div className="text-xs text-gray-500 mt-1 font-mono">
              Example: {suggestion.example}
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="flex items-center space-x-1 ml-2">
          <Tag className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">{suggestion.category}</span>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-full top-0 ml-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg max-w-xs">
          <div className="font-medium mb-1">{suggestion.placeholder}</div>
          <div className="mb-1">{suggestion.description}</div>
          {suggestion.example && (
            <div className="text-gray-300">
              <strong>Example:</strong> {suggestion.example}
            </div>
          )}
          <div className="text-gray-400 mt-1">
            Category: {suggestion.category}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextualSuggestions;