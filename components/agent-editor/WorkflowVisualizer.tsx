import React from 'react';
import type { AgentName } from '../../types';
import { AGENT_METADATA } from '../../constants';

interface WorkflowVisualizerProps {
  selectedAgentName: AgentName | null;
  onSelectAgent: (agentName: AgentName) => void;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ selectedAgentName, onSelectAgent }) => {
  
  const allAgentNames = Object.keys(AGENT_METADATA) as AgentName[];
  const executionAgents = allAgentNames.filter(
    name => name !== 'OrchestratorAgent' && name !== 'DocumentGeneratorAgent'
  );

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl h-full flex flex-col shadow-xl">
      <header className="flex-shrink-0 p-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Agent Workflow</h2>
            <p className="text-sm text-gray-400">Visual execution flow and dependencies</p>
          </div>
        </div>
      </header>

      <div className="flex-grow p-6 flex flex-col justify-center overflow-y-auto">
        <div className="space-y-8 max-w-4xl mx-auto w-full">

          {/* Stage 1: Orchestration */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg px-4 py-2 mb-4">
              <span className="text-blue-300 font-bold text-sm uppercase tracking-wide">Phase 1: Planning</span>
            </div>
            <AgentNode
                agentName="OrchestratorAgent"
                isSelected={selectedAgentName === 'OrchestratorAgent'}
                onClick={() => onSelectAgent('OrchestratorAgent')}
            />
            <div className="mt-4 text-center max-w-md">
              <p className="text-xs text-gray-400">Analyzes requirements and creates execution plan</p>
            </div>
          </div>

          {/* Connection Line */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-indigo-500/50"></div>
          </div>

          {/* Stage 2: Execution */}
          <div className="flex flex-col items-center">
            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg px-4 py-2 mb-4">
              <span className="text-indigo-300 font-bold text-sm uppercase tracking-wide">Phase 2: Execution</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {executionAgents.map(agentName => (
                    <AgentNode
                        key={agentName}
                        agentName={agentName}
                        isSelected={selectedAgentName === agentName}
                        onClick={() => onSelectAgent(agentName)}
                    />
                ))}
            </div>
            <div className="mt-4 text-center max-w-md">
              <p className="text-xs text-gray-400">Parallel execution of specialized agents</p>
            </div>
          </div>

          {/* Connection Line */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-gradient-to-b from-indigo-500/50 to-purple-500/50"></div>
          </div>

          {/* Stage 3: Assembly */}
          <div className="flex flex-col items-center">
            <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg px-4 py-2 mb-4">
              <span className="text-purple-300 font-bold text-sm uppercase tracking-wide">Phase 3: Assembly</span>
            </div>
            <AgentNode
                agentName="DocumentGeneratorAgent"
                isSelected={selectedAgentName === 'DocumentGeneratorAgent'}
                onClick={() => onSelectAgent('DocumentGeneratorAgent')}
            />
            <div className="mt-4 text-center max-w-md">
              <p className="text-xs text-gray-400">Compiles all outputs into final documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const StageCard: React.FC<{title: string}> = ({ title }) => (
    <div className="bg-gray-700 border border-gray-600 text-indigo-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full my-2">
        {title}
    </div>
);

const ArrowDown: React.FC = () => (
    <div className="h-6 w-px bg-gray-600" />
);

const AgentNode: React.FC<{agentName: AgentName; isSelected: boolean; onClick: () => void}> = ({ agentName, isSelected, onClick }) => {
    const metadata = AGENT_METADATA[agentName];
    const Icon = metadata.icon;

    return (
        <button
            onClick={onClick}
            className={`group p-4 w-full rounded-xl border flex flex-col items-center gap-3 transition-all duration-300 text-center relative overflow-hidden ${
                isSelected
                ? 'bg-gradient-to-br from-indigo-600/25 to-purple-600/25 border-indigo-500/50 scale-105 shadow-xl shadow-indigo-900/30 ring-2 ring-indigo-500/30'
                : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-600/50 hover:border-gray-500/50 hover:shadow-lg hover:scale-102'
            }`}
            title={`Click to configure ${agentName} - ${metadata.summary}`}
        >
            {/* Background glow effect for selected */}
            {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 animate-pulse"></div>
            )}

            <div className={`p-3 rounded-xl transition-all duration-300 relative z-10 ${
                isSelected
                ? 'bg-indigo-500/20 shadow-lg'
                : 'bg-gray-600/50 group-hover:bg-gray-500/50'
            }`}>
                <Icon className={`h-8 w-8 transition-colors duration-300 ${
                    isSelected ? 'text-indigo-300' : 'text-gray-400 group-hover:text-gray-300'
                }`} />
            </div>

            <div className="flex-grow min-w-0 relative z-10">
                <h3 className={`font-bold text-sm mb-1 transition-colors duration-300 ${
                    isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                }`}>
                    {agentName}
                </h3>
                <p className={`text-xs leading-tight transition-colors duration-300 ${
                    isSelected ? 'text-indigo-200' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                    {metadata.role}
                </p>
            </div>

            {/* Hover indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-2 right-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </div>
        </button>
    )
}

export default WorkflowVisualizer;