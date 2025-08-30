import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateLibraryPanel from '../components/TemplateLibraryPanel';

const TemplateLibraryPage = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (templateInstance, type) => {
    console.log('Template selected:', templateInstance, type);
    
    // Navigate to appropriate editor based on template type
    switch (type) {
      case 'characters':
        navigate('/editors/character', { 
          state: { 
            initialData: templateInstance,
            fromTemplate: true 
          } 
        });
        break;
      case 'nodes':
        navigate('/editors/node', { 
          state: { 
            initialData: templateInstance,
            fromTemplate: true 
          } 
        });
        break;
      case 'interactions':
        navigate('/editors/interaction', { 
          state: { 
            initialData: templateInstance,
            fromTemplate: true 
          } 
        });
        break;
      case 'worlds':
        navigate('/world-builder', { 
          state: { 
            initialData: templateInstance,
            fromTemplate: true 
          } 
        });
        break;
      default:
        console.log('Template type not supported for direct editing:', type);
    }
  };

  const handleTemplateEdit = (template, type) => {
    console.log('Edit template:', template, type);
    
    // Navigate to template editor (could be same as regular editor but in template mode)
    switch (type) {
      case 'characters':
        navigate('/editors/character', { 
          state: { 
            initialData: template,
            isTemplate: true,
            editMode: true
          } 
        });
        break;
      case 'nodes':
        navigate('/editors/node', { 
          state: { 
            initialData: template,
            isTemplate: true,
            editMode: true
          } 
        });
        break;
      case 'interactions':
        navigate('/editors/interaction', { 
          state: { 
            initialData: template,
            isTemplate: true,
            editMode: true
          } 
        });
        break;
      default:
        console.log('Template editing not supported for type:', type);
    }
  };

  const handleTemplateCreate = (type) => {
    console.log('Create new template of type:', type);
    
    // Navigate to editor in template creation mode
    switch (type) {
      case 'characters':
        navigate('/editors/character', { 
          state: { 
            isTemplate: true,
            createMode: true
          } 
        });
        break;
      case 'nodes':
        navigate('/editors/node', { 
          state: { 
            isTemplate: true,
            createMode: true
          } 
        });
        break;
      case 'interactions':
        navigate('/editors/interaction', { 
          state: { 
            isTemplate: true,
            createMode: true
          } 
        });
        break;
      default:
        console.log('Template creation not supported for type:', type);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Browse, create, and manage structural templates for character attributes, node properties, and interaction mechanics
                </p>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Looking for text templating?</strong> Dynamic text with placeholders like <code className="bg-blue-100 px-1 rounded">{'{{'}character.name{'}'}</code> is now integrated directly into the InteractionEditor and EncounterEditor.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/world-builder')}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back to Builder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplateLibraryPanel
          onTemplateSelect={handleTemplateSelect}
          onTemplateEdit={handleTemplateEdit}
          onTemplateCreate={handleTemplateCreate}
          className="shadow-sm"
        />
      </div>

      {/* Template Preview Modal (if needed) */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Template Preview</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedTemplate, null, 2)}
                  </pre>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleTemplateSelect(selectedTemplate, 'characters'); // Adjust type as needed
                      setSelectedTemplate(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibraryPage;