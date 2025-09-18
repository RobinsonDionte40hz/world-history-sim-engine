# WorldValidator Documentation

## Overview

The `WorldValidator` is a comprehensive validation service for world configurations in the simulation engine. It provides real-time validation feedback with detailed error messages, completeness scoring, and relationship validation between world components.

## Features

- **Comprehensive Validation**: Validates dimensions, nodes, characters, interactions, events, rules, and initial conditions
- **Relationship Validation**: Ensures character-node relationships are valid
- **Completeness Scoring**: Calculates a 0-1 completeness score for world configurations
- **Real-time Feedback**: Provides immediate validation feedback as users build worlds
- **Detailed Error Messages**: Categorizes errors and warnings with specific guidance
- **Component Validation**: Allows validation of individual world components

## API Reference

### Main Validation Method

#### `WorldValidator.validate(worldConfig)`

Validates a complete world configuration and returns comprehensive results.

**Parameters:**
- `worldConfig` (Object): The world configuration to validate

**Returns:**
```javascript
{
  isValid: boolean,           // True if no critical errors
  errors: string[],           // Array of error messages
  warnings: string[],         // Array of warning messages
  completeness: number,       // Completeness score (0-1)
  details: {                  // Detailed validation results
    dimensions: ValidationResult,
    nodes: ValidationResult,
    characters: ValidationResult,
    interactions: ValidationResult,
    events: ValidationResult,
    relationships: ValidationResult,
    rules: ValidationResult,
    initialConditions: ValidationResult
  }
}
```

### Component Validation Methods

#### `WorldValidator.validateDimensions(dimensions)`

Validates world dimensions configuration.

**Required Fields:**
- `width` (number): World width (must be positive)
- `height` (number): World height (must be positive)
- `depth` (number, optional): World depth for 3D worlds

**Warnings:**
- Large dimensions (>1000) may impact performance
- Small dimensions (<10) may limit complexity

#### `WorldValidator.validateNodes(nodes)`

Validates world nodes array.

**Required Fields per Node:**
- `id` (string): Unique node identifier
- `name` (string): Node display name
- `position` (object): Node position with `x`, `y` (and optional `z`)

**Optional Fields:**
- `type` (string): Node type classification
- `description` (string): Node description
- `properties` (object): Additional node properties
- `resources` (array): Available resources

**Validation Rules:**
- At least one node required
- All node IDs must be unique
- Position coordinates must be numbers
- Warns about missing optional fields
- Performance warning for >100 nodes

#### `WorldValidator.validateCharacters(characters)`

Validates world characters array.

**Required Fields per Character:**
- `id` (string): Unique character identifier
- `name` (string): Character display name
- `attributes` (object): Character attributes (strength, intelligence, charisma recommended)

**Optional Fields:**
- `currentNodeId` (string): ID of node where character is located
- `race` (string): Character race
- `background` (object): Character background information
- `personality` (object): Personality traits
- `skills` (array): Character skills

**Validation Rules:**
- Characters array is optional but recommended
- All character IDs must be unique
- Attributes must be objects with numeric values
- Warns about missing recommended attributes

#### `WorldValidator.validateInteractions(interactions)`

Validates world interactions array.

**Required Fields per Interaction:**
- `id` (string): Unique interaction identifier
- `name` (string): Interaction display name
- `type` (string): Interaction type

**Optional Fields:**
- `trigger` (object): Trigger conditions
- `effects` (array): Interaction effects
- `conditions` (array): Preconditions
- `probability` (number): Probability (0-1)
- `description` (string): Interaction description

#### `WorldValidator.validateEvents(events)`

Validates world events array.

**Required Fields per Event:**
- `id` (string): Unique event identifier
- `name` (string): Event display name
- `trigger` (object): Event trigger conditions

**Optional Fields:**
- `type` (string): Event type
- `frequency` (number): Event frequency
- `effects` (array): Event effects
- `description` (string): Event description

#### `WorldValidator.validateCharacterNodeRelationships(characters, nodes)`

Validates relationships between characters and nodes.

**Validation Rules:**
- Characters with `currentNodeId` must reference existing nodes
- Warns about unassigned characters
- Warns about overcrowded nodes (>10 characters)

### Utility Methods

#### `WorldValidator.calculateCompleteness(worldConfig, details)`

Calculates completeness score based on world configuration.

**Scoring System:**
- Dimensions (required): 20 points
- Nodes (required): 25 points
- Characters (recommended): 20 points
- Rules (recommended): 10 points
- Initial Conditions (recommended): 10 points
- Interactions (optional): 10 points
- Events (optional): 5 points

**Total:** 100 points (1.0 completeness score)

#### `WorldValidator.formatValidationFeedback(validationResult)`

Formats validation results for UI display.

**Returns:**
```javascript
{
  status: 'valid' | 'invalid',
  completeness: number,        // Percentage (0-100)
  summary: {
    totalErrors: number,
    totalWarnings: number,
    readyForSimulation: boolean
  },
  feedback: {
    critical: string[],        // Critical errors
    configuration: string[],   // Configuration errors
    performance: string[],     // Performance warnings
    recommendations: string[], // Recommendation warnings
    suggestions: string[]      // Improvement suggestions
  },
  details: object             // Detailed validation results
}
```

#### `WorldValidator.validateComponent(component, data)`

Validates individual world components.

**Parameters:**
- `component` (string): Component type ('dimensions', 'nodes', 'characters', etc.)
- `data` (any): Component data to validate

## Usage Examples

### Basic Validation

```javascript
const WorldValidator = require('./WorldValidator');

const worldConfig = {
  dimensions: { width: 100, height: 100 },
  nodes: [
    {
      id: 'village',
      name: 'Village Center',
      position: { x: 50, y: 50 }
    }
  ],
  characters: [
    {
      id: 'hero',
      name: 'Hero Character',
      attributes: { strength: 10, intelligence: 8, charisma: 12 },
      currentNodeId: 'village'
    }
  ]
};

const result = WorldValidator.validate(worldConfig);
console.log(`Valid: ${result.isValid}`);
console.log(`Completeness: ${Math.round(result.completeness * 100)}%`);
```

### Real-time Validation

```javascript
// Validate as user builds world
let buildingWorld = {};

// Step 1: Add dimensions
buildingWorld.dimensions = { width: 200, height: 150 };
let validation = WorldValidator.validate(buildingWorld);
console.log(`Step 1 - Valid: ${validation.isValid}, Complete: ${Math.round(validation.completeness * 100)}%`);

// Step 2: Add nodes
buildingWorld.nodes = [/* node configurations */];
validation = WorldValidator.validate(buildingWorld);
console.log(`Step 2 - Valid: ${validation.isValid}, Complete: ${Math.round(validation.completeness * 100)}%`);
```

### Component Validation

```javascript
// Validate individual components
const dimensionResult = WorldValidator.validateComponent('dimensions', { width: 50, height: 50 });
if (!dimensionResult.valid) {
  console.log('Dimension errors:', dimensionResult.errors);
}

const nodeResult = WorldValidator.validateComponent('nodes', nodeArray);
console.log(`Node validation: ${nodeResult.message}`);
```

### Formatted Feedback for UI

```javascript
const validation = WorldValidator.validate(worldConfig);
const feedback = WorldValidator.formatValidationFeedback(validation);

// Display in UI
console.log(`Status: ${feedback.status}`);
console.log(`Completeness: ${feedback.completeness}%`);

// Show critical errors first
feedback.feedback.critical.forEach(error => {
  console.error(`Critical: ${error}`);
});

// Show suggestions for improvement
feedback.feedback.suggestions.forEach(suggestion => {
  console.info(`Suggestion: ${suggestion}`);
});
```

## Error Categories

### Critical Errors
- Missing required fields (dimensions, node IDs, character names)
- Invalid data types (non-numeric coordinates, non-string names)
- Duplicate IDs
- Invalid relationships (characters assigned to non-existent nodes)

### Configuration Errors
- Invalid optional field types
- Malformed data structures
- Invalid value ranges (negative probabilities)

### Performance Warnings
- Large world dimensions
- High node/character counts
- Overcrowded nodes

### Recommendation Warnings
- Missing optional but recommended fields
- Empty arrays for optional components
- Unassigned characters

## Integration Notes

### With World Builder
The WorldValidator integrates seamlessly with the WorldBuilder class to provide real-time validation feedback as users construct their worlds.

### With Simulation System
The validator ensures that only valid world configurations can be converted to simulation configurations, preventing runtime errors.

### With Template System
The validator works with template-generated content, validating both template instances and custom content.

## Performance Considerations

- Validation is designed to be fast enough for real-time feedback
- Large world configurations (>1000 nodes, >500 characters) may experience slight delays
- Component validation is optimized for individual field updates
- Relationship validation scales with character and node counts

## Testing

The WorldValidator includes comprehensive tests covering:
- All validation methods
- Edge cases and error conditions
- Integration scenarios
- Performance with large datasets

Run tests with:
```bash
npm test -- --testPathPattern=WorldValidator.test.js
```