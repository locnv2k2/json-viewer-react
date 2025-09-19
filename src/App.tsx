import { useRef, useState } from 'react';
import { JSONViewer, JSONViewerHandle } from './lib';

const sampleData = {
  name: "JSON Viewer for React",
  version: "1.0.0",
  description: "A powerful, lightweight JSON viewer component for React applications",
  features: ["Search", "Edit", "Copy", "Expand/Collapse", "Themes", "TypeScript"],
  nested: {
    object: {
      with: "deep nesting",
      array: [1, 2, 3, { key: "value", nested: { deep: true } }],
      boolean: true,
      null_value: null,
      number: 42.5
    },
    metadata: {
      created: "2024-01-20",
      author: "SOLO Coding",
      tags: ["json", "viewer", "react", "typescript"]
    }
  },
  config: {
    editable: true,
    showTypes: true,
    maxDepth: 10,
    themes: ["light", "dark"]
  },
  stats: {
    downloads: 1000,
    stars: 50,
    issues: 2
  }
};

export default function App() {
  const viewerRef = useRef<JSONViewerHandle>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [editable, setEditable] = useState(true);
  const [showTypes, setShowTypes] = useState(true);

  const handleExpandAll = () => {
    viewerRef.current?.expandAll();
  };

  const handleCollapseAll = () => {
    viewerRef.current?.collapseAll();
  };

  const handleSearch = () => {
    viewerRef.current?.search('react');
  };

  const handleClearSearch = () => {
    viewerRef.current?.search('');
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#333333',
      minHeight: '100vh'
    }}>
      <h1>JSON Viewer for React - Demo</h1>
      
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <label>
          <input
            type="checkbox"
            checked={editable}
            onChange={(e) => setEditable(e.target.checked)}
          />
          Editable
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={showTypes}
            onChange={(e) => setShowTypes(e.target.checked)}
          />
          Show Types
        </label>
        
        <label>
          Theme:
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            style={{ marginLeft: '5px' }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        
        <button onClick={handleExpandAll}>Expand All</button>
        <button onClick={handleCollapseAll}>Collapse All</button>
        <button onClick={handleSearch}>Search "react"</button>
        <button onClick={handleClearSearch}>Clear Search</button>
      </div>
      
      <JSONViewer 
        ref={viewerRef}
        data={sampleData}
        config={{
          editable,
          showTypes,
          theme,
          maxRenderDepth: 8,
          maxNodes: 1000,
          rootName: 'demo'
        }}
        onSelect={(path, meta) => {
          console.log('Selected:', path, meta);
        }}
        onChange={(path, oldValue, newValue) => {
          console.log('Changed:', path, 'from', oldValue, 'to', newValue);
        }}
        onError={(error) => {
          console.error('Error:', error);
        }}
      />
      
      <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
        <p>Try the following features:</p>
        <ul>
          <li>Click expand/collapse icons to navigate the tree</li>
          <li>Use the search box to find keys and values</li>
          <li>Double-click on primitive values to edit them (when editable is enabled)</li>
          <li>Hover over nodes to see action buttons (copy value, copy path, edit)</li>
          <li>Switch between light and dark themes</li>
          <li>Toggle type badges and editing mode</li>
        </ul>
      </div>
    </div>
  );
}
