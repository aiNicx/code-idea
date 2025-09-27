/**
 * Tech Documentation Models
 * Struttura modulare per la documentazione tecnica
 */

export interface TechDocSection {
  id: string;
  title: string;
  content: string;
  category: 'framework' | 'backend' | 'styling' | 'uiLibrary' | 'stateManagement' | 'auth' | 'deployment' | 'testing';
  tags: string[];
  prerequisites?: string[];
  relatedSections?: string[];
}

export interface TechDocTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  backend: string;
  sections: string[]; // IDs delle sezioni
  variables: Record<string, string>; // Placeholder variables
}

export interface TechDocContext {
  framework: string;
  backend: string;
  styling: string;
  uiLibrary: string;
  stateManagement: string;
  auth: string;
  features: Record<string, boolean>;
}

export interface TechDocPlugin {
  name: string;
  version: string;
  supportedFrameworks: string[];
  supportedBackends: string[];
  getSections(context: TechDocContext): Promise<TechDocSection[]>;
  getTemplates(context: TechDocContext): Promise<TechDocTemplate[]>;
}

export interface TechDocCache {
  get(key: string): string | null;
  set(key: string, value: string, ttl?: number): void;
  clear(): void;
  size(): number;
}

export interface TechDocRenderer {
  renderSection(section: TechDocSection, context: TechDocContext): string;
  renderTemplate(template: TechDocTemplate, context: TechDocContext): string;
  renderCombined(sections: TechDocSection[], context: TechDocContext): string;
}