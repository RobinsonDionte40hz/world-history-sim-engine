/**
 * Codebase Migration Script - Windows Compatible
 * Safely migrates the interaction-manager codebase to the new structure
 * Usage: node scripts/migrate-structure.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodebaseMigrator {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.backupPath = path.join(process.cwd(), 'backup-' + Date.now());
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
    
    this.migrationMap = new Map();
    this.importUpdates = new Map();
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error' || level === 'warning') {
      const prefix = {
        info: '📝',
        warning: '⚠️',
        error: '❌',
        success: '✅'
      }[level] || 'ℹ️';
      
      console.log(`${prefix} ${message}`);
    }
  }

  // Create backup of current structure
  createBackup() {
    this.log('Creating backup of current codebase...', 'info');
    
    if (!this.dryRun) {
      try {
        // Use recursive copy for Windows compatibility
        this.copyRecursive(this.srcPath, this.backupPath);
      } catch (error) {
        this.log(`Backup failed: ${error.message}`, 'error');
        throw error;
      }
    }
    
    this.log(`Backup created at: ${this.backupPath}`, 'success');
  }

  // Windows-compatible recursive copy
  copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    
    const stat = fs.statSync(src);
    
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      const files = fs.readdirSync(src);
      
      files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        this.copyRecursive(srcPath, destPath);
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Create new directory structure
  createDirectoryStructure() {
    const directories = [
      // Components
      'components/common/buttons',
      'components/common/forms',
      'components/common/layout',
      'components/common/navigation',
      'components/layout',
      'components/features/interaction-management/components',
      'components/features/interaction-management/hooks',
      'components/features/character-management/components',
      'components/features/character-management/hooks',
      'components/features/template-system/components',
      'components/features/template-system/hooks',
      'components/features/world-generation/components',
      'components/features/world-generation/hooks',
      'components/features/historical-simulation/components',
      'components/features/historical-simulation/hooks',
      'components/features/data-exploration/components',
      'components/features/data-exploration/hooks',
      'components/features/consciousness-system/components',
      'components/features/consciousness-system/hooks',
      'components/features/personality-system/components',
      'components/features/personality-system/hooks',
      'components/features/quest-system/components',
      'components/features/quest-system/hooks',
      'components/features/influence-system/components',
      'components/features/influence-system/hooks',
      'components/features/prestige-system/components',
      'components/features/prestige-system/hooks',
      'components/features/alignment-system/components',
      'components/features/alignment-system/hooks',
      'components/features/node-system/components',
      'components/features/node-system/hooks',
      'components/features/item-system/components',
      'components/features/item-system/hooks',
      'components/features/data-management/components',
      'components/features/data-management/hooks',
      'components/pages',
      
      // Systems
      'systems/core',
      'systems/character',
      'systems/template',
      'systems/world-generation',
      'systems/historical-simulation',
      'systems/interaction',
      'systems/quest',
      'systems/node',
      'systems/item',
      'systems/data',
      
      // Hooks
      'hooks/common',
      'hooks/simulation',
      'hooks/systems',
      
      // Context
      'context',
      
      // Utils
      'utils/common',
      'utils/simulation',
      'utils/data',
      
      // Styles
      'styles/themes',
      
      // Assets
      'assets/images',
      'assets/icons',
      'assets/data/templates',
      'assets/data/presets'
    ];

    this.log('Creating new directory structure...', 'info');

    directories.forEach(dir => {
      const fullPath = path.join(this.srcPath, dir);
      if (!this.dryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      this.log(`Created directory: ${dir}`, 'info');
    });
  }

  // Define file migration mappings
  defineMigrationMap() {
    // Current file -> New location mapping
    const mappings = {
      // Layout components
      'components/layout/Header.js': 'components/layout/Header.jsx',
      'components/layout/Sidebar.js': 'components/layout/Sidebar.jsx',
      'components/layout/MainContent.js': 'components/layout/MainContent.jsx',
      
      // Feature components (reorganize by feature)
      'components/features/TemplateManager.js': 'components/features/template-system/TemplateManager.jsx',
      'components/features/TemplateManager.module.css': 'components/features/template-system/TemplateManager.module.css',
      'components/features/WorldHistorySimulator.js': 'components/features/historical-simulation/HistoricalSimulator.jsx',
      
      // Systems reorganization
      'systems/world-history/WorldHistoryEngine.js': 'systems/historical-simulation/HistoricalEngine.js',
      'systems/world-history/TemplateManager.js': 'systems/template/TemplateManager.js',
      
      // Root level components to features
      'InteractionManagerExtended.js': 'components/features/interaction-management/InteractionManager.jsx',
      'NodeTypeCreator.js': 'components/features/node-system/components/NodeTypeCreator.jsx',
      'PersonalityTraitManager.js': 'components/features/personality-system/components/PersonalityTraitManager.jsx',
      'ConsciousnessManager.js': 'components/features/consciousness-system/components/ConsciousnessManager.jsx',
      'ConnectionManager.js': 'components/features/node-system/components/ConnectionManager.jsx',
      'QuestManager.js': 'components/features/quest-system/components/QuestManager.jsx',
      'PersonalityManager.js': 'components/features/personality-system/PersonalityManager.jsx',
      'WorldNodeCreator.js': 'components/features/node-system/components/WorldNodeCreator.jsx',
      'ItemManager.js': 'components/features/item-system/components/ItemManager.jsx',
      'InfluenceManager.js': 'components/features/influence-system/components/InfluenceManager.jsx',
      'DataManager.js': 'components/features/data-management/DataManager.jsx',
      
      // System files
      'NodeTypeSystem.js': 'systems/node/NodeTypeSystem.js',
      'PersonalitySystem.js': 'systems/character/PersonalitySystem.js',
      'ConsciousnessSystem.js': 'systems/character/ConsciousnessSystem.js',
      'ConnectionSystem.js': 'systems/node/ConnectionSystem.js',
      'QuestSystem.js': 'systems/quest/QuestSystem.js',
      'ItemSystem.js': 'systems/item/ItemSystem.js',
      'WorldNodeSystem.js': 'systems/node/WorldNodeSystem.js',
      'InfluenceSystem.js': 'systems/interaction/InfluenceSystem.js',
      'PrestigeSystem.js': 'systems/interaction/PrestigeSystem.js',
      'AlignmentSystem.js': 'systems/interaction/AlignmentSystem.js'
    };

    // Add to migration map
    Object.entries(mappings).forEach(([oldPath, newPath]) => {
      this.migrationMap.set(oldPath, newPath);
    });
  }

  // Move files to new locations
  migrateFiles() {
    this.log('Migrating files to new structure...', 'info');

    this.migrationMap.forEach((newPath, oldPath) => {
      const oldFullPath = path.join(this.srcPath, oldPath);
      const newFullPath = path.join(this.srcPath, newPath);

      if (fs.existsSync(oldFullPath)) {
        if (!this.dryRun) {
          // Ensure directory exists
          fs.mkdirSync(path.dirname(newFullPath), { recursive: true });
          
          // Move file
          fs.renameSync(oldFullPath, newFullPath);
        }
        
        this.log(`Moved: ${oldPath} -> ${newPath}`, 'success');
        
        // Track for import updates
        this.importUpdates.set(oldPath, newPath);
      } else {
        this.log(`File not found: ${oldPath}`, 'warning');
      }
    });
  }

  // Update import statements in all files
  updateImports() {
    this.log('Updating import statements...', 'info');

    const updateImportsInFile = (filePath) => {
      if (!fs.existsSync(filePath) || !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;

      // Update relative imports based on migration map
      this.importUpdates.forEach((newPath, oldPath) => {
        const oldImportPattern = new RegExp(`(['"])(\\.\\./)*${oldPath.replace(/\./g, '\\.')}(['"])`, 'g');
        const newImportPath = this.calculateRelativePath(filePath, newPath);
        
        if (oldImportPattern.test(content)) {
          content = content.replace(oldImportPattern, `$1${newImportPath}$3`);
          updated = true;
        }
      });

      // Update specific import patterns
      const importUpdates = [
        // Update feature imports to use barrel exports
        {
          pattern: /from ['"]\.\.\/components\/features\/([^'"]+)['"]/g,
          replacement: "from '@/components/features/$1'"
        },
        // Update system imports
        {
          pattern: /from ['"]\.\.\/systems\/([^'"]+)['"]/g,
          replacement: "from '@/systems/$1'"
        },
        // Update common component imports
        {
          pattern: /from ['"]\.\.\/components\/common\/([^'"]+)['"]/g,
          replacement: "from '@/components/common'"
        }
      ];

      importUpdates.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          updated = true;
        }
      });

      if (updated && !this.dryRun) {
        fs.writeFileSync(filePath, content);
        this.log(`Updated imports in: ${path.relative(this.srcPath, filePath)}`, 'success');
      }
    };

    // Walk through all JavaScript files
    this.walkDirectory(this.srcPath, updateImportsInFile);
  }

  // Calculate relative path between two files
  calculateRelativePath(fromFile, toFile) {
    const fromDir = path.dirname(fromFile);
    const toPath = path.join(this.srcPath, toFile);
    let relativePath = path.relative(fromDir, toPath);
    
    // Ensure it starts with ./
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Remove file extension for imports
    relativePath = relativePath.replace(/\.(js|jsx)$/, '');
    
    return relativePath;
  }

  // Create barrel exports (index.js files)
  createBarrelExports() {
    this.log('Creating barrel exports...', 'info');

    const barrelExports = {
      'components/common/index.js': `
// Common UI Components
export { default as ActionButton } from './buttons/ActionButton';
export { default as IconButton } from './buttons/IconButton';
export { default as FormField } from './forms/FormField';
export { default as FormGroup } from './forms/FormGroup';
export { default as ValidationMessage } from './forms/ValidationMessage';
export { default as Card } from './layout/Card';
export { default as Modal } from './layout/Modal';
export { default as Tabs } from './layout/Tabs';
export { default as Breadcrumb } from './navigation/Breadcrumb';
export { default as Pagination } from './navigation/Pagination';
`,

      'components/layout/index.js': `
// Layout Components
export { default as AppLayout } from './AppLayout';
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as MainContent } from './MainContent';
export { default as Footer } from './Footer';
`,

      'components/features/template-system/index.js': `
// Template System
export { default as TemplateManager } from './TemplateManager';
export { default as TemplateEditor } from './components/TemplateEditor';
export { default as TemplateList } from './components/TemplateList';
export { useTemplates } from './hooks/useTemplates';
export { useTemplateValidation } from './hooks/useTemplateValidation';
`,

      'systems/character/index.js': `
// Character Systems
export { default as CharacterSystem } from './CharacterSystem';
export { default as AttributeSystem } from './AttributeSystem';
export { default as SkillSystem } from './SkillSystem';
export { default as PersonalitySystem } from './PersonalitySystem';
export { default as ConsciousnessSystem } from './ConsciousnessSystem';
`,

      'systems/template/index.js': `
// Template Systems
export { default as TemplateManager } from './TemplateManager';
export { default as TemplateValidator } from './TemplateValidator';
export { default as TemplateGenerator } from './TemplateGenerator';
`,

      'hooks/index.js': `
// All Hooks
export * from './common';
export * from './simulation';
export * from './systems';
`,

      'utils/index.js': `
// All Utilities
export * from './common';
export * from './simulation';
export * from './data';
`
    };

    Object.entries(barrelExports).forEach(([filePath, content]) => {
      const fullPath = path.join(this.srcPath, filePath);
      
      if (!this.dryRun) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content.trim());
      }
      
      this.log(`Created barrel export: ${filePath}`, 'success');
    });
  }

  // Create path aliases configuration
  createPathAliasConfig() {
    const jsconfig = {
      compilerOptions: {
        baseUrl: "src",
        paths: {
          "@/*": ["*"],
          "@/components/*": ["components/*"],
          "@/systems/*": ["systems/*"],
          "@/hooks/*": ["hooks/*"],
          "@/utils/*": ["utils/*"],
          "@/context/*": ["context/*"],
          "@/styles/*": ["styles/*"],
          "@/assets/*": ["assets/*"]
        }
      },
      include: ["src/**/*"]
    };

    const configPath = path.join(process.cwd(), 'jsconfig.json');
    
    if (!this.dryRun) {
      fs.writeFileSync(configPath, JSON.stringify(jsconfig, null, 2));
    }
    
    this.log('Created jsconfig.json with path aliases', 'success');
  }

  // Walk directory recursively
  walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else {
        callback(filePath);
      }
    });
  }

  // Validate migration
  validateMigration() {
    this.log('Validating migration...', 'info');
    
    let errors = 0;
    
    // Check that all mapped files were moved
    this.migrationMap.forEach((newPath, oldPath) => {
      const oldFullPath = path.join(this.srcPath, oldPath);
      const newFullPath = path.join(this.srcPath, newPath);
      
      if (fs.existsSync(oldFullPath)) {
        this.log(`Migration incomplete: ${oldPath} still exists`, 'error');
        errors++;
      }
      
      if (!fs.existsSync(newFullPath)) {
        this.log(`Migration failed: ${newPath} not found`, 'error');
        errors++;
      }
    });
    
    if (errors === 0) {
      this.log('Migration validation passed!', 'success');
    } else {
      this.log(`Migration validation failed with ${errors} errors`, 'error');
    }
    
    return errors === 0;
  }

  // Main migration process
  async migrate() {
    console.log('🚀 Starting codebase migration...\n');
    
    if (this.dryRun) {
      console.log('🧪 DRY RUN MODE - No files will be modified\n');
    }

    try {
      // Step 1: Create backup
      this.createBackup();
      
      // Step 2: Define migration mapping
      this.defineMigrationMap();
      
      // Step 3: Create new directory structure
      this.createDirectoryStructure();
      
      // Step 4: Migrate files
      this.migrateFiles();
      
      // Step 5: Create barrel exports
      this.createBarrelExports();
      
      // Step 6: Update imports
      this.updateImports();
      
      // Step 7: Create path alias configuration
      this.createPathAliasConfig();
      
      // Step 8: Validate migration
      if (!this.dryRun) {
        this.validateMigration();
      }
      
      console.log('\n✅ Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Test the application to ensure everything works');
      console.log('2. Update any remaining import paths manually');
      console.log('3. Remove the backup folder when satisfied');
      console.log('4. Run "npm start" to verify the application runs');
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      console.error('\n💡 You can restore from backup at:', this.backupPath);
      process.exit(1);
    }
  }
}

// Run migration
const migrator = new CodebaseMigrator();
migrator.migrate();