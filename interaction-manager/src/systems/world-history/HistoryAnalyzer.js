class HistoryAnalyzer {
  constructor(world) {
    this.world = world;
    this.cache = new Map();
  }

  // Query historical records
  queryHistory(query) {
    const {
      entityType,
      timeRange,
      events,
      includeQuests,
      includeAttributes,
      includeConsciousness
    } = query;

    // Get base records
    let records = this.world.history.filter(record => {
      // Filter by time range
      if (timeRange && (
        record.timestamp < timeRange.start ||
        record.timestamp > timeRange.end
      )) {
        return false;
      }

      // Filter by event type
      if (events && !events.includes(record.eventType)) {
        return false;
      }

      return true;
    });

    // Add related data based on options
    if (includeQuests || includeAttributes || includeConsciousness) {
      records = records.map(record => this.enrichRecord(record, {
        includeQuests,
        includeAttributes,
        includeConsciousness
      }));
    }

    return records;
  }

  // Enrich record with related data
  enrichRecord(record, options) {
    const enriched = { ...record };

    if (options.includeQuests) {
      enriched.quests = this.getRelatedQuests(record);
    }

    if (options.includeAttributes) {
      enriched.attributes = this.getAttributeChanges(record);
    }

    if (options.includeConsciousness) {
      enriched.consciousness = this.getConsciousnessChanges(record);
    }

    return enriched;
  }

  // Get related quests
  getRelatedQuests(record) {
    return record.questCompletions.map(completion => {
      const quest = this.world.quests.get(completion.questId);
      return quest ? {
        ...quest,
        completion: completion
      } : null;
    }).filter(Boolean);
  }

  // Get attribute changes
  getAttributeChanges(record) {
    return record.attributeChanges.map(change => {
      const entity = this.getEntity(change.entityId);
      return entity ? {
        entity: entity.name,
        attribute: change.attribute,
        change: change.change,
        newValue: entity.attributes[change.attribute]
      } : null;
    }).filter(Boolean);
  }

  // Get consciousness changes
  getConsciousnessChanges(record) {
    return record.participants.map(participantId => {
      const entity = this.getEntity(participantId);
      return entity && entity.consciousness ? {
        entity: entity.name,
        state: entity.consciousness.state,
        history: entity.consciousness.history
      } : null;
    }).filter(Boolean);
  }

  // Generate family tree
  generateFamilyTree(rootId, options) {
    const {
      generations,
      includeMarriages,
      includeChildren,
      showAttributeInheritance,
      showSkillTraditions,
      showQuestLegacies
    } = options;

    const root = this.getEntity(rootId);
    if (!root) return null;

    const tree = {
      id: root.id,
      name: root.name,
      attributes: showAttributeInheritance ? root.attributes : null,
      skills: showSkillTraditions ? root.skills : null,
      quests: showQuestLegacies ? this.getQuestHistory(root) : null,
      marriages: includeMarriages ? this.getMarriages(root) : null,
      children: includeChildren ? this.getChildren(root) : null
    };

    if (generations > 1) {
      tree.children = tree.children.map(child => 
        this.generateFamilyTree(child.id, {
          ...options,
          generations: generations - 1
        })
      );
    }

    return tree;
  }

  // Get marriages
  getMarriages(entity) {
    return this.world.history
      .filter(record => 
        record.eventType === 'marriage' &&
        record.participants.includes(entity.id)
      )
      .map(record => ({
        spouse: this.getEntity(
          record.participants.find(id => id !== entity.id)
        ),
        date: record.timestamp,
        location: this.getEntity(record.location)
      }));
  }

  // Get children
  getChildren(entity) {
    return this.world.history
      .filter(record =>
        record.eventType === 'birth' &&
        record.participants.includes(entity.id)
      )
      .map(record => this.getEntity(
        record.participants.find(id => id !== entity.id)
      ));
  }

  // Get quest history
  getQuestHistory(entity) {
    return this.world.history
      .filter(record =>
        record.participants.includes(entity.id) &&
        record.questCompletions.length > 0
      )
      .map(record => ({
        quests: record.questCompletions,
        date: record.timestamp
      }));
  }

  // Analyze NPC decisions
  analyzeDecisions(npcId, options) {
    const {
      period,
      includeAttributeInfluence,
      includePersonalityFactors,
      includeConsciousnessStates,
      includeQuestMotivations
    } = options;

    const npc = this.getEntity(npcId);
    if (!npc) return null;

    const decisions = this.world.history
      .filter(record =>
        record.participants.includes(npcId) &&
        record.timestamp >= period.start &&
        record.timestamp <= period.end
      )
      .map(record => this.analyzeDecision(record, npc, options));

    return {
      npc: npc.name,
      period,
      decisions,
      summary: this.generateDecisionSummary(decisions)
    };
  }

  // Analyze single decision
  analyzeDecision(record, npc, options) {
    const analysis = {
      event: record.eventType,
      timestamp: record.timestamp,
      location: this.getEntity(record.location),
      participants: record.participants.map(id => this.getEntity(id))
    };

    if (options.includeAttributeInfluence) {
      analysis.attributeInfluence = this.analyzeAttributeInfluence(record, npc);
    }

    if (options.includePersonalityFactors) {
      analysis.personalityFactors = this.analyzePersonalityFactors(record, npc);
    }

    if (options.includeConsciousnessStates) {
      analysis.consciousnessState = npc.consciousness?.state;
    }

    if (options.includeQuestMotivations) {
      analysis.questMotivations = this.analyzeQuestMotivations(record, npc);
    }

    return analysis;
  }

  // Analyze attribute influence
  analyzeAttributeInfluence(record, npc) {
    return record.attributeChanges
      .filter(change => change.entityId === npc.id)
      .map(change => ({
        attribute: change.attribute,
        change: change.change,
        influence: this.calculateAttributeInfluence(change, npc)
      }));
  }

  // Analyze personality factors
  analyzePersonalityFactors(record, npc) {
    return Object.entries(npc.traits)
      .map(([trait, value]) => ({
        trait,
        value,
        influence: this.calculateTraitInfluence(trait, value, record)
      }));
  }

  // Analyze quest motivations
  analyzeQuestMotivations(record, npc) {
    return record.questCompletions
      .filter(completion => completion.entityId === npc.id)
      .map(completion => ({
        quest: this.world.quests.get(completion.questId),
        motivation: this.calculateQuestMotivation(completion, npc)
      }));
  }

  // Generate decision summary
  generateDecisionSummary(decisions) {
    return {
      totalDecisions: decisions.length,
      attributeInfluence: this.summarizeAttributeInfluence(decisions),
      personalityPatterns: this.summarizePersonalityPatterns(decisions),
      consciousnessEvolution: this.summarizeConsciousnessEvolution(decisions),
      questMotivations: this.summarizeQuestMotivations(decisions)
    };
  }

  // Helper methods
  getEntity(id) {
    return (
      this.world.characters.get(id) ||
      this.world.nodes.get(id) ||
      this.world.groups.get(id)
    );
  }

  calculateAttributeInfluence(change, npc) {
    // Calculate how much the attribute change influenced the decision
    return Math.abs(change.change) / 20; // Normalize to 0-1 range
  }

  calculateTraitInfluence(trait, value, record) {
    // Calculate how much the personality trait influenced the decision
    return value * 0.1; // Scale trait value to influence
  }

  calculateQuestMotivation(completion, npc) {
    // Calculate how much the quest completion motivated the decision
    return completion.success ? 1 : 0.5;
  }

  summarizeAttributeInfluence(decisions) {
    const influence = {};
    decisions.forEach(decision => {
      decision.attributeInfluence?.forEach(attr => {
        influence[attr.attribute] = (influence[attr.attribute] || 0) + attr.influence;
      });
    });
    return influence;
  }

  summarizePersonalityPatterns(decisions) {
    const patterns = {};
    decisions.forEach(decision => {
      decision.personalityFactors?.forEach(factor => {
        patterns[factor.trait] = (patterns[factor.trait] || 0) + factor.influence;
      });
    });
    return patterns;
  }

  summarizeConsciousnessEvolution(decisions) {
    return decisions
      .map(d => d.consciousnessState)
      .filter(Boolean)
      .reduce((evolution, state) => {
        evolution[state] = (evolution[state] || 0) + 1;
        return evolution;
      }, {});
  }

  summarizeQuestMotivations(decisions) {
    return decisions
      .flatMap(d => d.questMotivations || [])
      .reduce((motivations, quest) => {
        motivations[quest.quest.type] = (motivations[quest.quest.type] || 0) + quest.motivation;
        return motivations;
      }, {});
  }
}

export default HistoryAnalyzer; 