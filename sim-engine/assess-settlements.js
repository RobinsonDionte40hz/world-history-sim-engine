/**
 * Settlement and Production Chain Assessment Tool
 * 
 * Analyzes your current settlements, their nodes, resources, and production chains
 * to provide insights into economic health and potential bottlenecks.
 * 
 * Usage: node assess-settlements.js [world-name]
 * If no world name is provided, will list available worlds.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('═══════════════════════════════════════════════════════');
console.log('  SETTLEMENT & PRODUCTION CHAIN ASSESSMENT TOOL');
console.log('═══════════════════════════════════════════════════════\n');

// Check for saved worlds in local storage data
// Note: LocalStorage data would be in browser, so we'll check for exported/saved files
const worldsDir = path.join(__dirname, 'saved-worlds');
let world = null;
let worldName = process.argv[2];

// Try to load from saved-worlds directory
if (!fs.existsSync(worldsDir)) {
  console.log('⚠️  No saved-worlds directory found.');
  console.log('   Export a world from the application first, or provide world data.\n');
  
  // Create example world structure
  world = {
    name: 'Example World',
    description: 'Sample world for demonstration',
    lastModified: Date.now(),
    settlements: {},
    nodes: {}
  };
  
  console.log('📍 Using example empty world structure for demonstration.\n');
} else {
  const worldFiles = fs.readdirSync(worldsDir).filter(f => f.endsWith('.json'));
  
  if (worldFiles.length === 0) {
    console.log('⚠️  No world files found in saved-worlds directory.\n');
    process.exit(1);
  }
  
  if (!worldName) {
    console.log('Available worlds:');
    worldFiles.forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${file.replace('.json', '')}`);
    });
    console.log('\nUsage: node assess-settlements.js <world-name>\n');
    process.exit(0);
  }
  
  const worldFile = path.join(worldsDir, `${worldName}.json`);
  if (!fs.existsSync(worldFile)) {
    console.log(`❌ World file not found: ${worldFile}\n`);
    console.log('Available worlds:');
    worldFiles.forEach(file => console.log(`  • ${file.replace('.json', '')}`));
    console.log('');
    process.exit(1);
  }
  
  world = JSON.parse(fs.readFileSync(worldFile, 'utf8'));
}

console.log(`📍 Assessing World: "${world.name || 'Unnamed World'}"`);
console.log(`   Description: ${world.description || 'No description'}`);
if (world.lastModified) {
  console.log(`   Last Updated: ${new Date(world.lastModified).toLocaleString()}`);
}
console.log('');

// ==================== SETTLEMENTS OVERVIEW ====================
console.log('═══════════════════════════════════════════════════════');
console.log('  SETTLEMENTS OVERVIEW');
console.log('═══════════════════════════════════════════════════════\n');

const settlements = Object.values(world.settlements || {});
if (settlements.length === 0) {
  console.log('⚠️  No settlements found in this world.');
  console.log('   Settlements represent organized communities with populations,');
  console.log('   resources, buildings, and economic systems.');
  console.log('\n   To add settlements:');
  console.log('   1. Use the World Foundation editor in the application');
  console.log('   2. Create settlements with resources and buildings');
  console.log('   3. Export or save your world\n');
} else {
  console.log(`Total Settlements: ${settlements.length}\n`);
  
  settlements.forEach((settlement, idx) => {
    console.log(`${idx + 1}. ${settlement.name || 'Unnamed Settlement'}`);
    console.log(`   ID: ${settlement.id}`);
    console.log(`   Type: ${settlement.type || 'Unknown'}`);
    console.log(`   Population: ${settlement.population?.total || 0}`);
    
    if (settlement.government?.leader) {
      console.log(`   Leader: ${settlement.government.leader}`);
    }
    
    if (settlement.government?.type) {
      console.log(`   Government: ${settlement.government.type}`);
    }
    
    // Need Satisfaction
    if (settlement.needSatisfaction?.current) {
      const needs = settlement.needSatisfaction.current;
      console.log(`   Need Satisfaction:`);
      console.log(`     Overall: ${(needs.overall * 100).toFixed(1)}%`);
      console.log(`     Food: ${(needs.food * 100).toFixed(1)}%`);
      console.log(`     Water: ${(needs.water * 100).toFixed(1)}%`);
      console.log(`     Shelter: ${(needs.shelter * 100).toFixed(1)}%`);
      
      if (needs.overall < 0.4) {
        console.log(`     ⚠️  CRISIS LEVEL - Immediate attention needed!`);
      } else if (needs.overall < 0.6) {
        console.log(`     ⚠️  LOW - Needs improvement`);
      } else if (needs.overall < 0.8) {
        console.log(`     ✓ MODERATE - Functioning adequately`);
      } else {
        console.log(`     ✅ EXCELLENT - Thriving settlement`);
      }
    }
    
    console.log('');
  });
}

// ==================== RESOURCES & PRODUCTION ====================
console.log('═══════════════════════════════════════════════════════');
console.log('  RESOURCE & PRODUCTION ANALYSIS');
console.log('═══════════════════════════════════════════════════════\n');

settlements.forEach((settlement, idx) => {
  console.log(`\n━━━ ${settlement.name || 'Unnamed Settlement'} ━━━\n`);
  
  // Resources
  if (settlement.resources) {
    console.log('📦 RESOURCES:');
    
    if (settlement.resources.amounts && Object.keys(settlement.resources.amounts).length > 0) {
      console.log('  Current Amounts:');
      Object.entries(settlement.resources.amounts).forEach(([resource, amount]) => {
        console.log(`    • ${resource}: ${amount}`);
      });
    } else {
      console.log('  No resource amounts tracked');
    }
    
    if (settlement.resources.production && Object.keys(settlement.resources.production).length > 0) {
      console.log('\n  Production Rates:');
      Object.entries(settlement.resources.production).forEach(([resource, rate]) => {
        console.log(`    • ${resource}: ${rate}/turn`);
      });
    } else {
      console.log('\n  No production rates defined');
    }
    
    if (settlement.resources.consumption && Object.keys(settlement.resources.consumption).length > 0) {
      console.log('\n  Consumption Rates:');
      Object.entries(settlement.resources.consumption).forEach(([resource, rate]) => {
        console.log(`    • ${resource}: ${rate}/turn`);
      });
    } else {
      console.log('\n  No consumption rates tracked');
    }
    
    if (settlement.resources.storage && Object.keys(settlement.resources.storage).length > 0) {
      console.log('\n  Storage Capacity:');
      Object.entries(settlement.resources.storage).forEach(([resource, capacity]) => {
        const current = settlement.resources.amounts?.[resource] || 0;
        const percentage = capacity > 0 ? ((current / capacity) * 100).toFixed(1) : 0;
        console.log(`    • ${resource}: ${current}/${capacity} (${percentage}%)`);
      });
    }
    
    // Check for bottlenecks
    console.log('\n  ⚙️  Production Chain Analysis:');
    const production = settlement.resources.production || {};
    const consumption = settlement.resources.consumption || {};
    const amounts = settlement.resources.amounts || {};
    
    const allResources = new Set([
      ...Object.keys(production),
      ...Object.keys(consumption),
      ...Object.keys(amounts)
    ]);
    
    if (allResources.size === 0) {
      console.log('    No production chain data available');
    } else {
      allResources.forEach(resource => {
        const prod = production[resource] || 0;
        const cons = consumption[resource] || 0;
        const amt = amounts[resource] || 0;
        const netChange = prod - cons;
        
        if (Math.abs(netChange) > 0.001) {
          const status = netChange > 0 ? '📈 Surplus' : '📉 Deficit';
          console.log(`    ${status} ${resource}: ${netChange > 0 ? '+' : ''}${netChange}/turn (current: ${amt})`);
          
          if (netChange < 0 && amt <= 0) {
            console.log(`      ⚠️  WARNING: Depleted and consuming faster than producing!`);
          } else if (netChange < 0) {
            const turnsUntilDepletion = Math.floor(amt / Math.abs(netChange));
            console.log(`      ⚠️  Will be depleted in ~${turnsUntilDepletion} turns`);
          }
        }
      });
    }
  } else {
    console.log('📦 No resource data available for this settlement');
  }
  
  // Buildings
  if (settlement.buildings && settlement.buildings.length > 0) {
    console.log('\n🏗️  BUILDINGS:');
    console.log(`  Total: ${settlement.buildings.length}`);
    
    const buildingsByType = {};
    settlement.buildings.forEach(building => {
      const type = building.type || 'Unknown';
      buildingsByType[type] = (buildingsByType[type] || 0) + 1;
    });
    
    Object.entries(buildingsByType).forEach(([type, count]) => {
      console.log(`    • ${type}: ${count}`);
    });
    
    // Show production from buildings
    const productiveBuildings = settlement.buildings.filter(b => 
      b.production && Object.keys(b.production).length > 0
    );
    
    if (productiveBuildings.length > 0) {
      console.log('\n  Production Buildings:');
      productiveBuildings.forEach(building => {
        console.log(`    • ${building.type} (Level ${building.level || 1})`);
        Object.entries(building.production).forEach(([resource, amount]) => {
          console.log(`      - Produces: ${resource} (${amount}/turn)`);
        });
      });
    }
  }
  
  // Economy
  if (settlement.economy) {
    console.log('\n💰 ECONOMY:');
    
    if (settlement.economy.trade && settlement.economy.trade.length > 0) {
      console.log(`  Trade Partners: ${settlement.economy.trade.length}`);
      settlement.economy.trade.forEach(trade => {
        console.log(`    • ${trade.partner}: ${trade.value} value (${trade.frequency})`);
        if (trade.resources) {
          Object.entries(trade.resources).forEach(([resource, amount]) => {
            console.log(`      - ${resource}: ${amount}`);
          });
        }
      });
    }
    
    if (settlement.economy.income) {
      console.log(`  Income: ${JSON.stringify(settlement.economy.income)}`);
    }
    
    if (settlement.economy.expenses) {
      console.log(`  Expenses: ${JSON.stringify(settlement.economy.expenses)}`);
    }
  }
});

// ==================== NODES OVERVIEW ====================
console.log('\n═══════════════════════════════════════════════════════');
console.log('  WORLD NODES OVERVIEW');
console.log('═══════════════════════════════════════════════════════\n');

const nodes = Object.values(world.nodes || {});
if (nodes.length === 0) {
  console.log('⚠️  No nodes found in this world.');
  console.log('   Nodes represent locations in your world (cities, villages, dungeons, etc.)');
  console.log('   that can have environmental properties and resource availability.');
  console.log('\n   To add nodes:');
  console.log('   1. Use the Node Editor in the application');
  console.log('   2. Define node types and properties');
  console.log('   3. Link nodes to settlements if desired\n');
} else {
  console.log(`Total Nodes: ${nodes.length}\n`);
  
  const nodesByType = {};
  nodes.forEach(node => {
    const type = node.type || 'Unknown';
    nodesByType[type] = (nodesByType[type] || 0) + 1;
  });
  
  console.log('Nodes by Type:');
  Object.entries(nodesByType).forEach(([type, count]) => {
    console.log(`  • ${type}: ${count}`);
  });
  
  console.log('\nDetailed Node Information:\n');
  nodes.forEach((node, idx) => {
    console.log(`${idx + 1}. ${node.name || 'Unnamed Node'}`);
    console.log(`   ID: ${node.id}`);
    console.log(`   Type: ${node.type || 'Unknown'}`);
    
    if (node.environmentalProperties) {
      console.log(`   Environment: ${JSON.stringify(node.environmentalProperties)}`);
    }
    
    if (node.resourceAvailability) {
      console.log(`   Resources: ${JSON.stringify(node.resourceAvailability)}`);
    }
    
    if (node.settlementId) {
      const linkedSettlement = settlements.find(s => s.id === node.settlementId);
      console.log(`   Linked to Settlement: ${linkedSettlement?.name || node.settlementId}`);
    }
    
    console.log('');
  });
}

// ==================== ECONOMIC HEALTH SUMMARY ====================
console.log('═══════════════════════════════════════════════════════');
console.log('  ECONOMIC HEALTH SUMMARY');
console.log('═══════════════════════════════════════════════════════\n');

if (settlements.length > 0) {
  let totalSatisfaction = 0;
  let satisfactionCount = 0;
  let crisisCount = 0;
  
  settlements.forEach(settlement => {
    if (settlement.needSatisfaction?.current?.overall !== undefined) {
      totalSatisfaction += settlement.needSatisfaction.current.overall;
      satisfactionCount++;
      if (settlement.needSatisfaction.current.overall < 0.4) {
        crisisCount++;
      }
    }
  });
  
  if (satisfactionCount > 0) {
    console.log(`Total Settlements with Need Data: ${satisfactionCount}`);
    console.log(`Average Satisfaction: ${(totalSatisfaction / satisfactionCount * 100).toFixed(1)}%`);
    console.log(`Settlements in Crisis: ${crisisCount}`);
    
    if (crisisCount > 0) {
      console.log('\n⚠️  SETTLEMENTS REQUIRING IMMEDIATE ATTENTION:');
      settlements
        .filter(s => s.needSatisfaction?.current?.overall < 0.4)
        .forEach(s => {
          console.log(`  • ${s.name} (${(s.needSatisfaction.current.overall * 100).toFixed(1)}%)`);
        });
    }
  } else {
    console.log('⚠️  No need satisfaction data available.');
    console.log('   Enable need tracking in your settlements to see economic health metrics.');
  }
  
  // Migration pressure analysis (simplified without service dependencies)
  if (satisfactionCount > 1) {
    console.log('\n🚶 POTENTIAL MIGRATION PATTERNS:');
    const sortedSettlements = settlements
      .filter(s => s.needSatisfaction?.current?.overall !== undefined)
      .sort((a, b) => b.needSatisfaction.current.overall - a.needSatisfaction.current.overall);
    
    if (sortedSettlements.length >= 2) {
      const best = sortedSettlements[0];
      const worst = sortedSettlements[sortedSettlements.length - 1];
      const gap = best.needSatisfaction.current.overall - worst.needSatisfaction.current.overall;
      
      if (gap > 0.3) {
        console.log(`  ${worst.name} → ${best.name}`);
        console.log(`    Satisfaction gap: ${(gap * 100).toFixed(1)}%`);
        console.log(`    Reason: Significantly better living conditions`);
      }
    }
  }
} else {
  console.log('⚠️  No settlements to analyze.');
}

// ==================== RECOMMENDATIONS ====================
console.log('\n═══════════════════════════════════════════════════════');
console.log('  RECOMMENDATIONS');
console.log('═══════════════════════════════════════════════════════\n');

let recommendations = [];

// Check for settlements without resources
settlements.forEach(settlement => {
  if (!settlement.resources || Object.keys(settlement.resources.amounts || {}).length === 0) {
    recommendations.push(`⚠️  ${settlement.name} has no resource tracking. Consider adding resource data.`);
  }
  
  // Check for negative production chains
  if (settlement.resources) {
    const prod = settlement.resources.production || {};
    const cons = settlement.resources.consumption || {};
    
    Object.keys(cons).forEach(resource => {
      const production = prod[resource] || 0;
      const consumption = cons[resource] || 0;
      
      if (consumption > production) {
        recommendations.push(`⚠️  ${settlement.name} consumes more ${resource} than it produces. Consider adding production buildings or trade agreements.`);
      }
    });
  }
  
  // Check for low need satisfaction
  if (settlement.needSatisfaction?.current?.overall < 0.6) {
    recommendations.push(`⚠️  ${settlement.name} has low need satisfaction (${(settlement.needSatisfaction.current.overall * 100).toFixed(1)}%). Review resource production and consumption.`);
  }
});

// Check for isolated settlements (no trade)
settlements.forEach(settlement => {
  if (!settlement.economy?.trade || settlement.economy.trade.length === 0) {
    if (settlements.length > 1) {
      recommendations.push(`💡 ${settlement.name} has no trade relationships. Consider establishing trade with other settlements.`);
    }
  }
});

// Check for unutilized nodes
const unusedNodes = nodes.filter(node => !node.settlementId);
if (unusedNodes.length > 0) {
  recommendations.push(`💡 ${unusedNodes.length} node(s) are not linked to any settlement. Consider assigning them for resource production.`);
}

if (recommendations.length === 0) {
  console.log('✅ No critical issues detected. Your world appears well-balanced!\n');
} else {
  recommendations.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec}`);
  });
  console.log('');
}

console.log('═══════════════════════════════════════════════════════');
console.log('  ASSESSMENT COMPLETE');
console.log('═══════════════════════════════════════════════════════\n');
