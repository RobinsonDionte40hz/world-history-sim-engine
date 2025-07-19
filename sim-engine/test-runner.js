// Simple test runner to check if our components can be imported without errors

console.log('Testing component imports...');

try {
  // Test ConditionalSimulationInterface
  console.log('Testing ConditionalSimulationInterface import...');
  require('./src/presentation/components/ConditionalSimulationInterface.js');
  console.log('✓ ConditionalSimulationInterface imported successfully');
} catch (error) {
  console.error('✗ ConditionalSimulationInterface import failed:', error.message);
}

try {
  // Test SimulationContext
  console.log('Testing SimulationContext import...');
  require('./src/presentation/contexts/SimulationContext.js');
  console.log('✓ SimulationContext imported successfully');
} catch (error) {
  console.error('✗ SimulationContext import failed:', error.message);
}

try {
  // Test MainPage
  console.log('Testing MainPage import...');
  require('./src/presentation/pages/MainPage.js');
  console.log('✓ MainPage imported successfully');
} catch (error) {
  console.error('✗ MainPage import failed:', error.message);
}

try {
  // Test TemplateManager
  console.log('Testing TemplateManager import...');
  require('./src/template/TemplateManager.js');
  console.log('✓ TemplateManager imported successfully');
} catch (error) {
  console.error('✗ TemplateManager import failed:', error.message);
}

try {
  // Test App
  console.log('Testing App import...');
  require('./src/App.js');
  console.log('✓ App imported successfully');
} catch (error) {
  console.error('✗ App import failed:', error.message);
}

console.log('Import tests completed.');