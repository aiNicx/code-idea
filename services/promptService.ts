import type { AgentName, AgentConfig, ToolConfig, ToolName } from '../types';
import { AGENT_PROMPTS as defaultPrompts } from './prompts';
import { AGENT_METADATA, TOOLS_CATALOG } from '../constants';

const CONFIG_PREFIX = 'agent-config-';

/**
 * Retrieves the configuration for a single agent.
 * It first checks localStorage for a custom configuration.
 * If not found, it returns the default configuration, including generating a default toolset.
 */
export function getAgentConfig(agentName: AgentName): AgentConfig {
  const storedConfig = localStorage.getItem(`${CONFIG_PREFIX}${agentName}`);
  const allToolIds = Object.keys(TOOLS_CATALOG) as ToolName[];

  if (storedConfig) {
    try {
      const parsed = JSON.parse(storedConfig) as AgentConfig;

      if (!parsed.tools) {
          parsed.tools = [];
      }
      
      // Migration logic: Ensure all known tools are present in the config.
      // This adds new tools to existing configs as disabled by default.
      const existingToolIds = new Set(parsed.tools.map(t => t.id));
      for (const toolId of allToolIds) {
          if (!existingToolIds.has(toolId)) {
              parsed.tools.push({ id: toolId, enabled: false });
          }
      }
      return parsed;
    } catch (error) {
      console.error(`Failed to parse config for ${agentName}, using default.`, error);
    }
  }

  // Generate default config
  const metadata = AGENT_METADATA[agentName];
  const defaultTools: ToolConfig[] = allToolIds.map(toolId => ({
    id: toolId,
    enabled: metadata.defaultTools.includes(toolId),
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
  }
}

/**
 * Resets an agent's configuration to its default state.
 * This is done by removing its custom configuration from localStorage.
 */
export function resetAgentConfig(agentName: AgentName): void {
    try {
        localStorage.removeItem(`${CONFIG_PREFIX}${agentName}`);
    } catch (error) {
        console.error(`Failed to reset config for ${agentName}.`, error);
    }
}

/**
 * Retrieves all agent configurations.
 */
export function getAllAgentConfigs(): AgentConfig[] {
    const allAgentNames = Object.keys(AGENT_METADATA) as AgentName[];
    return allAgentNames.map(getAgentConfig);
}

/**
 * Gets the effective prompts for all agents,
 * considering any user customizations from localStorage.
 */
export function getEffectivePrompts(): Record<AgentName, string> {
    const allConfigs = getAllAgentConfigs();
    const prompts: Partial<Record<AgentName, string>> = {};
    for (const config of allConfigs) {
        prompts[config.id] = config.systemPrompt;
    }
    return prompts as Record<AgentName, string>;
}