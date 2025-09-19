import { renderHook, act } from '@testing-library/react';
import { useExpandedPaths } from '../hooks/useExpandedPaths';
import { useSearch } from '../hooks/useSearch';

describe('Hooks', () => {
  describe('useExpandedPaths', () => {
    it('should initialize with default expanded paths', () => {
      const { result } = renderHook(() => useExpandedPaths(['root']));
      
      expect(result.current.isExpanded('root')).toBe(true);
      expect(result.current.isExpanded('root.child')).toBe(false);
    });

    it('should toggle path expansion', () => {
      const { result } = renderHook(() => useExpandedPaths([]));
      
      act(() => {
        result.current.togglePath('root.child');
      });
      
      expect(result.current.isExpanded('root.child')).toBe(true);
      
      act(() => {
        result.current.togglePath('root.child');
      });
      
      expect(result.current.isExpanded('root.child')).toBe(false);
    });

    it('should expand all paths', () => {
      const testData = {
        level1: {
          level2: {
            level3: 'value'
          },
          array: [1, 2, 3]
        }
      };

      const { result } = renderHook(() => useExpandedPaths([]));
      
      act(() => {
        result.current.expandAll(testData, 'root');
      });
      
      expect(result.current.isExpanded('root')).toBe(true);
      expect(result.current.isExpanded('root.level1')).toBe(true);
      expect(result.current.isExpanded('root.level1.level2')).toBe(true);
      expect(result.current.isExpanded('root.level1.array')).toBe(true);
    });

    it('should collapse all paths', () => {
      const { result } = renderHook(() => useExpandedPaths(['root', 'root.child', 'root.child.nested']));
      
      act(() => {
        result.current.collapseAll();
      });
      
      expect(result.current.isExpanded('root')).toBe(false);
      expect(result.current.isExpanded('root.child')).toBe(false);
      expect(result.current.isExpanded('root.child.nested')).toBe(false);
    });

    it('should respect max depth when expanding all', () => {
      const testData = {
        level1: {
          level2: {
            level3: {
              level4: 'value'
            }
          }
        }
      };

      const { result } = renderHook(() => useExpandedPaths([]));
      
      act(() => {
        result.current.expandAll(testData, 'root', 2);
      });
      
      expect(result.current.isExpanded('root')).toBe(true);
      expect(result.current.isExpanded('root.level1')).toBe(true);
      expect(result.current.isExpanded('root.level1.level2')).toBe(true);
      expect(result.current.isExpanded('root.level1.level2.level3')).toBe(false);
    });
  });

  describe('useSearch', () => {
    const testData = {
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'New York'
      },
      hobbies: ['reading', 'swimming', 'coding']
    };

    it('should initialize with empty search', () => {
      const { result } = renderHook(() => useSearch(testData, '', 'root'));
      
      expect(result.current.matchCount).toBe(0);
      expect(result.current.shouldHighlight('root.name', 'John Doe', 'name')).toBe(false);
    });

    it('should find matches in values', () => {
      const { result } = renderHook(() => useSearch(testData, 'John', 'root'));
      
      expect(result.current.matchCount).toBeGreaterThan(0);
      expect(result.current.shouldHighlight('root.name', 'John Doe', 'name')).toBe(true);
    });

    it('should find matches in keys', () => {
      const { result } = renderHook(() => useSearch(testData, 'address', 'root'));
      
      expect(result.current.shouldHighlight('root.address', testData.address, 'address')).toBe(true);
    });

    it('should find matches in nested values', () => {
      const { result } = renderHook(() => useSearch(testData, 'Main', 'root'));
      
      expect(result.current.shouldHighlight('root.address.street', '123 Main St', 'street')).toBe(true);
    });

    it('should find matches in array items', () => {
      const { result } = renderHook(() => useSearch(testData, 'coding', 'root'));
      
      expect(result.current.shouldHighlight('root.hobbies[2]', 'coding', 2)).toBe(true);
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useSearch(testData, 'JOHN', 'root'));
      
      expect(result.current.shouldHighlight('root.name', 'John Doe', 'name')).toBe(true);
    });

    it('should clear matches when search is empty', () => {
      const { result: resultWithSearch } = renderHook(() => useSearch(testData, 'John', 'root'));
      const { result: resultEmpty } = renderHook(() => useSearch(testData, '', 'root'));
      
      expect(resultWithSearch.current.matchCount).toBeGreaterThan(0);
      expect(resultEmpty.current.matchCount).toBe(0);
      expect(resultEmpty.current.shouldHighlight('root.name', 'John Doe', 'name')).toBe(false);
    });

    it('should provide expanded paths for matches', () => {
      const { result } = renderHook(() => useSearch(testData, 'Main', 'root'));
      
      const expandedPaths = result.current.getExpandedPathsForMatches();
      expect(expandedPaths.has('root.address')).toBe(true);
    });
  });
});