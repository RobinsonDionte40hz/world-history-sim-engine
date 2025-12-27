# Origin System - User Guide

## Overview

The **Origin System** allows you to create rich character backstories with age progression, significant events, and starting modifiers. Origins define how characters begin their journey before becoming playable.

## Key Features

### 1. **Character Editor Integration**
- **Location**: Character Editor page (`/editors/characters`)
- **Access**: Origin selection panel appears between World Selection and Character Editor
- **Usage**:
  1. Create or edit a character
  2. Click "Character Origin" panel to expand
  3. Select from pre-built templates or create from scratch
  4. Preview origin details, backstory events, and modifiers
  5. Click "Apply Origin to Character" to apply attributes/skills
  6. Save character as normal

### 2. **Origin Builder Page**
- **Location**: `/origins/builder`
- **Access**: Sidebar → Character Editor → Origin Builder
- **Navigation Search**: "Origin Builder"

#### Tabs:

**Basic Tab**:
- Origin name, description, category
- Start age (birth/beginning)
- Playable age (when character becomes controllable)
- Difficulty (easy/normal/hard/expert)
- Backstory speed (simulation multiplier)

**Timeline Tab**:
- Add backstory events at specific ages
- Event types: milestone, tragedy, achievement, relationship, training, loss, discovery
- Mark significant events (starred)
- View chronological timeline

**Modifiers Tab**:
- Attribute modifiers (strength, dexterity, constitution, intelligence, wisdom, charisma)
- Initial skills with values
- Initial inventory items
- Personality modifiers

**Templates Tab**:
- Load from 5 built-in templates
- Load from saved custom origins

## Pre-Built Origin Templates

### 1. **Noble's Child** (Easy)
- **Ages**: 0 → 16 years
- **Category**: Noble
- **Description**: Born into wealth and privilege
- **Bonuses**: +2 Charisma, Etiquette skill (25), Reading skill (20)
- **Backstory**: 5 events (birth, education, etiquette training, first formal event, coming of age)
- **Inventory**: Signet ring, fine clothing, education primer

### 2. **Orphan** (Hard)
- **Ages**: 0 → 16 years
- **Category**: Commoner
- **Description**: Survived alone on the streets
- **Bonuses**: +1 Dexterity, +1 Constitution, Stealth (20), Survival (15)
- **Backstory**: 6 events (abandonment, survival, mentor, betrayal, resilience, independence)
- **Traits**: Resilience +0.3

### 3. **Veteran Warrior** (Normal)
- **Ages**: 0 → 35 years
- **Category**: Military
- **Description**: Served 20+ years in military
- **Bonuses**: +3 Strength, +2 Constitution, Swordsmanship (40), Tactics (30)
- **Speed**: 20x (fast progression through years)
- **Backstory**: 7 events (birth through retirement)
- **Inventory**: Battle-worn sword, military insignia

### 4. **Scholar's Apprentice** (Normal)
- **Ages**: 0 → 20 years
- **Category**: Scholar
- **Description**: Trained in knowledge and research
- **Bonuses**: +3 Intelligence, +1 Wisdom, Reading (35), Research (25), History (20)
- **Backstory**: 6 events (birth, library introduction, apprenticeship, research, specialization, graduation)
- **Inventory**: Journal, reading glasses, research notes

### 5. **Time Traveler** (Expert)
- **Ages**: 25 only
- **Category**: Special
- **Description**: Displaced from another time
- **Bonuses**: +2 Intelligence, Temporal Knowledge (40)
- **Backstory**: Empty (sudden arrival)
- **Traits**: Disorientation +0.5

## Using Origins in Character Creation

### Quick Workflow:
1. Go to **Character Editor** (`/editors/characters`)
2. Fill in basic character info (name, race, etc.)
3. Expand **Character Origin** panel
4. Select template from dropdown
5. Review preview (events, attributes, skills)
6. Click **Apply Origin to Character**
7. Character attributes and skills are updated
8. Save character

### Custom Origin Workflow:
1. Go to **Origin Builder** (`/origins/builder`)
2. Click **Basic** tab, fill in origin details
3. Click **Timeline** tab, add backstory events
4. Click **Modifiers** tab, set attribute/skill bonuses
5. Click **Save Origin**
6. Return to Character Editor
7. Custom origin appears in dropdown

## Technical Details

### Origin Entity Properties:
```javascript
{
  id: 'unique-id',
  name: 'Origin Name',
  description: 'Backstory description',
  category: 'Noble|Military|Scholar|etc',
  difficulty: 'easy|normal|hard|expert',
  startAge: 0,           // Birth or starting point
  playableAge: 16,       // When character becomes playable
  currentAge: 0,         // Simulation state
  backstorySpeed: 1.0,   // Time multiplier (0.1 - 100.0)
  backstoryEvents: [
    {
      age: 5,
      type: 'milestone',
      description: 'Event text',
      isSignificant: true,
      effects: {}
    }
  ],
  initialAttributes: {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  },
  initialSkills: [
    { skill: 'Swordsmanship', value: 20 }
  ],
  personalityModifiers: [
    { trait: 'courage', modifier: 0.2 }
  ],
  initialInventory: ['item1', 'item2']
}
```

### applyToCharacter() Method:
When "Apply Origin" is clicked, the origin:
1. Adds attribute modifiers to character base attributes
2. Adds initial skills to character skill list
3. Sets character current age to origin's playable age
4. Adds origin ID reference to character
5. Adds initial inventory items
6. Applies personality modifiers

### Backstory Speed:
- **1.0**: Normal time (1 turn = 1 year)
- **10.0**: Fast-forward (1 turn = 10 years) - for long backstories
- **0.1**: Slow-motion (1 turn = 0.1 years) - for detailed origins

## Storage & Persistence

### Built-in Templates:
- Located in `OriginTemplates.js`
- Immutable, always available
- Cannot be edited (can be cloned to custom)

### Custom Origins:
- Saved to `localStorage` key: `customOrigins`
- JSON array format
- Persist across sessions
- Can be edited, deleted, exported

### Character Integration:
- Characters store `originId` reference
- Origin data applied at creation time
- Character retains origin bonuses even if origin deleted
- Origin can be re-applied to update character

## Advanced Features

### Multi-Speed Simulation:
- Origins support independent time progression
- Useful for:
  - Fast backstory generation (veteran with 20 years)
  - Detailed early childhood (slow progression)
  - Time traveler scenarios (no progression)

### Event Effects:
Future enhancement - backstory events can trigger:
- Attribute changes at specific ages
- Relationship formations
- Quest prerequisites
- Memory creation

### Validation:
Origin Builder validates:
- Name is not empty
- Start age ≥ 0
- Playable age > start age
- Backstory speed > 0
- Prevents saving invalid origins

## Navigation Paths

### Access Points:
1. **Sidebar**: Character Editor → Origin Builder
2. **Navigation Search**: Type "Origin Builder"
3. **Direct URL**: `/origins/builder`
4. **Character Editor**: Origin panel always visible

### Related Pages:
- **Character Editor**: `/editors/characters` - Apply origins
- **Character Manager**: `/editors/character-manager` - View character origins
- **Template Library**: `/templates` - (Future: origin template browsing)

## Tips & Best Practices

1. **Start Simple**: Use built-in templates first
2. **Backstory Events**: 3-7 events is ideal (too many clutters timeline)
3. **Significant Events**: Mark 1-2 key moments that define the character
4. **Attribute Balance**: Total modifiers should be +3 to +6 for balanced characters
5. **Speed Multiplier**: Use 10x+ for adult characters, 1x for child origins
6. **Event Chronology**: Timeline auto-sorts by age
7. **Save Often**: Custom origins only persist in localStorage
8. **Preview Before Apply**: Review all details before applying to character

## Troubleshooting

**Q: Origin not appearing in Character Editor?**
- A: Make sure you saved the origin in Origin Builder
- Check browser console for localStorage errors

**Q: "Apply Origin" button disabled?**
- A: Create a character first (name, race required)
- Ensure origin is selected from dropdown

**Q: Attributes not changing after apply?**
- A: Check "Origin Applied" message appears
- Verify character has unsaved changes indicator
- Save character to persist changes

**Q: Custom origin disappeared?**
- A: localStorage might be cleared
- Export important origins as templates
- Check browser privacy settings

**Q: Backstory events not in order?**
- A: Events auto-sort by age
- Re-open Origin Builder to see sorted timeline

## Future Enhancements (Roadmap)

- [ ] Origin simulation playthrough
- [ ] Event effects engine (attribute changes at age milestones)
- [ ] Origin templates sharing/export
- [ ] Origin visualizer (timeline graph)
- [ ] Random origin generator
- [ ] Cultural origin variants
- [ ] Family tree integration
- [ ] Origin-based quest prerequisites

## Related Documentation

- `docs/TextTemplatingGuide.md` - Dynamic content in origin descriptions
- `Character.js` - Character entity integration
- `OriginTemplates.js` - Template definitions
- `.github/copilot-instructions.md` - System architecture

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Production Ready
