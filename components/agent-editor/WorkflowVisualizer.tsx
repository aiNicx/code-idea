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
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-200">Agentic Workflow</h2>
        <p className="text-sm text-gray-500">A high-level view of the execution plan.</p>
      </header>
      <div className="flex-grow p-6 flex flex-col items-center justify-around overflow-y-auto">
        {/* Stage 1: Orchestration */}
        <StageCard title="1. Orchestration" />
        <AgentNode 
            agentName="OrchestratorAgent"
            isSelected={selectedAgentName === 'OrchestratorAgent'}
            onClick={() => onSelectAgent('OrchestratorAgent')}
        />
        <ArrowDown />
        
        {/* Stage 2: Execution */}
        <StageCard title="2. Execution" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 w-full max-w-md">
            {executionAgents.map(agentName => (
                <AgentNode 
                    key={agentName}
                    agentName={agentName}
                    isSelected={selectedAgentName === agentName}
                    onClick={() => onSelectAgent(agentName)}
                />
            ))}
        </div>

        <ArrowDown />
        
        {/* Stage 3: Assembly */}
        <StageCard title="3. Assembly & Output" />
        <AgentNode 
            agentName="DocumentGeneratorAgent"
            isSelected={selectedAgentName === 'DocumentGeneratorAgent'}
            onClick={() => onSelectAgent('DocumentGeneratorAgent')}
        />
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
            className={`p-3 w-full rounded-lg border flex items-center gap-3 transition-all duration-200 text-left ${
                isSelected 
                ? 'bg-indigo-600/20 border-indigo-500 scale-105 shadow-lg shadow-indigo-900/50'
                : 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/70 hover:border-gray-600'
            }`}
        >
            <Icon className={`h-6 w-6 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
            <div>
                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{agentName}</span>
                <p className={`text-xs ${isSelected ? 'text-indigo-300' : 'text-gray-500'}`}>{metadata.role}</p>
            </div>
        </button>
    )
}

export default WorkflowVisualizer;