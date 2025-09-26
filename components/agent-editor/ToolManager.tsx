
import React from 'react';
import type { AgentConfig, ToolConfig } from '../../types';
import { TOOLS_CATALOG } from '../../constants';

interface ToolManagerProps {
    agentConfig: AgentConfig;
    onToolChange: (newTools: ToolConfig[]) => void;
}

const ToolManager: React.FC<ToolManagerProps> = ({ agentConfig, onToolChange }) => {
    
    const handleToggle = (toolId: ToolConfig['id']) => {
        const newTools = agentConfig.tools.map(tool => 
            tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
        );
        onToolChange(newTools);
    };

    if (agentConfig.tools.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500">
                This agent has no configurable tools.
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {agentConfig.tools.map(tool => {
                const toolMeta = TOOLS_CATALOG[tool.id];
                if (!toolMeta) return null;
                const Icon = toolMeta.icon;

                return (
                    <div key={tool.id} className="flex items-start justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5 text-indigo-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-200">{toolMeta.name}</h4>
                                <p className="text-xs text-gray-400">{toolMeta.description}</p>
                            </div>
                        </div>
                        <label htmlFor={`toggle-${tool.id}`} className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input 
                                    id={`toggle-${tool.id}`} 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={tool.enabled}
                                    onChange={() => handleToggle(tool.id)}
                                />
                                <div className={`block w-10 h-6 rounded-full ${tool.enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${tool.enabled ? 'translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

export default ToolManager;