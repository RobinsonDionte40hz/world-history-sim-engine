// War System
class WarSystem {
  constructor(world) {
    this.world = world;
    this.wars = new Map();
    this.battles = new Map();
    this.warHistory = [];
  }

  // War Management
  declareWar(attackers, defenders, caususBelli, warGoals) {
    const war = {
      id: generateId(),
      type: 'war',
      belligerents: {
        attackers: attackers.map(f => f.id),
        defenders: defenders.map(f => f.id),
        neutrals: []
      },
      warState: {
        phase: 'declared',
        startTime: this.world.currentTime,
        currentFront: null,
        momentum: 0,
        warExhaustion: {
          attackers: 0,
          defenders: 0
        },
        casualties: {
          military: { attackers: 0, defenders: 0 },
          civilian: { attackers: 0, defenders: 0 }
        }
      },
      consciousnessEffects: {
        collectiveFrequencyShift: -2,
        fearSpread: 0.8,
        heroismChance: 0.1
      },
      caususBelli,
      warGoals,
      battles: [],
      diplomaticActions: []
    };

    this.wars.set(war.id, war);
    this.warHistory.push(war);

    // Trigger war declaration event
    this.world.eventSystem.triggerEvent({
      type: 'war_declared',
      war: war.id,
      timestamp: this.world.currentTime
    });

    return war;
  }

  // Battle Resolution
  resolveBattle(attackingForce, defendingForce, location) {
    const battle = {
      id: generateId(),
      timestamp: this.world.currentTime,
      location: location,
      forces: { attacking: attackingForce, defending: defendingForce }
    };

    // Calculate force strengths
    const attackStrength = this.calculateForceStrength(attackingForce);
    const defenseStrength = this.calculateForceStrength(defendingForce);

    // Leadership skill checks
    const attackLeaderCheck = this.rollLeadershipCheck(attackingForce.commander);
    const defenseLeaderCheck = this.rollLeadershipCheck(defendingForce.commander);

    // Morale checks
    const attackMorale = this.calculateMorale(attackingForce);
    const defenseMorale = this.calculateMorale(defendingForce);

    // Tactical advantages
    const terrainBonus = this.getTerrainBonus(location, defendingForce);
    const preparationBonus = this.getPreparationBonus(defendingForce);

    // Battle resolution
    const rounds = this.resolveBattleRounds(
      attackStrength,
      defenseStrength,
      attackLeaderCheck,
      defenseLeaderCheck,
      attackMorale,
      defenseMorale,
      terrainBonus,
      preparationBonus
    );

    battle.rounds = rounds;
    battle.outcome = this.determineBattleOutcome(rounds);
    battle.casualties = this.calculateCasualties(battle.outcome, attackingForce, defendingForce);
    battle.consciousnessImpact = this.calculateConsciousnessImpact(battle);

    this.battles.set(battle.id, battle);

    // Trigger battle event
    this.world.eventSystem.triggerEvent({
      type: 'battle_resolved',
      battle: battle.id,
      timestamp: this.world.currentTime
    });

    return battle;
  }

  // Battle Resolution Helpers
  calculateForceStrength(force) {
    return force.units.reduce((total, unit) => {
      const baseStrength = unit.quantity * unit.quality;
      const equipmentBonus = unit.equipment * 0.2;
      const trainingBonus = unit.training * 0.3;
      const consciousnessBonus = unit.collectiveFrequency > 10 ? 0.2 : 0;
      return total + baseStrength * (1 + equipmentBonus + trainingBonus + consciousnessBonus);
    }, 0);
  }

  rollLeadershipCheck(commander) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const charismaBonus = Math.floor((commander.attributes.CHA - 10) / 2);
    const wisdomBonus = Math.floor((commander.attributes.WIS - 10) / 2);
    const frequencyBonus = Math.floor((commander.consciousness.currentFrequency - 7) / 3);

    const total = roll + charismaBonus + wisdomBonus + frequencyBonus + commander.warSkill;

    return {
      roll,
      total,
      tactics: total >= 15 ? 'brilliant' : total >= 10 ? 'competent' : 'poor',
      inspirationalBonus: commander.consciousness.currentFrequency > 12 ? 0.2 : 0
    };
  }

  calculateMorale(force) {
    const baseMorale = force.training * 0.3 + force.equipment * 0.2 + force.supplies * 0.2;
    const consciousnessMorale = force.collectiveFrequency / 20;
    const veteranBonus = force.veteranRatio * 0.3;

    return Math.min(1, baseMorale + consciousnessMorale + veteranBonus);
  }

  getTerrainBonus(location, defendingForce) {
    const terrain = location.terrain;
    const defenderType = defendingForce.type;

    const terrainModifiers = {
      mountains: { infantry: 0.3, cavalry: -0.2, archers: 0.1 },
      forest: { infantry: 0.2, cavalry: -0.3, archers: 0.2 },
      plains: { infantry: 0, cavalry: 0.2, archers: -0.1 },
      river: { infantry: 0.1, cavalry: -0.1, archers: 0.1 }
    };

    return terrainModifiers[terrain]?.[defenderType] || 0;
  }

  getPreparationBonus(defendingForce) {
    return defendingForce.preparation * 0.2;
  }

  resolveBattleRounds(
    attackStrength,
    defenseStrength,
    attackLeaderCheck,
    defenseLeaderCheck,
    attackMorale,
    defenseMorale,
    terrainBonus,
    preparationBonus
  ) {
    const rounds = [];
    let attackerHP = attackStrength * 100;
    let defenderHP = (defenseStrength * 100) + terrainBonus + preparationBonus;

    while (attackerHP > 0 && defenderHP > 0 && rounds.length < 10) {
      const round = this.resolveBattleRound(
        attackerHP,
        defenderHP,
        attackLeaderCheck,
        defenseLeaderCheck,
        attackMorale,
        defenseMorale
      );

      rounds.push(round);
      attackerHP -= round.defenderDamage;
      defenderHP -= round.attackerDamage;

      if (round.moraleBreak) break;
    }

    return rounds;
  }

  resolveBattleRound(
    attackerHP,
    defenderHP,
    attackLeaderCheck,
    defenseLeaderCheck,
    attackMorale,
    defenseMorale
  ) {
    const round = {
      attackerDamage: 0,
      defenderDamage: 0,
      moraleBreak: false
    };

    // Calculate base damage
    const attackDamage = attackerHP * 0.1 * (1 + attackLeaderCheck.inspirationalBonus);
    const defenseDamage = defenderHP * 0.1 * (1 + defenseLeaderCheck.inspirationalBonus);

    // Apply tactical advantages
    if (attackLeaderCheck.tactics === 'brilliant') {
      round.attackerDamage = defenseDamage * 1.5;
    } else if (attackLeaderCheck.tactics === 'competent') {
      round.attackerDamage = defenseDamage;
    } else {
      round.attackerDamage = defenseDamage * 0.7;
    }

    if (defenseLeaderCheck.tactics === 'brilliant') {
      round.defenderDamage = attackDamage * 1.5;
    } else if (defenseLeaderCheck.tactics === 'competent') {
      round.defenderDamage = attackDamage;
    } else {
      round.defenderDamage = attackDamage * 0.7;
    }

    // Check for morale breaks
    if (attackMorale < 0.3 && Math.random() < 0.2) {
      round.moraleBreak = true;
      round.attackerDamage *= 0.5;
    }

    if (defenseMorale < 0.3 && Math.random() < 0.2) {
      round.moraleBreak = true;
      round.defenderDamage *= 0.5;
    }

    return round;
  }

  determineBattleOutcome(rounds) {
    const lastRound = rounds[rounds.length - 1];
    const attackerWon = lastRound.defenderDamage > lastRound.attackerDamage;

    return {
      victor: attackerWon ? 'attacker' : 'defender',
      decisive: Math.abs(lastRound.defenderDamage - lastRound.attackerDamage) > 50,
      roundsFought: rounds.length,
      moraleBreak: rounds.some(r => r.moraleBreak)
    };
  }

  calculateCasualties(outcome, attackingForce, defendingForce) {
    const casualties = {
      attackers: { military: 0, civilian: 0 },
      defenders: { military: 0, civilian: 0 }
    };

    // Calculate military casualties
    const attackerLossRatio = outcome.victor === 'defender' ? 0.4 : 0.2;
    const defenderLossRatio = outcome.victor === 'attacker' ? 0.4 : 0.2;

    casualties.attackers.military = Math.floor(attackingForce.totalStrength * attackerLossRatio);
    casualties.defenders.military = Math.floor(defendingForce.totalStrength * defenderLossRatio);

    // Calculate civilian casualties (if battle was near population center)
    if (attackingForce.location.isPopulationCenter) {
      const civilianCasualtyRatio = 0.1;
      casualties.attackers.civilian = Math.floor(attackingForce.location.population * civilianCasualtyRatio);
      casualties.defenders.civilian = Math.floor(defendingForce.location.population * civilianCasualtyRatio);
    }

    return casualties;
  }

  calculateConsciousnessImpact(battle) {
    const impact = {
      attackerFrequency: 0,
      defenderFrequency: 0,
      locationFrequency: 0
    };

    // Calculate frequency shifts based on battle outcome
    if (battle.outcome.victor === 'attacker') {
      impact.attackerFrequency = 0.5;
      impact.defenderFrequency = -1;
    } else {
      impact.attackerFrequency = -1;
      impact.defenderFrequency = 0.5;
    }

    // Location impact based on casualties
    const totalCasualties = 
      battle.casualties.attackers.military + 
      battle.casualties.defenders.military +
      battle.casualties.attackers.civilian +
      battle.casualties.defenders.civilian;

    impact.locationFrequency = -Math.min(2, totalCasualties / 1000);

    return impact;
  }

  // War Progression
  updateWar(war) {
    // Update war exhaustion
    this.updateWarExhaustion(war);

    // Update momentum
    this.updateWarMomentum(war);

    // Check for war resolution
    if (this.shouldEndWar(war)) {
      this.endWar(war);
    }
  }

  updateWarExhaustion(war) {
    const baseExhaustion = 0.1;
    const casualtyMultiplier = 0.01;

    war.warState.warExhaustion.attackers += 
      baseExhaustion + 
      (war.warState.casualties.military.attackers * casualtyMultiplier);

    war.warState.warExhaustion.defenders += 
      baseExhaustion + 
      (war.warState.casualties.military.defenders * casualtyMultiplier);
  }

  updateWarMomentum(war) {
    const attackerStrength = this.calculateFactionStrength(war.belligerents.attackers);
    const defenderStrength = this.calculateFactionStrength(war.belligerents.defenders);
    const strengthRatio = attackerStrength / defenderStrength;

    // Update momentum based on strength ratio
    war.warState.momentum = (strengthRatio - 1) * 50;

    // Cap momentum
    war.warState.momentum = Math.max(-100, Math.min(100, war.warState.momentum));
  }

  shouldEndWar(war) {
    // Check war exhaustion
    if (war.warState.warExhaustion.attackers > 100 || 
        war.warState.warExhaustion.defenders > 100) {
      return true;
    }

    // Check momentum
    if (Math.abs(war.warState.momentum) > 80) {
      return true;
    }

    // Check if war goals are achieved
    return this.areWarGoalsAchieved(war);
  }

  areWarGoalsAchieved(war) {
    return war.warGoals.every(goal => {
      switch (goal.type) {
        case 'territory':
          return this.checkTerritoryControl(war, goal.territory);
        case 'resources':
          return this.checkResourceControl(war, goal.resource);
        case 'political':
          return this.checkPoliticalGoal(war, goal);
        default:
          return false;
      }
    });
  }

  endWar(war) {
    war.warState.phase = 'resolution';
    war.endTime = this.world.currentTime;

    // Determine victor
    const victor = this.determineWarVictor(war);

    // Apply war consequences
    this.applyWarConsequences(war, victor);

    // Trigger war ended event
    this.world.eventSystem.triggerEvent({
      type: 'war_ended',
      war: war.id,
      victor: victor,
      timestamp: this.world.currentTime
    });
  }

  determineWarVictor(war) {
    if (war.warState.momentum > 50) {
      return 'attackers';
    } else if (war.warState.momentum < -50) {
      return 'defenders';
    } else {
      return 'stalemate';
    }
  }

  applyWarConsequences(war, victor) {
    // Apply territorial changes
    if (victor !== 'stalemate') {
      this.applyTerritorialChanges(war, victor);
    }

    // Apply economic consequences
    this.applyEconomicConsequences(war);

    // Apply diplomatic consequences
    this.applyDiplomaticConsequences(war, victor);

    // Apply consciousness consequences
    this.applyConsciousnessConsequences(war, victor);
  }

  applyTerritorialChanges(war, victor) {
    const victorFactions = victor === 'attackers' ? war.belligerents.attackers : war.belligerents.defenders;
    const loserFactions = victor === 'attackers' ? war.belligerents.defenders : war.belligerents.attackers;

    // Transfer territories based on war goals
    war.warGoals
      .filter(goal => goal.type === 'territory')
      .forEach(goal => {
        this.transferTerritory(goal.territory, loserFactions, victorFactions);
      });
  }

  applyEconomicConsequences(war) {
    const allBelligerents = [...war.belligerents.attackers, ...war.belligerents.defenders];

    allBelligerents.forEach(factionId => {
      const faction = this.world.factions.get(factionId);
      if (faction) {
        // Economic damage based on war exhaustion
        const exhaustion = war.warState.warExhaustion[factionId];
        const economicDamage = exhaustion * 0.01;

        // Apply damage
        faction.economy *= (1 - economicDamage);
      }
    });
  }

  applyDiplomaticConsequences(war, victor) {
    const victorFactions = victor === 'attackers' ? war.belligerents.attackers : war.belligerents.defenders;
    const loserFactions = victor === 'attackers' ? war.belligerents.defenders : war.belligerents.attackers;

    // Update diplomatic relations
    victorFactions.forEach(victorId => {
      loserFactions.forEach(loserId => {
        this.world.diplomaticRelations.updateRelationship(victorId, loserId, {
          opinion: 20,
          trust: -30
        });
      });
    });
  }

  applyConsciousnessConsequences(war, victor) {
    const victorFactions = victor === 'attackers' ? war.belligerents.attackers : war.belligerents.defenders;
    const loserFactions = victor === 'attackers' ? war.belligerents.defenders : war.belligerents.attackers;

    // Update consciousness levels
    victorFactions.forEach(factionId => {
      const faction = this.world.factions.get(factionId);
      if (faction) {
        faction.collectiveConsciousness.frequency += 0.5;
      }
    });

    loserFactions.forEach(factionId => {
      const faction = this.world.factions.get(factionId);
      if (faction) {
        faction.collectiveConsciousness.frequency -= 1;
      }
    });
  }
}

export default WarSystem; 