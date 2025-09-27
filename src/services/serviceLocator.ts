/**
 * Service Locator Pattern Implementation
 * Fornisce un punto centrale per la gestione delle dipendenze e previene dipendenze circolari
 */

import type { AgentConfiguration } from './agentConfiguration/types';

export interface IServiceLocator {
  register<T>(key: string, service: T): void;
  get<T>(key: string): T;
  has(key: string): boolean;
  clear(): void;
}

// Singleton service locator
class ServiceLocator implements IServiceLocator {
  private services = new Map<string, any>();

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found: ${key}`);
    }
    return service;
  }

  has(key: string): boolean {
    return this.services.has(key);
  }

  clear(): void {
    this.services.clear();
  }
}

export const serviceLocator = new ServiceLocator();

// Service keys
export const SERVICE_KEYS = {
  AGENT_CONFIG: 'agentConfiguration',
  DOCUMENTATION: 'documentation',
  API_CLIENT: 'apiClient',
  AGENT_EXECUTOR: 'agentExecutor',
  PROMPT_BUILDER: 'promptBuilder'
} as const;

// Utility function per registrare tutti i servizi principali
export function registerCoreServices(): void {
  // Lazy loading per evitare dipendenze circolari
  serviceLocator.register(SERVICE_KEYS.DOCUMENTATION, {
    getDocumentation: async (techStack: any, agentName: string) => {
      const { getDocumentation } = await import('./documentation');
      return getDocumentation(techStack, agentName);
    },
    getDocumentationSources: async () => {
      const { getDocumentationSources } = await import('./documentation');
      return getDocumentationSources();
    }
  });

  serviceLocator.register(SERVICE_KEYS.AGENT_CONFIG, {
    getAgentConfig: async (agentName: string) => {
      const { getAgentConfig } = await import('./agentConfiguration');
      return getAgentConfig(agentName);
    },
    saveAgentConfig: async (config: AgentConfiguration) => {
      const { saveAgentConfig } = await import('./agentConfiguration');
      return saveAgentConfig(config);
    }
  });
}