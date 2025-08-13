# Design Document

## Overview

This design document outlines the investigation and improvement of the node saving functionality in the World History Simulation Engine. The system follows a clean architecture pattern with clear separation between presentation, application, domain, and infrastructure layers. The design focuses on ensuring robust data flow, proper persistence, efficient search capabilities, and reliable routing.

## Architecture

### Current System Architecture

The node saving system operates through the following architectural layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  NodeEditorPage │  │ WorldStateViewer│  │ NodeEditor   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                   │        │
│           └─────────────────────┼───────────────────┘        │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │SimulationContext│  │ useWorldBuilder │  │TemplateManager│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                   │        │
│           └─────────────────────┼───────────────────┘        │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────┐
│                     Domain Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  WorldBuilder   │  │      Node       │  │ Validation   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                   │        │
│           └─────────────────────┼───────────────────┘        │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────┐
│                Infrastructure Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  LocalStorage   │  │   Persistence   │  │    Router    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Analysis

The current data flow for node saving follows this path:

1. **User Input** → NodeEditor component captures form data
2. **Validation** → NodeEditor validates basic form requirements
3. **Save Trigger** → NodeEditorPage.handleSave() is called
4. **World Builder** → worldBuilder.addNode() processes the node
5. **Domain Validation** → WorldBuilder validates node against domain rules
6. **State Update** → worldConfig.nodes array is updated
7. **Context Sync** → useWorldBuilder.syncWorldConfig() updates React state
8. **UI Update** → Components re-render with new data
9. **Persistence** → LocalStorage automatically persists changes

## Components and Interfaces

### Enhanced NodeEditor Component

```javascript
interface NodeEditorProps {
  initialNode?: Node;
  onSave: (nodeData: NodeData) => Promise<void>;
  onCancel?: () => void;
  onChange?: (nodeData: NodeData) => void;
  mode: 'create' | 'edit';
  validationErrors?: ValidationError[];
  isLoading?: boolean;
}

interface NodeData {
  id: string;
  name: string;
  description: string;
  type: NodeType;
  environment: EnvironmentType;
  populationCapacity: number;
  features: NodeFeature[];
  resources: string[];
  modifiers: Record<string, number>;
  connections: NodeConnection[];
  tags: string[];
  metadata: Record<string, any>;
}
```

### Enhanced WorldStateViewer Component

```javascript
interface WorldStateViewerProps {
  searchEnabled?: boolean;
  filterOptions?: FilterOptions;
  onNodeSelect?: (node: Node) => void;
  onNodeEdit?: (node: Node) => void;
  onNodeDelete?: (nodeId: string) => void;
}

interface SearchCapabilities {
  searchNodes: (query: string) => Node[];
  searchCharacters: (query: string) => Character[];
  searchInteractions: (query: string) => Interaction[];
  filterByType: (type: string) => any[];
  filterByTags: (tags: string[]) => any[];
}
```

### Enhanced WorldBuilder Service

```javascript
interface WorldBuilderEnhancements {
  // Node management
  addNode(nodeConfig: NodeConfig): Promise<Node>;
  updateNode(nodeId: string, updates: Partial<NodeConfig>): Promise<Node>;
  deleteNode(nodeId: string): Promise<void>;
  getNode(nodeId: string): Node | null;
  
  // Search and query
  searchNodes(query: string): Node[];
  filterNodes(predicate: (node: Node) => boolean): Node[];
  
  // Validation
  validateNode(nodeConfig: NodeConfig): ValidationResult;
  validateWorldState(): ValidationResult;
  
  // Persistence
  saveWorldState(): Promise<void>;
  loadWorldState(): Promise<WorldState>;
}
```

## Data Models

### Node Entity Model

```javascript
class Node {
  constructor(config) {
    this.id = config.id || generateId('node');
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.environment = config.environment;
    this.populationCapacity = config.populationCapacity;
    this.currentPopulation = config.currentPopulation || 0;
    this.developmentLevel = config.developmentLevel || 1;
    this.features = config.features || [];
    this.resources = config.resources || [];
    this.modifiers = config.modifiers || {};
    this.connections = config.connections || [];
    this.tags = config.tags || [];
    this.metadata = config.metadata || {};
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Validation methods
  validate() {
    const errors = [];
    if (!this.name?.trim()) errors.push('Name is required');
    if (!this.description?.trim()) errors.push('Description is required');
    if (this.populationCapacity < 0) errors.push('Population capacity must be positive');
    return { isValid: errors.length === 0, errors };
  }

  // Search methods
  matchesQuery(query) {
    const searchTerm = query.toLowerCase();
    return this.name.toLowerCase().includes(searchTerm) ||
           this.description.toLowerCase().includes(searchTerm) ||
           this.type.toLowerCase().includes(searchTerm) ||
           this.tags.some(tag => tag.toLowerCase().includes(searchTerm));
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      environment: this.environment,
      populationCapacity: this.populationCapacity,
      currentPopulation: this.currentPopulation,
      developmentLevel: this.developmentLevel,
      features: this.features,
      resources: this.resources,
      modifiers: this.modifiers,
      connections: this.connections,
      tags: this.tags,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

### World State Model

```javascript
class WorldState {
  constructor() {
    this.id = generateId('world');
    this.name = null;
    this.description = null;
    this.rules = null;
    this.initialConditions = null;
    this.nodes = [];
    this.characters = [];
    this.interactions = [];
    this.nodePopulations = {};
    this.stepValidation = {
      1: false, 2: false, 3: false, 4: false, 5: false, 6: false
    };
    this.isComplete = false;
    this.isValid = false;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Search methods
  searchNodes(query) {
    if (!query) return this.nodes;
    return this.nodes.filter(node => node.matchesQuery(query));
  }

  // Node management
  addNode(nodeConfig) {
    const node = new Node(nodeConfig);
    const validation = node.validate();
    if (!validation.isValid) {
      throw new Error(`Node validation failed: ${validation.errors.join(', ')}`);
    }
    this.nodes.push(node);
    this.updatedAt = new Date().toISOString();
    return node;
  }

  updateNode(nodeId, updates) {
    const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    
    const updatedNode = new Node({ ...this.nodes[nodeIndex], ...updates });
    const validation = updatedNode.validate();
    if (!validation.isValid) {
      throw new Error(`Node validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.nodes[nodeIndex] = updatedNode;
    this.updatedAt = new Date().toISOString();
    return updatedNode;
  }

  deleteNode(nodeId) {
    const initialLength = this.nodes.length;
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    
    if (this.nodes.length === initialLength) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    
    // Clean up node populations
    delete this.nodePopulations[nodeId];
    this.updatedAt = new Date().toISOString();
  }
}
```

## Error Handling

### Validation Error Handling

```javascript
class ValidationError extends Error {
  constructor(field, message, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
  }

  addError(field, message, code) {
    this.errors.push(new ValidationError(field, message, code));
    this.isValid = false;
  }

  addWarning(field, message) {
    this.warnings.push({ field, message });
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  getErrorsForField(field) {
    return this.errors.filter(error => error.field === field);
  }
}
```

### Persistence Error Handling

```javascript
class PersistenceError extends Error {
  constructor(operation, cause, code = 'PERSISTENCE_ERROR') {
    super(`Persistence operation failed: ${operation}`);
    this.name = 'PersistenceError';
    this.operation = operation;
    this.cause = cause;
    this.code = code;
  }
}

class PersistenceService {
  async saveWorldState(worldState) {
    try {
      const serialized = JSON.stringify(worldState);
      localStorage.setItem('worldState', serialized);
      return { success: true };
    } catch (error) {
      throw new PersistenceError('save', error);
    }
  }

  async loadWorldState() {
    try {
      const serialized = localStorage.getItem('worldState');
      if (!serialized) return null;
      return JSON.parse(serialized);
    } catch (error) {
      throw new PersistenceError('load', error);
    }
  }
}
```

## Testing Strategy

### Unit Testing

```javascript
// Node validation tests
describe('Node Validation', () => {
  test('should validate required fields', () => {
    const node = new Node({ name: '', description: '' });
    const result = node.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
    expect(result.errors).toContain('Description is required');
  });

  test('should validate population capacity', () => {
    const node = new Node({ 
      name: 'Test', 
      description: 'Test', 
      populationCapacity: -1 
    });
    const result = node.validate();
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Population capacity must be positive');
  });
});

// Search functionality tests
describe('Node Search', () => {
  test('should search by name', () => {
    const worldState = new WorldState();
    worldState.addNode({ name: 'Test Village', description: 'A test village' });
    const results = worldState.searchNodes('village');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Test Village');
  });

  test('should search by tags', () => {
    const worldState = new WorldState();
    worldState.addNode({ 
      name: 'Test', 
      description: 'Test', 
      tags: ['settlement', 'trade'] 
    });
    const results = worldState.searchNodes('trade');
    expect(results).toHaveLength(1);
  });
});
```

### Integration Testing

```javascript
// Data flow integration tests
describe('Node Saving Integration', () => {
  test('should save node through complete flow', async () => {
    const worldBuilder = new WorldBuilder();
    const nodeConfig = {
      name: 'Test Node',
      description: 'Test Description',
      type: 'settlement'
    };

    const node = await worldBuilder.addNode(nodeConfig);
    expect(node.id).toBeDefined();
    expect(worldBuilder.worldConfig.nodes).toContain(node);
  });

  test('should persist changes to localStorage', async () => {
    const worldBuilder = new WorldBuilder();
    const nodeConfig = {
      name: 'Persistent Node',
      description: 'Should persist',
      type: 'settlement'
    };

    await worldBuilder.addNode(nodeConfig);
    
    // Verify persistence
    const saved = localStorage.getItem('worldState');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved);
    expect(parsed.nodes).toHaveLength(1);
    expect(parsed.nodes[0].name).toBe('Persistent Node');
  });
});
```

### UI Testing

```javascript
// Component testing
describe('NodeEditor Component', () => {
  test('should display validation errors', () => {
    const errors = [
      { field: 'name', message: 'Name is required' }
    ];
    
    render(<NodeEditor validationErrors={errors} />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  test('should call onSave with node data', () => {
    const onSave = jest.fn();
    render(<NodeEditor onSave={onSave} />);
    
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'Test Node' } 
    });
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'Test Description' } 
    });
    fireEvent.click(screen.getByText('Save Node'));
    
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Node',
        description: 'Test Description'
      })
    );
  });
});
```

## Performance Considerations

### Search Optimization

```javascript
class OptimizedSearch {
  constructor(worldState) {
    this.worldState = worldState;
    this.searchIndex = this.buildSearchIndex();
  }

  buildSearchIndex() {
    const index = new Map();
    
    this.worldState.nodes.forEach(node => {
      const searchTerms = [
        node.name.toLowerCase(),
        node.description.toLowerCase(),
        node.type.toLowerCase(),
        ...node.tags.map(tag => tag.toLowerCase())
      ];
      
      searchTerms.forEach(term => {
        if (!index.has(term)) {
          index.set(term, new Set());
        }
        index.get(term).add(node.id);
      });
    });
    
    return index;
  }

  search(query) {
    const searchTerm = query.toLowerCase();
    const matchingIds = new Set();
    
    for (const [term, nodeIds] of this.searchIndex) {
      if (term.includes(searchTerm)) {
        nodeIds.forEach(id => matchingIds.add(id));
      }
    }
    
    return this.worldState.nodes.filter(node => matchingIds.has(node.id));
  }

  updateIndex(node) {
    // Update search index when nodes change
    this.searchIndex = this.buildSearchIndex();
  }
}
```

### Memory Management

```javascript
class MemoryOptimizedWorldState {
  constructor() {
    this.nodes = [];
    this.nodeCache = new Map();
    this.maxCacheSize = 100;
  }

  getNode(nodeId) {
    if (this.nodeCache.has(nodeId)) {
      return this.nodeCache.get(nodeId);
    }
    
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      this.addToCache(nodeId, node);
    }
    return node;
  }

  addToCache(nodeId, node) {
    if (this.nodeCache.size >= this.maxCacheSize) {
      const firstKey = this.nodeCache.keys().next().value;
      this.nodeCache.delete(firstKey);
    }
    this.nodeCache.set(nodeId, node);
  }
}
```

## Security Considerations

### Input Sanitization

```javascript
class InputSanitizer {
  static sanitizeNodeInput(nodeConfig) {
    return {
      ...nodeConfig,
      name: this.sanitizeString(nodeConfig.name),
      description: this.sanitizeString(nodeConfig.description),
      tags: nodeConfig.tags?.map(tag => this.sanitizeString(tag)) || [],
      metadata: this.sanitizeMetadata(nodeConfig.metadata)
    };
  }

  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  static sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return {};
    
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
```

## Conclusion

This design provides a comprehensive approach to investigating and improving the node saving functionality in the World History Simulation Engine. The enhanced architecture maintains the existing clean separation of concerns while adding robust error handling, efficient search capabilities, and improved user experience. The design ensures data integrity through proper validation, provides clear feedback to users, and maintains good performance even with large datasets.

The implementation will focus on incremental improvements to the existing system rather than complete rewrites, ensuring backward compatibility while adding the necessary enhancements for a robust node management system.