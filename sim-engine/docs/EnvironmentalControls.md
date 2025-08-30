# Environmental Controls in NodeEditor

This document describes the environmental controls feature added to the NodeEditor component, which allows users to configure detailed environmental properties for world nodes using presets or manual controls.

## Overview

The NodeEditor component has been enhanced with a dedicated "Environment" tab that provides:

1. **Environmental Preset Selector** - Quick configuration using predefined environmental themes
2. **Manual Environmental Controls** - Fine-tuned control over individual environmental properties
3. **Real-time Preview** - Immediate feedback on environmental status and comfort levels

## Features

### Environmental Preset Selector

The environmental preset selector component provides:

- **Preset Categories**: Settlement, wilderness, dungeon, and landmark presets
- **Search and Filtering**: Find presets by name, terrain, climate, or hazard type
- **Recommendations**: Smart recommendations based on current node properties
- **Preview Mode**: Preview preset effects before applying them
- **Detailed Information**: Expandable cards showing full environmental statistics

#### Available Presets

- **Forest Village**: Peaceful woodland settlement with clean air and water
- **Mountain Fortress**: High-altitude fortified position with challenging conditions
- **Desert Oasis**: Life-giving oasis in harsh desert environment
- **Haunted Ruins**: Supernatural dangers and structural instability
- **Swamp Settlement**: Hardy community in dangerous marshlands
- **Arctic Outpost**: Remote outpost in frozen wasteland
- **Coastal Port**: Bustling port town with maritime climate
- **Underground City**: Subterranean metropolis with unique challenges
- **Toxic Wasteland**: Poisoned landscape with extreme hazards
- **Magical Grove**: Enchanted forest with magical properties

### Manual Environmental Controls

The manual controls allow precise configuration of:

#### Terrain and Climate
- **Terrain Type**: Plains, forest, mountains, desert, swamp, urban, ruins, underground, coastal, tundra
- **Climate Type**: Arctic, temperate, tropical, arid, subtropical, continental
- **Lighting Conditions**: Bright, normal, dim, dark, magical

#### Environmental Properties (0-100% ranges)
- **Density**: Population/object density affecting movement and interactions
- **Shelter Quality**: Quality of available protection from elements
- **Air Quality**: Breathability and pollution levels
- **Water Availability**: Access to clean water sources
- **Humidity**: Moisture content in the air
- **Wind Strength**: Wind intensity affecting visibility and movement

#### Temperature and Size
- **Temperature**: Celsius range from -30°C to 50°C
- **Node Size**: Physical size affecting population capacity and interactions

## Usage Guide

### Using Environmental Presets

1. Navigate to the "Environment" tab in the NodeEditor
2. Browse available presets in the Environmental Preset Selector
3. Use search to find specific themes (e.g., "forest", "cold", "dangerous")
4. Filter by category to narrow down options
5. Click "Preview" to see how a preset will affect your node
6. Click on a preset card to apply it to your node
7. Fine-tune individual properties using manual controls if needed

### Manual Configuration

1. Go to the "Environment" tab
2. Scroll down to "Manual Environmental Configuration"
3. Select terrain type, climate, and lighting from dropdowns
4. Adjust environmental properties using sliders
5. Set temperature using the temperature slider
6. Configure node size as needed
7. Use the preview panel to see real-time environmental status

### Understanding Environmental Status

The preview panel shows several important indicators:

- **Hospitable/Inhospitable**: Whether the environment supports basic life
- **Safe/Dangerous**: Overall danger level from hazards and conditions
- **Comfort Level**: Percentage indicating how comfortable the environment is
- **Hazard Count**: Number of active environmental hazards

## Integration with Game Systems

The environmental controls integrate with several game systems:

### Character Interactions
- Environmental modifiers affect character actions and dialogue options
- Comfort levels influence character mood and decision-making
- Hazards can cause damage or status effects during interactions

### Movement and Travel
- Terrain affects movement speed between nodes
- Environmental conditions impact travel time and difficulty
- Weather and lighting influence visibility and navigation

### Settlement Development
- Environmental factors affect population growth and capacity
- Resource availability influences economic development
- Climate determines agricultural potential

## Technical Implementation

### Components
- `EnvironmentalPresetSelector`: Main preset selection interface
- Enhanced `NodeEditor`: Integrated environmental controls tab
- `Environment` value object: Immutable environmental data structure

### Services
- `EnvironmentalPresetService`: Manages preset definitions and application
- `EnvironmentalCalculationService`: Calculates environmental effects
- `EnvironmentalValidator`: Validates environmental configurations

### Data Structure

Environmental data is stored as an `Environment` value object with:

```javascript
{
  terrain: "forest",           // Terrain type constant
  climate: "temperate",        // Climate type constant  
  lighting: "normal",          // Lighting type constant
  density: 0.6,               // 0.0 to 1.0
  shelterQuality: 0.7,        // 0.0 to 1.0
  airQuality: 0.9,            // 0.0 to 1.0
  waterAvailability: 0.8,     // 0.0 to 1.0
  temperature: 15,            // Celsius
  humidity: 0.6,              // 0.0 to 1.0
  windStrength: 0.2,          // 0.0 to 1.0
  hazards: []                 // Array of EnvironmentalHazard objects
}
```

## Best Practices

### For Content Creators
1. **Start with Presets**: Use presets as a foundation, then customize
2. **Consider Narrative**: Align environmental properties with story themes
3. **Balance Challenge**: Mix hospitable and challenging environments
4. **Use Hazards Sparingly**: Environmental hazards should enhance, not dominate

### For Developers
1. **Validate Input**: Always validate environmental data before applying
2. **Handle Backwards Compatibility**: Ensure old nodes work with new system
3. **Performance**: Cache environmental calculations for frequently accessed nodes
4. **Testing**: Test environmental effects across different character types

## Troubleshooting

### Common Issues

**Preset Not Applying**
- Check that node data structure is compatible
- Verify all required environmental properties are present
- Look for validation errors in console

**Environmental Status Incorrect**
- Verify environmental calculations are up-to-date
- Check that Environment value object is properly constructed
- Ensure hazards are correctly formatted

**Performance Issues**
- Use environmental caching for large numbers of nodes
- Avoid recalculating environmental effects on every render
- Optimize environmental validation for bulk operations

## Future Enhancements

Planned improvements include:

1. **Custom Hazard Editor**: Create and edit environmental hazards
2. **Weather Systems**: Dynamic environmental changes over time
3. **Seasonal Variations**: Climate changes affecting environmental properties
4. **Environmental Events**: Random environmental effects during gameplay
5. **Preset Sharing**: Import/export custom environmental presets
6. **Visual Indicators**: Graphical representation of environmental conditions

## API Reference

### EnvironmentalPresetSelector Props

```javascript
{
  currentNodeData: Object,        // Current node for recommendations
  onPresetSelect: Function,       // Called when preset is selected
  onPresetPreview: Function,      // Called when preset is previewed
  selectedPresetId: String,       // Currently selected preset ID
  showRecommendations: Boolean,   // Show recommendation section
  className: String               // Additional CSS classes
}
```

### Environment Methods

```javascript
// Query methods
environment.isHospitable()          // Boolean
environment.isDangerous()           // Boolean
environment.getComfortLevel()       // Number (0-1)
environment.hasHazardType(type)     // Boolean

// Modifier methods
environment.getVisibilityModifier() // Number
environment.getMovementModifier()   // Number
environment.supportsActivity(type)  // Boolean

// Serialization
environment.toJSON()                // Object
Environment.fromJSON(data)          // Environment
```

For more detailed API documentation, see the individual component and service files.
