import React, { useState, useEffect } from 'react';
import type { AgentConfig, ToolConfig, DocumentationSource, ToolName } from '../types';
import { TOOLS_CATALOG } from '../constants';
import { getDocumentationSources } from '../src/services/documentationService';

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
    
    const handleDocSelectionChange = (docId: string, isSelected: boolean) => {
        const newTools = agentConfig.tools.map(tool => {
            if (tool.id === 'DocumentationSearch') {
                const currentIds = tool.params?.documentationIds || [];
                const newIds = isSelected
                    ? [...currentIds, docId]
                    : currentIds.filter(id => id !== docId);
                return { ...tool, params: { ...tool.params, documentationIds: newIds } };
            }
            return tool;
        });
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

                return (
                    <div key={tool.id} className="bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <ToolHeader 
                            tool={tool} 
                            toolMeta={toolMeta}
                            onToggle={handleToggle}
                        />
                        {tool.id === 'DocumentationSearch' && tool.enabled && (
                            <DocumentationSelector
                                selectedDocIds={tool.params?.documentationIds || []}
                                onSelectionChange={handleDocSelectionChange}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const ToolHeader: React.FC<{tool: ToolConfig, toolMeta: any, onToggle: (id: ToolName) => void}> = ({ tool, toolMeta, onToggle }) => {
    const Icon = toolMeta.icon;
    return (
        <div className="flex items-center justify-between p-3">
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
                        onChange={() => onToggle(tool.id)}
                    />
                    <div className={`block w-12 h-7 rounded-full transition-colors ${tool.enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${tool.enabled ? 'translate-x-5' : ''}`}></div>
                </div>
            </label>
        </div>
    );
};

const DocumentationSelector: React.FC<{selectedDocIds: string[], onSelectionChange: (docId: string, selected: boolean) => void}> = ({ selectedDocIds, onSelectionChange }) => {
    const [docs, setDocs] = useState<DocumentationSource[]>([]);

    useEffect(() => {
        setDocs(getDocumentationSources());
    }, []);

    return (
        <div className="border-t border-gray-700 p-3">
            <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Accessible Custom Documents</h5>
            {docs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {docs.map(doc => (
                        <label key={doc.id} className="flex items-center space-x-3 cursor-pointer p-2 bg-gray-800 rounded-md hover:bg-gray-700/50">
                            <input 
                                type="checkbox"
                                checked={selectedDocIds.includes(doc.id)}
                                onChange={(e) => onSelectionChange(doc.id, e.target.checked)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-300 truncate" title={doc.title}>{doc.title}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic p-2">No custom documents created yet. Go to "Tools Overview" to add documentation.</p>
            )}
        </div>
    );
};

export default ToolManager;