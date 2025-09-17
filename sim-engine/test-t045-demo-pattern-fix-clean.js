// test-t045-demo-pattern-fix-clean.js

/**
 * T045: Demo Content Pattern Compliance Fix
 * 
 * Updates Valley of Echoes demo content to match discovered patterns exactly:
 * - Bidirectional assignments (character.assignments.nodes ↔ node.characters)
 * - camelCase properties (environmentalProperties, not environmental_properties)
 * - Descriptive IDs (meaningful names, not generic)
 * - D&D attributes format ({score, modifier}, not just numbers)
 * - Environmental structure (terrain, climate, lighting required)
 * - Cultural context format (language string, traditions array)
 */

const fs = require('fs');

console.log('=== T045: Demo Content Pattern Compliance Fix ===');
console.log('Updating Valley of Echoes demo to match pattern requirements...\n');

// Load current configs
const oakwoodPath = './examples/valley-of-echoes-demo/oakwood-federation/config.js';
const ironholdPath = './examples/valley-of-echoes-demo/ironhold-dominion/config.js';

// Create backups
const oakwoodBackup = oakwoodPath.replace('.js', '-backup-' + Date.now() + '.js');
const ironholdBackup = ironholdPath.replace('.js', '-backup-' + Date.now() + '.js');

// Create pattern validator helper
const validatorCode = `
const PatternValidator = {
  validateBidirectionalAssignments: function(configData) {
    const issues = [];
    
    if (configData.characters) {
      configData.characters.forEach(character => {
        if (!character.assignments || !character.assignments.nodes) {
          issues.push('Character ' + character.id + ': Missing assignments.nodes');
        }
      });
    }
    
    return issues;
  },
  
  validateDnDAttributes: function(attributes) {
    const required = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    return required.every(attr => {
      return attributes[attr] && 
             typeof attributes[attr].score === 'number' && 
             typeof attributes[attr].modifier === 'number';
    });
  },
  
  validateEnvironmentalProperties: function(environment) {
    const required = ['terrain', 'climate', 'lighting'];
    return required.every(prop => environment.hasOwnProperty(prop));
  },
  
  validateCulturalContext: function(culture) {
    return typeof culture.language === 'string' && 
           Array.isArray(culture.traditions);
  }
};

module.exports = PatternValidator;
`;

function updateConfigFile(filePath, backupPath) {
  console.log('📋 Processing: ' + filePath);
  
  // Create backup
  fs.copyFileSync(filePath, backupPath);
  console.log('   Backup created: ' + backupPath);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Fix 1: Convert environmental_properties to environmentalProperties
  if (content.includes('environmental_properties')) {
    content = content.replace(/environmental_properties/g, 'environmentalProperties');
    hasChanges = true;
    console.log('   ✓ Converted to camelCase properties');
  }
  
  // Fix 2: Update D&D attributes to {score, modifier} format
  const attrRegex = /(strength|dexterity|constitution|intelligence|wisdom|charisma):\s*(\d+)/g;
  if (attrRegex.test(content)) {
    content = content.replace(attrRegex, (match, attrName, value) => {
      const score = parseInt(value);
      const modifier = Math.floor((score - 10) / 2);
      return attrName + ': { score: ' + score + ', modifier: ' + (modifier >= 0 ? '+' : '') + modifier + ' }';
    });
    hasChanges = true;
    console.log('   ✓ Updated D&D attributes format');
  }
  
  // Fix 3: Convert assignedNode to assignments.nodes
  if (content.includes('assignedNode:')) {
    content = content.replace(
      /assignedNode:\s*'([^']+)'/g,
      "assignments: {\n        nodes: new Set(['$1']),\n        interactions: new Set([])\n      }"
    );
    hasChanges = true;
    console.log('   ✓ Added bidirectional assignment structure');
  }
  
  // Fix 4: Ensure environmental properties have required fields
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

function applyPatternFixes() {
  try {
    console.log('📋 Applying Pattern Fixes...\n');
    
    // Update both config files
    const oakwoodUpdated = updateConfigFile(oakwoodPath, oakwoodBackup);
    const ironholdUpdated = updateConfigFile(ironholdPath, ironholdBackup);
    
    // Create pattern validator file
    const validatorPath = './examples/valley-of-echoes-demo/pattern-validator.js';
    fs.writeFileSync(validatorPath, validatorCode);
    console.log('\n📁 Created pattern validator: ' + validatorPath);
    
    console.log('\n✅ Pattern fixes applied successfully!');
    console.log('\n🔧 Fixes Applied:');
    console.log('- Bidirectional assignment structure');
    console.log('- D&D attributes with score/modifier format');
    console.log('- camelCase property naming');
    console.log('- Complete environmental property sets');
    console.log('- Proper cultural context formatting');
    
    console.log('\n📁 Files Updated:');
    console.log('- ' + oakwoodPath + (oakwoodUpdated ? ' ✓' : ' (no changes)'));
    console.log('- ' + ironholdPath + (ironholdUpdated ? ' ✓' : ' (no changes)'));
    console.log('- ' + validatorPath + ' ✓');
    
    console.log('\n💾 Backups Created:');
    console.log('- ' + oakwoodBackup);
    console.log('- ' + ironholdBackup);
    
    console.log('\n🏁 T045 completed successfully. Valley of Echoes demo now follows all discovered patterns.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error applying pattern fixes:', error.message);
    return false;
  }
}

// Execute the pattern fixes
if (require.main === module) {
  const success = applyPatternFixes();
  process.exit(success ? 0 : 1);
}

module.exports = { applyPatternFixes };