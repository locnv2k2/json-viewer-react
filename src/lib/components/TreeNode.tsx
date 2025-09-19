import React, { useState, memo } from 'react';
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

const TreeNode: React.FC<TreeNodeProps> = memo(({
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
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const valueType = getValueType(value);
  const canExpand = isExpandable(value);
  const childrenCount = getChildrenCount(value);
  const canRenderChildren = validateMaxDepth(depth, maxRenderDepth || 10);
  
  // Check if this node or its key matches search
  const keyMatches = searchInKey(nodeKey, searchQuery || '');
  const valueMatches = searchInValue(value, searchQuery || '');
  const shouldHighlight = keyMatches || valueMatches;

  // Handle node click
  const handleNodeClick = () => {
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
  };

  // Handle copy value
  const handleCopyValue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const textToCopy = typeof value === 'string' ? value : JSON.stringify(value);
      await copyToClipboard(textToCopy);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // Handle copy path
  const handleCopyPath = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyToClipboard(path);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // Handle edit
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editable && !canExpand) {
      setIsEditing(true);
    }
  };

  // Handle save edit
  const handleSaveEdit = (newValue: any) => {
    setIsEditing(false);
    if (onChange) {
      onChange(path, value, newValue);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Render key
  const renderNodeKey = () => {
    if (renderKey) {
      return renderKey(String(nodeKey), path);
    }
    
    const keyContent = (
      <span className={`jv-key ${shouldHighlight && keyMatches ? 'jv-highlight' : ''}`}>
        {String(nodeKey)}
      </span>
    );
    
    return keyContent;
  };

  // Render value
  const renderNodeValue = () => {
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
  };

  // Render children
  const renderChildren = () => {
    if (!expanded || !canExpand || !canRenderChildren) {
      return null;
    }

    const children: React.ReactNode[] = [];
    let currentNodeCount = 0;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (currentNodeCount >= maxNodes) return;
        
        const childPath = buildPath(path, index);
        const childExpanded = isExpanded ? isExpanded(childPath) : false;
        
        children.push(
          <TreeNode
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
          />
        );
        currentNodeCount++;
      });
    } else if (value !== null && typeof value === 'object') {
      Object.keys(value).forEach((key) => {
        if (currentNodeCount >= maxNodes) return;
        
        const childPath = buildPath(path, key);
        const childExpanded = isExpanded ? isExpanded(childPath) : false;
        
        children.push(
          <TreeNode
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
          />
        );
        currentNodeCount++;
      });
    }

    if (currentNodeCount >= maxNodes) {
      children.push(
        <div key="max-nodes-warning" className="jv-node">
          <div className="jv-node-content">
            <div className="jv-indent" style={{ '--depth': depth + 1 } as React.CSSProperties} />
            <span className="jv-value jv-null">
              ... ({childrenCount - maxNodes} more items hidden)
            </span>
          </div>
        </div>
      );
    }

    return <div className="jv-children">{children}</div>;
  };

  const ariaLabel = getAriaLabel(nodeKey, valueType, canExpand ? expanded : undefined);

  return (
    <div className="jv-node">
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
});

TreeNode.displayName = 'TreeNode';

export default TreeNode;