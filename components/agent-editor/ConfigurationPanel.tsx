import React, { useState, useEffect } from 'react';
import type { AgentName, AgentConfig } from '../../types';
import { AGENT_METADATA } from '../../constants';
import { getAgentConfig, saveAgentConfig, resetAgentConfig } from '../../services/promptService';
import ToolManager from '../ToolManager';
import { InfoIcon, PromptIcon, ToolIcon, ResetIcon, SaveIcon } from '../EditorIcons';


interface ConfigurationPanelProps {
  agentName: AgentName;
  onConfigChange: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ agentName, onConfigChange }) => {
  const [config, setConfig] = useState<AgentConfig>(() => getAgentConfig(agentName));
  const [activeTab, setActiveTab] = useState<'info' | 'prompt' | 'tools'>('info');
  const [promptContent, setPromptContent] = useState(config.systemPrompt);
  const [toolSaveStatus, setToolSaveStatus] = useState<'idle' | 'saved'>('idle');

  const metadata = AGENT_METADATA[agentName];
  const Icon = metadata.icon;

  const isPromptDirty = promptContent !== config.systemPrompt;
  
  const handleSave = () => {
    const newConfig = { ...config, systemPrompt: promptContent };
    saveAgentConfig(newConfig);
    setConfig(getAgentConfig(agentName));
    onConfigChange();
  };

  const handleReset = () => {
    resetAgentConfig(agentName);
    const defaultConfig = getAgentConfig(agentName);
    setConfig(defaultConfig);
    setPromptContent(defaultConfig.systemPrompt);
    onConfigChange();
  };
  
  const handleToolChange = (newTools: AgentConfig['tools']) => {
    const newConfig = { ...config, tools: newTools };
    saveAgentConfig(newConfig);
    setConfig(getAgentConfig(agentName));
    onConfigChange();

    setToolSaveStatus('saved');
    const timer = setTimeout(() => {
        setToolSaveStatus('idle');
    }, 3000);
    return () => clearTimeout(timer);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-300">{metadata.summary}</p>
          </div>
        );
      case 'prompt':
        return (
          <div className="p-1 flex-grow flex flex-col min-h-0">
             <textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                className="w-full h-full min-h-[40vh] lg:min-h-0 p-3 bg-gray-900 border border-gray-600 rounded-md text-sm font-mono text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        );
      case 'tools':
        return <ToolManager agentConfig={config} onToolChange={handleToolChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex items-start gap-4">
            <div className="bg-gray-900 p-2 rounded-lg border border-gray-600">
                <Icon className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-100 font-mono">{agentName}</h2>
                <p className="text-sm text-indigo-400">{metadata.role}</p>
            </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex-shrink-0 flex border-b border-gray-700">
        <TabButton icon={InfoIcon} label="Info" isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
        <TabButton icon={PromptIcon} label="Prompt" isActive={activeTab === 'prompt'} onClick={() => setActiveTab('prompt')} />
        <TabButton icon={ToolIcon} label="Tools" isActive={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
      </nav>

      {/* Content */}
      <div className="flex-grow overflow-y-auto flex flex-col">{renderTabContent()}</div>

      {/* Footer / Actions */}
      <footer className="flex-shrink-0 flex items-center justify-between gap-3 p-3 border-t border-gray-700 bg-gray-800/30">
        <div className="transition-opacity duration-300 h-6">
             {toolSaveStatus === 'saved' && (
                <p className="text-sm text-green-400 flex items-center gap-2">
                    ✅ Tool settings saved automatically.
                </p>
            )}
        </div>
        <div className="flex items-center gap-3">
            {config.isCustom && (
              <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-900/50 rounded-md hover:bg-red-800/50 transition-colors">
                <ResetIcon className="h-4 w-4" />
                Reset to Default
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={!isPromptDirty}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                <SaveIcon className="h-5 w-5" />
                Save Prompt
            </button>
        </div>
      </footer>
    </div>
  );
};

const TabButton: React.FC<{icon: React.ComponentType<{className?: string}>, label: string, isActive: boolean, onClick: () => void}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-colors ${
        isActive ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
    }`}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
);


export default ConfigurationPanel;