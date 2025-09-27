/**
 * Prompt Builder - Sistema modulare per la costruzione di prompt complessi
 * Implementa Builder Pattern per prompt configurabili
 */

import type { PromptTemplate, PromptContext, DevelopmentPlan } from '../types';

/**
 * Builder per la costruzione di prompt complessi
 */
export class PromptBuilder {
  private template: string;
  private variables: Map<string, string> = new Map();
  private sections: Map<string, string> = new Map();

  constructor(template?: string) {
    this.template = template || '';
  }

  /**
   * Imposta il template base
   */
  setTemplate(template: string): this {
    this.template = template;
    return this;
  }

  /**
   * Aggiunge una variabile semplice
   */
  setVariable(key: string, value: string): this {
    this.variables.set(key, value);
    return this;
  }

  /**
   * Aggiunge multiple variabili
   */
  setVariables(variables: Record<string, string>): this {
    Object.entries(variables).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
    return this;
  }

  /**
   * Aggiunge una sezione complessa (oggetto JSON)
   */
  setSection(key: string, value: any): this {
    this.sections.set(key, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
    return this;
  }

  /**
   * Aggiunge il context del piano
   */
  setPlanContext(plan: DevelopmentPlan): this {
    return this.setSection('PLAN_CONTEXT', plan);
  }

  /**
   * Aggiunge la documentazione
   */
  setDocumentation(documentation: string): this {
    return this.setVariable('DOCUMENTATION', documentation);
  }

  /**
   * Costruisce il prompt finale
   */
  build(): string {
    let prompt = this.template;

    // Sostituisce le variabili semplici
    for (const [key, value] of this.variables) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    }

    // Sostituisce le sezioni complesse
    for (const [key, value] of this.sections) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    }

    return prompt;
  }

  /**
   * Valida che tutti i placeholder siano stati sostituiti
   */
  validate(): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];
    const placeholders = this.template.match(/\{\{(\w+)\}\}/g) || [];

    for (const placeholder of placeholders) {
      const key = placeholder.replace(/\{\{|\}\}/g, '');
      if (!this.variables.has(key) && !this.sections.has(key)) {
        missing.push(key);
      }
    }

    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Crea un builder da un template esistente
   */
  static fromTemplate(template: string): PromptBuilder {
    return new PromptBuilder(template);
  }

  /**
   * Crea un builder da un context completo
   */
  static fromContext(context: PromptContext, template: string): PromptBuilder {
    const builder = new PromptBuilder(template);

    builder
      .setVariable('USER_IDEA', context.userIdea)
      .setSection('TECH_STACK', context.techStack)
      .setVariable('REQUESTED_DOCUMENTS', context.requestedDocuments.join(', '));

    if (context.planContext) {
      builder.setSection('PLAN_CONTEXT', context.planContext);
    }

    if (context.taskGoal) {
      builder.setVariable('TASK_GOAL', context.taskGoal);
    }

    if (context.taskFocus) {
      builder.setVariable('TASK_FOCUS', context.taskFocus);
    }

    if (context.documentation) {
      builder.setVariable('DOCUMENTATION', context.documentation);
    }

    return builder;
  }
}

/**
 * Registry per template predefiniti
 */
export class PromptTemplateRegistry {
  private templates: Map<string, PromptTemplate> = new Map();

  /**
   * Registra un template
   */
  register(name: string, template: PromptTemplate): void {
    this.templates.set(name, template);
  }

  /**
   * Recupera un template
   */
  get(name: string): PromptTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * Verifica se un template esiste
   */
  has(name: string): boolean {
    return this.templates.has(name);
  }

  /**
   * Elenca tutti i template disponibili
   */
  list(): string[] {
    return Array.from(this.templates.keys());
  }
}

/**
 * Template predefiniti per i vari agenti
 */
export const createDefaultTemplateRegistry = (): PromptTemplateRegistry => {
  const registry = new PromptTemplateRegistry();

  // Template per Orchestrator
  registry.register('orchestrator', {
    template: `You are a world-class AI software architect. Your job is to create a step-by-step plan for generating project planning documents.
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

Create the JSON plan now.`,
    variables: ['USER_IDEA', 'TECH_STACK', 'REQUESTED_DOCUMENTS']
  });

  // Template per Project Brief
  registry.register('projectBrief', {
    template: `You are a Product Manager. Your task is to refine the user's idea into a formal Project Brief.
Analyze the project context and output a JSON object with the following structure:
{
  "title": "Project title",
  "summary": "One sentence summary",
  "problemStatement": "Detailed problem description",
  "solution": "How the app solves the problem",
  "coreFeatures": ["feature1", "feature2", "feature3"]
}

**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}
**Relevant Documentation:**
{{DOCUMENTATION}}`,
    variables: ['PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS', 'DOCUMENTATION']
  });

  // Template per User Persona
  registry.register('userPersona', {
    template: `You are a UX Researcher. Your task is to create user personas for this project.
Analyze the project context and create 2-3 distinct user personas.

**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

**Instructions:**
1. Create 2-3 realistic user personas based on the project idea
2. Each persona should have:
   - A realistic name and demographic info
   - A brief bio explaining their background
   - Their goals related to this app
   - Their frustrations that this app would solve
3. Output as JSON with the following structure:
{
  "personas": [
    {
      "name": "Persona Name",
      "bio": "Brief background description",
      "goals": ["Goal 1", "Goal 2"],
      "frustrations": ["Frustration 1", "Frustration 2"]
    }
  ]
}

Generate the user personas now.`,
    variables: ['PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS']
  });

  // Template per User Flow
  registry.register('userFlow', {
    template: `You are a UX Designer. Your task is to outline a primary user flow for this project.
Analyze the project context and describe the key user journey from start to finish.

**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

**Instructions:**
1. Create a clear, step-by-step user flow based on the core features
2. Focus on the primary user journey (e.g., from landing to completing main action)
3. Each step should include:
   - Step number
   - User action
   - Brief description of what happens
4. Output as JSON with the following structure:
{
  "title": "Flow Title",
  "description": "Brief description of the flow",
  "steps": [
    {
      "step": 1,
      "action": "User lands on homepage",
      "description": "User sees the main landing page with value proposition"
    }
  ]
}

Generate the user flow now.`,
    variables: ['PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS']
  });

  // Template per Database Schema
  registry.register('dbSchema', {
    template: `You are a database architect. Your task is to design the database schema for this project.

**Backend Technology:** {{BACKEND}}
**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

**Backend Documentation:**
{{DOCUMENTATION}}

**Instructions:**
1. Design database tables/collections based on the project requirements
2. Consider the selected backend technology ({{BACKEND}})
3. Include all necessary fields with appropriate types
4. Define relationships between entities
5. Add appropriate indexes for performance
6. Output as JSON with the following structure:
{
  "title": "Database Schema",
  "backend": "{{BACKEND}}",
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

Generate the database schema now.`,
    variables: ['BACKEND', 'PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS', 'DOCUMENTATION']
  });

  // Template per API Endpoints
  registry.register('apiEndpoints', {
    template: `You are a backend engineer. Your task is to design the API endpoints for this project.

**Backend Technology:** {{BACKEND}}
**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

**Backend Documentation:**
{{DOCUMENTATION}}

**Instructions:**
1. Design RESTful API endpoints based on the project requirements
2. Consider the selected backend technology ({{BACKEND}})
3. Include all CRUD operations and business logic endpoints
4. Specify HTTP methods, paths, and data structures
5. Include authentication/authorization where needed
6. Output as JSON with the following structure:
{
  "title": "API Endpoints",
  "backend": "{{BACKEND}}",
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

Generate the API endpoints now.`,
    variables: ['BACKEND', 'PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS', 'DOCUMENTATION']
  });

  // Template per Component Architecture
  registry.register('componentArchitecture', {
    template: `You are a senior frontend developer. Your task is to design the UI component architecture for this project.

**Framework:** {{FRAMEWORK}}
**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

**Framework Guidelines:**
{{FRAMEWORK_GUIDELINES}}

**Instructions:**
1. Break down the UI into a logical hierarchy of components
2. Consider the selected framework ({{FRAMEWORK}}) best practices
3. Define component purpose, props, state, and child relationships
4. Create a reusable and maintainable component structure
5. Output as JSON with the following structure:
{
  "title": "Component Architecture",
  "framework": "{{FRAMEWORK}}",
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

Generate the component architecture now.`,
    variables: ['FRAMEWORK', 'PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS', 'FRAMEWORK_GUIDELINES']
  });

  // Template per Tech Rationale
  registry.register('techRationale', {
    template: `You are a software architect. Your task is to justify the chosen technology stack for this project.

**Project Context:**
{{PLAN_CONTEXT}}

**Selected Tech Stack:**
{{TECH_STACK}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

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

Generate the technology rationale now.`,
    variables: ['PLAN_CONTEXT', 'TECH_STACK', 'TASK_GOAL', 'TASK_FOCUS']
  });

  // Template per Roadmap
  registry.register('roadmap', {
    template: `You are a Product Manager. Your task is to create a high-level project roadmap for this application.

**Project Context:**
{{PLAN_CONTEXT}}

**Your Goal:** {{TASK_GOAL}}
**Your Focus:** {{TASK_FOCUS}}

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

Generate the project roadmap now.`,
    variables: ['PLAN_CONTEXT', 'TASK_GOAL', 'TASK_FOCUS']
  });

  // Template per Document Generator
  registry.register('documentGenerator', {
    template: `You are an expert AI document generator. Your final task is to assemble the project documents.

**Complete Development Plan:**
{{PLAN_CONTEXT}}

**Requested Documents:** {{REQUESTED_DOCUMENTS}}

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

Generate the final JSON object containing the requested project documents now.`,
    variables: ['PLAN_CONTEXT', 'REQUESTED_DOCUMENTS']
  });

  return registry;
};

// Istanza singleton del registry
export const promptTemplateRegistry = createDefaultTemplateRegistry();