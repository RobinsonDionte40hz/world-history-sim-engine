import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Code, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

/**
 * TextPreview - Component for displaying resolved template text
 * 
 * Features:
 * - Side-by-side and overlay preview modes
 * - Highlighting for resolved vs unresolved placeholders
 * - Error indication for invalid template syntax
 * - Toggle between raw and resolved views
 */
const TextPreview = ({
  originalText = '',
  resolvedText = '',
  isResolved = false,
  errors = [],
  warnings = [],
  placeholderAnalysis = { resolved: [], unresolved: [] },
  mode = 'side-by-side', // 'side-by-side', 'overlay', 'toggle'
  showErrors = true,
  showPlaceholderInfo = true,
  className = '',
  onModeChange,
  compact = false
}) => {
  const [currentView, setCurrentView] = useState('resolved'); // 'original', 'resolved'
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Available modes
  const modes = [
    { value: 'side-by-side', label: 'Side by Side', icon: Code },
    { value: 'overlay', label: 'Overlay', icon: Eye },
    { value: 'toggle', label: 'Toggle', icon: RotateCcw }
  ];
  
  // Get status color and icon
  const getStatus = () => {
    if (errors.length > 0) {
      return { color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle, label: 'Error' };
    }
    if (warnings.length > 0) {
      return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle, label: 'Warning' };
    }
    if (isResolved) {
      return { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle, label: 'Resolved' };
    }
    if (placeholderAnalysis.unresolved.length > 0) {
      return { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: AlertCircle, label: 'Partial' };
    }
    return { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Code, label: 'Static' };
  };
  
  const status = getStatus();
  
  // Highlight placeholders in text
  const highlightPlaceholders = (text, type = 'original') => {
    if (!text || typeof text !== 'string') return text;
    
    // For resolved text, highlight any remaining unresolved placeholders
    if (type === 'resolved') {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
        return `<span class="bg-red-100 text-red-700 px-1 rounded font-mono text-sm border border-red-200" title="Unresolved placeholder: ${placeholder}">${match}</span>`;
      });
    }
    
    // For original text, highlight all placeholders with different colors based on resolution status
    return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
      const isResolved = placeholderAnalysis.resolved.some(r => r.placeholder === placeholder.trim());
      const isUnresolved = placeholderAnalysis.unresolved.includes(placeholder.trim());
      
      let className = 'px-1 rounded font-mono text-sm border ';
      let title = '';
      
      if (isResolved) {
        className += 'bg-green-100 text-green-700 border-green-200';
        const resolvedValue = placeholderAnalysis.resolved.find(r => r.placeholder === placeholder.trim())?.value;
        title = `Resolved to: ${resolvedValue}`;
      } else if (isUnresolved) {
        className += 'bg-yellow-100 text-yellow-700 border-yellow-200';
        title = `Unresolved placeholder: ${placeholder}`;
      } else {
        className += 'bg-blue-100 text-blue-700 border-blue-200';
        title = `Placeholder: ${placeholder}`;
      }
      
      return `<span class="${className}" title="${title}">${match}</span>`;
    });
  };
  
  // Render text content with highlighting
  const renderTextContent = (text, type) => {
    const highlighted = highlightPlaceholders(text, type);
    return (
      <div 
        className="whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };
  
  // Render mode selector
  const renderModeSelector = () => (
    <div className="flex items-center space-x-1">
      {modes.map(modeOption => {
        const Icon = modeOption.icon;
        return (
          <button
            key={modeOption.value}
            onClick={() => onModeChange?.(modeOption.value)}
            className={`
              p-1 rounded text-xs transition-colors
              ${mode === modeOption.value 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
            title={modeOption.label}
          >
            <Icon className="w-3 h-3" />
          </button>
        );
      })}
    </div>
  );
  
  // Render placeholder info
  const renderPlaceholderInfo = () => {
    if (!showPlaceholderInfo || (!placeholderAnalysis.resolved.length && !placeholderAnalysis.unresolved.length)) {
      return null;
    }
    
    return (
      <div className="mt-2 text-xs space-y-1">
        {placeholderAnalysis.resolved.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-medium">Resolved:</span>
            <div className="flex flex-wrap gap-1">
              {placeholderAnalysis.resolved.map((item, index) => (
                <span 
                  key={index}
                  className="bg-green-100 text-green-700 px-1 rounded font-mono"
                  title={`${item.placeholder} = ${item.value}`}
                >
                  {item.placeholder}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {placeholderAnalysis.unresolved.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 font-medium">Unresolved:</span>
            <div className="flex flex-wrap gap-1">
              {placeholderAnalysis.unresolved.map((placeholder, index) => (
                <span 
                  key={index}
                  className="bg-yellow-100 text-yellow-700 px-1 rounded font-mono"
                  title={`Missing context for: ${placeholder}`}
                >
                  {placeholder}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render error/warning messages
  const renderMessages = () => {
    if (!showErrors || (errors.length === 0 && warnings.length === 0)) {
      return null;
    }
    
    return (
      <div className="mt-2 space-y-1">
        {errors.map((error, index) => (
          <div key={`error-${index}`} className="flex items-start space-x-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ))}
        {warnings.map((warning, index) => (
          <div key={`warning-${index}`} className="flex items-start space-x-2 text-sm text-yellow-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Don't render if no content
  if (!originalText && !resolvedText) {
    return null;
  }
  
  return (
    <div className={`border border-gray-200 rounded-lg ${status.bgColor} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <status.icon className={`w-4 h-4 ${status.color}`} />
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <span className={`text-xs px-2 py-1 rounded ${status.color} ${status.bgColor}`}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {onModeChange && renderModeSelector()}
          
          {mode === 'toggle' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentView('original')}
                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${currentView === 'original' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Original
              </button>
              <button
                onClick={() => setCurrentView('resolved')}
                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${currentView === 'resolved' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Resolved
              </button>
            </div>
          )}
          
          {!compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        {mode === 'side-by-side' && (
          <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Original Template</div>
              <div className="p-3 bg-white border border-gray-200 rounded text-sm min-h-[60px]">
                {renderTextContent(originalText, 'original')}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Resolved Text</div>
              <div className="p-3 bg-white border border-gray-200 rounded text-sm min-h-[60px]">
                {renderTextContent(resolvedText, 'resolved')}
              </div>
            </div>
          </div>
        )}
        
        {mode === 'overlay' && (
          <div className="relative">
            <div className="text-xs font-medium text-gray-600 mb-2">
              Resolved Text {!isResolved && '(with unresolved placeholders)'}
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm min-h-[60px]">
              {renderTextContent(resolvedText, 'resolved')}
            </div>
          </div>
        )}
        
        {mode === 'toggle' && (
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">
              {currentView === 'original' ? 'Original Template' : 'Resolved Text'}
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm min-h-[60px]">
              {currentView === 'original' 
                ? renderTextContent(originalText, 'original')
                : renderTextContent(resolvedText, 'resolved')
              }
            </div>
          </div>
        )}
        
        {/* Messages */}
        {renderMessages()}
        
        {/* Placeholder Info */}
        {renderPlaceholderInfo()}
      </div>
    </div>
  );
};

export default TextPreview;