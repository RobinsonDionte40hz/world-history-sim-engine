# Design Document

## Overview

This design document outlines the comprehensive character management system for the World History Simulation Engine. The system follows clean architecture principles with clear separation between presentation, application, domain, and infrastructure layers. The design focuses on flexible character creation workflows, robust persistence, efficient assignment management, and optimized user experience for both detailed characters and generic NPCs.

## Architecture

### System Architecture

The character management system integrates with the existing architecture while adding specialized components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │CharacterEditor  │  │CharacterManager │  │CharacterList │ │
│  │     Page        │  │    Component    │  │  Component   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ AssignmentUI    │  │ BulkCreator     │  │TemplateUI    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │SimulationContext│  │useCharacterMgmt │  │AssignmentMgr │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │CharacterService │  │ ValidationSvc   │  │ SearchService│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────┐
│                     Domain Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Character     │  │  Assignment     │  │ CharacterType│ │
│  │    Entity       │  │   Manager       │  │  ValueObject │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  WorldBuilder   │  │   Validation    │  │  Templates   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────┐
│                Infrastructure Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │CharacterRepo    │  │ AssignmentRepo  │  │TemplateRepo  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

The character management data flow follows this pattern:

1. **User Input** → CharacterEditor captures form data
2. **Type Detection** → System determines character type (generic NPC vs detailed)
3. **Validation** → CharacterService validates based on character type
4. **Domain Processing** → WorldBuilder processes character creation/updates
5. **Assignment Management** → AssignmentManager handles node/interaction assignments
6. **State Update** → SimulationContext updates with new character data
7. **Persistence** → CharacterRepository persists to localStorage
8. **UI Update** → All character displays refresh with new data

## Components and Interfaces

### Enhanced Character Entity

```javascript
class Character {
  constructor(config) {
    this.id = config.id || generateId('character');
    this.name = config.name;
    this.type = config.type || 'generic'; // 'generic' | 'detailed' | 'important'
    
    // Core attributes (always present)
    this.race = config.race;
    this.characterClass = config.characterClass;
    this.level = config.level || 1;
    this.attributes = new Attributes(config.attributes);
    
    // Optional detailed fields
    this.description = config.description || '';
    this.backstory = config.backstory || '';
    this.appearance = config.appearance || '';
    this.personality = config.personality || {};
    this.goals = config.goals || [];
    this.relationships = config.relationships || {};
    
    // Assignment tracking
    this.assignedNodes = new Set(config.assignedNodes || []);
    this.assignedInteractions = new Set(config.assignedInteractions || []);
    
    // Metadata
    this.tags = config.tags || [];
    this.metadata = config.metadata || {};
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Validation based on character type
  validate() {
    const errors = [];
    
    // Core validation for all characters
    if (!this.name?.trim()) errors.push('Name is required');
    if (!this.race) errors.push('Race is required');
    
    // Type-specific validation
    if (this.type === 'detailed' || this.type === 'important') {
      if (!this.description?.trim()) errors.push('Description is required for detailed characters');
      if (!this.backstory?.trim()) errors.push('Backstory is required for important characters');
    }
    
    // Attribute validation
    const attrValidation = this.attributes.validate();
    if (!attrValidation.isValid) {
      errors.push(...attrValidation.errors);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Search functionality
  matchesQuery(query) {
    const searchTerm = query.toLowerCase();
    return this.name.toLowerCase().includes(searchTerm) ||
           this.race.toLowerCase().includes(searchTerm) ||
           this.characterClass?.toLowerCase().includes(searchTerm) ||
           this.description.toLowerCase().includes(searchTerm) ||
           this.tags.some(tag => tag.toLowerCase().includes(searchTerm));
  }

  // Assignment management
  assignToNode(nodeId) {
    this.assignedNodes.add(nodeId);
    this.updatedAt = new Date().toISOString();
  }

  unassignFromNode(nodeId) {
    this.assignedNodes.delete(nodeId);
    this.updatedAt = new Date().toISOString();
  }

  assignInteraction(interactionId) {
    this.assignedInteractions.add(interactionId);
    this.updatedAt = new Date().toISOString();
  }

  unassignInteraction(interactionId) {
    this.assignedInteractions.delete(interactionId);
    this.updatedAt = new Date().toISOString();
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      race: this.race,
      characterClass: this.characterClass,
      level: this.level,
      attributes: this.attributes.toJSON(),
      description: this.description,
      backstory: this.backstory,
      appearance: this.appearance,
      personality: this.personality,
      goals: this.goals,
      relationships: this.relationships,
      assignedNodes: Array.from(this.assignedNodes),
      assignedInteractions: Array.from(this.assignedInteractions),
      tags: this.tags,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

### Character Service

```javascript
class CharacterService {
  constructor(worldBuilder, assignmentManager, validationService) {
    this.worldBuilder = worldBuilder;
    this.assignmentManager = assignmentManager;
    this.validationService = validationService;
  }

  async createCharacter(characterConfig) {
    // Validate character data
    const character = new Character(characterConfig);
    const validation = character.validate();
    
    if (!validation.isValid) {
      throw new ValidationError('Character validation failed', validation.errors);
    }

    // Add to world
    const savedCharacter = await this.worldBuilder.addCharacter(character);
    
    // Handle assignments
    if (characterConfig.assignedNodes?.length > 0) {
      await this.assignmentManager.assignCharacterToNodes(
        savedCharacter.id, 
        characterConfig.assignedNodes
      );
    }
    
    if (characterConfig.assignedInteractions?.length > 0) {
      await this.assignmentManager.assignInteractionsToCharacter(
        savedCharacter.id, 
        characterConfig.assignedInteractions
      );
    }

    return savedCharacter;
  }

  async updateCharacter(characterId, updates) {
    const existingCharacter = this.worldBuilder.getCharacter(characterId);
    if (!existingCharacter) {
      throw new Error(`Character not found: ${characterId}`);
    }

    // Create updated character
    const updatedCharacter = new Character({
      ...existingCharacter,
      ...updates,
      id: characterId,
      updatedAt: new Date().toISOString()
    });

    // Validate updates
    const validation = updatedCharacter.validate();
    if (!validation.isValid) {
      throw new ValidationError('Character validation failed', validation.errors);
    }

    // Update in world
    const savedCharacter = await this.worldBuilder.updateCharacter(characterId, updatedCharacter);

    // Handle assignment changes
    await this.assignmentManager.updateCharacterAssignments(characterId, {
      nodes: updates.assignedNodes,
      interactions: updates.assignedInteractions
    });

    return savedCharacter;
  }

  async deleteCharacter(characterId) {
    // Clean up assignments first
    await this.assignmentManager.removeAllCharacterAssignments(characterId);
    
    // Remove from world
    await this.worldBuilder.deleteCharacter(characterId);
  }

  searchCharacters(query, filters = {}) {
    const characters = this.worldBuilder.getCharacters();
    
    let filtered = characters;
    
    // Apply text search
    if (query) {
      filtered = filtered.filter(char => char.matchesQuery(query));
    }
    
    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(char => char.type === filters.type);
    }
    
    if (filters.race) {
      filtered = filtered.filter(char => char.race === filters.race);
    }
    
    if (filters.characterClass) {
      filtered = filtered.filter(char => char.characterClass === filters.characterClass);
    }
    
    if (filters.assignedToNode) {
      filtered = filtered.filter(char => char.assignedNodes.has(filters.assignedToNode));
    }
    
    if (filters.hasInteractions !== undefined) {
      filtered = filtered.filter(char => 
        filters.hasInteractions ? char.assignedInteractions.size > 0 : char.assignedInteractions.size === 0
      );
    }
    
    return filtered;
  }

  getCharactersByNode(nodeId) {
    return this.worldBuilder.getCharacters()
      .filter(char => char.assignedNodes.has(nodeId));
  }

  getCharactersByInteraction(interactionId) {
    return this.worldBuilder.getCharacters()
      .filter(char => char.assignedInteractions.has(interactionId));
  }
}
```

### Assignment Manager

```javascript
class AssignmentManager {
  constructor(worldBuilder) {
    this.worldBuilder = worldBuilder;
  }

  async assignCharacterToNodes(characterId, nodeIds) {
    const character = this.worldBuilder.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }

    // Validate nodes exist
    const invalidNodes = nodeIds.filter(nodeId => !this.worldBuilder.getNode(nodeId));
    if (invalidNodes.length > 0) {
      throw new Error(`Nodes not found: ${invalidNodes.join(', ')}`);
    }

    // Update character assignments
    nodeIds.forEach(nodeId => character.assignToNode(nodeId));
    
    // Update nodes with character assignments
    nodeIds.forEach(nodeId => {
      const node = this.worldBuilder.getNode(nodeId);
      if (!node.assignedCharacters) {
        node.assignedCharacters = new Set();
      }
      node.assignedCharacters.add(characterId);
    });

    await this.worldBuilder.updateCharacter(characterId, character);
    
    // Update affected nodes
    for (const nodeId of nodeIds) {
      const node = this.worldBuilder.getNode(nodeId);
      await this.worldBuilder.updateNode(nodeId, node);
    }
  }

  async unassignCharacterFromNode(characterId, nodeId) {
    const character = this.worldBuilder.getCharacter(characterId);
    const node = this.worldBuilder.getNode(nodeId);
    
    if (character) {
      character.unassignFromNode(nodeId);
      await this.worldBuilder.updateCharacter(characterId, character);
    }
    
    if (node && node.assignedCharacters) {
      node.assignedCharacters.delete(characterId);
      await this.worldBuilder.updateNode(nodeId, node);
    }
  }

  async assignInteractionsToCharacter(characterId, interactionIds) {
    const character = this.worldBuilder.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }

    // Validate interactions exist
    const invalidInteractions = interactionIds.filter(id => !this.worldBuilder.getInteraction(id));
    if (invalidInteractions.length > 0) {
      throw new Error(`Interactions not found: ${invalidInteractions.join(', ')}`);
    }

    // Update character assignments
    interactionIds.forEach(interactionId => character.assignInteraction(interactionId));
    
    // Update interactions with character assignments
    interactionIds.forEach(interactionId => {
      const interaction = this.worldBuilder.getInteraction(interactionId);
      if (!interaction.assignedCharacters) {
        interaction.assignedCharacters = new Set();
      }
      interaction.assignedCharacters.add(characterId);
    });

    await this.worldBuilder.updateCharacter(characterId, character);
    
    // Update affected interactions
    for (const interactionId of interactionIds) {
      const interaction = this.worldBuilder.getInteraction(interactionId);
      await this.worldBuilder.updateInteraction(interactionId, interaction);
    }
  }

  async removeAllCharacterAssignments(characterId) {
    const character = this.worldBuilder.getCharacter(characterId);
    if (!character) return;

    // Remove from all assigned nodes
    for (const nodeId of character.assignedNodes) {
      await this.unassignCharacterFromNode(characterId, nodeId);
    }

    // Remove from all assigned interactions
    for (const interactionId of character.assignedInteractions) {
      await this.unassignCharacterFromInteraction(characterId, interactionId);
    }
  }

  async unassignCharacterFromInteraction(characterId, interactionId) {
    const character = this.worldBuilder.getCharacter(characterId);
    const interaction = this.worldBuilder.getInteraction(interactionId);
    
    if (character) {
      character.unassignInteraction(interactionId);
      await this.worldBuilder.updateCharacter(characterId, character);
    }
    
    if (interaction && interaction.assignedCharacters) {
      interaction.assignedCharacters.delete(characterId);
      await this.worldBuilder.updateInteraction(interactionId, interaction);
    }
  }

  async updateCharacterAssignments(characterId, assignments) {
    const character = this.worldBuilder.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }

    // Handle node assignment changes
    if (assignments.nodes !== undefined) {
      const currentNodes = Array.from(character.assignedNodes);
      const newNodes = assignments.nodes || [];
      
      // Remove old assignments
      const nodesToRemove = currentNodes.filter(nodeId => !newNodes.includes(nodeId));
      for (const nodeId of nodesToRemove) {
        await this.unassignCharacterFromNode(characterId, nodeId);
      }
      
      // Add new assignments
      const nodesToAdd = newNodes.filter(nodeId => !currentNodes.includes(nodeId));
      if (nodesToAdd.length > 0) {
        await this.assignCharacterToNodes(characterId, nodesToAdd);
      }
    }

    // Handle interaction assignment changes
    if (assignments.interactions !== undefined) {
      const currentInteractions = Array.from(character.assignedInteractions);
      const newInteractions = assignments.interactions || [];
      
      // Remove old assignments
      const interactionsToRemove = currentInteractions.filter(id => !newInteractions.includes(id));
      for (const interactionId of interactionsToRemove) {
        await this.unassignCharacterFromInteraction(characterId, interactionId);
      }
      
      // Add new assignments
      const interactionsToAdd = newInteractions.filter(id => !currentInteractions.includes(id));
      if (interactionsToAdd.length > 0) {
        await this.assignInteractionsToCharacter(characterId, interactionsToAdd);
      }
    }
  }
}
```

### Character Editor Component

```javascript
const CharacterEditor = ({ 
  initialCharacter, 
  onSave, 
  onCancel, 
  mode = 'create',
  validationErrors = [] 
}) => {
  const [characterData, setCharacterData] = useState(
    initialCharacter || {
      name: '',
      type: 'generic',
      race: '',
      characterClass: '',
      level: 1,
      attributes: {},
      description: '',
      backstory: '',
      appearance: '',
      personality: {},
      assignedNodes: [],
      assignedInteractions: [],
      tags: []
    }
  );

  const [showAdvancedFields, setShowAdvancedFields] = useState(
    characterData.type === 'detailed' || characterData.type === 'important'
  );

  const handleTypeChange = (newType) => {
    setCharacterData(prev => ({ ...prev, type: newType }));
    setShowAdvancedFields(newType === 'detailed' || newType === 'important');
  };

  const handleSave = async () => {
    try {
      await onSave(characterData);
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  return (
    <div className="character-editor">
      <div className="character-type-selector">
        <label>Character Type:</label>
        <select 
          value={characterData.type} 
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="generic">Generic NPC</option>
          <option value="detailed">Detailed Character</option>
          <option value="important">Important Character</option>
        </select>
      </div>

      {/* Core Fields - Always Visible */}
      <div className="core-fields">
        <FormField
          label="Name"
          value={characterData.name}
          onChange={(value) => setCharacterData(prev => ({ ...prev, name: value }))}
          required
          error={getFieldError('name', validationErrors)}
        />
        
        <FormField
          label="Race"
          value={characterData.race}
          onChange={(value) => setCharacterData(prev => ({ ...prev, race: value }))}
          required
          error={getFieldError('race', validationErrors)}
        />
        
        <FormField
          label="Class"
          value={characterData.characterClass}
          onChange={(value) => setCharacterData(prev => ({ ...prev, characterClass: value }))}
        />
        
        <AttributeEditor
          attributes={characterData.attributes}
          onChange={(attributes) => setCharacterData(prev => ({ ...prev, attributes }))}
        />
      </div>

      {/* Advanced Fields - Conditional */}
      {showAdvancedFields && (
        <div className="advanced-fields">
          <FormField
            label="Description"
            value={characterData.description}
            onChange={(value) => setCharacterData(prev => ({ ...prev, description: value }))}
            multiline
            required={characterData.type === 'detailed' || characterData.type === 'important'}
            error={getFieldError('description', validationErrors)}
          />
          
          {characterData.type === 'important' && (
            <FormField
              label="Backstory"
              value={characterData.backstory}
              onChange={(value) => setCharacterData(prev => ({ ...prev, backstory: value }))}
              multiline
              required
              error={getFieldError('backstory', validationErrors)}
            />
          )}
          
          <FormField
            label="Appearance"
            value={characterData.appearance}
            onChange={(value) => setCharacterData(prev => ({ ...prev, appearance: value }))}
            multiline
          />
          
          <PersonalityEditor
            personality={characterData.personality}
            onChange={(personality) => setCharacterData(prev => ({ ...prev, personality }))}
          />
        </div>
      )}

      {/* Assignment Fields */}
      <div className="assignment-fields">
        <NodeAssignmentSelector
          selectedNodes={characterData.assignedNodes}
          onChange={(nodes) => setCharacterData(prev => ({ ...prev, assignedNodes: nodes }))}
        />
        
        <InteractionAssignmentSelector
          selectedInteractions={characterData.assignedInteractions}
          onChange={(interactions) => setCharacterData(prev => ({ ...prev, assignedInteractions: interactions }))}
        />
      </div>

      {/* Actions */}
      <div className="editor-actions">
        <button onClick={handleSave} className="save-button">
          {mode === 'create' ? 'Create Character' : 'Update Character'}
        </button>
        <button onClick={onCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};
```

## Data Models

### Character Type Value Object

```javascript
class CharacterType {
  static GENERIC = 'generic';
  static DETAILED = 'detailed';
  static IMPORTANT = 'important';

  constructor(type) {
    if (!this.isValid(type)) {
      throw new Error(`Invalid character type: ${type}`);
    }
    this.value = type;
  }

  static isValid(type) {
    return [this.GENERIC, this.DETAILED, this.IMPORTANT].includes(type);
  }

  getRequiredFields() {
    switch (this.value) {
      case CharacterType.GENERIC:
        return ['name', 'race'];
      case CharacterType.DETAILED:
        return ['name', 'race', 'description'];
      case CharacterType.IMPORTANT:
        return ['name', 'race', 'description', 'backstory'];
      default:
        return ['name', 'race'];
    }
  }

  getOptionalFields() {
    const allFields = [
      'characterClass', 'level', 'attributes', 'description', 
      'backstory', 'appearance', 'personality', 'goals', 
      'relationships', 'tags', 'metadata'
    ];
    
    const required = this.getRequiredFields();
    return allFields.filter(field => !required.includes(field));
  }

  allowsField(fieldName) {
    const required = this.getRequiredFields();
    const optional = this.getOptionalFields();
    return required.includes(fieldName) || optional.includes(fieldName);
  }
}
```

### Enhanced World State for Characters

```javascript
class WorldState {
  constructor() {
    // ... existing properties
    this.characters = [];
    this.characterNodeAssignments = new Map(); // characterId -> Set<nodeId>
    this.characterInteractionAssignments = new Map(); // characterId -> Set<interactionId>
  }

  // Character management
  addCharacter(characterConfig) {
    const character = new Character(characterConfig);
    const validation = character.validate();
    
    if (!validation.isValid) {
      throw new Error(`Character validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.characters.push(character);
    this.updatedAt = new Date().toISOString();
    return character;
  }

  updateCharacter(characterId, updates) {
    const characterIndex = this.characters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
      throw new Error(`Character not found: ${characterId}`);
    }
    
    const updatedCharacter = new Character({ 
      ...this.characters[characterIndex], 
      ...updates,
      id: characterId,
      updatedAt: new Date().toISOString()
    });
    
    const validation = updatedCharacter.validate();
    if (!validation.isValid) {
      throw new Error(`Character validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.characters[characterIndex] = updatedCharacter;
    this.updatedAt = new Date().toISOString();
    return updatedCharacter;
  }

  deleteCharacter(characterId) {
    const initialLength = this.characters.length;
    this.characters = this.characters.filter(c => c.id !== characterId);
    
    if (this.characters.length === initialLength) {
      throw new Error(`Character not found: ${characterId}`);
    }
    
    // Clean up assignments
    this.characterNodeAssignments.delete(characterId);
    this.characterInteractionAssignments.delete(characterId);
    
    this.updatedAt = new Date().toISOString();
  }

  getCharacter(characterId) {
    return this.characters.find(c => c.id === characterId) || null;
  }

  getCharacters() {
    return [...this.characters];
  }

  // Search functionality
  searchCharacters(query) {
    if (!query) return this.characters;
    return this.characters.filter(character => character.matchesQuery(query));
  }

  // Assignment management
  getCharactersByNode(nodeId) {
    return this.characters.filter(char => char.assignedNodes.has(nodeId));
  }

  getCharactersByInteraction(interactionId) {
    return this.characters.filter(char => char.assignedInteractions.has(interactionId));
  }

  // Validation
  validateCharacterAssignments() {
    const errors = [];
    
    this.characters.forEach(character => {
      // Validate node assignments
      character.assignedNodes.forEach(nodeId => {
        if (!this.nodes.find(n => n.id === nodeId)) {
          errors.push(`Character ${character.name} assigned to non-existent node: ${nodeId}`);
        }
      });
      
      // Validate interaction assignments
      character.assignedInteractions.forEach(interactionId => {
        if (!this.interactions.find(i => i.id === interactionId)) {
          errors.push(`Character ${character.name} assigned to non-existent interaction: ${interactionId}`);
        }
      });
    });
    
    return { isValid: errors.length === 0, errors };
  }
}
```

## Error Handling

### Character-Specific Error Types

```javascript
class CharacterValidationError extends Error {
  constructor(characterId, field, message, code = 'CHARACTER_VALIDATION_ERROR') {
    super(`Character validation failed for ${characterId}: ${message}`);
    this.name = 'CharacterValidationError';
    this.characterId = characterId;
    this.field = field;
    this.code = code;
  }
}

class AssignmentError extends Error {
  constructor(characterId, assignmentType, targetId, message, code = 'ASSIGNMENT_ERROR') {
    super(`Assignment failed for character ${characterId}: ${message}`);
    this.name = 'AssignmentError';
    this.characterId = characterId;
    this.assignmentType = assignmentType; // 'node' | 'interaction'
    this.targetId = targetId;
    this.code = code;
  }
}

class CharacterNotFoundError extends Error {
  constructor(characterId, code = 'CHARACTER_NOT_FOUND') {
    super(`Character not found: ${characterId}`);
    this.name = 'CharacterNotFoundError';
    this.characterId = characterId;
    this.code = code;
  }
}
```

### Error Recovery Strategies

```javascript
class CharacterErrorRecovery {
  static async recoverFromValidationError(error, characterData) {
    const recovery = {
      canRecover: false,
      suggestions: [],
      autoFix: null
    };

    if (error.field === 'name' && !characterData.name) {
      recovery.canRecover = true;
      recovery.suggestions.push('Provide a name for the character');
      recovery.autoFix = () => ({ ...characterData, name: 'Unnamed Character' });
    }

    if (error.field === 'race' && !characterData.race) {
      recovery.canRecover = true;
      recovery.suggestions.push('Select a race for the character');
      recovery.autoFix = () => ({ ...characterData, race: 'Human' });
    }

    return recovery;
  }

  static async recoverFromAssignmentError(error, worldState) {
    const recovery = {
      canRecover: false,
      suggestions: [],
      autoFix: null
    };

    if (error.assignmentType === 'node') {
      const availableNodes = worldState.nodes.map(n => n.id);
      if (availableNodes.length > 0) {
        recovery.canRecover = true;
        recovery.suggestions.push(`Assign to an existing node: ${availableNodes.join(', ')}`);
        recovery.autoFix = (character) => ({
          ...character,
          assignedNodes: [availableNodes[0]]
        });
      }
    }

    return recovery;
  }
}
```

## Testing Strategy

### Unit Tests

```javascript
describe('Character Entity', () => {
  test('should validate required fields for generic NPC', () => {
    const character = new Character({ name: '', race: '', type: 'generic' });
    const result = character.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
    expect(result.errors).toContain('Race is required');
  });

  test('should require description for detailed characters', () => {
    const character = new Character({ 
      name: 'Test', 
      race: 'Human', 
      type: 'detailed',
      description: ''
    });
    const result = character.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Description is required for detailed characters');
  });

  test('should handle node assignments', () => {
    const character = new Character({ name: 'Test', race: 'Human' });
    character.assignToNode('node1');
    character.assignToNode('node2');
    
    expect(character.assignedNodes.has('node1')).toBe(true);
    expect(character.assignedNodes.has('node2')).toBe(true);
    expect(character.assignedNodes.size).toBe(2);
  });
});

describe('CharacterService', () => {
  test('should create character with assignments', async () => {
    const mockWorldBuilder = {
      addCharacter: jest.fn().mockResolvedValue({ id: 'char1' }),
      getNode: jest.fn().mockReturnValue({ id: 'node1' }),
      getInteraction: jest.fn().mockReturnValue({ id: 'int1' })
    };
    
    const mockAssignmentManager = {
      assignCharacterToNodes: jest.fn(),
      assignInteractionsToCharacter: jest.fn()
    };

    const service = new CharacterService(mockWorldBuilder, mockAssignmentManager);
    
    const result = await service.createCharacter({
      name: 'Test Character',
      race: 'Human',
      assignedNodes: ['node1'],
      assignedInteractions: ['int1']
    });

    expect(mockWorldBuilder.addCharacter).toHaveBeenCalled();
    expect(mockAssignmentManager.assignCharacterToNodes).toHaveBeenCalledWith('char1', ['node1']);
    expect(mockAssignmentManager.assignInteractionsToCharacter).toHaveBeenCalledWith('char1', ['int1']);
  });
});
```

### Integration Tests

```javascript
describe('Character Management Integration', () => {
  test('should persist character across sessions', async () => {
    const worldBuilder = new WorldBuilder();
    const characterService = new CharacterService(worldBuilder);
    
    // Create character
    const character = await characterService.createCharacter({
      name: 'Persistent Character',
      race: 'Elf',
      type: 'detailed',
      description: 'A test character'
    });

    // Simulate page reload
    const newWorldBuilder = new WorldBuilder();
    await newWorldBuilder.loadWorldState();
    
    const retrievedCharacter = newWorldBuilder.getCharacter(character.id);
    expect(retrievedCharacter).toBeTruthy();
    expect(retrievedCharacter.name).toBe('Persistent Character');
    expect(retrievedCharacter.race).toBe('Elf');
  });

  test('should maintain assignment consistency', async () => {
    const worldBuilder = new WorldBuilder();
    const assignmentManager = new AssignmentManager(worldBuilder);
    
    // Create node and character
    const node = await worldBuilder.addNode({ name: 'Test Node', type: 'settlement' });
    const character = await worldBuilder.addCharacter({ name: 'Test Character', race: 'Human' });
    
    // Assign character to node
    await assignmentManager.assignCharacterToNodes(character.id, [node.id]);
    
    // Verify bidirectional assignment
    const updatedCharacter = worldBuilder.getCharacter(character.id);
    const updatedNode = worldBuilder.getNode(node.id);
    
    expect(updatedCharacter.assignedNodes.has(node.id)).toBe(true);
    expect(updatedNode.assignedCharacters.has(character.id)).toBe(true);
  });
});
```

## Performance Optimizations

### Character Search Optimization

```javascript
class OptimizedCharacterSearch {
  constructor(worldState) {
    this.worldState = worldState;
    this.searchIndex = this.buildSearchIndex();
    this.filterCache = new Map();
  }

  buildSearchIndex() {
    const index = {
      byName: new Map(),
      byRace: new Map(),
      byClass: new Map(),
      byType: new Map(),
      byTags: new Map()
    };

    this.worldState.characters.forEach(character => {
      // Index by name
      const nameTerms = character.name.toLowerCase().split(' ');
      nameTerms.forEach(term => {
        if (!index.byName.has(term)) index.byName.set(term, new Set());
        index.byName.get(term).add(character.id);
      });

      // Index by race
      if (!index.byRace.has(character.race)) index.byRace.set(character.race, new Set());
      index.byRace.get(character.race).add(character.id);

      // Index by class
      if (character.characterClass) {
        if (!index.byClass.has(character.characterClass)) index.byClass.set(character.characterClass, new Set());
        index.byClass.get(character.characterClass).add(character.id);
      }

      // Index by type
      if (!index.byType.has(character.type)) index.byType.set(character.type, new Set());
      index.byType.get(character.type).add(character.id);

      // Index by tags
      character.tags.forEach(tag => {
        if (!index.byTags.has(tag)) index.byTags.set(tag, new Set());
        index.byTags.get(tag).add(character.id);
      });
    });

    return index;
  }

  search(query, filters = {}) {
    const cacheKey = JSON.stringify({ query, filters });
    if (this.filterCache.has(cacheKey)) {
      return this.filterCache.get(cacheKey);
    }

    let matchingIds = new Set();

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      
      // Search in indexed fields
      for (const [term, ids] of this.searchIndex.byName) {
        if (term.includes(searchTerm)) {
          ids.forEach(id => matchingIds.add(id));
        }
      }
    } else {
      // No query - start with all characters
      this.worldState.characters.forEach(char => matchingIds.add(char.id));
    }

    // Apply filters
    if (filters.race && this.searchIndex.byRace.has(filters.race)) {
      const raceIds = this.searchIndex.byRace.get(filters.race);
      matchingIds = new Set([...matchingIds].filter(id => raceIds.has(id)));
    }

    if (filters.type && this.searchIndex.byType.has(filters.type)) {
      const typeIds = this.searchIndex.byType.get(filters.type);
      matchingIds = new Set([...matchingIds].filter(id => typeIds.has(id)));
    }

    // Convert IDs back to character objects
    const results = this.worldState.characters.filter(char => matchingIds.has(char.id));
    
    // Cache results
    this.filterCache.set(cacheKey, results);
    
    return results;
  }

  updateIndex() {
    this.searchIndex = this.buildSearchIndex();
    this.filterCache.clear();
  }
}
```

### Bulk Operations

```javascript
class BulkCharacterOperations {
  constructor(characterService) {
    this.characterService = characterService;
  }

  async createMultipleCharacters(characterConfigs) {
    const results = {
      successful: [],
      failed: []
    };

    // Validate all characters first
    const validationResults = characterConfigs.map((config, index) => {
      const character = new Character(config);
      return { index, config, character, validation: character.validate() };
    });

    // Separate valid and invalid characters
    const validCharacters = validationResults.filter(r => r.validation.isValid);
    const invalidCharacters = validationResults.filter(r => !r.validation.isValid);

    // Add invalid characters to failed results
    invalidCharacters.forEach(({ index, config, validation }) => {
      results.failed.push({
        index,
        config,
        error: new CharacterValidationError(null, null, validation.errors.join(', '))
      });
    });

    // Batch create valid characters
    const batchSize = 10; // Process in batches to avoid overwhelming the system
    for (let i = 0; i < validCharacters.length; i += batchSize) {
      const batch = validCharacters.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ index, config, character }) => {
        try {
          const savedCharacter = await this.characterService.createCharacter(config);
          results.successful.push({ index, character: savedCharacter });
        } catch (error) {
          results.failed.push({ index, config, error });
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  async updateMultipleCharacters(updates) {
    const results = {
      successful: [],
      failed: []
    };

    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ characterId, updates: characterUpdates }) => {
        try {
          const updatedCharacter = await this.characterService.updateCharacter(characterId, characterUpdates);
          results.successful.push({ characterId, character: updatedCharacter });
        } catch (error) {
          results.failed.push({ characterId, updates: characterUpdates, error });
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }
}
```

## Security Considerations

### Input Sanitization

```javascript
class CharacterInputSanitizer {
  static sanitizeCharacterInput(characterConfig) {
    return {
      ...characterConfig,
      name: this.sanitizeString(characterConfig.name),
      description: this.sanitizeString(characterConfig.description),
      backstory: this.sanitizeString(characterConfig.backstory),
      appearance: this.sanitizeString(characterConfig.appearance),
      tags: characterConfig.tags?.map(tag => this.sanitizeString(tag)) || [],
      metadata: this.sanitizeMetadata(characterConfig.metadata)
    };
  }

  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    // Remove script tags and other potentially dangerous HTML
    const cleaned = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return cleaned.trim();
  }

  static sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return {};
    
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
      const cleanKey = this.sanitizeString(key);
      if (cleanKey && typeof value === 'string') {
        sanitized[cleanKey] = this.sanitizeString(value);
      } else if (cleanKey && (typeof value === 'number' || typeof value === 'boolean')) {
        sanitized[cleanKey] = value;
      }
    }
    return sanitized;
  }
}
```

## Conclusion

This design provides a comprehensive character management system that addresses all the requirements while maintaining clean architecture principles. The system supports flexible character creation workflows, robust persistence, efficient assignment management, and optimized performance for large character rosters.

Key design decisions include:

1. **Flexible Character Types**: Support for generic NPCs, detailed characters, and important characters with different validation rules
2. **Bidirectional Assignments**: Characters track their assignments, and nodes/interactions track their assigned characters
3. **Optimized Search**: Indexed search capabilities for efficient filtering and querying
4. **Bulk Operations**: Support for creating and updating multiple characters efficiently
5. **Error Recovery**: Comprehensive error handling with recovery suggestions
6. **Performance Optimization**: Caching, indexing, and batch processing for scalability

The implementation will integrate seamlessly with the existing World History Simulation Engine while providing the robust character management capabilities needed for complex world building scenarios.