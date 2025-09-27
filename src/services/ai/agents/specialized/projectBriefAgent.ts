/**
 * Project Brief Agent - Modulare e ottimizzato
 * Genera il brief del progetto e le specifiche principali
 */

import { apiClient } from '../../core/apiClient';
import type { AgentExecutionContext } from '../../types';
import { serviceLocator, SERVICE_KEYS } from '../../../serviceLocator';

/**
 * Interfaccia per l'agente Project Brief
 */
export interface IProjectBriefAgent {
  execute(context: AgentExecutionContext): Promise<string>;
  validateInput(context: AgentExecutionContext): boolean;
}

/**
 * Implementazione del Project Brief Agent
 */
export class ProjectBriefAgent implements IProjectBriefAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Esegue la generazione del project brief
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context)) {
      throw new Error('Invalid execution context for ProjectBriefAgent');
    }

    try {
      // Carica la documentazione rilevante
      const documentation = await this.loadDocumentation(context);

      // Costruisce il prompt
      const prompt = await this.buildPrompt(context, documentation);

      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          summary: { type: 'string' as const },
          problemStatement: { type: 'string' as const },
          solution: { type: 'string' as const },
          coreFeatures: {
            type: 'array' as const,
            items: { type: 'string' as const }
          }
        },
        required: ['title', 'summary', 'problemStatement', 'solution', 'coreFeatures'] as const
      };

      // Esegue la chiamata API
      const response = await apiClient.execute<string>({
        model: this.model,
        prompt,
        options: {
          expectJson: true,
          schema,
          temperature: 0.7 // Creatività moderata
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate project brief');
      }

      // Converte il JSON in markdown
      return this.formatAsMarkdown(JSON.parse(response.data));

    } catch (error) {
      console.error('ProjectBriefAgent execution failed:', error);
      throw new Error(`Project brief generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Valida che il context sia appropriato per questo agente
   */
  validateInput(context: AgentExecutionContext): boolean {
    return !!(
      context.planContext?.userIdea &&
      context.planContext?.techStack &&
      context.task?.goal &&
      context.task?.focus
    );
  }

  /**
   * Carica la documentazione rilevante
   */
  private async loadDocumentation(context: AgentExecutionContext): Promise<string> {
    const docParts: string[] = [];

    try {
      // Carica la documentazione tecnica
      const documentationService = serviceLocator.get<any>('documentation');
      const techDocs = await documentationService.getDocumentation(context.techStack, 'ProjectBriefAgent');
      if (techDocs && techDocs !== 'No specific documentation provided for this task.') {
        docParts.push(techDocs);
      }

      // Carica documenti custom se disponibili
      const agentConfig = await this.getAgentConfig('ProjectBriefAgent');
      const docSearchTool = agentConfig?.tools?.find(tool => tool.id === 'DocumentationSearch' && tool.enabled);

      if (docSearchTool?.params?.documentationIds?.length) {
        const allCustomDocs = await documentationService.getDocumentationSources();
        const selectedDocsContent = allCustomDocs
          .filter(doc => docSearchTool.params!.documentationIds!.includes(doc.id))
          .map(doc => `--- CUSTOM DOCUMENTATION: "${doc.title}" ---\n${doc.content}`)
          .join('\n\n');

        if (selectedDocsContent) {
          docParts.push(selectedDocsContent);
        }
      }

      return docParts.length > 0 ? docParts.join('\n\n---\n\n') : 'No documentation available.';

    } catch (error) {
      console.warn('Failed to load documentation:', error);
      return 'Documentation loading failed.';
    }
  }


  /**
   * Costruisce il prompt per l'agente usando PromptBuilder
   */
  private async buildPrompt(context: AgentExecutionContext, documentation: string): Promise<string> {
    try {
      // Carica il template dal registry
      const { promptTemplateRegistry } = await import('../../utils/promptBuilder');
      const template = promptTemplateRegistry.get('projectBrief');

      if (!template) {
        throw new Error('Template projectBrief not found');
      }

      // Costruisce il prompt usando il PromptBuilder
      const { PromptBuilder } = await import('../../utils/promptBuilder');
      const promptBuilder = PromptBuilder.fromContext({
        userIdea: context.planContext?.userIdea || '',
        techStack: context.planContext?.techStack || { framework: 'React', backend: 'Convex', styling: 'Tailwind CSS', uiLibrary: 'Shadcn/UI', stateManagement: 'Zustand', auth: 'Convex Auth', features: { auth: true, crud: true, realtime: false } },
        requestedDocuments: [],
        planContext: context.planContext,
        taskGoal: context.task?.goal || '',
        taskFocus: context.task?.focus || '',
        documentation
      }, template.template);

      return promptBuilder.build();
    } catch (error) {
      console.error('Failed to build prompt:', error);
      // Fallback al prompt hardcoded se il builder fallisce
      return this.buildFallbackPrompt(context, documentation);
    }
  }

  /**
   * Costruisce il prompt di fallback (versione semplificata)
   */
  private async buildFallbackPrompt(context: AgentExecutionContext, documentation: string): Promise<string> {
    const planContextString = JSON.stringify(context.planContext, null, 2);

    return `You are a Product Manager. Your task is to refine the user's idea into a formal Project Brief.
Analyze the project context and output a JSON object with the following structure:
{
  "title": "Project title",
  "summary": "One sentence summary",
  "problemStatement": "Detailed problem description",
  "solution": "How the app solves the problem",
  "coreFeatures": ["feature1", "feature2", "feature3"]
}

**Project Context:**
${planContextString}

**Your Goal:** ${context.task?.goal || 'Generate project brief'}
**Your Focus:** ${context.task?.focus || 'Create comprehensive project documentation'}
**Relevant Documentation:**
${documentation}

Generate the project brief now.`;
  }

  /**
   * Converte il risultato JSON in formato markdown
   */
  private formatAsMarkdown(data: any): string {
    return `# ${data.title}

## Summary
${data.summary}

## Problem Statement
${data.problemStatement}

## Solution
${data.solution}

## Core Features
${data.coreFeatures.map((feature: string) => `- ${feature}`).join('\n')}

---

*Generated by ProjectBriefAgent*
`;
  }

  /**
   * Carica la configurazione dell'agente
   * Implementazione base con configurazione di default espandibile
   */
  private async getAgentConfig(agentName: string): Promise<any> {
    // Configurazione base placeholder funzionale
    // In futuro questa sarà sostituita da un sistema di configurazione modulare completo
    const baseConfig = {
      agentName,
      version: '1.0.0',
      capabilities: {
        projectBrief: {
          enabled: true,
          maxTokens: 2000,
          temperature: 0.7,
          model: 'gpt-4'
        }
      },
      settings: {
        timeout: 30000, // 30 secondi
        retryAttempts: 3,
        fallbackEnabled: true
      },
      // Placeholder per configurazioni specifiche dell'agente
      // Queste possono essere estese con validazione e persistenza
      customSettings: {}
    };

    // Log per debug - da rimuovere in produzione
    console.log(`[ProjectBriefAgent] Configurazione caricata per ${agentName}:`, baseConfig);

    return baseConfig;
  }
}

/**
 * Factory per creare l'agente Project Brief
 */
export const createProjectBriefAgent = (): IProjectBriefAgent => {
  return new ProjectBriefAgent();
};

// Istanza singleton
export const projectBriefAgent = createProjectBriefAgent();