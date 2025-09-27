/**
 * Metrics collection system per performance monitoring
 */

import React from 'react';

export interface MetricsData {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  errorType?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
  operations: Record<string, {
    count: number;
    averageLatency: number;
    errorRate: number;
    lastExecuted: number;
  }>;
}

export class MetricsCollector {
  private metrics: MetricsData[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private listeners: Array<(stats: PerformanceStats) => void> = [];

  record(operation: string, duration: number, success: boolean, errorType?: string, metadata?: Record<string, any>) {
    const metric: MetricsData = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      errorType,
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Notify listeners
    this.notifyListeners();
  }

  recordLatency(operation: string, duration: number, metadata?: Record<string, any>) {
    this.record(operation, duration, true, undefined, metadata);
  }

  recordError(operation: string, error: Error, metadata?: Record<string, any>) {
    this.record(operation, 0, false, error.name, {
      message: error.message,
      ...metadata
    });
  }

  getStats(timeWindow: number = 60000): PerformanceStats { // Default: last minute
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    const stats: PerformanceStats = {
      totalRequests: recentMetrics.length,
      averageLatency: 0,
      errorRate: 0,
      operations: {}
    };

    if (recentMetrics.length === 0) {
      return stats;
    }

    // Calculate overall stats
    const successfulRequests = recentMetrics.filter(m => m.success);
    const totalLatency = successfulRequests.reduce((sum, m) => sum + m.duration, 0);

    stats.averageLatency = successfulRequests.length > 0 ? totalLatency / successfulRequests.length : 0;
    stats.errorRate = recentMetrics.length > 0 ? (recentMetrics.length - successfulRequests.length) / recentMetrics.length : 0;

    // Calculate per-operation stats
    const operationGroups = recentMetrics.reduce((groups, metric) => {
      if (!groups[metric.operation]) {
        groups[metric.operation] = [];
      }
      groups[metric.operation].push(metric);
      return groups;
    }, {} as Record<string, MetricsData[]>);

    Object.entries(operationGroups).forEach(([operation, metrics]) => {
      const successfulOps = metrics.filter(m => m.success);
      const totalOpLatency = successfulOps.reduce((sum, m) => sum + m.duration, 0);
      const errorCount = metrics.length - successfulOps.length;

      stats.operations[operation] = {
        count: metrics.length,
        averageLatency: successfulOps.length > 0 ? totalOpLatency / successfulOps.length : 0,
        errorRate: metrics.length > 0 ? errorCount / metrics.length : 0,
        lastExecuted: Math.max(...metrics.map(m => m.timestamp))
      };
    });

    return stats;
  }

  getMetrics(timeWindow?: number): MetricsData[] {
    if (!timeWindow) {
      return [...this.metrics];
    }

    const cutoff = Date.now() - timeWindow;
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  clear() {
    this.metrics = [];
    this.notifyListeners();
  }

  addListener(listener: (stats: PerformanceStats) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (stats: PerformanceStats) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners() {
    const stats = this.getStats();
    this.listeners.forEach(listener => listener(stats));
  }

  // Export metrics for external monitoring
  exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'csv') {
      const headers = ['timestamp', 'operation', 'duration', 'success', 'errorType'];
      const rows = [
        headers.join(','),
        ...this.metrics.map(m =>
          [m.timestamp, m.operation, m.duration, m.success, m.errorType || ''].join(',')
        )
      ];
      return rows.join('\n');
    }

    return JSON.stringify(this.metrics, null, 2);
  }
}

// Decorator for automatic metrics collection
export function withMetrics(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      let success = true;
      let errorType: string | undefined;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        errorType = error instanceof Error ? error.name : 'Unknown';
        throw error;
      } finally {
        const duration = performance.now() - startTime;
        metricsCollector.record(operation, duration, success, errorType);
      }
    };

    return descriptor;
  };
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector();

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [stats, setStats] = React.useState<PerformanceStats>(() => metricsCollector.getStats());

  React.useEffect(() => {
    const updateStats = (newStats: PerformanceStats) => {
      setStats(newStats);
    };

    metricsCollector.addListener(updateStats);

    return () => {
      metricsCollector.removeListener(updateStats);
    };
  }, []);

  return stats;
};

// React is now properly imported at the top of the file