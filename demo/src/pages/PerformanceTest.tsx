import React, { useState, useCallback, useRef, useEffect } from 'react';
import { JSONViewer } from '../../../src/lib';
import { 
  generateLargeData, 
  PerformanceMeasurer, 
  getMemoryUsage, 
  calculateDataSize,
  testScenarios 
} from '../../../src/test/performance-test';

interface PerformanceStats {
  renderTime: number;
  memoryUsage: { used: number; total: number; percentage: number } | null;
  dataSize: { bytes: number; mb: number; nodes: number };
  timestamp: number;
}

const PerformanceTest: React.FC = () => {
  const [currentData, setCurrentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PerformanceStats[]>([]);
  const [selectedScenario, setSelectedScenario] = useState(testScenarios[0]);
  const measurer = useRef(new PerformanceMeasurer());
  const viewerRef = useRef<any>(null);

  const runPerformanceTest = useCallback(async (scenario: typeof testScenarios[0]) => {
    setIsLoading(true);
    
    try {
      // Clear previous measurements
      measurer.current.clear();
      
      // Generate test data
      measurer.current.start('data-generation');
      const testData = generateLargeData(scenario.size);
      const dataGenTime = measurer.current.end('data-generation');
      
      // Calculate data size
      const dataSize = calculateDataSize(testData);
      
      // Measure initial memory
      // const initialMemory = getMemoryUsage();
      
      // Measure render time
      measurer.current.start('initial-render');
      setCurrentData(testData);
      
      // Wait for render to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const renderTime = measurer.current.end('initial-render');
      const finalMemory = getMemoryUsage();
      
      // Record stats
      const newStats: PerformanceStats = {
        renderTime,
        memoryUsage: finalMemory,
        dataSize,
        timestamp: Date.now()
      };
      
      setStats(prev => [...prev, newStats]);
      
      console.group(`Performance Test: ${scenario.name}`);
      console.log('Data Generation Time:', `${dataGenTime.toFixed(2)}ms`);
      console.log('Initial Render Time:', `${renderTime.toFixed(2)}ms`);
      console.log('Data Size:', `${dataSize.mb.toFixed(2)}MB (${dataSize.nodes} nodes)`);
      console.log('Memory Usage:', finalMemory ? `${(finalMemory.used / 1024 / 1024).toFixed(2)}MB (${finalMemory.percentage.toFixed(1)}%)` : 'Not available');
      console.groupEnd();
      
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setCurrentData(null);
    setStats([]);
    measurer.current.clear();
  }, []);

  const testSearch = useCallback(async () => {
    if (!currentData) return;
    
    const searchQueries = ['user', 'product', 'order', 'email', 'price'];
    
    for (const query of searchQueries) {
      measurer.current.start(`search-${query}`);
      
      // Simulate search
      if (viewerRef.current?.search) {
        viewerRef.current.search(query);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      measurer.current.end(`search-${query}`);
    }
    
    measurer.current.logStats();
  }, [currentData]);

  const testExpansion = useCallback(async () => {
    if (!currentData || !viewerRef.current) return;
    
    measurer.current.start('expand-all');
    viewerRef.current.expandAll();
    await new Promise(resolve => setTimeout(resolve, 200));
    measurer.current.end('expand-all');
    
    measurer.current.start('collapse-all');
    viewerRef.current.collapseAll();
    await new Promise(resolve => setTimeout(resolve, 200));
    measurer.current.end('collapse-all');
    
    measurer.current.logStats();
  }, [currentData]);

  useEffect(() => {
    // Run initial small test
    runPerformanceTest(testScenarios[0]);
  }, [runPerformanceTest]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          JSON Viewer Performance Test
        </h1>
        <p className="text-gray-600">
          Test the performance of the JSON Viewer with large datasets and measure rendering times, memory usage, and responsiveness.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {testScenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => {
                setSelectedScenario(scenario);
                runPerformanceTest(scenario);
              }}
              disabled={isLoading}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedScenario.name === scenario.name
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium">{scenario.name}</div>
              <div className="text-sm text-gray-500">{scenario.size} items</div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={testSearch}
            disabled={!currentData || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Search Performance
          </button>
          
          <button
            onClick={testExpansion}
            disabled={!currentData || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Expand/Collapse
          </button>
          
          <button
            onClick={clearData}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      {stats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Performance Statistics</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Test</th>
                  <th className="text-left p-2">Render Time</th>
                  <th className="text-left p-2">Data Size</th>
                  <th className="text-left p-2">Nodes</th>
                  <th className="text-left p-2">Memory Usage</th>
                  <th className="text-left p-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">Test {index + 1}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        stat.renderTime < 100 ? 'bg-green-100 text-green-800' :
                        stat.renderTime < 500 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {stat.renderTime.toFixed(2)}ms
                      </span>
                    </td>
                    <td className="p-2">{stat.dataSize.mb.toFixed(2)}MB</td>
                    <td className="p-2">{stat.dataSize.nodes.toLocaleString()}</td>
                    <td className="p-2">
                      {stat.memoryUsage ? (
                        <span className="text-xs">
                          {(stat.memoryUsage.used / 1024 / 1024).toFixed(2)}MB 
                          ({stat.memoryUsage.percentage.toFixed(1)}%)
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-2 text-xs text-gray-500">
                      {new Date(stat.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Current Memory Usage */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Real-time Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Current Data</div>
            <div className="text-2xl font-bold text-blue-900">
              {currentData ? calculateDataSize(currentData).mb.toFixed(2) : '0'}MB
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Nodes Count</div>
            <div className="text-2xl font-bold text-green-900">
              {currentData ? calculateDataSize(currentData).nodes.toLocaleString() : '0'}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Memory Usage</div>
            <div className="text-2xl font-bold text-purple-900">
              {(() => {
                const memory = getMemoryUsage();
                return memory ? `${(memory.used / 1024 / 1024).toFixed(1)}MB` : 'N/A';
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Viewer */}
      {currentData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">JSON Viewer</h2>
            {isLoading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <JSONViewer
              ref={viewerRef}
              data={currentData}
              theme="light"
              editable={false}
              config={{
                maxRenderDepth: 3,
                maxDisplayLength: 100,
                enableVirtualization: true,
                enablePerformanceMonitoring: true,
                performance: {
                  enableVirtualScrolling: true,
                  virtualScrollThreshold: 100,
                  enableLazyLoading: true,
                  lazyLoadingThreshold: 50,
                  enableDebouncing: true,
                  debounceDelay: 300,
                  maxRenderNodes: 1000
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTest;