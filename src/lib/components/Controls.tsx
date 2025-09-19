import React, { memo, useState, useCallback } from 'react';
import { ControlsProps } from '../types';
import { useDebounce } from '../hooks/useDebounce';

const Controls: React.FC<ControlsProps> = memo(({
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  matchCount,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounce search query để tránh re-render liên tục
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  
  // Sync debounced value với parent component
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchQuery, onSearchChange]);

  // Sync external search query changes
  React.useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery, localSearchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="jv-controls">
      <div className="jv-search-container">
        <input
          type="text"
          className="jv-search-input"
          placeholder="Search keys and values..."
          value={localSearchQuery}
          onChange={handleSearchChange}
        />
        
        {localSearchQuery && (
          <button
            type="button"
            className="jv-search-clear"
            onClick={handleClearSearch}
            title="Clear search"
          >
            ✕
          </button>
        )}
        
        {matchCount !== undefined && debouncedSearchQuery && (
          <span className="jv-match-count">
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </span>
        )}
      </div>
      
      <div className="jv-button-group">
        <button
          type="button"
          className="jv-button"
          onClick={onExpandAll}
          title="Expand all nodes"
        >
          Expand All
        </button>
        
        <button
          type="button"
          className="jv-button"
          onClick={onCollapseAll}
          title="Collapse all nodes"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison để tránh unnecessary re-renders
  return (
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.matchCount === nextProps.matchCount &&
    prevProps.onSearchChange === nextProps.onSearchChange &&
    prevProps.onExpandAll === nextProps.onExpandAll &&
    prevProps.onCollapseAll === nextProps.onCollapseAll
  );
});

Controls.displayName = 'Controls';

export default Controls;