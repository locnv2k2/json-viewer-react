import { useState, useCallback, useMemo } from 'react';
import { isExpandable } from '../utils';

export interface UseExpandedPathsReturn {
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (path: string) => boolean;
  setExpandedPaths: (paths: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

export function useExpandedPaths(
  data: any,
  initialCollapsed?: boolean | number,
  rootName: string = 'root'
): UseExpandedPathsReturn {
  const initialPaths = useMemo(() => {
    const paths = new Set<string>();
    
    if (initialCollapsed === false) {
      // Expand all by default
      collectAllPaths(data, rootName, paths);
    } else if (typeof initialCollapsed === 'number') {
      // Expand to specific depth
      collectPathsToDepth(data, rootName, paths, initialCollapsed, 0);
    }
    // If initialCollapsed === true, start with empty set (all collapsed)
    
    return paths;
  }, [data, initialCollapsed, rootName]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(initialPaths);

  const togglePath = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const newPaths = new Set(prev);
      if (newPaths.has(path)) {
        newPaths.delete(path);
        // Also collapse all children
        for (const p of newPaths) {
          if (p.startsWith(path + '.') || p.startsWith(path + '[')) {
            newPaths.delete(p);
          }
        }
      } else {
        newPaths.add(path);
      }
      return newPaths;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allPaths = new Set<string>();
    collectAllPaths(data, rootName, allPaths);
    setExpandedPaths(allPaths);
  }, [data, rootName]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const isExpanded = useCallback((path: string) => {
    return expandedPaths.has(path);
  }, [expandedPaths]);

  return {
    expandedPaths,
    togglePath,
    expandAll,
    collapseAll,
    isExpanded,
    setExpandedPaths,
  };
}

function collectAllPaths(
  value: any,
  currentPath: string,
  paths: Set<string>,
  maxDepth: number = 10,
  currentDepth: number = 0
): void {
  if (currentDepth >= maxDepth || !isExpandable(value)) {
    return;
  }

  paths.add(currentPath);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const childPath = `${currentPath}[${index}]`;
      collectAllPaths(item, childPath, paths, maxDepth, currentDepth + 1);
    });
  } else if (value !== null && typeof value === 'object') {
    Object.keys(value).forEach(key => {
      const childPath = currentPath === 'root' ? key : `${currentPath}.${key}`;
      collectAllPaths(value[key], childPath, paths, maxDepth, currentDepth + 1);
    });
  }
}

function collectPathsToDepth(
  value: any,
  currentPath: string,
  paths: Set<string>,
  targetDepth: number,
  currentDepth: number
): void {
  if (currentDepth >= targetDepth || !isExpandable(value)) {
    return;
  }

  paths.add(currentPath);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const childPath = `${currentPath}[${index}]`;
      collectPathsToDepth(item, childPath, paths, targetDepth, currentDepth + 1);
    });
  } else if (value !== null && typeof value === 'object') {
    Object.keys(value).forEach(key => {
      const childPath = currentPath === 'root' ? key : `${currentPath}.${key}`;
      collectPathsToDepth(value[key], childPath, paths, targetDepth, currentDepth + 1);
    });
  }
}