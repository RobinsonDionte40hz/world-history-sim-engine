# Design Document

## Overview

The Node Environmental Enhancements feature extends the existing Node entity in the World History Simulation Engine to support rich environmental modeling while maintaining the system's mapless, abstract design philosophy. This enhancement transforms nodes from simple location containers into complex environmental contexts that influence character behavior, interaction outcomes, and world simulation dynamics through sophisticated environmental calculations and contextual modifiers.

## Architecture

### Enhanced Domain Layer Structure

The design builds upon the existing clean architecture while extending the Node entity with comprehensive environmental capabilities:

```
domain/
├── entities/
│   ├── Node.js (enhanced)
│   └── EnvironmentalHazard.js (new)
├── value-objects/
│   ├── Environment.js (new)
│   ├── NodeConnection.js (new)
│   └── EnvironmentalModifiers.js (new)
├── services/
│   ├── EnvironmentalCalculationService.js (new)
│   ├── NodeConnectionService.js (new)
│   └── EnvironmentalPresetService.js (new)
└── enums/
    ├── TerrainTypes.js (new)
    ├── ClimateTypes.js (new)
    └── HazardTypes.js (new)
```

## Components and Interfaces

### 1. Enhanced Node Entity

**Current Structure Extension**:
The existing Node entity will be enhanced with new environmental properties while maintaining backward compatibility:

```javascript
class Node {
  constructor(config = {}) {
    // Existing properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Node';
    this.description = config.description || '';
    this.type = config.type || 'location';
    this.position = config.position instanceof Position ? 
      config.position : new Position(config.position || {});
    this.interactions = Array.isArray(config.interactions) ? 
      config.interactions.map(i => i instanceof Interaction ? i : new Interaction(i)) : 
      [];
    this.resources = config.resources || {};
    this.connectedNodes = config.connectedNodes || [];
    this.population = config.population || 0;

    // Enhanced environmental properties
    this.environment = new Environment({
      density: config.environment?.density || 0.5,
      terrain: config.environment?.terrain || TerrainTypes.PLAINS,
      climate: config.environment?.climate || ClimateTypes.TEMPERATE,
      lighting: config.environment?.lighting || LightingTypes.NORMAL,
      hazards: config.environment?.hazards || [],
      shelterQuality: config.environment?.shelterQuality || 0.5,
      ...config.environment
    });

    // Node size for population density calculations
    this.size = config.size || 100;

    // Enhanced connection data (replaces connectedNodes)
    this.connections = config.connections?.map(conn => 
      new NodeConnection(conn)) || [];
  }

  // New environmental query methods
  getEnvironmentalDanger() {
    return EnvironmentalCalculationService.calculateDanger(this);
  }

  getEnvironmentalModifiers(interactionType) {
    return EnvironmentalCalculationService.getModifiers(this, interactionType);
  }

  getPopulationDensity() {
    return this.population / this.size;
  }

  isOvercrowded() {
    return this.getPopulationDensity() > 0.8;
  }

  // Enhanced connection methods
  getConnectionTo(nodeId) {
    return this.connections.find(conn => conn.targetNodeId === nodeId);
  }

  getConnectionsByType(connectionType) {
    return this.connections.filter(conn => conn.type === connectionType);
  }
}
```

### 2. Environment Value Object

**Purpose**: Encapsulates all environmental properties and provides environmental calculations

```javascript
class Environment {
  constructor(config = {}) {
    this.density = this._validateRange(config.density, 0, 1, 0.5);
    this.terrain = config.terrain || TerrainTypes.PLAINS;
    this.climate = config.climate || ClimateTypes.TEMPERATE;
    this.lighting = config.lighting || LightingTypes.NORMAL;
    this.hazards = Array.isArray(config.hazards) ? 
      config.hazards.map(h => new EnvironmentalHazard(h)) : [];
    this.shelterQuality = this._validateRange(config.shelterQuality, 0, 1, 0.5);
    
    // Additional environmental properties
    this.airQuality = this._validateRange(config.airQuality, 0, 1, 0.8);
    this.waterAvailability = this._validateRange(config.waterAvailability, 0, 1, 0.7);
    this.temperature = config.temperature || this._getDefaultTemperature();
    this.humidity = this._validateRange(config.humidity, 0, 1, 0.5);
    this.windStrength = this._validateRange(config.windStrength, 0, 1, 0.3);
    
    Object.freeze(this); // Immutable value object
  }

  _validateRange(value, min, max, defaultValue) {
    if (typeof value !== 'number' || value < min || value > max) {
      return defaultValue;
    }
    return value;
  }

  _getDefaultTemperature() {
    const climateTemperatures = {
      [ClimateTypes.ARCTIC]: -10,
      [ClimateTypes.TEMPERATE]: 15,
      [ClimateTypes.TROPICAL]: 28,
      [ClimateTypes.ARID]: 35
    };
    return climateTemperatures[this.climate] || 15;
  }

  // Environmental query methods
  isHospitable() {
    return this.shelterQuality > 0.3 && 
           this.airQuality > 0.4 && 
           this.waterAvailability > 0.3;
  }

  getComfortLevel() {
    return (this.shelterQuality + this.airQuality + this.waterAvailability) / 3;
  }

  hasHazardType(hazardType) {
    return this.hazards.some(h => h.type === hazardType);
  }

  toJSON() {
    return {
      density: this.density,
      terrain: this.terrain,
      climate: this.climate,
      lighting: this.lighting,
      hazards: this.hazards.map(h => h.toJSON()),
      shelterQuality: this.shelterQuality,
      airQuality: this.airQuality,
      waterAvailability: this.waterAvailability,
      temperature: this.temperature,
      humidity: this.humidity,
      windStrength: this.windStrength
    };
  }
}
```

### 3. NodeConnection Value Object

**Purpose**: Represents relationships between nodes with rich metadata

```javascript
class NodeConnection {
  constructor(config = {}) {
    this.targetNodeId = config.targetNodeId;
    this.type = config.type || ConnectionTypes.ROAD;
    this.difficulty = this._validateRange(config.difficulty, 1, 10, 1);
    this.distance = config.distance || 1; // Abstract distance units
    this.bidirectional = config.bidirectional !== false; // Default true
    this.conditions = config.conditions || []; // Travel conditions
    this.modifiers = config.modifiers || {}; // Travel modifiers
    
    Object.freeze(this);
  }

  _validateRange(value, min, max, defaultValue) {
    if (typeof value !== 'number' || value < min || value > max) {
      return defaultValue;
    }
    return value;
  }

  getTravelTime(baseTime = 1) {
    return baseTime * this.distance * (this.difficulty / 5);
  }

  isPassable(conditions = {}) {
    return this.conditions.every(condition => 
      this._checkCondition(condition, conditions));
  }

  _checkCondition(condition, currentConditions) {
    // Implementation for condition checking
    return true; // Simplified for design document
  }

  toJSON() {
    return {
      targetNodeId: this.targetNodeId,
      type: this.type,
      difficulty: this.difficulty,
      distance: this.distance,
      bidirectional: this.bidirectional,
      conditions: this.conditions,
      modifiers: this.modifiers
    };
  }
}
```

### 4. EnvironmentalCalculationService

**Purpose**: Centralized service for all environmental calculations and modifiers

```javascript
class EnvironmentalCalculationService {
  static calculateDanger(node) {
    let danger = 0;
    
    // Base danger from node type
    const typeDanger = {
      'wilderness': 0.3,
      'dungeon': 0.6,
      'settlement': 0.1,
      'landmark': 0.2,
      'resource': 0.25,
      'sacred': 0.15
    };
    
    danger += typeDanger[node.type] || 0;
    
    // Add hazard danger
    danger += node.environment.hazards.length * 0.1;
    
    // Environmental factors
    if (node.environment.shelterQuality < 0.3) danger += 0.2;
    if (node.environment.airQuality < 0.4) danger += 0.15;
    if (node.environment.waterAvailability < 0.3) danger += 0.25;
    
    // Climate extremes
    if (node.environment.climate === ClimateTypes.ARCTIC) danger += 0.2;
    if (node.environment.climate === ClimateTypes.ARID) danger += 0.15;
    
    // Lighting conditions
    if (node.environment.lighting === LightingTypes.DARK) danger += 0.2;
    if (node.environment.lighting === LightingTypes.DIM) danger += 0.1;
    
    return Math.min(1, danger);
  }

  static getModifiers(node, interactionType) {
    const modifiers = {};
    
    // Terrain modifiers
    const terrainMods = this._getTerrainModifiers(node.environment.terrain);
    Object.assign(modifiers, terrainMods);
    
    // Climate modifiers
    const climateMods = this._getClimateModifiers(node.environment.climate);
    Object.assign(modifiers, climateMods);
    
    // Lighting modifiers
    const lightingMods = this._getLightingModifiers(node.environment.lighting);
    Object.assign(modifiers, lightingMods);
    
    // Interaction-specific modifiers
    const interactionMods = this._getInteractionModifiers(node, interactionType);
    Object.assign(modifiers, interactionMods);
    
    return modifiers;
  }

  static _getTerrainModifiers(terrain) {
    const terrainModifiers = {
      [TerrainTypes.PLAINS]: { movement: 1.0, visibility: 1.2 },
      [TerrainTypes.FOREST]: { stealth: 1.3, movement: 0.8, visibility: 0.7 },
      [TerrainTypes.MOUNTAINS]: { movement: 0.6, defense: 1.4, visibility: 1.5 },
      [TerrainTypes.DESERT]: { movement: 0.7, survival: 0.6, visibility: 1.3 },
      [TerrainTypes.SWAMP]: { movement: 0.5, disease_resistance: 0.7, stealth: 1.2 },
      [TerrainTypes.URBAN]: { social: 1.2, information: 1.4, stealth: 0.8 }
    };
    
    return terrainModifiers[terrain] || {};
  }

  static _getClimateModifiers(climate) {
    const climateModifiers = {
      [ClimateTypes.ARCTIC]: { 
        constitution_checks: 0.8, 
        survival: 0.7, 
        movement: 0.8 
      },
      [ClimateTypes.TROPICAL]: { 
        disease_resistance: 0.8, 
        plant_knowledge: 1.2 
      },
      [ClimateTypes.ARID]: { 
        survival: 0.7, 
        constitution_checks: 0.9, 
        visibility: 1.2 
      },
      [ClimateTypes.TEMPERATE]: { 
        // Balanced, no significant modifiers
      }
    };
    
    return climateModifiers[climate] || {};
  }

  static _getLightingModifiers(lighting) {
    const lightingModifiers = {
      [LightingTypes.BRIGHT]: { visibility: 1.3, stealth: 0.7 },
      [LightingTypes.NORMAL]: { /* no modifiers */ },
      [LightingTypes.DIM]: { visibility: 0.8, stealth: 1.2 },
      [LightingTypes.DARK]: { visibility: 0.4, stealth: 1.5, fear_checks: 0.8 },
      [LightingTypes.MAGICAL]: { magic_checks: 1.2, perception: 1.1 }
    };
    
    return lightingModifiers[lighting] || {};
  }

  static _getInteractionModifiers(node, interactionType) {
    // Specific modifiers based on interaction type and environment
    const modifiers = {};
    
    if (interactionType === 'combat') {
      if (node.environment.terrain === TerrainTypes.MOUNTAINS) {
        modifiers.ranged_attacks = 1.2;
      }
      if (node.environment.lighting === LightingTypes.DARK) {
        modifiers.accuracy = 0.7;
      }
    }
    
    if (interactionType === 'social') {
      if (node.type === 'settlement') {
        modifiers.persuasion = 1.1;
      }
      if (node.environment.density > 0.8) {
        modifiers.intimidation = 0.8; // Harder to intimidate in crowds
      }
    }
    
    return modifiers;
  }

  static calculatePopulationCapacity(node) {
    let baseCapacity = node.size;
    
    // Environmental factors
    baseCapacity *= node.environment.shelterQuality;
    baseCapacity *= node.environment.waterAvailability;
    baseCapacity *= (1 - (node.environment.hazards.length * 0.1));
    
    // Climate adjustments
    const climateMultipliers = {
      [ClimateTypes.TEMPERATE]: 1.0,
      [ClimateTypes.TROPICAL]: 0.9,
      [ClimateTypes.ARID]: 0.6,
      [ClimateTypes.ARCTIC]: 0.4
    };
    
    baseCapacity *= climateMultipliers[node.environment.climate] || 1.0;
    
    return Math.floor(baseCapacity);
  }
}
```

### 5. EnvironmentalPresetService

**Purpose**: Provides themed environmental presets for rapid world building

```javascript
class EnvironmentalPresetService {
  static getPresets() {
    return {
      'forest_village': {
        name: 'Forest Village',
        description: 'A peaceful settlement nestled in the woods',
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.DIM,
          density: 0.6,
          shelterQuality: 0.7,
          airQuality: 0.9,
          waterAvailability: 0.8,
          hazards: []
        },
        type: 'settlement',
        size: 150
      },
      
      'mountain_fortress': {
        name: 'Mountain Fortress',
        description: 'A fortified stronghold high in the mountains',
        environment: {
          terrain: TerrainTypes.MOUNTAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.BRIGHT,
          density: 0.3,
          shelterQuality: 0.9,
          airQuality: 0.95,
          waterAvailability: 0.6,
          hazards: [{ type: HazardTypes.ALTITUDE, severity: 0.3 }]
        },
        type: 'settlement',
        size: 80
      },
      
      'desert_oasis': {
        name: 'Desert Oasis',
        description: 'A life-giving oasis in the harsh desert',
        environment: {
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID,
          lighting: LightingTypes.BRIGHT,
          density: 0.8,
          shelterQuality: 0.4,
          airQuality: 0.7,
          waterAvailability: 0.9,
          hazards: [{ type: HazardTypes.EXTREME_HEAT, severity: 0.4 }]
        },
        type: 'landmark',
        size: 60
      },
      
      'haunted_ruins': {
        name: 'Haunted Ruins',
        description: 'Ancient ruins filled with supernatural dangers',
        environment: {
          terrain: TerrainTypes.RUINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.DIM,
          density: 0.2,
          shelterQuality: 0.3,
          airQuality: 0.6,
          waterAvailability: 0.4,
          hazards: [
            { type: HazardTypes.SUPERNATURAL, severity: 0.6 },
            { type: HazardTypes.STRUCTURAL_INSTABILITY, severity: 0.3 }
          ]
        },
        type: 'dungeon',
        size: 40
      }
    };
  }

  static applyPreset(nodeData, presetId) {
    const preset = this.getPresets()[presetId];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetId}`);
    }

    return {
      ...nodeData,
      ...preset,
      name: nodeData.name || preset.name,
      description: nodeData.description || preset.description
    };
  }

  static createCustomPreset(name, description, nodeData) {
    return {
      name,
      description,
      environment: { ...nodeData.environment },
      type: nodeData.type,
      size: nodeData.size,
      features: [...(nodeData.features || [])],
      resources: [...(nodeData.resources || [])]
    };
  }
}
```

## Data Models

### Environmental Enums

```javascript
// TerrainTypes.js
export const TerrainTypes = {
  PLAINS: 'plains',
  FOREST: 'forest',
  MOUNTAINS: 'mountains',
  DESERT: 'desert',
  SWAMP: 'swamp',
  URBAN: 'urban',
  RUINS: 'ruins',
  UNDERGROUND: 'underground',
  COASTAL: 'coastal',
  TUNDRA: 'tundra'
};

// ClimateTypes.js
export const ClimateTypes = {
  ARCTIC: 'arctic',
  TEMPERATE: 'temperate',
  TROPICAL: 'tropical',
  ARID: 'arid',
  SUBTROPICAL: 'subtropical',
  CONTINENTAL: 'continental'
};

// LightingTypes.js
export const LightingTypes = {
  BRIGHT: 'bright',
  NORMAL: 'normal',
  DIM: 'dim',
  DARK: 'dark',
  MAGICAL: 'magical'
};

// ConnectionTypes.js
export const ConnectionTypes = {
  ROAD: 'road',
  RIVER: 'river',
  MOUNTAIN_PASS: 'mountain_pass',
  SEA_ROUTE: 'sea_route',
  TUNNEL: 'tunnel',
  TELEPORT: 'teleport',
  BRIDGE: 'bridge',
  TRADE_ROUTE: 'trade_route'
};

// HazardTypes.js
export const HazardTypes = {
  EXTREME_HEAT: 'extreme_heat',
  EXTREME_COLD: 'extreme_cold',
  TOXIC_AIR: 'toxic_air',
  RADIATION: 'radiation',
  SUPERNATURAL: 'supernatural',
  WILD_ANIMALS: 'wild_animals',
  BANDITS: 'bandits',
  DISEASE: 'disease',
  ALTITUDE: 'altitude',
  STRUCTURAL_INSTABILITY: 'structural_instability'
};
```

### Enhanced Template Structure

```javascript
interface NodeTemplate {
  // Existing template properties
  id: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
  metadata: object;
  
  // Enhanced environmental data
  environment: {
    density: number;
    terrain: string;
    climate: string;
    lighting: string;
    hazards: EnvironmentalHazard[];
    shelterQuality: number;
    airQuality: number;
    waterAvailability: number;
    temperature: number;
    humidity: number;
    windStrength: number;
  };
  
  size: number;
  connections: NodeConnection[];
  
  // Environmental presets
  environmentalPreset?: string;
  customEnvironmentalProperties?: object;
}
```

## Error Handling

### Environmental Validation

```javascript
class EnvironmentalValidator {
  static validateEnvironment(environment) {
    const errors = [];
    
    // Range validations
    if (environment.density < 0 || environment.density > 1) {
      errors.push('Density must be between 0 and 1');
    }
    
    if (environment.shelterQuality < 0 || environment.shelterQuality > 1) {
      errors.push('Shelter quality must be between 0 and 1');
    }
    
    // Enum validations
    if (!Object.values(TerrainTypes).includes(environment.terrain)) {
      errors.push(`Invalid terrain type: ${environment.terrain}`);
    }
    
    if (!Object.values(ClimateTypes).includes(environment.climate)) {
      errors.push(`Invalid climate type: ${environment.climate}`);
    }
    
    // Logical validations
    if (environment.climate === ClimateTypes.ARID && environment.waterAvailability > 0.7) {
      errors.push('Arid climates typically have low water availability');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateConnections(connections, availableNodes = []) {
    const errors = [];
    
    connections.forEach((connection, index) => {
      if (!connection.targetNodeId) {
        errors.push(`Connection ${index}: Target node ID is required`);
      }
      
      if (connection.difficulty < 1 || connection.difficulty > 10) {
        errors.push(`Connection ${index}: Difficulty must be between 1 and 10`);
      }
      
      if (availableNodes.length > 0 && 
          !availableNodes.some(node => node.id === connection.targetNodeId)) {
        errors.push(`Connection ${index}: Target node ${connection.targetNodeId} does not exist`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## Testing Strategy

### Unit Testing Focus Areas

1. **Environmental Calculations**
   - Danger level calculations with various combinations
   - Environmental modifier calculations
   - Population capacity calculations
   - Edge cases and boundary conditions

2. **Value Object Immutability**
   - Environment value object immutability
   - NodeConnection value object immutability
   - Proper validation and error handling

3. **Service Layer Logic**
   - EnvironmentalCalculationService accuracy
   - EnvironmentalPresetService functionality
   - NodeConnectionService operations

### Integration Testing

1. **Node Enhancement Integration**
   - Enhanced Node entity with existing systems
   - Template system integration with environmental data
   - Simulation service integration with environmental modifiers

2. **Backward Compatibility**
   - Existing nodes load correctly with default environmental values
   - Old templates work with enhanced system
   - Migration scenarios

## Performance Considerations

### Calculation Optimization

```javascript
class EnvironmentalCache {
  constructor() {
    this.dangerCache = new Map();
    this.modifierCache = new Map();
    this.capacityCache = new Map();
  }

  getDanger(nodeId, environment) {
    const key = this._generateEnvironmentKey(nodeId, environment);
    if (!this.dangerCache.has(key)) {
      const danger = EnvironmentalCalculationService.calculateDanger({ environment });
      this.dangerCache.set(key, danger);
    }
    return this.dangerCache.get(key);
  }

  invalidateNode(nodeId) {
    // Remove all cached values for a specific node
    for (const key of this.dangerCache.keys()) {
      if (key.startsWith(nodeId)) {
        this.dangerCache.delete(key);
        this.modifierCache.delete(key);
        this.capacityCache.delete(key);
      }
    }
  }

  _generateEnvironmentKey(nodeId, environment) {
    return `${nodeId}_${JSON.stringify(environment)}`;
  }
}
```

### Memory Management

- **Lazy Loading**: Environmental calculations only performed when needed
- **Caching Strategy**: Cache frequently accessed environmental data
- **Batch Processing**: Process multiple environmental updates together
- **Cleanup**: Regular cleanup of unused environmental cache entries

## Integration Points

### Simulation Service Integration

```javascript
// Enhanced turn processing with environmental effects
class SimulationService {
  processTurn() {
    const characters = this.getActiveCharacters();
    
    characters.forEach(character => {
      const currentNode = this.getNodeById(character.currentNodeId);
      
      // Apply environmental effects
      this._applyEnvironmentalEffects(character, currentNode);
      
      // Get available interactions with environmental modifiers
      const interactions = this._getEnvironmentallyModifiedInteractions(
        character, currentNode);
      
      // Process character actions
      this._processCharacterActions(character, interactions);
    });
    
    // Update environmental states
    this._updateEnvironmentalStates();
  }

  _applyEnvironmentalEffects(character, node) {
    const danger = node.getEnvironmentalDanger();
    const modifiers = node.getEnvironmentalModifiers('general');
    
    // Apply danger effects
    if (danger > 0.5 && Math.random() < danger * 0.1) {
      this._applyEnvironmentalDamage(character, node);
    }
    
    // Apply environmental modifiers to character state
    this._applyEnvironmentalModifiers(character, modifiers);
  }
}
```

### Template System Integration

The enhanced Node entity integrates seamlessly with the existing template system:

```javascript
// Enhanced template instantiation with environmental data
class TemplateService {
  instantiateNodeTemplate(template, customizations = {}) {
    const nodeData = {
      ...template.data,
      ...customizations,
      id: this._generateId(),
      name: customizations.name || `${template.name} Instance`
    };

    // Apply environmental preset if specified
    if (template.environmentalPreset) {
      const presetData = EnvironmentalPresetService.applyPreset(
        nodeData, template.environmentalPreset);
      Object.assign(nodeData, presetData);
    }

    // Validate environmental data
    const validation = EnvironmentalValidator.validateEnvironment(
      nodeData.environment);
    if (!validation.isValid) {
      throw new Error(`Invalid environmental data: ${validation.errors.join(', ')}`);
    }

    return new Node(nodeData);
  }
}
```

## Migration Strategy

### Backward Compatibility Implementation

```javascript
class NodeMigrationService {
  static migrateExistingNode(oldNodeData) {
    // Preserve all existing properties
    const migratedData = { ...oldNodeData };
    
    // Add default environmental properties if missing
    if (!migratedData.environment || typeof migratedData.environment.density === 'undefined') {
      migratedData.environment = {
        ...migratedData.environment,
        density: 0.5,
        terrain: TerrainTypes.PLAINS,
        climate: ClimateTypes.TEMPERATE,
        lighting: LightingTypes.NORMAL,
        hazards: [],
        shelterQuality: 0.5,
        airQuality: 0.8,
        waterAvailability: 0.7,
        temperature: 15,
        humidity: 0.5,
        windStrength: 0.3
      };
    }
    
    // Convert old connectedNodes to new connections format
    if (migratedData.connectedNodes && !migratedData.connections) {
      migratedData.connections = migratedData.connectedNodes.map(nodeId => ({
        targetNodeId: nodeId,
        type: ConnectionTypes.ROAD,
        difficulty: 1,
        distance: 1,
        bidirectional: true,
        conditions: [],
        modifiers: {}
      }));
    }
    
    // Set default size if missing
    if (!migratedData.size) {
      migratedData.size = 100;
    }
    
    return migratedData;
  }

  static migrateWorld(worldData) {
    if (worldData.nodes) {
      worldData.nodes = worldData.nodes.map(node => 
        this.migrateExistingNode(node));
    }
    
    return worldData;
  }
}
```

## User Experience Enhancements

### Environmental Preset UI Integration

The NodeEditor component will be enhanced to support environmental presets:

```javascript
// Addition to NodeEditor component
const EnvironmentalPresetSelector = ({ onPresetSelect, currentEnvironment }) => {
  const presets = EnvironmentalPresetService.getPresets();
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-white">Environmental Presets</h4>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(presets).map(([id, preset]) => (
          <button
            key={id}
            onClick={() => onPresetSelect(id)}
            className="p-3 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 text-left"
          >
            <div className="font-medium text-white">{preset.name}</div>
            <div className="text-sm text-gray-400">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

## Conclusion

The Node Environmental Enhancements design provides a comprehensive extension to the existing Node entity while maintaining the system's core principles of clean architecture, mapless design, and backward compatibility. The enhancement introduces sophisticated environmental modeling that enriches the simulation experience through:

1. **Rich Environmental Context**: Detailed environmental properties that influence character behavior and interaction outcomes
2. **Flexible Connection System**: Abstract relationships between nodes that support complex world topologies
3. **Automated Calculations**: Environmental danger and modifier calculations that provide dynamic simulation effects
4. **Template Integration**: Seamless integration with the existing template system for rapid world building
5. **Performance Optimization**: Caching and optimization strategies for large-scale simulations
6. **Backward Compatibility**: Full support for existing worlds and templates without breaking changes

The design maintains the system's mapless philosophy by treating environmental properties as contextual modifiers rather than spatial constraints, ensuring that the enhanced system continues to support the creative freedom that defines the World History Simulation Engine.