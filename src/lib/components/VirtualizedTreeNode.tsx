import React, { memo, useRef, useEffect, useMemo } from 'react';
import { TreeNodeProps } from '../types';
import {
  getValueType,
  isExpandable,
  getChildrenCount,
  buildPath,
  copyToClipboard,
  getAriaLabel,
  validateMaxDepth,
  searchInValue,
  searchInKey,
} from '../utils';
import InlineEditor from './InlineEditor';

interface VirtualizedTreeNodeProps extends TreeNodeProps {
  virtualIndex?: number;
  onMeasure?: (index: number, element: HTMLElement) => void;
  isVirtual?: boolean;
}

const VirtualizedTreeNode: React.FC<VirtualizedTreeNodeProps> = memo(({
  value,
  path,
  depth,
  nodeKey,
  expanded,
  editable,
  showTypes,
  onToggle,
  onSelect,
  onChange,
  onError,
  renderValue,
  renderKey,
  searchQuery,
  maxRenderDepth,
  maxNodes,
  isExpanded,
  virtualIndex,
  onMeasure,
  isVirtual = false,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // Measure element for virtualization
  useEffect(() => {
    if (isVirtual && virtualIndex !== undefined && onMeasure && nodeRef.current) {
      onMeasure(virtualIndex, nodeRef.current);
    }
  }, [isVirtual, virtualIndex, onMeasure]);

  const valueType = getValueType(value);
  const canExpand = isExpandable(value);
  const childrenCount = getChildrenCount(value);
  const canRenderChildren = validateMaxDepth(depth, maxRenderDepth || 10);
  
  // Check if this node or its key matches search
  const keyMatches = useMemo(() => searchInKey(nodeKey, searchQuery || ''), [nodeKey, searchQuery]);
  const valueMatches = useMemo(() => searchInValue(value, searchQuery || ''), [value, searchQuery]);
  const shouldHighlight = keyMatches || valueMatches;

  // Handle node click
  const handleNodeClick = React.useCallback(() => {
    if (canExpand) {
      onToggle(path);
    }
    
    if (onSelect) {
      onSelect(path, {
        path,
        depth,
        key: nodeKey,
        type: valueType,
        childrenCount,
      });
    }
  }, [canExpand, onToggle, path, onSelect, depth, nodeKey, valueType, childrenCount]);

  // Handle copy value
  const handleCopyValue = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const textToCopy = typeof value === 'string' ? value : JSON.stringify(value);
      await copyToClipboard(textToCopy);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  }, [value, onError]);

  // Handle copy path
  const handleCopyPath = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyToClipboard(path);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  }, [path, onError]);

  // Handle edit
  const handleEdit = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (editable && !canExpand) {
      setIsEditing(true);
    }
  }, [editable, canExpand]);

  // Handle save edit
  const handleSaveEdit = React.useCallback((newValue: any) => {
    setIsEditing(false);
    if (onChange) {
      onChange(path, value, newValue);
    }
  }, [onChange, path, value]);

  // Handle cancel edit
  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false);
  }, []);

  // Render key
  const renderNodeKey = React.useCallback(() => {
    if (renderKey) {
      return renderKey(String(nodeKey), path);
    }
    
    const keyContent = (
      <span className={`jv-key ${shouldHighlight && keyMatches ? 'jv-highlight' : ''}`}>
        {String(nodeKey)}
      </span>
    );
    
    return keyContent;
  }, [renderKey, nodeKey, path, shouldHighlight, keyMatches]);

  // Render value
  const renderNodeValue = React.useCallback(() => {
    if (isEditing) {
      return (
        <InlineEditor
          value={value}
          path={path}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onError={onError}
        />
      );
    }

    if (renderValue) {
      return renderValue(value, path);
    }

    let displayValue: string;
    let valueClass = `jv-value jv-${valueType}`;

    if (valueMatches && shouldHighlight) {
      valueClass += ' jv-highlight';
    }

    switch (valueType) {
      case 'string':
        displayValue = `"${value}"`;
        break;
      case 'null':
        displayValue = 'null';
        break;
      case 'object':
        displayValue = `{${childrenCount} ${childrenCount === 1 ? 'property' : 'properties'}}`;
        break;
      case 'array':
        displayValue = `[${childrenCount} ${childrenCount === 1 ? 'item' : 'items'}]`;
        break;
      default:
        displayValue = String(value);
    }

    return (
      <span className={valueClass}>
        {displayValue}
        {showTypes && (
          <span className="jv-type-badge">
            {valueType}
          </span>
        )}
      </span>
    );
  }, [isEditing, renderValue, value, path, handleSaveEdit, handleCancelEdit, onError, valueType, valueMatches, shouldHighlight, childrenCount, showTypes]);

  // Render children with lazy loading
  const renderChildren = React.useCallback(() => {
    if (!expanded || !canExpand || !canRenderChildren) {
      return null;
    }

    // For large objects/arrays, implement lazy loading
    const shouldLazyLoad = childrenCount > 100;
    
    if (shouldLazyLoad && !isVirtual) {
      return (
        <div className="jv-children">
          <div className="jv-node">
            <div className="jv-node-content">
              <div className="jv-indent" style={{ '--depth': depth + 1 } as React.CSSProperties} />
              <span className="jv-value jv-info">
                Loading {childrenCount} items... (Click to expand)
              </span>
            </div>
          </div>
        </div>
      );
    }

    const children: React.ReactNode[] = [];
    let currentNodeCount = 0;
    const maxNodesToRender = isVirtual ? maxNodes : Math.min(maxNodes, 50);

    if (Array.isArray(value)) {
      value.slice(0, maxNodesToRender).forEach((item, index) => {
        const childPath = buildPath(path, index);
        const childExpanded = isExpanded ? isExpanded(childPath) : false;
        
        children.push(
          <VirtualizedTreeNode
            key={childPath}
            value={item}
            path={childPath}
            depth={depth + 1}
            nodeKey={index}
            expanded={childExpanded}
            editable={editable}
            showTypes={showTypes}
            onToggle={onToggle}
            onSelect={onSelect}
            onChange={onChange}
            onError={onError}
            renderValue={renderValue}
            renderKey={renderKey}
            searchQuery={searchQuery}
            maxRenderDepth={maxRenderDepth}
            maxNodes={maxNodes}
            isExpanded={isExpanded}
            isVirtual={isVirtual}
          />
        );
        currentNodeCount++;
      });
    } else if (value !== null && typeof value === 'object') {
      Object.keys(value).slice(0, maxNodesToRender).forEach((key) => {
        const childPath = buildPath(path, key);
        const childExpanded = isExpanded ? isExpanded(childPath) : false;
        
        children.push(
          <VirtualizedTreeNode
            key={childPath}
            value={value[key]}
            path={childPath}
            depth={depth + 1}
            nodeKey={key}
            expanded={childExpanded}
            editable={editable}
            showTypes={showTypes}
            onToggle={onToggle}
            onSelect={onSelect}
            onChange={onChange}
            onError={onError}
            renderValue={renderValue}
            renderKey={renderKey}
            searchQuery={searchQuery}
            maxRenderDepth={maxRenderDepth}
            maxNodes={maxNodes}
            isExpanded={isExpanded}
            isVirtual={isVirtual}
          />
        );
        currentNodeCount++;
      });
    }

    if (currentNodeCount < childrenCount) {
      children.push(
        <div key="load-more" className="jv-node">
          <div className="jv-node-content">
            <div className="jv-indent" style={{ '--depth': depth + 1 } as React.CSSProperties} />
            <button 
              className="jv-load-more-button"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement load more functionality
              }}
            >
              Load more... ({childrenCount - currentNodeCount} remaining)
            </button>
          </div>
        </div>
      );
    }

    return <div className="jv-children">{children}</div>;
  }, [expanded, canExpand, canRenderChildren, childrenCount, isVirtual, depth, value, maxNodes, path, isExpanded, editable, showTypes, onToggle, onSelect, onChange, onError, renderValue, renderKey, searchQuery, maxRenderDepth]);

  const ariaLabel = getAriaLabel(nodeKey, valueType, canExpand ? expanded : undefined);

  return (
    <div className="jv-node" ref={nodeRef}>
      <div
        className="jv-node-content"
        onClick={handleNodeClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNodeClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        aria-expanded={canExpand ? expanded : undefined}
      >
        <div className="jv-indent" style={{ '--depth': depth } as React.CSSProperties} />
        
        <div className={`jv-expand-icon ${expanded ? 'jv-expanded' : ''} ${!canExpand ? 'jv-empty' : ''}`}>
          {canExpand && (
            <span>▶</span>
          )}
        </div>

        {renderNodeKey()}
        
        <span className="jv-colon">:</span>
        
        {renderNodeValue()}

        <div className="jv-actions">
          <button
            type="button"
            className="jv-action-button"
            onClick={handleCopyValue}
            title="Copy value"
          >
            📋
          </button>
          
          <button
            type="button"
            className="jv-action-button"
            onClick={handleCopyPath}
            title="Copy path"
          >
            📍
          </button>
          
          {editable && !canExpand && (
            <button
              type="button"
              className="jv-action-button"
              onClick={handleEdit}
              title="Edit value"
            >
              ✏️
            </button>
          )}
        </div>
      </div>

      {renderChildren()}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.value === nextProps.value &&
    prevProps.path === nextProps.path &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.editable === nextProps.editable &&
    prevProps.showTypes === nextProps.showTypes &&
    prevProps.maxRenderDepth === nextProps.maxRenderDepth &&
    prevProps.maxNodes === nextProps.maxNodes
  );
});

VirtualizedTreeNode.displayName = 'VirtualizedTreeNode';

export default VirtualizedTreeNode;