// Simple validation script to check if our test files have basic syntax issues

const fs = require('fs');
const path = require('path');

console.log('Validating test files...');

const testFiles = [
  'src/presentation/components/ConditionalSimulationInterface.test.js',
  'src/presentation/components/ConditionalSimulationInterface.simple.test.js',
  'src/presentation/contexts/SimulationContext.test.js',
  'src/presentation/contexts/SimulationContext.simple.test.js',
  'src/presentation/pages/MainPage.test.js',
  'src/presentation/pages/MainPage.simple.test.js'
];

testFiles.forEach(testFile => {
  const fullPath = path.join(__dirname, testFile);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic syntax checks
      const hasDescribe = content.includes('describe(');
      const hasTest = content.includes('test(') || content.includes('it(');
      const hasImports = content.includes('import');
      const hasReact = content.includes('import React');
      
      console.log(`\n${testFile}:`);
      console.log(`  ✓ File exists`);
      console.log(`  ${hasDescribe ? '✓' : '✗'} Has describe blocks`);
      console.log(`  ${hasTest ? '✓' : '✗'} Has test cases`);
      console.log(`  ${hasImports ? '✓' : '✗'} Has imports`);
      console.log(`  ${hasReact ? '✓' : '✗'} Imports React`);
      
      // Check for common issues
      const hasUnmatchedBraces = (content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length;
      const hasUnmatchedParens = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
      
      if (hasUnmatchedBraces) {
        console.log(`  ⚠ Warning: Unmatched braces detected`);
      }
      if (hasUnmatchedParens) {
        console.log(`  ⚠ Warning: Unmatched parentheses detected`);
      }
      
    } else {
      console.log(`\n${testFile}:`);
      console.log(`  ✗ File does not exist`);
    }
  } catch (error) {
    console.log(`\n${testFile}:`);
    console.log(`  ✗ Error reading file: ${error.message}`);
  }
});

console.log('\nValidation complete.');

// Check if main components exist
const mainFiles = [
  'src/presentation/components/ConditionalSimulationInterface.js',
  'src/presentation/contexts/SimulationContext.js',
  'src/presentation/pages/MainPage.js',
  'src/template/TemplateManager.js',
  'src/App.js'
];

console.log('\nChecking main component files...');

mainFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
});

console.log('\nComponent validation complete.');