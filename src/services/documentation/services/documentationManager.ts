/**
 * Business logic layer for documentation management
 * Gestisce la logica di business separata dalla persistenza
 */

import type { DocumentationSource, TechDocumentation, DocumentationQuery, DocumentationStats } from '../models/documentationSource';
import type { TechDocContext } from '../models/techDocumentation';
import { createStorage, type IDocumentationStorage } from '../storage';

export interface IDocumentationManager {
  createDocumentation(source: Omit<DocumentationSource, 'id' | 'metadata'>): Promise<DocumentationSource>;
  getDocumentation(id: string): Promise<DocumentationSource | null>;
  updateDocumentation(id: string, updates: Partial<DocumentationSource>): Promise<DocumentationSource>;
  deleteDocumentation(id: string): Promise<void>;
  searchDocumentation(query: DocumentationQuery): Promise<DocumentationSource[]>;
  getDocumentationByType(type: string): Promise<DocumentationSource[]>;
  getDocumentationByCategory(category: string): Promise<DocumentationSource[]>;
  getDocumentationStats(): Promise<DocumentationStats>;
  getTechDocumentation(techStack: TechDocumentation, agentName: string): Promise<string>;
}

export class DocumentationManager implements IDocumentationManager {
  private storage: IDocumentationStorage;

  constructor(storageType: 'localStorage' | 'memory' = 'localStorage') {
    this.storage = createStorage(storageType);
  }

  async createDocumentation(source: Omit<DocumentationSource, 'id' | 'metadata'>): Promise<DocumentationSource> {
    const now = new Date().toISOString();
    const newSource: DocumentationSource = {
      ...source,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        isActive: true
      }
    };

    await this.storage.save(newSource);
    return newSource;
  }

  async getDocumentation(id: string): Promise<DocumentationSource | null> {
    return this.storage.get(id);
  }

  async updateDocumentation(id: string, updates: Partial<DocumentationSource>): Promise<DocumentationSource> {
    return this.storage.update(id, updates);
  }

  async deleteDocumentation(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async searchDocumentation(query: DocumentationQuery): Promise<DocumentationSource[]> {
    let results: DocumentationSource[] = [];

    if (query.searchTerm) {
      results = await this.storage.search(query.searchTerm);
    } else {
      results = await this.storage.getAll();
    }

    // Filtra per tipo se specificato
    if (query.type) {
      results = results.filter(doc => doc.type === query.type);
    }

    // Filtra per categoria se specificata
    if (query.category) {
      results = results.filter(doc => doc.category === query.category);
    }

    // Filtra per tags se specificati
    if (query.tags && query.tags.length > 0) {
      results = results.filter(doc =>
        query.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    // Applica paginazione
    if (query.offset) {
      results = results.slice(query.offset);
    }
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async getDocumentationByType(type: string): Promise<DocumentationSource[]> {
    return this.storage.getByType(type);
  }

  async getDocumentationByCategory(category: string): Promise<DocumentationSource[]> {
    return this.storage.getByCategory(category);
  }

  async getDocumentationStats(): Promise<DocumentationStats> {
    const stats = await this.storage.getStats();
    return {
      totalDocuments: stats.total,
      documentsByType: stats.byType,
      documentsByCategory: stats.byCategory,
      lastUpdated: stats.lastUpdated
    };
  }

  async getTechDocumentation(techStack: TechDocumentation, agentName: string): Promise<string> {
    // Prima cerca documentazione personalizzata nel database
    const techQuery: DocumentationQuery = {
      type: 'tech',
      searchTerm: `${techStack.framework} ${techStack.backend}`,
      limit: 5
    };

    const techDocs = await this.searchDocumentation(techQuery);

    // Se trova documentazione personalizzata, usala
    if (techDocs.length > 0) {
      const combinedDocs = techDocs.map(doc => `## ${doc.title}\n\n${doc.content}`).join('\n\n---\n\n');
      return combinedDocs;
    }

    // Altrimenti usa il sistema modulare con plugin
    try {
      const { techDocPluginManager } = await import('./techDocSystem');
      const { reactConvexPlugin } = await import('../plugins/reactConvexPlugin');

      // Registra il plugin se non già registrato
      if (!techDocPluginManager['plugins'].has('react-convex')) {
        techDocPluginManager.registerPlugin(reactConvexPlugin);
      }

      // Crea il contesto per la generazione
      const context: TechDocContext = {
        framework: techStack.framework,
        backend: techStack.backend,
        styling: techStack.styling,
        uiLibrary: techStack.uiLibrary,
        stateManagement: techStack.stateManagement,
        auth: techStack.auth,
        features: techStack.features
      };

      // Genera documentazione modulare
      return await techDocPluginManager.renderDocumentation(context);
    } catch (error) {
      console.warn('Failed to use modular tech doc system, falling back to legacy:', error);
      return this.getLegacyTechDocumentation(techStack, agentName);
    }
  }

  private getLegacyTechDocumentation(techStack: TechDocumentation, agentName: string): string {
    // Documentazione hardcoded legacy per compatibilità
    const docs: Record<string, string> = {
      'React': `
# React Documentation

## Component Architecture
React uses a component-based architecture where UIs are built from small, reusable pieces.

## Key Features
- Declarative UI
- Component composition
- Virtual DOM for performance
- JSX syntax

## Best Practices
- Keep components small and focused
- Use functional components with hooks
- Implement proper state management
- Follow React naming conventions
      `.trim(),

      'Convex': `
# Convex Backend Documentation

## Real-time Database
Convex provides a real-time database with automatic subscriptions and conflict resolution.

## Key Features
- Real-time subscriptions
- ACID transactions
- Built-in authentication
- Type-safe database schema

## Best Practices
- Use database functions for all mutations
- Leverage real-time subscriptions for live updates
- Implement proper error handling
- Use TypeScript for type safety
      `.trim(),

      'Tailwind CSS': `
# Tailwind CSS Documentation

## Utility-First CSS
Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces.

## Key Features
- Utility classes
- Responsive design utilities
- Dark mode support
- JIT compilation

## Best Practices
- Use semantic class names
- Leverage responsive prefixes
- Customize design tokens
- Use Tailwind plugins for advanced features
      `.trim()
    };

    const relevantDocs: string[] = [];

    // Seleziona documentazione rilevante per il tech stack
    if (techStack.framework === 'React' && docs.React) {
      relevantDocs.push(docs.React);
    }
    if (techStack.backend === 'Convex' && docs.Convex) {
      relevantDocs.push(docs.Convex);
    }
    if (techStack.styling === 'Tailwind CSS' && docs['Tailwind CSS']) {
      relevantDocs.push(docs['Tailwind CSS']);
    }

    return relevantDocs.join('\n\n---\n\n') || 'No specific documentation provided for this task.';
  }
}

// Singleton instance
export const documentationManager = new DocumentationManager();