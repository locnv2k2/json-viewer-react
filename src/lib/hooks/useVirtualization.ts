import { useState, useEffect, useRef, useMemo } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export interface UseVirtualizationOptions {
  itemCount: number;
  itemSize: number;
  containerHeight: number;
  overscan?: number;
}

export interface UseVirtualizationResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollElementRef: React.RefObject<HTMLDivElement>;
  measureElement: (index: number, element: HTMLElement) => void;
}

export function useVirtualization({
  itemCount,
  itemSize,
  containerHeight,
  overscan = 5,
}: UseVirtualizationOptions): UseVirtualizationResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredSizes, setMeasuredSizes] = useState<Map<number, number>>(new Map());
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate virtual items
  const virtualItems = useMemo(() => {
    if (itemCount === 0) return [];

    const items: VirtualItem[] = [];
    let start = 0;

    for (let i = 0; i < itemCount; i++) {
      const size = measuredSizes.get(i) || itemSize;
      const end = start + size;

      items.push({
        index: i,
        start,
        size,
        end,
      });

      start = end;
    }

    return items;
  }, [itemCount, itemSize, measuredSizes]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (virtualItems.length === 0) return { start: 0, end: 0 };

    const viewportStart = scrollTop;
    const viewportEnd = scrollTop + containerHeight;

    let startIndex = 0;
    let endIndex = virtualItems.length - 1;

    // Find start index
    for (let i = 0; i < virtualItems.length; i++) {
      if (virtualItems[i].end > viewportStart) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    for (let i = startIndex; i < virtualItems.length; i++) {
      if (virtualItems[i].start > viewportEnd) {
        endIndex = Math.min(virtualItems.length - 1, i + overscan);
        break;
      }
    }

    return { start: startIndex, end: endIndex };
  }, [virtualItems, scrollTop, containerHeight, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return virtualItems.slice(visibleRange.start, visibleRange.end + 1);
  }, [virtualItems, visibleRange]);

  // Total size
  const totalSize = useMemo(() => {
    return virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].end : 0;
  }, [virtualItems]);

  // Handle scroll
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleScroll = () => {
      setScrollTop(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  // Measure element size
  const measureElement = (index: number, element: HTMLElement) => {
    const height = element.getBoundingClientRect().height;
    setMeasuredSizes(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  };

  return {
    virtualItems: visibleItems,
    totalSize,
    scrollElementRef,
    measureElement,
  };
}