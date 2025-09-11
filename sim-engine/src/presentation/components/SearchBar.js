import React from 'react';
import './SearchBar.css';

const SearchBar = ({ query, onQueryChange, onSearch, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search characters, settlements, events, relationships..."
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <span className="search-spinner">⟳</span>
            ) : (
              <span className="search-icon">🔍</span>
            )}
          </button>
        </div>
      </form>

      <div className="search-hints">
        <span className="hint-text">
          Try: "king", "battle of", "family", or use filters for advanced search
        </span>
      </div>
    </div>
  );
};

export { SearchBar };
