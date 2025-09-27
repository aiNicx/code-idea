/**
 * Storage abstraction layer
 * Fornisce un'interfaccia unificata per diversi tipi di storage
 */

import type { DocumentationSource } from '../models/documentationSource';

export interface IDocumentationStorage {
  save(source: DocumentationSource): Promise<void>;
  get(id: string): Promise<DocumentationSource | null>;
  getAll(): Promise<DocumentationSource[]>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<DocumentationSource>): Promise<DocumentationSource>;
  search(query: string): Promise<DocumentationSource[]>;
  getByType(type: string): Promise<DocumentationSource[]>;
  getByCategory(category: string): Promise<DocumentationSource[]>;
  getStats(): Promise<any>;
}

// Factory function per creare storage implementation
export function createStorage(type: 'localStorage' | 'memory' = 'localStorage'): IDocumentationStorage {
  switch (type) {
    case 'localStorage':
      return new LocalStorageDocumentationStorage();
    case 'memory':
      return new MemoryDocumentationStorage();
    default:
      throw new Error(`Unsupported storage type: ${type}`);
  }
}

class LocalStorageDocumentationStorage implements IDocumentationStorage {
  private STORAGE_KEY = 'documentation_sources';

  private getAllSources(): DocumentationSource[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private saveAllSources(sources: DocumentationSource[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sources));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save documentation');
    }
  }

  async save(source: DocumentationSource): Promise<void> {
    const sources = this.getAllSources();
    const existingIndex = sources.findIndex(s => s.id === source.id);

    const sourceWithTimestamp = {
      ...source,
      metadata: {
        ...source.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    if (existingIndex >= 0) {
      sources[existingIndex] = sourceWithTimestamp;
    } else {
      sources.push(sourceWithTimestamp);
    }

    this.saveAllSources(sources);
  }

  async get(id: string): Promise<DocumentationSource | null> {
    const sources = this.getAllSources();
    return sources.find(s => s.id === id) || null;
  }

  async getAll(): Promise<DocumentationSource[]> {
    return this.getAllSources();
  }

  async delete(id: string): Promise<void> {
    const sources = this.getAllSources();
    const filtered = sources.filter(s => s.id !== id);
    this.saveAllSources(filtered);
  }

  async update(id: string, updates: Partial<DocumentationSource>): Promise<DocumentationSource> {
    const sources = this.getAllSources();
    const index = sources.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error(`Documentation source not found: ${id}`);
    }

    const updated = {
      ...sources[index],
      ...updates,
      metadata: {
        ...sources[index].metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    sources[index] = updated;
    this.saveAllSources(sources);
    return updated;
  }

  async search(query: string): Promise<DocumentationSource[]> {
    const sources = this.getAllSources();
    const lowerQuery = query.toLowerCase();

    return sources.filter(source =>
      source.title.toLowerCase().includes(lowerQuery) ||
      source.content.toLowerCase().includes(lowerQuery) ||
      source.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getByType(type: string): Promise<DocumentationSource[]> {
    const sources = this.getAllSources();
    return sources.filter(s => s.type === type);
  }

  async getByCategory(category: string): Promise<DocumentationSource[]> {
    const sources = this.getAllSources();
    return sources.filter(s => s.category === category);
  }

  async getStats(): Promise<any> {
    const sources = this.getAllSources();
    const now = new Date().toISOString();

    return {
      total: sources.length,
      byType: sources.reduce((acc, source) => {
        acc[source.type] = (acc[source.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: sources.reduce((acc, source) => {
        acc[source.category] = (acc[source.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: now
    };
  }
}

class MemoryDocumentationStorage implements IDocumentationStorage {
  private sources = new Map<string, DocumentationSource>();

  async save(source: DocumentationSource): Promise<void> {
    const sourceWithTimestamp = {
      ...source,
      metadata: {
        ...source.metadata,
        updatedAt: new Date().toISOString()
      }
    };
    this.sources.set(source.id, sourceWithTimestamp);
  }

  async get(id: string): Promise<DocumentationSource | null> {
    return this.sources.get(id) || null;
  }

  async getAll(): Promise<DocumentationSource[]> {
    return Array.from(this.sources.values());
  }

  async delete(id: string): Promise<void> {
    this.sources.delete(id);
  }

  async update(id: string, updates: Partial<DocumentationSource>): Promise<DocumentationSource> {
    const existing = this.sources.get(id);
    if (!existing) {
      throw new Error(`Documentation source not found: ${id}`);
    }

    const updated = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    this.sources.set(id, updated);
    return updated;
  }

  async search(query: string): Promise<DocumentationSource[]> {
    const sources = Array.from(this.sources.values());
    const lowerQuery = query.toLowerCase();

    return sources.filter(source =>
      source.title.toLowerCase().includes(lowerQuery) ||
      source.content.toLowerCase().includes(lowerQuery) ||
      source.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getByType(type: string): Promise<DocumentationSource[]> {
    const sources = Array.from(this.sources.values());
    return sources.filter(s => s.type === type);
  }

  async getByCategory(category: string): Promise<DocumentationSource[]> {
    const sources = Array.from(this.sources.values());
    return sources.filter(s => s.category === category);
  }

  async getStats(): Promise<any> {
    const sources = Array.from(this.sources.values());

    return {
      total: sources.length,
      byType: sources.reduce((acc, source) => {
        acc[source.type] = (acc[source.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: sources.reduce((acc, source) => {
        acc[source.category] = (acc[source.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: new Date().toISOString()
    };
  }
}