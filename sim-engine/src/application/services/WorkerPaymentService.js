/**
 * WorkerPaymentService - Manages wage distribution and worker payments
 * 
 * Processes wage payments to employed workers at end of shifts,
 * tracks payment history, handles insufficient funds, and manages
 * building operating costs.
 */

export class WorkerPaymentService {
  constructor(world) {
    this.world = world;
    this.paymentEvents = [];
    this.paymentHistory = [];
  }

  /**
   * Process wage payments for all workers in all settlements
   * Should be called during night turn (end of work day)
   */
  processWagePayments(turn, timeOfDay = 'night') {
    this.paymentEvents = [];
    const settlements = this.world.settlements || [];

    let totalPaid = 0;
    let totalWorkers = 0;
    let failedPayments = 0;

    for (const settlement of settlements) {
      const result = this.processSettlementPayments(settlement.id, turn, timeOfDay);
      
      totalPaid += result.totalPaid;
      totalWorkers += result.workersPaid;
      failedPayments += result.failedPayments;
    }

    const summary = {
      turn,
      timeOfDay,
      settlements: settlements.length,
      totalWorkers,
      totalPaid,
      failedPayments,
      averageWage: totalWorkers > 0 ? totalPaid / totalWorkers : 0
    };

    return {
      success: true,
      summary,
      events: this.paymentEvents
    };
  }

  /**
   * Process wage payments for a specific settlement
   */
  processSettlementPayments(settlementId, turn, timeOfDay = 'night') {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { 
        success: false, 
        reason: 'Settlement not found',
        totalPaid: 0,
        workersPaid: 0,
        failedPayments: 0
      };
    }

    let totalPaid = 0;
    let workersPaid = 0;
    let failedPayments = 0;

    // Process payments for each building
    for (const building of (settlement.buildings || [])) {
      const result = this.processBuildingPayments(building.id, turn, timeOfDay);
      
      totalPaid += result.totalPaid;
      workersPaid += result.workersPaid;
      failedPayments += result.failedPayments;
    }

    return {
      success: true,
      settlementId,
      settlementName: settlement.name,
      totalPaid,
      workersPaid,
      failedPayments
    };
  }

  /**
   * Process wage payments for workers in a specific building
   */
  processBuildingPayments(buildingId, turn, timeOfDay = 'night') {
    const building = this._getBuildingById(buildingId);
    
    if (!building) {
      return {
        success: false,
        reason: 'Building not found',
        totalPaid: 0,
        workersPaid: 0,
        failedPayments: 0
      };
    }

    // Skip if building is not operational
    if (building.status !== 'active') {
      return {
        success: true,
        buildingId,
        totalPaid: 0,
        workersPaid: 0,
        failedPayments: 0,
        reason: `Building not active (status: ${building.status})`
      };
    }

    const workers = building.getWorkers();
    let totalPaid = 0;
    let workersPaid = 0;
    let failedPayments = 0;

    // Calculate total payroll
    const payrollDetails = this._calculatePayroll(building, workers, turn, timeOfDay);
    const totalPayroll = payrollDetails.totalPayroll;

    // Check if building/settlement has funds
    const fundsAvailable = this._getBuildingFunds(building);
    
    if (fundsAvailable < totalPayroll) {
      // Insufficient funds - handle partial payments or debt
      const partialResult = this._handleInsufficientFunds(
        building, 
        payrollDetails, 
        fundsAvailable, 
        turn
      );
      
      return {
        success: false,
        buildingId,
        buildingName: building.name,
        totalPaid: partialResult.totalPaid,
        workersPaid: partialResult.workersPaid,
        failedPayments: partialResult.failedPayments,
        reason: 'Insufficient funds for full payroll',
        payrollRequired: totalPayroll,
        fundsAvailable,
        deficit: totalPayroll - fundsAvailable
      };
    }

    // Process each worker payment
    for (const workerPayment of payrollDetails.payments) {
      const paymentResult = this._payWorker(
        workerPayment.characterId,
        workerPayment.wage,
        building,
        turn,
        timeOfDay
      );

      if (paymentResult.success) {
        totalPaid += workerPayment.wage;
        workersPaid++;
      } else {
        failedPayments++;
      }
    }

    // Deduct total from building funds
    this._deductBuildingFunds(building, totalPaid);

    // Record building payment event
    this.paymentEvents.push({
      type: 'building_payroll',
      buildingId: building.id,
      buildingName: building.name,
      turn,
      timeOfDay,
      totalPaid,
      workersPaid,
      failedPayments,
      timestamp: Date.now()
    });

    return {
      success: true,
      buildingId,
      buildingName: building.name,
      totalPaid,
      workersPaid,
      failedPayments
    };
  }

  /**
   * Pay a specific worker
   */
  payWorker(characterId, amount, reason = 'wage', metadata = {}) {
    const character = this._getCharacter(characterId);
    
    if (!character) {
      return { success: false, reason: 'Character not found' };
    }

    // Pay the worker
    const result = character.receiveWages?.(amount);
    
    if (!result || !result.success) {
      return { success: false, reason: 'Failed to process payment' };
    }

    // Record payment event
    this.paymentEvents.push({
      type: 'worker_payment',
      characterId: character.id,
      characterName: character.name,
      amount,
      reason,
      newBalance: result.newTotalWages,
      ...metadata
    });

    // Add to payment history
    this.paymentHistory.push({
      turn: metadata.turn,
      characterId: character.id,
      amount,
      reason,
      timestamp: Date.now()
    });

    return {
      success: true,
      characterId: character.id,
      amount,
      newBalance: result.newTotalWages
    };
  }

  /**
   * Calculate bonus payment for exceptional performance
   */
  calculatePerformanceBonus(characterId, baseWage) {
    const character = this._getCharacter(characterId);
    
    if (!character || !character.jobAssignment) {
      return 0;
    }

    const performance = character.jobAssignment.performance;
    let bonus = 0;

    // Productivity bonus
    if (performance.productivity >= 0.9) {
      bonus += baseWage * 0.1; // 10% bonus
    } else if (performance.productivity >= 0.8) {
      bonus += baseWage * 0.05; // 5% bonus
    }

    // Quality bonus
    if (performance.quality >= 0.9) {
      bonus += baseWage * 0.1;
    } else if (performance.quality >= 0.8) {
      bonus += baseWage * 0.05;
    }

    // Perfect attendance bonus
    if (performance.attendance >= 1.0) {
      bonus += baseWage * 0.05;
    }

    return Math.floor(bonus);
  }

  /**
   * Process end-of-day bonuses for all workers
   */
  processBonusPayments(settlementId, turn) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    let totalBonuses = 0;
    let bonusRecipients = 0;

    for (const building of (settlement.buildings || [])) {
      const workers = building.getWorkers();
      
      for (const workerId of workers) {
        const character = this._getCharacter(workerId);
        
        if (!character || !character.jobAssignment) continue;

        const baseWage = character.jobAssignment.wage;
        const bonus = this.calculatePerformanceBonus(workerId, baseWage);

        if (bonus > 0) {
          const result = this.payWorker(workerId, bonus, 'performance_bonus', {
            turn,
            buildingId: building.id,
            baseWage,
            bonusRatio: bonus / baseWage
          });

          if (result.success) {
            totalBonuses += bonus;
            bonusRecipients++;
          }
        }
      }
    }

    return {
      success: true,
      settlementId,
      totalBonuses,
      bonusRecipients,
      averageBonus: bonusRecipients > 0 ? totalBonuses / bonusRecipients : 0
    };
  }

  /**
   * Get payment summary for a character
   */
  getWorkerPaymentSummary(characterId, lastNTurns = 30) {
    const character = this._getCharacter(characterId);
    
    if (!character) {
      return { success: false, reason: 'Character not found' };
    }

    // Get recent payments from history
    const recentPayments = this.paymentHistory
      .filter(p => p.characterId === characterId)
      .slice(-lastNTurns);

    const totalEarned = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    const wagePayments = recentPayments.filter(p => p.reason === 'wage');
    const bonusPayments = recentPayments.filter(p => p.reason === 'performance_bonus');

    return {
      success: true,
      characterId: character.id,
      characterName: character.name,
      currentJob: character.getCurrentJob?.() || null,
      totalEarned,
      paymentsReceived: recentPayments.length,
      averagePayment: recentPayments.length > 0 ? totalEarned / recentPayments.length : 0,
      wagePayments: wagePayments.length,
      bonusPayments: bonusPayments.length,
      totalBonuses: bonusPayments.reduce((sum, p) => sum + p.amount, 0),
      recentPayments: recentPayments.slice(-10) // Last 10 payments
    };
  }

  /**
   * Get payment statistics for a settlement
   */
  getSettlementPaymentStats(settlementId, lastNTurns = 30) {
    const settlement = this._getSettlement(settlementId);
    
    if (!settlement) {
      return { success: false, reason: 'Settlement not found' };
    }

    // Get all employed characters in settlement
    const employedCharacters = this.world.characters?.filter(c => 
      c.jobAssignment?.employed && 
      c.jobAssignment?.settlementId === settlementId
    ) || [];

    const stats = {
      totalEmployed: employedCharacters.length,
      totalPayroll: 0,
      averageWage: 0,
      highestWage: 0,
      lowestWage: Infinity,
      buildingPayrolls: []
    };

    for (const building of (settlement.buildings || [])) {
      const workers = building.getWorkers();
      let buildingPayroll = 0;

      for (const workerId of workers) {
        const character = this._getCharacter(workerId);
        if (character && character.jobAssignment) {
          const wage = character.jobAssignment.wage;
          buildingPayroll += wage;
          stats.totalPayroll += wage;
          stats.highestWage = Math.max(stats.highestWage, wage);
          stats.lowestWage = Math.min(stats.lowestWage, wage);
        }
      }

      if (workers.length > 0) {
        stats.buildingPayrolls.push({
          buildingId: building.id,
          buildingName: building.name,
          workers: workers.length,
          totalPayroll: buildingPayroll,
          averageWage: buildingPayroll / workers.length
        });
      }
    }

    stats.averageWage = stats.totalEmployed > 0 ? stats.totalPayroll / stats.totalEmployed : 0;
    
    if (stats.lowestWage === Infinity) {
      stats.lowestWage = 0;
    }

    return {
      success: true,
      settlementId,
      settlementName: settlement.name,
      stats
    };
  }

  /**
   * Calculate payroll details for a building
   * @private
   */
  _calculatePayroll(building, workerIds, turn, timeOfDay) {
    const payments = [];
    let totalPayroll = 0;

    for (const workerId of workerIds) {
      const character = this._getCharacter(workerId);
      
      if (!character || !character.jobAssignment) continue;

      // Check if worker should be paid (correct shift)
      const workerShift = character.jobAssignment.shift;
      if (workerShift && workerShift !== timeOfDay && timeOfDay !== 'night') {
        continue; // Skip if not their shift and it's not end-of-day
      }

      const wage = character.jobAssignment.wage || 0;
      
      payments.push({
        characterId: character.id,
        characterName: character.name,
        wage,
        shift: workerShift
      });

      totalPayroll += wage;
    }

    return {
      payments,
      totalPayroll,
      workerCount: payments.length
    };
  }

  /**
   * Pay a worker
   * @private
   */
  _payWorker(characterId, amount, building, turn, timeOfDay) {
    return this.payWorker(characterId, amount, 'wage', {
      turn,
      timeOfDay,
      buildingId: building.id,
      buildingName: building.name
    });
  }

  /**
   * Handle insufficient funds for payroll
   * @private
   */
  _handleInsufficientFunds(building, payrollDetails, fundsAvailable, turn) {
    let totalPaid = 0;
    let workersPaid = 0;
    let failedPayments = 0;

    // Sort payments by priority (could be based on seniority, role, etc.)
    const sortedPayments = [...payrollDetails.payments].sort((a, b) => b.wage - a.wage);

    // Pay as many as possible with available funds
    for (const payment of sortedPayments) {
      if (fundsAvailable >= payment.wage) {
        const result = this._payWorker(
          payment.characterId,
          payment.wage,
          building,
          turn,
          'night'
        );

        if (result.success) {
          totalPaid += payment.wage;
          fundsAvailable -= payment.wage;
          workersPaid++;
        } else {
          failedPayments++;
        }
      } else {
        // Track missed payment
        this.paymentEvents.push({
          type: 'payment_failed',
          buildingId: building.id,
          characterId: payment.characterId,
          characterName: payment.characterName,
          wageOwed: payment.wage,
          reason: 'insufficient_funds',
          turn,
          timestamp: Date.now()
        });
        failedPayments++;
      }
    }

    return {
      totalPaid,
      workersPaid,
      failedPayments
    };
  }

  /**
   * Get building funds (could be from treasury, building economics, etc.)
   * @private
   */
  _getBuildingFunds(building) {
    // For now, assume buildings have access to settlement treasury or unlimited funds
    // In a full implementation, this would check building economics or settlement treasury
    return building.economics?.funds || 10000; // Default large amount
  }

  /**
   * Deduct funds from building
   * @private
   */
  _deductBuildingFunds(building, amount) {
    if (building.economics) {
      building.economics.funds = (building.economics.funds || 0) - amount;
    }
  }

  /**
   * Helper: Get character
   */
  _getCharacter(characterId) {
    return this.world.characters?.find(c => c.id === characterId) || null;
  }

  /**
   * Helper: Get building
   */
  _getBuildingById(buildingId) {
    for (const settlement of (this.world.settlements || [])) {
      const building = settlement.buildings?.find(b => b.id === buildingId);
      if (building) return building;
    }
    return null;
  }

  /**
   * Helper: Get settlement
   */
  _getSettlement(settlementId) {
    return this.world.settlements?.find(s => s.id === settlementId) || null;
  }
}

export default WorkerPaymentService;
