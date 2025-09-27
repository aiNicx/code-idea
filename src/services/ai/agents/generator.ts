/**
 * Document Generator Agent - Modulare e ottimizzato
 * Assembla tutti i documenti generati in un output finale
 */

import { apiClient } from '../core/apiClient';
import type { AgentExecutionContext, DevelopmentPlan } from '../types';
import { getOptimalModel } from '../utils/modelSelector';

/**
 * Interfaccia per l'agente Document Generator
 */
export interface IDocumentGeneratorAgent {
  execute(context: AgentExecutionContext, developmentPlan: DevelopmentPlan): Promise<string>;
  validateInput(context: AgentExecutionContext, developmentPlan: DevelopmentPlan): boolean;
}

/**
 * Implementazione del Document Generator Agent
 */
export class DocumentGeneratorAgent implements IDocumentGeneratorAgent {
  private get model() {
    return getOptimalModel();
  }

  /**
   * Esegue la generazione dei documenti finali
   */
  async execute(context: AgentExecutionContext, developmentPlan: DevelopmentPlan): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context, developmentPlan)) {
      throw new Error('Invalid execution context for DocumentGeneratorAgent');
    }

    try {
      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          summary: { type: 'string' as const },
          documents: {
            type: 'object' as const,
            additionalProperties: { type: 'string' as const }
          },
          file_structure: {
            type: 'object' as const,
            properties: {
              description: { type: 'string' as const },
              files: {
                type: 'array' as const,
                items: { type: 'string' as const }
              }
            }
          }
        },
        required: ['summary', 'documents', 'file_structure'] as const
      };

      // Costruisce il prompt con tutti i documenti generati
      const prompt = this.buildPrompt(context, developmentPlan);

      // Esegue la chiamata API
      const response = await apiClient.execute<string>({
        model: this.model,
        prompt,
        options: {
          expectJson: true,
          schema,
          temperature: 0.5
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate final documents');
      }

      // Restituisce direttamente il JSON con tutti i documenti
      return response.data;

    } catch (error) {
      console.error('DocumentGeneratorAgent execution failed:', error);
      throw new Error(`Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Valida che il context e il development plan siano appropriati
   */
  validateInput(context: AgentExecutionContext, developmentPlan: DevelopmentPlan): boolean {
    return !!(
      context.planContext?.userIdea &&
      context.planContext?.techStack &&
      developmentPlan &&
      Object.keys(developmentPlan).length > 2 // Almeno userIdea e techStack
    );
  }

  /**
   * Costruisce il prompt per l'agente con tutti i documenti
   */
  private buildPrompt(context: AgentExecutionContext, developmentPlan: DevelopmentPlan): string {
    const requestedDocuments = this.getRequestedDocuments(context);
    const planContextString = JSON.stringify(developmentPlan, null, 2);

    return `You are an expert AI document generator. Your final task is to assemble the project documents.

**Complete Development Plan:**
${planContextString}

**Requested Documents:** ${requestedDocuments.join(', ')}

**Instructions:**
1. Assemble all generated content into properly formatted markdown documents
2. Only include documents that were specifically requested
3. Ensure each document has proper headers, formatting, and structure
4. Output as JSON with the following structure:
{
  "summary": "Brief summary of the generated documentation",
  "documents": {
    "Project_Brief.md": "Complete markdown content...",
    "User_Personas.md": "Complete markdown content...",
    "Database_Schema.md": "Complete markdown content..."
  },
  "file_structure": {
    "description": "Overview of the generated file structure",
    "files": ["Project_Brief.md", "User_Personas.md", "Database_Schema.md"]
  }
}

Generate the final JSON object containing the requested project documents now.`;
  }

  /**
   * Determina quali documenti sono stati richiesti
   */
  private getRequestedDocuments(context: AgentExecutionContext): string[] {
    // Questo dovrebbe essere passato dal sistema orchestratore
    // Per ora assumiamo tutti i documenti principali
    return [
      'Project_Brief.md',
      'User_Personas.md',
      'User_Flow.md',
      'Database_Schema.md',
      'API_Endpoints.md',
      'Component_Architecture.md',
      'Tech_Rationale.md',
      'Project_Roadmap.md'
    ];
  }
}

/**
 * Factory per creare l'agente Document Generator
 */
export const createDocumentGeneratorAgent = (): IDocumentGeneratorAgent => {
  return new DocumentGeneratorAgent();
};

// Istanza singleton
export const documentGeneratorAgent = createDocumentGeneratorAgent();