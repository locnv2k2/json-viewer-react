import React from 'react';

// Node metadata interface
export interface NodeMeta {
  path: string; // 'root.foo[0].bar'
  depth: number;
  key: string | number;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  childrenCount?: number;
}

// JSON path type
export type JSONPath = string;

// Theme configuration
export type Theme = 'light' | 'dark' | string;

// Value types
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {
  // Array interface with JSON values
}

// Render options for custom renderers
export interface RenderOptions {
  path: string;
  depth: number;
  expanded: boolean;
  editable: boolean;
}

// Search result interface
export interface SearchResult {
  path: string;
  matchType: 'key' | 'value';
  matchText: string;
}

// Edit state interface
export interface EditState {
  path: string;
  originalValue: any;
  currentValue: string;
  isValid: boolean;
  error?: string;
}

// Component state interfaces
export interface ViewerState {
  expandedPaths: Set<string>;
  searchQuery: string;
  editStates: Map<string, EditState>;
  data: any;
}

// Event handler types
export type SelectHandler = (path: string, node: NodeMeta) => void;
export type ChangeHandler = (path: string, oldValue: any, newValue: any) => void;
export type ErrorHandler = (error: Error) => void;
export type SearchMatchHandler = (count: number) => void;

// Performance configuration
export interface PerformanceConfig {
  enableVirtualization?: boolean;
  virtualItemHeight?: number;
  virtualOverscan?: number;
  lazyLoadThreshold?: number;
  debounceDelay?: number;
  maxInitialRender?: number;
}

// Configuration types
export interface ViewerConfig extends PerformanceConfig {
  editable: boolean;
  showTypes: boolean;
  theme: Theme;
  maxRenderDepth: number;
  maxNodes: number;
  rootName: string;
  collapsed: boolean | number;
  search: string;
  showControls: boolean;
  onSearchMatchCount?: SearchMatchHandler;
}

// JSONViewer Component Props
export interface JSONViewerProps {
  data: JSONValue;
  config?: Partial<ViewerConfig>;
  onSelect?: (path: string, meta: NodeMeta) => void;
  onChange?: (path: string, oldValue: JSONValue, newValue: JSONValue) => void;
  onError?: (error: Error) => void;
  renderValue?: (value: JSONValue, path: string) => React.ReactNode;
  renderKey?: (key: string, path: string) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  matchCount?: number;
}

export interface TreeNodeProps {
  value: JSONValue;
  path: string;
  depth: number;
  nodeKey: string | number;
  expanded: boolean;
  editable?: boolean;
  showTypes?: boolean;
  onToggle: (path: string) => void;
  onSelect?: (path: string, meta: NodeMeta) => void;
  onChange?: (path: string, oldValue: JSONValue, newValue: JSONValue) => void;
  onError?: (error: Error) => void;
  renderValue?: (value: JSONValue, path: string) => React.ReactNode;
  renderKey?: (key: string, path: string) => React.ReactNode;
  searchQuery?: string;
  maxRenderDepth?: number;
  maxNodes: number;
  isExpanded?: (path: string) => boolean;
}

// Extended TreeNode props for virtualization
export interface VirtualizedTreeNodeProps extends TreeNodeProps {
  virtualIndex?: number;
  onMeasure?: (index: number, element: HTMLElement) => void;
  isVirtual?: boolean;
  lazyLoad?: boolean;
}

export interface InlineEditorProps {
  value: JSONValue;
  path: string;
  onSave: (newValue: JSONValue) => void;
  onCancel: () => void;
  onError?: (error: Error) => void;
}

export interface JSONViewerHandle {
  expandAll: () => void;
  collapseAll: () => void;
  search: (query: string) => void;
  get: (path: string) => JSONValue;
  set: (path: string, value: JSONValue) => void;
  toJSON: () => JSONValue;
  // Performance methods
  enableVirtualization: (enabled: boolean) => void;
  getPerformanceStats: () => PerformanceStats;
}

// Performance monitoring
export interface PerformanceStats {
  totalNodes: number;
  renderedNodes: number;
  searchMatches: number;
  renderTime: number;
  memoryUsage?: number;
}

// Virtualization types
export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export interface VirtualizationOptions {
  itemCount: number;
  itemSize: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualizationResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollElementRef: React.RefObject<HTMLDivElement>;
  measureElement: (index: number, element: HTMLElement) => void;
}