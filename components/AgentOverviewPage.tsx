import React, { useState, useEffect } from 'react';
import type { AgentName, Page } from '../types';
import { AGENT_METADATA } from '../constants';
import { getAgentConfig } from '../src/services/agentConfiguration';

interface AgentOverviewPageProps {
  onNavigate: (page: Page) => void;
  onSelectAgent: (agentName: AgentName) => void;
}

const AgentOverviewPage: React.FC<AgentOverviewPageProps> = ({ onNavigate, onSelectAgent }) => {
  const [agentConfigs, setAgentConfigs] = useState<Record<AgentName, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      const configs: Record<AgentName, any> = {};
      for (const agentName of Object.keys(AGENT_METADATA) as AgentName[]) {
        try {
          const config = await getAgentConfig(agentName);
          configs[agentName] = config;
        } catch (error) {
          console.error(`Failed to load config for ${agentName}:`, error);
        }
      }
      setAgentConfigs(configs);
      setLoading(false);
    };

    loadConfigs();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col">
      <header className="flex-shrink-0 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">AI Agent Overview</h1>
          <p className="mt-1 text-lg text-gray-400">
            Manage and configure the AI agents that power your application development.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to App
        </button>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(AGENT_METADATA).map(([agentName, metadata]) => {
          const config = agentConfigs[agentName as AgentName];
          const Icon = metadata.icon;

          return (
            <div
              key={agentName}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/70 transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => onSelectAgent(agentName as AgentName)}
              title={`Click to configure ${agentName} - ${metadata.summary}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 group-hover:border-indigo-500 transition-colors">
                  <Icon className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-white mb-1">{agentName}</h3>
                  <p className="text-sm text-indigo-400 font-medium">{metadata.role}</p>
                </div>
                {config?.isCustom && (
                  <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/50">
                    CUSTOM
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {metadata.summary}
              </p>

              <div className="flex items-center justify-between text-xs mb-4">
                <div className="flex items-center gap-2" title="Current agent status">
                  <div className={`w-2 h-2 rounded-full ${config?.enabled !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`font-medium ${config?.enabled !== false ? 'text-green-400' : 'text-red-400'}`}>
                    {config?.enabled !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-2" title="Number of configured tools">
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-gray-300 font-medium">{config?.tools?.length || 0} tools</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between group-hover:bg-gray-700/30 p-2 rounded-lg transition-colors">
                  <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Click to configure</span>
                  <svg className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentOverviewPage;