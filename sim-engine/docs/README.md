# Documentation Index

## Overview

This directory contains comprehensive documentation for the World History Simulation Engine, with a focus on the integrated text templating system that enables dynamic, contextual content creation.

## Text Templating Documentation

### Getting Started
- **[Text Templating Guide](TextTemplatingGuide.md)** - Complete guide to using dynamic text features
  - Placeholder syntax and usage
  - Conditional logic and random selection
  - Real-time preview system
  - Contextual suggestions
  - Integration with editors

### Reference Materials
- **[Dialogue Patterns Reference](DialoguePatternsReference.md)** - Common dialogue patterns and examples
  - Greetings, farewells, and reactions
  - Personality-driven dialogue
  - Environmental context patterns
  - Advanced interaction patterns

- **[Text Templating Troubleshooting](TextTemplatingTroubleshooting.md)** - Solutions for common issues
  - Error messages and fixes
  - Debugging workflow
  - Performance optimization
  - Prevention tips

### Migration and Best Practices
- **[Migration Guide](TextTemplatingMigrationGuide.md)** - Transitioning from old template system
  - Understanding the new separation of concerns
  - Converting existing templates
  - Updated workflows and best practices

- **[Best Practices Guide](TextTemplatingBestPractices.md)** - Effective text templating strategies
  - Design patterns and principles
  - Performance optimization
  - Content guidelines
  - Quality assurance

## System Documentation

### Technical Reference
- **[WorldSaveManager](WorldSaveManager.md)** - World state persistence system

## Quick Reference

### Text Templating Syntax
```
{{character.name}}                    # Basic placeholder
{{#if character.reputation > 10}}     # Conditional logic
{{random:option1,option2,option3}}    # Random selection
{{node.environmentalProperties.crowded}} # Nested properties
```

### Common Use Cases
- **Dynamic Dialogue**: Personalized conversations in InteractionEditor
- **Contextual Descriptions**: Adaptive content in EncounterEditor
- **Quest Objectives**: Dynamic quest text based on character attributes
- **Environmental Storytelling**: Location-aware narrative content

### Key Features
- **Editor Integration**: Built directly into InteractionEditor and EncounterEditor
- **Real-Time Preview**: See resolved content as you type
- **Contextual Suggestions**: Smart placeholder recommendations
- **Template Separation**: Clear distinction between structural and text templates

## Documentation Structure

### User-Focused Documentation
Guides designed for world builders and content creators:
- Step-by-step tutorials
- Practical examples
- Troubleshooting help
- Best practice recommendations

### Developer-Focused Documentation
Technical references for system integration:
- API documentation
- Architecture overviews
- Extension guidelines
- Performance considerations

## Getting Help

### Documentation Hierarchy
1. **Start Here**: [Text Templating Guide](TextTemplatingGuide.md) for comprehensive overview
2. **Need Examples**: [Dialogue Patterns Reference](DialoguePatternsReference.md) for practical patterns
3. **Having Issues**: [Troubleshooting Guide](TextTemplatingTroubleshooting.md) for problem solving
4. **Migrating**: [Migration Guide](TextTemplatingMigrationGuide.md) for system transition
5. **Optimizing**: [Best Practices Guide](TextTemplatingBestPractices.md) for advanced techniques

### Support Resources
- **In-App Help**: Contextual suggestions and preview system
- **Community**: Share patterns and get help from other users
- **Documentation**: Comprehensive guides and references
- **Examples**: Working templates and patterns throughout the guides

## Contributing to Documentation

### Improvement Areas
- Additional dialogue pattern examples
- More troubleshooting scenarios
- Advanced technique tutorials
- Performance optimization guides

### Documentation Standards
- Clear, actionable instructions
- Practical examples with explanations
- Consistent formatting and structure
- Regular updates based on user feedback

## Version Information

This documentation reflects the current text templating system that:
- Integrates directly into InteractionEditor and EncounterEditor
- Separates structural templates from text templating
- Provides real-time preview and contextual suggestions
- Maintains compatibility with existing TextTemplateEngine

For the most current information, always refer to the individual guide files as they are updated more frequently than this index.