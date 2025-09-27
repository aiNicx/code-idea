/**
 * API Endpoint Agent - Modulare e ottimizzato
 * Progetta gli endpoint API per l'applicazione
 */

import { apiClient } from '../../core/apiClient';
import type { AgentExecutionContext } from '../../types';

/**
 * Interfaccia per l'agente API Endpoint
 */
export interface IAPIEndpointAgent {
  execute(context: AgentExecutionContext): Promise<string>;
  validateInput(context: AgentExecutionContext): boolean;
}

/**
 * Implementazione dell'API Endpoint Agent
 */
export class APIEndpointAgent implements IAPIEndpointAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Esegue la generazione degli endpoint API
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context)) {
      throw new Error('Invalid execution context for APIEndpointAgent');
    }

    try {
      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          backend: { type: 'string' as const },
          description: { type: 'string' as const },
          endpoints: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                method: { type: 'string' as const },
                path: { type: 'string' as const },
                description: { type: 'string' as const },
                requestBody: {
                  type: 'object' as const,
                  properties: {
                    required: { type: 'boolean' as const },
                    schema: { type: 'object' as const }
                  }
                },
                responseBody: {
                  type: 'object' as const,
                  properties: {
                    status: { type: 'number' as const },
                    schema: { type: 'object' as const }
                  }
                }
              },
              required: ['method', 'path', 'description'] as const
            }
          }
        },
        required: ['title', 'backend', 'description', 'endpoints'] as const
      };

      // Costruisce il prompt con documentazione del backend
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
        throw new Error(response.error || 'Failed to generate API endpoints');
      }

      // Converte il JSON in markdown
      return this.formatAsMarkdown(JSON.parse(response.data));

    } catch (error) {
      console.error('APIEndpointAgent execution failed:', error);
      throw new Error(`API endpoint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Costruisce il prompt per l'agente con documentazione del backend
   */
  private buildPrompt(context: AgentExecutionContext): string {
    const backend = context.planContext?.techStack?.backend || 'Convex';
    const documentation = this.getBackendDocumentation(backend);

    const planContextString = JSON.stringify(context.planContext, null, 2);

    return `You are a backend engineer. Your task is to design the API endpoints for this project.

**Backend Technology:** ${backend}
**Project Context:**
${planContextString}

**Your Goal:** ${context.task.goal}
**Your Focus:** ${context.task.focus}

**Backend Documentation:**
${documentation}

**Instructions:**
1. Design RESTful API endpoints based on the project requirements
2. Consider the selected backend technology (${backend})
3. Include all CRUD operations and business logic endpoints
4. Specify HTTP methods, paths, and data structures
5. Include authentication/authorization where needed
6. Output as JSON with the following structure:
{
  "title": "API Endpoints",
  "backend": "${backend}",
  "description": "Overview of the API design",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/users",
      "description": "Get all users",
      "requestBody": {
        "required": false,
        "schema": {}
      },
      "responseBody": {
        "status": 200,
        "schema": {
          "type": "array",
          "items": { "type": "object" }
        }
      }
    }
  ]
}

Generate the API endpoints now.`;
  }

  /**
   * Restituisce documentazione specifica per il backend
   */
  private getBackendDocumentation(backend: string): string {
    const docs: Record<string, string> = {
      'Convex': `
**Convex API:**
- Queries: For reading data (GET operations)
- Mutations: For writing data (POST/PUT/DELETE operations)
- Context (ctx): Use ctx.db for database access, ctx.auth for user identity
- Real-time: Automatic subscriptions with reactive queries

Example:
export const listMessages = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  }
});

export const sendMessage = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("messages", {
      body: args.body,
      userId: userId?.id
    });
  }
});
      `,
      'Firebase': `
**Firebase Cloud Functions:**
- HTTP triggers for API endpoints
- Firestore triggers for reactive logic
- Authentication with Firebase Auth
- Real-time database listeners

Example:
exports.getMessages = functions.https.onCall(async (data, context) => {
  const messages = await db.collection('messages').limit(50).get();
  return messages.docs.map(doc => doc.data());
});

exports.postMessage = functions.https.onCall(async (data, context) => {
  const { text } = data;
  await db.collection('messages').add({
    text,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    authorId: context.auth?.uid
  });
});
      `,
      'Supabase': `
**Supabase API:**
- REST API with PostgreSQL
- Row Level Security (RLS) policies
- Real-time subscriptions
- Edge Functions for serverless logic

Example:
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .limit(50);

const { data, error } = await supabase
  .from('messages')
  .insert([{ text: 'Hello', user_id: user.id }]);
      `
    };

    return docs[backend] || 'No specific documentation available for this backend.';
  }

  /**
   * Converte il risultato JSON in formato markdown
   */
  private formatAsMarkdown(data: any): string {
    let markdown = `# ${data.title}\n\n`;
    markdown += `**Backend:** ${data.backend}\n\n`;
    markdown += `${data.description}\n\n`;

    markdown += `## API Endpoints\n\n`;

    data.endpoints.forEach((endpoint: any) => {
      markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
      markdown += `**Description:** ${endpoint.description}\n\n`;

      if (endpoint.requestBody && endpoint.requestBody.required) {
        markdown += `**Request Body:**\n\`\`\`json\n${JSON.stringify(endpoint.requestBody.schema, null, 2)}\n\`\`\`\n\n`;
      }

      markdown += `**Response Body (Status ${endpoint.responseBody?.status || 200}):**\n`;
      markdown += `\`\`\`json\n${JSON.stringify(endpoint.responseBody?.schema || {}, null, 2)}\n\`\`\`\n\n`;

      markdown += `---\n\n`;
    });

    markdown += `*Generated by APIEndpointAgent*\n`;

    return markdown;
  }
}

/**
 * Factory per creare l'agente API Endpoint
 */
export const createAPIEndpointAgent = (): IAPIEndpointAgent => {
  return new APIEndpointAgent();
};

// Istanza singleton
export const apiEndpointAgent = createAPIEndpointAgent();