// Main exports
export { default as JSONViewer } from './components/JSONViewer';

// Component exports
export { default as TreeNode } from './components/TreeNode';
export { default as VirtualizedTreeNode } from './components/VirtualizedTreeNode';
export { default as Controls } from './components/Controls';
export { default as InlineEditor } from './components/InlineEditor';

// Hook exports
export { useExpandedPaths } from './hooks/useExpandedPaths';
export { useSearch } from './hooks/useSearch';
export { useDebounce, useDebouncedCallback } from './hooks/useDebounce';
export { useVirtualization } from './hooks/useVirtualization';

// Utility exports
export * from './utils';

// Type exports
export type {
  JSONValue,
  JSONObject,
  JSONArray,
  JSONPath,
  Theme,
  NodeMeta,
  ViewerConfig,
  PerformanceConfig,
  JSONViewerProps,
  JSONViewerHandle,
  TreeNodeProps,
  VirtualizedTreeNodeProps,
  ControlsProps,
  InlineEditorProps,
  SelectHandler,
  ChangeHandler,
  ErrorHandler,
  SearchMatchHandler,
  RenderOptions,
  SearchResult,
  EditState,
  ViewerState,
  PerformanceStats,
  VirtualItem,
  VirtualizationOptions,
  VirtualizationResult,
} from './types';

// CSS import
import './styles/base.css';