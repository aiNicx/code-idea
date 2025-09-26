import React from 'react';
import type { FlowStage } from '../types';
import { UserInputIcon, OrchestratorIcon, ExecutionIcon, DocumentGeneratorIcon, OutputIcon } from './AgentIcons';

interface AgentFlowDiagramProps {
  onStageHover: (stage: FlowStage) => void;
}

const FlowStage: React.FC<{
  stage: FlowStage;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onStageHover: (stage: FlowStage) => void;
}> = ({ stage, icon: Icon, title, description, onStageHover }) => {
  return (
    <div
      className="flex flex-col items-center text-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50"
      onMouseEnter={() => onStageHover(stage)}
      onMouseLeave={() => onStageHover(null)}
    >
      <div className="bg-gray-800 border border-gray-600 rounded-full p-3 mb-3">
        <Icon className="h-8 w-8 text-indigo-400" />
      </div>
      <h3 className="font-bold text-sm text-gray-200">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
};

const FlowArrow: React.FC = () => (
    <div className="flex-grow flex items-center justify-center">
      <svg className="w-16 h-16 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>
);


const AgentFlowDiagram: React.FC<AgentFlowDiagramProps> = ({ onStageHover }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 md:p-6 mb-8">
        <div className="hidden md:flex items-stretch justify-between">
            <FlowStage stage="input" icon={UserInputIcon} title="1. Input" description="User provides an idea and tech stack." onStageHover={onStageHover} />
            <FlowArrow />
            <FlowStage stage="orchestration" icon={OrchestratorIcon} title="2. Orchestration" description="The master agent creates a plan." onStageHover={onStageHover} />
            <FlowArrow />
            <FlowStage stage="execution" icon={ExecutionIcon} title="3. Execution" description="Specialized agents work in sequence." onStageHover={onStageHover} />
            <FlowArrow />
            <FlowStage stage="assembly" icon={DocumentGeneratorIcon} title="4. Assembly" description="A writer agent compiles all outputs." onStageHover={onStageHover} />
            <FlowArrow />
            <FlowStage stage="output" icon={OutputIcon} title="5. Output" description="Final project files are generated." onStageHover={onStageHover} />
        </div>
         <div className="md:hidden text-center text-sm text-gray-400">
            The process involves 5 steps: Input, Orchestration, Execution, Assembly, and Output. View on a larger screen to see the interactive flow.
        </div>
    </div>
  );
};

export default AgentFlowDiagram;
