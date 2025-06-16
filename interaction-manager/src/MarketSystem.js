import { SettlementInventory } from './InventorySystem.js';

class MarketSystem {
  constructor(world) {
    this.world = world;
    this.markets = new Map(); // settlementId -> Market
    this.tradeRoutes = new Map(); // routeId -> TradeRoute
    this.priceHistory = new Map(); // marketId -> commodity -> price history
    this.merchantGuilds = new Map(); // guildId -> MerchantGuild
    this.marketEvents = [];
  }

  createMarket(settlement) {
    const market = new Market(settlement, this);
    this.markets.set(settlement.id, market);
    return market;
  }

  createTradeRoute(origin, destination, goods) {
    const route = new TradeRoute(origin, destination, goods, this);
    this.tradeRoutes.set(route.id, route);
    return route;
  }

  updateAllMarkets() {
    this.markets.forEach(market => {
      market.updatePrices();
      market.processTransactions();
      market.checkForEvents();
    });
    
    this.processTradeRoutes();
    this.recordPriceHistory();
  }

  processTradeRoutes() {
    this.tradeRoutes.forEach(route => {
      if (route.status.active) {
        route.processCaravans();
        route.calculateProfitability();
        route.checkForEvents();
      }
    });
  }

  recordPriceHistory() {
    this.markets.forEach((market, marketId) => {
      if (!this.priceHistory.has(marketId)) {
        this.priceHistory.set(marketId, new Map());
      }
      
      const marketHistory = this.priceHistory.get(marketId);
      
      Object.entries(market.commodities).forEach(([commodity, data]) => {
        if (!marketHistory.has(commodity)) {
          marketHistory.set(commodity, []);
        }
        
        marketHistory.get(commodity).push({
          timestamp: this.world.currentTime,
          price: data.currentPrice,
          supply: data.supply,
          demand: data.demand
        });
        
        // Keep only last 100 records
        if (marketHistory.get(commodity).length > 100) {
          marketHistory.get(commodity).shift();
        }
      });
    });
  }

  findBestTradeOpportunities() {
    const opportunities = [];
    
    this.markets.forEach((originMarket, originId) => {
      this.markets.forEach((destMarket, destId) => {
        if (originId !== destId) {
          Object.keys(originMarket.commodities).forEach(commodity => {
            const originPrice = originMarket.commodities[commodity].currentPrice;
            const destPrice = destMarket.commodities[commodity].currentPrice;
            const distance = this.calculateDistance(
              originMarket.settlement,
              destMarket.settlement
            );
            
            const transportCost = distance * 0.1;
            const profit = destPrice - originPrice - transportCost;
            
            if (profit > 0) {
              opportunities.push({
                origin: originMarket.settlement,
                destination: destMarket.settlement,
                commodity,
                profit,
                profitMargin: profit / originPrice,
                distance
              });
            }
          });
        }
      });
    });
    
    return opportunities.sort((a, b) => b.profitMargin - a.profitMargin);
  }

  calculateDistance(settlement1, settlement2) {
    const dx = settlement1.position.x - settlement2.position.x;
    const dy = settlement1.position.y - settlement2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Market {
  constructor(settlement, marketSystem) {
    this.id = settlement.id;
    this.settlement = settlement;
    this.marketSystem = marketSystem;
    this.size = this.calculateMarketSize(settlement);
    
    this.commodities = {
      food: {
        basePrice: 10,
        currentPrice: 10,
        supply: settlement.resources.food?.production || 0,
        demand: settlement.population * 2,
        priceModifiers: [],
        volatility: 0.2,
        elasticity: 0.8 // How responsive demand is to price changes
      },
      wood: {
        basePrice: 20,
        currentPrice: 20,
        supply: settlement.resources.wood?.production || 0,
        demand: settlement.buildings.length * 5,
        priceModifiers: [],
        volatility: 0.3,
        elasticity: 0.6
      },
      iron: {
        basePrice: 50,
        currentPrice: 50,
        supply: settlement.resources.iron?.production || 0,
        demand: (settlement.military || 0) * 5 + (settlement.craftsmen || 0) * 3,
        priceModifiers: [],
        volatility: 0.3,
        elasticity: 0.5
      },
      luxury: {
        basePrice: 200,
        currentPrice: 200,
        supply: settlement.resources.luxury?.imports || 0,
        demand: (settlement.nobles || 0) * 10 + (settlement.merchants || 0) * 2,
        priceModifiers: [],
        volatility: 0.5,
        elasticity: 0.3
      }
    };
    
    this.marketConfidence = this.calculateMarketConfidence(settlement);
    this.traders = new Set();
    this.activeEvents = [];
    this.transactions = [];
  }

  calculateMarketSize(settlement) {
    const populationFactor = Math.log10(settlement.population + 1);
    const developmentFactor = settlement.development?.level || 1;
    const tradeFactor = settlement.tradeConnections?.length || 0;
    
    return Math.floor(populationFactor * developmentFactor + tradeFactor);
  }

  calculateMarketConfidence(settlement) {
    const baseConfidence = 0.5;
    const stabilityBonus = (settlement.stability || 50) / 100 * 0.3;
    const consciousnessBonus = ((settlement.collectiveConsciousness?.frequency || 7) - 5) / 15 * 0.2;
    const warPenalty = settlement.atWar ? -0.3 : 0;
    const crimeBonus = settlement.crime ? -(settlement.crime / 100) * 0.2 : 0;
    
    return Math.max(0.1, Math.min(1, 
      baseConfidence + stabilityBonus + consciousnessBonus + warPenalty + crimeBonus
    ));
  }

  updatePrices() {
    Object.entries(this.commodities).forEach(([commodity, data]) => {
      // Calculate supply/demand ratio
      const ratio = data.supply / (data.demand || 1);
      
      // Base price adjustment based on supply/demand
      let priceMultiplier = 1;
      if (ratio < 0.3) priceMultiplier = 2.0; // Severe shortage
      else if (ratio < 0.5) priceMultiplier = 1.5; // Shortage
      else if (ratio < 0.8) priceMultiplier = 1.2; // Scarcity
      else if (ratio > 3) priceMultiplier = 0.3; // Severe oversupply
      else if (ratio > 2) priceMultiplier = 0.5; // Oversupply
      else if (ratio > 1.5) priceMultiplier = 0.8; // Abundance
      
      // Apply market confidence
      const confidenceEffect = this.marketConfidence;
      priceMultiplier *= (0.7 + confidenceEffect * 0.6);
      
      // Apply price modifiers (events, policies, etc.)
      data.priceModifiers.forEach(modifier => {
        priceMultiplier *= modifier.value;
      });
      
      // Calculate target price
      const targetPrice = data.basePrice * priceMultiplier;
      
      // Smooth price changes (prices don't jump instantly)
      const priceChangeRate = 0.1 + data.volatility * 0.2;
      data.currentPrice += (targetPrice - data.currentPrice) * priceChangeRate;
      
      // Add random volatility
      const randomFactor = 1 + (Math.random() - 0.5) * data.volatility * 0.1;
      data.currentPrice *= randomFactor;
      
      // Ensure minimum price
      data.currentPrice = Math.max(1, Math.round(data.currentPrice));
      
      // Adjust demand based on price elasticity
      const priceRatio = data.currentPrice / data.basePrice;
      if (priceRatio > 1) {
        data.demand *= (1 - (priceRatio - 1) * data.elasticity);
      }
    });
  }

  processTransactions() {
    // Clear old transactions
    this.transactions = this.transactions.filter(
      t => this.marketSystem.world.currentTime - t.timestamp < 30
    );
    
    // Process trader purchases/sales
    this.traders.forEach(trader => {
      const decisions = trader.makeTradeDecisions(this);
      decisions.forEach(decision => {
        if (decision.success) {
          this.executeTransaction(decision);
        }
      });
    });
  }

  executeTransaction(transaction) {
    const commodity = this.commodities[transaction.commodity];
    
    if (transaction.type === 'buy') {
      // Reduce market supply
      commodity.supply = Math.max(0, commodity.supply - transaction.quantity);
      
      // Record transaction
      this.transactions.push({
        timestamp: this.marketSystem.world.currentTime,
        type: 'buy',
        trader: transaction.trader,
        commodity: transaction.commodity,
        quantity: transaction.quantity,
        price: commodity.currentPrice
      });
    } else if (transaction.type === 'sell') {
      // Increase market supply
      commodity.supply += transaction.quantity;
      
      // Record transaction
      this.transactions.push({
        timestamp: this.marketSystem.world.currentTime,
        type: 'sell',
        trader: transaction.trader,
        commodity: transaction.commodity,
        quantity: transaction.quantity,
        price: commodity.currentPrice
      });
    }
  }

  checkForEvents() {
    const roll = Math.random();
    
    // Market crash
    if (roll < 0.01 && this.marketConfidence < 0.4) {
      this.triggerMarketCrash();
    }
    // Boom
    else if (roll < 0.02 && this.marketConfidence > 0.7) {
      this.triggerMarketBoom();
    }
    // Shortage
    else if (roll < 0.05) {
      this.triggerShortage();
    }
    // Surplus
    else if (roll < 0.08) {
      this.triggerSurplus();
    }
  }

  triggerMarketCrash() {
    this.activeEvents.push({
      type: 'market_crash',
      startTime: this.marketSystem.world.currentTime,
      duration: 30,
      description: 'Market confidence has collapsed!',
      effects: {
        confidenceMultiplier: 0.3,
        priceVolatility: 2.0,
        tradeVolume: 0.2
      }
    });
    
    // Immediate price drops
    Object.values(this.commodities).forEach(commodity => {
      commodity.currentPrice *= 0.5;
      commodity.volatility *= 2;
    });
    
    this.marketConfidence *= 0.3;
  }

  triggerMarketBoom() {
    this.activeEvents.push({
      type: 'market_boom',
      startTime: this.marketSystem.world.currentTime,
      duration: 20,
      description: 'Economic prosperity!',
      effects: {
        confidenceMultiplier: 1.5,
        priceStability: 0.5,
        tradeVolume: 2.0
      }
    });
    
    this.marketConfidence = Math.min(1, this.marketConfidence * 1.5);
  }

  triggerShortage() {
    const commodities = Object.keys(this.commodities);
    const affected = commodities[Math.floor(Math.random() * commodities.length)];
    
    this.activeEvents.push({
      type: 'shortage',
      commodity: affected,
      startTime: this.marketSystem.world.currentTime,
      duration: 15,
      description: `Shortage of ${affected}!`,
      effects: {
        supplyMultiplier: 0.3,
        priceMultiplier: 2.0
      }
    });
    
    this.commodities[affected].supply *= 0.3;
  }

  triggerSurplus() {
    const commodities = Object.keys(this.commodities);
    const affected = commodities[Math.floor(Math.random() * commodities.length)];
    
    this.activeEvents.push({
      type: 'surplus',
      commodity: affected,
      startTime: this.marketSystem.world.currentTime,
      duration: 15,
      description: `Surplus of ${affected}!`,
      effects: {
        supplyMultiplier: 3.0,
        priceMultiplier: 0.5
      }
    });
    
    this.commodities[affected].supply *= 3;
  }
}

class TradeRoute {
  constructor(origin, destination, goods, marketSystem) {
    this.id = this.generateId();
    this.origin = origin;
    this.destination = destination;
    this.goods = goods;
    this.marketSystem = marketSystem;
    this.distance = this.calculateDistance(origin, destination);
    
    this.status = {
      active: true,
      safety: 1.0, // 0-1, affected by bandits, war
      efficiency: 1.0, // 0-1, affected by infrastructure
      profitability: 0
    };
    
    this.caravans = [];
    this.protection = {
      guards: 0,
      insuranceCost: 0,
      diplomaticProtection: false
    };
    
    this.statistics = {
      totalProfit: 0,
      totalLosses: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      averageProfitMargin: 0
    };
  }

  generateId() {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateDistance(origin, destination) {
    return this.marketSystem.calculateDistance(origin, destination);
  }

  calculateProfitability() {
    let totalProfit = 0;
    const originMarket = this.marketSystem.markets.get(this.origin.id);
    const destMarket = this.marketSystem.markets.get(this.destination.id);
    
    if (!originMarket || !destMarket) return 0;
    
    this.goods.forEach(good => {
      const originPrice = originMarket.commodities[good]?.currentPrice || 0;
      const destPrice = destMarket.commodities[good]?.currentPrice || 0;
      const quantity = this.calculateTradeVolume(good);
      
      // Revenue and costs
      const revenue = destPrice * quantity;
      const cost = originPrice * quantity;
      const transportCost = this.distance * 0.1 * quantity;
      const guardCost = this.protection.guards * 10;
      const insuranceCost = this.protection.insuranceCost;
      const tariffs = this.calculateTariffs(revenue);
      
      // Risk adjustment
      const riskMultiplier = this.status.safety;
      
      const profit = (revenue - cost - transportCost - guardCost - insuranceCost - tariffs) * riskMultiplier;
      totalProfit += profit;
    });
    
    this.status.profitability = totalProfit;
    this.updateStatistics(totalProfit);
    
    return totalProfit;
  }

  calculateTradeVolume(good) {
    // Base volume on market size and route efficiency
    const originMarket = this.marketSystem.markets.get(this.origin.id);
    const baseVolume = originMarket ? originMarket.size * 10 : 50;
    
    return Math.floor(baseVolume * this.status.efficiency);
  }

  calculateTariffs(revenue) {
    const originTariff = (this.origin.taxRate || 0.1) * revenue;
    const destTariff = (this.destination.taxRate || 0.1) * revenue;
    
    return originTariff + destTariff;
  }

  processCaravans() {
    // Create new caravans if profitable
    if (this.status.profitability > 100 && this.caravans.length < 5) {
      this.dispatchCaravan();
    }
    
    // Process existing caravans
    this.caravans = this.caravans.filter(caravan => {
      caravan.progress += caravan.speed;
      
      if (caravan.progress >= 1) {
        // Caravan arrived
        this.completeCaravanJourney(caravan);
        return false;
      }
      
      // Check for events during journey
      if (Math.random() < 0.1) {
        this.generateCaravanEvent(caravan);
      }
      
      return true;
    });
  }

  dispatchCaravan() {
    const caravan = {
      id: this.generateId(),
      progress: 0,
      speed: 0.1 / this.distance, // Inversely proportional to distance
      goods: {},
      guards: Math.min(this.protection.guards, 10),
      value: 0
    };
    
    // Load goods
    const originMarket = this.marketSystem.markets.get(this.origin.id);
    this.goods.forEach(good => {
      const quantity = this.calculateTradeVolume(good);
      const price = originMarket.commodities[good].currentPrice;
      caravan.goods[good] = quantity;
      caravan.value += quantity * price;
    });
    
    this.caravans.push(caravan);
  }

  completeCaravanJourney(caravan) {
    const destMarket = this.marketSystem.markets.get(this.destination.id);
    let totalRevenue = 0;
    
    // Sell goods at destination
    Object.entries(caravan.goods).forEach(([good, quantity]) => {
      if (quantity > 0) {
        const price = destMarket.commodities[good].currentPrice;
        totalRevenue += quantity * price;
        
        // Add goods to destination market
        destMarket.executeTransaction({
          type: 'sell',
          trader: `caravan_${caravan.id}`,
          commodity: good,
          quantity: quantity,
          success: true
        });
      }
    });
    
    // Update statistics
    this.statistics.successfulDeliveries++;
    this.statistics.totalProfit += totalRevenue - caravan.value;
  }

  generateCaravanEvent(caravan) {
    const events = this.generateTradeEvents();
    
    if (events.length > 0) {
      const event = events[0];
      this.resolveCaravanEvent(caravan, event);
    }
  }

  generateTradeEvents() {
    const events = [];
    const roll = Math.floor(Math.random() * 20) + 1;
    
    // Bandit attacks more likely with low safety
    if (roll <= 5 && this.status.safety < 0.7) {
      events.push({
        type: 'bandit_attack',
        description: 'Bandits waylay the caravan!',
        skillCheck: {
          type: 'combat',
          DC: 12 + Math.floor((1 - this.status.safety) * 8),
          guards: this.protection.guards
        },
        consequences: {
          success: { lostGoods: 0.1, guardCasualties: 0.1 },
          failure: { lostGoods: 0.5, guardCasualties: 0.3, routeClosed: 0.3 }
        }
      });
    }
    
    // Weather events
    if (roll >= 15 && roll <= 17) {
      events.push({
        type: 'bad_weather',
        description: 'Severe weather slows the caravan',
        effects: {
          speedMultiplier: 0.5,
          goodsLoss: 0.05 // Perishables spoil
        }
      });
    }
    
    // Market opportunities
    if (roll >= 18) {
      events.push({
        type: 'market_opportunity',
        description: 'Merchants offer rare goods!',
        choices: [
          {
            text: 'Invest heavily',
            cost: { gold: 1000 },
            skillCheck: { type: 'insight', DC: 14 },
            reward: { profitMultiplier: 3, risk: 'market_crash' }
          },
          {
            text: 'Modest investment',
            cost: { gold: 300 },
            reward: { profitMultiplier: 1.5 }
          },
          {
            text: 'Decline offer',
            reward: { reputation: 5 }
          }
        ]
      });
    }
    
    return events;
  }

  resolveCaravanEvent(caravan, event) {
    switch (event.type) {
      case 'bandit_attack':
        const combatRoll = Math.floor(Math.random() * 20) + 1 + caravan.guards;
        if (combatRoll >= event.skillCheck.DC) {
          // Success - minor losses
          Object.keys(caravan.goods).forEach(good => {
            caravan.goods[good] *= (1 - event.consequences.success.lostGoods);
          });
        } else {
          // Failure - major losses
          Object.keys(caravan.goods).forEach(good => {
            caravan.goods[good] *= (1 - event.consequences.failure.lostGoods);
          });
          
          if (Math.random() < event.consequences.failure.routeClosed) {
            this.status.active = false;
          }
        }
        break;
        
      case 'bad_weather':
        caravan.speed *= event.effects.speedMultiplier;
        Object.keys(caravan.goods).forEach(good => {
          if (good === 'food') {
            caravan.goods[good] *= (1 - event.effects.goodsLoss);
          }
        });
        break;
    }
  }

  updateStatistics(profit) {
    this.statistics.totalProfit += profit;
    
    // Calculate average profit margin
    const totalDeliveries = this.statistics.successfulDeliveries + this.statistics.failedDeliveries;
    if (totalDeliveries > 0) {
      this.statistics.averageProfitMargin = this.statistics.totalProfit / totalDeliveries;
    }
  }

  adjustProtection(guards = 0, insurance = 0) {
    this.protection.guards = Math.max(0, guards);
    this.protection.insuranceCost = Math.max(0, insurance);
    
    // Guards improve safety
    this.status.safety = Math.min(1, 0.5 + (this.protection.guards * 0.05));
  }

  close() {
    this.status.active = false;
    
    // Return any caravans to origin
    this.caravans.forEach(caravan => {
      const originMarket = this.marketSystem.markets.get(this.origin.id);
      if (originMarket) {
        Object.entries(caravan.goods).forEach(([good, quantity]) => {
          originMarket.commodities[good].supply += quantity;
        });
      }
    });
    
    this.caravans = [];
  }
}

// Export the market system
export { MarketSystem, Market, TradeRoute }; 