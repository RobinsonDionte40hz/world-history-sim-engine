/**
 * Find files with mixed module systems
 * This script helps identify files that need to be converted from CommonJS to ES6 modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, 'src');
const results = {
  commonJSExports: [],
  commonJSRequires: [],
  mixedFiles: []
};

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        scanDirectory(filePath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasModuleExports = content.includes('module.exports');
      const hasRequire = content.includes('require(');
      const hasImport = content.includes('import ');
      const hasExport = content.includes('export ');

      if (hasModuleExports || hasRequire) {
        const relativePath = path.relative(srcDir, filePath);
        
        if (hasModuleExports) {
          results.commonJSExports.push(relativePath);
        }
        if (hasRequire) {
          results.commonJSRequires.push(relativePath);
        }
        
        if ((hasModuleExports || hasRequire) && (hasImport || hasExport)) {
          results.mixedFiles.push(relativePath);
        }
      }
    }
  }
}

console.log('Scanning for mixed module systems...\n');
scanDirectory(srcDir);

console.log('='.repeat(60));
console.log('FILES WITH module.exports:');
console.log('='.repeat(60));
results.commonJSExports.forEach(file => console.log(`  - ${file}`));

console.log('\n' + '='.repeat(60));
console.log('FILES WITH require():');
console.log('='.repeat(60));
results.commonJSRequires.forEach(file => console.log(`  - ${file}`));

console.log('\n' + '='.repeat(60));
console.log('MIXED MODULE FILES (highest priority to fix):');
console.log('='.repeat(60));
results.mixedFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n' + '='.repeat(60));
console.log('SUMMARY:');
console.log('='.repeat(60));
console.log(`Files with module.exports: ${results.commonJSExports.length}`);
console.log(`Files with require(): ${results.commonJSRequires.length}`);
console.log(`Mixed module files: ${results.mixedFiles.length}`);
