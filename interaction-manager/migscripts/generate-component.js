#!/usr/bin/env node

/**
 * Component Generator Script
 * Generates React components with proper structure and boilerplate code
 * Usage: node scripts/generate-component.js <type> <name> [feature]
 * 
 * Examples:
 * node scripts/generate-component.js component CharacterEditor character-management
 * node scripts/generate-component.js hook useCharacters character-management
 * node scripts/generate-component.js system CharacterSystem character
 */

const fs = require('fs');
const path = require('path');

class ComponentGenerator {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.args = process.argv.slice(2);
    
    if (this.args.length < 2) {
      this.showUsage();
      process.exit(1);
    }
    
    this.type = this.args[0];
    this.name = this.args[1];
    this.feature = this.args[2];
    
    this.validateInputs();
  }

  showUsage() {
    console.log(`
🛠️  Component Generator

Usage: node scripts/generate-component.js <type> <name> [feature]

Types:
  component  - React component (.jsx)
  hook       - React hook (.js)
  system     - Business logic system (.js)
  page       - Page component (.jsx)
  common     - Common/shared component (.jsx)

Examples:
  node scripts/generate-component.js component CharacterEditor character-management
  node scripts/generate-component.js hook useCharacters character-management
  node scripts/generate-component.js system CharacterSystem character
  node scripts/generate-component.js page Dashboard
  node scripts/generate-component.js common Button

Features (for components and hooks):
  character-management, template-system, world-generation,
  historical-simulation, data-exploration, consciousness-system,
  personality-system, quest-system, influence-system,
  prestige-system, alignment-system, node-system,
  item-system, data-management
    `);
  }

  validateInputs() {
    const validTypes = ['component', 'hook', 'system', 'page', 'common'];
    
    if (!validTypes.includes(this.type)) {
      console.error(`❌ Invalid type: ${this.type}`);
      console.error(`Valid types: ${validTypes.join(', ')}`);
      process.exit(1);
    }
    
    if (this.type === 'component' && !this.feature) {
      console.error(`❌ Feature is required for components`);
      process.exit(1);
    }
    
    // Validate naming conventions
    if (this.type === 'hook' && !this.name.startsWith('use')) {
      console.error(`❌ Hook names must start with 'use'`);
      process.exit(1);
    }
  }

  // Generate file path based on type and feature
  generateFilePath() {
    const extension = this.type === 'hook' || this.type === 'system' ? '.js' : '.jsx';
    
    switch (this.type) {
      case 'component':
        if (this.feature) {
          return path.join('components', 'features', this.feature, 'components', `${this.name}${extension}`);
        }
        return path.join('components', 'common', `${this.name}${extension}`);
        
      case 'hook':
        if (this.feature) {
          return path.join('components', 'features', this.feature, 'hooks', `${this.name}${extension}`);
        }
        return path.join('hooks', 'common', `${this.name}${extension}`);
        
      case 'system':
        if (this.feature) {
          return path.join('systems', this.feature, `${this.name}${extension}`);
        }
        return path.join('systems', 'core', `${this.name}${extension}`);
        
      case 'page':
        return path.join('components', 'pages', `${this.name}${extension}`);
        
      case 'common':
        return path.join('components', 'common', `${this.name}${extension}`);
        
      default:
        throw new Error(`Unknown type: ${this.type}`);
    }
  }

  // Generate component boilerplate
  generateComponentCode() {
    const templates = {
      component: `import React, { useState, useEffect } from 'react';
import styles from './${this.name}.module.css';
import { } from 'lucide-react';

/**
 * ${this.name} Component
 * ${this.feature ? `Part of ${this.feature} feature` : 'Common component'}
 */
const ${this.name} = ({ 
  // Props
}) => {
  // State
  const [state, setState] = useState({});

  // Effects
  useEffect(() => {
    // Component initialization
  }, []);

  // Event handlers
  const handleAction = () => {
    // Handle user action
  };

  // Render
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>${this.name}</h2>
      </div>
      
      <div className={styles.content}>
        {/* Component content */}
      </div>
    </div>
  );
};

export default ${this.name};`,

      hook: `import { useState, useEffect, useCallback } from 'react';
${this.feature ? `import { } from '@/systems/${this.feature}';` : ''}

/**
 * ${this.name} Hook
 * ${this.feature ? `Manages ${this.feature} state and operations` : 'Custom hook'}
 */
const ${this.name} = (options = {}) => {
  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Operations
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data logic
      const result = await someAsyncOperation();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateData = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update data logic
      const result = await someUpdateOperation(updates);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (options.autoLoad) {
      fetchData();
    }
  }, [fetchData, options.autoLoad]);

  return {
    data,
    loading,
    error,
    fetchData,
    updateData
  };
};

export default ${this.name};`,

      system: `/**
 * ${this.name}
 * ${this.feature ? `Manages ${this.feature} business logic` : 'Core system component'}
 */
class ${this.name} {
  constructor(options = {}) {
    this.options = {
      // Default options
      autoSave: true,
      validateOnChange: true,
      ...options
    };
    
    this.data = new Map();
    this.listeners = new Set();
    this.isInitialized = false;
  }

  // Initialization
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadData();
      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('${this.name} initialization failed:', error);
      throw error;
    }
  }

  // Data management
  async loadData() {
    // Load data from storage or API
  }

  async saveData() {
    // Save data to storage or API
  }

  // Core operations
  create(id, data) {
    if (this.data.has(id)) {
      throw new Error(\`Item with id \${id} already exists\`);
    }
    
    const item = this.validateData(data);
    this.data.set(id, item);
    
    if (this.options.autoSave) {
      this.saveData();
    }
    
    this.emit('created', { id, item });
    return item;
  }

  update(id, updates) {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(\`Item with id \${id} not found\`);
    }
    
    const updated = { ...existing, ...updates };
    const validated = this.validateData(updated);
    
    this.data.set(id, validated);
    
    if (this.options.autoSave) {
      this.saveData();
    }
    
    this.emit('updated', { id, item: validated, previous: existing });
    return validated;
  }

  delete(id) {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(\`Item with id \${id} not found\`);
    }
    
    this.data.delete(id);
    
    if (this.options.autoSave) {
      this.saveData();
    }
    
    this.emit('deleted', { id, item: existing });
    return existing;
  }

  get(id) {
    return this.data.get(id);
  }

  getAll() {
    return Array.from(this.data.values());
  }

  // Validation
  validateData(data) {
    if (!data) {
      throw new Error('Data is required');
    }
    
    // Add specific validation logic
    return data;
  }

  // Event system
  on(event, callback) {
    this.listeners.add({ event, callback });
  }

  off(event, callback) {
    this.listeners.delete({ event, callback });
  }

  emit(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  }

  // Cleanup
  destroy() {
    this.data.clear();
    this.listeners.clear();
    this.isInitialized = false;
  }
}

export default ${this.name};`,

      page: `import React from 'react';
import styles from './${this.name}.module.css';
import { } from 'lucide-react';

/**
 * ${this.name} Page
 * Main page component for ${this.name.toLowerCase()} functionality
 */
const ${this.name} = () => {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>${this.name}</h1>
        <p>Welcome to ${this.name}</p>
      </div>
      
      <div className={styles.content}>
        {/* Page content */}
      </div>
    </div>
  );
};

export default ${this.name};`,

      common: `import React from 'react';
import styles from './${this.name}.module.css';
import { } from 'lucide-react';

/**
 * ${this.name} - Common Component
 * Reusable UI component
 */
const ${this.name} = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={\`\${styles.container} \${className}\`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ${this.name};`
    };

    return templates[this.type] || '';
  }

  // Generate CSS module
  generateCSSModule() {
    if (this.type === 'hook' || this.type === 'system') {
      return null; // No CSS for hooks or systems
    }

    const cssTemplates = {
      component: `.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--background-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-color);
}

.header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}`,

      page: `.page {
  min-height: 100vh;
  padding: var(--space-6);
  background: var(--background-color);
}

.header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.header h1 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.header p {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}`,

      common: `.container {
  /* Base styles for common component */
  box-sizing: border-box;
}`
    };

    return cssTemplates[this.type] || cssTemplates.component;
  }

  // Generate test file
  generateTestFile() {
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ${this.name} from './${this.name}';

describe('${this.name}', () => {
  it('renders without crashing', () => {
    render(<${this.name} />);
  });

  it('displays expected content', () => {
    render(<${this.name} />);
    // Add specific test assertions
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<${this.name} />);
    
    // Add interaction tests
  });
});`;
  }

  // Update barrel exports
  updateBarrelExports(filePath) {
    const featurePath = path.dirname(path.dirname(filePath));
    const barrelPath = path.join(featurePath, 'index.js');
    
    if (!fs.existsSync(barrelPath)) {
      // Create new barrel export file
      const exportLine = this.type === 'component' 
        ? `export { default as ${this.name} } from './${path.relative(featurePath, filePath).replace('.jsx', '').replace('.js', '')}';`
        : this.type === 'hook'
        ? `export { default as ${this.name} } from './${path.relative(featurePath, filePath).replace('.js', '')}';`
        : '';

      const content = `// Auto-generated barrel export\n${exportLine}\n`;
      fs.writeFileSync(barrelPath, content);
    } else {
      // Update existing barrel export
      let content = fs.readFileSync(barrelPath, 'utf8');
      const exportLine = this.type === 'component' 
        ? `export { default as ${this.name} } from './${path.relative(featurePath, filePath).replace('.jsx', '').replace('.js', '')}';`
        : this.type === 'hook'
        ? `export { default as ${this.name} } from './${path.relative(featurePath, filePath).replace('.js', '')}';`
        : '';

      if (exportLine && !content.includes(exportLine)) {
        content += `${exportLine}\n`;
        fs.writeFileSync(barrelPath, content);
      }
    }
  }

  // Generate all files
  generate() {
    console.log(`🚀 Generating ${this.type}: ${this.name}${this.feature ? ` (${this.feature})` : ''}`);

    const filePath = this.generateFilePath();
    const fullPath = path.join(this.srcPath, filePath);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    
    // Generate main file
    const code = this.generateComponentCode();
    fs.writeFileSync(fullPath, code);
    console.log(`✅ Created: ${filePath}`);
    
    // Generate CSS module if needed
    const css = this.generateCSSModule();
    if (css) {
      const cssPath = fullPath.replace(/\.jsx?$/, '.module.css');
      fs.writeFileSync(cssPath, css);
      console.log(`✅ Created: ${path.relative(this.srcPath, cssPath)}`);
    }
    
    // Generate test file
    if (this.type === 'component' || this.type === 'page' || this.type === 'common') {
      const testPath = fullPath.replace(/\.jsx?$/, '.test.js');
      const testCode = this.generateTestFile();
      fs.writeFileSync(testPath, testCode);
      console.log(`✅ Created: ${path.relative(this.srcPath, testPath)}`);
    }
    
    // Update barrel exports for feature components/hooks
    if ((this.type === 'component' || this.type === 'hook') && this.feature) {
      this.updateBarrelExports(filePath);
      console.log(`✅ Updated barrel exports`);
    }
    
    console.log(`\n🎉 Successfully generated ${this.type}: ${this.name}`);
    console.log(`📁 Location: ${filePath}`);
    
    if (this.type === 'component' || this.type === 'page') {
      console.log(`\n📝 Next steps:`);
      console.log(`1. Import and use the component: import ${this.name} from '@/${filePath.replace(/\.jsx?$/, '')}';`);
      console.log(`2. Customize the component props and styling`);
      console.log(`3. Add component to relevant parent components`);
    } else if (this.type === 'hook') {
      console.log(`\n📝 Next steps:`);
      console.log(`1. Import and use the hook: import ${this.name} from '@/${filePath.replace(/\.js$/, '')}';`);
      console.log(`2. Implement the hook's business logic`);
      console.log(`3. Add proper TypeScript types if using TypeScript`);
    } else if (this.type === 'system') {
      console.log(`\n📝 Next steps:`);
      console.log(`1. Import the system: import ${this.name} from '@/${filePath.replace(/\.js$/, '')}';`);
      console.log(`2. Initialize the system in your app`);
      console.log(`3. Implement the core business logic`);
    }
  }
}

// Run generator
const generator = new ComponentGenerator();
generator.generate();