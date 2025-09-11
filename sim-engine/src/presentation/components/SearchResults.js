import React from 'react';
import './SearchResults.css';

const SearchResults = ({ results, loading, currentPage, totalPages, onPageChange }) => {
  if (loading) {
    return (
      <div className="search-results">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  const renderHighlights = (highlights) => {
    if (!highlights || highlights.length === 0) return null;

    return (
      <div className="result-highlights">
        {highlights.slice(0, 3).map((highlight, index) => (
          <span key={index} className="highlight">
            {highlight}
          </span>
        ))}
      </div>
    );
  };

  const renderMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    const metadataEntries = Object.entries(metadata).filter(([key]) => key !== 'type');

    if (metadataEntries.length === 0) return null;

    return (
      <div className="result-metadata">
        {metadataEntries.map(([key, value]) => (
          <span key={key} className="metadata-item">
            <strong>{key}:</strong> {String(value)}
          </span>
        ))}
      </div>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'character':
        return '👤';
      case 'settlement':
        return '🏘️';
      case 'event':
        return '📅';
      case 'relationship':
        return '🤝';
      case 'interaction':
        return '💬';
      default:
        return '📄';
    }
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(0) + '%';
  };

  return (
    <div className="search-results">
      <div className="results-list">
        {results.map((result) => (
          <div key={result.id} className="result-item">
            <div className="result-header">
              <div className="result-type-icon">
                {getTypeIcon(result.type)}
              </div>
              <div className="result-title-section">
                <h3 className="result-title">{result.title}</h3>
                <div className="result-meta-info">
                  <span className="result-type">{result.type}</span>
                  <span className="result-score">Relevance: {formatScore(result.score)}</span>
                  <span className="result-date">
                    {new Date(result.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {result.description && (
              <p className="result-description">{result.description}</p>
            )}

            {renderHighlights(result.highlights)}

            {renderMetadata(result.metadata)}

            <div className="result-actions">
              <button className="view-details-button">
                View Details
              </button>
              <button className="add-to-selection-button">
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export { SearchResults };
