/**
 * Tipi specifici per il sistema di configurazione agenti
 */

export interface AgentConfiguration {
  id: string;
  agentName: string;
  version: string;
  enabled: boolean;
  capabilities: {
    maxTokens: number;
    temperature: number;
    model: string;
    timeout: number;
    retryAttempts: number;
  };
  settings: {
    fallbackEnabled: boolean;
    cachingEnabled: boolean;
    loggingEnabled: boolean;
  };
  customSettings: Record<string, any>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    isCustom: boolean;
  };
}

export interface ConfigurationStorage {
  getConfig(agentName: string): Promise<AgentConfiguration | null>;
  saveConfig(config: AgentConfiguration): Promise<void>;
  deleteConfig(agentName: string): Promise<void>;
  listConfigs(): Promise<AgentConfiguration[]>;
  resetConfig(agentName: string): Promise<AgentConfiguration>;
}

export interface ConfigurationValidator {
  validateConfig(config: Partial<AgentConfiguration>): { isValid: boolean; errors: string[] };
  validateCapability(capability: AgentConfiguration['capabilities']): { isValid: boolean; errors: string[] };
}

export interface ConfigurationMigration {
  migrate(fromVersion: string, toVersion: string, config: AgentConfiguration): AgentConfiguration;
  getMigrationPath(currentVersion: string): string[];
}

export interface ConfigurationEvent {
  type: 'config-created' | 'config-updated' | 'config-deleted' | 'config-reset';
  agentName: string;
  config: AgentConfiguration;
  timestamp: string;
  userId?: string;
}

export interface ConfigurationEventEmitter {
  on(event: string, listener: (event: ConfigurationEvent) => void): void;
  off(event: string, listener: (event: ConfigurationEvent) => void): void;
  emit(event: ConfigurationEvent): void;
}