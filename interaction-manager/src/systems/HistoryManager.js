import { HistoricalRecord } from '../types/history/HistoricalRecord';
import { NPCHistory } from '../types/history/NPCHistory';
import { SettlementHistory } from '../types/history/SettlementHistory';

class HistoryManager {
  constructor() {
    this.records = [];
    this.npcHistories = new Map();
    this.settlementHistories = new Map();
    this.indexes = {
      byTime: new Map(),
      byType: new Map(),
      byEntity: new Map(),
      byLocation: new Map()
    };
  }

  // Record Management
  addRecord(record) {
    this.records.push(record);
    this.updateIndexes(record);
  }

  updateIndexes(record) {
    // Index by time
    if (!this.indexes.byTime.has(record.timestamp)) {
      this.indexes.byTime.set(record.timestamp, []);
    }
    this.indexes.byTime.get(record.timestamp).push(record);

    // Index by type
    if (!this.indexes.byType.has(record.eventType)) {
      this.indexes.byType.set(record.eventType, []);
    }
    this.indexes.byType.get(record.eventType).push(record);

    // Index by entity
    for (const participant of record.participants) {
      if (!this.indexes.byEntity.has(participant.id)) {
        this.indexes.byEntity.set(participant.id, []);
      }
      this.indexes.byEntity.get(participant.id).push(record);
    }

    // Index by location
    if (record.location) {
      if (!this.indexes.byLocation.has(record.location.id)) {
        this.indexes.byLocation.set(record.location.id, []);
      }
      this.indexes.byLocation.get(record.location.id).push(record);
    }
  }

  // NPC History Management
  addNPCHistory(npcId, history) {
    this.npcHistories.set(npcId, history);
  }

  updateNPCHistory(npcId, update) {
    const history = this.npcHistories.get(npcId);
    if (history) {
      Object.assign(history, update);
    }
  }

  getNPCHistory(npcId) {
    return this.npcHistories.get(npcId);
  }

  // Settlement History Management
  addSettlementHistory(settlementId, history) {
    this.settlementHistories.set(settlementId, history);
  }

  updateSettlementHistory(settlementId, update) {
    const history = this.settlementHistories.get(settlementId);
    if (history) {
      Object.assign(history, update);
    }
  }

  getSettlementHistory(settlementId) {
    return this.settlementHistories.get(settlementId);
  }

  // Query Methods
  queryByTimeRange(startTime, endTime) {
    const records = [];
    for (const [timestamp, timestampRecords] of this.indexes.byTime) {
      if (timestamp >= startTime && timestamp <= endTime) {
        records.push(...timestampRecords);
      }
    }
    return records.sort((a, b) => a.timestamp - b.timestamp);
  }

  queryByType(type) {
    return this.indexes.byType.get(type) || [];
  }

  queryByEntity(entityId) {
    return this.indexes.byEntity.get(entityId) || [];
  }

  queryByLocation(locationId) {
    return this.indexes.byLocation.get(locationId) || [];
  }

  queryByMultipleCriteria(criteria) {
    let results = this.records;

    if (criteria.timeRange) {
      results = results.filter(record => 
        record.timestamp >= criteria.timeRange.start && 
        record.timestamp <= criteria.timeRange.end
      );
    }

    if (criteria.types) {
      results = results.filter(record => 
        criteria.types.includes(record.eventType)
      );
    }

    if (criteria.entities) {
      results = results.filter(record => 
        record.participants.some(p => criteria.entities.includes(p.id))
      );
    }

    if (criteria.locations) {
      results = results.filter(record => 
        criteria.locations.includes(record.location?.id)
      );
    }

    return results;
  }

  // Analysis Methods
  analyzeEntityHistory(entityId) {
    const records = this.queryByEntity(entityId);
    const history = this.npcHistories.get(entityId) || this.settlementHistories.get(entityId);

    return {
      records,
      history,
      statistics: this.calculateEntityStatistics(records),
      timeline: this.generateEntityTimeline(records),
      relationships: this.analyzeEntityRelationships(entityId, records)
    };
  }

  calculateEntityStatistics(records) {
    const statistics = {
      eventCount: records.length,
      eventTypes: {},
      attributeChanges: {},
      relationshipChanges: {},
      locationChanges: []
    };

    for (const record of records) {
      // Count event types
      statistics.eventTypes[record.eventType] = (statistics.eventTypes[record.eventType] || 0) + 1;

      // Track attribute changes
      if (record.attributeChanges) {
        for (const change of record.attributeChanges) {
          if (!statistics.attributeChanges[change.entity]) {
            statistics.attributeChanges[change.entity] = {};
          }
          for (const [attr, value] of Object.entries(change.attributes)) {
            if (!statistics.attributeChanges[change.entity][attr]) {
              statistics.attributeChanges[change.entity][attr] = [];
            }
            statistics.attributeChanges[change.entity][attr].push({
              timestamp: record.timestamp,
              value
            });
          }
        }
      }

      // Track relationship changes
      if (record.relationshipChanges) {
        for (const change of record.relationshipChanges) {
          if (!statistics.relationshipChanges[change.entities.join('-')]) {
            statistics.relationshipChanges[change.entities.join('-')] = [];
          }
          statistics.relationshipChanges[change.entities.join('-')].push({
            timestamp: record.timestamp,
            change: change.change
          });
        }
      }

      // Track location changes
      if (record.location) {
        statistics.locationChanges.push({
          timestamp: record.timestamp,
          location: record.location
        });
      }
    }

    return statistics;
  }

  generateEntityTimeline(records) {
    return records.map(record => ({
      timestamp: record.timestamp,
      type: record.eventType,
      description: record.description,
      participants: record.participants,
      location: record.location,
      effects: record.effects
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  analyzeEntityRelationships(entityId, records) {
    const relationships = new Map();

    for (const record of records) {
      for (const participant of record.participants) {
        if (participant.id !== entityId) {
          if (!relationships.has(participant.id)) {
            relationships.set(participant.id, {
              entity: participant,
              interactions: [],
              relationshipValue: 0
            });
          }

          const relationship = relationships.get(participant.id);
          relationship.interactions.push({
            timestamp: record.timestamp,
            type: record.eventType,
            role: participant.role
          });

          if (record.relationshipChanges) {
            for (const change of record.relationshipChanges) {
              if (change.entities.includes(participant.id)) {
                relationship.relationshipValue += change.change;
              }
            }
          }
        }
      }
    }

    return Array.from(relationships.values());
  }

  // Export Methods
  exportHistory() {
    return {
      records: this.records,
      npcHistories: Array.from(this.npcHistories.entries()),
      settlementHistories: Array.from(this.settlementHistories.entries())
    };
  }

  importHistory(data) {
    this.records = data.records;
    this.npcHistories = new Map(data.npcHistories);
    this.settlementHistories = new Map(data.settlementHistories);
    this.rebuildIndexes();
  }

  rebuildIndexes() {
    this.indexes = {
      byTime: new Map(),
      byType: new Map(),
      byEntity: new Map(),
      byLocation: new Map()
    };

    for (const record of this.records) {
      this.updateIndexes(record);
    }
  }
}

export default HistoryManager; 