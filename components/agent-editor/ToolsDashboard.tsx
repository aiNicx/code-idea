import React from 'react';
import { TOOLS_CATALOG } from '../../constants';
// Placeholder for legacy service
const getAllAgentConfigs = () => {
  return [];
};
import type { AgentName, ToolName } from '../../types';

interface ToolsDashboardProps {
    onSelectAgent: (agentName: AgentName) => void;
    onManageDocs: () => void;
}

const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onSelectAgent, onManageDocs }) => {
    const allConfigs = getAllAgentConfigs();
    const allTools = Object.keys(TOOLS_CATALOG) as ToolName[];

    return (
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl h-full flex flex-col shadow-xl">
            <header className="flex-shrink-0 p-5 border-b border-gray-700/50 bg-gray-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">Tools Overview</h2>
                        <p className="text-sm text-gray-400">Manage tools and create custom documentation for your agents</p>
                    </div>
                </div>
            </header>
            <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {allTools.map(toolId => {
                    const toolMeta = TOOLS_CATALOG[toolId];
                    const Icon = toolMeta.icon;
                    
                    const enabledAgents = allConfigs.filter(config => 
                        config.tools.find(t => t.id === toolId)?.enabled
                    );

                    return (
                        <div key={toolId} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 flex flex-col h-full hover:border-gray-600/50 hover:bg-gray-900/70 transition-all duration-300 group" title={`${toolMeta.name} - ${toolMeta.description}`}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600/50 flex-shrink-0 group-hover:border-indigo-500/50 transition-colors">
                                    <Icon className="h-7 w-7 text-indigo-400" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{toolMeta.name}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{toolMeta.description}</p>
                                </div>
                            </div>

                            {toolId === 'DocumentationSearch' && (
                                <div className="mb-4">
                                    <button
                                        onClick={onManageDocs}
                                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                        title="Create and manage custom documentation that agents can reference"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Manage Custom Documentation
                                    </button>
                                </div>
                            )}

                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-sm font-semibold text-gray-300">Enabled Agents</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                        enabledAgents.length > 0 ? 'bg-green-900/50 text-green-300' : 'bg-gray-800/50 text-gray-500'
                                    }`}>
                                        {enabledAgents.length}
                                    </span>
                                </div>

                                {enabledAgents.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {enabledAgents.map(agentConfig => (
                                            <button
                                                key={agentConfig.id}
                                                onClick={() => onSelectAgent(agentConfig.id)}
                                                className="w-full text-left p-3 rounded-md bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700/50 hover:border-gray-600/50 transition-all flex justify-between items-center group"
                                                title={`Click to configure ${agentConfig.id}`}
                                            >
                                                <div>
                                                    <span className="font-semibold text-sm text-gray-300 group-hover:text-white block transition-colors">{agentConfig.id}</span>
                                                    <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Click to configure</span>
                                                </div>
                                                <svg className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-800/30 rounded-lg border border-gray-700/30">
                                        <svg className="mx-auto h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-500 mb-1">No agents using this tool</p>
                                        <p className="text-xs text-gray-600">Configure agents to enable this tool</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ToolsDashboard;