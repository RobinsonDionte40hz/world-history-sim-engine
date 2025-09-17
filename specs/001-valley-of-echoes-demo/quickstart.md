# Quickstart Guide: Valley of Echoes Demo

## Overview
This guide provides step-by-step instructions for setting up, running, and validating the Valley of Echoes two-settlement demo with 100+ NPCs using the Level of Detail (LOD) system.

## Prerequisites
- Node.js 18+ installed
- React 18.2 development environment
- World History Simulation Engine repository cloned
- All existing tests passing

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd sim-engine
npm install
```

### 2. Validate Current System
```bash
# Run existing validation
node validate-fixes.js

# Verify turn-based functionality
node run-turn-based-tests.js
```

### 3. Initialize Demo Data
```bash
# Load Valley of Echoes demo configuration
node examples/valley-of-echoes-demo/setup-demo.js

# Verify demo world loads correctly
node examples/valley-of-echoes-demo/validate-demo.js
```

## Step-by-Step Demo Execution

### Phase 1: System Initialization (Turn 1-2)

#### Start the Demo
```bash
npm start
```

#### Navigate to Demo
1. Open browser to `http://localhost:3000`
2. Click "Load Demo World" → "Valley of Echoes"
3. Verify two settlements appear:
   - **Oakwood Federation** (105 NPCs, 3 nodes)
   - **Ironhold Dominion** (110 NPCs, 3 nodes)

#### Validate LOD System
1. Check Settlement Overview panels
2. Verify Hero NPCs (12 total) show individual details
3. Verify Population Groups (18 total) show aggregate statistics
4. Check performance: Turn processing < 2 seconds

**Expected Results:**
- Settlement populations display correctly
- Character LOD tiers are properly assigned
- No performance warnings in console
- Turn counter starts at 1

### Phase 2: Settlement Interaction (Turn 3-5)

#### Process First Interactions
1. Click "Next Turn" button
2. Observe generated events in timeline
3. Check cross-settlement relationship status
4. Verify development tree progress

#### Validate Cross-Settlement Systems
1. Navigate to "Diplomacy" panel
2. Check Oakwood-Ironhold relationship status
3. Verify trade volume indicators
4. Observe cultural exchange metrics

**Expected Results:**
- Cross-settlement relationship established
- Initial diplomatic standing: Neutral (0)
- Trade routes appear between settlements
- No system errors in console

### Phase 3: Development Progression (Turn 6-10)

#### Trigger Settlement Development
1. Navigate to Oakwood Federation
2. Check available upgrades in Development Trees
3. Process 3-5 turns to accumulate resources
4. Complete first upgrade (e.g., "Market Expansion")

#### Validate Development System
1. Verify resource costs deducted correctly
2. Check upgrade effects applied to settlement
3. Observe new upgrades unlocked
4. Validate population group effects

**Expected Results:**
- Settlement development trees progress correctly
- Upgrade effects visible in settlement stats
- New upgrade options become available
- Population groups react to development

### Phase 4: Quest Chain Introduction (Turn 11-15)

#### Initiate Major Quest
1. Wait for "Iron Wood Dispute" quest to appear
2. Review quest description and objectives
3. Choose initial response option
4. Process turns to advance quest

#### Validate Quest Integration
1. Check quest affects both settlements
2. Verify prestige system integration
3. Observe alignment system effects
4. Monitor cross-settlement relationship changes

**Expected Results:**
- Multi-settlement quest chain functions correctly
- Quest choices affect both settlements
- Prestige gains/losses visible in UI
- Diplomatic standing fluctuates based on choices

### Phase 5: Crisis Management (Turn 16-20)

#### Navigate Major Decision Point
1. Quest escalates to settlement-wide decision
2. Choose between cooperation or competition
3. Observe immediate consequences
4. Process multiple turns to see long-term effects

#### Validate Consequence Systems
1. Check settlement development affected
2. Verify population group morale changes
3. Observe new quest opportunities
4. Monitor relationship stability

**Expected Results:**
- Major decisions have lasting consequences
- Population groups react appropriately
- New content unlocked based on choices
- Historical timeline reflects decisions

### Phase 6: Performance Validation (Turn 21-25)

#### Stress Test System
1. Process 5 turns rapidly
2. Monitor performance metrics
3. Check memory usage in browser tools
4. Verify LOD system efficiency

#### Final Validation Checks
1. All 100+ NPCs processed correctly
2. No memory leaks or performance degradation
3. Event timeline remains coherent
4. Save/load functionality works correctly

**Expected Results:**
- Consistent performance throughout demo
- Memory usage remains under 100MB
- Turn processing stays under 2 seconds
- Demo completes successfully

## Validation Checklist

### Technical Validation
- [ ] LOD system processes all character tiers correctly
- [ ] Settlement development trees function properly
- [ ] Cross-settlement interactions work as specified
- [ ] Quest system integrates with new features
- [ ] Performance targets met (100+ NPCs, <2s turns, <100MB memory)
- [ ] No console errors or warnings
- [ ] Save/load preserves all new data structures

### Gameplay Validation
- [ ] Two settlements feel distinct and unique
- [ ] Population groups provide meaningful gameplay
- [ ] Hero NPCs have compelling individual stories
- [ ] Cross-settlement relationships evolve naturally
- [ ] Development choices have visible impact
- [ ] Quest chains create engaging narratives
- [ ] Emergent stories arise from player choices

### Integration Validation
- [ ] Existing prestige system works with settlements
- [ ] Alignment system affects cross-settlement relations
- [ ] Template system handles new content types
- [ ] World builder integrates new entities
- [ ] Turn manager processes new systems correctly
- [ ] Event system generates appropriate content

## Troubleshooting

### Performance Issues
If turn processing exceeds 2 seconds:
1. Check browser console for errors
2. Verify LOD tier distribution (should be 12 hero, 18 groups, rest background)
3. Restart demo to clear any memory accumulation
4. Check if development environment vs. production build

### Settlement Data Issues
If settlements don't appear correctly:
1. Verify demo data loaded: Check localStorage for "valley-of-echoes-demo"
2. Clear browser storage and reload demo data
3. Check network tab for loading errors
4. Verify all settlement nodes are properly connected

### Quest System Issues
If quests don't trigger:
1. Check turn counter is advancing correctly
2. Verify settlement relationship prerequisites met
3. Check quest system is processing cross-settlement events
4. Review console logs for quest system errors

### LOD System Issues
If character processing seems incorrect:
1. Check character tier assignments in UI
2. Verify population group aggregation working
3. Monitor promotion/demotion events
4. Check processing metrics in console

## Development Validation

### Running Unit Tests
```bash
# Test new LOD system
npm test -- LODManager.test.js

# Test settlement extensions
npm test -- Settlement.test.js

# Test cross-settlement interactions
npm test -- CrossSettlementService.test.js
```

### Running Integration Tests
```bash
# Test complete demo flow
npm test -- valley-of-echoes-integration.test.js

# Test performance benchmarks
npm test -- performance.test.js

# Test save/load compatibility
npm test -- save-load-validation.test.js
```

### Code Quality Checks
```bash
# Run linting
npm run lint

# Check test coverage
npm run test:coverage

# Validate architecture compliance
node validate-clean-architecture.js
```

## Success Criteria

The demo is successful if:
1. **Technical**: All validation checklist items pass
2. **Performance**: Meets all specified benchmarks
3. **Gameplay**: Provides engaging 25-turn experience
4. **Integration**: All existing systems continue working
5. **Architecture**: Maintains clean architecture principles

## Next Steps

After successful validation:
1. **Documentation**: Update copilot instructions with new patterns
2. **Optimization**: Profile and optimize any performance bottlenecks
3. **Content**: Create additional settlement templates
4. **Testing**: Expand test coverage for edge cases
5. **Community**: Prepare demo for user feedback and iteration

This quickstart guide ensures the Valley of Echoes demo can be validated quickly and thoroughly, providing confidence in the implementation and architecture decisions.