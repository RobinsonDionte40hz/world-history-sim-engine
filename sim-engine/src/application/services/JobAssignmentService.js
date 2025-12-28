/**
 * JobAssignmentService - Manages character-to-building job assignments
 * 
 * Coordinates between Character and Building entities to assign workers to jobs,
 * manage shifts, calculate optimal assignments, and handle employment lifecycle.
 */

export class JobAssignmentService {
  constructor(world) {
    this.world = world;
  }

  /**
   * Assign a character to work at a building
   */
  assignWorkerToBuilding(characterId, buildingId, options = {}) {
    const character = this._getCharacter(characterId);
    const building = this._getBuilding(buildingId);
    
    if (!character) {
      return { success: false, reason: 'Character not found' };
    }
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    // Check if character is already employed
    if (character.isEmployed()) {
      return { 
        success: false, 
        reason: `Character is already employed at building ${character.jobAssignment.buildingId}` 
      };
    }

    // Check if building has capacity
    if (building.getWorkerCount() >= building.workers.capacity.max) {
      return { 
        success: false, 
        reason: 'Building is at maximum worker capacity' 
      };
    }

    // Validate building is operational
    if (building.status !== 'active' && building.status !== 'under_construction') {
      return { 
        success: false, 
        reason: `Building status is ${building.status}` 
      };
    }

    // Get building type for job details
    const buildingType = this._getBuildingType(building.buildingTypeId);
    
    // Determine job details
    const jobTitle = options.jobTitle || this._generateJobTitle(buildingType);
    const wage = options.wage !== undefined ? options.wage : this._calculateDefaultWage(buildingType, character);
    const shift = options.shift || this._determineOptimalShift(building);

    // Check character's job preferences
    if (options.respectPreferences !== false) {
      const jobOffer = {
        wage,
        type: buildingType?.category,
        distance: this._calculateDistance(character, building)
      };
      
      const prefCheck = character.meetsJobPreferences(jobOffer);
      if (!prefCheck.meets) {
        return { 
          success: false, 
          reason: `Job doesn't meet character preferences: ${prefCheck.reason}` 
        };
      }
    }

    // Assign character to job
    const jobResult = character.assignToJob(
      buildingId,
      building.settlementId,
      jobTitle,
      wage,
      shift
    );

    if (!jobResult.success) {
      return jobResult;
    }

    // Assign worker to building
    const buildingResult = building.assignWorker(characterId, shift);
    
    if (!buildingResult.success) {
      // Rollback character assignment
      character.quitJob();
      return buildingResult;
    }

    // Log the assignment
    this._logAssignment(character, building, { jobTitle, wage, shift });

    return {
      success: true,
      assignment: {
        characterId,
        buildingId,
        settlementId: building.settlementId,
        jobTitle,
        wage,
        shift
      }
    };
  }

  /**
   * Unassign a character from their current job
   */
  unassignWorkerFromBuilding(characterId, turn = null) {
    const character = this._getCharacter(characterId);
    
    if (!character) {
      return { success: false, reason: 'Character not found' };
    }

    if (!character.isEmployed()) {
      return { success: false, reason: 'Character is not employed' };
    }

    const buildingId = character.jobAssignment.buildingId;
    const building = this._getBuilding(buildingId);

    // Remove from building
    if (building) {
      building.unassignWorker(characterId);
    }

    // Remove from character
    const quitResult = character.quitJob(turn);

    this._logUnassignment(character, building, turn);

    return {
      success: true,
      previousAssignment: quitResult.previousJob
    };
  }

  /**
   * Transfer a worker from one building to another
   */
  transferWorker(characterId, newBuildingId, options = {}) {
    const character = this._getCharacter(characterId);
    
    if (!character) {
      return { success: false, reason: 'Character not found' };
    }

    // Unassign from current job if employed
    if (character.isEmployed()) {
      const unassignResult = this.unassignWorkerFromBuilding(characterId, options.turn);
      if (!unassignResult.success) {
        return unassignResult;
      }
    }

    // Assign to new building
    return this.assignWorkerToBuilding(characterId, newBuildingId, options);
  }

  /**
   * Find available jobs in a settlement
   */
  findAvailableJobs(settlementId, options = {}) {
    const buildings = this._getBuildingsInSettlement(settlementId);
    const availableJobs = [];

    for (const building of buildings) {
      // Skip buildings that are full or not operational
      if (building.getWorkerCount() >= building.workers.capacity.max) {
        continue;
      }

      if (building.status !== 'active') {
        continue;
      }

      const buildingType = this._getBuildingType(building.buildingTypeId);
      const openPositions = building.workers.capacity.max - building.getWorkerCount();

      availableJobs.push({
        buildingId: building.id,
        buildingName: building.name || buildingType?.name || 'Unknown Building',
        buildingType: buildingType?.category,
        settlementId,
        openPositions,
        currentWorkers: building.getWorkerCount(),
        optimalWorkers: building.workers.capacity.optimal,
        estimatedWage: this._calculateDefaultWage(buildingType, null),
        requiresSkill: buildingType?.production?.recipes?.length > 0,
        shift: options.preferredShift || null
      });
    }

    // Sort by priority (under-staffed buildings first)
    availableJobs.sort((a, b) => {
      const aPriority = (a.optimalWorkers - a.currentWorkers) / a.optimalWorkers;
      const bPriority = (b.optimalWorkers - b.currentWorkers) / b.optimalWorkers;
      return bPriority - aPriority;
    });

    return availableJobs;
  }

  /**
   * Find best job match for a character
   */
  findBestJobForCharacter(characterId, settlementId = null) {
    const character = this._getCharacter(characterId);
    
    if (!character) {
      return { success: false, reason: 'Character not found' };
    }

    if (character.isEmployed()) {
      return { 
        success: false, 
        reason: 'Character is already employed',
        currentJob: character.getCurrentJob()
      };
    }

    // Determine settlements to search
    const searchSettlements = settlementId 
      ? [settlementId]
      : this._getSettlementsWithinCommute(character);

    let bestMatch = null;
    let bestScore = -Infinity;

    for (const sid of searchSettlements) {
      const jobs = this.findAvailableJobs(sid);

      for (const job of jobs) {
        const score = this._scoreJobForCharacter(character, job);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = job;
        }
      }
    }

    if (!bestMatch) {
      return {
        success: false,
        reason: 'No suitable jobs found'
      };
    }

    return {
      success: true,
      bestMatch,
      score: bestScore
    };
  }

  /**
   * Auto-assign workers to under-staffed buildings
   */
  autoAssignWorkers(settlementId, options = {}) {
    const unemployedCharacters = this._getUnemployedCharactersInSettlement(settlementId);
    const availableJobs = this.findAvailableJobs(settlementId);

    const assignments = [];
    const failures = [];

    for (const job of availableJobs) {
      // Check if building needs more workers
      if (job.currentWorkers >= job.optimalWorkers && !options.fillToMax) {
        continue;
      }

      // How many workers to assign
      const target = options.fillToMax ? job.openPositions : 
                     Math.min(job.openPositions, job.optimalWorkers - job.currentWorkers);

      for (let i = 0; i < target && unemployedCharacters.length > 0; i++) {
        // Find best character for this job
        let bestCharacter = null;
        let bestScore = -Infinity;
        let bestIndex = -1;

        for (let j = 0; j < unemployedCharacters.length; j++) {
          const character = unemployedCharacters[j];
          const score = this._scoreJobForCharacter(character, job);
          
          if (score > bestScore) {
            bestScore = score;
            bestCharacter = character;
            bestIndex = j;
          }
        }

        if (bestCharacter && bestScore > 0) {
          const result = this.assignWorkerToBuilding(
            bestCharacter.id,
            job.buildingId,
            { respectPreferences: options.respectPreferences !== false }
          );

          if (result.success) {
            assignments.push(result.assignment);
            unemployedCharacters.splice(bestIndex, 1);
          } else {
            failures.push({
              characterId: bestCharacter.id,
              buildingId: job.buildingId,
              reason: result.reason
            });
          }
        }
      }
    }

    return {
      success: true,
      assigned: assignments.length,
      assignments,
      failures,
      remainingUnemployed: unemployedCharacters.length
    };
  }

  /**
   * Get all workers assigned to a building
   */
  getWorkersInBuilding(buildingId) {
    const building = this._getBuilding(buildingId);
    
    if (!building) {
      return { success: false, reason: 'Building not found' };
    }

    const workers = building.getWorkers().map(characterId => {
      const character = this._getCharacter(characterId);
      return {
        id: characterId,
        name: character?.name || 'Unknown',
        jobTitle: character?.jobAssignment.jobTitle,
        wage: character?.jobAssignment.wage,
        shift: character?.jobAssignment.shift,
        performance: character?.jobAssignment.performance
      };
    });

    return {
      success: true,
      building: {
        id: buildingId,
        workerCount: building.getWorkerCount(),
        capacity: building.workers.capacity,
        efficiency: building.workers.efficiency
      },
      workers
    };
  }

  /**
   * Get employment statistics for a settlement
   */
  getEmploymentStats(settlementId) {
    const characters = this._getCharactersInSettlement(settlementId);
    const buildings = this._getBuildingsInSettlement(settlementId);

    const totalPopulation = characters.length;
    const employed = characters.filter(c => c.isEmployed()).length;
    const unemployed = totalPopulation - employed;
    const employmentRate = totalPopulation > 0 ? employed / totalPopulation : 0;

    const buildingStats = buildings.map(building => {
      const buildingType = this._getBuildingType(building.buildingTypeId);
      return {
        id: building.id,
        name: building.name || buildingType?.name,
        category: buildingType?.category,
        workers: building.getWorkerCount(),
        capacity: building.workers.capacity,
        efficiency: building.workers.efficiency,
        operational: building.canOperate()
      };
    });

    const totalJobs = buildings.reduce((sum, b) => sum + b.workers.capacity.max, 0);
    const openPositions = buildings.reduce((sum, b) => 
      sum + (b.workers.capacity.max - b.getWorkerCount()), 0
    );

    return {
      population: {
        total: totalPopulation,
        employed,
        unemployed,
        employmentRate
      },
      jobs: {
        total: totalJobs,
        filled: employed,
        open: openPositions
      },
      buildings: buildingStats,
      averageWage: this._calculateAverageWage(characters.filter(c => c.isEmployed()))
    };
  }

  /**
   * Helper: Get character from world
   */
  _getCharacter(characterId) {
    return this.world.characters?.find(c => c.id === characterId) || null;
  }

  /**
   * Helper: Get building from world
   */
  _getBuilding(buildingId) {
    // Buildings are stored in settlements
    for (const settlement of (this.world.settlements || [])) {
      const building = settlement.buildings?.find(b => b.id === buildingId);
      if (building) return building;
    }
    return null;
  }

  /**
   * Helper: Get building type
   */
  _getBuildingType(buildingTypeId) {
    return this.world.buildingTypes?.find(bt => bt.id === buildingTypeId) || null;
  }

  /**
   * Helper: Get buildings in settlement
   */
  _getBuildingsInSettlement(settlementId) {
    const settlement = this.world.settlements?.find(s => s.id === settlementId);
    return settlement?.buildings || [];
  }

  /**
   * Helper: Get characters in settlement
   */
  _getCharactersInSettlement(settlementId) {
    return this.world.characters?.filter(c => 
      c.assignments?.settlements?.has(settlementId) ||
      c.jobAssignment?.settlementId === settlementId
    ) || [];
  }

  /**
   * Helper: Get unemployed characters in settlement
   */
  _getUnemployedCharactersInSettlement(settlementId) {
    return this._getCharactersInSettlement(settlementId)
      .filter(c => !c.isEmployed());
  }

  /**
   * Helper: Generate job title based on building type
   */
  _generateJobTitle(buildingType) {
    if (!buildingType) return 'Worker';
    
    const titleMap = {
      production: 'Craftsman',
      service: 'Service Worker',
      defense: 'Guard',
      civic: 'Administrator',
      residential: 'Caretaker'
    };
    
    return titleMap[buildingType.category] || 'Worker';
  }

  /**
   * Helper: Calculate default wage
   */
  _calculateDefaultWage(buildingType, character) {
    let baseWage = 10; // Default gold per turn

    // Adjust by building type
    if (buildingType) {
      const wageMultipliers = {
        production: 1.0,
        service: 0.8,
        defense: 1.2,
        civic: 1.5,
        residential: 0.6
      };
      baseWage *= wageMultipliers[buildingType.category] || 1.0;
    }

    // Adjust by character skill
    if (character) {
      const avgSkill = Object.values(character.jobAssignment.skills)
        .reduce((sum, level) => sum + level, 0) / 
        Math.max(1, Object.keys(character.jobAssignment.skills).length);
      
      baseWage *= (1 + avgSkill * 0.05); // +5% per skill level
    }

    return Math.ceil(baseWage);
  }

  /**
   * Helper: Determine optimal shift for new worker
   */
  _determineOptimalShift(building) {
    // Count workers per shift
    const shiftCounts = { morning: 0, midday: 0, night: 0 };
    
    for (const shift of (building.workers.shifts || [])) {
      shiftCounts[shift.timeOfDay] = (shiftCounts[shift.timeOfDay] || 0) + 
                                     (shift.workerIds?.length || 0);
    }

    // Assign to least populated shift
    const shifts = ['morning', 'midday', 'night'];
    return shifts.reduce((min, shift) => 
      shiftCounts[shift] < shiftCounts[min] ? shift : min
    );
  }

  /**
   * Helper: Calculate distance between character and building
   */
  _calculateDistance(character, building) {
    // If in same settlement, distance is 0
    if (character.jobAssignment?.settlementId === building.settlementId ||
        character.assignments?.settlements?.has(building.settlementId)) {
      return 0;
    }
    
    // Otherwise, assume some default distance
    return 100; // Arbitrary units
  }

  /**
   * Helper: Get settlements within commute distance
   */
  _getSettlementsWithinCommute(character) {
    const maxCommute = character.jobAssignment.preferences.maximumCommute;
    const settlements = [];

    // Add character's current settlements
    if (character.assignments?.settlements) {
      settlements.push(...Array.from(character.assignments.settlements));
    }

    // TODO: Add nearby settlements based on maxCommute
    // For now, just return character's settlements

    return settlements;
  }

  /**
   * Helper: Score a job for a character
   */
  _scoreJobForCharacter(character, job) {
    let score = 100; // Base score

    // Check preferences
    const prefCheck = character.meetsJobPreferences({
      wage: job.estimatedWage,
      type: job.buildingType,
      distance: 0 // Same settlement
    });

    if (!prefCheck.meets) {
      score -= 50; // Heavy penalty for not meeting preferences
    }

    // Wage preference
    if (job.estimatedWage >= character.jobAssignment.preferences.minimumWage * 1.5) {
      score += 20; // Bonus for high wage
    } else if (job.estimatedWage < character.jobAssignment.preferences.minimumWage) {
      score -= 30;
    }

    // Job type preference
    if (character.jobAssignment.preferences.preferredJobTypes.includes(job.buildingType)) {
      score += 30;
    }

    // Priority for under-staffed buildings
    const staffingRatio = job.currentWorkers / job.optimalWorkers;
    if (staffingRatio < 0.5) {
      score += 40; // High priority
    } else if (staffingRatio < 1.0) {
      score += 20;
    }

    // Random variation for variety
    score += Math.random() * 10;

    return score;
  }

  /**
   * Helper: Calculate average wage in settlement
   */
  _calculateAverageWage(employedCharacters) {
    if (employedCharacters.length === 0) return 0;
    
    const totalWages = employedCharacters.reduce((sum, c) => 
      sum + (c.jobAssignment?.wage || 0), 0
    );
    
    return totalWages / employedCharacters.length;
  }

  /**
   * Helper: Log assignment event
   */
  _logAssignment(character, building, details) {
    // TODO: Integrate with event/history system
    console.log(`[JobAssignment] ${character.name} assigned to building ${building.id} as ${details.jobTitle}`);
  }

  /**
   * Helper: Log unassignment event
   */
  _logUnassignment(character, building, turn) {
    // TODO: Integrate with event/history system
    console.log(`[JobAssignment] ${character.name} quit job at building ${building?.id || 'unknown'}`);
  }
}

export default JobAssignmentService;
