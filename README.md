# JSON Viewer React

[![npm version](https://badge.fury.io/js/@rio2k2/json-viewer-react.svg)](https://badge.fury.io/js/@rio2k2/json-viewer-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, lightweight React library for displaying and editing JSON data with an interactive tree interface. Perfect for debugging, data visualization, and JSON editing in React applications.

## ✨ Features

- 🌳 **Interactive JSON tree view** with expand/collapse functionality
- 🔍 **Search and highlight** with auto-expand matching nodes
- ✏️ **Inline editing** with validation and error handling
- 📋 **Copy operations** for values and paths
- 🎨 **Customizable themes** (light/dark) with CSS variables
- 📱 **Responsive design** with mobile support
- ♿ **Accessibility support** with keyboard navigation
- 🔧 **Full TypeScript support** with comprehensive type definitions
- 📦 **Small bundle size** (<10KB gzipped)
- ⚡ **Performance optimized** with safety limits and memoization

## 📦 Installation

```bash
npm install @rio2k2/json-viewer-react
```

```bash
yarn add @rio2k2/json-viewer-react
```

```bash
pnpm add @rio2k2/json-viewer-react
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { JSONViewer } from '@rio2k2/json-viewer-react';
import '@rio2k2/json-viewer-react/styles';

const data = {
  name: "John Doe",
  age: 30,
  isActive: true,
  hobbies: ["reading", "coding", "gaming"],
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001"
  }
};

function App() {
  return (
    <JSONViewer 
      data={data} 
      theme="light"
      editable={true}
      showTypes={true}
      onChange={(path, oldValue, newValue) => {
        console.log('Value changed:', { path, oldValue, newValue });
      }}
    />
  );
}
```

## 📖 API Reference

### JSONViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `object \| string` | **required** | JSON data to display |
| `rootName` | `string` | `"root"` | Name for the root node |
| `collapsed` | `boolean \| number` | `false` | Initial collapse state or depth |
| `editable` | `boolean` | `false` | Enable inline editing |
| `search` | `string` | `undefined` | Controlled search value |
| `showTypes` | `boolean` | `true` | Show type badges |
| `theme` | `'light' \| 'dark' \| string` | `"light"` | Theme or custom class |
| `maxRenderDepth` | `number` | `6` | Maximum render depth |
| `maxNodes` | `number` | `2000` | Maximum nodes to render |
| `className` | `string` | `undefined` | Additional CSS class |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onSelect` | `(path: string, node: NodeMeta) => void` | Called when a node is selected |
| `onChange` | `(path: string, oldVal: any, newVal: any) => void` | Called when a value is edited |
| `onError` | `(error: Error) => void` | Called when an error occurs |
| `onSearchMatchCount` | `(count: number) => void` | Called with search match count |

### Custom Renderers

| Prop | Type | Description |
|------|------|-------------|
| `renderValue` | `(value: any, path: string) => ReactNode` | Custom value renderer |
| `renderKey` | `(key: string, path: string) => ReactNode` | Custom key renderer |

### Imperative API

Use a ref to access imperative methods:

```tsx
import React, { useRef } from 'react';
import { JSONViewer, JSONViewerHandle } from '@rio2k2/json-viewer-react';

function App() {
  const viewerRef = useRef<JSONViewerHandle>(null);

  const handleExpandAll = () => {
    viewerRef.current?.expandAll();
  };

  const handleCollapseAll = () => {
    viewerRef.current?.collapseAll();
  };

  const handleSearch = () => {
    viewerRef.current?.search('John');
  };

  return (
    <div>
      <button onClick={handleExpandAll}>Expand All</button>
      <button onClick={handleCollapseAll}>Collapse All</button>
      <button onClick={handleSearch}>Search "John"</button>
      
      <JSONViewer 
        ref={viewerRef}
        data={data} 
      />
    </div>
  );
}
```

### Available Methods

| Method | Description |
|--------|-------------|
| `expandAll()` | Expand all nodes |
| `collapseAll()` | Collapse all nodes |
| `search(query: string)` | Search for a query |
| `get(path: string)` | Get value at path |
| `set(path: string, value: any)` | Set value at path |
| `toJSON()` | Get current JSON data |

## 🎨 Theming

### Built-in Themes

```tsx
// Light theme (default)
<JSONViewer data={data} theme="light" />

// Dark theme
<JSONViewer data={data} theme="dark" />

// Custom theme class
<JSONViewer data={data} theme="my-custom-theme" />
```

### CSS Variables

Customize the appearance using CSS variables:

```css
.jv-theme-custom {
  --jv-bg-color: #f8f9fa;
  --jv-text-color: #212529;
  --jv-key-color: #0066cc;
  --jv-string-color: #22863a;
  --jv-number-color: #005cc5;
  --jv-boolean-color: #d73a49;
  --jv-null-color: #6f42c1;
  --jv-border-color: #e1e4e8;
  --jv-hover-bg: #f1f8ff;
  --jv-focus-border: #0366d6;
}
```

## 🔍 Advanced Examples

### Controlled Search

```tsx
function SearchableViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search JSON..."
      />
      <span>Matches: {matchCount}</span>
      
      <JSONViewer
        data={data}
        search={searchQuery}
        onSearchMatchCount={setMatchCount}
      />
    </div>
  );
}
```

### Custom Value Renderer

```tsx
function CustomViewer() {
  const renderValue = (value: any, path: string) => {
    if (typeof value === 'string' && value.startsWith('http')) {
      return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
    }
    return null; // Use default renderer
  };

  return (
    <JSONViewer
      data={data}
      renderValue={renderValue}
    />
  );
}
```

### Large Data Handling

```tsx
<JSONViewer
  data={largeData}
  maxRenderDepth={3}
  maxNodes={1000}
  collapsed={2}
  onError={(error) => console.error('JSON Viewer Error:', error)}
/>
```

## 🧪 TypeScript Support

The library is written in TypeScript and provides comprehensive type definitions:

```tsx
import { 
  JSONViewer, 
  JSONViewerHandle, 
  JSONViewerProps,
  NodeMeta,
  JSONPath 
} from '@rio2k2/json-viewer-react';

interface MyData {
  id: number;
  name: string;
  metadata: Record<string, any>;
}

const data: MyData = {
  id: 1,
  name: "Example",
  metadata: { version: "1.0" }
};

const handleChange = (path: JSONPath, oldValue: any, newValue: any) => {
  // Type-safe change handling
};
```

## 🚀 Performance Tips

1. **Use `collapsed` prop** for large datasets to avoid rendering all nodes initially
2. **Set `maxRenderDepth`** to limit deep nesting rendering
3. **Set `maxNodes`** to prevent browser freezing with huge datasets
4. **Use `React.memo`** when wrapping JSONViewer in your components
5. **Debounce search input** for better performance with large datasets

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © locnv2k2

## 🔗 Links

- [Demo](https://traelibsctc4-ngloc2002-locs-projects-534330ac.vercel.app)
- [GitHub](https://github.com/locnv2k2/json-viewer-react)
- [Issues](https://github.com/locnv2k2/json-viewer-react/issues)

## Configuration

The `config` prop accepts the following options:

- `editable` (boolean): Enable inline editing of values
- `showTypes` (boolean): Show type badges for values
- `theme` ('light' | 'dark'): Color theme
- `maxRenderDepth` (number): Maximum depth to render (default: 6)
- `maxNodes` (number): Maximum number of nodes to render (default: 2000)
- `rootName` (string): Name for the root node (default: 'root')

## Event Handlers

- `onSelect`: Called when a node is selected
- `onChange`: Called when a value is edited
- `onError`: Called when an error occurs

## Custom Renderers

You can provide custom renderers for keys and values:

```jsx
<JSONViewer 
  data={data}
  renderKey={(key, path) => <strong>{key}</strong>}
  renderValue={(value, path) => {
    if (typeof value === 'string' && value.startsWith('http')) {
      return <a href={value}>{value}</a>;
    }
    return null; // Use default renderer
  }}
/>
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Run type checking
npm run check
```

## License

MIT License - see LICENSE file for details.
# json-viewer-react
