# Text Templating User Guide

## Overview

Text templating allows you to create dynamic, personalized content directly within the InteractionEditor and EncounterEditor. Instead of writing static text, you can use placeholders that automatically fill in with character, location, and world data to create rich, contextual dialogue and descriptions.

## Getting Started

### What is Text Templating?

Text templating transforms static text into dynamic content using placeholders. For example:
- Static: "Hello, stranger!"
- Dynamic: "Hello, {{character.name}}!"

When the template is processed, `{{character.name}}` becomes the actual character's name, creating personalized interactions.

### Where to Use Text Templating

Text templating is integrated directly into:
- **InteractionEditor**: For dialogue branches and character responses
- **EncounterEditor**: For encounter descriptions and quest objectives

You don't need to navigate to a separate template library - everything is available right in the editor.

## Placeholder Syntax

### Basic Placeholders

Use double curly braces to create placeholders:

```
{{character.name}}          # Character's name
{{character.reputation}}    # Character's reputation score
{{node.name}}              # Current location name
{{world.name}}             # World name
```

### Character Placeholders

Access character data using dot notation:

```
# Basic Information
{{character.name}}                    # "Elena"
{{character.type}}                    # "merchant"

# D&D Attributes
{{character.attributes.strength}}     # 14
{{character.attributes.charisma}}     # 16
{{character.attributes.intelligence}} # 12

# Personality Traits
{{character.personality.aggression}}  # 0.2 (low aggression)
{{character.personality.curiosity}}   # 0.8 (high curiosity)
{{character.personality.empathy}}     # 0.6 (moderate empathy)

# Consciousness
{{character.consciousness.frequency}} # 45 (Hz)
{{character.consciousness.coherence}} # 0.8 (high coherence)

# Reputation & Relationships
{{character.reputation}}              # 15
```

### Node (Location) Placeholders

Access location properties:

```
# Basic Information
{{node.name}}                        # "Market Square"
{{node.type}}                        # "marketplace"

# Environmental Properties
{{node.environmentalProperties.crowded}}    # true/false
{{node.environmentalProperties.noisy}}      # true/false
{{node.environmentalProperties.prosperous}} # true/false

# Cultural Context
{{node.culturalContext.language}}    # "common"
{{node.culturalContext.customs}}     # "mercantile"
{{node.culturalContext.law}}         # "guild-enforced"

# Resources
{{node.resourceAvailability.goods}}  # "abundant"
{{node.resourceAvailability.gold}}   # "circulating"
```

### World Placeholders

Access world-level data:

```
{{world.name}}                       # "Aethermoor"
{{world.properties.climate}}         # "temperate"
{{world.properties.technology}}      # "medieval"
```

## Conditional Logic

### Basic Conditionals

Use `{{#if}}` and `{{/if}}` to show text only when conditions are met:

```
{{#if character.reputation > 10}}
You are well-regarded here, {{character.name}}.
{{/if}}

{{#if character.attributes.charisma > 14}}
Your words carry weight and influence.
{{/if}}
```

### If-Else Statements

Use `{{#else}}` for alternative text:

```
{{#if character.reputation > 10}}
Welcome back, honored {{character.name}}!
{{#else}}
I don't believe we've met, stranger.
{{/if}}
```

### Complex Conditions

Combine multiple conditions:

```
{{#if character.attributes.strength > 15 AND character.reputation > 5}}
Your reputation as a mighty warrior precedes you.
{{/if}}

{{#if character.personality.aggression > 0.7 OR character.attributes.strength > 16}}
I can see the fire in your eyes.
{{/if}}
```

### Nested Conditionals

Conditionals can be nested for complex logic:

```
{{#if character.type == "merchant"}}
  {{#if character.reputation > 15}}
    Ah, the famous trader {{character.name}}! 
  {{#else}}
    Another merchant, I see.
  {{/if}}
{{/if}}
```

## Random Selection

### Basic Random Selection

Use `{{random:}}` to randomly choose from options:

```
{{random:Greetings,Hello,Well met}}, {{character.name}}!
# Randomly outputs: "Greetings, Elena!" or "Hello, Elena!" or "Well met, Elena!"
```

### Random with Conditionals

Combine random selection with conditionals:

```
{{#if character.reputation > 10}}
{{random:Welcome back,Good to see you again}}, my friend!
{{#else}}
{{random:Greetings,Hello}}, stranger.
{{/if}}
```

### Complex Random Patterns

```
The {{random:bustling,crowded,lively}} {{node.name}} {{random:echoes with,fills with,resonates with}} the sounds of {{random:commerce,trade,daily life}}.
```

## Common Dialogue Patterns

### Greetings

```
# Reputation-based greeting
{{#if character.reputation > 15}}
{{random:Welcome back,Greetings}}, honored {{character.name}}!
{{#else if character.reputation > 5}}
{{random:Hello,Greetings}}, {{character.name}}.
{{#else}}
{{random:Greetings,Hello}}, stranger.
{{/if}}

# Attribute-based greeting
{{#if character.attributes.charisma > 16}}
Your presence lights up {{node.name}}, {{character.name}}.
{{#else if character.attributes.charisma > 12}}
Good to see you, {{character.name}}.
{{#else}}
{{character.name}}.
{{/if}}
```

### Farewells

```
# Simple farewell
Safe travels, {{character.name}}.

# Conditional farewell
{{#if character.reputation > 10}}
May {{random:fortune,the gods,luck}} smile upon you, {{character.name}}.
{{#else}}
{{random:Farewell,Until next time}}, {{character.name}}.
{{/if}}
```

### Questions

```
# Location-based questions
What brings you to {{node.name}}, {{character.name}}?

Have you heard any news from {{random:the capital,other settlements,your travels}}?

{{#if node.type == "marketplace"}}
Looking to {{random:buy,sell,trade}} anything today?
{{/if}}
```

### Reactions

```
# Attribute-based reactions
{{#if character.attributes.intelligence > 15}}
Your keen insight is impressive, {{character.name}}.
{{/if}}

{{#if character.attributes.strength > 16}}
I wouldn't want to face you in combat!
{{/if}}

# Personality-based reactions
{{#if character.personality.empathy > 0.7}}
Your compassion is evident, {{character.name}}.
{{/if}}

{{#if character.personality.aggression > 0.8}}
I can sense the fire within you.
{{/if}}
```

## Quest and Encounter Text

### Dynamic Quest Objectives

```
# Character-specific objectives
{{#if character.attributes.charisma > 14}}
Use your natural charm to negotiate with the merchant guild.
{{#else}}
Find another way to gain the merchant guild's trust.
{{/if}}

# Location-based objectives
Investigate the strange occurrences in {{node.name}}.
Speak with {{random:3,4,5}} residents of {{node.name}} about the recent events.
```

### Encounter Descriptions

```
# Environmental descriptions
{{#if node.environmentalProperties.crowded}}
The {{node.name}} bustles with activity as {{random:merchants hawk their wares,people go about their daily business,travelers come and go}}.
{{#else}}
The {{node.name}} is {{random:quiet,peaceful,nearly empty}} at this hour.
{{/if}}

# Character-specific descriptions
{{#if character.reputation > 15}}
As {{character.name}} enters {{node.name}}, several people nod respectfully in recognition.
{{#else if character.reputation < 5}}
{{character.name}} draws suspicious glances from the locals in {{node.name}}.
{{#else}}
{{character.name}} blends into the crowd at {{node.name}}.
{{/if}}
```

## Real-Time Preview

### Understanding the Preview

When editing templated text, you'll see two views:
- **Editor View**: Shows your template with placeholders
- **Preview View**: Shows how the text will appear with actual data

### Preview States

- **Green highlight**: Placeholder successfully resolved with data
- **Yellow highlight**: Placeholder syntax correct but no data available
- **Red highlight**: Invalid placeholder syntax or error

### Example Preview

```
Editor: "Hello, {{character.name}}! Welcome to {{node.name}}."
Preview: "Hello, Elena! Welcome to Market Square."
```

## Contextual Suggestions

### Using Suggestions

While editing, you'll see categorized placeholder suggestions:

- **Character**: Attributes, personality, reputation
- **Node**: Location properties, environmental data
- **World**: Global properties and settings
- **System**: Random selection, conditionals

### Inserting Suggestions

1. Click on any suggestion to insert it at your cursor
2. Use the search box to filter suggestions
3. Hover over suggestions to see descriptions and examples

## Troubleshooting

### Common Syntax Errors

#### Unclosed Conditionals
```
# ❌ Wrong - missing closing tag
{{#if character.reputation > 10}}
Welcome back!

# ✅ Correct - properly closed
{{#if character.reputation > 10}}
Welcome back!
{{/if}}
```

#### Invalid Placeholder Syntax
```
# ❌ Wrong - incomplete placeholder
{{character.name

# ✅ Correct - properly closed
{{character.name}}
```

#### Incorrect Property Names
```
# ❌ Wrong - property doesn't exist
{{character.nonexistent}}

# ✅ Correct - valid property
{{character.name}}
```

### Error Messages

- **"Unclosed conditional statement"**: You have an `{{#if}}` without a matching `{{/if}}`
- **"Incomplete placeholder syntax"**: Missing closing braces `}}`
- **"Invalid property path"**: The placeholder refers to data that doesn't exist
- **"Syntax error in conditional"**: Invalid condition logic

### Debugging Tips

1. **Check the preview**: Red highlighting indicates errors
2. **Use simple placeholders first**: Start with `{{character.name}}` before complex conditionals
3. **Test conditionals step by step**: Add one condition at a time
4. **Verify data availability**: Make sure the character/node data exists

### Getting Help

If you encounter issues:
1. Check this troubleshooting section
2. Verify your syntax against the examples
3. Use the contextual suggestions to ensure correct placeholder names
4. Start with simple templates and build complexity gradually

## Best Practices

### Writing Effective Templates

1. **Start Simple**: Begin with basic placeholders, add complexity gradually
2. **Test Frequently**: Use the preview to verify your templates work
3. **Plan for Missing Data**: Use conditionals to handle cases where data might not exist
4. **Keep It Readable**: Break complex templates into multiple lines

### Performance Tips

1. **Avoid Deep Nesting**: Limit conditional nesting to 2-3 levels
2. **Use Specific Conditions**: More specific conditions perform better
3. **Cache Complex Templates**: Save frequently used patterns as dialogue patterns

### Content Guidelines

1. **Maintain Consistency**: Use similar patterns across your world
2. **Respect Character Voice**: Let personality traits influence dialogue style
3. **Consider Context**: Make sure templates fit the situation
4. **Plan for Variety**: Use random selection to avoid repetitive text

## Advanced Techniques

### Dynamic Personality-Based Dialogue

```
{{#if character.personality.aggression > 0.7}}
  {{#if character.attributes.charisma > 14}}
    Your words cut like a blade, but they carry undeniable truth.
  {{#else}}
    Your aggressive nature is... unsettling.
  {{/if}}
{{#else if character.personality.empathy > 0.7}}
  {{#if character.attributes.wisdom > 14}}
    Your compassionate wisdom is a rare gift, {{character.name}}.
  {{#else}}
    Your kind heart shines through, {{character.name}}.
  {{/if}}
{{#else}}
  A practical sort, I see.
{{/if}}
```

### Environmental Storytelling

```
{{#if node.environmentalProperties.prosperous}}
  {{#if node.environmentalProperties.crowded}}
    The wealth of {{node.name}} draws crowds from across the realm.
  {{#else}}
    Despite its prosperity, {{node.name}} maintains an air of exclusivity.
  {{/if}}
{{#else}}
  {{#if node.environmentalProperties.crowded}}
    Hard times have driven many to seek opportunity in {{node.name}}.
  {{#else}}
    {{node.name}} bears the quiet dignity of a place that has seen better days.
  {{/if}}
{{/if}}
```

### Multi-Character Interactions

```
{{#if participants.length > 1}}
  {{#if character.attributes.charisma > participants.average.charisma}}
    {{character.name}} naturally takes the lead in the conversation.
  {{#else}}
    {{character.name}} listens carefully to the others.
  {{/if}}
{{#else}}
  {{character.name}} speaks directly, person to person.
{{/if}}
```

## Integration with Other Systems

### Quest System Integration

Text templating works seamlessly with the quest system:
- Quest objectives can use templated text
- Completion messages adapt to character and context
- Quest dialogue branches based on character attributes

### Template Library Integration

While text templating is built into editors, the template library focuses on:
- Character attribute configurations
- Node environmental properties  
- World structural templates
- Interaction frameworks

Use editors for dynamic text content, use the library for structural components.

## Conclusion

Text templating transforms static content into dynamic, personalized experiences. By mastering placeholders, conditionals, and random selection, you can create rich, contextual content that adapts to your characters and world, making every interaction feel unique and meaningful.

Remember: start simple, test frequently, and build complexity gradually. The preview system and contextual suggestions are your best tools for creating effective templated content.