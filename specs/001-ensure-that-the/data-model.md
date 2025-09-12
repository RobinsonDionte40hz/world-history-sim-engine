# Data Model: Demo World Save Flow Consistency

**Feature**: Demo World Save Flow Consistency
**Date**: September 12, 2025

## Core Entities

### DemoWorld
Represents a pre-configured world template with sample content.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `name`: string - Display name
- `description`: string - Description of the demo world
- `version`: string - Version identifier (e.g., "1.0.0")
- `createdAt`: Date - Creation timestamp
- `lastModified`: Date - Last modification timestamp
- `content`: DemoContent - Nested content structure
- `metadata`: DemoMetadata - Additional metadata

**Relationships**:
- 1:1 with DemoContent
- 1:1 with DemoMetadata

**Validation Rules**:
- `id` must be valid UUID format
- `name` cannot be empty, max 100 characters
- `version` must follow semantic versioning
- `createdAt` cannot be in the future

### DemoContent
Contains the actual demo world data (interactions, nodes, characters).

**Fields**:
- `interactions`: Interaction[] - Array of interaction objects
- `nodes`: Node[] - Array of node objects
- `characters`: Character[] - Array of character objects
- `relationships`: Relationship[] - Array of relationship objects
- `settings`: object - World-specific settings

**Relationships**:
- 1:1 with DemoWorld
- 1:many with Interaction, Node, Character

**Validation Rules**:
- At least one interaction, node, or character required
- All referenced entities must exist
- Settings must be valid JSON

### ContentEntity (Base)
Abstract base for all content entities with common fields.

**Fields**:
- `id`: string (UUID) - Unique identifier
- `type`: 'interaction' | 'node' | 'character' - Entity type
- `ownership`: 'demo' | 'user' | 'mixed' - Content ownership
- `originalDemoId`: string? - ID of originating demo (if applicable)
- `createdAt`: Date - Creation timestamp
- `modifiedAt`: Date - Last modification timestamp
- `version`: number - Version counter for conflict resolution
- `data`: object - Entity-specific data

**Validation Rules**:
- `id` must be valid UUID
- `ownership` must be one of allowed values
- `version` must be non-negative integer
- `modifiedAt` >= `createdAt`

### Interaction (extends ContentEntity)
Represents an interaction within the demo world.

**Additional Fields**:
- `participants`: string[] - IDs of participating characters
- `location`: string - Node ID where interaction occurs
- `type`: string - Interaction type (e.g., "conversation", "combat")
- `outcome`: object - Result of the interaction
- `narrative`: string - Descriptive text

**Relationships**:
- many:many with Character (participants)
- many:1 with Node (location)

**Validation Rules**:
- `participants` must contain valid character IDs
- `location` must reference existing node
- `type` must be from predefined list

### Node (extends ContentEntity)
Represents a location or context within the demo world.

**Additional Fields**:
- `name`: string - Display name
- `type`: string - Node type (e.g., "settlement", "wilderness")
- `coordinates`: {x: number, y: number}? - Optional positioning
- `properties`: object - Environmental properties
- `connections`: string[] - IDs of connected nodes

**Relationships**:
- many:many with Node (connections)
- 1:many with Interaction (location)

**Validation Rules**:
- `name` cannot be empty, max 50 characters
- `connections` must reference existing nodes
- `coordinates` must be valid numbers if provided

### Character (extends ContentEntity)
Represents a character within the demo world.

**Additional Fields**:
- `name`: string - Character name
- `attributes`: object - Character attributes (STR, DEX, etc.)
- `currentNode`: string - Current node ID
- `relationships`: object - Relationships with other characters
- `inventory`: object[] - Character's possessions
- `status`: string - Current status (e.g., "active", "inactive")

**Relationships**:
- many:1 with Node (currentNode)
- many:many with Character (relationships)
- many:many with Interaction (participants)

**Validation Rules**:
- `name` cannot be empty, max 30 characters
- `currentNode` must reference existing node
- `attributes` must contain required fields
- `status` must be from predefined list

### SaveFlow
Represents the standard save process used by editor buttons.

**Fields**:
- `id`: string (UUID) - Save operation identifier
- `timestamp`: Date - When save was initiated
- `contentType`: 'demo' | 'user' | 'mixed' - Type of content being saved
- `entities`: string[] - IDs of entities being saved
- `source`: 'editor' | 'auto' | 'manual' - How save was triggered
- `status`: 'pending' | 'success' | 'failed' - Save operation status
- `error`: string? - Error message if failed

**Relationships**:
- 1:many with ContentEntity (entities)

**Validation Rules**:
- `timestamp` cannot be in the future
- `entities` must contain valid entity IDs
- `status` must be one of allowed values

## Data Flow Patterns

### Save Operation Flow
1. **Initiation**: User clicks Save button in editor
2. **Validation**: Check content ownership and permissions
3. **Preparation**: Gather all modified entities
4. **Conflict Detection**: Check for version conflicts
5. **Persistence**: Save to LocalStorage with ownership flags
6. **Confirmation**: Update UI with save status

### Load Operation Flow
1. **Detection**: Identify content type (demo vs user)
2. **Ownership Assignment**: Set appropriate ownership flags
3. **Relationship Resolution**: Ensure all references are valid
4. **State Integration**: Merge into Redux store
5. **UI Update**: Reflect loaded content in editors

## State Management

### Redux Store Structure
```javascript
{
  demoWorlds: {
    byId: Record<string, DemoWorld>,
    currentDemo: string | null,
    loading: boolean,
    error: string | null
  },
  content: {
    interactions: Record<string, Interaction>,
    nodes: Record<string, Node>,
    characters: Record<string, Character>,
    relationships: Record<string, Relationship>
  },
  saveFlow: {
    currentOperation: SaveFlow | null,
    history: SaveFlow[],
    pending: string[]
  }
}
```

### State Transitions

**Demo Loading**:
- `currentDemo: null` → `currentDemo: demoId`
- Content entities loaded with `ownership: 'demo'`
- UI switches to demo mode

**Content Modification**:
- Entity `ownership` changes from `'demo'` to `'mixed'`
- `modifiedAt` timestamp updated
- Save operation queued

**Save Completion**:
- Entity `version` incremented
- `modifiedAt` updated
- Save operation marked as successful

## Validation Rules Summary

### Entity-Level Validation
- All entities must have valid UUIDs
- Timestamps must be valid and logical
- Referenced entities must exist
- Ownership values must be from allowed set

### Relationship Validation
- All foreign key references must be valid
- Circular references must be prevented
- Ownership consistency across related entities

### Business Rule Validation
- Demo content cannot modify user content directly
- Save operations must respect ownership permissions
- Version conflicts must be detected and resolved

## Migration Strategy

### Version 1.0 → 1.1 (Adding Ownership)
1. Scan existing content for demo indicators
2. Assign appropriate ownership flags
3. Update save operations to respect ownership
4. Add conflict resolution for mixed ownership

### Future Extensions
- Content sharing between demos
- User content templates
- Advanced conflict resolution strategies
- Content versioning and rollback