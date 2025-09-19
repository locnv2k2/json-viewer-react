import React, { useState } from 'react';
import { JSONViewer } from '../../../src/lib';

const BasicDemo: React.FC = () => {
  const [sampleData] = useState({
    name: "John Doe",
    age: 30,
    email: "john.doe@example.com",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    hobbies: ["reading", "swimming", "coding"],
    isActive: true,
    profile: null,
    metadata: {
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T15:45:00Z",
      version: 1.2,
      tags: ["user", "premium", "verified"]
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [editable, setEditable] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          JSON Viewer Basic Demo
        </h1>
        <p className="text-gray-600">
          Explore the basic features of the JSON Viewer component with sample data.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Theme:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={editable}
                onChange={(e) => setEditable(e.target.checked)}
                className="mr-2"
              />
              Editable
            </label>
          </div>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">JSON Viewer</h2>
        
        <div className="border rounded-lg overflow-hidden">
          <JSONViewer
            data={sampleData}
            theme={theme}
            editable={editable}
            config={{
              maxRenderDepth: 10,
              maxDisplayLength: 100,
              enableVirtualization: false,
              enablePerformanceMonitoring: false
            }}
            onSelect={(path, value) => {
              console.log('Selected:', { path, value });
            }}
            onChange={(path, value, oldValue) => {
              console.log('Changed:', { path, value, oldValue });
            }}
            onError={(error) => {
              console.error('JSON Viewer Error:', error);
            }}
          />
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">🔍 Search</h3>
          <p className="text-gray-600 text-sm">
            Use the search box to find specific keys or values in the JSON data. 
            Results are highlighted automatically.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-600">✏️ Edit</h3>
          <p className="text-gray-600 text-sm">
            Enable editing mode to modify values inline. 
            Changes are validated and callbacks are triggered.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-600">🎨 Themes</h3>
          <p className="text-gray-600 text-sm">
            Switch between light and dark themes. 
            Fully customizable with CSS variables.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-orange-600">📋 Copy</h3>
          <p className="text-gray-600 text-sm">
            Copy values to clipboard with the copy button. 
            Supports both individual values and entire objects.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-red-600">🔧 Type Safety</h3>
          <p className="text-gray-600 text-sm">
            Built with TypeScript for full type safety. 
            Proper type inference and validation.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-indigo-600">⚡ Performance</h3>
          <p className="text-gray-600 text-sm">
            Optimized for large datasets with virtual scrolling, 
            lazy loading, and smart memoization.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicDemo;