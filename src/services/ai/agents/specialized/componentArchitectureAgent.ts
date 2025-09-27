/**
 * Component Architecture Agent - Modulare e ottimizzato
 * Progetta l'architettura dei componenti UI
 */

import { apiClient } from '../../core/apiClient';
import type { AgentExecutionContext } from '../../types';

/**
 * Interfaccia per l'agente Component Architecture
 */
export interface IComponentArchitectureAgent {
  execute(context: AgentExecutionContext): Promise<string>;
  validateInput(context: AgentExecutionContext): boolean;
}

/**
 * Implementazione del Component Architecture Agent
 */
export class ComponentArchitectureAgent implements IComponentArchitectureAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Esegue la generazione dell'architettura dei componenti
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context)) {
      throw new Error('Invalid execution context for ComponentArchitectureAgent');
    }

    try {
      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          framework: { type: 'string' as const },
          description: { type: 'string' as const },
          architecture: {
            type: 'object' as const,
            properties: {
              root: { type: 'string' as const },
              layout: { type: 'string' as const },
              pages: {
                type: 'array' as const,
                items: { type: 'string' as const }
              },
              components: {
                type: 'object' as const,
                additionalProperties: {
                  type: 'object' as const,
                  properties: {
                    purpose: { type: 'string' as const },
                    props: {
                      type: 'array' as const,
                      items: { type: 'string' as const }
                    },
                    state: {
                      type: 'array' as const,
                      items: { type: 'string' as const }
                    },
                    children: {
                      type: 'array' as const,
                      items: { type: 'string' as const }
                    }
                  },
                  required: ['purpose'] as const
                }
              }
            },
            required: ['root', 'layout', 'pages', 'components'] as const
          }
        },
        required: ['title', 'framework', 'description', 'architecture'] as const
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
        throw new Error(response.error || 'Failed to generate component architecture');
      }

      // Converte il JSON in markdown
      return this.formatAsMarkdown(JSON.parse(response.data));

    } catch (error) {
      console.error('ComponentArchitectureAgent execution failed:', error);
      throw new Error(`Component architecture generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const framework = context.planContext?.techStack?.framework || 'React';
    const planContextString = JSON.stringify(context.planContext, null, 2);

    return `You are a senior frontend developer. Your task is to design the UI component architecture for this project.

**Framework:** ${framework}
**Project Context:**
${planContextString}

**Your Goal:** ${context.task.goal}
**Your Focus:** ${context.task.focus}

**Framework Guidelines:**
${this.getFrameworkGuidelines(framework)}

**Instructions:**
1. Break down the UI into a logical hierarchy of components
2. Consider the selected framework (${framework}) best practices
3. Define component purpose, props, state, and child relationships
4. Create a reusable and maintainable component structure
5. Output as JSON with the following structure:
{
  "title": "Component Architecture",
  "framework": "${framework}",
  "description": "Overview of the component design",
  "architecture": {
    "root": "App",
    "layout": "MainLayout",
    "pages": ["HomePage", "DashboardPage"],
    "components": {
      "App": {
        "purpose": "Root application component",
        "props": ["children"],
        "state": ["currentUser", "theme"],
        "children": ["MainLayout"]
      },
      "MainLayout": {
        "purpose": "Main layout wrapper",
        "props": ["children"],
        "state": [],
        "children": ["Header", "Sidebar", "Content"]
      }
    }
  }
}

Generate the component architecture now.`;
  }

  /**
   * Restituisce linee guida specifiche per il framework
   */
  private getFrameworkGuidelines(framework: string): string {
    const guidelines: Record<string, string> = {
      'React': `
**React Best Practices:**
- Use functional components with hooks
- Implement proper component composition
- Separate business logic into custom hooks
- Use context for global state management
- Implement proper prop drilling prevention
- Consider performance with React.memo, useMemo, useCallback

**Component Structure:**
- Atomic Design: Atoms → Molecules → Organisms → Templates → Pages
- Feature-based organization for larger apps
- Shared components in common/ or ui/ directories
      `,
      'Vue': `
**Vue.js Best Practices:**
- Use Composition API for complex logic
- Implement proper component communication
- Use provide/inject for dependency sharing
- Consider component lifecycle management
- Use Vue Router for page components

**Component Structure:**
- Single File Components (.vue)
- Feature-based organization
- Mixins for shared logic (with Composition API)
      `,
      'Svelte': `
**Svelte Best Practices:**
- Leverage Svelte's reactivity system
- Use stores for global state management
- Implement proper component lifecycle
- Consider SvelteKit for full-stack features

**Component Structure:**
- Single File Components (.svelte)
- Feature-based organization
- Stores for shared state
      `
    };

    return guidelines[framework] || 'No specific guidelines available for this framework.';
  }

  /**
   * Converte il risultato JSON in formato markdown
   */
  private formatAsMarkdown(data: any): string {
    let markdown = `# ${data.title}\n\n`;
    markdown += `**Framework:** ${data.framework}\n\n`;
    markdown += `${data.description}\n\n`;

    markdown += `## Component Hierarchy\n\n`;
    markdown += `- **Root:** ${data.architecture.root}\n`;
    markdown += `- **Layout:** ${data.architecture.layout}\n`;
    markdown += `- **Pages:** ${data.architecture.pages.join(', ')}\n\n`;

    markdown += `## Component Details\n\n`;

    Object.entries(data.architecture.components).forEach(([name, component]: [string, any]) => {
      markdown += `### ${name}\n\n`;
      markdown += `**Purpose:** ${component.purpose}\n\n`;

      if (component.props && component.props.length > 0) {
        markdown += `**Props:**\n`;
        component.props.forEach((prop: string) => {
          markdown += `- ${prop}\n`;
        });
        markdown += `\n`;
      }

      if (component.state && component.state.length > 0) {
        markdown += `**State:**\n`;
        component.state.forEach((stateItem: string) => {
          markdown += `- ${stateItem}\n`;
        });
        markdown += `\n`;
      }

      if (component.children && component.children.length > 0) {
        markdown += `**Children:** ${component.children.join(', ')}\n\n`;
      }

      markdown += `---\n\n`;
    });

    markdown += `*Generated by ComponentArchitectureAgent*\n`;

    return markdown;
  }
}

/**
 * Factory per creare l'agente Component Architecture
 */
export const createComponentArchitectureAgent = (): IComponentArchitectureAgent => {
  return new ComponentArchitectureAgent();
};

// Istanza singleton
export const componentArchitectureAgent = createComponentArchitectureAgent();