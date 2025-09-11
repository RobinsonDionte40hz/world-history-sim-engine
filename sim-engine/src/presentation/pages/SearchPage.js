import React, { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '../components/SearchBar';
import { FilterBuilder } from '../components/FilterBuilder';
import { SearchResults } from '../components/SearchResults';
import { FilterPresets } from '../components/FilterPresets';
import searchEngine, { SORT_OPTIONS, RESULT_TYPES } from '../../application/services/SearchEngine';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RELEVANCE);
  const [sortOrder, setSortOrder] = useState('desc');
  const [resultTypes, setResultTypes] = useState(Object.values(RESULT_TYPES));
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Search execution
  const executeSearch = useCallback(async () => {
    if (!query.trim() && filters.length === 0) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchQuery = {
        filters: [
          // Add text search filter if query exists
          ...(query.trim() ? [{
            field: 'content',
            operator: 'CONTAINS',
            value: query,
            boost: 2.0
          }] : []),
          ...filters
        ],
        sortBy,
        sortOrder,
        limit: resultsPerPage,
        offset: (currentPage - 1) * resultsPerPage,
        resultTypes,
        includeMetadata: true,
        highlightMatches: true
      };

      const searchResults = await searchEngine.search(searchQuery);

      setResults(searchResults.results);
      setTotalResults(searchResults.total);
    } catch (err) {
      setError(err.message);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortBy, sortOrder, resultTypes, currentPage, resultsPerPage]);

  // Execute search when dependencies change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      executeSearch();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimer);
  }, [executeSearch]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  }, []);

  // Handle result type changes
  const handleResultTypesChange = useCallback((newResultTypes) => {
    setResultTypes(newResultTypes);
    setCurrentPage(1);
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle preset application
  const handlePresetApply = useCallback((presetQuery) => {
    setFilters(presetQuery.filters);
    setSortBy(presetQuery.sortBy);
    setSortOrder(presetQuery.sortOrder);
    setResultTypes(presetQuery.resultTypes);
    setCurrentPage(1);
    setShowPresets(false);
  }, []);

  // Clear all filters and search
  const handleClearAll = useCallback(() => {
    setQuery('');
    setFilters([]);
    setSortBy(SORT_OPTIONS.RELEVANCE);
    setSortOrder('desc');
    setResultTypes(Object.values(RESULT_TYPES));
    setCurrentPage(1);
    setResults([]);
    setTotalResults(0);
  }, []);

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Advanced Search</h1>
        <div className="search-controls">
          <button
            className={`toggle-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {filters.length > 0 && `(${filters.length})`}
          </button>
          <button
            className="toggle-button"
            onClick={() => setShowPresets(!showPresets)}
          >
            Presets
          </button>
          <button
            className="clear-button"
            onClick={handleClearAll}
            disabled={!query && filters.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="search-content">
        <div className="search-main">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={executeSearch}
            loading={loading}
          />

          {showFilters && (
            <FilterBuilder
              filters={filters}
              onFiltersChange={handleFiltersChange}
              resultTypes={resultTypes}
              onResultTypesChange={handleResultTypesChange}
            />
          )}

          {showPresets && (
            <FilterPresets
              onPresetApply={handlePresetApply}
              onClose={() => setShowPresets(false)}
              currentQuery={{
                filters,
                sortBy,
                sortOrder,
                resultTypes
              }}
            />
          )}

          <div className="search-results-header">
            <div className="results-info">
              {loading ? (
                <span>Searching...</span>
              ) : (
                <span>
                  {totalResults > 0
                    ? `${totalResults} result${totalResults !== 1 ? 's' : ''} found`
                    : 'No results found'
                  }
                </span>
              )}
            </div>

            <div className="sort-controls">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
              >
                <option value={SORT_OPTIONS.RELEVANCE}>Relevance</option>
                <option value={SORT_OPTIONS.NAME}>Name</option>
                <option value={SORT_OPTIONS.DATE}>Date</option>
                <option value={SORT_OPTIONS.TYPE}>Type</option>
                <option value={SORT_OPTIONS.POPULATION}>Population</option>
                <option value={SORT_OPTIONS.IMPORTANCE}>Importance</option>
              </select>

              <button
                className="sort-order-button"
                onClick={() => handleSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {error && (
            <div className="search-error">
              <p>Error: {error}</p>
            </div>
          )}

          <SearchResults
            results={results}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
