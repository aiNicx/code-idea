/**
 * Agent Executor - Gestisce l'esecuzione parallela e coordinata degli agenti AI
 * Implementa Strategy Pattern per diverse modalità di esecuzione
 */

import type {
  AgentTask,
  AgentExecutionContext,
  AgentExecutionResult,
  ParallelExecutionConfig,
  AgentProgressEvent,
  AgentObserver,
  DevelopmentPlan
} from '../types';
import * as agents from '../agents/index';

export interface ExecutionStrategy {
  execute(tasks: AgentTask[], context: ExecutionContext): Promise<AgentExecutionResult[]>;
}

/**
 * Agent Registry - Mappa i nomi degli agenti alle loro istanze
 */
const agentRegistry: Record<string, any> = {
  'ProjectBriefAgent': agents.projectBriefAgent,
  'UserPersonaAgent': agents.userPersonaAgent,
  'UserFlowAgent': agents.userFlowAgent,
  'DBSchemaAgent': agents.dbSchemaAgent,
  'APIEndpointAgent': agents.apiEndpointAgent,
  'ComponentArchitectureAgent': agents.componentArchitectureAgent,
  'TechRationaleAgent': agents.techRationaleAgent,
  'RoadmapAgent': agents.roadmapAgent,
  'DocumentGeneratorAgent': agents.documentGeneratorAgent
};

export interface ExecutionContext {
  plan: DevelopmentPlan;
  config: ParallelExecutionConfig;
  observers: AgentObserver[];
}

/**
 * Strategia di esecuzione sequenziale (legacy)
 */
export class SequentialExecutionStrategy implements ExecutionStrategy {
  async execute(tasks: AgentTask[], context: ExecutionContext): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = [];

    for (const task of tasks) {
      const result = await this.executeSingleAgent(task, context);
      results.push(result);

      // Notify observers
      context.observers.forEach(observer => {
        observer.onProgress({
          type: result.success ? 'completed' : 'failed',
          agentName: task.agent,
          message: result.success ? `Agent ${task.agent} completed` : `Agent ${task.agent} failed: ${result.error}`,
          error: result.error
        });
      });
    }

    return results;
  }

  private async executeSingleAgent(task: AgentTask, context: ExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // Ottieni l'agente dal registry
      const agent = agentRegistry[task.agent];

      if (!agent) {
        throw new Error(`Agent ${task.agent} not found in registry`);
      }

      const executionContext: AgentExecutionContext = {
        agentName: task.agent,
        task,
        planContext: context.plan,
        techStack: context.plan.techStack,
        documentation: 'Documentation loading...' // TODO: Load actual documentation
      };

      const result = await agent.execute(executionContext);

      return {
        agentName: task.agent,
        success: true,
        result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        agentName: task.agent,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }
}

/**
 * Strategia di esecuzione parallela con chunking
 */
export class ParallelExecutionStrategy implements ExecutionStrategy {
  constructor(private config: ParallelExecutionConfig) {}

  async execute(tasks: AgentTask[], context: ExecutionContext): Promise<AgentExecutionResult[]> {
    const chunks = this.chunkTasks(tasks, this.config.maxConcurrent);

    this.notifyObservers(context.observers, {
      type: 'started',
      agentName: 'AgentExecutor',
      message: `Executing ${tasks.length} agents in ${chunks.length} parallel chunks`
    });

    const chunkPromises = chunks.map((chunk, index) =>
      this.executeChunk(chunk, context, index)
    );

    const chunkResults = await Promise.allSettled(chunkPromises);

    const allResults: AgentExecutionResult[] = [];
    const errors: Error[] = [];

    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      } else {
        errors.push(result.reason);
      }
    }

    // Notify completion
    if (errors.length > 0) {
      context.observers.forEach(observer => {
        observer.onError(new Error(`${errors.length} chunks failed during execution`));
      });
    }

    context.observers.forEach(observer => {
      observer.onComplete(allResults);
    });

    return allResults;
  }

  private async executeChunk(
    tasks: AgentTask[],
    context: ExecutionContext,
    chunkIndex: number
  ): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = [];

    // Execute tasks in chunk sequentially to avoid overwhelming the API
    for (const task of tasks) {
      const result = await this.executeSingleAgent(task, context);
      results.push(result);

      // Small delay between tasks in same chunk
      await this.sleep(100);
    }

    return results;
  }

  private async executeSingleAgent(task: AgentTask, context: ExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // Ottieni l'agente dal registry
      const agent = agentRegistry[task.agent];

      if (!agent) {
        throw new Error(`Agent ${task.agent} not found in registry`);
      }

      const executionContext: AgentExecutionContext = {
        agentName: task.agent,
        task,
        planContext: context.plan,
        techStack: context.plan.techStack,
        documentation: 'Documentation loading...' // TODO: Load actual documentation
      };

      const result = await agent.execute(executionContext);

      return {
        agentName: task.agent,
        success: true,
        result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        agentName: task.agent,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  private chunkTasks(tasks: AgentTask[], chunkSize: number): AgentTask[][] {
    const chunks: AgentTask[][] = [];
    for (let i = 0; i < tasks.length; i += chunkSize) {
      chunks.push(tasks.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private notifyObservers(observers: AgentObserver[], event: AgentProgressEvent): void {
    observers.forEach(observer => {
      try {
        observer.onProgress(event);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }
}

/**
 * Agent Executor principale che coordina l'esecuzione
 */
export class AgentExecutor {
  private observers: AgentObserver[] = [];
  private defaultConfig: ParallelExecutionConfig = {
    maxConcurrent: 3,
    timeoutMs: 30000,
    retryAttempts: 2,
    retryDelayMs: 1000
  };

  /**
   * Aggiunge un observer per gli eventi di progresso
   */
  addObserver(observer: AgentObserver): void {
    this.observers.push(observer);
  }

  /**
   * Rimuove un observer
   */
  removeObserver(observer: AgentObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Esegue gli agenti utilizzando la strategia specificata
   */
  async execute(
    tasks: AgentTask[],
    plan: DevelopmentPlan,
    strategy: ExecutionStrategy = new ParallelExecutionStrategy(this.defaultConfig)
  ): Promise<AgentExecutionResult[]> {
    const context: ExecutionContext = {
      plan,
      config: this.defaultConfig,
      observers: this.observers
    };

    this.notifyObservers({
      type: 'started',
      agentName: 'AgentExecutor',
      message: `Starting execution of ${tasks.length} agents`
    });

    try {
      const results = await strategy.execute(tasks, context);

      this.notifyObservers({
        type: 'completed',
        agentName: 'AgentExecutor',
        message: `Execution completed. Success rate: ${this.calculateSuccessRate(results)}`
      });

      return results;

    } catch (error) {
      this.notifyObservers({
        type: 'failed',
        agentName: 'AgentExecutor',
        error: error instanceof Error ? error.message : 'Unknown execution error'
      });
      throw error;
    }
  }

  /**
   * Esegue gli agenti in modalità parallela
   */
  async executeParallel(tasks: AgentTask[], plan: DevelopmentPlan): Promise<AgentExecutionResult[]> {
    const strategy = new ParallelExecutionStrategy(this.defaultConfig);
    return this.execute(tasks, plan, strategy);
  }

  /**
   * Esegue gli agenti in modalità sequenziale (per debug)
   */
  async executeSequential(tasks: AgentTask[], plan: DevelopmentPlan): Promise<AgentExecutionResult[]> {
    const strategy = new SequentialExecutionStrategy();
    return this.execute(tasks, plan, strategy);
  }

  /**
   * Aggiorna la configurazione di default
   */
  updateConfig(config: Partial<ParallelExecutionConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  private calculateSuccessRate(results: AgentExecutionResult[]): string {
    const successful = results.filter(r => r.success).length;
    const rate = (successful / results.length) * 100;
    return `${rate.toFixed(1)}%`;
  }

  private notifyObservers(event: AgentProgressEvent): void {
    this.observers.forEach(observer => {
      try {
        observer.onProgress(event);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }
}

// Istanza singleton dell'executor
export const agentExecutor = new AgentExecutor();