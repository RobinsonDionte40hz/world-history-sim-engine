# Text Templating Best Practices Guide

## Overview

This guide provides proven strategies and best practices for creating effective, maintainable, and performant text templates in the World History Simulation Engine. Following these practices will help you create rich, dynamic content that enhances your world-building experience.

## Core Principles

### 1. Start Simple, Build Complexity
Always begin with basic placeholders and gradually add complexity:

```
✅ Good progression:
Step 1: "Hello, {{character.name}}."
Step 2: "Hello, {{character.name}}. Welcome to {{node.name}}."
Step 3: "{{#if character.reputation > 10}}Welcome back{{#else}}Hello{{/if}}, {{character.name}}."

❌ Avoid jumping to complex templates:
"{{#if character.reputation > 10 AND character.attributes.charisma > 14}}{{random:Welcome back,Greetings}} honored {{character.name}}!{{#else if character.reputation > 5}}{{random:Hello,Greetings}} {{character.name}}.{{#else}}{{random:Greetings,Hello}}, stranger.{{/if}}"
```

### 2. Prioritize Readability
Write templates that are easy to understand and maintain:

```
✅ Readable structure:
{{#if character.reputation > 15}}
  Welcome back, honored {{character.name}}!
{{#else if character.reputation > 5}}
  Hello, {{character.name}}.
{{#else}}
  Greetings, stranger.
{{/if}}

❌ Hard to read:
{{#if character.reputation > 15}}Welcome back, honored {{character.name}}!{{#else if character.reputation > 5}}Hello, {{character.name}}.{{#else}}Greetings, stranger.{{/if}}
```

### 3. Test Frequently
Use the preview system to verify your templates work as expected:
- Test with different character types
- Verify with various reputation levels
- Check with different node properties
- Ensure graceful handling of missing data

## Template Design Patterns

### Pattern 1: Tiered Responses
Create responses that scale with character attributes or reputation:

```
# Reputation-based greeting
{{#if character.reputation > 20}}
  Your legend precedes you, {{character.name}}!
{{#else if character.reputation > 10}}
  Welcome back, {{character.name}}.
{{#else if character.reputation > 0}}
  Hello, {{character.name}}.
{{#else}}
  Greetings, stranger.
{{/if}}
```

### Pattern 2: Attribute-Influenced Content
Let character attributes shape the narrative:

```
# Charisma-based interaction
{{#if character.attributes.charisma > 16}}
  Your words carry natural authority, {{character.name}}.
{{#else if character.attributes.charisma > 12}}
  You speak with confidence, {{character.name}}.
{{#else}}
  {{character.name}} speaks hesitantly.
{{/if}}
```

### Pattern 3: Environmental Adaptation
Make content respond to location properties:

```
# Environment-aware description
{{#if node.environmentalProperties.crowded}}
  The bustling {{node.name}} makes conversation difficult.
{{#else if node.environmentalProperties.noisy}}
  The noise in {{node.name}} requires raised voices.
{{#else}}
  The quiet atmosphere of {{node.name}} encourages whispered conversation.
{{/if}}
```

### Pattern 4: Personality-Driven Dialogue
Use personality traits to create authentic character voices:

```
# Aggression-influenced response
{{#if character.personality.aggression > 0.8}}
  {{random:What do you want,State your business,Speak quickly}}!
{{#else if character.personality.aggression > 0.5}}
  {{random:Yes,What is it,What}}?
{{#else}}
  {{random:How can I help you,What do you need,Yes}}?
{{/if}}
```

## Content Guidelines

### Writing Natural Dialogue

1. **Use Contractions**: "I'll" instead of "I will" for casual speech
2. **Vary Sentence Length**: Mix short and long sentences
3. **Include Interruptions**: Use ellipses and dashes for natural flow
4. **Consider Character Voice**: Let personality influence word choice

```
✅ Natural dialogue:
{{#if character.personality.empathy > 0.7}}
  "I... I can see you're troubled, {{character.name}}. What's wrong?"
{{#else}}
  "You look upset. What happened?"
{{/if}}

❌ Stilted dialogue:
{{#if character.personality.empathy > 0.7}}
  "I observe that you appear to be experiencing distress, {{character.name}}. Please explain the situation."
{{/if}}
```

### Creating Immersive Descriptions

1. **Engage Multiple Senses**: Include sounds, smells, textures
2. **Use Specific Details**: "oak table" instead of "table"
3. **Show, Don't Tell**: Demonstrate character traits through actions
4. **Maintain Consistency**: Keep descriptions aligned with world tone

```
✅ Immersive description:
The {{random:weathered,ancient,sturdy}} oak door of {{node.name}} creaks open, releasing the {{#if node.environmentalProperties.prosperous}}rich aroma of roasted meat and fresh bread{{#else}}musty scent of old wood and stale ale{{/if}}.

❌ Generic description:
The door opens and {{character.name}} enters {{node.name}}.
```

## Performance Optimization

### Template Efficiency

1. **Limit Nesting Depth**: Keep conditionals to 3-4 levels maximum
2. **Use Specific Conditions**: More specific conditions perform better
3. **Avoid Redundant Checks**: Don't repeat the same condition
4. **Cache Complex Calculations**: Use simpler alternatives when possible

```
✅ Efficient template:
{{#if character.reputation > 10}}
  {{#if character.attributes.charisma > 14}}
    Your reputation and charm open doors, {{character.name}}.
  {{#else}}
    Your reputation speaks for itself, {{character.name}}.
  {{/if}}
{{/if}}

❌ Inefficient template:
{{#if character.reputation > 10 AND character.attributes.charisma > 14 AND character.personality.empathy > 0.5 AND node.environmentalProperties.prosperous}}
  Complex condition with multiple checks
{{/if}}
```

### Memory Management

1. **Reuse Successful Patterns**: Don't recreate similar templates
2. **Break Up Large Templates**: Split complex templates into sections
3. **Use Dialogue Patterns**: Leverage the built-in pattern system
4. **Clean Up Unused Templates**: Remove templates that aren't working

## Error Prevention

### Common Mistakes to Avoid

1. **Unclosed Conditionals**: Always match `{{#if}}` with `{{/if}}`
2. **Typos in Property Names**: Use suggestions panel for accuracy
3. **Missing Context Checks**: Verify data availability before use
4. **Overly Complex Logic**: Keep conditions understandable

### Defensive Programming

```
✅ Safe template (checks for data existence):
{{#if character.reputation AND character.reputation > 10}}
  Welcome back, {{character.name}}!
{{#else}}
  Hello there!
{{/if}}

❌ Risky template (assumes data exists):
{{#if character.reputation > 10}}
  Welcome back, {{character.name}}!
{{/if}}
```

### Graceful Degradation

Always provide fallback content for when data is missing:

```
✅ Graceful fallback:
{{#if character.name}}
  Hello, {{character.name}}.
{{#else}}
  Hello there.
{{/if}}

✅ Multiple fallbacks:
{{character.name || "stranger"}} approaches {{node.name || "the location"}}.
```

## Content Organization

### Template Categories

Organize your templates by purpose:

1. **Greetings**: First contact with characters
2. **Farewells**: Ending conversations
3. **Reactions**: Responses to player actions
4. **Descriptions**: Environmental and character descriptions
5. **Quest Content**: Objectives and completion messages

### Naming Conventions

Use consistent naming for easy identification:

```
✅ Clear naming:
- greeting_reputation_high
- farewell_location_wilderness
- reaction_attribute_strength
- description_node_marketplace

❌ Unclear naming:
- template1
- greeting_thing
- stuff_for_characters
```

### Documentation Within Templates

Add comments to explain complex logic:

```
✅ Documented template:
{{!-- Greeting based on reputation and location type --}}
{{#if character.reputation > 15}}
  {{!-- High reputation: formal greeting --}}
  Welcome, honored {{character.name}}.
{{#else}}
  {{!-- Standard greeting with location context --}}
  {{#if node.type == "marketplace"}}
    Welcome to the market, {{character.name}}.
  {{#else}}
    Hello, {{character.name}}.
  {{/if}}
{{/if}}
```

## Testing Strategies

### Test Cases to Consider

1. **Minimum Data**: Test with basic character/node data
2. **Maximum Data**: Test with fully populated characters
3. **Missing Data**: Test with incomplete information
4. **Edge Cases**: Test boundary conditions (reputation = 0, attributes = 1)
5. **Different Contexts**: Test across various node types and character types

### Testing Workflow

1. **Create Test Characters**: Build characters with different attribute ranges
2. **Test Incrementally**: Add one condition at a time
3. **Verify Preview**: Check that preview matches expectations
4. **Test in Context**: Verify templates work in actual gameplay
5. **Document Results**: Note what works and what doesn't

## Advanced Techniques

### Dynamic Personality Expression

Create templates that express character personality through language:

```
# Personality-influenced word choice
{{#if character.personality.aggression > 0.7}}
  {{character.name}} {{random:demands,insists,declares}}
{{#else if character.personality.empathy > 0.7}}
  {{character.name}} {{random:suggests gently,asks kindly,proposes}}
{{#else}}
  {{character.name}} {{random:says,states,mentions}}
{{/if}}
```

### Contextual Relationship Building

Use templates to build and reference relationships:

```
# Relationship-aware dialogue
{{#if character.relationships.friendly > 10}}
  My dear friend {{character.name}}, it's wonderful to see you!
{{#else if character.relationships.hostile > 5}}
  {{character.name}}... I suppose you have business here.
{{#else}}
  {{character.name}}, how can I assist you?
{{/if}}
```

### Multi-Character Interactions

Handle scenarios with multiple characters:

```
# Group interaction handling
{{#if participants.length > 1}}
  {{#if character.attributes.charisma > participants.average.charisma}}
    {{character.name}} naturally takes the lead in the conversation.
  {{#else}}
    {{character.name}} listens as others speak.
  {{/if}}
{{#else}}
  {{character.name}} speaks directly, one-on-one.
{{/if}}
```

## Quality Assurance

### Review Checklist

Before finalizing templates:
- [ ] All placeholders properly closed
- [ ] All conditionals have matching end tags
- [ ] Property names are correct and available
- [ ] Conditions use proper operators
- [ ] Random selections have valid syntax
- [ ] Preview shows expected output
- [ ] Template works with different data sets
- [ ] Content fits the world's tone and style
- [ ] Performance is acceptable

### Peer Review

When possible, have others review your templates:
- Check for clarity and readability
- Verify logical flow
- Test with different scenarios
- Suggest improvements
- Identify potential issues

## Maintenance

### Regular Updates

1. **Review Performance**: Check for slow templates
2. **Update Content**: Refresh outdated references
3. **Fix Issues**: Address reported problems
4. **Optimize Logic**: Simplify complex conditions
5. **Add Variety**: Expand random selections

### Version Control

Keep track of template changes:
- Document what changed and why
- Test changes thoroughly
- Keep backups of working versions
- Note performance impacts

## Conclusion

Effective text templating requires:
- **Planning**: Think through the user experience
- **Testing**: Verify templates work in various scenarios
- **Iteration**: Continuously improve based on results
- **Documentation**: Keep clear records of what works
- **Maintenance**: Regular updates and optimization

By following these best practices, you'll create dynamic, engaging content that enhances your world-building experience and provides rich, contextual interactions for all users of your world.

Remember: Great templates feel natural and invisible to users while providing rich, personalized experiences that adapt to the unique context of each interaction.