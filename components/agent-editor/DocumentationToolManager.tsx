import React, { useState, useEffect, useCallback } from 'react';
import type { DocumentationSource } from '../../types';
import { getDocumentationSources, saveDocumentationSource, deleteDocumentationSource } from '../../src/services/documentation/index';

interface DocumentationToolManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const DocumentationToolManager: React.FC<DocumentationToolManagerProps> = ({ isOpen, onClose }) => {
    const [docs, setDocs] = useState<DocumentationSource[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentationSource | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    const refreshDocs = useCallback(async () => {
        const docs = await getDocumentationSources();
        setDocs(docs);
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshDocs();
        }
    }, [isOpen, refreshDocs]);

    const handleSelectDoc = (doc: DocumentationSource) => {
        setSelectedDoc(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setIsEditing(true);
    };

    const handleNewDoc = () => {
        setSelectedDoc(null);
        setTitle('');
        setContent('');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setSelectedDoc(null);
        setTitle('');
        setContent('');
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (title.trim() === '' || content.trim() === '') return;

        const docToSave = {
            title: title.trim(),
            content: content.trim(),
            type: 'custom' as const,
            category: 'documentation',
            tags: []
        };

        await saveDocumentationSource(docToSave);
        await refreshDocs();
        handleCancel();
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            await deleteDocumentationSource(id);
            await refreshDocs();
            if (selectedDoc?.id === id) {
                handleCancel();
            }
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 border border-gray-600 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/30">
                    <div>
                        <h2 className="text-xl font-bold text-white">Custom Documentation Manager</h2>
                        <p className="text-sm text-gray-400 mt-1">Create and manage documentation that agents can reference</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="flex-grow flex min-h-0">
                    {/* Sidebar */}
                    <aside className="w-1/3 border-r border-gray-700 flex flex-col bg-gray-900/30">
                        <div className="p-4 flex-shrink-0 border-b border-gray-700">
                            <button onClick={handleNewDoc} className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Document
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-3">
                            {docs.length > 0 ? (
                                docs.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleSelectDoc(doc)}
                                        className={`w-full text-left p-4 rounded-lg mb-2 transition-all duration-200 group ${
                                            selectedDoc?.id === doc.id
                                                ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-lg'
                                                : 'hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-500/50'
                                        }`}
                                        title={`Click to edit "${doc.title}" - Last modified: ${new Date(doc.metadata.updatedAt).toLocaleDateString()}`}
                                    >
                                        <h4 className="font-semibold text-gray-200 truncate mb-2 group-hover:text-white transition-colors">{doc.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="group-hover:text-gray-400 transition-colors">
                                                {new Date(doc.metadata.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-500 transition-colors">
                                            {doc.content.length > 120 ? `${doc.content.substring(0, 120)}...` : doc.content}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                                    <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm font-medium">No documents yet</p>
                                    <p className="text-xs">Create your first document to get started</p>
                                </div>
                            )}
                        </div>
                    </aside>
                    
                    {/* Editor */}
                    <main className="w-2/3 flex flex-col bg-gray-800/20">
                        {isEditing ? (
                            <>
                                <div className="p-4 flex-shrink-0 border-b border-gray-700/50">
                                    <input
                                        type="text"
                                        placeholder="Document Title"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-gray-900 transition-all duration-200"
                                        title="Enter a descriptive title for your documentation"
                                    />
                                </div>
                                <div className="p-4 flex-grow min-h-0">
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-300 mb-2" title="Write your documentation content here. Markdown formatting is supported.">
                                            Content (Markdown supported)
                                        </label>
                                        <textarea
                                            placeholder="Enter your documentation content here...&#10;&#10;You can use Markdown formatting for better readability.&#10;&#10;Examples:&#10;- # Headers&#10;- **Bold text**&#10;- *Italic text*&#10;- `Code snippets`&#10;- [Links](https://example.com)"
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            className="w-full h-full p-4 bg-gray-900/50 border border-gray-600/50 rounded-lg text-sm font-mono text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-gray-900 transition-all duration-200"
                                            title="Write your documentation content here. Markdown formatting is supported for rich text formatting."
                                        />
                                    </div>
                                </div>
                                <footer className="p-4 flex-shrink-0 flex justify-between items-center border-t border-gray-700 bg-gray-800/30">
                                    <div className="flex items-center gap-2">
                                        {selectedDoc && (
                                            <button
                                                onClick={() => handleDelete(selectedDoc.id)}
                                                className="px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-900/50 rounded-md hover:bg-red-800/50 transition-colors flex items-center gap-1 border border-red-700/30 hover:border-red-600/50"
                                                title={`Permanently delete "${selectedDoc.title}"`}
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors border border-gray-600/30 hover:border-gray-500/50"
                                            title="Discard changes and close editor"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!title.trim() || !content.trim()}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none border border-indigo-500/30 hover:border-indigo-400/50"
                                            title={!title.trim() || !content.trim() ? "Enter title and content to save" : `Save "${title}" documentation`}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {selectedDoc ? 'Update Document' : 'Save Document'}
                                        </button>
                                    </div>
                                </footer>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                                <div className="bg-gray-800/50 rounded-full p-6 mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">Select a document to edit</h3>
                                <p className="text-gray-500 leading-relaxed max-w-md">
                                    Choose an existing document from the sidebar to view and edit its content, or create a new document to add custom documentation.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocumentationToolManager;