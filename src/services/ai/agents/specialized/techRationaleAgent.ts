/**
 * Tech Rationale Agent - Modulare e ottimizzato
 * Giustifica le scelte tecnologiche del progetto
 */

import { apiClient } from '../../core/apiClient';
import type { AgentExecutionContext } from '../../types';

/**
 * Interfaccia per l'agente Tech Rationale
 */
export interface ITechRationaleAgent {
  execute(context: AgentExecutionContext): Promise<string>;
  validateInput(context: AgentExecutionContext): boolean;
}

/**
 * Implementazione del Tech Rationale Agent
 */
export class TechRationaleAgent implements ITechRationaleAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Esegue la generazione della rationale tecnologica
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context)) {
      throw new Error('Invalid execution context for TechRationaleAgent');
    }

    try {
      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          overview: { type: 'string' as const },
          technologies: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                category: { type: 'string' as const },
                technology: { type: 'string' as const },
                rationale: { type: 'string' as const },
                alternatives: {
                  type: 'array' as const,
                  items: { type: 'string' as const }
                },
                benefits: {
                  type: 'array' as const,
                  items: { type: 'string' as const }
                }
              },
              required: ['category', 'technology', 'rationale'] as const
            }
          },
          conclusion: { type: 'string' as const }
        },
        required: ['title', 'overview', 'technologies', 'conclusion'] as const
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
          temperature: 0.6
        }
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate tech rationale');
      }

      // Converte il JSON in markdown
      return this.formatAsMarkdown(JSON.parse(response.data));

    } catch (error) {
      console.error('TechRationaleAgent execution failed:', error);
      throw new Error(`Tech rationale generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const techStack = context.planContext?.techStack;
    const techStackString = JSON.stringify(techStack, null, 2);

    return `You are a software architect. Your task is to justify the chosen technology stack for this project.

**Project Context:**
${JSON.stringify(context.planContext, null, 2)}

**Selected Tech Stack:**
${techStackString}

**Your Goal:** ${context.task.goal}
**Your Focus:** ${context.task.focus}

**Instructions:**
1. Analyze each technology choice and explain why it's suitable
2. Consider project requirements, team capabilities, and long-term maintenance
3. Compare with alternative technologies where relevant
4. Highlight benefits and potential trade-offs
5. Output as JSON with the following structure:
{
  "title": "Technology Stack Rationale",
  "overview": "Brief overview of the technology decisions",
  "technologies": [
    {
      "category": "Frontend Framework",
      "technology": "React",
      "rationale": "Chosen for its component-based architecture and large ecosystem",
      "alternatives": ["Vue.js", "Svelte", "Angular"],
      "benefits": ["Large community", "Rich ecosystem", "Job market demand"]
    }
  ],
  "conclusion": "Overall assessment of the tech stack suitability"
}

Generate the technology rationale now.`;
  }

  /**
   * Converte il risultato JSON in formato markdown
   */
  private formatAsMarkdown(data: any): string {
    let markdown = `# ${data.title}\n\n`;
    markdown += `${data.overview}\n\n`;

    markdown += `## Technology Choices\n\n`;

    data.technologies.forEach((tech: any) => {
      markdown += `### ${tech.category}: ${tech.technology}\n\n`;
      markdown += `**Rationale:** ${tech.rationale}\n\n`;

      if (tech.alternatives && tech.alternatives.length > 0) {
        markdown += `**Alternatives Considered:** ${tech.alternatives.join(', ')}\n\n`;
      }

      if (tech.benefits && tech.benefits.length > 0) {
        markdown += `**Key Benefits:**\n`;
        tech.benefits.forEach((benefit: string) => {
          markdown += `- ${benefit}\n`;
        });
        markdown += `\n`;
      }

      markdown += `---\n\n`;
    });

    markdown += `## Conclusion\n\n`;
    markdown += `${data.conclusion}\n\n`;

    markdown += `*Generated by TechRationaleAgent*\n`;

    return markdown;
  }
}

/**
 * Factory per creare l'agente Tech Rationale
 */
export const createTechRationaleAgent = (): ITechRationaleAgent => {
  return new TechRationaleAgent();
};

// Istanza singleton
export const techRationaleAgent = createTechRationaleAgent();