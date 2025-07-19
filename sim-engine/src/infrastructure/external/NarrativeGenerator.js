// src/infrastructure/external/NarrativeGenerator.js

import IExternalService from '../../application/use-cases/ports/IExternalService.js';  // Reuse or add INarrativeService

const NarrativeGenerator = {
  generateNarrative: async (events) => {
    // Simple JS rule-based narrative (for MVP; replace with LLM API later)
    return events.map(e => `${e.characterName} ${e.outcome === 'positive' ? 'succeeded' : 'failed'} in ${e.interactionName}.`).join(' ');
  },
};

const NarrativeService = { ...IExternalService, ...NarrativeGenerator };
export default NarrativeService;