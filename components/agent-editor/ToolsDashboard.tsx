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
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex flex-col">
            <header className="flex-shrink-0 p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-gray-200">Tools Overview</h2>
                <p className="text-sm text-gray-500">A central registry of all available tools and their agent assignments.</p>
            </header>
            <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {allTools.map(toolId => {
                    const toolMeta = TOOLS_CATALOG[toolId];
                    const Icon = toolMeta.icon;
                    
                    const enabledAgents = allConfigs.filter(config => 
                        config.tools.find(t => t.id === toolId)?.enabled
                    );

                    return (
                        <div key={toolId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col h-full">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-gray-800 p-2 rounded-lg border border-gray-600">
                                    <Icon className="h-7 w-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{toolMeta.name}</h3>
                                    <p className="text-sm text-gray-400">{toolMeta.description}</p>
                                </div>
                            </div>

                            {toolId === 'DocumentationSearch' && (
                                <div className="mb-4">
                                    <button 
                                        onClick={onManageDocs}
                                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Manage Custom Docs
                                    </button>
                                </div>
                            )}

                            <div className="flex-grow">
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b border-gray-700 pb-1">Enabled Agents</h4>
                                {enabledAgents.length > 0 ? (
                                    <div className="space-y-2">
                                        {enabledAgents.map(agentConfig => (
                                            <button
                                                key={agentConfig.id}
                                                onClick={() => onSelectAgent(agentConfig.id)}
                                                className="w-full text-left p-2 rounded-md bg-gray-800 hover:bg-gray-700/70 border border-gray-700 hover:border-gray-600 transition-all flex justify-between items-center group"
                                            >
                                                <span className="font-semibold text-sm text-gray-300 group-hover:text-white">{agentConfig.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic py-2">This tool is not enabled for any agent.</p>
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