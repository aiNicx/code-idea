/**
 * Utility per la selezione del modello basato sul provider configurato
 */

import { MODEL_CONFIG, type ModelId } from '../../../../constants';

/**
 * Determina il modello da usare per un agente basato sul provider configurato
 */
export function getModelForAgent(provider: 'gemini' | 'openrouter' = 'gemini'): ModelId {
  if (provider === 'gemini') {
    return 'gemini-2.5-flash';
  } else {
    return 'x-ai/grok-4-fast:free';
  }
}

/**
 * Determina il modello da usare per un agente specifico
 */
export function getModelForAgentByName(agentName: string, provider: 'gemini' | 'openrouter' = 'gemini'): ModelId {
  // Per ora usa lo stesso modello per tutti gli agenti
  // In futuro potrebbe essere esteso per usare modelli diversi per agenti diversi
  return getModelForAgent(provider);
}

/**
 * Determina il provider da usare dalle variabili d'ambiente
 */
export function getConfiguredProvider(): 'gemini' | 'openrouter' {
  const provider = (process.env.LLM_PROVIDER || 'gemini') as 'gemini' | 'openrouter';
  console.log('Configured provider:', provider, 'from env:', process.env.LLM_PROVIDER);
  return provider;
}

/**
 * Determina se almeno un provider è configurato
 */
export function isAnyProviderConfigured(): boolean {
  const apiKey = process.env.API_KEY;
  return !!apiKey;
}

/**
 * Determina il modello ottimale da usare
 */
export function getOptimalModel(): ModelId {
  const provider = getConfiguredProvider();
  return getModelForAgent(provider);
}

/**
 * Restituisce informazioni sul modello configurato
 */
export function getModelInfo(modelId: ModelId) {
  // Cerca prima nei modelli Gemini
  if (MODEL_CONFIG.gemini[modelId as keyof typeof MODEL_CONFIG.gemini]) {
    return MODEL_CONFIG.gemini[modelId as keyof typeof MODEL_CONFIG.gemini];
  }

  // Poi nei modelli OpenRouter
  if (MODEL_CONFIG.openrouter[modelId as keyof typeof MODEL_CONFIG.openrouter]) {
    return MODEL_CONFIG.openrouter[modelId as keyof typeof MODEL_CONFIG.openrouter];
  }

  throw new Error(`Modello non trovato: ${modelId}`);
}