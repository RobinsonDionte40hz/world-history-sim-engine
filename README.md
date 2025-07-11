# World History Simulation Engine

A sophisticated React-based simulation engine for generating dynamic historical worlds with complex character interactions, civilizations, and emergent storytelling.

## 🚀 Quick Start

### Installation & Launch
```bash
# Clone/download the project
cd world-history-sim-engine/sim-engine

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

### Your First Simulation
1. Click **"Generate World"** to create a new historical world
2. View the **"History Timeline"** to see generated events
3. Examine **"Characters"** to see NPCs with personalities and relationships
4. Use **"Simulation Control"** to advance time and watch history unfold

## 📋 What This Engine Can Do

### Core Features
- **Dynamic World Generation** - Create living, breathing historical worlds
- **Complex Character Systems** - NPCs with consciousness, personalities, and racial traits
- **Historical Event Generation** - Emergent storytelling through procedural events
- **Settlement Evolution** - Cities and towns that grow and change over time
- **Quantum Simulation** - Advanced probability systems for realistic outcomes
- **Memory & Influence Systems** - Characters remember interactions and build relationships
- **Template-Based Content** - Flexible system for creating custom content

### Perfect For
- **Game Developers** - Procedural world generation and dynamic storytelling
- **Writers & Worldbuilders** - Historical fiction and fantasy world creation
- **Educators** - Historical simulation and interactive learning
- **Researchers** - Social dynamics and civilization modeling

## 🎯 System Architecture

### Clean Architecture Design
The simulation engine follows clean architecture principles:

```
src/
├── application/         # Use cases and business logic
│   ├── use-cases/      # Application-specific business rules
│   └── ports/          # Interface definitions
├── domain/             # Core business entities and rules
│   ├── entities/       # Core domain objects
│   ├── events/         # Domain events
│   ├── services/       # Domain services
│   └── value-objects/  # Immutable value objects
├── infrastructure/     # External services and persistence
│   ├── external/       # External API integrations
│   └── persistence/    # Data storage implementations
├── presentation/       # UI components and user interactions
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific components
│   └── hooks/          # Custom React hooks
└── shared/            # Shared utilities and constants
    ├── constants/      # Application constants
    ├── types/          # TypeScript type definitions
    └── utils/          # Utility functions
```

### Key Systems

#### Character System
- **Consciousness System** - Simulates awareness and decision-making
- **Personality System** - Traits that influence behavior
- **Race System** - Different species with unique characteristics
- **Memory Service** - Characters remember interactions and events

#### World Generation
- **Settlement Evolution** - Cities grow and change over time
- **Historical Event Generation** - Emergent storytelling through events
- **Quantum Simulation** - Probabilistic outcomes for realism
- **Template System** - Flexible content creation

#### Interaction Systems
- **Influence Tracking** - Characters build relationships
- **Prestige System** - Social standing and reputation
- **Alignment System** - Moral and ethical positioning
- **Prerequisite System** - Conditional content and events
3. Add options that lead back to other interactions or end the conversation

### Step 4: Link Everything Together (3 minutes)

1. **Edit your first interaction** ("Meeting the Merchant")
2. **Set "Next Interaction ID"** for each option:
   - `buy_supplies` → Select "Buying Supplies"
   - `browse_shop` → Select "Browsing the Shop"
3. **Save**
## 🚀 Getting Started

### Quick Start Guide

1. **Initialize World Generation**
   ```javascript
   const worldGenerator = new GenerateWorld();
   const world = await worldGenerator.execute();
   ```

2. **Create Characters**
   ```javascript
   const characterService = new GenerateBehavior();
   const characters = await characterService.generateFor(world);
   ```

3. **Run Historical Simulation**
   ```javascript
   const simulator = new RunTick();
   const timeline = await simulator.execute(world, characters);
   ```

### Project Structure

```
sim-engine/
├── src/
│   ├── application/         # Use cases and business logic
│   │   ├── use-cases/      # Core application operations
│   │   └── services/       # Application services
│   ├── domain/             # Core business entities
│   │   ├── entities/       # Domain objects
│   │   ├── events/         # Domain events
│   │   └── services/       # Domain services
│   ├── infrastructure/     # External integrations
│   │   ├── external/       # External services
│   │   └── persistence/    # Data storage
│   ├── presentation/       # React UI components
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature components
│   │   └── hooks/          # Custom hooks
│   └── shared/            # Shared utilities
│       ├── constants/      # Application constants
│       ├── types/          # TypeScript definitions
│       └── utils/          # Utility functions
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🎮 Features

### World Generation
- **Procedural Settlements** - Dynamically generated cities and towns
- **Geographical Features** - Mountains, rivers, forests, and more
- **Resource Distribution** - Strategic placement of valuable resources
- **Climate Systems** - Weather patterns affecting civilization

### Character Systems
- **Personality Traits** - Big Five personality model implementation
- **Consciousness Levels** - Varying degrees of self-awareness
- **Racial Diversity** - Multiple species with unique characteristics
- **Social Hierarchies** - Complex relationship networks

### Historical Simulation
- **Event Generation** - Emergent historical events
- **Cause and Effect** - Actions have lasting consequences
- **Cultural Evolution** - Societies change over time
- **Technological Progress** - Innovation and discovery systems

## 🔧 Configuration

### Environment Setup
```bash
# Install dependencies
npm install

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Customization Options
- **World Size** - Adjust simulation scale
- **Time Progression** - Control simulation speed
- **Character Density** - Population parameters
- **Event Frequency** - Historical event rates

## 📊 Data Models

### Character Entity
```javascript
{
  id: string,
  name: string,
  race: RaceType,
  personality: PersonalityTraits,
  consciousness: ConsciousnessLevel,
  attributes: AttributeSet,
  relationships: RelationshipMap,
  history: HistoricalRecord[]
}
```

### Settlement Entity
```javascript
{
  id: string,
  name: string,
  position: Coordinates,
  population: number,
  resources: ResourceMap,
  culture: CulturalTraits,
  government: GovernmentType,
  history: HistoricalRecord[]
}
```

### Historical Event
```javascript
{
  id: string,
  timestamp: number,
  type: EventType,
  participants: CharacterReference[],
  location: SettlementReference,
  description: string,
  consequences: Effect[]
}
```

## 🧪 Testing

### Integration Tests
```bash
# Run simulation integration tests
npm test -- --testPathPattern=simulation-integration-test
```

### Unit Tests
```bash
# Run all unit tests
npm test

# Run specific test suites
npm test -- --testPathPattern=domain/entities
npm test -- --testPathPattern=application/use-cases
```

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS for styling:
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Automatic theme switching
- **Custom Components** - Reusable UI elements
- **Utility Classes** - Rapid development

### Custom Themes
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'sim-primary': '#3B82F6',
        'sim-secondary': '#10B981',
        'sim-accent': '#F59E0B'
      }
    }
  }
}
```

## 🔍 API Reference

### Core Services

#### WorldGenerator
```javascript
class GenerateWorld {
  async execute(parameters: WorldGenParams): Promise<World>
}
```

#### CharacterService  
```javascript
class GenerateBehavior {
  async generateFor(world: World): Promise<Character[]>
}
```

#### SimulationEngine
```javascript
class RunTick {
  async execute(world: World, characters: Character[]): Promise<Timeline>
}
```

## 📈 Performance

### Optimization Strategies
- **Lazy Loading** - Components load on demand
- **Memoization** - Cache expensive calculations
- **Virtual Scrolling** - Handle large datasets efficiently
- **Web Workers** - Background processing for simulations

### Performance Monitoring
```javascript
// Performance metrics
const metrics = {
  simulationSpeed: 'ticks per second',
  memoryUsage: 'MB allocated',
  renderTime: 'milliseconds'
};
```

## 🤝 Contributing

### Development Guidelines
1. **Follow Clean Architecture** - Maintain separation of concerns
2. **Write Tests** - Cover new functionality with tests
3. **Document Changes** - Update relevant documentation
4. **Code Style** - Follow ESLint and Prettier configurations

### Submitting Changes
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Ready to simulate history?** Start by generating your first world and watch civilizations emerge! �✨
