// Placeholder Redux store selectors for template system
// TODO: Implement actual Redux selectors when store is available

export const selectCharacterTemplates = (state) => {
  // Return mock character templates for now
  return [
    {
      id: 'merchant-template',
      name: 'Merchant Template',
      description: 'Basic merchant with trade capabilities',
      archetype: 'merchant',
      attributes: { str: 10, dex: 12, con: 11, int: 15, wis: 13, cha: 16 },
      assignedInteractions: ['trade', 'negotiate'],
      personality: { traits: ['greedy', 'shrewd'] },
      consciousness: { frequency: 0.8, coherence: 0.7 },
      tags: ['economic', 'social']
    },
    {
      id: 'guard-template',
      name: 'Guard Template',
      description: 'Basic guard with combat capabilities',
      archetype: 'guard',
      attributes: { str: 16, dex: 13, con: 15, int: 10, wis: 12, cha: 10 },
      assignedInteractions: ['combat', 'patrol'],
      personality: { traits: ['dutiful', 'alert'] },
      consciousness: { frequency: 0.6, coherence: 0.8 },
      tags: ['combat', 'security']
    }
  ];
};

export const selectNodeTemplates = (state) => {
  // Return mock node templates for now
  return [
    {
      id: 'settlement-template',
      name: 'Basic Settlement',
      description: 'A small settlement with basic facilities',
      type: 'settlement',
      environmentalProperties: { climate: 'temperate', terrain: 'plains' },
      resourceAvailability: ['food', 'water', 'wood'],
      culturalContext: 'Agricultural community',
      tags: ['settlement', 'basic']
    },
    {
      id: 'market-template',
      name: 'Trading Post',
      description: 'A bustling trading post',
      type: 'market',
      environmentalProperties: { climate: 'temperate', terrain: 'crossroads' },
      resourceAvailability: ['goods', 'services', 'information'],
      culturalContext: 'Commercial hub',
      tags: ['trade', 'economic']
    }
  ];
};

export const selectInteractionTemplates = (state) => {
  // Return mock interaction templates for now
  return [
    {
      id: 'trade-template',
      name: 'Trade Interaction',
      description: 'Basic trading capability',
      type: 'economic',
      requirements: { charisma: 12 },
      branches: [{ condition: 'success', outcome: 'goods exchanged' }],
      effects: [{ type: 'resource_change', value: 'variable' }],
      context: 'marketplace',
      tags: ['economic', 'social']
    },
    {
      id: 'combat-template',
      name: 'Combat Interaction',
      description: 'Basic combat capability',
      type: 'combat',
      requirements: { strength: 12 },
      branches: [{ condition: 'victory', outcome: 'opponent defeated' }],
      effects: [{ type: 'health_change', value: 'variable' }],
      context: 'conflict',
      tags: ['combat', 'physical']
    }
  ];
};

export const selectGroupTemplates = (state) => {
  // Return mock composite/group templates for now
  return [
    {
      id: 'village-composite',
      name: 'Village Role Set',
      description: 'Complete village with merchant, guards, and farmers',
      type: 'settlement',
      roleSet: ['merchant', 'guard', 'farmer', 'blacksmith'],
      nodePopulation: { typical: 'small settlement population' },
      economicSystem: 'basic trade network',
      tags: ['composite', 'village']
    },
    {
      id: 'trade-route-composite',
      name: 'Trade Route System',
      description: 'Network of connected trading posts',
      type: 'economic',
      roleSet: ['merchant', 'caravan_master', 'guard'],
      nodePopulation: { typical: 'trade route population' },
      economicSystem: 'complex trade network',
      tags: ['composite', 'trade']
    }
  ];
};

export const selectActiveTemplate = (state) => {
  // Return current active template
  return null; // No active template by default
};

// Placeholder action creators
export const setActiveTemplate = (templateData) => ({
  type: 'SET_ACTIVE_TEMPLATE',
  payload: templateData
});

// Placeholder useSelector hook
export const useSelector = (selector) => {
  const mockState = {}; // Empty state for now
  return selector(mockState);
};

// Placeholder useDispatch hook
export const useDispatch = () => {
  return (action) => {
    console.log('Dispatching action:', action);
    // TODO: Replace with actual Redux dispatch when store is available
  };
};
