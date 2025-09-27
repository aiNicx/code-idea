/**
 * Roadmap Agent - Modulare e ottimizzato
 * Crea la roadmap di sviluppo del progetto
 */

import { apiClient } from '../../core/apiClient';
import type { AgentExecutionContext } from '../../types';

/**
 * Interfaccia per l'agente Roadmap
 */
export interface IRoadmapAgent {
  execute(context: AgentExecutionContext): Promise<string>;
  validateInput(context: AgentExecutionContext): boolean;
}

/**
 * Implementazione del Roadmap Agent
 */
export class RoadmapAgent implements IRoadmapAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Esegue la generazione della roadmap
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context)) {
      throw new Error('Invalid execution context for RoadmapAgent');
    }

    try {
      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          description: { type: 'string' as const },
          phases: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                version: { type: 'string' as const },
                name: { type: 'string' as const },
                description: { type: 'string' as const },
                timeframe: { type: 'string' as const },
                features: {
                  type: 'array' as const,
                  items: { type: 'string' as const }
                },
                deliverables: {
                  type: 'array' as const,
                  items: { type: 'string' as const }
                },
                success_criteria: {
                  type: 'array' as const,
                  items: { type: 'string' as const }
                }
              },
              required: ['version', 'name', 'description', 'features'] as const
            }
          }
        },
        required: ['title', 'description', 'phases'] as const
      };

      // Costruisce il prompt
      const prompt = this.buildPrompt(context);

      // Esegue la chiamata API
      const response = await apiClient.execute<string>({
        model: this.model,
        prompt,
        options: {
          expectJson: true,
          schema,
          temperature: 0.7
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate project roadmap');
      }

      // Converte il JSON in markdown
      return this.formatAsMarkdown(JSON.parse(response.data));

    } catch (error) {
      console.error('RoadmapAgent execution failed:', error);
      throw new Error(`Roadmap generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Costruisce il prompt per l'agente
   */
  private buildPrompt(context: AgentExecutionContext): string {
    const planContextString = JSON.stringify(context.planContext, null, 2);

    return `You are a Product Manager. Your task is to create a high-level project roadmap for this application.

**Project Context:**
${planContextString}

**Your Goal:** ${context.task.goal}
**Your Focus:** ${context.task.focus}

**Instructions:**
1. Group features into logical development phases
2. Consider MVP (Minimum Viable Product) as the first phase
3. Plan subsequent versions with incremental improvements
4. Include realistic timeframes and success criteria
5. Output as JSON with the following structure:
{
  "title": "Project Roadmap",
  "description": "Strategic development plan overview",
  "phases": [
    {
      "version": "1.0.0",
      "name": "MVP",
      "description": "Core functionality for initial launch",
      "timeframe": "4-6 weeks",
      "features": [
        "User authentication",
        "Basic CRUD operations",
        "Simple UI with core features"
      ],
      "deliverables": [
        "Working application",
        "User acceptance testing",
        "Production deployment"
      ],
      "success_criteria": [
        "100+ active users",
        "Core features working",
        "Positive user feedback"
      ]
    }
  ]
}

Generate the project roadmap now.`;
  }

  /**
   * Converte il risultato JSON in formato markdown
   */
  private formatAsMarkdown(data: any): string {
    let markdown = `# ${data.title}\n\n`;
    markdown += `${data.description}\n\n`;

    markdown += `## Development Phases\n\n`;

    data.phases.forEach((phase: any, index: number) => {
      markdown += `### ${phase.version} - ${phase.name}\n\n`;
      markdown += `**Description:** ${phase.description}\n\n`;

      if (phase.timeframe) {
        markdown += `**Timeframe:** ${phase.timeframe}\n\n`;
      }

      if (phase.features && phase.features.length > 0) {
        markdown += `**Key Features:**\n`;
        phase.features.forEach((feature: string) => {
          markdown += `- ${feature}\n`;
        });
        markdown += `\n`;
      }

      if (phase.deliverables && phase.deliverables.length > 0) {
        markdown += `**Deliverables:**\n`;
        phase.deliverables.forEach((deliverable: string) => {
          markdown += `- ${deliverable}\n`;
        });
        markdown += `\n`;
      }

      if (phase.success_criteria && phase.success_criteria.length > 0) {
        markdown += `**Success Criteria:**\n`;
        phase.success_criteria.forEach((criterion: string) => {
          markdown += `- ${criterion}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });

    markdown += `*Generated by RoadmapAgent*\n`;

    return markdown;
  }
}

/**
 * Factory per creare l'agente Roadmap
 */
export const createRoadmapAgent = (): IRoadmapAgent => {
  return new RoadmapAgent();
};

// Istanza singleton
export const roadmapAgent = createRoadmapAgent();