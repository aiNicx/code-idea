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
  
  const stages = [
    { title: 'Orchestration', agents: ['OrchestratorAgent' as AgentName] },
    { title: 'Execution', agents: executionAgents },
    { title: 'Assembly & Output', agents: ['DocumentGeneratorAgent' as AgentName] },
  ];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-200">Agentic Workflow</h2>
        <p className="text-sm text-gray-500">The high-level execution plan</p>
      </header>
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {stages.map((stage, index) => (
            <div key={stage.title}>
                <div className="flex flex-col items-center">
                    {index > 0 && <ArrowDown />}
                    <StageCard title={stage.title} />
                    <ArrowDown />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {stage.agents.map(agentName => (
                        <AgentNode 
                            key={agentName}
                            agentName={agentName}
                            isSelected={selectedAgentName === agentName}
                            onClick={() => onSelectAgent(agentName)}
                        />
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};


const StageCard: React.FC<{title: string}> = ({ title }) => (
    <div className="bg-gray-700/50 border border-gray-600 text-indigo-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
        {title}
    </div>
);

const ArrowDown: React.FC = () => (
    <div className="h-4 w-px bg-gray-600 my-1" />
);

const AgentNode: React.FC<{agentName: AgentName; isSelected: boolean; onClick: () => void}> = ({ agentName, isSelected, onClick }) => {
    const metadata = AGENT_METADATA[agentName];
    const Icon = metadata.icon;
    
    return (
        <button 
            onClick={onClick}
            className={`p-3 w-full rounded-lg border flex items-center gap-3 transition-all duration-200 ${
                isSelected 
                ? 'bg-indigo-600/20 border-indigo-500 scale-105'
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700/70 hover:border-gray-600'
            }`}
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{agentName}</span>
        </button>
    )
}

export default WorkflowVisualizer;