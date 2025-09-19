// Main exports
export { default as JSONViewer } from './components/JSONViewer';

// Component exports
export { default as TreeNode } from './components/TreeNode';
export { default as Controls } from './components/Controls';
export { default as InlineEditor } from './components/InlineEditor';

// Hook exports
export { useExpandedPaths } from './hooks/useExpandedPaths';
export { useSearch } from './hooks/useSearch';

// Type exports
export type {
  JSONViewerProps,
  JSONViewerHandle,
  NodeMeta,
  JSONPath,
  Theme,
  JSONValue,
  JSONObject,
  JSONArray,
  RenderOptions,
  SearchResult,
  EditState,
  ViewerState,
  SelectHandler,
  ChangeHandler,
  ErrorHandler,
  SearchMatchHandler,
  ViewerConfig,
  TreeNodeProps,
  ControlsProps,
  InlineEditorProps,
} from './types';

// Utility exports
export {
  buildPath,
  getValueByPath,
  setValueByPath,
  parsePath,
  safeParse,
  getValueType,
  isExpandable,
  getChildrenCount,
  searchInValue,
  searchInKey,
  copyToClipboard,
  validateMaxDepth,
  validateMaxNodes,
  getThemeClass,
  getAriaLabel,
} from './utils';

// CSS import
import './styles/base.css';