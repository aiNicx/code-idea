import React from 'react';
import type { AgentName } from '../types';
import { AGENT_METADATA } from '../constants';
// Placeholder for legacy service
const getAllAgentConfigs = () => {
  return [];
};

interface AgentLibraryProps {
  selectedAgentName: AgentName | null;
  onSelectAgent: (agentName: AgentName) => void;
}

const AgentLibrary: React.FC<AgentLibraryProps> = ({ selectedAgentName, onSelectAgent }) => {
  const allConfigs = getAllAgentConfigs();
  const allAgentNames = Object.keys(AGENT_METADATA) as AgentName[];

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl h-full flex flex-col shadow-xl">
      <header className="flex-shrink-0 p-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Agent Library</h2>
            <p className="text-sm text-gray-400">Choose an agent to configure its behavior</p>
          </div>
        </div>
      </header>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-3">
          {allAgentNames.map(agentName => {
            const metadata = AGENT_METADATA[agentName];
            const config = allConfigs.find(c => c.id === agentName);
            const Icon = metadata.icon;
            const isSelected = agentName === selectedAgentName;

            return (
              <div
                key={agentName}
                className={`group relative ${isSelected ? 'z-10' : ''}`}
                title={`Click to configure ${agentName} - ${metadata.role}`}
              >
                <button
                  onClick={() => onSelectAgent(agentName)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600/25 to-purple-600/25 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-900/25 border border-indigo-500/30'
                      : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600/30 hover:border-gray-500/50 hover:shadow-md'
                  }`}
                >
                  {/* Background glow effect for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 animate-pulse"></div>
                  )}

                  <div className={`flex-shrink-0 mt-1 p-3 rounded-xl transition-all duration-300 relative z-10 ${
                    isSelected
                      ? 'bg-indigo-500/20 shadow-lg'
                      : 'bg-gray-600/50 group-hover:bg-gray-500/50'
                  }`}>
                     <Icon className={`h-7 w-7 transition-colors duration-300 ${
                       isSelected ? 'text-indigo-300' : 'text-gray-400 group-hover:text-gray-300'
                     }`} />
                  </div>

                  <div className="flex-grow min-w-0 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-bold text-lg truncate transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                        }`}>
                          {agentName}
                        </h3>
                        {config?.isCustom && (
                             <span className="ml-2 flex-shrink-0 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-3 py-1 rounded-full border border-indigo-400/50 shadow-sm">
                             CUSTOM
                             </span>
                        )}
                    </div>

                    <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      isSelected ? 'text-indigo-200' : 'text-gray-300 group-hover:text-gray-200'
                    }`}>
                      {metadata.role}
                    </p>

                    <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                      isSelected ? 'text-indigo-300/80' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {metadata.summary}
                    </p>

                    {/* Status indicators */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-600/30">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${config?.enabled !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs text-gray-400">
                          {config?.enabled !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className="text-xs text-gray-400">
                          {config?.tools?.length || 0} tools
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover arrow indicator */}
                  <div className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentLibrary;