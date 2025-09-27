/**
 * Database Schema Agent - Modulare e ottimizzato
 * Progetta lo schema del database per il progetto
 */

import { apiClient } from '../../core/apiClient';
import type { AgentExecutionContext } from '../../types';

/**
 * Interfaccia per l'agente Database Schema
 */
export interface IDBSchemaAgent {
  execute(context: AgentExecutionContext): Promise<string>;
  validateInput(context: AgentExecutionContext): boolean;
}

/**
 * Implementazione del Database Schema Agent
 */
export class DBSchemaAgent implements IDBSchemaAgent {
  private model = 'gemini-2.5-flash';

  /**
   * Esegue la generazione dello schema del database
   */
  async execute(context: AgentExecutionContext): Promise<string> {
    // Valida l'input
    if (!this.validateInput(context)) {
      throw new Error('Invalid execution context for DBSchemaAgent');
    }

    try {
      // Schema per la validazione
      const schema = {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          backend: { type: 'string' as const },
          description: { type: 'string' as const },
          entities: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                name: { type: 'string' as const },
                type: { type: 'string' as const },
                fields: {
                  type: 'array' as const,
                  items: {
                    type: 'object' as const,
                    properties: {
                      name: { type: 'string' as const },
                      type: { type: 'string' as const },
                      required: { type: 'boolean' as const },
                      description: { type: 'string' as const }
                    },
                    required: ['name', 'type', 'required'] as const
                  }
                },
                relationships: {
                  type: 'array' as const,
                  items: {
                    type: 'object' as const,
                    properties: {
                      type: { type: 'string' as const },
                      target: { type: 'string' as const },
                      field: { type: 'string' as const }
                    }
                  }
                }
              },
              required: ['name', 'type', 'fields'] as const
            }
          }
        },
        required: ['title', 'backend', 'description', 'entities'] as const
      };

      // Costruisce il prompt con documentazione specifica del backend
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
        throw new Error(response.error || 'Failed to generate database schema');
      }

      // Converte il JSON in markdown
      return this.formatAsMarkdown(JSON.parse(response.data));

    } catch (error) {
      console.error('DBSchemaAgent execution failed:', error);
      throw new Error(`Database schema generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    return `You are a database architect. Your task is to design the database schema for this project.

**Backend Technology:** ${backend}
**Project Context:**
${planContextString}

**Your Goal:** ${context.task.goal}
**Your Focus:** ${context.task.focus}

**Backend Documentation:**
${documentation}

**Instructions:**
1. Design database tables/collections based on the project requirements
2. Consider the selected backend technology (${backend})
3. Include all necessary fields with appropriate types
4. Define relationships between entities
5. Add appropriate indexes for performance
6. Output as JSON with the following structure:
{
  "title": "Database Schema",
  "backend": "${backend}",
  "description": "Brief description of the schema design",
  "entities": [
    {
      "name": "users",
      "type": "table|collection",
      "fields": [
        {
          "name": "id",
          "type": "uuid|string",
          "required": true,
          "description": "Primary key"
        }
      ],
      "relationships": [
        {
          "type": "one-to-many",
          "target": "posts",
          "field": "userId"
        }
      ]
    }
  ]
}

Generate the database schema now.`;
  }

  /**
   * Restituisce documentazione specifica per il backend
   */
  private getBackendDocumentation(backend: string): string {
    const docs: Record<string, string> = {
      'Convex': `
**Convex Database:**
- Uses defineSchema() and defineTable()
- Validators: v.string(), v.number(), v.boolean(), v.id("tableName")
- Indexes: .index("by_field", ["fieldName"])
- Relations: Use v.id("tableName") for foreign keys

Example:
const schema = defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),
  messages: defineTable({
    body: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"])
});
      `,
      'Firebase': `
**Firestore (NoSQL):**
- Collections and documents (JSON structure)
- No strict schema, flexible data model
- Use subcollections for relationships
- Timestamps: serverTimestamp()

Example Structure:
users/{userId}: {
  name: string,
  email: string,
  createdAt: timestamp
}
posts/{postId}: {
  title: string,
  content: string,
  authorId: string (reference to users/{userId}),
  createdAt: timestamp
}
      `,
      'Supabase': `
**Supabase (PostgreSQL):**
- Standard SQL tables with relationships
- Use uuid for primary keys
- Foreign key constraints
- Row Level Security (RLS) policies

Example:
CREATE TABLE profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE,
  created_at timestamp DEFAULT now()
);
CREATE TABLE todos (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  task text,
  is_complete boolean DEFAULT false,
  user_id uuid REFERENCES profiles(id)
);
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

    markdown += `## Database Entities\n\n`;

    data.entities.forEach((entity: any) => {
      markdown += `### ${entity.name} (${entity.type})\n\n`;
      markdown += `**Fields:**\n`;
      entity.fields.forEach((field: any) => {
        markdown += `- **${field.name}** (${field.type})`;
        if (field.required) markdown += ` *required*`;
        markdown += ` - ${field.description}\n`;
      });

      if (entity.relationships && entity.relationships.length > 0) {
        markdown += `\n**Relationships:**\n`;
        entity.relationships.forEach((rel: any) => {
          markdown += `- ${rel.type} → ${rel.target} (${rel.field})\n`;
        });
      }

      markdown += `\n---\n\n`;
    });

    markdown += `*Generated by DBSchemaAgent*\n`;

    return markdown;
  }
}

/**
 * Factory per creare l'agente Database Schema
 */
export const createDBSchemaAgent = (): IDBSchemaAgent => {
  return new DBSchemaAgent();
};

// Istanza singleton
export const dbSchemaAgent = createDBSchemaAgent();