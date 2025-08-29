import React, { useState } from 'react';
import DialoguePatterns from './DialoguePatterns';
import PlaceholderEditor from './PlaceholderEditor';

/**
 * DialoguePatternsExample - Example component showing how to use DialoguePatterns
 * with PlaceholderEditor for text templating
 */
const DialoguePatternsExample = () => {
  const [text, setText] = useState('');
  const [showPatterns, setShowPatterns] = useState(true);

  // Sample context for demonstration
  const sampleContext = {
    character: {
      id: 'sample-char',
      name: 'Aria Blackwood',
      attributes: {
        strength: 16,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 15,
        charisma: 18
      },
      personality: {
        aggression: 0.3,
        curiosity: 0.8,
        empathy: 0.7
      },
      consciousness: {
        frequency: 45,
        coherence: 0.8
      },
      reputation: 15,
      archetype: 'Noble'
    },
    node: {
      id: 'sample-node',
      name: 'Royal Court',
      type: 'palace',
      environmentalProperties: {
        formal: true,
        crowded: true,
        luxurious: true
      },
      culturalContext: {
        language: 'common',
        customs: 'courtly',
        law: 'royal decree'
      },
      resourceAvailability: {
        gold: 'abundant',
        information: 'flowing',
        influence: 'high'
      },
      population: 500
    },
    world: {
      id: 'sample-world',
      name: 'Eldoria',
      theme: 'medieval fantasy',
      properties: {
        magicLevel: 'high',
        technologyLevel: 'medieval',
        politicalSystem: 'monarchy'
      }
    }
  };

  // Handle pattern insertion
  const handlePatternInsert = (pattern) => {
    const insertText = pattern.template || pattern;
    setText(prevText => {
      // Simple insertion at the end - in a real editor, this would insert at cursor position
      return prevText ? `${prevText}\n\n${insertText}` : insertText;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dialogue Patterns Example
        </h1>
        <p className="text-gray-600">
          Demonstration of the DialoguePatterns component with contextual text templating
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Text Editor</h2>
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showPatterns ? 'Hide' : 'Show'} Patterns
            </button>
          </div>

          <PlaceholderEditor
            value={text}
            onChange={setText}
            context={sampleContext}
            placeholder="Start typing or insert a dialogue pattern..."
            showPreview={true}
            showSuggestions={true}
            rows={8}
          />

          <div className="text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Type text with placeholders like <code>{'{{character.name}}'}</code></li>
              <li>Use conditionals like <code>{'{{#if character.reputation > 10}}text{{/if}}'}</code></li>
              <li>Add random selections like <code>{'{{random:option1,option2,option3}}'}</code></li>
              <li>Click patterns on the right to insert them</li>
            </ul>
          </div>
        </div>

        {/* Dialogue Patterns */}
        {showPatterns && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Dialogue Patterns</h2>
            
            <DialoguePatterns
              onInsert={handlePatternInsert}
              context={sampleContext}
              categories={['greetings', 'farewells', 'questions', 'reactions']}
              showSearch={true}
              showCustomPatterns={true}
              className="h-96"
            />

            <div className="text-sm text-gray-600">
              <p><strong>Available Context:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Character: {sampleContext.character.name} (Noble, Charisma 18)</li>
                <li>Location: {sampleContext.node.name} (Palace, Formal)</li>
                <li>World: {sampleContext.world.name} (Medieval Fantasy)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setText('')}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Text
          </button>
          <button
            onClick={() => handlePatternInsert('{{random:Greetings,Hello,Well met}}, {{character.name}}!')}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Insert Basic Greeting
          </button>
          <button
            onClick={() => handlePatternInsert('{{#if character.reputation > 10}}Your reputation precedes you, {{character.name}}{{/if}}{{#if character.reputation <= 10}}I don\'t believe we\'ve met, stranger{{/if}}.')}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Insert Conditional Text
          </button>
          <button
            onClick={() => handlePatternInsert('Welcome to {{node.name}}, {{character.name}}. {{#if node.environmentalProperties.formal}}Please observe proper etiquette{{/if}}.')}
            className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Insert Location Reference
          </button>
        </div>
      </div>

      {/* Sample Output */}
      {text && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Text</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialoguePatternsExample;