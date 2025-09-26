import type { AgentTask } from './services/geminiService';

export enum ProcessingState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface ProgressUpdate {
  agentTasks: AgentTask[];
  currentIteration: number;
  totalIterations: number;
  currentTaskDescription: string;
  currentAgent: AgentName;
}

export type Framework = 'React' | 'Vue' | 'Svelte';
export type Backend = 'Convex' | 'Firebase' | 'Supabase' | 'Node.js (Express)' | 'None';
export type Styling = 'Tailwind CSS' | 'CSS Modules';
export type UILibrary = 'None' | 'Shadcn/UI' | 'Material-UI' | 'Chakra UI';
export type StateManagement = 'None (useState/useReducer)' | 'Zustand' | 'Jotai';
export type Auth = 'None' | 'Convex Auth' | 'Clerk' | 'Firebase Auth' | 'Supabase Auth';

export interface ProjectFeatures {
  auth: boolean;
  crud: boolean;
  realtime: boolean;
}

export interface TechStack {
  framework: Framework;
  backend: Backend;
  styling: Styling;
  uiLibrary: UILibrary;
  stateManagement: StateManagement;
  auth: Auth;
  features: ProjectFeatures;
}

export const documentTypes = [
    'projectBrief', 'userPersonas', 'userFlow', 
    'dbSchema', 'apiEndpoints', 'componentArchitecture', 
    'techRationale', 'projectRoadmap'
] as const;

export type DocumentType = typeof documentTypes[number];

export type AgentName = 
  | 'OrchestratorAgent'
  | 'ProjectBriefAgent'
  | 'UserPersonaAgent'
  | 'UserFlowAgent'
  | 'DBSchemaAgent'
  | 'APIEndpointAgent'
  | 'ComponentArchitectureAgent'
  | 'TechRationaleAgent'
  | 'RoadmapAgent'
  | 'DocumentGeneratorAgent';

export interface AgentConfig {
  id: AgentName;
  systemPrompt: string;
  lastModified: string; // ISO string
  isCustom: boolean;
}

export interface DevelopmentPlan {
  userIdea: string;
  techStack: TechStack;
  projectBrief?: string;
  userPersonas?: string;
  userFlow?: string;
  dbSchema?: string;
  apiEndpoints?: string;
  componentArchitecture?: string;
  techRationale?: string;
  projectRoadmap?: string;
}

export interface Suggestion {
  name: string;
  idea: string;
  techStack: Partial<TechStack & { features: Partial<ProjectFeatures>}>;
  documents: DocumentType[];
}


export type DevelopedIdea = { [key: string]: string };

export type Page = 'home' | 'agents';

// --- New Types for Enhanced Agent Metadata ---

export type AgentTool = 'TechStackDocumentation';

export interface AgentMetadata {
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  tools: AgentTool[];
}

export type AgentMetadataCollection = Record<AgentName, AgentMetadata>;

export type FlowStage = 'input' | 'orchestration' | 'execution' | 'assembly' | 'output' | null;
