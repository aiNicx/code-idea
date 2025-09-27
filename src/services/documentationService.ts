/**
 * Documentation Service - Gestisce la documentazione personalizzata e tecnica
 * Implementa le funzionalità precedentemente disponibili nei servizi legacy
 */

import type { DocumentationSource } from '../../types';

const STORAGE_KEY = 'custom-documentation-sources';

/**
 * Interfaccia per il servizio di documentazione
 */
export interface IDocumentationService {
  getDocumentationSources(): DocumentationSource[];
  saveDocumentationSource(doc: Omit<DocumentationSource, 'id' | 'lastModified'>): DocumentationSource;
  updateDocumentationSource(id: string, doc: Partial<DocumentationSource>): DocumentationSource | null;
  deleteDocumentationSource(id: string): boolean;
  getDocumentationSource(id: string): DocumentationSource | null;
  getDocumentation(techStack: any, agent: string): string;
  clearAllDocumentation(): void;
}

/**
 * Implementazione del servizio di documentazione
 */
export class DocumentationService implements IDocumentationService {
  /**
   * Ottiene tutte le fonti di documentazione personalizzate
   */
  getDocumentationSources(): DocumentationSource[] {
    try {
      const storedDocs = localStorage.getItem(STORAGE_KEY);
      if (storedDocs) {
        const parsed = JSON.parse(storedDocs);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Failed to parse documentation sources from localStorage:", error);
    }
    return [];
  }

  /**
   * Salva una nuova fonte di documentazione
   */
  saveDocumentationSource(doc: Omit<DocumentationSource, 'id' | 'lastModified'>): DocumentationSource {
    const sources = this.getDocumentationSources();
    const now = new Date().toISOString();
    const savedDoc: DocumentationSource = {
      ...doc,
      id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: now
    };

    sources.push(savedDoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    return savedDoc;
  }

  /**
   * Aggiorna una fonte di documentazione esistente
   */
  updateDocumentationSource(id: string, doc: Partial<DocumentationSource>): DocumentationSource | null {
    const sources = this.getDocumentationSources();
    const index = sources.findIndex(source => source.id === id);

    if (index === -1) return null;

    const updatedDoc: DocumentationSource = {
      ...sources[index],
      ...doc,
      id, // L'id non può essere cambiato
      lastModified: new Date().toISOString()
    };

    sources[index] = updatedDoc;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    return updatedDoc;
  }

  /**
   * Elimina una fonte di documentazione
   */
  deleteDocumentationSource(id: string): boolean {
    const sources = this.getDocumentationSources();
    const filteredSources = sources.filter(source => source.id !== id);

    if (filteredSources.length === sources.length) {
      return false; // Documento non trovato
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSources));
    return true;
  }

  /**
   * Ottiene una fonte di documentazione specifica
   */
  getDocumentationSource(id: string): DocumentationSource | null {
    const sources = this.getDocumentationSources();
    return sources.find(source => source.id === id) || null;
  }

  /**
   * Fornisce documentazione tecnica per stack tecnologici specifici
   */
  getDocumentation(techStack: any, agent: string): string {
    const docs: string[] = [];

    if ((techStack.backend === 'Convex' || techStack.backend === 'Firebase' || techStack.backend === 'Supabase') &&
        (agent === 'DBSchemaAgent' || agent === 'APIEndpointAgent')) {
      const backendDocs = {
        'Convex': {
          'DBSchemaAgent': `
**Core Concept:** Define your database schema using \`defineSchema\` and \`defineTable\`.
**Validators (v):** Use validators like \`v.string()\`, \`v.number()\`, \`v.boolean()\`, \`v.id("tableName")\` for relations.
**Indexes:** Define indexes for efficient queries using \`.index("by_field", ["fieldName"])\`.
**Example Structure:**
  - users
    - name: string
    - email: string (indexed)
  - messages
    - body: string
    - userId: id("users") (indexed)
`,
          'APIEndpointAgent': `
**Types:**
  - **Queries (\`query\`):** For reading data.
  - **Mutations (\`mutation\`):** For writing data.
**Context (ctx):** The first argument. Use \`ctx.db\` for database access, \`ctx.auth\` for user identity.
**Example API Plan:**
  - **Queries:**
    - \`listMessages\`: Fetches all messages, joining with user info.
  - **Mutations:**
    - \`sendMessage(body: string)\`: Creates a new message linked to the logged-in user.
`
        },
        'Firebase': {
          'DBSchemaAgent': `
**Concept:** NoSQL database (Firestore). Data is stored in documents, organized into collections.
**Structure:** Plan collections and the fields within documents.
**Example Structure:**
  - /users/{userId}
    - name: string
    - email: string
  - /messages/{messageId}
    - text: string
    - timestamp: serverTimestamp
    - authorId: string (reference to userId)
`,
          'APIEndpointAgent': `
**Concept:** Use Cloud Functions for backend logic.
**Triggers:** HTTP triggers for callable functions, or Firestore triggers for reactive logic.
**Example API Plan:**
  - **HTTP Functions:**
    - \`getMessages\`: Fetches the last N messages from the 'messages' collection.
    - \`postMessage(text: string)\`: Creates a new document in the 'messages' collection.
`
        },
        'Supabase': {
          'DBSchemaAgent': `
**Concept:** Uses a standard PostgreSQL database. Plan your tables, columns, and relationships.
**Example Structure:**
  - Table: "profiles"
    - id: uuid (primary key, references auth.users.id)
    - username: text
  - Table: "todos"
    - id: bigint (primary key)
    - task: text
    - is_complete: boolean (default: false)
    - user_id: uuid (foreign key to profiles.id)
`,
          'APIEndpointAgent': `
**Concept:** Interact with the database via the client library or create serverless Edge Functions.
**Example API Plan:**
  - **Direct DB Access:**
    - \`select('todos', '*')\`: Get all todos for the user.
    - \`insert('todos', { task, user_id })\`: Create a new todo.
  - **Edge Functions:**
    - \`/get-todos\`: A GET request function that fetches todos for the authenticated user.
`
        }
      };

      const backendKey = techStack.backend.toLowerCase().split(' ')[0] as 'convex' | 'firebase' | 'supabase';
      if (backendDocs[backendKey] && backendDocs[backendKey][agent as 'DBSchemaAgent' | 'APIEndpointAgent']) {
        docs.push(`--- ${techStack.backend.toUpperCase()} DOCUMENTATION ---\n` +
                 backendDocs[backendKey][agent as 'DBSchemaAgent' | 'APIEndpointAgent']);
      }
    }

    return docs.length > 0 ? docs.join('\n\n') : 'No specific documentation provided for this task.';
  }

  /**
   * Cancella tutta la documentazione personalizzata
   */
  clearAllDocumentation(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Esporta tutti i dati della documentazione
   */
  exportDocumentation(): string {
    const sources = this.getDocumentationSources();
    return JSON.stringify(sources, null, 2);
  }

  /**
   * Importa documentazione da un file JSON
   */
  importDocumentation(jsonData: string): boolean {
    try {
      const importedDocs = JSON.parse(jsonData);
      if (!Array.isArray(importedDocs)) {
        throw new Error('Imported data must be an array');
      }

      const existingDocs = this.getDocumentationSources();
      const mergedDocs = [...existingDocs, ...importedDocs];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedDocs));
      return true;
    } catch (error) {
      console.error('Failed to import documentation:', error);
      return false;
    }
  }
}

// Istanza singleton del servizio
export const documentationService = new DocumentationService();

/**
 * Funzioni di compatibilità per i componenti esistenti
 */
export const getDocumentationSources = (): DocumentationSource[] => {
  return documentationService.getDocumentationSources();
};

export const saveDocumentationSource = (doc: any): DocumentationSource => {
  return documentationService.saveDocumentationSource(doc);
};

export const deleteDocumentationSource = (id: string): boolean => {
  return documentationService.deleteDocumentationSource(id);
};

export const getDocumentation = (techStack: any, agent: string): string => {
  return documentationService.getDocumentation(techStack, agent);
};