/**
 * Cache system for tech documentation
 * Migliora le performance evitando ricariche inutili
 */

import type { TechDocCache } from '../models/techDocumentation';

interface CacheEntry {
  value: string;
  timestamp: number;
  ttl: number;
}

export class MemoryTechDocCache implements TechDocCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minuti

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Controlla se è scaduto
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: string, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Utility per generare chiavi di cache
  static generateKey(context: any): string {
    return `techdoc_${JSON.stringify(context)}`;
  }

  // Cleanup automatico delle entry scadute
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Stats per monitoring
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      hitRate: this.hitRate
    };
  }

  private hitRate = 0;
  private totalRequests = 0;

  // Track hit rate per monitoring
  recordHit(): void {
    this.totalRequests++;
    this.hitRate = this.cache.size / this.totalRequests;
  }

  recordMiss(): void {
    this.totalRequests++;
    this.hitRate = this.cache.size / this.totalRequests;
  }
}

// Singleton instance
export const techDocCache = new MemoryTechDocCache();