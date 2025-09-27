# API Documentation

Questa documentazione descrive le API pubbliche del sistema Code Idea per integrazioni esterne.

## Indice

- [Panoramica](#panoramica)
- [API Core](#api-core)
- [Servizi AI](#servizi-ai)
- [Gestione Configurazione](#gestione-configurazione)
- [Gestione Documentazione](#gestione-documentazione)
- [Error Handling](#error-handling)
- [Esempi di Utilizzo](#esempi-di-utilizzo)

## Panoramica

Il sistema Code Idea espone le seguenti API pubbliche:

```typescript
import {
  // Core AI Services
  developIdea,
  aiService,

  // Agent Configuration
  agentConfiguration,
  getAgentConfig,
  saveAgentConfig,

  // Documentation Management
  documentationService,
  getDocumentation,
  saveDocumentationSource,

  // Service Locator
  serviceLocator,
  registerCoreServices
} from './src/services';
```

## API Core

### developIdea

Funzione principale per sviluppare un'idea in un progetto completo.

```typescript
async function developIdea(
  initialIdea: string,
  techStack: TechStack,
  requestedDocuments: DocumentType[],
  onProgress: (progress: ProgressUpdate) => void
): Promise<{ finalResult: DevelopedIdea, agentTasks: any[] }>
```

**Parametri:**
- `initialIdea`: Stringa che descrive l'idea del progetto
- `techStack`: Configurazione dello stack tecnologico
- `requestedDocuments`: Array di documenti da generare
- `onProgress`: Callback per gli aggiornamenti di progresso

**Restituisce:**
- `finalResult`: Risultato finale con tutti i documenti generati
- `agentTasks`: Array delle attività completate dagli agenti

**Esempio:**
```typescript
const result = await developIdea(
  "Un'app per gestire liste della spesa in tempo reale",
  {
    framework: 'React',
    backend: 'Convex',
    styling: 'Tailwind CSS',
    uiLibrary: 'Shadcn/UI',
    stateManagement: 'Zustand',
    auth: 'Convex Auth',
    features: { auth: true, crud: true, realtime: true }
  },
  ['projectBrief', 'userPersonas', 'dbSchema'],
  (progress) => console.log('Progress:', progress)
);

console.log(result.finalResult.documents['Project_Brief.md']);
```

## Servizi AI

### aiService

Servizio principale per l'interazione con gli agenti AI.

```typescript
class AIService {
  addProgressObserver(onProgress: (progress: ProgressUpdate) => void): void
  removeProgressObserver(onProgress: (progress: ProgressUpdate) => void): void
  async developIdea(
    initialIdea: string,
    techStack: TechStack,
    requestedDocuments: DocumentType[]
  ): Promise<{ finalResult: DevelopedIdea, agentTasks: any[] }>
}
```

**Esempio:**
```typescript
const ai = aiService;

// Aggiungi observer per il progresso
ai.addProgressObserver((progress) => {
  console.log(`Agent: ${progress.currentAgent}, Task: ${progress.currentTaskDescription}`);
});

// Sviluppa idea
const result = await ai.developIdea(
  "App per prenotazioni ristoranti",
  techStack,
  ['projectBrief', 'apiEndpoints']
);
```

## Gestione Configurazione

### Agent Configuration Service

Sistema per gestire le configurazioni runtime degli agenti.

```typescript
class AgentConfigurationManager {
  async getAgentConfig(agentName: string): Promise<AgentConfiguration | null>
  async saveAgentConfig(config: AgentConfiguration): Promise<void>
  async updateAgentConfig(agentName: string, updates: Partial<AgentConfiguration>): Promise<AgentConfiguration>
  async resetAgentConfig(agentName: string): Promise<AgentConfiguration>
  async listAgentConfigs(): Promise<AgentConfiguration[]>
  onConfigurationChange(listener: (event: ConfigurationEvent) => void): void
}
```

**Esempio:**
```typescript
// Carica configurazione esistente
const config = await agentConfiguration.getAgentConfig('ProjectBriefAgent');
if (config) {
  console.log('Configurazione attuale:', config);
}

// Aggiorna configurazione
const updated = await agentConfiguration.updateAgentConfig('ProjectBriefAgent', {
  capabilities: {
    maxTokens: 3000,
    temperature: 0.8
  }
});

// Ascolta cambiamenti
agentConfiguration.onConfigurationChange((event) => {
  console.log('Configurazione cambiata:', event);
});
```

## Gestione Documentazione

### Documentation Service

Sistema modulare per la gestione della documentazione.

```typescript
class DocumentationService {
  async getTechDocumentation(techStack: TechDocumentation, agentName: string): Promise<string>
  async createDocumentation(source: Omit<DocumentationSource, 'id' | 'metadata'>): Promise<DocumentationSource>
  async searchDocumentation(query: DocumentationQuery): Promise<DocumentationSource[]>
  async getDocumentationStats(): Promise<DocumentationStats>
}
```

**Esempio:**
```typescript
// Carica documentazione tecnica
const docs = await documentationService.getTechDocumentation(
  {
    framework: 'React',
    backend: 'Convex',
    styling: 'Tailwind CSS'
  },
  'ProjectBriefAgent'
);

console.log(docs);

// Crea documentazione personalizzata
const newDoc = await documentationService.createDocumentation({
  title: 'Custom React Patterns',
  content: 'Documentazione sui pattern React...',
  type: 'custom',
  category: 'frontend',
  tags: ['react', 'patterns']
});

// Cerca documentazione
const results = await documentationService.searchDocumentation({
  searchTerm: 'authentication',
  type: 'tech'
});
```

## Error Handling

Tutte le API seguono uno schema di error handling consistente:

```typescript
try {
  const result = await someApiCall();
} catch (error) {
  if (error instanceof Error) {
    // Error specifico con messaggio
    console.error('API Error:', error.message);
  } else {
    // Error generico
    console.error('Unknown error:', error);
  }
}
```

### Error Types

- **ValidationError**: Parametri non validi
- **NetworkError**: Problemi di connessione
- **ServiceUnavailableError**: Servizio temporaneamente non disponibile
- **ConfigurationError**: Problemi di configurazione

## Esempi di Utilizzo

### Integrazione Completa

```typescript
import {
  developIdea,
  agentConfiguration,
  documentationService
} from './src/services';

class IdeaProcessor {
  async processIdea(idea: string, techStack: TechStack) {
    try {
      // Configura agente personalizzato
      await agentConfiguration.updateAgentConfig('ProjectBriefAgent', {
        capabilities: { temperature: 0.8 }
      });

      // Sviluppa idea
      const result = await developIdea(
        idea,
        techStack,
        ['projectBrief', 'userPersonas'],
        (progress) => this.handleProgress(progress)
      );

      // Salva documentazione generata
      for (const [filename, content] of Object.entries(result.finalResult.documents)) {
        await documentationService.createDocumentation({
          title: filename,
          content,
          type: 'generated',
          category: 'project',
          tags: ['generated', 'ai']
        });
      }

      return result;
    } catch (error) {
      console.error('Errore nel processamento:', error);
      throw error;
    }
  }

  private handleProgress(progress: ProgressUpdate) {
    console.log(`[${progress.currentAgent}] ${progress.currentTaskDescription}`);
  }
}
```

### Estensione con Plugin Personalizzati

```typescript
import { techDocPluginManager } from './src/services';

// Crea plugin personalizzato
const customPlugin = {
  name: 'my-custom-framework',
  version: '1.0.0',
  supportedFrameworks: ['MyFramework'],
  supportedBackends: ['MyBackend'],

  async getSections(context) {
    return [
      {
        id: 'custom-section',
        title: 'Custom Framework Documentation',
        content: 'Documentazione specifica...',
        category: 'framework',
        tags: ['custom', 'documentation']
      }
    ];
  }
};

// Registra plugin
techDocPluginManager.registerPlugin(customPlugin);
```

## Best Practices

1. **Error Handling**: Implementare sempre try-catch per tutte le chiamate API
2. **Progress Monitoring**: Usare gli observer per tracciare l'avanzamento delle operazioni
3. **Configuration Management**: Utilizzare il sistema di configurazione per personalizzazioni
4. **Documentation**: Salvare e organizzare la documentazione generata
5. **Caching**: Sfruttare i sistemi di cache integrati per migliorare le performance
6. **Monitoring**: Monitorare lo stato dei servizi per rilevare problemi tempestivamente

## Supporto

Per supporto e domande sull'integrazione, consultare:
- [Documentazione Architettura](architecture.md)
- [Guida Sviluppo](development.md)
- [Sistema Agenti](agent-system.md)