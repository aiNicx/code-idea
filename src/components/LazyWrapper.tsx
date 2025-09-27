/**
 * Lazy loading wrapper per componenti pesanti
 */

import React, { Suspense, lazy } from 'react';

// Lazy load per componenti critici
export const LazyAgentsPage = lazy(() => import('../../components/AgentsPage'));
export const LazyProcessingStatus = lazy(() => import('../../components/ProcessingStatus'));
export const LazyResultDisplay = lazy(() => import('../../components/ResultDisplay'));
export const LazyConfigurationPanel = lazy(() => import('../../components/agent-editor/ConfigurationPanel'));

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <div className="flex items-center justify-center p-8"><div className="text-gray-400">Loading...</div></div>
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Hook per lazy loading condizionale
export const useLazyComponent = <T extends React.ComponentType<any>>(
  component: () => Promise<{ default: T }>,
  condition: boolean = true
): T | null => {
  const [Component, setComponent] = React.useState<T | null>(null);

  React.useEffect(() => {
    if (condition) {
      component().then(({ default: LoadedComponent }) => {
        setComponent(() => LoadedComponent);
      });
    }
  }, [condition]);

  return Component;
};