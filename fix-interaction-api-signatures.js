#!/usr/bin/env node

/**
 * Script to fix API signature changes in interaction tests
 * Converts: interaction.canExecute({ character, world })
 * To: interaction.canExecute(character, world)
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
  'sim-engine/src/test/unit/RestInteraction.test.js',
  'sim-engine/src/test/unit/ExamineInteraction.test.js',
  'sim-engine/src/test/unit/PerceptionInteraction.test.js',
  'sim-engine/src/test/unit/MovementInteraction.test.js'
];

console.log('🔧 Fixing API signature changes in interaction tests\n');

testFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${filePath} (not found)`);
    return;
  }
  
  console.log(`📝 Processing: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changeCount = 0;
  
  // Fix canExecute calls with object parameter
  const canExecuteRegex = /\.canExecute\(\s*\{\s*character:\s*(\w+),\s*world:\s*(\w+)\s*\}\s*\)/g;
  content = content.replace(canExecuteRegex, (match, charVar, worldVar) => {
    changeCount++;
    return `.canExecute(${charVar}, ${worldVar})`;
  });
  
  // Fix execute calls with object parameter
  const executeRegex = /\.execute\(\s*\{\s*character:\s*(\w+),\s*world:\s*(\w+)\s*\}\s*\)/g;
  content = content.replace(executeRegex, (match, charVar, worldVar) => {
    changeCount++;
    return `.execute(${charVar}, ${worldVar})`;
  });
  
  if (changeCount > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`   ✅ Fixed ${changeCount} calls\n`);
  } else {
    console.log(`   ℹ️  No changes needed\n`);
  }
});

console.log('✅ API signature fixes complete!');
console.log('\n📊 Next Steps:');
console.log('   Run: cd sim-engine && npm test -- RestInteraction');
console.log('   to verify the fixes work\n');
