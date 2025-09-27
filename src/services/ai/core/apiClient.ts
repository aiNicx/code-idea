/**
 * API Client ottimizzato per l'interazione con Google Gemini e OpenRouter
 * Implementa retry logic, circuit breaker e rate limiting
 */

import { GoogleGenAI, Type } from "@google/genai";
import type {
  ApiClientConfig,
  ApiRequest,
  ApiResponse,
  AgentProgressEvent,
  AgentObserver,
  OpenRouterConfig
} from '../types';
import { MODEL_CONFIG, type ModelId } from '../../../../constants';
import { getModelForAgent, getConfiguredProvider } from '../utils/modelSelector';

export class ApiClient {
  private ai?: GoogleGenAI;
  private openRouterConfig?: OpenRouterConfig;
  private config: ApiClientConfig;
  private requestQueue: Array<{ request: ApiRequest; resolve: Function; reject: Function }> = [];
  private isProcessing = false;
  private observers: AgentObserver[] = [];
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      apiKey: process.env.API_KEY || '',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      provider: getConfiguredProvider(),
      ...config
    };

    console.log('ApiClient config:', {
      apiKey: this.config.apiKey ? 'SET' : 'NOT SET',
      provider: this.config.provider,
      timeout: this.config.timeout
    });

    // Determina quale/i provider usare
    const apiKey = this.config.apiKey;

    if (!apiKey) {
      console.error('API_KEY environment variable is not set. Available env vars:', Object.keys(process.env));
      throw new Error("API_KEY environment variable is not set");
    }

    // Prova prima il provider configurato, poi l'altro come fallback
    this.initializeProviders();
  }

  /**
   * Inizializza i provider disponibili
   */
  private initializeProviders() {
    const apiKey = this.config.apiKey;
    const primaryProvider = this.config.provider || 'gemini';

    // Inizializza sempre entrambi i provider se possibile
    try {
      // Determina il modello da utilizzare
      const modelId = getModelForAgent(primaryProvider);

      // Provider primario
      if (primaryProvider === 'gemini') {
        this.ai = new GoogleGenAI({ apiKey });
      } else if (primaryProvider === 'openrouter') {
        this.openRouterConfig = {
          apiKey,
          baseUrl: 'https://openrouter.ai/api/v1',
          model: modelId,
          timeout: this.config.timeout
        };
      }

      // Provider secondario come fallback
      if (primaryProvider === 'gemini') {
        this.openRouterConfig = {
          apiKey,
          baseUrl: 'https://openrouter.ai/api/v1',
          model: getModelForAgent('openrouter'),
          timeout: this.config.timeout
        };
      } else {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch (error) {
      console.warn('Errore durante l\'inizializzazione dei provider:', error);
    }
  }

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
   * Esegue una richiesta API con retry logic e circuit breaker
   */
  async execute<T = string>(request: ApiRequest): Promise<ApiResponse<T>> {
    // Circuit Breaker check
    if (this.circuitBreakerState === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 60000) { // 1 minuto
        this.circuitBreakerState = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    const startTime = Date.now();

    try {
      // Notify observers of request start
      this.notifyObservers({
        type: 'started',
        agentName: 'ApiClient',
        message: `Executing API request to ${request.model}`
      });

      const result = await this.callWithRetry(async () => {
        return await this.makeApiCall<T>(request);
      });

      // Reset circuit breaker on success
      this.circuitBreakerState = 'CLOSED';
      this.failureCount = 0;

      const response: ApiResponse<T> = {
        success: true,
        data: result,
        usage: {
          promptTokens: 0, // TODO: Extract from actual response
          completionTokens: 0,
          totalTokens: 0
        }
      };

      this.notifyObservers({
        type: 'completed',
        agentName: 'ApiClient',
        message: `Request completed in ${Date.now() - startTime}ms`
      });

      return response;

    } catch (error) {
      this.handleFailure(error as Error);
      throw error;
    }
  }

  /**
   * Esegue chiamate API con retry e backoff esponenziale
   */
  private async callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        return await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
          )
        ]);
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Esegue la chiamata API effettiva con fallback
   */
  private async makeApiCall<T>(request: ApiRequest): Promise<T> {
    const primaryProvider = this.config.provider || 'gemini';
    let lastError: Error;

    // Prova prima il provider primario
    if (primaryProvider === 'gemini' && this.ai) {
      try {
        return await this.makeGeminiCall(request);
      } catch (error) {
        lastError = error as Error;
        console.warn('Provider Gemini fallito, provo OpenRouter:', error);
      }
    } else if (primaryProvider === 'openrouter' && this.openRouterConfig) {
      try {
        return await this.makeOpenRouterCall(request);
      } catch (error) {
        lastError = error as Error;
        console.warn('Provider OpenRouter fallito, provo Gemini:', error);
      }
    }

    // Se il provider primario fallisce, prova il provider secondario
    if (primaryProvider === 'gemini' && this.openRouterConfig) {
      try {
        return await this.makeOpenRouterCall(request);
      } catch (error) {
        lastError = error as Error;
        console.warn('Entrambi i provider falliti:', error);
      }
    } else if (primaryProvider === 'openrouter' && this.ai) {
      try {
        return await this.makeGeminiCall(request);
      } catch (error) {
        lastError = error as Error;
        console.warn('Entrambi i provider falliti:', error);
      }
    }

    throw lastError || new Error('Nessun provider API disponibile');
  }

  /**
   * Chiamata API per Gemini
   */
  private async makeGeminiCall<T>(request: ApiRequest): Promise<T> {
    const config: any = {
      model: request.model
    };

    if (request.options?.expectJson || request.options?.schema) {
      config.responseMimeType = "application/json";
    }

    if (request.options?.schema) {
      config.responseSchema = request.options.schema;
    }

    if (request.options?.temperature !== undefined) {
      config.temperature = request.options.temperature;
    }

    if (request.options?.maxTokens !== undefined) {
      config.maxOutputTokens = request.options.maxTokens;
    }

    const response = await this.ai!.models.generateContent({
      model: request.model,
      contents: request.prompt,
      config
    });

    const text = response.text;

    if (request.options?.expectJson || request.options?.schema) {
      // Clean JSON from markdown code blocks
      const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
      return JSON.parse(cleanedText) as T;
    }

    return text as T;
  }

  /**
   * Chiamata API per OpenRouter
   */
  private async makeOpenRouterCall<T>(request: ApiRequest): Promise<T> {
    const response = await fetch(`${this.openRouterConfig!.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openRouterConfig!.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://code-idea-evolver-agent.com',
        'X-Title': 'Code Idea Evolver Agent'
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        temperature: request.options?.temperature ?? 1,
        max_tokens: request.options?.maxTokens ?? 4096,
        response_format: request.options?.expectJson || request.options?.schema ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content;

    if (!text) {
      throw new Error('No response from OpenRouter API');
    }

    if (request.options?.expectJson || request.options?.schema) {
      // Clean JSON from markdown code blocks
      text = text.replace(/^```json\s*|```\s*$/g, '').trim();
      return JSON.parse(text) as T;
    }

    return text as T;
  }

  /**
   * Gestisce i fallimenti e aggiorna lo stato del circuit breaker
   */
  private handleFailure(error: Error): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= 5) {
      this.circuitBreakerState = 'OPEN';
      this.notifyObservers({
        type: 'failed',
        agentName: 'ApiClient',
        error: 'Circuit breaker opened due to repeated failures'
      });
    }
  }

  /**
   * Notifica tutti gli observers di un evento
   */
  private notifyObservers(event: AgentProgressEvent): void {
    this.observers.forEach(observer => {
      try {
        observer.onProgress(event);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Utility per sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se il circuit breaker è attivo
   */
  isCircuitBreakerOpen(): boolean {
    return this.circuitBreakerState === 'OPEN';
  }

  /**
   * Restituisce lo stato attuale del client
   */
  getStatus() {
    return {
      circuitBreaker: this.circuitBreakerState,
      failureCount: this.failureCount,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Istanza singleton del client API
export const apiClient = new ApiClient();