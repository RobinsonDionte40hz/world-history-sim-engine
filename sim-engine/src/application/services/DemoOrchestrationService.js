// src/application/services/DemoOrchestrationService.js

const WorldBuilder = require('../../../domain/services/WorldBuilder.js');
const LODManager = require('../../../domain/services/LODManager.js');
const HistoryGenerator = require('../../../domain/services/HistoryGenerator.js');
const ProcessTurnWithLOD = require('../use-cases/simulation/ProcessTurnWithLOD.js');
const ManageSettlementDevelopment = require('../use-cases/ManageSettlementDevelopment.js');

/**
 * Demo Orchestration Service
 *
 * Provides a unified service layer for demo operations, including initialization,
 * execution, metrics collection, and state management. Coordinates between
 * different demo components and provides a clean API for demo scenarios.
 */
class DemoOrchestrationService {
  constructor() {
    this.worldBuilder = new WorldBuilder();
    this.lodManager = new LODManager();
    this.historyGenerator = new HistoryGenerator();
    this.processTurnWithLOD = ProcessTurnWithLOD;
    this.manageSettlementDevelopment = new ManageSettlementDevelopment();

    // Demo state tracking
    this.demoState = {
      isInitialized: false,
      isRunning: false,
      currentTurn: 0,
      maxTurns: 25,
      worldState: null,
      settlements: [],
      characters: [],
      metrics: {
        performance: [],
        events: [],
        development: [],
        quests: []
      },
      startTime: null,
      endTime: null
    };
  }

  /**
   * Initialize a demo scenario
   * @param {Object} config - Demo configuration
   * @returns {Promise<Object>} Initialization result
   */
  async initializeDemo(config) {
    console.log('🎭 Initializing demo scenario...');

    try {
      this.demoState.startTime = Date.now();
      this.demoState.isInitialized = false;

      // Build world from configuration
      const worldState = await this._buildDemoWorld(config);

      // Initialize LOD system
      await this._initializeLODSystem(worldState);

      // Set up demo state
      this.demoState.worldState = worldState;
      this.demoState.settlements = worldState.settlements || [];
      this.demoState.characters = worldState.characters || [];
      this.demoState.isInitialized = true;

      console.log('✅ Demo initialized successfully');
      console.log(`   Settlements: ${this.demoState.settlements.length}`);
      console.log(`   Characters: ${this.demoState.characters.length}`);

      return {
        success: true,
        worldState,
        metrics: this._getInitializationMetrics()
      };

    } catch (error) {
      console.error('❌ Demo initialization failed:', error);
      this.demoState.isInitialized = false;
      throw error;
    }
  }

  /**
   * Execute a single demo turn
   * @returns {Promise<Object>} Turn execution result
   */
  async executeDemoTurn() {
    if (!this.demoState.isInitialized) {
      throw new Error('Demo must be initialized before executing turns');
    }

    if (this.demoState.isRunning) {
      throw new Error('Demo turn already in progress');
    }

    this.demoState.isRunning = true;
    const turnStartTime = Date.now();

    try {
      console.log(`🔄 Executing demo turn ${this.demoState.currentTurn + 1}...`);

      // Process turn with LOD
      const turnResult = await this.processTurnWithLOD(
        this.demoState.worldState,
        this.lodManager,
        this.historyGenerator
      );

      // Update demo state
      this.demoState.worldState = turnResult.worldState || turnResult;
      this.demoState.currentTurn++;

      // Collect metrics
      const turnMetrics = this._collectTurnMetrics(turnResult, turnStartTime);
      this.demoState.metrics.performance.push(turnMetrics.performance);
      this.demoState.metrics.events.push(...turnMetrics.events);

      // Check for development opportunities
      const developmentUpdates = await this._processDevelopmentOpportunities();
      if (developmentUpdates.length > 0) {
        this.demoState.metrics.development.push(...developmentUpdates);
      }

      console.log(`✅ Turn ${this.demoState.currentTurn} completed in ${turnMetrics.performance.duration}ms`);

      return {
        success: true,
        turn: this.demoState.currentTurn,
        worldState: this.demoState.worldState,
        metrics: turnMetrics,
        isComplete: this.demoState.currentTurn >= this.demoState.maxTurns
      };

    } catch (error) {
      console.error('❌ Demo turn execution failed:', error);
      throw error;
    } finally {
      this.demoState.isRunning = false;
    }
  }

  /**
   * Execute complete demo scenario
   * @param {number} maxTurns - Maximum number of turns to execute
   * @returns {Promise<Object>} Complete demo execution result
   */
  async executeCompleteDemo(maxTurns = 25) {
    if (!this.demoState.isInitialized) {
      throw new Error('Demo must be initialized before execution');
    }

    this.demoState.maxTurns = maxTurns;
    this.demoState.currentTurn = 0;
    this.demoState.metrics = {
      performance: [],
      events: [],
      development: [],
      quests: []
    };

    console.log(`🎬 Starting complete demo execution (${maxTurns} turns)...`);

    const results = [];
    let isComplete = false;

    while (!isComplete && this.demoState.currentTurn < maxTurns) {
      const turnResult = await this.executeDemoTurn();
      results.push(turnResult);
      isComplete = turnResult.isComplete;

      // Optional: Add delay between turns for better observability
      if (!isComplete) {
        await this._delay(100);
      }
    }

    this.demoState.endTime = Date.now();

    const summary = this._generateDemoSummary(results);

    console.log('🎭 Demo execution completed!');
    console.log(`   Total turns: ${this.demoState.currentTurn}`);
    console.log(`   Total time: ${summary.totalTime}ms`);
    console.log(`   Average turn time: ${summary.averageTurnTime}ms`);

    return {
      success: true,
      turnsExecuted: this.demoState.currentTurn,
      results,
      summary,
      finalState: this.demoState.worldState
    };
  }

  /**
   * Get current demo status
   * @returns {Object} Current demo status
   */
  getDemoStatus() {
    return {
      isInitialized: this.demoState.isInitialized,
      isRunning: this.demoState.isRunning,
      currentTurn: this.demoState.currentTurn,
      maxTurns: this.demoState.maxTurns,
      progress: this.demoState.maxTurns > 0 ? this.demoState.currentTurn / this.demoState.maxTurns : 0,
      settlements: this.demoState.settlements.length,
      characters: this.demoState.characters.length,
      totalEvents: this.demoState.metrics.events.length,
      averageTurnTime: this._calculateAverageTurnTime()
    };
  }

  /**
   * Get demo metrics
   * @returns {Object} Demo metrics
   */
  getDemoMetrics() {
    return {
      ...this.demoState.metrics,
      summary: {
        totalTurns: this.demoState.currentTurn,
        totalTime: this.demoState.endTime ? this.demoState.endTime - this.demoState.startTime : 0,
        averageTurnTime: this._calculateAverageTurnTime(),
        totalEvents: this.demoState.metrics.events.length,
        eventsPerTurn: this.demoState.currentTurn > 0 ?
          this.demoState.metrics.events.length / this.demoState.currentTurn : 0
      }
    };
  }

  /**
   * Reset demo state
   */
  resetDemo() {
    this.demoState = {
      isInitialized: false,
      isRunning: false,
      currentTurn: 0,
      maxTurns: 25,
      worldState: null,
      settlements: [],
      characters: [],
      metrics: {
        performance: [],
        events: [],
        development: [],
        quests: []
      },
      startTime: null,
      endTime: null
    };

    console.log('🔄 Demo state reset');
  }

  /**
   * Build demo world from configuration
   * @private
   */
  async _buildDemoWorld(config) {
    // Use WorldBuilder to create the world
    const worldData = {
      settlements: config.settlements || [],
      characters: config.characters || [],
      nodes: config.nodes || [],
      interactions: config.interactions || []
    };

    const preparedWorld = await this.worldBuilder.buildWorld(worldData);

    // Add demo-specific metadata
    preparedWorld.demoMetadata = {
      scenario: config.scenario || 'valley-of-echoes',
      version: config.version || '1.0',
      initializedAt: new Date().toISOString()
    };

    return preparedWorld;
  }

  /**
   * Initialize LOD system for demo
   * @private
   */
  async _initializeLODSystem(worldState) {
    if (!worldState.characters || worldState.characters.length === 0) {
      return;
    }

    // Initialize LOD tiers for characters
    for (const character of worldState.characters) {
      if (!character.lodTier) {
        // Auto-assign LOD tier based on character properties
        character.lodTier = this._determineInitialLODTier(character);
      }
    }

    // Initialize LOD manager with world state
    await this.lodManager.initializeForWorld(worldState);
  }

  /**
   * Determine initial LOD tier for a character
   * @private
   */
  _determineInitialLODTier(character) {
    // Hero characters have explicit assignments and detailed properties
    if (character.assignments && character.assignments.nodes &&
        character.assignments.nodes.size > 0) {
      return 'hero';
    }

    // Population groups are statistical
    if (character.isPopulationGroup || character.groupSize > 1) {
      return 'group';
    }

    // Default to background for anonymous/background characters
    return 'background';
  }

  /**
   * Collect metrics from turn execution
   * @private
   */
  _collectTurnMetrics(turnResult, turnStartTime) {
    const turnEndTime = Date.now();
    const duration = turnEndTime - turnStartTime;

    const events = turnResult.events || [];
    const characterEvents = turnResult.characterEvents || [];
    const settlementEvents = turnResult.settlementEvents || [];

    return {
      performance: {
        turn: this.demoState.currentTurn,
        duration,
        timestamp: turnEndTime,
        memoryUsage: this._getMemoryUsage()
      },
      events: [
        ...events.map(e => ({ ...e, type: 'general' })),
        ...characterEvents.map(e => ({ ...e, type: 'character' })),
        ...settlementEvents.map(e => ({ ...e, type: 'settlement' }))
      ]
    };
  }

  /**
   * Process development opportunities
   * @private
   */
  async _processDevelopmentOpportunities() {
    const developmentUpdates = [];

    for (const settlement of this.demoState.settlements) {
      try {
        // Check for available upgrades
        const availableUpgrades = this.manageSettlementDevelopment.getAvailableUpgrades(
          settlement,
          settlement.resources || {},
          new Set(settlement.completedUpgrades || [])
        );

        if (availableUpgrades.length > 0) {
          // Auto-develop if resources are available (for demo purposes)
          const affordableUpgrades = availableUpgrades.filter(u => u.canAfford);

          if (affordableUpgrades.length > 0) {
            const upgrade = affordableUpgrades[0]; // Take first affordable upgrade

            const result = this.manageSettlementDevelopment.purchaseUpgrade(
              settlement,
              upgrade.id,
              settlement.resources || {},
              new Set(settlement.completedUpgrades || [])
            );

            developmentUpdates.push({
              turn: this.demoState.currentTurn,
              settlementId: settlement.id,
              upgradeId: upgrade.id,
              upgradeName: upgrade.name,
              effects: upgrade.benefits
            });

            // Update settlement in demo state
            const settlementIndex = this.demoState.settlements.findIndex(s => s.id === settlement.id);
            if (settlementIndex >= 0) {
              this.demoState.settlements[settlementIndex] = result.settlement;
            }
          }
        }
      } catch (error) {
        console.warn(`Development processing failed for settlement ${settlement.id}:`, error);
      }
    }

    return developmentUpdates;
  }

  /**
   * Get initialization metrics
   * @private
   */
  _getInitializationMetrics() {
    return {
      settlementsCount: this.demoState.settlements.length,
      charactersCount: this.demoState.characters.length,
      heroCharacters: this.demoState.characters.filter(c => c.lodTier === 'hero').length,
      groupCharacters: this.demoState.characters.filter(c => c.lodTier === 'group').length,
      backgroundCharacters: this.demoState.characters.filter(c => c.lodTier === 'background').length,
      initializationTime: Date.now() - this.demoState.startTime
    };
  }

  /**
   * Generate demo execution summary
   * @private
   */
  _generateDemoSummary(results) {
    const totalTime = this.demoState.endTime - this.demoState.startTime;
    const totalEvents = results.reduce((sum, r) => sum + (r.metrics?.events?.length || 0), 0);
    const totalDevelopment = this.demoState.metrics.development.length;

    return {
      totalTurns: this.demoState.currentTurn,
      totalTime,
      averageTurnTime: results.length > 0 ? totalTime / results.length : 0,
      totalEvents,
      eventsPerTurn: this.demoState.currentTurn > 0 ? totalEvents / this.demoState.currentTurn : 0,
      totalDevelopment,
      developmentPerTurn: this.demoState.currentTurn > 0 ? totalDevelopment / this.demoState.currentTurn : 0,
      finalSettlements: this.demoState.settlements.length,
      finalCharacters: this.demoState.characters.length
    };
  }

  /**
   * Calculate average turn time
   * @private
   */
  _calculateAverageTurnTime() {
    if (this.demoState.metrics.performance.length === 0) {
      return 0;
    }

    const totalTime = this.demoState.metrics.performance.reduce((sum, p) => sum + p.duration, 0);
    return totalTime / this.demoState.metrics.performance.length;
  }

  /**
   * Get current memory usage
   * @private
   */
  _getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external
      };
    }

    return null;
  }

  /**
   * Delay helper for turn pacing
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DemoOrchestrationService;