# Combat Formation System

## Overview

The World History Simulation Engine uses a **turn-based combat system** with a **2x5 grid formation** for each side. This provides tactical depth while maintaining simplicity and clarity.

## Formation Structure

### Grid Layout

Each side in combat has **2 rows** with **5 positions** per row:

```
         BACK ROW (Ranged/Support)
    [0]  [1]  [★]  [3]  [4]
    
        FRONT ROW (Melee/Tank)
    [0]  [1]  [★]  [3]  [4]
```

- **Total positions per side**: 10
- **★** marks the center position (index 2) - typically for leaders
- Groups with more than 10 members keep reserves (not in formation until space opens)

## Row Mechanics

### Front Row
- **Purpose**: Melee combatants and tanks
- **Can attack**: Enemy front row (melee), any enemy (ranged)
- **Protection**: Shields back row from melee attacks
- **Preferred by**: Direct tactics, aggressive temperament entities

### Back Row
- **Purpose**: Ranged attackers and support units
- **Can attack**: Any enemy position (if ranged), cannot attack in melee (must move to front first)
- **Vulnerability**: Cannot be targeted by enemy melee **unless front row is empty**
- **Preferred by**: Ranged tactics, support tactics, stealthy ambush entities

## Entity Positioning

### Automatic Placement

When combat starts, `EntityGroup.initializeCombatFormation(entities)` automatically places entities based on:

1. **Tactics preference** (from Entity.behavior.tactics):
   - `direct` → Front row
   - `ranged` → Back row
   - `support` → Back row
   - `ambush` → Depends on temperament (aggressive = front, others = back)

2. **Leader priority**: Leaders placed in center position (★) of their preferred row

3. **Fill order**: Remaining entities fill rows left-to-right

### Manual Positioning

Entities can be moved between rows during combat if `entity.combatPosition.canSwitchRows === true`:

```javascript
group.moveEntityToRow(entityId, 'front', entityInstance);
```

## Combat Rules

### Targeting

**Melee Attacks:**
- Front row → Enemy front row ✓
- Front row → Enemy back row (only if enemy front row is empty) ✓
- Back row → Any enemy ✗ (must move to front first)

**Ranged Attacks:**
- Any row → Any enemy position ✓

**Example:**
```javascript
const canHit = entity.canReachTarget(
  targetPosition,
  enemyGroup.isFrontRowEmpty()
);
```

### Position Tracking

Each entity has a `combatPosition` object:

```javascript
{
  row: 'front',           // or 'back', or null (not in formation)
  column: 2,              // 0-4
  preferredRow: 'front',  // Calculated from tactics
  canSwitchRows: true     // Whether entity can move between rows
}
```

## Formation Types

Groups can adopt different formation types that provide bonuses/penalties:

### Standard (Default)
- **Modifiers**: None
- **Use case**: Balanced approach

### Defensive
- **Modifiers**: +2 AC to front row, -1 damage
- **Special**: Front row harder to break through
- **Use case**: Holding a position, protecting key assets

### Aggressive
- **Modifiers**: +1 damage, -1 AC
- **Special**: Front row pushes forward relentlessly
- **Use case**: All-out offense, breaking enemy lines

### Skirmish
- **Modifiers**: +1 initiative, enhanced mobility
- **Special**: Entities can move more freely between rows
- **Use case**: Hit-and-run tactics, guerrilla warfare

## Group Combat Methods

### Formation Management

```javascript
// Initialize formation from entity instances
group.initializeCombatFormation(entityArray);

// Get entity position
const pos = group.getEntityPosition(entityId);
// Returns: { row: 'front', column: 2 } or null

// Check if front row is exposed
if (group.isFrontRowEmpty()) {
  // Back row can now be targeted by melee
}

// Remove defeated entity
group.removeFromFormation(entityId);

// Get all front/back entities
const frontFighters = group.getFrontRowEntities(); // [id1, id2, id3]
const backSupport = group.getBackRowEntities();   // [id4, id5]

// Count total in formation
const count = group.getFormationCount(); // 5
```

### Formation Type Control

```javascript
// Set formation type
group.setFormationType('defensive');

// Get modifiers for current formation
const mods = group.getFormationModifiers();
// Returns: { ac: 2, damage: -1, initiative: 0, special: ['front_row_fortified'] }
```

## Pack Tactics

When `group.combat.packTactics` is enabled:
- Entities gain combat advantage when multiple allies are adjacent
- Particularly effective in tightly-packed formations
- Works best with coordinated groups (high `behavior.coordination`)

## Morale & Retreat

Groups retreat when:
1. Casualties exceed `combat.retreatThreshold` (default 30%)
2. AND current morale drops below 30

**Stance affects retreat:**
- **Aggressive**: Fights to 15% remaining (threshold × 0.5)
- **Defensive**: Retreats at 45% remaining (threshold × 1.5)
- **Neutral**: Standard 30% threshold

```javascript
if (group.shouldRetreat()) {
  // Trigger retreat sequence
}
```

## UI Integration

### GroupEditor
- Formation type selector (dropdown)
- Formation grid visualization (shows 2×5 layout with leader position)
- Pack tactics checkbox
- Retreat threshold slider

### EntityEditor
- Combat tactics selector (determines preferred row)
- Ranged/melee capabilities
- Row switching toggle

## Example Combat Flow

```javascript
// Setup
const orcWarband = worldBuilder.getEntityGroup('orc_group_1');
const guardPatrol = worldBuilder.getEntityGroup('guard_patrol_1');

// Get entity instances
const orcEntities = orcWarband.members.map(id => worldBuilder.getEntity(id));
const guardEntities = guardPatrol.members.map(id => worldBuilder.getEntity(id));

// Initialize formations
orcWarband.initializeCombatFormation(orcEntities);
guardPatrol.initializeCombatFormation(guardEntities);

// Set formation types
orcWarband.setFormationType('aggressive');
guardPatrol.setFormationType('defensive');

// Turn-based combat loop
while (!combatEnded) {
  // Determine turn order based on initiative
  // Process each entity's turn
  
  // Example attack
  const attacker = orcEntities[0];
  const targetPos = guardPatrol.getEntityPosition(targetId);
  
  if (attacker.canReachTarget(targetPos, guardPatrol.isFrontRowEmpty())) {
    // Execute attack with formation modifiers
    const mods = orcWarband.getFormationModifiers();
    const damage = calculateDamage(attacker, target, mods);
    target.takeDamage(damage);
    
    if (!target.isAlive) {
      guardPatrol.removeFromFormation(targetId);
    }
  }
  
  // Check retreat conditions
  if (orcWarband.shouldRetreat()) {
    combatEnded = true;
    result = 'victory_guards';
  }
}
```

## Integration Points

### With Encounters
- Encounters can specify entity groups that trigger combat
- Formation initialized automatically when combat begins
- Territory-based encounters use group's assigned nodes

### With Turn Manager
- Combat occurs within simulation turns
- Formation state persists between turns
- Casualties update group membership and formation

### With History
- Combat outcomes recorded with formation details
- Tactical decisions become part of historical narrative
- Group reputations affected by combat performance

## Future Enhancements

Potential additions to the system:
- Flanking mechanics (attacking from sides)
- Special abilities that affect entire rows
- Formation changes mid-combat (reactive tactics)
- Terrain effects on formation effectiveness
- Multi-group battles (3+ sides)
- Reinforcement mechanics (reserves entering formation)

## Technical Notes

- Formations stored as simple arrays for efficiency
- `null` represents empty positions
- Entity positions tracked in both Entity and EntityGroup for consistency
- Formation recalculation triggers on member add/remove
- Combat methods return boolean/object for easy integration with combat resolver
