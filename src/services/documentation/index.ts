/**
 * API pubblica per il sistema di documentazione modulare
 * Fornisce un'interfaccia unificata per tutte le operazioni di documentazione
 */

import { documentationManager, type IDocumentationManager } from './services/documentationManager';
import type { DocumentationSource, TechDocumentation, DocumentationQuery, DocumentationStats } from './models/documentationSource';

// Re-export dei tipi principali
export type {
  DocumentationSource,
  TechDocumentation,
  DocumentationQuery,
  DocumentationStats
};

// Re-export dell'interfaccia per testing
export type { IDocumentationManager };

/**
 * API principale per la gestione della documentazione
 */
export class DocumentationService {
  private manager: IDocumentationManager;

  constructor(manager?: IDocumentationManager) {
    this.manager = manager || documentationManager;
  }

  /**
   * Crea una nuova fonte di documentazione
   */
  async createDocumentation(source: Omit<DocumentationSource, 'id' | 'metadata'>): Promise<DocumentationSource> {
    return this.manager.createDocumentation(source);
  }

  /**
   * Recupera una fonte di documentazione per ID
   */
  async getDocumentation(id: string): Promise<DocumentationSource | null> {
    return this.manager.getDocumentation(id);
  }

  /**
   * Aggiorna una fonte di documentazione esistente
   */
  async updateDocumentation(id: string, updates: Partial<DocumentationSource>): Promise<DocumentationSource> {
    return this.manager.updateDocumentation(id, updates);
  }

  /**
   * Elimina una fonte di documentazione
   */
  async deleteDocumentation(id: string): Promise<void> {
    return this.manager.deleteDocumentation(id);
  }

  /**
   * Cerca documentazione con filtri avanzati
   */
  async searchDocumentation(query: DocumentationQuery): Promise<DocumentationSource[]> {
    return this.manager.searchDocumentation(query);
  }

  /**
   * Recupera documentazione per tipo
   */
  async getDocumentationByType(type: string): Promise<DocumentationSource[]> {
    return this.manager.getDocumentationByType(type);
  }

  /**
   * Recupera documentazione per categoria
   */
  async getDocumentationByCategory(category: string): Promise<DocumentationSource[]> {
    return this.manager.getDocumentationByCategory(category);
  }

  /**
   * Recupera statistiche sulla documentazione
   */
  async getDocumentationStats(): Promise<DocumentationStats> {
    return this.manager.getDocumentationStats();
  }

  /**
   * Recupera documentazione tecnica per un tech stack specifico
   */
  async getTechDocumentation(techStack: TechDocumentation, agentName: string): Promise<string> {
    return this.manager.getTechDocumentation(techStack, agentName);
  }

  /**
   * Carica tutte le fonti di documentazione
   */
  async getDocumentationSources(): Promise<DocumentationSource[]> {
    return this.manager.getDocumentationByType('custom');
  }

  /**
   * Salva una fonte di documentazione (alias per createDocumentation)
   */
  async saveDocumentationSource(source: Omit<DocumentationSource, 'id' | 'metadata'>): Promise<DocumentationSource> {
    return this.createDocumentation(source);
  }

  /**
   * Elimina una fonte di documentazione (alias per deleteDocumentation)
   */
  async deleteDocumentationSource(id: string): Promise<void> {
    return this.deleteDocumentation(id);
  }
}

// Singleton instance
export const documentationService = new DocumentationService();

// Funzioni di compatibilità per l'API legacy
export const getDocumentation = async (techStack: TechDocumentation, agentName: string): Promise<string> => {
  return documentationService.getTechDocumentation(techStack, agentName);
};

export const getDocumentationSources = async (): Promise<DocumentationSource[]> => {
  return documentationService.getDocumentationSources();
};

export const saveDocumentationSource = async (source: Omit<DocumentationSource, 'id' | 'metadata'>): Promise<DocumentationSource> => {
  return documentationService.saveDocumentationSource(source);
};

export const deleteDocumentationSource = async (id: string): Promise<void> => {
  return documentationService.deleteDocumentationSource(id);
};

// Re-export delle classi principali per uso avanzato
export { DocumentationManager } from './services/documentationManager';