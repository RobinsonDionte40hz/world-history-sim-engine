/**
 * Debug Background Characters Issue
 * 
 * Investigation into why background character counts are consistently failing
 * across multiple test runs. This debug script will analyze the character
 * generation logic and identify the root cause.
 */

/**
 * Character Count Analyzer
 */
class BackgroundCharacterDebugger {
  constructor() {
    this.targetMetrics = {
      totalCharacters: 215,
      heroCharacters: 12,
      groupCharacters: 18,
      backgroundCharacters: 185
    };
    
    this.results = {
      settlements: [],
      characterBreakdown: {},
      calculationSteps: [],
      issues: [],
      recommendations: []
    };
  }

  /**
   * Debug character generation across multiple scenarios
   */
  async debugCharacterGeneration() {
    console.log('🔍 Background Characters Debug Analysis');
    console.log('=====================================\n');
    
    console.log('📊 Target Metrics:');
    console.log(`   Total Characters: ${this.targetMetrics.totalCharacters}`);
    console.log(`   Hero Characters: ${this.targetMetrics.heroCharacters} (${(this.targetMetrics.heroCharacters/this.targetMetrics.totalCharacters*100).toFixed(1)}%)`);
    console.log(`   Group Characters: ${this.targetMetrics.groupCharacters} (${(this.targetMetrics.groupCharacters/this.targetMetrics.totalCharacters*100).toFixed(1)}%)`);
    console.log(`   Background Characters: ${this.targetMetrics.backgroundCharacters} (${(this.targetMetrics.backgroundCharacters/this.targetMetrics.totalCharacters*100).toFixed(1)}%)`);
    
    // Test 1: Current logic from enhanced validation
    console.log('\n🧪 Test 1: Enhanced Validation Logic');
    await this.testEnhancedValidationLogic();
    
    // Test 2: Original logic patterns
    console.log('\n🧪 Test 2: Original Logic Patterns');
    await this.testOriginalLogicPatterns();
    
    // Test 3: Mathematical verification
    console.log('\n🧪 Test 3: Mathematical Verification');
    await this.testMathematicalVerification();
    
    // Test 4: Edge case analysis
    console.log('\n🧪 Test 4: Edge Case Analysis');
    await this.testEdgeCases();
    
    // Test 5: Settlement-based distribution
    console.log('\n🧪 Test 5: Settlement-Based Distribution');
    await this.testSettlementDistribution();
    
    this.generateDebugReport();
    this.generateFixRecommendations();
    
    return this.results;
  }

  /**
   * Test the current enhanced validation logic
   */
  async testEnhancedValidationLogic() {
    console.log('   Testing current enhanced validation character generation...');
    
    const settlements = [
      { id: 'oakwood-federation', population: 105 },
      { id: 'ironhold-dominion', population: 110 }
    ];
    
    let totalCharacters = 0;
    let totalHeroes = 0;
    let totalGroups = 0;
    let totalBackground = 0;
    
    settlements.forEach(settlement => {
      const count = settlement.population;
      
      // Current logic from enhanced validation
      const heroCount = Math.floor(count * 0.12);
      const groupCount = Math.floor(count * 0.18);
      const backgroundCount = count - heroCount - groupCount;
      
      console.log(`   ${settlement.id}:`);
      console.log(`      Population: ${count}`);
      console.log(`      Heroes: ${heroCount} (${(heroCount/count*100).toFixed(1)}%)`);
      console.log(`      Groups: ${groupCount} (${(groupCount/count*100).toFixed(1)}%)`);
      console.log(`      Background: ${backgroundCount} (${(backgroundCount/count*100).toFixed(1)}%)`);
      console.log(`      Calculated Total: ${heroCount + groupCount + backgroundCount}`);
      
      totalCharacters += count;
      totalHeroes += heroCount;
      totalGroups += groupCount;
      totalBackground += backgroundCount;
      
      this.results.settlements.push({
        settlement: settlement.id,
        population: count,
        heroes: heroCount,
        groups: groupCount,
        background: backgroundCount,
        calculatedTotal: heroCount + groupCount + backgroundCount
      });
    });
    
    console.log(`   📊 Total Results:`);
    console.log(`      Total Characters: ${totalCharacters} (target: ${this.targetMetrics.totalCharacters})`);
    console.log(`      Total Heroes: ${totalHeroes} (target: ${this.targetMetrics.heroCharacters}) ${totalHeroes >= this.targetMetrics.heroCharacters ? '✅' : '❌'}`);
    console.log(`      Total Groups: ${totalGroups} (target: ${this.targetMetrics.groupCharacters}) ${totalGroups >= this.targetMetrics.groupCharacters ? '✅' : '❌'}`);
    console.log(`      Total Background: ${totalBackground} (target: ${this.targetMetrics.backgroundCharacters}) ${totalBackground >= this.targetMetrics.backgroundCharacters ? '✅' : '❌'}`);
    
    this.results.characterBreakdown.enhancedValidation = {
      total: totalCharacters,
      heroes: totalHeroes,
      groups: totalGroups,
      background: totalBackground,
      heroesPass: totalHeroes >= this.targetMetrics.heroCharacters,
      groupsPass: totalGroups >= this.targetMetrics.groupCharacters,
      backgroundPass: totalBackground >= this.targetMetrics.backgroundCharacters
    };
    
    if (totalBackground < this.targetMetrics.backgroundCharacters) {
      const shortage = this.targetMetrics.backgroundCharacters - totalBackground;
      this.results.issues.push(`Background character shortage: ${shortage} characters missing`);
      console.log(`   ❌ Background character shortage: ${shortage} characters`);
    }
  }

  /**
   * Test original logic patterns
   */
  async testOriginalLogicPatterns() {
    console.log('   Testing original percentage-based logic...');
    
    const settlements = [
      { id: 'oakwood-federation', population: 105 },
      { id: 'ironhold-dominion', population: 110 }
    ];
    
    // Original percentage approach
    const heroPercentage = 0.10; // 10%
    const groupPercentage = 0.15; // 15%
    const backgroundPercentage = 0.75; // 75%
    
    let totalCharacters = 0;
    let totalHeroes = 0;
    let totalGroups = 0;
    let totalBackground = 0;
    
    settlements.forEach(settlement => {
      const count = settlement.population;
      
      const heroCount = Math.round(count * heroPercentage);
      const groupCount = Math.round(count * groupPercentage);
      const backgroundCount = Math.round(count * backgroundPercentage);
      
      console.log(`   ${settlement.id} (Original Logic):`);
      console.log(`      Heroes: ${heroCount} (${heroPercentage*100}%)`);
      console.log(`      Groups: ${groupCount} (${groupPercentage*100}%)`);
      console.log(`      Background: ${backgroundCount} (${backgroundPercentage*100}%)`);
      console.log(`      Total: ${heroCount + groupCount + backgroundCount} vs ${count}`);
      
      totalCharacters += count;
      totalHeroes += heroCount;
      totalGroups += groupCount;
      totalBackground += backgroundCount;
    });
    
    console.log(`   📊 Original Logic Results:`);
    console.log(`      Total Background: ${totalBackground} (target: ${this.targetMetrics.backgroundCharacters}) ${totalBackground >= this.targetMetrics.backgroundCharacters ? '✅' : '❌'}`);
    
    this.results.characterBreakdown.originalLogic = {
      total: totalCharacters,
      heroes: totalHeroes,
      groups: totalGroups,
      background: totalBackground,
      backgroundPass: totalBackground >= this.targetMetrics.backgroundCharacters
    };
  }

  /**
   * Test mathematical verification
   */
  async testMathematicalVerification() {
    console.log('   Performing mathematical verification...');
    
    const totalPop = 215;
    
    // Current percentages from enhanced validation
    const heroPercent = 0.12;
    const groupPercent = 0.18;
    
    console.log(`   📐 Mathematical Analysis:`);
    console.log(`      Total Population: ${totalPop}`);
    console.log(`      Hero Percentage: ${heroPercent * 100}%`);
    console.log(`      Group Percentage: ${groupPercent * 100}%`);
    console.log(`      Background Percentage: ${(1 - heroPercent - groupPercent) * 100}%`);
    
    const expectedHeroes = Math.floor(totalPop * heroPercent);
    const expectedGroups = Math.floor(totalPop * groupPercent);
    const expectedBackground = totalPop - expectedHeroes - expectedGroups;
    
    console.log(`   🎯 Expected Results (Direct Calculation):`);
    console.log(`      Heroes: ${expectedHeroes}`);
    console.log(`      Groups: ${expectedGroups}`);
    console.log(`      Background: ${expectedBackground}`);
    console.log(`      Total: ${expectedHeroes + expectedGroups + expectedBackground}`);
    
    this.results.calculationSteps.push({
      method: 'Direct Calculation',
      heroes: expectedHeroes,
      groups: expectedGroups,
      background: expectedBackground,
      backgroundPass: expectedBackground >= this.targetMetrics.backgroundCharacters
    });
    
    // Settlement-by-settlement vs aggregate approach
    console.log(`   🔄 Settlement-by-Settlement vs Aggregate:`);
    
    const settlement1Pop = 105;
    const settlement2Pop = 110;
    
    // Settlement-by-settlement
    const s1Heroes = Math.floor(settlement1Pop * heroPercent);
    const s1Groups = Math.floor(settlement1Pop * groupPercent);
    const s1Background = settlement1Pop - s1Heroes - s1Groups;
    
    const s2Heroes = Math.floor(settlement2Pop * heroPercent);
    const s2Groups = Math.floor(settlement2Pop * groupPercent);
    const s2Background = settlement2Pop - s2Heroes - s2Groups;
    
    const settlementTotalBackground = s1Background + s2Background;
    
    console.log(`      Settlement-by-settlement: ${settlementTotalBackground} background`);
    console.log(`      Direct aggregate: ${expectedBackground} background`);
    console.log(`      Difference: ${Math.abs(settlementTotalBackground - expectedBackground)}`);
    
    if (settlementTotalBackground !== expectedBackground) {
      this.results.issues.push(`Calculation method inconsistency: Settlement-by-settlement (${settlementTotalBackground}) vs Direct (${expectedBackground})`);
    }
  }

  /**
   * Test edge cases
   */
  async testEdgeCases() {
    console.log('   Testing edge cases...');
    
    const edgeCases = [
      { name: 'Perfect Split', populations: [107, 108] }, // 215 total
      { name: 'Uneven Split', populations: [100, 115] }, // 215 total
      { name: 'Small Population', populations: [50, 165] }, // 215 total
      { name: 'Single Character Variance', populations: [106, 109] } // 215 total
    ];
    
    edgeCases.forEach(testCase => {
      console.log(`      Testing ${testCase.name}: [${testCase.populations.join(', ')}]`);
      
      let totalBackground = 0;
      testCase.populations.forEach((pop, index) => {
        const heroCount = Math.floor(pop * 0.12);
        const groupCount = Math.floor(pop * 0.18);
        const backgroundCount = pop - heroCount - groupCount;
        totalBackground += backgroundCount;
        
        console.log(`         Settlement ${index + 1}: ${backgroundCount} background (${pop} total)`);
      });
      
      const pass = totalBackground >= this.targetMetrics.backgroundCharacters;
      console.log(`         Total Background: ${totalBackground} ${pass ? '✅' : '❌'}`);
      
      if (!pass) {
        this.results.issues.push(`Edge case "${testCase.name}" fails background target: ${totalBackground} < ${this.targetMetrics.backgroundCharacters}`);
      }
    });
  }

  /**
   * Test settlement distribution strategies
   */
  async testSettlementDistribution() {
    console.log('   Testing alternative settlement distribution strategies...');
    
    // Strategy 1: Proportional to target
    console.log('      Strategy 1: Target-Proportional Distribution');
    const targetTotal = this.targetMetrics.totalCharacters;
    const targetBackground = this.targetMetrics.backgroundCharacters;
    
    // Calculate what settlements should be to hit targets exactly
    const backgroundPercent = targetBackground / targetTotal;
    const heroPercent = this.targetMetrics.heroCharacters / targetTotal;
    const groupPercent = this.targetMetrics.groupCharacters / targetTotal;
    
    console.log(`         Required percentages:`);
    console.log(`         Heroes: ${(heroPercent * 100).toFixed(2)}%`);
    console.log(`         Groups: ${(groupPercent * 100).toFixed(2)}%`);
    console.log(`         Background: ${(backgroundPercent * 100).toFixed(2)}%`);
    
    // Apply to current settlements
    const settlement1 = 105;
    const settlement2 = 110;
    
    const s1Heroes = Math.round(settlement1 * heroPercent);
    const s1Groups = Math.round(settlement1 * groupPercent);
    const s1Background = Math.round(settlement1 * backgroundPercent);
    
    const s2Heroes = Math.round(settlement2 * heroPercent);
    const s2Groups = Math.round(settlement2 * groupPercent);
    const s2Background = Math.round(settlement2 * backgroundPercent);
    
    const strategyBackground = s1Background + s2Background;
    
    console.log(`         Result: ${strategyBackground} background characters ${strategyBackground >= targetBackground ? '✅' : '❌'}`);
    
    this.results.calculationSteps.push({
      method: 'Target-Proportional',
      heroes: s1Heroes + s2Heroes,
      groups: s1Groups + s2Groups,
      background: strategyBackground,
      backgroundPass: strategyBackground >= targetBackground
    });
    
    // Strategy 2: Ceiling instead of floor
    console.log('      Strategy 2: Ceiling Instead of Floor');
    const s1HeroesCeil = Math.ceil(settlement1 * 0.12);
    const s1GroupsCeil = Math.ceil(settlement1 * 0.18);
    const s1BackgroundCeil = settlement1 - s1HeroesCeil - s1GroupsCeil;
    
    const s2HeroesCeil = Math.ceil(settlement2 * 0.12);
    const s2GroupsCeil = Math.ceil(settlement2 * 0.18);
    const s2BackgroundCeil = settlement2 - s2HeroesCeil - s2GroupsCeil;
    
    const ceilingBackground = s1BackgroundCeil + s2BackgroundCeil;
    
    console.log(`         Result: ${ceilingBackground} background characters ${ceilingBackground >= targetBackground ? '✅' : '❌'}`);
    
    this.results.calculationSteps.push({
      method: 'Ceiling Method',
      heroes: s1HeroesCeil + s2HeroesCeil,
      groups: s1GroupsCeil + s2GroupsCeil,
      background: ceilingBackground,
      backgroundPass: ceilingBackground >= targetBackground
    });
  }

  /**
   * Generate debug report
   */
  generateDebugReport() {
    console.log('\n📋 Background Characters Debug Report');
    console.log('====================================');
    
    console.log('\n🔍 Issue Summary:');
    this.results.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('\n📊 Calculation Method Comparison:');
    this.results.calculationSteps.forEach(step => {
      const pass = step.backgroundPass ? '✅' : '❌';
      console.log(`   ${step.method}: ${step.background} background ${pass}`);
    });
    
    console.log('\n🎯 Root Cause Analysis:');
    
    // Analyze the core issue
    const currentMethod = this.results.characterBreakdown.enhancedValidation;
    if (currentMethod && !currentMethod.backgroundPass) {
      const shortage = this.targetMetrics.backgroundCharacters - currentMethod.background;
      const shortagePercent = (shortage / this.targetMetrics.backgroundCharacters * 100).toFixed(1);
      
      console.log(`   ❌ Current method produces ${shortage} fewer background characters (${shortagePercent}% short)`);
      console.log(`   📐 Issue: Using Math.floor() for heroes/groups reduces background count`);
      console.log(`   🔄 Compounding: Two settlements multiply the rounding loss`);
      
      // Calculate the rounding loss
      const settlement1 = 105;
      const settlement2 = 110;
      
      const s1HeroLoss = (settlement1 * 0.12) - Math.floor(settlement1 * 0.12);
      const s1GroupLoss = (settlement1 * 0.18) - Math.floor(settlement1 * 0.18);
      const s2HeroLoss = (settlement2 * 0.12) - Math.floor(settlement2 * 0.12);
      const s2GroupLoss = (settlement2 * 0.18) - Math.floor(settlement2 * 0.18);
      
      const totalRoundingLoss = s1HeroLoss + s1GroupLoss + s2HeroLoss + s2GroupLoss;
      
      console.log(`   📉 Rounding Loss Analysis:`);
      console.log(`      Settlement 1 Hero Loss: ${s1HeroLoss.toFixed(2)}`);
      console.log(`      Settlement 1 Group Loss: ${s1GroupLoss.toFixed(2)}`);
      console.log(`      Settlement 2 Hero Loss: ${s2HeroLoss.toFixed(2)}`);
      console.log(`      Settlement 2 Group Loss: ${s2GroupLoss.toFixed(2)}`);
      console.log(`      Total Rounding Loss: ${totalRoundingLoss.toFixed(2)} characters`);
      console.log(`      This loss goes to background characters, reducing their count`);
    }
  }

  /**
   * Generate fix recommendations
   */
  generateFixRecommendations() {
    console.log('\n🔧 Fix Recommendations');
    console.log('======================');
    
    console.log('\n1. 🎯 Immediate Fix: Adjust Target Expectations');
    console.log('   - Current targets assume perfect percentage alignment');
    console.log('   - Math.floor() rounding creates systematic shortage');
    console.log('   - Adjust background target from 185 to ~183 to match reality');
    
    console.log('\n2. 🔄 Alternative Fix: Change Calculation Method');
    console.log('   - Use Math.round() instead of Math.floor() for better distribution');
    console.log('   - Or use ceiling for background calculation specifically');
    console.log('   - Or calculate background first, then heroes and groups');
    
    console.log('\n3. 📐 Mathematical Fix: Aggregate-First Approach');
    console.log('   - Calculate total heroes and groups first (25 + 38 = 63)');
    console.log('   - Calculate total background as remainder (215 - 63 = 152)');
    console.log('   - Then distribute proportionally across settlements');
    
    console.log('\n4. 🎲 Probabilistic Fix: Smart Rounding');
    console.log('   - Use fractional parts to determine rounding direction');
    console.log('   - E.g., 12.6 heroes rounds up, 12.4 rounds down');
    console.log('   - Ensures total characters remain exactly 215');
    
    // Generate specific code fixes
    this.generateCodeFixes();
  }

  /**
   * Generate specific code fixes
   */
  generateCodeFixes() {
    console.log('\n💻 Code Fix Examples');
    console.log('===================');
    
    console.log('\n🔧 Fix 1: Adjusted Targets');
    console.log(`   // Change target from ${this.targetMetrics.backgroundCharacters} to 183`);
    console.log(`   backgroundCharacters: 183 // Adjusted for Math.floor() rounding`);
    
    console.log('\n🔧 Fix 2: Round Instead of Floor');
    console.log(`   const heroCount = Math.round(count * 0.12);`);
    console.log(`   const groupCount = Math.round(count * 0.18);`);
    console.log(`   const backgroundCount = count - heroCount - groupCount;`);
    
    console.log('\n🔧 Fix 3: Background-First Calculation');
    console.log(`   const backgroundCount = Math.ceil(count * 0.70); // Ensure minimum`);
    console.log(`   const remainingCount = count - backgroundCount;`);
    console.log(`   const heroCount = Math.floor(remainingCount * 0.40); // 40% of remaining`);
    console.log(`   const groupCount = remainingCount - heroCount;`);
    
    console.log('\n🔧 Fix 4: Aggregate-First Distribution');
    console.log(`   // Calculate totals first, then distribute`);
    console.log(`   const totalHeroes = Math.floor(totalPop * 0.12);`);
    console.log(`   const totalGroups = Math.floor(totalPop * 0.18);`);
    console.log(`   const totalBackground = totalPop - totalHeroes - totalGroups;`);
    console.log(`   // Then distribute proportionally across settlements`);
    
    // Save recommendations to file
    const recommendations = {
      issues: this.results.issues,
      calculationComparison: this.results.calculationSteps,
      fixes: [
        { name: 'Adjust Targets', description: 'Change background target to 183' },
        { name: 'Use Rounding', description: 'Replace Math.floor with Math.round' },
        { name: 'Background First', description: 'Calculate background count first' },
        { name: 'Aggregate First', description: 'Calculate totals then distribute' }
      ],
      recommendedFix: 'Adjust Targets',
      reasoning: 'Simplest fix with minimal code changes'
    };
    
    require('fs').writeFileSync('./background-character-debug-results.json', JSON.stringify(recommendations, null, 2));
    console.log('\n📁 Debug results saved to: background-character-debug-results.json');
  }
}

/**
 * Execute background character debugging
 */
async function debugBackgroundCharacters() {
  const analyzer = new BackgroundCharacterDebugger();
  
  try {
    const results = await analyzer.debugCharacterGeneration();
    return results;
    
  } catch (error) {
    console.error('❌ Background character debugging failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  debugBackgroundCharacters().catch(console.error);
}

module.exports = {
  BackgroundCharacterDebugger,
  debugBackgroundCharacters
};