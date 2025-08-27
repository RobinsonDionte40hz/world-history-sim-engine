import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

  // Demo templates for showcasing the system - memoized to prevent useEffect dependency issues
  const demoTemplates = useMemo(() => ({
    characters: {
      id: 'demo_warrior',
      name: 'Heroic Warrior',
      description: 'A brave warrior ready for adventure with customizable attributes and background.',
      type: 'characters',
      tags: ['warrior', 'combat', 'heroic'],
      attributes: {
        strength: 16,
        dexterity: 12,
        constitution: 15,
        intelligence: 10,
        wisdom: 13,
        charisma: 14
      },
      customizationOptions: {
        strength: {
          type: 'number',
          label: 'Strength',
          min: 8,
          max: 18,
          default: 16,
          description: 'Physical power and combat prowess'
        },
        weaponSpecialty: {
          type: 'select',
          label: 'Weapon Specialty',
          options: ['Sword', 'Axe', 'Bow', 'Spear', 'Mace'],
          default: 'Sword',
          description: 'Preferred weapon type'
        },
        isVeteran: {
          type: 'boolean',
          label: 'Veteran Warrior',
          default: false,
          description: 'Has extensive combat experience'
        },
        personalityTrait: {
          type: 'select',
          label: 'Personality Trait',
          options: ['Brave', 'Cautious', 'Reckless', 'Noble', 'Pragmatic'],
          default: 'Brave',
          description: 'Dominant personality characteristic'
        }
      },
      textTemplates: {
        description: '{{character.name}} is a {{#if isVeteran}}veteran{{/if}} warrior specializing in {{weaponSpecialty}} combat. {{#if character.attributes.strength > 15}}Their impressive strength makes them formidable in battle.{{/if}} Known for being {{personalityTrait}}, they approach conflicts with {{#if personalityTrait == "Cautious"}}careful planning{{/if}}{{#if personalityTrait == "Reckless"}}bold aggression{{/if}}{{#if personalityTrait == "Brave"}}unwavering courage{{/if}}{{#if personalityTrait == "Noble"}}honor and dignity{{/if}}{{#if personalityTrait == "Pragmatic"}}practical efficiency{{/if}}.',
        background: 'Born in {{node.name}}, {{character.name}} {{#if isVeteran}}has seen many battles and earned their reputation through years of service{{/if}}{{#if !isVeteran}}is eager to prove themselves and make their mark on the world{{/if}}. Their {{weaponSpecialty}} has become an extension of their will, and their {{personalityTrait}} nature has shaped their approach to both combat and life.',
        greeting: '{{random:Greetings,Hail,Well met}}, {{#if character.attributes.charisma > 14}}friend{{/if}}{{#if character.attributes.charisma <= 14}}traveler{{/if}}! I am {{character.name}}, {{#if isVeteran}}a seasoned warrior{{/if}}{{#if !isVeteran}}a warrior seeking adventure{{/if}}.'
      },
      textTemplateFields: [
        {
          key: 'battleCry',
          label: 'Battle Cry',
          placeholder: 'Enter a battle cry with {{placeholders}}...'
        },
        {
          key: 'motto',
          label: 'Personal Motto',
          placeholder: 'Enter a personal motto...'
        }
      ],
      metadata: {
        category: 'combat',
        difficulty: 'beginner',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }
    },
    nodes: {
      id: 'demo_tavern',
      name: 'The Prancing Pony',
      description: 'A cozy tavern where travelers gather to share stories and information.',
      type: 'nodes',
      tags: ['tavern', 'social', 'information'],
      nodeType: 'tavern',
      environmentalProperties: {
        warm: true,
        noisy: true,
        crowded: true,
        safe: true
      },
      culturalContext: {
        language: 'common',
        customs: 'friendly',
        law: 'tavern rules'
      },
      customizationOptions: {
        atmosphere: {
          type: 'select',
          label: 'Atmosphere',
          options: ['Cozy', 'Rowdy', 'Mysterious', 'Elegant', 'Rough'],
          default: 'Cozy',
          description: 'Overall feel of the establishment'
        },
        priceLevel: {
          type: 'select',
          label: 'Price Level',
          options: ['Cheap', 'Moderate', 'Expensive', 'Luxury'],
          default: 'Moderate',
          description: 'Cost of food and lodging'
        },
        hasRooms: {
          type: 'boolean',
          label: 'Has Lodging',
          default: true,
          description: 'Offers rooms for rent'
        },
        specialFeature: {
          type: 'select',
          label: 'Special Feature',
          options: ['Live Music', 'Gaming Tables', 'Private Booths', 'Fireplace', 'Garden'],
          default: 'Fireplace',
          description: 'Unique attraction'
        }
      },
      textTemplates: {
        description: '{{node.name}} is a {{atmosphere}} tavern in {{world.name}}. {{#if hasRooms}}It offers both food and lodging{{/if}}{{#if !hasRooms}}It serves food and drink but no lodging{{/if}} at {{priceLevel}} prices. The {{specialFeature}} adds to its charm, making it {{#if atmosphere == "Cozy"}}a welcoming refuge{{/if}}{{#if atmosphere == "Rowdy"}}a lively gathering place{{/if}}{{#if atmosphere == "Mysterious"}}an intriguing establishment{{/if}}{{#if atmosphere == "Elegant"}}a refined venue{{/if}}{{#if atmosphere == "Rough"}}a place for hardy folk{{/if}}.',
        ambiance: 'The {{atmosphere}} atmosphere is enhanced by {{#if specialFeature == "Live Music"}}melodic tunes that fill the air{{/if}}{{#if specialFeature == "Gaming Tables"}}the sounds of dice and cards{{/if}}{{#if specialFeature == "Private Booths"}}intimate seating arrangements{{/if}}{{#if specialFeature == "Fireplace"}}the warm glow of crackling flames{{/if}}{{#if specialFeature == "Garden"}}the peaceful view of greenery{{/if}}. {{#if node.environmentalProperties.crowded}}The place bustles with activity{{/if}}{{#if !node.environmentalProperties.crowded}}It maintains a quieter ambiance{{/if}}.'
      },
      textTemplateFields: [
        {
          key: 'welcomeMessage',
          label: 'Welcome Message',
          placeholder: 'What the innkeeper says to new guests...'
        },
        {
          key: 'specialtyDrink',
          label: 'Specialty Drink',
          placeholder: 'Describe the tavern\'s signature beverage...'
        }
      ],
      metadata: {
        category: 'social',
        difficulty: 'beginner',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }
    },
    interactions: {
      id: 'demo_negotiation',
      name: 'Merchant Negotiation',
      description: 'A flexible negotiation interaction with customizable outcomes.',
      type: 'interactions',
      tags: ['social', 'trade', 'negotiation'],
      interactionType: 'dialogue',
      requirements: {
        attributes: {
          charisma: 12
        }
      },
      customizationOptions: {
        difficulty: {
          type: 'select',
          label: 'Difficulty',
          options: ['Easy', 'Moderate', 'Hard', 'Very Hard'],
          default: 'Moderate',
          description: 'How challenging the negotiation is'
        },
        tradeGood: {
          type: 'select',
          label: 'Trade Good',
          options: ['Weapons', 'Armor', 'Supplies', 'Information', 'Services'],
          default: 'Supplies',
          description: 'What is being negotiated'
        },
        merchantPersonality: {
          type: 'select',
          label: 'Merchant Personality',
          options: ['Greedy', 'Fair', 'Suspicious', 'Friendly', 'Desperate'],
          default: 'Fair',
          description: 'Merchant\'s approach to business'
        },
        hasAlternative: {
          type: 'boolean',
          label: 'Has Alternative Offer',
          default: true,
          description: 'Merchant can offer something else if first deal fails'
        }
      },
      textTemplates: {
        description: 'Negotiate with a {{merchantPersonality}} merchant over {{tradeGood}}. {{#if difficulty == "Easy"}}They seem eager to make a deal.{{/if}}{{#if difficulty == "Moderate"}}They appear open to reasonable offers.{{/if}}{{#if difficulty == "Hard"}}They drive a hard bargain.{{/if}}{{#if difficulty == "Very Hard"}}They seem almost unwilling to negotiate.{{/if}}',
        successMessage: '{{#if merchantPersonality == "Greedy"}}The merchant\'s eyes light up with greed as they accept your offer{{/if}}{{#if merchantPersonality == "Fair"}}The merchant nods approvingly at your fair proposal{{/if}}{{#if merchantPersonality == "Suspicious"}}Despite their suspicion, the merchant agrees to your terms{{/if}}{{#if merchantPersonality == "Friendly"}}The merchant smiles warmly and shakes your hand{{/if}}{{#if merchantPersonality == "Desperate"}}The merchant eagerly accepts, clearly needing the deal{{/if}}. You successfully acquire the {{tradeGood}}.',
        failureMessage: '{{#if hasAlternative}}The merchant shakes their head but offers an alternative deal{{/if}}{{#if !hasAlternative}}The merchant firmly refuses your offer and turns away{{/if}}. {{#if merchantPersonality == "Greedy"}}Their greed prevents them from seeing reason{{/if}}{{#if merchantPersonality == "Suspicious"}}Their suspicion gets the better of them{{/if}}{{#if merchantPersonality == "Fair"}}They maintain their fair but firm position{{/if}}.'
      },
      textTemplateFields: [
        {
          key: 'openingLine',
          label: 'Opening Line',
          placeholder: 'What the merchant says to start the negotiation...'
        },
        {
          key: 'alternativeOffer',
          label: 'Alternative Offer',
          placeholder: 'What the merchant offers if the main deal fails...'
        }
      ],
      metadata: {
        category: 'social',
        difficulty: 'intermediate',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }
    }
  }), []);

  // Handle template customization events from sidebar
  useEffect(() => {
    const handleTemplateCustomization = (event) => {
      const { entityType } = event.detail;

      // Find or create a demo template for this type
      const template = demoTemplates[entityType];
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
  }, [getEnhancedContext, openCustomizationDialog, demoTemplates]);

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

  const handleDemoTemplate = (type) => {
    const template = demoTemplates[type];
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
        {/* Demo Section */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Wand2 className="w-5 h-5 mr-2 text-indigo-400" />
              Try Template Customization
            </h2>
            <p className="text-slate-300 mb-6">
              Experience the power of dynamic text templating with these interactive demos.
              Each template showcases different customization options and text templating features.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleDemoTemplate(tab.id)}
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
                    {tab.id === 'characters' && 'Customize warrior attributes, personality, and dynamic descriptions'}
                    {tab.id === 'nodes' && 'Configure tavern atmosphere, features, and contextual text'}
                    {tab.id === 'interactions' && 'Adjust negotiation difficulty, outcomes, and dialogue'}
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