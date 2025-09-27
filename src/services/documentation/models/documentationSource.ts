/**
 * Business entities for documentation
 */

export interface DocumentationSource {
  id: string;
  title: string;
  content: string;
  type: 'tech' | 'custom' | 'template';
  category: string;
  tags: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author?: string;
    version: string;
    isActive: boolean;
  };
}

export interface TechDocumentation {
  framework: string;
  backend: string;
  styling: string;
  uiLibrary: string;
  stateManagement: string;
  auth: string;
  features: {
    auth: boolean;
    crud: boolean;
    realtime: boolean;
    [key: string]: any;
  };
}

export interface DocumentationQuery {
  type?: string;
  category?: string;
  tags?: string[];
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentationStats {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  documentsByCategory: Record<string, number>;
  lastUpdated: string;
}