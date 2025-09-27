/**
 * AI Service - Interfaccia principale ottimizzata per il sistema modulare
 * Mantiene compatibilità con l'interfaccia esistente mentre usa l'architettura modulare
 */

import {
  agentExecutor,
  orchestratorAgent,
  createProjectBriefAgent,
  createOrchestratorAgent,
  type AgentObserver,
  type AgentExecutionResult,
  type AgentProgressEvent
} from './ai';
import { getDocumentation, getDocumentationSources } from './documentationService';
import type {
  ProgressUpdate,
  TechStack,
  DevelopedIdea,
  DevelopmentPlan,
  DocumentType,
  AgentName
} from '../../types';

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
 * AI Service principale - ottimizzato e modulare
 */
export class AIService {
  private observers: LegacyProgressObserver[] = [];
  private observerMap: Map<(progress: ProgressUpdate) => void, LegacyProgressObserver> = new Map();

  /**
   * Aggiunge un observer per il progresso
   */
  addProgressObserver(onProgress: (progress: ProgressUpdate) => void): void {
    // Se già esiste un observer per questo callback, non farne uno nuovo
    if (this.observerMap.has(onProgress)) {
      return;
    }

    const observer = new LegacyProgressObserver(onProgress, '');
    this.observers.push(observer);
    this.observerMap.set(onProgress, observer);
    agentExecutor.addObserver(observer);
  }

  /**
   * Rimuove un observer
   */
  removeProgressObserver(onProgress: (progress: ProgressUpdate) => void): void {
    const observer = this.observerMap.get(onProgress);
    if (observer) {
      agentExecutor.removeObserver(observer);
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
      this.observerMap.delete(onProgress);
    }
  }

  /**
   * Sviluppa un'idea usando il sistema modulare
   */
  async developIdea(
    initialIdea: string,
    techStack: TechStack,
    requestedDocuments: DocumentType[]
  ): Promise<{ finalResult: DevelopedIdea, agentTasks: any[] }> {
    try {
      // 1. Pianificazione con Orchestrator
      const agentTasks = await orchestratorAgent.planExecution(
        initialIdea,
        techStack,
        requestedDocuments
      );

      // 2. Creazione del piano di sviluppo
      const plan: DevelopmentPlan = {
        userIdea: initialIdea,
        techStack
      };

      // 3. Esecuzione parallela degli agenti
      const results = await agentExecutor.executeParallel(agentTasks, plan);

      // 4. Aggregazione risultati
      const finalPlan = this.aggregateResults(plan, results);

      // 5. Generazione documenti finali
      const finalResult = await this.generateFinalDocuments(finalPlan, requestedDocuments);

      return {
        finalResult,
        agentTasks: agentTasks.map(task => ({
          agent: task.agent,
          goal: task.goal,
          focus: task.focus
        }))
      };

    } catch (error) {
      console.error('AI Service execution failed:', error);
      throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Aggrega i risultati degli agenti nel piano di sviluppo
   */
  private aggregateResults(plan: DevelopmentPlan, results: any[]): DevelopmentPlan {
    const agentResultMap: Record<AgentName, string> = {
      ProjectBriefAgent: '',
      UserPersonaAgent: '',
      UserFlowAgent: '',
      DBSchemaAgent: '',
      APIEndpointAgent: '',
      ComponentArchitectureAgent: '',
      TechRationaleAgent: '',
      RoadmapAgent: '',
      OrchestratorAgent: '',
      DocumentGeneratorAgent: '',
      AgentExecutor: '',
      ApiClient: ''
    };

    // Mappa i risultati per agente
    for (const result of results) {
      if (result.success && result.result) {
        agentResultMap[result.agentName as AgentName] = result.result;
      }
    }

    // Aggiorna il piano con i risultati
    return {
      ...plan,
      projectBrief: agentResultMap.ProjectBriefAgent,
      userPersonas: agentResultMap.UserPersonaAgent,
      userFlow: agentResultMap.UserFlowAgent,
      dbSchema: agentResultMap.DBSchemaAgent,
      apiEndpoints: agentResultMap.APIEndpointAgent,
      componentArchitecture: agentResultMap.ComponentArchitectureAgent,
      techRationale: agentResultMap.TechRationaleAgent,
      projectRoadmap: agentResultMap.RoadmapAgent
    };
  }

  /**
   * Genera i documenti finali dal piano
   */
  private async generateFinalDocuments(
    plan: DevelopmentPlan,
    requestedDocuments: DocumentType[]
  ): Promise<DevelopedIdea> {
    const documents: DevelopedIdea = {};

    // Mappa i documenti richiesti ai contenuti del piano
    const documentMapping: Record<DocumentType, keyof DevelopmentPlan> = {
      projectBrief: 'projectBrief',
      userPersonas: 'userPersonas',
      userFlow: 'userFlow',
      dbSchema: 'dbSchema',
      apiEndpoints: 'apiEndpoints',
      componentArchitecture: 'componentArchitecture',
      techRationale: 'techRationale',
      projectRoadmap: 'projectRoadmap'
    };

    for (const docType of requestedDocuments) {
      const planKey = documentMapping[docType];
      const content = plan[planKey];

      if (content && typeof content === 'string') {
        // Determina il nome del file
        const fileName = this.getFileNameForDocument(docType);
        documents[fileName] = content;
      }
    }

    return documents;
  }

  /**
   * Determina il nome del file per un tipo di documento
   */
  private getFileNameForDocument(docType: DocumentType): string {
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

  /**
   * Carica la documentazione per un agente specifico
   */
  private async loadDocumentationForAgent(
    techStack: TechStack,
    agentName: AgentName
  ): Promise<string> {
    const docParts: string[] = [];

    try {
      // Carica documentazione tecnica
      const techDocs = getDocumentation(techStack, agentName);
      if (techDocs && techDocs !== 'No specific documentation provided for this task.') {
        docParts.push(techDocs);
      }

      // Carica documenti custom se disponibili
      // TODO: Implementare logica per documenti custom per agente specifico

      return docParts.length > 0 ? docParts.join('\n\n---\n\n') : 'No documentation available.';

    } catch (error) {
      console.warn('Failed to load documentation:', error);
      return 'Documentation loading failed.';
    }
  }

  /**
   * Restituisce statistiche sulle performance
   */
  getPerformanceStats() {
    return {
      observersCount: this.observers.length,
      executorStatus: 'active'
    };
  }
}

// Istanza singleton
export const aiService = new AIService();

// Funzione di compatibilità con l'interfaccia esistente
export async function developIdea(
  initialIdea: string,
  techStack: TechStack,
  requestedDocuments: DocumentType[],
  onProgress: (progress: ProgressUpdate) => void
): Promise<{ finalResult: DevelopedIdea, agentTasks: any[] }> {
  // Aggiunge l'observer per compatibilità
  aiService.addProgressObserver(onProgress);

  try {
    const result = await aiService.developIdea(initialIdea, techStack, requestedDocuments);
    return result;
  } finally {
    // Rimuove l'observer dopo l'esecuzione
    aiService.removeProgressObserver(onProgress);
  }
}