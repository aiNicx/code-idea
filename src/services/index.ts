/**
 * Services - Barrel export principale
 * Centralizza tutti gli exports dei servizi per prevenire import circolari
 * e fornire un punto di ingresso unico per l'intera applicazione
 */

// AI Services - Sistema modulare (principale)
export * from './ai';

// Documentation Service (modulare)
export {
  DocumentationService,
  documentationService,
  getDocumentation,
  getDocumentationSources,
  saveDocumentationSource,
  deleteDocumentationSource
} from './documentation';

// Agent Configuration Service
export {
  AgentConfigurationManager,
  agentConfiguration,
  getAgentConfig,
  saveAgentConfig,
  resetAgentConfig
} from './agentConfiguration';

// Service Locator
export {
  serviceLocator,
  SERVICE_KEYS,
  registerCoreServices
} from './serviceLocator';