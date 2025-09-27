# Architettura del Sistema

Questa documentazione descrive l'architettura del sistema Code Idea, i principi di design e le decisioni architetturali chiave.

## Indice

- [Panoramica Architetturale](#panoramica-architetturale)
- [Principi di Design](#principi-di-design)
- [Struttura del Progetto](#struttura-del-progetto)
- [Sistema AI Modulare](#sistema-ai-modulare)
- [Gestione della Configurazione](#gestione-della-configurazione)
- [Sistema di Documentazione](#sistema-di-documentazione)
- [Service Locator Pattern](#service-locator-pattern)
- [Error Handling e Resilience](#error-handling-e-resilience)
- [Performance e Scalabilità](#performance-e-scalabilità)

## Panoramica Architetturale

Il sistema Code Idea adotta un'architettura **modulare e scalabile** basata su:

- **Separazione delle Responsabilità**: Ogni modulo ha un singolo scopo ben definito
- **Dependency Injection**: Le dipendenze sono iniettate per migliorare testabilità
- **Service Locator**: Pattern centralizzato per la gestione dei servizi
- **Plugin Architecture**: Sistema estensibile per nuovi framework e backend
- **Event-Driven**: Comunicazione asincrona tra componenti

### Diagramma Architetturale di Alto Livello

```
┌─────────────────────────────────────────────────────────────────┐
│                            Frontend                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   App.tsx   │  │ Components  │  │   Pages     │              │
│  │ (Main App)  │  │ (Reusable)  │  │ (Routed)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└───────────────────┬─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────────┐
│                            Services                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │     AI      │  │   Config    │  │    Docs     │              │
│  │   Services  │  │ Management  │  │  Management │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│        │                 │                  │                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Agent Exec  │  │  Validators │  │  Storage    │              │
│  │ Orchestrator│  │   Cache     │  │   Abstraction│            │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────────────┐
│                       External Services                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   OpenAI    │  │  Anthropic  │  │   Convex    │              │
│  │    API      │  │    API      │  │  Database   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Principi di Design

### 1. Modularità

Ogni servizio è un modulo indipendente con interfacce ben definite:

```typescript
// Esempio di interfaccia modulare
interface IAgentExecutor {
  executeTasks(tasks: AgentTask[], context: AgentExecutionContext): Promise<AgentExecutionResult[]>
  addObserver(observer: AgentObserver): void
  removeObserver(observer: AgentObserver): void
}
```

### 2. Single Responsibility Principle

Ogni classe/modulo ha una sola ragione di cambiare:

- **AgentExecutor**: Solo esecuzione parallela/sequenziale
- **ModelSelector**: Solo selezione e configurazione modelli
- **ResponseParser**: Solo parsing e validazione risposte
- **ConfigurationManager**: Solo gestione configurazioni

### 3. Dependency Inversion

I moduli dipendono da astrazioni, non da implementazioni concrete:

```typescript
// Dipendenza da interfaccia, non implementazione
class AgentExecutor {
  constructor(private strategy: IExecutionStrategy) {}
}
```

### 4. Open/Closed Principle

I moduli sono aperti all'estensione ma chiusi alla modifica:

```typescript
// Plugin architecture per nuovi framework
interface TechDocPlugin {
  getSections(context: TechDocContext): Promise<TechDocSection[]>
}
```

## Struttura del Progetto

### Directory Structure

```
src/
├── components/          # Componenti React UI
│   ├── agent-editor/   # Editor configurazione agenti
│   └── ...
├── services/           # Servizi business logic
│   ├── ai/            # Sistema AI modulare
│   │   ├── core/      # ApiClient, AgentExecutor
│   │   ├── agents/    # Agenti specializzati
│   │   ├── utils/     # Utilities (ModelSelector, ResponseParser)
│   │   └── types/     # Tipi AI
│   ├── agentConfiguration/  # Sistema configurazione
│   ├── documentation/       # Sistema documentazione modulare
│   ├── serviceLocator.ts    # Service locator
│   └── index.ts            # Barrel exports
├── types.ts           # Tipi globali
├── constants.ts       # Costanti applicazione
└── __tests__/         # Test suite
```

### Convenzioni di Naming

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase` (prefixed with I if interface)

## Sistema AI Modulare

### Architettura degli Agenti

Il sistema AI è composto da agenti specializzati che collaborano:

```typescript
interface IAgent {
  getId(): string
  execute(context: AgentExecutionContext): Promise<AgentExecutionResult>
  validateContext(context: AgentExecutionContext): boolean
  getCapabilities(): AgentCapabilities
}
```

### Strategie di Esecuzione

**SequentialExecutionStrategy**: Esegue agenti uno dopo l'altro
**ParallelExecutionStrategy**: Esegue agenti in parallelo

```typescript
class AgentExecutor {
  constructor(private strategy: IExecutionStrategy) {}

  async executeTasks(tasks: AgentTask[], context: AgentExecutionContext) {
    return this.strategy.execute(tasks, context);
  }
}
```

### Observer Pattern per il Progresso

```typescript
interface AgentObserver {
  onProgress(event: AgentProgressEvent): void
  onComplete(results: AgentExecutionResult[]): void
  onError(error: Error): void
}
```

## Gestione della Configurazione

### Agent Configuration System

Sistema runtime per la configurazione degli agenti:

```typescript
interface AgentConfiguration {
  id: string
  agentName: string
  version: string
  enabled: boolean
  capabilities: {
    maxTokens: number
    temperature: number
    model: string
    timeout: number
  }
  settings: {
    fallbackEnabled: boolean
    cachingEnabled: boolean
    loggingEnabled: boolean
  }
  customSettings: Record<string, any>
  metadata: {
    createdAt: string
    updatedAt: string
    isCustom: boolean
  }
}
```

### Storage Layer

Separazione tra business logic e persistenza:

```typescript
interface IDocumentationStorage {
  save(source: DocumentationSource): Promise<void>
  get(id: string): Promise<DocumentationSource | null>
  search(query: string): Promise<DocumentationSource[]>
}
```

## Sistema di Documentazione

### Documentazione Tecnica Modulare

Sistema plugin-based per documentazione di diversi stack:

```typescript
interface TechDocPlugin {
  name: string
  version: string
  supportedFrameworks: string[]
  supportedBackends: string[]
  getSections(context: TechDocContext): Promise<TechDocSection[]>
}
```

### Cache per Performance

```typescript
interface TechDocCache {
  get(key: string): string | null
  set(key: string, value: string, ttl?: number): void
  clear(): void
}
```

## Service Locator Pattern

### Implementazione

```typescript
class ServiceLocator {
  private services = new Map<string, any>()

  register<T>(key: string, service: T): void {
    this.services.set(key, service)
  }

  get<T>(key: string): T {
    const service = this.services.get(key)
    if (!service) {
      throw new Error(`Service not found: ${key}`)
    }
    return service
  }
}
```

### Utilizzo

```typescript
// Registrazione servizi
serviceLocator.register(SERVICE_KEYS.DOCUMENTATION, documentationService)
serviceLocator.register(SERVICE_KEYS.AGENT_CONFIG, agentConfiguration)

// Utilizzo
const docs = serviceLocator.get(SERVICE_KEYS.DOCUMENTATION)
```

## Error Handling e Resilience

### Circuit Breaker Pattern

Previene cascate di errori in caso di problemi:

```typescript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private failures = 0

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is OPEN')
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
}
```

### Retry Logic con Exponential Backoff

```typescript
class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === options.maxAttempts) {
          throw lastError
        }

        const delay = this.calculateDelay(attempt, options)
        await this.sleep(delay)
      }
    }

    throw lastError!
  }
}
```

## Performance e Scalabilità

### Lazy Loading

```typescript
// Caricamento differito per componenti pesanti
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### Code Splitting

```typescript
// Split automatico per route
const HomePage = lazy(() => import('./pages/Home'))
const AgentsPage = lazy(() => import('./pages/Agents'))
```

### Caching Strategies

- **Memory Cache**: Per dati volatili (configurazioni)
- **LocalStorage**: Per dati persistenti (documentazione)
- **Service Worker**: Per API responses

### Monitoring e Metrics

```typescript
interface MetricsCollector {
  recordLatency(operation: string, duration: number): void
  recordError(operation: string, error: Error): void
  getStats(): MetricsData
}
```

## Decisioni Architetturali Chiave

### 1. Modular AI System over Monolithic

**Motivazione**: Facilita l'aggiunta di nuovi agenti e framework senza modifiche al core.

**Impatto**: Sistema estensibile ma richiede più configurazione.

### 2. Service Locator over Direct Injection

**Motivazione**: Semplifica la gestione delle dipendenze in un'applicazione React.

**Impatto**: Leggermente meno type-safe ma più flessibile.

### 3. Plugin Architecture for Tech Documentation

**Motivazione**: Supporta documentazione per qualsiasi stack tecnologico.

**Impatto**: Sistema estensibile ma richiede sviluppo di plugin specifici.

### 4. Event-Driven Configuration Changes

**Motivazione**: Permette aggiornamenti in tempo reale delle configurazioni.

**Impatto**: Più complesso da testare ma più reattivo.

## Pattern Implementati

- **Factory Pattern**: Per la creazione di storage e servizi
- **Strategy Pattern**: Per strategie di esecuzione (sequenziale/parallela)
- **Observer Pattern**: Per notifiche di progresso
- **Plugin Pattern**: Per estensibilità
- **Circuit Breaker Pattern**: Per resilience
- **Service Locator Pattern**: Per dependency management

## Considerazioni Future

### Scalabilità

- **Microservizi**: Separazione in servizi indipendenti
- **Load Balancing**: Distribuzione del carico su più istanze
- **Database Sharding**: Per grandi quantità di documentazione

### Estensibilità

- **Nuovi Framework**: Plugin per Vue, Svelte, etc.
- **Nuovi Backend**: Supporto per Supabase, Firebase, etc.
- **Nuovi Agenti**: Facile aggiunta di agenti specializzati

### Osservabilità

- **Distributed Tracing**: Per richieste cross-service
- **Metrics Collection**: Per performance monitoring
- **Log Aggregation**: Per debugging centralizzato

## Conclusioni

L'architettura adottata garantisce:

- **Scalabilità**: Facile aggiunta di nuovi componenti
- **Manutenibilità**: Codice modulare e testabile
- **Affidabilità**: Error handling robusto
- **Performance**: Ottimizzazioni integrate
- **Estensibilità**: Plugin system per future espansioni

Questa architettura supporta sia lo sviluppo attuale che le evoluzioni future del sistema.