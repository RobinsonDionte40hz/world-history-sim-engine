# Design Document

## Overview

The Editor Text Templating system integrates dialogue and quest text templating directly into the InteractionEditor and EncounterEditor as contextual features. This design leverages the existing TextTemplateEngine architecture while providing a seamless, context-aware editing experience that eliminates the need for separate template library navigation for text content. The system maintains clean architecture principles by extracting reusable components and providing smart context detection.

## Architecture

### Integration with Existing Systems

The design builds upon the established clean architecture:
- **Domain Layer**: Leverages existing TextTemplateEngine without modification
- **Application Layer**: Extends TemplateIntegrationService for editor context
- **Infrastructure Layer**: Uses existing template persistence mechanisms
- **Presentation Layer**: Enhances editors with integrated text templating components

### Component Architecture

```
presentation/
├── components/
│   ├── editors/
│   │   ├── InteractionEditor.js (enhanced)
│   │   ├── EncounterEditor.js (enhanced)
│   │   └── text-templating/
│   │       ├── PlaceholderEditor.js (extracted & enhanced)
│   │       ├── ContextualSuggestions.js (new)
│   │       ├── DialoguePatterns.js (new)
│   │       ├── TextPreview.js (new)
│   │       └── TemplateToolbar.js (new)
│   └── template/
│       └── TemplateLibraryPage.js (simplified)
├── hooks/
│   ├── useTextTemplating.js (new)
│   ├── useContextualSuggestions.js (new)
│   └── useTemplatePreview.js (new)
└── services/
    └── EditorContextService.js (new)
```

## Components and Interfaces

### 1. Enhanced PlaceholderEditor

**Purpose**: Reusable text templating component for all editors

**Key Features**:
- Automatic context detection from props
- Real-time placeholder suggestions
- Live preview with actual data resolution
- Progressive disclosure of advanced features

**Interface**:
```javascript
interface PlaceholderEditorProps {
  value: string;
  onChange: (text: string) => void;
  context: {
    character?: Character;
    node?: Node;
    world?: World;
    [key: string]: any;
  };
  placeholder?: string;
  showPreview?: boolean;
  showSuggestions?: boolean;
  className?: string;
}
```

**Implementation Strategy**:
```javascript
const PlaceholderEditor = ({ value, onChange, context, showPreview = true, showSuggestions = true }) => {
  const { suggestions, insertPlaceholder } = useContextualSuggestions(context);
  const { previewText, isResolved } = useTemplatePreview(value, context);
  
  return (
    <div className="placeholder-editor">
      <div className="editor-section">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="template-textarea"
        />
        {showSuggestions && (
          <ContextualSuggestions
            suggestions={suggestions}
            onInsert={insertPlaceholder}
          />
        )}
      </div>
      {showPreview && (
        <TextPreview
          originalText={value}
          resolvedText={previewText}
          isResolved={isResolved}
        />
      )}
    </div>
  );
};
```

### 2. ContextualSuggestions Component

**Purpose**: Provides context-aware placeholder suggestions

**Features**:
- Categorized suggestions by data type
- Search and filter capabilities
- Quick insertion with cursor positioning
- Tooltips with placeholder descriptions

**Interface**:
```javascript
interface ContextualSuggestionsProps {
  suggestions: PlaceholderSuggestion[];
  onInsert: (placeholder: string) => void;
  searchable?: boolean;
  categorized?: boolean;
}

interface PlaceholderSuggestion {
  placeholder: string;
  description: string;
  category: 'character' | 'node' | 'world' | 'system';
  example?: string;
  available: boolean; // Based on current context
}
```

### 3. DialoguePatterns Component

**Purpose**: Quick-insert common dialogue patterns

**Features**:
- Predefined dialogue templates
- Contextual pattern suggestions
- Pattern categories (greetings, farewells, questions, etc.)
- Customizable pattern library

**Interface**:
```javascript
interface DialoguePatternsProps {
  onInsert: (pattern: string) => void;
  context: EditorContext;
  categories?: string[];
}

const dialoguePatterns = {
  greetings: [
    "{{random:Greetings,Hello,Well met}}, {{character.name}}!",
    "{{character.name}}, {{#if character.reputation > 10}}my friend{{/if}}{{#if character.reputation <= 10}}stranger{{/if}}."
  ],
  farewells: [
    "Safe travels, {{character.name}}.",
    "May {{random:fortune,luck,the gods}} favor you, {{character.name}}."
  ],
  questions: [
    "What brings you to {{node.name}}, {{character.name}}?",
    "Have you heard any news from {{random:the capital,other settlements,your travels}}?"
  ],
  reactions: [
    "{{#if character.attributes.charisma > 14}}Your words carry weight, {{character.name}}.{{/if}}",
    "{{#if character.reputation < 5}}I'm not sure I trust you, stranger.{{/if}}"
  ]
};
```

### 4. TextPreview Component

**Purpose**: Real-time preview of resolved template text

**Features**:
- Side-by-side or overlay preview modes
- Highlighting of resolved vs unresolved placeholders
- Error indication for invalid syntax
- Toggle between raw and resolved views

**Interface**:
```javascript
interface TextPreviewProps {
  originalText: string;
  resolvedText: string;
  isResolved: boolean;
  mode?: 'side-by-side' | 'overlay' | 'toggle';
  showErrors?: boolean;
}
```

### 5. Enhanced InteractionEditor

**Purpose**: Interaction editing with integrated text templating

**Integration Points**:
- Branch text editing with PlaceholderEditor
- Context detection from current character/node
- Dialogue pattern suggestions
- Real-time preview for all branch text

**Implementation**:
```javascript
const InteractionBranchEditor = ({ branch, character, node, world, onChange }) => {
  const context = { character, node, world };
  
  return (
    <div className="branch-editor">
      <label>Branch Text</label>
      <PlaceholderEditor
        value={branch.text}
        onChange={(text) => onChange({ ...branch, text })}
        context={context}
        placeholder="Enter dialogue or description..."
        showPreview={true}
        showSuggestions={true}
      />
      <DialoguePatterns
        onInsert={(pattern) => {
          const newText = branch.text + pattern;
          onChange({ ...branch, text: newText });
        }}
        context={context}
      />
    </div>
  );
};
```

### 6. Enhanced EncounterEditor

**Purpose**: Encounter editing with quest text templating

**Integration Points**:
- Encounter description templating
- Quest objective text templating
- Completion message templating
- Context from encounter participants and location

**Implementation**:
```javascript
const EncounterDescriptionEditor = ({ encounter, onChange }) => {
  const context = {
    node: encounter.location,
    characters: encounter.participants,
    world: encounter.worldContext
  };
  
  return (
    <div className="encounter-description">
      <label>Encounter Description</label>
      <PlaceholderEditor
        value={encounter.description}
        onChange={(description) => onChange({ ...encounter, description })}
        context={context}
        placeholder="Describe what happens in this encounter..."
      />
      
      <label>Quest Objectives</label>
      {encounter.questObjectives?.map((objective, index) => (
        <PlaceholderEditor
          key={index}
          value={objective.text}
          onChange={(text) => {
            const newObjectives = [...encounter.questObjectives];
            newObjectives[index] = { ...objective, text };
            onChange({ ...encounter, questObjectives: newObjectives });
          }}
          context={context}
          placeholder="Enter quest objective..."
        />
      ))}
    </div>
  );
};
```

## Data Models

### Editor Context Model
```javascript
interface EditorContext {
  character?: {
    id: string;
    name: string;
    attributes: D&DAttributes;
    consciousness: ConsciousnessState;
    personality: PersonalityTraits;
    relationships: Relationship[];
    reputation: number;
  };
  node?: {
    id: string;
    name: string;
    type: string;
    environmentalProperties: object;
    culturalContext: object;
    resourceAvailability: object;
    population?: number;
  };
  world?: {
    id: string;
    name: string;
    properties: object;
    globalState: object;
  };
  additional?: {
    [key: string]: any;
  };
}
```

### Placeholder Suggestion Model
```javascript
interface PlaceholderSuggestion {
  placeholder: string;
  description: string;
  category: 'character' | 'node' | 'world' | 'system';
  subcategory?: string;
  example?: string;
  available: boolean;
  dataPath: string; // For accessing nested properties
  conditional?: boolean; // If this is for conditional logic
}
```

### Template Pattern Model
```javascript
interface DialoguePattern {
  id: string;
  name: string;
  category: string;
  template: string;
  description: string;
  requiredContext: string[];
  tags: string[];
}
```

## Context Detection and Suggestion Logic

### Automatic Context Detection
```javascript
const detectEditorContext = (editorType, currentData) => {
  const context = {};
  
  // Character context
  if (currentData.character) {
    context.character = currentData.character;
  }
  
  // Node context
  if (currentData.node) {
    context.node = currentData.node;
  }
  
  // World context
  if (currentData.world) {
    context.world = currentData.world;
  }
  
  // Editor-specific context
  if (editorType === 'interaction' && currentData.interaction) {
    context.interaction = currentData.interaction;
  }
  
  if (editorType === 'encounter' && currentData.encounter) {
    context.encounter = currentData.encounter;
    // Add participants as additional character context
    if (currentData.encounter.participants) {
      context.participants = currentData.encounter.participants;
    }
  }
  
  return context;
};
```

### Smart Placeholder Suggestions
```javascript
const generatePlaceholderSuggestions = (context) => {
  const suggestions = [];
  
  // Character-based suggestions
  if (context.character) {
    suggestions.push(
      { placeholder: 'character.name', category: 'character', description: 'Character name' },
      { placeholder: 'character.attributes.strength', category: 'character', description: 'Strength attribute' },
      { placeholder: 'character.reputation', category: 'character', description: 'Character reputation' }
    );
    
    // Conditional suggestions
    suggestions.push(
      { placeholder: '#if character.attributes.charisma > 14', category: 'character', conditional: true },
      { placeholder: '#if character.reputation > 10', category: 'character', conditional: true }
    );
  }
  
  // Node-based suggestions
  if (context.node) {
    suggestions.push(
      { placeholder: 'node.name', category: 'node', description: 'Location name' },
      { placeholder: 'node.type', category: 'node', description: 'Location type' },
      { placeholder: 'node.population', category: 'node', description: 'Population size' }
    );
  }
  
  // World-based suggestions
  if (context.world) {
    suggestions.push(
      { placeholder: 'world.name', category: 'world', description: 'World name' }
    );
  }
  
  // Random selection suggestions
  suggestions.push(
    { placeholder: 'random:option1,option2,option3', category: 'system', description: 'Random selection' }
  );
  
  return suggestions.filter(s => isPlaceholderAvailable(s, context));
};
```

## Integration with Existing Systems

### TextTemplateEngine Integration
```javascript
// No changes needed to TextTemplateEngine - use as-is
const resolveTemplateText = (templateText, context) => {
  return textTemplateEngine.resolve(templateText, {
    character: context.character,
    node: context.node,
    world: context.world,
    ...context.additional
  });
};
```

### Template Library Simplification
```javascript
// Remove text-focused templates, keep structural ones
const simplifyTemplateLibrary = () => {
  // Remove demo templates like "Heroic Warrior"
  // Focus on:
  // - Character attribute configurations
  // - Node property templates
  // - Interaction structure templates (not text content)
  // - World configuration templates
  
  // Add clear guidance about when to use library vs editor features
  const templateGuidance = {
    useLibrary: [
      'Character attribute configurations',
      'Node environmental properties',
      'World structural templates'
    ],
    useEditors: [
      'Dialogue text',
      'Quest descriptions',
      'Encounter narratives',
      'Dynamic text content'
    ]
  };
};
```

## Error Handling

### Template Syntax Validation
```javascript
const validateTemplateSyntax = (templateText) => {
  const errors = [];
  
  // Check for unclosed conditionals
  const ifCount = (templateText.match(/{{#if/g) || []).length;
  const endifCount = (templateText.match(/{{\/if}}/g) || []).length;
  if (ifCount !== endifCount) {
    errors.push('Unclosed conditional statement');
  }
  
  // Check for invalid placeholder syntax
  const invalidPlaceholders = templateText.match(/{{[^}]*$/g);
  if (invalidPlaceholders) {
    errors.push('Incomplete placeholder syntax');
  }
  
  return errors;
};
```

### Context Availability Checking
```javascript
const checkPlaceholderAvailability = (placeholder, context) => {
  const path = placeholder.split('.');
  let current = context;
  
  for (const segment of path) {
    if (!current || !current.hasOwnProperty(segment)) {
      return false;
    }
    current = current[segment];
  }
  
  return true;
};
```

## Testing Strategy

### Unit Testing
- **PlaceholderEditor Component**: Test text editing, suggestion display, preview functionality
- **Context Detection**: Verify correct context extraction from editor props
- **Suggestion Generation**: Test placeholder suggestion logic for different contexts
- **Template Resolution**: Verify integration with TextTemplateEngine

### Integration Testing
- **Editor Integration**: Test PlaceholderEditor within InteractionEditor and EncounterEditor
- **Context Flow**: Verify context data flows correctly from editors to templating components
- **Preview Accuracy**: Test that previews match actual template resolution
- **Pattern Insertion**: Verify dialogue patterns insert correctly and resolve properly

### User Experience Testing
- **Workflow Testing**: Test complete text templating workflows in editors
- **Performance Testing**: Ensure real-time preview doesn't impact editor performance
- **Accessibility Testing**: Verify keyboard navigation and screen reader support
- **Cross-Editor Consistency**: Ensure consistent experience across different editors

## Performance Considerations

### Real-Time Preview Optimization
```javascript
// Debounce preview updates to avoid excessive re-rendering
const useTemplatePreview = (templateText, context) => {
  const [previewText, setPreviewText] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  
  const debouncedResolve = useMemo(
    () => debounce((text, ctx) => {
      try {
        const resolved = textTemplateEngine.resolve(text, ctx);
        setPreviewText(resolved);
        setIsResolved(true);
      } catch (error) {
        setPreviewText(text);
        setIsResolved(false);
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedResolve(templateText, context);
  }, [templateText, context, debouncedResolve]);
  
  return { previewText, isResolved };
};
```

### Suggestion Caching
```javascript
// Cache suggestions based on context to avoid recalculation
const useCachedSuggestions = (context) => {
  const contextKey = useMemo(() => 
    JSON.stringify({
      hasCharacter: !!context.character,
      hasNode: !!context.node,
      hasWorld: !!context.world,
      characterType: context.character?.type,
      nodeType: context.node?.type
    }), [context]
  );
  
  return useMemo(() => 
    generatePlaceholderSuggestions(context), 
    [contextKey]
  );
};
```

## Security Considerations

### Input Sanitization
```javascript
// Sanitize template text to prevent XSS
const sanitizeTemplateText = (text) => {
  // Remove script tags and dangerous HTML
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
```

### Template Validation
```javascript
// Validate template syntax before processing
const isValidTemplate = (templateText) => {
  const errors = validateTemplateSyntax(templateText);
  return errors.length === 0;
};
```

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical navigation through editor and templating controls
- **Keyboard Shortcuts**: Quick access to common templating functions
- **Focus Management**: Clear focus indicators and proper focus handling

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all templating controls
- **Live Regions**: Announce preview updates to screen readers
- **Semantic Markup**: Proper heading structure and landmark roles

## Future Enhancements

### Advanced Features
- **Template Snippets**: Save frequently used text patterns as personal snippets
- **Collaborative Editing**: Real-time collaborative text templating
- **Advanced Conditionals**: More complex conditional logic support
- **Template Validation**: Advanced syntax checking and error reporting

### AI Integration
- **Smart Suggestions**: AI-powered dialogue suggestions based on context
- **Content Generation**: AI assistance for creating templated content
- **Style Consistency**: AI checking for consistent writing style

## Conclusion

The Editor Text Templating design provides a seamless integration of dynamic text capabilities directly into the editing experience. By extracting and enhancing the PlaceholderEditor component and providing context-aware suggestions, users can create rich, dynamic content without leaving their editing workflow. The design maintains clean architecture principles while significantly improving the user experience for text templating tasks.