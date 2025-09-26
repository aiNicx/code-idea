import React from 'react';
import type { AgentName } from '../types';
import { AGENT_METADATA } from '../constants';
import { getAllAgentConfigs } from '../services/promptService';

interface AgentLibraryProps {
  selectedAgentName: AgentName | null;
  onSelectAgent: (agentName: AgentName) => void;
}

const AgentLibrary: React.FC<AgentLibraryProps> = ({ selectedAgentName, onSelectAgent }) => {
  const allConfigs = getAllAgentConfigs();
  const allAgentNames = Object.keys(AGENT_METADATA) as AgentName[];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-200">Agent Library</h2>
        <p className="text-sm text-gray-500">Select an agent to configure</p>
      </header>
      <div className="flex-grow p-2 overflow-y-auto">
        <ul className="space-y-1">
          {allAgentNames.map(agentName => {
            const metadata = AGENT_METADATA[agentName];
            const config = allConfigs.find(c => c.id === agentName);
            const Icon = metadata.icon;
            const isSelected = agentName === selectedAgentName;

            return (
              <li key={agentName}>
                <button
                  onClick={() => onSelectAgent(agentName)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-4 ${
                    isSelected
                      ? 'bg-indigo-600/30 ring-2 ring-indigo-500'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <div className={`flex-shrink-0 mt-1 p-2 rounded-md ${isSelected ? 'bg-indigo-500/30' : 'bg-gray-700'}`}>
                     <Icon className={`h-6 w-6 ${isSelected ? 'text-indigo-300' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <p className={`font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{agentName}</p>
                        {config?.isCustom && (
                             <span className="text-xs bg-indigo-500/30 text-indigo-200 font-bold px-2 py-0.5 rounded-full border border-indigo-500/50">
                             EDITED
                             </span>
                        )}
                    </div>
                    <p className={`text-sm ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>{metadata.role}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AgentLibrary;