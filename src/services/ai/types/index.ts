/**
 * Tipi specifici per il sistema AI modulare
 */

import type { AgentName, ProgressUpdate, TechStack, DocumentType } from '../../../../types';

// Tipi per l'esecuzione parallela
export interface AgentExecutionContext {
  agentName: AgentName;
  task: AgentTask;
  planContext: DevelopmentPlan;
  techStack: TechStack;
  documentation: string;
}

export interface AgentTask {
  agent: AgentName;
  goal: string;
  focus: string;
}

export interface AgentExecutionResult {
  agentName: AgentName;
  success: boolean;
  result?: string;
  error?: string;
  executionTime: number;
}

export interface ParallelExecutionConfig {
  maxConcurrent: number;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

// Tipi per il sistema di eventi
export interface AgentProgressEvent {
  type: 'started' | 'completed' | 'failed' | 'progress';
  agentName: AgentName;
  message?: string;
  progress?: number;
  error?: string;
}

export interface AgentObserver {
  onProgress(event: AgentProgressEvent): void;
  onComplete(results: AgentExecutionResult[]): void;
  onError(error: Error): void;
}

// Tipi per l'API Client
export interface ApiClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  provider?: 'gemini' | 'openrouter';
}

// Configurazione per OpenRouter
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  timeout?: number;
}

export interface ApiRequest {
  model: string;
  prompt: string;
  options?: {
    expectJson?: boolean;
    schema?: any;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ApiResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Tipi per i Builder
export interface PromptTemplate {
  template: string;
  variables: string[];
  validate?: (variables: Record<string, any>) => boolean;
}

export interface PromptContext {
  userIdea: string;
  techStack: TechStack;
  requestedDocuments: DocumentType[];
  planContext?: DevelopmentPlan;
  taskGoal?: string;
  taskFocus?: string;
  documentation?: string;
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