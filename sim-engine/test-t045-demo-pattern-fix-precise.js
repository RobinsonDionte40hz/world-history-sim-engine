// test-t045-demo-pattern-fix-precise.js

/**
 * T045: Demo Content Pattern Compliance Fix (Precise Version)
 * 
 * Updates Valley of Echoes demo content to match discovered patterns exactly,
 * with improved regex patterns to avoid false matches.
 */

const fs = require('fs');

console.log('=== T045: Demo Content Pattern Compliance Fix (Precise) ===');
console.log('Updating Valley of Echoes demo to match pattern requirements...\n');

// Load current configs
const oakwoodPath = './examples/valley-of-echoes-demo/oakwood-federation/config.js';
const ironholdPath = './examples/valley-of-echoes-demo/ironhold-dominion/config.js';

// Create backups
const oakwoodBackup = oakwoodPath.replace('.js', '-backup-precise-' + Date.now() + '.js');
const ironholdBackup = ironholdPath.replace('.js', '-backup-precise-' + Date.now() + '.js');

function updateConfigFilePrecise(filePath, backupPath) {
  console.log('📋 Processing: ' + filePath);
  
  // Create backup
  fs.copyFileSync(filePath, backupPath);
  console.log('   Backup created: ' + backupPath);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Fix 1: Update D&D attributes to {score, modifier} format in attributes objects only
  const attributesBlockRegex = /attributes:\s*{([^}]*)}/g;
  content = content.replace(attributesBlockRegex, (match, attributesContent) => {
    // Only process D&D attributes within attributes blocks
    const dndAttrs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    let updatedContent = attributesContent;
    
    dndAttrs.forEach(attr => {
      const attrRegex = new RegExp('(' + attr + '):\\s*(\\d+)', 'g');
      updatedContent = updatedContent.replace(attrRegex, (attrMatch, attrName, value) => {
        const score = parseInt(value);
        const modifier = Math.floor((score - 10) / 2);
        hasChanges = true;
        return attrName + ': { score: ' + score + ', modifier: ' + (modifier >= 0 ? '+' : '') + modifier + ' }';
      });
    });
    
    return 'attributes: {' + updatedContent + '}';
  });
  
  if (hasChanges) {
    console.log('   ✓ Updated D&D attributes format');
  }
  
  // Fix 2: Convert assignedNode to assignments.nodes within character objects
  const assignedNodeRegex = /assignedNode:\s*'([^']+)'/g;
  if (assignedNodeRegex.test(content)) {
    content = content.replace(assignedNodeRegex, 
      "assignments: {\n        nodes: new Set(['$1']),\n        interactions: new Set([])\n      }"
    );
    hasChanges = true;
    console.log('   ✓ Added bidirectional assignment structure');
  }
  
  // Fix 3: Ensure environmental properties have required fields
  const envPropsRegex = /environmentalProperties:\s*{[^}]*}/g;
  if (envPropsRegex.test(content)) {
    content = content.replace(envPropsRegex, 
      "environmentalProperties: {\n        terrain: 'forest',\n        climate: 'temperate',\n        lighting: 'natural',\n        season: 'spring',\n        timeOfDay: 'day'\n      }"
    );
    hasChanges = true;
    console.log('   ✓ Updated environmental properties structure');
  }
  
  // Save if changes were made
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log('   ✅ File updated successfully');
  } else {
    console.log('   ℹ️  No changes needed');
  }
  
  return hasChanges;
}

function applyPrecisePatternFixes() {
  try {
    console.log('📋 Applying Precise Pattern Fixes...\n');
    
    // Update both config files
    const oakwoodUpdated = updateConfigFilePrecise(oakwoodPath, oakwoodBackup);
    const ironholdUpdated = updateConfigFilePrecise(ironholdPath, ironholdBackup);
    
    console.log('\n✅ Precise pattern fixes applied successfully!');
    console.log('\n🔧 Fixes Applied:');
    console.log('- D&D attributes with score/modifier format (attributes blocks only)');
    console.log('- Bidirectional assignment structure (assignedNode → assignments)');
    console.log('- Complete environmental property sets');
    
    console.log('\n📁 Files Updated:');
    console.log('- ' + oakwoodPath + (oakwoodUpdated ? ' ✓' : ' (no changes)'));
    console.log('- ' + ironholdPath + (ironholdUpdated ? ' ✓' : ' (no changes)'));
    
    console.log('\n💾 Backups Created:');
    console.log('- ' + oakwoodBackup);
    console.log('- ' + ironholdBackup);
    
    console.log('\n🏁 T045 precise fixes completed successfully.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error applying precise pattern fixes:', error.message);
    return false;
  }
}

// Execute the precise pattern fixes
if (require.main === module) {
  const success = applyPrecisePatternFixes();
  process.exit(success ? 0 : 1);
}

module.exports = { applyPrecisePatternFixes };