import { useMemo } from 'react';
import { searchInValue, searchInKey, isExpandable } from '../utils';

export interface UseSearchReturn {
  matchedPaths: Set<string>;
  matchCount: number;
  shouldHighlight: (path: string, value: any, key?: string | number) => boolean;
  getExpandedPathsForMatches: () => Set<string>;
}

export function useSearch(
  data: any,
  searchQuery: string,
  rootName: string = 'root'
): UseSearchReturn {
  const searchResult = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        matchedPaths: new Set<string>(),
        matchCount: 0,
        expandedPathsForMatches: new Set<string>(),
      };
    }

    const matchedPaths = new Set<string>();
    const expandedPathsForMatches = new Set<string>();
    let matchCount = 0;

    function searchRecursive(
      value: any,
      currentPath: string,
      key?: string | number
    ): void {
      // Check if key matches
      const keyMatches = key !== undefined && searchInKey(key, searchQuery);
      
      // Check if value matches
      const valueMatches = searchInValue(value, searchQuery);

      if (keyMatches || valueMatches) {
        matchedPaths.add(currentPath);
        matchCount++;
        
        // Add all parent paths to expanded paths
        addParentPaths(currentPath, expandedPathsForMatches, rootName);
      }

      // Recursively search children
      if (isExpandable(value)) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            const childPath = `${currentPath}[${index}]`;
            searchRecursive(item, childPath, index);
          });
        } else if (value !== null && typeof value === 'object') {
          Object.keys(value).forEach(objKey => {
            const childPath = currentPath === rootName ? objKey : `${currentPath}.${objKey}`;
            searchRecursive(value[objKey], childPath, objKey);
          });
        }
      }
    }

    searchRecursive(data, rootName);

    return {
      matchedPaths,
      matchCount,
      expandedPathsForMatches,
    };
  }, [data, searchQuery, rootName]);

  const shouldHighlight = (_path: string, value: any, key?: string | number): boolean => {
    if (!searchQuery.trim()) return false;
    
    const keyMatches = key !== undefined && searchInKey(key, searchQuery);
    const valueMatches = searchInValue(value, searchQuery);
    
    return keyMatches || valueMatches;
  };

  const getExpandedPathsForMatches = (): Set<string> => {
    return searchResult.expandedPathsForMatches;
  };

  return {
    matchedPaths: searchResult.matchedPaths,
    matchCount: searchResult.matchCount,
    shouldHighlight,
    getExpandedPathsForMatches,
  };
}

function addParentPaths(path: string, expandedPaths: Set<string>, rootName: string): void {
  if (path === rootName) return;
  
  expandedPaths.add(path);
  
  // Find parent path
  const lastDotIndex = path.lastIndexOf('.');
  const lastBracketIndex = path.lastIndexOf('[');
  
  let parentPath: string;
  
  if (lastDotIndex > lastBracketIndex) {
    // Parent is accessed via dot notation
    parentPath = path.substring(0, lastDotIndex);
  } else if (lastBracketIndex > -1) {
    // Parent is accessed via bracket notation
    parentPath = path.substring(0, lastBracketIndex);
  } else {
    // Direct child of root
    parentPath = rootName;
  }
  
  if (parentPath && parentPath !== rootName) {
    addParentPaths(parentPath, expandedPaths, rootName);
  } else if (parentPath === rootName) {
    expandedPaths.add(rootName);
  }
}