// src/test/turn-based-integration-runner.js
// Test runner specifically for turn-based integration tests

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎮 Turn-Based Integration Test Runner');
console.log('=====================================');

// Test files to run in order of priority
const testFiles = [
  'turn-counter-integration-working.test.js',
  'turn-counter-integration-turnbased.test.js',
  'simulation-service-turn-based.test.js'
];

const testResults = [];

async function runTest(testFile) {
  try {
    console.log(`\n📋 Running ${testFile}...`);
    
    const command = `npm test -- --testPathPattern=${testFile} --watchAll=false --verbose`;
    const result = execSync(command, { 
      encoding: 'utf8', 
      cwd: __dirname + '/../..',
      stdio: 'pipe'
    });
    
    // Parse results
    const lines = result.split('\n');
    let passCount = 0;
    let failCount = 0;
    
    lines.forEach(line => {
      if (line.includes('√')) passCount++;
      if (line.includes('×')) failCount++;
    });
    
    testResults.push({
      file: testFile,
      status: failCount === 0 ? 'PASS' : 'FAIL',
      passed: passCount,
      failed: failCount,
      output: result
    });
    
    console.log(`✅ ${testFile}: ${passCount} passing, ${failCount} failing`);
    
  } catch (error) {
    console.log(`❌ ${testFile}: ERROR`);
    console.log(error.stdout || error.message);
    
    testResults.push({
      file: testFile,
      status: 'ERROR',
      passed: 0,
      failed: 0,
      error: error.stdout || error.message
    });
  }
}

async function generateReport() {
  console.log('\n📊 Turn-Based Integration Test Summary');
  console.log('======================================');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  testResults.forEach(result => {
    console.log(`\n📁 ${result.file}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Passed: ${result.passed}`);
    console.log(`   Failed: ${result.failed}`);
    
    totalPassed += result.passed;
    totalFailed += result.failed;
  });
  
  console.log('\n🎯 Overall Results');
  console.log(`   Total Passed: ${totalPassed}`);
  console.log(`   Total Failed: ${totalFailed}`);
  console.log(`   Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
  
  // Write detailed report
  const reportContent = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPassed,
      totalFailed,
      successRate: Math.round((totalPassed / (totalPassed + totalFailed)) * 100)
    },
    testResults
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'turn-based-test-report.json'), 
    JSON.stringify(reportContent, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to: turn-based-test-report.json');
}

// Run all tests
async function runAllTests() {
  for (const testFile of testFiles) {
    await runTest(testFile);
  }
  
  await generateReport();
  
  // Exit with appropriate code
  const hasFailures = testResults.some(r => r.status !== 'PASS');
  process.exit(hasFailures ? 1 : 0);
}

runAllTests().catch(console.error);
