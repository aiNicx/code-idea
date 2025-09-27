import type { DocumentationSource } from '../types';

const DOCS_KEY = 'custom-documentation-sources';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Retrieves all custom documentation sources from localStorage.
 */
export function getDocumentationSources(): DocumentationSource[] {
    try {
        const storedDocs = localStorage.getItem(DOCS_KEY);
        if (storedDocs) {
            const sources = JSON.parse(storedDocs) as DocumentationSource[];
            // Sort by last modified date, newest first
            return sources.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
        }
    } catch (error) {
        console.error("Failed to parse documentation sources from localStorage.", error);
    }
    return [];
}

/**
 * Saves a single documentation source. If it has an ID, it updates; otherwise, it creates a new one.
 */
export function saveDocumentationSource(doc: Omit<DocumentationSource, 'id' | 'lastModified'> & { id?: string }): DocumentationSource {
    const sources = getDocumentationSources();
    const now = new Date().toISOString();
    let savedDoc: DocumentationSource;

    if (doc.id) {
        // Update existing
        let found = false;
        const updatedSources = sources.map(source => {
            if (source.id === doc.id) {
                found = true;
                savedDoc = { ...source, ...doc, lastModified: now };
                return savedDoc;
            }
            return source;
        });
         if (!found) throw new Error("Document to update not found");
        localStorage.setItem(DOCS_KEY, JSON.stringify(updatedSources));

    } else {
        // Create new
        savedDoc = { ...doc, id: generateUUID(), lastModified: now };
        sources.push(savedDoc);
        localStorage.setItem(DOCS_KEY, JSON.stringify(sources));
    }
    
    // This is not ideal as it returns an unsaved object on create path, but will be fine for UI
    return savedDoc!;
}

/**
 * Deletes a documentation source by its ID.
 */
export function deleteDocumentationSource(id: string): void {
    let sources = getDocumentationSources();
    sources = sources.filter(source => source.id !== id);
    localStorage.setItem(DOCS_KEY, JSON.stringify(sources));
}