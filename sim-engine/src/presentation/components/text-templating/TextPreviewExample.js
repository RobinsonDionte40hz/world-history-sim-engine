import React, { useState } from 'react';
import TextPreview from './TextPreview';
import useTemplatePreview from '../../hooks/useTemplatePreview';

/**
 * TextPreviewExample - Example component demonstrating TextPreview usage
 * 
 * This example shows how to integrate TextPreview with useTemplatePreview
 * to create a complete real-time preview system for template text.
 */
const TextPreviewExample = () => {
  const [templateText, setTemplateText] = useState('Hello {{character.name}}, welcome to {{node.name}}!');
  const [previewMode, setPreviewMode] = useState('side-by-side');
  
  // Mock context for demonstration
  const context = {
    character: {
      name: 'Elena',
      attributes: {
        strength: 15,
        charisma: 12
      },
      personality: {
        aggression: 0.2,
        curiosity: 0.8,
        empathy: 0.6
      }
    },
    node: {
      name: 'Market Square',
      type: 'marketplace',
      environmentalProperties: {
        crowded: true,
        noisy: true,
        prosperous: true
      }
    },
    world: {
      name: 'Aethermoor'
    }
  };
  
  // Use the template preview hook
  const {
    previewText,
    isResolved,
    errors,
    warnings,
    placeholderAnalysis,
    validation,
    resolutionStatus,
    hasPlaceholders,
    forceResolve
  } = useTemplatePreview(templateText, context, {
    debounceMs: 300,
    enableDebouncing: true
  });
  
  // Example templates to try
  const exampleTemplates = [
    'Hello {{character.name}}, welcome to {{node.name}}!',
    '{{#if character.attributes.charisma > 10}}Your charm is evident, {{character.name}}.{{/if}}',
    '{{random:Greetings,Hello,Well met}}, {{character.name}}! {{node.name}} is {{#if node.environmentalProperties.crowded}}bustling{{/if}}{{#if node.environmentalProperties.prosperous}}prosperous{{/if}} today.',
    'Invalid template with {{unclosed placeholder',
    'Static text without any placeholders',
    'Missing context: {{character.name}} from {{missing.property}}'
  ];
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          TextPreview Component Example
        </h1>
        <p className="text-gray-600 mb-6">
          This example demonstrates the TextPreview component with real-time template resolution.
          Try editing the template text or selecting different examples to see how the preview updates.
        </p>
        
        {/* Template Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Text
          </label>
          <textarea
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
            rows={3}
            placeholder="Enter template text with {{placeholders}}..."
          />
        </div>
        
        {/* Example Templates */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Try Example Templates
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => setTemplateText(template)}
                className="p-2 text-left text-xs bg-gray-100 hover:bg-gray-200 rounded border font-mono"
                title={template}
              >
                {template.length > 50 ? `${template.substring(0, 50)}...` : template}
              </button>
            ))}
          </div>
        </div>
        
        {/* Preview Mode Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview Mode
          </label>
          <div className="flex space-x-2">
            {['side-by-side', 'overlay', 'toggle'].map(mode => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`
                  px-3 py-1 text-sm rounded border transition-colors
                  ${previewMode === mode 
                    ? 'bg-blue-100 text-blue-700 border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }
                `}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        {/* Hook Status Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Hook Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-medium">Resolution Status:</span>
              <div className={`
                inline-block ml-1 px-2 py-1 rounded
                ${resolutionStatus === 'complete' ? 'bg-green-100 text-green-700' :
                  resolutionStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                  resolutionStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }
              `}>
                {resolutionStatus}
              </div>
            </div>
            <div>
              <span className="font-medium">Has Placeholders:</span>
              <span className="ml-1">{hasPlaceholders ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium">Is Resolved:</span>
              <span className="ml-1">{isResolved ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium">Validation:</span>
              <span className={`ml-1 ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>
          
          {/* Force Resolve Button */}
          <div className="mt-2">
            <button
              onClick={forceResolve}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200"
            >
              Force Resolve
            </button>
          </div>
        </div>
        
        {/* Context Display */}
        <div className="mb-6">
          <details className="bg-gray-50 rounded-lg">
            <summary className="p-3 cursor-pointer text-sm font-medium text-gray-700">
              Available Context (Click to expand)
            </summary>
            <div className="p-3 pt-0">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(context, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
      
      {/* TextPreview Component */}
      <TextPreview
        originalText={templateText}
        resolvedText={previewText}
        isResolved={isResolved}
        errors={errors}
        warnings={warnings}
        placeholderAnalysis={placeholderAnalysis}
        mode={previewMode}
        onModeChange={setPreviewMode}
        showErrors={true}
        showPlaceholderInfo={true}
        className="shadow-lg"
      />
    </div>
  );
};

export default TextPreviewExample;