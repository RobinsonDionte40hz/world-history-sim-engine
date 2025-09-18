import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AlertCircle, Code, Lightbulb, Eye, EyeOff } from 'lucide-react';
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
  // const [cursorPosition, setCursorPosition] = useState(0); // TODO: Use for advanced cursor tracking
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState('side-by-side'); // 'side-by-side', 'overlay', 'toggle'
  const textareaRef = useRef(null);
  
  // Use the new hooks for suggestions and preview with error handling
  // Hooks must be called unconditionally
  const suggestionResult = useContextualSuggestions(context);
  
  // Memoize suggestions to prevent unnecessary re-renders
  const suggestions = useMemo(() => {
    return suggestionResult?.suggestions || [];
  }, [suggestionResult?.suggestions]);

  const insertPlaceholder = suggestionResult?.insertPlaceholder || (() => {});

  // Call useTemplatePreview hook at top level (required by React hooks rules)
  const previewResult = useTemplatePreview(value, context);
  
  // Extract values with fallbacks
  const previewText = previewResult?.previewText || '';
  const isResolved = previewResult?.isResolved || false;
  const previewErrors = previewResult?.errors || [];
  let validation = { isValid: true, errors: [], warnings: [] };
  
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
    // setCursorPosition(e.target.selectionStart); // TODO: Use for advanced cursor tracking
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
        default:
          // No action needed for other keys
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
          aria-label="Template text editor with placeholder support"
          aria-describedby="placeholder-editor-help"
          className={`
            w-full p-3 rounded-lg border-2 transition-all
            font-mono text-sm resize-y
            ${validation.isValid 
              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
              : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
        />

        {/* Suggestions Panel */}
        {showSuggestionsPanel && showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-w-md bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-white/20 bg-gray-700">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Lightbulb className="w-3 h-3" />
                <span>Placeholder Suggestions</span>
              </div>
            </div>
            
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.placeholder}
                className={`
                  p-3 cursor-pointer border-b border-white/10 last:border-b-0
                  ${index === selectedSuggestionIndex ? 'bg-blue-600/20 border-blue-400/50' : 'hover:bg-white/5'}
                `}
                onClick={() => insertSuggestionAtCursor(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-blue-400">
                      {suggestion.placeholder}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {suggestion.description}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
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
              className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-gray-300"
              title={suggestion.description}
            >
              {suggestion.placeholder}
            </button>
          ))}
          {suggestions.length > 6 && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-500/30 rounded border border-blue-400/30 text-blue-400"
            >
              {showAdvanced ? 'Hide' : `+${suggestions.length - 6} more`}
            </button>
          )}
        </div>
      )}

      {/* Advanced Suggestions Panel */}
      {showAdvanced && showSuggestions && suggestions.length > 6 && (
        <div className="mt-2 p-3 bg-white/10 rounded-lg border border-white/20">
          <h4 className="text-sm font-semibold mb-2 text-white">All Available Placeholders</h4>
          
          {/* Description and Examples */}
          <div className="mb-3 text-xs text-gray-300 space-y-2">
            <p>
              <strong>Placeholders</strong> are dynamic variables that get replaced with actual values when your text is used. 
              Use them to create flexible, reusable content that adapts to different characters, nodes, and situations.
            </p>
            
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <p className="font-medium text-gray-200 mb-1">How to use:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• Click any placeholder below to insert it at cursor position</li>
                <li>• Type <code className="bg-white/10 px-1 rounded text-gray-300">{'{{'}</code> to see context-aware suggestions</li>
                <li>• Examples: <code className="bg-white/10 px-1 rounded text-gray-300">{'{{character.name}}'}</code>, <code className="bg-white/10 px-1 rounded text-gray-300">{'{{node.environment}}'}</code></li>
              </ul>
            </div>
            
            <div className="bg-blue-600/10 p-2 rounded border border-blue-400/20">
              <p className="font-medium text-blue-300 mb-1">Common Examples:</p>
              <div className="grid grid-cols-1 gap-1 text-gray-300">
                <div><code className="bg-white/10 px-1 rounded">{'{{character.name}}'}</code> → Character's name</div>
                <div><code className="bg-white/10 px-1 rounded">{'{{node.name}}'}</code> → Location name</div>
                <div><code className="bg-white/10 px-1 rounded">{'{{character.attributes.strength}}'}</code> → Character's strength score</div>
                <div><code className="bg-white/10 px-1 rounded">{'{{random:hello,hi,greetings}}'}</code> → Random selection</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
            {suggestions.slice(6).map(suggestion => (
              <button
                key={suggestion.placeholder}
                onClick={() => insertPlaceholderAtCursor(suggestion.placeholder)}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded border border-white/20 text-white text-left"
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
        <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white">Preview</h4>
            <button
              onClick={() => setPreviewMode(prev => 
                prev === 'side-by-side' ? 'overlay' : 'side-by-side'
              )}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {previewMode === 'side-by-side' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          {isResolved ? (
            <div className="text-sm text-gray-300 whitespace-pre-wrap">
              {previewText}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              {previewErrors.length > 0 ? (
                <div>
                  <div className="text-red-400 mb-1">Resolution Errors:</div>
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
        <div id="placeholder-editor-help" className="mt-2 text-xs text-gray-400">
          <span className="inline-flex items-center">
            <Code className="w-3 h-3 mr-1" />
            Use <span className="font-mono mx-1">{`{{placeholder}}`}</span> for variables
          </span>
          <span className="ml-2">•</span>
          <span className="ml-2">Type <span className="font-mono">{`{{`}</span> to see suggestions</span>
        </div>
      )}
    </div>
  );
};

export default PlaceholderEditor;