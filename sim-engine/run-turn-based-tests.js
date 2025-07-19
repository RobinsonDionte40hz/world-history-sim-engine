#!/usr/bin/env node

/**
 * Turn-Based Integration Test Runner
 * Comprehensive test runner for all turn-based simulation integration tests
 */

const { exec } = require('child_process');

console.log('🚀 Turn-Based Simulation Integration Test Runner\n');

// Test suites configuration
const testSuites = [
  {
    name: 'Primary Working Suite',
    file: 'turn-counter-integration-working.test.js',
    description: 'Core turn-based functionality (RECOMMENDED)',
    priority: 1
  },
  {
    name: 'Turn-Based Specific',
    file: 'turn-counter-integration-turnbased.test.js', 
    description: 'Turn-based simulation specific tests',
    priority: 2
  },
  {
    name: 'Comprehensive Suite',
    file: 'turn-counter-integration-comprehensive.test.js',
    description: 'Full requirement coverage tests',
    priority: 3
  },
  {
    name: 'Final Implementation',
    file: 'turn-counter-integration-final.test.js',
    description: 'Alternative comprehensive approach',
    priority: 4
  },
  {
    name: 'Focused Tests',
    file: 'turn-counter-integration-focused.test.js',
    description: 'Core turn counter operation tests',
    priority: 5
  }
];

// Command line argument parsing
const args = process.argv.slice(2);
const runAll = args.includes('--all');
const runPrimary = args.includes('--primary') || args.length === 0;
const verbose = args.includes('--verbose');
const watch = args.includes('--watch');

function runTest(testSuite) {
  return new Promise((resolve) => {
    const watchFlag = watch ? '' : '--watchAll=false';
    const verboseFlag = verbose ? '--verbose' : '';
    const command = `npm test -- --testPathPattern=${testSuite.file} ${watchFlag} ${verboseFlag}`;
    
    console.log(`\n📋 Running: ${testSuite.name}`);
    console.log(`📝 Description: ${testSuite.description}`);
    console.log(`⚙️  Command: ${command}\n`);

    const startTime = Date.now();
    const testProcess = exec(command, (error, stdout, stderr) => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n⏱️  Test completed in ${duration}s`);
      
      if (error) {
        console.log(`❌ ${testSuite.name}: FAILED`);
        console.log('Error output:', stderr);
      } else {
        console.log(`✅ ${testSuite.name}: PASSED`);
      }
      
      resolve({ 
        suite: testSuite.name, 
        passed: !error, 
        duration,
        output: stdout 
      });
    });

    testProcess.stdout.pipe(process.stdout);
    testProcess.stderr.pipe(process.stderr);
  });
}

async function runTests() {
  console.log('🎯 Test Configuration:');
  console.log(`   Run All: ${runAll}`);
  console.log(`   Run Primary Only: ${runPrimary && !runAll}`);
  console.log(`   Watch Mode: ${watch}`);
  console.log(`   Verbose: ${verbose}\n`);

  let suitesToRun;
  
  if (runAll) {
    suitesToRun = testSuites;
    console.log('🚀 Running ALL test suites...\n');
  } else if (runPrimary) {
    suitesToRun = testSuites.filter(suite => suite.priority === 1);
    console.log('🎯 Running PRIMARY test suite only...\n');
  } else {
    suitesToRun = testSuites.filter(suite => suite.priority <= 2);
    console.log('⚡ Running core test suites...\n');
  }

  const results = [];
  
  for (const testSuite of suitesToRun) {
    try {
      const result = await runTest(testSuite);
      results.push(result);
    } catch (error) {
      console.error(`💥 Fatal error running ${testSuite.name}:`, error);
      results.push({
        suite: testSuite.name,
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.suite} (${result.duration}s)`);
  });
  
  console.log('='.repeat(60));
  console.log(`📈 Overall Result: ${passed}/${total} test suites passed`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS SUCCESSFUL! Turn-based integration is complete.');
  } else {
    console.log('⚠️  Some test suites failed. Check individual results above.');
  }
  
  console.log('='.repeat(60));
  
  return passed === total;
}

// Help text
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📚 Turn-Based Integration Test Runner Usage:

Commands:
  node run-turn-based-tests.js [options]

Options:
  --all         Run all test suites (comprehensive)
  --primary     Run only the primary working test suite (default)
  --verbose     Show verbose test output
  --watch       Run tests in watch mode
  --help, -h    Show this help message

Examples:
  node run-turn-based-tests.js                    # Run primary suite
  node run-turn-based-tests.js --all              # Run all suites
  node run-turn-based-tests.js --primary --watch  # Watch primary suite
  node run-turn-based-tests.js --all --verbose    # All suites with verbose output

Test Suites:
  1. Primary Working Suite (RECOMMENDED)
  2. Turn-Based Specific Tests
  3. Comprehensive Suite
  4. Final Implementation Suite  
  5. Focused Tests
`);
  process.exit(0);
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
