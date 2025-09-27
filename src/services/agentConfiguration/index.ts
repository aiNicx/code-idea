/**
 * API pubblica per il sistema di configurazione agenti
 * Fornisce un'interfaccia unificata per gestire configurazioni
 */

import { configurationStorage } from './storage';
import { configurationValidator } from './validation';
import type {
  AgentConfiguration,
  ConfigurationEvent,
  ConfigurationEventEmitter
} from './types';

// Event emitter per notifiche di configurazione
class ConfigurationEventEmitterImpl implements ConfigurationEventEmitter {
  private listeners: Map<string, Array<(event: ConfigurationEvent) => void>> = new Map();

  on(event: string, listener: (event: ConfigurationEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: (event: ConfigurationEvent) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: ConfigurationEvent): void {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event));
    }

    // Emetti anche evento generico 'config-changed'
    const genericListeners = this.listeners.get('config-changed');
    if (genericListeners) {
      genericListeners.forEach(listener => listener(event));
    }
  }
}

// Singleton event emitter
const eventEmitter = new ConfigurationEventEmitterImpl();

/**
 * API principale per la gestione configurazioni
 */
export class AgentConfigurationManager {
  private storage = configurationStorage;
  private validator = configurationValidator;
  private events = eventEmitter;

  /**
   * Carica configurazione per un agente
   */
  async getAgentConfig(agentName: string): Promise<AgentConfiguration | null> {
    return this.storage.getConfig(agentName);
  }

  /**
   * Salva configurazione per un agente
   */
  async saveAgentConfig(config: AgentConfiguration): Promise<void> {
    // Validazione completa
    const validation = this.validator.validateFullConfig(config);
    if (!validation.isValid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    await this.storage.saveConfig(config);

    // Emetti evento
    this.events.emit({
      type: 'config-updated',
      agentName: config.agentName,
      config,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Salva configurazione parziale (merge con esistente)
   */
  async updateAgentConfig(agentName: string, updates: Partial<AgentConfiguration>): Promise<AgentConfiguration> {
    const existing = await this.getAgentConfig(agentName);

    if (!existing) {
      throw new Error(`No configuration found for agent: ${agentName}`);
    }

    const updated: AgentConfiguration = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        updatedAt: new Date().toISOString(),
        isCustom: true
      }
    };

    await this.saveAgentConfig(updated);
    return updated;
  }

  /**
   * Elimina configurazione per un agente
   */
  async deleteAgentConfig(agentName: string): Promise<void> {
    const existing = await this.getAgentConfig(agentName);
    if (!existing) {
      throw new Error(`No configuration found for agent: ${agentName}`);
    }

    await this.storage.deleteConfig(agentName);

    // Emetti evento
    this.events.emit({
      type: 'config-deleted',
      agentName,
      config: existing,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Resetta configurazione ai valori di default
   */
  async resetAgentConfig(agentName: string): Promise<AgentConfiguration> {
    const existing = await this.getAgentConfig(agentName);

    const resetConfig = await this.storage.resetConfig(agentName);

    // Emetti evento
    this.events.emit({
      type: 'config-reset',
      agentName,
      config: resetConfig,
      timestamp: new Date().toISOString()
    });

    return resetConfig;
  }

  /**
   * Lista tutte le configurazioni
   */
  async listAgentConfigs(): Promise<AgentConfiguration[]> {
    return this.storage.listConfigs();
  }

  /**
   * Esporta tutte le configurazioni
   */
  async exportConfigs(): Promise<string> {
    return this.storage.exportConfigs();
  }

  /**
   * Importa configurazioni da JSON
   */
  async importConfigs(jsonData: string): Promise<void> {
    await this.storage.importConfigs(jsonData);
  }

  /**
   * Event listener per configurazioni
   */
  onConfigurationChange(listener: (event: ConfigurationEvent) => void): void {
    this.events.on('config-changed', listener);
  }

  offConfigurationChange(listener: (event: ConfigurationEvent) => void): void {
    this.events.off('config-changed', listener);
  }
}

// Singleton instance
export const agentConfiguration = new AgentConfigurationManager();

// API di convenienza per retrocompatibilità
export const getAgentConfig = (agentName: string) => agentConfiguration.getAgentConfig(agentName);
export const saveAgentConfig = (config: AgentConfiguration) => agentConfiguration.saveAgentConfig(config);
export const resetAgentConfig = (agentName: string) => agentConfiguration.resetAgentConfig(agentName);

// Re-export dei tipi principali
export type * from './types';