# 🔧 Piano di Ristrutturazione Code Idea

Piano dettagliato per risolvere i problemi identificati e migliorare scalabilità, modularità e manutenibilità del progetto.

## 📋 Principi Guida

- **Scalabilità**: Architettura che supporti nuovi agenti e funzionalità senza modifiche core
- **Modularità**: Componenti indipendenti con interfacce chiare
- **Manutenibilità**: Codice auto-documentante con separazione delle responsabilità
- **Chiarezza**: Nomi espliciti, commenti significativi, struttura logica
- **Pulizia**: Eliminazione sistematica di codice obsoleto dopo verifica dipendenze

---

## 🎯 FASE 1: RISOLUZIONE PROBLEMI IMMEDIATI


### 1.2 Rimozione TODOs Espliciti
**File**: `src/services/ai/agents/specialized/projectBriefAgent.ts` linea 218
**Problema**: TODO per implementazione configurazione agente
**Soluzione**:
- Rimuovere commenti TODO non necessari
- Implementare configurazione base placeholder funzionale
- Documentare chiaramente limitazioni attuali

### 1.3 Fix Import Circolari Potenziali
**File**: `App.tsx`, vari services
**Problema**: Import ciclici tra App.tsx e services
**Soluzione**:
- Creare barrel exports (`index.ts`) per ogni directory
- Centralizzare imports in punti di ingresso
- Rimuovere imports diretti tra livelli diversi

---

## 🎯 FASE 2: IMPLEMENTAZIONE FUNZIONALITÀ MANCANTI

### 2.1 Sostituzione Funzioni Placeholder
**File**: `components/ConfigurationPanel.tsx`, `ToolsDashboard.tsx`, etc.
**Problema**: Funzioni placeholder che non fanno nulla
**Soluzione**:

#### 2.1.1 Configurazione Agenti
- Creare `src/services/agentConfiguration.ts`
- Implementare `getAgentConfig()`, `saveAgentConfig()`, `resetAgentConfig()`
- Usare localStorage per persistenza
- Integrare con sistema esistente

#### 2.1.2 Placeholder in Components
- Sostituire tutti i placeholder con implementazioni reali
- Mantenere API consistente tra componenti
- Aggiungere validazione input

### 2.2 Sistema Configurazione Runtime Agenti
**Architettura**:
```
src/services/agentConfiguration/
├── index.ts                    # API pubblica
├── storage.ts                  # Persistenza localStorage
├── validation.ts               # Validazione configurazioni
└── types.ts                    # Tipi specifici configurazione
```

**Implementazione**:
- Storage layer separato per configurazioni
- Validazione schema JSON per configurazioni
- Migration system per versioni future
- Event system per notifiche cambiamenti

---

## 🎯 FASE 3: RISOLUZIONE ARCHITETTURALE

### 3.1 Consolidamento Servizi Duplicati
**Problema**: `src/services/aiService.ts` vs `src/services/ai/index.ts`
**Soluzione**:

#### 3.1.1 Unificazione API
- Mantenere `src/services/ai/index.ts` come API principale
- Creare adapter per compatibilità se necessario
- Unificare `developIdea()` function
- **Eliminazione file obsoleto**: Rimuovere `src/services/aiService.ts` dopo aver verificato che tutti gli import siano migrati a `src/services/ai/index.ts`

#### 3.1.2 Separazione Responsabilità
**Nuova architettura**:
```
src/services/
├── ai/                         # Sistema AI modulare
│   ├── core/                   # API client, executor
│   ├── agents/                 # Agenti specializzati
│   ├── utils/                  # Utilities condivise
│   └── index.ts               # API unificata
├── configuration/              # Configurazione runtime
├── documentation/              # Documentazione personalizzata
└── legacy/                     # Adapter per compatibilità (se necessario)
```

### 3.2 Eliminazione Dipendenze Circolari
**Strategia**:
- Dependency injection per componenti critici
- Service locator pattern per servizi condivisi
- Lazy loading per componenti pesanti
- Inversion of control per testabilità

---

## 🎯 FASE 4: RIFACTORING DOCUMENTATION SERVICE

### 4.1 Separazione Business Logic da Persistence
**Architettura Attuale**:
```
documentationService.ts (500+ righe)
├── CRUD operations
├── Business logic
├── Storage logic
└── Tech docs hardcoded
```

**Architettura Target**:
```
src/services/documentation/
├── index.ts                    # API pubblica
├── storage/
│   ├── localStorage.ts         # Persistenza locale
│   └── index.ts               # Storage abstraction
├── models/
│   ├── documentationSource.ts  # Business entities
│   └── techDocumentation.ts    # Tech docs structured
├── services/
│   ├── documentationManager.ts # Business logic
│   └── validation.ts          # Validazione
└── adapters/
    └── legacy.ts              # Compatibilità esistente
```

**Eliminazione file obsoleto**:
- Rimuovere `src/services/documentationService.ts` dopo migrazione completa
- Verificare che tutti gli import in componenti puntino al nuovo `src/services/documentation/index.ts`

### 4.2 Tech Documentation Modulare
- Estrarre documentazione hardcoded in file separati
- Strutturare per backend/framework
- Sistema plugin per nuovi backends
- Cache per performance

---

## 🎯 FASE 5: TESTING E QUALITÀ

### 5.1 Test Components Critici
**Componenti da testare**:
- `App.tsx` - State management principale
- `IdeaForm.tsx` - Validazione input
- `ProcessingStatus.tsx` - UI progress
- `ConfigurationPanel.tsx` - Configurazione agenti

**Strategia Testing**:
- Jest + React Testing Library
- Test integration per flussi completi
- Mock services per isolamento
- Snapshot testing per UI consistency

### 5.2 Test Servizi AI
**Servizi da testare**:
- `apiClient.ts` - Circuit breaker, retry logic
- `agentExecutor.ts` - Parallel execution
- `modelSelector.ts` - Provider selection
- `responseParser.ts` - JSON parsing

---

## 🎯 FASE 6: DOCUMENTAZIONE ESTRAZIONE

### 6.1 Documentazione API Pubbliche
**Documenti da creare**:
- `docs/api.md` - API pubbliche per integrazioni
- `docs/architecture.md` - Architettura sistema
- `docs/agent-system.md` - Sistema agenti dettagliato
- `docs/development.md` - Guida sviluppo

### 6.2 JSDoc Completo
- Aggiungere JSDoc a tutte le funzioni pubbliche
- Descrivere parametri, return values, side effects
- Esempi uso per API complesse
- Link a documentazione esterna

---

## 🎯 FASE 7: OTTIMIZZAZIONI FINALI

### 7.1 Performance Improvements
- Lazy loading components con React.lazy()
- Code splitting per route/pagine
- Service worker per caching API responses
- Bundle analysis e ottimizzazione

### 7.2 Developer Experience
- ESLint rules personalizzate
- Prettier configurazione
- Husky per pre-commit hooks
- GitHub Actions per CI/CD

### 7.3 Monitoring e Error Handling
- Error boundaries per componenti
- Logging strutturato per servizi
- Metrics collection per performance
- Health checks per servizi critici

---

## 📊 Metriche di Successo

### Scalabilità
- [ ] Aggiungere nuovo agente senza modificare core
- [ ] Cambiare provider AI senza modifiche UI
- [ ] Estendere configurazione senza breaking changes

### Modularità
- [ ] Ogni componente ha singola responsabilità
- [ ] Services indipendenti e testabili
- [ ] Clear separation of concerns

### Manutenibilità
- [ ] Code coverage > 80%
- [ ] Zero caratteri corrotti/sintassi errata
- [ ] Documentazione completa e aggiornata
- [ ] Setup sviluppo rapido

### Chiarezza
- [ ] Nomi funzioni/componenti auto-esplicativi
- [ ] Commenti significativi su logica complessa
- [ ] Architettura documentata visivamente
- [ ] Error messages chiari e actionable

### Pulizia Codice
- [ ] Zero funzioni placeholder
- [ ] Zero file obsoleti
- [ ] Zero dipendenze circolari
- [ ] Zero caratteri corrotti

---

## 🚀 Esecuzione Step-by-Step

1. **FASE 1** - Fix problemi bloccanti
2. **FASE 2** - Implementare funzionalità mancanti
3. **FASE 3** - Risoluzione architetturale e eliminazione file obsoleti
4. **FASE 4** - Refactor servizi complessi e eliminazione file obsoleti
5. **FASE 5** - Testing e qualità
6. **FASE 6** - Documentazione completa
7. **FASE 7** - Ottimizzazioni finali

**Dipendenze**: Ogni fase dipende dal completamento della precedente
**Rollback**: Possibile in ogni fase con git branches
**Pulizia**: Eliminazione sistematica file obsoleti dopo verifica completa import

---

## 🗂️ File da Eliminare (Verifica Import Prima)

### Dopo FASE 3
- `src/services/aiService.ts` - Sostituito da `src/services/ai/index.ts`

### Dopo FASE 4
- `src/services/documentationService.ts` - Sostituito da `src/services/documentation/index.ts`

### Verifica Eliminazione
Prima di eliminare ogni file:
1. Cercare tutti gli import che puntano al file
2. Migrare import al nuovo percorso
3. Verificare che non ci siano riferimenti residui
4. Testare funzionalità dopo migrazione
5. Eliminare solo dopo conferma completa

---

*Questo piano garantisce un refactoring sistematico mantenendo la funzionalità esistente mentre migliora significativamente architettura e manutenibilità.*