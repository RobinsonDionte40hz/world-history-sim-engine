/**/**/**

 * Debug script to analyze turn processing issues

 */ * Debug script to analyze turn processing and data visibility issues * Debug script to analyze turn processing and data visibility issues



const fs = require('fs'); * This script will help identify why timeline data, NPC interactions, and movement systems aren't working * This script will help identify why timeline data, NPC interactions, and movement systems aren't working

const path = require('path');

 */ */

console.log('🔍 Turn Processing Debug Analysis\n');



// Check key files exist

const keyFiles = [const fs = require('fs');const fs = require('fs');

  'src/application/use-cases/services/SimulationService.js',

  'src/domain/services/HistoryGenerator.js',const path = require('path');const path = require('path');

  'src/presentation/contexts/SimulationContext.js'

];



console.log('1️⃣ Checking Key Files:');console.log('🔍 Starting Turn Processing Debug Analysis\n');// Import the main services

keyFiles.forEach(file => {

  const exists = fs.existsSync(path.join(__dirname, file));const SimulationService = require('./src/application/use-cases/services/SimulationService.js').default;

  console.log(`   ${exists ? '✅' : '❌'} ${file}`);

});// Test 1: Check file structure and key files existenceconst HistoryGenerator = require('./src/domain/services/HistoryGenerator.js').default;



// Check package.json for module configurationconsole.log('1️⃣ Checking File Structure...');const InteractionManager = require('./src/domain/services/InteractionManager.js').default;

console.log('\n2️⃣ Package Configuration:');

const pkgPath = path.join(__dirname, 'package.json');const Character = require('./src/domain/entities/Character.js').default;

if (fs.existsSync(pkgPath)) {

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));const keyFiles = [

  const isModule = pkg.type === 'module';

  console.log(`   Module type: ${isModule ? 'ES6' : 'CommonJS'}`);  'src/application/use-cases/services/SimulationService.js',console.log('🔍 Starting Turn Processing Debug Analysis\n');



  if (!isModule) {  'src/domain/services/HistoryGenerator.js',

    console.log('   ⚠️  Using CommonJS but source files use ES6 imports');

  }  'src/domain/services/InteractionManager.js',// Test 1: Check if simulation service can initialize properly

}

  'src/domain/entities/Character.js',console.log('1️⃣ Testing Simulation Service Initialization...');

// Analyze SimulationService for key methods

console.log('\n3️⃣ SimulationService Analysis:');  'src/application/use-cases/simulation/RunTick.js',try {

const simServicePath = path.join(__dirname, 'src/application/use-cases/services/SimulationService.js');

if (fs.existsSync(simServicePath)) {  'src/application/use-cases/npc/GenerateBehavior.js',  const simulationService = new SimulationService();

  const content = fs.readFileSync(simServicePath, 'utf8');

  'src/presentation/contexts/SimulationContext.js'  console.log('✅ SimulationService created successfully');

  const checks = ['processTurn', 'initialize', 'getCurrentWorldState'];

  checks.forEach(check => {];

    const hasMethod = content.includes(check);

    console.log(`   ${hasMethod ? '✅' : '❌'} Contains ${check}`);  // Check if it has the required methods

  });

keyFiles.forEach(filePath => {  const hasInitialize = typeof simulationService.initialize === 'function';

  const hasDefaultExport = content.includes('export default');

  console.log(`   ${hasDefaultExport ? '✅' : '❌'} Has default export`);  const fullPath = path.join(__dirname, filePath);  const hasProcessTurn = typeof simulationService.processTurn === 'function';

}

  if (fs.existsSync(fullPath)) {  const hasGetCurrentWorldState = typeof simulationService.getCurrentWorldState === 'function';

// Check for ES6 import/export issues

console.log('\n4️⃣ Module System Analysis:');    console.log(`✅ ${filePath} exists`);

const files = [

  'src/application/use-cases/services/SimulationService.js',  console.log(`   - Has initialize method: ${hasInitialize}`);

  'src/domain/services/HistoryGenerator.js',

  'src/presentation/contexts/SimulationContext.js'    // Check if file contains ES6 imports  console.log(`   - Has processTurn method: ${hasProcessTurn}`);

];

    try {  console.log(`   - Has getCurrentWorldState method: ${hasGetCurrentWorldState}`);

files.forEach(file => {

  const filePath = path.join(__dirname, file);      const content = fs.readFileSync(fullPath, 'utf8');

  if (fs.existsSync(filePath)) {

    const content = fs.readFileSync(filePath, 'utf8');      const hasImports = content.includes('import ');  if (!hasInitialize || !hasProcessTurn || !hasGetCurrentWorldState) {

    const hasImports = content.includes('import ');

    const hasExports = content.includes('export ');      const hasExports = content.includes('export ');    console.log('❌ SimulationService is missing critical methods');



    if (hasImports || hasExports) {      console.log(`   - Uses ES6 imports: ${hasImports}`);  } else {

      console.log(`   ⚠️  ${file} uses ES6 modules`);

    }      console.log(`   - Uses ES6 exports: ${hasExports}`);    console.log('✅ SimulationService has all required methods');

  }

});    } catch (error) {  }



console.log('\n📋 RECOMMENDATIONS:');      console.log(`   - Error reading file: ${error.message}`);} catch (error) {

console.log('1. Add "type": "module" to package.json');

console.log('2. Or convert ES6 imports to CommonJS require()');    }  console.log('❌ Failed to create SimulationService:', error.message);

console.log('3. Check browser console for runtime errors');

console.log('4. Verify turn processing methods exist and are called');  } else {}

    console.log(`❌ ${filePath} NOT FOUND`);

  }// Test 2: Check HistoryGenerator functionality

});console.log('\n2️⃣ Testing HistoryGenerator...');

try {

// Test 2: Check package.json configuration  const historyGenerator = new HistoryGenerator();

console.log('\n2️⃣ Checking Package Configuration...');  console.log('✅ HistoryGenerator created successfully');



const packageJsonPath = path.join(__dirname, 'package.json');  // Check if it can generate events

if (fs.existsSync(packageJsonPath)) {  const hasLogEvent = typeof historyGenerator.logEvent === 'function';

  try {  const hasGetEvents = typeof historyGenerator.getEvents === 'function';

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    console.log('✅ package.json found');  console.log(`   - Has logEvent method: ${hasLogEvent}`);

  console.log(`   - Has getEvents method: ${hasGetEvents}`);

    const isModule = packageJson.type === 'module';

    console.log(`   - Type: ${isModule ? 'module (ES6)' : 'commonjs (default)'}`);  if (hasLogEvent && hasGetEvents) {

    console.log('✅ HistoryGenerator has required methods');

    if (!isModule) {  } else {

      console.log('⚠️  Project is using CommonJS but source files use ES6 imports');    console.log('❌ HistoryGenerator is missing methods');

      console.log('   This can cause runtime issues when importing modules');  }

    }} catch (error) {

  console.log('❌ Failed to create HistoryGenerator:', error.message);

    // Check Jest configuration}

    if (packageJson.jest) {

      console.log('✅ Jest configuration found in package.json');// Test 3: Check InteractionManager

    } else {console.log('\n3️⃣ Testing InteractionManager...');

      const jestConfigPath = path.join(__dirname, 'jest.config.js');try {

      if (fs.existsSync(jestConfigPath)) {  const interactionManager = new InteractionManager();

        console.log('✅ jest.config.js found');  console.log('✅ InteractionManager created successfully');

      } else {

        console.log('⚠️  No Jest configuration found');  const hasGetAvailableInteractions = typeof interactionManager.getAvailableInteractions === 'function';

      }  const hasCanExecuteInteraction = typeof interactionManager.canExecuteInteraction === 'function';

    }

  console.log(`   - Has getAvailableInteractions method: ${hasGetAvailableInteractions}`);

    // Check Babel configuration  console.log(`   - Has canExecuteInteraction method: ${hasCanExecuteInteraction}`);

    const babelConfigPath = path.join(__dirname, 'babel.config.js');

    const babelrcPath = path.join(__dirname, '.babelrc');  if (hasGetAvailableInteractions && hasCanExecuteInteraction) {

    if (fs.existsSync(babelConfigPath) || fs.existsSync(babelrcPath)) {    console.log('✅ InteractionManager has required methods');

      console.log('✅ Babel configuration found');  } else {

    } else {    console.log('❌ InteractionManager is missing methods');

      console.log('⚠️  No Babel configuration found - this can cause ES6 import issues');  }

    }} catch (error) {

  console.log('❌ Failed to create InteractionManager:', error.message);

  } catch (error) {}

    console.log('❌ Error reading package.json:', error.message);

  }// Test 4: Check Character entity

} else {console.log('\n4️⃣ Testing Character Entity...');

  console.log('❌ package.json not found');try {

}  const testCharacter = new Character({

    id: 'test-char-1',

// Test 3: Check for potential issues in key source files    name: 'Test Character',

console.log('\n3️⃣ Analyzing Key Source Files for Issues...');    consciousness: { frequency: 0.7, coherence: 0.8 },

    attributes: {

const filesToAnalyze = [      strength: { score: 15 },

  {      dexterity: { score: 12 },

    path: 'src/application/use-cases/services/SimulationService.js',      constitution: { score: 14 },

    checks: ['processTurn', 'initialize', 'getCurrentWorldState']      intelligence: { score: 16 },

  },      wisdom: { score: 13 },

  {      charisma: { score: 18 }

    path: 'src/domain/services/HistoryGenerator.js',    },

    checks: ['logEvent', 'getEvents']    assignments: {

  },      nodes: new Set(['test-node-1']),

  {      interactions: new Set(['test-interaction-1'])

    path: 'src/domain/services/InteractionManager.js',    }

    checks: ['getAvailableInteractions', 'canExecuteInteraction']  });

  },

  {  console.log('✅ Character created successfully');

    path: 'src/application/use-cases/simulation/RunTick.js',  console.log(`   - Character ID: ${testCharacter.id}`);

    checks: ['default']  console.log(`   - Character name: ${testCharacter.name}`);

  },  console.log(`   - Has consciousness: ${!!testCharacter.consciousness}`);

  {  console.log(`   - Has assignments: ${!!testCharacter.assignments}`);

    path: 'src/application/use-cases/npc/GenerateBehavior.js',  console.log(`   - Node assignments: ${Array.from(testCharacter.assignments?.nodes || [])}`);

    checks: ['default', 'gatherAvailableInteractions']  console.log(`   - Interaction assignments: ${Array.from(testCharacter.assignments?.interactions || [])}`);

  }

];} catch (error) {

  console.log('❌ Failed to create Character:', error.message);

filesToAnalyze.forEach(fileAnalysis => {}

  const fullPath = path.join(__dirname, fileAnalysis.path);

  if (fs.existsSync(fullPath)) {// Test 5: Check for common configuration issues

    try {console.log('\n5️⃣ Checking for Configuration Issues...');

      const content = fs.readFileSync(fullPath, 'utf8');

// Check if package.json exists and has correct scripts

      console.log(`\n📄 Analyzing ${fileAnalysis.path}:`);const packageJsonPath = path.join(__dirname, 'package.json');

      fileAnalysis.checks.forEach(check => {if (fs.existsSync(packageJsonPath)) {

        const hasCheck = content.includes(check);  try {

        console.log(`   - Contains '${check}': ${hasCheck ? '✅' : '❌'}`);    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      });    console.log('✅ package.json found');



      // Check for common issues    const hasTestScript = !!packageJson.scripts?.test;

      const hasConsoleLog = content.includes('console.log');    const hasStartScript = !!packageJson.scripts?.start;

      const hasConsoleError = content.includes('console.error');    const hasBuildScript = !!packageJson.scripts?.build;

      const hasTryCatch = content.includes('try {') && content.includes('} catch');

    console.log(`   - Has test script: ${hasTestScript}`);

      console.log(`   - Has debug logging: ${hasConsoleLog ? '✅' : '⚠️ '}`);    console.log(`   - Has start script: ${hasStartScript}`);

      console.log(`   - Has error handling: ${hasTryCatch ? '✅' : '⚠️ '}`);    console.log(`   - Has build script: ${hasBuildScript}`);



    } catch (error) {    if (packageJson.scripts?.test) {

      console.log(`❌ Error reading ${fileAnalysis.path}:`, error.message);      console.log(`   - Test script: ${packageJson.scripts.test}`);

    }    }

  }  } catch (error) {

});    console.log('❌ Error reading package.json:', error.message);

  }

// Test 4: Check for potential runtime issues} else {

console.log('\n4️⃣ Checking for Common Runtime Issues...');  console.log('❌ package.json not found');

}

// Check if there are any obvious import/export mismatches

const simulationServicePath = path.join(__dirname, 'src/application/use-cases/services/SimulationService.js');// Check for Jest configuration issues

if (fs.existsSync(simulationServicePath)) {const jestConfigPath = path.join(__dirname, 'jest.config.js');

  const content = fs.readFileSync(simulationServicePath, 'utf8');if (fs.existsSync(jestConfigPath)) {

  console.log('✅ jest.config.js found');

  // Check for default export} else {

  const hasDefaultExport = content.includes('export default');  console.log('⚠️  jest.config.js not found - this might cause test issues');

  const hasNamedExport = content.includes('export {') || content.includes('export const') || content.includes('export function');}



  console.log('SimulationService export analysis:');// Check for babel configuration

  console.log(`   - Has default export: ${hasDefaultExport}`);const babelConfigPath = path.join(__dirname, 'babel.config.js');

  console.log(`   - Has named exports: ${hasNamedExport}`);const babelrcPath = path.join(__dirname, '.babelrc');

if (fs.existsSync(babelConfigPath) || fs.existsSync(babelrcPath)) {

  if (!hasDefaultExport && !hasNamedExport) {  console.log('✅ Babel configuration found');

    console.log('❌ No exports found - this will cause import failures');} else {

  }  console.log('⚠️  Babel configuration not found - this might cause ES6 import issues');

}}



// Test 5: Provide recommendationsconsole.log('\n🔍 Debug Analysis Complete');

console.log('\n📋 RECOMMENDATIONS:');console.log('\n📋 Next Steps:');

console.log('1. 🔧 Fix Module System: Add "type": "module" to package.json or convert imports to require()');console.log('1. If any services failed to initialize, check their import paths');

console.log('2. 🧪 Test Isolation: Run individual components in browser console to isolate issues');console.log('2. If Character creation failed, check the Character.js entity file');

console.log('3. 📊 Debug Logging: Add console.log statements to track turn processing flow');console.log('3. If tests are failing, check Jest and Babel configuration');

console.log('4. 🔍 State Inspection: Check browser dev tools for simulation state after turn processing');console.log('4. Run the simulation with debug logging enabled to see detailed turn processing');

console.log('5. 🏗️ Build Check: Ensure the project builds successfully before debugging runtime issues');console.log('5. Check browser console for any runtime errors during turn processing');

console.log('\n🔍 Debug Analysis Complete');