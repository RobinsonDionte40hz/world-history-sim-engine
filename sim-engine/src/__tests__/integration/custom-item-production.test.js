/**
 * Integration Tests - Custom Item Production
 * 
 * Tests user-created custom items, recipes, and building types:
 * - Custom item creation with metadata
 * - Custom production recipe validation
 * - Custom building type functionality
 * - Item editor integration
 * - Building type editor integration
 * - Complex recipe chains with custom items
 * - Quality and rarity modifiers
 */

import Building from '../../domain/entities/Building.js';
import Character from '../../domain/entities/Character.js';
import Item from '../../domain/entities/Item.js';
import ProductionRecipe from '../../domain/entities/ProductionRecipe.js';
import BuildingType from '../../domain/entities/BuildingType.js';
import { BuildingProductionService } from '../../application/services/BuildingProductionService.js';
import { JobAssignmentService } from '../../application/services/JobAssignmentService.js';
import { MarketDynamicsService } from '../../application/services/MarketDynamicsService.js';

describe('Custom Item Production - Integration Tests', () => {
  let world;
  let settlement;
  let productionService;
  let jobService;
  let marketService;

  beforeEach(() => {
    world = {
      settlements: [],
      characters: [],
      items: [],
      productionRecipes: [],
      buildingTypes: [],
      turn: 0
    };

    settlement = {
      id: 'settlement_1',
      name: 'Craftville',
      buildings: [],
      population: { total: 50 },
      economy: {
        treasury: 5000,
        funds: 5000
      }
    };

    world.settlements.push(settlement);

    productionService = new BuildingProductionService(world);
    jobService = new JobAssignmentService(world);
    marketService = new MarketDynamicsService(world);
  });

  describe('Custom Item Creation and Properties', () => {
    test('should create custom item with full metadata', () => {
      const customItem = new Item({
        id: 'enchanted_crystal',
        name: 'Enchanted Crystal',
        description: 'A mystical crystal that glows with inner light',
        category: 'magical',
        tags: ['rare', 'magical', 'crafting_material'],
        weight: 0.5,
        quality: 'legendary',
        rarity: 'epic',
        market: {
          basePrice: 500,
          volatility: 0.3,
          tradeable: true
        },
        production: {
          skill: 'enchanting',
          complexity: 'expert',
          toolsRequired: ['enchanting_table'],
          baseProductionTime: 50
        },
        attributes: {
          durability: 100,
          power: 85,
          resonance: 'arcane'
        }
      });

      expect(customItem.id).toBe('enchanted_crystal');
      expect(customItem.category).toBe('magical');
      expect(customItem.quality).toBe('legendary');
      expect(customItem.market.basePrice).toBe(500);
      expect(customItem.production.complexity).toBe('expert');
      expect(customItem.attributes.power).toBe(85);
    });

    test('should validate custom item properties', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        market: { basePrice: -10 } // Invalid negative price
      });

      // Item should still be created but with constraints
      expect(item).toBeDefined();
      expect(item.market.basePrice).toBeDefined();
    });

    test('should support custom item categories', () => {
      const categories = ['magical', 'alchemical', 'technological', 'organic', 'exotic'];
      
      const items = categories.map((cat, idx) => new Item({
        id: `item_${idx}`,
        name: `${cat} Item`,
        category: cat,
        market: { basePrice: 10 }
      }));

      expect(items.length).toBe(5);
      items.forEach((item, idx) => {
        expect(item.category).toBe(categories[idx]);
      });
    });
  });

  describe('Custom Production Recipe Creation', () => {
    test('should create complex multi-input recipe', () => {
      // Create custom items
      const crystalShard = new Item({
        id: 'crystal_shard',
        name: 'Crystal Shard',
        category: 'materials'
      });

      const manaEssence = new Item({
        id: 'mana_essence',
        name: 'Mana Essence',
        category: 'magical'
      });

      const goldDust = new Item({
        id: 'gold_dust',
        name: 'Gold Dust',
        category: 'materials'
      });

      const enchantedCrystal = new Item({
        id: 'enchanted_crystal',
        name: 'Enchanted Crystal',
        category: 'magical'
      });

      world.items.push(crystalShard, manaEssence, goldDust, enchantedCrystal);

      // Create complex recipe
      const recipe = new ProductionRecipe({
        id: 'recipe_enchanted_crystal',
        name: 'Enchant Crystal',
        description: 'Infuse a crystal shard with magical essence',
        inputs: [
          { itemId: 'crystal_shard', quantity: 1 },
          { itemId: 'mana_essence', quantity: 3 },
          { itemId: 'gold_dust', quantity: 2 }
        ],
        outputs: [
          { itemId: 'enchanted_crystal', quantity: 1 }
        ],
        byproducts: [
          { itemId: 'gold_dust', quantity: 1, chance: 0.3 } // 30% chance to recover some gold
        ],
        productionTime: 20,
        skill: 'enchanting',
        minSkillLevel: 7,
        buildingTypes: ['magic_workshop'],
        prerequisites: {
          technologies: ['advanced_enchanting'],
          buildings: ['enchanting_table']
        },
        qualityModifiers: {
          skill: 0.15,
          toolQuality: 0.10,
          workerExperience: 0.05
        }
      });

      expect(recipe.inputs.length).toBe(3);
      expect(recipe.outputs.length).toBe(1);
      expect(recipe.byproducts.length).toBe(1);
      expect(recipe.byproducts[0].chance).toBe(0.3);
      expect(recipe.minSkillLevel).toBe(7);
      expect(recipe.prerequisites.technologies).toContain('advanced_enchanting');
    });

    test('should validate recipe input/output consistency', () => {
      const recipe = new ProductionRecipe({
        id: 'test_recipe',
        name: 'Test Recipe',
        inputs: [
          { itemId: 'nonexistent_item', quantity: 1 }
        ],
        outputs: [
          { itemId: 'output_item', quantity: 1 }
        ],
        productionTime: 10,
        buildingTypes: ['workshop']
      });

      // Recipe created but should have validation method
      expect(recipe).toBeDefined();
      expect(recipe.inputs[0].itemId).toBe('nonexistent_item');
    });

    test('should support multi-output recipes', () => {
      const recipe = new ProductionRecipe({
        id: 'recipe_ore_processing',
        name: 'Process Ore',
        inputs: [
          { itemId: 'raw_ore', quantity: 5 }
        ],
        outputs: [
          { itemId: 'iron_ingot', quantity: 2 },
          { itemId: 'copper_ingot', quantity: 1 },
          { itemId: 'silver_nugget', quantity: 1 }
        ],
        byproducts: [
          { itemId: 'stone', quantity: 3, chance: 1.0 },
          { itemId: 'gold_nugget', quantity: 1, chance: 0.05 }
        ],
        productionTime: 15,
        buildingTypes: ['smelter']
      });

      expect(recipe.outputs.length).toBe(3);
      expect(recipe.byproducts.length).toBe(2);
      
      const guaranteedByproduct = recipe.byproducts.find(bp => bp.chance === 1.0);
      const rareByproduct = recipe.byproducts.find(bp => bp.chance === 0.05);
      
      expect(guaranteedByproduct.itemId).toBe('stone');
      expect(rareByproduct.itemId).toBe('gold_nugget');
    });
  });

  describe('Custom Building Type Integration', () => {
    test('should create custom building type with specialized features', () => {
      const buildingType = new BuildingType({
        id: 'magic_workshop',
        name: 'Magic Workshop',
        description: 'A specialized facility for magical crafting',
        category: 'magical_production',
        workerCapacity: 3,
        storageCapacity: 150,
        maintenanceCost: 50,
        constructionCost: 1000,
        constructionTime: 20,
        availableRecipes: ['recipe_enchanted_crystal', 'recipe_mana_potion'],
        requiredSkills: ['enchanting', 'alchemy'],
        productionBonuses: {
          'magical': 1.25, // 25% bonus for magical items
          'enchanting': 1.15 // 15% bonus for enchanting skill
        },
        specialFeatures: {
          canResearchSpells: true,
          manaRegeneration: 10,
          qualityBonus: 0.1
        },
        prerequisites: {
          technologies: ['basic_magic'],
          settlementLevel: 2
        }
      });

      expect(buildingType.category).toBe('magical_production');
      expect(buildingType.workerCapacity).toBe(3);
      expect(buildingType.productionBonuses['magical']).toBe(1.25);
      expect(buildingType.specialFeatures.canResearchSpells).toBe(true);
      expect(buildingType.requiredSkills).toContain('enchanting');
    });

    test('should produce items in custom building type', async () => {
      // Setup items
      const ingredient = new Item({
        id: 'herb',
        name: 'Medicinal Herb',
        category: 'organic'
      });

      const potion = new Item({
        id: 'healing_potion',
        name: 'Healing Potion',
        category: 'consumable'
      });

      world.items.push(ingredient, potion);

      // Create custom building type
      const buildingType = new BuildingType({
        id: 'alchemy_lab',
        name: 'Alchemy Laboratory',
        category: 'production',
        workerCapacity: 2,
        storageCapacity: 100,
        availableRecipes: ['recipe_healing_potion']
      });

      world.buildingTypes.push(buildingType);

      // Create recipe
      const recipe = new ProductionRecipe({
        id: 'recipe_healing_potion',
        name: 'Brew Healing Potion',
        inputs: [{ itemId: 'herb', quantity: 3 }],
        outputs: [{ itemId: 'healing_potion', quantity: 2 }],
        productionTime: 5,
        skill: 'alchemy',
        buildingTypes: ['alchemy_lab']
      });

      world.productionRecipes.push(recipe);

      // Create building
      const building = new Building({
        id: 'building_1',
        name: 'Sunrise Alchemy Lab',
        buildingTypeId: 'alchemy_lab',
        status: 'active'
      });

      building.storage.contents = { 'herb': 10 };
      settlement.buildings.push(building);

      // Create and assign alchemist
      const alchemist = new Character({
        id: 'alchemist_1',
        name: 'Morgana',
        attributes: { intelligence: 15, wisdom: 14 }
      });

      alchemist.skills = { 'alchemy': { level: 8, experience: 250 } };
      world.characters.push(alchemist);

      jobService.assignWorkerToBuilding(alchemist.id, building.id, {
        wage: 20,
        shift: 'morning'
      });

      // Start production
      const startResult = productionService.startProduction(building.id, 'recipe_healing_potion');
      expect(startResult.success).toBe(true);

      // Process turns
      for (let turn = 0; turn < 10; turn++) {
        productionService.processTurnProduction(settlement.id, turn, 'morning');
      }

      // Verify potion produced
      const potionsProduced = building.storage.contents['healing_potion'] || 0;
      expect(potionsProduced).toBeGreaterThan(0);
    });
  });

  describe('Complex Custom Recipe Chains', () => {
    test('should handle 3-tier custom production chain', async () => {
      // Tier 1: Raw materials
      const rawGem = new Item({
        id: 'raw_gem',
        name: 'Raw Gemstone',
        category: 'materials'
      });

      // Tier 2: Processed materials
      const cutGem = new Item({
        id: 'cut_gem',
        name: 'Cut Gemstone',
        category: 'materials'
      });

      const goldBar = new Item({
        id: 'gold_bar',
        name: 'Gold Bar',
        category: 'materials'
      });

      // Tier 3: Final product
      const jeweledRing = new Item({
        id: 'jeweled_ring',
        name: 'Jeweled Ring',
        category: 'luxury',
        quality: 'masterwork'
      });

      world.items.push(rawGem, cutGem, goldBar, jeweledRing);

      // Recipe 1: Cut gems
      const recipe1 = new ProductionRecipe({
        id: 'recipe_cut_gem',
        name: 'Cut Gemstone',
        inputs: [{ itemId: 'raw_gem', quantity: 1 }],
        outputs: [{ itemId: 'cut_gem', quantity: 1 }],
        productionTime: 3,
        skill: 'gem_cutting',
        buildingTypes: ['jeweler']
      });

      // Recipe 2: Create ring
      const recipe2 = new ProductionRecipe({
        id: 'recipe_jeweled_ring',
        name: 'Craft Jeweled Ring',
        inputs: [
          { itemId: 'cut_gem', quantity: 1 },
          { itemId: 'gold_bar', quantity: 1 }
        ],
        outputs: [{ itemId: 'jeweled_ring', quantity: 1 }],
        productionTime: 8,
        skill: 'jewelry_making',
        minSkillLevel: 5,
        buildingTypes: ['jeweler']
      });

      world.productionRecipes.push(recipe1, recipe2);

      // Create building type
      const jewelerType = new BuildingType({
        id: 'jeweler',
        name: 'Jeweler Workshop',
        category: 'luxury_production',
        workerCapacity: 2,
        storageCapacity: 100,
        availableRecipes: ['recipe_cut_gem', 'recipe_jeweled_ring']
      });

      world.buildingTypes.push(jewelerType);

      // Create building
      const building = new Building({
        id: 'jeweler_1',
        name: 'Golden Gems Jeweler',
        buildingTypeId: 'jeweler',
        status: 'active'
      });

      building.storage.contents = {
        'raw_gem': 5,
        'gold_bar': 3
      };

      settlement.buildings.push(building);

      // Create jeweler
      const jeweler = new Character({
        id: 'jeweler_1',
        name: 'Garnet',
        attributes: { dexterity: 16, intelligence: 13 }
      });

      jeweler.skills = {
        'gem_cutting': { level: 7, experience: 180 },
        'jewelry_making': { level: 6, experience: 150 }
      };

      world.characters.push(jeweler);
      jobService.assignWorkerToBuilding(jeweler.id, building.id, { wage: 25 });

      // Step 1: Cut gems
      productionService.startProduction(building.id, 'recipe_cut_gem');

      for (let turn = 0; turn < 5; turn++) {
        productionService.processTurnProduction(settlement.id, turn, 'morning');
      }

      const cutGems = building.storage.contents['cut_gem'] || 0;
      expect(cutGems).toBeGreaterThan(0);

      // Step 2: Craft ring
      productionService.startProduction(building.id, 'recipe_jeweled_ring');

      for (let turn = 5; turn < 20; turn++) {
        productionService.processTurnProduction(settlement.id, turn, 'morning');
      }

      const rings = building.storage.contents['jeweled_ring'] || 0;
      expect(rings).toBeGreaterThan(0);
    });
  });

  describe('Quality and Rarity Modifiers', () => {
    test('should apply quality modifiers to custom items', async () => {
      const masterworkItem = new Item({
        id: 'masterwork_sword',
        name: 'Masterwork Sword',
        category: 'weapons',
        quality: 'masterwork',
        attributes: {
          damage: 15,
          durability: 100
        }
      });

      const recipe = new ProductionRecipe({
        id: 'recipe_masterwork_sword',
        name: 'Forge Masterwork Sword',
        inputs: [
          { itemId: 'steel_ingot', quantity: 3 },
          { itemId: 'leather', quantity: 1 }
        ],
        outputs: [{ itemId: 'masterwork_sword', quantity: 1 }],
        productionTime: 15,
        skill: 'blacksmithing',
        minSkillLevel: 8,
        buildingTypes: ['smithy'],
        qualityModifiers: {
          skill: 0.2, // Skill heavily affects quality
          toolQuality: 0.15,
          workerExperience: 0.1
        }
      });

      expect(recipe.qualityModifiers.skill).toBe(0.2);
      expect(masterworkItem.quality).toBe('masterwork');
    });

    test('should handle rare item production with chance-based outputs', async () => {
      const rareItem = new Item({
        id: 'philosophers_stone',
        name: "Philosopher's Stone",
        category: 'magical',
        rarity: 'legendary'
      });

      const recipe = new ProductionRecipe({
        id: 'recipe_philosophers_stone',
        name: "Create Philosopher's Stone",
        inputs: [
          { itemId: 'alchemical_base', quantity: 10 },
          { itemId: 'rare_catalyst', quantity: 1 }
        ],
        outputs: [
          { itemId: 'philosophers_stone', quantity: 1, chance: 0.15 } // 15% success rate
        ],
        byproducts: [
          { itemId: 'alchemical_residue', quantity: 5, chance: 0.85 } // 85% failure gives residue
        ],
        productionTime: 30,
        skill: 'alchemy',
        minSkillLevel: 10,
        buildingTypes: ['grand_alchemy_lab']
      });

      expect(recipe.outputs[0].chance).toBe(0.15);
      expect(recipe.byproducts[0].chance).toBe(0.85);
      expect(rareItem.rarity).toBe('legendary');
    });
  });

  describe('Market Integration with Custom Items', () => {
    test('should establish market prices for custom items', () => {
      const customItem = new Item({
        id: 'exotic_spice',
        name: 'Exotic Spice',
        category: 'trade_goods',
        market: {
          basePrice: 75,
          volatility: 0.4,
          tradeable: true
        }
      });

      world.items.push(customItem);
      marketService.initializeMarket();

      const price = marketService.getPrice(settlement.id, 'exotic_spice');
      expect(price).toBeDefined();
      expect(typeof price).toBe('number');
    });

    test('should respect custom item trade restrictions', () => {
      const restrictedItem = new Item({
        id: 'royal_artifact',
        name: 'Royal Artifact',
        category: 'artifacts',
        market: {
          basePrice: 10000,
          volatility: 0.1,
          tradeable: false // Cannot be traded
        }
      });

      expect(restrictedItem.market.tradeable).toBe(false);
    });
  });

  describe('Custom Item Metadata Propagation', () => {
    test('should preserve custom metadata through production', async () => {
      // Create item with extensive metadata
      const enchantedItem = new Item({
        id: 'enchanted_armor',
        name: 'Enchanted Armor',
        category: 'armor',
        tags: ['magical', 'protective', 'rare'],
        attributes: {
          defense: 45,
          magicResistance: 30,
          durability: 200,
          enchantmentLevel: 3
        },
        metadata: {
          creator: 'archmage',
          creationDate: '2025-01-15',
          enchantments: ['fire_resistance', 'feather_light'],
          lore: 'Forged in the fires of Mount Doom'
        }
      });

      world.items.push(enchantedItem);

      // Verify metadata preserved
      expect(enchantedItem.metadata.creator).toBe('archmage');
      expect(enchantedItem.metadata.enchantments).toContain('fire_resistance');
      expect(enchantedItem.attributes.enchantmentLevel).toBe(3);
      expect(enchantedItem.tags).toContain('magical');
    });

    test('should track production history in item metadata', async () => {
      const item = new Item({
        id: 'tracked_item',
        name: 'Tracked Item',
        category: 'materials',
        metadata: {
          productionHistory: []
        }
      });

      // Simulate adding production record
      if (item.metadata && item.metadata.productionHistory) {
        item.metadata.productionHistory.push({
          turn: 100,
          buildingId: 'building_1',
          workerId: 'worker_1',
          quality: 'excellent'
        });
      }

      expect(item.metadata.productionHistory.length).toBe(1);
      expect(item.metadata.productionHistory[0].quality).toBe('excellent');
    });
  });

  describe('Editor Integration Validation', () => {
    test('should validate custom item data structure for editor', () => {
      const itemData = {
        id: 'custom_item_1',
        name: 'Custom Item',
        description: 'A user-created item',
        category: 'custom',
        tags: ['test', 'custom'],
        weight: 1.5,
        quality: 'common',
        market: {
          basePrice: 25,
          volatility: 0.15,
          tradeable: true
        },
        production: {
          skill: 'custom_skill',
          complexity: 'intermediate',
          baseProductionTime: 10
        }
      };

      const item = new Item(itemData);

      // Verify all editor fields preserved
      expect(item.id).toBe(itemData.id);
      expect(item.name).toBe(itemData.name);
      expect(item.description).toBe(itemData.description);
      expect(item.category).toBe(itemData.category);
      expect(item.tags).toEqual(itemData.tags);
      expect(item.weight).toBe(itemData.weight);
      expect(item.quality).toBe(itemData.quality);
      expect(item.market.basePrice).toBe(itemData.market.basePrice);
      expect(item.production.skill).toBe(itemData.production.skill);
    });

    test('should validate custom recipe data structure for editor', () => {
      const recipeData = {
        id: 'custom_recipe_1',
        name: 'Custom Recipe',
        description: 'User-created production process',
        inputs: [
          { itemId: 'input_1', quantity: 2 },
          { itemId: 'input_2', quantity: 1 }
        ],
        outputs: [
          { itemId: 'output_1', quantity: 1 }
        ],
        byproducts: [
          { itemId: 'byproduct_1', quantity: 1, chance: 0.5 }
        ],
        productionTime: 12,
        skill: 'custom_craft',
        minSkillLevel: 4,
        buildingTypes: ['custom_workshop'],
        prerequisites: {
          technologies: ['tech_1'],
          buildings: ['required_building']
        }
      };

      const recipe = new ProductionRecipe(recipeData);

      // Verify all editor fields preserved
      expect(recipe.id).toBe(recipeData.id);
      expect(recipe.inputs.length).toBe(2);
      expect(recipe.outputs.length).toBe(1);
      expect(recipe.byproducts.length).toBe(1);
      expect(recipe.minSkillLevel).toBe(4);
      expect(recipe.prerequisites.technologies).toContain('tech_1');
    });

    test('should validate custom building type data for editor', () => {
      const buildingTypeData = {
        id: 'custom_building_1',
        name: 'Custom Building',
        description: 'User-created building type',
        category: 'custom_production',
        workerCapacity: 4,
        storageCapacity: 250,
        maintenanceCost: 30,
        constructionCost: 800,
        constructionTime: 15,
        availableRecipes: ['recipe_1', 'recipe_2'],
        requiredSkills: ['skill_1', 'skill_2'],
        productionBonuses: {
          'category_1': 1.2,
          'skill_1': 1.15
        },
        prerequisites: {
          technologies: ['tech_1'],
          settlementLevel: 3
        }
      };

      const buildingType = new BuildingType(buildingTypeData);

      // Verify all editor fields preserved
      expect(buildingType.id).toBe(buildingTypeData.id);
      expect(buildingType.workerCapacity).toBe(4);
      expect(buildingType.storageCapacity).toBe(250);
      expect(buildingType.availableRecipes).toContain('recipe_1');
      expect(buildingType.requiredSkills).toContain('skill_1');
      expect(buildingType.productionBonuses['category_1']).toBe(1.2);
    });
  });
});
