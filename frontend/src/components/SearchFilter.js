import React, { useState } from 'react';

export default function SearchFilter({ 
  onSearch, 
  onCategoryFilter, 
  categories = [],
  placeholder = "Search food items..."
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onCategoryFilter(value === 'all' ? '' : value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="bg-light p-3 rounded mb-4">
      <div className="row g-3">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search food items"
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.CategoryName}>
                {category.CategoryName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <small className="text-muted">
          {searchTerm && `Searching for: "${searchTerm}"`}
          {selectedCategory !== 'all' && ` | Category: ${selectedCategory}`}
        </small>
      </div>
    </div>
  );
}
