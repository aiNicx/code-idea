import type { AgentName, AgentConfig, ToolConfig } from '../types';
import { AGENT_PROMPTS as defaultPrompts } from './prompts';
import { AGENT_METADATA } from '../constants';

const CONFIG_PREFIX = 'agent-config-';

/**
 * Retrieves the configuration for a single agent.
 * It first checks localStorage for a custom configuration.
 * If not found, it returns the default configuration, including generating a default toolset.
 */
export function getAgentConfig(agentName: AgentName): AgentConfig {
  const storedConfig = localStorage.getItem(`${CONFIG_PREFIX}${agentName}`);
  if (storedConfig) {
    try {
      // Basic validation and migration for older configs
      const parsed = JSON.parse(storedConfig) as AgentConfig;
      if (!parsed.tools) {
          parsed.tools = [];
      }
      return parsed;
    } catch (error) {
      console.error(`Failed to parse config for ${agentName}, using default.`, error);
    }
  }

  // Generate default config
  const metadata = AGENT_METADATA[agentName];
  const defaultTools: ToolConfig[] = metadata.availableTools.map(toolId => ({
    id: toolId,
    enabled: toolId === 'DocumentationSearch', // Enable this tool by default where available
    params: {},
  }));

  return {
    id: agentName,
    systemPrompt: defaultPrompts[agentName],
    lastModified: new Date(0).toISOString(), // Epoch time for default
    isCustom: false,
    tools: defaultTools,
  };
}

/**
 * Saves an agent's configuration to localStorage.
 */
export function saveAgentConfig(config: AgentConfig): void {
  try {
    const configToSave: AgentConfig = { 
        ...config, 
        isCustom: true, 
        lastModified: new Date().toISOString() 
    };
    localStorage.setItem(`${CONFIG_PREFIX}${config.id}`, JSON.stringify(configToSave));
  } catch (error) {
    console.error(`Failed to save config for ${config.id}.`, error);
    alert('Could not save prompt. Your browser storage might be full.');
  }
}

/**
 * Resets an agent's configuration by removing it from localStorage.
 */
export function resetAgentConfig(agentName: AgentName): void {
  localStorage.removeItem(`${CONFIG_PREFIX}${agentName}`);
}

/**
 * Gets a simple map of agent names to their effective system prompts.
 * This is used by the core logic to run the agents.
 */
export function getEffectivePrompts(): Record<AgentName, string> {
  const allPrompts: Partial<Record<AgentName, string>> = {};
  const agentNames = Object.keys(defaultPrompts) as AgentName[];
  for (const agentName of agentNames) {
    allPrompts[agentName] = getAgentConfig(agentName).systemPrompt;
  }
  return allPrompts as Record<AgentName, string>;
}

/**
 * Gets the configurations for all known agents.
 */
export function getAllAgentConfigs(): AgentConfig[] {
    const agentNames = Object.keys(AGENT_METADATA) as AgentName[];
    return agentNames.map(getAgentConfig);
}