import type { Framework, Backend, Styling, UILibrary, StateManagement, Auth, Suggestion, DocumentType, AgentName, AgentMetadataCollection, ToolName } from './types';
// FIX: Import ComponentType from react to be used for tool icon type.
import type { ComponentType } from 'react';

// Configurazione modelli per provider
export const MODEL_CONFIG = {
  gemini: {
    'gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      maxTokens: 8192,
      description: 'Modello veloce e conveniente per la generazione di codice'
    }
  },
  openrouter: {
    'x-ai/grok-4-fast:free': {
      name: 'Grok 4 Fast (Free)',
      provider: 'openrouter',
      maxTokens: 8192,
      description: 'Modello veloce e gratuito di xAI ottimizzato per codice'
    },
    'anthropic/claude-3.5-sonnet': {
      name: 'Claude 3.5 Sonnet',
      provider: 'openrouter',
      maxTokens: 8192,
      description: 'Modello avanzato di Anthropic ottimizzato per codice'
    },
    'anthropic/claude-3-haiku': {
      name: 'Claude 3 Haiku',
      provider: 'openrouter',
      maxTokens: 4096,
      description: 'Modello veloce di Anthropic per task semplici'
    },
    'openai/gpt-4o': {
      name: 'GPT-4o',
      provider: 'openrouter',
      maxTokens: 8192,
      description: 'Modello avanzato di OpenAI ottimizzato per codice'
    },
    'openai/gpt-4o-mini': {
      name: 'GPT-4o Mini',
      provider: 'openrouter',
      maxTokens: 4096,
      description: 'Versione economica di GPT-4o'
    },
    'google/gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash (via OpenRouter)',
      provider: 'openrouter',
      maxTokens: 8192,
      description: 'Gemini 2.5 Flash attraverso OpenRouter'
    }
  }
} as const;

export type ModelId = keyof typeof MODEL_CONFIG.gemini | keyof typeof MODEL_CONFIG.openrouter;
import {
  OrchestratorIcon, ProjectBriefIcon, UserPersonaIcon, UserFlowIcon, DBSchemaIcon,
  APIEndpointIcon, ComponentArchitectureIcon, TechRationaleIcon, RoadmapIcon, DocumentGeneratorIcon,
  DocSearchIcon, DelegateIcon
} from './components/AgentIcons';

// Temporary aliases for missing icons
const AgentExecutorIcon = OrchestratorIcon;
const ApiClientIcon = APIEndpointIcon;

export const FRAMEWORK_OPTIONS: Framework[] = ['React', 'Vue', 'Svelte'];
export const BACKEND_OPTIONS: Backend[] = ['Convex', 'Firebase', 'Supabase', 'Node.js (Express)', 'None'];
export const STYLING_OPTIONS: Styling[] = ['Tailwind CSS', 'CSS Modules'];
export const UI_LIBRARY_OPTIONS: UILibrary[] = ['None', 'Shadcn/UI', 'Material-UI', 'Chakra UI'];
export const STATE_MANAGEMENT_OPTIONS: StateManagement[] = ['None (useState/useReducer)', 'Zustand', 'Jotai'];
export const AUTH_OPTIONS: Auth[] = ['None', 'Convex Auth', 'Clerk', 'Firebase Auth', 'Supabase Auth'];

export const DOCUMENT_OPTIONS: { key: DocumentType, label: string, description: string }[] = [
    { key: 'projectBrief', label: 'Project Brief & Core Features', description: 'A refined summary of the project idea, goals, and key features.' },
    { key: 'userPersonas', label: 'User Personas', description: 'Profiles of target users to guide design and development.' },
    { key: 'userFlow', label: 'User Flow', description: 'A step-by-step description of a user\'s journey through the app.' },
    { key: 'dbSchema', label: 'Database Schema', description: 'A markdown-based design of the database tables and relationships.' },
    { key: 'apiEndpoints', label: 'API Endpoint Design', description: 'A list of necessary API endpoints, their methods, and data payloads.' },
    { key: 'componentArchitecture', label: 'Component Architecture', description: 'A breakdown of the UI into a hierarchy of components.' },
    { key: 'techRationale', label: 'Tech Stack Rationale', description: 'An explanation of why the selected technologies are a good fit.' },
    { key: 'projectRoadmap', label: 'Project Roadmap', description: 'A high-level plan of development phases and feature priorities.' },
];

export const AGENT_SUB_TASKS: Record<AgentName, string[]> = {
    OrchestratorAgent: [
        "Analyzing user requirements...",
        "Mapping documents to specialized agents...",
        "Structuring the execution flow...",
        "Finalizing the architectural plan...",
    ],
    ProjectBriefAgent: [
        "Analyzing core idea...",
        "Defining problem statement...",
        "Formulating solution...",
        "Outlining key features...",
    ],
    UserPersonaAgent: [
        "Identifying target audience...",
        "Developing persona archetypes...",
        "Defining user goals and frustrations...",
        "Crafting persona narratives...",
    ],
    UserFlowAgent: [
        "Mapping user journey...",
        "Defining key interaction points...",
        "Structuring the flow sequence...",
        "Detailing each step...",
    ],
    DBSchemaAgent: [
        "Analyzing data requirements...",
        "Consulting tech documentation...",
        "Designing tables and collections...",
        "Establishing relationships...",
    ],
    APIEndpointAgent: [
        "Identifying necessary data operations...",
        "Consulting tech documentation...",
        "Designing resource URLs...",
        "Planning request/response shapes...",
    ],
    ComponentArchitectureAgent: [
        "Breaking down the UI into logical blocks...",
        "Defining component hierarchy...",
        "Specifying props and state for components...",
        "Planning data flow through the UI...",
    ],
    TechRationaleAgent: [
        "Evaluating framework choice...",
        "Justifying backend selection...",
        "Analyzing styling and UI library fit...",
        "Writing the final rationale document...",
    ],
    RoadmapAgent: [
        "Prioritizing core features for MVP...",
        "Grouping features into development phases...",
        "Outlining future enhancements...",
        "Structuring the final roadmap...",
    ],
    DocumentGeneratorAgent: [
        "Gathering all generated content...",
        "Formatting documents into Markdown...",
        "Assembling the final JSON output...",
        "Final verification of the file structure...",
    ],
    AgentExecutor: [
        "Coordinating agent execution...",
        "Managing parallel processing...",
        "Monitoring progress and errors...",
        "Aggregating results...",
    ],
    ApiClient: [
        "Handling API communication...",
        "Managing authentication...",
        "Processing requests and responses...",
        "Error handling and retries...",
    ],
};

// FIX: Use ComponentType instead of React.ComponentType to resolve namespace error.
export const TOOLS_CATALOG: Record<ToolName, { name: string; description: string; icon: ComponentType<{className?: string}> }> = {
    DocumentationSearch: {
        name: 'Tech Documentation',
        description: 'Allows the agent to access documentation for the selected tech stack.',
        icon: DocSearchIcon,
    },
    AgentCaller: {
        name: 'Delegate to Agent',
        description: 'Allows the agent to call another specialized agent for a sub-task.',
        icon: DelegateIcon,
    }
}

export const AGENT_METADATA: AgentMetadataCollection = {
    OrchestratorAgent: {
        role: "Master Architect",
        icon: OrchestratorIcon,
        summary: "Analyzes the user's request and creates a dynamic, step-by-step execution plan for the other agents.",
        defaultTools: ['AgentCaller'],
    },
    ProjectBriefAgent: {
        role: "Product Manager",
        icon: ProjectBriefIcon,
        summary: "Refines the user's raw idea into a formal Project Brief, outlining the problem, solution, and core features.",
        defaultTools: [],
    },
    UserPersonaAgent: {
        role: "UX Researcher",
        icon: UserPersonaIcon,
        summary: "Creates detailed user personas to ensure the application is designed with the target audience in mind.",
        defaultTools: [],
    },
    UserFlowAgent: {
        role: "UX Designer",
        icon: UserFlowIcon,
        summary: "Designs the primary user journey, mapping out the step-by-step path a user takes to achieve a goal.",
        defaultTools: [],
    },
    DBSchemaAgent: {
        role: "Database Architect",
        icon: DBSchemaIcon,
        summary: "Designs the database structure, including tables, fields, and relationships, based on the project's data needs.",
        defaultTools: ['DocumentationSearch'],
    },
    APIEndpointAgent: {
        role: "Backend Engineer",
        icon: APIEndpointIcon,
        summary: "Defines the API contract, specifying the endpoints, methods, and data shapes for frontend-backend communication.",
        defaultTools: ['DocumentationSearch'],
    },
    ComponentArchitectureAgent: {
        role: "Frontend Architect",
        icon: ComponentArchitectureIcon,
        summary: "Breaks down the user interface into a logical hierarchy of reusable components.",
        defaultTools: [],
    },
    TechRationaleAgent: {
        role: "Solution Architect",
        icon: TechRationaleIcon,
        summary: "Writes a justification for the chosen technology stack, explaining why it's a good fit for the project.",
        defaultTools: [],
    },
    RoadmapAgent: {
        role: "Product Owner",
        icon: RoadmapIcon,
        summary: "Creates a high-level project roadmap, prioritizing features and organizing them into development phases.",
        defaultTools: [],
    },
    DocumentGeneratorAgent: {
        role: "Technical Writer",
        icon: DocumentGeneratorIcon,
        summary: "Assembles all the generated content from other agents into a final, structured set of project documents.",
        defaultTools: [],
    },
    AgentExecutor: {
        role: "Process Coordinator",
        icon: AgentExecutorIcon,
        summary: "Manages the parallel execution of multiple agents, coordinating their work and aggregating results.",
        defaultTools: [],
    },
    ApiClient: {
        role: "Communication Layer",
        icon: ApiClientIcon,
        summary: "Handles all communication with external APIs, managing authentication, requests, and responses.",
        defaultTools: [],
    },
};


export const SUGGESTIONS: Suggestion[] = [
    {
        name: "Real-time Chat App",
        idea: "A simple, real-time chat application where users can join a public room and send messages.",
        techStack: {
            framework: 'React',
            backend: 'Convex',
            styling: 'Tailwind CSS',
            uiLibrary: 'Shadcn/UI',
            auth: 'Convex Auth',
            features: { auth: true, crud: true, realtime: true }
        },
        documents: ['projectBrief', 'userFlow', 'dbSchema', 'apiEndpoints', 'componentArchitecture']
    },
    {
        name: "Todo List with Auth",
        idea: "A classic todo list application where users can sign up, log in, and manage their own private list of tasks.",
        techStack: {
            framework: 'Vue',
            backend: 'Supabase',
            styling: 'Tailwind CSS',
            uiLibrary: 'None',
            auth: 'Supabase Auth',
            features: { auth: true, crud: true, realtime: false }
        },
        documents: ['projectBrief', 'userPersonas', 'dbSchema', 'apiEndpoints', 'projectRoadmap']
    },
    {
        name: "Static Portfolio Site",
        idea: "A clean, modern, and fast portfolio website to showcase my projects. It should have a contact form that works without a backend database.",
        techStack: {
            framework: 'Svelte',
            backend: 'None',
            styling: 'Tailwind CSS',
            uiLibrary: 'None',
            auth: 'None',
            features: { auth: false, crud: false, realtime: false }
        },
        documents: ['projectBrief', 'componentArchitecture', 'techRationale']
    }
];