# Dialogue Patterns Reference Guide

## Overview

This guide provides a comprehensive collection of dialogue patterns for creating natural, contextual conversations using text templating. These patterns leverage character attributes, personality traits, reputation, and environmental context to create dynamic, personalized interactions.

## Basic Patterns

### Greetings

#### Simple Greetings
```
# Basic greeting with name
Hello, {{character.name}}.

# Random greeting variations
{{random:Greetings,Hello,Well met}}, {{character.name}}.

# Time-sensitive greeting (if time context available)
{{random:Good morning,Good day,Good evening}}, {{character.name}}.
```

#### Reputation-Based Greetings
```
# Tiered reputation greeting
{{#if character.reputation > 20}}
{{random:Welcome back,Greetings}}, honored {{character.name}}!
{{#else if character.reputation > 10}}
{{random:Hello,Good to see you}}, {{character.name}}.
{{#else if character.reputation > 0}}
{{random:Greetings,Hello}}, {{character.name}}.
{{#else}}
{{random:Greetings,Hello}}, stranger.
{{/if}}

# Negative reputation greeting
{{#if character.reputation < -5}}
{{character.name}}... I didn't expect to see you here.
{{#else if character.reputation < 0}}
{{character.name}}. {{random:What brings you here,What do you want}}?
{{/if}}
```

#### Attribute-Based Greetings
```
# Charisma-influenced greeting
{{#if character.attributes.charisma > 16}}
Your presence lights up {{node.name}}, {{character.name}}.
{{#else if character.attributes.charisma > 14}}
Always a pleasure, {{character.name}}.
{{#else if character.attributes.charisma > 10}}
Good to see you, {{character.name}}.
{{#else}}
{{character.name}}.
{{/if}}

# Intelligence-based greeting
{{#if character.attributes.intelligence > 16}}
Ah, the learned {{character.name}}. Your wisdom precedes you.
{{#else if character.attributes.intelligence > 14}}
{{character.name}}, your insight is always welcome here.
{{/if}}

# Strength-based greeting
{{#if character.attributes.strength > 16}}
{{character.name}}! Your reputation as a warrior is well known.
{{#else if character.attributes.strength > 14}}
I can see the strength in you, {{character.name}}.
{{/if}}
```

### Farewells

#### Simple Farewells
```
# Basic farewell
Farewell, {{character.name}}.

# Random farewell variations
{{random:Farewell,Until next time,Safe travels}}, {{character.name}}.

# Blessing farewells
May {{random:fortune,the gods,luck}} smile upon you, {{character.name}}.
```

#### Contextual Farewells
```
# Location-based farewell
{{#if node.type == "wilderness"}}
Watch for {{random:bandits,wild beasts,dangerous paths}} on your journey, {{character.name}}.
{{#else if node.type == "city"}}
Safe travels through the {{random:busy streets,crowded markets}}, {{character.name}}.
{{#else if node.type == "tavern"}}
{{random:Drink safely,Enjoy your evening}}, {{character.name}}.
{{/if}}

# Reputation-based farewell
{{#if character.reputation > 15}}
It's always an honor, {{character.name}}. Until we meet again.
{{#else if character.reputation > 5}}
Safe travels, {{character.name}}.
{{#else}}
{{random:Farewell,Until next time}}, {{character.name}}.
{{/if}}
```

## Personality-Driven Patterns

### Aggressive Characters
```
# High aggression responses
{{#if character.personality.aggression > 0.8}}
{{random:What do you want,State your business,Speak quickly}}.
{{#else if character.personality.aggression > 0.6}}
{{random:Yes,What is it,What}}?
{{#else if character.personality.aggression > 0.4}}
{{character.name}}. {{random:What brings you here,How can I help}}?
{{/if}}

# Aggressive reactions to low reputation
{{#if character.personality.aggression > 0.7 AND character.reputation < 5}}
I don't like the look of you, {{character.name}}.
{{/if}}
```

### Empathetic Characters
```
# High empathy responses
{{#if character.personality.empathy > 0.8}}
{{character.name}}, you look {{random:troubled,weary,burdened}}. How can I help?
{{#else if character.personality.empathy > 0.6}}
{{character.name}}, is everything alright?
{{#else if character.personality.empathy > 0.4}}
Good to see you, {{character.name}}. How are you faring?
{{/if}}

# Empathetic concern
{{#if character.personality.empathy > 0.7}}
{{#if character.attributes.constitution < 12}}
You look tired, {{character.name}}. Perhaps you should rest?
{{/if}}
{{/if}}
```

### Curious Characters
```
# High curiosity responses
{{#if character.personality.curiosity > 0.8}}
{{character.name}}! {{random:Tell me,I must know,I'm curious}} - what news do you bring from {{random:your travels,the road,distant lands}}?
{{#else if character.personality.curiosity > 0.6}}
{{character.name}}, what brings you to {{node.name}}?
{{#else if character.personality.curiosity > 0.4}}
{{random:Greetings,Hello}}, {{character.name}}. Any interesting {{random:news,stories,tales}}?
{{/if}}
```

## Environmental Context Patterns

### Location-Specific Dialogue

#### Marketplace
```
{{#if node.type == "marketplace"}}
{{#if node.environmentalProperties.crowded}}
Busy day at the market, {{character.name}}! {{random:Looking to buy,Selling anything,Trading today}}?
{{#else}}
Quiet day for trade, {{character.name}}. {{random:Perhaps you'll find a bargain,Good time for browsing}}.
{{/if}}
{{/if}}

{{#if node.type == "marketplace" AND character.type == "merchant"}}
A fellow trader! {{random:How's business,Good sales today,Finding good deals}}?
{{/if}}
```

#### Tavern
```
{{#if node.type == "tavern"}}
{{#if node.environmentalProperties.noisy}}
{{random:Welcome,Come in}} to {{node.name}}, {{character.name}}! {{random:Lively crowd tonight,Busy evening,Full house tonight}}!
{{#else}}
{{random:Welcome,Come in}} to {{node.name}}, {{character.name}}. {{random:Quiet evening,Peaceful night,Calm atmosphere}} tonight.
{{/if}}
{{/if}}

{{#if node.type == "tavern" AND character.attributes.constitution > 14}}
You look like you can handle your drink, {{character.name}}!
{{/if}}
```

#### Wilderness
```
{{#if node.type == "wilderness"}}
{{character.name}}! {{random:Didn't expect to see anyone,Rare to meet someone,Surprising to find company}} out here in {{node.name}}.
{{/if}}

{{#if node.type == "wilderness" AND character.attributes.wisdom > 14}}
You have the look of someone who knows these {{random:lands,paths,wilds}}, {{character.name}}.
{{/if}}
```

#### Temple/Religious Sites
```
{{#if node.type == "temple"}}
{{random:Blessings,Peace,Welcome}}, {{character.name}}. {{random:Seeking guidance,Come to pray,Looking for solace}}?
{{/if}}

{{#if node.type == "temple" AND character.attributes.wisdom > 15}}
I sense great wisdom in you, {{character.name}}. {{random:The gods smile upon you,You walk a righteous path}}.
{{/if}}
```

### Environmental Properties

#### Crowded Locations
```
{{#if node.environmentalProperties.crowded}}
{{#if character.attributes.charisma > 14}}
Even in this crowd, you stand out, {{character.name}}.
{{#else}}
Hard to find a quiet moment in {{node.name}} today, isn't it {{character.name}}?
{{/if}}
{{/if}}
```

#### Prosperous Locations
```
{{#if node.environmentalProperties.prosperous}}
{{#if character.type == "merchant"}}
{{node.name}} is good for business, wouldn't you agree {{character.name}}?
{{#else}}
The wealth of {{node.name}} is evident, {{character.name}}.
{{/if}}
{{/if}}
```

#### Noisy Locations
```
{{#if node.environmentalProperties.noisy}}
{{random:Hard to hear yourself think,Quite the racket,Lively place}}, isn't it {{character.name}}?
{{/if}}
```

## Advanced Interaction Patterns

### Multi-Condition Responses
```
# Complex personality and attribute combination
{{#if character.personality.aggression > 0.7 AND character.attributes.charisma > 14}}
Your words cut like a blade, {{character.name}}, but they carry undeniable authority.
{{#else if character.personality.aggression > 0.7 AND character.attributes.charisma < 10}}
Your aggressive nature is... unsettling, {{character.name}}.
{{#else if character.personality.empathy > 0.7 AND character.attributes.wisdom > 14}}
Your compassionate wisdom is a rare gift, {{character.name}}.
{{#else if character.personality.curiosity > 0.7 AND character.attributes.intelligence > 14}}
Your inquisitive mind and sharp intellect are impressive, {{character.name}}.
{{#else}}
{{random:Greetings,Hello}}, {{character.name}}.
{{/if}}
```

### Relationship-Aware Patterns
```
# If relationship system is available
{{#if character.relationships.friendly > 5}}
{{character.name}}, my friend! {{random:Good to see you,Always a pleasure}}.
{{#else if character.relationships.hostile > 5}}
{{character.name}}. {{random:I suppose you have business here,What brings you to my domain}}.
{{#else}}
{{character.name}}. {{random:How can I help you,What do you need}}?
{{/if}}
```

### Quest-Aware Dialogue
```
# Quest context patterns
{{#if character.activeQuests.length > 0}}
{{character.name}}, I hear you're {{random:on a mission,pursuing a quest,undertaking important work}}.
{{/if}}

{{#if character.completedQuests.length > 10}}
Your reputation as a {{random:problem solver,quest completer,reliable ally}} precedes you, {{character.name}}.
{{/if}}
```

## Reaction Patterns

### Positive Reactions
```
# Impressed reactions
{{#if character.attributes.strength > 16}}
{{random:Impressive,Remarkable,Incredible}} strength, {{character.name}}!
{{/if}}

{{#if character.attributes.intelligence > 16}}
Your intellect is {{random:remarkable,impressive,extraordinary}}, {{character.name}}.
{{/if}}

{{#if character.attributes.charisma > 16}}
{{random:Charming,Captivating,Magnetic}} as always, {{character.name}}.
{{/if}}
```

### Concerned Reactions
```
# Worried responses
{{#if character.attributes.constitution < 8}}
{{character.name}}, you look {{random:unwell,pale,sickly}}. Are you alright?
{{/if}}

{{#if character.reputation < -10}}
{{character.name}}, your reputation... {{random:concerns me,is troubling,worries the people here}}.
{{/if}}
```

### Neutral Observations
```
# Observational comments
{{#if character.type == "warrior"}}
I can see the warrior in you, {{character.name}}.
{{#else if character.type == "scholar"}}
A learned individual, I see.
{{#else if character.type == "merchant"}}
The merchant's eye for opportunity - I recognize it well.
{{/if}}
```

## Question Patterns

### Information Gathering
```
# General questions
What brings you to {{node.name}}, {{character.name}}?

Have you heard any {{random:news,word,tales}} from {{random:the capital,other settlements,your travels}}?

{{random:How fare,What news from}} the {{random:roads,other settlements,distant lands}}?
```

### Context-Specific Questions
```
# Location-based questions
{{#if node.type == "marketplace"}}
{{random:Looking to buy,Selling anything,Trading today}}, {{character.name}}?
{{#else if node.type == "tavern"}}
{{random:What'll it be,Care for a drink,Looking for a room}}, {{character.name}}?
{{#else if node.type == "temple"}}
{{random:Seeking guidance,Come to pray,Looking for blessing}}, {{character.name}}?
{{/if}}

# Attribute-based questions
{{#if character.attributes.intelligence > 15}}
{{character.name}}, your wisdom is renowned. What's your {{random:opinion,thoughts,view}} on {{random:recent events,the current situation,these troubled times}}?
{{/if}}
```

### Reputation-Based Questions
```
{{#if character.reputation > 15}}
{{character.name}}, given your {{random:standing,reputation,influence}}, what do you make of {{random:recent events,the current situation}}?
{{#else if character.reputation < -5}}
{{character.name}}, {{random:why should I trust you,what assurance do I have,how do I know you're not here to cause trouble}}?
{{/if}}
```

## Usage Guidelines

### Choosing Appropriate Patterns

1. **Start with context**: Consider location, character type, and situation
2. **Layer personality**: Add personality-based variations
3. **Include attributes**: Use D&D attributes for additional depth
4. **Consider reputation**: Factor in character standing
5. **Add randomization**: Use random selection for variety

### Combining Patterns

```
# Example: Comprehensive greeting combining multiple factors
{{#if character.reputation > 15}}
  {{#if character.attributes.charisma > 14}}
    {{random:Welcome back,Greetings}}, honored {{character.name}}! Your presence {{random:graces,brightens}} {{node.name}}.
  {{#else}}
    {{random:Welcome back,Greetings}}, honored {{character.name}}.
  {{/if}}
{{#else if character.reputation > 5}}
  {{#if node.environmentalProperties.crowded}}
    {{random:Hello,Greetings}}, {{character.name}}. {{random:Busy day,Crowded today}}, isn't it?
  {{#else}}
    {{random:Hello,Greetings}}, {{character.name}}.
  {{/if}}
{{#else}}
  {{#if character.personality.aggression > 0.7}}
    {{random:What do you want,State your business}}, stranger.
  {{#else}}
    {{random:Greetings,Hello}}, {{character.name}}.
  {{/if}}
{{/if}}
```

### Best Practices

1. **Test with different characters**: Ensure patterns work across various character types
2. **Avoid over-complexity**: Keep patterns readable and maintainable
3. **Use consistent voice**: Maintain character voice throughout patterns
4. **Plan for edge cases**: Handle missing data gracefully
5. **Document complex patterns**: Add comments for intricate logic

### Performance Considerations

1. **Limit nesting depth**: Keep conditionals to 3-4 levels maximum
2. **Use specific conditions**: More specific conditions perform better
3. **Cache common patterns**: Reuse successful patterns across characters
4. **Test with preview**: Always verify patterns work as expected

This reference guide provides a foundation for creating rich, contextual dialogue that adapts to character attributes, personality traits, environmental factors, and reputation. Use these patterns as starting points and customize them to fit your specific world and narrative needs.