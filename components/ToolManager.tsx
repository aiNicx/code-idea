import React, { useState, useEffect } from 'react';
import type { AgentConfig, ToolConfig, DocumentationSource, ToolName } from '../types';
import { TOOLS_CATALOG } from '../constants';
import { getDocumentationSources } from '../src/services/documentation/index';

interface ToolManagerProps {
    agentConfig: AgentConfig;
    onToolChange: (newTools: ToolConfig[]) => void;
}

const ToolManager: React.FC<ToolManagerProps> = ({ agentConfig, onToolChange }) => {
    // Ensure agentConfig and tools are always defined
    const safeAgentConfig = agentConfig || { tools: [] };

    // If no config, show empty state
    if (!agentConfig) {
        return (
            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No agent configuration available.
            </div>
        );
    }

    const handleToggle = (toolId: ToolConfig['id']) => {
        const newTools = safeAgentConfig.tools.map(tool =>
            tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
        );
        onToolChange(newTools);
    };
    
    const handleDocSelectionChange = (docId: string, isSelected: boolean) => {
        const newTools = safeAgentConfig.tools.map(tool => {
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

    if (safeAgentConfig.tools.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                This agent has no configurable tools available.
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-300 mb-1">Available Tools</h4>
                <p className="text-xs text-blue-200/80">Configure which tools this agent can use during execution</p>
            </div>

            {safeAgentConfig.tools.map(tool => {
                const toolMeta = TOOLS_CATALOG[tool.id];
                if (!toolMeta) return null;

                return (
                    <div key={tool.id} className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                        <ToolHeader
                            tool={tool}
                            toolMeta={toolMeta}
                            onToggle={handleToggle}
                        />
                        {tool.id === 'DocumentationSearch' && tool.enabled && (
                            <div className="border-t border-gray-700/50">
                                <DocumentationSelector
                                    selectedDocIds={tool.params?.documentationIds || []}
                                    onSelectionChange={handleDocSelectionChange}
                                />
                            </div>
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
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="flex items-center gap-4 flex-grow">
                <div className="p-2 bg-gray-700/50 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-400 flex-shrink-0" />
                </div>
                <div className="flex-grow">
                    <h4 className="font-semibold text-gray-200 mb-1" title={toolMeta.description}>{toolMeta.name}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{toolMeta.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
                <label htmlFor={`toggle-${tool.id}`} className="flex items-center cursor-pointer group" title={tool.enabled ? 'Disable this tool' : 'Enable this tool'}>
                    <div className="relative">
                        <input
                            id={`toggle-${tool.id}`}
                            type="checkbox"
                            className="sr-only"
                            checked={tool.enabled}
                            onChange={() => onToggle(tool.id)}
                        />
                        <div className={`block w-12 h-7 rounded-full transition-all duration-200 ${tool.enabled ? 'bg-indigo-600 shadow-lg' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-all duration-200 shadow-md ${tool.enabled ? 'translate-x-5' : ''}`}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {tool.enabled ? 'On' : 'Off'}
                    </span>
                </label>
            </div>
        </div>
    );
};

const DocumentationSelector: React.FC<{selectedDocIds: string[], onSelectionChange: (docId: string, selected: boolean) => void}> = ({ selectedDocIds, onSelectionChange }) => {
    const [docs, setDocs] = useState<DocumentationSource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDocs = async () => {
            try {
                setLoading(true);
                const docs = await getDocumentationSources();
                setDocs(docs);
            } catch (error) {
                console.error('Failed to load documentation sources:', error);
            } finally {
                setLoading(false);
            }
        };
        loadDocs();
    }, []);

    const selectedCount = selectedDocIds.length;

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Custom Documentation Access
                </h5>
                {selectedCount > 0 && (
                    <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-medium rounded-full">
                        {selectedCount} selected
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400"></div>
                    <span className="ml-2 text-sm text-gray-400">Loading documents...</span>
                </div>
            ) : docs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {docs.map(doc => (
                        <label
                            key={doc.id}
                            className="group flex items-start space-x-3 cursor-pointer p-3 bg-gray-800/50 rounded-md hover:bg-gray-700/70 border border-gray-700/50 hover:border-gray-600 transition-all"
                            title={`Select this document for ${doc.title} - Last modified: ${new Date(doc.metadata.updatedAt).toLocaleDateString()}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedDocIds.includes(doc.id)}
                                onChange={(e) => onSelectionChange(doc.id, e.target.checked)}
                                className="h-4 w-4 mt-0.5 rounded bg-gray-700 border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                                title={selectedDocIds.includes(doc.id) ? 'Unselect this document' : 'Select this document'}
                            />
                            <div className="flex-grow min-w-0">
                                <span className="text-sm text-gray-200 font-medium block truncate group-hover:text-white transition-colors">
                                    {doc.title}
                                </span>
                                <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                    Modified: {new Date(doc.metadata.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <svg className="mx-auto h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-1">No custom documents available</p>
                    <p className="text-xs text-gray-600">Create documentation in "Tools Overview" to make it available here</p>
                </div>
            )}
        </div>
    );
};

export default ToolManager;