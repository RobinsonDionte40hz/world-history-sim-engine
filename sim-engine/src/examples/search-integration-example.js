/**
 * Search and Filter System Integration Example
 *
 * This example demonstrates how to use the SearchEngine service
 * to index documents and perform advanced searches with filters.
 */

import searchEngine, { RESULT_TYPES } from '../application/services/SearchEngine.js';

// Sample data for indexing
const sampleCharacters = [
  {
    id: 'char_001',
    name: 'King Arthur',
    description: 'Legendary British leader who defended Britain against Saxon invaders',
    age: 35,
    occupation: 'King',
    location: 'Camelot',
    traits: ['brave', 'honorable', 'leadership'],
    skills: ['swordsmanship', 'strategy', 'diplomacy']
  },
  {
    id: 'char_002',
    name: 'Queen Guinevere',
    description: 'Queen consort of King Arthur, known for her beauty and wisdom',
    age: 28,
    occupation: 'Queen',
    location: 'Camelot',
    traits: ['wise', 'beautiful', 'diplomatic'],
    skills: ['diplomacy', 'horseback riding', 'music']
  },
  {
    id: 'char_003',
    name: 'Sir Lancelot',
    description: 'Greatest knight of the Round Table, known for his courage and skill',
    age: 32,
    occupation: 'Knight',
    location: 'Camelot',
    traits: ['brave', 'skilled', 'loyal'],
    skills: ['swordsmanship', 'horseback riding', 'tournament combat']
  }
];

const sampleSettlements = [
  {
    id: 'sett_001',
    name: 'Camelot',
    description: 'Capital city of King Arthur\'s kingdom, center of chivalry and justice',
    type: 'castle_city',
    populationCapacity: 5000,
    founded: '450 AD',
    location: 'Britain'
  },
  {
    id: 'sett_002',
    name: 'Tintagel Castle',
    description: 'Birthplace of King Arthur, ancient fortress on the Cornish coast',
    type: 'castle',
    populationCapacity: 200,
    founded: 'Ancient times',
    location: 'Cornwall'
  }
];

const sampleEvents = [
  {
    id: 'event_001',
    title: 'Battle of Badon Hill',
    description: 'Decisive battle where King Arthur defeated the Saxon invaders',
    date: '516 AD',
    location: 'Badon Hill',
    importance: 9,
    participants: ['King Arthur', 'Saxon Army']
  },
  {
    id: 'event_002',
    title: 'Round Table Formation',
    description: 'Establishment of the Knights of the Round Table',
    date: '480 AD',
    location: 'Camelot',
    importance: 8,
    participants: ['King Arthur', 'Knights of the Realm']
  }
];

/**
 * Initialize the search index with sample data
 */
export function initializeSearchIndex() {
  console.log('Initializing search index...');

  // Index characters
  sampleCharacters.forEach(character => {
    searchEngine.indexDocument(
      character.id,
      character,
      RESULT_TYPES.CHARACTER,
      ['name', 'description', 'occupation', 'location', 'traits', 'skills']
    );
  });

  // Index settlements
  sampleSettlements.forEach(settlement => {
    searchEngine.indexDocument(
      settlement.id,
      settlement,
      RESULT_TYPES.SETTLEMENT,
      ['name', 'description', 'type', 'location']
    );
  });

  // Index events
  sampleEvents.forEach(event => {
    searchEngine.indexDocument(
      event.id,
      event,
      RESULT_TYPES.EVENT,
      ['title', 'description', 'location', 'participants']
    );
  });

  console.log('Search index initialized with sample data');
}

/**
 * Example search queries
 */
export const exampleSearches = {
  // Simple text search
  simpleTextSearch: async () => {
    console.log('\n=== Simple Text Search ===');
    const query = {
      filters: [{
        field: 'content',
        operator: 'CONTAINS',
        value: 'king',
        boost: 1.0
      }],
      sortBy: 'relevance',
      sortOrder: 'desc',
      limit: 10,
      resultTypes: [RESULT_TYPES.CHARACTER, RESULT_TYPES.SETTLEMENT, RESULT_TYPES.EVENT],
      includeMetadata: true,
      highlightMatches: true
    };

    const results = await searchEngine.search(query);
    console.log(`Found ${results.total} results for "king"`);
    results.results.forEach(result => {
      console.log(`- ${result.title} (${result.type}) - Score: ${(result.score * 100).toFixed(0)}%`);
    });
    return results;
  },

  // Advanced filter search
  advancedFilterSearch: async () => {
    console.log('\n=== Advanced Filter Search ===');
    const query = {
      filters: [
        {
          field: 'age',
          operator: 'GREATER_THAN',
          value: 30,
          boost: 1.0
        },
        {
          field: 'occupation',
          operator: 'EQUALS',
          value: 'King',
          boost: 2.0
        }
      ],
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 5,
      resultTypes: [RESULT_TYPES.CHARACTER],
      includeMetadata: true
    };

    const results = await searchEngine.search(query);
    console.log(`Found ${results.total} results for age > 30 AND occupation = "King"`);
    results.results.forEach(result => {
      console.log(`- ${result.title} (Age: ${result.metadata.age})`);
    });
    return results;
  },

  // Fuzzy search example
  fuzzySearch: async () => {
    console.log('\n=== Fuzzy Search ===');
    const query = {
      filters: [{
        field: 'name',
        operator: 'FUZZY',
        value: 'Arthr', // Intentional typo
        boost: 1.0
      }],
      sortBy: 'relevance',
      sortOrder: 'desc',
      limit: 5,
      resultTypes: [RESULT_TYPES.CHARACTER],
      includeMetadata: true,
      highlightMatches: true
    };

    const results = await searchEngine.search(query);
    console.log(`Found ${results.total} results for fuzzy match "Arthr"`);
    results.results.forEach(result => {
      console.log(`- ${result.title} - Score: ${(result.score * 100).toFixed(0)}%`);
    });
    return results;
  },

  // Multi-field search with different operators
  multiFieldSearch: async () => {
    console.log('\n=== Multi-Field Search ===');
    const query = {
      filters: [
        {
          field: 'populationCapacity',
          operator: 'GREATER_THAN',
          value: 1000,
          boost: 1.5
        },
        {
          field: 'type',
          operator: 'CONTAINS',
          value: 'castle',
          boost: 1.0
        }
      ],
      sortBy: 'population',
      sortOrder: 'desc',
      limit: 10,
      resultTypes: [RESULT_TYPES.SETTLEMENT],
      includeMetadata: true
    };

    const results = await searchEngine.search(query);
    console.log(`Found ${results.total} settlements with population > 1000 and type containing "castle"`);
    results.results.forEach(result => {
      console.log(`- ${result.title} (Population: ${result.metadata.population})`);
    });
    return results;
  },

  // Date range search
  dateRangeSearch: async () => {
    console.log('\n=== Date Range Search ===');
    const query = {
      filters: [{
        field: 'date',
        operator: 'BETWEEN',
        value: ['400 AD', '500 AD'],
        boost: 1.0
      }],
      sortBy: 'date',
      sortOrder: 'asc',
      limit: 10,
      resultTypes: [RESULT_TYPES.EVENT],
      includeMetadata: true
    };

    const results = await searchEngine.search(query);
    console.log(`Found ${results.total} events between 400 AD and 500 AD`);
    results.results.forEach(result => {
      console.log(`- ${result.title} (${result.metadata.date})`);
    });
    return results;
  }
};

/**
 * Filter preset examples
 */
export function demonstrateFilterPresets() {
  console.log('\n=== Filter Presets ===');

  // Create some example presets
  const presets = [
    {
      name: 'Royal Characters',
      query: {
        filters: [{
          field: 'occupation',
          operator: 'CONTAINS',
          value: 'king',
          boost: 1.0
        }],
        sortBy: 'name',
        sortOrder: 'asc',
        resultTypes: [RESULT_TYPES.CHARACTER]
      }
    },
    {
      name: 'Major Events',
      query: {
        filters: [{
          field: 'importance',
          operator: 'GREATER_THAN',
          value: 7,
          boost: 1.0
        }],
        sortBy: 'importance',
        sortOrder: 'desc',
        resultTypes: [RESULT_TYPES.EVENT]
      }
    },
    {
      name: 'Large Settlements',
      query: {
        filters: [{
          field: 'populationCapacity',
          operator: 'GREATER_THAN',
          value: 1000,
          boost: 1.0
        }],
        sortBy: 'population',
        sortOrder: 'desc',
        resultTypes: [RESULT_TYPES.SETTLEMENT]
      }
    }
  ];

  // Save presets
  presets.forEach(preset => {
    searchEngine.saveFilterPreset(preset.name, preset.query);
    console.log(`Saved preset: ${preset.name}`);
  });

  // List all presets
  const savedPresets = searchEngine.getFilterPresets();
  console.log(`\nTotal saved presets: ${savedPresets.length}`);
  savedPresets.forEach(preset => {
    console.log(`- ${preset.name} (used ${preset.usageCount} times)`);
  });

  return savedPresets;
}

/**
 * Performance and statistics example
 */
export function showSearchStatistics() {
  console.log('\n=== Search Statistics ===');
  const stats = searchEngine.getStats();

  console.log(`Documents indexed: ${stats.documentCount}`);
  console.log(`Unique tokens: ${stats.index.uniqueTokens}`);
  console.log(`Average tokens per document: ${stats.index.averageTokensPerDocument.toFixed(2)}`);

  console.log('\nDocuments by type:');
  Object.entries(stats.documentsByType).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`);
  });

  console.log(`\nFilter presets: ${stats.presetCount}`);

  return stats;
}

/**
 * Run all examples
 */
export async function runSearchExamples() {
  console.log('🚀 Running Search and Filter System Examples\n');

  // Initialize with sample data
  initializeSearchIndex();

  // Run search examples
  await exampleSearches.simpleTextSearch();
  await exampleSearches.advancedFilterSearch();
  await exampleSearches.fuzzySearch();
  await exampleSearches.multiFieldSearch();
  await exampleSearches.dateRangeSearch();

  // Demonstrate presets
  demonstrateFilterPresets();

  // Show statistics
  showSearchStatistics();

  console.log('\n✅ All examples completed!');
}

// Export for use in other modules
export { sampleCharacters, sampleSettlements, sampleEvents };
