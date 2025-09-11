/**
 * SearchEngine - Advanced search and filtering service for historical simulation data
 *
 * Provides complex query support with boolean operators, fuzzy matching,
 * relevance scoring, and performance optimization through indexing.
 */

import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Search query operators
 */
export const SEARCH_OPERATORS = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  CONTAINS: 'CONTAINS',
  EQUALS: 'EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  BETWEEN: 'BETWEEN',
  IN: 'IN',
  FUZZY: 'FUZZY',
  REGEX: 'REGEX'
};

/**
 * Sort options
 */
export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  NAME: 'name',
  DATE: 'date',
  TYPE: 'type',
  POPULATION: 'population',
  IMPORTANCE: 'importance'
};

/**
 * Search result types
 */
export const RESULT_TYPES = {
  CHARACTER: 'character',
  SETTLEMENT: 'settlement',
  EVENT: 'event',
  RELATIONSHIP: 'relationship',
  INTERACTION: 'interaction'
};

/**
 * Search filter configuration
 */
class SearchFilter {
  constructor(config = {}) {
    this.field = config.field || '';
    this.operator = config.operator || SEARCH_OPERATORS.CONTAINS;
    this.value = config.value || '';
    this.boost = config.boost || 1.0;
    this.fuzzy = config.fuzzy || false;
    this.caseSensitive = config.caseSensitive || false;
  }

  /**
   * Validate filter configuration
   */
  validate() {
    if (!this.field) {
      throw new ValidationError('field', this.field, 'Field is required for search filter');
    }

    if (!Object.values(SEARCH_OPERATORS).includes(this.operator)) {
      throw new ValidationError('operator', this.operator, 'Invalid search operator');
    }

    if (this.value === undefined || this.value === null) {
      throw new ValidationError('value', this.value, 'Value is required for search filter');
    }
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      field: this.field,
      operator: this.operator,
      value: this.value,
      boost: this.boost,
      fuzzy: this.fuzzy,
      caseSensitive: this.caseSensitive
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data) {
    return new SearchFilter(data);
  }
}

/**
 * Search query configuration
 */
class SearchQuery {
  constructor(config = {}) {
    this.filters = config.filters || [];
    this.sortBy = config.sortBy || SORT_OPTIONS.RELEVANCE;
    this.sortOrder = config.sortOrder || 'desc';
    this.limit = config.limit || 50;
    this.offset = config.offset || 0;
    this.resultTypes = config.resultTypes || Object.values(RESULT_TYPES);
    this.includeMetadata = config.includeMetadata || false;
    this.highlightMatches = config.highlightMatches || false;
  }

  /**
   * Add a filter to the query
   */
  addFilter(filter) {
    if (!(filter instanceof SearchFilter)) {
      filter = new SearchFilter(filter);
    }
    filter.validate();
    this.filters.push(filter);
    return this;
  }

  /**
   * Remove a filter by index
   */
  removeFilter(index) {
    if (index >= 0 && index < this.filters.length) {
      this.filters.splice(index, 1);
    }
    return this;
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.filters = [];
    return this;
  }

  /**
   * Validate query configuration
   */
  validate() {
    this.filters.forEach(filter => filter.validate());

    if (!Object.values(SORT_OPTIONS).includes(this.sortBy)) {
      throw new ValidationError('sortBy', this.sortBy, 'Invalid sort option');
    }

    if (!['asc', 'desc'].includes(this.sortOrder)) {
      throw new ValidationError('sortOrder', this.sortOrder, 'Sort order must be "asc" or "desc"');
    }

    if (this.limit < 1 || this.limit > 1000) {
      throw new ValidationError('limit', this.limit, 'Limit must be between 1 and 1000');
    }

    if (this.offset < 0) {
      throw new ValidationError('offset', this.offset, 'Offset must be non-negative');
    }
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      filters: this.filters.map(f => f.toJSON()),
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      limit: this.limit,
      offset: this.offset,
      resultTypes: this.resultTypes,
      includeMetadata: this.includeMetadata,
      highlightMatches: this.highlightMatches
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data) {
    const query = new SearchQuery(data);
    query.filters = data.filters.map(f => SearchFilter.fromJSON(f));
    return query;
  }
}

/**
 * Search result with scoring and highlighting
 */
class SearchResult {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.title = data.title || '';
    this.description = data.description || '';
    this.content = data.content || '';
    this.score = data.score || 0;
    this.highlights = data.highlights || [];
    this.metadata = data.metadata || {};
    this.timestamp = data.timestamp || new Date();
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      content: this.content,
      score: this.score,
      highlights: this.highlights,
      metadata: this.metadata,
      timestamp: this.timestamp
    };
  }
}

/**
 * Search index for performance optimization
 */
class SearchIndex {
  constructor() {
    this.index = new Map();
    this.reverseIndex = new Map();
    this.documentCount = 0;
  }

  /**
   * Add document to index
   */
  addDocument(docId, document, fields = []) {
    const searchableFields = fields.length > 0 ? fields : Object.keys(document);

    searchableFields.forEach(field => {
      const value = document[field];
      if (value && typeof value === 'string') {
        const tokens = this.tokenize(value);

        tokens.forEach(token => {
          if (!this.index.has(token)) {
            this.index.set(token, new Set());
          }
          this.index.get(token).add(docId);

          if (!this.reverseIndex.has(docId)) {
            this.reverseIndex.set(docId, new Set());
          }
          this.reverseIndex.get(docId).add(token);
        });
      }
    });

    this.documentCount++;
  }

  /**
   * Remove document from index
   */
  removeDocument(docId) {
    if (this.reverseIndex.has(docId)) {
      const tokens = this.reverseIndex.get(docId);
      tokens.forEach(token => {
        if (this.index.has(token)) {
          this.index.get(token).delete(docId);
          if (this.index.get(token).size === 0) {
            this.index.delete(token);
          }
        }
      });
      this.reverseIndex.delete(docId);
      this.documentCount--;
    }
  }

  /**
   * Search index for tokens
   */
  searchTokens(tokens) {
    const results = new Set();

    tokens.forEach(token => {
      if (this.index.has(token)) {
        this.index.get(token).forEach(docId => results.add(docId));
      }
    });

    return Array.from(results);
  }

  /**
   * Tokenize text for indexing
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      documentCount: this.documentCount,
      uniqueTokens: this.index.size,
      averageTokensPerDocument: this.documentCount > 0
        ? Array.from(this.reverseIndex.values()).reduce((sum, tokens) => sum + tokens.size, 0) / this.documentCount
        : 0
    };
  }
}

/**
 * Main SearchEngine service
 */
class SearchEngine {
  constructor() {
    this.index = new SearchIndex();
    this.documents = new Map();
    this.filterPresets = new Map();
    this.searchHistory = [];
  }

  /**
   * Index a document for search
   */
  indexDocument(docId, document, type, searchableFields = []) {
    this.documents.set(docId, {
      id: docId,
      type,
      data: document,
      indexedAt: new Date()
    });

    this.index.addDocument(docId, document, searchableFields);
  }

  /**
   * Remove document from index
   */
  removeDocument(docId) {
    this.documents.delete(docId);
    this.index.removeDocument(docId);
  }

  /**
   * Update indexed document
   */
  updateDocument(docId, document, searchableFields = []) {
    this.removeDocument(docId);
    this.indexDocument(docId, document, this.documents.get(docId)?.type, searchableFields);
  }

  /**
   * Execute search query
   */
  async search(query) {
    if (!(query instanceof SearchQuery)) {
      query = SearchQuery.fromJSON(query);
    }

    query.validate();

    // Get candidate documents using index
    const candidateIds = this.getCandidateDocuments(query);

    // Apply filters and scoring
    const results = [];
    for (const docId of candidateIds) {
      const document = this.documents.get(docId);
      if (!document || !query.resultTypes.includes(document.type)) {
        continue;
      }

      const score = this.calculateScore(document.data, query);
      if (score > 0) {
        const result = new SearchResult({
          id: document.id,
          type: document.type,
          title: this.extractTitle(document.data, document.type),
          description: this.extractDescription(document.data, document.type),
          content: this.extractContent(document.data, document.type),
          score,
          highlights: query.highlightMatches ? this.generateHighlights(document.data, query) : [],
          metadata: query.includeMetadata ? this.extractMetadata(document.data, document.type) : {},
          timestamp: document.indexedAt
        });
        results.push(result);
      }
    }

    // Sort results
    results.sort((a, b) => {
      if (query.sortBy === SORT_OPTIONS.RELEVANCE) {
        return query.sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      }

      const aValue = this.getSortValue(a, query.sortBy);
      const bValue = this.getSortValue(b, query.sortBy);

      if (query.sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const paginatedResults = results.slice(query.offset, query.offset + query.limit);

    // Store search in history
    this.searchHistory.push({
      query: query.toJSON(),
      resultCount: results.length,
      timestamp: new Date()
    });

    return {
      results: paginatedResults,
      total: results.length,
      query,
      executionTime: Date.now()
    };
  }

  /**
   * Get candidate documents using index
   */
  getCandidateDocuments(query) {
    const allDocIds = Array.from(this.documents.keys());

    if (query.filters.length === 0) {
      return allDocIds;
    }

    // For now, return all documents (full filtering will be applied later)
    // In a production system, you'd use the index more efficiently here
    return allDocIds;
  }

  /**
   * Calculate relevance score for document
   */
  calculateScore(document, query) {
    let totalScore = 0;

    for (const filter of query.filters) {
      const fieldScore = this.evaluateFilter(document, filter);
      totalScore += fieldScore * filter.boost;
    }

    return totalScore;
  }

  /**
   * Evaluate single filter against document
   */
  evaluateFilter(document, filter) {
    const fieldValue = this.getNestedValue(document, filter.field);
    if (fieldValue === undefined || fieldValue === null) {
      return 0;
    }

    const value = filter.value;
    const operator = filter.operator;

    switch (operator) {
      case SEARCH_OPERATORS.CONTAINS:
        return this.containsMatch(fieldValue, value, filter.fuzzy);

      case SEARCH_OPERATORS.EQUALS:
        return this.equalsMatch(fieldValue, value, filter.caseSensitive);

      case SEARCH_OPERATORS.GREATER_THAN:
        return fieldValue > value ? 1 : 0;

      case SEARCH_OPERATORS.LESS_THAN:
        return fieldValue < value ? 1 : 0;

      case SEARCH_OPERATORS.BETWEEN:
        return fieldValue >= value[0] && fieldValue <= value[1] ? 1 : 0;

      case SEARCH_OPERATORS.IN:
        return Array.isArray(value) && value.includes(fieldValue) ? 1 : 0;

      case SEARCH_OPERATORS.FUZZY:
        return this.fuzzyMatch(fieldValue, value);

      case SEARCH_OPERATORS.REGEX:
        return new RegExp(value, filter.caseSensitive ? 'g' : 'gi').test(fieldValue) ? 1 : 0;

      default:
        return 0;
    }
  }

  /**
   * Check if value contains search term
   */
  containsMatch(fieldValue, searchValue, fuzzy = false) {
    const fieldStr = String(fieldValue).toLowerCase();
    const searchStr = String(searchValue).toLowerCase();

    if (fuzzy) {
      return this.fuzzyMatch(fieldStr, searchStr);
    }

    return fieldStr.includes(searchStr) ? 1 : 0;
  }

  /**
   * Check exact equality
   */
  equalsMatch(fieldValue, searchValue, caseSensitive = false) {
    if (caseSensitive) {
      return fieldValue === searchValue ? 1 : 0;
    }
    return String(fieldValue).toLowerCase() === String(searchValue).toLowerCase() ? 1 : 0;
  }

  /**
   * Fuzzy string matching
   */
  fuzzyMatch(str1, str2, threshold = 0.8) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length >= threshold ? 1 : 0;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get nested object value by path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Extract title from document based on type
   */
  extractTitle(document, type) {
    switch (type) {
      case RESULT_TYPES.CHARACTER:
        return document.name || document.title || 'Unnamed Character';
      case RESULT_TYPES.SETTLEMENT:
        return document.name || document.title || 'Unnamed Settlement';
      case RESULT_TYPES.EVENT:
        return document.title || document.name || 'Unnamed Event';
      case RESULT_TYPES.RELATIONSHIP:
        return `${document.sourceName || 'Unknown'} → ${document.targetName || 'Unknown'}`;
      case RESULT_TYPES.INTERACTION:
        return document.name || document.title || 'Unnamed Interaction';
      default:
        return document.name || document.title || 'Unknown';
    }
  }

  /**
   * Extract description from document
   */
  extractDescription(document, type) {
    return document.description || document.summary || '';
  }

  /**
   * Extract searchable content from document
   */
  extractContent(document, type) {
    // Combine multiple fields for full-text search
    const fields = ['name', 'description', 'content', 'notes', 'history'];
    return fields.map(field => document[field]).filter(Boolean).join(' ');
  }

  /**
   * Extract metadata for result
   */
  extractMetadata(document, type) {
    const metadata = { type };

    switch (type) {
      case RESULT_TYPES.CHARACTER:
        metadata.age = document.age;
        metadata.occupation = document.occupation;
        metadata.location = document.location;
        break;
      case RESULT_TYPES.SETTLEMENT:
        metadata.population = document.populationCapacity;
        metadata.type = document.type;
        metadata.founded = document.founded;
        break;
      case RESULT_TYPES.EVENT:
        metadata.date = document.date;
        metadata.location = document.location;
        metadata.importance = document.importance;
        break;
      default:
        // No additional metadata for unknown types
        break;
    }

    return metadata;
  }

  /**
   * Generate highlight snippets for matches
   */
  generateHighlights(document, query) {
    const highlights = [];
    const content = this.extractContent(document, document.type);

    for (const filter of query.filters) {
      if (filter.operator === SEARCH_OPERATORS.CONTAINS) {
        const regex = new RegExp(`(${filter.value})`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          highlights.push(...matches.slice(0, 3)); // Limit to 3 highlights per filter
        }
      }
    }

    return highlights;
  }

  /**
   * Get value for sorting
   */
  getSortValue(result, sortBy) {
    switch (sortBy) {
      case SORT_OPTIONS.RELEVANCE:
        return result.score;
      case SORT_OPTIONS.NAME:
        return result.title.toLowerCase();
      case SORT_OPTIONS.DATE:
        return result.timestamp;
      case SORT_OPTIONS.TYPE:
        return result.type;
      case SORT_OPTIONS.POPULATION:
        return result.metadata.population || 0;
      case SORT_OPTIONS.IMPORTANCE:
        return result.metadata.importance || 0;
      default:
        return 0;
    }
  }

  /**
   * Save filter preset
   */
  saveFilterPreset(name, query) {
    if (!(query instanceof SearchQuery)) {
      query = SearchQuery.fromJSON(query);
    }

    this.filterPresets.set(name, {
      name,
      query: query.toJSON(),
      createdAt: new Date(),
      usageCount: 0
    });
  }

  /**
   * Load filter preset
   */
  loadFilterPreset(name) {
    const preset = this.filterPresets.get(name);
    if (preset) {
      preset.usageCount++;
      return SearchQuery.fromJSON(preset.query);
    }
    return null;
  }

  /**
   * Get all filter presets
   */
  getFilterPresets() {
    return Array.from(this.filterPresets.values());
  }

  /**
   * Delete filter preset
   */
  deleteFilterPreset(name) {
    return this.filterPresets.delete(name);
  }

  /**
   * Get search statistics
   */
  getStats() {
    return {
      index: this.index.getStats(),
      documentCount: this.documents.size,
      presetCount: this.filterPresets.size,
      searchHistoryCount: this.searchHistory.length,
      documentsByType: this.getDocumentCountByType()
    };
  }

  /**
   * Get document count by type
   */
  getDocumentCountByType() {
    const counts = {};
    for (const doc of this.documents.values()) {
      counts[doc.type] = (counts[doc.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Clear all data
   */
  clear() {
    this.index = new SearchIndex();
    this.documents.clear();
    this.filterPresets.clear();
    this.searchHistory = [];
  }

  /**
   * Export search data
   */
  export() {
    return {
      documents: Array.from(this.documents.entries()),
      presets: Array.from(this.filterPresets.entries()),
      stats: this.getStats()
    };
  }

  /**
   * Import search data
   */
  import(data) {
    this.clear();

    if (data.documents) {
      for (const [docId, doc] of data.documents) {
        this.documents.set(docId, doc);
        this.index.addDocument(docId, doc.data);
      }
    }

    if (data.presets) {
      for (const [name, preset] of data.presets) {
        this.filterPresets.set(name, preset);
      }
    }
  }
}

// Export singleton instance
const searchEngine = new SearchEngine();

export default searchEngine;
