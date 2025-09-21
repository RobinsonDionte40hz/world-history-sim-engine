// Test the alignment fix
import { Alignment } from './src/domain/value-objects/Alignment.js';

console.log('Testing Alignment.fromJSON with various scenarios...\n');

// Test 1: Valid data with axes
console.log('Test 1: Valid data with axes');
try {
  const validData = {
    axes: [
      {
        id: 'moral',
        name: 'Moral Axis',
        description: 'Good vs Evil alignment',
        min: -50,
        max: 50,
        defaultValue: 0,
        zones: [
          { name: 'Evil', min: -50, max: -16 },
          { name: 'Neutral', min: -15, max: 15 },
          { name: 'Good', min: 16, max: 50 }
        ]
      }
    ],
    values: { moral: 10 },
    history: {}
  };
  
  const alignment = Alignment.fromJSON(validData);
  console.log('✓ Success: Valid data works');
  console.log(`  Axes count: ${alignment.axes.length}`);
  console.log(`  Moral value: ${alignment.getValue('moral')}`);
} catch (error) {
  console.log('✗ Failed:', error.message);
}

// Test 2: Data with empty axes array
console.log('\nTest 2: Data with empty axes array');
try {
  const emptyAxesData = {
    axes: [],
    values: { moral: 5, ethical: -10 },
    history: {}
  };
  
  const alignment = Alignment.fromJSON(emptyAxesData);
  console.log('✓ Success: Empty axes handled with defaults');
  console.log(`  Axes count: ${alignment.axes.length}`);
  console.log(`  Default axes: ${alignment.axes.map(a => a.id).join(', ')}`);
} catch (error) {
  console.log('✗ Failed:', error.message);
}

// Test 3: Data with missing axes field
console.log('\nTest 3: Data with missing axes field');
try {
  const missingAxesData = {
    values: { moral: 0, ethical: 15 },
    history: {}
  };
  
  const alignment = Alignment.fromJSON(missingAxesData);
  console.log('✓ Success: Missing axes handled with defaults');
  console.log(`  Axes count: ${alignment.axes.length}`);
  console.log(`  Default axes: ${alignment.axes.map(a => a.id).join(', ')}`);
} catch (error) {
  console.log('✗ Failed:', error.message);
}

// Test 4: Completely empty data
console.log('\nTest 4: Completely empty data');
try {
  const emptyData = {};
  
  const alignment = Alignment.fromJSON(emptyData);
  console.log('✓ Success: Empty data handled with defaults');
  console.log(`  Axes count: ${alignment.axes.length}`);
  console.log(`  Default axes: ${alignment.axes.map(a => a.id).join(', ')}`);
} catch (error) {
  console.log('✗ Failed:', error.message);
}

// Test 5: Simulate the serialization round-trip
console.log('\nTest 5: Serialization round-trip');
try {
  // Create an alignment with default axes
  const original = Alignment.fromJSON({});
  
  // Serialize it
  const serialized = original.toJSON();
  console.log('Serialized structure:', Object.keys(serialized));
  console.log('Axes in serialized:', serialized.axes?.length || 0);
  
  // Deserialize it
  const restored = Alignment.fromJSON(serialized);
  console.log('✓ Success: Round-trip serialization works');
  console.log(`  Original axes: ${original.axes.length}`);
  console.log(`  Restored axes: ${restored.axes.length}`);
} catch (error) {
  console.log('✗ Failed:', error.message);
}

console.log('\nAlignment fix test completed.');