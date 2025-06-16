import { World } from '../types/simulation/World';

export class SimulationEngine {
  constructor() {
    this.world = null;
    this.isRunning = false;
    this.tickRate = 1000; // 1 second per tick
    this.tickInterval = null;
  }

  initialize(world) {
    if (!(world instanceof World)) {
      throw new Error('Invalid world instance provided to SimulationEngine');
    }
    this.world = world;
  }

  start() {
    if (!this.world) {
      throw new Error('World must be initialized before starting simulation');
    }
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.tickInterval = setInterval(() => this.tick(), this.tickRate);
  }

  stop() {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  tick() {
    if (!this.world) {
      return;
    }

    // Update world time
    this.world.currentTime += 1;

    // Process character updates
    for (const character of this.world.characters.values()) {
      this.updateCharacter(character);
    }

    // Process node updates
    for (const node of this.world.nodes.values()) {
      this.updateNode(node);
    }

    // Process group updates
    for (const group of this.world.groups.values()) {
      this.updateGroup(group);
    }
  }

  updateCharacter(character) {
    // Update character state
    character.state.energy = Math.max(0, Math.min(100, character.state.energy - 1));
    character.state.health = Math.max(0, Math.min(100, character.state.health));
    character.state.mood = Math.max(0, Math.min(100, character.state.mood));
  }

  updateNode(node) {
    // Update node state (e.g., resource regeneration, event triggers)
    for (const [resourceId, resource] of node.resources) {
      if (resource.regenerationRate) {
        resource.amount = Math.min(
          resource.maxAmount,
          resource.amount + resource.regenerationRate
        );
      }
    }
  }

  updateGroup(group) {
    // Update group state (e.g., faction relationships, resource management)
    for (const [goalId, goal] of group.goals) {
      if (goal.progress < goal.target) {
        goal.progress += goal.rate;
      }
    }
  }

  getWorldState() {
    return {
      time: this.world.currentTime,
      characterCount: this.world.characters.size,
      nodeCount: this.world.nodes.size,
      groupCount: this.world.groups.size
    };
  }
} 