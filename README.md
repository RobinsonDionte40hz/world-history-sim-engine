# World History Simulation Engine

A sophisticated React-based simulation engine for generating dynamic historical worlds with complex character interactions, civilizations, and emergent storytelling.

## 🚀 Quick Start

```bash
# Navigate to the project directory
cd world-history-sim-engine/sim-engine

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open at `http://localhost:3000`

## 🎮 Getting Started with Your First World

### Free Building Approach
The World History Simulation Engine uses a **free building** system - you have complete creative freedom to build your world in any order you prefer. The only requirement is meeting the minimum criteria before starting the simulation.

### Minimum Requirements for Simulation
Before you can start the simulation, ensure your world has:
- ✅ **World Properties**: Name and description
- ✅ **At least one Node**: Abstract locations or contexts (no map coordinates)
- ✅ **At least one Character**: NPCs with consciousness and attributes
- ✅ **At least one Interaction**: Actions characters can perform
- ✅ **Character Assignments**: All nodes must have assigned characters
- ✅ **Interaction Assignments**: All characters must have assigned interactions

### Building Your World
1. **Start Anywhere**: Begin with any component - characters, nodes, or interactions
2. **Use Templates**: Save and reuse any component as a template for rapid building
3. **Free Form Creation**: No prescribed order or steps to follow
4. **Validation Feedback**: The system shows what's still needed before simulation
5. **Turn-Based Simulation**: Once requirements are met, advance time turn by turn

## 🌟 Core Features

### Turn-Based Simulation
- **Manual Time Control**: Advance world history one turn at a time
- **Event Resolution**: Each turn processes character actions and world events
- **Historical Recording**: Every turn generates permanent historical records
- **Analysis Tools**: Review and analyze historical patterns

### Mapless Design
- **Abstract Nodes**: Locations are conceptual contexts, not map positions
- **Relationship-Based**: Nodes connect through relationships, not geography
- **Flexible Connections**: Trade routes, political ties, cultural bonds
- **Context-Driven**: Environmental and cultural properties affect behavior

### Character Consciousness System
- **Quantum-Inspired Modeling**: Consciousness frequency and coherence mechanics
- **D&D Attributes**: Full STR, DEX, CON, INT, WIS, CHA implementation
- **Personality Traits**: Dynamic traits that evolve over time
- **Memory Service**: Characters remember interactions and form relationships
- **Goal-Driven Behavior**: Autonomous decision-making based on objectives

### Template System
- **Structural Templates**: Save characters, nodes, and interactions as reusable templates
- **Text Templating**: Dynamic content creation directly in editors with placeholders
- **Template Library**: Build collections of structural components for rapid building
- **Editor Integration**: Text templating built into InteractionEditor and EncounterEditor
- **Share and Import**: Exchange templates with other users

### Text Templating System
- **Dynamic Dialogue**: Create personalized conversations with `{{character.name}}` placeholders
- **Conditional Logic**: Use `{{#if character.reputation > 10}}` for context-aware content
- **Random Selection**: Add variety with `{{random:option1,option2,option3}}` patterns
- **Editor Integration**: Text templating built into InteractionEditor and EncounterEditor
- **Real-Time Preview**: See resolved content as you type
- **Contextual Suggestions**: Smart placeholder recommendations based on available data

### Historical Simulation
- **Emergent Events**: History unfolds from character interactions
- **Settlement Evolution**: Populations grow and change dynamically
- **Political Systems**: Wars, alliances, succession, and diplomacy
- **Economic Simulation**: Trade, resources, and wealth accumulation
- **Cultural Development**: Societies evolve distinct characteristics

## 🏗️ Architecture

### Clean Architecture Design
```
src/
├── domain/              # Core business logic
│   ├── entities/        # Character, Node, Interaction, etc.
│   ├── services/        # WorldBuilder, HistoryGenerator
│   └── value-objects/   # Attributes, Position, etc.
├── application/         # Use cases and services
│   ├── use-cases/       # Business operations
│   └── services/        # SimulationService, TemplateService
├── infrastructure/      # External interfaces
│   └── persistence/     # LocalStorage repositories
├── presentation/        # React UI
│   ├── components/      # UI components
│   ├── contexts/        # SimulationContext
│   ├── hooks/           # useWorldBuilder, useSimulation
│   └── pages/           # Application pages
└── shared/              # Shared utilities
```

### Key Technologies
- **React 18.2**: Modern UI framework
- **Redux Toolkit**: State management (prepared for future use)
- **LocalStorage**: Persistent data storage
- **Jest**: Testing framework
- **Tailwind CSS**: Styling with dark mode support

## 📚 Core Concepts

### Nodes (Mapless Locations)
Nodes represent abstract contexts rather than physical locations:
- **Types**: Settlement, wilderness, market, temple, etc.
- **Properties**: Environmental, cultural, resource availability
- **Connections**: Conceptual links (trade, political, cultural)
- **No Coordinates**: Position-independent design

### Characters (Capability-Driven NPCs)
Characters are defined by their capabilities and interactions:
- **Consciousness**: Frequency and coherence affecting decisions
- **Attributes**: D&D-style stats with modifiers
- **Personality**: Traits that influence behavior
- **Capabilities**: What they can DO (assigned interactions)
- **Memory**: Past interactions affect future behavior

### Interactions (Character Actions)
Define what characters can do in your world:
- **Types**: Dialogue, combat, trade, exploration, etc.
- **Requirements**: Prerequisites for availability
- **Effects**: Consequences on characters and world
- **Branching**: Multiple outcomes based on attributes

### Templates (Reusable Components)
The system supports two types of templates:

#### Structural Templates
- **World Templates**: Complete world configurations
- **Node Templates**: Location archetypes with environmental properties
- **Character Templates**: Character archetypes with attributes and consciousness
- **Interaction Templates**: Action patterns and frameworks
- **Composite Templates**: Combined structural elements

#### Text Templating
- **Dynamic Content**: Use placeholders like `{{character.name}}` for personalized text
- **Editor Integration**: Built directly into InteractionEditor and EncounterEditor
- **Contextual Suggestions**: Smart placeholder recommendations based on current context
- **Real-Time Preview**: See resolved text as you type
- **Dialogue Patterns**: Quick-insert common conversation templates

## 🎯 Use Cases

### Game Development
- Procedural world generation for RPGs
- Dynamic NPC behavior systems
- Emergent quest generation
- Living world backgrounds

### Creative Writing
- Generate historical backstories
- Create character relationship webs
- Develop cultural histories
- Plot generation assistance

### Education
- Historical simulation exercises
- Social dynamics modeling
- Cause-and-effect demonstrations
- Interactive history lessons

### Research
- Social system modeling
- Emergent behavior studies
- Network dynamics analysis
- Cultural evolution patterns

## 🛠️ Development

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=SimulationService
```

### Building for Production
```bash
# Create optimized build
npm run build

# Serve production build
npx serve -s build
```

### Project Structure
The codebase follows Domain-Driven Design principles with clear separation of concerns. Each layer has distinct responsibilities and dependencies flow inward toward the domain layer.

## 📖 Documentation

### User Guides
- **[Text Templating Guide](sim-engine/docs/TextTemplatingGuide.md)**: Complete guide to using dynamic text features
- **[Dialogue Patterns Reference](sim-engine/docs/DialoguePatternsReference.md)**: Common dialogue patterns and examples
- **[Text Templating Troubleshooting](sim-engine/docs/TextTemplatingTroubleshooting.md)**: Solutions for common issues
- **[Migration Guide](sim-engine/docs/TextTemplatingMigrationGuide.md)**: Transitioning from old template system
- **[Best Practices Guide](sim-engine/docs/TextTemplatingBestPractices.md)**: Effective text templating strategies

### API Reference
- `SimulationService`: Core simulation engine
- `WorldBuilder`: World construction service
- `TemplateManager`: Template management system (structural templates)
- `TextTemplateEngine`: Dynamic text resolution engine
- `HistoryGenerator`: Historical event generation

### Hooks
- `useSimulation`: Simulation state and controls
- `useWorldBuilder`: World building operations
- `useTemplates`: Structural template management
- `useTextTemplating`: Text templating functionality
- `useContextualSuggestions`: Smart placeholder suggestions

### Context
- `SimulationContext`: Global simulation state

## 🤝 Contributing

We welcome contributions! The architecture is designed for extensibility:

1. **Domain Layer**: Add new entities or value objects
2. **Application Layer**: Create new use cases
3. **Presentation Layer**: Build new UI components
4. **Templates**: Share your world templates

### Key Areas for Contribution
- Additional node types and properties
- New interaction patterns and dialogue templates
- Enhanced consciousness algorithms
- Text templating features and patterns
- Historical analysis tools
- UI/UX improvements

## 📄 License

This project is open source. See LICENSE file for details.

## 🙏 Acknowledgments

Built with modern web technologies and inspired by:
- Complex systems theory
- Emergent behavior research
- Narrative generation systems
- Historical simulation games

---

**Note**: This is a living project under active development. Features and APIs may evolve as we refine the simulation engine.