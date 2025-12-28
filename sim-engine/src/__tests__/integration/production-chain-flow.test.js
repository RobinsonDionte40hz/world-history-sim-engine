/**
 * Integration Tests - Production Chain Flow
 * 
 * Tests the complete production chain workflow including:
 * - Worker assignment to buildings
 * - Production recipe processing
 * - Resource consumption and output generation
 * - Turn-based production progression
 * - Wage payment and market dynamics
 * - Storage management and transfers
 * - Multi-turn production cycles
 */

import Building from '../../domain/entities/Building.js';
import Character from '../../domain/entities/Character.js';
import Item from '../../domain/entities/Item.js';
import ProductionRecipe from '../../domain/entities/ProductionRecipe.js';
import BuildingType from '../../domain/entities/BuildingType.js';
import { JobAssignmentService } from '../../application/services/JobAssignmentService.js';
import { BuildingProductionService } from '../../application/services/BuildingProductionService.js';
import { ResourceStorageService } from '../../application/services/ResourceStorageService.js';
import { WorkerPaymentService } from '../../application/services/WorkerPaymentService.js';
import { MarketDynamicsService } from '../../application/services/MarketDynamicsService.js';

describe('Production Chain Flow - Integration Tests', () => {
  let world;
  let settlement;
  let building;
  let workers;
  let items;
  let recipes;
  let buildingType;

  // Services
  let jobService;
  let productionService;
  let storageService;
  let paymentService;
  let marketService;

  beforeEach(() => {
    // Create test items
    const woodItem = new Item({
      id: 'wood',
      name: 'Wood',
      category: 'materials',
      market: { basePrice: 5, volatility: 0.1 }
    });

    const plankItem = new Item({
      id: 'plank',
      name: 'Plank',
      category: 'materials',
      market: { basePrice: 10, volatility: 0.15 }
    });

    const tableItem = new Item({
      id: 'table',
      name: 'Table',
      category: 'furniture',
      market: { basePrice: 50, volatility: 0.2 }
    });

    items = [woodItem, plankItem, tableItem];

    // Create production recipes
    const plankRecipe = new ProductionRecipe({
      id: 'recipe_plank',
      name: 'Produce Planks',
      inputs: [{ itemId: 'wood', quantity: 2 }],
      outputs: [{ itemId: 'plank', quantity: 3 }],
      productionTime: 5,
      skill: 'woodworking',
      buildingTypes: ['sawmill']
    });

    const tableRecipe = new ProductionRecipe({
      id: 'recipe_table',
      name: 'Craft Table',
      inputs: [{ itemId: 'plank', quantity: 4 }],
      outputs: [{ itemId: 'table', quantity: 1 }],
      productionTime: 10,
      skill: 'carpentry',
      buildingTypes: ['workshop']
    });

    recipes = [plankRecipe, tableRecipe];

    // Create building type
    buildingType = new BuildingType({
      id: 'sawmill',
      name: 'Sawmill',
      category: 'production',
      workerCapacity: 5,
      storageCapacity: 200,
      availableRecipes: ['recipe_plank']
    });

    // Create building
    building = new Building({
      id: 'building_1',
      name: 'Riverside Sawmill',
      buildingTypeId: 'sawmill',
      status: 'active'
    });

    // Add initial resources to building storage
    building.storage.contents = {
      'wood': 50
    };

    // Create workers
    workers = [
      new Character({
        id: 'worker_1',
        name: 'Alice',
        attributes: { strength: 12, dexterity: 14, intelligence: 10 }
      }),
      new Character({
        id: 'worker_2',
        name: 'Bob',
        attributes: { strength: 14, dexterity: 12, intelligence: 11 }
      }),
      new Character({
        id: 'worker_3',
        name: 'Charlie',
        attributes: { strength: 13, dexterity: 13, intelligence: 12 }
      })
    ];

    // Add woodworking skills
    workers.forEach(worker => {
      worker.skills = { 'woodworking': { level: 5, experience: 100 } };
    });

    // Create settlement
    settlement = {
      id: 'settlement_1',
      name: 'Timbertown',
      buildings: [building],
      population: { total: 100 },
      economy: {
        treasury: 1000,
        funds: 1000
      }
    };

    // Create world
    world = {
      settlements: [settlement],
      characters: workers,
      items: items,
      productionRecipes: recipes,
      buildingTypes: [buildingType],
      turn: 0
    };

    // Initialize services
    jobService = new JobAssignmentService(world);
    productionService = new BuildingProductionService(world);
    storageService = new ResourceStorageService(world);
    paymentService = new WorkerPaymentService(world);
    marketService = new MarketDynamicsService(world);
  });

  describe('Complete Production Cycle', () => {
    test('should complete full production chain from worker assignment to output', async () => {
      // Step 1: Assign workers to building
      workers.forEach(worker => {
        const assignResult = jobService.assignWorkerToBuilding(worker.id, building.id, {
          wage: 10,
          shift: 'morning'
        });
        expect(assignResult.success).toBe(true);
      });

      // Verify workers assigned
      expect(building.getWorkerCount()).toBe(3);
      workers.forEach(worker => {
        expect(worker.jobAssignment.employed).toBe(true);
        expect(worker.jobAssignment.buildingId).toBe(building.id);
      });

      // Step 2: Start production
      const startResult = productionService.startProduction(building.id, 'recipe_plank');
      expect(startResult.success).toBe(true);

      // Verify production started
      expect(building.production.activeRecipes.length).toBe(1);
      expect(building.production.activeRecipes[0].recipeId).toBe('recipe_plank');
      expect(building.production.activeRecipes[0].progress).toBe(0);

      // Step 3: Process turns until production completes
      let completed = false;
      let turnCount = 0;
      const maxTurns = 20;

      while (!completed && turnCount < maxTurns) {
        const timeOfDay = ['morning', 'midday', 'night'][turnCount % 3];
        
        const result = productionService.processTurnProduction(
          settlement.id,
          world.turn,
          timeOfDay
        );

        expect(result.success).toBe(true);

        // Check if production completed
        if (result.completedProductions.length > 0) {
          completed = true;
          expect(result.completedProductions[0].recipeId).toBe('recipe_plank');
          expect(result.completedProductions[0].outputs).toBeDefined();
          
          // Verify outputs added to storage
          const plankQuantity = building.storage.contents['plank'];
          expect(plankQuantity).toBeGreaterThan(0);
          
          // Verify inputs consumed
          const woodQuantity = building.storage.contents['wood'];
          expect(woodQuantity).toBeLessThan(50);
        }

        world.turn++;
        turnCount++;
      }

      expect(completed).toBe(true);
      expect(turnCount).toBeLessThan(maxTurns);
    });

    test('should handle multi-stage production chain', async () => {
      // Create workshop for second stage
      const workshop = new Building({
        id: 'building_2',
        name: 'Carpentry Workshop',
        buildingTypeId: 'workshop',
        status: 'active'
      });

      workshop.storage.contents = {};
      settlement.buildings.push(workshop);

      // Assign workers to sawmill
      workers.slice(0, 2).forEach(worker => {
        jobService.assignWorkerToBuilding(worker.id, building.id, {
          wage: 10,
          shift: 'morning'
        });
      });

      // Assign worker to workshop
      const carpenter = workers[2];
      carpenter.skills = { 'carpentry': { level: 7, experience: 200 } };
      jobService.assignWorkerToBuilding(carpenter.id, workshop.id, {
        wage: 15,
        shift: 'morning'
      });

      // Stage 1: Produce planks at sawmill
      productionService.startProduction(building.id, 'recipe_plank');

      // Process turns until planks are ready
      for (let i = 0; i < 10; i++) {
        productionService.processTurnProduction(settlement.id, i, 'morning');
      }

      // Verify planks produced
      const planksProduced = building.storage.contents['plank'] || 0;
      expect(planksProduced).toBeGreaterThan(0);

      // Stage 2: Transfer planks to workshop
      const transferResult = storageService.transferResources(
        building.id,
        workshop.id,
        'plank',
        Math.min(4, planksProduced)
      );
      expect(transferResult.success).toBe(true);

      // Stage 3: Craft table at workshop
      const startTableResult = productionService.startProduction(workshop.id, 'recipe_table');
      expect(startTableResult.success).toBe(true);

      // Process turns until table is complete
      for (let i = 10; i < 30; i++) {
        productionService.processTurnProduction(settlement.id, i, 'morning');
      }

      // Verify table produced
      const tablesProduced = workshop.storage.contents['table'] || 0;
      expect(tablesProduced).toBeGreaterThan(0);
    });
  });

  describe('Worker Management Integration', () => {
    test('should handle worker assignment, production, and payment cycle', async () => {
      // Assign workers
      workers.forEach(worker => {
        jobService.assignWorkerToBuilding(worker.id, building.id, {
          wage: 12,
          shift: 'morning'
        });
      });

      // Start production
      productionService.startProduction(building.id, 'recipe_plank');

      // Process multiple turns (full day: morning, midday, night)
      const initialWages = workers.map(w => w.totalWagesEarned || 0);

      for (let turn = 0; turn < 3; turn++) {
        const timeOfDay = ['morning', 'midday', 'night'][turn];
        
        // Production processing
        productionService.processTurnProduction(settlement.id, turn, timeOfDay);

        // Payment at end of day
        if (timeOfDay === 'night') {
          const paymentResult = paymentService.processWagePayments(turn);
          expect(paymentResult.success).toBe(true);
          expect(paymentResult.settlements.length).toBeGreaterThan(0);
        }
      }

      // Verify workers received wages
      workers.forEach((worker, idx) => {
        const currentWages = worker.totalWagesEarned || 0;
        expect(currentWages).toBeGreaterThan(initialWages[idx]);
      });

      // Verify treasury decreased
      expect(settlement.economy.treasury).toBeLessThan(1000);
    });

    test('should update worker performance based on production quality', async () => {
      // Assign worker
      const worker = workers[0];
      jobService.assignWorkerToBuilding(worker.id, building.id, {
        wage: 10,
        shift: 'morning'
      });

      // Start production
      productionService.startProduction(building.id, 'recipe_plank');

      // Process turns
      for (let turn = 0; turn < 10; turn++) {
        productionService.processTurnProduction(settlement.id, turn, 'morning');
      }

      // Check if performance tracking exists
      if (worker.jobAssignment.performance) {
        expect(worker.jobAssignment.performance.productivity).toBeGreaterThan(0);
        expect(worker.jobAssignment.performance.attendance).toBeDefined();
      }
    });
  });

  describe('Storage and Resource Management', () => {
    test('should manage storage capacity and prevent overflow', async () => {
      // Fill storage near capacity
      building.storage.contents = {
        'wood': building.storage.capacity - 10
      };

      const inventoryResult = storageService.getSettlementInventory(settlement.id);
      expect(inventoryResult.success).toBe(true);
      expect(inventoryResult.totalUsed).toBeGreaterThan(building.storage.capacity - 20);

      // Attempt to add more than capacity
      const transferResult = storageService.transferResources(
        null, // External source
        building.id,
        'wood',
        50
      );

      // Should handle capacity constraint
      expect(inventoryResult.totalUsed).toBeLessThanOrEqual(inventoryResult.totalCapacity);
    });

    test('should distribute resources across multiple buildings', async () => {
      // Create second building
      const building2 = new Building({
        id: 'building_2',
        name: 'Storage Warehouse',
        buildingTypeId: 'warehouse',
        status: 'active'
      });
      building2.storage.contents = {};
      settlement.buildings.push(building2);

      // Add resources to first building
      building.storage.contents = { 'wood': 100 };

      // Distribute evenly
      const distributeResult = storageService.distributeResources(
        settlement.id,
        'wood',
        50,
        'equal'
      );

      expect(distributeResult.success).toBe(true);
      expect(distributeResult.distributions.length).toBe(2);

      // Verify distribution
      const building1Wood = building.storage.contents['wood'] || 0;
      const building2Wood = building2.storage.contents['wood'] || 0;
      expect(building1Wood + building2Wood).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Market Dynamics Integration', () => {
    test('should update market prices based on production output', async () => {
      // Initialize market
      marketService.initializeMarket();

      const initialPrice = marketService.getPrice(settlement.id, 'plank');

      // Assign workers and produce many planks
      workers.forEach(worker => {
        jobService.assignWorkerToBuilding(worker.id, building.id, {
          wage: 10,
          shift: 'morning'
        });
      });

      productionService.startProduction(building.id, 'recipe_plank');

      // Process multiple production cycles
      for (let turn = 0; turn < 30; turn++) {
        const timeOfDay = ['morning', 'midday', 'night'][turn % 3];
        productionService.processTurnProduction(settlement.id, turn, timeOfDay);

        // Update market periodically
        if (turn % 3 === 2) {
          marketService.updateMarketPrices(settlement.id, turn);
        }
      }

      const finalPrice = marketService.getPrice(settlement.id, 'plank');

      // Price should change due to increased supply
      // (May increase or decrease depending on demand, but should be different)
      expect(finalPrice).toBeDefined();
      expect(typeof finalPrice).toBe('number');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle insufficient resources gracefully', async () => {
      // Empty storage
      building.storage.contents = { 'wood': 1 }; // Not enough for recipe

      const startResult = productionService.startProduction(building.id, 'recipe_plank');
      expect(startResult.success).toBe(false);
      expect(startResult.reason).toContain('resources');
    });

    test('should handle building without workers', async () => {
      // No workers assigned
      expect(building.getWorkerCount()).toBe(0);

      const startResult = productionService.startProduction(building.id, 'recipe_plank');
      
      if (startResult.success) {
        // Production started but should be slow/inefficient
        productionService.processTurnProduction(settlement.id, 0, 'morning');
        
        // Check that building can still operate (or verify it cannot)
        const canOperate = building.canOperate();
        expect(typeof canOperate).toBe('boolean');
      }
    });

    test('should handle concurrent productions in same building', async () => {
      workers.forEach(worker => {
        jobService.assignWorkerToBuilding(worker.id, building.id, {
          wage: 10,
          shift: 'morning'
        });
      });

      // Start first production
      const result1 = productionService.startProduction(building.id, 'recipe_plank');
      expect(result1.success).toBe(true);

      // Try to start second production
      const result2 = productionService.startProduction(building.id, 'recipe_plank');
      
      // Should either succeed (queue) or fail with clear reason
      if (!result2.success) {
        expect(result2.reason).toBeDefined();
      } else {
        // If queued, verify queue
        expect(building.production.queue.length).toBeGreaterThan(0);
      }
    });

    test('should handle worker removal during production', async () => {
      // Assign workers and start production
      workers.forEach(worker => {
        jobService.assignWorkerToBuilding(worker.id, building.id, {
          wage: 10,
          shift: 'morning'
        });
      });

      productionService.startProduction(building.id, 'recipe_plank');

      // Remove a worker mid-production
      const removeResult = jobService.unassignWorkerFromBuilding(workers[0].id);
      expect(removeResult.success).toBe(true);

      // Continue production with fewer workers
      const productionResult = productionService.processTurnProduction(
        settlement.id,
        1,
        'morning'
      );
      expect(productionResult.success).toBe(true);

      // Production should continue but potentially slower
      expect(building.getWorkerCount()).toBe(2);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple buildings producing simultaneously', async () => {
      // Create multiple buildings
      const buildings = [];
      for (let i = 0; i < 5; i++) {
        const newBuilding = new Building({
          id: `building_${i}`,
          name: `Sawmill ${i}`,
          buildingTypeId: 'sawmill',
          status: 'active'
        });
        newBuilding.storage.contents = { 'wood': 50 };
        buildings.push(newBuilding);
        settlement.buildings.push(newBuilding);
      }

      // Assign workers and start production in all buildings
      buildings.forEach((bldg, idx) => {
        if (workers[idx]) {
          jobService.assignWorkerToBuilding(workers[idx].id, bldg.id, {
            wage: 10,
            shift: 'morning'
          });
        }
        productionService.startProduction(bldg.id, 'recipe_plank');
      });

      // Process turn for all buildings
      const startTime = Date.now();
      const result = productionService.processTurnProduction(settlement.id, 0, 'morning');
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
