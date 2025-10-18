#!/usr/bin/env node

/**
 * Release automation script
 * Handles pre-release checks, building, testing, and publishing
 * 
 * Usage:
 *   node scripts/release.js patch  # 0.1.0 -> 0.1.1
 *   node scripts/release.js minor  # 0.1.0 -> 0.2.0
 *   node scripts/release.js major  # 0.1.0 -> 1.0.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RELEASE_TYPE = process.argv[2] || 'patch';
const DRY_RUN = process.argv.includes('--dry-run');

function exec(cmd, options = {}) {
  try {
    const result = execSync(cmd, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..'),
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
}

function log(section, message) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${section}`);
  console.log(`${'='.repeat(60)}\n`);
  if (message) console.log(message);
}

function checkPrerequisites() {
  log('1/7: Checking Prerequisites');

  // Check git status
  try {
    const status = execSync('git status --porcelain', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    if (status.trim() !== '') {
      console.error('❌ Git working directory is not clean. Commit or stash changes first.');
      process.exit(1);
    }
    console.log('✅ Git working directory is clean');
  } catch (error) {
    console.error('❌ Failed to check git status');
    process.exit(1);
  }

  // Check we're on main or es6-module-conversion branch
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    }).trim();
    if (!['main', 'es6-module-conversion'].includes(branch)) {
      console.error(`❌ Not on main or es6-module-conversion branch (currently on: ${branch})`);
      process.exit(1);
    }
    console.log(`✅ On ${branch} branch`);
  } catch (error) {
    console.error('❌ Failed to check git branch');
    process.exit(1);
  }

  // Check wasm-pack is installed
  try {
    execSync('wasm-pack --version', { stdio: 'pipe' });
    console.log('✅ wasm-pack is installed');
  } catch (error) {
    console.error('❌ wasm-pack is not installed. Run: npm install -g wasm-pack');
    process.exit(1);
  }

  // Check cargo is installed
  try {
    execSync('cargo --version', { stdio: 'pipe' });
    console.log('✅ cargo is installed');
  } catch (error) {
    console.error('❌ cargo is not installed. Install Rust from https://rustup.rs');
    process.exit(1);
  }
}

function runTests() {
  log('2/7: Running Tests');
  
  console.log('Running Rust unit tests...');
  exec('cargo test --release');
  
  console.log('\nRunning integration tests...');
  exec('node test-epic9-integration.js');
  
  console.log('✅ All tests passed');
}

function cleanBuild() {
  log('3/7: Cleaning Previous Builds');
  
  exec('cargo clean');
  if (fs.existsSync(path.join(__dirname, '..', 'pkg'))) {
    fs.rmSync(path.join(__dirname, '..', 'pkg'), { recursive: true });
  }
  
  console.log('✅ Clean complete');
}

function buildRelease() {
  log('4/7: Building Release Package');
  
  console.log('Building optimized WASM binary...');
  exec('wasm-pack build --target nodejs --release');
  
  // Display binary size
  const pkgPath = path.join(__dirname, '..', 'pkg');
  const wasmFiles = fs.readdirSync(pkgPath).filter(f => f.endsWith('.wasm'));
  
  console.log('\n📊 Binary Sizes:');
  wasmFiles.forEach(file => {
    const stats = fs.statSync(path.join(pkgPath, file));
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${file}: ${sizeKB} KB`);
  });
  
  console.log('✅ Build complete');
}

function bumpVersion() {
  log('5/7: Bumping Version', `Release type: ${RELEASE_TYPE}`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN: Would bump version');
    return;
  }
  
  // npm version will automatically run sync-version.js via "version" script
  exec(`npm version ${RELEASE_TYPE} -m "Release v%s"`);
  
  console.log('✅ Version bumped');
}

function createGitTag() {
  log('6/7: Creating Git Tag');
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  const version = packageJson.version;
  
  if (DRY_RUN) {
    console.log(`🔍 DRY RUN: Would create tag v${version}`);
    return;
  }
  
  console.log(`Creating tag v${version}...`);
  exec(`git tag -a v${version} -m "Release v${version}"`);
  
  console.log('✅ Git tag created');
}

function publishPackage() {
  log('7/7: Publishing to npm');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN: Would publish to npm');
    exec('npm publish --dry-run');
    return;
  }
  
  console.log('Publishing to npm registry...');
  exec('npm publish');
  
  console.log('\nPushing to GitHub...');
  exec('git push && git push --tags');
  
  console.log('✅ Published successfully');
}

function main() {
  console.log('\n🚀 Starting Release Process\n');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  if (!['patch', 'minor', 'major'].includes(RELEASE_TYPE)) {
    console.error('❌ Invalid release type. Use: patch, minor, or major');
    process.exit(1);
  }

  try {
    checkPrerequisites();
    runTests();
    cleanBuild();
    buildRelease();
    bumpVersion();
    createGitTag();
    publishPackage();
    
    log('✨ Release Complete!');
    
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    );
    console.log(`\n🎉 Successfully released v${packageJson.version}\n`);
    
  } catch (error) {
    console.error('\n❌ Release failed:', error.message);
    process.exit(1);
  }
}

main();
