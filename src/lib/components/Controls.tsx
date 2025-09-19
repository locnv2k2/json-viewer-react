import React from 'react';
import { ControlsProps } from '../types';

const Controls: React.FC<ControlsProps> = ({
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  matchCount,
}) => {
  return (
    <div className="jv-controls">
      <input
        type="text"
        className="jv-search-input"
        placeholder="Search keys and values..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      
      {matchCount !== undefined && searchQuery && (
        <span className="jv-match-count">
          {matchCount} match{matchCount !== 1 ? 'es' : ''}
        </span>
      )}
      
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
  );
};

export default Controls;