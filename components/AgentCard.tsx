import React, { useState, useMemo } from 'react';
import type { AgentName, FlowStage } from '../types';
import { AGENT_METADATA } from '../constants';
import { getAgentConfig, saveAgentConfig, resetAgentConfig } from '../services/promptService';
import { EditIcon, ResetIcon, SaveIcon, CloseIcon, ToolIcon } from './AgentIcons';

interface AgentCardProps {
  agentName: AgentName;
  highlightedStage: FlowStage;
}

const PromptViewer: React.FC<{ prompt: string }> = ({ prompt }) => {
  const highlightedPrompt = useMemo(() => {
    const parts = prompt.split(/(\{\{[A-Z_]+\}\})/g);
    return parts.map((part, index) =>
      part.startsWith('{{') && part.endsWith('}}') ? (
        <span key={index} className="text-amber-400 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  }, [prompt]);

  return (
    <pre className="mt-2 p-3 bg-gray-900/70 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-xs text-gray-300">
      <code>{highlightedPrompt}</code>
    </pre>
  );
};


const AgentCard: React.FC<AgentCardProps> = ({ agentName, highlightedStage }) => {
  const [config, setConfig] = useState(() => getAgentConfig(agentName));
  const [isEditing, setIsEditing] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptContent, setPromptContent] = useState(config.systemPrompt);

  const metadata = AGENT_METADATA[agentName];
  const Icon = metadata.icon;

  const handleOpenEditModal = () => {
    setPromptContent(config.systemPrompt);
    setIsEditing(true);
  };

  const handleCloseEditModal = () => setIsEditing(false);

  const handleSave = () => {
    const newConfig = { ...config, systemPrompt: promptContent };
    saveAgentConfig(newConfig);
    setConfig(getAgentConfig(agentName));
    handleCloseEditModal();
  };

  const handleReset = () => {
    resetAgentConfig(agentName);
    const defaultConfig = getAgentConfig(agentName);
    setConfig(defaultConfig);
    setPromptContent(defaultConfig.systemPrompt);
  };

  const getIsHighlighted = () => {
    if (!highlightedStage) return false;
    switch(agentName) {
        case 'OrchestratorAgent': return highlightedStage === 'orchestration';
        case 'DocumentGeneratorAgent': return highlightedStage === 'assembly';
        default: return highlightedStage === 'execution';
    }
  }

  const isHighlighted = getIsHighlighted();

  return (
    <>
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/50 hover:border-indigo-700/50 hover:scale-[1.03] ${
        isHighlighted ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-900/80 scale-[1.02]' : ''
      }`}>
        <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
                <div className="bg-gray-900 p-2 rounded-lg border border-gray-600">
                    <Icon className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-100 font-mono">{agentName}</h2>
                    <p className="text-sm text-indigo-400">{metadata.role}</p>
                </div>
            </div>
          {config.isCustom && (
              <span className="text-xs bg-indigo-500/30 text-indigo-200 font-bold px-2.5 py-1 rounded-full border border-indigo-500/50">
              EDITED
              </span>
          )}
        </div>
        
        <p className="text-sm text-gray-400 mt-4 flex-grow">{metadata.summary}</p>
        
        {metadata.tools.length > 0 && (
            <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</h3>
                <div className="flex flex-wrap gap-2">
                    {metadata.tools.map(tool => (
                        <div key={tool} className="flex items-center gap-1.5 bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full">
                           <ToolIcon className="h-3.5 w-3.5" />
                           <span>{tool}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700/50">
             <button onClick={() => setIsPromptVisible(!isPromptVisible)} className="text-xs text-gray-400 hover:text-white w-full text-left mb-2 font-semibold">
                {isPromptVisible ? 'Hide Prompt ▼' : 'Show Prompt ►'}
             </button>
            {isPromptVisible && <PromptViewer prompt={config.systemPrompt} />}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
            {config.isCustom && (
            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-900/50 rounded-md hover:bg-red-800/50 transition-colors">
                <ResetIcon className="h-4 w-4" />
                Reset
            </button>
            )}
            <button onClick={handleOpenEditModal} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                <EditIcon className="h-4 w-4" />
                Edit Prompt
            </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseEditModal}>
            <div className="bg-gray-800 border border-indigo-700/50 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl shadow-indigo-900/50" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-indigo-400" />
                        <h3 className="text-lg font-bold text-gray-100">Edit Prompt: <span className="font-mono">{agentName}</span></h3>
                    </div>
                    <button onClick={handleCloseEditModal} className="text-gray-500 hover:text-white transition-colors">
                       <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                <div className="flex-grow p-4 overflow-y-auto">
                    <textarea
                        value={promptContent}
                        onChange={(e) => setPromptContent(e.target.value)}
                        className="w-full h-full p-3 bg-gray-900 border border-gray-600 rounded-md text-sm font-mono text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <footer className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
                    <button onClick={handleCloseEditModal} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                        <SaveIcon className="h-5 w-5" />
                        Save Changes
                    </button>
                </footer>
            </div>
        </div>
      )}
    </>
  );
};

export default AgentCard;
