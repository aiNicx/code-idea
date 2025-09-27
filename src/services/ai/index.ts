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

// Import types for developIdea function
import type { ProgressUpdate, TechStack, DevelopedIdea, DocumentType } from '../../../types';

/**
 * Funzione principale per sviluppare un'idea usando il sistema AI modulare
 * Compatibile con l'interfaccia esistente ma usa l'architettura modulare
 */
export async function developIdea(
  initialIdea: string,
  techStack: TechStack,
  requestedDocuments: DocumentType[],
  onProgress: (progress: ProgressUpdate) => void
): Promise<{ finalResult: DevelopedIdea, agentTasks: any[] }> {
  // Aggiunge l'observer per compatibilità
  const observer = new LegacyProgressObserver(onProgress, 'developIdea');
  agentExecutor.addObserver(observer);

  try {
    // Crea il piano di sviluppo usando l'orchestrator
    const planContext = {
      userIdea: initialIdea,
      techStack,
      requestedDocuments
    };

    // Esegue l'orchestrazione
    const results = await agentExecutor.executePlan(planContext);

    // Converte i risultati nel formato legacy
    const finalResult: DevelopedIdea = {
      idea: initialIdea,
      techStack,
      documents: results.reduce((docs, result) => {
        if (result.success && result.output) {
          // Determina il tipo di documento dal risultato
          const docType = determineDocumentType(result.agentName);
          if (docType && requestedDocuments.includes(docType)) {
            const fileName = getFileNameForDocument(docType);
            docs[fileName] = result.output;
          }
        }
        return docs;
      }, {} as Record<string, string>)
    };

    const agentTasks = results.map(result => ({
      agent: result.agentName,
      status: result.success ? 'completed' : 'failed',
      output: result.output,
      error: result.error?.message
    }));

    return { finalResult, agentTasks };
  } finally {
    // Rimuove l'observer dopo l'esecuzione
    agentExecutor.removeObserver(observer);
  }
}

/**
 * Observer per convertire eventi del sistema modulare in formato legacy
 */
class LegacyProgressObserver implements AgentObserver {
  private progressCallback: (progress: ProgressUpdate) => void;
  private id: string;

  constructor(onProgress: (progress: ProgressUpdate) => void, id: string) {
    this.progressCallback = onProgress;
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  onProgress(event: AgentProgressEvent): void {
    // Converte eventi del sistema modulare in formato legacy
    if (event.type === 'started') {
      this.progressCallback({
        agentTasks: [],
        currentIteration: 0,
        totalIterations: 1,
        currentTaskDescription: event.message || 'Starting...',
        currentAgent: 'OrchestratorAgent'
      });
    } else if (event.type === 'completed' || event.type === 'failed') {
      this.progressCallback({
        agentTasks: [],
        currentIteration: 1,
        totalIterations: 1,
        currentTaskDescription: event.message || 'Completed',
        currentAgent: 'OrchestratorAgent'
      });
    }
  }

  onComplete(results: AgentExecutionResult[]): void {
    // Gestisce completamento
  }

  onError(error: Error): void {
    throw error;
  }
}

/**
 * Determina il tipo di documento dall'agente
 */
function determineDocumentType(agentName: string): DocumentType | null {
  const mapping: Record<string, DocumentType> = {
    'ProjectBriefAgent': 'projectBrief',
    'UserPersonaAgent': 'userPersonas',
    'UserFlowAgent': 'userFlow',
    'DBSchemaAgent': 'dbSchema',
    'APIEndpointAgent': 'apiEndpoints',
    'ComponentArchitectureAgent': 'componentArchitecture',
    'TechRationaleAgent': 'techRationale',
    'RoadmapAgent': 'projectRoadmap'
  };

  return mapping[agentName] || null;
}

/**
 * Determina il nome del file per un tipo di documento
 */
function getFileNameForDocument(docType: DocumentType): string {
  const fileNames: Record<DocumentType, string> = {
    projectBrief: 'Project_Brief.md',
    userPersonas: 'User_Personas.md',
    userFlow: 'User_Flow.md',
    dbSchema: 'Database_Schema.md',
    apiEndpoints: 'API_Endpoints.md',
    componentArchitecture: 'Component_Architecture.md',
    techRationale: 'Tech_Rationale.md',
    projectRoadmap: 'Project_Roadmap.md'
  };

  return fileNames[docType] || `${docType}.md`;
}