/**
 * Sistema AI modulare - Entry point principale
 * Esporta tutti i componenti del sistema AI ottimizzato
 */

// Core Components
export { ApiClient, apiClient } from './core/apiClient';
export {
  AgentExecutor,
  agentExecutor,
  SequentialExecutionStrategy,
  ParallelExecutionStrategy
} from './core/agentExecutor';

// Agents
export {
  OrchestratorAgent,
  orchestratorAgent,
  createOrchestratorAgent,
  type IOrchestratorAgent
} from './agents/orchestrator';

export {
  ProjectBriefAgent,
  projectBriefAgent,
  createProjectBriefAgent,
  type IProjectBriefAgent
} from './agents/specialized/projectBriefAgent';

export {
  UserPersonaAgent,
  userPersonaAgent,
  createUserPersonaAgent,
  type IUserPersonaAgent
} from './agents/specialized/userPersonaAgent';

export {
  UserFlowAgent,
  userFlowAgent,
  createUserFlowAgent,
  type IUserFlowAgent
} from './agents/specialized/userFlowAgent';

export {
  DBSchemaAgent,
  dbSchemaAgent,
  createDBSchemaAgent,
  type IDBSchemaAgent
} from './agents/specialized/dbSchemaAgent';

export {
  APIEndpointAgent,
  apiEndpointAgent,
  createAPIEndpointAgent,
  type IAPIEndpointAgent
} from './agents/specialized/apiEndpointAgent';

export {
  ComponentArchitectureAgent,
  componentArchitectureAgent,
  createComponentArchitectureAgent,
  type IComponentArchitectureAgent
} from './agents/specialized/componentArchitectureAgent';

export {
  TechRationaleAgent,
  techRationaleAgent,
  createTechRationaleAgent,
  type ITechRationaleAgent
} from './agents/specialized/techRationaleAgent';

export {
  RoadmapAgent,
  roadmapAgent,
  createRoadmapAgent,
  type IRoadmapAgent
} from './agents/specialized/roadmapAgent';

export {
  DocumentGeneratorAgent,
  documentGeneratorAgent,
  createDocumentGeneratorAgent,
  type IDocumentGeneratorAgent
} from './agents/generator';

// Utils
export {
  PromptBuilder,
  PromptTemplateRegistry,
  createDefaultTemplateRegistry,
  promptTemplateRegistry
} from './utils/promptBuilder';

export {
  ResponseParser,
  StructuredResponseValidator,
  ResponseFormatter,
  responseParser,
  responseValidator,
  responseFormatter
} from './utils/responseParser';

// Types
export * from './types';

// Re-export delle interfacce principali per retrocompatibilità
export type {
  AgentTask,
  AgentExecutionContext,
  AgentExecutionResult,
  DevelopmentPlan,
  PromptContext,
  ParallelExecutionConfig,
  AgentProgressEvent,
  AgentObserver
} from './types';