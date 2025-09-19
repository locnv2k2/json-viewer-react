import { forwardRef, useImperativeHandle, useState, useEffect, useMemo, useCallback } from 'react';
import { JSONViewerProps, JSONViewerHandle } from '../types';
import { useExpandedPaths } from '../hooks/useExpandedPaths';
import { useSearch } from '../hooks/useSearch';
import { useDebounce } from '../hooks/useDebounce';
import { getThemeClass, safeParse, getValueByPath, setValueByPath } from '../utils';
import Controls from './Controls';
import VirtualizedTreeNode from './VirtualizedTreeNode';

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
      enableVirtualization = false, // New prop for enabling virtualization
    } = config;

    // Parse data if it's a string - memoized để tránh re-parse
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
    
    // Debounce search query để tránh re-render liên tục khi user typing
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
      debouncedSearchQuery, // Use debounced query
      rootName
    );

    // Auto-expand paths for search matches - memoized để tránh re-calculation
    const expandedPathsForMatches = useMemo(() => {
      if (debouncedSearchQuery && matchCount > 0) {
        return getExpandedPathsForMatches();
      }
      return new Set<string>();
    }, [debouncedSearchQuery, matchCount, getExpandedPathsForMatches]);

    // Apply expanded paths for search matches
    useEffect(() => {
      if (expandedPathsForMatches.size > 0) {
        setExpandedPaths((prev: Set<string>) => new Set([...Array.from(prev), ...expandedPathsForMatches]));
      }
    }, [expandedPathsForMatches, setExpandedPaths]);

    // Handle search change - memoized callback
    const handleSearchChange = useCallback((query: string) => {
      setSearchQuery(query);
    }, []);

    // Handle value change - memoized callback
    const handleChange = useCallback((path: string, oldValue: any, newValue: any) => {
      const updatedData = setValueByPath(internalData, path, newValue);
      setInternalData(updatedData);
      
      if (onChange) {
        onChange(path, oldValue, newValue);
      }
    }, [internalData, onChange]);

    // Memoized callbacks for controls
    const handleExpandAll = useCallback(() => {
      expandAll();
    }, [expandAll]);

    const handleCollapseAll = useCallback(() => {
      collapseAll();
    }, [collapseAll]);

    // Imperative API - memoized để tránh re-creation
    const imperativeAPI = useMemo(() => ({
      expandAll: handleExpandAll,
      collapseAll: handleCollapseAll,
      search: (query: string) => setSearchQuery(query),
      get: (path: string) => getValueByPath(internalData, path),
      set: (path: string, value: any) => {
        const oldValue = getValueByPath(internalData, path);
        handleChange(path, oldValue, value);
      },
      toJSON: () => internalData,
      enableVirtualization: (enabled: boolean) => {
        // This would be implemented if we had dynamic virtualization control
        console.log('Virtualization control:', enabled);
      },
      getPerformanceStats: () => ({
        totalNodes: matchCount || 0,
        renderedNodes: matchCount || 0,
        searchMatches: matchCount || 0,
        renderTime: 0,
        memoryUsage: 0,
      }),
    }), [handleExpandAll, handleCollapseAll, internalData, handleChange, matchCount]);

    useImperativeHandle(ref, () => imperativeAPI, [imperativeAPI]);

    // Memoized theme class
    const themeClass = useMemo(() => getThemeClass(theme), [theme]);
    const containerClass = useMemo(() => `jv-container ${themeClass} ${className}`.trim(), [themeClass, className]);

    // Memoized tree node props để tránh unnecessary re-renders
    const treeNodeProps = useMemo(() => ({
      value: internalData,
      path: rootName,
      depth: 0,
      nodeKey: rootName,
      expanded: isExpanded(rootName),
      editable,
      showTypes,
      onToggle: togglePath,
      onSelect,
      onChange: handleChange,
      onError,
      renderValue,
      renderKey,
      searchQuery: debouncedSearchQuery,
      maxRenderDepth,
      maxNodes,
      isExpanded,
      isVirtual: enableVirtualization,
    }), [
      internalData,
      rootName,
      isExpanded,
      editable,
      showTypes,
      togglePath,
      onSelect,
      handleChange,
      onError,
      renderValue,
      renderKey,
      debouncedSearchQuery,
      maxRenderDepth,
      maxNodes,
      enableVirtualization,
    ]);

    return (
      <div className={containerClass} style={style}>
        <Controls
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          matchCount={matchCount}
        />
        <div className="jv-tree">
          <VirtualizedTreeNode {...treeNodeProps} />
        </div>
      </div>
    );
  }
);

JSONViewer.displayName = 'JSONViewer';

export default JSONViewer;