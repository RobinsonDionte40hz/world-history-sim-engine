# Branching Interaction Manager

A powerful React-based tool for creating interactive narratives, dialogue trees, and complex branching storylines with advanced character psychology and progression systems.

## 🚀 Quick Start

### Installation & Launch
```bash
# Clone/download the project
cd interaction-manager

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

### Your First 5 Minutes
1. Click the **"Characters"** tab in the top section
2. Create a character type (e.g., "Village Guard")
3. Switch to **"Interactions"** tab
4. Create your first dialogue with branching options
5. Use **"View"** to test your creation

## 📋 What This Tool Can Do

### Core Features
- **Interactive Dialogue Trees** - Create branching conversations with multiple paths
- **Character Psychology** - NPCs with personalities, memories, and emotional states
- **Progression Systems** - Influence, prestige, and alignment tracking
- **World Building** - Locations, connections, and spatial relationships
- **Quest Management** - Multi-step quests that evolve based on player choices
- **Advanced Prerequisites** - Gate content behind complex conditions

### Perfect For
- **Game Developers** - RPG dialogue systems and branching narratives
- **Interactive Fiction Writers** - Complex choice-driven stories
- **Educators** - Scenario-based learning and decision simulations
- **Storytellers** - Exploring narrative possibilities and character development

## 🎯 New User Tutorial

### Step 1: Create Your First Character Type (2 minutes)

Character Types are templates that help organize your NPCs visually and behaviorally.

1. Go to **"Characters"** tab (top section)
2. Click **"Create New Character Type"**
3. Fill out:
   ```
   Name: Village Merchant
   Description: A friendly shopkeeper
   Color: #4CAF50 (or any color)
   ```
4. Click **"Save"**

### Step 2: Create Your First Interaction (5 minutes)

Interactions are individual dialogue scenes or story moments.

1. Go to **"Interactions"** tab
2. Click **"Create New Interaction"**
3. Fill out:
   ```
   Title: Meeting the Merchant
   Description: Player's first encounter with the shopkeeper
   Content: "Welcome to my shop, traveler! What brings you here?"
   Character Type: Village Merchant (select from dropdown)
   ```

4. **Add Response Options** (click "Add Option"):
   ```
   Option 1:
   - Text: "I need supplies for my journey"
   - Option ID: buy_supplies
   
   Option 2:
   - Text: "Just looking around"
   - Option ID: browse_shop
   ```

5. Click **"Save"**

### Step 3: Create Follow-up Interactions (10 minutes)

Create the interactions your options lead to:

**For "buy_supplies" option:**
1. Create new interaction: **"Buying Supplies"**
2. Content: `"Excellent! I have the best gear in town. What do you need?"`
3. Add options like:
   - `"Show me your weapons"` → leads to weapon shop interaction
   - `"I need healing potions"` → leads to alchemy interaction

**For "browse_shop" option:**
1. Create new interaction: **"Browsing the Shop"**
2. Content: `"Feel free to look around! Everything's handcrafted locally."`
3. Add options that lead back to other interactions or end the conversation

### Step 4: Link Everything Together (3 minutes)

1. **Edit your first interaction** ("Meeting the Merchant")
2. **Set "Next Interaction ID"** for each option:
   - `buy_supplies` → Select "Buying Supplies"
   - `browse_shop` → Select "Browsing the Shop"
3. **Save**

🎉 **Test it!** Click **"View"** on your first interaction to see your branching dialogue in action.

## 🔧 Adding Progression Systems

### Simple Reputation System (10 minutes)

Make player choices have consequences:

1. **Go to "Influence" tab**
2. **Create New Domain**:
   ```
   Name: Merchant Relations
   Description: Standing with local traders
   Min Value: -100
   Max Value: 100
   Default Value: 0
   ```

3. **Edit your interactions** to add effects:
   - In "Buying Supplies": Add +5 Merchant Relations
   - In "Browsing the Shop": Add +2 Merchant Relations

4. **Create a VIP interaction** with prerequisites:
   - Title: "Merchant's Special Offer"
   - Prerequisite: Merchant Relations ≥ 20
   - Content: Special dialogue only available to valued customers

### Character Psychology (Advanced)

1. **Go to "Consciousness" tab** (bottom section)
2. Create consciousness states for your characters
3. Characters will remember interactions and respond differently based on their mental state

## 🏗️ Project Structure

```
Your App Interface:
├── Extended Interaction Manager (Top)
│   ├── Interactions Tab - Main dialogue creation
│   ├── Characters Tab - Character type management
│   ├── Influence Tab - Reputation systems
│   ├── Prestige Tab - Achievement tracking
│   └── Alignment Tab - Moral choice systems
│
└── Advanced Systems (Bottom)
    ├── Node Types - Location management
    ├── Personality - Character trait systems
    ├── Consciousness - Advanced character psychology
    ├── Connections - World relationship mapping
    └── Quests - Multi-step quest creation
```

## 💾 Data Management

### Saving Your Work
- **Auto-save**: Everything saves automatically to browser storage
- **Export**: Use the "Export" button to download JSON backups
- **Import**: Load previous projects or share with others

### File Formats
All data is stored as human-readable JSON:
```json
{
  "interactions": [...],
  "characterTypes": [...],
  "influenceDomains": [...],
  "prestigeTracks": [...],
  "alignmentAxes": [...]
}
```

## 🎨 Example Projects

### Beginner Projects
- **Tavern Conversations** - Simple NPC interactions with branching dialogue
- **Shop Encounters** - Trading scenarios with reputation effects
- **Guard Interrogations** - Investigation scenes with clue tracking

### Intermediate Projects
- **Political Intrigue** - Multiple factions with competing interests
- **Romance Subplots** - Relationship development over time
- **Mystery Investigation** - Clue collection unlocking new dialogue options

### Advanced Projects
- **City Management** - Conversations that affect world state
- **Psychological Drama** - Character consciousness affects available choices
- **Educational Simulations** - Learning scenarios with meaningful consequences

## 🛠️ Technical Details

### Built With
- **React 18.2.0** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **localStorage** - Browser-based data persistence

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (modern versions)
- Requires JavaScript enabled
- Works offline after initial load

### Performance
- Handles hundreds of interactions smoothly
- Efficient localStorage-based persistence
- Real-time prerequisite validation

## 🔍 Tips & Best Practices

### Organization
- **Use descriptive names** for interactions and character types
- **Color-code character types** for visual organization
- **Group related content** with categories
- **Export regularly** to avoid data loss

### Writing Effective Interactions
- **Keep dialogue concise** but engaging
- **Make choices meaningful** with real consequences
- **Use prerequisites** to create dynamic narratives
- **Test frequently** using the View feature

### Debugging Common Issues
- **Broken links**: Check Next Interaction IDs match exactly
- **Prerequisites not working**: Verify influence domains are set up correctly
- **Data loss**: Export backups regularly

## 📚 Advanced Features

### Complex Progression Systems
- **Multi-axis alignment** - Track moral complexity
- **Counter-tracks** - Mutually exclusive progression paths
- **Decay systems** - Reputation that changes over time

### Character Psychology
- **Consciousness frequencies** - Character mental states
- **Emotional coherence** - How stable characters are
- **Memory systems** - Characters remember past interactions
- **Collective consciousness** - Group psychology effects

### World Building
- **Spatial relationships** - 3D coordinate mapping
- **Node hierarchies** - Nested location systems
- **Connection dependencies** - Requirements for world access

## 🤝 Contributing & Support

### Getting Help
- Check the in-app tooltips and validation messages
- Use the View feature to test your creations
- Export your data before making major changes

### Sharing Projects
- Export as JSON to share with others
- Include character types and progression systems
- Document your narrative structure

## 📄 License

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---

**Ready to create your first interactive narrative?** Follow the tutorial above and start building! 🎭✨
