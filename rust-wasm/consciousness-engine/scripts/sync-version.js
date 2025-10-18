#!/usr/bin/env node

/**
 * Synchronize version between package.json and Cargo.toml
 * Run automatically during `npm version` to keep versions in sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function syncVersion() {
  // Read package.json version (source of truth)
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const version = packageJson.version;

  console.log(`\n📦 Syncing version: ${version}\n`);

  // Update Cargo.toml
  const cargoPath = path.join(__dirname, '..', 'Cargo.toml');
  let cargoContent = fs.readFileSync(cargoPath, 'utf8');
  
  // Replace version line in [package] section
  const versionRegex = /(^\[package\][\s\S]*?^version\s*=\s*)"[^"]*"/m;
  cargoContent = cargoContent.replace(versionRegex, `$1"${version}"`);
  
  fs.writeFileSync(cargoPath, cargoContent, 'utf8');
  console.log(`✅ Updated Cargo.toml to version ${version}`);

  // Verify the change
  const updatedCargo = fs.readFileSync(cargoPath, 'utf8');
  const versionMatch = updatedCargo.match(/^version\s*=\s*"([^"]*)"/m);
  
  if (versionMatch && versionMatch[1] === version) {
    console.log('✅ Version sync verified\n');
    return 0;
  } else {
    console.error('❌ Version sync failed - versions do not match');
    return 1;
  }
}

const exitCode = syncVersion();
process.exit(exitCode);
