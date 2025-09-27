/**
 * Orchestrator Agent - Modulare e ottimizzato
 * Responsabile della pianificazione e coordinamento degli agenti specializzati
 */

import { apiClient } from '../core/apiClient';
// Placeholder for legacy service
const getEffectivePrompts = () => ({
  OrchestratorAgent: `You are a world-class AI software architect. Your job is to create a step-by-step plan for generating project planning documents.
Analyze the user's idea, their chosen technology stack, and the list of documents they want to generate.
Based on this, output a JSON array of "AgentTask" objects. Each object represents a task for a specialized AI agent.

**User Idea:** "{{USER_IDEA}}"
**Tech Stack:**
{{TECH_STACK}}
**Requested Documents:** {{REQUESTED_DOCUMENTS}}

**Instructions:**
1. Your plan MUST be logical and sequential
2. Your plan MUST ONLY include agents that are absolutely necessary
3. If a document is not requested, you MUST NOT add an agent for it
4. Your output MUST be a valid JSON array

Create the JSON plan now.`
});
import type { AgentName, TechStack, DocumentType, DevelopmentPlan } from '../../../../types';
import type { AgentTask } from '../types';
import type { AgentExecutionContext, PromptContext } from '../types';

/**
 * Interfaccia per l'agente orchestratore
 */
export interface IOrchestratorAgent {
  planExecution(
    userIdea: string,
    techStack: TechStack,
    requestedDocuments: DocumentType[]
  ): Promise<AgentTask[]>;

  validatePlan(plan: DevelopmentPlan): boolean;
}

/**
 * Implementazione dell'Orchestrator Agent
 */
export class OrchestratorAgent implements IOrchestratorAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Pianifica l'esecuzione degli agenti basandosi su idea utente e documenti richiesti
   */
  async planExecution(
    userIdea: string,
    techStack: TechStack,
    requestedDocuments: DocumentType[]
  ): Promise<AgentTask[]> {
    // Carica i prompt configurati dall'utente
    const agentPrompts = getEffectivePrompts();

    // Costruisce il contesto per il prompt
    const promptContext: PromptContext = {
      userIdea,
      techStack,
      requestedDocuments
    };

    // Crea il prompt per l'orchestratore
    const orchestratorPrompt = this.buildOrchestratorPrompt(agentPrompts.OrchestratorAgent, promptContext);

    // Schema per la validazione della risposta
    const schema = {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          agent: { type: 'string' as const },
          goal: { type: 'string' as const },
          focus: { type: 'string' as const }
        },
        required: ['agent', 'goal', 'focus'] as const
      }
    };

    try {
      // Esegue la chiamata API
      const response = await apiClient.execute<AgentTask[]>({
        model: this.model,
        prompt: orchestratorPrompt,
        options: {
          expectJson: true,
          schema,
          temperature: 0.3 // Bassa temperatura per coerenza
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get plan from orchestrator');
      }

      // Valida il piano generato
      const tasks = response.data;
      this.validateGeneratedTasks(tasks, requestedDocuments);

      return tasks;

    } catch (error) {
      console.error('Orchestrator planning failed:', error);
      // Fallback: genera un piano di base
      return this.generateFallbackPlan(requestedDocuments);
    }
  }

  /**
   * Valida che il piano generato sia coerente
   */
  validatePlan(plan: DevelopmentPlan): boolean {
    if (!plan.userIdea || !plan.techStack) {
      return false;
    }

    // Verifica che tutti i documenti richiesti abbiano agenti corrispondenti
    const requiredDocuments = Object.keys(plan).filter(key =>
      key !== 'userIdea' && key !== 'techStack' && plan[key as keyof DevelopmentPlan]
    );

    return requiredDocuments.length > 0;
  }

  /**
   * Costruisce il prompt per l'orchestratore
   */
  private buildOrchestratorPrompt(template: string, context: PromptContext): string {
    const techStackString = JSON.stringify(context.techStack, null, 2);

    return template
      .replace('{{USER_IDEA}}', context.userIdea)
      .replace('{{TECH_STACK}}', techStackString)
      .replace('{{REQUESTED_DOCUMENTS}}', context.requestedDocuments.join(', '));
  }

  /**
   * Valida i task generati
   */
  private validateGeneratedTasks(tasks: AgentTask[], requestedDocuments: DocumentType[]): void {
    // Verifica che tutti i task abbiano agenti validi
    const validAgents = new Set([
      'ProjectBriefAgent', 'UserPersonaAgent', 'UserFlowAgent',
      'DBSchemaAgent', 'APIEndpointAgent', 'ComponentArchitectureAgent',
      'TechRationaleAgent', 'RoadmapAgent'
    ] as AgentName[]);

    for (const task of tasks) {
      if (!validAgents.has(task.agent as AgentName)) {
        throw new Error(`Invalid agent generated: ${task.agent}`);
      }
    }

    // Verifica che ci siano task per i documenti richiesti
    const taskAgents = new Set(tasks.map(t => t.agent));
    const missingDocuments = requestedDocuments.filter(doc => {
      const requiredAgent = this.getAgentForDocument(doc);
      return requiredAgent && !taskAgents.has(requiredAgent);
    });

    if (missingDocuments.length > 0) {
      console.warn(`Missing agents for documents: ${missingDocuments.join(', ')}`);
    }
  }

  /**
   * Mappa documenti ad agenti
   */
  private getAgentForDocument(document: DocumentType): AgentName | null {
    const mapping: Record<DocumentType, AgentName> = {
      projectBrief: 'ProjectBriefAgent',
      userPersonas: 'UserPersonaAgent',
      userFlow: 'UserFlowAgent',
      dbSchema: 'DBSchemaAgent',
      apiEndpoints: 'APIEndpointAgent',
      componentArchitecture: 'ComponentArchitectureAgent',
      techRationale: 'TechRationaleAgent',
      projectRoadmap: 'RoadmapAgent'
    };

    return mapping[document] || null;
  }

  /**
   * Genera un piano di fallback in caso di errore
   */
  private generateFallbackPlan(requestedDocuments: DocumentType[]): AgentTask[] {
    const fallbackTasks: AgentTask[] = [];
    const agentMapping: Record<DocumentType, AgentName> = {
      projectBrief: 'ProjectBriefAgent',
      userPersonas: 'UserPersonaAgent',
      userFlow: 'UserFlowAgent',
      dbSchema: 'DBSchemaAgent',
      apiEndpoints: 'APIEndpointAgent',
      componentArchitecture: 'ComponentArchitectureAgent',
      techRationale: 'TechRationaleAgent',
      projectRoadmap: 'RoadmapAgent'
    };

    for (const document of requestedDocuments) {
      const agent = agentMapping[document];
      if (agent) {
        fallbackTasks.push({
          agent,
          goal: `Generate ${document} based on user requirements`,
          focus: `Create comprehensive ${document} documentation`
        });
      }
    }

    return fallbackTasks;
  }

  /**
   * Esegue l'agente (per compatibilità con il sistema modulare)
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // L'orchestrator non viene eseguito come agente normale
    // ma viene chiamato direttamente dal sistema
    throw new Error('Orchestrator should not be executed as a regular agent');
  }
}

// Factory per creare l'orchestrator
export const createOrchestratorAgent = (): IOrchestratorAgent => {
  return new OrchestratorAgent();
};

// Istanza singleton
export const orchestratorAgent = createOrchestratorAgent();