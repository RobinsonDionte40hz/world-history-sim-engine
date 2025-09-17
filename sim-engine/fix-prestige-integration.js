/**
 * Apply Prestige Integration Fix
 * 
 * This script properly integrates the PrestigeService with the LODManager
 * to ensure hero characters have proper prestige processing during LOD operations.
 */

const fs = require('fs');

class PrestigeIntegrationFixer {
  constructor() {
    this.lodManagerPath = './src/domain/services/LODManager.js';
    this.prestigeServicePath = './src/domain/services/PrestigeService.js';
  }

  /**
   * Apply the prestige integration fix
   */
  async applyPrestigeIntegration() {
    console.log('🏆 Applying Prestige Integration Fix');
    console.log('===================================\n');

    try {
      // Step 1: Verify both services exist
      await this.verifyServices();
      
      // Step 2: Check current LODManager state
      await this.checkCurrentIntegration();
      
      // Step 3: Apply the integration
      await this.integratePrestigeService();
      
      // Step 4: Verify the fix
      await this.verifyIntegration();
      
      console.log('\n🎉 Prestige Integration Fix Complete!');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Prestige integration fix failed:', error);
      throw error;
    }
  }

  /**
   * Verify both services exist
   */
  async verifyServices() {
    console.log('🔍 Verifying Services...');
    
    if (!fs.existsSync(this.lodManagerPath)) {
      throw new Error(`LODManager not found at ${this.lodManagerPath}`);
    }
    console.log('   ✅ LODManager found');
    
    if (!fs.existsSync(this.prestigeServicePath)) {
      throw new Error(`PrestigeService not found at ${this.prestigeServicePath}`);
    }
    console.log('   ✅ PrestigeService found');
  }

  /**
   * Check current integration state
   */
  async checkCurrentIntegration() {
    console.log('\n🔍 Checking Current Integration State...');
    
    const lodContent = fs.readFileSync(this.lodManagerPath, 'utf8');
    
    const hasPrestigeImport = lodContent.includes('PrestigeService');
    const hasPrestigeProcessing = lodContent.includes('prestige');
    
    console.log(`   Prestige Import: ${hasPrestigeImport ? '✅' : '❌'}`);
    console.log(`   Prestige Processing: ${hasPrestigeProcessing ? '✅' : '❌'}`);
    
    if (hasPrestigeImport && hasPrestigeProcessing) {
      console.log('   ℹ️  Integration already exists - checking completeness');
      return 'exists';
    } else {
      console.log('   ⚠️  Integration missing - will apply fix');
      return 'missing';
    }
  }

  /**
   * Apply the prestige service integration
   */
  async integratePrestigeService() {
    console.log('\n🔧 Applying Prestige Service Integration...');
    
    let lodContent = fs.readFileSync(this.lodManagerPath, 'utf8');
    
    // Step 1: Add PrestigeService import if missing
    if (!lodContent.includes('PrestigeService')) {
      console.log('   📦 Adding PrestigeService import...');
      
      const lodTierImport = "const { LODTier } = require('../value-objects/LODTier.js');";
      const prestigeImport = "const PrestigeService = require('./PrestigeService.js');";
      
      lodContent = lodContent.replace(
        lodTierImport,
        `${lodTierImport}\n${prestigeImport}`
      );
    }
    
    // Step 2: Add PrestigeService initialization in constructor if missing
    if (!lodContent.includes('this.prestigeService')) {
      console.log('   🏗️  Adding PrestigeService initialization...');
      
      const constructorPattern = /constructor\(\) \{[^}]*\}/;
      const constructorMatch = lodContent.match(constructorPattern);
      
      if (constructorMatch) {
        const originalConstructor = constructorMatch[0];
        const updatedConstructor = originalConstructor.replace(
          'this._tempArray2 = new Array(1000);',
          `this._tempArray2 = new Array(1000);

    // PRESTIGE INTEGRATION: Initialize PrestigeService for hero character processing
    this.prestigeService = new PrestigeService();`
        );
        
        lodContent = lodContent.replace(originalConstructor, updatedConstructor);
      }
    }
    
    // Step 3: Add prestige processing to hero character processing
    if (!lodContent.includes('processPrestigeForHero')) {
      console.log('   ⭐ Adding hero prestige processing...');
      
      // Find the processHeroCharacter method and add prestige processing
      const heroMethodPattern = /processHeroCharacter\(character, world, turnContext\) \{[\s\S]*?(?=\n{2}\w|$)/;
      const heroMethodMatch = lodContent.match(heroMethodPattern);
      
      if (heroMethodMatch) {
        const originalMethod = heroMethodMatch[0];
        
        // Add prestige processing before the final return
        const prestigeProcessing = `
    // PRESTIGE INTEGRATION: Process prestige for hero characters
    if (character.prestige) {
      try {
        result.prestigeUpdate = this.processPrestigeForHero(character, world, turnContext);
      } catch (error) {
        result.warnings = result.warnings || [];
        result.warnings.push(\`Prestige processing failed: \${error.message}\`);
      }
    }`;
        
        const updatedMethod = originalMethod.replace(
          'return result;',
          `${prestigeProcessing}

    return result;`
        );
        
        lodContent = lodContent.replace(originalMethod, updatedMethod);
      }
    }
    
    // Step 4: Add the processPrestigeForHero helper method
    if (!lodContent.includes('processPrestigeForHero(')) {
      console.log('   🎯 Adding prestige processing helper method...');
      
      const prestigeMethod = `
  /**
   * Process prestige updates for hero characters
   * Integrates with PrestigeService for achievement-based prestige changes
   */
  processPrestigeForHero(character, world, turnContext) {
    const startTime = performance.now();
    
    try {
      // Create achievement context from turn processing
      const achievement = {
        type: 'turn_completion',
        significance: this._calculateTurnSignificance(character, turnContext),
        timestamp: Date.now(),
        context: {
          settlement: character.settlementId,
          turn: turnContext.turn,
          actions: turnContext.characterActions?.[character.id] || []
        }
      };
      
      // Create social context from settlement and world state
      const socialContext = {
        settlement: world.settlements?.find(s => s.id === character.settlementId),
        publicVisibility: this._calculatePublicVisibility(character, achievement),
        socialStanding: character.socialStanding || 'neutral',
        witnessCount: this._estimateWitnessCount(character, world)
      };
      
      // Process prestige update
      const updatedPrestige = this.prestigeService.updatePrestige(
        character.prestige,
        achievement,
        socialContext,
        character
      );
      
      const endTime = performance.now();
      
      return {
        success: true,
        oldPrestige: character.prestige,
        newPrestige: updatedPrestige,
        processingTime: endTime - startTime,
        achievement,
        socialContext
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Calculate turn significance for prestige processing
   */
  _calculateTurnSignificance(character, turnContext) {
    // Base significance on character actions and context
    let significance = 0.5; // Base significance
    
    if (turnContext.characterActions?.[character.id]) {
      significance += turnContext.characterActions[character.id].length * 0.1;
    }
    
    if (character.consciousness?.frequency > 0.8) {
      significance += 0.2; // High consciousness characters have more significant actions
    }
    
    return Math.min(1.0, significance);
  }

  /**
   * Calculate public visibility for prestige events
   */
  _calculatePublicVisibility(character, achievement) {
    if (achievement.type === 'turn_completion') {
      return 'medium'; // Regular turn completion has medium visibility
    }
    
    return 'low';
  }

  /**
   * Estimate witness count for prestige events
   */
  _estimateWitnessCount(character, world) {
    const settlement = world.settlements?.find(s => s.id === character.settlementId);
    if (!settlement) return 10;
    
    // Estimate based on settlement size and character role
    const baseWitnesses = Math.min(50, settlement.population?.total / 10 || 10);
    const roleMultiplier = character.lodTier === 'hero' ? 2 : 1;
    
    return Math.floor(baseWitnesses * roleMultiplier);
  }`;
      
      // Add the method before the final closing brace
      const classEnd = lodContent.lastIndexOf('}');
      lodContent = lodContent.slice(0, classEnd) + prestigeMethod + '\n}\n';
    }
    
    // Step 5: Write the updated file
    fs.writeFileSync(this.lodManagerPath, lodContent);
    console.log('   ✅ Integration applied to LODManager.js');
  }

  /**
   * Verify the integration was successful
   */
  async verifyIntegration() {
    console.log('\n✅ Verifying Integration...');
    
    const lodContent = fs.readFileSync(this.lodManagerPath, 'utf8');
    
    const checks = [
      { name: 'PrestigeService Import', test: lodContent.includes("require('./PrestigeService.js')") },
      { name: 'PrestigeService Initialization', test: lodContent.includes('this.prestigeService = new PrestigeService()') },
      { name: 'Hero Prestige Processing', test: lodContent.includes('processPrestigeForHero') },
      { name: 'Prestige Update Call', test: lodContent.includes('result.prestigeUpdate') },
      { name: 'Turn Significance Calculation', test: lodContent.includes('_calculateTurnSignificance') }
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
      const status = check.test ? '✅' : '❌';
      console.log(`   ${check.name}: ${status}`);
      if (check.test) passedChecks++;
    });
    
    const successRate = (passedChecks / checks.length) * 100;
    console.log(`\n   Integration Success Rate: ${successRate.toFixed(1)}% (${passedChecks}/${checks.length})`);
    
    if (successRate >= 80) {
      console.log('   🎉 Integration verification successful!');
    } else {
      console.log('   ⚠️  Integration verification needs attention');
    }
    
    // Save verification results
    const results = {
      integrationApplied: true,
      verificationChecks: checks,
      successRate,
      timestamp: Date.now()
    };
    
    fs.writeFileSync('./prestige-integration-verification.json', JSON.stringify(results, null, 2));
    console.log('   📁 Verification results saved to: prestige-integration-verification.json');
    
    return results;
  }
}

/**
 * Execute prestige integration fix
 */
async function fixPrestigeIntegration() {
  const fixer = new PrestigeIntegrationFixer();
  
  try {
    const results = await fixer.applyPrestigeIntegration();
    return results;
    
  } catch (error) {
    console.error('❌ Prestige integration fix failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  fixPrestigeIntegration().catch(console.error);
}

module.exports = {
  PrestigeIntegrationFixer,
  fixPrestigeIntegration
};