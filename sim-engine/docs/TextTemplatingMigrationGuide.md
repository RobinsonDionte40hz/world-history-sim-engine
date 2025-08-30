# Text Templating Migration Guide

## Overview

This guide helps users transition from the previous template system to the new integrated text templating features. The system now clearly separates structural templates (for building components) from text templating (for dynamic content creation).

## What Changed

### Before: Mixed Template System
Previously, the template library handled both:
- Structural components (character stats, node properties)
- Text content (dialogue, descriptions)

This created confusion about when to use templates vs. when to write custom content.

### After: Clear Separation
Now the system has two distinct templating approaches:

1. **Structural Templates** (Template Library)
   - Character attribute configurations
   - Node environmental properties
   - Interaction frameworks
   - World structural components

2. **Text Templating** (Editor Integration)
   - Dynamic dialogue in InteractionEditor
   - Contextual descriptions in EncounterEditor
   - Real-time placeholder resolution
   - Conditional and random content

## Migration Steps

### Step 1: Identify Your Current Templates

Review your existing templates and categorize them:

#### Keep in Template Library (Structural)
- ✅ Character builds with specific attribute distributions
- ✅ Node templates with environmental properties
- ✅ Interaction frameworks and action patterns
- ✅ World configuration templates

#### Move to Editor Text Templating (Content)
- 🔄 Dialogue templates with character names
- 🔄 Description templates with location references
- 🔄 Quest text with dynamic objectives
- 🔄 Encounter narratives with character interactions

### Step 2: Convert Text Content Templates

#### Old Approach: Static Text Templates
```
Template: "Heroic Warrior Greeting"
Content: "Greetings, brave warrior! Welcome to the tavern!"
```

#### New Approach: Dynamic Text Templating
```
Editor Text: "Greetings, {{character.name}}! Welcome to {{node.name}}!"
```

### Step 3: Update Your Workflow

#### Old Workflow
1. Create character in Template Library
2. Create dialogue template in Template Library
3. Apply both templates to create content
4. Manually customize for specific situations

#### New Workflow
1. Create character template in Template Library (structural only)
2. Use character template to create specific characters
3. Write dynamic dialogue directly in InteractionEditor
4. Use text templating for automatic personalization

## Specific Migration Examples

### Character Dialogue Migration

#### Before (Template Library)
```
Template Name: "Merchant Greeting"
Template Type: "Text"
Content: "Welcome to my shop, traveler! I have the finest goods in the land!"
```

#### After (InteractionEditor)
```
Branch Text: "Welcome to my shop, {{character.name}}! 
{{#if node.environmentalProperties.prosperous}}
I have the finest goods in the land!
{{#else}}
I have what I can manage to stock.
{{/if}}"
```

### Quest Description Migration

#### Before (Template Library)
```
Template Name: "Delivery Quest"
Template Type: "Quest"
Content: "Deliver this package to the merchant in the next town."
```

#### After (EncounterEditor)
```
Quest Objective: "Deliver this {{random:package,parcel,item}} to {{target.name}} in {{target.location.name}}.
{{#if character.reputation > 10}}
Your reputation ensures safe passage.
{{#else}}
Be careful on the roads.
{{/if}}"
```

### Location Description Migration

#### Before (Template Library)
```
Template Name: "Tavern Description"
Template Type: "Location"
Content: "A cozy tavern with a warm fireplace and friendly atmosphere."
```

#### After (EncounterEditor)
```
Encounter Description: "{{#if node.environmentalProperties.crowded}}
A bustling tavern filled with {{random:travelers,locals,merchants}} and lively conversation.
{{#else}}
A quiet tavern with a {{random:warm,cozy,welcoming}} atmosphere and {{random:crackling fireplace,soft lighting}}.
{{/if}}"
```

## Updated Best Practices

### Use Template Library For:

1. **Character Builds**
   ```json
   {
     "name": "Merchant Archetype",
     "type": "character",
     "attributes": {
       "charisma": 16,
       "intelligence": 14,
       "wisdom": 12
     },
     "personality": {
       "curiosity": 0.8,
       "empathy": 0.6
     }
   }
   ```

2. **Node Configurations**
   ```json
   {
     "name": "Marketplace Template",
     "type": "node",
     "environmentalProperties": {
       "crowded": true,
       "noisy": true,
       "prosperous": true
     },
     "culturalContext": {
       "language": "common",
       "customs": "mercantile"
     }
   }
   ```

3. **Interaction Frameworks**
   ```json
   {
     "name": "Trade Interaction",
     "type": "interaction",
     "requirements": {
       "nodeType": ["marketplace", "shop"],
       "attributes": { "charisma": 10 }
     },
     "effects": {
       "success": { "gold": "+10", "reputation": "+1" }
     }
   }
   ```

### Use Text Templating For:

1. **Dynamic Dialogue**
   ```
   {{#if character.reputation > 15}}
   Welcome back, honored {{character.name}}!
   {{#else}}
   {{random:Greetings,Hello}}, {{character.name}}.
   {{/if}}
   ```

2. **Contextual Descriptions**
   ```
   {{character.name}} enters {{node.name}}.
   {{#if node.environmentalProperties.crowded}}
   The crowd parts respectfully.
   {{#else}}
   The quiet space feels peaceful.
   {{/if}}
   ```

3. **Adaptive Quest Content**
   ```
   {{#if character.attributes.charisma > 14}}
   Use your natural charm to negotiate with the guild.
   {{#else}}
   Find another way to gain the guild's trust.
   {{/if}}
   ```

## Common Migration Issues

### Issue 1: Missing Context Data
**Problem**: Templates that worked before now show placeholder syntax
**Solution**: Ensure the editor has proper context (character, node, world data)

### Issue 2: Complex Logic in Templates
**Problem**: Trying to recreate complex template logic in text templating
**Solution**: Use structural templates for complex configurations, text templating for content

### Issue 3: Performance with Large Templates
**Problem**: Complex text templates causing slow preview updates
**Solution**: Simplify templates, use caching, break into smaller sections

## Transition Timeline

### Phase 1: Immediate (Current)
- ✅ Text templating available in editors
- ✅ Template library still supports all existing templates
- ✅ No breaking changes to existing workflows

### Phase 2: Gradual Migration (Recommended)
- 🔄 Start using text templating for new content
- 🔄 Gradually convert text-focused templates to editor templating
- 🔄 Keep structural templates in library

### Phase 3: Optimization (Future)
- 📋 Remove redundant text templates from library
- 📋 Focus library on structural components only
- 📋 Streamline template organization

## Getting Help

### Resources
- **[Text Templating Guide](TextTemplatingGuide.md)**: Complete feature documentation
- **[Dialogue Patterns Reference](DialoguePatternsReference.md)**: Common patterns and examples
- **[Troubleshooting Guide](TextTemplatingTroubleshooting.md)**: Solutions for common issues

### Migration Support
If you encounter issues during migration:
1. Check the troubleshooting guide for common problems
2. Test with simple templates first
3. Gradually add complexity
4. Use the preview system to verify results

### Community Resources
- Share successful migration patterns
- Ask for help with complex template conversions
- Contribute improved patterns to the community

## Benefits of the New System

### For Users
- **Clearer Purpose**: Know when to use templates vs. text templating
- **Better Performance**: Optimized for different use cases
- **Easier Discovery**: Features are where you need them
- **More Flexibility**: Dynamic content adapts to context

### For Developers
- **Cleaner Architecture**: Separation of concerns
- **Better Maintainability**: Focused components
- **Easier Testing**: Isolated functionality
- **Future Extensibility**: Clear extension points

## Conclusion

The migration to separated templating systems provides:
- **Clarity**: Clear distinction between structural and content templating
- **Efficiency**: Right tool for the right job
- **Flexibility**: Dynamic content that adapts to context
- **Maintainability**: Cleaner, more focused systems

Take your time with the migration - both systems work together during the transition period. Focus on learning the new text templating features for new content while gradually converting existing text templates as needed.