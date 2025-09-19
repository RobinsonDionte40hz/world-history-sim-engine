/**
 * Memory Management Performance Test Runner
 *
 * Simple script to run memory management performance benchmarks
 * and display results in a readable format.
 */

const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Running Memory Management Performance Benchmarks...\n');

// Run the performance tests
try {
    const testCommand = 'npm test -- --testPathPattern=MemoryManagementService.performance.test.js --verbose';
    console.log('Executing:', testCommand);

    execSync(testCommand, {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'inherit'
    });

    console.log('\n✅ Performance benchmarks completed successfully!');
    console.log('📊 Check the console output above for detailed performance metrics.');

} catch (error) {
    console.error('\n❌ Performance benchmarks failed:', error.message);
    process.exit(1);
}

console.log('\n📈 Performance Summary:');
console.log('- Large-scale processing: 100-500 characters');
console.log('- Memory pruning efficiency: Old event/memory cleanup');
console.log('- Garbage collection: Corrupted data removal');
console.log('- Concurrent operations: Mixed service interactions');
console.log('- Scalability testing: Linear performance scaling');
console.log('- Memory efficiency: Data structure optimization');

console.log('\n🎯 Key Performance Targets:');
console.log('- 100 characters: < 500ms (< 200 chars/sec)');
console.log('- 500 characters: < 2000ms (> 200 chars/sec)');
console.log('- Memory pruning: < 150ms for 300+ items');
console.log('- Garbage collection: < 100ms for large datasets');
console.log('- Concurrent ops: < 500ms for mixed operations');