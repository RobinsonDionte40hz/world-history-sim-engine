/**
 * Consciousness Template Integration Demo
 *
 * This demo shows how to use the enhanced template system with consciousness
 * parameters to create consistent NPC archetypes with predictable behavior.
 */

const { TemplateManager } = require('../template/TemplateManager');
const { Character } = require('../domain/entities/Character');

class ConsciousnessTemplateDemo {
  constructor() {
    this.templateManager = new TemplateManager();
    this.demoResults = [];
  }

  /**
   * Run the complete consciousness template integration demo
   */
  async runDemo() {
    console.log('🧠 Consciousness Template Integration Demo');
    console.log('==========================================\n');

    try {
      // Step 1: Create archetype templates
      await this.createArchetypeTemplates();

      // Step 2: Demonstrate template instantiation
      await this.demonstrateTemplateInstantiation();

      // Step 3: Show consciousness validation
      await this.demonstrateConsciousnessValidation();

      // Step 4: Create custom consciousness templates
      await this.createCustomConsciousnessTemplates();

      // Step 5: Show behavioral state evolution
      await this.demonstrateBehavioralEvolution();

      console.log('\n✅ Demo completed successfully!');
      console.log('📊 Results:', this.demoResults);

    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      throw error;
    }
  }

  /**
   * Step 1: Create archetype templates from predefined configurations
   */
  async createArchetypeTemplates() {
    console.log('Step 1: Creating Archetype Templates');
    console.log('-----------------------------------');

    const archetypes = ['warrior', 'merchant', 'scholar', 'noble', 'peasant', 'priest', 'rogue', 'mage'];

    for (const archetype of archetypes) {
      try {
        const template = this.templateManager.createCharacterTemplateWithBehavioralState(archetype);
        console.log(`✅ Created ${archetype} template:`, {
          id: template.id,
          consciousness: {
            frequency: template.consciousness.frequency,
            coherence: template.consciousness.coherence,
            energy: template.consciousness.behavioralState.energy,
            focus: template.consciousness.behavioralState.focus
          }
        });

        this.demoResults.push({
          step: 'createArchetypeTemplates',
          archetype,
          templateId: template.id,
          success: true
        });

      } catch (error) {
        console.error(`❌ Failed to create ${archetype} template:`, error.message);
        this.demoResults.push({
          step: 'createArchetypeTemplates',
          archetype,
          success: false,
          error: error.message
        });
      }
    }
    console.log('');
  }

  /**
   * Step 2: Demonstrate template instantiation with customizations
   */
  async demonstrateTemplateInstantiation() {
    console.log('Step 2: Template Instantiation with Customizations');
    console.log('------------------------------------------------');

    // Create a warrior with custom consciousness parameters
    const warriorTemplate = this.templateManager.createCharacterTemplateWithBehavioralState('warrior');
    const customWarrior = Character.fromTemplate(warriorTemplate, {
      name: 'Captain Thorne',
      consciousness: {
        frequency: 12.0, // Higher frequency for intense focus
        behavioralState: {
          energy: 0.9, // Very energetic
          riskTolerance: 0.8 // High risk tolerance
        }
      }
    });

    console.log('✅ Created custom warrior:', {
      name: customWarrior.name,
      consciousness: {
        frequency: customWarrior.consciousness.frequency,
        coherence: customWarrior.consciousness.coherence,
        energy: customWarrior.consciousness.behavioralState.energy,
        riskTolerance: customWarrior.consciousness.behavioralState.riskTolerance
      }
    });

    // Create a scholar with environmental adaptation
    const scholarTemplate = this.templateManager.createCharacterTemplateWithBehavioralState('scholar');
    const adaptedScholar = Character.fromTemplate(scholarTemplate, {
      name: 'Professor Elara',
      consciousness: {
        updateRules: {
          adaptationRate: 1.5, // Faster adaptation to new situations
          stabilityFactor: 0.8 // Less stable, more flexible
        }
      }
    });

    console.log('✅ Created adapted scholar:', {
      name: adaptedScholar.name,
      adaptationRate: adaptedScholar.consciousness.updateRules.adaptationRate,
      stabilityFactor: adaptedScholar.consciousness.updateRules.stabilityFactor
    });

    this.demoResults.push({
      step: 'demonstrateTemplateInstantiation',
      customizations: ['warrior', 'scholar'],
      success: true
    });
    console.log('');
  }

  /**
   * Step 3: Demonstrate consciousness validation
   */
  async demonstrateConsciousnessValidation() {
    console.log('Step 3: Consciousness Configuration Validation');
    console.log('--------------------------------------------');

    // Valid configuration
    const validConfig = {
      frequency: 10.0,
      coherence: 0.8,
      behavioralState: {
        energy: 0.7,
        focus: 0.8,
        socialDrive: 0.6,
        riskTolerance: 0.5,
        ambition: 0.9
      },
      updateRules: {
        significanceThreshold: 0.3,
        adaptationRate: 1.2,
        stabilityFactor: 1.0
      }
    };

    const validResult = Character.validateConsciousnessConfig(validConfig);
    console.log('✅ Valid configuration:', validResult.isValid ? 'PASSED' : 'FAILED');

    // Invalid configurations
    const invalidConfigs = [
      { frequency: 20.0 }, // Frequency too high
      { coherence: 1.5 }, // Coherence too high
      { behavioralState: { energy: -0.1 } }, // Negative value
      { updateRules: { adaptationRate: 3.0 } } // Rate too high
    ];

    invalidConfigs.forEach((config, index) => {
      const result = Character.validateConsciousnessConfig(config);
      console.log(`❌ Invalid config ${index + 1}:`, result.errors[0]);
    });

    this.demoResults.push({
      step: 'demonstrateConsciousnessValidation',
      validTests: 1,
      invalidTests: invalidConfigs.length,
      success: true
    });
    console.log('');
  }

  /**
   * Step 4: Create custom consciousness templates
   */
  async createCustomConsciousnessTemplates() {
    console.log('Step 4: Custom Consciousness Templates');
    console.log('-------------------------------------');

    // Create a "battle-hardened veteran" template
    const veteranTemplate = {
      id: 'veteran_warrior',
      name: 'Veteran Warrior',
      consciousness: {
        frequency: 8.0, // Lower frequency, more stable
        coherence: 0.9, // High coherence from experience
        behavioralState: {
          energy: 0.6, // Controlled energy
          focus: 0.9, // High focus
          socialDrive: 0.4, // Less social
          riskTolerance: 0.7, // Moderate risk taking
          ambition: 0.5 // Moderate ambition
        },
        updateRules: {
          significanceThreshold: 0.4, // Higher threshold for reaction
          adaptationRate: 0.8, // Slower adaptation
          stabilityFactor: 1.3 // More stable
        }
      },
      personality: {
        traits: [
          { id: 'discipline', intensity: 0.9 },
          { id: 'caution', intensity: 0.8 },
          { id: 'loyalty', intensity: 0.7 }
        ]
      }
    };

    // Validate and save the custom template
    const validation = this.templateManager.validateBehavioralStateTemplate(veteranTemplate);
    if (validation.isValid) {
      console.log('✅ Custom veteran template validated and ready for use');
      console.log('   Consciousness profile:', {
        frequency: veteranTemplate.consciousness.frequency,
        coherence: veteranTemplate.consciousness.coherence,
        focus: veteranTemplate.consciousness.behavioralState.focus,
        stability: veteranTemplate.consciousness.updateRules.stabilityFactor
      });
    } else {
      console.log('❌ Custom template validation failed:', validation.errors);
    }

    this.demoResults.push({
      step: 'createCustomConsciousnessTemplates',
      templateType: 'veteran_warrior',
      validationPassed: validation.isValid,
      success: validation.isValid
    });
    console.log('');
  }

  /**
   * Step 5: Demonstrate behavioral state evolution
   */
  async demonstrateBehavioralEvolution() {
    console.log('Step 5: Behavioral State Evolution');
    console.log('----------------------------------');

    // Create a character and simulate consciousness evolution
    const merchantTemplate = this.templateManager.createCharacterTemplateWithBehavioralState('merchant');
    const merchant = Character.fromTemplate(merchantTemplate, {
      name: 'Trader Elias'
    });

    console.log('📊 Initial merchant state:', {
      name: merchant.name,
      energy: merchant.consciousness.behavioralState.energy,
      socialDrive: merchant.consciousness.behavioralState.socialDrive,
      riskTolerance: merchant.consciousness.behavioralState.riskTolerance
    });

    // Simulate evolution through events (this would normally be handled by ConsciousnessUpdateService)
    const evolvedState = {
      energy: Math.min(1.0, merchant.consciousness.behavioralState.energy + 0.1), // Gained energy
      socialDrive: Math.max(0.0, merchant.consciousness.behavioralState.socialDrive - 0.05), // Less social after stress
      riskTolerance: Math.min(1.0, merchant.consciousness.behavioralState.riskTolerance + 0.15) // More risk-tolerant after success
    };

    console.log('📈 Evolved merchant state:', evolvedState);
    console.log('   Changes: Energy +10%, Social Drive -5%, Risk Tolerance +15%');

    this.demoResults.push({
      step: 'demonstrateBehavioralEvolution',
      initialState: merchant.consciousness.behavioralState,
      evolvedState,
      success: true
    });
    console.log('');
  }

  /**
   * Get demo results summary
   */
  getResultsSummary() {
    const successful = this.demoResults.filter(r => r.success).length;
    const total = this.demoResults.length;

    return {
      totalSteps: total,
      successfulSteps: successful,
      successRate: `${((successful / total) * 100).toFixed(1)}%`,
      results: this.demoResults
    };
  }
}

// Export for use in tests or other modules
module.exports = { ConsciousnessTemplateDemo };

// Run demo if called directly
if (require.main === module) {
  const demo = new ConsciousnessTemplateDemo();
  demo.runDemo()
    .then(() => {
      console.log('\n🎉 Demo Summary:', demo.getResultsSummary());
    })
    .catch(error => {
      console.error('💥 Demo failed:', error);
      process.exit(1);
    });
}