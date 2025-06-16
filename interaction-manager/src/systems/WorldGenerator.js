import { World } from '../types/simulation/World';
import { SimulationCharacter } from '../types/simulation/SimulationCharacter';
import { Settlement } from '../types/simulation/Settlement';
import { CharacterTemplate } from '../types/templates/CharacterTemplate';
import { NodeTemplate } from '../types/templates/NodeTemplate';
import { GroupTemplate } from '../types/templates/GroupTemplate';

class WorldGenerator {
  constructor() {
    this.templates = {
      characters: new Map(),
      nodes: new Map(),
      groups: new Map()
    };
  }

  // Template Management
  registerTemplate(type, template) {
    switch (type) {
      case 'character':
        this.templates.characters.set(template.id, template);
        break;
      case 'node':
        this.templates.nodes.set(template.id, template);
        break;
      case 'group':
        this.templates.groups.set(template.id, template);
        break;
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }

  // World Generation
  generateWorld(config) {
    const world = new World({
      id: this.generateId(),
      name: config.name || 'Generated World',
      description: config.description || 'A procedurally generated world',
      size: config.size || { width: 100, height: 100, units: 'km' },
      currentTime: 0,
      timeScale: 1
    });

    // Generate world features
    this.generateNodes(world, config);
    this.generateSettlements(world, config);
    this.generateCharacters(world, config);
    this.generateResources(world, config);
    this.generateEnvironment(world, config);

    return world;
  }

  // Node Generation
  generateNodes(world, config) {
    const nodeCount = config.nodeCount || 100;
    const nodeTypes = this.getNodeTypes(config);

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = this.selectNodeType(nodeTypes);
      const position = this.generateNodePosition(world.size);
      const properties = this.generateNodeProperties(nodeType);

      world.nodes.push({
        id: this.generateId(),
        type: nodeType,
        position,
        properties
      });
    }

    // Generate connections between nodes
    this.generateNodeConnections(world);
  }

  generateNodePosition(size) {
    return {
      x: Math.random() * size.width,
      y: Math.random() * size.height
    };
  }

  generateNodeProperties(nodeType) {
    const template = this.templates.nodes.get(nodeType);
    if (!template) {
      return {};
    }

    return {
      features: this.generateFeatures(template.baseFeatures),
      resources: this.generateResources(template.resourcePotential),
      environment: this.generateEnvironment(template.environmentalConditions)
    };
  }

  generateNodeConnections(world) {
    const maxConnections = 3;
    for (const node of world.nodes) {
      const connectionCount = Math.floor(Math.random() * maxConnections) + 1;
      const potentialConnections = world.nodes.filter(n => n.id !== node.id);
      
      for (let i = 0; i < connectionCount; i++) {
        if (potentialConnections.length === 0) break;
        
        const targetIndex = Math.floor(Math.random() * potentialConnections.length);
        const target = potentialConnections[targetIndex];
        
        world.connections.push({
          id: this.generateId(),
          type: 'path',
          source: node.id,
          target: target.id,
          properties: this.generateConnectionProperties(node, target)
        });

        potentialConnections.splice(targetIndex, 1);
      }
    }
  }

  // Settlement Generation
  generateSettlements(world, config) {
    const settlementCount = config.settlementCount || 10;
    const settlementTypes = this.getSettlementTypes(config);

    for (let i = 0; i < settlementCount; i++) {
      const settlementType = this.selectSettlementType(settlementTypes);
      const position = this.generateSettlementPosition(world);
      const properties = this.generateSettlementProperties(settlementType);

      world.settlements.push({
        id: this.generateId(),
        type: settlementType,
        position,
        properties
      });
    }
  }

  generateSettlementPosition(world) {
    // Prefer positions near nodes
    const node = world.nodes[Math.floor(Math.random() * world.nodes.length)];
    const radius = 5;
    
    return {
      x: node.position.x + (Math.random() * 2 - 1) * radius,
      y: node.position.y + (Math.random() * 2 - 1) * radius
    };
  }

  generateSettlementProperties(settlementType) {
    const template = this.templates.groups.get(settlementType);
    if (!template) {
      return {};
    }

    return {
      population: this.generatePopulation(template.population),
      resources: this.generateResources(template.resources),
      government: this.generateGovernment(template.structure),
      economy: this.generateEconomy(template)
    };
  }

  // Character Generation
  generateCharacters(world, config) {
    const characterCount = config.characterCount || 100;
    const characterTypes = this.getCharacterTypes(config);

    for (let i = 0; i < characterCount; i++) {
      const characterType = this.selectCharacterType(characterTypes);
      const position = this.generateCharacterPosition(world);
      const properties = this.generateCharacterProperties(characterType);

      world.characters.push({
        id: this.generateId(),
        type: characterType,
        position,
        properties
      });
    }
  }

  generateCharacterPosition(world) {
    // Prefer positions in settlements
    const settlement = world.settlements[Math.floor(Math.random() * world.settlements.length)];
    
    return {
      x: settlement.position.x + (Math.random() * 2 - 1) * 2,
      y: settlement.position.y + (Math.random() * 2 - 1) * 2
    };
  }

  generateCharacterProperties(characterType) {
    const template = this.templates.characters.get(characterType);
    if (!template) {
      return {};
    }

    return {
      attributes: this.generateAttributes(template.attributes),
      skills: this.generateSkills(template.skills),
      personality: this.generatePersonality(template.baseTraits),
      goals: this.generateGoals(template.goals)
    };
  }

  // Resource Generation
  generateResources(world, config) {
    const resourceTypes = config.resourceTypes || ['food', 'wood', 'stone', 'metal'];
    const distribution = {};

    for (const type of resourceTypes) {
      distribution[type] = {
        amount: Math.random() * 1000,
        regeneration: Math.random() * 10,
        consumption: Math.random() * 5
      };
    }

    world.resources = {
      types: resourceTypes,
      distribution,
      regeneration: {},
      consumption: {}
    };
  }

  // Environment Generation
  generateEnvironment(world, config) {
    const regionCount = config.regionCount || 5;
    const climateZoneCount = config.climateZoneCount || 3;

    world.environment = {
      regions: this.generateRegions(regionCount, world.size),
      climate: {
        zones: this.generateClimateZones(climateZoneCount, world.size),
        seasonalChanges: this.generateSeasonalChanges()
      },
      features: this.generateEnvironmentalFeatures(world)
    };
  }

  // Utility Methods
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getNodeTypes(config) {
    return config.nodeTypes || ['forest', 'mountain', 'plains', 'river', 'lake'];
  }

  getSettlementTypes(config) {
    return config.settlementTypes || ['village', 'town', 'city', 'kingdom'];
  }

  getCharacterTypes(config) {
    return config.characterTypes || ['warrior', 'merchant', 'artisan', 'noble'];
  }

  selectNodeType(types) {
    return types[Math.floor(Math.random() * types.length)];
  }

  selectSettlementType(types) {
    return types[Math.floor(Math.random() * types.length)];
  }

  selectCharacterType(types) {
    return types[Math.floor(Math.random() * types.length)];
  }

  generateFeatures(features) {
    return features.map(feature => ({
      ...feature,
      active: Math.random() > 0.5
    }));
  }

  generatePopulation(populationConfig) {
    return {
      total: Math.floor(Math.random() * populationConfig.maxSize) + populationConfig.minSize,
      composition: this.generatePopulationComposition(populationConfig.composition)
    };
  }

  generatePopulationComposition(composition) {
    const result = {};
    for (const type of composition.types) {
      result[type] = Math.floor(Math.random() * 100);
    }
    return result;
  }

  generateGovernment(structure) {
    return {
      type: structure.hierarchy[0].name,
      leader: this.generateId(),
      positions: this.generatePositions(structure)
    };
  }

  generatePositions(structure) {
    const positions = [];
    for (const level of structure.hierarchy) {
      for (let i = 0; i < level.maxCount; i++) {
        positions.push({
          title: level.name,
          holder: this.generateId(),
          responsibilities: {},
          authority: {}
        });
      }
    }
    return positions;
  }

  generateEconomy(template) {
    return {
      currency: { gold: 1000 },
      trade: [],
      markets: this.generateMarkets(template),
      taxes: {},
      income: {},
      expenses: {}
    };
  }

  generateMarkets(template) {
    const markets = [];
    const marketTypes = ['general', 'food', 'crafts', 'luxury'];
    
    for (const type of marketTypes) {
      markets.push({
        type,
        location: this.generateId(),
        goods: this.generateGoods(type)
      });
    }
    
    return markets;
  }

  generateGoods(marketType) {
    const goods = [];
    const goodTypes = {
      general: ['tools', 'clothing', 'supplies'],
      food: ['grain', 'meat', 'vegetables'],
      crafts: ['pottery', 'textiles', 'furniture'],
      luxury: ['jewelry', 'art', 'spices']
    };

    for (const type of goodTypes[marketType]) {
      goods.push({
        type,
        price: Math.random() * 100,
        supply: Math.random() * 100,
        demand: Math.random() * 100
      });
    }

    return goods;
  }

  generateAttributes(attributeConfig) {
    const attributes = {};
    for (const [key, value] of Object.entries(attributeConfig.distribution)) {
      attributes[key] = Math.floor(Math.random() * (value.maxScore - value.minScore + 1)) + value.minScore;
    }
    return attributes;
  }

  generateSkills(skillConfig) {
    const skills = {};
    for (const [key, value] of Object.entries(skillConfig.distribution)) {
      skills[key] = Math.floor(Math.random() * 5);
    }
    return skills;
  }

  generatePersonality(traits) {
    const personality = {};
    for (const [key, value] of Object.entries(traits)) {
      personality[key] = Math.random() * 100;
    }
    return personality;
  }

  generateGoals(goalConfig) {
    const goals = [];
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      const type = goalConfig.types[Math.floor(Math.random() * goalConfig.types.length)];
      goals.push({
        id: this.generateId(),
        type,
        priority: Math.random() * 100,
        progress: 0,
        requirements: {},
        rewards: {},
        deadline: Date.now() + Math.random() * 1000000,
        status: 'active'
      });
    }
    
    return goals;
  }

  generateRegions(count, size) {
    const regions = [];
    for (let i = 0; i < count; i++) {
      regions.push({
        id: this.generateId(),
        type: ['forest', 'mountain', 'plains', 'desert', 'swamp'][Math.floor(Math.random() * 5)],
        boundaries: {
          x: Math.random() * size.width,
          y: Math.random() * size.height,
          width: Math.random() * (size.width / 2),
          height: Math.random() * (size.height / 2)
        },
        properties: {}
      });
    }
    return regions;
  }

  generateClimateZones(count, size) {
    const zones = [];
    for (let i = 0; i < count; i++) {
      zones.push({
        id: this.generateId(),
        type: ['temperate', 'tropical', 'arctic'][Math.floor(Math.random() * 3)],
        boundaries: {
          x: Math.random() * size.width,
          y: Math.random() * size.height,
          width: Math.random() * (size.width / 2),
          height: Math.random() * (size.height / 2)
        },
        properties: {}
      });
    }
    return zones;
  }

  generateSeasonalChanges() {
    return {
      spring: { temperature: 15, precipitation: 0.6 },
      summer: { temperature: 25, precipitation: 0.4 },
      autumn: { temperature: 15, precipitation: 0.5 },
      winter: { temperature: 5, precipitation: 0.3 }
    };
  }

  generateEnvironmentalFeatures(world) {
    const features = [];
    const featureCount = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i < featureCount; i++) {
      features.push({
        id: this.generateId(),
        type: ['tree', 'rock', 'cave', 'spring'][Math.floor(Math.random() * 4)],
        position: {
          x: Math.random() * world.size.width,
          y: Math.random() * world.size.height
        },
        properties: {}
      });
    }
    
    return features;
  }
}

export default WorldGenerator; 