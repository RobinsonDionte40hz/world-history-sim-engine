# Valley of Echoes Demo Configuration

This directory contains configuration files and data for the Valley of Echoes two-settlement demo, showcasing the LOD (Level of Detail) system and multi-settlement interactions.

## Directory Structure

```
valley-of-echoes-demo/
├── README.md                    # This file
├── demo-script.js              # Main demo orchestration script
├── oakwood-federation/         # Oakwood Federation settlement config
│   ├── settlement.json         # Settlement definition
│   ├── characters/             # Character configurations
│   ├── population-groups/      # Population group definitions
│   └── development-plans/      # Settlement development plans
├── ironhold-dominion/          # Ironhold Dominion settlement config
│   ├── settlement.json         # Settlement definition
│   ├── characters/             # Character configurations
│   ├── population-groups/      # Population group definitions
│   └── development-plans/      # Settlement development plans
├── quests/                     # Multi-settlement quest definitions
│   ├── diplomatic-quests/      # Inter-settlement diplomacy quests
│   ├── trade-quests/          # Cross-settlement trade quests
│   ├── conflict-quests/       # Inter-settlement conflict quests
│   └── alliance-quests/       # Multi-settlement alliance quests
└── shared/                     # Shared configuration resources
    ├── cultural-patterns.json  # Common cultural elements
    ├── trade-goods.json       # Tradeable commodities
    └── relationship-templates/ # Cross-settlement relationship templates
```

## Demo Overview

The Valley of Echoes demo features two contrasting settlements:

### Oakwood Federation
- **Type**: Democratic village federation
- **Governance**: Council-based decision making
- **Culture**: Agricultural, community-focused
- **Population**: ~150 NPCs (12 heroes, 18 groups, 120 background)
- **Key Features**: Citizen participation, sustainable development

### Ironhold Dominion
- **Type**: Authoritarian fortress dominion
- **Governance**: Hierarchical military structure
- **Culture**: Martial, discipline-focused
- **Population**: ~120 NPCs (8 heroes, 15 groups, 97 background)
- **Key Features**: Military efficiency, resource control

## LOD System Demonstration

The demo showcases three LOD tiers:

### Hero NPCs (20 total)
- Full consciousness simulation
- Individual decision-making
- Quest involvement and player interactions
- Complete character development

### Population Groups (33 total)
- Statistical processing of group behaviors
- Aggregate morale, productivity, and needs
- Representative sampling for interactions
- Group-level event processing

### Background Demographics (217 total)
- Pure numerical tracking
- Settlement-level effects only
- No individual character instances
- Efficient batch processing

## Multi-Settlement Features

### Cross-Settlement Relations
- Diplomatic standing tracking (-100 to +100)
- Trade volume and economic dependencies
- Cultural exchange and language barriers
- Military tension and alliance states

### Inter-Settlement Quests
- Multi-settlement quest chains
- Cross-border consequences
- Diplomatic incident resolution
- Alliance formation mechanics

### Development Interactions
- Competitive resource acquisition
- Cooperative development projects
- Territorial disputes and resolutions
- Cultural influence and migration

## Performance Targets

The demo validates LOD system performance:
- **Turn Processing**: <2 seconds for 300+ NPCs
- **Memory Usage**: <50MB peak during processing
- **Scalability**: Linear performance scaling
- **Responsiveness**: No UI blocking during turns

## Running the Demo

```bash
# From the sim-engine directory
node examples/valley-of-echoes-demo/demo-script.js

# Or run specific phases
node examples/valley-of-echoes-demo/demo-script.js --phase=setup
node examples/valley-of-echoes-demo/demo-script.js --phase=turns
node examples/valley-of-echoes-demo/demo-script.js --phase=analysis
```

## Configuration Files

### Settlement Configuration
Each settlement has a `settlement.json` with:
- Basic settlement properties (name, type, founding date)
- Governance configuration
- Initial resource levels
- Development tree progress
- Cultural and alignment settings

### Character Configuration
Hero NPCs have individual JSON files with:
- Complete character attributes and consciousness
- Personality profiles and motivations
- Assignment patterns and relationships
- Quest and interaction history

### Population Groups
Group configurations include:
- Demographic statistics and trends
- Behavioral patterns and tendencies
- Economic and social characteristics
- Representative character templates

## Validation and Testing

The demo includes comprehensive validation:
- **Pattern Compliance**: Ensures demo follows established patterns
- **Performance Benchmarks**: Validates LOD system efficiency
- **Integration Testing**: Confirms multi-settlement interactions
- **Data Consistency**: Validates all configuration relationships

## Quickstart Guide

1. **Setup Phase**: Initialize settlements and characters
2. **Turn Processing**: Run 25-turn simulation
3. **Analysis Phase**: Review LOD system performance
4. **Validation Phase**: Confirm all requirements met

See `../specs/001-valley-of-echoes-demo/quickstart.md` for detailed instructions.

## Development Notes

- All configurations follow established demo patterns
- Bidirectional assignment patterns maintained
- Property naming conventions strictly followed
- Performance optimizations included throughout
- Clean architecture principles preserved