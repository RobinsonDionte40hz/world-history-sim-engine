import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, FileText, Users, MapPin, MessageSquare } from 'lucide-react';
import TemplateLibraryPanel from '../components/TemplateLibraryPanel';
import TemplateCustomizationDialog from '../components/TemplateCustomizationDialog';
import useTemplateCustomization from '../hooks/useTemplateCustomization';
import useTemplates from '../hooks/useTemplates';

const TemplatePage = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('characters');

  const {
    isDialogOpen,
    selectedTemplate,
    templateType: currentTemplateType,
    customizationContext,
    presetCustomizations,
    openCustomizationDialog,
    closeCustomizationDialog,
    handleTemplateConfirm,
    getEnhancedContext
  } = useTemplateCustomization();

  const { saveTemplate } = useTemplates();

  // Structural templates for showcasing the system - focused on data configuration, not text content
  const structuralTemplates = useMemo(() => ({
    characters: {
      id: 'structural_balanced_character',
      name: 'Balanced Character Attributes',
      description: 'A character template with balanced D&D attributes and personality traits for general use.',
      type: 'characters',
      tags: ['balanced', 'attributes', 'structural'],
      attributes: {
        strength: 13,
        dexterity: 13,
        constitution: 13,
        intelligence: 13,
        wisdom: 13,
        charisma: 13
      },
      consciousness: {
        frequency: 45,
        coherence: 0.7
      },
      personality: {
        aggression: 0.4,
        curiosity: 0.6,
        empathy: 0.5
      },
      customizationOptions: {
        attributeBonus: {
          type: 'select',
          label: 'Primary Attribute',
          options: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
          default: 'Strength',
          description: 'Which attribute gets a +3 bonus'
        },
        personalityFocus: {
          type: 'select',
          label: 'Personality Focus',
          options: ['Aggressive', 'Curious', 'Empathetic', 'Balanced'],
          default: 'Balanced',
          description: 'Dominant personality trait'
        }
      },
      metadata: {
        category: 'structural',
        difficulty: 'beginner',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        isStructural: true
      }
    },
    nodes: {
      id: 'structural_settlement_node',
      name: 'Settlement Node Properties',
      description: 'A node template with configurable environmental and cultural properties for settlements.',
      type: 'nodes',
      tags: ['settlement', 'properties', 'structural'],
      nodeType: 'settlement',
      environmentalProperties: {
        crowded: false,
        noisy: false,
        prosperous: true,
        safe: true,
        clean: true
      },
      culturalContext: {
        language: 'common',
        customs: 'traditional',
        law: 'moderate',
        religion: 'diverse'
      },
      resourceAvailability: {
        food: 'abundant',
        water: 'clean',
        materials: 'available',
        information: 'flowing'
      },
      customizationOptions: {
        settlementSize: {
          type: 'select',
          label: 'Settlement Size',
          options: ['Village', 'Town', 'City', 'Metropolis'],
          default: 'Town',
          description: 'Size and population of the settlement'
        },
        economicFocus: {
          type: 'select',
          label: 'Economic Focus',
          options: ['Agriculture', 'Trade', 'Crafting', 'Military', 'Academic'],
          default: 'Trade',
          description: 'Primary economic activity'
        }
      },
      metadata: {
        category: 'structural',
        difficulty: 'beginner',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        isStructural: true
      }
    },
    interactions: {
      id: 'structural_skill_check',
      name: 'Attribute-Based Skill Check',
      description: 'A structural interaction template for attribute-based skill checks with configurable difficulty.',
      type: 'interactions',
      tags: ['skill-check', 'attributes', 'structural'],
      interactionType: 'skill_check',
      requirements: {
        attributes: {
          // Will be set based on customization
        }
      },
      effects: {
        success: {
          attribute_bonus: 1,
          reputation: 2
        },
        failure: {
          reputation: -1
        }
      },
      customizationOptions: {
        primaryAttribute: {
          type: 'select',
          label: 'Primary Attribute',
          options: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
          default: 'Charisma',
          description: 'Which attribute is tested'
        },
        difficulty: {
          type: 'select',
          label: 'Difficulty Class',
          options: ['Easy (DC 10)', 'Moderate (DC 15)', 'Hard (DC 20)', 'Very Hard (DC 25)'],
          default: 'Moderate (DC 15)',
          description: 'Difficulty of the skill check'
        }
      },
      metadata: {
        category: 'structural',
        difficulty: 'intermediate',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        isStructural: true
      }
    }
  }), []);

  // Handle template customization events from sidebar
  useEffect(() => {
    const handleTemplateCustomization = (event) => {
      const { entityType } = event.detail;

      // Find or create a structural template for this type
      const template = structuralTemplates[entityType];
      if (template) {
        const context = getEnhancedContext(entityType, {
          character: { name: 'Demo Character', attributes: { strength: 16, charisma: 14 } },
          node: { name: 'Demo Location' },
          world: { name: 'Demo World', theme: 'fantasy' }
        });

        openCustomizationDialog(template, entityType, context);
      }
    };

    const handleTemplateLibrary = (event) => {
      const { tab, action } = event.detail;
      setSelectedTab(tab);

      if (action === 'customize') {
        // Open the template library focused on customization
        console.log(`Opening template library for ${tab} with focus on customization`);
      }
    };

    window.addEventListener('openTemplateCustomization', handleTemplateCustomization);
    window.addEventListener('openTemplateLibrary', handleTemplateLibrary);

    return () => {
      window.removeEventListener('openTemplateCustomization', handleTemplateCustomization);
      window.removeEventListener('openTemplateLibrary', handleTemplateLibrary);
    };
  }, [getEnhancedContext, openCustomizationDialog, structuralTemplates]);

  const handleTemplateSelect = (template, type) => {
    console.log('Template selected:', template, type);
    // In a real application, this would integrate with the editor
    alert(`Template "${template.name}" selected for ${type}!`);
  };

  const handleTemplateCreate = (type) => {
    console.log('Create new template for:', type);
    // In a real application, this would open a template creation dialog
    alert(`Create new ${type} template`);
  };

  const handleCustomizationConfirm = async (customizedTemplate) => {
    try {
      const finalTemplate = handleTemplateConfirm(customizedTemplate);

      // Save the customized template as a new template
      await saveTemplate(currentTemplateType, {
        ...finalTemplate,
        id: `customized_${Date.now()}`,
        name: `${finalTemplate.name} (Customized)`,
        metadata: {
          ...finalTemplate.metadata,
          isCustomized: true,
          originalTemplateId: selectedTemplate?.id,
          customizedAt: new Date().toISOString()
        }
      });

      alert(`Customized template "${finalTemplate.name}" has been saved!`);
    } catch (err) {
      console.error('Failed to save customized template:', err);
      alert(`Failed to save template: ${err.message}`);
    }
  };

  const handleStructuralTemplate = (type) => {
    const template = structuralTemplates[type];
    if (template) {
      const context = getEnhancedContext(type, {
        character: {
          name: 'Demo Character',
          attributes: { strength: 16, dexterity: 12, constitution: 15, intelligence: 10, wisdom: 13, charisma: 14 },
          personality: { aggression: 0.3, curiosity: 0.7, empathy: 0.6 }
        },
        node: {
          name: 'Demo Location',
          type: 'tavern',
          environmentalProperties: { warm: true, safe: true },
          culturalContext: { language: 'common', customs: 'friendly' }
        },
        world: { name: 'Demo World', theme: 'fantasy', era: 'medieval' }
      });

      openCustomizationDialog(template, type, context);
    }
  };

  const tabs = [
    { id: 'characters', label: 'Characters', icon: Users, color: 'blue' },
    { id: 'nodes', label: 'Nodes', icon: MapPin, color: 'green' },
    { id: 'interactions', label: 'Interactions', icon: MessageSquare, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-slate-600" />
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-indigo-400" />
                <h1 className="text-xl font-bold text-white">Template System</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-slate-300">Dynamic Text Templating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guidance Section */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-400" />
              Template Library - Structural Templates
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-bold">i</span>
                </div>
                <div>
                  <h3 className="text-blue-300 font-medium mb-2">Text Templating is Now in Editors</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    Dynamic text templating with placeholders like <code className="bg-slate-700 px-1 rounded text-blue-300">{'{{character.name}}'}</code> and
                    conditionals like <code className="bg-slate-700 px-1 rounded text-blue-300">{'{{#if condition}}'}</code> is now integrated
                    directly into the InteractionEditor and EncounterEditor.
                  </p>
                  <p className="text-slate-300 text-sm">
                    This template library focuses on <strong>structural templates</strong> - reusable configurations for
                    character attributes, node properties, and interaction mechanics.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-white font-medium mb-4">Try Structural Templates</h3>
            <p className="text-slate-300 mb-6">
              These templates provide pre-configured data structures and attribute combinations that you can customize and reuse across your world.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleStructuralTemplate(tab.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
                    hover:scale-105 hover:shadow-lg
                    ${tab.color === 'blue' ? 'border-blue-500/30 bg-blue-500/10 hover:border-blue-400 hover:bg-blue-500/20' : ''}
                    ${tab.color === 'green' ? 'border-green-500/30 bg-green-500/10 hover:border-green-400 hover:bg-green-500/20' : ''}
                    ${tab.color === 'purple' ? 'border-purple-500/30 bg-purple-500/10 hover:border-purple-400 hover:bg-purple-500/20' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <tab.icon className={`w-6 h-6 ${tab.color === 'blue' ? 'text-blue-400' :
                      tab.color === 'green' ? 'text-green-400' :
                        'text-purple-400'
                      }`} />
                    <span className="font-medium text-white">{tab.label}</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {tab.id === 'characters' && 'Configure D&D attributes, consciousness, and personality traits'}
                    {tab.id === 'nodes' && 'Set environmental properties, cultural context, and resources'}
                    {tab.id === 'interactions' && 'Define skill checks, requirements, and mechanical effects'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Library */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <TemplateLibraryPanel
            selectedType={selectedTab}
            onTemplateSelect={handleTemplateSelect}
            onTemplateCreate={handleTemplateCreate}
            showRecommendations={true}
            enableBulkOperations={true}
            worldState={{
              name: 'Demo World',
              theme: 'fantasy',
              character: { name: 'Demo Character' },
              node: { name: 'Demo Location' }
            }}
          />
        </div>
      </div>

      {/* Template Customization Dialog */}
      <TemplateCustomizationDialog
        template={selectedTemplate}
        type={currentTemplateType}
        isOpen={isDialogOpen}
        onClose={closeCustomizationDialog}
        onConfirm={handleCustomizationConfirm}
        presetCustomizations={presetCustomizations}
        context={customizationContext}
      />
    </div>
  );
};

export default TemplatePage;