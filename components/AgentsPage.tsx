import React, { useState } from 'react';
import { AGENT_METADATA } from '../constants';
import type { AgentName, Page, FlowStage } from '../types';
import AgentCard from './AgentCard';
import AgentFlowDiagram from './AgentFlowDiagram';

interface AgentsPageProps {
  onNavigate: (page: Page) => void;
}

const AgentsPage: React.FC<AgentsPageProps> = ({ onNavigate }) => {
  const [highlightedStage, setHighlightedStage] = useState<FlowStage>(null);

  const allAgentNames = Object.keys(AGENT_METADATA) as AgentName[];
  const executionAgents = allAgentNames.filter(
    name => name !== 'OrchestratorAgent' && name !== 'DocumentGeneratorAgent'
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">The Agentic Workflow</h1>
          <p className="mt-2 text-lg text-gray-400">
            An idea is transformed through a multi-step, collaborative AI process.
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

      <AgentFlowDiagram onStageHover={setHighlightedStage} />
      
      <div className="mt-12 space-y-8">
        <div>
            <AgentCard agentName="OrchestratorAgent" highlightedStage={highlightedStage} />
        </div>

        <div>
            <h2 className="text-2xl font-bold text-center text-gray-300 mb-6 pb-2 border-b-2 border-gray-700/50">
                Core Execution Agents
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {executionAgents.map((agentName) => (
                    <AgentCard key={agentName} agentName={agentName} highlightedStage={highlightedStage} />
                ))}
            </div>
        </div>
        
         <div>
            <AgentCard agentName="DocumentGeneratorAgent" highlightedStage={highlightedStage} />
        </div>

      </div>
    </div>
  );
};

export default AgentsPage;
