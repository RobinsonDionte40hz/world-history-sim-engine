import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, AlertCircle, CheckCircle, Code, Lightbulb, Eye, EyeOff } from 'lucide-react';
import TextTemplateEngine from '../../../domain/services/TextTemplateEngine';
import useContextualSuggestions from '../../hooks/useContextualSuggestions';
import useTemplatePreview from '../../hooks/useTemplatePreview';

/**
 * Enhanced PlaceholderEditor - Reusable text templating component
 * 
 * Features:
 * - Automatic context detection from props
 * - Real-time preview functionality with TextTemplateEngine integration
 * - Progressive disclosure for advanced templating features
 * - Context-aware placeholder suggestions
 * - Syntax validation and error handling
 * - Graceful error recovery for hooks and template engine
 */
const PlaceholderEditor = ({
  value = '',
  onChange,
  context = {},
  placeholder = 'Enter text with {{placeholders}}...',
  className = '',
  showSuggestions = true,
  showValidation = true,
  showPreview = true,
  disabled = false,
  rows = 4,
  autoFocus = false
}) => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState('side-by-side'); // 'side-by-side', 'overlay', 'toggle'
  const textareaRef = useRef(null);
  
  // Use the new hooks for suggestions and preview with error handling
  let suggestions = [];
  let insertPlaceholder = () => {};
  let previewText = '';
  let isResolved = false;
  let previewErrors = [];
  let validation = { isValid: true, errors: [], warnings: [] };
  
  try {
    const suggestionResult = useContextualSuggestions(context);
    suggestions = suggestionResult.suggestions || [];
    insertPlaceholder = suggestionResult.insertPlaceholder || (() => {});
  } catch (error) {
    console.error('Error in useContextualSuggestions hook:', error);
    // Continue with empty suggestions
  }
  
  try {
    const previewResult = useTemplatePreview(value, context);
    previewText = previewResult.previewText || '';
    isResolved = previewResult.isResolved || false;
    previewErrors = previewResult.errors || [];
  } catch (error) {
    console.error('Error in useTemplatePreview hook:', error);
    // Continue with empty preview
  }
  
  // Template engine for validation with error handling
  const templateEngine = useMemo(() => {
    try {
      return new TextTemplateEngine();
    } catch (error) {
      console.error('Error creating TextTemplateEngine:', error);
      return null;
    }
  }, []);
  
  // Validate template with error handling
  try {
    if (templateEngine && templateEngine.validateTemplate) {
      validation = templateEngine.validateTemplate(value);
    }
  } catch (error) {
    console.error('Error validating template:', error);
    validation = {
      isValid: false,
      errors: ['Template engine error'],
      warnings: []
    };
  }

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!suggestionFilter) return suggestions.slice(0, 10); // Limit initial suggestions
    return suggestions.filter(suggestion =>
      suggestion.placeholder.toLowerCase().includes(suggestionFilter.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(suggestionFilter.toLowerCase())
    );
  }, [suggestions, suggestionFilter]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Handle text change with suggestion detection
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    
    // Check if we should show suggestions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    const lastCloseBrace = textBeforeCursor.lastIndexOf('}}');
    
    if (lastOpenBrace > lastCloseBrace && lastOpenBrace !== -1) {
      const partialPlaceholder = textBeforeCursor.substring(lastOpenBrace + 2);
      setSuggestionFilter(partialPlaceholder);
      setShowSuggestionsPanel(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestionsPanel(false);
    }
  };

  // Handle cursor position change
  const handleSelectionChange = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  // Handle key down for suggestion navigation
  const handleKeyDown = (e) => {
    if (showSuggestionsPanel && filteredSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            Math.min(prev + 1, filteredSuggestions.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          insertSuggestionAtCursor(filteredSuggestions[selectedSuggestionIndex]);
          break;
        case 'Escape':
          setShowSuggestionsPanel(false);
          break;
      }
    }
  };

  // Insert a suggestion at cursor position
  const insertSuggestionAtCursor = (suggestion) => {
    if (!suggestion || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // Find the start of the current placeholder
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{{');
    
    if (lastOpenBrace !== -1) {
      const beforePlaceholder = value.substring(0, lastOpenBrace);
      const newValue = `${beforePlaceholder}{{${suggestion.placeholder}}}${textAfterCursor}`;
      
      onChange?.(newValue);
      setShowSuggestionsPanel(false);
      
      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        const newCursorPos = lastOpenBrace + suggestion.placeholder.length + 4; // +4 for {{}}
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  // Insert placeholder at cursor using the hook
  const insertPlaceholderAtCursor = (placeholderText) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    try {
      insertPlaceholder(placeholderText, start, end, (newValue, newCursorPos) => {
        onChange?.(newValue);
        
        // Set cursor position after insertion
        setTimeout(() => {
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }, 0);
      });
    } catch (error) {
      console.error('Error inserting placeholder:', error);
      // Fallback: simple insertion
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const newValue = `${beforeText}{{${placeholderText}}}${afterText}`;
      onChange?.(newValue);
    }
  };

  return (
    <div className={`placeholder-editor ${className}`}>
      {/* Validation Messages */}
      {showValidation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="mb-2 space-y-1">
          {validation.errors.map((error, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Editor Section */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelectionChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full p-3 rounded-lg border-2 transition-all
            font-mono text-sm resize-y
            ${validation.isValid 
              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
              : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />

        {/* Suggestions Panel */}
        {showSuggestionsPanel && showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Lightbulb className="w-3 h-3" />
                <span>Placeholder Suggestions</span>
              </div>
            </div>
            
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeholder}
                className={`
                  p-3 cursor-pointer border-b border-gray-100 last:border-b-0
                  ${index === selectedSuggestionIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                `}
                onClick={() => insertSuggestionAtCursor(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-blue-600">
                      {suggestion.placeholder}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {suggestion.description}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 ml-2">
                    {suggestion.category}
                  </div>
                </div>
                {suggestion.example && (
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    Example: {suggestion.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Insert Buttons */}
      {showSuggestions && !showSuggestionsPanel && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {suggestions.slice(0, 6).map(suggestion => (
            <button
              key={suggestion.placeholder}
              onClick={() => insertPlaceholderAtCursor(suggestion.placeholder)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-700"
              title={suggestion.description}
            >
              {suggestion.placeholder}
            </button>
          ))}
          {suggestions.length > 6 && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded border text-blue-700"
            >
              {showAdvanced ? 'Hide' : `+${suggestions.length - 6} more`}
            </button>
          )}
        </div>
      )}

      {/* Advanced Suggestions Panel */}
      {showAdvanced && showSuggestions && suggestions.length > 6 && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold mb-2">All Available Placeholders</h4>
          <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
            {suggestions.slice(6).map(suggestion => (
              <button
                key={suggestion.placeholder}
                onClick={() => insertPlaceholderAtCursor(suggestion.placeholder)}
                className="px-2 py-1 text-xs bg-white hover:bg-gray-100 rounded border text-left"
                title={suggestion.description}
              >
                <span className="font-mono">{suggestion.placeholder}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && value && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Preview</h4>
            <button
              onClick={() => setPreviewMode(prev => 
                prev === 'side-by-side' ? 'overlay' : 'side-by-side'
              )}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {previewMode === 'side-by-side' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          {isResolved ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {previewText}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {previewErrors.length > 0 ? (
                <div>
                  <div className="text-red-600 mb-1">Resolution Errors:</div>
                  {previewErrors.map((error, idx) => (
                    <div key={idx} className="ml-2">• {error}</div>
                  ))}
                </div>
              ) : (
                'Enter placeholders to see preview...'
              )}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {showSuggestions && !value && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="inline-flex items-center">
            <Code className="w-3 h-3 mr-1" />
            Use <span className="font-mono mx-1">{{placeholder}}</span> for variables
          </span>
          <span className="ml-2">•</span>
          <span className="ml-2">Type <span className="font-mono">{{</span> to see suggestions</span>
        </div>
      )}
    </div>
  );
};

export default PlaceholderEditor;