import React, { useState } from 'react';
import type { Category } from '../types';

interface SearchSectionProps {
  categories: Category[];
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  onSearch: (query: string, filters: { budget: string; platform: string }) => void;
  isLoading: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
  onSearch,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [platform, setPlatform] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const exampleSearches = [
    'create a presentation',
    'edit a video',
    'write marketing content',
    'build a website',
    'analyze data',
    'generate images',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, { budget, platform });
  };

  const handleExampleClick = (searchVal: string) => {
    setQuery(searchVal);
    onSearch(searchVal, { budget, platform });
  };

  const handleCategoryClick = (categorySlug: string | null) => {
    setActiveCategory(categorySlug);
    // Reset plain text search when switching categories directly
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    setBudget('');
    setPlatform('');
    setActiveCategory(null);
    onSearch('', { budget: '', platform: '' });
  };

  return (
    <div className="search-section glass-panel">
      <div className="search-hero">
        <h1 className="search-title">
          Find the right <span className="highlight-text">AI tool</span> for any task
        </h1>
        <p className="search-subtitle">
          Describe what you want to do in plain language—or browse by tool name, budget, or platform.
        </p>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Describe your task (e.g., 'write a blog post and design a logo', 'edit shorts')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" className="clear-btn" onClick={handleClear}>
                ✕
              </button>
            )}
            <button type="submit" className="btn btn-primary search-submit-btn" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Explore'}
            </button>
          </div>

          <div className="search-toggles">
            <button
              type="button"
              className={`btn btn-secondary btn-sm toggle-filters-btn ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              ⚙️ {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            {(query || budget || platform || activeCategory) && (
              <button type="button" className="btn btn-secondary btn-sm clear-all-btn" onClick={handleClear}>
                Reset Search
              </button>
            )}
          </div>

          {showAdvanced && (
            <div className="advanced-filters animate-fade-in">
              <div className="filter-group-row">
                <div className="filter-item">
                  <label className="form-label">Budget Limit</label>
                  <select
                    className="form-control"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="">Any Budget</option>
                    <option value="free">Free Only</option>
                    <option value="freemium">Freemium (Free tier available)</option>
                    <option value="paid">Paid Only</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label className="form-label">Deployment Platform</label>
                  <select
                    className="form-control"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="">Any Platform</option>
                    <option value="Web">Web-based</option>
                    <option value="Desktop">Desktop App</option>
                    <option value="Mobile">Mobile App</option>
                    <option value="Extension">Browser Extension</option>
                    <option value="API">Developer API</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="example-searches">
          <span className="examples-label">Try searching:</span>
          <div className="examples-list">
            {exampleSearches.map((example, index) => (
              <button
                key={index}
                className="example-chip"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="category-scroll-container">
        <button
          className={`category-chip ${activeCategory === null ? 'active' : ''}`}
          onClick={() => handleCategoryClick(null)}
        >
          🌐 All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.slug)}
          >
            <span className="category-emoji">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};
