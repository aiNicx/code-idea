import React from 'react';
import { TOOLS_CATALOG, AGENT_METADATA } from '../../constants';
import { getAllAgentConfigs } from '../../services/promptService';
import type { AgentName, ToolName } from '../../types';

interface ToolsDashboardProps {
    onSelectAgent: (agentName: AgentName) => void;
}

const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onSelectAgent }) => {
    const allConfigs = getAllAgentConfigs();
    const allTools = Object.keys(TOOLS_CATALOG) as ToolName[];

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex flex-col">
            <header className="flex-shrink-0 p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-gray-200">Tools Overview</h2>
                <p className="text-sm text-gray-500">A central registry of all available tools and their agent assignments.</p>
            </header>
            <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
                {allTools.map(toolId => {
                    const toolMeta = TOOLS_CATALOG[toolId];
                    const Icon = toolMeta.icon;
                    
                    const assignedAgents = (Object.keys(AGENT_METADATA) as AgentName[]).filter(agentName => 
                        AGENT_METADATA[agentName].availableTools.includes(toolId)
                    );
                    
                    return (
                        <div key={toolId} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-gray-800 p-2 rounded-lg border border-gray-600">
                                    <Icon className="h-7 w-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{toolMeta.name}</h3>
                                    <p className="text-sm text-gray-400">{toolMeta.description}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b border-gray-700 pb-1">Assigned Agents</h4>
                                {assignedAgents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {assignedAgents.map(agentName => {
                                            const agentConfig = allConfigs.find(c => c.id === agentName);
                                            const isEnabled = agentConfig?.tools.find(t => t.id === toolId)?.enabled ?? false;

                                            return (
                                                <button
                                                    key={agentName}
                                                    onClick={() => onSelectAgent(agentName)}
                                                    className="w-full text-left p-3 rounded-md bg-gray-800 hover:bg-gray-700/70 border border-gray-700 hover:border-gray-600 transition-all flex justify-between items-center group"
                                                >
                                                    <span className="font-semibold text-sm text-gray-300 group-hover:text-white">{agentName}</span>
                                                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                        isEnabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                                    }`}>
                                                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No agents are currently assigned this tool.</p>
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