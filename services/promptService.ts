import type { AgentName, AgentConfig } from '../types';
import { AGENT_PROMPTS as defaultPrompts } from './prompts';

const CONFIG_PREFIX = 'agent-config-';

/**
 * Retrieves the configuration for a single agent.
 * It first checks localStorage for a custom configuration.
 * If not found, it returns the default configuration.
 */
export function getAgentConfig(agentName: AgentName): AgentConfig {
  const storedConfig = localStorage.getItem(`${CONFIG_PREFIX}${agentName}`);
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig) as AgentConfig;
    } catch (error) {
      console.error(`Failed to parse config for ${agentName}, using default.`, error);
    }
  }

  // Return default config
  return {
    id: agentName,
    systemPrompt: defaultPrompts[agentName],
    lastModified: new Date(0).toISOString(), // Epoch time for default
    isCustom: false,
  };
}

/**
 * Saves an agent's configuration to localStorage.
 */
export function saveAgentConfig(config: AgentConfig): void {
  try {
    const configToSave = { ...config, isCustom: true, lastModified: new Date().toISOString() };
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
  for (const agentName in defaultPrompts) {
    const name = agentName as AgentName;
    allPrompts[name] = getAgentConfig(name).systemPrompt;
  }
  return allPrompts as Record<AgentName, string>;
}
