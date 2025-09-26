import React from 'react';
import type { AgentConfig, ToolConfig } from '../types';
import { TOOLS_CATALOG } from '../constants';

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
            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                This agent has no configurable tools available.
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {agentConfig.tools.map(tool => {
                const toolMeta = TOOLS_CATALOG[tool.id];
                if (!toolMeta) return null;
                const Icon = toolMeta.icon;

                return (
                    <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <Icon className="h-6 w-6 text-indigo-400 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-200">{toolMeta.name}</h4>
                                <p className="text-xs text-gray-400 max-w-xs">{toolMeta.description}</p>
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
                                <div className={`block w-12 h-7 rounded-full transition-colors ${tool.enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${tool.enabled ? 'translate-x-5' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

export default ToolManager;