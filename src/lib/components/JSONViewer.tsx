import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import { JSONViewerProps, JSONViewerHandle } from '../types';
import { useExpandedPaths } from '../hooks/useExpandedPaths';
import { useSearch } from '../hooks/useSearch';
import { getThemeClass, safeParse, getValueByPath, setValueByPath } from '../utils';
import Controls from './Controls';
import TreeNode from './TreeNode';

const JSONViewer = forwardRef<JSONViewerHandle, JSONViewerProps>(
  (
    {
      data,
      config = {},
      onSelect,
      onChange,
      onError,
      renderValue,
      renderKey,
      className = '',
      style,
    },
    ref
  ) => {
    const {
    editable = false,
    showTypes = true,
    theme = 'light',
    maxRenderDepth = 6,
    maxNodes = 2000,
    rootName = 'root',
  } = config;
    // Parse data if it's a string
    const parsedData = useMemo(() => {
      if (typeof data === 'string') {
        const result = safeParse(data);
        if (!result.success && onError) {
          onError(new Error(`Failed to parse JSON: ${result.error}`));
        }
        return result.data || data;
      }
      return data;
    }, [data, onError]);

    // Internal state
    const [internalData, setInternalData] = useState(parsedData);
    const [searchQuery, setSearchQuery] = useState('');

    // Update internal data when prop changes
    useEffect(() => {
      setInternalData(parsedData);
    }, [parsedData]);

    // Hooks
    const {
      togglePath,
      expandAll,
      collapseAll,
      isExpanded,
      setExpandedPaths,
    } = useExpandedPaths(internalData, false, rootName);

    const { matchCount, getExpandedPathsForMatches } = useSearch(
      internalData,
      searchQuery,
      rootName
    );

    // Auto-expand paths for search matches
    useEffect(() => {
      if (searchQuery && matchCount > 0) {
        const expandedForMatches = getExpandedPathsForMatches();
        setExpandedPaths((prev: Set<string>) => new Set([...Array.from(prev), ...expandedForMatches]));
      }
    }, [searchQuery, matchCount, getExpandedPathsForMatches, setExpandedPaths]);

    // Handle search change
    const handleSearchChange = (query: string) => {
      setSearchQuery(query);
    };

    // Handle value change
    const handleChange = (path: string, oldValue: any, newValue: any) => {
      const updatedData = setValueByPath(internalData, path, newValue);
      setInternalData(updatedData);
      
      if (onChange) {
        onChange(path, oldValue, newValue);
      }
    };

    // Imperative API
    useImperativeHandle(ref, () => ({
      expandAll,
      collapseAll,
      search: (query: string) => setSearchQuery(query),
      get: (path: string) => getValueByPath(internalData, path),
      set: (path: string, value: any) => {
        const oldValue = getValueByPath(internalData, path);
        handleChange(path, oldValue, value);
      },
      toJSON: () => internalData,
    }));

    const themeClass = getThemeClass(theme);
    const containerClass = `jv-container ${themeClass} ${className}`.trim();

    return (
      <div className={containerClass} style={style}>
        <Controls
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          matchCount={matchCount}
        />
        <div className="jv-tree">
          <TreeNode
            value={internalData}
            path={rootName}
            depth={0}
            nodeKey={rootName}
            expanded={isExpanded(rootName)}
            editable={editable}
            showTypes={showTypes}
            onToggle={togglePath}
            onSelect={onSelect}
            onChange={handleChange}
            onError={onError}
            renderValue={renderValue}
            renderKey={renderKey}
            searchQuery={searchQuery}
            maxRenderDepth={maxRenderDepth}
            maxNodes={maxNodes}
            isExpanded={isExpanded}
          />
        </div>
      </div>
    );
  }
);

JSONViewer.displayName = 'JSONViewer';

export default JSONViewer;