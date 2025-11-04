/**
 * Post-build script to copy wrapper files to pkg directory
 * and update package.json with correct exports
 */

const fs = require('fs');
const path = require('path');

const PKG_DIR = path.join(__dirname, 'pkg');
const WRAPPER_DIR = path.join(__dirname, 'src', 'wrapper');
const ROOT_PACKAGE_JSON = path.join(__dirname, 'package.json');
const PKG_PACKAGE_JSON = path.join(PKG_DIR, 'package.json');

console.log('📦 Copying wrapper files to pkg directory...\n');

// Create wrapper directory in pkg if it doesn't exist
const pkgWrapperDir = path.join(PKG_DIR, 'wrapper');
if (!fs.existsSync(pkgWrapperDir)) {
    fs.mkdirSync(pkgWrapperDir, { recursive: true });
    console.log(`✅ Created ${pkgWrapperDir}`);
}

// Copy wrapper files
const wrapperFiles = fs.readdirSync(WRAPPER_DIR);
wrapperFiles.forEach(file => {
    if (file.endsWith('.js')) {
        const srcPath = path.join(WRAPPER_DIR, file);
        const destPath = path.join(pkgWrapperDir, file);
        
        // Read the file content
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Fix import paths: ../../pkg/ -> ../
        content = content.replace(/import\(['"]\.\.\/\.\.\/pkg\//g, "import('../");
        content = content.replace(/path\.join\(__dirname, '\.\.\/\.\.\/pkg\//g, "path.join(__dirname, '../");
        
        // Write the modified content
        fs.writeFileSync(destPath, content, 'utf8');
        console.log(`✅ Copied ${file} to pkg/wrapper/ (with path fixes)`);
    }
});

console.log('\n📝 Updating package.json...\n');

// Read root package.json to get metadata
const rootPkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON, 'utf8'));

// Read generated pkg/package.json
const pkgJson = JSON.parse(fs.readFileSync(PKG_PACKAGE_JSON, 'utf8'));

// Update with root package metadata
pkgJson.name = rootPkg.name;
pkgJson.version = rootPkg.version;
pkgJson.description = rootPkg.description;
pkgJson.author = rootPkg.author;
pkgJson.license = rootPkg.license;
pkgJson.repository = rootPkg.repository;
pkgJson.keywords = rootPkg.keywords;
pkgJson.homepage = rootPkg.homepage;
pkgJson.bugs = rootPkg.bugs;
// Don't set type: "module" - wasm-pack generates CommonJS

// Add exports field for proper module resolution
pkgJson.exports = {
    ".": {
        "import": "./wrapper/ConsciousnessEngineWasm.js",
        "require": "./wrapper/ConsciousnessEngineWasm.js"
    },
    "./wasm": {
        "import": "./consciousness_engine.js",
        "require": "./consciousness_engine.js"
    },
    "./wrapper/*": "./wrapper/*"
};

// Update main and types to point to wrapper
pkgJson.main = "wrapper/ConsciousnessEngineWasm.js";
pkgJson.module = "wrapper/ConsciousnessEngineWasm.js";

// Add wrapper files to files array
pkgJson.files = [
    "consciousness_engine_bg.wasm",
    "consciousness_engine.js",
    "consciousness_engine.d.ts",
    "consciousness_engine_bg.wasm.d.ts",
    "wrapper/**/*.js"
];

// Write updated package.json
fs.writeFileSync(PKG_PACKAGE_JSON, JSON.stringify(pkgJson, null, 2));
console.log('✅ Updated pkg/package.json with correct exports and metadata\n');

// Copy README and LICENSE files
const filesToCopy = ['README.md', 'LICENSE-MIT', 'LICENSE-APACHE'];
filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(PKG_DIR, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    }
});

console.log('\n✅ Post-build processing complete!');
console.log('📦 Package ready at:', PKG_DIR);
