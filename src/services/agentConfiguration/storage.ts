/**
 * Storage layer per la configurazione agenti
 * Gestisce la persistenza su localStorage con error handling robusto
 */

import type { AgentConfiguration, ConfigurationStorage } from './types';

const STORAGE_KEY = 'agent_configurations';
const CONFIG_VERSION = '1.0.0';

export class LocalStorageConfigurationStorage implements ConfigurationStorage {
  private listeners: Array<(event: any) => void> = [];

  constructor() {
    // Ascolta eventi di storage per sincronizzazione multi-tab
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === STORAGE_KEY && event.newValue) {
      this.listeners.forEach(listener => listener(event));
    }
  }

  private getAllConfigs(): Record<string, AgentConfiguration> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[ConfigurationStorage] Error reading from localStorage:', error);
      return {};
    }
  }

  private saveAllConfigs(configs: Record<string, AgentConfiguration>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      // Notifica listeners del cambiamento
      this.listeners.forEach(listener => listener({ type: 'storage-changed' }));
    } catch (error) {
      console.error('[ConfigurationStorage] Error saving to localStorage:', error);
      throw new Error('Failed to save configuration');
    }
  }

  async getConfig(agentName: string): Promise<AgentConfiguration | null> {
    const configs = this.getAllConfigs();
    return configs[agentName] || null;
  }

  async saveConfig(config: AgentConfiguration): Promise<void> {
    const configs = this.getAllConfigs();

    const updatedConfig = {
      ...config,
      metadata: {
        ...config.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    configs[config.agentName] = updatedConfig;
    this.saveAllConfigs(configs);
  }

  async deleteConfig(agentName: string): Promise<void> {
    const configs = this.getAllConfigs();
    delete configs[agentName];
    this.saveAllConfigs(configs);
  }

  async listConfigs(): Promise<AgentConfiguration[]> {
    const configs = this.getAllConfigs();
    return Object.values(configs);
  }

  async resetConfig(agentName: string): Promise<AgentConfiguration> {
    const defaultConfig = this.createDefaultConfig(agentName);
    await this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  private createDefaultConfig(agentName: string): AgentConfiguration {
    return {
      id: `${agentName}_${Date.now()}`,
      agentName,
      version: CONFIG_VERSION,
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
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: false
      }
    };
  }

  // Utility per export/import configurazioni
  async exportConfigs(): Promise<string> {
    const configs = this.getAllConfigs();
    return JSON.stringify(configs, null, 2);
  }

  async importConfigs(jsonData: string): Promise<void> {
    try {
      const configs = JSON.parse(jsonData) as Record<string, AgentConfiguration>;
      this.saveAllConfigs(configs);
    } catch (error) {
      throw new Error('Invalid configuration data format');
    }
  }

  // Listener per eventi di configurazione
  addStorageListener(listener: (event: any) => void): void {
    this.listeners.push(listener);
  }

  removeStorageListener(listener: (event: any) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

// Singleton instance
export const configurationStorage = new LocalStorageConfigurationStorage();