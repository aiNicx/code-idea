/**
 * Performance Monitor Component
 * Fornisce monitoring in tempo reale delle performance dell'applicazione
 */

import React, { useState, useEffect } from 'react';
import { metricsCollector, usePerformanceMonitoring, type PerformanceStats } from '../services/metrics';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible = false,
  position = 'top-right'
}) => {
  const [stats, setStats] = useState<PerformanceStats>(() => metricsCollector.getStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(metricsCollector.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const formatLatency = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300`}>
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stats.errorRate > 0.1 ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium text-gray-200">Performance</span>
          </div>
          <div className="text-xs text-gray-400">
            {isExpanded ? '−' : '+'}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-700 max-h-96 overflow-y-auto">
            {/* Overview Stats */}
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400">Total Requests</div>
                  <div className="text-gray-200 font-mono">{stats.totalRequests}</div>
                </div>
                <div>
                  <div className="text-gray-400">Avg Latency</div>
                  <div className="text-gray-200 font-mono">{formatLatency(stats.averageLatency)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Error Rate</div>
                  <div className={`font-mono ${stats.errorRate > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatPercentage(stats.errorRate)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Operations</div>
                  <div className="text-gray-200 font-mono">{Object.keys(stats.operations).length}</div>
                </div>
              </div>
            </div>

            {/* Per-Operation Stats */}
            <div className="border-t border-gray-700">
              <div className="p-3">
                <h4 className="text-xs font-medium text-gray-300 mb-2">Operation Details</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(Object.entries(stats.operations) as [string, {count: number; averageLatency: number; errorRate: number; lastExecuted: number}][])
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([operation, opStats]) => (
                      <div key={operation} className="flex justify-between items-center text-xs">
                        <div className="text-gray-400 truncate flex-1 mr-2" title={operation}>
                          {operation}
                        </div>
                        <div className="flex gap-2 text-gray-200 font-mono">
                          <span>{opStats.count}</span>
                          <span className={opStats.errorRate > 0.1 ? 'text-red-400' : 'text-green-400'}>
                            {formatPercentage(opStats.errorRate)}
                          </span>
                          <span>{formatLatency(opStats.averageLatency)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-700 p-3 flex gap-2">
              <button
                onClick={() => metricsCollector.clear()}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const data = metricsCollector.exportMetrics('json');
                  navigator.clipboard.writeText(data);
                  // Could show a toast notification here
                }}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook per aggiungere automaticamente metrics ai componenti
export const useComponentMetrics = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      metricsCollector.recordLatency(`component:${componentName}:render`, duration);
    };
  }, [componentName]);

  return {
    recordInteraction: (action: string) => {
      metricsCollector.recordLatency(`component:${componentName}:interaction:${action}`, 0);
    }
  };
};