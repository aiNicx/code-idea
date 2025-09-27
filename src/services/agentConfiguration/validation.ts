/**
 * Validazione per configurazioni agenti
 * Fornisce validazione robusta con messaggi di errore chiari
 */

import type { AgentConfiguration, ConfigurationValidator } from './types';

export class ConfigurationValidatorImpl implements ConfigurationValidator {
  validateConfig(config: Partial<AgentConfiguration>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validazione campi obbligatori
    if (!config.agentName) {
      errors.push('Agent name is required');
    }

    if (config.version && !this.isValidVersion(config.version)) {
      errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }

    // Validazione capabilities se presente
    if (config.capabilities) {
      const capabilityErrors = this.validateCapability(config.capabilities);
      errors.push(...capabilityErrors.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCapability(capabilities: AgentConfiguration['capabilities']): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validazione maxTokens
    if (capabilities.maxTokens && (capabilities.maxTokens < 100 || capabilities.maxTokens > 8000)) {
      errors.push('maxTokens must be between 100 and 8000');
    }

    // Validazione temperature
    if (capabilities.temperature !== undefined && (capabilities.temperature < 0 || capabilities.temperature > 2)) {
      errors.push('temperature must be between 0 and 2');
    }

    // Validazione model
    if (capabilities.model && !this.isValidModel(capabilities.model)) {
      errors.push('model must be a valid OpenAI model (e.g., gpt-4, gpt-3.5-turbo)');
    }

    // Validazione timeout
    if (capabilities.timeout && capabilities.timeout < 1000) {
      errors.push('timeout must be at least 1000ms');
    }

    // Validazione retryAttempts
    if (capabilities.retryAttempts !== undefined && capabilities.retryAttempts < 0) {
      errors.push('retryAttempts cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  }

  private isValidModel(model: string): boolean {
    const validModels = [
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'text-davinci-003',
      'text-curie-001',
      'text-babbage-001',
      'text-ada-001'
    ];

    return validModels.includes(model);
  }

  // Validazione aggiuntiva per configurazioni personalizzate
  validateCustomSettings(customSettings: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Controlla che non ci siano chiavi riservate
    const reservedKeys = ['agentName', 'version', 'enabled', 'capabilities', 'settings', 'metadata'];
    const conflictingKeys = Object.keys(customSettings).filter(key => reservedKeys.includes(key));

    if (conflictingKeys.length > 0) {
      errors.push(`Custom settings cannot use reserved keys: ${conflictingKeys.join(', ')}`);
    }

    // Controlla dimensione massima
    const maxSize = 1024 * 1024; // 1MB
    const settingsString = JSON.stringify(customSettings);

    if (settingsString.length > maxSize) {
      errors.push('Custom settings exceed maximum size limit (1MB)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validazione completa di una configurazione
  validateFullConfig(config: AgentConfiguration): { isValid: boolean; errors: string[] } {
    const configValidation = this.validateConfig(config);
    const capabilityValidation = this.validateCapability(config.capabilities);
    const customSettingsValidation = this.validateCustomSettings(config.customSettings);

    return {
      isValid: configValidation.isValid && capabilityValidation.isValid && customSettingsValidation.isValid,
      errors: [
        ...configValidation.errors,
        ...capabilityValidation.errors,
        ...customSettingsValidation.errors
      ]
    };
  }
}

// Singleton instance
export const configurationValidator = new ConfigurationValidatorImpl();