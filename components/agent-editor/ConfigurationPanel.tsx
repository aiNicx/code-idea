import React, { useState, useEffect } from 'react';
import type { AgentName } from '../../types';
import { AGENT_METADATA } from '../../constants';
import { getAgentConfig, saveAgentConfig, resetAgentConfig } from '../../src/services/agentConfiguration';
import ToolManager from '../ToolManager';
import { InfoIcon, PromptIcon, ToolIcon, ResetIcon, SaveIcon } from '../EditorIcons';


interface ConfigurationPanelProps {
  agentName: AgentName;
  onConfigChange: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ agentName, onConfigChange }) => {
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'prompt' | 'tools'>('info');
  const [promptContent, setPromptContent] = useState('');
  const [toolSaveStatus, setToolSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metadata = AGENT_METADATA[agentName];
  const Icon = metadata.icon;

  // Carica configurazione all'inizializzazione
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const agentConfig = await getAgentConfig(agentName);

        if (agentConfig) {
          setConfig(agentConfig);
          // Nota: il nuovo sistema non ha systemPrompt, useremo customSettings come placeholder
          setPromptContent(JSON.stringify(agentConfig.customSettings, null, 2) || '');
        } else {
          // Crea configurazione di default se non esiste
          const defaultConfig = {
            id: `${agentName}_${Date.now()}`,
            agentName,
            version: '1.0.0',
            enabled: true,
            capabilities: {
              maxTokens: 2000,
              temperature: 0.7,
              model: 'gpt-4',
              timeout: 30000,
              retryAttempts: 3
            },
            settings: {
              fallbackEnabled: true,
              cachingEnabled: true,
              loggingEnabled: false
            },
            customSettings: {},
            tools: [], // Initialize empty tools array
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isCustom: false
            }
          };
          setConfig(defaultConfig);
          setPromptContent('');
        }
      } catch (err) {
        console.error('Failed to load agent config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [agentName]);

  const isPromptDirty = promptContent !== JSON.stringify(config?.customSettings || '', null, 2);
  
  const handleSave = async () => {
    if (!config) return;

    try {
      setError(null);

      // Parsea il contenuto del prompt come customSettings
      let customSettings = {};
      try {
        customSettings = JSON.parse(promptContent || '{}');
      } catch (parseError) {
        throw new Error('Invalid JSON in prompt content');
      }

      const newConfig = {
        ...config,
        customSettings,
        metadata: {
          ...config.metadata,
          updatedAt: new Date().toISOString(),
          isCustom: true
        }
      };

      await saveAgentConfig(newConfig);
      setConfig(newConfig);
      onConfigChange();

      setToolSaveStatus('saved');
      const timer = setTimeout(() => {
          setToolSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  const handleReset = async () => {
    if (!config) return;

    try {
      setError(null);
      const resetConfig = await resetAgentConfig(agentName);
      setConfig(resetConfig);
      setPromptContent(JSON.stringify(resetConfig.customSettings, null, 2) || '');
      onConfigChange();
    } catch (err) {
      console.error('Failed to reset config:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset configuration');
    }
  };

  const handleToolChange = async (newTools: any[]) => {
    if (!config) return;

    try {
      setError(null);
      const newConfig = {
        ...config,
        customSettings: {
          ...config.customSettings,
          tools: newTools
        },
        metadata: {
          ...config.metadata,
          updatedAt: new Date().toISOString(),
          isCustom: true
        }
      };

      await saveAgentConfig(newConfig);
      setConfig(newConfig);
      onConfigChange();

      setToolSaveStatus('saved');
      const timer = setTimeout(() => {
          setToolSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Failed to update tools:', err);
      setError(err instanceof Error ? err.message : 'Failed to update tools');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="p-4 space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                Agent Description
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">{metadata.summary}</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Current Configuration
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="group flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Enable or disable this agent">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-medium ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {config.enabled ? '✓ Active' : '✗ Disabled'}
                  </span>
                </div>
                <div className="group flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="AI model used by this agent">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-gray-200 font-medium">{config.capabilities.model}</span>
                </div>
                <div className="group flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Maximum response length in tokens">
                  <span className="text-gray-400">Max Tokens:</span>
                  <span className="text-gray-200">{config.capabilities.maxTokens.toLocaleString()}</span>
                </div>
                <div className="group flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Creativity/randomness of responses (0.0 = deterministic, 1.0 = very creative)">
                  <span className="text-gray-400">Temperature:</span>
                  <span className="text-gray-200">{config.capabilities.temperature}</span>
                </div>
                <div className="group flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Maximum time to wait for a response">
                  <span className="text-gray-400">Timeout:</span>
                  <span className="text-gray-200">{config.capabilities.timeout}ms</span>
                </div>
                <div className="group flex justify-between items-center py-2 px-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Number of retry attempts on failure">
                  <span className="text-gray-400">Retries:</span>
                  <span className="text-gray-200">{config.capabilities.retryAttempts}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Operational Settings
              </h3>
              <div className="space-y-4">
                <div className="group flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Automatically try alternative AI models if the primary one fails">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm font-medium">Fallback Mode</span>
                    <span className="text-xs text-gray-500">(Use alternative models on failure)</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.settings.fallbackEnabled ? 'bg-green-900/50 text-green-300 border border-green-700/30' : 'bg-red-900/50 text-red-300 border border-red-700/30'}`}>
                    {config.settings.fallbackEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="group flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors" title="Store responses in memory to speed up repeated requests">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm font-medium">Response Caching</span>
                    <span className="text-xs text-gray-500">(Cache responses for faster execution)</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.settings.cachingEnabled ? 'bg-green-900/50 text-green-300 border border-green-700/30' : 'bg-red-900/50 text-red-300 border border-red-700/30'}`}>
                    {config.settings.cachingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
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
        return <ToolManager agentConfig={config || { tools: [] }} onToolChange={handleToolChange} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex items-center justify-center">
        <div className="text-gray-400">Loading configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex items-center justify-center">
        <div className="text-red-400 text-center">
          <div className="mb-2">Configuration Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl h-full flex items-center justify-center">
        <div className="text-gray-400">No configuration available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl h-full flex flex-col shadow-xl">
      {/* Header */}
      <header className="flex-shrink-0 p-5 border-b border-gray-700/50">
        <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-3 rounded-xl border border-indigo-500/30 shadow-lg">
                <Icon className="h-10 w-10 text-indigo-300" />
            </div>
            <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-100 font-mono mb-1">{agentName}</h2>
                <p className="text-sm text-indigo-300 font-medium mb-2">{metadata.role}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{metadata.summary}</p>
                {config.metadata.isCustom && (
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-full">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-indigo-300 font-medium">Custom Configuration</span>
                  </div>
                )}
            </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex-shrink-0 flex border-b border-gray-700/50 bg-gray-800/30">
        <TabButton
          icon={InfoIcon}
          label="Configuration"
          isActive={activeTab === 'info'}
          onClick={() => setActiveTab('info')}
          tooltip="View and edit agent parameters like model, tokens, temperature"
        />
        <TabButton
          icon={PromptIcon}
          label="Prompt"
          isActive={activeTab === 'prompt'}
          onClick={() => setActiveTab('prompt')}
          tooltip="Customize the system prompt and behavior instructions"
        />
        <TabButton
          icon={ToolIcon}
          label="Tools"
          isActive={activeTab === 'tools'}
          onClick={() => setActiveTab('tools')}
          tooltip="Configure which tools this agent can access"
        />
      </nav>

      {/* Content */}
      <div className="flex-grow overflow-y-auto flex flex-col bg-gray-800/20">{renderTabContent()}</div>

      {/* Footer / Actions */}
      <footer className="flex-shrink-0 flex items-center justify-between gap-3 p-4 border-t border-gray-700/50 bg-gray-800/40">
        <div className="flex items-center gap-3 transition-all duration-300 min-w-0 flex-1">
             {toolSaveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full border border-green-700/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Configuration saved automatically
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 px-3 py-1.5 rounded-full border border-red-700/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
            )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
            {config.metadata.isCustom && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-300 bg-red-900/50 rounded-lg hover:bg-red-800/50 transition-all duration-200 border border-red-700/30 hover:border-red-600/50"
                title="Reset to default configuration"
              >
                <ResetIcon className="h-4 w-4" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isPromptDirty}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
              title={isPromptDirty ? "Save your changes" : "No changes to save"}
            >
                <SaveIcon className="h-5 w-5" />
                {isPromptDirty ? 'Save Changes' : 'Saved'}
            </button>
        </div>
      </footer>
    </div>
  );
};

const TabButton: React.FC<{icon: React.ComponentType<{className?: string}>, label: string, isActive: boolean, onClick: () => void, tooltip?: string}> = ({ icon: Icon, label, isActive, onClick, tooltip }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all duration-200 group ${
            isActive ? 'border-indigo-500 text-white bg-indigo-900/20' : 'border-transparent text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
        }`}
        title={tooltip}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>

        {/* Tooltip */}
        {tooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-xs text-gray-300 rounded-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
        )}
    </button>
);


export default ConfigurationPanel;