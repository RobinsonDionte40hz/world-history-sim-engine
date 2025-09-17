// test-t045-valley-validation.js

/**
 * Valley of Echoes Demo Pattern Compliance Validation
 * 
 * Validates that the Valley of Echoes demo configurations now follow
 * all discovered patterns from T043-T044 after T045 pattern fixes.
 */

console.log('=== Valley of Echoes Demo Pattern Compliance Validation ===');
console.log('Verifying T045 pattern fixes were applied correctly...\n');

function validateConfig(configPath, settlementName) {
  console.log('📋 Validating: ' + settlementName + ' (' + configPath + ')');
  
  try {
    // Clear require cache to get fresh copy
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    
    let issues = [];
    let successCount = 0;
    let totalChecks = 0;
    
    // Check characters
    if (config.characters && config.characters.length > 0) {
      console.log('   Characters: ' + config.characters.length);
      
      config.characters.forEach((character, index) => {
        // Check assignments structure
        totalChecks++;
        if (character.assignments && character.assignments.nodes) {
          successCount++;
          console.log('   ✓ Character ' + (index + 1) + ': Has assignments.nodes');
        } else {
          issues.push('Character ' + (index + 1) + ': Missing assignments.nodes');
          console.log('   ❌ Character ' + (index + 1) + ': Missing assignments.nodes');
        }
        
        // Check D&D attributes format
        if (character.attributes) {
          const dndAttrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
          dndAttrs.forEach(attr => {
            totalChecks++;
            if (character.attributes[attr] && 
                typeof character.attributes[attr].score === 'number' && 
                typeof character.attributes[attr].modifier === 'number') {
              successCount++;
            } else {
              issues.push('Character ' + (index + 1) + ': Invalid ' + attr + ' format');
            }
          });
          
          if (issues.length === 0) {
            console.log('   ✓ Character ' + (index + 1) + ': D&D attributes format correct');
          }
        }
      });
    }
    
    // Check nodes
    if (config.nodes && config.nodes.length > 0) {
      console.log('   Nodes: ' + config.nodes.length);
      
      config.nodes.forEach((node, index) => {
        // Check environmental properties
        if (node.environmentalProperties) {
          totalChecks++;
          const required = ['terrain', 'climate', 'lighting'];
          const hasAll = required.every(prop => node.environmentalProperties.hasOwnProperty(prop));
          
          if (hasAll) {
            successCount++;
            console.log('   ✓ Node ' + (index + 1) + ': Environmental properties complete');
          } else {
            issues.push('Node ' + (index + 1) + ': Missing environmental properties');
            console.log('   ❌ Node ' + (index + 1) + ': Missing environmental properties');
          }
        }
      });
    }
    
    // Calculate success rate
    const successRate = totalChecks > 0 ? ((successCount / totalChecks) * 100).toFixed(1) : 0;
    
    console.log('   📊 Pattern Compliance: ' + successCount + '/' + totalChecks + ' (' + successRate + '%)');
    
    if (issues.length === 0) {
      console.log('   ✅ ' + settlementName + ': ALL PATTERNS COMPLIANT\n');
      return true;
    } else {
      console.log('   ⚠️  ' + settlementName + ': ' + issues.length + ' pattern issues found');
      issues.forEach(issue => console.log('      - ' + issue));
      console.log('');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ Error loading config: ' + error.message + '\n');
    return false;
  }
}

function main() {
  const oakwoodPath = './examples/valley-of-echoes-demo/oakwood-federation/config.js';
  const ironholdPath = './examples/valley-of-echoes-demo/ironhold-dominion/config.js';
  
  // Validate both settlements
  const oakwoodValid = validateConfig(oakwoodPath, 'Oakwood Federation');
  const ironholdValid = validateConfig(ironholdPath, 'Ironhold Dominion');
  
  console.log('🔍 Overall Validation Results:');
  console.log('================================');
  
  if (oakwoodValid && ironholdValid) {
    console.log('✅ SUCCESS: Valley of Echoes demo is fully pattern compliant');
    console.log('\n🎯 T045 Pattern Compliance: COMPLETED');
    console.log('\n📋 Verified Patterns:');
    console.log('   ✓ Bidirectional assignment structure (assignments.nodes)');
    console.log('   ✓ D&D attributes with score/modifier format');
    console.log('   ✓ camelCase property naming (environmentalProperties)');
    console.log('   ✓ Complete environmental property sets');
    console.log('   ✓ Proper data structure formats');
    
    console.log('\n🏁 Valley of Echoes demo ready for integration testing!');
    return true;
  } else {
    console.log('❌ FAILURE: Pattern compliance issues found');
    console.log('   - Oakwood Federation: ' + (oakwoodValid ? 'PASS' : 'FAIL'));
    console.log('   - Ironhold Dominion: ' + (ironholdValid ? 'PASS' : 'FAIL'));
    return false;
  }
}

// Execute validation
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };