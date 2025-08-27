import React, { useState, useRef, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Code, Lightbulb } from 'lucide-react';
import TextTemplateEngine from '../../domain/services/TextTemplateEngine';

const PlaceholderEditor = ({
  value = '',
  onChange,
  context = {},
  placeholder = 'Enter text with {{placeholders}}...',
  className = '',
  showSuggestions = true,
  showValidation = true,
  showPreview = true,
  disabled = false
}) => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef(null);
  const templateEngine = useRef(new TextTemplateEngine()).current;

  // Get validation results
  const validation = templateEngine.validateTemplate(value);
  const resolution = templateEngine.resolve(value, context);
  const suggestions = templateEngine.getPlaceholderSuggestions(context);

  // Filter suggestions based on current input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.placeholder.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  // Handle text change
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
          insertSuggestion(filteredSuggestions[selectedSuggestionIndex]);
          break;
        case 'Escape':
          setShowSuggestionsPanel(false);
          break;
      }
    }
  };

  // Insert a suggestion at cursor position
  const insertSuggestion = (suggestion) => {
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

  // Insert placeholder at cursor
  const insertPlaceholderAtCursor = (placeholder) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    
    const newValue = `${textBefore}{{${placeholder}}}${textAfter}`;
    onChange?.(newValue);
    
    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      const newCursorPos = start + placeholder.length + 4; // +4 for {{}}
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Get syntax highlighting for the text
  const getSyntaxHighlightedText = () => {
    if (!value) return '';
    
    return value
      .replace(/\{\{([^}]+)\}\}/g, '<span class="placeholder">{{$1}}</span>')
      .replace(/\{\{#if\s+([^}]+)\}\}/g, '<span class="conditional">{{#if $1}}</span>')
      .replace(/\{\{\/if\}\}/g, '<span class="conditional">{{/if}}</span>')
      .replace(/\{\{random:([^}]+)\}\}/g, '<span class="random">{{random:$1}}</span>');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestionsPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelectionChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full min-h-[120px] p-3 border rounded-lg resize-vertical font-mono text-sm
            ${validation.isValid 
              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
              : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        
        {/* Syntax Highlighting Overlay (for future enhancement) */}
        {false && (
          <div 
            className="absolute inset-0 p-3 pointer-events-none font-mono text-sm text-transparent"
            dangerouslySetInnerHTML={{ __html: getSyntaxHighlightedText() }}
          />
        )}
      </div>

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
              onClick={() => insertSuggestion(suggestion)}
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
                  {suggestion.type}
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

      {/* Quick Insert Buttons */}
      {showSuggestions && !showSuggestionsPanel && (
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
        </div>
      )}

      {/* Validation Messages */}
      {showValidation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="mt-2 space-y-1">
          {validation.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {showPreview && value && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Code className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Preview</span>
            {resolution.errors.length === 0 && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <div className="text-sm">
            {resolution.errors.length > 0 ? (
              <div className="text-red-600">
                <div className="font-medium mb-1">Resolution Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {resolution.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-900 whitespace-pre-wrap">
                {resolution.resolved || 'Empty result'}
              </div>
            )}
          </div>
          
          {resolution.warnings.length > 0 && (
            <div className="mt-2 text-yellow-600">
              <div className="font-medium mb-1">Warnings:</div>
              <ul className="list-disc list-inside space-y-1">
                {resolution.warnings.map((warning, index) => (
                  <li key={index} className="text-xs">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="mb-1">
          <strong>Syntax:</strong> Use {'{{'}{'{placeholder}'}{'}}'} for variables, {'{{'}{'{#if condition}'}{'}}'} text {'{{'}{'/if}'}{'}}'} for conditionals, {'{{'}{'{random:option1,option2}'}{'}}'} for random text
        </div>
        <div>
          <strong>Shortcuts:</strong> Type {'{{'} to see suggestions, use ↑↓ to navigate, Enter/Tab to insert
        </div>
      </div>
    </div>
  );
};

export default PlaceholderEditor;