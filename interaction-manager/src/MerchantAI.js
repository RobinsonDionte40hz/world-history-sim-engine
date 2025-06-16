import { MerchantInventory } from './InventorySystem.js';

class MerchantAI {
  constructor(merchant, world) {
    this.merchant = merchant;
    this.world = world;
    this.marketSystem = world.marketSystem;
    
    // Merchant properties
    this.capital = merchant.capital || 1000;
    this.inventory = new MerchantInventory({
      owner: merchant,
      capacity: 30,
      gold: this.capital,
      specialization: this.determineSpecialization()
    });
    
    // Strategy based on consciousness and personality
    this.strategy = this.determineStrategy();
    
    // Trade network
    this.tradeNetwork = new Set();
    this.reputation = new Map(); // settlementId -> reputation
    this.contracts = [];
    this.knownMarkets = new Map(); // marketId -> market knowledge
    
    // Decision-making parameters
    this.riskTolerance = this.calculateRiskTolerance();
    this.profitThreshold = this.calculateProfitThreshold();
    
    // Memory of past trades
    this.tradeHistory = [];
    this.maxHistorySize = 100;
  }

  determineSpecialization() {
    const int = this.merchant.attributes.INT;
    const wis = this.merchant.attributes.WIS;
    const personality = this.merchant.personality;
    
    // High INT merchants specialize in complex goods
    if (int > 15) {
      return Math.random() > 0.5 ? 'luxury' : 'weapons';
    }
    // High WIS merchants focus on essentials
    else if (wis > 15) {
      return 'food';
    }
    // Balanced merchants are generalists
    else {
      return 'general';
    }
  }

  determineStrategy() {
    const frequency = this.merchant.consciousness.currentFrequency;
    const personality = this.merchant.personality;
    
    if (frequency < 7) {
      return 'survival'; // Focus on essential goods, low risk
    } else if (frequency < 10) {
      return 'steady'; // Balanced approach, moderate risk
    } else if (frequency < 13) {
      return 'ambitious'; // Seek new routes, higher risk
    } else {
      return 'visionary'; // Create new markets, transform economies
    }
  }

  calculateRiskTolerance() {
    const baseRisk = 0.5;
    const personalityModifier = this.merchant.personality.risktaking || 0;
    const wisdomModifier = (this.merchant.attributes.WIS - 10) / 20;
    const strategyModifier = {
      'survival': -0.3,
      'steady': 0,
      'ambitious': 0.2,
      'visionary': 0.4
    }[this.strategy];
    
    return Math.max(0.1, Math.min(0.9, 
      baseRisk + personalityModifier + wisdomModifier + strategyModifier
    ));
  }

  calculateProfitThreshold() {
    // Minimum profit margin to consider a trade
    const baseThreshold = 0.1; // 10%
    const greedModifier = this.merchant.personality.greed || 0;
    const strategyModifier = {
      'survival': -0.05,
      'steady': 0,
      'ambitious': 0.05,
      'visionary': 0.1
    }[this.strategy];
    
    return Math.max(0.05, baseThreshold + greedModifier * 0.1 + strategyModifier);
  }

  async makeDecisions() {
    // Update market knowledge
    await this.updateMarketKnowledge();
    
    // Analyze current situation
    const situation = this.analyzeSituation();
    
    // Make decisions based on strategy
    const decisions = [];
    
    switch (this.strategy) {
      case 'survival':
        decisions.push(...await this.makeSurvivalDecisions(situation));
        break;
      case 'steady':
        decisions.push(...await this.makeSteadyDecisions(situation));
        break;
      case 'ambitious':
        decisions.push(...await this.makeAmbitiousDecisions(situation));
        break;
      case 'visionary':
        decisions.push(...await this.makeVisionaryDecisions(situation));
        break;
    }
    
    // Execute decisions
    for (const decision of decisions) {
      await this.executeDecision(decision);
    }
    
    // Update trade history
    this.updateTradeHistory();
  }

  async updateMarketKnowledge() {
    // Visit nearby markets to gather price information
    const nearbyMarkets = this.findNearbyMarkets();
    
    for (const market of nearbyMarkets) {
      const knowledge = {
        marketId: market.id,
        lastVisit: this.world.currentTime,
        prices: {},
        supply: {},
        demand: {},
        confidence: market.marketConfidence
      };
      
      // Gather commodity information
      Object.entries(market.commodities).forEach(([commodity, data]) => {
        knowledge.prices[commodity] = data.currentPrice;
        knowledge.supply[commodity] = data.supply;
        knowledge.demand[commodity] = data.demand;
      });
      
      this.knownMarkets.set(market.id, knowledge);
    }
  }

  findNearbyMarkets() {
    const currentLocation = this.merchant.location;
    const markets = Array.from(this.marketSystem.markets.values());
    
    // Sort by distance and filter by travel range
    return markets
      .map(market => ({
        market,
        distance: this.calculateDistance(currentLocation, market.settlement)
      }))
      .filter(({ distance }) => distance <= this.getTravelRange())
      .sort((a, b) => a.distance - b.distance)
      .map(({ market }) => market);
  }

  getTravelRange() {
    // Base range modified by resources and strategy
    const baseRange = 50;
    const capitalModifier = Math.log10(this.capital + 1) * 10;
    const strategyModifier = {
      'survival': 0.5,
      'steady': 1.0,
      'ambitious': 1.5,
      'visionary': 2.0
    }[this.strategy];
    
    return baseRange * strategyModifier + capitalModifier;
  }

  analyzeSituation() {
    return {
      capital: this.capital,
      inventoryValue: this.inventory.getTotalValue(),
      inventorySpace: this.inventory.getEmptySlots(),
      currentLocation: this.merchant.location,
      knownOpportunities: this.findTradeOpportunities(),
      activeContracts: this.contracts.filter(c => c.status === 'active'),
      marketTrends: this.analyzeMarketTrends()
    };
  }

  findTradeOpportunities() {
    const opportunities = [];
    
    this.knownMarkets.forEach((originKnowledge, originId) => {
      this.knownMarkets.forEach((destKnowledge, destId) => {
        if (originId !== destId) {
          Object.keys(originKnowledge.prices).forEach(commodity => {
            const buyPrice = originKnowledge.prices[commodity];
            const sellPrice = destKnowledge.prices[commodity];
            
            if (buyPrice && sellPrice) {
              const distance = this.calculateMarketDistance(originId, destId);
              const transportCost = distance * 0.1;
              const profit = sellPrice - buyPrice - transportCost;
              const profitMargin = profit / buyPrice;
              
              if (profitMargin >= this.profitThreshold) {
                opportunities.push({
                  type: 'arbitrage',
                  commodity,
                  origin: originId,
                  destination: destId,
                  buyPrice,
                  sellPrice,
                  profit,
                  profitMargin,
                  distance,
                  risk: this.calculateTradeRisk(originId, destId)
                });
              }
            }
          });
        }
      });
    });
    
    return opportunities.sort((a, b) => b.profitMargin - a.profitMargin);
  }

  calculateTradeRisk(originId, destId) {
    const originMarket = this.marketSystem.markets.get(originId);
    const destMarket = this.marketSystem.markets.get(destId);
    
    if (!originMarket || !destMarket) return 1.0;
    
    // Factor in market confidence
    const confidenceRisk = 2 - (originMarket.marketConfidence + destMarket.marketConfidence);
    
    // Factor in distance (longer routes = more risk)
    const distance = this.calculateMarketDistance(originId, destId);
    const distanceRisk = distance / 100;
    
    // Factor in political stability
    const warRisk = (originMarket.settlement.atWar || destMarket.settlement.atWar) ? 0.5 : 0;
    
    return Math.min(1.0, confidenceRisk * 0.3 + distanceRisk * 0.3 + warRisk * 0.4);
  }

  analyzeMarketTrends() {
    const trends = {};
    
    this.knownMarkets.forEach((knowledge, marketId) => {
      const history = this.marketSystem.priceHistory.get(marketId);
      if (!history) return;
      
      Object.keys(knowledge.prices).forEach(commodity => {
        const commodityHistory = history.get(commodity);
        if (commodityHistory && commodityHistory.length > 10) {
          const recent = commodityHistory.slice(-10);
          const oldPrice = recent[0].price;
          const currentPrice = recent[recent.length - 1].price;
          const change = (currentPrice - oldPrice) / oldPrice;
          
          if (!trends[commodity]) trends[commodity] = [];
          trends[commodity].push({
            marketId,
            change,
            direction: change > 0.1 ? 'rising' : change < -0.1 ? 'falling' : 'stable'
          });
        }
      });
    });
    
    return trends;
  }

  async makeSurvivalDecisions(situation) {
    const decisions = [];
    
    // Focus on essential goods with guaranteed profit
    const safeOpportunities = situation.knownOpportunities.filter(
      opp => opp.commodity === 'food' && opp.risk < 0.3
    );
    
    if (safeOpportunities.length > 0 && situation.capital > 100) {
      const best = safeOpportunities[0];
      decisions.push({
        type: 'trade',
        action: 'execute_arbitrage',
        opportunity: best,
        investment: Math.min(situation.capital * 0.5, 500)
      });
    }
    
    // Maintain minimum capital
    if (situation.capital < 200) {
      decisions.push({
        type: 'liquidate',
        action: 'sell_inventory',
        urgency: 'high'
      });
    }
    
    return decisions;
  }

  async makeSteadyDecisions(situation) {
    const decisions = [];
    
    // Balanced portfolio of trades
    const goodOpportunities = situation.knownOpportunities.filter(
      opp => opp.profitMargin > 0.2 && opp.risk < 0.5
    );
    
    // Diversify across multiple trades
    const maxTrades = Math.min(3, goodOpportunities.length);
    const investmentPerTrade = situation.capital / (maxTrades + 1); // Keep reserve
    
    for (let i = 0; i < maxTrades; i++) {
      decisions.push({
        type: 'trade',
        action: 'execute_arbitrage',
        opportunity: goodOpportunities[i],
        investment: investmentPerTrade
      });
    }
    
    // Establish regular trade routes
    if (situation.activeContracts.length < 2) {
      decisions.push({
        type: 'contract',
        action: 'seek_trade_contract',
        duration: 30,
        commodities: [this.inventory.specialization]
      });
    }
    
    return decisions;
  }

  async makeAmbitiousDecisions(situation) {
    const decisions = [];
    
    // Seek high-profit opportunities even with higher risk
    const ambitiousOpps = situation.knownOpportunities.filter(
      opp => opp.profitMargin > 0.4 && opp.risk < this.riskTolerance
    );
    
    if (ambitiousOpps.length > 0) {
      const best = ambitiousOpps[0];
      decisions.push({
        type: 'trade',
        action: 'execute_arbitrage',
        opportunity: best,
        investment: situation.capital * 0.7 // Invest heavily
      });
    }
    
    // Explore new markets
    if (situation.knownOpportunities.length < 5) {
      decisions.push({
        type: 'exploration',
        action: 'discover_new_markets',
        range: this.getTravelRange() * 1.5
      });
    }
    
    // Speculate on market trends
    const risingCommodities = this.identifyRisingCommodities(situation.marketTrends);
    if (risingCommodities.length > 0) {
      decisions.push({
        type: 'speculation',
        action: 'buy_and_hold',
        commodities: risingCommodities,
        investment: situation.capital * 0.3
      });
    }
    
    return decisions;
  }

  async makeVisionaryDecisions(situation) {
    const decisions = [];
    
    // Create new trade routes
    const underservedMarkets = this.identifyUnderservedMarkets();
    if (underservedMarkets.length > 0) {
      decisions.push({
        type: 'market_creation',
        action: 'establish_trade_route',
        markets: underservedMarkets,
        investment: situation.capital * 0.5
      });
    }
    
    // Introduce new commodities to markets
    const marketGaps = this.identifyMarketGaps();
    if (marketGaps.length > 0) {
      decisions.push({
        type: 'innovation',
        action: 'introduce_commodity',
        gaps: marketGaps,
        investment: situation.capital * 0.3
      });
    }
    
    // Form merchant consortiums
    if (this.tradeNetwork.size < 5) {
      decisions.push({
        type: 'networking',
        action: 'form_consortium',
        purpose: 'market_domination'
      });
    }
    
    // Influence market prices through volume trading
    const manipulableMarkets = this.identifyManipulableMarkets();
    if (manipulableMarkets.length > 0 && situation.capital > 5000) {
      decisions.push({
        type: 'market_manipulation',
        action: 'corner_market',
        target: manipulableMarkets[0],
        investment: situation.capital * 0.8
      });
    }
    
    return decisions;
  }

  identifyRisingCommodities(trends) {
    const rising = [];
    
    Object.entries(trends).forEach(([commodity, marketTrends]) => {
      const risingCount = marketTrends.filter(t => t.direction === 'rising').length;
      const totalCount = marketTrends.length;
      
      if (risingCount / totalCount > 0.7) {
        rising.push(commodity);
      }
    });
    
    return rising;
  }

  identifyUnderservedMarkets() {
    const underserved = [];
    
    this.knownMarkets.forEach((knowledge, marketId) => {
      const market = this.marketSystem.markets.get(marketId);
      if (!market) return;
      
      // Check for high demand with low supply
      Object.entries(knowledge.demand).forEach(([commodity, demand]) => {
        const supply = knowledge.supply[commodity];
        if (demand > supply * 2) {
          underserved.push({
            marketId,
            commodity,
            demandGap: demand - supply
          });
        }
      });
    });
    
    return underserved;
  }

  identifyMarketGaps() {
    // Find commodities that some markets lack entirely
    const gaps = [];
    const allCommodities = new Set();
    
    // Collect all known commodities
    this.knownMarkets.forEach(knowledge => {
      Object.keys(knowledge.prices).forEach(c => allCommodities.add(c));
    });
    
    // Find markets missing commodities
    this.knownMarkets.forEach((knowledge, marketId) => {
      const marketCommodities = new Set(Object.keys(knowledge.prices));
      allCommodities.forEach(commodity => {
        if (!marketCommodities.has(commodity)) {
          gaps.push({ marketId, commodity });
        }
      });
    });
    
    return gaps;
  }

  identifyManipulableMarkets() {
    const manipulable = [];
    
    this.knownMarkets.forEach((knowledge, marketId) => {
      const market = this.marketSystem.markets.get(marketId);
      if (!market) return;
      
      // Small markets with low confidence are easier to manipulate
      if (market.size < 3 && market.marketConfidence < 0.5) {
        Object.entries(knowledge.supply).forEach(([commodity, supply]) => {
          if (supply < 100) {
            manipulable.push({
              marketId,
              commodity,
              currentSupply: supply,
              estimatedCost: supply * knowledge.prices[commodity] * 2
            });
          }
        });
      }
    });
    
    return manipulable.filter(m => m.estimatedCost < this.capital);
  }

  async executeDecision(decision) {
    const skill = this.rollMerchantSkill(decision.difficulty || 10);
    
    switch (decision.action) {
      case 'execute_arbitrage':
        await this.executeArbitrage(decision.opportunity, decision.investment, skill);
        break;
        
      case 'sell_inventory':
        await this.liquidateInventory(decision.urgency);
        break;
        
      case 'seek_trade_contract':
        await this.negotiateContract(decision);
        break;
        
      case 'discover_new_markets':
        await this.exploreNewMarkets(decision.range);
        break;
        
      case 'buy_and_hold':
        await this.speculateOnCommodities(decision.commodities, decision.investment);
        break;
        
      case 'establish_trade_route':
        await this.establishTradeRoute(decision.markets, decision.investment);
        break;
        
      case 'form_consortium':
        await this.formMerchantConsortium(decision.purpose);
        break;
    }
  }

  rollMerchantSkill(difficulty) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const intBonus = Math.floor((this.merchant.attributes.INT - 10) / 2);
    const wisBonus = Math.floor((this.merchant.attributes.WIS - 10) / 2);
    
    // Consciousness bonuses
    const coherenceBonus = Math.floor(this.merchant.consciousness.emotionalCoherence * 2);
    const networkBonus = Math.floor(this.tradeNetwork.size / 2);
    
    const total = roll + intBonus + wisBonus + coherenceBonus + networkBonus + 
                  (this.merchant.merchantSkill || 0);
    
    return {
      roll,
      total,
      success: total >= difficulty,
      criticalSuccess: roll === 20,
      margin: total - difficulty
    };
  }

  async executeArbitrage(opportunity, investment, skill) {
    const originMarket = this.marketSystem.markets.get(opportunity.origin);
    const destMarket = this.marketSystem.markets.get(opportunity.destination);
    
    if (!originMarket || !destMarket || !skill.success) {
      return { success: false, reason: 'Failed skill check or invalid markets' };
    }
    
    // Calculate quantity to buy
    const maxQuantity = Math.floor(investment / opportunity.buyPrice);
    const actualQuantity = Math.min(
      maxQuantity,
      originMarket.commodities[opportunity.commodity].supply * 0.1 // Don't buy more than 10% of supply
    );
    
    // Execute purchase
    const purchaseCost = actualQuantity * opportunity.buyPrice;
    if (this.capital >= purchaseCost) {
      this.capital -= purchaseCost;
      
      // Add to inventory
      const item = {
        id: `${opportunity.commodity}_trade`,
        name: opportunity.commodity,
        category: 'Trade Good',
        value: opportunity.buyPrice,
        weight: 1,
        stackable: true,
        maxStack: 1000
      };
      
      this.inventory.addItem(item, actualQuantity);
      
      // Update origin market
      originMarket.executeTransaction({
        type: 'buy',
        trader: this.merchant.id,
        commodity: opportunity.commodity,
        quantity: actualQuantity,
        success: true
      });
      
      // Travel to destination (simplified)
      this.merchant.location = destMarket.settlement;
      
      // Sell at destination
      const salePrice = destMarket.commodities[opportunity.commodity].currentPrice;
      const revenue = actualQuantity * salePrice;
      
      destMarket.executeTransaction({
        type: 'sell',
        trader: this.merchant.id,
        commodity: opportunity.commodity,
        quantity: actualQuantity,
        success: true
      });
      
      this.capital += revenue;
      
      // Record trade
      const profit = revenue - purchaseCost;
      this.recordTrade({
        type: 'arbitrage',
        commodity: opportunity.commodity,
        quantity: actualQuantity,
        buyPrice: opportunity.buyPrice,
        sellPrice: salePrice,
        profit: profit,
        profitMargin: profit / purchaseCost
      });
      
      return { success: true, profit };
    }
    
    return { success: false, reason: 'Insufficient capital' };
  }

  recordTrade(trade) {
    this.tradeHistory.push({
      ...trade,
      timestamp: this.world.currentTime
    });
    
    // Maintain history size
    if (this.tradeHistory.length > this.maxHistorySize) {
      this.tradeHistory.shift();
    }
  }

  calculateDistance(location1, location2) {
    // Simplified distance calculation
    const dx = location1.x - location2.x;
    const dy = location1.y - location2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateMarketDistance(marketId1, marketId2) {
    const market1 = this.marketSystem.markets.get(marketId1);
    const market2 = this.marketSystem.markets.get(marketId2);
    
    if (!market1 || !market2) return Infinity;
    
    return this.calculateDistance(market1.settlement, market2.settlement);
  }

  updateTradeHistory() {
    // Clean up old history entries
    const cutoffTime = this.world.currentTime - 100;
    this.tradeHistory = this.tradeHistory.filter(trade => trade.timestamp > cutoffTime);
  }
}

// Merchant Guild System
class MerchantGuild {
  constructor(name, headquarters) {
    this.id = this.generateId();
    this.name = name;
    this.headquarters = headquarters;
    this.members = new Set();
    this.reputation = 50;
    this.influence = 0;
    this.treasury = 0;
    
    // Guild services
    this.services = {
      insurance: true,
      marketInfo: true,
      escorts: true,
      warehousing: true
    };
    
    // Guild policies
    this.policies = {
      membershipFee: 100,
      monthlyDues: 10,
      profitShare: 0.05, // 5% of profits
      minReputation: 30
    };
    
    // Trade agreements
    this.tradeAgreements = new Map(); // settlementId -> agreement
    
    // Guild quests/contracts
    this.contracts = [];
  }

  generateId() {
    return `guild_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addMember(merchant) {
    if (this.canJoin(merchant)) {
      this.members.add(merchant.id);
      merchant.guild = this.id;
      this.treasury += this.policies.membershipFee;
      
      // Share market knowledge
      this.shareMarketKnowledge(merchant);
      
      return true;
    }
    return false;
  }

  canJoin(merchant) {
    const merchantReputation = merchant.reputation.get(this.headquarters.id) || 0;
    return merchantReputation >= this.policies.minReputation && 
           merchant.capital >= this.policies.membershipFee;
  }

  shareMarketKnowledge(merchant) {
    // Guild members share market information
    this.members.forEach(memberId => {
      if (memberId !== merchant.id) {
        // In a real implementation, this would share actual market data
        merchant.tradeNetwork.add(memberId);
      }
    });
  }

  offerServices(merchant) {
    const services = [];
    
    if (this.services.insurance) {
      services.push({
        type: 'insurance',
        cost: merchant.capital * 0.02,
        coverage: 0.8, // Covers 80% of losses
        duration: 30
      });
    }
    
    if (this.services.escorts) {
      services.push({
        type: 'escort',
        cost: 50,
        guards: 5,
        duration: 'per_route'
      });
    }
    
    if (this.services.warehousing) {
      services.push({
        type: 'warehouse',
        cost: 20,
        capacity: 100,
        duration: 30
      });
    }
    
    return services;
  }

  generateGuildQuest() {
    const questTypes = [
      {
        type: 'delivery',
        description: 'Deliver goods to distant market',
        difficulty: 'medium',
        reward: { gold: 500, reputation: 10 }
      },
      {
        type: 'establish_route',
        description: 'Open new trade route',
        difficulty: 'hard',
        reward: { gold: 1000, reputation: 20, influence: 5 }
      },
      {
        type: 'market_research',
        description: 'Survey prices in foreign markets',
        difficulty: 'easy',
        reward: { gold: 200, reputation: 5 }
      }
    ];
    
    const quest = questTypes[Math.floor(Math.random() * questTypes.length)];
    return {
      ...quest,
      id: this.generateId(),
      guildId: this.id,
      status: 'available',
      deadline: this.world.currentTime + 30
    };
  }
}

export { MerchantAI, MerchantGuild }; 