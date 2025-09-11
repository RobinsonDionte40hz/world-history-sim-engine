# Search and Filter System - Task 4 Implementation

## Overview

This implementation provides a comprehensive search and filtering system for the World History Simulation Engine. The system supports complex queries, fuzzy matching, relevance scoring, and performance optimization through indexing.

## Architecture

### Core Components

1. **SearchEngine Service** (`src/application/services/SearchEngine.js`)
   - Main service handling search operations
   - Supports boolean operators, fuzzy matching, and relevance scoring
   - Includes indexing for performance optimization

2. **SearchPage** (`src/presentation/pages/SearchPage.js`)
   - Main UI component for search and filtering
   - Integrates all search components
   - Handles search state management

3. **FilterBuilder** (`src/presentation/components/FilterBuilder.js`)
   - Advanced filter creation interface
   - Supports multiple operators and field types
   - Real-time filter validation

4. **SearchResults** (`src/presentation/components/SearchResults.js`)
   - Results display with pagination
   - Highlighting and metadata display
   - Sorting and relevance scoring

5. **FilterPresets** (`src/presentation/components/FilterPresets.js`)
   - Save and manage filter combinations
   - Quick access to frequently used searches
   - Usage tracking and statistics

## Features

### Search Capabilities

- **Text Search**: Full-text search across all indexed content
- **Field-Specific Search**: Search within specific fields (name, description, etc.)
- **Boolean Operators**: AND, OR, NOT operations
- **Fuzzy Matching**: Approximate string matching for typos
- **Range Queries**: Date ranges, numeric ranges
- **Regular Expressions**: Advanced pattern matching

### Filter Types

- **Contains**: Text substring matching
- **Equals**: Exact value matching
- **Greater Than/Less Than**: Numeric comparisons
- **Between**: Range queries
- **In**: Multiple value matching
- **Fuzzy**: Approximate matching
- **Regex**: Pattern matching

### Result Types

- **Characters**: Historical figures with traits, skills, relationships
- **Settlements**: Cities, castles, villages with population data
- **Events**: Historical events with dates and participants
- **Relationships**: Connections between characters
- **Interactions**: Character interactions and communications

### Performance Features

- **Inverted Index**: Fast text search using token indexing
- **Relevance Scoring**: TF-IDF based scoring algorithm
- **Pagination**: Efficient result pagination
- **Caching**: Query result caching
- **Background Indexing**: Non-blocking document indexing

## Usage

### Basic Search

```javascript
import searchEngine from './application/services/SearchEngine.js';

// Simple text search
const results = await searchEngine.search({
  filters: [{
    field: 'content',
    operator: 'CONTAINS',
    value: 'king',
    boost: 1.0
  }],
  sortBy: 'relevance',
  limit: 20
});
```

### Advanced Filtering

```javascript
// Complex multi-field search
const results = await searchEngine.search({
  filters: [
    {
      field: 'age',
      operator: 'GREATER_THAN',
      value: 30
    },
    {
      field: 'occupation',
      operator: 'EQUALS',
      value: 'King'
    }
  ],
  sortBy: 'name',
  resultTypes: ['character'],
  includeMetadata: true
});
```

### Indexing Documents

```javascript
// Index a character
searchEngine.indexDocument(
  'char_001',
  {
    name: 'King Arthur',
    description: 'Legendary British leader',
    age: 35,
    occupation: 'King'
  },
  'character',
  ['name', 'description', 'occupation']
);
```

### Filter Presets

```javascript
// Save a filter preset
searchEngine.saveFilterPreset('Royal Characters', {
  filters: [{
    field: 'occupation',
    operator: 'CONTAINS',
    value: 'king'
  }],
  sortBy: 'name',
  resultTypes: ['character']
});

// Load and use preset
const presetQuery = searchEngine.loadFilterPreset('Royal Characters');
const results = await searchEngine.search(presetQuery);
```

## API Reference

### SearchEngine Methods

#### `indexDocument(docId, document, type, searchableFields)`
Index a document for search.

#### `search(query)`
Execute a search query and return results.

#### `removeDocument(docId)`
Remove a document from the index.

#### `updateDocument(docId, document, searchableFields)`
Update an indexed document.

#### `saveFilterPreset(name, query)`
Save a filter configuration as a preset.

#### `loadFilterPreset(name)`
Load a saved filter preset.

#### `getFilterPresets()`
Get all saved filter presets.

#### `getStats()`
Get search engine statistics.

### Query Structure

```javascript
{
  filters: [
    {
      field: 'fieldName',
      operator: 'CONTAINS|EQUAL|GREATER_THAN|etc',
      value: 'searchValue',
      boost: 1.0,
      fuzzy: false,
      caseSensitive: false
    }
  ],
  sortBy: 'relevance|name|date|type|population|importance',
  sortOrder: 'asc|desc',
  limit: 50,
  offset: 0,
  resultTypes: ['character', 'settlement', 'event'],
  includeMetadata: false,
  highlightMatches: false
}
```

## Integration Example

See `src/examples/search-integration-example.js` for a complete example of:

- Initializing the search index
- Performing various types of searches
- Using filter presets
- Viewing search statistics

## Performance Considerations

### Indexing Strategy
- Documents are indexed by tokenizing text fields
- Stop words are filtered out
- Minimum token length of 2 characters
- Case-insensitive indexing

### Search Optimization
- Inverted index for fast text search
- Relevance scoring with configurable boosts
- Pagination to limit result sets
- Debounced search to reduce API calls

### Memory Management
- Efficient token storage using Sets
- Document metadata caching
- Result pagination to control memory usage

## Future Enhancements

### Planned Features
- **Geospatial Search**: Location-based queries
- **Temporal Search**: Time-based filtering
- **Semantic Search**: Meaning-based search using embeddings
- **Search Analytics**: Query performance tracking
- **Auto-complete**: Search suggestion system
- **Saved Searches**: Persistent search history

### Scalability Improvements
- **Distributed Indexing**: Multi-node index distribution
- **Query Caching**: Redis-based result caching
- **Index Sharding**: Horizontal scaling of index
- **Real-time Updates**: Live index updates

## Testing

### Unit Tests
- Search algorithm correctness
- Filter operator functionality
- Index performance benchmarks
- Memory usage validation

### Integration Tests
- End-to-end search workflows
- UI component interactions
- API response validation
- Performance under load

## Dependencies

- **Core**: JavaScript ES6+ features
- **UI**: React for component rendering
- **Styling**: CSS modules for component styling
- **State**: React hooks for state management

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+, Firefox 55+, Safari 11+, Edge 79+

## Contributing

When extending the search system:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update documentation
4. Consider performance implications
5. Follow existing code patterns

## Troubleshooting

### Common Issues

**Slow Search Performance**
- Check index statistics with `getStats()`
- Verify document field mappings
- Consider reducing result limits

**Incorrect Results**
- Validate filter configurations
- Check operator usage
- Review document indexing fields

**Memory Issues**
- Monitor document count with `getStats()`
- Implement pagination for large result sets
- Clear unused indexes periodically

### Debug Tools

- Use `getStats()` for index analysis
- Enable query logging for performance tracking
- Check filter validation errors
- Monitor search execution times
